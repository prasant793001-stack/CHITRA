/* Runs in an isolated world before the app: exposes only what the page needs to know it is the desktop build.
 * Later steps add GPU background removal, upscaling and the ComfyUI key store here — each as a narrow function, never raw Node access. */
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('chitraDesktop', Object.freeze({ isDesktop: true, platform: process.platform }));
