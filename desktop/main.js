/* Chitra Studio for Windows — Electron main process.
 * The web app is served from inside the install through a private, secure scheme (chitra://app/) instead of file://,
 * so fetch, fonts and storage behave exactly as on the website, offline. Nothing here talks to the internet.
 *
 * It never fails silently: every start-up step and every crash is written to %APPDATA%\Chitra Studio\chitra-log.txt,
 * the window is shown straight away (a hidden window that never loads looks like "the app did nothing"), and graphics
 * acceleration is off unless turned on (see below). */
const { app, BrowserWindow, protocol, net, shell, session, Menu, dialog } = require('electron');
const path = require('node:path'), fs = require('node:fs'), { pathToFileURL } = require('node:url');

/* ---------- log ---------- */
let logFile = null;
function log(...a) {
  const line = `[${new Date().toISOString()}] ${a.map(x => (x instanceof Error ? x.stack : typeof x === 'string' ? x : JSON.stringify(x))).join(' ')}\n`;
  try { if (!logFile) { const dir = app.getPath('userData'); fs.mkdirSync(dir, { recursive: true }); logFile = path.join(dir, 'chitra-log.txt'); try { if (fs.statSync(logFile).size > 2e6) fs.renameSync(logFile, logFile + '.old'); } catch { } } fs.appendFileSync(logFile, line); } catch { }
}
const fatal = (title, err) => { log('FATAL', title, err); try { dialog.showErrorBox(`Chitra Studio — ${title}`, `${err && err.message ? err.message : err}\n\nDetails were saved to:\n${logFile || '%APPDATA%\\Chitra Studio\\chitra-log.txt'}\n\nPlease send that file to support.`); } catch { } };
process.on('uncaughtException', e => fatal('unexpected error', e));
process.on('unhandledRejection', e => log('unhandledRejection', e));

/* ---------- graphics acceleration: OFF by default ----------
 * Chitra draws on 2D canvases, which run well on the CPU; Chromium's GPU process is the most common reason an Electron app
 * closes silently on Windows (driver or hybrid NVIDIA/AMD/Intel setups: "GPU process isn't usable", no handler can catch it).
 * The AI features use the graphics card directly (later steps), not through Chromium, so nothing is lost.
 * Help → "Use graphics acceleration" turns it on; a start that never finishes loading turns it back off automatically. */
const ud = () => app.getPath('userData');
const gpuOnFile = () => path.join(ud(), 'gpu-on.flag'), startingFile = () => path.join(ud(), 'starting.flag');
let GPU = process.argv.includes('--gpu');
try { fs.mkdirSync(ud(), { recursive: true }); if (fs.existsSync(gpuOnFile())) GPU = true; if (GPU && fs.existsSync(startingFile())) { GPU = false; fs.rmSync(gpuOnFile(), { force: true }); log('previous start with graphics acceleration never finished loading → acceleration turned off'); } fs.writeFileSync(startingFile(), new Date().toISOString()); } catch { }
if (!GPU) app.disableHardwareAcceleration();
const setGpu = on => { try { if (on) fs.writeFileSync(gpuOnFile(), '1'); else fs.rmSync(gpuOnFile(), { force: true }); } catch { } app.relaunch(); app.exit(0); };

log(`start v${app.getVersion()} electron ${process.versions.electron} chrome ${process.versions.chrome} ${process.platform} ${process.arch} gpu=${GPU} exe=${process.execPath}`);

const APP_DIR = path.join(__dirname, 'app'); // the web app, copied in by prepare.js
protocol.registerSchemesAsPrivileged([{ scheme: 'chitra', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, codeCache: true } }]);

if (!app.requestSingleInstanceLock()) { log('another instance is already running — focusing it and exiting'); app.quit(); }
let win;

const stateFile = () => path.join(app.getPath('userData'), 'window.json');
const readState = () => { try { const s = JSON.parse(fs.readFileSync(stateFile(), 'utf8')); return s && s.width > 600 && s.height > 400 ? s : null; } catch { return null; } };
const saveState = () => { if (!win || win.isDestroyed()) return; try { const b = win.getNormalBounds(); fs.writeFileSync(stateFile(), JSON.stringify({ ...b, maximized: win.isMaximized() })); } catch { } };

function serveApp() {
  protocol.handle('chitra', async req => {
    try {
      const u = new URL(req.url); let rel = decodeURIComponent(u.pathname); if (rel === '/' || rel === '') rel = '/index.html';
      const file = path.normalize(path.join(APP_DIR, rel));
      if (!file.startsWith(APP_DIR + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { if (!/favicon|sw\.js|photos\.json/.test(rel)) log('404', rel); return new Response('Not found', { status: 404 }); }
      return await net.fetch(pathToFileURL(file).toString());
    } catch (e) { log('protocol error', req.url, e); return new Response('Error', { status: 500 }); }
  });
}

const errorPage = msg => `data:text/html;charset=utf-8,${encodeURIComponent(`<body style="font:15px system-ui;padding:48px;color:#222"><h2>Chitra Studio could not open</h2><p>${msg}</p><p>Details: ${logFile || ''}</p></body>`)}`;

function createWindow() {
  const s = readState() || { width: 1440, height: 900, maximized: true };
  win = new BrowserWindow({
    width: s.width, height: s.height, x: s.x, y: s.y, minWidth: 1024, minHeight: 680, show: true, backgroundColor: '#f7f7fb', title: 'Chitra Studio',
    icon: path.join(__dirname, 'build', 'icon.ico'), autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: true },
  });
  if (s.maximized) win.maximize();
  ['resize', 'move', 'close'].forEach(e => win.on(e, saveState));
  const wc = win.webContents;
  wc.on('did-finish-load', () => { log('page loaded'); try { fs.rmSync(startingFile(), { force: true }); } catch { } });
  wc.on('did-fail-load', (_e, code, desc, url, main) => { log('did-fail-load', code, desc, url, main); if (main && code !== -3) win.loadURL(errorPage(`The page failed to load (${desc}).`)); });
  wc.on('render-process-gone', (_e, d) => { log('render-process-gone', d); if (d.reason === 'clean-exit') return; if (GPU) return setGpu(false); win.loadURL(errorPage(`The design page stopped (${d.reason}, code ${d.exitCode}). Use View → Reload to try again.`)); });
  wc.on('unresponsive', () => log('page unresponsive'));
  wc.on('preload-error', (_e, p, err) => log('preload-error', p, err));
  wc.on('console-message', (_e, level, message, line, src) => { if (level >= 3) log('page error:', message, `${src}:${line}`); });
  wc.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; }); // links open in the normal browser
  wc.on('will-navigate', (e, url) => { if (!url.startsWith('chitra://')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  win.loadURL('chitra://app/index.html?desktop=1').catch(e => log('loadURL', e));
}

app.on('child-process-gone', (_e, d) => { log('child-process-gone', d); if (d.type === 'GPU' && GPU && d.reason !== 'clean-exit') setGpu(false); });

app.whenReady().then(() => {
  log('ready; gpu:', app.getGPUFeatureStatus ? app.getGPUFeatureStatus() : 'n/a');
  serveApp();
  // exports (PNG, PDF, ZIP) ask where to save, starting in Pictures, like any Windows design app
  session.defaultSession.on('will-download', (_e, item) => { item.setSaveDialogOptions({ defaultPath: path.join(app.getPath('pictures'), item.getFilename()) }); });
  // camera, microphone, location, notifications: not used — refuse quietly
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(['clipboard-read', 'clipboard-sanitized-write', 'fullscreen'].includes(perm)));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'File', submenu: [{ role: 'quit', label: 'Exit' }] },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [{ label: 'Use graphics acceleration', type: 'checkbox', checked: GPU, click: m => setGpu(m.checked) }, { label: 'Open log folder', click: () => shell.openPath(app.getPath('userData')) }, { label: 'About Chitra Studio', click: () => dialog.showMessageBox(win, { type: 'info', title: 'Chitra Studio', message: `Chitra Studio ${app.getVersion()}`, detail: `Print-ready design for DTF and sublimation.\nFonts: SIL OFL / Apache 2.0.\nGraphics acceleration: ${GPU ? 'on' : 'off'}` }) }] },
  ]));
  createWindow();
}).catch(e => fatal('could not start', e));
app.on('second-instance', () => { log('second launch → focusing window'); if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
app.on('window-all-closed', () => app.quit());
