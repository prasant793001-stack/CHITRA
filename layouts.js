/* Chitra Studio – print layouts: virtual print areas ("slots") sized exactly for a product, so photos
   drop in at the right physical size with no maths. Includes ready-made sheets and saved user layouts. */
(() => {
  const C = window.chitra;
  const { $, $$, toast, confetti, canvas, kv } = C;
  const SLOT_PRESETS = [
    ['11 oz mug wrap', 8.25, 3.5, 'mug'], ['15 oz mug wrap', 9, 3.75, 'mug'], ['20 oz tumbler wrap', 9.3, 8.2, 'tumbler'], ['T-shirt front', 11, 13, 'shirt'], ['T-shirt back', 12, 16, 'shirt'],
    ['Left chest', 4, 4, 'shirt'], ['Pocket logo', 3.5, 3.5, 'shirt'], ['Coaster', 4, 4, 'plain'], ['Mouse pad', 9.5, 7.9, 'plain'], ['Phone case', 3, 6, 'plain'],
    ['Sticker 2.5 in', 2.5, 2.5, 'plain'], ['Cap front', 4, 2, 'plain'], ['Sleeve', 3, 10, 'plain'], ['Custom size', 5, 5, 'plain'],
  ];
  // sheet px @300 DPI, slots in inches
  const SHEETS = { A4: [2480, 3508], A3: [3508, 4961] };
  const grid = (sheet, sw, sh, cols, rows, label, kind, gap = 0.25) => {
    const [W, H] = SHEETS[sheet].map(v => v / 300), tw = cols * sw + (cols - 1) * gap, th = rows * sh + (rows - 1) * gap, x0 = (W - tw) / 2, y0 = (H - th) / 2, out = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ label, kind, w: sw, h: sh, x: x0 + c * (sw + gap), y: y0 + r * (sh + gap) });
    return out;
  };
  const LAYOUTS = [
    { id: 'mug-a4-1', name: '11 oz mug · A4 (1 up)', icon: '☕', sheet: 'A4', slots: grid('A4', 8.25, 3.5, 1, 1, '11 oz mug wrap', 'mug') },
    { id: 'mug-a4-3', name: '11 oz mug · A4 (3 up)', icon: '☕', sheet: 'A4', slots: grid('A4', 8.25, 3.5, 1, 3, '11 oz mug wrap', 'mug', 0.2), hot: true },
    { id: 'mug-a3-4', name: '11 oz mug · A3 (4 up)', icon: '☕', sheet: 'A3', slots: grid('A3', 8.25, 3.5, 1, 4, '11 oz mug wrap', 'mug') },
    { id: 'mug15-a3-4', name: '15 oz mug · A3 (4 up)', icon: '🍵', sheet: 'A3', slots: grid('A3', 9, 3.75, 1, 4, '15 oz mug wrap', 'mug') },
    { id: 'tumbler-a3', name: '20 oz tumbler · A3', icon: '🥤', sheet: 'A3', slots: grid('A3', 9.3, 8.2, 1, 1, '20 oz tumbler wrap', 'tumbler') },
    { id: 'coaster-a4-4', name: 'Coaster · A4 (4 up)', icon: '🟫', sheet: 'A4', slots: grid('A4', 4, 4, 2, 2, 'Coaster 4 in', 'plain') },
    { id: 'tee-a3', name: 'T-shirt front · A3', icon: '👕', sheet: 'A3', slots: grid('A3', 11, 13, 1, 1, 'T-shirt front 11×13 in', 'shirt'), hot: true },
    { id: 'pocket-a4-6', name: 'Pocket logo · A4 (6 up)', icon: '📍', sheet: 'A4', slots: grid('A4', 3.5, 3.5, 2, 3, 'Pocket logo', 'shirt') },
    { id: 'chest-a4-4', name: 'Left chest · A4 (4 up)', icon: '📍', sheet: 'A4', slots: grid('A4', 4, 4, 2, 2, 'Left chest', 'shirt') },
    { id: 'phone-a4-2', name: 'Phone case · A4 (2 up)', icon: '📱', sheet: 'A4', slots: grid('A4', 3, 6, 2, 1, 'Phone case', 'plain') },
    { id: 'mousepad-a3-2', name: 'Mouse pad · A3 (2 up)', icon: '🖱️', sheet: 'A3', slots: grid('A3', 9.5, 7.9, 1, 2, 'Mouse pad', 'plain') },
    { id: 'sticker-a4-9', name: 'Stickers 2.5 in · A4 (9 up)', icon: '🏷️', sheet: 'A4', slots: grid('A4', 2.5, 2.5, 3, 3, 'Sticker', 'plain') },
  ];

  /* ================= slots ================= */
  const slots = () => canvas.getObjects().filter(o => o.slot).sort((a, b) => a.top - b.top || a.left - b.left); // reading order
  const slotById = id => slots().find(s => s.slot.id === id);
  const linked = s => canvas.getObjects().filter(o => o.inSlot === s.slot.id);
  const filled = s => linked(s).length > 0;
  function makeSlot({ label, kind = 'plain', w, h, x, y }, dpi = C.dpi, lock = $('#slotLock')?.checked !== false) {
    const k = Math.min(C.W, C.H);
    const r = new fabric.Rect({
      left: x * dpi, top: y * dpi, width: w * dpi, height: h * dpi, fill: 'rgba(255,122,26,.08)', stroke: '#ff7a1a', strokeWidth: Math.max(2, k * 0.0035), strokeUniform: true,
      strokeDashArray: [k * 0.012, k * 0.008], objectCaching: false,
    });
    r.slot = { id: C.uid(), label, kind, w, h };
    applyLock(r, lock); return r;
  }
  function makeSlotPx({ label, kind = 'mock', left, top, width, height, rx = 0 }) { // pixel-space slot (mockups)
    const k = Math.min(C.W, C.H), dpi = C.dpi;
    const r = new fabric.Rect({ left, top, width, height, rx, ry: rx, fill: 'rgba(255,122,26,.08)', stroke: '#ff7a1a', strokeWidth: Math.max(2, k * 0.0035), strokeUniform: true, strokeDashArray: [k * 0.012, k * 0.008], objectCaching: false });
    r.slot = { id: C.uid(), label, kind, w: +(width / dpi).toFixed(2), h: +(height / dpi).toFixed(2), rx };
    applyLock(r, true); return r;
  }
  function applyLock(r, v) { r.set({ lockMovementX: v, lockMovementY: v, lockScalingX: v, lockScalingY: v, lockRotation: true, hasControls: false, hoverCursor: v ? 'pointer' : 'move' }); }
  function addSlot(def) { // def in inches; if x/y missing the area lands in the middle of the page
    const dpi = C.dpi, W = C.W / dpi, H = C.H / dpi;
    const s = makeSlot({ ...def, x: def.x ?? Math.max(0, (W - def.w) / 2), y: def.y ?? Math.max(0, (H - def.h) / 2) });
    canvas.add(s); canvas.sendToBack(s); canvas.setActiveObject(s); canvas.requestRenderAll(); return s;
  }
  $('#slotPreset').innerHTML = SLOT_PRESETS.map((p, i) => `<option value="${i}">${p[0]} · ${p[1]}×${p[2]} in</option>`).join('');
  $('#slotPreset').onchange = e => { const p = SLOT_PRESETS[e.target.value]; $('#slotW').value = p[1]; $('#slotH').value = p[2]; };
  $('#slotAdd').onclick = () => {
    const p = SLOT_PRESETS[$('#slotPreset').value], w = +$('#slotW').value, h = +$('#slotH').value;
    if (!(w > 0 && h > 0)) return toast('Enter a width and height', 'info');
    addSlot({ label: p[0] === 'Custom size' ? `${w}×${h} in area` : p[0], kind: p[3], w, h }); toast('Print area added — drop a photo in', 'printer');
  };
  function arrange() { // shelf-pack all print areas (and move the photos inside them)
    const ss = slots(); if (!ss.length) return toast('Add a print area first', 'info');
    const gap = 0.25 * C.dpi, Wd = C.W; let x = gap, y = gap, rowH = 0;
    ss.slice().sort((a, b) => b.height - a.height).forEach(s => {
      const w = s.width * s.scaleX, h = s.height * s.scaleY;
      if (x + w > Wd - gap && x > gap) { x = gap; y += rowH + gap; rowH = 0; }
      moveSlot(s, x - s.left, y - s.top); x += w + gap; rowH = Math.max(rowH, h);
    });
    canvas.requestRenderAll(); C.commit(); toast('Print areas arranged', '🧩');
  }
  $('#slotArrange').onclick = arrange;
  $('#slotLock').onchange = e => { slots().forEach(s => applyLock(s, e.target.checked)); canvas.discardActiveObject(); canvas.requestRenderAll(); };
  function moveSlot(s, dx, dy) {
    s.set({ left: s.left + dx, top: s.top + dy }); s.setCoords();
    linked(s).forEach(i => { i.set({ left: i.left + dx, top: i.top + dy }); if (i.clipPath) i.clipPath.set({ left: i.clipPath.left + dx, top: i.clipPath.top + dy }); i.dirty = true; i.setCoords(); });
  }
  canvas.on('mouse:down', e => { if (e.target?.slot) { e.target._px = e.target.left; e.target._py = e.target.top; } });
  canvas.on('object:moving', e => { const s = e.target; if (s?.slot && s._px !== undefined) { const dx = s.left - s._px, dy = s.top - s._py; s._px = s.left; s._py = s.top; linked(s).forEach(i => { i.set({ left: i.left + dx, top: i.top + dy }); if (i.clipPath) i.clipPath.set({ left: i.clipPath.left + dx, top: i.clipPath.top + dy }); i.dirty = true; i.setCoords(); }); } });

  /* ---- fitting photos into a slot ---- */
  function fitInto(img, s, mode = 'cover') {
    const w = s.width * s.scaleX, h = s.height * s.scaleY, k = (mode === 'cover' ? Math.max : Math.min)(w / img.width, h / img.height);
    img.set({ originX: 'center', originY: 'center', left: s.left + w / 2, top: s.top + h / 2, scaleX: k, scaleY: k, angle: 0, flipX: false, flipY: false, inSlot: s.slot.id });
    img.clipPath = new fabric.Rect({ left: s.left, top: s.top, width: w, height: h, rx: s.rx || 0, ry: s.rx || 0, absolutePositioned: true }); img.dirty = true; img.setCoords(); img.fitMode = mode;
  }
  C.beforePlace = o => { // photos land in the selected print area, or the first empty one
    if (o.type !== 'image' || !slots().length) return false;
    const a = C.active(); let s = a?.slot ? a : a?.inSlot ? slotById(a.inSlot) : null;
    s ||= slots().find(x => !filled(x)); if (!s) return false;
    linked(s).forEach(i => canvas.remove(i)); fitInto(o, s, 'cover'); return true;
  };
  const selSlot = () => { const a = C.active(); return a?.slot ? a : a?.inSlot ? slotById(a.inSlot) : null; };
  function pickPhoto() {
    const s = selSlot(); if (!s) return;
    canvas.setActiveObject(s); const inp = $('#imgUpload'); inp.click();
  }
  function refit(mode) {
    const a = C.active(), s = selSlot(); if (!s) return;
    const imgs = a?.inSlot ? [a] : linked(s); if (!imgs.length) return toast('Add a photo to this area first', '🖼️');
    imgs.forEach(i => fitInto(i, s, mode || (i.fitMode === 'cover' ? 'contain' : 'cover'))); canvas.requestRenderAll(); C.commit(); toast(`Fit: ${imgs[0].fitMode}`, '⛶');
  }
  function clearSlot() { const s = selSlot(); if (!s) return; const l = linked(s); l.forEach(i => canvas.remove(i)); canvas.setActiveObject(s); canvas.requestRenderAll(); C.commit(); toast(l.length ? 'Area cleared' : 'Area is already empty', '🧹'); }
  async function fillAll() {
    const a = C.active(); if (!a?.inSlot) return toast('Select a photo inside a print area first', 'info');
    const others = slots().filter(s => s.slot.id !== a.inSlot); if (!others.length) return toast('Only one print area on this page', 'ℹ️');
    C.history.busy = true;
    for (const s of others) { linked(s).forEach(i => canvas.remove(i)); await new Promise(res => a.clone(c => { fitInto(c, s, a.fitMode || 'cover'); canvas.add(c); res(); }, C.EXTRA)); }
    C.history.busy = false; canvas.requestRenderAll(); C.commit(); confetti(innerWidth / 2, innerHeight / 2, 60); toast(`Copied to ${others.length} more area${others.length > 1 ? 's' : ''}`, '📑');
  }
  const unlockToggle = () => { const s = selSlot(); if (!s) return; const v = !s.lockMovementX; applyLock(s, v); canvas.requestRenderAll(); toast(v ? 'Area locked' : 'Area unlocked — drag to move', v ? '🔒' : '🔓'); };
  C.extraActs = { addToSlot: pickPhoto, fitSlot: () => refit(), clearSlot, fillAll, refitSlot: () => refit('cover'), toggleSlotLock: unlockToggle };

  // Inspector section (desktop) + phone sheet ("Area")
  $$('[data-slotop]').forEach(b => b.onclick = () => ({ add: pickPhoto, fit: () => refit(), clear: clearSlot, all: fillAll, lock: unlockToggle })[b.dataset.slotop]());
  const syncSlotSec = () => { const a = C.active(), sec = $('#slotSec'); if (sec) sec.hidden = !(a?.slot || a?.inSlot); };
  ['selection:created', 'selection:updated', 'selection:cleared'].forEach(e => canvas.on(e, syncSlotSec));

  /* ---- hide guides on export; draw labels & mug guides on screen only ---- */
  let hidden = [];
  canvas.on('export:start', () => { hidden = slots().filter(s => s.visible); hidden.forEach(s => { s.visible = false; }); });
  canvas.on('export:end', () => { hidden.forEach(s => { s.visible = true; }); hidden = []; });
  canvas.on('after:render', ({ ctx }) => {
    if (canvas.__exporting || !ctx) return;
    const z = canvas.getZoom(), act = C.active();
    slots().forEach(s => {
      if (!s.visible) return;
      const x = s.left * z, y = s.top * z, w = s.width * s.scaleX * z, h = s.height * s.scaleY * z, empty = !filled(s), sel = act === s;
      ctx.save();
      if (s.slot.kind === 'mug' && (empty || sel)) {
        ctx.fillStyle = 'rgba(255,45,149,.16)'; ctx.fillRect(x, y, w * 0.1, h); ctx.fillRect(x + w * 0.9, y, w * 0.1, h);
        ctx.strokeStyle = 'rgba(34,211,238,.9)'; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke(); ctx.setLineDash([]);
      }
      if (empty || sel) {
        const t = `${s.slot.label} · ${s.slot.w}×${s.slot.h} in`; ctx.font = '600 11px "Space Grotesk",system-ui,sans-serif';
        const tw = ctx.measureText(t).width + 14, ph = 20, px = x + Math.max(4, Math.min(8, w * 0.02)), py = y + 6;
        if (w > tw + 12 && h > ph + 12) { ctx.fillStyle = '#ff7a1a'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(px, py, tw, ph, 10) : ctx.rect(px, py, tw, ph); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(t, px + 7, py + ph / 2 + 0.5); }
        if (empty && w > 140 && h > 60) { ctx.fillStyle = 'rgba(230,90,0,.95)'; ctx.font = '700 13px "Space Grotesk",system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+ drop a photo here', x + w / 2, y + h / 2); }
      }
      ctx.restore();
    });
  });

  /* ================= building layouts ================= */
  function buildLayout(def) { slots().forEach(s => canvas.remove(s)); def.slots.forEach(s => canvas.add(makeSlot(s, 300))); slots().forEach(s => canvas.sendToBack(s)); canvas.requestRenderAll(); }
  async function useBuiltin(def, asNew) {
    const [w, h] = SHEETS[def.sheet];
    if (asNew) { await C.newDocument({ w, h, dpi: 300, guide: 'paper', template: 'blank', name: def.name }); buildLayout(def); canvas.renderAll(); C.commit(); toast('Layout ready — drop your photos in', def.icon); return; }
    if (canvas.getObjects().length && !confirm('Replace this page with the layout?')) return;
    C.history.busy = true; canvas.clear(); canvas.backgroundColor = ''; C.history.busy = false; C.setSize(w, h, true, 'paper', 300); buildLayout(def); C.commit();
    toast('Layout applied — drop your photos in', def.icon);
  }
  // thumbnail of a layout (sheet with labelled print areas)
  function layoutThumb(def, width = 260) {
    const [W, H] = SHEETS[def.sheet], k = width / W, sc = new fabric.StaticCanvas(null, { width: Math.round(W * k), height: Math.round(H * k), backgroundColor: '#ffffff', renderOnAddRemove: false });
    sc.setZoom(k);
    def.slots.forEach(s => {
      const r = new fabric.Rect({ left: s.x * 300, top: s.y * 300, width: s.w * 300, height: s.h * 300, fill: 'rgba(124,58,237,.14)', stroke: '#7c3aed', strokeWidth: 8, strokeDashArray: [30, 20] }); sc.add(r);
      sc.add(new fabric.Text(s.label.replace(/ \d+ in$/, ''), { left: (s.x + s.w / 2) * 300, top: (s.y + s.h / 2) * 300, originX: 'center', originY: 'center', fontSize: Math.min(s.w, s.h) * 300 * 0.16, fill: '#e65a00', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 'bold' }));
    });
    sc.renderAll(); const url = sc.toDataURL({ format: 'png' }); sc.dispose?.(); return url;
  }

  /* ================= saved layouts (user) ================= */
  const listMine = async () => (await kv.get('layoutIndex')) || [];
  async function saveLayout(name, keepImages) {
    C.flushCommit?.(); const d = JSON.parse(C.snapshot());
    d.canvas.objects = d.canvas.objects.filter(o => !(o.type === 'image' && (o.inSlot || !keepImages)));
    d.canvas.objects.forEach(o => { if (o.slot) o.slot.id = o.slot.id; });
    const hid = canvas.getObjects().filter(o => o.type === 'image' && (o.inSlot || !keepImages) && o.visible); hid.forEach(o => { o.visible = false; });
    const thumb = C.cardThumb(); hid.forEach(o => { o.visible = true; }); canvas.requestRenderAll();
    const id = C.uid(); await kv.set('layout:' + id, C.expand(JSON.stringify(d)));
    const idx = await listMine(); idx.unshift({ id, name, thumb, w: d.W, h: d.H, dpi: d.dpi, created: Date.now(), areas: d.canvas.objects.filter(o => o.slot).length }); await kv.set('layoutIndex', idx.slice(0, 60));
    document.dispatchEvent(new CustomEvent('chitra:layouts')); renderMine(); return id;
  }
  async function useMine(id, asNew) {
    const raw = await kv.get('layout:' + id), meta = (await listMine()).find(x => x.id === id); if (!raw || !meta) return toast('Could not open that layout', '⚠️');
    if (asNew) { await C.newDocument({ w: meta.w, h: meta.h, dpi: meta.dpi, guide: 'paper', layoutJson: raw, name: meta.name }); toast('Layout loaded', 'printer'); return; }
    if (canvas.getObjects().length && !confirm('Replace this page with your saved layout?')) return;
    const d = C.parseSnap(raw); C.history.busy = true; C.setSize(d.W, d.H, false, 'paper', d.dpi);
    canvas.loadFromJSON(d.canvas, () => { C.history.busy = false; canvas.renderAll(); C.commit(); toast('Layout applied', 'printer'); });
  }
  async function deleteMine(id) { if (!confirm('Delete this saved layout?')) return; await kv.del('layout:' + id); await kv.set('layoutIndex', (await listMine()).filter(x => x.id !== id)); document.dispatchEvent(new CustomEvent('chitra:layouts')); renderMine(); }
  $('#layoutSave').onclick = () => { $('#layoutName').value = ''; $('#layoutModal').hidden = false; $('#layoutName').focus(); };
  $('#layoutGo').onclick = async () => { const n = $('#layoutName').value.trim() || 'My layout'; $('#layoutModal').hidden = true; await saveLayout(n, $('#layoutKeepImg').checked); toast(`“${n}” saved to My layouts`, '💾'); };

  /* ---- editor panel lists ---- */
  function layCard(def) { return `<button class="lay-card" data-lay="${def.id}"><img alt="" src="${layoutThumb(def, 200)}"><b>${def.name}</b>${def.hot ? '<em>Popular</em>' : ''}</button>`; }
  function renderBuiltin() { $('#layGrid').innerHTML = LAYOUTS.map(layCard).join(''); $$('#layGrid [data-lay]').forEach(b => b.onclick = () => useBuiltin(LAYOUTS.find(l => l.id === b.dataset.lay), false)); }
  async function renderMine() {
    const l = await listMine(), g = $('#myLayGrid');
    g.innerHTML = l.length ? l.map(m => `<div class="lay-card mine"><button data-mine="${m.id}"><img alt="" src="${m.thumb || ''}"><b>${m.name}</b></button><button class="del" data-del="${m.id}" title="Delete">${C.ico("trash-2",14)}</button></div>`).join('') : '<p class="tip">Nothing saved yet. Set up a page with print areas, then save it here.</p>';
    $$('#myLayGrid [data-mine]').forEach(b => b.onclick = () => useMine(b.dataset.mine, false)); $$('#myLayGrid [data-del]').forEach(b => b.onclick = () => deleteMine(b.dataset.del));
  }
  C.fontsReady.then(renderBuiltin); renderMine();

  Object.assign(C, { LAYOUTS, SHEETS, layoutThumb, useBuiltin, useMine, deleteMine, listMine, addSlot, makeSlotPx, slots, saveLayout, SLOT_PRESETS, fitInto });
})();
