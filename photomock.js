/* Chitra Studio – PHOTO MOCKUPS. Put any design on a REAL product photo, the way Canva / Placeit do:
   1. pick a blank product photo (your own, searched online, or AI-made),  2. drag the 4 corners of the print area,
   3. your artwork is warped onto it in perspective (optionally wrapped round a cylinder for mugs / bottles) and re-lit with the photo's own
   shadows and highlights, so it looks printed on the product.  Mockups can be saved and re-used with any new design.
   Engine: C.photoMock.render(baseImage, artCanvas, spec). */
(() => {
  const C = window.chitra; if (!C) return;
  const { $, $$, toast, ico, kv } = C;

  /* ============================== engine ============================== */
  // homography from the unit square (tl,tr,br,bl order) to a quad (Heckbert)
  function squareToQuad(q) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) return { a: x1 - x0, b: x3 - x0, c: x0, d: y1 - y0, e: y3 - y0, f: y0, g: 0, h: 0 };
    const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, den = dx1 * dy2 - dx2 * dy1, g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den;
    return { a: x1 - x0 + g * x1, b: x3 - x0 + h * x3, c: x0, d: y1 - y0 + g * y1, e: y3 - y0 + h * y3, f: y0, g, h };
  }
  const mapUV = (H, u, v) => { const w = H.g * u + H.h * v + 1; return [(H.a * u + H.b * v + H.c) / w, (H.d * u + H.e * v + H.f) / w]; };
  // draw triangle (s0,s1,s2 in source px) onto (d0,d1,d2) with an affine transform
  function tri(g, img, s, d) {
    const [[sx0, sy0], [sx1, sy1], [sx2, sy2]] = s, [[dx0, dy0], [dx1, dy1], [dx2, dy2]] = d, den = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1); if (Math.abs(den) < 1e-9) return;
    const a = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / den, b = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / den,
      c = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / den, dd = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / den,
      e = (dx0 * (sx1 * sy2 - sx2 * sy1) + dx1 * (sx2 * sy0 - sx0 * sy2) + dx2 * (sx0 * sy1 - sx1 * sy0)) / den, f = (dy0 * (sx1 * sy2 - sx2 * sy1) + dy1 * (sx2 * sy0 - sx0 * sy2) + dy2 * (sx0 * sy1 - sx1 * sy0)) / den;
    const cx = (dx0 + dx1 + dx2) / 3, cy = (dy0 + dy1 + dy2) / 3, grow = p => [p[0] + Math.sign(p[0] - cx) * 0.6, p[1] + Math.sign(p[1] - cy) * 0.6]; // tiny overlap hides seams
    g.save(); g.beginPath(); [d[0], d[1], d[2]].map(grow).forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip(); g.transform(a, b, c, dd, e, f); g.drawImage(img, 0, 0); g.restore();
  }
  /* warp `art` into the quad (perspective, optional cylinder wrap) on a transparent canvas the size of the base photo */
  function warpArt(art, W, H, quad, { curve = 0, cols = 48, rows = 16 } = {}) {
    const out = document.createElement('canvas'); out.width = W; out.height = H; const g = out.getContext('2d'), Hm = squareToQuad(quad), aw = art.width, ah = art.height;
    g.imageSmoothingQuality = 'high'; const A = curve, uOf = s => (A > 0.01 ? 0.5 + Math.sin((s - 0.5) * A) / (2 * Math.sin(A / 2)) : s); // cylinder: the picture bends away at the sides
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const s0 = i / cols, s1 = (i + 1) / cols, v0 = j / rows, v1 = (j + 1) / rows, P = (s, v) => mapUV(Hm, uOf(s), v), S = (s, v) => [s * aw, v * ah];
      const p00 = P(s0, v0), p10 = P(s1, v0), p11 = P(s1, v1), p01 = P(s0, v1);
      tri(g, art, [S(s0, v0), S(s1, v0), S(s1, v1)], [p00, p10, p11]); tri(g, art, [S(s0, v0), S(s1, v1), S(s0, v1)], [p00, p11, p01]);
    }
    return out;
  }
  const lumOfImage = (c, quad) => { // average brightness inside the print area decides multiply (light products) or normal (dark products)
    const x = Math.min(...quad.map(p => p[0])), y = Math.min(...quad.map(p => p[1])), w = Math.max(...quad.map(p => p[0])) - x, h = Math.max(...quad.map(p => p[1])) - y; const t = document.createElement('canvas'); t.width = t.height = 24;
    const g = t.getContext('2d', { willReadFrequently: true }); g.drawImage(c, x, y, Math.max(1, w), Math.max(1, h), 0, 0, 24, 24); const d = g.getImageData(0, 0, 24, 24).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; return s / 576;
  };
  /* spec: { quad:[[x,y]x4 in base-photo px, tl tr br bl], curve:0..2 rad, opacity:0..1, shade:0..1, blur:px, blend:'auto'|'multiply'|'normal', fit:'contain'|'cover', aspect?: w/h of the print area } */
  function render(base, art, spec, out) {
    const W = base.naturalWidth || base.width, H = base.naturalHeight || base.height, q = spec.quad, o = { curve: 0, opacity: 0.96, shade: 0.55, blur: 0.5, blend: 'auto', fit: 'contain', ...spec };
    const edge = (a, b) => Math.hypot(q[a][0] - q[b][0], q[a][1] - q[b][1]), pw = (edge(0, 1) + edge(3, 2)) / 2, ph = (edge(0, 3) + edge(1, 2)) / 2, quadAspect = o.aspect || pw / ph; // print-area proportions
    // fit the artwork inside the unit square without distorting it
    const aa = art.width / art.height, fit = document.createElement('canvas'); let fw, fh;
    if (o.fit === 'cover') { fw = Math.max(art.width, art.height * quadAspect); fh = fw / quadAspect; } else { fh = Math.max(art.height, art.width / quadAspect); fw = fh * quadAspect; }
    fit.width = Math.round(fw); fit.height = Math.round(fh); const fg = fit.getContext('2d'); fg.imageSmoothingQuality = 'high'; if (o.fit === 'cover') { const s = Math.max(fw / art.width, fh / art.height); fg.drawImage(art, (fw - art.width * s) / 2, (fh - art.height * s) / 2, art.width * s, art.height * s); } else fg.drawImage(art, (fw - art.width) / 2, (fh - art.height) / 2); void aa;
    const warped = warpArt(fit, W, H, q, { curve: o.curve });
    const res = out || document.createElement('canvas'); res.width = W; res.height = H; const g = res.getContext('2d'); g.drawImage(base, 0, 0, W, H);
    const light = o.blend === 'multiply' || (o.blend === 'auto' && lumOfImage(res, q) > 0.5);
    // 1. ink: multiply keeps the cloth's shadows & folds on light products; normal paint for dark products
    const ink = document.createElement('canvas'); ink.width = W; ink.height = H; const ig = ink.getContext('2d'); if (o.blur > 0) ig.filter = `blur(${o.blur}px)`; ig.drawImage(warped, 0, 0); ig.filter = 'none';
    g.save(); g.globalAlpha = o.opacity; g.globalCompositeOperation = light ? 'multiply' : 'source-over'; g.drawImage(ink, 0, 0); g.restore();
    // 2. relight: the photo's own light/dark (folds, curvature, glare) is laid back over the print, only where the print is
    if (o.shade > 0) {
      const sh = document.createElement('canvas'); sh.width = W; sh.height = H; const sg = sh.getContext('2d'); sg.filter = 'grayscale(1) contrast(1.35) brightness(1.02)'; sg.drawImage(base, 0, 0, W, H); sg.filter = 'none'; sg.globalCompositeOperation = 'destination-in'; sg.drawImage(ink, 0, 0);
      g.save(); g.globalAlpha = o.shade * (light ? 0.5 : 0.8); g.globalCompositeOperation = 'soft-light'; g.drawImage(sh, 0, 0); g.restore();
    }
    return res;
  }
  C.photoMock = { render, warpArt, squareToQuad, mapUV };

  /* ============================== saved mockups ============================== */
  const IDX = 'pmocks';
  const list = async () => (await kv.get(IDX).catch(() => null)) || [];
  async function saveMock(rec, blob) { const l = (await list()).filter(x => x.id !== rec.id); l.unshift(rec); await kv.set('pmb:' + rec.id, blob); await kv.set(IDX, l.slice(0, 60)); document.dispatchEvent(new Event('chitra:pmocks')); }
  const loadBase = async id => { const b = await kv.get('pmb:' + id); return b ? imgFromBlob(b) : null; };
  const imgFromBlob = blob => new Promise((res, rej) => { const u = URL.createObjectURL(blob), im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('image')); im.src = u; });
  C.photoMock.list = list;

  /* ============================== studio UI ============================== */
  const PRODUCTS = [ // [key, label, search words, default quad (fractions of the photo), curve, AI prompt]
    ['shirt', 'T-shirt', 'blank white t-shirt', [[.34, .28], [.66, .28], [.66, .56], [.34, .56]], 0, 'blank plain white cotton t-shirt laid flat, front view, soft studio lighting, product photo, no text, no logo, plain light background'],
    ['hoodie', 'Hoodie', 'blank hoodie', [[.35, .36], [.65, .36], [.65, .6], [.35, .6]], 0, 'blank plain black hoodie, front view, studio product photo, no text, no logo, plain grey background'],
    ['mug', 'Mug', 'blank white mug', [[.36, .33], [.6, .33], [.6, .68], [.36, .68]], 1.5, 'blank plain white ceramic mug, handle on the right, studio product photo on a light wooden table, soft shadow, no text, no logo'],
    ['tote', 'Tote bag', 'blank tote bag', [[.32, .4], [.68, .4], [.68, .72], [.32, .72]], 0, 'blank plain natural canvas tote bag hanging on a wall, studio product photo, no text, no logo'],
    ['poster', 'Poster frame', 'blank poster frame wall', [[.3, .2], [.7, .2], [.7, .7], [.3, .7]], 0, 'blank empty white picture frame hanging on a clean wall in a bright interior, product photo, no artwork'],
    ['case', 'Phone case', 'blank phone case', [[.4, .22], [.6, .22], [.6, .78], [.4, .78]], 0, 'blank plain white phone case back, studio product photo, soft light, no text'],
    ['pillow', 'Pillow', 'blank pillow cushion sofa', [[.3, .3], [.7, .3], [.7, .7], [.3, .7]], 0, 'blank plain white square cushion on a sofa, cozy interior, product photo, no pattern'],
    ['cap', 'Cap', 'blank baseball cap', [[.4, .3], [.6, .3], [.6, .46], [.4, .46]], .4, 'blank plain white baseball cap, front view, studio product photo, no text, no logo'],
    ['notebook', 'Notebook', 'blank notebook cover mockup', [[.3, .2], [.7, .2], [.7, .8], [.3, .8]], 0, 'blank plain notebook with a clean cover on a desk, studio product photo, no text'],
    ['bottle', 'Bottle', 'blank water bottle', [[.4, .35], [.6, .35], [.6, .7], [.4, .7]], 1.3, 'blank plain white stainless water bottle, studio product photo, no text, no logo'],
  ];
  const m = Object.assign(document.createElement('div'), { className: 'modal', id: 'pmStudio', hidden: true }); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="sheet wide-sheet pm"><button class="x" aria-label="Close">${ico('x', 18)}</button><h1>Photo mockup</h1>
    <div class="pm-body">
      <div class="pm-stage"><canvas id="pmCanvas" width="900" height="900"></canvas><canvas id="pmOver" width="900" height="900"></canvas><div class="pm-empty" id="pmEmpty"><b>Start with a product photo</b><span>Upload one, search online, or let AI make a blank product photo.</span></div></div>
      <div class="pm-side">
        <h4 style="margin-top:0">1 · Product photo</h4>
        <div class="chips" id="pmProd"></div>
        <div class="row2"><label class="btn" for="pmFile">${ico('upload', 16)} Upload</label><button class="btn" id="pmFind">${ico('search', 16)} Find online</button></div>
        <button class="btn wide" id="pmAI" style="margin-top:8px">${ico('sparkles', 16)} Make a blank product photo with AI</button><input type="file" id="pmFile" accept="image/*" hidden>
        <h4>2 · Your artwork</h4>
        <div class="row2"><button class="btn on" id="pmArtDesign">This design</button><label class="btn" for="pmArtFile">Upload art</label></div><input type="file" id="pmArtFile" accept="image/*" hidden>
        <p class="tip">Drag the 4 purple corners onto the product's print area.</p>
        <label class="slider-row">Wrap (mugs, bottles) <input type="range" id="pmCurve" min="0" max="200" value="0"></label>
        <label class="slider-row">Ink strength <input type="range" id="pmOpacity" min="40" max="100" value="96"></label>
        <label class="slider-row">Fabric &amp; light <input type="range" id="pmShade" min="0" max="100" value="55"></label>
        <label class="slider-row">Soften edges <input type="range" id="pmBlur" min="0" max="30" value="5"></label>
        <label class="slider-row">Fill <select id="pmFit"><option value="contain">Fit inside</option><option value="cover">Fill the area</option></select></label>
        <button class="btn wide" id="pmReset">Reset print area</button>
        <button class="cta wide" id="pmAdd" style="margin-top:10px">${ico('plus', 16)} Add to my design</button>
        <div class="row2" style="margin-top:8px"><button class="btn" id="pmSave">${ico('save', 16)} Save mockup</button><button class="btn" id="pmDl">${ico('download', 16)} PNG</button></div>
        <div id="pmPackBox" hidden><h4>Ready-made photo mockups</h4><div class="pm-mine" id="pmPack"></div></div>
        <h4>My mockups <button class="btn small" id="pmExport" style="margin-left:8px" title="Owner: download all your saved mockups as a pack to publish for every customer">Export pack</button></h4><div class="pm-mine" id="pmMine"></div>
      </div>
    </div>
    <div class="pm-pick" id="pmPick" hidden><div class="pm-pick-head"><b id="pmPickT">Find a product photo</b><button class="btn small" id="pmPickX">Close</button></div><div class="chips" id="pmPickChips"></div><div class="photo-grid" id="pmPickGrid"></div><button class="btn wide" id="pmPickMore" hidden>Load more</button><p class="tip" id="pmPickNote"></p></div>
  </div>`;
  document.body.appendChild(m);
  const S = { base: null, baseBlob: null, name: 'Photo mockup', quad: null, art: null, artIsDesign: true, kind: 'shirt', id: null, scale: 1, busy: false };
  const cv = $('#pmCanvas', m), ov = $('#pmOver', m), cg = cv.getContext('2d'), og = ov.getContext('2d');
  const close = () => { m.hidden = true; }; $('.x', m).onclick = close; m.addEventListener('mousedown', e => { if (e.target === m) close(); });
  const spec = () => ({ quad: S.quad, curve: +$('#pmCurve', m).value / 100, opacity: +$('#pmOpacity', m).value / 100, shade: +$('#pmShade', m).value / 100, blur: +$('#pmBlur', m).value / 10, fit: $('#pmFit', m).value, kind: S.kind });
  $('#pmProd', m).innerHTML = PRODUCTS.map(p => `<button class="chip${p[0] === S.kind ? ' on' : ''}" data-k="${p[0]}">${p[1]}</button>`).join('');

  function artCanvas() {
    if (S.art) return S.art;
    if (!C.canvas.getObjects().length) { // nothing designed yet: show a sample so the effect is visible
      const c = document.createElement('canvas'); c.width = 1200; c.height = 800; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 1200, 800); gr.addColorStop(0, '#7c3aed'); gr.addColorStop(1, '#f472b6'); g.fillStyle = gr; g.fillRect(0, 0, 1200, 800);
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 170px system-ui,sans-serif'; g.fillText('YOUR', 600, 380); g.fillText('DESIGN', 600, 560); return c;
    }
    try { return C.renderDesign(false); } catch { toast('This design uses an image that blocks export — upload your art instead', '⚠️'); return null; }
  }
  let raf = 0; const draw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
  function paint() {
    if (!S.base) { cg.clearRect(0, 0, cv.width, cv.height); og.clearRect(0, 0, ov.width, ov.height); $('#pmEmpty', m).hidden = false; return; }
    $('#pmEmpty', m).hidden = true; const W = S.base.width, H = S.base.height; if (cv.width !== W || cv.height !== H) { cv.width = ov.width = W; cv.height = ov.height = H; }
    const art = artCanvas(); if (art) render(S.base, art, spec(), cv); else { cg.drawImage(S.base, 0, 0); }
    og.clearRect(0, 0, W, H); const q = S.quad, r = Math.max(10, W / 80); og.lineWidth = Math.max(2, W / 450); og.strokeStyle = '#6d4aff'; og.fillStyle = 'rgba(109,74,255,.08)';
    og.beginPath(); q.forEach((p, i) => (i ? og.lineTo(p[0], p[1]) : og.moveTo(p[0], p[1]))); og.closePath(); og.setLineDash([r, r * .6]); og.stroke(); og.setLineDash([]);
    q.forEach(p => { og.beginPath(); og.arc(p[0], p[1], r, 0, 7); og.fillStyle = '#fff'; og.fill(); og.stroke(); });
  }
  function defaultQuad() { const p = PRODUCTS.find(x => x[0] === S.kind), W = S.base.width, H = S.base.height; S.quad = p[3].map(([x, y]) => [x * W, y * H]); $('#pmCurve', m).value = Math.round(p[4] * 100); }
  async function setBase(imgOrBlob, name) {
    const im = imgOrBlob instanceof Blob ? await imgFromBlob(imgOrBlob) : imgOrBlob, k = Math.min(1, 1600 / Math.max(im.naturalWidth || im.width, im.naturalHeight || im.height)), c = document.createElement('canvas');
    c.width = Math.round((im.naturalWidth || im.width) * k); c.height = Math.round((im.naturalHeight || im.height) * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    S.base = c; S.baseBlob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92)); S.name = name || 'Photo mockup'; S.id = null; defaultQuad(); draw(); setTimeout(() => $('#pmPick', m).hidden = true, 0);
  }
  /* dragging the corners */
  let drag = -1; const pos = e => { const b = ov.getBoundingClientRect(); return [(e.clientX - b.left) * ov.width / b.width, (e.clientY - b.top) * ov.height / b.height]; };
  ov.addEventListener('pointerdown', e => { if (!S.quad) return; const [x, y] = pos(e), r = Math.max(26, ov.width / 22); drag = S.quad.findIndex(p => Math.hypot(p[0] - x, p[1] - y) < r); if (drag < 0) { // grabbing inside moves the whole area
      const q = S.quad, inside = x > Math.min(...q.map(p => p[0])) && x < Math.max(...q.map(p => p[0])) && y > Math.min(...q.map(p => p[1])) && y < Math.max(...q.map(p => p[1])); if (inside) { drag = 9; S._o = [x, y]; S._q = q.map(p => [...p]); } } if (drag >= 0) ov.setPointerCapture(e.pointerId); });
  ov.addEventListener('pointermove', e => { if (drag < 0) return; const [x, y] = pos(e); if (drag === 9) { const dx = x - S._o[0], dy = y - S._o[1]; S.quad = S._q.map(p => [p[0] + dx, p[1] + dy]); } else S.quad[drag] = [Math.max(0, Math.min(ov.width, x)), Math.max(0, Math.min(ov.height, y))]; draw(); });
  ov.addEventListener('pointerup', () => { drag = -1; }); ov.style.touchAction = 'none';
  $$('#pmCurve,#pmOpacity,#pmShade,#pmBlur,#pmFit', m).forEach(i => i.addEventListener('input', draw));
  $('#pmReset', m).onclick = () => { if (S.base) { defaultQuad(); draw(); } };
  $('#pmProd', m).onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; S.kind = b.dataset.k; $$('#pmProd .chip', m).forEach(x => x.classList.toggle('on', x === b)); if (S.base) { defaultQuad(); draw(); } };
  $('#pmFile', m).onchange = async e => { const f = e.target.files[0]; if (f) { await setBase(f, f.name.replace(/\.\w+$/, '')); } e.target.value = ''; };
  $('#pmArtFile', m).onchange = async e => { const f = e.target.files[0]; if (!f) return; const im = await imgFromBlob(f), c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); S.art = c; $('#pmArtDesign', m).classList.remove('on'); draw(); e.target.value = ''; };
  $('#pmArtDesign', m).onclick = () => { S.art = null; $('#pmArtDesign', m).classList.add('on'); draw(); };

  /* find a photo online with the app's own stock search (keys / proxy stay private) */
  const pick = $('#pmPick', m); let pq = '', ppage = 1, ptoken = 0;
  async function pickRun(reset) {
    const grid = $('#pmPickGrid', m), more = $('#pmPickMore', m), note = $('#pmPickNote', m), my = ++ptoken; if (reset) { ppage = 1; grid.innerHTML = '<p class="tip">Searching…</p>'; more.hidden = true; note.textContent = ''; }
    try { const r = await C.stock.search(pq, { page: ppage, kind: 'photo' }); if (my !== ptoken) return; if (reset) grid.innerHTML = ''; if (r.notConnected) { note.textContent = 'The photo library is not connected — upload a photo instead.'; return; }
      r.items.forEach(it => { const b = document.createElement('button'); b.className = 'photo-card'; b.innerHTML = '<img loading="lazy" alt="">'; $('img', b).src = it.thumb; b.onclick = async () => { b.style.opacity = .5; try { const blob = await (await fetch(it.full)).blob(); await setBase(blob, it.title || 'Product photo'); S.credit = { site: it.site, by: it.by, link: it.link, title: it.title }; } catch { try { const im = new Image(); im.crossOrigin = 'anonymous'; im.src = it.full; await im.decode(); await setBase(im, it.title); } catch { toast('That photo could not be loaded', '⚠️'); } } b.style.opacity = 1; }; grid.appendChild(b); });
      more.hidden = !r.more; } catch (e) { console.warn(e); if (my === ptoken && reset) grid.innerHTML = '<p class="tip">Could not load photos. Check your connection.</p>'; }
  }
  $('#pmFind', m).onclick = () => { const p = PRODUCTS.find(x => x[0] === S.kind); pick.hidden = false; $('#pmPickChips', m).innerHTML = PRODUCTS.map(x => `<button class="chip${x[0] === S.kind ? ' on' : ''}" data-q="${x[2]} mockup">${x[1]}</button>`).join(''); pq = p[2] + ' mockup'; pickRun(true); };
  $('#pmPickChips', m).onclick = e => { const b = e.target.closest('[data-q]'); if (!b) return; pq = b.dataset.q; $$('#pmPickChips .chip', m).forEach(x => x.classList.toggle('on', x === b)); pickRun(true); };
  $('#pmPickMore', m).onclick = () => { ppage++; pickRun(false); }; $('#pmPickX', m).onclick = () => { pick.hidden = true; };
  /* AI blank product photo: your own ComfyUI when set (owner), else the free cloud generator */
  $('#pmAI', m).onclick = async () => {
    const p = PRODUCTS.find(x => x[0] === S.kind), btn = $('#pmAI', m); btn.disabled = true; btn.textContent = 'Creating the photo… (about 20 s)';
    try { const blob = await C.aiImage(p[5], { w: 1024, h: 1024 }); await setBase(blob, p[1] + ' (AI photo)'); toast('Now drag the corners onto the print area', ''); } catch (e) { console.warn(e); toast('The AI image service is busy — try again, or upload a photo', '⚠️'); }
    btn.disabled = false; btn.innerHTML = `${ico('sparkles', 16)} Make a blank product photo with AI`;
  };
  const finalCanvas = () => { const art = artCanvas(); if (!art || !S.base) return null; return render(S.base, art, spec()); };
  $('#pmAdd', m).onclick = () => {
    const c = finalCanvas(); if (!c) return toast('Pick a product photo first', '☝️'); if (document.body.classList.contains('on-home')) C.newDocument({ w: c.width, h: c.height, dpi: 96, guide: 'none', template: 'blank', name: S.name }).then(put); else put();
    function put() { fabric.Image.fromURL(c.toDataURL('image/jpeg', 0.92), img => { const k = Math.min((C.W * 0.9) / img.width, (C.H * 0.9) / img.height); img.set({ adj: C.DEFAULT_ADJ(), pmock: { id: S.id } }).scale(k); if (S.credit) img.credit = S.credit; C.place(img); close(); toast('Mockup added — it is a normal picture you can resize and crop', ''); }); }
  };
  $('#pmDl', m).onclick = () => { const c = finalCanvas(); if (!c) return toast('Pick a product photo first', '☝️'); const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = (S.name || 'mockup').replace(/[^\w-]+/g, '-') + '.png'; a.click(); };
  $('#pmSave', m).onclick = async () => {
    if (!S.base) return toast('Pick a product photo first', '☝️'); const id = S.id || C.uid(), t = document.createElement('canvas'), k = 260 / Math.max(S.base.width, S.base.height); t.width = Math.round(S.base.width * k); t.height = Math.round(S.base.height * k);
    const c = finalCanvas() || S.base; t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); S.id = id;
    await saveMock({ id, name: S.name, thumb: t.toDataURL('image/jpeg', 0.8), spec: { ...spec(), quad: S.quad }, kind: S.kind, w: S.base.width, h: S.base.height, credit: S.credit || null }, S.baseBlob); toast('Mockup saved — find it under My mockups', ''); renderMine();
  };
  async function renderMine() {
    const l = await list(), box = $('#pmMine', m); box.innerHTML = l.length ? l.map(x => `<button class="pm-card" data-id="${x.id}" title="${(x.name || '').replace(/"/g, '')}"><img src="${x.thumb}" alt=""><span>${(x.name || 'Mockup').replace(/</g, '&lt;')}</span><i data-del="${x.id}" title="Delete">×</i></button>`).join('') : '<p class="tip">Saved mockups appear here. Re-use them with any new design.</p>';
    box.onclick = async e => { const d = e.target.closest('[data-del]'); if (d) { e.stopPropagation(); if (!(await C.ask('Delete this mockup?', '', 'Delete'))) return; const nl = (await list()).filter(x => x.id !== d.dataset.del); await kv.set(IDX, nl); await kv.del('pmb:' + d.dataset.del).catch(() => { }); renderMine(); return; }
      const c = e.target.closest('[data-id]'); if (!c) return; const rec = (await list()).find(x => x.id === c.dataset.id), im = await loadBase(rec.id); if (!im) return toast('That mockup photo is missing', '⚠️'); const bc = document.createElement('canvas'); bc.width = im.naturalWidth; bc.height = im.naturalHeight; bc.getContext('2d').drawImage(im, 0, 0);
      S.base = bc; S.baseBlob = await kv.get('pmb:' + rec.id); S.name = rec.name; S.id = rec.id; S.kind = rec.kind || 'shirt'; S.quad = rec.spec.quad.map(p => [...p]); S.credit = rec.credit || undefined;
      $('#pmCurve', m).value = Math.round(rec.spec.curve * 100); $('#pmOpacity', m).value = Math.round(rec.spec.opacity * 100); $('#pmShade', m).value = Math.round(rec.spec.shade * 100); $('#pmBlur', m).value = Math.round(rec.spec.blur * 10); $('#pmFit', m).value = rec.spec.fit || 'contain'; $$('#pmProd .chip', m).forEach(x => x.classList.toggle('on', x.dataset.k === S.kind)); draw(); };
  }
  /* ---- ready-made pack (data/mockups/index.json + mockups/*.jpg, published with the site) ---- */
  const BASEURL = () => (window.CHITRA_CONFIG || {}).assetBase || '';
  async function renderPack() {
    let idx; try { idx = await (await fetch(BASEURL() + 'data/mockups/index.json', { cache: 'no-cache' })).json(); } catch { return; } const items = idx.mockups || []; $('#pmPackBox', m).hidden = !items.length; if (!items.length) return;
    const box = $('#pmPack', m); box.innerHTML = items.map(x => `<button class="pm-card" data-pk="${x.id}" title="${(x.name || '').replace(/"/g, '')}"><img loading="lazy" alt="" src="${BASEURL()}${x.thumb || x.file}"><span>${(x.name || 'Mockup').replace(/</g, '&lt;')}</span></button>`).join('');
    box.onclick = async e => { const c = e.target.closest('[data-pk]'); if (!c) return; const x = items.find(i => i.id === c.dataset.pk); try { const im = new Image(); im.crossOrigin = 'anonymous'; im.src = BASEURL() + x.file; await im.decode(); await setBase(im, x.name); S.kind = x.kind || 'shirt'; const W = S.base.width, H = S.base.height; S.quad = x.quad.map(([px, py]) => [px * W, py * H]); S.credit = x.credit || undefined;
        $('#pmCurve', m).value = Math.round((x.curve || 0) * 100); $('#pmOpacity', m).value = Math.round((x.opacity ?? 0.96) * 100); $('#pmShade', m).value = Math.round((x.shade ?? 0.55) * 100); $('#pmBlur', m).value = Math.round((x.blur ?? 0.5) * 10); $('#pmFit', m).value = x.fit || 'contain'; $$('#pmProd .chip', m).forEach(b => b.classList.toggle('on', b.dataset.k === S.kind)); draw(); } catch { toast('That mockup photo could not be loaded', '⚠️'); } };
  }
  /* owner: export every saved mockup as a publishable pack (zip with mockups/*.jpg + data/mockups/index.json) */
  $('#pmExport', m).onclick = async () => {
    const l = await list(); if (!l.length) return toast('Save a mockup first (My mockups)', '☝️');
    if (!window.JSZip) await new Promise((res, rej) => { const sc = Object.assign(document.createElement('script'), { src: 'studio/vendor/jszip.min.js', onload: res, onerror: rej }); document.head.appendChild(sc); });
    const zip = new window.JSZip(), idx = { v: 1, mockups: [] };
    for (const r of l) { const b = await kv.get('pmb:' + r.id); if (!b) continue; zip.file(`mockups/${r.id}.jpg`, b); const t = r.thumb.split(',')[1]; zip.file(`mockups/${r.id}_t.jpg`, t, { base64: true });
      idx.mockups.push({ id: r.id, name: r.name, kind: r.kind, file: `mockups/${r.id}.jpg`, thumb: `mockups/${r.id}_t.jpg`, quad: r.spec.quad.map(([x, y]) => [+(x / r.w).toFixed(4), +(y / r.h).toFixed(4)]), curve: r.spec.curve, opacity: r.spec.opacity, shade: r.spec.shade, blur: r.spec.blur, fit: r.spec.fit, credit: r.credit || undefined }); }
    zip.file('data/mockups/index.json', JSON.stringify(idx, null, 1)); const blob = await zip.generateAsync({ type: 'blob' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chitra-mockup-pack.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Pack downloaded — unzip it into the repo root and commit', '');
  };
  C.openPhotoMock = async (o = {}) => { renderPack(); m.hidden = false; await renderMine(); if (o.base) await setBase(o.base, o.name); else draw(); };
  C.addCommand && C.addCommand('Photo mockup: put my design on a real product photo', () => C.openPhotoMock());
  C.photoMock.studio = { S, spec, setBase, draw };
})();
