/* Unit tests for the desktop AI worker's image maths (no model, no Electron): node tests/desktop-ai.test.mjs
   onnxruntime-node is only needed by the worker at run time; a stub stands in for it here. */
import { createRequire } from 'node:module'; import Module from 'node:module';
const require = createRequire(import.meta.url), origLoad = Module._load;
Module._load = function (req, ...a) { return req === 'onnxruntime-node' ? {} : origLoad.call(this, req, ...a); };
const W = require('../desktop/ai/worker.js'); let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? pass++ : fail++; console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (x ? ' | ' + x : '')); };
{ const s = new Float32Array(16 * 16).map((_, i) => ((i % 16) + Math.floor(i / 16)) % 2); const o = W.resize(s, 16, 16, 1, 4, 4); ok('shrinking a checkerboard averages it (no aliasing)', o.every(v => Math.abs(v - 0.5) < 1e-6), [...o].slice(0, 4).join(',')); }
{ const s = new Float32Array([0, 1]); const o = W.resize(s, 2, 1, 1, 4, 1); ok('enlarging interpolates smoothly', o[0] <= o[1] && o[1] <= o[2] && o[2] <= o[3], [...o].map(v => v.toFixed(2)).join(',')); }
{ const s = new Float32Array(50 * 50).fill(0.3); const b = W.boxBlur(s, 50, 50, 1, 7); ok('blurring a flat image changes nothing', b.every(v => Math.abs(v - 0.3) < 1e-5)); }
{ // red subject on a blue background, with a soft 50% edge whose pixels are half red, half blue: the clean colour must come out red
  const w = 60, h = 40, N = w * h, img = new Float32Array(N * 3), a = new Float32Array(N);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, al = x < 25 ? 1 : x < 35 ? 0.5 : 0; a[i] = al; img[i * 3] = al; img[i * 3 + 1] = 0; img[i * 3 + 2] = 1 - al; }
  const F = W.decontaminate(img, a, w, h), i = 20 * w + 30;
  ok('edge colour decontamination removes the old background tint', F[i * 3] > 0.85 && F[i * 3 + 2] < 0.15, `edge was rgb(${img[i * 3].toFixed(2)},0,${img[i * 3 + 2].toFixed(2)}) -> rgb(${F[i * 3].toFixed(2)},${F[i * 3 + 1].toFixed(2)},${F[i * 3 + 2].toFixed(2)})`);
  const j = 20 * w + 5; ok('solid subject colour is left alone', Math.abs(F[j * 3] - 1) < 0.02 && F[j * 3 + 2] < 0.02);
}
console.log(`\n${pass}/${pass + fail} passed`); process.exit(fail ? 1 : 0);
