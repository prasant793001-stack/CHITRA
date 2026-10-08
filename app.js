/* Chitra Studio – print-focused design studio (DTF + sublimation) built on Fabric.js */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const EXTRA = ['adj', 'locked', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'archData', 'slot', 'inSlot', 'credit', 'isIcon', 'mock'];
  let DPI = 300;
  const FONTS = ['Fredoka', 'Bangers', 'Anton', 'Bebas Neue', 'Chewy', 'Lobster', 'Pacifico', 'Permanent Marker', 'Righteous',
    'Arial', 'Georgia', 'Impact', 'Verdana', 'Courier New'];
  const COLORS = ['#14110f', '#ffffff', '#ff2d95', '#ff8a1f', '#ffd23f', '#c6ff3d', '#22d3ee', '#3a86ff', '#8b5cf6', '#ef476f', '#06d6a0', '#7c2d12', '#f5f5fc', '#64748b', '#f43f5e', '#0ea5e9'];
  const GRADS = [['#ff2d95', '#ff8a1f'], ['#8b5cf6', '#22d3ee'], ['#c6ff3d', '#22d3ee'], ['#ff8a1f', '#ffd23f'], ['#f43f5e', '#8b5cf6'], ['#06d6a0', '#3a86ff']];
  const EMOJI = ['🔥', '⭐', '💖', '😎', '🌈', '🦄', '🍕', '🌴', '☀️', '🌙', '⚡', '💀', '👑', '🎸', '🐱', '🐶', '🍀', '🌸', '🎉', '💥', '👻', '🚀', '🍉', '🌮', '🍩', '🎃', '🐙', '🦖', '🌵', '💎', '🎧', '🏆', '🧠', '🍒', '🌊', '❄️'];
  const PALETTES = [
    { n: 'Sunset', c: ['#ff2d95', '#ff8a1f', '#ffd23f', '#8b5cf6', '#14110f'] },
    { n: 'Candy', c: ['#ff77c8', '#7df9ff', '#fff176', '#b388ff', '#ffffff'] },
    { n: 'Ocean', c: ['#0077b6', '#00b4d8', '#90e0ef', '#48cae4', '#03045e'] },
    { n: 'Retro', c: ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#264653'] },
    { n: 'Neon', c: ['#c6ff3d', '#ff2d95', '#22d3ee', '#a855f7', '#ffffff'] },
    { n: 'Jungle', c: ['#06d6a0', '#118ab2', '#ffd166', '#ef476f', '#073b4c'] },
  ];
  const P = (cat, g, icon, name, w, h, guide = 'none', dpi = 300) => ({ cat, g, icon, name, w, h, guide, dpi });
  const inP = (cat, g, icon, name, wi, hi, dpi = 300, guide = 'paper') => P(cat, g, icon, name, Math.round(wi * dpi), Math.round(hi * dpi), guide, dpi);
  const mmP = (cat, g, icon, name, wmm, hmm, dpi = 300, guide = 'paper') => P(cat, g, icon, name, Math.round((wmm / 25.4) * dpi), Math.round((hmm / 25.4) * dpi), guide, dpi);
  const PRODUCTS = [
    // ---- paper ----
    mmP('paper', 'Paper · ISO sizes', '📄', 'A4', 210, 297),
    mmP('paper', 'Paper · ISO sizes', '📄', 'A3', 297, 420),
    mmP('paper', 'Paper · ISO sizes', '📄', 'A5', 148, 210),
    mmP('paper', 'Paper · ISO sizes', '📄', 'A6', 105, 148),
    mmP('paper', 'Paper · ISO sizes', '📄', 'A2', 420, 594, 200),
    mmP('paper', 'Paper · ISO sizes', '📄', 'A1', 594, 841, 150),
    mmP('paper', 'Paper · ISO sizes', '📄', 'A0', 841, 1189, 100),
    inP('paper', 'Paper · US sizes', '📃', 'Letter', 8.5, 11),
    inP('paper', 'Paper · US sizes', '📃', 'Legal', 8.5, 14),
    inP('paper', 'Paper · US sizes', '📃', 'Tabloid', 11, 17),
    inP('paper', 'Paper · US sizes', '📃', 'Half letter', 5.5, 8.5),
    inP('paper', 'Posters & photos', '🖼️', 'Poster 18×24 in', 18, 24, 150),
    inP('paper', 'Posters & photos', '🖼️', 'Poster 24×36 in', 24, 36, 100),
    inP('paper', 'Posters & photos', '📷', 'Photo 4×6 in', 4, 6),
    inP('paper', 'Posters & photos', '📷', 'Photo 5×7 in', 5, 7),
    inP('paper', 'Posters & photos', '📷', 'Photo 8×10 in', 8, 10),
    inP('paper', 'Posters & photos', '📷', 'Photo 11×14 in', 11, 14),
    // ---- marketing print ----
    inP('marketing', 'Print & marketing', '💳', 'Business card', 3.5, 2),
    inP('marketing', 'Print & marketing', '📣', 'Flyer', 5.5, 8.5),
    inP('marketing', 'Print & marketing', '✉️', 'Postcard', 6, 4),
    inP('marketing', 'Print & marketing', '💌', 'Invitation', 5, 7),
    inP('marketing', 'Print & marketing', '🎓', 'Certificate', 11, 8.5),
    inP('marketing', 'Print & marketing', '🍽️', 'Menu', 4.25, 11),
    inP('marketing', 'Print & marketing', '📖', 'Brochure (open)', 11, 8.5),
    inP('marketing', 'Print & marketing', '🎟️', 'Ticket', 5.5, 2),
    inP('marketing', 'Print & marketing', '🔖', 'Bookmark', 2, 6),
    inP('marketing', 'Print & marketing', '🏷️', 'Label / sticker 3×3 in', 3, 3),
    inP('marketing', 'Print & marketing', '🚪', 'Door hanger', 3.5, 8.5),
    inP('marketing', 'Print & marketing', '🚩', 'Banner 6×2 ft', 72, 24, 50, 'none'),
    // ---- DTF / sublimation ----
    P('print', 'DTF transfers', '👕', 'T-shirt front', 3300, 3900, 'shirt'),
    P('print', 'DTF transfers', '🔙', 'T-shirt back', 3600, 4800, 'shirt'),
    P('print', 'DTF transfers', '🧥', 'Hoodie front', 3600, 4200, 'shirt'),
    P('print', 'DTF transfers', '🧒', 'Kids tee', 2400, 3000, 'shirt'),
    P('print', 'DTF transfers', '📍', 'Left chest', 1200, 1200),
    P('print', 'DTF transfers', '💪', 'Sleeve 3×10 in', 900, 3000),
    P('print', 'DTF transfers', '🧢', 'Cap front 4×2 in', 1200, 600),
    P('print', 'DTF transfers', '👜', 'Tote bag', 3600, 4200),
    P('print', 'DTF gang sheets · 22 in roll', '🧻', 'Gang sheet 22×12', 6600, 3600),
    P('print', 'DTF gang sheets · 22 in roll', '📜', 'Gang sheet 22×24', 6600, 7200),
    P('print', 'Sublimation', '☕', '11 oz mug wrap', 2475, 1050, 'mug'),
    P('print', 'Sublimation', '🍵', '15 oz mug wrap', 2700, 1125, 'mug'),
    P('print', 'Sublimation', '🥤', '20 oz tumbler', 2790, 2460),
    P('print', 'Sublimation', '🟫', 'Coaster', 1200, 1200),
    P('print', 'Sublimation', '🖱️', 'Mouse pad', 2850, 2370),
    P('print', 'Sublimation', '📱', 'Phone case', 900, 1800),
    P('print', 'Sublimation', '🛋️', 'Pillow 16×16 in', 4800, 4800),
    P('print', 'Sublimation', '🎄', 'Round ornament', 1050, 1050),
    // ---- social ----
    P('social', 'Social media', '📸', 'Instagram post', 1080, 1080, 'none', 96),
    P('social', 'Social media', '🖼️', 'Instagram portrait', 1080, 1350, 'none', 96),
    P('social', 'Social media', '📱', 'Story / Reel / TikTok', 1080, 1920, 'none', 96),
    P('social', 'Social media', '👍', 'Facebook post', 1200, 630, 'none', 96),
    P('social', 'Social media', '🏞️', 'Facebook cover', 1640, 924, 'none', 96),
    P('social', 'Social media', '▶️', 'YouTube thumbnail', 1280, 720, 'none', 96),
    P('social', 'Social media', '🎬', 'YouTube banner', 2560, 1440, 'none', 96),
    P('social', 'Social media', '💼', 'LinkedIn banner', 1584, 396, 'none', 96),
    P('social', 'Social media', '🐦', 'X / Twitter post', 1600, 900, 'none', 96),
    P('social', 'Social media', '📌', 'Pinterest pin', 1000, 1500, 'none', 96),
    P('social', 'Social media', '🛍️', 'Etsy listing', 2000, 2000, 'none', 96),
    // ---- screens ----
    P('present', 'Presentation & screens', '🖥️', 'Presentation 16:9', 1920, 1080, 'none', 96),
    P('present', 'Presentation & screens', '📺', 'Presentation 4:3', 1024, 768, 'none', 96),
    P('present', 'Presentation & screens', '🎞️', 'Video 4K', 3840, 2160, 'none', 96),
    P('present', 'Presentation & screens', '🌆', 'Desktop wallpaper', 2560, 1440, 'none', 96),
  ];
  const PROD_ICONS = [[/instagram/i, 'brand:instagram'], [/story|reel|tiktok/i, 'brand:tiktok'], [/facebook/i, 'brand:facebook'], [/youtube/i, 'brand:youtube'], [/linkedin/i, 'linkedin'], [/twitter|^x /i, 'brand:x'], [/pinterest/i, 'brand:pinterest'], [/etsy/i, 'brand:etsy'],
    [/mug|ornament/i, 'coffee'], [/tumbler/i, 'cup-soda'], [/hoodie|tee|t-shirt|sleeve|chest/i, 'shirt'], [/tote/i, 'shopping-bag'], [/cap /i, 'hard-hat'], [/gang/i, 'layout-grid'], [/coaster/i, 'square'], [/mouse/i, 'mouse'], [/phone/i, 'smartphone'], [/pillow/i, 'box'],
    [/business card/i, 'credit-card'], [/flyer/i, 'newspaper'], [/postcard/i, 'mail'], [/invitation/i, 'gift'], [/certificate/i, 'award'], [/menu/i, 'utensils'], [/brochure/i, 'book-open'], [/ticket/i, 'ticket'], [/bookmark/i, 'bookmark'], [/label|sticker/i, 'tag'], [/door/i, 'door-open'], [/banner/i, 'flag'],
    [/poster|photo/i, 'image'], [/instagram/i, 'camera'], [/story|reel|tiktok/i, 'smartphone'], [/facebook/i, 'users'], [/youtube/i, 'video'], [/linkedin/i, 'briefcase'], [/twitter/i, 'message-circle'], [/pinterest/i, 'pin'], [/etsy/i, 'store'], [/presentation/i, 'presentation'], [/video/i, 'video'], [/wallpaper/i, 'monitor'], [/\bA\d\b|letter|legal|tabloid|half/i, 'file-text']];
  const prodIconName = p => (PROD_ICONS.find(([re]) => re.test(p.name)) || [0, 'file'])[1];
  const PICKER_TABS = [['all', 'All'], ['paper', 'Paper'], ['marketing', 'Marketing'], ['print', 'DTF & Sublimation'], ['social', 'Social'], ['present', 'Screens']];
  const inches = (px, d = DPI) => (px / d).toFixed(2).replace(/\.?0+$/, '');
  const dim = p => p.dpi >= 100 ? (p.cat === 'paper' ? `${Math.round((p.w / p.dpi) * 25.4)}×${Math.round((p.h / p.dpi) * 25.4)} mm` : `${inches(p.w, p.dpi)}×${inches(p.h, p.dpi)} in`) : `${p.w}×${p.h} px`;

  let W = 3300, H = 3900, zoom = 1, guide = 'shirt', product = PRODUCTS.find(x => x.name === 'T-shirt front'), creating = false, projectId = null;
  const pages = [{ json: null, thumb: null, hist: null }]; let cur = 0;
  const canvas = new fabric.Canvas('c', { preserveObjectStacking: true, backgroundColor: '' });
  fabric.Object.prototype.set({
    transparentCorners: false, cornerColor: '#ffffff', cornerStrokeColor: '#6d4aff', borderColor: '#6d4aff',
    cornerStyle: 'circle', cornerSize: 11, padding: 2, borderScaleFactor: 1.25,
  });
  const u = () => Math.min(W, H);
  // Canva-style: ONE click/tap selects & moves; DOUBLE click/tap edits (handled in editObject below).
  fabric.IText.prototype.mouseUpHandler = function (o) {
    this.__isMousedown = false;
    if (!this.editable || this.group || (o.transform && o.transform.actionPerformed) || (o.e.button && o.e.button !== 1)) return;
    if (this.canvas && this.canvas._activeObject && this.canvas._activeObject !== this) return;
    this.selected = true;
  };
  const active = () => canvas.getActiveObject();
  const isText = o => o && /text/.test(o.type);
  const isImage = o => o && o.type === 'image';
  const isArch = o => o && o.archData;
  const toHex = c => (!c || typeof c !== 'string') ? '#000000' : '#' + new fabric.Color(c).toHex();
  const targets = () => { const o = active(); return !o ? [] : o.type === 'activeSelection' ? o.getObjects() : [o]; };

  /* ================= toasts & confetti ================= */
  const WARN = new Set(['⚠️', '☝️', '👆', 'ℹ️']);
  function toast(msg, tag = '', action) { // action = { label, fn }: shows a button (e.g. Undo) and keeps the toast a little longer
    const t = document.createElement('div'), warn = WARN.has(tag); t.className = 'toast' + (warn ? ' warn' : '');
    t.innerHTML = `<span class="ti">${ico(warn ? 'triangle-alert' : 'check', 14)}</span><span class="tm"></span>`; $('.tm', t).textContent = msg;
    const kill = () => { t.classList.add('out'); setTimeout(() => t.remove(), 350); };
    if (action) { const b = document.createElement('button'); b.className = 'tact'; b.textContent = action.label; b.onclick = () => { action.fn(); kill(); }; t.appendChild(b); }
    $('#toasts').appendChild(t); setTimeout(kill, action ? 6000 : 2400);
  }
  /* in-app confirmation sheet (replaces the browser's confirm() box): resolves true / false */
  function ask(title, text = '', ok = 'Delete', danger = true) {
    return new Promise(res => {
      const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'alertdialog'); m.setAttribute('aria-modal', 'true');
      m.innerHTML = `<div class="sheet small ask"><h2></h2><p class="tip"></p><div class="ask-btns"><button class="btn" data-n>Cancel</button><button class="${danger ? 'btn danger-solid' : 'cta'}" data-y></button></div></div>`;
      $('h2', m).textContent = title; $('p', m).textContent = text; $('[data-y]', m).textContent = ok; document.body.appendChild(m);
      const done = v => { m.remove(); document.removeEventListener('keydown', key, true); res(v); }, key = e => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } else if (e.key === 'Enter') { e.stopPropagation(); done(true); } };
      $('[data-n]', m).onclick = () => done(false); $('[data-y]', m).onclick = () => done(true); m.addEventListener('mousedown', e => { if (e.target === m) done(false); }); document.addEventListener('keydown', key, true); $('[data-y]', m).focus();
    });
  }
  function confetti(x = innerWidth / 2, y = innerHeight / 3, n = 150) {
    const c = $('#confetti'); c.width = innerWidth; c.height = innerHeight; const g = c.getContext('2d');
    const cols = ['#6d4aff', '#ffc42e', '#1fb26b', '#b5dd2f', '#8a6bff', '#14b8a6'];
    const ps = Array.from({ length: n }, () => ({ x, y, vx: (Math.random() - .5) * 18, vy: -Math.random() * 15 - 4, r: Math.random() * 6 + 3, c: pick(cols), rot: Math.random() * 6, vr: (Math.random() - .5) * .5 }));
    let t = 0;
    (function step() {
      g.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => {
        p.vy += .38; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.rot += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - t / 110);
        g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); g.restore();
      });
      if (++t < 120) requestAnimationFrame(step); else g.clearRect(0, 0, c.width, c.height);
    })();
  }

  /* ================= history ================= */
  const history = { stack: [], idx: -1, busy: false };
  // Big image data URLs are stored once and referenced by id in every snapshot (keeps undo light on phones).
  const imgStore = new Map(), imgIds = new Map(); let imgSeq = 0; const TOK = 'chitra-img:';
  const walkObjs = (objs, fn) => (objs || []).forEach(o => { fn(o); if (o.objects) walkObjs(o.objects, fn); if (o.clipPath) fn(o.clipPath); });
  const shrink = j => { walkObjs(j.objects, o => { if (typeof o.src === 'string' && o.src.length > 4000) { let id = imgIds.get(o.src); if (id === undefined) { id = ++imgSeq; imgIds.set(o.src, id); imgStore.set(id, o.src); } o.src = TOK + id; } }); return j; };
  const expand = str => str.replace(/chitra-img:(\d+)/g, (m, id) => imgStore.get(+id) ?? m);
  const parseSnap = json => { const d = JSON.parse(json); walkObjs(d.canvas.objects, o => { if (typeof o.src === 'string' && o.src.startsWith(TOK)) o.src = imgStore.get(+o.src.slice(TOK.length)) || o.src; }); return d; };
  let themedDoc = false; // true only for structured template documents (presentation, menu, invitation, certificate...): extra pages then follow the template's look
  const THEMED_CATS = new Set(['slides', 'menu', 'invite', 'cert', 'card', 'flyer']);
  const snapshot = () => JSON.stringify({ W, H, dpi: DPI, themed: themedDoc || undefined, name: $('#projectName').value, canvas: shrink(canvas.toJSON(EXTRA)) });
  let commitT = null;
  function doCommit() {
    commitT = null; if (history.busy) return;
    history.stack = history.stack.slice(0, history.idx + 1);
    history.stack.push(snapshot());
    if (history.stack.length > 30) history.stack.shift();
    history.idx = history.stack.length - 1;
    renderLayers(); refreshUsage(); schedThumb(); schedSave();
  }
  function commit() { if (history.busy) return; clearTimeout(commitT); commitT = setTimeout(doCommit, 140); }
  const flushCommit = () => { if (commitT) { clearTimeout(commitT); doCommit(); } };
  function restore(json) {
    history.busy = true;
    const d = parseSnap(json);
    if (d.name) $('#projectName').value = d.name;
    setSize(d.W, d.H, false, undefined, d.dpi);
    canvas.loadFromJSON(d.canvas, () => {
      syncBg(); canvas.renderAll(); history.busy = false; refreshProps(); renderLayers(); refreshUsage();
    });
  }
  const undo = () => { flushCommit(); if (history.idx > 0) restore(history.stack[--history.idx]); };
  const redo = () => { flushCommit(); if (history.idx < history.stack.length - 1) restore(history.stack[++history.idx]); };
  ['object:added', 'object:removed', 'object:modified', 'text:editing:exited'].forEach(e => canvas.on(e, commit));

  /* ================= size, zoom, guides ================= */
  function applyZoom() {
    zoom = Math.min(Math.max(zoom, 0.02), 4);
    canvas.setZoom(zoom);
    canvas.setDimensions({ width: W * zoom, height: H * zoom });
    $('#zoomLabel').textContent = Math.round(zoom * 100) + '%';
    $('#zoomSlider').value = Math.round(zoom * 100);
    canvas.requestRenderAll(); placeFloat();
  }
  const fitZoom = () => { const s = $('#stage'); return Math.min((s.clientWidth - 40) / W, (s.clientHeight - (isMobile() ? 70 : 150)) / H, 1); };
  function fit() { lastW = $('#stage').clientWidth; zoom = fitZoom(); applyZoom(); }
  function drawGuides() {
    const g = $('#guides'); g.hidden = !$('#showGuides').checked; g.innerHTML = '';
    const pct = (px, total) => (px / total) * 100 + '%';
    const add = (cls, css, text) => {
      const d = document.createElement('div'); d.className = cls; Object.assign(d.style, css);
      if (text) d.textContent = text; g.appendChild(d);
    };
    const m = guide === 'paper' ? (DPI / 25.4) * 10 : DPI * 0.125; // 10 mm safe area on paper, 1/8 in elsewhere
    add('g-safe', { left: pct(m, W), right: pct(m, W), top: pct(m, H), bottom: pct(m, H) });
    if (guide === 'paper') add('g-label', { left: pct(m, W), top: pct(m, H), transform: 'translateY(-130%)' }, 'SAFE AREA');
    if (guide === 'mug') {
      add('g-zone', { left: 0, width: pct(W * 0.1, W) }); add('g-zone', { right: 0, width: pct(W * 0.1, W) });
      add('g-line', { left: '50%' });
      add('g-label', { left: '50%', top: '8px', transform: 'translateX(-50%)' }, 'FRONT CENTRE');
      add('g-label', { left: '6px', bottom: '8px' }, 'HANDLE');
      add('g-label', { right: '6px', bottom: '8px' }, 'HANDLE');
    } else if (guide === 'shirt') {
      add('g-line', { left: '50%' });
      add('g-label', { left: '50%', top: '8px', transform: 'translateX(-50%)' }, 'COLLAR ▲ CENTRE');
    }
  }
  function setProduct(p) {
    product = p; $('#productIcon').innerHTML = ico(prodIconName(p), 20); $('#productName').textContent = p.name;
    $('#sizeInfo').textContent = DPI >= 100 ? `${dim({ ...p, w: W, h: H, dpi: DPI })} · ${W}×${H}px @ ${DPI} DPI` : `${W}×${H} px`;
  }
  function setSize(w, h, record = true, g, d, prod) {
    W = w; H = h; if (d) DPI = d;
    const exact = (x) => x.w === w && x.h === h && x.dpi === DPI, swapped = (x) => x.w === h && x.h === w && x.dpi === DPI;
    let p = prod && prod.w === w && prod.h === h ? prod : (PRODUCTS.find(x => exact(x) && (g === undefined || x.guide === g)) || PRODUCTS.find(exact));
    if (!p) { const sw = PRODUCTS.find(x => swapped(x) && (g === undefined || x.guide === g)) || PRODUCTS.find(swapped); if (sw) p = { ...sw, w, h, name: `${sw.name} · ${w > h ? 'landscape' : 'portrait'}` }; }
    p ||= { cat: 'custom', icon: '📐', name: 'Custom size', w, h, guide: 'none', dpi: DPI };
    guide = g ?? p.guide; setProduct(p); fit(); drawGuides();
    if (record) commit();
  }
  // Changing size keeps your artwork, scaled to fit and centred.
  function rescale(nw, nh) {
    const k = Math.min(nw / W, nh / H), dx = (nw - W * k) / 2, dy = (nh - H * k) / 2;
    canvas.discardActiveObject();
    canvas.getObjects().forEach(o => { o.set({ scaleX: o.scaleX * k, scaleY: o.scaleY * k, left: o.left * k + dx, top: o.top * k + dy }); o.setCoords(); });
  }
  $('#zoomIn').onclick = () => { zoom *= 1.25; applyZoom(); };
  $('#zoomOut').onclick = () => { zoom /= 1.25; applyZoom(); };
  $('#zoomSlider').oninput = e => { zoom = e.target.value / 100; applyZoom(); };
  $('#zoomFit').onclick = fit;
  $('#showGuides').onchange = drawGuides;
  let rzT, lastW = 0;
  window.addEventListener('resize', () => { // ignore height-only changes (phone keyboard / address bar) so your zoom isn't reset
    clearTimeout(rzT); rzT = setTimeout(() => { const w = $('#stage').clientWidth; if (Math.abs(w - lastW) > 40) { lastW = w; fit(); } }, 200);
  });
  // two-finger pinch to zoom (phones / tablets)
  let pinch = null; const tdist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  $('#stage').addEventListener('touchstart', e => { if (e.touches.length === 2) pinch = { d: tdist(e.touches), z: zoom }; }, { passive: true });
  $('#stage').addEventListener('touchmove', e => { if (pinch && e.touches.length === 2) { zoom = pinch.z * (tdist(e.touches) / pinch.d); applyZoom(); e.preventDefault(); } }, { passive: false });
  $('#stage').addEventListener('touchend', e => { if (e.touches.length < 2) pinch = null; }, { passive: true });

  /* ================= product picker ================= */
  let pickTab = 'all';
  function buildPicker() {
    const grid = $('#pickerGrid'), q = $('#pickerSearch').value.trim().toLowerCase(); grid.innerHTML = '';
    $('#pickerTabs').innerHTML = PICKER_TABS.map(([k, n]) => `<button type="button" class="chip${k === pickTab ? ' on' : ''}" data-pt="${k}">${n}</button>`).join('');
    $$('[data-pt]').forEach(b => b.onclick = () => { pickTab = b.dataset.pt; buildPicker(); });
    let last = '', n = 0;
    PRODUCTS.filter(p => (pickTab === 'all' || p.cat === pickTab) && (!q || `${p.name} ${p.g} ${dim(p)}`.toLowerCase().includes(q))).forEach(p => {
      if (p.g !== last) { const h = document.createElement('h4'); h.textContent = p.g; grid.appendChild(h); last = p.g; }
      const b = document.createElement('button'); b.className = 'pcard' + (p.name === product.name && p.w === W ? ' on' : '');
      const ic = prodIconName(p), br = /^brand:/.test(ic) ? window.CHITRA_BRANDS && window.CHITRA_BRANDS[ic.slice(6)] : ic === 'linkedin' ? { h: '0A66C2' } : null; // real platform logo on a tint of its own colour
      b.innerHTML = `<span class="pi"${br ? ` style="background:#${br.h}1a;color:#${br.h}"` : ''}>${ico(ic, 22)}</span><b>${p.name}</b><small>${dim(p)}</small>`;
      b.onclick = () => chooseProduct(p); grid.appendChild(b); n++;
    });
    if (!n) grid.innerHTML = '<p class="tip">Nothing matches. Try “A4”, “poster” or “mug” — or make a custom size.</p>';
  }
  function openPicker(mode) {
    creating = mode === 'create';
    $('#pickerTitle').textContent = creating ? 'What are we designing today?' : 'Change size or product';
    $('#pickerSearch').value = ''; buildPicker(); $('#picker').hidden = false; $('#pickerSearch').focus();
  }
  $('#pickerSearch').addEventListener('input', buildPicker);
  const welcomeTemplate = p => p.guide === 'mug' ? 'mug' : p.guide === 'shirt' ? 'slogan' : (p.cat === 'paper' || p.cat === 'marketing') ? (p.w > p.h ? (p.h / p.dpi < 3 ? 'bizcard' : 'certificate') : 'poster') : p.cat === 'social' || p.cat === 'present' ? 'quote' : 'badge';
  function chooseProduct(p) {
    $('#picker').hidden = true;
    if (creating) { creating = false; newDocument({ product: p, template: welcomeTemplate(p) }); confetti(innerWidth / 2, innerHeight / 2, 90); }
    else { rescale(p.w, p.h); setSize(p.w, p.h, true, p.guide, p.dpi, p); }
    toast(`${p.name} · ${dim(p)}${p.dpi >= 100 ? ` @ ${p.dpi} DPI` : ''}`, p.icon);
  }
  $('#productBtn').onclick = () => openPicker(); const chg = $('#changeProduct'); if (chg) chg.onclick = () => openPicker();
  $('#rotateDoc').onclick = () => { rescale(H, W); setSize(H, W, true, guide, DPI); toast(W > H ? 'Landscape' : 'Portrait', '⟳'); };

  /* ---- custom size dialog (px / in / mm / cm) ---- */
  const toPx = (v, unit, d) => Math.round(unit === 'in' ? v * d : unit === 'mm' ? (v / 25.4) * d : unit === 'cm' ? (v / 2.54) * d : v);
  function csUpdate() {
    const d = +$('#csDpi').value, w = toPx(+$('#csW').value, $('#csUnit').value, d), h = toPx(+$('#csH').value, $('#csUnit').value, d);
    const big = w * h > 80e6; $('#csInfo').textContent = w > 0 && h > 0 ? `${w} × ${h} px${big ? ' — too large for the browser, lower the DPI' : ''}` : 'Enter a width and height';
    $('#csGo').disabled = !(w > 0 && h > 0) || big; return [w, h, d];
  }
  $('#customSize').onclick = () => { $('#picker').hidden = true; $('#customModal').hidden = false; csUpdate(); };
  ['csW', 'csH', 'csUnit', 'csDpi'].forEach(id => $('#' + id).addEventListener('input', csUpdate));
  $('#csUnit').addEventListener('change', () => { const w = +$('#csW').value, h = +$('#csH').value, old = $('#csUnit').dataset.u || 'in', d = +$('#csDpi').value, nu = $('#csUnit').value; const px = [toPx(w, old, d), toPx(h, old, d)], f = v => nu === 'in' ? v / d : nu === 'mm' ? (v / d) * 25.4 : nu === 'cm' ? (v / d) * 2.54 : v; $('#csW').value = +f(px[0]).toFixed(2); $('#csH').value = +f(px[1]).toFixed(2); $('#csUnit').dataset.u = nu; csUpdate(); });
  $('#csGo').onclick = () => {
    const [w, h, d] = csUpdate(); $('#customModal').hidden = true;
    if (creating) { creating = false; newDocument({ w, h, dpi: d, guide: 'none', template: 'blank', name: 'Custom design' }); } else { rescale(w, h); setSize(w, h, true, 'none', d); }
    toast(`Custom ${w}×${h}px`, '📐');
  };

  /* ================= background & preview ================= */
  function syncBg() {
    const bg = canvas.backgroundColor;
    $('#transparent').checked = !bg; $('#bgColor').disabled = !bg;
    if (bg) $('#bgColor').value = toHex(bg);
  }
  function setBg() {
    const t = $('#transparent').checked; $('#bgColor').disabled = t;
    canvas.setBackgroundColor(t ? '' : $('#bgColor').value, () => canvas.renderAll());
  }
  $('#transparent').onchange = () => { setBg(); commit(); };
  $('#bgColor').oninput = setBg; $('#bgColor').onchange = commit;
  $('#bgSwatches').innerHTML = ['check', '#ffffff', '#14110f', '#ff2d95', '#ffd23f', '#3a86ff', '#06d6a0'].map((c, i) =>
    `<button data-pv="${c}" class="${c === 'check' ? 'check ' : ''}${i === 0 ? 'on' : ''}" style="${c === 'check' ? '' : 'background:' + c}" title="Preview your transparent design on this colour"></button>`).join('');
  $$('[data-pv]').forEach(b => b.onclick = () => {
    $$('[data-pv]').forEach(x => x.classList.toggle('on', x === b));
    $('#canvasWrap').style.background = b.dataset.pv === 'check' ? '' : b.dataset.pv;
  });

  /* ================= helpers ================= */
  function place(o) {
    const handled = typeof chitra !== 'undefined' && chitra.beforePlace && chitra.beforePlace(o); // print-layout slots can claim photos
    if (!handled) o.set({ left: W / 2, top: H / 2, originX: 'center', originY: 'center' });
    canvas.add(o);
    if (handled && o.inSlot) { const objs = canvas.getObjects(), sl = objs.find(x => x.slot && x.slot.id === o.inSlot); if (sl) canvas.moveTo(o, objs.indexOf(sl) + 1); } // photo sits on its frame, under the template's text
    canvas.setActiveObject(o); canvas.requestRenderAll();
    if (isMobile()) closeSheets(); // Canva-style: panel tucks away so you can edit what you just added
  }
  const shadow = (color, k, blur = 0) => new fabric.Shadow({ color, offsetX: u() * k, offsetY: u() * k, blur });
  function gradFill(o, [a, b]) {
    if (isArch(o)) return setProp(o, 'fill', a);
    o.set('fill', new fabric.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: 0, x2: o.width, y2: o.height }, colorStops: [{ offset: 0, color: a }, { offset: 1, color: b }] }));
  }

  /* ================= arch (curved) text ================= */
  function buildArch(d) {
    const letters = [...d.text].map(ch => new fabric.Text(ch, {
      fontFamily: d.fontFamily, fontSize: d.fontSize, fontWeight: d.fontWeight || 'normal', fill: d.fill, stroke: d.stroke,
      strokeWidth: d.strokeWidth || 0, paintFirst: 'stroke', strokeLineJoin: 'round', originX: 'center', originY: 'center',
    }));
    const sp = ((d.charSpacing || 0) / 1000) * d.fontSize;
    const widths = letters.map(l => l.width + sp), total = widths.reduce((a, b) => a + b, 0), c = d.curve / 100;
    let acc = 0;
    letters.forEach((l, i) => {
      const s = acc + widths[i] / 2 - total / 2; acc += widths[i];
      if (Math.abs(c) < 0.02) { l.set({ left: s, top: 0 }); return; }
      const R = total / (Math.abs(c) * Math.PI * 1.6), a = s / R, sg = Math.sign(c);
      l.set({ left: R * Math.sin(a), top: sg * R * (1 - Math.cos(a)), angle: (sg * a * 180) / Math.PI });
    });
    const g = new fabric.Group(letters, { originX: 'center', originY: 'center' });
    g.archData = { ...d }; return g;
  }
  function rebuildArch(o) {
    const n = buildArch(o.archData);
    n.set({ left: o.left, top: o.top, angle: o.angle, opacity: o.opacity, shadow: o.shadow, scaleX: o.scaleX, scaleY: o.scaleY, flipX: o.flipX, flipY: o.flipY });
    const idx = canvas.getObjects().indexOf(o);
    history.busy = true; canvas.remove(o); canvas.insertAt(n, idx); history.busy = false;
    canvas.setActiveObject(n); canvas.requestRenderAll(); return n;
  }
  const ARCH_KEYS = ['fill', 'stroke', 'strokeWidth', 'fontFamily', 'fontSize', 'fontWeight', 'charSpacing', 'text', 'curve'];
  function setProp(o, prop, val) {
    if (isArch(o) && ARCH_KEYS.includes(prop)) {
      if (prop === 'fill' && typeof val !== 'string') return o;
      o.archData[prop] = val; return active() === o ? rebuildArch(o) : o;
    }
    o.set(prop, val); return o;
  }
  const newArch = () => place(buildArch({ text: 'CURVED TEXT', fontFamily: 'Bangers', fontSize: u() * 0.12, fill: '#ffd23f', stroke: '#14110f', strokeWidth: u() * 0.008, curve: 60 }));
  $('#addArch').onclick = newArch;

  /* ================= add elements ================= */
  const starPoints = (r, n = 5, inner = 0.42) => Array.from({ length: n * 2 }, (_, i) => {
    const rad = i % 2 ? r * inner : r, a = (Math.PI / n) * i - Math.PI / 2;
    return { x: r + rad * Math.cos(a), y: r + rad * Math.sin(a) };
  });
  const SHAPES = {
    rect: () => new fabric.Rect({ width: u() * 0.4, height: u() * 0.28, fill: '#ff2d95', rx: u() * 0.02, ry: u() * 0.02, stroke: '#14110f', strokeWidth: u() * 0.006 }),
    circle: () => new fabric.Circle({ radius: u() * 0.18, fill: '#ffd23f', stroke: '#14110f', strokeWidth: u() * 0.006 }),
    triangle: () => new fabric.Triangle({ width: u() * 0.35, height: u() * 0.3, fill: '#22d3ee', stroke: '#14110f', strokeWidth: u() * 0.006 }),
    line: () => new fabric.Line([0, 0, u() * 0.4, 0], { stroke: '#14110f', strokeWidth: u() * 0.012, fill: '#14110f', strokeLineCap: 'round' }),
    star: () => new fabric.Polygon(starPoints(u() * 0.2), { fill: '#ff8a1f', stroke: '#14110f', strokeWidth: u() * 0.006, strokeLineJoin: 'round' }),
    heart: () => new fabric.Path('M 0 -60 C -100 -140 -190 -20 0 110 C 190 -20 100 -140 0 -60 z',
      { fill: '#ff2d95', stroke: '#14110f', strokeWidth: 5, scaleX: u() * 0.0016, scaleY: u() * 0.0016 }),
    hexagon: () => new fabric.Polygon(starPoints(u() * 0.2, 3, 1), { fill: '#8b5cf6', stroke: '#14110f', strokeWidth: u() * 0.006, strokeLineJoin: 'round' }),
    burst: () => new fabric.Polygon(starPoints(u() * 0.22, 12, 0.72), { fill: '#ffd23f', stroke: '#14110f', strokeWidth: u() * 0.006, strokeLineJoin: 'round' }),
    diamond: () => new fabric.Polygon([{ x: 0, y: 1 }, { x: 0.7, y: 0 }, { x: 1.4, y: 1 }, { x: 0.7, y: 2 }].map(p => ({ x: p.x * u() * 0.16, y: p.y * u() * 0.16 })), { fill: '#06d6a0', stroke: '#14110f', strokeWidth: u() * 0.006, strokeLineJoin: 'round' }),
    arrow: () => new fabric.Polygon([[0, 30], [120, 30], [120, 0], [200, 60], [120, 120], [120, 90], [0, 90]].map(([x, y]) => ({ x: x * u() * 0.002, y: y * u() * 0.002 })), { fill: '#3a86ff', stroke: '#14110f', strokeWidth: u() * 0.006, strokeLineJoin: 'round' }),
    bubble: () => new fabric.Path('M 20 0 H 180 Q 200 0 200 20 V 100 Q 200 120 180 120 H 90 L 50 160 L 60 120 H 20 Q 0 120 0 100 V 20 Q 0 0 20 0 z',
      { fill: '#ffffff', stroke: '#14110f', strokeWidth: 4, scaleX: u() * 0.002, scaleY: u() * 0.002 }),
    plus: () => new fabric.Polygon([[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1]].map(([x, y]) => ({ x: x * u() * 0.07, y: y * u() * 0.07 })), { fill: '#ef476f', stroke: '#14110f', strokeWidth: u() * 0.006, strokeLineJoin: 'round' }),
  };
  const BACKDROPS = [['#ff2d95', '#ff8a1f'], ['#8b5cf6', '#22d3ee'], ['#0f172a', '#334155'], ['#ffd23f', '#6d4aff'], ['#06d6a0', '#3a86ff'], ['#fdf2f8', '#fce7f3']];
  function addBackdrop([a, b]) {
    const r = new fabric.Rect({ left: 0, top: 0, width: W, height: H, selectable: true, fill: new fabric.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: 0, x2: W, y2: H }, colorStops: [{ offset: 0, color: a }, { offset: 1, color: b }] }) });
    canvas.add(r); canvas.sendToBack(r); canvas.setActiveObject(r); canvas.requestRenderAll(); toast('Backdrop added (sent to back)', '🌈');
  }
  const TEXT = { heading: ['Add a heading', 0.1, 'bold'], sub: ['Add a subheading', 0.06, 'normal'], body: ['Add a little bit of body text', 0.035, 'normal'] };
  function addText(kind, extra = {}) {
    const [t, k, weight] = TEXT[kind];
    const o = new fabric.Textbox(t, { width: W * 0.7, fontSize: Math.round(u() * k), fontWeight: weight, fontFamily: 'Fredoka', fill: '#14110f', textAlign: 'center', ...extra });
    place(o); return o;
  }
  $$('[data-text]').forEach(b => b.onclick = () => addText(b.dataset.text));
  const TSTYLES = () => ({
    pop: { text: 'POP!', fontFamily: 'Bangers', fill: '#ffd23f', stroke: '#14110f', strokeWidth: u() * 0.012, paintFirst: 'stroke', strokeLineJoin: 'round', fontSize: u() * 0.2, shadow: shadow('#14110f', 0.012) },
    retro: { text: 'Retro Vibes', fontFamily: 'Pacifico', fill: '#ff2d95', fontSize: u() * 0.14, shadow: shadow('#14110f', 0.008) },
    neon: { text: 'NEON', fontFamily: 'Righteous', fill: '#ffffff', fontSize: u() * 0.18, shadow: new fabric.Shadow({ color: '#22d3ee', blur: u() * 0.04 }), stroke: '#22d3ee', strokeWidth: u() * 0.004 },
    stamp: { text: 'ORIGINAL', fontFamily: 'Anton', fill: '#14110f', fontSize: u() * 0.15, charSpacing: 200 },
    grad: { text: 'GRADIENT', fontFamily: 'Bangers', fill: '#ff2d95', fontSize: u() * 0.2, stroke: '#14110f', strokeWidth: u() * 0.01, paintFirst: 'stroke', strokeLineJoin: 'round' },
  });
  $$('[data-tstyle]').forEach(b => b.onclick = () => {
    const { text, ...rest } = TSTYLES()[b.dataset.tstyle];
    const o = new fabric.Textbox(text, { width: W * 0.8, textAlign: 'center', fontWeight: 'normal', ...rest });
    place(o); if (b.dataset.tstyle === 'grad') { gradFill(o, pick(GRADS)); canvas.requestRenderAll(); }
  });

  const DEFAULT_ADJ = () => ({ brightness: 0, contrast: 0, saturation: 0, vibrance: 0, temperature: 0, hue: 0, sharpen: 0, blur: 0, whiteDist: 0, preset: '' });
  function addImageFromURL(url) {
    fabric.Image.fromURL(url, img => {
      const s = Math.min((W * 0.8) / img.width, (H * 0.8) / img.height, 1);
      img.set({ adj: DEFAULT_ADJ() }).scale(s); place(img); toast('Image added', '🖼️');
    });
  }
  const readFiles = files => [...files].filter(f => f.type.startsWith('image/')).forEach(f => {
    const r = new FileReader(); r.onload = () => addImageFromURL(r.result); r.readAsDataURL(f);
  });
  $('#imgUpload').onchange = e => { readFiles(e.target.files); e.target.value = ''; };
  $('#stage').addEventListener('dragover', e => { e.preventDefault(); $('#dropzone').classList.add('over'); });
  $('#stage').addEventListener('dragleave', () => $('#dropzone').classList.remove('over'));
  $('#stage').addEventListener('drop', e => { e.preventDefault(); $('#dropzone').classList.remove('over'); readFiles(e.dataTransfer.files); });
  document.addEventListener('paste', e => readFiles(e.clipboardData?.files || []));

  /* ================= templates ================= */
  let B = canvas; // template target: the live canvas, or an off-screen canvas while rendering thumbnails
  function clearAll(bg = '') {
    if (B !== canvas) { B.clear(); B.backgroundColor = bg; return; }
    history.busy = true; canvas.clear(); history.busy = false;
    canvas.setBackgroundColor(bg, () => { syncBg(); canvas.renderAll(); });
  }
  const T = (text, o) => new fabric.Textbox(text, { fontFamily: 'Fredoka', textAlign: 'center', originX: 'center', originY: 'center', width: W * 0.8, ...o });
  const outline = (c = '#14110f') => ({ stroke: c, strokeWidth: u() * 0.012, paintFirst: 'stroke', strokeLineJoin: 'round' });
  const TEMPLATES = {
    blank: () => clearAll(B.backgroundColor || ''),
    slogan: () => {
      clearAll('');
      B.add(T('GOOD', { left: W / 2, top: H * 0.3, fontFamily: 'Bangers', fontSize: u() * 0.3, fill: '#ffd23f', ...outline(), shadow: shadow('#14110f', 0.014) }));
      B.add(T('VIBES', { left: W / 2, top: H * 0.5, fontFamily: 'Bangers', fontSize: u() * 0.3, fill: '#ff2d95', ...outline(), shadow: shadow('#14110f', 0.014) }));
      B.add(T('ONLY ✦ GOOD ✦ ONLY', { left: W / 2, top: H * 0.68, fontFamily: 'Anton', fontSize: u() * 0.05, fill: '#22d3ee', charSpacing: 300, ...outline('#14110f') }));
    },
    badge: () => {
      clearAll('');
      const r = u() * 0.38;
      B.add(new fabric.Circle({ left: W / 2, top: H / 2, radius: r, originX: 'center', originY: 'center', fill: '#3a86ff', stroke: '#14110f', strokeWidth: u() * 0.014 }));
      B.add(new fabric.Circle({ left: W / 2, top: H / 2, radius: r * 0.86, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ffd23f', strokeWidth: u() * 0.008, strokeDashArray: [u() * 0.02, u() * 0.02] }));
      B.add(T('★', { left: W / 2, top: H / 2 - r * 0.55, width: r, fontSize: r * 0.35, fill: '#ffd23f' }));
      B.add(T('MADE WITH', { left: W / 2, top: H / 2 - r * 0.18, width: r * 1.5, fontFamily: 'Anton', fontSize: r * 0.2, fill: '#fff', charSpacing: 300 }));
      B.add(T('LOVE', { left: W / 2, top: H / 2 + r * 0.2, width: r * 1.5, fontFamily: 'Bangers', fontSize: r * 0.5, fill: '#ff2d95', ...outline('#ffffff') }));
      B.add(T('EST. 2025', { left: W / 2, top: H / 2 + r * 0.6, width: r * 1.5, fontFamily: 'Anton', fontSize: r * 0.14, fill: '#fff', charSpacing: 400 }));
    },
    mug: () => {
      clearAll('');
      B.add(T('Best Mom Ever', { left: W / 2, top: H * 0.42, width: W * 0.36, fontFamily: 'Pacifico', fontSize: H * 0.2, fill: '#ff2d95', shadow: new fabric.Shadow({ color: '#14110f', offsetX: H * 0.012, offsetY: H * 0.012, blur: 0 }) }));
      B.add(T('♥  ♥  ♥', { left: W / 2, top: H * 0.78, width: W * 0.3, fontSize: H * 0.1, fill: '#ff2d95' }));
      B.add(T('✦', { left: W * 0.25, top: H * 0.5, width: 200, fontSize: H * 0.2, fill: '#ffd23f' }));
      B.add(T('✦', { left: W * 0.75, top: H * 0.5, width: 200, fontSize: H * 0.2, fill: '#22d3ee' }));
    },
  };
  const rect = (l, t, w, h, fill, o = {}) => new fabric.Rect({ left: l * W, top: t * H, width: w * W, height: h * H, fill, ...o });
  const tx = (text, cx, cy, wf, size, o = {}) => T(text, { left: cx * W, top: cy * H, width: wf * W, fontSize: size, ...o });
  const bubble = (cx, cy, r, fill) => new fabric.Circle({ left: cx * W, top: cy * H, radius: r, fill, originX: 'center', originY: 'center' });
  Object.assign(TEMPLATES, {
    poster: () => {
      clearAll('#fff7e6'); const k = u();
      B.add(rect(0, 0, 1, 0.4, '#ff2d95')); B.add(bubble(0.84, 0.07, k * 0.2, '#ffd23f')); B.add(bubble(0.1, 0.4, k * 0.09, '#22d3ee'));
      B.add(tx('BIG', 0.5, 0.12, 0.9, k * 0.2, { fontFamily: 'Bangers', fill: '#fff', ...outline(), shadow: shadow('#14110f', 0.012) }));
      B.add(tx('EVENT', 0.5, 0.27, 0.9, k * 0.2, { fontFamily: 'Bangers', fill: '#ffd23f', ...outline(), shadow: shadow('#14110f', 0.012) }));
      B.add(tx('SATURDAY · 7 PM', 0.5, 0.5, 0.85, k * 0.055, { fontFamily: 'Anton', fill: '#14110f', charSpacing: 200 }));
      B.add(tx('Live music, great food and good company.\nBring your friends and your dancing shoes!', 0.5, 0.6, 0.78, k * 0.036, { fill: '#14110f' }));
      B.add(rect(0, 0.86, 1, 0.14, '#14110f')); B.add(tx('www.yourwebsite.com', 0.5, 0.93, 0.8, k * 0.04, { fill: '#fff', fontFamily: 'Anton', charSpacing: 200 }));
    },
    flyer: () => {
      clearAll('#3a86ff'); const k = u();
      B.add(rect(0.07, 0.06, 0.86, 0.88, '#ffffff', { rx: k * 0.04, ry: k * 0.04 }));
      B.add(bubble(0.5, 0.2, k * 0.17, '#ffd23f'));
      B.add(tx('GRAND\nOPENING', 0.5, 0.2, 0.7, k * 0.1, { fontFamily: 'Bangers', fill: '#ff2d95', ...outline('#14110f'), lineHeight: 0.9 }));
      B.add(tx('Free coffee · Live DJ · Giveaways', 0.5, 0.45, 0.76, k * 0.048, { fontFamily: 'Anton', fill: '#14110f' }));
      B.add(tx('Join us for a day full of surprises.\n12 Main Street, Your City', 0.5, 0.58, 0.72, k * 0.04, { fill: '#334155' }));
      B.add(rect(0.2, 0.74, 0.6, 0.1, '#ff2d95', { rx: k * 0.05, ry: k * 0.05 })); B.add(tx('VISIT US TODAY', 0.5, 0.79, 0.6, k * 0.045, { fontFamily: 'Anton', fill: '#fff', charSpacing: 150 }));
    },
    bizcard: () => {
      clearAll('#ffffff'); const k = H;
      B.add(rect(0, 0, 0.36, 1, '#8b5cf6')); B.add(tx('✦', 0.18, 0.5, 0.3, k * 0.5, { fill: '#ffd23f', fontFamily: 'Arial' }));
      B.add(tx('Your Name', 0.68, 0.3, 0.58, k * 0.16, { fontWeight: 'bold', fill: '#14110f' }));
      B.add(tx('CREATIVE DIRECTOR', 0.68, 0.46, 0.58, k * 0.065, { fontFamily: 'Anton', fill: '#8b5cf6', charSpacing: 200 }));
      B.add(tx('+1 234 567 890\nhello@yourname.com\nwww.yourname.com', 0.68, 0.74, 0.58, k * 0.07, { fill: '#475569', lineHeight: 1.3 }));
    },
    invite: () => {
      clearAll('#fff0f6'); const k = u();
      B.add(rect(0.05, 0.04, 0.9, 0.92, 'transparent', { stroke: '#ff2d95', strokeWidth: k * 0.01 })); B.add(rect(0.07, 0.055, 0.86, 0.89, 'transparent', { stroke: '#ff2d95', strokeWidth: k * 0.004 }));
      B.add(tx('You are invited to', 0.5, 0.2, 0.7, k * 0.05, { fontFamily: 'Pacifico', fill: '#be185d' }));
      B.add(tx('Sarah’s\nBirthday', 0.5, 0.4, 0.8, k * 0.15, { fontFamily: 'Pacifico', fill: '#ff2d95', lineHeight: 1 , shadow: shadow('#ffd23f', 0.006) }));
      B.add(tx('SATURDAY · JUNE 14 · 4 PM', 0.5, 0.66, 0.8, k * 0.04, { fontFamily: 'Anton', fill: '#14110f', charSpacing: 200 }));
      B.add(tx('Garden Party · 12 Rose Lane\nRSVP: hello@email.com', 0.5, 0.78, 0.8, k * 0.036, { fill: '#475569' })); B.add(tx('♥', 0.5, 0.9, 0.2, k * 0.07, { fill: '#ff2d95' }));
    },
    certificate: () => {
      clearAll('#fffdf5'); const k = H;
      B.add(rect(0.03, 0.05, 0.94, 0.9, 'transparent', { stroke: '#c9a227', strokeWidth: k * 0.02 })); B.add(rect(0.045, 0.085, 0.91, 0.83, 'transparent', { stroke: '#c9a227', strokeWidth: k * 0.006 }));
      B.add(tx('CERTIFICATE', 0.5, 0.25, 0.8, k * 0.13, { fontFamily: 'Anton', fill: '#14110f', charSpacing: 250 })); B.add(tx('OF ACHIEVEMENT', 0.5, 0.38, 0.8, k * 0.05, { fontFamily: 'Anton', fill: '#c9a227', charSpacing: 400 }));
      B.add(tx('This certificate is proudly presented to', 0.5, 0.5, 0.8, k * 0.045, { fill: '#475569' })); B.add(tx('Your Name Here', 0.5, 0.62, 0.8, k * 0.12, { fontFamily: 'Pacifico', fill: '#be185d' }));
      B.add(rect(0.3, 0.74, 0.4, 0.003, '#14110f')); B.add(tx('for outstanding effort and dedication', 0.5, 0.8, 0.8, k * 0.04, { fill: '#475569' })); B.add(tx('★', 0.5, 0.9, 0.2, k * 0.08, { fill: '#c9a227', fontFamily: 'Arial' }));
    },
    menu: () => {
      clearAll('#1b1035'); const k = u(), item = (n, p, y) => [tx(n, 0.37, y, 0.5, k * 0.042, { textAlign: 'left', fill: '#fff' }), tx(p, 0.83, y, 0.2, k * 0.042, { fill: '#ffd23f', fontFamily: 'Anton' })];
      B.add(tx('MENU', 0.5, 0.12, 0.8, k * 0.18, { fontFamily: 'Bangers', fill: '#ffd23f', ...outline('#ff2d95'), shadow: shadow('#ff2d95', 0.01) }));
      [['Margherita', '$9', 0.3], ['Pepperoni', '$11', 0.38], ['Veggie Supreme', '$12', 0.46], ['Garlic Bread', '$5', 0.54], ['Iced Tea', '$3', 0.62], ['Brownie', '$6', 0.7]].forEach(([n, p, y]) => B.add(...item(n, p, y)));
      B.add(tx('✦ ✦ ✦', 0.5, 0.88, 0.5, k * 0.05, { fill: '#22d3ee', fontFamily: 'Arial' }));
    },
    quote: () => {
      clearAll('#1e1b4b'); const k = u();
      B.add(rect(0.06, 0.08, 0.88, 0.84, 'transparent', { stroke: '#a78bfa', strokeWidth: k * 0.006 })); B.add(tx('“', 0.5, 0.26, 0.4, k * 0.3, { fill: '#a78bfa', fontFamily: 'Georgia' }));
      B.add(tx('Design is thinking made visual.', 0.5, 0.5, 0.7, k * 0.07, { fill: '#fff', fontFamily: 'Georgia', fontStyle: 'italic' })); B.add(tx('— Saul Bass', 0.5, 0.74, 0.5, k * 0.036, { fill: '#c4b5fd' }));
    },
    sale: () => {
      clearAll('#fde047'); const k = u();
      B.add(bubble(0.5, 0.5, k * 0.38, '#dc2626')); B.add(tx('MEGA SALE', 0.5, 0.38, 0.7, k * 0.09, { fill: '#fff', fontFamily: 'Impact' })); B.add(tx('50% OFF', 0.5, 0.55, 0.7, k * 0.14, { fill: '#fde047', fontFamily: 'Impact' })); B.add(tx('This weekend only', 0.5, 0.72, 0.7, k * 0.035, { fill: '#fff' }));
    },
  });
  const gradRect = (l, t, w, h, c1, c2, o = {}) => new fabric.Rect({ left: l * W, top: t * H, width: w * W, height: h * H, fill: new fabric.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: 0, x2: w * W, y2: h * H }, colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }] }), ...o });
  Object.assign(TEMPLATES, {
    'mug-coffee': () => {
      clearAll(''); const k = H; B.add(rect(0, 0, 1, 1, '#2b1810'));
      B.add(tx('BUT FIRST,', 0.5, 0.26, 0.5, k * 0.15, { fontFamily: 'Anton', fill: '#ffd23f', charSpacing: 250 })); B.add(tx('Coffee', 0.5, 0.62, 0.5, k * 0.4, { fontFamily: 'Pacifico', fill: '#ffffff' }));
      [0.14, 0.86].forEach(x => B.add(tx('☕', x, 0.5, 0.12, k * 0.3, { fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' })));
      [[0.3, 0.12], [0.72, 0.86], [0.64, 0.14], [0.36, 0.9]].forEach(([x, y]) => B.add(tx('✦', x, y, 0.05, k * 0.09, { fill: '#6d4aff', fontFamily: 'Arial' })));
    },
    'mug-dad': () => {
      clearAll(''); const k = H; B.add(rect(0, 0, 1, 1, '#1e3a8a')); B.add(rect(0, 0.82, 1, 0.18, '#ffd23f')); B.add(rect(0, 0, 1, 0.1, '#6d4aff'));
      B.add(tx('BEST', 0.5, 0.3, 0.5, k * 0.3, { fontFamily: 'Bangers', fill: '#ffd23f', ...outline('#0b1b4a'), shadow: shadow('#0b1b4a', 0.02) })); B.add(tx('DAD EVER', 0.5, 0.62, 0.6, k * 0.3, { fontFamily: 'Bangers', fill: '#ffffff', ...outline('#0b1b4a'), shadow: shadow('#0b1b4a', 0.02) }));
      B.add(tx('★  ★  ★', 0.5, 0.91, 0.4, k * 0.09, { fill: '#1e3a8a', fontFamily: 'Arial' }));
    },
    'mug-floral': () => {
      clearAll(''); const k = H; B.add(rect(0, 0, 1, 1, '#fff1f6'));
      [[0.08, 0.2, '#fbcfe8'], [0.2, 0.8, '#fde68a'], [0.9, 0.25, '#c4b5fd'], [0.78, 0.85, '#fbcfe8'], [0.35, 0.1, '#a7f3d0'], [0.62, 0.9, '#fde68a'], [0.5, 0.5, '#fce7f3']].forEach(([x, y, c], i) => B.add(bubble(x, y, k * (0.14 + (i % 3) * 0.05), c)));
      B.add(tx('Hello', 0.5, 0.36, 0.5, k * 0.28, { fontFamily: 'Pacifico', fill: '#be185d' })); B.add(tx('Sunshine', 0.5, 0.68, 0.5, k * 0.28, { fontFamily: 'Pacifico', fill: '#ea580c' }));
    },
    'mug-name': () => {
      clearAll(''); const k = H; B.add(gradRect(0, 0, 1, 1, '#7c3aed', '#6d4aff'));
      B.add(tx('Sarah', 0.5, 0.5, 0.6, k * 0.62, { fontFamily: 'Pacifico', fill: '#ffffff', shadow: shadow('#4c1d95', 0.02) }));
      [[0.12, 0.25], [0.88, 0.7], [0.2, 0.8], [0.8, 0.2]].forEach(([x, y]) => B.add(tx('✦', x, y, 0.06, k * 0.16, { fill: '#ffd23f', fontFamily: 'Arial' })));
    },
    'tee-retro': () => {
      clearAll(''); const k = u(); B.add(new fabric.Circle({ left: W / 2, top: H * 0.38, radius: k * 0.32, originX: 'center', originY: 'center', fill: new fabric.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: -k * 0.32, x2: 0, y2: k * 0.32 }, colorStops: [{ offset: 0, color: '#ffd23f' }, { offset: 1, color: '#ff4d8d' }] }) }));
      for (let i = 0; i < 5; i++) B.add(rect(0.2, 0.42 + i * 0.035, 0.6, 0.012 + i * 0.006, '#7c3aed'));
      B.add(tx('SUMMER', 0.5, 0.73, 0.9, k * 0.17, { fontFamily: 'Bangers', fill: '#7c3aed', ...outline('#ffffff'), charSpacing: 80 })); B.add(tx('VIBES ONLY', 0.5, 0.84, 0.9, k * 0.075, { fontFamily: 'Anton', fill: '#6d4aff', charSpacing: 400 }));
    },
    'tee-mono': () => {
      clearAll(''); const k = u();
      B.add(tx('STAY', 0.5, 0.3, 0.9, k * 0.34, { fontFamily: 'Anton', fill: '#6d4aff', ...outline('#4c1d95'), shadow: shadow('#4c1d95', 0.012) })); B.add(tx('WILD', 0.5, 0.58, 0.9, k * 0.34, { fontFamily: 'Anton', fill: '#ffd23f', ...outline('#4c1d95'), shadow: shadow('#4c1d95', 0.012) }));
      B.add(tx('— BORN TO EXPLORE —', 0.5, 0.78, 0.9, k * 0.05, { fontFamily: 'Anton', fill: '#7c3aed', charSpacing: 300 }));
    },
    'tee-badge': () => {
      clearAll(''); const r = u() * 0.36; B.add(bubble(0.5, 0.5, r, '#7c3aed')); B.add(new fabric.Circle({ left: W / 2, top: H / 2, radius: r * 0.88, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ffd23f', strokeWidth: u() * 0.008 }));
      B.add(tx('ADVENTURE', 0.5, 0.38, 0.6, r * 0.34, { fontFamily: 'Anton', fill: '#ffffff', charSpacing: 300 })); B.add(tx('CLUB', 0.5, 0.52, 0.6, r * 0.55, { fontFamily: 'Bangers', fill: '#6d4aff', ...outline('#ffffff') })); B.add(tx('EST. 1999', 0.5, 0.66, 0.6, r * 0.16, { fontFamily: 'Anton', fill: '#ffd23f', charSpacing: 400 }));
    },
    'tee-bold': () => {
      clearAll(''); const k = u(); B.add(tx('HUSTLE', 0.5, 0.42, 1, k * 0.3, { fontFamily: 'Anton', fill: '#ffd23f', ...outline('#7c3aed'), shadow: shadow('#7c3aed', 0.02), charSpacing: 20 }));
      B.add(tx('DREAM BIG · WORK HARD · REPEAT', 0.5, 0.6, 0.9, k * 0.045, { fontFamily: 'Anton', fill: '#6d4aff', charSpacing: 250 }));
    },
    'ig-sale': () => {
      clearAll('#4c1d95'); const k = u(); B.add(bubble(0.5, 0.5, k * 0.4, '#6d4aff')); B.add(bubble(0.5, 0.5, k * 0.34, '#ffd23f'));
      B.add(tx('50%', 0.5, 0.46, 0.7, k * 0.26, { fontFamily: 'Anton', fill: '#4c1d95' })); B.add(tx('OFF', 0.5, 0.64, 0.5, k * 0.11, { fontFamily: 'Anton', fill: '#6d4aff', charSpacing: 400 })); B.add(tx('THIS WEEKEND ONLY', 0.5, 0.92, 0.8, k * 0.04, { fontFamily: 'Anton', fill: '#ffd23f', charSpacing: 300 }));
    },
    'ig-announce': () => {
      clearAll('#fff7e6'); const k = u(); B.add(rect(0, 0.62, 1, 0.38, '#7c3aed')); B.add(rect(0, 0.58, 1, 0.05, '#ffd23f'));
      B.add(tx('NEW', 0.5, 0.2, 0.8, k * 0.2, { fontFamily: 'Bangers', fill: '#6d4aff', ...outline('#14110f') })); B.add(tx('ARRIVAL', 0.5, 0.4, 0.8, k * 0.2, { fontFamily: 'Bangers', fill: '#7c3aed', ...outline('#14110f') }));
      B.add(tx('Fresh designs, just for you.\nShop the collection today.', 0.5, 0.78, 0.8, k * 0.05, { fill: '#ffffff' }));
    },
    'story-promo': () => {
      clearAll('#ffffff'); B.add(gradRect(0, 0, 1, 1, '#7c3aed', '#6d4aff')); const k = W;
      B.add(tx('WEEKEND', 0.5, 0.28, 0.9, k * 0.2, { fontFamily: 'Bangers', fill: '#ffd23f', ...outline('#4c1d95'), shadow: shadow('#4c1d95', 0.012) })); B.add(tx('SPECIAL', 0.5, 0.38, 0.9, k * 0.2, { fontFamily: 'Bangers', fill: '#ffffff', ...outline('#4c1d95'), shadow: shadow('#4c1d95', 0.012) }));
      B.add(tx('Up to 40% off everything', 0.5, 0.55, 0.8, k * 0.065, { fill: '#ffffff' })); B.add(rect(0.2, 0.72, 0.6, 0.07, '#ffd23f', { rx: k * 0.04, ry: k * 0.04 })); B.add(tx('SHOP NOW', 0.5, 0.755, 0.6, k * 0.05, { fontFamily: 'Anton', fill: '#4c1d95', charSpacing: 200 }));
    },
    'ig-quote2': () => {
      clearAll('#6d4aff'); const k = u(); B.add(tx('“', 0.5, 0.22, 0.4, k * 0.3, { fill: '#ffd23f', fontFamily: 'Georgia' }));
      B.add(tx('Create something\nyou would love\nto print.', 0.5, 0.52, 0.8, k * 0.09, { fontFamily: 'Pacifico', fill: '#ffffff', lineHeight: 1.1 })); B.add(tx('@yourbrand', 0.5, 0.86, 0.5, k * 0.04, { fontFamily: 'Anton', fill: '#4c1d95', charSpacing: 300 }));
    },
  });
  const TEMPLATE_META = {
    poster: { n: 'Event poster', cat: 'print', p: 'A4' }, flyer: { n: 'Grand opening flyer', cat: 'print', p: 'Flyer' }, bizcard: { n: 'Creative business card', cat: 'print', p: 'Business card' },
    invite: { n: 'Birthday invitation', cat: 'print', p: 'Invitation' }, certificate: { n: 'Gold certificate', cat: 'print', p: 'Certificate' }, menu: { n: 'Pizza menu', cat: 'print', p: 'Menu', pro: true },
    mug: { n: 'Best mom mug', cat: 'mug', p: '11 oz mug wrap' }, 'mug-coffee': { n: 'But first, coffee', cat: 'mug', p: '11 oz mug wrap' }, 'mug-dad': { n: 'Best dad ever', cat: 'mug', p: '11 oz mug wrap' },
    'mug-floral': { n: 'Hello sunshine', cat: 'mug', p: '11 oz mug wrap', pro: true }, 'mug-name': { n: 'Personalised name mug', cat: 'mug', p: '11 oz mug wrap' },
    slogan: { n: 'Good vibes tee', cat: 'tshirt', p: 'T-shirt front' }, badge: { n: 'Made with love badge', cat: 'tshirt', p: 'T-shirt front' }, 'tee-retro': { n: 'Retro summer sun', cat: 'tshirt', p: 'T-shirt front' },
    'tee-mono': { n: 'Stay wild', cat: 'tshirt', p: 'T-shirt front' }, 'tee-badge': { n: 'Adventure club badge', cat: 'tshirt', p: 'T-shirt front', pro: true }, 'tee-bold': { n: 'Hustle bold type', cat: 'tshirt', p: 'T-shirt front' },
    quote: { n: 'Quote card', cat: 'social', p: 'Instagram post' }, sale: { n: 'Mega sale', cat: 'social', p: 'Instagram post' }, 'ig-sale': { n: 'Weekend sale', cat: 'social', p: 'Instagram post' },
    'ig-announce': { n: 'New arrival', cat: 'social', p: 'Instagram post', pro: true }, 'ig-quote2': { n: 'Orange quote', cat: 'social', p: 'Instagram post' }, 'story-promo': { n: 'Story promo', cat: 'social', p: 'Story / Reel / TikTok' },
  };
  const productByName = n => PRODUCTS.find(x => x.name === n) || PRODUCTS[0];
  // Render a template into an off-screen canvas (used for Home-screen thumbnails) without touching the open design.
  function renderTemplateThumb(name, p, width = 300) {
    const sv = { W, H, DPI, B }; let sc2;
    try {
      W = p.w; H = p.h; DPI = p.dpi || 300; const k = width / W;
      sc2 = new fabric.StaticCanvas(null, { width: Math.round(W * k), height: Math.round(H * k), renderOnAddRemove: false }); sc2.setZoom(k); B = sc2;
      TEMPLATES[name](); sc2.renderAll(); return sc2.toDataURL({ format: 'png' });
    } catch (e) { console.warn('thumb failed', name, e); return null; } finally { ({ W, H, DPI, B } = sv); sc2?.dispose?.(); }
  }
  function loadTemplate(name) {
    history.busy = true; TEMPLATES[name](); history.busy = false;
    canvas.discardActiveObject(); canvas.renderAll(); commit(); refreshProps();
    if (isMobile()) closeSheets();
  }
  $$('[data-template]').forEach(b => b.onclick = () => {
    const had = canvas.getObjects().length; loadTemplate(b.dataset.template);
    if (had) toast('Quick start applied', '', { label: 'Undo', fn: undo });
  });

  /* ================= magic: palettes, surprise, sparkle ================= */
  const lum = c => { const [r, g, b] = new fabric.Color(c).getSource(); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  function applyPalette(p, quiet) {
    const map = {}; let n = 0, changed = 0;
    const remap = v => {
      if (typeof v !== 'string' || !v || v === 'transparent') return null;
      const key = toHex(v), l = lum(key);
      if (l < 0.12 || l > 0.92) return null; // keep black / white neutrals
      return map[key] ??= p.c[n++ % 4];
    };
    history.busy = true;
    [...canvas.getObjects()].forEach(o => {
      if (isArch(o)) {
        const f = remap(o.archData.fill), s = remap(o.archData.stroke);
        if (f) o.archData.fill = f; if (s) o.archData.stroke = s;
        if (f || s) { const nn = buildArch(o.archData); nn.set({ left: o.left, top: o.top, angle: o.angle, scaleX: o.scaleX, scaleY: o.scaleY, shadow: o.shadow }); const i = canvas.getObjects().indexOf(o); canvas.remove(o); canvas.insertAt(nn, i); changed++; }
        return;
      }
      if (isImage(o)) return;
      const f = remap(o.fill), s = remap(o.stroke);
      if (f) { o.set('fill', f); changed++; } if (s) { o.set('stroke', s); changed++; }
    });
    history.busy = false;
    canvas.discardActiveObject(); canvas.requestRenderAll(); commit(); refreshProps();
    if (!quiet) toast(changed ? `${p.n} palette applied` : 'Nothing to recolour yet', '🎨');
  }
  $('#palettes').innerHTML = PALETTES.map((p, i) => `<button class="palette" data-pal="${i}"><b>${p.n}</b><span>${p.c.map(c => `<i style="background:${c}"></i>`).join('')}</span></button>`).join('');
  $$('[data-pal]').forEach(b => b.onclick = () => applyPalette(PALETTES[b.dataset.pal]));
  $('#shuffleColors').onclick = () => applyPalette(pick(PALETTES));
  function surprise() {
    loadTemplate(pick(['slogan', 'badge', 'mug']));
    const p = pick(PALETTES); applyPalette(p, true);
    confetti(); toast(`Surprise! ${p.n} vibes`, '🎲');
  }
  $('#surprise').onclick = surprise;
  function sparkle() {
    const cols = pick(PALETTES).c; history.busy = true;
    for (let i = 0; i < 12; i++) {
      canvas.add(new fabric.Text(pick(['✦', '★', '✧', '✺']), {
        left: Math.random() * W, top: Math.random() * H, originX: 'center', originY: 'center', angle: Math.random() * 60 - 30,
        fontSize: u() * (0.03 + Math.random() * 0.07), fill: pick(cols), fontFamily: 'Arial',
      }));
    }
    history.busy = false; canvas.requestRenderAll(); commit(); toast('Sparkle!', '✨');
  }
  $('#sparkle').onclick = sparkle;
  $('#stickerOutline').onclick = () => {
    const ts = targets().filter(o => !isImage(o));
    if (!ts.length) return toast('Select some text or a shape first', '👆');
    ts.forEach(o => { setProp(o, 'stroke', '#ffffff'); const t = ts.length === 1 ? active() : o; setProp(t, 'strokeWidth', u() * 0.02); if (!isArch(t)) t.set({ paintFirst: 'stroke', strokeLineJoin: 'round' }); });
    canvas.requestRenderAll(); commit(); refreshProps(); toast('Sticker outline added', '🏷️');
  };

  /* ================= print tools ================= */
  function pack() {
    const objs = canvas.getObjects().filter(o => !o.locked && o.visible);
    if (!objs.length) return;
    canvas.discardActiveObject();
    const gap = Math.round(DPI * 0.25);
    const boxes = objs.map(o => ({ o, r: o.getBoundingRect(true, true) })).sort((a, b) => b.r.height - a.r.height);
    let x = gap, y = gap, rowH = 0;
    boxes.forEach(({ o, r }) => {
      if (x + r.width > W - gap && x > gap) { x = gap; y += rowH + gap; rowH = 0; }
      o.set({ left: o.left + (x - r.left), top: o.top + (y - r.top) }); o.setCoords();
      x += r.width + gap; rowH = Math.max(rowH, r.height);
    });
    canvas.requestRenderAll(); commit();
    if (y + rowH > H - gap) toast('Not everything fits — try a longer gang sheet', '⚠️'); else toast('Packed neatly', '🧩');
  }
  $('#pack').onclick = pack;
  async function cloneN(o, n) {
    history.busy = true;
    for (let i = 1; i < n; i++) await new Promise(res => o.clone(c => { canvas.add(c); res(); }, EXTRA));
    history.busy = false;
  }
  $('#copies').onclick = async () => {
    const o = active();
    if (!o || o.type === 'activeSelection') return toast('Click one design first', '👆');
    const n = parseInt(prompt('How many in total (including this one)?', '4'), 10);
    if (!(n > 1 && n <= 200)) return;
    await cloneN(o, n); pack();
  };
  $('#fillSheet').onclick = async () => {
    const o = active();
    if (!o || o.type === 'activeSelection') return toast('Click one design first', '👆');
    const gap = DPI * 0.25, r = o.getBoundingRect(true, true);
    const n = Math.floor((W - gap) / (r.width + gap)) * Math.floor((H - gap) / (r.height + gap));
    if (n < 2) return toast('Only one fits on this sheet', 'ℹ️');
    await cloneN(o, n); pack(); confetti(innerWidth / 2, innerHeight / 2, 80); toast(`Filled the sheet with ${n}`, '🪄');
  };
  function refreshUsage() {
    if ($('[data-panel=print]').hidden) return;
    const area = canvas.getObjects().filter(o => o.visible).reduce((s, o) => { const r = o.getBoundingRect(true, true); return s + r.width * r.height; }, 0);
    const pct = Math.min(100, Math.round((area / (W * H)) * 100));
    $('#usageBar').style.width = pct + '%'; $('#usageText').textContent = `Sheet usage: ${pct}%`;
  }

  /* ================= arrange ================= */
  const act = fn => () => { const o = active(); if (!o) return; fn(o); canvas.requestRenderAll(); commit(); refreshProps(); };
  $('#forward').onclick = act(o => canvas.bringForward(o));
  $('#backward').onclick = act(o => canvas.sendBackwards(o));
  $('#toFront').onclick = act(o => canvas.bringToFront(o));
  $('#toBack').onclick = act(o => canvas.sendToBack(o));
  $('#flipH').onclick = act(o => o.set('flipX', !o.flipX));
  $('#flipV').onclick = act(o => o.set('flipY', !o.flipY));
  const toggleLock = act(o => {
    const v = !o.locked;
    o.set({ locked: v, lockMovementX: v, lockMovementY: v, lockRotation: v, lockScalingX: v, lockScalingY: v, hasControls: !v });
  });
  $('#lock').onclick = toggleLock;
  function remove() {
    const o = active(); if (!o || o.isEditing) return;
    (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(x => canvas.remove(x));
    canvas.discardActiveObject(); canvas.requestRenderAll();
  }
  $('#delete').onclick = remove;
  function duplicate() {
    const o = active(); if (!o) return;
    o.clone(c => {
      canvas.discardActiveObject();
      c.set({ left: o.left + 40, top: o.top + 40, evented: true });
      if (c.type === 'activeSelection') { c.canvas = canvas; c.forEachObject(x => canvas.add(x)); c.setCoords(); } else canvas.add(c);
      canvas.setActiveObject(c); canvas.requestRenderAll();
    }, EXTRA);
  }
  $('#duplicate').onclick = duplicate;
  $$('[data-align]').forEach(b => b.onclick = act(o => {
    const r = o.getBoundingRect(true, true), a = b.dataset.align;
    const dx = { left: -r.left, center: W / 2 - (r.left + r.width / 2), right: W - r.left - r.width }[a] ?? 0;
    const dy = { top: -r.top, middle: H / 2 - (r.top + r.height / 2), bottom: H - r.top - r.height }[a] ?? 0;
    o.set({ left: o.left + dx, top: o.top + dy }); o.setCoords();
  }));

  /* ---- floating toolbar next to the selection ---- */
  function placeFloat() {
    const tb = $('#floatTb'), o = active();
    if (!o) { tb.hidden = true; return; }
    const r = o.getBoundingRect(), above = r.top > 110;
    tb.hidden = false;
    tb.style.left = r.left + r.width / 2 + 'px';
    tb.style.top = (above ? r.top - (o.locked || isCoarse ? 14 : 58) : r.top + r.height + 14) + 'px'; // sits above the rotate handle so it never hides it
    tb.style.transform = `translate(-50%,${above ? '-100%' : '0'})`;
    tb.style.setProperty('--ft-t', tb.style.transform);
    $('[data-ft=lock]').innerHTML = ico(o.locked ? 'lock-open' : 'lock', 18);
  }
  ['object:moving', 'object:scaling', 'object:rotating', 'object:modified', 'selection:created', 'selection:updated', 'selection:cleared'].forEach(e => canvas.on(e, placeFloat));
  $$('[data-ft]').forEach(b => b.onclick = () => ({ up: () => $('#forward').click(), down: () => $('#backward').click(), dup: duplicate, lock: toggleLock, del: remove })[b.dataset.ft]());
  $('#ftColor').oninput = e => setFill(e.target.value); $('#ftColor').onchange = commit;

  /* ---- layers ---- */
  const LAYER_NAMES = { rect: 'Box', circle: 'Circle', triangle: 'Triangle', polygon: 'Star', path: 'Heart', line: 'Line', group: 'Group', image: 'Image' };
  const layerName = o => isArch(o) ? o.archData.text : isText(o) ? (o.text || '').replace(/\n/g, ' ').slice(0, 26) : LAYER_NAMES[o.type] || o.type;
  const layerIcon = o => ico(o.slot ? 'printer' : isArch(o) ? 'spline' : isText(o) ? 'type' : isImage(o) ? 'image' : o.isIcon ? 'sparkle' : 'shapes', 16);
  const thumbCache = new WeakMap();
  function layerThumb(o) { // tiny preview of the layer itself, so images / shapes can be told apart at a glance
    if (isText(o) || isArch(o)) return null;
    const key = [o.width, o.height, o.scaleX, o.scaleY, o.angle, o.fill && o.fill.type ? 'g' : o.fill, o.cropX, o.cropY, o.flipX, o.opacity, isImage(o) && o._element ? (o._element.src || '').slice(-24) + (o.filters || []).length : ''].join('|');
    const hit = thumbCache.get(o); if (hit && hit.key === key) return hit.url;
    let url = null; try { const m = 40 / Math.max(o.getScaledWidth(), o.getScaledHeight(), 1); url = o.toDataURL({ format: 'png', multiplier: Math.min(m * 2, 4), enableRetinaScaling: false }); } catch { }
    thumbCache.set(o, { key, url }); return url;
  }
  let dragIdx = null;
  function renderLayers() {
    const ul = $('#layers'); if (!ul || $('#tab-layers').hidden) return;
    const objs = canvas.getObjects(); ul.innerHTML = ''; $('#layersEmpty').hidden = objs.length > 0;
    let imgNo = 0; const imgIdx = new Map(); objs.forEach(o => { if (isImage(o)) imgIdx.set(o, ++imgNo); });
    [...objs].reverse().forEach((o, li) => {
      const row = document.createElement('li'); row.draggable = true; row.className = o === active() ? 'sel' : '';
      const th = li < 40 ? layerThumb(o) : null;
      row.innerHTML = `<span class="ico${th ? ' th' : ''}">${th ? `<img alt="" src="${th}">` : layerIcon(o)}</span><span class="nm"></span><button data-eye title="Show / hide">${ico(o.visible === false ? 'eye-off' : 'eye', 16)}</button><button data-lk title="Lock">${ico(o.locked ? 'lock' : 'lock-open', 16)}</button>`;
      $('.nm', row).textContent = isImage(o) ? (o.mock ? `Mockup · ${o.mock.kind}` : o.credit && o.credit.title ? `Photo · ${o.credit.title}` : `Image ${imgIdx.get(o)}`) : layerName(o);
      row.onclick = e => {
        if (e.target.closest('[data-eye]')) { o.visible = o.visible === false; if (!o.visible) canvas.discardActiveObject(); canvas.requestRenderAll(); commit(); return; }
        if (e.target.closest('[data-lk]')) { canvas.setActiveObject(o); toggleLock(); return; }
        if (o.visible !== false) { canvas.setActiveObject(o); canvas.requestRenderAll(); refreshProps(); }
      };
      row.ondragstart = () => { dragIdx = objs.length - 1 - li; };
      row.ondragover = e => { e.preventDefault(); row.classList.add('drag-over'); };
      row.ondragleave = () => row.classList.remove('drag-over');
      row.ondrop = e => {
        e.preventDefault(); const to = objs.length - 1 - li;
        if (dragIdx !== null && dragIdx !== to) { canvas.moveTo(objs[dragIdx], to); canvas.requestRenderAll(); commit(); }
        dragIdx = null;
      };
      ul.appendChild(row);
    });
  }

  /* ================= group / ungroup ================= */
  function groupSel() { const o = active(); if (o?.type !== 'activeSelection') return toast('Select 2+ things first (Shift-click)', '👆'); o.toGroup(); canvas.requestRenderAll(); commit(); refreshProps(); }
  function ungroupSel() { const o = active(); if (o?.type !== 'group' || isArch(o)) return toast('Select a group first', '👆'); o.toActiveSelection(); canvas.requestRenderAll(); commit(); refreshProps(); }
  $('#group').onclick = groupSel; $('#ungroup').onclick = ungroupSel;

  /* ================= smart snapping guides ================= */
  const snapV = document.createElement('div'), snapH = document.createElement('div');
  snapV.className = 'snap v'; snapH.className = 'snap h'; $('#canvasWrap').append(snapV, snapH); snapV.hidden = snapH.hidden = true;
  canvas.on('object:moving', e => {
    const o = e.target, T = 10 / zoom, r = o.getBoundingRect(true, true);
    const others = canvas.getObjects().filter(x => x !== o && x.visible && !(o.type === 'activeSelection' && o.contains?.(x)));
    const xs = [0, W / 2, W], ys = [0, H / 2, H];
    others.forEach(x => { const b = x.getBoundingRect(true, true); xs.push(b.left, b.left + b.width / 2, b.left + b.width); ys.push(b.top, b.top + b.height / 2, b.top + b.height); });
    const best = (mine, cands) => { let res = null; mine.forEach(m => cands.forEach(c => { const d = c - m; if (Math.abs(d) <= T && (!res || Math.abs(d) < Math.abs(res.d))) res = { d, at: c }; })); return res; };
    const sx = best([r.left, r.left + r.width / 2, r.left + r.width], xs), sy = best([r.top, r.top + r.height / 2, r.top + r.height], ys);
    if (sx) o.left += sx.d; if (sy) o.top += sy.d;
    snapV.hidden = !sx; snapH.hidden = !sy;
    if (sx) snapV.style.left = sx.at * zoom + 'px'; if (sy) snapH.style.top = sy.at * zoom + 'px';
  });
  canvas.on('mouse:up', () => { snapV.hidden = snapH.hidden = true; });

  /* ================= eyedropper & brand kit ================= */
  if (window.EyeDropper) {
    $('#eyedrop').hidden = false;
    $('#eyedrop').onclick = async () => { try { const { sRGBHex } = await new EyeDropper().open(); setFill(sRGBHex); commit(); refreshProps(); } catch { } };
  }
  let brand = []; try { brand = JSON.parse(localStorage.getItem('chitra.brand') || '[]'); } catch { }
  function renderBrand() {
    $('#brandKit').innerHTML = brand.map(c => `<button data-brand="${c}" style="background:${c}" title="Brand colour ${c}"></button>`).join('');
    $$('[data-brand]').forEach(b => { b.onclick = () => { setFill(b.dataset.brand); commit(); }; b.oncontextmenu = e => { e.preventDefault(); brand = brand.filter(x => x !== b.dataset.brand); saveBrand(); }; });
  }
  function saveBrand() { try { localStorage.setItem('chitra.brand', JSON.stringify(brand)); } catch { } renderBrand(); }
  $('#addBrand').onclick = () => { const c = $('#fill').value; if (!brand.includes(c)) { brand.push(c); brand = brand.slice(-14); saveBrand(); toast('Saved to brand colours (right-click to remove)', '🎨'); } };
  renderBrand();

  /* ================= properties ================= */
  $('#swatches').innerHTML = COLORS.map(c => `<button data-color="${c}" style="background:${c}" title="${c}"></button>`).join('');
  $('#grads').innerHTML = GRADS.map((g, i) => `<button data-grad="${i}" style="background:linear-gradient(135deg,${g[0]},${g[1]})" title="Gradient"></button>`).join('');
  function setFill(c) {
    targets().forEach(o => setProp(o, 'fill', c)); canvas.requestRenderAll(); $('#fill').value = c; $('#ftColor').value = c;
  }
  $$('[data-color]').forEach(b => b.onclick = () => { setFill(b.dataset.color); commit(); });
  $$('[data-grad]').forEach(b => b.onclick = () => {
    targets().forEach(o => gradFill(o, GRADS[b.dataset.grad])); canvas.requestRenderAll(); commit(); refreshProps();
  });

  function refreshProps() {
    const o = active();
    $('#emptyProps').hidden = !!o; $('#propsBody').hidden = !o; document.body.classList.toggle('has-sel', !!o);
    renderLayers(); updateCtx();
    if (!o) return;
    const arch = isArch(o), fillV = arch ? o.archData.fill : o.fill, strokeV = arch ? o.archData.stroke : o.stroke;
    $('#textSec').hidden = !(isText(o) || arch); $('#imageSec').hidden = !isImage(o); $('#archSec').hidden = !arch;
    $$('#propsBody [data-s=colour], #propsBody [data-s=outline]').forEach(d => { d.hidden = isImage(o); }); // a photo has no fill / outline: lead with its own tools
    $('#fill').value = toHex(typeof fillV === 'string' ? fillV : '#000000'); $('#ftColor').value = $('#fill').value;
    $('#stroke').value = toHex(strokeV || '#000000');
    $('#strokeWidth').value = (arch ? o.archData.strokeWidth : o.strokeWidth) || 0;
    $('#opacity').value = Math.round((o.opacity ?? 1) * 100);
    $('#angle').value = Math.round(o.angle || 0);
    $('#shadow').checked = !!o.shadow;
    $('#lock').textContent = o.locked ? 'Unlock' : 'Lock';
    if (arch) {
      chitra.fontUI?.sync(o.archData.fontFamily); $('#fontSize').value = Math.round(o.archData.fontSize);
      $('#archText').value = o.archData.text; $('#archCurve').value = o.archData.curve; $('#charSpacing').value = o.archData.charSpacing || 0;
    } else if (isText(o)) {
      chitra.fontUI?.sync(o.fontFamily); $('#fontSize').value = Math.round(o.fontSize * (o.scaleY || 1));
      $('#lineHeight').value = Math.round((o.lineHeight || 1.16) * 100); $('#charSpacing').value = o.charSpacing || 0;
    }
    if (isImage(o)) {
      const a = o.adj || {};
      $$('[data-filter]').forEach(i => i.value = a[i.dataset.filter] || 0);
      const dpi = Math.round(DPI * o.width / o.getScaledWidth()), el = $('#dpiInfo');
      const ratio = o.width / o.getScaledWidth();
      if (DPI >= 150) { el.textContent = dpi >= 200 ? `${dpi} DPI at this size — print ready` : `Only ${dpi} DPI at this size — may print soft`; el.classList.toggle('warn', dpi < 200); }
      else { el.textContent = ratio >= 1 ? `Crisp — ${Math.round(ratio * 100)}% of original resolution` : `Enlarged ${Math.round(100 / ratio)}% — may look soft`; el.classList.toggle('warn', ratio < 1); }
    }
  }
  let rafP = 0; const refreshSoon = () => { if (!rafP) rafP = requestAnimationFrame(() => { rafP = 0; refreshProps(); }); };
  ['selection:created', 'selection:updated', 'selection:cleared'].forEach(e => canvas.on(e, refreshProps));
  ['object:rotating', 'object:scaling'].forEach(e => canvas.on(e, refreshSoon));

  const bind = (sel, prop, conv = v => v, evt = 'input') => {
    const el = $(sel);
    el.addEventListener(evt, () => { targets().forEach(o => setProp(o, prop, conv(el.value))); canvas.requestRenderAll(); });
    el.addEventListener('change', () => { commit(); });
  };
  bind('#fill', 'fill'); bind('#stroke', 'stroke');
  $('#stroke').addEventListener('input', () => {
    if (!+$('#strokeWidth').value) { const w = Math.round(u() * 0.008); $('#strokeWidth').value = w; targets().forEach(o => setProp(o, 'strokeWidth', w)); canvas.requestRenderAll(); }
  });
  bind('#strokeWidth', 'strokeWidth', Number); bind('#opacity', 'opacity', v => v / 100);
  bind('#lineHeight', 'lineHeight', v => v / 100); bind('#charSpacing', 'charSpacing', Number);
  $('#angle').addEventListener('input', e => { targets().forEach(o => o.rotate(+e.target.value)); canvas.requestRenderAll(); placeFloat(); });
  $('#angle').addEventListener('change', commit);
  $('#fontSize').addEventListener('input', e => {
    const v = +e.target.value || 12;
    targets().forEach(o => { if (isArch(o)) setProp(o, 'fontSize', v); else if (isText(o)) o.set({ fontSize: v, scaleX: 1, scaleY: 1 }); }); canvas.requestRenderAll();
  });
  $('#fontSize').addEventListener('change', commit);
  $('#archText').addEventListener('input', e => { const o = active(); if (isArch(o)) setProp(o, 'text', e.target.value || ' '); });
  $('#archCurve').addEventListener('input', e => { const o = active(); if (isArch(o)) setProp(o, 'curve', +e.target.value); });
  $('#archText').addEventListener('change', commit); $('#archCurve').addEventListener('change', commit);
  $('#shadow').onchange = e => {
    targets().forEach(o => o.set('shadow', e.target.checked ? new fabric.Shadow({ color: 'rgba(0,0,0,.45)', blur: u() * 0.015, offsetX: u() * 0.006, offsetY: u() * 0.008 }) : null));
    canvas.requestRenderAll(); commit();
  };
  const toggleStyle = (prop, on, off) => act(o => { if (isArch(o)) setProp(o, prop, (o.archData[prop] === on ? off : on)); else if (isText(o)) o.set(prop, o[prop] === on ? off : on); });
  $('#bold').onclick = toggleStyle('fontWeight', 'bold', 'normal');
  $('#italic').onclick = act(o => isText(o) && !isArch(o) && o.set('fontStyle', o.fontStyle === 'italic' ? 'normal' : 'italic'));
  $('#underline').onclick = act(o => isText(o) && !isArch(o) && o.set('underline', !o.underline));
  $$('[data-talign]').forEach(b => b.onclick = act(o => isText(o) && o.set('textAlign', b.dataset.talign)));

  /* ================= image filters ================= */
  const F = fabric.Image.filters;
  const PRESETS = {
    grayscale: () => [new F.Grayscale()], sepia: () => [new F.Sepia()], invert: () => [new F.Invert()],
    vintage: () => [new F.Sepia(), new F.Contrast({ contrast: 0.1 }), new F.Brightness({ brightness: -0.05 })],
    warm: () => [new F.ColorMatrix({ matrix: [1.08, 0, 0, 0, 0.04, 0, 1.0, 0, 0, 0.01, 0, 0, 0.88, 0, -0.03, 0, 0, 0, 1, 0] })],
    cool: () => [new F.ColorMatrix({ matrix: [0.9, 0, 0, 0, -0.02, 0, 1.0, 0, 0, 0.01, 0, 0, 1.1, 0, 0.05, 0, 0, 0, 1, 0] })],
    fade: () => [new F.Contrast({ contrast: -0.2 }), new F.Brightness({ brightness: 0.08 }), new F.Saturation({ saturation: -0.2 })],
    noir: () => [new F.Grayscale(), new F.Contrast({ contrast: 0.35 })],
    pop: () => [new F.Saturation({ saturation: 0.4 }), new F.Contrast({ contrast: 0.15 })],
    duo1: () => [duotone('#2b1055', '#ff6ec7')],
    duo2: () => [duotone('#0b1b3a', '#22d3ee')],
    pixelate: () => [new F.Pixelate({ blocksize: 8 })],
  };
  function duotone(dark, light) {
    const d = new fabric.Color(dark).getSource().map(v => v / 255), l = new fabric.Color(light).getSource().map(v => v / 255), w = [0.299, 0.587, 0.114], m = [];
    for (let c = 0; c < 3; c++) m.push(...w.map(k => k * (l[c] - d[c])), 0, d[c]);
    m.push(0, 0, 0, 1, 0); return new F.ColorMatrix({ matrix: m });
  }
  function applyFilters(o) {
    const a = o.adj || (o.adj = DEFAULT_ADJ()), f = [];
    if (a.whiteDist) f.push(new F.RemoveColor({ color: '#ffffff', distance: a.whiteDist / 200 }));
    if (a.brightness) f.push(new F.Brightness({ brightness: a.brightness / 100 }));
    if (a.contrast) f.push(new F.Contrast({ contrast: a.contrast / 100 }));
    if (a.saturation) f.push(new F.Saturation({ saturation: a.saturation / 100 }));
    if (a.vibrance) f.push(new F.Vibrance({ vibrance: a.vibrance / 100 }));
    if (a.temperature) { const t = (a.temperature / 100) * 0.12; f.push(new F.ColorMatrix({ matrix: [1, 0, 0, 0, t, 0, 1, 0, 0, 0, 0, 0, 1, 0, -t, 0, 0, 0, 1, 0] })); }
    if (a.hue) f.push(new F.HueRotation({ rotation: a.hue / 100 }));
    if (a.sharpen) { const k = a.sharpen / 100; f.push(new F.Convolute({ matrix: [0, -k, 0, -k, 1 + 4 * k, -k, 0, -k, 0] })); }
    if (a.blur) f.push(new F.Blur({ blur: a.blur / 100 }));
    if (a.preset && PRESETS[a.preset]) f.push(...PRESETS[a.preset]());
    o.filters = f; o.applyFilters(); canvas.requestRenderAll();
  }
  $$('[data-filter]').forEach(i => {
    i.addEventListener('input', () => { const o = active(); if (!isImage(o)) return; (o.adj ||= DEFAULT_ADJ())[i.dataset.filter] = +i.value; applyFilters(o); });
    i.addEventListener('change', commit);
  });
  $$('[data-preset]').forEach(b => b.onclick = () => {
    const o = active(); if (!isImage(o)) return;
    if (b.dataset.preset === 'reset') o.adj = DEFAULT_ADJ();
    else (o.adj ||= DEFAULT_ADJ()).preset = o.adj.preset === b.dataset.preset ? '' : b.dataset.preset;
    applyFilters(o); refreshProps(); commit();
  });
  $('#cropToCanvas').onclick = act(o => {
    if (!isImage(o)) return;
    const s = Math.max(W / o.width, H / o.height);
    o.set({ scaleX: s, scaleY: s, left: W / 2, top: H / 2, originX: 'center', originY: 'center', angle: 0 }); o.setCoords();
  });

  /* ================= save / export ================= */
  function download(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); }
  const slug = () => ($('#projectName').value || 'design').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'design';
  $('#saveProject').onclick = () => {
    savePage();
    const url = URL.createObjectURL(new Blob([expand(JSON.stringify({ chitra: 2, cur, name: $('#projectName').value, pages: pages.map(p => p.json) }))], { type: 'application/json' }));
    download(url, `${slug()}.chitra.json`); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Project saved', '💾');
  };
  $('#openProject').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (d.chitra === 2) loadProject(d);
        else { restore(r.result); setTimeout(commit, 80); }
        toast('Project opened', '📂');
      } catch { alert('That is not a Chitra project file.'); }
    };
    r.readAsText(f); e.target.value = '';
  };

  // Write the print resolution (300 DPI) into the file so RIP/print software sizes it correctly.
  const CRC_T = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (const x of b) c = CRC_T[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function stampDpi(bytes, fmt, dpi = DPI) {
    if (fmt === 'jpeg') {
      if (bytes[2] === 0xFF && bytes[3] === 0xE0) { bytes[13] = 1; bytes[14] = bytes[16] = dpi >> 8; bytes[15] = bytes[17] = dpi & 255; }
      return bytes;
    }
    const ppm = Math.round(dpi / 0.0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer);
    dv.setUint32(0, 9); chunk.set([0x70, 0x48, 0x59, 0x73], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1;
    dv.setUint32(17, crc32(chunk.subarray(4, 17)));
    const out = new Uint8Array(bytes.length + 21);
    out.set(bytes.subarray(0, 33)); out.set(chunk, 33); out.set(bytes.subarray(33), 54);
    return out;
  }
  function renderDesign(white) {
    canvas.discardActiveObject(); canvas.renderAll();
    const prevBg = canvas.backgroundColor;
    if (white && !prevBg) canvas.backgroundColor = '#ffffff';
    // Phones can't make canvases bigger than ~16 megapixels (iOS silently returns a blank image), so cap there.
    const cap = isCoarse ? 16e6 : 120e6, scale = Math.min(1, Math.sqrt(cap / (W * H)));
    canvas.__exporting = true; canvas.fire('export:start');
    let el; try { el = canvas.toCanvasElement(scale / zoom); } finally { canvas.__exporting = false; canvas.fire('export:end'); canvas.backgroundColor = prevBg; canvas.renderAll(); }
    renderDesign.scale = scale; return el;
  }
  async function exportPDF() {
    if (!window.jspdf) await new Promise(res => { const sc = document.createElement('script'); sc.src = 'vendor/jspdf.umd.min.js'; sc.onload = sc.onerror = res; document.head.appendChild(sc); }); // loaded on first use
    if (!window.jspdf) return toast('PDF engine failed to load', '⚠️');
    toast(`Building PDF · ${pages.length} page${pages.length > 1 ? 's' : ''}…`, '📄'); await new Promise(r => setTimeout(r, 50));
    savePage(); const keep = cur; let doc = null;
    for (let i = 0; i < pages.length; i++) {
      await new Promise(res => loadPage(i, res));
      let el = renderDesign(true), wmm = (W / DPI) * 25.4, hmm = (H / DPI) * 25.4;
      const marks = $('#pdfMarks')?.checked, BLEED = 3, SLUG = marks ? 6 : 0, trimW = wmm, trimH = hmm;
      if (marks) { // extend the artwork by 3 mm on every side (edge pixels are stretched) and add crop marks in the slug area
        const bpx = Math.round((BLEED / 25.4) * DPI * (renderDesign.scale || 1)), big = document.createElement('canvas'), g = big.getContext('2d');
        big.width = el.width + 2 * bpx; big.height = el.height + 2 * bpx; g.drawImage(el, bpx, bpx);
        g.drawImage(el, 0, 0, el.width, 1, bpx, 0, el.width, bpx); g.drawImage(el, 0, el.height - 1, el.width, 1, bpx, bpx + el.height, el.width, bpx);
        g.drawImage(el, 0, 0, 1, el.height, 0, bpx, bpx, el.height); g.drawImage(el, el.width - 1, 0, 1, el.height, bpx + el.width, bpx, bpx, el.height);
        [[0, 0, 0, 0], [el.width - 1, 0, bpx + el.width, 0], [0, el.height - 1, 0, bpx + el.height], [el.width - 1, el.height - 1, bpx + el.width, bpx + el.height]].forEach(([sx, sy, dx, dy]) => g.drawImage(el, sx, sy, 1, 1, dx, dy, bpx, bpx));
        el = big; wmm += 2 * BLEED; hmm += 2 * BLEED;
      }
      const pw = wmm + 2 * SLUG, ph = hmm + 2 * SLUG, o = pw > ph ? 'l' : 'p';
      if (!doc) doc = new window.jspdf.jsPDF({ orientation: o, unit: 'mm', format: [pw, ph], compress: true }); else doc.addPage([pw, ph], o);
      doc.addImage(el.toDataURL('image/jpeg', 0.93), 'JPEG', SLUG, SLUG, wmm, hmm, undefined, 'FAST');
      if (marks) { // crop marks sit outside the bleed so they never print on the product
        const x0 = SLUG + BLEED, y0 = SLUG + BLEED, x1 = x0 + trimW, y1 = y0 + trimH, off = BLEED + 1.2, len = SLUG - 1.6;
        doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.2);
        [[x0, y0, -1, -1], [x1, y0, 1, -1], [x0, y1, -1, 1], [x1, y1, 1, 1]].forEach(([x, y, sx, sy]) => { doc.line(x + sx * off, y, x + sx * (off + len), y); doc.line(x, y + sy * off, x, y + sy * (off + len)); });
      }
    }
    doc.save(`${slug()}.pdf`); downloadCredits(true); await new Promise(res => loadPage(keep, res)); confetti(); toast('PDF ready — sized for print', '📄');
  }
  function exportFile(kind) {
    if (kind === 'pdf') return exportPDF();
    if (kind === 'credits') return downloadCredits(false);
    if (kind === 'video') return chitra.openAnimate && chitra.openAnimate();
    const fmt = kind === 'jpg' ? 'jpeg' : 'png', mime = `image/${fmt}`;
    let el; try { el = renderDesign(kind === 'jpg'); } catch (err) { console.warn(err); return toast('An image on this page blocks exporting — upload it from your device instead', '⚠️'); }
    const sc = renderDesign.scale || 1, outDpi = Math.round(DPI * sc);
    if (kind === 'sub') {
      const m = document.createElement('canvas'); m.width = el.width; m.height = el.height;
      const g = m.getContext('2d'); g.translate(m.width, 0); g.scale(-1, 1); g.drawImage(el, 0, 0); el = m;
    }
    el.toBlob(async blob => {
      const bytes = stampDpi(new Uint8Array(await blob.arrayBuffer()), fmt, outDpi);
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      download(url, `${slug()}-${kind}-${W}x${H}.${fmt === 'jpeg' ? 'jpg' : 'png'}`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      if (sc < 1) toast(`Phone limit: saved at ${el.width}×${el.height}px (${outDpi} DPI). Use a computer for full size.`, 'ℹ️');
      downloadCredits(true);
      confetti(); toast(kind === 'sub' ? 'Mirrored file ready for sublimation' : kind === 'dtf' ? 'Transparent DTF file ready' : kind === 'png' ? 'PNG saved' : 'JPG saved', '🎉');
    }, mime, 0.95);
  }
  /* ---- thank-you credits for photos & graphics that came from stock sites ---- */
  function collectCredits() {
    const seen = new Map(); flushCommit();
    pages.forEach((p, i) => { const d = JSON.parse(i === cur ? snapshot() : p.json); walkObjs(d.canvas.objects, o => { if (o.credit) seen.set(`${o.credit.site}|${o.credit.by}|${o.credit.link}`, o.credit); }); });
    return [...seen.values()];
  }
  function creditsText() {
    const l = collectCredits();
    return `THANK YOU\n=========\nDesign: ${$('#projectName').value}\nMade with Chitra Studio\n\n` + (l.length ? 'Photos & graphics used in this design:\n\n' + l.map(c => `• ${c.title ? '“' + c.title + '” — ' : ''}${c.by ? 'by ' + c.by + ' · ' : ''}${c.site}${c.link ? '\n  ' + c.link : ''}`).join('\n') + '\n\nThank you to these creators and to Pixabay, Pexels and Unsplash for sharing their work.\n' : 'No stock photos were used.\n');
  }
  function downloadCredits(auto) {
    if (auto && !collectCredits().length) return;
    const url = URL.createObjectURL(new Blob([creditsText()], { type: 'text/plain' })); download(url, `${slug()}-thank-you-credits.txt`); setTimeout(() => URL.revokeObjectURL(url), 2000);
    if (!auto) toast('Thank-you credits saved', '');
  }
  const menu = $('#exportMenu');
  $('#exportBtn').onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  $$('[data-export]').forEach(b => b.onclick = () => { menu.hidden = true; exportFile(b.dataset.export); });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) menu.hidden = true; });

  $$('[data-close]').forEach(b => b.onclick = () => b.closest('.modal').hidden = true);
  $$('.modal').forEach(m => m.addEventListener('mousedown', e => { if (e.target === m && m.id !== 'picker') m.hidden = true; }));

  /* ================= command palette ================= */
  const extraCmds = []; const CMDS = () => [
    ...extraCmds.map(([n, run]) => ({ n, i: 'info', k: 'help shortcuts tour', run })),
    { n: 'Surprise me', i: 'dice-5', k: 'random fun', run: surprise },
    { n: 'Shuffle colours', i: 'palette', k: 'recolor palette', run: () => applyPalette(pick(PALETTES)) },
    { n: 'Sparkle burst', i: 'sparkles', k: 'stars', run: sparkle },
    { n: 'Add heading', i: 'type', k: 'text', run: () => addText('heading') },
    { n: 'Add arch text', i: '⌒', k: 'curve text', run: newArch },
    { n: 'Export DTF transfer (transparent PNG)', i: 'shirt', k: 'download', run: () => exportFile('dtf') },
    { n: 'Export sublimation (mirrored PNG)', i: 'coffee', k: 'download mirror', run: () => exportFile('sub') },
    { n: 'Export JPG', i: 'image', k: 'download', run: () => exportFile('jpg') },
    { n: 'Export PDF (all pages)', i: 'file-text', k: 'download print a4 a3', run: () => exportFile('pdf') },
    { n: 'Export PNG', i: 'image', k: 'download', run: () => exportFile('png') },
    { n: 'Add page', i: 'plus', k: 'new page', run: () => addPage(false) },
    { n: 'New design', i: '🆕', k: 'start over blank', run: newDesign },
    { n: 'Swap portrait / landscape', i: '⟳', k: 'rotate orientation', run: () => $('#rotateDoc').click() },
    { n: 'Show mockup preview', i: 'eye', k: 'shirt mug preview', run: () => chitra.openMockup() },
    { n: 'Remove background (AI)', i: 'scissors', k: 'cutout photo', run: () => chitra.removeBg() },
    { n: 'Magic fix photo', i: 'wand-sparkles', k: 'enhance auto improve', run: () => chitra.magicFix() },
    { n: 'Enhance / upscale photo 2×', i: 'search', k: 'quality sharpen', run: () => chitra.enhance() },
    { n: 'Group selected', i: 'group', k: 'ctrl g', run: groupSel },
    { n: 'Ungroup', i: 'ungroup', k: 'ctrl shift g', run: ungroupSel },
    ...PAGE_KINDS.map(([k, n]) => ({ n: 'Add page: ' + n, i: 'plus', k: 'page slide new themed', run: () => addPage(false, k, true) })),
    { n: 'Pack designs onto sheet', i: 'ungroup', k: 'gang sheet', run: pack },
    { n: 'Toggle print guides', i: 'ruler', k: 'margin', run: () => { $('#showGuides').click(); } },
    { n: 'Toggle transparent background', i: 'blend', k: 'bg', run: () => { $('#transparent').click(); } },
    { n: 'Save project', i: 'save', k: 'file', run: () => $('#saveProject').click() },
    { n: 'Undo', i: '↶', k: '', run: undo }, { n: 'Redo', i: '↷', k: '', run: redo },
    { n: 'Fit canvas to screen', i: 'search', k: 'zoom', run: fit },
    ...PRODUCTS.map(p => ({ n: `Product: ${p.name}`, i: p.icon, k: `size ${p.g}`, run: () => chooseProduct(p) })),
    ...PALETTES.map(p => ({ n: `Palette: ${p.n}`, i: 'palette', k: 'colours', run: () => applyPalette(p) })),
  ];
  let cmdItems = [], cmdSel = 0;
  function renderCmd() {
    const q = $('#cmdInput').value.toLowerCase().split(/\s+/).filter(Boolean);
    cmdItems = CMDS().filter(c => q.every(t => (c.n + ' ' + c.k).toLowerCase().includes(t))).slice(0, 30); cmdSel = Math.min(cmdSel, Math.max(cmdItems.length - 1, 0));
    $('#cmdList').innerHTML = cmdItems.map((c, i) => `<li class="${i === cmdSel ? 'on' : ''}" data-i="${i}"><i>${ico(c.i, 16)}</i>${c.n}</li>`).join('') || '<li>Nothing found</li>';
    $$('#cmdList li[data-i]').forEach(li => li.onclick = () => runCmd(+li.dataset.i));
  }
  function runCmd(i) { const c = cmdItems[i]; $('#cmd').hidden = true; if (c) c.run(); }
  function openCmd() { $('#cmd').hidden = false; $('#cmdInput').value = ''; cmdSel = 0; renderCmd(); $('#cmdInput').focus(); }
  $('#cmdk').onclick = openCmd;
  $('#cmdInput').addEventListener('input', () => { cmdSel = 0; renderCmd(); });
  $('#cmdInput').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { cmdSel = Math.min(cmdSel + 1, cmdItems.length - 1); renderCmd(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { cmdSel = Math.max(cmdSel - 1, 0); renderCmd(); e.preventDefault(); }
    else if (e.key === 'Enter') runCmd(cmdSel);
  });

  /* ================= pages (multi-page designs) ================= */
  const thumb = () => { try { return canvas.toDataURL({ format: 'png', multiplier: 150 / (W * zoom) }); } catch { return null; } };
  let thumbT = null;
  function schedThumb() { clearTimeout(thumbT); thumbT = setTimeout(() => { pages[cur].thumb = thumb(); const im = $('.pg.on img'); if (im && pages[cur].thumb) im.src = pages[cur].thumb; }, 450); }
  function savePage() { flushCommit(); pages[cur] = { json: snapshot(), thumb: thumb(), hist: { stack: history.stack.slice(), idx: history.idx } }; }
  function loadPage(i, cb) {
    cur = i; const p = pages[i], d = parseSnap(p.json); history.busy = true;
    setSize(d.W, d.H, false, undefined, d.dpi);
    canvas.loadFromJSON(d.canvas, () => {
      syncBg(); canvas.renderAll(); history.busy = false;
      history.stack = p.hist ? p.hist.stack.slice() : [p.json]; history.idx = p.hist ? p.hist.idx : 0;
      refreshProps(); renderLayers(); refreshUsage(); renderPages(); if (cb) cb();
    });
  }
  const switchPage = i => { if (i === cur || i < 0 || i >= pages.length) return; savePage(); loadPage(i); };
  /* A design's theme is read from its first page (background, heading + body fonts, colours), so every extra page matches it - for built-in templates and for the user's own designs alike. */
  function themeOf() {
    const d = parseSnap(pages[0].json), os = d.canvas.objects || [], area = d.W * d.H, col = c => typeof c === 'string' && c && c !== 'transparent' && c !== 'rgba(0,0,0,0)';
    const tx = os.filter(o => /text/i.test(o.type) && (o.text || '').trim()).map(o => ({ f: o.fontFamily, c: o.fill, w: o.fontWeight, t: o.text, s: (o.fontSize || 16) * (o.scaleY || 1) })).sort((a, b) => b.s - a.s);
    const head = tx[0], body = tx.slice(1).find(t => t.t.length > 14 && t.f !== head?.f) || tx.slice(1).find(t => t.t.length > 14) || tx[1] || head;
    const big = os.find(o => /rect/.test(o.type) && o.width * (o.scaleX || 1) * o.height * (o.scaleY || 1) > area * 0.5 && col(o.fill));
    let bg = col(d.canvas.background) ? d.canvas.background : d.canvas.background?.colorStops?.[0]?.color || (big && big.fill) || null;
    const hc = head && col(head.c) ? head.c : '#14110f';
    if (!bg) bg = lum(hc) > 0.6 ? '#14110f' : '#ffffff'; // photo / pattern first page: fall back to a solid that keeps the text readable
    const ink = lum(bg) < 0.5 ? '#ffffff' : '#14110f', pc = c => col(c) && Math.abs(lum(c) - lum(bg)) > 0.35 ? c : ink;
    const acc = os.filter(o => /rect|circle|ellipse|path|polygon|triangle/.test(o.type) && col(o.fill) && o !== big).map(o => o.fill).find(c => { const l = lum(c); return Math.abs(l - lum(bg)) > 0.12 && l > 0.08 && l < 0.95; }) || (Math.abs(lum(hc) - lum(bg)) > 0.35 ? hc : '#6d4aff');
    return { bg, head: { f: head?.f || 'Fredoka', c: pc(hc), w: head?.w || 700 }, body: { f: body?.f || 'Poppins', c: pc(body?.c), w: 400 }, acc };
  }
  const PAGE_KINDS = [['content', 'Heading + text'], ['title', 'Big title'], ['two', 'Two columns'], ['quote', 'Quote'], ['blank', 'Blank (keep colours)']];
  function themedObjects(kind, th) {
    const m = W * 0.08, k = u(), T = (t, o) => new fabric.Textbox(t, { fontFamily: th.body.f, fill: th.body.c, fontWeight: th.body.w, lineHeight: 1.25, ...o });
    const Hd = (t, o) => T(t, { fontFamily: th.head.f, fill: th.head.c, fontWeight: th.head.w, lineHeight: 1.05, ...o });
    const bar = (x, y, w) => new fabric.Rect({ left: x, top: y, width: w, height: Math.max(4, k * 0.012), fill: th.acc, selectable: true });
    if (kind === 'title') return [Hd('Section title', { left: m, top: H * 0.38, width: W - 2 * m, fontSize: k * 0.12 }), bar(m, H * 0.38 + k * 0.17, k * 0.2), T('A short line that sets up what comes next', { left: m, top: H * 0.38 + k * 0.22, width: W - 2 * m, fontSize: k * 0.035 })];
    if (kind === 'two') { const cw = (W - 2 * m - m * 0.5) / 2; return [Hd('Heading', { left: m, top: H * 0.1, width: W - 2 * m, fontSize: k * 0.075 }), bar(m, H * 0.1 + k * 0.1, k * 0.14), T('Left column\nAdd your first point here. Keep it short and clear.', { left: m, top: H * 0.34, width: cw, fontSize: k * 0.032 }), T('Right column\nAdd your second point here. Keep it short and clear.', { left: m + cw + m * 0.5, top: H * 0.34, width: cw, fontSize: k * 0.032 })]; }
    if (kind === 'quote') return [Hd('“', { left: m, top: H * 0.14, width: k * 0.3, fontSize: k * 0.3, fill: th.acc }), Hd('A line worth remembering goes right here.', { left: m, top: H * 0.34, width: W - 2 * m, fontSize: k * 0.07, fontWeight: th.head.w }), T('— Name, role', { left: m, top: H * 0.72, width: W - 2 * m, fontSize: k * 0.03, fill: th.acc })];
    if (kind === 'blank') return [];
    return [Hd('Add a heading', { left: m, top: H * 0.1, width: W - 2 * m, fontSize: k * 0.075 }), bar(m, H * 0.1 + k * 0.1, k * 0.14), T('Write your main point in a sentence or two.\n• First supporting idea\n• Second supporting idea\n• Third supporting idea', { left: m, top: H * 0.34, width: W - 2 * m, fontSize: k * 0.034 })];
  }
  function addPage(dup, kind = 'content', explicit = false) {
    savePage();
    if (dup) { pages.splice(cur + 1, 0, { json: pages[cur].json, thumb: pages[cur].thumb, hist: null }); loadPage(cur + 1); return toast('Page duplicated', '📄'); }
    const themed = themedDoc || kind !== 'content' || explicit, th = themed ? themeOf() : null, bgBlank = canvas.backgroundColor === '' ? '' : '#ffffff'; // a normal design gets a clean blank page
    const blank = JSON.stringify({ W, H, dpi: DPI, themed: themedDoc || undefined, name: $('#projectName').value, canvas: { version: fabric.version, objects: [], background: th ? th.bg : bgBlank } });
    pages.splice(cur + 1, 0, { json: blank, thumb: null, hist: null });
    loadPage(cur + 1, () => { history.busy = true; if (th) themedObjects(kind, th).forEach(o => canvas.add(o)); history.busy = false; canvas.discardActiveObject(); canvas.renderAll(); commit(); renderPages(); });
    toast(th ? 'Page added in your design’s style' : 'Blank page added', '📄');
  }
  async function deletePage() {
    if (pages.length < 2) return toast('A design needs at least one page', '☝️');
    if (!(await ask('Delete this page?', 'You can undo with Ctrl+Z only until you switch pages.', 'Delete page'))) return;
    pages.splice(cur, 1); cur = Math.min(cur, pages.length - 1); loadPage(cur);
  }
  function renderPages() {
    const bar = $('#pageList'); bar.innerHTML = '';
    pages.forEach((p, i) => {
      const b = document.createElement('button'); b.className = 'pg' + (i === cur ? ' on' : ''); b.title = `Page ${i + 1}`;
      const src = i === cur ? (p.thumb = thumb() || p.thumb) : p.thumb;
      b.innerHTML = `${src ? `<img alt="" src="${src}">` : '<span class="blank"></span>'}<em>${i + 1}</em>`; b.onclick = () => switchPage(i); bar.appendChild(b);
    });
    $('#pageCount').textContent = `Page ${cur + 1} / ${pages.length}`;
  }
  $('#pgMore').onclick = e => { // pick a page layout; all of them use the design's own colours + fonts
    e.stopPropagation(); $('#pgMenu')?.remove(); const m = document.createElement('div'), r = e.currentTarget.getBoundingClientRect(); m.id = 'pgMenu'; m.className = 'pg-menu';
    m.style.cssText = `left:${Math.max(8, Math.min(r.left, innerWidth - 220))}px;bottom:${innerHeight - r.top + 6}px`;
    m.innerHTML = '<small>New page in your style</small>' + PAGE_KINDS.map(([k, n]) => `<button data-k="${k}">${n}</button>`).join('');
    document.body.appendChild(m); m.onclick = ev => { const b = ev.target.closest('[data-k]'); if (b) { addPage(false, b.dataset.k, true); m.remove(); } };
    setTimeout(() => document.addEventListener('click', () => m.remove(), { once: true }), 0);
  };
  $('#pgAdd').onclick = e => addPage(false, e.shiftKey ? 'blank' : 'content'); $('#pgDup').onclick = () => addPage(true); $('#pgDel').onclick = deletePage;

  /* ================= phone / touch: gestures ================= */
  const mobileQ = matchMedia('(max-width:800px)'), isCoarse = matchMedia('(pointer:coarse)').matches;
  const isMobile = () => mobileQ.matches;
  if (isCoarse) { // fat-finger friendly handles, no drag-selection box (empty-space drag pans instead)
    fabric.Object.prototype.set({ cornerSize: 17, touchCornerSize: 48, padding: 6, borderScaleFactor: 1.6 });
    canvas.selection = false; canvas.targetFindTolerance = 14;
  }
  const stageEl = $('#stage'), wrapEl = $('#canvasWrap');
  let gest = null, touchBlock = false;
  const two = e => { const a = e.touches[0], b = e.touches[1]; return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, a: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX), mx: (a.clientX + b.clientX) / 2, my: (a.clientY + b.clientY) / 2 }; };
  // Capture phase: when two fingers are down we own the gesture, so Fabric (and the browser) never see it.
  stageEl.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      const o = active(), s0 = two(e);
      canvas._currentTransform = null; canvas._groupSelector = null; // drop any one-finger drag Fabric had started
      if (o && !o.locked && !o.isEditing) gest = { mode: 'obj', o, s0, sx: o.scaleX, sy: o.scaleY, ang: o.angle || 0, c: o.getCenterPoint() };
      else { const r = wrapEl.getBoundingClientRect(); gest = { mode: 'page', s0, z0: zoom, k: 1, fx: s0.mx - r.left, fy: s0.my - r.top, s1: s0 }; wrapEl.style.transformOrigin = `${gest.fx}px ${gest.fy}px`; }
      touchBlock = true; e.preventDefault(); e.stopPropagation();
    } else if (touchBlock) { e.preventDefault(); e.stopPropagation(); }
  }, { capture: true, passive: false });
  stageEl.addEventListener('touchmove', e => {
    if (!touchBlock) return;
    if (gest && e.touches.length >= 2) {
      const s1 = two(e), k = s1.d / gest.s0.d;
      if (gest.mode === 'obj') {
        const o = gest.o; let ang = gest.ang + ((s1.a - gest.s0.a) * 180) / Math.PI; const snap = Math.round(ang / 45) * 45; if (Math.abs(ang - snap) < 3) ang = snap; // magnetic 45° steps
        const kk = clamp(k, 0.05, 40);
        o.set({ scaleX: gest.sx * kk, scaleY: gest.sy * kk, angle: ang });
        o.setPositionByOrigin(new fabric.Point(gest.c.x + (s1.mx - gest.s0.mx) / zoom, gest.c.y + (s1.my - gest.s0.my) / zoom), 'center', 'center');
        o.setCoords(); canvas.requestRenderAll(); placeFloat();
      } else {
        gest.k = clamp(k, 0.02 / gest.z0, 4 / gest.z0); gest.s1 = s1; // smooth CSS pinch; real re-render happens once on release
        wrapEl.style.transform = `translate(${s1.mx - gest.s0.mx}px,${s1.my - gest.s0.my}px) scale(${gest.k})`;
      }
    }
    e.preventDefault(); e.stopPropagation();
  }, { capture: true, passive: false });
  function endGesture(e) {
    if (!touchBlock) return;
    if (gest && e.touches.length < 2) {
      if (gest.mode === 'obj') { canvas.fire('object:modified', { target: gest.o }); refreshProps(); }
      else {
        wrapEl.style.transform = ''; wrapEl.style.transformOrigin = '';
        zoom = gest.z0 * gest.k; applyZoom();
        const r = wrapEl.getBoundingClientRect();
        stageEl.scrollLeft += r.left + (gest.fx / gest.z0) * zoom - gest.s1.mx; stageEl.scrollTop += r.top + (gest.fy / gest.z0) * zoom - gest.s1.my;
      }
      gest = null;
    }
    if (e.touches.length === 0) touchBlock = false;
    e.preventDefault(); e.stopPropagation();
  }
  /* desktop: drag a selection box from anywhere on the workspace (also from the grey area outside the page) */
  if (!isCoarse) {
    let mq = null, box = null;
    stageEl.addEventListener('mousedown', e => {
      if (e.button !== 0 || e.target.closest('canvas, .zoombar, .floatbar, button, input, select, .pagebar, .float-tb')) return;
      mq = { x: e.clientX, y: e.clientY, add: e.shiftKey }; box = document.createElement('div'); box.className = 'marquee'; document.body.appendChild(box);
      if (!e.shiftKey) { canvas.discardActiveObject(); canvas.requestRenderAll(); } e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!mq) return; const x = Math.min(mq.x, e.clientX), y = Math.min(mq.y, e.clientY);
      Object.assign(box.style, { left: x + 'px', top: y + 'px', width: Math.abs(e.clientX - mq.x) + 'px', height: Math.abs(e.clientY - mq.y) + 'px' });
    });
    window.addEventListener('mouseup', e => {
      if (!mq) return; const m = mq; mq = null; box.remove(); box = null;
      if (Math.abs(e.clientX - m.x) < 4 && Math.abs(e.clientY - m.y) < 4) return;
      const r = canvas.upperCanvasEl.getBoundingClientRect(), z = canvas.getZoom(), cx = v => (v - r.left) / z, cy = v => (v - r.top) / z;
      const x0 = cx(Math.min(m.x, e.clientX)), x1 = cx(Math.max(m.x, e.clientX)), y0 = cy(Math.min(m.y, e.clientY)), y1 = cy(Math.max(m.y, e.clientY));
      let hit = canvas.getObjects().filter(o => o.visible && o.selectable !== false && !o.slot && (b => b.left < x1 && b.left + b.width > x0 && b.top < y1 && b.top + b.height > y0)(o.getBoundingRect(true, true)));
      if (m.add) hit = [...new Set([...canvas.getActiveObjects(), ...hit])];
      canvas.discardActiveObject();
      if (hit.length === 1) canvas.setActiveObject(hit[0]); else if (hit.length > 1) canvas.setActiveObject(new fabric.ActiveSelection(hit, { canvas }));
      canvas.requestRenderAll(); if (hit.length) toast(`${hit.length} item${hit.length > 1 ? 's' : ''} selected`, '');
    });
  }
  ['touchend', 'touchcancel'].forEach(ev => stageEl.addEventListener(ev, endGesture, { capture: true, passive: false }));
  // one finger on empty space pans the page (Canva-style)
  let pan = null; const cxy = ev => ev.touches?.[0] || ev.changedTouches?.[0] || ev;
  canvas.on('mouse:down', o => { if (isMobile()) closeSheets(); if (isCoarse && !o.target) { const p = cxy(o.e); pan = { x: p.clientX, y: p.clientY, l: stageEl.scrollLeft, t: stageEl.scrollTop }; } });
  canvas.on('mouse:move', o => { if (pan) { const p = cxy(o.e); stageEl.scrollLeft = pan.l - (p.clientX - pan.x); stageEl.scrollTop = pan.t - (p.clientY - pan.y); } });
  canvas.on('mouse:up', () => { pan = null; });

  /* ================= phone: Canva-style contextual bottom bar ================= */
  const CTX = {
    text: [['pencil', 'Edit', 'act', 'edit'], ['type', 'Font', 'focus', 'font'], ['palette', 'Colour', 'focus', 'colour'], ['circle', 'Outline', 'focus', 'outline'], ['sparkles', 'Effects', 'focus', 'effects'], ['a-large-small', 'Spacing', 'focus', 'spacing'], ['move', 'Position', 'focus', 'position'], ['copy', 'Copy', 'act', 'dup'], ['trash-2', 'Delete', 'act', 'del']],
    arch: [['type', 'Font', 'focus', 'font'], ['spline', 'Curve', 'focus', 'arch'], ['palette', 'Colour', 'focus', 'colour'], ['circle', 'Outline', 'focus', 'outline'], ['sparkles', 'Effects', 'focus', 'effects'], ['move', 'Position', 'focus', 'position'], ['copy', 'Copy', 'act', 'dup'], ['trash-2', 'Delete', 'act', 'del']],
    shape: [['palette', 'Colour', 'focus', 'colour'], ['circle', 'Outline', 'focus', 'outline'], ['sparkles', 'Effects', 'focus', 'effects'], ['move', 'Position', 'focus', 'position'], ['copy', 'Copy', 'act', 'dup'], ['trash-2', 'Delete', 'act', 'del']],
    image: [['scissors', 'Remove BG', 'act', 'removeBg'], ['wand-sparkles', 'Magic fix', 'act', 'magicFix'], ['zoom-in', 'Enhance', 'act', 'enhance'], ['sliders-horizontal', 'Adjust', 'focus', 'adjust'], ['contrast', 'Filters', 'focus', 'filters'], ['crop', 'Crop', 'focus', 'crop'], ['brush', 'Refine', 'act', 'refine'], ['tag', 'Sticker', 'focus', 'sticker'], ['sparkles', 'Effects', 'focus', 'effects'], ['move', 'Position', 'focus', 'position'], ['copy', 'Copy', 'act', 'dup'], ['trash-2', 'Delete', 'act', 'del']],
    group: [['sparkles', 'Effects', 'focus', 'effects'], ['move', 'Position', 'focus', 'position'], ['copy', 'Copy', 'act', 'dup'], ['trash-2', 'Delete', 'act', 'del']],
  };
  CTX.multi = CTX.group;
  CTX.slot = [['image', 'Add photo', 'act', 'addToSlot'], ['maximize-2', 'Fit', 'act', 'fitSlot'], ['eraser', 'Clear', 'act', 'clearSlot'], ['lock-open', 'Lock', 'act', 'toggleSlotLock'], ['copy', 'Copy', 'act', 'dup'], ['trash-2', 'Delete', 'act', 'del']];
  CTX.imageSlot = [['maximize-2', 'Fit', 'act', 'fitSlot'], ['copy', 'All areas', 'act', 'fillAll'], ...CTX.image];
  const FOCUS_TITLES = { font: 'Font', colour: 'Colour', outline: 'Outline', effects: 'Effects', spacing: 'Spacing', arch: 'Curve text', position: 'Position', adjust: 'Adjust photo', filters: 'Filters', crop: 'Crop & frame', sticker: 'Sticker outline' };
  const ctxType = o => !o ? null : o.type === 'activeSelection' ? 'multi' : o.slot ? 'slot' : isArch(o) ? 'arch' : isText(o) ? 'text' : isImage(o) ? (o.inSlot ? 'imageSlot' : 'image') : o.type === 'group' ? 'group' : 'shape';
  const ACTS = {
    edit: () => { const o = active(); if (o && isText(o) && !isArch(o)) { closeSheets(); o.enterEditing(); o.selectAll(); o.hiddenTextarea?.focus(); canvas.requestRenderAll(); } },
    dup: () => duplicate(), del: () => remove(),
    removeBg: () => chitra.removeBg(), magicFix: () => chitra.magicFix(), enhance: () => chitra.enhance(), refine: () => chitra.refine(),
  };
  let ctxKey = null;
  function setCtxActive(k) { $$('#ctxBar button').forEach(b => b.classList.toggle('on', !!k && b.dataset.key === k)); }
  let zoomBeforeSheet = null; // the canvas tucks above the sheet while you edit, then returns to your zoom
  function sheetLayout(open) {
    requestAnimationFrame(() => {
      if (open) { if (zoomBeforeSheet === null) zoomBeforeSheet = zoom; zoom = Math.min(zoom, fitZoom()); applyZoom(); }
      else if (zoomBeforeSheet !== null) { zoom = zoomBeforeSheet; zoomBeforeSheet = null; applyZoom(); }
    });
  }
  function closeSheets() {
    const was = document.body.classList.contains('sheet-open');
    document.body.classList.remove('sheet-open'); $('#inspector').removeAttribute('data-focus'); setCtxActive(null);
    if (isMobile()) $('#flyout').classList.add('collapsed'); if (was) sheetLayout(false);
  }
  function openFocus(k) {
    const ins = $('#inspector'), same = ins.dataset.focus === k && document.body.classList.contains('sheet-open');
    if (same) { closeSheets(); return; }
    ins.dataset.focus = k; $('#sheetTitle').textContent = FOCUS_TITLES[k] || 'Edit'; $('#tab-design').hidden = false; $('#tab-layers').hidden = true;
    document.body.classList.add('sheet-open'); ins.scrollTop = 0; setCtxActive(k); sheetLayout(true);
  }
  function updateCtx() {
    const bar = $('#ctxBar'), t = ctxType(active());
    if (!t || !isMobile()) { bar.hidden = true; ctxKey = null; if (!t && document.body.classList.contains('sheet-open')) { document.body.classList.remove('sheet-open'); $('#inspector').removeAttribute('data-focus'); sheetLayout(false); } return; }
    if (ctxKey !== t) {
      ctxKey = t; bar.innerHTML = CTX[t].map(([i, n, kind, key]) => `<button data-kind="${kind}" data-key="${key}" class="${key === 'del' ? 'danger' : ''}"><span class="cx">${ico(i, 22)}</span>${n}</button>`).join('');
      $$('#ctxBar button').forEach(b => b.onclick = () => { if (b.dataset.kind === 'focus') return openFocus(b.dataset.key); closeSheets(); (ACTS[b.dataset.key] || chitra.extraActs?.[b.dataset.key])?.(); }); // picking an action tucks the open panel away
      bar.scrollLeft = 0; $('#inspector').removeAttribute('data-focus'); if (document.body.classList.contains('sheet-open')) { document.body.classList.remove('sheet-open'); sheetLayout(false); }
    }
    bar.hidden = false;
  }
  /* ---- double click / double tap = edit; single click = select & move ---- */
  function editObject(o) {
    if (!o || o.locked) return;
    if (o.slot) return chitra.extraActs?.addToSlot?.();
    canvas.setActiveObject(o); refreshProps();
    if (isArch(o)) { if (isMobile()) openFocus('arch'); else { $('#inspector').scrollTop = 0; $('#archText').focus(); $('#archText').select(); } return; }
    if (isText(o)) { if (o.isEditing) return; closeSheets(); o.enterEditing(); o.selectAll(); o.hiddenTextarea?.focus(); canvas.requestRenderAll(); return; }
    if (isImage(o)) { if (isMobile()) openFocus('adjust'); else { $('#inspector').scrollTop = 0; const t = $('#tab-design'); t.hidden = false; $('#tab-layers').hidden = true; $('#imageSec').scrollIntoView({ block: 'start', behavior: 'smooth' }); } return; }
    if (isMobile()) openFocus('colour'); else { $('#inspector').scrollTop = 0; }
  }
  let lastTap = { t: 0, o: null, x: 0, y: 0 };
  canvas.on('mouse:down', e => {
    const o = e.target, now = Date.now(), p = e.pointer || { x: 0, y: 0 };
    if (o && lastTap.o === o && now - lastTap.t < 380 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 24) { lastTap = { t: 0, o: null, x: 0, y: 0 }; setTimeout(() => editObject(o), 0); }
    else lastTap = { t: now, o, x: p.x, y: p.y };
  });
  /* bottom sheets: tap the handle / title bar, or swipe it down, to close (no need to press the same button again) */
  function dragClose(el, sheet, close) {
    let y0 = null, moved = false; el.style.touchAction = 'none';
    el.addEventListener('pointerdown', e => { if (e.target.closest('button,input,select')) return; y0 = e.clientY; moved = false; try { el.setPointerCapture(e.pointerId); } catch { } });
    el.addEventListener('pointermove', e => { if (y0 == null) return; const dy = Math.max(0, e.clientY - y0); if (dy > 6) moved = true; sheet.style.transition = 'none'; sheet.style.transform = `translateY(${dy}px)`; });
    const reset = () => { sheet.style.transition = ''; sheet.style.transform = ''; };
    el.addEventListener('pointerup', e => { if (y0 == null) return; const dy = e.clientY - y0; y0 = null; reset(); if (dy > 50) close(); });
    el.addEventListener('pointercancel', () => { y0 = null; reset(); });
    el.addEventListener('click', e => { if (e.target.closest('button,input,select')) return; if (moved) { moved = false; return; } close(); }); // a plain tap closes on the CLICK, so the tap can't fall through to the canvas underneath
  }
  dragClose($('.sheet-head'), $('#inspector'), () => $('#sheetClose').click()); dragClose($('#flyout .grabber'), $('#flyout'), closeSheets);
  $('#sheetClose').onclick = () => { $('#tab-design').hidden = false; $('#tab-layers').hidden = true; document.body.classList.remove('sheet-open'); $('#inspector').removeAttribute('data-focus'); setCtxActive(null); sheetLayout(false); };
  mobileQ.addEventListener?.('change', () => { updateCtx(); fit(); });

  /* ================= autosave (IndexedDB) & new design ================= */
  const kv = {
    db: () => new Promise((res, rej) => { const r = indexedDB.open('chitra', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }),
    async set(k, v) { try { const db = await kv.db(); await new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = t.onerror = () => res(); }); } catch { } },
    async get(k) { try { const db = await kv.db(); return await new Promise(res => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); } catch { return null; } },
  };
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  kv.del = async k => { try { const db = await kv.db(); await new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = t.onerror = () => res(); }); } catch { } };
  const store = {
    list: async () => (await kv.get('projIndex')) || [],
    async saveMeta(m) { const l = await store.list(), i = l.findIndex(x => x.id === m.id); if (i >= 0) l[i] = m; else l.unshift(m); l.sort((a, b) => b.updated - a.updated); await kv.set('projIndex', l.slice(0, 80)); },
    async remove(id) { await kv.set('projIndex', (await store.list()).filter(x => x.id !== id)); await kv.del('proj:' + id); },
    async rename(id, name) { const d = await kv.get('proj:' + id); if (d) { const o = JSON.parse(d); o.name = name; await kv.set('proj:' + id, JSON.stringify(o)); } const l = await store.list(), m = l.find(x => x.id === id); if (m) { m.name = name; await kv.set('projIndex', l); } if (id === projectId) $('#projectName').value = name; },
    async duplicate(id) { const d = await kv.get('proj:' + id), m = (await store.list()).find(x => x.id === id); if (!d || !m) return; const nid = uid(), o = JSON.parse(d); o.id = nid; o.name = m.name + ' (copy)'; await kv.set('proj:' + nid, JSON.stringify(o)); await store.saveMeta({ ...m, id: nid, name: o.name, updated: Date.now() }); return nid; },
  };
  const cardThumb = () => { try { return canvas.toDataURL({ format: 'png', multiplier: 360 / (W * zoom) }); } catch { return null; } };
  let lastCard = { id: null, url: null }, saveT = null;
  async function saveNow() {
    clearTimeout(saveT); if (!projectId) return; flushCommit(); document.dispatchEvent(new Event('chitra:saving'));
    try {
      if (cur === 0 || lastCard.id !== projectId) lastCard = { id: projectId, url: cardThumb() };
      const first = pages[0]; void first;
      const name = $('#projectName').value || 'Untitled design', jsons = pages.map((p, i) => i === cur ? snapshot() : p.json);
      await kv.set('proj:' + projectId, expand(JSON.stringify({ chitra: 2, id: projectId, cur, name, pages: jsons })));
      await store.saveMeta({ id: projectId, name, updated: Date.now(), thumb: lastCard.url, w: W, h: H, dpi: DPI, product: product.name, pages: pages.length });
      document.dispatchEvent(new Event('chitra:saved'));
    } catch (e) { console.warn('save failed', e); document.dispatchEvent(new Event('chitra:savefail')); }
  }
  const schedSave = () => { clearTimeout(saveT); if (projectId) { document.dispatchEvent(new Event('chitra:dirty')); saveT = setTimeout(saveNow, 1800); } };
  function loadProject(d) {
    pages.length = 0;
    d.pages.forEach(j => pages.push({ json: j, thumb: null, hist: null })); try { themedDoc = !!JSON.parse(d.pages[0]).themed; } catch { themedDoc = false; } if (d.name) $('#projectName').value = d.name;
    loadPage(Math.min(d.cur || 0, pages.length - 1));
  }
  /* ---- Home <-> editor ---- */
  function showEditor() {
    $('#home').hidden = true; $('#app').hidden = false; document.body.classList.remove('on-home');
    requestAnimationFrame(() => { fit(); renderPages(); }); document.dispatchEvent(new Event('chitra:editor'));
  }
  async function showHome() {
    await saveNow(); canvas.discardActiveObject(); closeSheets();
    $('#app').hidden = true; $('#home').hidden = false; document.body.classList.add('on-home'); document.dispatchEvent(new CustomEvent('chitra:home'));
  }
  async function openProject(id) {
    const raw = await kv.get('proj:' + id); if (!raw) return toast('Could not open that design', '⚠️');
    await saveNow(); projectId = id; showEditor(); loadProject(typeof raw === 'string' ? JSON.parse(raw) : raw);
  }
  // Start a brand-new design (blank, from a template, or from a saved print layout)
  async function newDocument({ product: p, w, h, dpi, guide: g, template, layoutJson, name } = {}) {
    await saveNow(); flushCommit(); projectId = uid(); lastCard = { id: null, url: null }; themedDoc = !!(template && TEMPLATE_META[template] && THEMED_CATS.has(TEMPLATE_META[template].cat));
    pages.length = 0; pages.push({ json: null, thumb: null, hist: null }); cur = 0;
    $('#projectName').value = name || (p ? `${p.name} design` : 'Untitled design');
    history.busy = true; canvas.clear(); history.busy = false; canvas.backgroundColor = p && /transfer|dtf|sticker|label/i.test(`${p.g || ''} ${p.name || ''}`) ? '' : '#ffffff'; // paper / screen / mug sizes start pure white; DTF transfers stay transparent
    setSize(p?.w ?? w, p?.h ?? h, false, g ?? p?.guide ?? 'none', p?.dpi ?? dpi ?? 300, p);
    showEditor();
    if (layoutJson) await new Promise(res => { const d = parseSnap(layoutJson); history.busy = true; canvas.loadFromJSON(d.canvas, () => { history.busy = false; res(); }); });
    else { history.busy = true; if (template && TEMPLATES[template]) TEMPLATES[template](); history.busy = false; canvas.renderAll(); requestAnimationFrame(() => canvas.requestRenderAll()); }
    syncBg(); canvas.discardActiveObject(); canvas.renderAll(); history.stack = []; history.idx = -1; doCommit();
    pages[0] = { json: snapshot(), thumb: null, hist: { stack: history.stack.slice(), idx: history.idx } }; renderPages(); refreshProps(); closeSheets(); saveNow();
  }
  const newDesign = () => openPicker('create');
  const nd = $('#newDesign'); if (nd) nd.onclick = newDesign;

  /* ================= rail tabs & inspector tabs ================= */
  $$('#rail [data-tab]').forEach(b => b.onclick = () => {
    const fly = $('#flyout'), already = b.classList.contains('on');
    if (already) { fly.classList.toggle('collapsed'); setTimeout(fit, 30); return; }
    const wasCollapsed = fly.classList.contains('collapsed'); fly.classList.remove('collapsed');
    $$('#rail [data-tab]').forEach(x => x.classList.toggle('on', x === b));
    $$('.panel').forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
    if (wasCollapsed) setTimeout(fit, 30);
    refreshUsage();
  });
  $$('[data-itab]').forEach(b => b.onclick = () => {
    $$('[data-itab]').forEach(x => x.classList.toggle('on', x === b));
    $('#tab-design').hidden = b.dataset.itab !== 'design'; $('#tab-layers').hidden = b.dataset.itab !== 'layers'; renderLayers();
  });

  /* ================= keyboard ================= */
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (mod && k === 'k' && !e.shiftKey) { e.preventDefault(); $('#cmd').hidden ? openCmd() : ($('#cmd').hidden = true); return; }
    if (k === 'escape') { $$('.modal').forEach(m => { m.hidden = true; }); menu.hidden = true; return; }
    const el = document.activeElement;
    if (/INPUT|SELECT|TEXTAREA/.test(el?.tagName) && !/range|color|checkbox/.test(el.type || '')) return;
    if ($$('.modal').some(m => !m.hidden)) return;
    const o = active(); if (o?.isEditing) return;
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && k === 'y') { e.preventDefault(); redo(); }
    else if (mod && k === 'd') { e.preventDefault(); duplicate(); }
    else if (k === 'enter' && o && !o.isEditing) { e.preventDefault(); editObject(o); }
    else if (mod && k === 'g') { e.preventDefault(); e.shiftKey ? ungroupSel() : groupSel(); }
    else if (k === 'delete' || k === 'backspace') { if (o) { e.preventDefault(); remove(); } }
    else if (o && k.startsWith('arrow')) {
      e.preventDefault(); const d = e.shiftKey ? 10 : 1;
      o.set({ left: o.left + (k === 'arrowright' ? d : k === 'arrowleft' ? -d : 0), top: o.top + (k === 'arrowdown' ? d : k === 'arrowup' ? -d : 0) });
      o.setCoords(); canvas.requestRenderAll(); placeFloat();
    }
  });
  $('#undo').onclick = undo; $('#redo').onclick = redo;
  const more = $('#moreMenu');
  $('#moreBtn').onclick = e => { e.stopPropagation(); more.hidden = !more.hidden; $('#exportMenu').hidden = true; };
  document.addEventListener('click', e => { if (!more.hidden && !more.contains(e.target)) more.hidden = true; });
  const MORE = {
    new: newDesign, save: () => $('#saveProject').click(), open: () => $('#openProject').click(), mock: () => chitra.openMockup(), cmd: openCmd,
    layers: () => { closeSheets(); const ins = $('#inspector'); ins.dataset.focus = 'layers'; $('#sheetTitle').textContent = 'Layers'; $('#tab-design').hidden = true; $('#tab-layers').hidden = false; document.body.classList.add('sheet-open'); renderLayers(); sheetLayout(true); },
  };
  $$('[data-more]').forEach(b => b.onclick = () => { more.hidden = true; MORE[b.dataset.more](); });

  /* ================= boot ================= */
  setSize(3300, 3900, false, 'shirt'); doCommit(); // placeholder document; real ones are created from Home
  if (matchMedia('(max-width:800px)').matches) $('#flyout').classList.add('collapsed'); // phones: tools open as a bottom sheet on tap
  kv.get('autosave').then(async saved => { // bring the old single autosave into the new project list
    if (!saved) return;
    try {
      if (!(await store.list()).length) {
        const d = JSON.parse(saved);
        if (d.chitra === 2 && d.pages?.length) { const id = uid(), first = JSON.parse(d.pages[0]); d.id = id; d.name = d.name || 'Recovered design'; await kv.set('proj:' + id, JSON.stringify(d)); await store.saveMeta({ id, name: d.name, updated: Date.now(), thumb: null, w: first.W, h: first.H, dpi: first.dpi, product: 'Recovered', pages: d.pages.length }); }
      }
      await kv.del('autosave'); document.dispatchEvent(new CustomEvent('chitra:home'));
    } catch { }
  });
  // Re-measure text once web fonts have arrived so layout/export match what you see.
  const fontsReady = document.fonts ? Promise.race([Promise.all(FONTS.map(f => document.fonts.load(`40px "${f}"`).catch(() => { }))), new Promise(r => setTimeout(r, 6000))]).then(() => {
    fabric.util.clearFabricFontCache();
    canvas.getObjects().forEach(o => { if (isText(o)) { o.dirty = true; o.initDimensions(); } });
    canvas.requestRenderAll();
  }) : Promise.resolve();
  const api = {
    canvas, undo, redo, addText, addPage, themeOf, PAGE_KINDS, setThemedDoc: v => { themedDoc = !!v; }, isThemedCat: c => THEMED_CATS.has(c), get themedDoc() { return themedDoc; }, TEMPLATES, setSize, pack, surprise, exportFile, applyPalette, PALETTES,
    addCommand: (n, run) => extraCmds.push([n, run]),
    kit: { get W() { return W; }, get H() { return H; }, get B() { return B; }, u, clearAll, shadow }, ico, setProp, SHAPES, BACKDROPS, addBackdrop, EMOJI, isArch, prodIconName, editObject, downloadCredits, collectCredits, flushCommit, fontsReady, kv, store, uid, newDocument, openProject, showHome, showEditor, saveNow, EXTRA, snapshot, parseSnap, expand, TEMPLATE_META, renderTemplateThumb, productByName, PRODUCTS, dim, inches, openPicker, loadTemplate, fit, thumb, cardThumb, savePage, loadPage, renderPages, FONTS, PICKER_TABS, chooseProduct,
    get pages() { return pages; }, get cur() { return cur; }, get projectId() { return projectId; }, get isCoarse() { return isCoarse; },
    $, $$, pick, toast, confetti, ask, commit, refreshProps, place, active, isImage, isText, applyFilters, DEFAULT_ADJ, renderDesign, addImageFromURL,
    history, get dpi() { return DPI; }, get W() { return W; }, get H() { return H; }, get zoom() { return zoom; }, get guide() { return guide; }, u,
  };
  window.chitra = api; document.dispatchEvent(new CustomEvent('chitra:ready'));
})();
