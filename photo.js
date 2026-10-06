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
  function floodCut(src, tol = 30) {
    const w = src.width, h = src.height, c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0);
    const id = x.getImageData(0, 0, w, h), d = id.data;
    const corners = [0, w - 1, (h - 1) * w, h * w - 1].map(i => i * 4);
    const bg = [0, 1, 2].map(k => corners.reduce((s, i) => s + d[i + k], 0) / 4), lim2 = ((tol / 100) * 441) ** 2;
    const near = i => { const a = d[i] - bg[0], b = d[i + 1] - bg[1], cc = d[i + 2] - bg[2]; return a * a + b * b + cc * cc <= lim2; };
    const seen = new Uint8Array(w * h), stack = new Int32Array(w * h); let sp = 0;
    const push = p => { if (!seen[p] && (d[p * 4 + 3] < 8 || near(p * 4))) { seen[p] = 1; stack[sp++] = p; } };
    for (let i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
    for (let j = 0; j < h; j++) { push(j * w); push(j * w + w - 1); }
    while (sp) { const p = stack[--sp], px = p % w, py = (p / w) | 0; if (px > 0) push(p - 1); if (px < w - 1) push(p + 1); if (py > 0) push(p - w); if (py < h - 1) push(p + w); }
    for (let p = 0; p < w * h; p++) if (seen[p]) d[p * 4 + 3] = 0;
    for (let p = 0; p < w * h; p++) { if (seen[p]) continue; const px = p % w; if ((px > 0 && seen[p - 1]) || (px < w - 1 && seen[p + 1]) || (p >= w && seen[p - w]) || (p < w * (h - 1) && seen[p + w])) d[p * 4 + 3] = Math.min(d[p * 4 + 3], 150); }
    x.putImageData(id, 0, 0); return c;
  }
  async function removeBg(o = needImage()) {
    if (!o) return;
    const src = natCanvas(o, 3000), job = busy('Removing background…');
    try {
      const mod = await loadImgly();
      const out = await mod.removeBackground(await canvasToBlob(src), { progress: (key, cur, total) => job.set(`AI cut-out… ${total ? Math.round((cur / total) * 100) : 0}%`) });
      job.done(); await replaceImage(o, await blobToDataURL(out), { pristine: src });
      confetti(innerWidth / 2, innerHeight / 2, 80); toast('Background removed', '✂️');
    } catch (e) {
      console.warn('AI cut-out unavailable', e); job.done();
      const j2 = busy('AI model offline — using quick cut-out…'); await tick();
      await replaceImage(o, floodCut(src, 30), { pristine: src }); j2.done();
      toast('Quick cut-out used (works best on plain backgrounds)', '✂️');
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
  $('#rReset').onclick = () => { const g = rc.getContext('2d'); g.clearRect(0, 0, rc.width, rc.height); g.drawImage(R.base, 0, 0); };
  $('#rApply').onclick = async () => { $('#refineModal').hidden = true; const c = document.createElement('canvas'); c.width = rc.width; c.height = rc.height; c.getContext('2d').drawImage(rc, 0, 0); await replaceImage(R.o, c, { pristine: R.orig }); toast('Edges refined', '🖌️'); };
  $('#refine').onclick = () => openRefine();

  /* wire the inspector quick buttons */
  $$('[data-pm]').forEach(b => b.onclick = () => ({ removeBg, magicFix, enhance, refine: openRefine })[b.dataset.pm]());
  $('#magicFix').onclick = () => magicFix(); $('#enhance').onclick = () => enhance();

  /* ================= stock photo search ================= */
  let keys = {}; try { keys = JSON.parse(localStorage.getItem('chitra.keys') || '{}'); } catch { }
  const saveKeys = () => { try { localStorage.setItem('chitra.keys', JSON.stringify(keys)); } catch { } };
  const SOURCES = {
    openverse: {
      name: 'Openverse', key: false,
      async search(q, page) {
        const r = await fetch(`https://api.openverse.org/v1/images/?q=${enc(q)}&page=${page}&page_size=24&license_type=commercial&mature=false`);
        if (!r.ok) throw new Error('Openverse ' + r.status); const j = await r.json();
        return { more: page < j.page_count, items: j.results.map(x => ({ id: x.id, thumb: x.thumbnail || x.url, full: x.url, by: x.creator || 'Unknown', lic: `CC ${String(x.license).toUpperCase()}${x.license_version ? ' ' + x.license_version : ''}`, link: x.foreign_landing_url })) };
      },
    },
    pixabay: {
      name: 'Pixabay', key: true, link: 'https://pixabay.com/api/docs/',
      async search(q, page) {
        const r = await fetch(`https://pixabay.com/api/?key=${enc(keys.pixabay)}&q=${enc(q)}&page=${page}&per_page=24&safesearch=true&image_type=all`);
        if (!r.ok) throw new Error('Pixabay ' + r.status); const j = await r.json();
        return { more: page * 24 < j.totalHits, items: j.hits.map(x => ({ id: x.id, thumb: x.webformatURL, full: x.largeImageURL || x.webformatURL, by: x.user, lic: 'Pixabay licence', link: x.pageURL })) };
      },
    },
    pexels: {
      name: 'Pexels', key: true, link: 'https://www.pexels.com/api/new/',
      async search(q, page) {
        const r = await fetch(`https://api.pexels.com/v1/search?query=${enc(q)}&page=${page}&per_page=24`, { headers: { Authorization: keys.pexels } });
        if (!r.ok) throw new Error('Pexels ' + r.status); const j = await r.json();
        return { more: !!j.next_page, items: j.photos.map(x => ({ id: x.id, thumb: x.src.medium, full: x.src.large2x || x.src.large, by: x.photographer, lic: 'Pexels licence', link: x.url })) };
      },
    },
    unsplash: {
      name: 'Unsplash', key: true, link: 'https://unsplash.com/developers',
      async search(q, page) {
        const r = await fetch(`https://api.unsplash.com/search/photos?query=${enc(q)}&page=${page}&per_page=24&client_id=${enc(keys.unsplash)}`);
        if (!r.ok) throw new Error('Unsplash ' + r.status); const j = await r.json();
        return { more: page < j.total_pages, items: j.results.map(x => ({ id: x.id, thumb: x.urls.small, full: x.urls.regular, by: x.user.name, lic: 'Unsplash licence', link: x.links.html })) };
      },
    },
  };
  const CHIPS = ['Texture', 'Nature', 'Abstract', 'Pattern', 'Neon', 'Food', 'Animals', 'Vintage', 'Flowers', 'City'];
  $('#photoChips').innerHTML = CHIPS.map(c => `<button type="button" class="chip">${c}</button>`).join('');
  let ps = { q: '', page: 1 };
  function syncKeyBox() {
    const s = SOURCES[$('#photoSource').value];
    $('#keyBox').hidden = !s.key || !!keys[$('#photoSource').value];
    if (s.key) { $('#keyLink').href = s.link; $('#keyInput').value = ''; }
  }
  $('#photoSource').onchange = () => { syncKeyBox(); if (ps.q) runSearch(1); };
  $('#keySave').onclick = () => { const v = $('#keyInput').value.trim(); if (!v) return; keys[$('#photoSource').value] = v; saveKeys(); syncKeyBox(); toast('Key saved in this browser', '🔑'); if (ps.q) runSearch(1); };
  async function runSearch(page = 1) {
    const srcId = $('#photoSource').value, s = SOURCES[srcId];
    if (s.key && !keys[srcId]) { syncKeyBox(); return toast(`${s.name} needs a free API key`, '🔑'); }
    ps.page = page; const grid = $('#photoGrid'); if (page === 1) grid.innerHTML = '<p class="tip">Searching…</p>';
    try {
      const { items, more } = await s.search(ps.q, page);
      if (page === 1) grid.innerHTML = '';
      if (!items.length && page === 1) grid.innerHTML = '<p class="tip">No results. Try another word.</p>';
      items.forEach(it => {
        const b = document.createElement('button'); b.className = 'photo-card'; b.title = `${it.by} · ${it.lic}`;
        b.innerHTML = `<img loading="lazy" alt=""><span></span>`; $('img', b).src = it.thumb; $('span', b).textContent = it.lic;
        b.onclick = () => addPhoto(it); grid.appendChild(b);
      });
      $('#photoMore').hidden = !more;
    } catch (e) {
      console.warn(e); if (page === 1) $('#photoGrid').innerHTML = '';
      toast(/40[13]/.test(e.message) ? 'That API key was rejected — check it' : 'Could not reach the photo service', '⚠️');
    }
  }
  $('#photoForm').onsubmit = e => { e.preventDefault(); ps.q = $('#photoQ').value.trim(); if (ps.q) runSearch(1); };
  $('#photoMore').onclick = () => runSearch(ps.page + 1);
  $$('#photoChips .chip').forEach(c => c.onclick = () => { $('#photoQ').value = c.textContent; ps.q = c.textContent; runSearch(1); });
  function addToCanvas(img, note) {
    const k = Math.min((C.W * 0.8) / img.width, (C.H * 0.8) / img.height, 1);
    img.set({ adj: C.DEFAULT_ADJ() }).scale(k); C.place(img); toast(note, '🌄'); return img;
  }
  function addPhoto(it) {
    const job = busy('Adding photo…');
    fabric.Image.fromURL(it.full, (img, err) => {
      if (err || !img.getElement()?.width) {
        fabric.Image.fromURL(it.thumb, (im2, err2) => {
          job.done(); if (err2) return toast('That photo could not be loaded', '⚠️');
          addToCanvas(im2, 'Added (low-res preview — try Enhance 2×)');
        }, { crossOrigin: 'anonymous' });
        return;
      }
      job.done(); addToCanvas(img, `Photo by ${it.by} · ${it.lic}`);
    }, { crossOrigin: 'anonymous' });
  }
  $('#photoSource').value = 'openverse'; syncKeyBox();

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
      sg.lineWidth = 14 + r() * 26; sg.strokeStyle = `rgba(0,0,0,${0.05 + r() * 0.07})`; sg.beginPath(); sg.moveTo(x, y0); sg.quadraticCurveTo(x + bend, y0 + len / 2, x + bend * 0.4, y0 + len); sg.stroke();
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
  function drawMug(g) {
    const cx = 450, R = 180, top = 230, bot = 650, ry = 28, col = M.color;
    // floor shadow
    g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; blur(g, 16); g.beginPath(); g.ellipse(cx + 20, bot + 18, 230, 34, 0, 0, Math.PI * 2); g.fill(); noTint(g); g.restore();
    // handle
    g.save(); g.lineCap = 'round';
    g.strokeStyle = shade(col, -0.12); g.lineWidth = 46; g.beginPath(); g.arc(cx + R + 5, 440, 98, -1.25, 1.25); g.stroke();
    g.strokeStyle = shade(col, 0.18); g.lineWidth = 12; g.beginPath(); g.arc(cx + R + 5, 440, 105, -1.1, 0.9); g.stroke(); g.restore();
    // body
    const body = new Path2D(); body.moveTo(cx - R, top); body.lineTo(cx - R, bot); body.ellipse(cx, bot, R, ry, 0, Math.PI, 0, true); body.lineTo(cx + R, top); body.ellipse(cx, top, R, ry, 0, 0, Math.PI, true); body.closePath();
    g.fillStyle = col; g.fill(body);
    g.save(); g.clip(body);
    // wrap the artwork around the cylinder (per-column projection)
    const arcFrac = 2 * Math.PI * 0.9, srcPer = M.art.width / arcFrac, dh = Math.min(400, 2 * Math.PI * 0.9 * R * (M.art.height / M.art.width)), y0 = (top + bot) / 2 - dh / 2 + 6;
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
    backdrop(g); (M.kind === 'mug' ? drawMug : drawShirt)(g);
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
      const id = $('#photoSource').value, s = SOURCES[id].key && !keys[id] ? SOURCES.openverse : SOURCES[id], box = $('#sceneResults'); box.innerHTML = '<p class="tip">Searching…</p>';
      try {
        const { items } = await s.search(q, 1); box.innerHTML = '';
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
  function openMockup() { buildMockUI(); if (M.kind !== 'photo') M.kind = C.guide === 'mug' ? 'mug' : 'shirt'; $('#mockup').hidden = false; drawMockup(); }
  $('#mockupBtn').onclick = openMockup;

  Object.assign(C, { openMockup, removeBg, magicFix, enhance, refine: openRefine, imgOutline, replaceImage, natCanvas, SOURCES });
})();
