/* Chitra Studio – "Mock templates": ready-made marketing designs built around a realistic product mockup (13 products x studio scenes x layouts x copy).
   Each design is a normal editable template (headline, button, colours) whose product picture is rendered by the mockup engine and can be re-printed
   with the user's own artwork: select the product and choose "Mockup: swap artwork" (command palette) or double-click it. */
(() => {
  const C = window.chitra; if (!C || !C.mockRenderScene || !C.TEMPLATES) return;
  const K = C.kit, META = C.TEMPLATE_META, TEMPLATES = C.TEMPLATES, fab = window.fabric;
  const lumOf = c => { const n = parseInt(c.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  const onCol = c => (lumOf(c) > 0.6 ? '#15131f' : '#ffffff');
  const PRODUCT_NAMES = Object.fromEntries((C.MOCK_PRODUCTS || []).map(p => [p[0], p[1]]));
  const KINDS = ['mug', 'shirt', 'hoodie', 'tumbler', 'bottle', 'tote', 'pillow', 'case', 'pad', 'notebook', 'poster', 'coaster'].filter(k => PRODUCT_NAMES[k]);
  const SCENES = ['wood', 'marble', 'concrete', 'linen', 'sunlit', 'kraft', 'peach', 'mint', 'paper', 'studio'].filter(id => (C.MOCK_SCENES || []).some(s => s.id === id));
  const PRODS = { square: 'Instagram post', portrait: 'Instagram portrait', story: 'Story / Reel / TikTok', wide: 'Facebook post', thumb: 'YouTube thumbnail', pin: 'Pinterest pin' };
  const COPY = [
    ['New drop', 'Custom prints, made for you'], ['Gift ideas', 'Personalised, printed & shipped'], ['Limited edition', 'Once they’re gone, they’re gone'], ['Pre-order now', 'Ships in 3–5 days'],
    ['Made with love', 'Your design on everyday things'], ['Print on demand', 'Your art, our press'], ['Best seller', 'Loved by hundreds of happy customers'], ['Fresh from the press', 'Sublimation & DTF, perfectly printed'],
    ['Wear your story', 'Premium prints that last wash after wash'], ['Sip in style', 'Dishwasher-safe, vibrant colour'], ['Order today', 'Free design help with every order'], ['Meet the collection', 'New season · new prints'],
  ];
  const ART_TEXT = ['GOOD VIBES', 'Stay Wild', 'DREAM BIG', 'Coffee First', 'Made with Love', 'Be Kind', 'Explore More', 'Hustle Hard', 'Sunny Days', 'Pure Joy'];
  const FONTS = [['Bebas Neue', 'Poppins'], ['Anton', 'Montserrat'], ['Playfair Display', 'Lato'], ['Fredoka', 'Nunito'], ['DM Serif Display', 'Inter'], ['Lilita One', 'Nunito'], ['Archivo Black', 'Inter'], ['Cormorant Garamond', 'Montserrat']];
  const LAYOUTS = ['hero', 'split', 'banner', 'frame', 'poster', 'tall'];
  const LABEL = { hero: 'Hero', split: 'Split', banner: 'Banner', frame: 'Framed', poster: 'Poster', tall: 'Story' };
  const SIZE = { hero: 'square', split: 'portrait', banner: 'wide', frame: 'square', poster: 'pin', tall: 'story' };
  const DARK = { shirt: ['#ffffff', '#f1ece3', '#23283d', '#1f3d2e', '#7b1e2b'], hoodie: ['#23283d', '#6b7280', '#f1ece3', '#7b1e2b'], default: ['#ffffff', '#ffffff', '#23283d'] };

  /* a sample print (transparent PNG-like canvas) so every mockup looks finished before the user swaps in their own art */
  const ART_SCALE = { case: 0.58, bottle: 0.8, tumbler: 0.9 };
  function sampleArt(i, P, font, dark, kind) {
    const c = document.createElement('canvas'); c.width = c.height = 900; const g = c.getContext('2d'), ink = dark ? '#ffffff' : P.ink, acc = dark ? P.b : P.a;
    g.textAlign = 'center'; g.textBaseline = 'middle'; const sc = ART_SCALE[kind] || 1; g.translate(450, 450); g.scale(sc, sc); g.translate(-450, -450);
    const words = ART_TEXT[i % ART_TEXT.length].split(' '), style = i % 4;
    if (style === 0) { g.fillStyle = acc; g.beginPath(); g.arc(450, 450, 330, 0, 7); g.fill(); g.fillStyle = dark ? P.ink : '#fff'; g.beginPath(); g.arc(450, 450, 300, 0, 7); g.fill(); }
    if (style === 1) { g.fillStyle = acc; g.fillRect(120, 285, 660, 330); }
    if (style === 3) { g.strokeStyle = acc; g.lineWidth = 16; g.strokeRect(110, 250, 680, 400); }
    const fg = style === 1 ? onCol(acc) : style === 0 ? (dark ? onCol(P.ink) : P.ink) : ink, sz = words.length > 1 ? 150 : 190;
    g.fillStyle = fg; g.font = `${sz}px "${font}", Impact, sans-serif`; words.forEach((w, n) => g.fillText(w.toUpperCase(), 450, 450 + (n - (words.length - 1) / 2) * sz * 0.95, 640));
    g.fillStyle = acc; g.beginPath(); g.arc(450, style === 2 ? 300 : 700, 18, 0, 7); g.fill();
    return c;
  }

  function mockCanvas(spec, P, fonts) {
    const c = document.createElement('canvas'), dark = lumOf(spec.color) < 0.4; c.width = c.height = 900;
    C.mockRenderScene(c, spec.kind, { scene: spec.scene, art: sampleArt(spec.art, P, fonts[0], dark, spec.kind), color: spec.color });
    return c;
  }

  function draw(spec) {
    const W = K.W, H = K.H, k = Math.min(W, H), B = K.B, P = C.pal(spec.pal), [df, bf] = spec.f, add = o => (B.add(o), o);
    const T = (s, x, y, w, size, { body, ...o } = {}) => add(new fab.Textbox(s, { left: x, top: y, width: w, fontFamily: body ? bf : df, fontSize: size, fill: P.ink, lineHeight: 1.05, ...o }));
    const R = (x, y, w, h, fill, o = {}) => add(new fab.Rect({ left: x, top: y, width: w, height: h, fill, ...o }));
    const pill = (x, y, label, fill, ink, size) => { const w = label.length * size * 0.62 + size * 2.2; R(x, y, w, size * 2.3, fill, { rx: size * 1.15, ry: size * 1.15 }); T(label, x, y + size * 0.62, w, size, { fill: ink, textAlign: 'center', fontFamily: bf, fontWeight: 700 }); return w; };
    const mock = (x, y, w, h, o = {}) => {
      const el = mockCanvas(spec, P, spec.f), s = Math.max(w / el.width, h / el.height), im = new fab.Image(el, { left: x + (w - el.width * s) / 2, top: y + (h - el.height * s) / 2, scaleX: s, scaleY: s, originX: 'left', originY: 'top' });
      im.mock = { kind: spec.kind, scene: spec.scene, color: spec.color }; im.clipPath = new fab.Rect({ left: x, top: y, width: w, height: h, rx: o.rx || 0, ry: o.rx || 0, absolutePositioned: true }); if (o.shadow) im.shadow = new fab.Shadow({ color: 'rgba(0,0,0,.28)', blur: k * 0.05, offsetY: k * 0.02 }); return add(im);
    };
    const [h1, sub] = spec.copy, lay = spec.layout, m = k * 0.07;
    K.clearAll(P.bg);
    if (lay === 'hero') { // full-bleed scene, headline top, button bottom
      mock(0, 0, W, H); R(0, 0, W, H * 0.3, new fab.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: 0, x2: 0, y2: H * 0.3 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,.45)' }, { offset: 1, color: 'rgba(0,0,0,0)' }] }));
      const hd = T(h1.toUpperCase(), m, m, W - 2 * m, k * 0.095, { fill: '#ffffff', shadow: new fab.Shadow({ color: 'rgba(0,0,0,.35)', blur: k * 0.02 }) }); T(sub, m, hd.top + hd.height + k * 0.015, W - 2 * m, k * 0.032, { body: 1, fill: '#ffffff' });
      pill(m, H - m - k * 0.1, 'Order now', P.a, onCol(P.a), k * 0.032);
    } else if (lay === 'split') { // photo on top, colour block with copy below
      const ph = H * 0.66; mock(0, 0, W, ph); R(0, ph, W, H - ph, P.bg); R(m, ph + m * 0.8, k * 0.12, 6, P.a);
      const hd = T(h1, m, ph + m * 1.2, W - 2 * m, k * 0.085); T(sub, m, hd.top + hd.height + k * 0.015, W - 2 * m, k * 0.03, { body: 1, fill: P.ink, opacity: 0.8 }); pill(m, H - m - k * 0.075, 'Shop the collection', P.a, onCol(P.a), k * 0.026);
    } else if (lay === 'banner') { // copy left, product right
      const pw = W * 0.52; R(0, 0, W, H, P.bg); mock(W - pw, 0, pw, H); R(W - pw - 4, 0, 4, H, P.a);
      const hd = T(h1.toUpperCase(), m, H * 0.16, W - pw - 2 * m, k * 0.11, { fill: P.ink }); T(sub, m, hd.top + hd.height + k * 0.025, W - pw - 2 * m, k * 0.04, { body: 1, fill: P.ink, opacity: 0.8 }); pill(m, H - m * 1.8 - k * 0.06, 'Order today', P.a, onCol(P.a), k * 0.045);
    } else if (lay === 'frame') { // framed card on colour field
      R(0, 0, W, H, P.bg); const f = k * 0.08, s = W - 2 * f; mock(f, f, s, s * 0.74, { rx: k * 0.03, shadow: 1 });
      const hd = T(h1, f, f + s * 0.74 + k * 0.04, s, k * 0.07, {}); T(sub, f, hd.top + hd.height + k * 0.012, s * 0.7, k * 0.028, { body: 1, opacity: 0.75 }); pill(W - f - 200 - k * 0.05, H - f - k * 0.085, 'Shop', P.a, onCol(P.a), k * 0.03);
    } else if (lay === 'poster') { // tall Pinterest pin: big headline over the scene
      const ph = H * 0.62; R(0, 0, W, H, P.bg); mock(0, H - ph, W, ph); const hd = T(h1.toUpperCase(), m, m, W - 2 * m, W * 0.13, { textAlign: 'center' }); T(sub, m, hd.top + hd.height + W * 0.02, W - 2 * m, W * 0.04, { body: 1, textAlign: 'center', opacity: 0.8 });
      pill((W - (W * 0.34)) / 2, H - ph - W * 0.06, 'Shop now', P.a, onCol(P.a), W * 0.034);
    } else { // tall story
      R(0, 0, W, H, P.bg); mock(0, H * 0.2, W, H * 0.6); T(h1.toUpperCase(), m, H * 0.06, W - 2 * m, W * 0.13, { textAlign: 'center' }); T(sub, m, H * 0.82, W - 2 * m, W * 0.045, { body: 1, textAlign: 'center', opacity: 0.8 }); pill((W - W * 0.46) / 2, H * 0.9, 'Swipe up to shop', P.a, onCol(P.a), W * 0.036);
    }
  }

  /* ---- register: 12 products x 6 layouts x 3 variants = ~216 designs ---- */
  let n = 0;
  KINDS.forEach((kind, ki) => LAYOUTS.forEach((layout, li) => { for (let v = 0; v < 3; v++) {
    const seed = ki * 31 + li * 7 + v * 13, id = `mockt-${++n}`, colors = DARK[kind] || DARK.default, color = colors[(seed + v) % colors.length], scene = SCENES[(seed + li) % SCENES.length];
    const f = FONTS[(seed + v) % FONTS.length], copy = COPY[(ki * 3 + li + v * 5) % COPY.length], palI = (seed * 5 + v * 3) % 24, spec = { kind, layout, scene, color, copy, pal: palI, f, art: seed };
    META[id] = { n: `${PRODUCT_NAMES[kind]} · ${LABEL[layout]}`, title: copy[0], cat: 'mockup', p: PRODS[SIZE[layout]], t: `mockup mock product ${PRODUCT_NAMES[kind]} ${kind} marketing ad ${copy[0]} ${scene}`.toLowerCase(), f, pro: n % 5 === 0, gen: 1, real: 0, mock: 1 };
    TEMPLATES[id] = () => draw(spec);
  } }));

  { const old = { ...C.CAT_LABEL }; Object.keys(C.CAT_LABEL).forEach(k => delete C.CAT_LABEL[k]); Object.assign(C.CAT_LABEL, { mockup: 'Mock templates' }, old); } // first tab
  C.TPL_VERSION = C.TPL_VERSION + 'm1';

  /* ---- swap the artwork printed on a mockup (command palette: "Mockup: swap artwork", or double-click the product) ---- */
  const swap = () => {
    const o = C.active(); if (!o || !o.mock) return C.toast('Click the product picture first', '☝️');
    const inp = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' });
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return; const img = new Image(); img.src = URL.createObjectURL(f); try { await img.decode(); } catch { return C.toast('Could not read that image', '⚠️'); }
      const c = document.createElement('canvas'); c.width = c.height = 900; C.mockRenderScene(c, o.mock.kind, { scene: o.mock.scene, art: img, color: o.mock.color });
      o.setElement(c); o.dirty = true; C.canvas.requestRenderAll(); C.commit(); C.toast('Artwork swapped', '');
    }; inp.click();
  };
  C.swapMockArt = swap; C.addCommand('Mockup: swap artwork on selected product', swap);
  C.canvas.on('mouse:dblclick', e => { if (e.target && e.target.mock) swap(); });
})();
