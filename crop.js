/* Chitra Studio – Canva-style photo handles: dragging a corner or edge CROPS the photo (the picture stays put, the frame changes).
   Corners resize (aspect-locked), edge bars crop. Shift + edge also scales. */
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

  function dot(ctx, left, top, style, obj) { // corner = resize: small white circle, hairline purple outline
    ctx.save(); ctx.translate(left, top); ctx.rotate(U.degreesToRadians(obj.angle)); ctx.shadowColor = 'rgba(40,20,120,.25)'; ctx.shadowBlur = 3; ctx.fillStyle = '#fff'; ctx.strokeStyle = PURPLE; ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke(); ctx.restore();
  }
  function bar(vertical) { // edge = crop: slim white pill
    return function (ctx, left, top, style, obj) {
      ctx.save(); ctx.translate(left, top); ctx.rotate(U.degreesToRadians(obj.angle)); ctx.shadowColor = 'rgba(40,20,120,.3)'; ctx.shadowBlur = 3; ctx.fillStyle = '#fff'; ctx.strokeStyle = PURPLE; ctx.lineWidth = 1.25; const L = 20, T = 6;
      ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(vertical ? -T / 2 : -L / 2, vertical ? -L / 2 : -T / 2, vertical ? T : L, vertical ? L : T, 3) : ctx.rect(-L / 2, -T / 2, L, T)); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke(); ctx.restore();
    };
  }
  const resizeAction = CU.scalingEqually;
  const mk = (x, y, sides, name, render, extra = {}) => new F.Control({ x, y, actionName: 'crop', actionHandler: cropAction(sides), cursorStyleHandler: cursorFor(name), render, sizeX: 18, sizeY: 18, touchSizeX: 58, touchSizeY: 58, ...extra });
  const c = Object.assign({}, F.Object.prototype.controls);
  const corner = (x, y, name) => new F.Control({ x, y, actionName: 'scale', actionHandler: resizeAction, cursorStyleHandler: cursorFor(name), render: dot, sizeX: 18, sizeY: 18, touchSizeX: 52, touchSizeY: 52 });
  c.tl = corner(-0.5, -0.5, 'tl'); c.tr = corner(0.5, -0.5, 'tr'); c.bl = corner(-0.5, 0.5, 'bl'); c.br = corner(0.5, 0.5, 'br');
  c.ml = mk(-0.5, 0, 'l', 'ml', bar(true), { sizeX: 16, sizeY: 36 }); c.mr = mk(0.5, 0, 'r', 'mr', bar(true), { sizeX: 16, sizeY: 36 });
  c.mt = mk(0, -0.5, 't', 'mt', bar(false), { sizeX: 36, sizeY: 16 }); c.mb = mk(0, 0.5, 'b', 'mb', bar(false), { sizeX: 36, sizeY: 16 });
  F.Image.prototype.controls = c;
})();
