/* Chitra Studio for Windows — Electron main process.
 * The web app is served from inside the install through a private, secure scheme (chitra://app/) instead of file://,
 * so fetch, fonts and storage behave exactly as on the website, offline. Nothing here talks to the internet. */
const { app, BrowserWindow, protocol, net, shell, session, Menu, dialog } = require('electron');
const path = require('node:path'), fs = require('node:fs'), { pathToFileURL } = require('node:url');

const APP_DIR = path.join(__dirname, 'app'); // the web app, copied in by prepare.js
protocol.registerSchemesAsPrivileged([{ scheme: 'chitra', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, codeCache: true } }]);

if (!app.requestSingleInstanceLock()) app.quit(); // one window; a second launch focuses the first
let win;

const stateFile = () => path.join(app.getPath('userData'), 'window.json');
const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return { width: 1440, height: 900 }; } };
const saveState = () => { if (!win || win.isDestroyed()) return; const b = win.getNormalBounds(); try { fs.writeFileSync(stateFile(), JSON.stringify({ ...b, maximized: win.isMaximized() })); } catch { } };

function serveApp() {
  protocol.handle('chitra', req => {
    const u = new URL(req.url); let rel = decodeURIComponent(u.pathname); if (rel === '/' || rel === '') rel = '/index.html';
    const file = path.normalize(path.join(APP_DIR, rel));
    if (!file.startsWith(APP_DIR + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return new Response('Not found', { status: 404 }); // never outside the app folder
    return net.fetch(pathToFileURL(file).toString());
  });
}

function createWindow() {
  const s = readState();
  win = new BrowserWindow({
    width: s.width, height: s.height, x: s.x, y: s.y, minWidth: 1024, minHeight: 680, show: false, backgroundColor: '#f7f7fb', title: 'Chitra Studio',
    icon: path.join(__dirname, 'build', 'icon.ico'), autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: true },
  });
  if (s.maximized) win.maximize();
  win.once('ready-to-show', () => win.show());
  ['resize', 'move', 'close'].forEach(e => win.on(e, saveState));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; }); // links open in the normal browser
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('chitra://')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  win.loadURL('chitra://app/index.html?desktop=1');
}

app.whenReady().then(() => {
  serveApp();
  // exports (PNG, PDF, ZIP) ask where to save, starting in Pictures, like any Windows design app
  session.defaultSession.on('will-download', (_e, item) => { item.setSaveDialogOptions({ defaultPath: path.join(app.getPath('pictures'), item.getFilename()) }); });
  // camera, microphone, location, notifications: not used — refuse quietly
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(['clipboard-read', 'clipboard-sanitized-write', 'fullscreen'].includes(perm)));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'File', submenu: [{ role: 'quit', label: 'Exit' }] },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [{ label: 'About Chitra Studio', click: () => dialog.showMessageBox(win, { type: 'info', title: 'Chitra Studio', message: `Chitra Studio ${app.getVersion()}`, detail: 'Print-ready design for DTF and sublimation.\nFonts: SIL OFL / Apache 2.0 (see fonts/LICENSES.md).' }) }] },
  ]));
  createWindow();
});
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on('window-all-closed', () => app.quit());
