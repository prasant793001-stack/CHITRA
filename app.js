/* Chitra – a small Canva-style design editor built on Fabric.js */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EXTRA = ['adj', 'locked', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY'];

  let W = 1080, H = 1080, zoom = 1, fitZoom = 1;
  const canvas = new fabric.Canvas('c', { preserveObjectStacking: true, backgroundColor: '#ffffff' });
  fabric.Object.prototype.set({
    transparentCorners: false, cornerColor: '#fff', cornerStrokeColor: '#7c3aed',
    borderColor: '#7c3aed', cornerStyle: 'circle', cornerSize: 10, padding: 2,
  });

  /* ---------- history ---------- */
  const history = { stack: [], idx: -1, busy: false };
  const snapshot = () => JSON.stringify({ W, H, canvas: canvas.toJSON(EXTRA) });
  function commit() {
    if (history.busy) return;
    history.stack = history.stack.slice(0, history.idx + 1);
    history.stack.push(snapshot());
    if (history.stack.length > 60) history.stack.shift();
    history.idx = history.stack.length - 1;
  }
  function restore(json) {
    history.busy = true;
    const d = JSON.parse(json);
    setSize(d.W, d.H, false);
    canvas.loadFromJSON(d.canvas, () => {
      $('#bgColor').value = toHex(canvas.backgroundColor);
      canvas.renderAll(); history.busy = false; refreshProps();
    });
  }
  const undo = () => { if (history.idx > 0) restore(history.stack[--history.idx]); };
  const redo = () => { if (history.idx < history.stack.length - 1) restore(history.stack[++history.idx]); };
  ['object:added', 'object:removed', 'object:modified'].forEach(e => canvas.on(e, commit));

  /* ---------- sizing / zoom ---------- */
  function applyZoom() {
    canvas.setZoom(zoom);
    canvas.setDimensions({ width: W * zoom, height: H * zoom });
    $('#zoomLabel').textContent = Math.round(zoom * 100) + '%';
  }
  function fit() {
    const s = $('#stage');
    fitZoom = Math.min((s.clientWidth - 48) / W, (s.clientHeight - 48) / H, 1);
    zoom = Math.max(fitZoom, 0.05); applyZoom();
  }
  function setSize(w, h, record = true) {
    W = w; H = h; fit();
    const [a, b] = [`${w}x${h}`, $('#sizePreset').value];
    if (![...$('#sizePreset').options].some(o => o.value === a)) $('#sizePreset').add(new Option(`Custom (${w}×${h})`, a));
    $('#sizePreset').value = a; void b;
    if (record) commit();
  }
  $('#sizePreset').onchange = e => { const [w, h] = e.target.value.split('x').map(Number); setSize(w, h); };
  $('#zoomIn').onclick = () => { zoom = Math.min(zoom * 1.2, 4); applyZoom(); };
  $('#zoomOut').onclick = () => { zoom = Math.max(zoom / 1.2, 0.05); applyZoom(); };
  window.addEventListener('resize', fit);
  $('#bgColor').oninput = e => { canvas.setBackgroundColor(e.target.value, () => canvas.renderAll()); };
  $('#bgColor').onchange = commit;

  /* ---------- helpers ---------- */
  function toHex(c) {
    if (!c || typeof c !== 'string') return '#000000';
    const col = new fabric.Color(c); return '#' + col.toHex();
  }
  function place(o) {
    o.set({ left: W / 2, top: H / 2, originX: 'center', originY: 'center' });
    canvas.add(o); canvas.setActiveObject(o); canvas.requestRenderAll();
  }
  const active = () => canvas.getActiveObject();

  /* ---------- add elements ---------- */
  const starPoints = (r = 100, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
    const rad = i % 2 ? r * 0.42 : r, a = (Math.PI / n) * i - Math.PI / 2;
    return { x: r + rad * Math.cos(a), y: r + rad * Math.sin(a) };
  });
  const SHAPES = {
    rect: () => new fabric.Rect({ width: 300, height: 200, fill: '#7c3aed', rx: 8, ry: 8 }),
    circle: () => new fabric.Circle({ radius: 120, fill: '#f59e0b' }),
    triangle: () => new fabric.Triangle({ width: 260, height: 230, fill: '#10b981' }),
    line: () => new fabric.Line([0, 0, 320, 0], { stroke: '#111827', strokeWidth: 6, fill: '#111827', strokeLineCap: 'round' }),
    star: () => new fabric.Polygon(starPoints(130), { fill: '#ef4444' }),
    heart: () => new fabric.Path('M 0 -60 C -100 -140 -190 -20 0 110 C 190 -20 100 -140 0 -60 z', { fill: '#ec4899' }),
  };
  $$('[data-add]').forEach(b => b.onclick = () => place(SHAPES[b.dataset.add]()));

  const TEXT = {
    heading: ['Add a heading', 96, 'bold'],
    sub: ['Add a subheading', 56, 'normal'],
    body: ['Add a little bit of body text', 32, 'normal'],
  };
  function addText(kind, extra = {}) {
    const [t, size, weight] = TEXT[kind];
    const o = new fabric.Textbox(t, {
      width: W * 0.7, fontSize: size, fontWeight: weight, fontFamily: 'Arial', fill: '#111827', textAlign: 'center', ...extra,
    });
    place(o); return o;
  }
  $$('[data-text]').forEach(b => b.onclick = () => addText(b.dataset.text));

  function addImageFromURL(url, opts = {}) {
    fabric.Image.fromURL(url, img => {
      const s = Math.min((W * 0.8) / img.width, (H * 0.8) / img.height, 1);
      img.set({ adj: { brightness: 0, contrast: 0, saturation: 0, blur: 0, preset: '' } }).scale(s);
      place(img);
    }, opts);
  }
  $('#imgUpload').onchange = e => {
    [...e.target.files].forEach(f => {
      const r = new FileReader(); r.onload = () => addImageFromURL(r.result); r.readAsDataURL(f);
    });
    e.target.value = '';
  };
  // drag & drop images onto the stage
  $('#stage').addEventListener('dragover', e => e.preventDefault());
  $('#stage').addEventListener('drop', e => {
    e.preventDefault();
    [...e.dataTransfer.files].filter(f => f.type.startsWith('image/')).forEach(f => {
      const r = new FileReader(); r.onload = () => addImageFromURL(r.result); r.readAsDataURL(f);
    });
  });
  // paste images
  document.addEventListener('paste', e => {
    [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/')).forEach(f => {
      const r = new FileReader(); r.onload = () => addImageFromURL(r.result); r.readAsDataURL(f);
    });
  });

  /* ---------- templates ---------- */
  function clearAll(bg) {
    history.busy = true; canvas.clear(); history.busy = false;
    canvas.setBackgroundColor(bg, () => { $('#bgColor').value = toHex(bg); canvas.renderAll(); });
  }
  const T = (text, o) => new fabric.Textbox(text, { fontFamily: 'Arial', textAlign: 'center', originX: 'center', originY: 'center', ...o });
  const TEMPLATES = {
    blank: () => clearAll('#ffffff'),
    quote: () => {
      clearAll('#1e1b4b');
      canvas.add(new fabric.Rect({ left: W * 0.08, top: H * 0.08, width: W * 0.84, height: H * 0.84, fill: 'transparent', stroke: '#a78bfa', strokeWidth: 6 }));
      canvas.add(T('“', { left: W / 2, top: H * 0.25, fontSize: 260, fill: '#a78bfa', width: 300, fontFamily: 'Georgia' }));
      canvas.add(T('Design is thinking made visual.', { left: W / 2, top: H * 0.5, width: W * 0.65, fontSize: Math.round(W * 0.07), fill: '#fff', fontFamily: 'Georgia', fontStyle: 'italic' }));
      canvas.add(T('— Saul Bass', { left: W / 2, top: H * 0.75, width: W * 0.5, fontSize: Math.round(W * 0.035), fill: '#c4b5fd' }));
    },
    sale: () => {
      clearAll('#fde047');
      canvas.add(new fabric.Circle({ left: W * 0.5, top: H * 0.5, radius: Math.min(W, H) * 0.38, fill: '#dc2626', originX: 'center', originY: 'center' }));
      canvas.add(T('MEGA SALE', { left: W / 2, top: H * 0.38, width: W * 0.7, fontSize: Math.round(W * 0.09), fill: '#fff', fontWeight: 'bold', fontFamily: 'Impact' }));
      canvas.add(T('50% OFF', { left: W / 2, top: H * 0.55, width: W * 0.7, fontSize: Math.round(W * 0.14), fill: '#fde047', fontWeight: 'bold', fontFamily: 'Impact' }));
      canvas.add(T('This weekend only', { left: W / 2, top: H * 0.72, width: W * 0.7, fontSize: Math.round(W * 0.035), fill: '#fff' }));
    },
    event: () => {
      clearAll('#0f172a');
      canvas.add(new fabric.Rect({ left: 0, top: 0, width: W, height: H * 0.12, fill: '#06b6d4' }));
      canvas.add(T('YOU ARE INVITED', { left: W / 2, top: H * 0.3, width: W * 0.8, fontSize: Math.round(W * 0.06), fill: '#06b6d4', fontWeight: 'bold', charSpacing: 300 }));
      canvas.add(T('Annual Design Meetup', { left: W / 2, top: H * 0.48, width: W * 0.8, fontSize: Math.round(W * 0.095), fill: '#fff', fontWeight: 'bold' }));
      canvas.add(T('Saturday · 7 PM · Main Hall', { left: W / 2, top: H * 0.7, width: W * 0.8, fontSize: Math.round(W * 0.04), fill: '#94a3b8' }));
    },
  };
  $$('[data-template]').forEach(b => b.onclick = () => {
    if (canvas.getObjects().length && !confirm('Replace the current design with this template?')) return;
    TEMPLATES[b.dataset.template](); canvas.discardActiveObject(); canvas.renderAll(); commit(); refreshProps();
  });

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
  function remove() { const o = active(); if (!o || (o.isEditing)) return; (o.type === 'activeSelection' ? o.getObjects() : [o]).forEach(x => canvas.remove(x)); canvas.discardActiveObject(); canvas.requestRenderAll(); }
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
    const r = o.getBoundingRect(true, true), dx = { left: -r.left, center: W / 2 - (r.left + r.width / 2), right: W - r.left - r.width }[b.dataset.align] ?? 0;
    const dy = { top: -r.top, middle: H / 2 - (r.top + r.height / 2), bottom: H - r.top - r.height }[b.dataset.align] ?? 0;
    o.set({ left: o.left + dx, top: o.top + dy }); o.setCoords();
  }));

  /* ---------- properties ---------- */
  const isText = o => o && /text/.test(o.type);
  const isImage = o => o && o.type === 'image';
  function refreshProps() {
    const o = active();
    $('#emptyProps').hidden = !!o; $('#propsBody').hidden = !o;
    if (!o) return;
    $('#textSec').hidden = !isText(o); $('#imageSec').hidden = !isImage(o);
    $('#styleSec').hidden = isImage(o) && false;
    $('#fill').value = toHex(typeof o.fill === 'string' ? o.fill : '#000000');
    $('#stroke').value = toHex(o.stroke || '#000000');
    $('#strokeWidth').value = o.strokeWidth || 0;
    $('#opacity').value = Math.round((o.opacity ?? 1) * 100);
    $('#angle').value = Math.round(o.angle || 0);
    $('#shadow').checked = !!o.shadow;
    if (isText(o)) {
      $('#fontFamily').value = o.fontFamily; $('#fontSize').value = Math.round(o.fontSize * (o.scaleY || 1));
      $('#lineHeight').value = Math.round((o.lineHeight || 1.16) * 100); $('#charSpacing').value = o.charSpacing || 0;
    }
    if (isImage(o)) {
      const a = o.adj || {};
      $$('[data-filter]').forEach(i => i.value = a[i.dataset.filter] || 0);
    }
  }
  canvas.on('selection:created', refreshProps);
  canvas.on('selection:updated', refreshProps);
  canvas.on('selection:cleared', refreshProps);
  canvas.on('object:rotating', refreshProps);

  const targets = () => { const o = active(); return !o ? [] : o.type === 'activeSelection' ? o.getObjects() : [o]; };
  const bind = (sel, prop, conv = v => v, evt = 'input') => {
    const el = $(sel);
    el.addEventListener(evt, () => { targets().forEach(o => o.set(prop, conv(el.value))); canvas.requestRenderAll(); });
    el.addEventListener('change', commit);
  };
  bind('#fill', 'fill'); bind('#stroke', 'stroke');
  $('#stroke').addEventListener('input', () => { if (!+$('#strokeWidth').value) { $('#strokeWidth').value = 4; targets().forEach(o => o.set('strokeWidth', 4)); canvas.requestRenderAll(); } });
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
    targets().forEach(o => o.set('shadow', e.target.checked ? new fabric.Shadow({ color: 'rgba(0,0,0,.4)', blur: 20, offsetX: 6, offsetY: 8 }) : null));
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
    const a = o.adj || (o.adj = {});
    const f = [];
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
    if (b.dataset.preset === 'reset') o.adj = { brightness: 0, contrast: 0, saturation: 0, blur: 0, preset: '' };
    else (o.adj ||= {}).preset = o.adj.preset === b.dataset.preset ? '' : b.dataset.preset;
    applyFilters(o); refreshProps(); commit();
  });
  $('#cropToCanvas').onclick = act(o => {
    if (!isImage(o)) return;
    const s = Math.max(W / o.width, H / o.height);
    o.set({ scaleX: s, scaleY: s, left: W / 2, top: H / 2, originX: 'center', originY: 'center', angle: 0 });
    o.clipPath = null; o.setCoords();
  });

  /* ---------- project save / export ---------- */
  function download(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); }
  $('#saveProject').onclick = () => {
    const blob = new Blob([snapshot()], { type: 'application/json' });
    const u = URL.createObjectURL(blob); download(u, 'design.chitra.json'); setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  $('#openProject').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { restore(r.result); setTimeout(commit, 50); } catch { alert('Not a valid Chitra project file.'); } };
    r.readAsText(f); e.target.value = '';
  };
  $('#download').onclick = () => {
    canvas.discardActiveObject(); canvas.renderAll();
    const fmt = $('#exportFormat').value;
    const url = canvas.toDataURL({ format: fmt, quality: 0.92, multiplier: 1 / zoom });
    download(url, `design.${fmt === 'jpeg' ? 'jpg' : 'png'}`);
  };

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (/INPUT|SELECT|TEXTAREA/.test(tag) && !/range|color/.test(document.activeElement.type || '')) return;
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
  canvas.on('mouse:up', () => { if (active()) refreshProps(); });

  /* ---------- boot ---------- */
  setSize(1080, 1080, false);
  history.busy = true; TEMPLATES.quote(); history.busy = false; canvas.renderAll(); commit();
  window.chitra = { canvas, undo, redo, addText, TEMPLATES, setSize };
})();
