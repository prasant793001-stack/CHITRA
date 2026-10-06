/* Chitra – a print-focused design studio (DTF + sublimation) built on Fabric.js */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EXTRA = ['adj', 'locked', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY'];
  const DPI = 300;
  const FONTS = ['Fredoka', 'Bangers', 'Anton', 'Bebas Neue', 'Chewy', 'Lobster', 'Pacifico', 'Permanent Marker', 'Righteous',
    'Arial', 'Georgia', 'Impact', 'Verdana', 'Courier New'];
  const COLORS = ['#14110f', '#ffffff', '#ff3d81', '#ffd23f', '#3a86ff', '#2ec4b6', '#ff7a1a', '#8338ec', '#06d6a0', '#ef476f'];
  const EMOJI = ['🔥', '⭐', '💖', '😎', '🌈', '🦄', '🍕', '🌴', '☀️', '🌙', '⚡', '💀', '👑', '🎸', '🐱', '🐶', '🍀', '🌸', '🎉', '💥', '👻', '🚀', '🍉', '🌮'];

  let W = 3300, H = 3900, zoom = 1, guide = 'shirt';
  const canvas = new fabric.Canvas('c', { preserveObjectStacking: true, backgroundColor: '' });
  fabric.Object.prototype.set({
    transparentCorners: false, cornerColor: '#ffd23f', cornerStrokeColor: '#14110f',
    borderColor: '#ff3d81', cornerStyle: 'circle', cornerSize: 12, padding: 2, borderScaleFactor: 2,
  });
  const u = () => Math.min(W, H); // unit for sizing fresh objects relative to the canvas

  /* ---------- history ---------- */
  const history = { stack: [], idx: -1, busy: false };
  const snapshot = () => JSON.stringify({ W, H, canvas: canvas.toJSON(EXTRA) });
  function commit() {
    if (history.busy) return;
    history.stack = history.stack.slice(0, history.idx + 1);
    history.stack.push(snapshot());
    if (history.stack.length > 40) history.stack.shift();
    history.idx = history.stack.length - 1;
  }
  function restore(json) {
    history.busy = true;
    const d = JSON.parse(json);
    setSize(d.W, d.H, false);
    canvas.loadFromJSON(d.canvas, () => {
      syncBg(); canvas.renderAll(); history.busy = false; refreshProps();
    });
  }
  const undo = () => { if (history.idx > 0) restore(history.stack[--history.idx]); };
  const redo = () => { if (history.idx < history.stack.length - 1) restore(history.stack[++history.idx]); };
  ['object:added', 'object:removed', 'object:modified'].forEach(e => canvas.on(e, commit));

  /* ---------- sizing / zoom / guides ---------- */
  function applyZoom() {
    canvas.setZoom(zoom);
    canvas.setDimensions({ width: W * zoom, height: H * zoom });
    $('#zoomLabel').textContent = Math.round(zoom * 100) + '%';
    drawGuides();
  }
  function fit() {
    const s = $('#stage');
    zoom = Math.max(Math.min((s.clientWidth - 70) / W, (s.clientHeight - 70) / H, 1), 0.02); applyZoom();
  }
  function drawGuides() {
    const g = $('#guides'); g.hidden = !$('#showGuides').checked; g.innerHTML = '';
    const pct = (px, total) => (px / total) * 100 + '%';
    const add = (cls, css, text) => {
      const d = document.createElement('div'); d.className = cls; Object.assign(d.style, css);
      if (text) d.textContent = text; g.appendChild(d); return d;
    };
    const m = DPI * 0.125; // 1/8 in safe margin
    add('g-safe', { left: pct(m, W), right: pct(m, W), top: pct(m, H), bottom: pct(m, H) });
    if (guide === 'mug') {
      add('g-zone', { left: 0, width: pct(W * 0.1, W) }); add('g-zone', { right: 0, width: pct(W * 0.1, W) });
      add('g-line', { left: '50%' });
      add('g-label', { left: '50%', top: '6px', transform: 'translateX(-50%)' }, 'FRONT CENTRE');
      add('g-label', { left: '4px', bottom: '6px' }, 'HANDLE');
      add('g-label', { right: '4px', bottom: '6px' }, 'HANDLE');
    } else if (guide === 'shirt') {
      add('g-line', { left: '50%' });
      add('g-label', { left: '50%', top: '6px', transform: 'translateX(-50%)' }, 'COLLAR ▲  CENTRE');
    }
  }
  function updateInfo() {
    $('#sizeInfo').textContent = `${(W / DPI).toFixed(2)} × ${(H / DPI).toFixed(2)} in · ${W}×${H}px @ ${DPI} DPI`;
  }
  function setSize(w, h, record = true, g) {
    W = w; H = h;
    const sel = $('#sizePreset'), val = `${w}x${h}`;
    let opt = [...sel.options].find(o => o.value === val && (g === undefined || (o.dataset.guide || 'none') === g)) ||
      [...sel.options].find(o => o.value === val);
    if (!opt) {
      opt = new Option(`Custom · ${(w / DPI).toFixed(2)}×${(h / DPI).toFixed(2)} in`, val); opt.dataset.guide = 'none'; sel.add(opt, 0);
    }
    sel.selectedIndex = opt.index; guide = g ?? (opt.dataset.guide || 'none');
    updateInfo(); fit();
    if (record) commit();
  }
  // Changing product size keeps your artwork, scaled to fit and centred on the new canvas.
  function rescale(nw, nh) {
    const k = Math.min(nw / W, nh / H), dx = (nw - W * k) / 2, dy = (nh - H * k) / 2;
    canvas.discardActiveObject();
    canvas.getObjects().forEach(o => { o.set({ scaleX: o.scaleX * k, scaleY: o.scaleY * k, left: o.left * k + dx, top: o.top * k + dy }); o.setCoords(); });
  }
  $('#sizePreset').onchange = e => {
    const o = e.target.selectedOptions[0], [w, h] = o.value.split('x').map(Number);
    rescale(w, h); setSize(w, h, true, o.dataset.guide || 'none');
  };
  $('#customSize').onclick = () => {
    const w = parseFloat(prompt('Width in inches?', (W / DPI).toFixed(2))); if (!(w > 0)) return;
    const h = parseFloat(prompt('Height in inches?', (H / DPI).toFixed(2))); if (!(h > 0)) return;
    if (w * h > 600) return alert('That is too big for the browser. Try a smaller size (or a gang sheet up to 22×24 in).');
    rescale(Math.round(w * DPI), Math.round(h * DPI)); setSize(Math.round(w * DPI), Math.round(h * DPI), true, 'none');
  };
  $('#zoomIn').onclick = () => { zoom = Math.min(zoom * 1.25, 4); applyZoom(); };
  $('#zoomOut').onclick = () => { zoom = Math.max(zoom / 1.25, 0.02); applyZoom(); };
  $('#zoomFit').onclick = fit;
  $('#showGuides').onchange = drawGuides;
  window.addEventListener('resize', fit);

  /* ---------- background ---------- */
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

  /* ---------- helpers ---------- */
  const toHex = c => (!c || typeof c !== 'string') ? '#000000' : '#' + new fabric.Color(c).toHex();
  function place(o) {
    o.set({ left: W / 2, top: H / 2, originX: 'center', originY: 'center' });
    canvas.add(o); canvas.setActiveObject(o); canvas.requestRenderAll();
  }
  const active = () => canvas.getActiveObject();
  const isText = o => o && /text/.test(o.type);
  const isImage = o => o && o.type === 'image';

  /* ---------- add elements ---------- */
  const starPoints = (r, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
    const rad = i % 2 ? r * 0.42 : r, a = (Math.PI / n) * i - Math.PI / 2;
    return { x: r + rad * Math.cos(a), y: r + rad * Math.sin(a) };
  });
  const SHAPES = {
    rect: () => new fabric.Rect({ width: u() * 0.4, height: u() * 0.28, fill: '#ff3d81', rx: u() * 0.01, ry: u() * 0.01, stroke: '#14110f', strokeWidth: u() * 0.006 }),
    circle: () => new fabric.Circle({ radius: u() * 0.18, fill: '#ffd23f', stroke: '#14110f', strokeWidth: u() * 0.006 }),
    triangle: () => new fabric.Triangle({ width: u() * 0.35, height: u() * 0.3, fill: '#2ec4b6', stroke: '#14110f', strokeWidth: u() * 0.006 }),
    line: () => new fabric.Line([0, 0, u() * 0.4, 0], { stroke: '#14110f', strokeWidth: u() * 0.012, fill: '#14110f', strokeLineCap: 'round' }),
    star: () => new fabric.Polygon(starPoints(u() * 0.2), { fill: '#ff7a1a', stroke: '#14110f', strokeWidth: u() * 0.006, strokeLineJoin: 'round' }),
    heart: () => new fabric.Path('M 0 -60 C -100 -140 -190 -20 0 110 C 190 -20 100 -140 0 -60 z',
      { fill: '#ff3d81', stroke: '#14110f', strokeWidth: 5, scaleX: u() * 0.0016, scaleY: u() * 0.0016 }),
  };
  $$('[data-add]').forEach(b => b.onclick = () => place(SHAPES[b.dataset.add]()));

  const TEXT = { heading: ['Add a heading', 0.1, 'bold'], sub: ['Add a subheading', 0.06, 'normal'], body: ['Add a little bit of body text', 0.035, 'normal'] };
  function addText(kind, extra = {}) {
    const [t, k, weight] = TEXT[kind];
    const o = new fabric.Textbox(t, { width: W * 0.7, fontSize: Math.round(u() * k), fontWeight: weight, fontFamily: 'Fredoka', fill: '#14110f', textAlign: 'center', ...extra });
    place(o); return o;
  }
  $$('[data-text]').forEach(b => b.onclick = () => addText(b.dataset.text));
  const TSTYLES = () => ({
    pop: { text: 'POP!', fontFamily: 'Bangers', fill: '#ffd23f', stroke: '#14110f', strokeWidth: u() * 0.012, paintFirst: 'stroke', strokeLineJoin: 'round', fontSize: u() * 0.2, shadow: new fabric.Shadow({ color: '#14110f', offsetX: u() * 0.012, offsetY: u() * 0.012, blur: 0 }) },
    retro: { text: 'Retro Vibes', fontFamily: 'Pacifico', fill: '#ff3d81', fontSize: u() * 0.14, shadow: new fabric.Shadow({ color: '#14110f', offsetX: u() * 0.008, offsetY: u() * 0.008, blur: 0 }) },
    neon: { text: 'NEON', fontFamily: 'Righteous', fill: '#ffffff', fontSize: u() * 0.18, shadow: new fabric.Shadow({ color: '#3a86ff', blur: u() * 0.04 }), stroke: '#3a86ff', strokeWidth: u() * 0.004 },
    stamp: { text: 'ORIGINAL', fontFamily: 'Anton', fill: '#14110f', fontSize: u() * 0.15, charSpacing: 200 },
  });
  $$('[data-tstyle]').forEach(b => b.onclick = () => {
    const s = { ...TSTYLES()[b.dataset.tstyle] };
    const { text, ...rest } = s;
    place(new fabric.Textbox(text, { width: W * 0.8, textAlign: 'center', fontWeight: 'normal', ...rest }));
  });
  $('#emojiGrid').innerHTML = EMOJI.map(e => `<button data-emoji="${e}" title="Add sticker">${e}</button>`).join('');
  $$('[data-emoji]').forEach(b => b.onclick = () => place(new fabric.Text(b.dataset.emoji, {
    fontSize: u() * 0.2, fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
  })));

  function addImageFromURL(url) {
    fabric.Image.fromURL(url, img => {
      const s = Math.min((W * 0.8) / img.width, (H * 0.8) / img.height, 1);
      img.set({ adj: { brightness: 0, contrast: 0, saturation: 0, blur: 0, whiteDist: 0, preset: '' } }).scale(s);
      place(img);
    });
  }
  const readFiles = files => [...files].filter(f => f.type.startsWith('image/')).forEach(f => {
    const r = new FileReader(); r.onload = () => addImageFromURL(r.result); r.readAsDataURL(f);
  });
  $('#imgUpload').onchange = e => { readFiles(e.target.files); e.target.value = ''; };
  $('#stage').addEventListener('dragover', e => e.preventDefault());
  $('#stage').addEventListener('drop', e => { e.preventDefault(); readFiles(e.dataTransfer.files); });
  document.addEventListener('paste', e => readFiles(e.clipboardData?.files || []));

  /* ---------- templates ---------- */
  function clearAll(bg = '') {
    history.busy = true; canvas.clear(); history.busy = false;
    canvas.setBackgroundColor(bg, () => { syncBg(); canvas.renderAll(); });
  }
  const T = (text, o) => new fabric.Textbox(text, { fontFamily: 'Fredoka', textAlign: 'center', originX: 'center', originY: 'center', width: W * 0.8, ...o });
  const outline = (c = '#14110f') => ({ stroke: c, strokeWidth: u() * 0.012, paintFirst: 'stroke', strokeLineJoin: 'round' });
  const TEMPLATES = {
    blank: () => clearAll(''),
    slogan: () => {
      clearAll('');
      canvas.add(T('GOOD', { left: W / 2, top: H * 0.3, fontFamily: 'Bangers', fontSize: u() * 0.3, fill: '#ffd23f', ...outline(), shadow: new fabric.Shadow({ color: '#14110f', offsetX: u() * 0.014, offsetY: u() * 0.014, blur: 0 }) }));
      canvas.add(T('VIBES', { left: W / 2, top: H * 0.5, fontFamily: 'Bangers', fontSize: u() * 0.3, fill: '#ff3d81', ...outline(), shadow: new fabric.Shadow({ color: '#14110f', offsetX: u() * 0.014, offsetY: u() * 0.014, blur: 0 }) }));
      canvas.add(T('ONLY ✦ GOOD ✦ ONLY', { left: W / 2, top: H * 0.68, fontFamily: 'Anton', fontSize: u() * 0.05, fill: '#3a86ff', charSpacing: 300, ...outline('#ffffff') }));
    },
    badge: () => {
      clearAll('');
      const r = u() * 0.38;
      canvas.add(new fabric.Circle({ left: W / 2, top: H / 2, radius: r, originX: 'center', originY: 'center', fill: '#3a86ff', stroke: '#14110f', strokeWidth: u() * 0.014 }));
      canvas.add(new fabric.Circle({ left: W / 2, top: H / 2, radius: r * 0.86, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#ffd23f', strokeWidth: u() * 0.008, strokeDashArray: [u() * 0.02, u() * 0.02] }));
      canvas.add(T('★', { left: W / 2, top: H / 2 - r * 0.55, width: r, fontSize: r * 0.35, fill: '#ffd23f' }));
      canvas.add(T('MADE WITH', { left: W / 2, top: H / 2 - r * 0.18, width: r * 1.5, fontFamily: 'Anton', fontSize: r * 0.2, fill: '#fff', charSpacing: 300 }));
      canvas.add(T('LOVE', { left: W / 2, top: H / 2 + r * 0.2, width: r * 1.5, fontFamily: 'Bangers', fontSize: r * 0.5, fill: '#ff3d81', ...outline('#ffffff') }));
      canvas.add(T('EST. 2025', { left: W / 2, top: H / 2 + r * 0.6, width: r * 1.5, fontFamily: 'Anton', fontSize: r * 0.14, fill: '#fff', charSpacing: 400 }));
    },
    mug: () => {
      clearAll('');
      canvas.add(T('Best Mom Ever', { left: W / 2, top: H * 0.42, width: W * 0.36, fontFamily: 'Pacifico', fontSize: H * 0.2, fill: '#ff3d81', shadow: new fabric.Shadow({ color: '#14110f', offsetX: H * 0.012, offsetY: H * 0.012, blur: 0 }) }));
      canvas.add(T('♥  ♥  ♥', { left: W / 2, top: H * 0.78, width: W * 0.3, fontSize: H * 0.1, fill: '#ff3d81' }));
      canvas.add(T('✦', { left: W * 0.25, top: H * 0.5, width: 200, fontSize: H * 0.2, fill: '#ffd23f' }));
      canvas.add(T('✦', { left: W * 0.75, top: H * 0.5, width: 200, fontSize: H * 0.2, fill: '#3a86ff' }));
    },
  };
  $$('[data-template]').forEach(b => b.onclick = () => {
    if (canvas.getObjects().length && !confirm('Replace your current design with this quick start?')) return;
    TEMPLATES[b.dataset.template](); canvas.discardActiveObject(); canvas.renderAll(); commit(); refreshProps();
  });

  /* ---------- print tools: gang-sheet packing & copies ---------- */
  function pack() {
    const objs = canvas.getObjects().filter(o => !o.locked);
    if (!objs.length) return;
    canvas.discardActiveObject();
    const gap = Math.round(DPI * 0.25); // 1/4 in between designs
    const boxes = objs.map(o => ({ o, r: o.getBoundingRect(true, true) })).sort((a, b) => b.r.height - a.r.height);
    let x = gap, y = gap, rowH = 0;
    boxes.forEach(({ o, r }) => {
      if (x + r.width > W - gap && x > gap) { x = gap; y += rowH + gap; rowH = 0; }
      o.set({ left: o.left + (x - r.left), top: o.top + (y - r.top) }); o.setCoords();
      x += r.width + gap; rowH = Math.max(rowH, r.height);
    });
    canvas.requestRenderAll(); commit();
    if (y + rowH > H - gap) alert('Heads up: your designs do not all fit on this sheet. Try a longer gang sheet.');
  }
  $('#pack').onclick = pack;
  $('#copies').onclick = async () => {
    const o = active();
    if (!o || o.type === 'activeSelection') return alert('Click one design first, then press Make copies.');
    const n = parseInt(prompt('How many in total (including this one)?', '4'), 10);
    if (!(n > 1 && n <= 200)) return;
    history.busy = true;
    for (let i = 1; i < n; i++) await new Promise(res => o.clone(c => { canvas.add(c); res(); }, EXTRA));
    history.busy = false; pack();
  };

  /* ---------- arrange ---------- */
  const act = fn => () => { const o = active(); if (!o) return; fn(o); canvas.requestRenderAll(); commit(); refreshProps(); };
  $('#forward').onclick = act(o => canvas.bringForward(o));
  $('#backward').onclick = act(o => canvas.sendBackwards(o));
  $('#toFront').onclick = act(o => canvas.bringToFront(o));
  $('#toBack').onclick = act(o => canvas.sendToBack(o));
  $('#flipH').onclick = act(o => o.set('flipX', !o.flipX));
  $('#flipV').onclick = act(o => o.set('flipY', !o.flipY));
  $('#lock').onclick = act(o => {
    const v = !o.locked;
    o.set({ locked: v, lockMovementX: v, lockMovementY: v, lockRotation: v, lockScalingX: v, lockScalingY: v, hasControls: !v });
  });
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
      c.set({ left: o.left + 30, top: o.top + 30, evented: true });
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

  /* ---------- properties ---------- */
  $('#fontFamily').innerHTML = FONTS.map(f => `<option style="font-family:'${f}'">${f}</option>`).join('');
  $('#swatches').innerHTML = COLORS.map(c => `<button data-color="${c}" style="background:${c}" title="${c}"></button>`).join('');
  const targets = () => { const o = active(); return !o ? [] : o.type === 'activeSelection' ? o.getObjects() : [o]; };
  $$('[data-color]').forEach(b => b.onclick = () => {
    targets().forEach(o => o.set('fill', b.dataset.color)); canvas.requestRenderAll(); commit(); refreshProps();
  });

  function refreshProps() {
    const o = active();
    $('#emptyProps').hidden = !!o; $('#propsBody').hidden = !o;
    if (!o) return;
    $('#textSec').hidden = !isText(o); $('#imageSec').hidden = !isImage(o);
    $('#fill').value = toHex(typeof o.fill === 'string' ? o.fill : '#000000');
    $('#stroke').value = toHex(o.stroke || '#000000');
    $('#strokeWidth').value = o.strokeWidth || 0;
    $('#opacity').value = Math.round((o.opacity ?? 1) * 100);
    $('#angle').value = Math.round(o.angle || 0);
    $('#shadow').checked = !!o.shadow;
    $('#lock').textContent = o.locked ? 'Unlock' : 'Lock';
    if (isText(o)) {
      $('#fontFamily').value = o.fontFamily; $('#fontSize').value = Math.round(o.fontSize * (o.scaleY || 1));
      $('#lineHeight').value = Math.round((o.lineHeight || 1.16) * 100); $('#charSpacing').value = o.charSpacing || 0;
    }
    if (isImage(o)) {
      const a = o.adj || {};
      $$('[data-filter]').forEach(i => i.value = a[i.dataset.filter] || 0);
      const dpi = Math.round(DPI * o.width / o.getScaledWidth()), el = $('#dpiInfo');
      el.textContent = dpi >= 200 ? `✔ ${dpi} DPI at this size — print ready` : `⚠ Only ${dpi} DPI at this size — may print soft`;
      el.classList.toggle('warn', dpi < 200);
    }
  }
  canvas.on('selection:created', refreshProps);
  canvas.on('selection:updated', refreshProps);
  canvas.on('selection:cleared', refreshProps);
  canvas.on('object:rotating', refreshProps);
  canvas.on('object:scaling', refreshProps);

  const bind = (sel, prop, conv = v => v, evt = 'input') => {
    const el = $(sel);
    el.addEventListener(evt, () => { targets().forEach(o => o.set(prop, conv(el.value))); canvas.requestRenderAll(); });
    el.addEventListener('change', commit);
  };
  bind('#fill', 'fill'); bind('#stroke', 'stroke');
  $('#stroke').addEventListener('input', () => {
    if (!+$('#strokeWidth').value) { const w = Math.round(u() * 0.008); $('#strokeWidth').value = w; targets().forEach(o => o.set('strokeWidth', w)); canvas.requestRenderAll(); }
  });
  bind('#strokeWidth', 'strokeWidth', Number); bind('#opacity', 'opacity', v => v / 100);
  bind('#fontFamily', 'fontFamily', v => v, 'change');
  bind('#lineHeight', 'lineHeight', v => v / 100); bind('#charSpacing', 'charSpacing', Number);
  $('#angle').addEventListener('input', e => { targets().forEach(o => o.rotate(+e.target.value)); canvas.requestRenderAll(); });
  $('#angle').addEventListener('change', commit);
  $('#fontSize').addEventListener('input', e => {
    targets().filter(isText).forEach(o => o.set({ fontSize: +e.target.value || 12, scaleX: 1, scaleY: 1 })); canvas.requestRenderAll();
  });
  $('#fontSize').addEventListener('change', commit);
  $('#shadow').onchange = e => {
    const k = u();
    targets().forEach(o => o.set('shadow', e.target.checked ? new fabric.Shadow({ color: 'rgba(0,0,0,.45)', blur: k * 0.015, offsetX: k * 0.006, offsetY: k * 0.008 }) : null));
    canvas.requestRenderAll(); commit();
  };
  const toggleStyle = (prop, on, off) => act(o => { if (isText(o)) o.set(prop, o[prop] === on ? off : on); });
  $('#bold').onclick = toggleStyle('fontWeight', 'bold', 'normal');
  $('#italic').onclick = toggleStyle('fontStyle', 'italic', 'normal');
  $('#underline').onclick = act(o => isText(o) && o.set('underline', !o.underline));
  $$('[data-talign]').forEach(b => b.onclick = act(o => isText(o) && o.set('textAlign', b.dataset.talign)));

  /* ---------- image filters ---------- */
  const F = fabric.Image.filters;
  const PRESETS = {
    grayscale: () => [new F.Grayscale()],
    sepia: () => [new F.Sepia()],
    invert: () => [new F.Invert()],
    vintage: () => [new F.Sepia(), new F.Contrast({ contrast: 0.1 }), new F.Brightness({ brightness: -0.05 })],
  };
  function applyFilters(o) {
    const a = o.adj || (o.adj = {}), f = [];
    if (a.whiteDist) f.push(new F.RemoveColor({ color: '#ffffff', distance: a.whiteDist / 200 }));
    if (a.brightness) f.push(new F.Brightness({ brightness: a.brightness / 100 }));
    if (a.contrast) f.push(new F.Contrast({ contrast: a.contrast / 100 }));
    if (a.saturation) f.push(new F.Saturation({ saturation: a.saturation / 100 }));
    if (a.blur) f.push(new F.Blur({ blur: a.blur / 100 }));
    if (a.preset && PRESETS[a.preset]) f.push(...PRESETS[a.preset]());
    o.filters = f; o.applyFilters(); canvas.requestRenderAll();
  }
  $$('[data-filter]').forEach(i => {
    i.addEventListener('input', () => { const o = active(); if (!isImage(o)) return; (o.adj ||= {})[i.dataset.filter] = +i.value; applyFilters(o); });
    i.addEventListener('change', commit);
  });
  $$('[data-preset]').forEach(b => b.onclick = () => {
    const o = active(); if (!isImage(o)) return;
    if (b.dataset.preset === 'reset') o.adj = { brightness: 0, contrast: 0, saturation: 0, blur: 0, whiteDist: 0, preset: '' };
    else (o.adj ||= {}).preset = o.adj.preset === b.dataset.preset ? '' : b.dataset.preset;
    applyFilters(o); refreshProps(); commit();
  });
  $('#cropToCanvas').onclick = act(o => {
    if (!isImage(o)) return;
    const s = Math.max(W / o.width, H / o.height);
    o.set({ scaleX: s, scaleY: s, left: W / 2, top: H / 2, originX: 'center', originY: 'center', angle: 0 }); o.setCoords();
  });

  /* ---------- save / export ---------- */
  function download(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); }
  $('#saveProject').onclick = () => {
    const u = URL.createObjectURL(new Blob([snapshot()], { type: 'application/json' }));
    download(u, 'design.chitra.json'); setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  $('#openProject').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { restore(r.result); setTimeout(commit, 50); } catch { alert('That is not a Chitra project file.'); } };
    r.readAsText(f); e.target.value = '';
  };

  // Write the print resolution (300 DPI) into the file so RIP/print software sizes it correctly.
  const CRC_T = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (const x of b) c = CRC_T[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function stampDpi(bytes, fmt) {
    if (fmt === 'jpeg') {
      if (bytes[2] === 0xFF && bytes[3] === 0xE0) { bytes[13] = 1; bytes[14] = bytes[16] = DPI >> 8; bytes[15] = bytes[17] = DPI & 255; }
      return bytes;
    }
    const ppm = Math.round(DPI / 0.0254), chunk = new Uint8Array(21), dv = new DataView(chunk.buffer);
    dv.setUint32(0, 9); chunk.set([0x70, 0x48, 0x59, 0x73], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); chunk[16] = 1;
    dv.setUint32(17, crc32(chunk.subarray(4, 17)));
    const out = new Uint8Array(bytes.length + 21);
    out.set(bytes.subarray(0, 33)); out.set(chunk, 33); out.set(bytes.subarray(33), 54);
    return out;
  }
  $('#download').onclick = () => {
    canvas.discardActiveObject(); canvas.renderAll();
    const fmt = $('#exportFormat').value, mime = fmt === 'jpeg' ? 'image/jpeg' : 'image/png';
    const prevBg = canvas.backgroundColor;
    if (fmt === 'jpeg' && !prevBg) canvas.backgroundColor = '#ffffff'; // JPG has no transparency
    let el = canvas.toCanvasElement(1 / zoom);
    canvas.backgroundColor = prevBg;
    if ($('#mirror').checked) {
      const m = document.createElement('canvas'); m.width = el.width; m.height = el.height;
      const ctx = m.getContext('2d'); ctx.translate(m.width, 0); ctx.scale(-1, 1); ctx.drawImage(el, 0, 0); el = m;
    }
    el.toBlob(async blob => {
      const bytes = stampDpi(new Uint8Array(await blob.arrayBuffer()), fmt);
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      download(url, `chitra-${W}x${H}${$('#mirror').checked ? '-mirrored' : ''}.${fmt === 'jpeg' ? 'jpg' : 'png'}`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, mime, 0.95);
  };

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', e => {
    const el = document.activeElement;
    if (/INPUT|SELECT|TEXTAREA/.test(el?.tagName) && !/range|color|checkbox/.test(el.type || '')) return;
    const o = active(); if (o?.isEditing) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && k === 'y') { e.preventDefault(); redo(); }
    else if (mod && k === 'd') { e.preventDefault(); duplicate(); }
    else if (k === 'delete' || k === 'backspace') { if (o) { e.preventDefault(); remove(); } }
    else if (o && k.startsWith('arrow')) {
      e.preventDefault(); const d = e.shiftKey ? 10 : 1;
      o.set({ left: o.left + (k === 'arrowright' ? d : k === 'arrowleft' ? -d : 0), top: o.top + (k === 'arrowdown' ? d : k === 'arrowup' ? -d : 0) });
      o.setCoords(); canvas.requestRenderAll();
    }
  });
  $('#undo').onclick = undo; $('#redo').onclick = redo;

  /* ---------- boot ---------- */
  setSize(3300, 3900, false, 'shirt');
  history.busy = true; TEMPLATES.slogan(); history.busy = false; canvas.renderAll(); commit();
  // Re-measure text once web fonts have arrived so layout/export match what you see.
  if (document.fonts) {
    Promise.all(FONTS.map(f => document.fonts.load(`40px "${f}"`).catch(() => {}))).then(() => {
      fabric.util.clearFabricFontCache();
      canvas.getObjects().forEach(o => { if (isText(o)) { o.dirty = true; o.initDimensions(); } });
      canvas.requestRenderAll();
    });
  }
  window.chitra = { canvas, undo, redo, addText, TEMPLATES, setSize, pack };
})();
