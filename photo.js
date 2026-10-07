/* Chitra Studio – photo power tools: stock photos, AI art, AI cut-out, magic fix, enhance,
   refine brush, crop/frames, die-cut outline and photoreal mockups. Uses window.chitra from app.js. */
(() => {
  const C = window.chitra;
  const { $, $$, pick, toast, confetti, commit, refreshProps, active, isImage, canvas } = C;
  const enc = encodeURIComponent;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const tick = () => new Promise(r => setTimeout(r, 30));
  const loadImg = (src, cors = true) => new Promise((res, rej) => {
    const i = new Image(); if (cors) i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => rej(new Error('image failed')); i.src = src;
  });
  const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
  const canvasToBlob = c => new Promise(r => c.toBlob(r, 'image/png'));

  /* a toast that stays until done (for long jobs) */
  function busy(msg) {
    const t = document.createElement('div'); t.className = 'toast busy'; t.innerHTML = '<i class="spin"></i><span></span>';
    $('span', t).textContent = msg; $('#toasts').appendChild(t);
    return { set: m => { $('span', t).textContent = m; }, done: () => { t.classList.add('out'); setTimeout(() => t.remove(), 350); } };
  }

  /* ================= image helpers ================= */
  // Bake what you currently see (filters + crop) into a canvas at natural resolution.
  function natCanvas(o, maxSide = 4096) {
    const el = o.getElement(), w = o.width, h = o.height, k = Math.min(1, maxSide / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext('2d').drawImage(el, o.cropX || 0, o.cropY || 0, w, h, 0, 0, c.width, c.height);
    return c;
  }
  function replaceImage(o, src, { sameScale = false, pristine = null } = {}) {
    return new Promise(resolve => {
      const url = typeof src === 'string' ? src : src.toDataURL('image/png'); // always a data URL: blob: links die on reload
      fabric.Image.fromURL(url, n => {
        const sw = o.getScaledWidth(), sh = o.getScaledHeight();
        n.set({
          left: o.left, top: o.top, originX: o.originX, originY: o.originY, angle: o.angle, flipX: o.flipX, flipY: o.flipY,
          opacity: o.opacity, shadow: o.shadow, adj: C.DEFAULT_ADJ(),
          scaleX: sameScale ? o.scaleX : sw / n.width, scaleY: sameScale ? o.scaleY : sh / n.height,
        });
        n._pristine = pristine || o._pristine || null; n.inSlot = o.inSlot; n.fitMode = o.fitMode; n.clipPath = o.clipPath || null; // keep print-area membership
        const idx = canvas.getObjects().indexOf(o);
        C.history.busy = true; canvas.remove(o); canvas.insertAt(n, idx); C.history.busy = false;
        canvas.setActiveObject(n); canvas.requestRenderAll(); commit(); refreshProps(); resolve(n);
      });
    });
  }
  const needImage = () => { const o = active(); if (!isImage(o)) { toast('Select a photo first', '👆'); return null; } return o; };
  const dpiOf = o => Math.round(C.dpi * o.width / o.getScaledWidth());

  /* ================= AI background removal (+ flood-fill fallback) ================= */
  let imglyP = null;
  const loadImgly = () => imglyP ||= import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm');
  /* Offline cut-out ("pro" classical pipeline): learns the background palette from the picture's border and the subject palette from its
     centre (k-means in Lab), refines both a few rounds (GrabCut-style), keeps only background connected to the border, drops specks,
     fills holes and feathers the edge. Used when the AI model cannot be downloaded. */
  function smartCut(src) {
    const W0 = src.width, H0 = src.height, k = Math.min(1, 480 / Math.max(W0, H0)), w = Math.max(8, Math.round(W0 * k)), h = Math.max(8, Math.round(H0 * k));
    const sm = document.createElement('canvas'); sm.width = w; sm.height = h; const sx = sm.getContext('2d', { willReadFrequently: true }); sx.drawImage(src, 0, 0, w, h);
    const px = sx.getImageData(0, 0, w, h).data, N = w * h, L = new Float32Array(N * 3), A = new Uint8Array(N);
    const f = v => (v /= 255) > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92, g = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    for (let i = 0; i < N; i++) {
      const r = f(px[i * 4]), gg = f(px[i * 4 + 1]), b = f(px[i * 4 + 2]); A[i] = px[i * 4 + 3];
      const X = g((r * .4124 + gg * .3576 + b * .1805) / .95047), Y = g(r * .2126 + gg * .7152 + b * .0722), Z = g((r * .0193 + gg * .1192 + b * .9505) / 1.08883);
      L[i * 3] = 116 * Y - 16; L[i * 3 + 1] = 500 * (X - Y); L[i * 3 + 2] = 200 * (Y - Z);
    }
    const d2 = (i, c) => { const a = L[i * 3] - c[0], b = L[i * 3 + 1] - c[1], e = L[i * 3 + 2] - c[2]; return a * a + b * b + e * e; };
    const kmeans = (idx, K) => { // returns centroids of the given pixel indices
      if (!idx.length) return []; const cs = []; for (let j = 0; j < K; j++) { const i = idx[Math.floor((j + 0.5) * idx.length / K)]; cs.push([L[i * 3], L[i * 3 + 1], L[i * 3 + 2]]); }
      for (let it = 0; it < 6; it++) {
        const sum = cs.map(() => [0, 0, 0, 0]);
        for (const i of idx) { let bj = 0, bd = 1e12; cs.forEach((c, j) => { const d = d2(i, c); if (d < bd) { bd = d; bj = j; } }); const s = sum[bj]; s[0] += L[i * 3]; s[1] += L[i * 3 + 1]; s[2] += L[i * 3 + 2]; s[3]++; }
        sum.forEach((s, j) => { if (s[3]) cs[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
      } return cs;
    };
    const dist = (i, cs) => { let m = 1e12; for (const c of cs) { const d = d2(i, c); if (d < m) m = d; } return m; };
    const band = Math.max(2, Math.round(Math.min(w, h) * 0.04)), border = [], centre = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (A[i] < 10) continue;
      if (x < band || y < band || x >= w - band || y >= h - band) border.push(i);
      else if (x > w * 0.3 && x < w * 0.7 && y > h * 0.3 && y < h * 0.7) centre.push(i);
    }
    let bg = kmeans(border, 5), fg = [], lab = new Uint8Array(N); // lab: 1 = foreground
    const T = 14 * 14; // colours this close to a background centroid count as background
    for (let round = 0; round < 4; round++) {
      if (round === 0) { const seeds = centre.filter(i => dist(i, bg) > T * 2); fg = seeds.length > 40 ? kmeans(seeds, 5) : []; }
      for (let i = 0; i < N; i++) {
        if (A[i] < 10) { lab[i] = 0; continue; }
        const db = dist(i, bg), df = fg.length ? dist(i, fg) : 1e12;
        lab[i] = fg.length ? (db > df * 1.15 || db > T * 6 ? 1 : 0) : (db > T ? 1 : 0);
      }
      for (let it = 0; it < 2; it++) { // 3x3 majority smoothing
        const nx = new Uint8Array(lab);
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += lab[i + dy * w + dx]; nx[i] = s >= 5 ? 1 : 0; }
        lab = nx;
      }
      if (round < 3) { const fi = [], bi = []; for (let i = 0; i < N; i++) (lab[i] ? fi : bi).push(i); const sub = a => a.length > 6000 ? a.filter((_, j) => j % Math.ceil(a.length / 6000) === 0) : a; if (fi.length > 40) fg = kmeans(sub(fi), 5); const bb = sub(bi.filter(i => { const x = i % w, y = (i / w) | 0; return x < band * 3 || y < band * 3 || x >= w - band * 3 || y >= h - band * 3; })); if (bb.length > 40) bg = kmeans(bb, 5); }
    }
    // keep real background only where it touches the border (so subject areas that resemble the background stay)
    const isBg = new Uint8Array(N), stack = []; const seed = i => { if (!lab[i] && !isBg[i]) { isBg[i] = 1; stack.push(i); } };
    for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); } for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
    while (stack.length) { const p = stack.pop(), x = p % w; if (x > 0) seed(p - 1); if (x < w - 1) seed(p + 1); if (p >= w) seed(p - w); if (p < N - w) seed(p + w); }
    // drop small foreground islands (keep components bigger than 3% of the largest)
    const comp = new Int32Array(N).fill(-1), sizes = []; let nc = 0;
    for (let s0 = 0; s0 < N; s0++) { if (isBg[s0] || comp[s0] >= 0) continue; let sz = 0; const st = [s0]; comp[s0] = nc; while (st.length) { const p = st.pop(); sz++; const x = p % w; for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p >= w ? p - w : -1, p < N - w ? p + w : -1]) if (q >= 0 && !isBg[q] && comp[q] < 0) { comp[q] = nc; st.push(q); } } sizes.push(sz); nc++; }
    const big = Math.max(0, ...sizes); const mask = new Uint8Array(N); for (let i = 0; i < N; i++) mask[i] = !isBg[i] && sizes[comp[i]] >= big * 0.03 ? 255 : 0;
    // soft full-resolution alpha: blur the low-res mask, then sharpen with a smoothstep so edges are ~1-2px soft
    const mc = document.createElement('canvas'); mc.width = w; mc.height = h; const mx = mc.getContext('2d'), mi = mx.createImageData(w, h);
    for (let i = 0; i < N; i++) { mi.data[i * 4] = mi.data[i * 4 + 1] = mi.data[i * 4 + 2] = 0; mi.data[i * 4 + 3] = mask[i]; } mx.putImageData(mi, 0, 0);
    const out = document.createElement('canvas'); out.width = W0; out.height = H0; const ox = out.getContext('2d', { willReadFrequently: true });
    const up = document.createElement('canvas'); up.width = W0; up.height = H0; const ux = up.getContext('2d', { willReadFrequently: true }); ux.imageSmoothingQuality = 'high'; ux.filter = `blur(${Math.max(0.6, 0.7 / k)}px)`; ux.drawImage(mc, 0, 0, W0, H0); ux.filter = 'none';
    ox.drawImage(src, 0, 0); const od = ox.getImageData(0, 0, W0, H0), ud = ux.getImageData(0, 0, W0, H0).data;
    for (let i = 0; i < W0 * H0; i++) { const t = Math.min(1, Math.max(0, (ud[i * 4 + 3] / 255 - 0.3) / 0.4)), s = t * t * (3 - 2 * t); od.data[i * 4 + 3] = Math.round(od.data[i * 4 + 3] * s); }
    ox.putImageData(od, 0, 0); return out;
  }
  async function removeBg(o = needImage()) {
    if (!o) return;
    const src = natCanvas(o, 3000), job = busy('Removing background…');
    try {
      const mod = await loadImgly();
      const blob = await canvasToBlob(src); let out;
      for (const model of ['isnet_fp16', 'isnet_quint8']) { // best quality first, lighter model if the device/network can't manage it
        try { out = await mod.removeBackground(blob, { model, output: { format: 'image/png', quality: 1 }, progress: (key, cur, total) => job.set(`AI cut-out… ${total ? Math.round((cur / total) * 100) : 0}%`) }); break; } catch (e) { console.warn('model', model, e); }
      }
      if (!out) throw new Error('no model');
      job.done(); await replaceImage(o, await blobToDataURL(out), { pristine: src });
      confetti(innerWidth / 2, innerHeight / 2, 80); toast('Background removed', '✂️');
    } catch (e) {
      console.warn('AI cut-out unavailable', e); job.done();
      const j2 = busy('AI model offline — using quick cut-out…'); await tick();
      await replaceImage(o, smartCut(src), { pristine: src }); j2.done();
      toast('Offline cut-out used — for the best result connect to the internet (AI model); use Refine to touch up', '✂️');
    }
  }
  $('#removeBg').onclick = () => removeBg();

  /* ================= magic fix (auto levels + white balance + gamma + vibrance) ================= */
  async function magicFix(o = needImage()) {
    if (!o) return;
    const job = busy('Magic fixing…'); await tick();
    const c = natCanvas(o, 4096), g = c.getContext('2d', { willReadFrequently: true }), id = g.getImageData(0, 0, c.width, c.height), d = id.data;
    const n = c.width * c.height, step = Math.max(1, Math.floor(n / 250000)), hist = [0, 1, 2].map(() => new Uint32Array(256)); let count = 0;
    for (let i = 0; i < n; i += step) { const p = i * 4; if (d[p + 3] < 10) continue; hist[0][d[p]]++; hist[1][d[p + 1]]++; hist[2][d[p + 2]]++; count++; }
    if (!count) { job.done(); return; }
    const pct = (h, q) => { let a = 0; for (let i = 0; i < 256; i++) { a += h[i]; if (a >= q * count) return i; } return 255; };
    const mean = h => h.reduce((s, v, i) => s + v * i, 0) / count;
    const lo = (pct(hist[0], .005) + pct(hist[1], .005) + pct(hist[2], .005)) / 3, hi = (pct(hist[0], .995) + pct(hist[1], .995) + pct(hist[2], .995)) / 3;
    const m = hist.map(mean), gray = (m[0] + m[1] + m[2]) / 3, gain = m.map(v => clamp(1 + 0.55 * (gray / Math.max(v, 1) - 1), 0.8, 1.25));
    const scale = clamp(255 / Math.max(hi - lo, 40), 1, 1.9), lm = clamp((gray - lo) * scale, 25, 230), gam = clamp(Math.log(118 / 255) / Math.log(lm / 255), 0.75, 1.4);
    const lut = gain.map(gn => Uint8ClampedArray.from({ length: 256 }, (_, i) => 255 * Math.pow(clamp(((i - lo) * scale * gn) / 255, 0, 1), gam)));
    for (let i = 0; i < n; i++) {
      const p = i * 4; let r = lut[0][d[p]], gg = lut[1][d[p + 1]], b = lut[2][d[p + 2]]; const l = 0.299 * r + 0.587 * gg + 0.114 * b, s = 1.14;
      d[p] = clamp(l + (r - l) * s, 0, 255); d[p + 1] = clamp(l + (gg - l) * s, 0, 255); d[p + 2] = clamp(l + (b - l) * s, 0, 255);
    }
    g.putImageData(id, 0, 0); job.done();
    await replaceImage(o, c); toast('Magic fix applied — colour, light & contrast balanced', '🪄');
  }

  /* ================= enhance: upscale 2× + unsharp ================= */
  async function enhance(o = needImage()) {
    if (!o) return;
    const job = busy('Enhancing quality…'); await tick();
    const src = natCanvas(o, 8000), f = (src.width * src.height * 4 <= (matchMedia('(pointer:coarse)').matches ? 16e6 : 40e6) && Math.max(src.width, src.height) <= 3000) ? 2 : 1; // phones can't allocate huge canvases
    let cur = src;
    if (f === 2) {
      let w = src.width, h = src.height; cur = src;
      const big = document.createElement('canvas'); big.width = w * 2; big.height = h * 2;
      const g = big.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      const mid = document.createElement('canvas'); mid.width = Math.round(w * 1.41); mid.height = Math.round(h * 1.41); // two soft steps look cleaner than one jump
      const mg = mid.getContext('2d'); mg.imageSmoothingQuality = 'high'; mg.drawImage(src, 0, 0, mid.width, mid.height);
      g.drawImage(mid, 0, 0, big.width, big.height); cur = big;
    }
    const g = cur.getContext('2d', { willReadFrequently: true }), W = cur.width, H = cur.height, id = g.getImageData(0, 0, W, H), d = id.data, copy = new Uint8ClampedArray(d), amt = 0.55;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = (y * W + x) * 4;
      for (let k = 0; k < 3; k++) { const v = copy[p + k]; d[p + k] = clamp(v + amt * (4 * v - copy[p - 4 + k] - copy[p + 4 + k] - copy[p - W * 4 + k] - copy[p + W * 4 + k]) * 0.5, 0, 255); }
    }
    g.putImageData(id, 0, 0); job.done();
    const n = await replaceImage(o, cur, { pristine: o._pristine });
    toast(f === 2 ? `Enhanced 2× — now ${dpiOf(n)} DPI at this size` : `Sharpened (image already large) — ${dpiOf(n)} DPI`, '🔍');
  }

  /* ================= die-cut sticker outline for images ================= */
  async function imgOutline(o = needImage()) {
    if (!o) return;
    const c = natCanvas(o, 4096), t = Math.max(2, Math.round(Math.max(c.width, c.height) * (+$('#outlineSize').value / 100) * 0.5));
    const out = document.createElement('canvas'); out.width = c.width + 2 * t; out.height = c.height + 2 * t; const g = out.getContext('2d');
    const sil = document.createElement('canvas'); sil.width = c.width; sil.height = c.height; const sg = sil.getContext('2d');
    sg.drawImage(c, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = $('#outlineColor').value; sg.fillRect(0, 0, sil.width, sil.height);
    [1, 0.66, 0.33].forEach(rad => { const steps = clamp(Math.round(t * 2), 24, 90); for (let i = 0; i < steps; i++) { const a = (i / steps) * Math.PI * 2; g.drawImage(sil, t + Math.cos(a) * t * rad, t + Math.sin(a) * t * rad); } });
    g.drawImage(c, t, t);
    await replaceImage(o, out, { sameScale: true }); toast('Die-cut outline added', '🏷️');
  }
  $('#imgOutline').onclick = () => imgOutline();

  /* ================= crop & frames ================= */
  $$('[data-crop]').forEach(b => b.onclick = () => {
    const o = needImage(); if (!o) return;
    const el = o._originalElement, nw = el.naturalWidth || el.width, nh = el.naturalHeight || el.height; let cw = nw, ch = nh;
    if (b.dataset.crop !== 'free') { const r = +b.dataset.crop; cw = nw; ch = nw / r; if (ch > nh) { ch = nh; cw = nh * r; } }
    o.set({ cropX: (nw - cw) / 2, cropY: (nh - ch) / 2, width: cw, height: ch }); o.clipPath = null; o.setCoords(); canvas.requestRenderAll(); commit(); refreshProps();
  });
  const star = (r, n = 5) => Array.from({ length: n * 2 }, (_, i) => { const rad = i % 2 ? r * 0.45 : r, a = (Math.PI / n) * i - Math.PI / 2; return { x: rad * Math.cos(a), y: rad * Math.sin(a) }; });
  const MASKS = {
    none: () => null,
    circle: o => new fabric.Circle({ radius: Math.min(o.width, o.height) / 2, originX: 'center', originY: 'center' }),
    rounded: o => new fabric.Rect({ width: o.width, height: o.height, rx: Math.min(o.width, o.height) * 0.14, ry: Math.min(o.width, o.height) * 0.14, originX: 'center', originY: 'center' }),
    heart: o => { const p = new fabric.Path('M 0 -60 C -100 -140 -190 -20 0 110 C 190 -20 100 -140 0 -60 z', { originX: 'center', originY: 'center' }); const s = Math.min(o.width, o.height) / 215; p.set({ scaleX: s, scaleY: s }); return p; },
    star: o => new fabric.Polygon(star(Math.min(o.width, o.height) / 2), { originX: 'center', originY: 'center' }),
  };
  $$('[data-mask]').forEach(b => b.onclick = () => {
    const o = needImage(); if (!o) return;
    o.clipPath = MASKS[b.dataset.mask](o); o.dirty = true; canvas.requestRenderAll(); commit();
  });

  /* ================= refine edges (erase / restore brush) ================= */
  const R = { o: null, orig: null, base: null, mode: 'erase', last: null, down: false };
  function openRefine(o = needImage()) {
    if (!o) return;
    const base = natCanvas(o, 2400), cv = $('#refineCanvas'); cv.width = base.width; cv.height = base.height;
    cv.getContext('2d').drawImage(base, 0, 0);
    R.o = o; R.base = base;
    if (o._pristine) { R.orig = document.createElement('canvas'); R.orig.width = base.width; R.orig.height = base.height; R.orig.getContext('2d').drawImage(o._pristine, 0, 0, base.width, base.height); } else R.orig = base;
    $('#refineModal').hidden = false;
  }
  function stamp(x, y) {
    const cv = $('#refineCanvas'), g = cv.getContext('2d'), ratio = cv.width / cv.getBoundingClientRect().width;
    const r = Math.max(2, ($('#rSize').value * ratio) / 2), soft = $('#rSoft').value / 100;
    const mask = (ctx, cx, cy) => { const gr = ctx.createRadialGradient(cx, cy, r * (1 - soft) * 0.9, cx, cy, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); };
    if (R.mode === 'erase') { g.save(); g.globalCompositeOperation = 'destination-out'; mask(g, x, y); g.restore(); }
    else {
      const t = document.createElement('canvas'); t.width = t.height = Math.ceil(r * 2); const tg = t.getContext('2d');
      tg.drawImage(R.orig, x - r, y - r, r * 2, r * 2, 0, 0, r * 2, r * 2); tg.globalCompositeOperation = 'destination-in'; mask(tg, r, r); g.drawImage(t, x - r, y - r);
    }
  }
  function refinePoint(e) { const cv = $('#refineCanvas'), b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * cv.width / b.width, (e.clientY - b.top) * cv.height / b.height]; }
  const rc = $('#refineCanvas');
  rc.addEventListener('pointerdown', e => { R.down = true; rc.setPointerCapture(e.pointerId); R.last = refinePoint(e); stamp(...R.last); });
  rc.addEventListener('pointermove', e => {
    if (!R.down) return; const p = refinePoint(e), [lx, ly] = R.last, dist = Math.hypot(p[0] - lx, p[1] - ly), r = $('#rSize').value / 2 * (rc.width / rc.getBoundingClientRect().width), n = Math.max(1, Math.ceil(dist / (r / 3)));
    for (let i = 1; i <= n; i++) stamp(lx + ((p[0] - lx) * i) / n, ly + ((p[1] - ly) * i) / n); R.last = p;
  });
  ['pointerup', 'pointercancel'].forEach(ev => rc.addEventListener(ev, () => { R.down = false; }));
  $$('[data-rmode]').forEach(b => b.onclick = () => { R.mode = b.dataset.rmode; $$('[data-rmode]').forEach(x => x.classList.toggle('on', x === b)); });
  { let keep = null; const cmpOn = e => { e.preventDefault(); if (!R.orig || keep) return; const g = rc.getContext('2d'); keep = g.getImageData(0, 0, rc.width, rc.height); g.clearRect(0, 0, rc.width, rc.height); g.drawImage(R.orig, 0, 0, rc.width, rc.height); };
    const cmpOff = () => { if (!keep) return; rc.getContext('2d').putImageData(keep, 0, 0); keep = null; };
    const cb = $('#rCompare'); ['pointerdown'].forEach(ev => cb.addEventListener(ev, cmpOn)); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => cb.addEventListener(ev, cmpOff)); }
  $('#rReset').onclick = () => { const g = rc.getContext('2d'); g.clearRect(0, 0, rc.width, rc.height); g.drawImage(R.base, 0, 0); };
  $('#rApply').onclick = async () => { $('#refineModal').hidden = true; const c = document.createElement('canvas'); c.width = rc.width; c.height = rc.height; c.getContext('2d').drawImage(rc, 0, 0); await replaceImage(R.o, c, { pristine: R.orig }); toast('Edges refined', '🖌️'); };
  $('#refine').onclick = () => openRefine();

  /* wire the inspector quick buttons */
  $$('[data-pm]').forEach(b => b.onclick = () => ({ removeBg, magicFix, enhance, refine: openRefine })[b.dataset.pm]());
  $('#magicFix').onclick = () => magicFix(); $('#enhance').onclick = () => enhance();

  /* ================= stock library: every source merged, source names never shown in the UI ================= */
  const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const SEAL = 'chitra-studio';
  const unseal = str => { try { return atob(str).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ SEAL.charCodeAt(i % SEAL.length))).join(''); } catch { return ''; } };
  /* ---- key vault: API keys are stored AES-GCM encrypted (PBKDF2 passphrase) so nothing readable sits in localStorage ---- */
  const VK = 'chitra.vault', te = new TextEncoder(), b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))), unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  let KEYS = null; // decrypted keys, memory only
  const vaultRec = () => { try { return JSON.parse(lsGet(VK) || 'null'); } catch { return null; } };
  const deriveKey = async (pass, salt) => crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const decryptWith = async (key, rec) => JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(rec.i) }, key, unb64(rec.d))));
  const vault = {
    state() { if (vaultRec()) return KEYS ? 'open' : 'locked'; return lsGet('chitra.keys') ? 'plain' : 'none'; },
    async unlock(pass) { const rec = vaultRec(); if (!rec) return false; try { KEYS = await decryptWith(await deriveKey(pass, unb64(rec.s)), rec); return true; } catch { return false; } },
    async tryRemembered() { const rec = vaultRec(); if (!rec || KEYS) return !!KEYS; try { const k = await C.kv.get('vaultkey'); if (k) { KEYS = await decryptWith(k, rec); return true; } } catch { } return false; },
    async save(keys, pass, remember) {
      const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), key = await deriveKey(pass, salt);
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(keys)));
      localStorage.setItem(VK, JSON.stringify({ v: 1, s: b64(salt), i: b64(iv), d: b64(ct) })); localStorage.removeItem('chitra.keys'); KEYS = { ...keys };
      try { remember ? await C.kv.set('vaultkey', key) : await C.kv.del('vaultkey'); } catch { }
    },
    wipe() { localStorage.removeItem(VK); localStorage.removeItem('chitra.keys'); KEYS = null; C.kv.del('vaultkey').catch(() => { }); },
    async ensure() { // unlock silently if possible, else ask for the passphrase once per visit
      if (vault.state() !== 'locked') return true; if (await vault.tryRemembered()) return true;
      return new Promise(res => {
        const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
        m.innerHTML = '<div class="sheet small"><h2>Unlock your photo keys</h2><p class="tip">Enter the passphrase you set in Owner setup. Your keys never leave this device.</p><form id="vfm"><input id="vpw" type="password" class="text-in" style="width:100%" autocomplete="current-password" placeholder="Passphrase"><p class="tip err" id="verr"></p><div class="pr-btns"><button class="cta" type="submit">Unlock</button><button class="btn" type="button" id="vskip">Not now</button></div></form></div>'; document.body.appendChild(m);
        const done = ok => { m.remove(); res(ok); }; $('#vpw', m).focus(); $('#vskip', m).onclick = () => done(false);
        $('#vfm', m).onsubmit = async e => { e.preventDefault(); $('#verr', m).textContent = 'Checking…'; if (await vault.unlock($('#vpw', m).value)) done(true); else $('#verr', m).textContent = 'That passphrase is not right'; };
      });
    },
  };
  function stockConfig() {
    const CFG = window.CHITRA_CONFIG || {}, sealed = CFG.sealedKeys || {}; let own = KEYS || {}; if (!KEYS && !vaultRec()) { try { own = JSON.parse(lsGet('chitra.keys') || '{}'); } catch { } }
    const pick = n => own[n] || (sealed[n] ? unseal(sealed[n]) : '');
    return { proxy: (lsGet('chitra.proxy') || CFG.photoProxy || '').replace(/\/$/, ''), pixabay: pick('pixabay'), pexels: pick('pexels'), unsplash: pick('unsplash') };
  }
  const NORM = {
    pixabay: x => ({ id: 'px' + x.id, thumb: x.webformatURL, full: x.largeImageURL || x.webformatURL, w: x.imageWidth, h: x.imageHeight, by: x.user, site: 'Pixabay', link: x.pageURL, title: (x.tags || '').split(',')[0] }),
    pexels: x => ({ id: 'pe' + x.id, thumb: x.src.medium, full: x.src.large2x || x.src.large, w: x.width, h: x.height, by: x.photographer, site: 'Pexels', link: x.url, title: x.alt || '' }),
    unsplash: x => ({ id: 'un' + x.id, dl: x.id, thumb: x.urls.small, full: x.urls.regular, w: x.width, h: x.height, by: x.user.name, site: 'Unsplash', link: x.links.html, title: x.alt_description || '' }),
    openverse: x => ({ id: 'ov' + x.id, thumb: x.thumbnail || x.url, full: x.url, by: x.creator || 'Unknown', site: 'Openverse', link: x.foreign_landing_url, title: x.title || '' }),
  };
  const getJSON = async (url, opt) => { const r = await fetch(url, opt); if (!r.ok) throw new Error(url.split('/')[2] + ' ' + r.status); return r.json(); };
  const SRC = {
    async pixabay(cfg, q, page, kind) {
      const types = kind === 'graphic' ? ['vector', 'illustration'] : ['photo'], per = kind === 'graphic' ? 12 : 24;
      const rs = await Promise.all(types.map(t => getJSON(`https://pixabay.com/api/?key=${enc(cfg.pixabay)}&q=${enc(q)}&page=${page}&per_page=${per}&safesearch=true&image_type=${t}${kind === 'graphic' ? '&colors=transparent' : ''}`)));
      return { items: rs.flatMap(j => j.hits.map(NORM.pixabay)), more: rs.some(j => page * per < j.totalHits) };
    },
    async pexels(cfg, q, page) { const j = await getJSON(`https://api.pexels.com/v1/search?query=${enc(q)}&page=${page}&per_page=24`, { headers: { Authorization: cfg.pexels } }); return { items: j.photos.map(NORM.pexels), more: !!j.next_page }; },
    async unsplash(cfg, q, page) { const j = await getJSON(`https://api.unsplash.com/search/photos?query=${enc(q)}&page=${page}&per_page=24&client_id=${enc(cfg.unsplash)}`); return { items: j.results.map(NORM.unsplash), more: page < j.total_pages }; },
    async openverse(q, page) { const j = await getJSON(`https://api.openverse.org/v1/images/?q=${enc(q)}&page=${page}&page_size=24&license_type=commercial&mature=false`); return { items: j.results.map(NORM.openverse), more: page < j.page_count }; },
  };
  async function stockSearch(q, { page = 1, kind = 'photo' } = {}) {
    if (vault.state() === 'locked') await vault.ensure();
    const cfg = stockConfig();
    if (cfg.proxy) return getJSON(`${cfg.proxy}/search?q=${enc(q)}&page=${page}&kind=${kind}`); // keys live on the server, never in the browser
    const jobs = [];
    if (cfg.pixabay) jobs.push(SRC.pixabay(cfg, q, page, kind));
    if (kind === 'photo') { if (cfg.pexels) jobs.push(SRC.pexels(cfg, q, page)); if (cfg.unsplash) jobs.push(SRC.unsplash(cfg, q, page)); if (!jobs.length) jobs.push(SRC.openverse(q, page)); }
    if (!jobs.length) return { items: [], more: false, notConnected: true };
    const ok = (await Promise.allSettled(jobs)).filter(r => r.status === 'fulfilled').map(r => r.value);
    if (!ok.length) throw new Error('all sources failed');
    const out = [], max = Math.max(...ok.map(o => o.items.length)); // best of every source, interleaved
    for (let i = 0; i < max; i++) ok.forEach(o => { if (o.items[i]) out.push(o.items[i]); });
    return { items: out, more: ok.some(o => o.more) };
  }
  function addToCanvas(img, note, maxFrac = 0.8) {
    const k = Math.min((C.W * maxFrac) / img.width, (C.H * maxFrac) / img.height, 1);
    img.set({ adj: C.DEFAULT_ADJ() }).scale(k); C.place(img); toast(note, ''); return img;
  }
  function addStock(it, kind = 'photo') {
    const job = busy(kind === 'graphic' ? 'Adding graphic…' : 'Adding photo…');
    const done = (img, low) => { job.done(); if (!img) return toast('That image could not be loaded', '⚠️'); img.credit = { site: it.site, by: it.by, link: it.link, title: it.title }; addToCanvas(img, low ? 'Added (low-res preview — try Enhance 2×)' : 'Added', kind === 'graphic' ? 0.5 : 0.8); };
    fabric.Image.fromURL(it.full, (img, err) => {
      if (err || !img.getElement()?.width) fabric.Image.fromURL(it.thumb, (im2, e2) => done(e2 ? null : im2, true), { crossOrigin: 'anonymous' });
      else done(img, false);
    }, { crossOrigin: 'anonymous' });
  }

  /* ---- hidden owner setup: Ctrl+Shift+K or tap the logo 7 times. Keys stay in THIS browser only. ---- */
  async function openAdmin() {
    if (vault.state() === 'locked') await vault.ensure();
    const st = vault.state(); ['admPixabay', 'admPexels', 'admUnsplash'].forEach(id => { $('#' + id).value = ''; });
    $('#admProxy').value = lsGet('chitra.proxy') || ''; $('#admPass').value = ''; $('#admRemember').checked = !!(await C.kv.get('vaultkey').catch(() => null));
    const have = n => (KEYS && KEYS[n]) || (st === 'plain' && (() => { try { return JSON.parse(lsGet('chitra.keys') || '{}')[n]; } catch { return ''; } })());
    [['admPixabay', 'pixabay'], ['admPexels', 'pexels'], ['admUnsplash', 'unsplash']].forEach(([id, n]) => { $('#' + id).placeholder = have(n) ? 'saved - leave empty to keep' : 'paste key'; });
    const c = stockConfig(); $('#admStatus').textContent = (st === 'plain' ? 'Your keys are stored UNENCRYPTED in this browser - choose a passphrase and press Save to lock them. ' : st === 'open' || st === 'locked' ? 'Keys are encrypted on this device. ' : 'No keys saved yet. ') + 'Active: ' + ([c.proxy && 'proxy', c.pixabay && 'Pixabay', c.pexels && 'Pexels', c.unsplash && 'Unsplash'].filter(Boolean).join(', ') || 'none (keyless fallback)');
    $('#adminModal').hidden = false;
  }
  $('#admSave').onclick = async () => {
    const prev = KEYS || (() => { try { return JSON.parse(lsGet('chitra.keys') || '{}'); } catch { return {}; } })(), keys = { ...prev };
    [['admPixabay', 'pixabay'], ['admPexels', 'pexels'], ['admUnsplash', 'unsplash']].forEach(([id, n]) => { const v = $('#' + id).value.trim(); if (v) keys[n] = v; });
    try { localStorage.setItem('chitra.proxy', $('#admProxy').value.trim()); } catch { }
    if (Object.keys(keys).length) {
      const pass = $('#admPass').value; if (pass.length < 6) { $('#admStatus').textContent = 'Choose a passphrase of at least 6 characters to lock your keys.'; return; }
      try { await vault.save(keys, pass, $('#admRemember').checked); } catch { $('#admStatus').textContent = 'This browser cannot encrypt keys (needs HTTPS).'; return; }
    }
    $('#adminModal').hidden = true; toast('Saved - keys are encrypted on this device', ''); document.dispatchEvent(new Event('chitra:keys'));
  };
  $('#admExport') && ($('#admExport').onclick = () => C.exportCatalog && C.exportCatalog());
  $('#admWipe') && ($('#admWipe').onclick = () => { if (confirm('Remove all saved keys from this browser?')) { vault.wipe(); $('#adminModal').hidden = true; toast('Keys removed', ''); } });
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); openAdmin(); } });
  let taps = 0, tapT; [$('#homeBtn'), $('.hm-logo')].forEach(el => el && el.addEventListener('click', () => { taps++; clearTimeout(tapT); tapT = setTimeout(() => { taps = 0; }, 1500); if (taps >= 7) { taps = 0; openAdmin(); } }));

  /* ================= AI art (Pollinations, free) ================= */
  const AI_STYLES = [['Photoreal', 'photorealistic, ultra detailed, sharp focus, studio lighting'], ['Cartoon', 'fun cartoon illustration, bold outlines, vibrant colours'], ['Retro', 'retro 70s poster style, halftone, bold colours'],
    ['Watercolor', 'soft watercolor painting, white background'], ['Sticker', 'die-cut sticker design, flat vector, thick white border, plain white background'], ['Neon', 'neon glow, synthwave, dark background'], ['Vector', 'clean vector illustration, flat colours, plain white background']];
  let aiStyle = 4;
  $('#aiStyles').innerHTML = AI_STYLES.map((s, i) => `<button type="button" class="chip${i === aiStyle ? ' on' : ''}" data-ai="${i}">${s[0]}</button>`).join('');
  $$('[data-ai]').forEach(b => b.onclick = () => { aiStyle = +b.dataset.ai; $$('[data-ai]').forEach(x => x.classList.toggle('on', x === b)); });
  const aiHist = [];
  $('#aiGo').onclick = async () => {
    const prompt = $('#aiPrompt').value.trim(); if (!prompt) return toast('Describe your image first', '✍️');
    const [w, h] = $('#aiShape').value.split('x'), job = busy('Generating your image… (can take ~20s)');
    try {
      const url = `https://image.pollinations.ai/prompt/${enc(prompt + ', ' + AI_STYLES[aiStyle][1])}?width=${w}&height=${h}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1e6)}`;
      const r = await fetch(url); if (!r.ok) throw new Error('AI ' + r.status);
      const data = await blobToDataURL(await r.blob()); job.done();
      aiHist.unshift(data); aiHist.length = Math.min(aiHist.length, 8); renderAiGrid();
      fabric.Image.fromURL(data, async img => {
        const o = addToCanvas(img, 'Generated!'); confetti(innerWidth / 2, innerHeight / 3, 70);
        if ($('#aiCut').checked) await removeBg(o);
      });
    } catch (e) { console.warn(e); job.done(); toast('The free AI service is busy or offline — try again', '⚠️'); }
  };
  function renderAiGrid() {
    $('#aiGrid').innerHTML = aiHist.map((d, i) => `<button class="photo-card" data-aih="${i}"><img src="${d}" alt=""></button>`).join('');
    $$('[data-aih]').forEach(b => b.onclick = () => fabric.Image.fromURL(aiHist[b.dataset.aih], img => addToCanvas(img, 'Added')));
  }

  /* ================= photoreal mockups ================= */
  const MS = 900;
  const M = { kind: 'shirt', color: '#ffffff', scene: null, sceneIdx: 0, photo: null, px: 0.5, py: 0.5, art: null };
  const COLORS = ['#ffffff', '#14110f', '#1e3a8a', '#ff2d95', '#ffd23f', '#2ec4b6', '#9ca3af', '#dc2626', '#7c3aed', '#065f46', '#f5e6d3', '#f97316'];
  const SCENES = [['Studio', '#3a3a58', '#14141f'], ['Peach', '#ffd6c0', '#ff9a8b'], ['Mint', '#c8f7e3', '#7be0c3'], ['Sky', '#cfe8ff', '#7aa8ff'], ['Night', '#1b1035', '#05050c']];
  const rng = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = MS; return c; };
  const blur = (g, px) => { if ('filter' in g) g.filter = `blur(${px}px)`; };
  const noTint = g => { if ('filter' in g) g.filter = 'none'; };
  const shade = (hex, k) => { const [r, g, b] = new fabric.Color(hex).getSource(); const f = v => clamp(Math.round(v + (k > 0 ? (255 - v) * k : v * k)), 0, 255); return `rgb(${f(r)},${f(g)},${f(b)})`; };

  function backdrop(g) {
    if (M.scene) {
      const s = Math.max(MS / M.scene.width, MS / M.scene.height), w = M.scene.width * s, h = M.scene.height * s;
      g.drawImage(M.scene, (MS - w) / 2, (MS - h) / 2, w, h);
      const v = g.createRadialGradient(MS / 2, MS / 2, MS * 0.3, MS / 2, MS / 2, MS * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = v; g.fillRect(0, 0, MS, MS);
    } else {
      const [, a, b] = SCENES[M.sceneIdx], gr = g.createRadialGradient(MS / 2, MS * 0.42, 60, MS / 2, MS / 2, MS * 0.75); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, MS, MS);
    }
  }
  function fabricNoise(seed = 7) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), id = g.createImageData(128, 128), r = rng(seed);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() > 0.5 ? 255 : 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = r() * 14; }
    g.putImageData(id, 0, 0); return c;
  }
  function drawShirt(g) {
    const k = MS / 600, P = new Path2D();
    const body = 'M200 62 L125 88 Q108 95 98 112 L38 192 Q34 200 41 205 L98 238 Q106 242 112 234 L140 192 L140 536 Q140 544 148 544 L452 544 Q460 544 460 536 L460 192 L488 234 Q494 242 502 238 L559 205 Q566 200 562 192 L502 112 Q492 95 475 88 L400 62 Q300 135 200 62 Z';
    P.addPath(new Path2D(body), new DOMMatrix().scale(k));
    // cast shadow
    g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 50; g.shadowOffsetY = 28; g.fillStyle = M.color; g.fill(P); g.restore();
    g.fillStyle = M.color; g.fill(P);
    // design on the chest (slightly softened so it sits in the fabric)
    const bw = 300, bh = 400, s = Math.min(bw / M.art.width, bh / M.art.height), dw = M.art.width * s, dh = M.art.height * s;
    const layer = mk(), lg = layer.getContext('2d'); blur(lg, 0.5); lg.drawImage(M.art, MS / 2 - dw / 2, 300, dw, dh); noTint(lg);
    g.save(); g.clip(P); g.globalAlpha = 0.97; g.drawImage(layer, 0, 0); g.globalAlpha = 1;
    // lighting & folds (drawn after the design so it shades the print too)
    const sh = mk(), sg = sh.getContext('2d'), r = rng(11);
    let gr = sg.createLinearGradient(0, 0, MS, 0); gr.addColorStop(0, 'rgba(0,0,0,.34)'); gr.addColorStop(.22, 'rgba(255,255,255,.10)'); gr.addColorStop(.5, 'rgba(255,255,255,.04)'); gr.addColorStop(.78, 'rgba(0,0,0,.06)'); gr.addColorStop(1, 'rgba(0,0,0,.38)');
    sg.fillStyle = gr; sg.fillRect(0, 0, MS, MS);
    gr = sg.createLinearGradient(0, 80, 0, MS * 0.93); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,.20)'); sg.fillStyle = gr; sg.fillRect(0, 0, MS, MS);
    blur(sg, 9); sg.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const x = 230 + r() * 440, y0 = 200 + r() * 120, bend = (r() - 0.5) * 120, len = 160 + r() * 380;
      sg.lineWidth = 14 + r() * 26; sg.strokeStyle = `rgba(0,0,0,${0.02 + r() * 0.04})`; sg.beginPath(); sg.moveTo(x, y0); sg.quadraticCurveTo(x + bend, y0 + len / 2, x + bend * 0.4, y0 + len); sg.stroke();
      sg.lineWidth = 8 + r() * 14; sg.strokeStyle = `rgba(255,255,255,${0.04 + r() * 0.06})`; sg.beginPath(); sg.moveTo(x + 18, y0); sg.quadraticCurveTo(x + 18 + bend, y0 + len / 2, x + 18 + bend * 0.4, y0 + len); sg.stroke();
    }
    sg.strokeStyle = 'rgba(0,0,0,.30)'; sg.lineWidth = 16; // armpit creases & under-collar shadow
    sg.beginPath(); sg.moveTo(140 * k, 192 * k); sg.lineTo(100 * k, 238 * k); sg.moveTo(460 * k, 192 * k); sg.lineTo(500 * k, 238 * k); sg.stroke();
    sg.lineWidth = 26; sg.beginPath(); sg.moveTo(205 * k, 70 * k); sg.quadraticCurveTo(300 * k, 140 * k, 395 * k, 70 * k); sg.stroke();
    noTint(sg); g.drawImage(sh, 0, 0);
    // weave texture
    g.fillStyle = g.createPattern(fabricNoise(), 'repeat'); g.fillRect(0, 0, MS, MS);
    // ribbed collar
    g.strokeStyle = shade(M.color, -0.22); g.lineWidth = 20; g.beginPath(); g.moveTo(205 * k, 64 * k); g.quadraticCurveTo(300 * k, 134 * k, 395 * k, 64 * k); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(208 * k, 72 * k); g.quadraticCurveTo(300 * k, 142 * k, 392 * k, 72 * k); g.stroke();
    g.restore();
  }
  function drawMug(g, o = {}) {
    const cx = 450, R = o.R || 180, top = o.top || 230, bot = o.bot || 650, ry = o.ry || 28, col = M.color;
    // floor shadow
    g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; blur(g, 16); g.beginPath(); g.ellipse(cx + 20, bot + 18, 230, 34, 0, 0, Math.PI * 2); g.fill(); noTint(g); g.restore();
    // handle
    if (!o.noHandle) { g.save(); g.lineCap = 'round';
    g.strokeStyle = shade(col, -0.12); g.lineWidth = 46; g.beginPath(); g.arc(cx + R + 5, 440, 98, -1.25, 1.25); g.stroke();
    g.strokeStyle = shade(col, 0.18); g.lineWidth = 12; g.beginPath(); g.arc(cx + R + 5, 440, 105, -1.1, 0.9); g.stroke(); g.restore(); }
    // body
    const body = new Path2D(); body.moveTo(cx - R, top); body.lineTo(cx - R, bot); body.ellipse(cx, bot, R, ry, 0, Math.PI, 0, true); body.lineTo(cx + R, top); body.ellipse(cx, top, R, ry, 0, 0, Math.PI, true); body.closePath();
    g.fillStyle = col; g.fill(body);
    g.save(); g.clip(body);
    // wrap the artwork around the cylinder (per-column projection)
    const arcFrac = o.arc || 2 * Math.PI * 0.9, srcPer = M.art.width / arcFrac, dh = Math.min(o.maxH || 400, arcFrac * R * (o.ratio ?? M.art.height / M.art.width)), y0 = (top + bot) / 2 - dh / 2 + 6;
    for (let x = -R; x < R; x += 1) {
      const t = clamp(x / R, -0.999, 0.999), a = Math.asin(t), sx = M.art.width / 2 + a * srcPer, sw = Math.max(1, srcPer / Math.sqrt(1 - t * t) / R * 1.2), off = ry * (Math.sqrt(1 - t * t) - 0.5);
      g.drawImage(M.art, clamp(sx, 0, M.art.width - 1), 0, sw, M.art.height, cx + x, y0 + off, 1.6, dh);
    }
    // cylindrical lighting
    const lg = g.createLinearGradient(cx - R, 0, cx + R, 0);
    [[0, 'rgba(0,0,0,.55)'], [.08, 'rgba(0,0,0,.22)'], [.22, 'rgba(255,255,255,.0)'], [.3, 'rgba(255,255,255,.42)'], [.36, 'rgba(255,255,255,.0)'], [.7, 'rgba(0,0,0,.08)'], [.92, 'rgba(0,0,0,.35)'], [1, 'rgba(0,0,0,.6)']].forEach(([o, c]) => lg.addColorStop(o, c));
    g.fillStyle = lg; g.fillRect(cx - R, top - ry, 2 * R, bot - top + 2 * ry);
    const ao = g.createLinearGradient(0, bot - 90, 0, bot + ry); ao.addColorStop(0, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = ao; g.fillRect(cx - R, bot - 90, 2 * R, 90 + ry);
    g.restore();
    // rim + inside of cup
    g.fillStyle = shade(col, 0.25); g.beginPath(); g.ellipse(cx, top, R, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = shade(col, -0.55); g.beginPath(); g.ellipse(cx, top + 2, R - 10, ry - 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(cx - 40, top - 4, R - 60, 5, 0, Math.PI, 0); g.fill();
    if (o.lid) { // tumbler lid + straw
      g.save(); g.strokeStyle = '#d7dbe2'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + 40, top - 10); g.lineTo(cx + 80, top - 130); g.stroke(); g.restore();
      g.fillStyle = shade(col, -0.05); g.beginPath(); g.ellipse(cx, top - 6, R + 6, ry + 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(cx - 30, top - 12, R - 50, ry - 12, 0, Math.PI, 0); g.fill();
    }
  }
  function drawTumbler(g, op = {}) { drawMug(g, { ...op, R: 135, top: 150, bot: 690, ry: 24, noHandle: true, lid: true, maxH: 440 }); }
  function drawTote(g) {
    const x = 190, y = 300, w = 520, h = 520, col = M.color;
    g.save(); g.fillStyle = 'rgba(0,0,0,.4)'; blur(g, 22); g.fillRect(x + 20, y + h - 10, w - 40, 36); noTint(g); g.restore();
    g.save(); g.lineCap = 'round'; g.strokeStyle = shade(col, -0.18); g.lineWidth = 26; g.beginPath(); g.moveTo(x + 150, y + 6); g.bezierCurveTo(x + 130, y - 210, x + w - 130, y - 210, x + w - 150, y + 6); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 156, y + 4); g.bezierCurveTo(x + 136, y - 200, x + w - 136, y - 200, x + w - 156, y + 4); g.stroke(); g.restore();
    g.fillStyle = col; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w + 6, y + h); g.lineTo(x - 6, y + h); g.closePath(); g.fill();
    g.save(); g.clip();
    const s = Math.min(330 / M.art.width, 360 / M.art.height), dw = M.art.width * s, dh = M.art.height * s, layer = mk(), lg = layer.getContext('2d'); blur(lg, 0.5); lg.drawImage(M.art, x + w / 2 - dw / 2, y + 90, dw, dh); noTint(lg); g.globalAlpha = 0.96; g.drawImage(layer, 0, 0); g.globalAlpha = 1;
    const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(0,0,0,.25)'); gr.addColorStop(.25, 'rgba(255,255,255,.06)'); gr.addColorStop(.7, 'rgba(0,0,0,.05)'); gr.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = gr; g.fillRect(x - 10, y, w + 20, h);
    const r = rng(7); blur(g, 7); g.lineCap = 'round'; for (let i = 0; i < 9; i++) { g.lineWidth = 14 + r() * 22; g.strokeStyle = `rgba(0,0,0,${0.04 + r() * 0.05})`; const xx = x + 30 + r() * (w - 60); g.beginPath(); g.moveTo(xx, y + 40); g.quadraticCurveTo(xx + (r() - .5) * 80, y + h / 2, xx + (r() - .5) * 40, y + h - 20); g.stroke(); } noTint(g);
    g.fillStyle = g.createPattern(fabricNoise(), 'repeat'); g.fillRect(x - 10, y, w + 20, h);
    g.strokeStyle = shade(col, -0.25); g.lineWidth = 3; g.setLineDash([10, 7]); g.beginPath(); g.moveTo(x + 8, y + 30); g.lineTo(x + w - 8, y + 30); g.stroke(); g.setLineDash([]);
    g.restore();
  }
  function drawPad(g) {
    const x = 120, y = 230, w = 660, h = 500, rr = 46;
    g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; blur(g, 22); g.beginPath(); g.roundRect(x + 10, y + 26, w, h, rr); g.fill(); noTint(g); g.restore();
    g.save(); g.beginPath(); g.roundRect(x, y, w, h, rr); g.clip(); g.fillStyle = M.color; g.fillRect(x, y, w, h);
    const s = Math.max(w / M.art.width, h / M.art.height), dw = M.art.width * s, dh = M.art.height * s; g.drawImage(M.art, x + w / 2 - dw / 2, y + h / 2 - dh / 2, dw, dh);
    const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = g.createPattern(fabricNoise(), 'repeat'); g.globalAlpha = 0.7; g.fillRect(x, y, w, h); g.globalAlpha = 1; g.restore();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.setLineDash([9, 6]); g.beginPath(); g.roundRect(x + 10, y + 10, w - 20, h - 20, rr - 8); g.stroke(); g.setLineDash([]);
  }
  function drawCase(g) {
    const x = 290, y = 110, w = 320, h = 680, rr = 64;
    g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; blur(g, 24); g.beginPath(); g.roundRect(x + 18, y + 30, w, h, rr); g.fill(); noTint(g); g.restore();
    g.save(); g.beginPath(); g.roundRect(x, y, w, h, rr); g.clip(); g.fillStyle = M.color; g.fillRect(x, y, w, h);
    const s = Math.max(w / M.art.width, h / M.art.height), dw = M.art.width * s, dh = M.art.height * s; g.drawImage(M.art, x + w / 2 - dw / 2, y + h / 2 - dh / 2, dw, dh);
    const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(.18, 'rgba(255,255,255,.0)'); gr.addColorStop(.32, 'rgba(255,255,255,.2)'); gr.addColorStop(.42, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.34)'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = '#14141c'; g.beginPath(); g.roundRect(x + 24, y + 24, 128, 128, 34); g.fill();
    [[60, 62], [60, 118], [112, 90]].forEach(([cx, cy]) => { g.fillStyle = '#2a2a35'; g.beginPath(); g.arc(x + cx + 8, y + cy + 8, 25, 0, 7); g.fill(); g.fillStyle = '#0a0a10'; g.beginPath(); g.arc(x + cx + 8, y + cy + 8, 15, 0, 7); g.fill(); g.fillStyle = 'rgba(120,150,255,.55)'; g.beginPath(); g.arc(x + cx + 3, y + cy + 3, 4, 0, 7); g.fill(); });
    g.restore(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.beginPath(); g.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, rr); g.stroke();
  }
  /* Realistic product preview of a flat design (used for template thumbnails): returns a 900x900 canvas */
  function mockRender(kind, art, color, sceneIdx = 1, opts = {}) {
    const sv = { kind: M.kind, art: M.art, color: M.color, scene: M.scene, sceneIdx: M.sceneIdx };
    Object.assign(M, { kind, art, color, scene: null, sceneIdx });
    const c = document.createElement('canvas'); c.width = c.height = MS; const g = c.getContext('2d');
    try { backdrop(g); ({ mug: drawMug, tumbler: drawTumbler, tote: drawTote, pad: drawPad, case: drawCase }[kind] || drawShirt)(g, opts); } finally { Object.assign(M, sv); }
    return c;
  }
  function drawPhoto(g) {
    if (!M.photo) { g.fillStyle = '#222'; g.fillRect(0, 0, MS, MS); g.fillStyle = '#9c9cb8'; g.font = '28px sans-serif'; g.textAlign = 'center'; g.fillText('Upload a photo of your blank product →', MS / 2, MS / 2); return; }
    const s = Math.max(MS / M.photo.width, MS / M.photo.height), w = M.photo.width * s, h = M.photo.height * s; g.drawImage(M.photo, (MS - w) / 2, (MS - h) / 2, w, h);
    const dw = (MS * $('#mpScale').value) / 100, dh = dw * (M.art.height / M.art.width);
    g.save(); g.translate(M.px * MS, M.py * MS); g.rotate(($('#mpRot').value * Math.PI) / 180);
    if ($('#mpMultiply').checked) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.93; }
    blur(g, 0.4); g.drawImage(M.art, -dw / 2, -dh / 2, dw, dh); g.restore();
  }
  function drawMockup() {
    $$('[data-mock]').forEach(b => b.classList.toggle('on', b.dataset.mock === M.kind));
    $('#mockColorBox').hidden = M.kind === 'photo'; $('#mockPhotoBox').hidden = M.kind !== 'photo';
    const c = $('#mockCanvas'), g = c.getContext('2d'); g.clearRect(0, 0, MS, MS);
    try { M.art = C.renderDesign(false); } catch { toast('This design uses an image that blocks export (CORS) — upload it instead', '⚠️'); return; }
    if (M.kind === 'photo') return drawPhoto(g);
    backdrop(g); ({ mug: drawMug, tumbler: drawTumbler, tote: drawTote, pad: drawPad, case: drawCase }[M.kind] || drawShirt)(g);
  }
  function buildMockUI() {
    if ($('#mockColors').children.length) return;
    $('#mockColors').innerHTML = COLORS.map(c => `<button data-mc="${c}" style="background:${c}"></button>`).join('');
    $$('[data-mc]').forEach(b => b.onclick = () => { M.color = b.dataset.mc; drawMockup(); });
    $$('[data-mock]').forEach(b => b.onclick = () => { M.kind = b.dataset.mock; drawMockup(); });
    $('#mockScenes').innerHTML = [['None', null], ...SCENES.map((s, i) => [s[0], i])].map(([n, i]) => `<button class="chip" data-sc="${i === null ? 'x' : i}">${n}</button>`).join('');
    $$('[data-sc]').forEach(b => b.onclick = () => { if (b.dataset.sc === 'x') { M.scene = null; M.sceneIdx = 0; } else { M.scene = null; M.sceneIdx = +b.dataset.sc; } drawMockup(); });
    $('#mockPhotoIn').onchange = async e => { const f = e.target.files[0]; if (!f) return; M.photo = await loadImg(URL.createObjectURL(f), false); drawMockup(); };
    ['mpScale', 'mpRot', 'mpMultiply'].forEach(id => $('#' + id).addEventListener('input', drawMockup));
    const mc = $('#mockCanvas'); let drag = false;
    const pos = e => { const b = mc.getBoundingClientRect(); M.px = (e.clientX - b.left) / b.width; M.py = (e.clientY - b.top) / b.height; drawMockup(); };
    mc.addEventListener('pointerdown', e => { if (M.kind !== 'photo') return; drag = true; mc.setPointerCapture(e.pointerId); pos(e); });
    mc.addEventListener('pointermove', e => drag && pos(e)); mc.addEventListener('pointerup', () => { drag = false; });
    $('#sceneForm').onsubmit = async e => {
      e.preventDefault(); const q = $('#sceneQ').value.trim(); if (!q) return;
      const box = $('#sceneResults'); box.innerHTML = '<p class="tip">Searching…</p>';
      try {
        const { items } = await stockSearch(q, { page: 1, kind: 'photo' }); box.innerHTML = '';
        items.slice(0, 9).forEach(it => {
          const b = document.createElement('button'); b.className = 'photo-card'; b.innerHTML = '<img alt="">'; $('img', b).src = it.thumb;
          b.onclick = async () => { try { M.scene = await loadImg(it.full); } catch { try { M.scene = await loadImg(it.thumb); } catch { return toast('That photo could not be loaded', '⚠️'); } } drawMockup(); };
          box.appendChild(b);
        });
      } catch { box.innerHTML = ''; toast('Could not reach the photo service', '⚠️'); }
    };
    $('#mockDownload').onclick = () => $('#mockCanvas').toBlob(b => {
      const url = URL.createObjectURL(b), a = document.createElement('a'); a.href = url; a.download = 'mockup.png'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); confetti(); toast('Mockup saved', '👀');
    });
  }
  const guessKind = () => { const n = $('#productName').textContent; return C.guide === 'mug' ? 'mug' : /tumbler/i.test(n) ? 'tumbler' : /tote/i.test(n) ? 'tote' : /mouse/i.test(n) ? 'pad' : /phone/i.test(n) ? 'case' : 'shirt'; };
  function openMockup() { buildMockUI(); if (M.kind !== 'photo') M.kind = guessKind(); $('#mockup').hidden = false; drawMockup(); }
  $('#mockupBtn').onclick = openMockup;

  Object.assign(C, { vault, mockRender, openMockup, removeBg, magicFix, enhance, refine: openRefine, imgOutline, replaceImage, natCanvas, busy, stock: { search: stockSearch, add: addStock, config: stockConfig, addToCanvas } });
})();
