/* Chitra AI engine — main-process side. Starts the AI worker in its own process, gets the models in place, and answers the window.
 *
 * Models (checked by SHA-256 before use), downloaded once on first use and kept in %APPDATA%\Chitra Studio\models
 * (a copy shipped with the installer is used instead when present). Nothing else is ever sent or fetched:
 *  - birefnet_general.onnx, 973 MB: the BiRefNet authors' official GitHub release (MIT).
 *  - realesrgan_x4plus.onnx, 67 MB: converted from the official Real-ESRGAN weights (BSD-3), from this project's repository. */
const { app, utilityProcess, ipcMain, net } = require('electron');
const path = require('node:path'), fs = require('node:fs'), crypto = require('node:crypto');

const MODELS = {
  'birefnet_general.onnx': { url: 'https://github.com/ZhengPeng7/BiRefNet/releases/download/v1/BiRefNet-general-epoch_244.onnx', sha256: '58f621f00f5d756097615970a88a791584600dcf7c45b18a0a6267535a1ebd3c', bytes: 972666916, label: 'background remover AI' },
  // converted from the official Real-ESRGAN weights (BSD-3, tools/convert-realesrgan.py); pinned to the commit that added it, so the file can never change underneath
  'realesrgan_x4plus.onnx': { url: 'https://github.com/prasant793001-stack/CHITRA/raw/a1bfcefa4439ee5f2d295931cbc87c5241182570/desktop/models/realesrgan_x4plus.onnx', sha256: '44dbcca6c91af21435e787e768528b44427693fabe54912c30d358db92f2f61d', bytes: 66901260, label: 'upscaler AI' },
};

let log = () => { }, child = null, seq = 0; const pending = new Map();
const userModels = () => path.join(app.getPath('userData'), 'models');
const bundledModels = () => (app.isPackaged ? path.join(process.resourcesPath, 'models') : path.join(__dirname, '..', 'models'));

function sha256(file) { return new Promise((res, rej) => { const h = crypto.createHash('sha256'); fs.createReadStream(file).on('data', d => h.update(d)).on('end', () => res(h.digest('hex'))).on('error', rej); }); }

/* every model the worker reads sits in one folder: bundled ones are copied in once, downloaded ones land there */
async function ensureModel(name, onProgress) {
  const m = MODELS[name], dir = userModels(), dest = path.join(dir, name); fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(dest) && fs.statSync(dest).size === m.bytes) return dest; // size check every time, full hash on arrival
  const shipped = path.join(bundledModels(), name);
  if (fs.existsSync(shipped)) { // a copy that came with the installer: use it, no download
    const src = shipped;
    fs.copyFileSync(src, dest + '.part'); if ((await sha256(dest + '.part')) !== m.sha256) { fs.rmSync(dest + '.part', { force: true }); throw new Error(`The ${m.label} file is damaged. Please reinstall Chitra Studio.`); }
    fs.renameSync(dest + '.part', dest); return dest;
  }
  log('downloading', name, m.url);
  await new Promise((resolve, reject) => {
    const req = net.request(m.url), tmp = dest + '.part'; let got = 0, lastPct = -1;
    req.on('response', res => {
      if (res.statusCode !== 200) return reject(new Error(`Download failed (HTTP ${res.statusCode}). Check your internet connection and try again.`));
      const out = fs.createWriteStream(tmp);
      res.on('data', d => { out.write(d); got += d.length; const pct = Math.floor(got / m.bytes * 100); if (pct !== lastPct) { lastPct = pct; onProgress?.({ stage: `Downloading the ${m.label} — one time only (${Math.round(got / 1e6)} of ${Math.round(m.bytes / 1e6)} MB)`, pct }); } });
      res.on('end', () => out.end(resolve)); res.on('error', reject);
    });
    req.on('error', e => reject(new Error(`Download failed: ${e.message}. Check your internet connection and try again.`))); req.end();
  });
  onProgress?.({ stage: `Checking the ${m.label}…`, pct: 100 });
  const h = await sha256(dest + '.part'); if (h !== m.sha256) { fs.rmSync(dest + '.part', { force: true }); throw new Error(`The downloaded ${m.label} did not pass its safety check. Please try again.`); }
  fs.renameSync(dest + '.part', dest); log('model ready', name); return dest;
}

function worker() {
  if (child) return child;
  child = utilityProcess.fork(path.join(__dirname, 'worker.js'), [], { serviceName: 'Chitra AI', stdio: 'pipe' });
  child.stdout?.on('data', d => log('ai:', String(d).trim())); child.stderr?.on('data', d => log('ai err:', String(d).trim()));
  child.on('message', m => { const p = pending.get(m.id); if (!p) return; if (m.progress) return p.onProgress?.(m.progress); pending.delete(m.id); m.ok ? p.resolve(m.result) : p.reject(new Error(m.error)); });
  child.on('exit', code => { log('ai worker exited', code); child = null; for (const [, p] of pending) p.reject(new Error(code ? 'The AI stopped unexpectedly (often: not enough memory). Try a smaller picture, or close other apps and retry.' : 'AI stopped')); pending.clear(); });
  call('init', { modelDir: userModels() });
  return child;
}
function call(op, payload = {}, onProgress) {
  const id = ++seq; return new Promise((resolve, reject) => { pending.set(id, { resolve, reject, onProgress }); worker().postMessage({ id, op, ...payload }); });
}

function setup(logger) {
  log = logger || log;
  const progressTo = (e, jobId) => p => { if (!e.sender.isDestroyed()) e.sender.send('chitra-ai-progress', { jobId, ...p }); };
  ipcMain.handle('chitra-ai', async (e, { op, image, opts, jobId }) => {
    const onProgress = progressTo(e, jobId), t0 = Date.now();
    try {
      if (op === 'status') return { ok: true, result: { models: Object.fromEntries(Object.keys(MODELS).map(n => [n, fs.existsSync(path.join(userModels(), n))])) } };
      const model = op === 'removeBackground' ? 'birefnet_general.onnx' : op === 'upscale' ? 'realesrgan_x4plus.onnx' : null; if (!model) throw new Error('unknown AI operation');
      await ensureModel(model, onProgress);
      const result = await call(op, { image, opts }, onProgress);
      log('ai', op, `${image.width}x${image.height}`, '→', `${result.width}x${result.height}`, result.device, `${Date.now() - t0}ms`);
      return { ok: true, result };
    } catch (err) { log('ai failed', op, err); return { ok: false, error: err.message }; }
  });
  app.on('will-quit', () => { try { child?.kill(); } catch { } });
}
module.exports = { setup, MODELS };
