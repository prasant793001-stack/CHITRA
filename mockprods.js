/* Chitra Studio – extra mockup products (hoodie, bottle, framed poster, pillow, notebook, coaster, business cards).
   They draw onto a 900x900 canvas using the helpers exported by photo.js (C.mockKit) and register themselves in C.mockDraw. */
(() => {
  const C = window.chitra; if (!C || !C.mockKit || !C.mockDraw) return;
  const { MS, M, mk, blur, noTint, shade, rng, fabricNoise } = C.mockKit, D = C.mockDraw;
  const cover = (g, art, x, y, w, h) => { const s = Math.max(w / art.width, h / art.height), dw = art.width * s, dh = art.height * s; g.drawImage(art, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); };
  const contain = (g, art, x, y, w, h) => { const s = Math.min(w / art.width, h / art.height), dw = art.width * s, dh = art.height * s; g.drawImage(art, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); return [x + (w - dw) / 2, y + (h - dh) / 2, dw, dh]; };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); };
  const shadowBlob = (g, x, y, w, h, a = 0.4, b = 22) => { g.save(); g.fillStyle = `rgba(0,0,0,${a})`; blur(g, b); g.beginPath(); g.ellipse(x, y, w, h, 0, 0, 7); g.fill(); noTint(g); g.restore(); };
  const noise = (g, x, y, w, h, a = 0.8) => { g.save(); g.globalAlpha = a; g.fillStyle = g.createPattern(fabricNoise(), 'repeat'); g.fillRect(x, y, w, h); g.restore(); };

  /* ---------- hoodie ---------- */
  D.hoodie = g => {
    const k = MS / 600, col = M.color, P = new Path2D(), r = rng(21);
    P.addPath(new Path2D('M230 78 L150 100 Q120 108 108 140 L52 330 Q48 342 58 346 L106 362 Q116 365 120 355 L160 235 L160 530 Q160 540 170 540 L430 540 Q440 540 440 530 L440 235 L480 355 Q484 365 494 362 L542 346 Q552 342 548 330 L492 140 Q480 108 450 100 L370 78 Q300 120 230 78 Z'), new DOMMatrix().scale(k));
    g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 50; g.shadowOffsetY = 28; g.fillStyle = col; g.fill(P); g.restore();
    // hood (behind the neckline) + dark inside
    g.fillStyle = shade(col, -0.1); g.beginPath(); g.ellipse(300 * k, 84 * k, 98 * k, 60 * k, 0, 0, 7); g.fill();
    g.fillStyle = col; g.fill(P);
    g.fillStyle = shade(col, -0.45); g.beginPath(); g.ellipse(300 * k, 96 * k, 66 * k, 40 * k, 0, 0, 7); g.fill();
    g.fillStyle = shade(col, -0.12); g.beginPath(); g.ellipse(300 * k, 100 * k, 70 * k, 46 * k, 0, Math.PI, 0); g.fill(); // hood rim
    g.save(); g.clip(P);
    const bw = 230, bh = 150, s = Math.min(bw / M.art.width, bh / M.art.height), dw = M.art.width * s * k, dh = M.art.height * s * k, layer = mk(), lg = layer.getContext("2d"); blur(lg, 0.5); lg.drawImage(M.art, MS / 2 - dw / 2, 226 * k, dw, dh); noTint(lg); g.globalAlpha = 0.96; g.drawImage(layer, 0, 0); g.globalAlpha = 1;
    const sh = mk(), sg = sh.getContext('2d'); let gr = sg.createLinearGradient(0, 0, MS, 0); gr.addColorStop(0, 'rgba(0,0,0,.36)'); gr.addColorStop(.2, 'rgba(255,255,255,.08)'); gr.addColorStop(.5, 'rgba(255,255,255,.03)'); gr.addColorStop(.8, 'rgba(0,0,0,.08)'); gr.addColorStop(1, 'rgba(0,0,0,.4)'); sg.fillStyle = gr; sg.fillRect(0, 0, MS, MS);
    gr = sg.createLinearGradient(0, 90, 0, MS * 0.92); gr.addColorStop(0, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(0,0,0,.22)'); sg.fillStyle = gr; sg.fillRect(0, 0, MS, MS);
    blur(sg, 9); sg.lineCap = 'round'; for (let i = 0; i < 14; i++) { const x = 190 * k + r() * 440 * k, y0 = 160 * k + r() * 120 * k, bend = (r() - 0.5) * 110, len = 140 + r() * 300; sg.lineWidth = 13 + r() * 22; sg.strokeStyle = `rgba(0,0,0,${0.02 + r() * 0.04})`; sg.beginPath(); sg.moveTo(x, y0); sg.quadraticCurveTo(x + bend, y0 + len / 2, x + bend * .4, y0 + len); sg.stroke(); }
    sg.strokeStyle = 'rgba(0,0,0,.3)'; sg.lineWidth = 14; sg.beginPath(); sg.moveTo(160 * k, 235 * k); sg.lineTo(112 * k, 356 * k); sg.moveTo(440 * k, 235 * k); sg.lineTo(488 * k, 356 * k); sg.stroke(); noTint(sg); g.drawImage(sh, 0, 0);
    // kangaroo pocket
    g.fillStyle = shade(col, -0.07); g.beginPath(); g.moveTo(205 * k, 410 * k); g.quadraticCurveTo(300 * k, 396 * k, 395 * k, 410 * k); g.lineTo(424 * k, 508 * k); g.lineTo(176 * k, 508 * k); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 3; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.beginPath(); g.moveTo(208 * k, 414 * k); g.quadraticCurveTo(300 * k, 400 * k, 392 * k, 414 * k); g.stroke();
    noise(g, 0, 0, MS, MS); g.fillStyle = shade(col, -0.2); g.fillRect(160 * k, 518 * k, 280 * k, 22 * k); g.fillRect(48 * k, 340 * k, 70 * k, 22 * k); // ribbed hem + cuffs
    g.restore();
    g.strokeStyle = '#f2efe8'; g.lineWidth = 6; g.lineCap = 'round'; [[272, 134, 266, 214], [328, 134, 336, 206]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a * k, b * k); g.quadraticCurveTo((a + c) / 2 * k - 6, (b + d) / 2 * k, c * k, d * k); g.stroke(); g.fillStyle = '#c9c5bb'; g.beginPath(); g.arc(c * k, d * k + 4, 5, 0, 7); g.fill(); });
  };

  /* ---------- water bottle ---------- */
  D.bottle = (g, o = {}) => {
    C.mockKit.drawMug(g, { ...o, R: 92, top: 190, bot: 700, ry: 20, noHandle: true, maxH: 400, arc: o.arc });
    const cx = 450, col = M.color; const gr = g.createLinearGradient(cx - 74, 0, cx + 74, 0); gr.addColorStop(0, '#8d929c'); gr.addColorStop(.3, '#f4f6f9'); gr.addColorStop(.55, '#b9bec8'); gr.addColorStop(1, '#6f7580');
    g.fillStyle = gr; rr(g, cx - 74, 112, 148, 82, 14); g.fill(); g.fillStyle = shade(col, -0.2); rr(g, cx - 86, 172, 172, 26, 8); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, cx - 40, 120, 14, 66, 7); g.fill();
    g.strokeStyle = '#b9bec8'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + 40, 112); g.bezierCurveTo(cx + 40, 60, cx + 110, 60, cx + 110, 112); g.stroke();
  };

  /* ---------- framed poster on a wall ---------- */
  D.poster = g => {
    const frame = M.color, ar = M.art.width / M.art.height, maxW = 440, maxH = 560; let aw = maxW, ah = aw / ar; if (ah > maxH) { ah = maxH; aw = ah * ar; }
    const mat = 44, fr = 28, W = aw + 2 * mat + 2 * fr, H = ah + 2 * mat + 2 * fr, x = (MS - W) / 2, y = (MS - H) / 2 - 10;
    g.save(); g.fillStyle = 'rgba(0,0,0,.42)'; blur(g, 24); rr(g, x + 16, y + 26, W, H, 4); g.fill(); noTint(g); g.restore();
    const fg = g.createLinearGradient(x, y, x + W, y + H); fg.addColorStop(0, shade(frame, 0.18)); fg.addColorStop(.5, frame); fg.addColorStop(1, shade(frame, -0.25)); g.fillStyle = fg; rr(g, x, y, W, H, 4); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2; g.strokeRect(x + fr, y + fr, W - 2 * fr, H - 2 * fr); g.strokeStyle = 'rgba(255,255,255,.25)'; g.strokeRect(x + 2, y + 2, W - 4, H - 4);
    g.fillStyle = '#f7f4ec'; g.fillRect(x + fr, y + fr, W - 2 * fr, H - 2 * fr);
    g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 8; g.fillStyle = '#fff'; g.fillRect(x + fr + mat, y + fr + mat, aw, ah); g.restore(); g.drawImage(M.art, x + fr + mat, y + fr + mat, aw, ah);
    const gl = g.createLinearGradient(x, y, x + W * 0.8, y + H * 0.8); gl.addColorStop(0, 'rgba(255,255,255,.22)'); gl.addColorStop(.35, 'rgba(255,255,255,.04)'); gl.addColorStop(.5, 'rgba(255,255,255,.12)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(x + fr, y + fr, W - 2 * fr, H - 2 * fr);
  };

  /* ---------- pillow ---------- */
  D.pillow = g => {
    const x0 = 160, y0 = 160, x1 = 740, y1 = 740, cx = 450, cy = 450, col = M.color, P = new Path2D(); const e = 46;
    P.moveTo(x0 + e, y0); P.quadraticCurveTo(cx, y0 - 26, x1 - e, y0); P.quadraticCurveTo(x1 + 8, y0 + 8, x1, y0 + e); P.quadraticCurveTo(x1 + 28, cy, x1, y1 - e); P.quadraticCurveTo(x1 + 8, y1 - 8, x1 - e, y1); P.quadraticCurveTo(cx, y1 + 26, x0 + e, y1); P.quadraticCurveTo(x0 - 8, y1 - 8, x0, y1 - e); P.quadraticCurveTo(x0 - 28, cy, x0, y0 + e); P.quadraticCurveTo(x0 - 8, y0 + 8, x0 + e, y0); P.closePath();
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40; g.shadowOffsetY = 26; g.fillStyle = col; g.fill(P); g.restore();
    g.save(); g.clip(P); g.fillStyle = col; g.fillRect(0, 0, MS, MS); const ad = 470; const layer = mk(), lg = layer.getContext('2d'); blur(lg, 0.4); cover(lg, M.art, cx - ad / 2, cy - ad / 2, ad, ad); noTint(lg); g.globalAlpha = 0.97; g.drawImage(layer, 0, 0); g.globalAlpha = 1;
    let gr = g.createRadialGradient(cx - 80, cy - 100, 40, cx, cy, 460); gr.addColorStop(0, 'rgba(255,255,255,.2)'); gr.addColorStop(.55, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.34)'); g.fillStyle = gr; g.fillRect(0, 0, MS, MS);
    [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(([px, py]) => { gr = g.createRadialGradient(px, py, 2, px, py, 130); gr.addColorStop(0, 'rgba(0,0,0,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(px - 130, py - 130, 260, 260); });
    const r = rng(5); blur(g, 8); g.lineCap = 'round'; for (let i = 0; i < 8; i++) { g.lineWidth = 16 + r() * 26; g.strokeStyle = `rgba(0,0,0,${0.03 + r() * 0.04})`; g.beginPath(); const sx = [x0, x1][i % 2], sy = y0 + 100 + r() * 400; g.moveTo(sx, sy); g.quadraticCurveTo(cx + (r() - .5) * 120, sy + (r() - .5) * 80, sx === x0 ? x1 : x0, sy + (r() - .5) * 100); g.stroke(); } noTint(g);
    noise(g, 0, 0, MS, MS); g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 2; g.setLineDash([8, 6]); g.strokeRect(x0 + 18, y0 + 18, x1 - x0 - 36, y1 - y0 - 36); g.restore();
  };

  /* ---------- hardcover notebook ---------- */
  D.notebook = g => {
    const x = 250, y = 130, w = 400, h = 600, col = M.color;
    g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; blur(g, 22); rr(g, x + 18, y + 26, w, h, 14); g.fill(); noTint(g); g.restore();
    g.fillStyle = '#f1ede4'; rr(g, x + 8, y + 10, w, h, 12); g.fill(); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.5; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + w + 2 + i, y + 18); g.lineTo(x + w + 2 + i, y + h + 4); g.stroke(); } // page block
    const cg = g.createLinearGradient(x, y, x + w, y + h); cg.addColorStop(0, shade(col, 0.1)); cg.addColorStop(1, shade(col, -0.2)); g.fillStyle = cg; rr(g, x, y, w, h, 14); g.fill();
    g.save(); rr(g, x, y, w, h, 14); g.clip();
    const pad = 46, [ax, ay, aw, ah] = contain(g, M.art, x + 40 + pad * 0.6, y + pad, w - 40 - pad * 1.2, h * 0.62); void ax; void ay; void aw; void ah;
    g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x, y, 38, h); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x + 38, y, 3, h); // spine
    g.fillStyle = shade(col, -0.35); g.fillRect(x + w - 56, y, 24, h); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + w - 56, y, 4, h); // elastic band
    const gl = g.createLinearGradient(x, y, x + w, y); gl.addColorStop(0, 'rgba(0,0,0,.2)'); gl.addColorStop(.12, 'rgba(255,255,255,0)'); gl.addColorStop(.35, 'rgba(255,255,255,.14)'); gl.addColorStop(.5, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = gl; g.fillRect(x, y, w, h); noise(g, x, y, w, h, 0.6); g.restore();
  };

  /* ---------- round coaster (top view) ---------- */
  D.coaster = g => {
    const cx = 450, cy = 450, R = 250;
    shadowBlob(g, cx + 12, cy + 24, R + 6, R - 6, 0.45, 20);
    g.fillStyle = shade(M.color, -0.2); g.beginPath(); g.arc(cx, cy + 6, R, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R - 4, 0, 7); g.clip(); g.fillStyle = M.color; g.fillRect(cx - R, cy - R, R * 2, R * 2); cover(g, M.art, cx - R, cy - R, R * 2, R * 2);
    const gr = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R); gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(.4, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2); noise(g, cx - R, cy - R, R * 2, R * 2, 0.5); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R - 5, Math.PI * 1.05, Math.PI * 1.7); g.stroke(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R - 3, 0.1, Math.PI * 0.8); g.stroke();
  };

  /* ---------- stack of business cards ---------- */
  D.cards = g => {
    const cw = 470, ch = 270, specs = [[-9, -40, 60], [-3, -10, 30], [4, 18, 0], [11, 46, -30]];
    specs.forEach(([ang, dx, dy], i) => {
      g.save(); g.translate(450 + dx, 470 + dy); g.rotate(ang * Math.PI / 180);
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.shadowOffsetY = 12; g.fillStyle = '#fff'; rr(g, -cw / 2, -ch / 2, cw, ch, 8); g.fill(); g.shadowBlur = 0;
      g.save(); rr(g, -cw / 2, -ch / 2, cw, ch, 8); g.clip(); if (i === 3 || i === 1) { g.fillStyle = i === 1 ? shade(M.color, -0.05) : '#fff'; g.fillRect(-cw / 2, -ch / 2, cw, ch); if (i === 3) cover(g, M.art, -cw / 2, -ch / 2, cw, ch); } else { g.fillStyle = M.color; g.fillRect(-cw / 2, -ch / 2, cw, ch); cover(g, M.art, -cw / 2, -ch / 2, cw, ch); }
      const gr = g.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2); gr.addColorStop(0, 'rgba(255,255,255,.2)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.1)'); g.fillStyle = gr; g.fillRect(-cw / 2, -ch / 2, cw, ch); g.restore();
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.5; rr(g, -cw / 2, -ch / 2, cw, ch, 8); g.stroke(); g.restore();
    });
  };

  C.MOCK_PRODUCTS = [
    ['shirt', 'T-shirt', 'shirt', true], ['hoodie', 'Hoodie', 'shirt', true], ['mug', 'Mug', 'coffee', true], ['tumbler', 'Tumbler', 'cup-soda', true], ['bottle', 'Bottle', 'droplet', true], ['tote', 'Tote bag', 'shopping-bag', true],
    ['pillow', 'Pillow', 'square', true], ['case', 'Phone case', 'smartphone', true], ['pad', 'Mouse pad', 'mouse', true], ['notebook', 'Notebook', 'book-open', true], ['poster', 'Framed print', 'frame', true], ['coaster', 'Coaster', 'circle', true], ['cards', 'Cards', 'credit-card', false],
  ];
})();
