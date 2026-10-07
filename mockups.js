/* Chitra Studio – realistic mockups: many products, textured real-world scenes, your own product photo, AI-generated scenes and
   blank-product photos, shuffle, and a one-click mockup sheet. Replaces the old simple mockup dialog. */
(() => {
  const C = window.chitra; if (!C || !C.mockRender) return;
  const { $, $$, toast, ico } = C, MS = 900, enc = encodeURIComponent;
  const rng = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const mkc = (w = MS, h = MS) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const blurOn = (g, px) => { g.filter = `blur(${px}px)`; }, blurOff = g => { g.filter = 'none'; };
  const COLORS = ['#ffffff', '#f3efe6', '#14110f', '#374151', '#1e3a8a', '#2563eb', '#0f766e', '#065f46', '#7c3aed', '#ff2d95', '#dc2626', '#f97316', '#ffd23f', '#9ca3af', '#f5e6d3', '#8b5a2b'];

  /* ================= scenes (procedural, no downloads) ================= */
  const vignette = (g, a = 0.3) => { const v = g.createRadialGradient(MS / 2, MS / 2, MS * 0.32, MS / 2, MS / 2, MS * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, MS, MS); };
  const speckle = (g, n, a, size = 1.2, seed = 3) => { const r = rng(seed); for (let i = 0; i < n; i++) { g.fillStyle = r() > 0.5 ? `rgba(255,255,255,${a * r()})` : `rgba(0,0,0,${a * r()})`; g.fillRect(r() * MS, r() * MS, size, size); } };
  const grad2 = (a, b, hi = 'rgba(255,255,255,.18)') => g => { const r = g.createRadialGradient(MS / 2, MS * 0.42, 60, MS / 2, MS / 2, MS * 0.8); r.addColorStop(0, a); r.addColorStop(1, b); g.fillStyle = r; g.fillRect(0, 0, MS, MS); const l = g.createLinearGradient(0, 0, MS, MS); l.addColorStop(0, hi); l.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = l; g.fillRect(0, 0, MS, MS); vignette(g, 0.22); };
  const SCENES = [
    { id: 'studio', n: 'Studio', make: grad2('#3d3d5c', '#13131d') }, { id: 'paper', n: 'Soft grey', make: g => { grad2('#f1f1f6', '#cfd1dc')(g); const f = g.createLinearGradient(0, MS * 0.62, 0, MS); f.addColorStop(0, 'rgba(255,255,255,0)'); f.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = f; g.fillRect(0, MS * 0.62, MS, MS); } },
    { id: 'peach', n: 'Peach', make: grad2('#ffdcc8', '#ff9a8b') }, { id: 'mint', n: 'Mint', make: grad2('#d4fbe9', '#74ddc0') }, { id: 'sky', n: 'Sky', make: grad2('#d7ecff', '#78a6ff') }, { id: 'night', n: 'Night', make: grad2('#241552', '#05050c', 'rgba(150,120,255,.14)') },
    {
      id: 'wood', n: 'Wood', make: g => {
        const r = rng(11), pl = 5, ph = MS / pl; for (let i = 0; i < pl; i++) { const y = i * ph, tone = 150 + r() * 36; const gr = g.createLinearGradient(0, y, MS, y); gr.addColorStop(0, `rgb(${tone + 24},${tone - 22},${tone - 78})`); gr.addColorStop(1, `rgb(${tone + 8},${tone - 36},${tone - 92})`); g.fillStyle = gr; g.fillRect(0, y, MS, ph);
          for (let j = 0; j < 70; j++) { const yy = y + r() * ph, amp = r() * 5; g.strokeStyle = `rgba(${r() > .5 ? '55,30,12' : '255,225,190'},${0.05 + r() * 0.1})`; g.lineWidth = 0.5 + r() * 1.6; g.beginPath(); g.moveTo(0, yy); for (let x = 0; x <= MS; x += 60) g.lineTo(x, yy + Math.sin(x / 90 + j) * amp + (r() - .5) * 1.2); g.stroke(); }
          if (r() > 0.45) { const kx = r() * MS, ky = y + ph * (0.3 + r() * 0.4); for (let k = 5; k > 0; k--) { g.strokeStyle = `rgba(60,32,12,${0.1 + (5 - k) * 0.04})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(kx, ky, k * 9, k * 4.6, 0, 0, 7); g.stroke(); } }
          g.fillStyle = 'rgba(30,15,5,.55)'; g.fillRect(0, y, MS, 2.4); g.fillStyle = 'rgba(255,230,200,.18)'; g.fillRect(0, y + 2.4, MS, 1.4); }
        const l = g.createLinearGradient(0, 0, MS, MS); l.addColorStop(0, 'rgba(255,240,215,.28)'); l.addColorStop(.6, 'rgba(255,255,255,0)'); g.fillStyle = l; g.fillRect(0, 0, MS, MS); vignette(g, 0.35);
      },
    },
    {
      id: 'marble', n: 'Marble', make: g => {
        const r = rng(4); const bg = g.createLinearGradient(0, 0, MS, MS); bg.addColorStop(0, '#f7f7f9'); bg.addColorStop(1, '#e3e4ea'); g.fillStyle = bg; g.fillRect(0, 0, MS, MS);
        for (let v = 0; v < 9; v++) { let x = r() * MS, y = r() * MS, a = r() * 6.28; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 46; s++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * 24; y += Math.sin(a) * 24; g.lineTo(x, y); } blurOn(g, v < 3 ? 6 : 1.2); g.strokeStyle = `rgba(${90 + r() * 30},${96 + r() * 30},${112 + r() * 30},${v < 3 ? 0.22 : 0.34})`; g.lineWidth = v < 3 ? 14 + r() * 12 : 1 + r() * 2.4; g.stroke(); blurOff(g); }
        g.fillStyle = g.createRadialGradient(MS * 0.3, MS * 0.2, 0, MS * 0.3, MS * 0.2, MS * 0.9); const lg = g.createRadialGradient(MS * 0.3, MS * 0.2, 0, MS * 0.3, MS * 0.2, MS * 0.9); lg.addColorStop(0, 'rgba(255,255,255,.35)'); lg.addColorStop(1, 'rgba(0,0,0,.08)'); g.fillStyle = lg; g.fillRect(0, 0, MS, MS); speckle(g, 6000, 0.06);
      },
    },
    {
      id: 'concrete', n: 'Concrete', make: g => {
        g.fillStyle = '#9b9da3'; g.fillRect(0, 0, MS, MS); const r = rng(8); blurOn(g, 38); for (let i = 0; i < 44; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.09)'; g.beginPath(); g.arc(r() * MS, r() * MS, 40 + r() * 120, 0, 7); g.fill(); } blurOff(g); speckle(g, 22000, 0.16, 1.4, 9);
        for (let i = 0; i < 9; i++) { g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 0.8; g.beginPath(); let x = r() * MS, y = r() * MS; g.moveTo(x, y); for (let s = 0; s < 10; s++) { x += (r() - .5) * 60; y += (r() - .3) * 40; g.lineTo(x, y); } g.stroke(); } vignette(g, 0.3);
      },
    },
    {
      id: 'linen', n: 'Linen', make: g => {
        g.fillStyle = '#e7dccb'; g.fillRect(0, 0, MS, MS); const r = rng(6); for (let i = 0; i < MS; i += 2) { g.strokeStyle = `rgba(${r() > .5 ? '120,100,70' : '255,250,240'},${0.04 + r() * 0.09})`; g.lineWidth = 1 + r() * 0.8; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + (r() - .5) * 2, MS); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(MS, i + (r() - .5) * 2); g.stroke(); }
        speckle(g, 9000, 0.08); const l = g.createLinearGradient(0, 0, MS, MS); l.addColorStop(0, 'rgba(255,255,255,.3)'); l.addColorStop(1, 'rgba(0,0,0,.1)'); g.fillStyle = l; g.fillRect(0, 0, MS, MS); vignette(g, 0.2);
      },
    },
    {
      id: 'sunlit', n: 'Sunlit wall', make: g => {
        const bg = g.createLinearGradient(0, 0, MS, MS); bg.addColorStop(0, '#f6ede0'); bg.addColorStop(1, '#e2d3bf'); g.fillStyle = bg; g.fillRect(0, 0, MS, MS); const r = rng(14);
        blurOn(g, 16); g.fillStyle = 'rgba(255,252,240,.55)'; [[-60, 0], [260, 0], [560, 0]].forEach(([x]) => { g.beginPath(); g.moveTo(x + 140, -40); g.lineTo(x + 330, -40); g.lineTo(x + 330 + 360, MS + 40); g.lineTo(x + 140 + 360, MS + 40); g.closePath(); g.fill(); }); blurOff(g);
        blurOn(g, 7); for (let i = 0; i < 26; i++) { g.save(); g.translate(560 + r() * 330, 80 + r() * 520); g.rotate(r() * 6.28); g.fillStyle = `rgba(60,45,30,${0.07 + r() * 0.1})`; g.beginPath(); g.ellipse(0, 0, 70 + r() * 60, 18 + r() * 14, 0, 0, 7); g.fill(); g.restore(); } blurOff(g); speckle(g, 7000, 0.05); vignette(g, 0.18);
      },
    },
    { id: 'kraft', n: 'Kraft paper', make: g => { g.fillStyle = '#c8a572'; g.fillRect(0, 0, MS, MS); const r = rng(2); for (let i = 0; i < 1400; i++) { g.strokeStyle = `rgba(${r() > .5 ? '90,60,25' : '255,235,200'},${0.05 + r() * 0.08})`; g.lineWidth = 0.6; const x = r() * MS, y = r() * MS, a = r() * 6.28, l = 6 + r() * 26; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } blurOn(g, 30); for (let i = 0; i < 14; i++) { g.fillStyle = r() > .5 ? 'rgba(255,240,210,.18)' : 'rgba(60,35,10,.12)'; g.beginPath(); g.arc(r() * MS, r() * MS, 60 + r() * 150, 0, 7); g.fill(); } blurOff(g); vignette(g, 0.28); } },
  ];
  const sceneCache = {}, sceneCanvas = id => { if (!sceneCache[id]) { const c = mkc(), g = c.getContext('2d'); (SCENES.find(s => s.id === id) || SCENES[0]).make(g); sceneCache[id] = c; } return sceneCache[id]; };

  /* ================= state ================= */
  const S = { kind: 'shirt', color: '#ffffff', scene: 'wood', custom: null, customCredit: null, photo: null, px: 0.5, py: 0.45, art: null, seed: 1 };
  const prodOf = k => (C.MOCK_PRODUCTS || []).find(p => p[0] === k);
  const coverTo = (g, im, w = MS, h = MS) => { const s = Math.max(w / im.width, h / im.height), dw = im.width * s, dh = im.height * s; g.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh); };
  const loadImg = (src, cors = true) => new Promise((res, rej) => { const i = new Image(); if (cors) i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => rej(new Error('image')); i.src = src; });

  function drawScene(g, sceneId) {
    if (S.custom && sceneId === 'custom') { coverTo(g, S.custom); vignette(g, 0.3); return; }
    g.drawImage(sceneCanvas(sceneId === 'custom' ? 'paper' : sceneId), 0, 0);
  }
  function grade(g) { vignette(g, 0.16); const r = rng(S.seed); for (let i = 0; i < 4200; i++) { g.fillStyle = r() > .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(r() * MS, r() * MS, 1.4, 1.4); } }
  /* garments: crop the empty margin so the print is a realistic size; mugs & bottles: keep the whole headline visible (real wraps leave plain sides) */
  function trim(art) {
    const N = 96, s = mkc(N, N), g = s.getContext('2d', { willReadFrequently: true }); g.drawImage(art, 0, 0, N, N); const d = g.getImageData(0, 0, N, N).data; let x0 = N, y0 = N, x1 = -1, y1 = -1;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (d[(y * N + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 <= x0 || y1 <= y0 || (x1 - x0 > N * 0.92 && y1 - y0 > N * 0.92)) return art; const p = 2, sx = Math.max(0, x0 - p) / N * art.width, sy = Math.max(0, y0 - p) / N * art.height, sw = Math.min(N, x1 - x0 + 1 + 2 * p) / N * art.width, sh = Math.min(N, y1 - y0 + 1 + 2 * p) / N * art.height;
    const c = mkc(Math.round(sw), Math.round(sh)); c.getContext('2d').drawImage(art, sx, sy, sw, sh, 0, 0, c.width, c.height); return c;
  }
  function prepArt(kind, art) {
    if (kind === 'shirt' || kind === 'hoodie' || kind === 'tote') return { art: trim(art), opts: {} };
    if (kind === 'mug' || kind === 'tumbler' || kind === 'bottle') { const w = mkc(Math.round(art.width * 1.38), art.height); w.getContext('2d').drawImage(art, (w.width - art.width) / 2, 0); return { art: w, opts: { arc: 3.25, ratio: art.height / art.width } }; }
    return { art, opts: {} };
  }
  function renderOn(c, kind = S.kind, o = {}) {
    const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    const sc = o.scene || S.scene, art = o.art || S.art;
    if (kind === 'photo') { drawPhoto(g); return; }
    drawScene(g, sc);
    const pa = prepArt(kind, art), prod = C.mockRender(kind, pa.art, o.color || S.color, 0, { noBackdrop: true, ...pa.opts });
    g.drawImage(prod, 0, 0); grade(g);
  }
  function drawPhoto(g) {
    if (!S.photo) { g.fillStyle = '#1b1b2a'; g.fillRect(0, 0, MS, MS); g.fillStyle = '#b9b9d6'; g.font = '700 30px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('Upload a photo of your blank product,', MS / 2, MS / 2 - 14); g.fillText('or generate one with AI', MS / 2, MS / 2 + 28); return; }
    coverTo(g, S.photo); const dw = MS * $('#mkScale').value / 100, dh = dw * (S.art.height / S.art.width);
    g.save(); g.translate(S.px * MS, S.py * MS); g.rotate($('#mkRot').value * Math.PI / 180); if ($('#mkBlend').checked) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.94; } g.filter = 'blur(0.4px)'; g.drawImage(S.art, -dw / 2, -dh / 2, dw, dh); g.restore(); g.filter = 'none';
  }

  /* ================= UI ================= */
  const old = document.getElementById('mockup'); if (old) old.remove();
  const m = Object.assign(document.createElement('div'), { className: 'modal', id: 'mockup', hidden: true }); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="sheet wide-sheet mk"><button class="x" aria-label="Close">${ico('x', 18)}</button><h1>Mockups</h1>
    <div class="mock-body"><div class="mk-stage"><canvas id="mockCanvas" width="${MS}" height="${MS}"></canvas><div class="mk-busy" id="mkBusy" hidden><i></i><span>Generating…</span></div></div>
    <div class="mock-side">
      <h4>Product</h4><div class="mk-grid" id="mkGrid"></div>
      <div id="mkColorBox"><h4>Colour</h4><div class="swatches" id="mkColors"></div></div>
      <div id="mkPhotoBox" hidden><h4>Your blank product photo</h4><div class="row2"><label class="btn" for="mkFile">${ico('upload', 16)}Upload</label><input type="file" id="mkFile" accept="image/*" hidden><button class="btn" id="mkCenter">Centre print</button></div>
        <label class="slider-row">Print size <input type="range" id="mkScale" min="5" max="120" value="38"></label><label class="slider-row">Rotate <input type="range" id="mkRot" min="-45" max="45" value="0"></label>
        <label class="switch"><input type="checkbox" id="mkBlend" checked><i></i><span>Blend into fabric</span></label><p class="tip">Drag on the preview to place the design.</p></div>
      <h4>Scene</h4><div class="scenes" id="mkScenes"></div>
      <form id="mkSceneForm" class="searchbar"><i data-ico="search" data-s="16"></i><input id="mkSceneQ" placeholder="Search a photo backdrop…"></form><div class="scene-results" id="mkSceneRes"></div>
      <h4>Generate more <span class="mk-ai">AI</span></h4>
      <form id="mkAiForm" class="searchbar"><i data-ico="wand-sparkles" data-s="16"></i><input id="mkAiQ" placeholder="Describe a scene: sunny café table…"><button class="btn" type="submit">Scene</button></form>
      <div class="chips" id="mkAiProducts"></div>
      <div class="row2"><button class="btn" id="mkShuffle">${ico('dice-5', 16)}Shuffle</button><button class="btn" id="mkSheet">${ico('layout-grid', 16)}Mockup sheet</button></div>
      <button id="mkSave" class="cta wide">${ico('download', 18)}Save mockup</button><p class="tip" id="mkNote"></p>
    </div></div></div>`;
  document.body.appendChild(m); C.hydrateIconsLater?.(); window.hydrateIcons?.(m);
  $('.x', m).onclick = () => { m.hidden = true; }; m.addEventListener('mousedown', e => { if (e.target === m) m.hidden = true; });
  const cv = $('#mockCanvas', m);

  const AI_PRODUCTS = [['T-shirt', 'white t-shirt laid flat'], ['Hoodie', 'white hoodie'], ['Mug', 'white ceramic coffee mug'], ['Tote bag', 'white canvas tote bag'], ['Cap', 'white baseball cap'], ['Phone case', 'white phone case'], ['Poster', 'blank poster in a frame on a wall'], ['Pillow', 'white cushion pillow'], ['Notebook', 'blank notebook on a desk']];
  function build() {
    $('#mkGrid', m).innerHTML = [...(C.MOCK_PRODUCTS || []), ['photo', 'My photo', 'camera', false]].map(([k, n, ic]) => `<button class="mk-item${k === S.kind ? ' on' : ''}" data-k="${k}">${ico(ic, 22)}<span>${n}</span></button>`).join('');
    $('#mkColors', m).innerHTML = COLORS.map(c => `<button data-c="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`).join('') + '<label class="mk-pick" title="Any colour"><input type="color" id="mkCustomCol" value="#7c3aed"></label>';
    $('#mkScenes', m).innerHTML = SCENES.map(s => `<button class="chip${s.id === S.scene ? ' on' : ''}" data-s="${s.id}">${s.n}</button>`).join('') + '<button class="chip" data-s="custom" id="mkCustomChip" hidden>My scene</button>';
    $('#mkAiProducts', m).innerHTML = '<span class="mk-lbl">Blank product photo:</span>' + AI_PRODUCTS.map(([n], i) => `<button class="chip" data-ai="${i}">${n}</button>`).join('');
    $$('[data-k]', m).forEach(b => b.onclick = () => { S.kind = b.dataset.k; paintUi(); draw(); });
    $$('#mkColors [data-c]', m).forEach(b => b.onclick = () => { S.color = b.dataset.c; draw(); });
    $('#mkCustomCol', m).oninput = e => { S.color = e.target.value; draw(); };
    $$('#mkScenes [data-s]', m).forEach(b => b.onclick = () => { S.scene = b.dataset.s; $$('#mkScenes .chip', m).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    $$('[data-ai]', m).forEach(b => b.onclick = () => aiProduct(+b.dataset.ai));
  }
  function paintUi() {
    $$('.mk-item', m).forEach(b => b.classList.toggle('on', b.dataset.k === S.kind)); const p = prodOf(S.kind);
    $('#mkColorBox', m).hidden = S.kind === 'photo' || (p && p[3] === false); $('#mkPhotoBox', m).hidden = S.kind !== 'photo';
  }
  let raf = 0; function draw() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { try { S.art = C.renderDesign(false); } catch { return toast('This design uses an image that blocks export — upload it instead', ''); } renderOn(cv); }); }
  const busy = (on, t) => { $('#mkBusy', m).hidden = !on; if (t) $('#mkBusy span', m).textContent = t; };

  /* photo kind: drag to place */
  let drag = false; const place = e => { const b = cv.getBoundingClientRect(); S.px = (e.clientX - b.left) / b.width; S.py = (e.clientY - b.top) / b.height; draw(); };
  cv.addEventListener('pointerdown', e => { if (S.kind !== 'photo') return; drag = true; cv.setPointerCapture(e.pointerId); place(e); }); cv.addEventListener('pointermove', e => drag && place(e)); cv.addEventListener('pointerup', () => { drag = false; });
  ['mkScale', 'mkRot', 'mkBlend'].forEach(id => $('#' + id, m).addEventListener('input', draw)); $('#mkCenter', m).onclick = () => { S.px = 0.5; S.py = 0.45; draw(); };
  $('#mkFile', m).onchange = async e => { const f = e.target.files[0]; if (!f) return; S.photo = await loadImg(URL.createObjectURL(f), false); S.kind = 'photo'; paintUi(); draw(); };

  /* stock backdrop search (uses the app's merged photo search) */
  $('#mkSceneForm', m).onsubmit = async e => {
    e.preventDefault(); const q = $('#mkSceneQ', m).value.trim(); if (!q) return; const box = $('#mkSceneRes', m); box.innerHTML = '<p class="tip">Searching…</p>';
    try { const { items } = await C.stock.search(q + ' background texture', { page: 1, kind: 'photo' }); box.innerHTML = '';
      items.slice(0, 9).forEach(it => { const b = document.createElement('button'); b.className = 'photo-card'; b.innerHTML = '<img alt="">'; $('img', b).src = it.thumb; b.onclick = async () => { busy(true, 'Loading photo…'); try { S.custom = await loadImg(it.full).catch(() => loadImg(it.thumb)); S.customCredit = it; useCustom(); } catch { toast('That photo could not be loaded', ''); } busy(false); }; box.appendChild(b); });
      if (!items.length) box.innerHTML = '<p class="tip">No results — try another word.</p>';
    } catch { box.innerHTML = ''; toast('Could not reach the photo service', ''); }
  };
  const useCustom = () => { S.scene = 'custom'; $('#mkCustomChip', m).hidden = false; $$('#mkScenes .chip', m).forEach(x => x.classList.toggle('on', x.dataset.s === 'custom')); if (S.kind === 'photo') S.kind = 'shirt'; paintUi(); draw(); };

  /* AI generation (free Pollinations service) */
  async function aiImage(prompt, w = 1024, h = 1024) {
    const url = `https://image.pollinations.ai/prompt/${enc(prompt)}?width=${w}&height=${h}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1e6)}`;
    const r = await fetch(url); if (!r.ok) throw new Error('ai ' + r.status); return loadImg(URL.createObjectURL(await r.blob()), false);
  }
  $('#mkAiForm', m).onsubmit = async e => {
    e.preventDefault(); const q = $('#mkAiQ', m).value.trim(); if (!q) return toast('Describe the scene first', '');
    busy(true, 'Generating scene… (~20s)'); try { S.custom = await aiImage(`${q}, empty surface for product photography, soft natural light, shallow depth of field, no objects, no text, photorealistic`); S.customCredit = null; useCustom(); toast('Scene ready', ''); } catch { toast('The free AI service is busy — try again', ''); } busy(false);
  };
  async function aiProduct(i) {
    const [name, desc] = AI_PRODUCTS[i]; busy(true, `Generating a blank ${name.toLowerCase()} photo… (~20s)`);
    try { S.photo = await aiImage(`product photography of a blank plain ${desc}, centered, front view, studio lighting, soft shadow, clean light background, high resolution, no text, no logo`); S.kind = 'photo'; $('#mkScale', m).value = /mug|phone|cap/i.test(name) ? 26 : 34; S.px = 0.5; S.py = /mug|phone/i.test(name) ? 0.5 : 0.46; paintUi(); draw(); toast('Drag the design to place it', ''); } catch { toast('The free AI service is busy — try again', ''); } busy(false);
  }
  $('#mkShuffle', m).onclick = () => { const r = Math.random; S.scene = SCENES[Math.floor(r() * SCENES.length)].id; S.color = COLORS[Math.floor(r() * COLORS.length)]; S.seed = Math.floor(r() * 1e6); if (S.kind === 'photo') S.kind = 'shirt'; $$('#mkScenes .chip', m).forEach(x => x.classList.toggle('on', x.dataset.s === S.scene)); paintUi(); draw(); };

  /* one image with the design on six products */
  $('#mkSheet', m).onclick = async () => {
    busy(true, 'Building mockup sheet…'); await new Promise(r => setTimeout(r, 40));
    try {
      S.art = C.renderDesign(false); const kinds = ['shirt', 'hoodie', 'mug', 'tote', 'case', 'poster'], T = 600, sheet = mkc(T * 3, T * 2 + 70), g = sheet.getContext('2d'); g.fillStyle = '#f5f3ff'; g.fillRect(0, 0, sheet.width, sheet.height);
      kinds.forEach((k, i) => { const c = mkc(); renderOn(c, k, { scene: ['paper', 'linen', 'wood', 'peach', 'concrete', 'sunlit'][i], color: k === 'mug' || k === 'poster' ? '#ffffff' : S.color }); g.drawImage(c, (i % 3) * T, Math.floor(i / 3) * T, T, T); });
      g.fillStyle = '#1c1255'; g.font = '800 26px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText($('#projectName').value || 'My design', 24, T * 2 + 44); g.textAlign = 'right'; g.fillStyle = '#6d4aff'; g.fillText('Made with Chitra Studio', sheet.width - 24, T * 2 + 44);
      sheet.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'mockup-sheet.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); C.confetti?.(); toast('Mockup sheet saved', ''); });
    } catch (e) { toast('Could not build the sheet', ''); console.warn(e); } busy(false);
  };
  $('#mkSave', m).onclick = () => cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${($('#projectName').value || 'mockup').replace(/\W+/g, '-')}-mockup.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); C.confetti?.(); toast('Mockup saved', ''); if (S.custom && S.customCredit && S.scene === 'custom') $('#mkNote', m).textContent = `Backdrop photo: ${S.customCredit.by} (${S.customCredit.site})`; });

  build();
  const guess = () => { const n = ($('#productName')?.textContent || '').toLowerCase(); return /hoodie/.test(n) ? 'hoodie' : /tumbler/.test(n) ? 'tumbler' : /mug/.test(n) || C.guide === 'mug' ? 'mug' : /tote/.test(n) ? 'tote' : /mouse/.test(n) ? 'pad' : /phone/.test(n) ? 'case' : /pillow/.test(n) ? 'pillow' : /coaster/.test(n) ? 'coaster' : /poster|a3|a4|a2|photo|flyer/.test(n) ? 'poster' : /business card/.test(n) ? 'cards' : 'shirt'; };
  function open() { if (S.kind !== 'photo') S.kind = guess(); m.hidden = false; paintUi(); draw(); }
  C.openMockup = open; const btn = $('#mockupBtn'); if (btn) btn.onclick = open;
  Object.assign(C, { mockRenderScene: renderOn, MOCK_SCENES: SCENES });
})();
