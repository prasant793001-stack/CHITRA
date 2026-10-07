/* Chitra Studio – Canva-style photo handles: dragging a corner or edge CROPS the photo (the picture stays put, the frame changes).
   A separate round handle just outside the bottom-right corner resizes. Shift + corner also resizes. */
(() => {
  if (!window.fabric) return;
  const F = fabric, U = F.util, CU = F.controlsUtils, PURPLE = '#6d4aff';
  const ORIG = { cw: F.Image.prototype.controls }; void ORIG;
  const MIN = 24; // smallest crop, in source pixels

  function cropAction(sides) { // sides: any of 'l' 'r' 't' 'b'
    return (e, tr, x, y) => {
      const t = tr.target;
      if (t.inSlot || e.shiftKey) return sides.length === 2 ? CU.scalingEqually(e, tr, x, y) : (sides === 'l' || sides === 'r' ? CU.scalingXOrSkewingY : CU.scalingYOrSkewingX)(e, tr, x, y);
      const el = t.getElement && t.getElement(); const nat = t.getOriginalSize ? t.getOriginalSize() : { width: el && (el.naturalWidth || el.width), height: el && (el.naturalHeight || el.height) };
      if (!nat.width) return false;
      const m = t.calcTransformMatrix(), inv = U.invertTransform(m), p = U.transformPoint(new F.Point(x, y), inv); // pointer in the photo's own (centred) frame
      const w = t.width, h = t.height; let dl = 0, dr = 0, dt = 0, db = 0;
      const fx = t.flipX, fy = t.flipY, cx0 = t.cropX || 0, cy0 = t.cropY || 0;
      // available room to "un-crop" on each source side
      const roomL = cx0, roomR = nat.width - cx0 - w, roomT = cy0, roomB = nat.height - cy0 - h;
      if (sides.includes('l')) { const room = fx ? roomR : roomL; dl = Math.min(Math.max(p.x + w / 2, -room), w - MIN); }
      if (sides.includes('r')) { const room = fx ? roomL : roomR; dr = Math.max(Math.min(p.x - w / 2, room), -(w - MIN)); }
      if (sides.includes('t')) { const room = fy ? roomB : roomT; dt = Math.min(Math.max(p.y + h / 2, -room), h - MIN); }
      if (sides.includes('b')) { const room = fy ? roomT : roomB; db = Math.max(Math.min(p.y - h / 2, room), -(h - MIN)); }
      if (!dl && !dr && !dt && !db) return false;
      const nw = w - dl + dr, nh = h - dt + db, dcx = (dl + dr) / 2, dcy = (dt + db) / 2; // centre moves by the average edge shift (local frame)
      const newCenter = U.transformPoint(new F.Point(dcx, dcy), m);
      // update source crop (flip swaps which source side the on-screen edge maps to)
      t.cropX = cx0 + (fx ? -dr : dl); t.cropY = cy0 + (fy ? -db : dt); t.width = nw; t.height = nh;
      t.setPositionByOrigin(newCenter, 'center', 'center'); t.dirty = true; t.setCoords(); return true;
    };
  }
  const cursorFor = (corner) => (e, ctl, obj) => { const a = Math.round(((obj.angle % 360) + 360) % 360 / 45) % 8, map = { tl: 0, mt: 1, tr: 2, mr: 3, br: 4, mb: 5, bl: 6, ml: 7 }, cs = ['nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize']; return cs[(map[corner] + a) % 4]; };

  function bracket(dx, dy) { // Canva-like corner bracket
    return function (ctx, left, top, style, obj) {
      ctx.save(); ctx.translate(left, top); ctx.rotate(U.degreesToRadians(obj.angle)); const s = 15;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(40,20,120,.45)'; ctx.shadowBlur = 5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5.5;
      ctx.beginPath(); ctx.moveTo(0, dy * s); ctx.lineTo(0, 0); ctx.lineTo(dx * s, 0); ctx.stroke(); ctx.restore();
    };
  }
  function bar(vertical) {
    return function (ctx, left, top, style, obj) {
      ctx.save(); ctx.translate(left, top); ctx.rotate(U.degreesToRadians(obj.angle)); ctx.shadowColor = 'rgba(40,20,120,.45)'; ctx.shadowBlur = 5; ctx.fillStyle = '#fff'; const L = 22, T = 6;
      ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(vertical ? -T / 2 : -L / 2, vertical ? -L / 2 : -T / 2, vertical ? T : L, vertical ? L : T, 3) : ctx.rect(-L / 2, -T / 2, L, T)); ctx.fill(); ctx.restore();
    };
  }
  function resizeKnob(ctx, left, top, style, obj) {
    ctx.save(); ctx.translate(left, top); ctx.rotate(U.degreesToRadians(obj.angle)); ctx.shadowColor = 'rgba(40,20,120,.4)'; ctx.shadowBlur = 6; ctx.fillStyle = PURPLE; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-4.5, 4.5); ctx.lineTo(4.5, -4.5); ctx.moveTo(0.5, -4.5); ctx.lineTo(4.5, -4.5); ctx.lineTo(4.5, -0.5); ctx.moveTo(-0.5, 4.5); ctx.lineTo(-4.5, 4.5); ctx.lineTo(-4.5, 0.5); ctx.stroke(); ctx.restore();
  }
  const mk = (x, y, sides, name, render, extra = {}) => new F.Control({ x, y, actionName: 'crop', actionHandler: cropAction(sides), cursorStyleHandler: cursorFor(name), render, sizeX: 34, sizeY: 34, touchSizeX: 58, touchSizeY: 58, ...extra });
  const c = Object.assign({}, F.Object.prototype.controls);
  c.tl = mk(-0.5, -0.5, 'lt', 'tl', bracket(1, 1)); c.tr = mk(0.5, -0.5, 'rt', 'tr', bracket(-1, 1)); c.bl = mk(-0.5, 0.5, 'lb', 'bl', bracket(1, -1)); c.br = mk(0.5, 0.5, 'rb', 'br', bracket(-1, -1));
  c.ml = mk(-0.5, 0, 'l', 'ml', bar(true), { sizeX: 24, sizeY: 44 }); c.mr = mk(0.5, 0, 'r', 'mr', bar(true), { sizeX: 24, sizeY: 44 });
  c.mt = mk(0, -0.5, 't', 'mt', bar(false), { sizeX: 44, sizeY: 24 }); c.mb = mk(0, 0.5, 'b', 'mb', bar(false), { sizeX: 44, sizeY: 24 });
  c.rs = new F.Control({ x: 0.5, y: 0.5, offsetX: 26, offsetY: 26, actionName: 'scale', actionHandler: CU.scalingEqually, cursorStyle: 'nwse-resize', render: resizeKnob, sizeX: 30, sizeY: 30, touchSizeX: 56, touchSizeY: 56 });
  F.Image.prototype.controls = c;
})();
