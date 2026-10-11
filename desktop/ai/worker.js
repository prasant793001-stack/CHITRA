/* Chitra AI worker — runs in its own process (Electron utilityProcess), never on the window's thread, so the app never freezes
 * and a crash here cannot take the design window down.
 *
 * Background removal: BiRefNet (MIT, Zheng Peng et al.) at 1024×1024, the same class of model professional removers use, then
 *   edge colour decontamination (blur-fusion foreground estimation, Forte & Pitié 2021) so hair/fur edges carry no old-background tint.
 * Upscale: Real-ESRGAN x4plus (BSD-3, Wang et al.) in overlapping tiles — real added detail, not sharpening.
 * Runs on the graphics card through DirectML (NVIDIA, AMD, Intel) and falls back to the CPU.
 *
 * Messages in:  { id, op:'removeBackground'|'upscale'|'status'|'warm', image?:{width,height,data:Uint8ClampedArray RGBA}, opts? }
 * Messages out: { id, progress:{stage, pct} } … then { id, ok:true, result } or { id, ok:false, error } */
const ort = require('onnxruntime-node');
const path = require('node:path'), fs = require('node:fs');

let MODEL_DIR = null, device = null, currentId = null; const sessions = {};
const port = process.parentPort; // present inside Electron's utilityProcess; absent when tests require() this file
const post = m => port && port.postMessage({ id: currentId, ...m });

async function session(name) {
  if (sessions[name]) return sessions[name];
  const file = path.join(MODEL_DIR, name);
  if (!fs.existsSync(file)) throw new Error(`model missing: ${name}`);
  const base = { graphOptimizationLevel: 'all', enableCpuMemArena: true, intraOpNumThreads: Math.max(1, require('node:os').cpus().length - 1) };
  const tries = process.platform === 'win32' ? [['dml', 'cpu'], ['cpu']] : [['cpu']];
  let last;
  for (const eps of tries) {
    try { const s = await ort.InferenceSession.create(file, { ...base, executionProviders: eps }); device = eps[0] === 'dml' ? 'GPU (DirectML)' : 'CPU'; sessions[name] = s; return s; } catch (e) { last = e; }
  }
  throw last;
}

/* ---------- image helpers on plain typed arrays (no native image library needed) ---------- */
function resizeBilinear(src, sw, sh, ch, dw, dh) { // src: Float32Array HWC, returns Float32Array HWC
  const out = new Float32Array(dw * dh * ch), xr = sw / dw, yr = sh / dh;
  for (let y = 0; y < dh; y++) {
    const fy = Math.max(0, (y + 0.5) * yr - 0.5), y0 = Math.min(sh - 1, Math.floor(fy)), y1 = Math.min(sh - 1, y0 + 1), wy = fy - y0;
    for (let x = 0; x < dw; x++) {
      const fx = Math.max(0, (x + 0.5) * xr - 0.5), x0 = Math.min(sw - 1, Math.floor(fx)), x1 = Math.min(sw - 1, x0 + 1), wx = fx - x0;
      for (let c = 0; c < ch; c++) {
        const a = src[(y0 * sw + x0) * ch + c], b = src[(y0 * sw + x1) * ch + c], d = src[(y1 * sw + x0) * ch + c], e = src[(y1 * sw + x1) * ch + c];
        out[(y * dw + x) * ch + c] = (a * (1 - wx) + b * wx) * (1 - wy) + (d * (1 - wx) + e * wx) * wy;
      }
    }
  }
  return out;
}
function resize(src, sw, sh, ch, dw, dh) { // area-average when shrinking (no aliasing on big photos), bilinear when enlarging
  if (dw >= sw && dh >= sh) return resizeBilinear(src, sw, sh, ch, dw, dh);
  const out = new Float32Array(dw * dh * ch), xr = sw / dw, yr = sh / dh;
  for (let y = 0; y < dh; y++) {
    const sy0 = y * yr, sy1 = sy0 + yr;
    for (let x = 0; x < dw; x++) {
      const sx0 = x * xr, sx1 = sx0 + xr; let wsum = 0; const acc = [0, 0, 0, 0];
      for (let yy = Math.floor(sy0); yy < Math.min(sh, Math.ceil(sy1)); yy++) {
        const wy = Math.min(sy1, yy + 1) - Math.max(sy0, yy);
        for (let xx = Math.floor(sx0); xx < Math.min(sw, Math.ceil(sx1)); xx++) {
          const wgt = wy * (Math.min(sx1, xx + 1) - Math.max(sx0, xx)); wsum += wgt;
          for (let c = 0; c < ch; c++) acc[c] += src[(yy * sw + xx) * ch + c] * wgt;
        }
      }
      for (let c = 0; c < ch; c++) out[(y * dw + x) * ch + c] = acc[c] / wsum;
    }
  }
  return out;
}
function boxBlur(src, w, h, ch, r) { // separable box blur with clamped edges, sliding sums: O(pixels) whatever the radius
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length), n = 2 * r + 1;
  for (let y = 0; y < h; y++) for (let c = 0; c < ch; c++) {
    let s = 0; const row = y * w;
    for (let k = -r; k <= r; k++) s += src[(row + Math.min(w - 1, Math.max(0, k))) * ch + c];
    for (let x = 0; x < w; x++) { tmp[(row + x) * ch + c] = s / n; s += src[(row + Math.min(w - 1, x + r + 1)) * ch + c] - src[(row + Math.max(0, x - r)) * ch + c]; }
  }
  for (let x = 0; x < w; x++) for (let c = 0; c < ch; c++) {
    let s = 0;
    for (let k = -r; k <= r; k++) s += tmp[(Math.min(h - 1, Math.max(0, k)) * w + x) * ch + c];
    for (let y = 0; y < h; y++) { out[(y * w + x) * ch + c] = s / n; s += tmp[(Math.min(h - 1, y + r + 1) * w + x) * ch + c] - tmp[(Math.max(0, y - r) * w + x) * ch + c]; }
  }
  return out;
}
function decontaminate(img, a, w, h) { // img Float32 RGB 0..1, a Float32 0..1 → foreground colours with the old background removed from soft edges
  const N = w * h, pass = (F, B, r) => {
    const ba = boxBlur(a, w, h, 1, r), FA = new Float32Array(N * 3), BA = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) for (let c = 0; c < 3; c++) { FA[i * 3 + c] = F[i * 3 + c] * a[i]; BA[i * 3 + c] = B[i * 3 + c] * (1 - a[i]); }
    const bFA = boxBlur(FA, w, h, 3, r), bBA = boxBlur(BA, w, h, 3, r), nF = new Float32Array(N * 3), nB = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) for (let c = 0; c < 3; c++) {
      const bF = bFA[i * 3 + c] / (ba[i] + 1e-5), bB = bBA[i * 3 + c] / (1 - ba[i] + 1e-5), al = a[i];
      nF[i * 3 + c] = Math.min(1, Math.max(0, bF + al * (img[i * 3 + c] - al * bF - (1 - al) * bB))); nB[i * 3 + c] = bB;
    }
    return [nF, nB];
  };
  const big = Math.max(90, Math.round(90 * Math.max(w, h) / 1024)), small = Math.max(6, Math.round(6 * Math.max(w, h) / 1024)); // the paper's radii (90, 6) at 1024 px and never smaller: the wide first pass is what finds the true colours; larger photos scale up
  const [F1, B1] = pass(img, img, big); return pass(F1, B1, small)[0];
}

/* ---------- background removal ---------- */
async function removeBackground({ width: W, height: H, data }, opts = {}) {
  const s = await session(opts.model || 'birefnet_general.onnx'); post({ progress: { stage: `Finding the subject on ${device}…`, pct: 10 } });
  const N = W * H, rgb = new Float32Array(N * 3); for (let i = 0; i < N; i++) { rgb[i * 3] = data[i * 4] / 255; rgb[i * 3 + 1] = data[i * 4 + 1] / 255; rgb[i * 3 + 2] = data[i * 4 + 2] / 255; }
  const S = 1024, small = resize(rgb, W, H, 3, S, S), mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225], chw = new Float32Array(3 * S * S);
  for (let i = 0; i < S * S; i++) for (let c = 0; c < 3; c++) chw[c * S * S + i] = (small[i * 3 + c] - mean[c]) / std[c];
  const t0 = Date.now(), outName = s.outputNames[0], res = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', chw, [1, 3, S, S]) });
  post({ progress: { stage: 'Refining edges…', pct: 70 } });
  const logit = res[outName].data, m = new Float32Array(S * S); let lo = Infinity, hi = -Infinity; for (let i = 0; i < logit.length; i++) { lo = Math.min(lo, logit[i]); hi = Math.max(hi, logit[i]); }
  const isLogit = lo < -0.01 || hi > 1.01; for (let i = 0; i < m.length; i++) m[i] = isLogit ? 1 / (1 + Math.exp(-logit[i])) : logit[i];
  const a = resize(m, S, S, 1, W, H);
  for (let i = 0; i < N; i++) a[i] = Math.min(1, Math.max(0, a[i]));
  const F = opts.decontaminate === false ? rgb : decontaminate(rgb, a, W, H);
  const out = new Uint8ClampedArray(N * 4); let kept = 0;
  for (let i = 0; i < N; i++) { out[i * 4] = F[i * 3] * 255 + 0.5; out[i * 4 + 1] = F[i * 3 + 1] * 255 + 0.5; out[i * 4 + 2] = F[i * 3 + 2] * 255 + 0.5; out[i * 4 + 3] = a[i] * (data[i * 4 + 3] / 255) * 255 + 0.5; if (a[i] > 0.5) kept++; }
  return { width: W, height: H, data: out, coverage: kept / N, device, ms: Date.now() - t0 };
}

/* ---------- upscale ×4 (Real-ESRGAN) in overlapping tiles ---------- */
async function upscale({ width: W, height: H, data }, opts = {}) {
  const s = await session('realesrgan_x4plus.onnx'), K = 4, tile = device === 'CPU' ? 128 : (opts.tile || 256), pad = 12;
  const N = W * H, hasAlpha = (() => { for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true; return false; })();
  const OW = W * K, OH = H * K, out = new Uint8ClampedArray(OW * OH * 4);
  const passes = hasAlpha ? ['rgb', 'alpha'] : ['rgb']; const tilesX = Math.ceil(W / tile), tilesY = Math.ceil(H / tile), total = tilesX * tilesY * passes.length; let done = 0; const t0 = Date.now();
  for (const pass of passes) {
    for (let ty = 0; ty < tilesY; ty++) for (let tx = 0; tx < tilesX; tx++) {
      const x0 = tx * tile, y0 = ty * tile, x1 = Math.min(W, x0 + tile), y1 = Math.min(H, y0 + tile);
      const px0 = Math.max(0, x0 - pad), py0 = Math.max(0, y0 - pad), px1 = Math.min(W, x1 + pad), py1 = Math.min(H, y1 + pad), tw = px1 - px0, th = py1 - py0;
      const inp = new Float32Array(3 * tw * th);
      for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
        const si = ((py0 + y) * W + px0 + x) * 4, di = y * tw + x;
        if (pass === 'rgb') { inp[di] = data[si] / 255; inp[tw * th + di] = data[si + 1] / 255; inp[2 * tw * th + di] = data[si + 2] / 255; } else { const v = data[si + 3] / 255; inp[di] = v; inp[tw * th + di] = v; inp[2 * tw * th + di] = v; }
      }
      const r = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', inp, [1, 3, th, tw]) }), o = r[s.outputNames[0]].data, ow = tw * K, oh = th * K;
      for (let y = (y0 - py0) * K; y < (y1 - py0) * K; y++) for (let x = (x0 - px0) * K; x < (x1 - px0) * K; x++) { // keep only the tile's own area: padding hides seams
        const di = ((py0 * K + y) * OW + px0 * K + x) * 4, si = y * ow + x;
        if (pass === 'rgb') { out[di] = o[si] * 255 + 0.5; out[di + 1] = o[ow * oh + si] * 255 + 0.5; out[di + 2] = o[2 * ow * oh + si] * 255 + 0.5; if (!hasAlpha) out[di + 3] = 255; } else out[di + 3] = (o[si] + o[ow * oh + si] + o[2 * ow * oh + si]) / 3 * 255 + 0.5;
      }
      done++; post({ progress: { stage: `Upscaling on ${device}… ${Math.round(done / total * 100)}%`, pct: Math.round(done / total * 100) } });
    }
  }
  return { width: OW, height: OH, data: out, device, ms: Date.now() - t0 };
}

let queue = Promise.resolve(); // one job at a time: the model already uses every core / the whole GPU
async function handle(msg) {
  const { id, op } = msg; currentId = id;
  try {
    if (op === 'init') { MODEL_DIR = msg.modelDir; return post({ ok: true }); }
    if (op === 'status') return post({ ok: true, result: { device, loaded: Object.keys(sessions) } });
    if (op === 'warm') { await session(msg.model); return post({ ok: true, result: { device } }); }
    const job = op === 'removeBackground' ? removeBackground : op === 'upscale' ? upscale : null; if (!job) throw new Error('unknown op ' + op);
    post({ ok: true, result: await job(msg.image, msg.opts) });
  } catch (e) { post({ ok: false, error: String((e && e.message) || e) }); }
}
if (port) port.on('message', ({ data }) => { queue = queue.then(() => handle(data)); });
const setModelDir = d => { MODEL_DIR = d; };
module.exports = { resize, resizeBilinear, boxBlur, decontaminate, removeBackground, upscale, setModelDir }; // for tests
