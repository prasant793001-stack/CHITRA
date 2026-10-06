/* Chitra Studio – Elements browser (Canva-style): Shapes, Graphics (transparent), Icons (1,500+),
   Photos (all sources merged), Mockups, Effects, Stickers, Backdrops, Lines. */
(() => {
  const C = window.chitra;
  const { $, $$, toast, canvas, ico, place } = C;
  const u = () => Math.min(C.W, C.H);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TINTS = ['#6d4aff', '#ffc93c', '#12b886', '#19c3d6', '#ff5c8a'];

  /* ================= shapes ================= */
  const star = (n, inner) => { let d = ''; for (let i = 0; i < n * 2; i++) { const r = (i % 2 ? inner : 1) * 47, a = (Math.PI / n) * i - Math.PI / 2; d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(1) + ' ' + (50 + r * Math.sin(a)).toFixed(1); } return d + 'Z'; };
  const SHAPES = [
    ['square', 'Square', 'M5 5H95V95H5Z'], ['rounded', 'Rounded square', 'M25 5H75A20 20 0 0 1 95 25V75A20 20 0 0 1 75 95H25A20 20 0 0 1 5 75V25A20 20 0 0 1 25 5Z'],
    ['circle', 'Circle', 'M50 4A46 46 0 1 1 49.99 4Z'], ['ellipse', 'Ellipse', 'M50 18A46 32 0 1 1 49.99 18Z'], ['triangle', 'Triangle', 'M50 5L96 92H4Z'], ['rtriangle', 'Right triangle', 'M5 5L95 95H5Z'],
    ['diamond', 'Diamond', 'M50 3L97 50L50 97L3 50Z'], ['pentagon', 'Pentagon', 'M50 4L96 38L78 94H22L4 38Z'], ['hexagon', 'Hexagon', 'M25 8H75L98 50L75 92H25L2 50Z'], ['octagon', 'Octagon', 'M30 4H70L96 30V70L70 96H30L4 70V30Z'],
    ['parallelogram', 'Parallelogram', 'M25 15H97L75 85H3Z'], ['trapezoid', 'Trapezoid', 'M22 15H78L97 85H3Z'],
    ['star5', 'Star', star(5, 0.42)], ['star6', '6-point star', star(6, 0.55)], ['star8', '8-point star', star(8, 0.6)], ['burst', 'Burst', star(14, 0.78)], ['badge', 'Seal', star(24, 0.9)],
    ['heart', 'Heart', 'M50 90C10 58 2 38 2 27C2 12 14 4 27 4C38 4 46 10 50 20C54 10 62 4 73 4C86 4 98 12 98 27C98 38 90 58 50 90Z'],
    ['arrowr', 'Arrow right', 'M3 35H58V10L97 50L58 90V65H3Z'], ['arrowl', 'Arrow left', 'M97 35H42V10L3 50L42 90V65H97Z'], ['arrowu', 'Arrow up', 'M35 97V42H10L50 3L90 42H65V97Z'], ['arrowd', 'Arrow down', 'M35 3V58H10L50 97L90 58H65V3Z'],
    ['arrowlr', 'Double arrow', 'M3 50L30 22V40H70V22L97 50L70 78V60H30V78Z'], ['chevron', 'Chevron', 'M10 5H55L95 50L55 95H10L50 50Z'],
    ['plus', 'Plus', 'M35 5H65V35H95V65H65V95H35V65H5V35H35Z'], ['cross', 'Cross', 'M20 5L50 35L80 5L95 20L65 50L95 80L80 95L50 65L20 95L5 80L35 50L5 20Z'],
    ['bubble', 'Speech bubble', 'M10 8H90Q96 8 96 14V62Q96 68 90 68H48L24 92V68H10Q4 68 4 62V14Q4 8 10 8Z'],
    ['cloud', 'Cloud', 'M26 80C10 80 3 68 6 56C9 45 18 41 26 42C26 26 40 16 54 20C64 23 70 30 72 38C86 36 97 46 95 60C93 72 84 80 72 80Z'],
    ['moon', 'Moon', 'M60 4A46 46 0 1 0 96 70A38 38 0 0 1 60 4Z'], ['bolt', 'Lightning', 'M58 2L14 56H44L36 98L88 38H56Z'], ['check', 'Check', 'M6 54L22 38L40 56L78 12L94 28L40 88Z'],
    ['banner', 'Banner', 'M2 25H98L82 50L98 75H2L18 50Z'], ['shield', 'Shield', 'M50 3L92 18V50C92 74 74 90 50 98C26 90 8 74 8 50V18Z'], ['drop', 'Drop', 'M50 3C50 3 90 44 90 64A40 40 0 0 1 10 64C10 44 50 3 50 3Z'],
    ['semi', 'Semicircle', 'M3 72A47 47 0 0 1 97 72Z'], ['ring', 'Ring', 'M50 3A47 47 0 1 1 49.99 3ZM50 25A25 25 0 1 0 50.01 25Z', 1], ['frame', 'Frame', 'M3 3H97V97H3ZM22 22V78H78V22Z', 1],
    ['arch', 'Arch', 'M10 97V47A40 40 0 0 1 90 47V97Z'], ['gem', 'Gem', 'M25 10H75L97 38L50 92L3 38Z'],
    ['blob1', 'Blob', 'M50 5C75 5 95 25 92 52C89 78 70 95 46 94C20 93 5 75 8 50C11 25 28 5 50 5Z'], ['blob2', 'Blob 2', 'M30 8C52 -2 90 8 96 38C102 68 80 96 52 94C26 92 4 78 6 50C8 30 14 14 30 8Z'],
    ['leaf', 'Leaf', 'M10 90C10 40 40 8 92 8C92 60 62 92 10 90Z'], ['ticket', 'Ticket', 'M5 20H95V42A8 8 0 0 0 95 58V80H5V58A8 8 0 0 0 5 42Z'], ['tag', 'Tag', 'M5 5H55L95 45L55 95L5 55Z'],
  ];
  const LINES = [
    ['line', 'Line', 'M5 50H95', ''], ['dash', 'Dashed', 'M5 50H95', '14 10'], ['dots', 'Dotted', 'M5 50H95', '1 12'], ['arrow', 'Arrow', 'M5 50H92M70 28L92 50L70 72', ''],
    ['darrow', 'Double arrow', 'M8 50H92M28 30L8 50L28 70M72 30L92 50L72 70', ''], ['curve', 'Curve', 'M5 80Q50 -20 95 80', ''], ['zig', 'Zigzag', 'M5 70L25 30L45 70L65 30L85 70L95 50', ''], ['wave', 'Wave', 'M5 50Q20 20 35 50T65 50T95 50', ''],
  ];
  const svgShape = (d, eo, extra = '') => `<svg viewBox="0 0 100 100"><path d="${d}" fill="currentColor"${eo ? ' fill-rule="evenodd"' : ''}${extra}/></svg>`;
  const svgLine = (d, dash) => `<svg viewBox="0 0 100 100"><path d="${d}" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/></svg>`;
  function addShape(i) {
    const [, , d, eo] = SHAPES[i], o = new fabric.Path(d, { fill: TINTS[i % TINTS.length], fillRule: eo ? 'evenodd' : 'nonzero' }), k = (u() * 0.3) / 100;
    o.set({ scaleX: k, scaleY: k }); place(o);
  }
  function addLine(i) {
    const [, , d, dash] = LINES[i], k = (u() * 0.4) / 100, o = new fabric.Path(d, { fill: '', stroke: '#1d2433', strokeWidth: 5, strokeLineCap: 'round', strokeLineJoin: 'round', strokeDashArray: dash ? dash.split(' ').map(Number) : null });
    o.set({ scaleX: k, scaleY: k }); place(o);
  }

  /* ================= icon library (lazy) ================= */
  let libP = null; const lib = () => libP ||= fetch('vendor/lucide-all.json').then(r => r.json());
  function addIcon(name, inner) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1d2433" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    fabric.loadSVGFromString(svg, (objs, opts) => {
      const g = fabric.util.groupSVGElements(objs, opts); g.scaleToWidth(u() * 0.16); g.isIcon = true; g.name = name; place(g);
    });
  }

  /* ================= mockup elements ================= */
  const SHIRT = 'M200 62 L125 88 Q108 95 98 112 L38 192 Q34 200 41 205 L98 238 Q106 242 112 234 L140 192 L140 536 Q140 544 148 544 L452 544 Q460 544 460 536 L460 192 L488 234 Q494 242 502 238 L559 205 Q566 200 562 192 L502 112 Q492 95 475 88 L400 62 Q300 135 200 62 Z';
  const R = (l, t, w, h, o = {}) => new fabric.Rect({ left: l, top: t, width: w, height: h, ...o });
  const SH = (blur = 0.03) => new fabric.Shadow({ color: 'rgba(29,36,51,.28)', blur: u() * blur, offsetX: 0, offsetY: u() * 0.012 });
  const MOCKS = [
    ['phone', 'Phone', () => { const s = u() * 0.5, w = s * 0.48, cx = C.W / 2 - w / 2, cy = C.H / 2 - s / 2; return { deco: [R(cx, cy, w, s, { rx: w * 0.14, ry: w * 0.14, fill: '#1d2433', shadow: SH() }), R(cx + w * 0.35, cy + s * 0.014, w * 0.3, s * 0.018, { rx: s * 0.01, ry: s * 0.01, fill: '#0b0e16' })], slot: { l: cx + w * 0.05, t: cy + s * 0.035, w: w * 0.9, h: s * 0.93, rx: w * 0.1, label: 'Phone screen' } }; },
      '<svg viewBox="0 0 60 100"><rect x="10" y="4" width="40" height="92" rx="8" fill="#1d2433"/><rect x="14" y="10" width="32" height="80" rx="4" fill="#ffc42e"/></svg>'],
    ['tablet', 'Tablet', () => { const w = u() * 0.62, h = w * 0.72, cx = C.W / 2 - w / 2, cy = C.H / 2 - h / 2; return { deco: [R(cx, cy, w, h, { rx: w * 0.04, ry: w * 0.04, fill: '#1d2433', shadow: SH() })], slot: { l: cx + w * 0.035, t: cy + h * 0.05, w: w * 0.93, h: h * 0.9, rx: w * 0.012, label: 'Tablet screen' } }; },
      '<svg viewBox="0 0 100 80"><rect x="4" y="6" width="92" height="68" rx="6" fill="#1d2433"/><rect x="9" y="12" width="82" height="56" rx="2" fill="#1fb26b"/></svg>'],
    ['laptop', 'Laptop', () => { const w = u() * 0.66, h = w * 0.62, cx = C.W / 2 - w / 2, cy = C.H / 2 - h / 2 - u() * 0.03; return { deco: [R(cx, cy, w, h, { rx: w * 0.03, ry: w * 0.03, fill: '#1d2433', shadow: SH() }), R(cx - w * 0.08, cy + h, w * 1.16, h * 0.06, { rx: h * 0.03, ry: h * 0.03, fill: '#c9ced8' })], slot: { l: cx + w * 0.025, t: cy + h * 0.045, w: w * 0.95, h: h * 0.91, rx: w * 0.006, label: 'Laptop screen' } }; },
      '<svg viewBox="0 0 110 80"><rect x="14" y="6" width="82" height="52" rx="4" fill="#1d2433"/><rect x="18" y="10" width="74" height="44" fill="#ff7a1a"/><rect x="4" y="60" width="102" height="6" rx="3" fill="#c9ced8"/></svg>'],
    ['browser', 'Browser window', () => { const w = u() * 0.7, h = w * 0.62, cx = C.W / 2 - w / 2, cy = C.H / 2 - h / 2, bar = h * 0.1; return { deco: [R(cx, cy, w, h, { rx: w * 0.02, ry: w * 0.02, fill: '#ffffff', stroke: '#e6e0d0', strokeWidth: u() * 0.003, shadow: SH() }), R(cx, cy, w, bar, { rx: w * 0.02, ry: w * 0.02, fill: '#eef0f4' }), ...[['#ff5d5d', 0.03], ['#ffc42e', 0.055], ['#1fb26b', 0.08]].map(([c, x]) => new fabric.Circle({ left: cx + w * x, top: cy + bar * 0.32, radius: bar * 0.17, fill: c }))], slot: { l: cx + w * 0.01, t: cy + bar + h * 0.01, w: w * 0.98, h: h - bar - h * 0.02, label: 'Browser content' } }; },
      '<svg viewBox="0 0 100 76"><rect x="4" y="4" width="92" height="68" rx="5" fill="#fff" stroke="#e6e0d0"/><rect x="4" y="4" width="92" height="9" rx="4" fill="#eef0f4"/><circle cx="11" cy="8.5" r="2" fill="#ff5d5d"/><circle cx="18" cy="8.5" r="2" fill="#ffc42e"/><circle cx="25" cy="8.5" r="2" fill="#1fb26b"/><rect x="8" y="17" width="84" height="51" fill="#14b8a6"/></svg>'],
    ['frame', 'Poster frame', () => { const w = u() * 0.42, h = w * 1.3, cx = C.W / 2 - w / 2, cy = C.H / 2 - h / 2; return { deco: [R(cx, cy, w, h, { fill: '#b9814a', shadow: SH() }), R(cx + w * 0.05, cy + w * 0.05, w * 0.9, h - w * 0.1, { fill: '#ffffff' })], slot: { l: cx + w * 0.11, t: cy + w * 0.11, w: w * 0.78, h: h - w * 0.22, label: 'Poster' } }; },
      '<svg viewBox="0 0 80 100"><rect x="6" y="4" width="68" height="92" fill="#b9814a"/><rect x="11" y="9" width="58" height="82" fill="#fff"/><rect x="16" y="14" width="48" height="72" fill="#ffc42e"/></svg>'],
    ['polaroid', 'Polaroid', () => { const w = u() * 0.36, h = w * 1.2, cx = C.W / 2 - w / 2, cy = C.H / 2 - h / 2; return { deco: [R(cx, cy, w, h, { fill: '#ffffff', shadow: SH(), angle: 0 })], slot: { l: cx + w * 0.06, t: cy + w * 0.06, w: w * 0.88, h: w * 0.88, label: 'Photo' } }; },
      '<svg viewBox="0 0 80 96"><rect x="6" y="4" width="68" height="88" fill="#fff" stroke="#e6e0d0"/><rect x="11" y="9" width="58" height="58" fill="#1fb26b"/></svg>'],
    ['tee', 'T-shirt', () => { const k = (u() * 0.6) / 524, pw = 524 * k, ph = 482 * k, pl = C.W / 2 - pw / 2, pt = C.H / 2 - ph / 2, shirt = new fabric.Path(SHIRT, { fill: '#ffffff', stroke: '#ddd6c4', strokeWidth: 3, left: pl, top: pt, scaleX: k, scaleY: k, shadow: SH(0.02) }); return { deco: [shirt], slot: { l: pl + (200 - 38) * k, t: pt + (120 - 62) * k, w: 200 * k, h: 230 * k, label: 'Print area' } }; },
      '<svg viewBox="0 0 100 92"><path d="M30 6 L8 14 L2 34 L16 40 L22 32 V88 H78 V32 L84 40 L98 34 L92 14 L70 6 Q50 24 30 6Z" fill="#fff" stroke="#d6cfba" stroke-width="2"/><rect x="34" y="30" width="32" height="36" fill="#ff7a1a" opacity=".85"/></svg>'],
    ['mug', 'Mug', () => { const w = u() * 0.3, h = w * 1.0, cx = C.W / 2 - w / 2 - w * 0.12, cy = C.H / 2 - h / 2; return { deco: [new fabric.Circle({ left: cx + w * 0.78, top: cy + h * 0.22, radius: w * 0.22, fill: '', stroke: '#e3dccb', strokeWidth: w * 0.1 }), R(cx, cy, w, h, { rx: w * 0.08, ry: w * 0.08, fill: '#ffffff', stroke: '#e3dccb', strokeWidth: u() * 0.003, shadow: SH() })], slot: { l: cx + w * 0.1, t: cy + h * 0.14, w: w * 0.8, h: h * 0.7, rx: w * 0.03, label: 'Mug print' } }; },
      '<svg viewBox="0 0 100 90"><circle cx="76" cy="44" r="14" fill="none" stroke="#e3dccb" stroke-width="8"/><rect x="10" y="10" width="62" height="70" rx="8" fill="#fff" stroke="#e3dccb" stroke-width="2"/><rect x="18" y="22" width="46" height="46" rx="3" fill="#ffc42e"/></svg>'],
  ];
  function addMock(i) {
    const m = MOCKS[i][2](); C.history.busy = true;
    m.deco.forEach(o => canvas.add(o));
    const s = C.makeSlotPx({ label: m.slot.label, kind: 'mock', left: m.slot.l, top: m.slot.t, width: m.slot.w, height: m.slot.h, rx: m.slot.rx || 0 }); canvas.add(s);
    C.history.busy = false; canvas.setActiveObject(s); canvas.requestRenderAll(); C.commit(); C.refreshProps();
    if (C.isMobile?.() || matchMedia('(max-width:800px)').matches) $('#flyout').classList.add('collapsed'); toast('Mockup added — add a photo to fill the screen', '');
  }

  /* ================= effects ================= */
  const sh = (color, blur, ox, oy) => new fabric.Shadow({ color, blur: u() * blur, offsetX: u() * ox, offsetY: u() * oy });
  const baseColor = o => { const f = C.isArch(o) ? o.archData.fill : o.fill; return typeof f === 'string' && f && f !== 'transparent' && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(f) ? f : '#ff7a1a'; };
  const FX = [
    ['none', 'None', 'color:#9aa0ac', o => { o.set({ shadow: null, textBackgroundColor: '' }); C.setProp(o, 'stroke', ''); C.setProp(o, 'strokeWidth', 0); }],
    ['shadow', 'Shadow', 'text-shadow:2px 3px 6px rgba(0,0,0,.45)', o => o.set('shadow', sh('rgba(0,0,0,.4)', 0.02, 0.006, 0.008))],
    ['hard', 'Hard shadow', 'text-shadow:3px 3px 0 #1d2433', o => o.set('shadow', sh('#1d2433', 0, 0.01, 0.01))],
    ['lift', 'Lift', 'text-shadow:0 8px 14px rgba(0,0,0,.3)', o => o.set('shadow', sh('rgba(0,0,0,.28)', 0.04, 0, 0.022))],
    ['glow', 'Glow', 'text-shadow:0 0 12px #ffc42e,0 0 3px #ffc42e', o => o.set('shadow', sh('#ffc42e', 0.05, 0, 0))],
    ['neon', 'Neon', 'color:#fff;text-shadow:0 0 6px #1fb26b,0 0 16px #1fb26b', o => { const c = baseColor(o); C.setProp(o, 'fill', '#ffffff'); C.setProp(o, 'stroke', c); C.setProp(o, 'strokeWidth', u() * 0.004); o.set('shadow', sh(c, 0.045, 0, 0)); }],
    ['outline', 'Outline', 'color:#fff;-webkit-text-stroke:1.5px #1d2433', o => { C.setProp(o, 'stroke', '#1d2433'); C.setProp(o, 'strokeWidth', u() * 0.008); if (!C.isArch(o)) o.set({ paintFirst: 'stroke', strokeLineJoin: 'round' }); }],
    ['hollow', 'Hollow', 'color:transparent;-webkit-text-stroke:1.5px #1d2433', o => { const c = baseColor(o); C.setProp(o, 'stroke', c); C.setProp(o, 'strokeWidth', u() * 0.006); if (!C.isArch(o)) o.set('fill', 'rgba(0,0,0,0)'); }],
    ['echo', 'Echo', 'text-shadow:3px 3px 0 #ffc42e,6px 6px 0 #ff7a1a', o => o.set('shadow', sh('#ff7a1a', 0, 0.016, 0.016))],
    ['glitch', 'Glitch', 'text-shadow:-3px 0 #14b8c8,3px 0 #ff5d8f', o => { o.set('shadow', sh('#14d3e8', 0, -0.007, 0)); C.setProp(o, 'stroke', '#ff5d8f'); C.setProp(o, 'strokeWidth', u() * 0.0025); }],
    ['bg', 'Highlight', 'background:#ffc42e;padding:0 8px;border-radius:5px;color:#1d2433', o => { if (C.isText(o) && !C.isArch(o)) o.set('textBackgroundColor', '#ffc42e'); else toast('Highlight works on text', '⚠️'); }],
  ];
  function applyFx(i) {
    const ts = canvas.getActiveObjects(); if (!ts.length) return toast('Select a text, shape or photo first', '👆');
    ts.forEach(o => { if (o.slot) return; if (o.isIcon) { o.getObjects().forEach(c => c.set('stroke', baseColor(o))); } FX[i][3](o); o.dirty = true; });
    canvas.requestRenderAll(); C.commit(); C.refreshProps(); toast(`${FX[i][1]} applied`, '');
  }

  /* ================= stock (photos + graphics) ================= */
  const CHIPS = { photo: ['Nature', 'Abstract', 'Texture', 'Food', 'People', 'Business', 'Animals', 'Flowers', 'City', 'Travel', 'Neon', 'Vintage', 'Pattern', 'Beach'], graphic: ['Floral', 'Sticker', 'Animals', 'Food', 'Heart', 'Star', 'Frame', 'Banner', 'Cartoon', 'Doodle', 'Watercolor', 'Flag'] };
  function stockView(kind) {
    view.innerHTML = `<div class="chips" id="stkChips">${CHIPS[kind].map(c => `<button class="chip" data-q="${c}">${c}</button>`).join('')}</div><div class="photo-grid" id="stkGrid"></div><button id="stkMore" class="btn wide" hidden>Load more</button><p class="tip" id="stkNote"></p>`;
    let page = 1, q = '', seen = new Set(), token = 0;
    const grid = $('#stkGrid', view), more = $('#stkMore', view), note = $('#stkNote', view);
    async function run(reset) {
      if (reset) { page = 1; seen = new Set(); grid.innerHTML = '<p class="tip">Searching…</p>'; more.hidden = true; note.textContent = ''; }
      const my = ++token;
      try {
        const r = await C.stock.search(q, { page, kind }); if (my !== token) return; if (reset) grid.innerHTML = '';
        if (r.notConnected) { note.textContent = 'The image library is not connected yet.'; return; }
        const items = r.items.filter(i => !seen.has(i.id)); items.forEach(i => seen.add(i.id));
        if (!items.length && reset) grid.innerHTML = '<p class="tip">No results. Try another word.</p>';
        items.forEach(it => { const b = document.createElement('button'); b.className = 'photo-card' + (kind === 'graphic' ? ' gfx' : ''); b.innerHTML = '<img loading="lazy" alt="">'; $('img', b).src = it.thumb; b.onclick = () => C.stock.add(it, kind); grid.appendChild(b); });
        more.hidden = !r.more;
      } catch (e) { console.warn(e); if (my === token) { if (reset) grid.innerHTML = ''; toast('Could not load images — check your connection', '⚠️'); } }
    }
    $$('.chip', view).forEach(c => c.onclick = () => { q = c.dataset.q; $('#elSearch').value = q; $$('.chip', view).forEach(x => x.classList.toggle('on', x === c)); run(true); });
    more.onclick = () => { page++; run(false); };
    searchHook = v => { q = v.trim() || CHIPS[kind][0]; run(true); };
    q = $('#elSearch').value.trim() || (kind === 'photo' ? 'nature' : 'floral'); run(true);
  }

  /* ================= router ================= */
  const CATS = [
    ['shapes', 'Shapes', 'shapes', '#fff4cc', '#b27a00'], ['graphics', 'Graphics', 'sparkles', '#ffe9d6', '#d4540a'], ['icons', 'Icons', 'smile', '#dff7ea', '#0f8f55'],
    ['photos', 'Photos', 'image', '#e4f6f3', '#0b8579'], ['mockups', 'Mockups', 'shirt', '#fff0e0', '#e85d04'], ['effects', 'Effects', 'wand-sparkles', '#f1ffd0', '#4f7a00'],
    ['stickers', 'Stickers', 'sticker', '#fde8ec', '#c0264a'], ['backdrops', 'Backdrops', 'layout-grid', '#e8f0ff', '#2b59c3'], ['lines', 'Lines', 'minus', '#f3eaff', '#6d3fc7'],
  ];
  const home = $('#elHome'), view = $('#elView'), back = $('#elBack'), title = $('#elTitle');
  let searchHook = null, current = 'home';
  const PLACE = { home: 'Search shapes, icons, photos…', shapes: 'Search shapes…', icons: 'Search 1,500+ icons…', photos: 'Search photos…', graphics: 'Search graphics…', mockups: 'Search mockups…', effects: 'Search effects…', stickers: 'Search stickers…', backdrops: 'Backdrops', lines: 'Search lines…' };
  $('#catGrid').innerHTML = CATS.map(([id, n, ic, t, k]) => `<button class="cat" data-el="${id}"><span class="ci" style="--tint:${t};--ink:${k}">${ico(ic, 28)}</span>${n}</button>`).join('');
  $('#popShapes').innerHTML = SHAPES.slice(0, 8).map((s, i) => `<button class="shape-btn" data-shape="${i}" title="${s[1]}" style="color:${TINTS[i % 5]}">${svgShape(s[2], s[3])}</button>`).join('');
  $('#popShapes').onclick = e => { const b = e.target.closest('[data-shape]'); if (b) addShape(+b.dataset.shape); };

  function open(name, q = '') {
    current = name; searchHook = null; const cat = CATS.find(c => c[0] === name);
    home.hidden = name !== 'home' && name !== 'search'; view.hidden = name === 'home'; back.hidden = name === 'home';
    title.textContent = name === 'home' ? 'Elements' : name === 'search' ? 'Results' : cat[1]; $('#elSearch').placeholder = PLACE[name] || PLACE.home; $('#elSearch').value = q;
    if (name === 'home') return;
    home.hidden = true; view.hidden = false; view.scrollTop = 0;
    ({ shapes: shapesView, lines: linesView, icons: iconsView, photos: () => stockView('photo'), graphics: () => stockView('graphic'), mockups: mocksView, effects: effectsView, stickers: stickersView, backdrops: backdropsView, search: () => searchView(q) })[name](q);
  }
  back.onclick = () => open('home'); document.addEventListener('click', e => { const b = e.target.closest('#catGrid [data-el], #elHome [data-el]'); if (b) open(b.dataset.el); });

  function shapesView(q = '') {
    const l = SHAPES.map((s, i) => [s, i]).filter(([s]) => !q || s[1].toLowerCase().includes(q.toLowerCase()));
    view.innerHTML = `<div class="shape-grid">${l.map(([s, i]) => `<button class="shape-btn" data-shape="${i}" title="${s[1]}" style="color:${TINTS[i % 5]}">${svgShape(s[2], s[3])}</button>`).join('')}</div>${l.length ? '' : '<p class="tip">No shapes match.</p>'}`;
    $$('[data-shape]', view).forEach(b => b.onclick = () => addShape(+b.dataset.shape)); searchHook = v => shapesView(v);
  }
  function linesView(q = '') {
    const l = LINES.map((s, i) => [s, i]).filter(([s]) => !q || s[1].toLowerCase().includes(q.toLowerCase()));
    view.innerHTML = `<div class="shape-grid">${l.map(([s, i]) => `<button class="shape-btn" data-line="${i}" title="${s[1]}" style="color:#1d2433">${svgLine(s[2], s[3])}</button>`).join('')}</div>`;
    $$('[data-line]', view).forEach(b => b.onclick = () => addLine(+b.dataset.line)); searchHook = v => linesView(v);
  }
  async function iconsView(q = '') {
    view.innerHTML = '<p class="tip">Loading icons…</p>'; let L; try { L = await lib(); } catch { view.innerHTML = '<p class="tip">Could not load the icon library.</p>'; return; }
    const ql = q.toLowerCase(), names = Object.keys(L).filter(n => !ql || n.includes(ql) || L[n][1].some(t => t.includes(ql)));
    let shown = 0; const grid = document.createElement('div'); grid.className = 'icon-grid';
    const moreBtn = document.createElement('button'); moreBtn.className = 'btn wide'; moreBtn.style.marginTop = '10px';
    const draw = () => { names.slice(shown, shown + 120).forEach(n => { const b = document.createElement('button'); b.className = 'icon-btn'; b.title = n.replace(/-/g, ' '); b.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${L[n][0]}</svg>`; b.onclick = () => addIcon(n, L[n][0]); grid.appendChild(b); }); shown += 120; moreBtn.hidden = shown >= names.length; moreBtn.textContent = `Show more (${names.length - shown})`; };
    view.innerHTML = names.length ? '' : '<p class="tip">No icons match.</p>'; if (names.length) { view.append(grid, moreBtn); moreBtn.onclick = draw; draw(); }
    searchHook = v => iconsView(v);
  }
  function mocksView(q = '') {
    const l = MOCKS.map((m, i) => [m, i]).filter(([m]) => !q || m[1].toLowerCase().includes(q.toLowerCase()));
    view.innerHTML = `<div class="mock-grid">${l.map(([m, i]) => `<button class="mock-card" data-mock="${i}"><span class="pv">${m[3]}</span>${m[1]}</button>`).join('')}</div><p class="tip">Add a mockup, then add or drop a photo — it fills the screen automatically.</p>`;
    $$('[data-mock]', view).forEach(b => b.onclick = () => addMock(+b.dataset.mock)); searchHook = v => mocksView(v);
  }
  function effectsView(q = '') {
    const l = FX.map((f, i) => [f, i]).filter(([f]) => !q || f[1].toLowerCase().includes(q.toLowerCase()));
    view.innerHTML = `<p class="tip" style="margin:0 0 10px">Select a text, shape or photo, then pick an effect.</p><div class="fx-grid">${l.map(([f, i]) => `<button class="fx-card" data-fx="${i}"><span class="pv" style="${f[2]}">Ag</span>${f[1]}</button>`).join('')}</div>`;
    $$('[data-fx]', view).forEach(b => b.onclick = () => applyFx(+b.dataset.fx)); searchHook = v => effectsView(v);
  }
  function stickersView() {
    view.innerHTML = `<div class="emoji-grid">${C.EMOJI.map(e => `<button data-emoji="${e}" title="Add sticker">${e}</button>`).join('')}</div><p class="tip">Emoji look different on each device. For production use your own artwork.</p>`;
    $$('[data-emoji]', view).forEach(b => b.onclick = () => place(new fabric.Text(b.dataset.emoji, { fontSize: u() * 0.2, fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' })));
  }
  function backdropsView() {
    const solids = ['#ffffff', '#fff4cc', '#ffe0b8', '#ffc42e', '#ff7a1a', '#1fb26b', '#b5dd2f', '#14b8a6', '#1d2433', '#fde8ec', '#e8f0ff', '#f3eaff'];
    view.innerHTML = `<h4 style="margin-top:0">Gradients</h4><div class="backdrops">${C.BACKDROPS.map((g, i) => `<button data-bd="${i}" style="background:linear-gradient(135deg,${g[0]},${g[1]})" title="Gradient"></button>`).join('')}</div><h4>Solid colours</h4><div class="backdrops">${solids.map(c => `<button data-sc="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>`;
    $$('[data-bd]', view).forEach(b => b.onclick = () => C.addBackdrop(C.BACKDROPS[b.dataset.bd])); $$('[data-sc]', view).forEach(b => b.onclick = () => C.addBackdrop([b.dataset.sc, b.dataset.sc]));
  }
  async function searchView(q) {
    const ql = q.toLowerCase(), sh2 = SHAPES.map((s, i) => [s, i]).filter(([s]) => s[1].toLowerCase().includes(ql)).slice(0, 12), lines = LINES.map((s, i) => [s, i]).filter(([s]) => s[1].toLowerCase().includes(ql));
    view.innerHTML = `${sh2.length ? `<h4 style="margin-top:0">Shapes</h4><div class="shape-grid">${sh2.map(([s, i]) => `<button class="shape-btn" data-shape="${i}" style="color:${TINTS[i % 5]}" title="${s[1]}">${svgShape(s[2], s[3])}</button>`).join('')}</div>` : ''}${lines.length ? `<h4>Lines</h4><div class="shape-grid">${lines.map(([s, i]) => `<button class="shape-btn" data-line="${i}" style="color:#1d2433">${svgLine(s[2], s[3])}</button>`).join('')}</div>` : ''}<h4>Icons</h4><div class="icon-grid" id="sIcons"></div><h4>More</h4><div class="row2"><button class="btn" data-go="photos"><i data-ico="image" data-s="16"></i>Photos</button><button class="btn" data-go="graphics"><i data-ico="sparkles" data-s="16"></i>Graphics</button></div>`;
    window.hydrateIcons(view);
    $$('[data-shape]', view).forEach(b => b.onclick = () => addShape(+b.dataset.shape)); $$('[data-line]', view).forEach(b => b.onclick = () => addLine(+b.dataset.line));
    $$('[data-go]', view).forEach(b => b.onclick = () => open(b.dataset.go, q));
    try { const L = await lib(), names = Object.keys(L).filter(n => n.includes(ql) || L[n][1].some(t => t.includes(ql))).slice(0, 15), box = $('#sIcons', view); if (box) { box.innerHTML = names.map(n => `<button class="icon-btn" data-i="${n}" title="${n}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${L[n][0]}</svg></button>`).join('') || '<p class="tip" style="grid-column:1/-1">No icons match.</p>'; $$('[data-i]', box).forEach(b => b.onclick = () => addIcon(b.dataset.i, L[b.dataset.i][0])); } } catch { }
  }
  let tmr; $('#elSearch').addEventListener('input', e => {
    clearTimeout(tmr); const v = e.target.value.trim();
    tmr = setTimeout(() => { if (current === 'home' || current === 'search') { if (v) open('search', v); else open('home'); } else if (searchHook) searchHook(v); }, 280);
  });
  Object.assign(C, { openElements: open });
})();
