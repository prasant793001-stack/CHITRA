/* Runs in an isolated world before the app: exposes only narrow, named functions — never raw Node or file access. */
const { contextBridge, ipcRenderer } = require('electron');
const listeners = new Map();
ipcRenderer.on('chitra-ai-progress', (_e, p) => { const fn = listeners.get(p.jobId); if (fn) fn(p); });
let job = 0;
const run = (op, image, opts, onProgress) => {
  const jobId = ++job; if (onProgress) listeners.set(jobId, onProgress);
  return ipcRenderer.invoke('chitra-ai', { op, image, opts, jobId }).finally(() => listeners.delete(jobId)).then(r => { if (!r.ok) throw new Error(r.error); return r.result; });
};
contextBridge.exposeInMainWorld('chitraDesktop', Object.freeze({
  isDesktop: true, platform: process.platform,
  ai: Object.freeze({
    // image = { width, height, data: Uint8ClampedArray RGBA } → same shape back (removeBackground: same size, upscale: ×4)
    removeBackground: (image, opts, onProgress) => run('removeBackground', image, opts, onProgress),
    upscale: (image, opts, onProgress) => run('upscale', image, opts, onProgress),
    status: () => run('status'),
  }),
}));
