/* Chitra Studio – real-photo templates. A catalog of free-licence photos (data/photos.json, built by tools/harvest-photos.mjs)
   is combined with editorial layouts, palettes, fonts and copy to produce ~1,000 photographic designs.
   Photos are plain image objects in the design, so users can crop, replace or enhance them like any other photo. */
(() => {
  const C = window.chitra;
  if (!C || !C.TEMPLATES) return;
  const K = C.kit, META = C.TEMPLATE_META, TEMPLATES = C.TEMPLATES;
  const PH = { list: [], byId: {}, ready: false };
  const imgCache = new Map(); // url -> HTMLImageElement | null

  /* ---------------- photo access ---------------- */
  const urlOf = (p, kind) => p.s === 'un' ? `${p.u}${p.u.includes('?') ? '&' : '?'}auto=format&fit=crop&q=${kind === 'thumb' ? 60 : 78}&w=${kind === 'thumb' ? 420 : 1500}` : (kind === 'thumb' ? p.t : p.f);
  C.photoById = id => PH.byId[id] || null;
  C.photoEl = (p, kind = 'full') => (p ? imgCache.get(urlOf(p, kind)) || null : null);
  /* Photos are fetched once and kept on the device (IndexedDB): faster, works offline, and no repeated hot-linking of the providers' servers. */
  const IBX = 'ibindex';
  async function cachePut(url, blob) { try { await C.kv.set('ib:' + url, blob); const ix = (await C.kv.get(IBX)) || []; ix.push(url); if (ix.length > 700) { for (const u of ix.splice(0, 100)) await C.kv.del('ib:' + u); } await C.kv.set(IBX, ix); } catch { } }
  const fromSrc = (src, cors) => new Promise(res => { const im = new Image(); if (cors) im.crossOrigin = 'anonymous'; const t = setTimeout(() => res(null), 12000); im.onload = () => { clearTimeout(t); res(im); }; im.onerror = () => { clearTimeout(t); res(null); }; im.src = src; });
  async function load(url) {
    if (imgCache.get(url)) return true;
    try {
      let blob = await C.kv.get('ib:' + url);
      if (!blob) { const r = await fetch(url, { mode: 'cors' }); if (r.ok) { blob = await r.blob(); if (blob.size > 0 && blob.size < 8e6) cachePut(url, blob); } }
      if (blob) { const im = await fromSrc(URL.createObjectURL(blob), false); if (im) { imgCache.set(url, im); return true; } }
    } catch { }
    const im = await fromSrc(url, true); if (im) { imgCache.set(url, im); return true; } return false;
  }
  C.preloadPhotos = (ids, kind) => Promise.all((ids || []).map(id => PH.byId[id]).filter(Boolean).map(p => load(urlOf(p, kind)))).then(r => r.every(Boolean));
  const baseFonts = C.ensureTplFonts;
  C.ensureTpl = async (id, kind = 'full') => {
    const m = META[id]; if (!m) return false;
    const [f, p] = await Promise.all([baseFonts(m.f), C.preloadPhotos(m.ph, kind)]);
    if (kind === 'full') trackUnsplash((m.ph || []).map(x => PH.byId[x]).filter(p => p && p.dl));
    return f && p;
  };
  /* Unsplash asks apps to ping their download endpoint when a photo is used. Done through your photo proxy (keys stay server-side) or the owner's own key. */
  const tracked = new Set();
  function trackUnsplash(list) {
    const CFG = window.CHITRA_CONFIG || {}, sc = C.stock?.config?.() || {}, proxy = (sc.proxy || localStorage.getItem('chitra.proxy') || CFG.photoProxy || '').replace(/\/$/, '');
    list.forEach(p => { if (!p.dl || tracked.has(p.dl)) return; tracked.add(p.dl); try { if (proxy) fetch(`${proxy}/track?id=${encodeURIComponent(p.dl)}`, { mode: 'no-cors' }).catch(() => { }); else if (sc.unsplash) fetch(`https://api.unsplash.com/photos/${encodeURIComponent(p.dl)}/download?client_id=${encodeURIComponent(sc.unsplash)}`).catch(() => { }); } catch { } });
  }

  /* ---------------- drawing helpers ---------------- */
  const lumOf = c => { const n = parseInt(c.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  const onCol = c => (lumOf(c) > 0.6 ? '#15131f' : '#ffffff');

  /* Real layouts get the same toolbox the graphic layouts use (see draw() in templates.js). */
  C.realLayouts = env => {
    const { W, H, k, P, c, f, rnd, add, rect, circ, poly, text: text0, extra, tb, wide, tall, flip, spark, B, ph: phs, kind, NOCASE } = env;
    const fab = window.fabric, SH = (a, b) => new fab.Shadow({ color: `rgba(0,0,0,${a})`, blur: k * b, offsetX: 0, offsetY: k * b * 0.4 });
    const credit = p => ({ site: p.site || (p.s === 'un' ? 'Unsplash' : 'Pixabay'), by: p.by, link: p.l, title: (p.k && p.k[0]) || '' });
    const grad = (x, y, w, h, stops, vertical = true) => rect(x, y, w, h, new fab.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: vertical ? { x1: 0, y1: 0, x2: 0, y2: h } : { x1: 0, y1: 0, x2: w, y2: 0 }, colorStops: stops }));
    /* cover-fit photo into a box, optionally rounded / circular / custom clip */
    function photo(i, x, y, w, h, o = {}) {
      const p = phs[i % Math.max(1, phs.length)], el = C.photoEl(p, kind);
      if (!el) { rect(x, y, w, h, (p && p.c) || P.soft, { rx: o.rx || 0, ry: o.rx || 0 }); return null; }
      const s = Math.max(w / el.naturalWidth, h / el.naturalHeight), iw = el.naturalWidth * s, ih = el.naturalHeight * s, fx = o.fx ?? 0.5, fy = o.fy ?? 0.42;
      const img = new fab.Image(el, { left: x + (w - iw) * fx, top: y + (h - ih) * fy, scaleX: s, scaleY: s, originX: 'left', originY: 'top' });
      img.clipPath = o.clip || (o.circle ? new fab.Circle({ left: x + w / 2, top: y + h / 2, radius: Math.min(w, h) / 2, originX: 'center', originY: 'center', absolutePositioned: true }) : new fab.Rect({ left: x, top: y, width: w, height: h, rx: o.rx || 0, ry: o.rx || 0, absolutePositioned: true }));
      img.credit = credit(p);
      if (o.duo) { img.filters = [new fab.Image.filters.Grayscale(), new fab.Image.filters.BlendColor({ color: o.duo, mode: 'tint', alpha: 0.62 })]; img.applyFilters(); }
      if (o.shadow) img.shadow = SH(0.35, 0.05);
      add(img); return img;
    }
    const WHITE = '#ffffff', glow = SH(0.5, 0.012);
    const up = () => !NOCASE.has(f.d) && rnd() < 0.55;
    const dim = a => `rgba(8,6,20,${a})`;
    const archClip = (x, y, w, h) => new fab.Path(`M ${x} ${y + h} L ${x} ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z`, { absolutePositioned: true });
    const maxBottom = H - (c.x ? k * 0.105 : 0) - k * 0.012, text = (b, o) => text0(b.y + b.h > maxBottom ? { ...b, h: Math.max(k * 0.06, maxBottom - b.y) } : b, o);
    const L = {};

    L.rHero = () => {
      photo(0, 0, 0, W, H); const top = wide ? 0 : H * 0.34; grad(0, top, W, H - top, [{ offset: 0, color: 'rgba(8,6,20,0)' }, { offset: 1, color: 'rgba(8,6,20,.84)' }]);
      const b = wide ? tb(0.07, 0.18, 0.55, 0.64) : tb(0.07, 0.56, 0.86, 0.36); rect(b.x, b.y - k * 0.03, k * 0.1, k * 0.012, P.a);
      text(b, { align: 'left', up: up(), maxT: wide ? 0.2 : 0.17, tFill: WHITE, sFill: 'rgba(255,255,255,.88)', oFill: P.a, shadow: glow }); extra('#15131f');
    };
    L.rCenter = () => {
      photo(0, 0, 0, W, H); rect(0, 0, W, H, dim(0.46)); const m = k * 0.045; rect(m, m, W - 2 * m, H - 2 * m, 'transparent', { stroke: 'rgba(255,255,255,.75)', strokeWidth: k * 0.004 });
      text(tb(0.12, 0.2, 0.76, 0.6), { up: up(), maxT: 0.24, tFill: WHITE, sFill: 'rgba(255,255,255,.9)', oFill: P.a, shadow: glow }); extra('#15131f');
    };
    L.rSplit = () => {
      rect(0, 0, W, H, P.bg);
      if (wide) { photo(0, 0, 0, W * 0.5, H); rect(W * 0.5, 0, k * 0.014, H, P.a); text(tb(0.56, 0.14, 0.38, 0.72), { align: 'left', maxT: 0.2, up: up() }); }
      else { photo(0, 0, 0, W, H * 0.56); rect(0, H * 0.56, W, k * 0.014, P.a); text(tb(0.08, 0.6, 0.84, 0.34), { align: 'left', maxT: 0.17, up: up() }); }
      extra();
    };
    L.rCard = () => {
      photo(0, 0, 0, W, H); rect(0, 0, W, H, dim(0.12)); const x = wide ? W * 0.06 : W * 0.07, y = wide ? H * 0.12 : H * 0.56, w = wide ? W * 0.44 : W * 0.86, h = wide ? H * 0.76 : H * 0.36;
      rect(x + k * 0.012, y + k * 0.016, w, h, 'rgba(0,0,0,.22)', { rx: k * 0.04, ry: k * 0.04 }); rect(x, y, w, h, P.bg, { rx: k * 0.04, ry: k * 0.04 });
      text({ x: x + w * 0.07, y: y + h * 0.08, w: w * 0.86, h: h * 0.84 }, { align: 'left', maxT: 0.15, up: up(), pill: P.a }); extra();
    };
    L.rPolaroid = () => {
      rect(0, 0, W, H, P.alt); const pw = k * (wide ? 0.62 : 0.72), ph = pw * 1.18, x = wide ? W * 0.1 : (W - pw) / 2, y = wide ? (H - ph) / 2 : H * 0.07, ang = (flip ? 1 : -1) * 3;
      const g = []; const bgp = new fab.Rect({ left: x, top: y, width: pw, height: ph, fill: '#fff', shadow: SH(0.4, 0.05) }); g.push(bgp);
      const el = C.photoEl(phs[0], kind), ins = pw * 0.06, iw = pw - 2 * ins;
      if (el) { const s = Math.max(iw / el.naturalWidth, iw / el.naturalHeight), im = new fab.Image(el, { left: x + ins + (iw - el.naturalWidth * s) / 2, top: y + ins + (iw - el.naturalHeight * s) * 0.42, scaleX: s, scaleY: s, originX: 'left', originY: 'top' }); im.clipPath = new fab.Rect({ left: x + ins, top: y + ins, width: iw, height: iw, absolutePositioned: true }); im.credit = credit(phs[0]); g.push(im); } else g.push(new fab.Rect({ left: x + ins, top: y + ins, width: iw, height: iw, fill: phs[0]?.c || P.soft }));
      const cap = new fab.Textbox(c.t, { left: x + pw / 2, top: y + iw + ins * 1.6, originX: 'center', width: pw * 0.88, fontFamily: f.d, fontSize: pw * 0.085, fill: '#222', textAlign: 'center' }); for (let i = 0; i < 40 && cap.height > ph - iw - ins * 2 && cap.fontSize > 8; i++) cap.set('fontSize', cap.fontSize * 0.93); g.push(cap);
      const grp = new fab.Group(g, { angle: ang }); add(grp);
      if (wide) text(tb(0.6, 0.18, 0.34, 0.64), { align: 'left', maxT: 0.14, noSub: false }); else if (c.s) { const s = new fab.Textbox(c.s, { left: W / 2, top: H * 0.9, originX: 'center', width: W * 0.8, fontFamily: f.b, fontSize: k * 0.045, fill: P.ink, textAlign: 'center' }); add(s); }
      extra();
    };
    L.rMagazine = () => {
      photo(0, 0, 0, W, H); grad(0, 0, W, H * 0.3, [{ offset: 0, color: 'rgba(8,6,20,.55)' }, { offset: 1, color: 'rgba(8,6,20,0)' }]); grad(0, H * 0.62, W, H * 0.38, [{ offset: 0, color: 'rgba(8,6,20,0)' }, { offset: 1, color: 'rgba(8,6,20,.8)' }]);
      const mh = new fab.Textbox((c.t || '').toUpperCase(), { left: W / 2, top: H * 0.04, originX: 'center', width: W * 0.9, fontFamily: f.d, fontSize: k * 0.2, fill: WHITE, textAlign: 'center', charSpacing: 40 }); for (let i = 0; i < 50 && (mh.getLineWidth(0) > W * 0.9 || mh.height > H * 0.2) && mh.fontSize > 12; i++) mh.set('fontSize', mh.fontSize * 0.93); add(mh);
      rect(W * 0.07, H * 0.04 + mh.height + k * 0.02, W * 0.86, k * 0.005, WHITE, { opacity: 0.8 });
      const iss = new fab.Textbox(`ISSUE ${String(1 + Math.floor(rnd() * 98)).padStart(2, '0')}  ·  ${(c.g || 'special').split(' ')[0].toUpperCase()}`, { left: W / 2, top: H * 0.04 + mh.height + k * 0.04, originX: 'center', width: W * 0.8, fontFamily: f.b, fontSize: k * 0.026, fill: WHITE, textAlign: 'center', charSpacing: 320 }); add(iss);
      const s = new fab.Textbox(c.s || '', { left: W * 0.07, top: H * 0.8, width: W * 0.7, fontFamily: f.d, fontSize: k * 0.07, fill: WHITE, textAlign: 'left', lineHeight: 1.05, shadow: glow }); for (let i = 0; i < 30 && s.height > H * 0.15 && s.fontSize > 10; i++) s.set('fontSize', s.fontSize * 0.93); add(s); rect(W * 0.07, H * 0.8 - k * 0.025, k * 0.08, k * 0.01, P.a);
    };
    L.rArch = () => {
      rect(0, 0, W, H, P.alt); const w = k * (wide ? 0.5 : 0.7), h = wide ? H * 0.84 : H * 0.62, x = wide ? W * 0.08 : (W - w) / 2, y = wide ? H * 0.08 : H * 0.06;
      photo(0, x, y, w, h, { clip: archClip(x, y, w, h), fy: 0.4 }); circ(x + w * (flip ? 0.12 : 0.88), y + w * 0.12, k * 0.06, P.a);
      text(wide ? tb(0.6, 0.16, 0.34, 0.68) : tb(0.08, y / H + h / H + 0.03, 0.84, 1 - (y / H + h / H) - 0.07), { align: wide ? 'left' : 'center', maxT: 0.15, up: up() }); extra();
    };
    L.rCircle = () => {
      rect(0, 0, W, H, P.soft); const r = k * (wide ? 0.4 : 0.32), cx = wide ? W * 0.27 : W / 2, cy = wide ? H / 2 : H * 0.34;
      circ(cx, cy, r + k * 0.03, P.a); photo(0, cx - r, cy - r, r * 2, r * 2, { circle: true, shadow: true }); spark(cx + r * 0.8, cy - r * 0.8, k * 0.05, P.b);
      text(wide ? tb(0.52, 0.14, 0.42, 0.72) : tb(0.08, 0.7, 0.84, 0.24), { align: wide ? 'left' : 'center', maxT: 0.15, up: up() }); extra();
    };
    L.rCollage = () => {
      rect(0, 0, W, H, P.bg); const g = k * 0.02, m = k * 0.04;
      if (wide) { const w = (W - 2 * m - 2 * g) / 3, h = H * 0.62; [0, 1, 2].forEach(i => photo(i, m + i * (w + g), m, w, h, { rx: k * 0.02 })); text(tb(0.05, 0.68, 0.9, 0.28), { align: 'left', maxT: 0.16, up: up() }); }
      else { const bw = (W - 2 * m - g) * 0.6, sw = W - 2 * m - g - bw, bh = H * 0.5; photo(0, m, m, bw, bh, { rx: k * 0.02 }); photo(1, m + bw + g, m, sw, bh * 0.52, { rx: k * 0.02 }); photo(2, m + bw + g, m + bh * 0.52 + g, sw, bh * 0.48 - g, { rx: k * 0.02 }); text(tb(0.07, 0.58, 0.86, 0.36), { align: 'left', maxT: 0.16, up: up() }); }
      extra();
    };
    L.rDuotone = () => {
      photo(0, 0, 0, W, H, { duo: P.a }); rect(0, 0, W, H, 'rgba(8,6,20,.18)');
      text(wide ? tb(0.07, 0.14, 0.7, 0.72) : tb(0.07, 0.22, 0.86, 0.56), { align: wide ? 'left' : 'center', up: true, maxT: 0.3, tFill: WHITE, sFill: WHITE, oFill: WHITE, ls: 20, shadow: glow }); extra('#15131f');
    };
    L.rBlur = () => {
      photo(0, 0, 0, W, H); const x = W * 0.08, y = H * (wide ? 0.2 : 0.3), w = W * 0.84, h = H * (wide ? 0.6 : 0.4);
      rect(x, y, w, h, 'rgba(255,255,255,.82)', { rx: k * 0.05, ry: k * 0.05, stroke: 'rgba(255,255,255,.95)', strokeWidth: k * 0.004, shadow: SH(0.3, 0.04) });
      text({ x: x + w * 0.06, y: y + h * 0.1, w: w * 0.88, h: h * 0.8 }, { maxT: 0.2, tFill: '#15131f', sFill: '#33304a', oFill: P.a, up: up() }); extra();
    };
    L.rBorder = () => {
      rect(0, 0, W, H, P.bg); const m = k * 0.06, ph = wide ? H - 2 * m : H * 0.7 - m;
      photo(0, m, m, wide ? W * 0.56 : W - 2 * m, wide ? H - 2 * m : ph, { rx: k * 0.015 });
      text(wide ? tb(0.64, 0.14, 0.31, 0.72) : { x: W * 0.08, y: m + ph + k * 0.02, w: W * 0.84, h: H - (m + ph) - m * 0.9 }, { align: wide ? 'left' : 'center', maxT: 0.15, up: up() });
      rect(m, H - m * 0.55, W - 2 * m, k * 0.004, P.a, { opacity: 0.0 }); extra();
    };
    L.rYT = () => {
      photo(0, 0, 0, W, H); grad(0, 0, W * 0.7, H, [{ offset: 0, color: 'rgba(0,0,0,.72)' }, { offset: 1, color: 'rgba(0,0,0,0)' }], false);
      const b = tb(0.04, 0.08, 0.6, 0.62); const t = text(b, { align: 'left', up: true, noSub: true, maxT: 0.3, tFill: '#ffe14d', stroke: '#111', shadow: SH(0.6, 0.014) });
      if (c.s) { const s = new fab.Textbox(c.s.toUpperCase(), { left: W * 0.04, top: t.bottom + k * 0.03, width: W * 0.58, fontFamily: f.b, fontSize: k * 0.07, fill: '#fff', fontWeight: 'bold', backgroundColor: P.a }); for (let i = 0; i < 20 && s.height + t.bottom > H * 0.95 && s.fontSize > 10; i++) s.set('fontSize', s.fontSize * 0.92); add(s); }
    };
    L.rSide = () => {
      rect(0, 0, W, H, P.bg);
      if (wide) { const cut = W * 0.1; const clip = new fab.Polygon([{ x: W * 0.42 + cut, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: W * 0.42, y: H }], { absolutePositioned: true }); photo(0, W * 0.42, 0, W * 0.58, H, { clip, fx: 0.4 }); rect(0, 0, k * 0.02, H, P.a); text(tb(0.06, 0.14, 0.38, 0.72), { align: 'left', maxT: 0.2, up: up() }); }
      else { const clip = new fab.Polygon([{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H * 0.5 }, { x: 0, y: H * 0.6 }], { absolutePositioned: true }); photo(0, 0, 0, W, H * 0.6, { clip }); text(tb(0.08, 0.64, 0.84, 0.3), { align: 'left', maxT: 0.16, up: up() }); }
      extra();
    };
    void onCol; void poly; void B; void tall;
    return L;
  };

  /* ---------------- catalog + registration ---------------- */
  /* ---- precise copy -> photo-topic matching: a photo is only used when it genuinely shows what the words say ---- */
  const COPY_RULES = [
    [/pizza/, ['pizza']], [/burger/, ['burger']], [/taco|mexican/, ['mexican']], [/biryani|curry|kebab|dum |indian food/, ['indianfood']], [/sushi|japanese/, ['sushi']],
    [/hot chocolate|cocoa|cosy mode/, ['hotchocolate', 'winter']], [/chai|\btea\b|tea time|steep/, ['tea']], [/coffee|espresso|latte|caffein|brew|café|cafe\b|barista/, ['coffee']],
    [/ice cream|gelato/, ['icecream']], [/cake|bakery|baker|bake sale|pastry|dessert|sweet treats|cookie|donut|golden crust/, ['dessert', 'bakery']],
    [/healthy|salad|vegan|green plate|fresh & healthy|nutrition/, ['healthy']], [/juice|smoothie|cocktail|wine tasting|cheers to you|sip happens|drinks/, ['drinks']],
    [/menu|chef|recipe|cooking|kitchen|food|taste|eat\b|dinner|restaurant|catering|truck|snack|brunch|farmers market|market/, ['food']],
    [/yoga|namaste|meditat|breathe|zen/, ['yoga']], [/spa|serenity|self ?care|wellness|massage|relax/, ['spa']], [/marathon|charity run|city run|run for/, ['running']],
    [/gym|fitness|workout|lift|training|muscle|no pain|challenge/, ['fitness']], [/cricket/, ['cricket']], [/football|soccer|goal!/, ['football']], [/sport|play hard|match|tournament/, ['sports']], [/bike|cycl/, ['bike']],
    [/beach|summer|sun · sea|sand|ocean|salty|pool party/, ['beach']], [/mountain|hike|camp|trek|explore|adventure|calling/, ['mountains']], [/travel|trip|wander|pack your bags|vacation|tour|journey|hotel|lifetime/, ['travel']],
    [/sunset|golden hour/, ['sunset']], [/sunrise|good morning|hello sunshine|rise & shine|wake up|morning/, ['sunrise']],
    [/wedding|bride|bridal|mr & mrs|just married|engage|she said yes|married/, ['wedding']], [/love|valentine|heart|my sunshine|make me happy/, ['love']],
    [/baby|shower|naming|newborn/, ['baby']], [/kids|child|little one|future legend|daycare|mom of boys/, ['kids']], [/graduat|tassel/, ['graduation']],
    [/birthday|make a wish/, ['birthday']], [/anniversary|reunion|farewell|retirement|party|bash|celebrat|cheers/, ['party']],
    [/christmas|santa|xmas|ho ho/, ['christmas']], [/winter|snow/, ['winter']], [/diwali|diya|rangoli|festival of lights|mela/, ['diwali']], [/eid|ramadan|iftar|mubarak/, ['eid']],
    [/halloween|spooky|costume/, ['halloween']], [/new year|midnight|countdown|resolution|goals/, ['fireworks']], [/independence|jai hind|republic/, ['flag']], [/festival|carnival/, ['festival']],
    [/podcast/, ['podcast']], [/gamer|gaming|game on|level up/, ['gaming']], [/music|concert|rock|band|live on stage|open mic|dance|dj\b|show|stage|turn it up|talent/, ['concert', 'music']],
    [/code|coder|tech|startup|summit|software|digital|\bai\b|laptop|webinar|online course/, ['tech']], [/book|read|library|chapter|story|stories/, ['books']],
    [/study|exam|school|tuition|class|learn|education|course|student|teacher|maths|science fair|homework/, ['education']],
    [/team|together|family|friends|community|neighbo|meet the team|spirit/, ['team']], [/office|boss|hustle|business|pitch|meeting|job|hiring|career|agency|report|quarterly|proposal|marketing|roadmap|case study|portfolio|finance|money|lawyer|advisor|manager/, ['business', 'office']],
    [/art|paint|creative|exhibit|design|photograph|gallery|create/, ['art']], [/fashion|style|outfit|boutique|stylist|tailor|stitch|clothing|runway/, ['fashion']], [/beauty|salon|hair|makeup|skin|glow|nail|cosmetic/, ['beauty']],
    [/real estate|property|housewarming|interior|decor|dream home|keys|home sweet/, ['interior']], [/home|house|clean|plumb|repair|mover|moving/, ['home']],
    [/dog|puppy|paws|groom/, ['dog']], [/\bcat\b|kitten|purr/, ['cat']], [/pet\b|pets/, ['pets']], [/car\b|cars|wash|auto|driving|king of the road/, ['cars']],
    [/flower|bloom|bouquet/, ['flowers']], [/plant|garden|grow|green/, ['plants']], [/wild|nature|free spirit|farm|forest/, ['nature']],
    [/sale|offer|deal|discount|black friday|flash|delivery|order|store|arrival|launch|collection|sold out|buy|price|shop|open for orders|giveaway/, ['shopping']],
  ];
  const GENERIC = /quote|inspir|thank|motivat|vibes|positive|dream|stay |kind|humble|hustle|coming soon|booking|book now|tips|ideas|review|welcome|hello|greeting|announce|follow|win big|sarcasm|funny|less drama|not a morning|born to create|self love|you've got this|curious|good things|grand opening|hiring|open|new menu|workshop|register|podcast out|customer love|behind the scenes|tip of the day|learn something|stay tuned/;
  const NEUTRAL = ['abstract', 'texture', 'sunrise', 'sunset', 'nature', 'lights'];
  function topicsFor(c0) { const hay = `${c0.t} ${c0.s}`.toLowerCase(); for (const [re, ts] of COPY_RULES) if (re.test(hay)) return ts; return GENERIC.test(hay) ? NEUTRAL : null; }
  const STYLE = { rHero: 'Cinematic', rCenter: 'Spotlight', rSplit: 'Split', rCard: 'Card', rPolaroid: 'Polaroid', rMagazine: 'Magazine', rArch: 'Arch', rCircle: 'Portrait', rCollage: 'Collage', rDuotone: 'Duotone', rBlur: 'Frosted', rBorder: 'Framed', rYT: 'Thumbnail', rSide: 'Editorial' };
  const FAMS = [
    // prefix, category, product, copy pool name, count, moods, layouts, preferred photo orientation
    ['rig', 'social', 'Instagram post', 'PROMO', 170, ['modern', 'bold', 'elegant', 'fun'], ['rHero', 'rCenter', 'rCard', 'rDuotone', 'rBlur', 'rBorder', 'rPolaroid', 'rCircle', 'rArch', 'rCollage', 'rSplit'], 's'],
    ['rst', 'story', 'Story / Reel / TikTok', 'PROMO', 130, ['bold', 'modern', 'fun', 'script'], ['rHero', 'rCenter', 'rCard', 'rDuotone', 'rBlur', 'rArch', 'rMagazine', 'rCircle'], 'p'],
    ['rpo', 'poster', 'A4', 'EVENTS', 110, ['bold', 'modern', 'elegant', 'retro'], ['rHero', 'rCenter', 'rMagazine', 'rSplit', 'rBorder', 'rArch', 'rCard', 'rCollage'], 'p'],
    ['rfl', 'flyer', 'Flyer', 'SERVICES', 70, ['bold', 'modern', 'elegant'], ['rHero', 'rSplit', 'rCard', 'rBorder', 'rArch'], 'p'],
    ['rin', 'invite', 'Invitation', 'INVITES', 80, ['script', 'elegant', 'hand'], ['rBorder', 'rArch', 'rCard', 'rPolaroid', 'rCircle', 'rBlur'], 'p'],
    ['ryt', 'youtube', 'YouTube thumbnail', 'YT', 80, ['bold', 'fun'], ['rYT', 'rYT', 'rCenter', 'rDuotone'], 'l'],
    ['rsl', 'slides', 'Presentation 16:9', 'SLIDES', 70, ['modern', 'elegant'], ['rSplit', 'rHero', 'rSide', 'rCard', 'rCollage'], 'l'],
    ['rpn', 'pinterest', 'Pinterest pin', 'PIN', 80, ['elegant', 'modern', 'script', 'fun'], ['rHero', 'rCard', 'rArch', 'rBlur', 'rMagazine', 'rBorder'], 'p'],
    ['rmg', 'mug', '11 oz mug wrap', 'QUOTES', 90, ['fun', 'script', 'bold', 'elegant'], ['rCenter', 'rHero', 'rSide', 'rDuotone', 'rBlur'], 'l'],
    ['rwl', 'wallpaper', 'Desktop wallpaper', 'QUOTES', 50, ['modern', 'script', 'bold'], ['rCenter', 'rBlur', 'rHero', 'rDuotone'], 'l'],
    ['rfb', 'social', 'Facebook post', 'PROMO', 60, ['modern', 'bold', 'fun'], ['rHero', 'rSide', 'rCenter', 'rCard'], 'l'],
    ['rli', 'social', 'LinkedIn banner', 'SLIDES', 25, ['modern'], ['rSide', 'rHero', 'rCenter'], 'l'],
    ['rbc', 'card', 'Business card', 'CARDS', 40, ['modern', 'elegant'], ['rSplit', 'rSide', 'rCard'], 'l'],
    ['rpc', 'card', 'Postcard', 'MISC', 40, ['script', 'elegant'], ['rBorder', 'rCenter', 'rHero', 'rBlur'], 'l'],
  ];

  /* Returns photo ids that really show the topic, or null (then NO photographic template is made for those words - a graphic one still exists). */
  function pickPhotos(c0, fam, i, n) {
    const topics = topicsFor(c0); if (!topics) return null;
    let pool = PH.list.filter(p => topics.includes((p.k || [])[0])); if (pool.length < n) return null;
    const want = fam[7], pref = pool.filter(p => want === 's' ? true : p.o === want); if (pref.length >= n + 1) pool = pref;
    const out = [], step = 3 + (i % 4), start = (i * step + fam[0].length * 13) % pool.length;
    for (let j = 0; out.length < n && j < pool.length; j++) { const p = pool[(start + j * 2 + (j ? 1 : 0)) % pool.length]; if (!out.includes(p.id)) out.push(p.id); }
    return out.length === n ? out : null;
  }

  function registerReal() {
    Object.keys(META).forEach(k => { if (META[k].real) { delete META[k]; delete TEMPLATES[k]; } });
    const pools = { PROMO: C.COPY?.PROMO, EVENTS: C.COPY?.EVENTS, SERVICES: C.COPY?.SERVICES, INVITES: C.COPY?.INVITES, YT: C.COPY?.YT, SLIDES: C.COPY?.SLIDES, PIN: C.COPY?.PIN, QUOTES: C.COPY?.QUOTES, CARDS: C.COPY?.CARDS, MISC: C.COPY?.MISC };
    let made = 0; const want = FAMS.reduce((s, f) => s + f[4], 0), scale = Math.min(1, (PH.list.length * 2.5) / want); // never reuse a photo more than ~2x: fewer photos => fewer (still unique) designs
    FAMS.forEach((fam, fi) => {
      const pool = pools[fam[3]]; if (!pool || !pool.length) return; const [pre, cat, prod, , count0, moods, layouts] = fam, count = Math.max(4, Math.floor(count0 * scale));
      for (let i = 0; i < count; i++) {
        const c0 = pool[i % pool.length], v = Math.floor(i / pool.length), id = `${pre}-${i + 1}`, seed = C.hashSeed(id);
        const layout = layouts[(i * 5 + v * 3 + fi) % layouts.length], mood = moods[(i * 3 + v + fi) % moods.length], pairs = C.MOODS[mood], f = pairs[(i * 7 + v * 5 + fi) % pairs.length];
        const nPh = layout === 'rCollage' ? 3 : 1, photos = pickPhotos(c0, fam, i, nPh); if (!photos) continue; const p = C.pal(((i * 11 + v * 7 + fi * 5) % 24) + (i % 3 === 0 ? 24 : 0));
        const c = { t: c0.t, s: c0.s, g: c0.g };
        if (cat === 'invite') c.o = "You're invited"; else if (cat === 'poster') c.o = 'Live · Local · Loud'; else if (pre === 'rbc') { c.x = '+1 234 567 890 · hello@email.com'; } else if (cat === 'flyer') { c.o = 'Now open'; c.x = 'www.yourwebsite.com · +1 234 567 890'; }
        const spec = { layout, pal: p, c, f: { d: f[0], b: f[1] }, seed, photos, real: true };
        META[id] = { n: `${c0.t} · ${STYLE[layout] || 'Photo'}`, title: c0.t, spec, cat, p: prod, t: `${c0.g} ${cat} photo photographic real ${mood} ${layout}`.toLowerCase(), f: [f[0], f[1]], ph: photos, gen: 1, real: 1, pro: i % 7 === 6 };
        TEMPLATES[id] = () => { K.clearAll(''); C.drawTemplate(spec); };
        if (cat === 'mug') META[id].mockKind = 'mug';
        made++;
      }
    });
    return made;
  }

  /* listing: photographic designs first, mixed across categories so "All" feels like a store window */
  C.listTemplates = ({ cat = 'all', q = '' } = {}) => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    let ids = Object.keys(META).filter(id => (cat === 'all' || META[id].cat === cat) && (!words.length || words.every(w => `${META[id].n} ${META[id].cat} ${META[id].t || ''}`.toLowerCase().includes(w))));
    const real = ids.filter(id => META[id].real), rest = ids.filter(id => !META[id].real);
    const mix = list => { if (cat !== 'all') return list; const by = {}; list.forEach(id => (by[META[id].cat] ||= []).push(id)); const keys = Object.keys(by), out = []; for (let i = 0; keys.some(k => by[k][i]); i++) keys.forEach(k => by[k][i] && out.push(by[k][i])); return out; };
    return [...mix(real), ...mix(rest)];
  };

  function setCatalog(photos, announce = true) {
    PH.list = photos.filter(p => p && p.id && (p.s === 'un' && p.u ? true : p.f && p.t)); PH.byId = Object.fromEntries(PH.list.map(p => [p.id, p])); PH.ready = PH.list.length > 0;
    const n = PH.ready ? registerReal() : 0; if (announce) document.dispatchEvent(new CustomEvent('chitra:templates', { detail: { real: n } })); return n;
  }

  /* ---------------- live catalog: built in THIS browser from the photo search you already use (your keys / proxy) ---------------- */
  const LIVE_TOPICS = [['coffee', 'coffee cup cafe'], ['food', 'gourmet food plate'], ['pizza', 'pizza'], ['burger', 'burger'], ['dessert', 'dessert cake'], ['healthy', 'healthy salad bowl'], ['drinks', 'cocktail drinks'], ['tea', 'tea cup'], ['fitness', 'fitness workout gym'], ['yoga', 'yoga meditation'], ['spa', 'spa wellness'], ['travel', 'travel adventure landscape'], ['beach', 'tropical beach'], ['mountains', 'mountain landscape'], ['city', 'city skyline night'], ['market', 'street market'], ['nature', 'nature forest'], ['flowers', 'flowers bouquet'], ['plants', 'green plants'], ['party', 'party celebration confetti'], ['birthday', 'birthday cake balloons'], ['wedding', 'wedding'], ['love', 'romantic couple'], ['baby', 'baby'], ['kids', 'children playing'], ['christmas', 'christmas decoration'], ['winter', 'winter snow'], ['festival', 'festival colorful'], ['lights', 'bokeh lights'], ['halloween', 'halloween pumpkin'], ['music', 'music instrument'], ['concert', 'concert crowd stage'], ['art', 'art painting colorful'], ['books', 'books library'], ['education', 'classroom learning'], ['tech', 'technology laptop'], ['office', 'modern office workspace'], ['business', 'business meeting'], ['team', 'team collaboration'], ['fashion', 'fashion clothing'], ['beauty', 'beauty cosmetics'], ['interior', 'interior design living room'], ['home', 'cozy home'], ['pets', 'pet portrait'], ['dog', 'dog'], ['cat', 'cat'], ['cars', 'car'], ['sports', 'sports action'], ['sunrise', 'sunrise sky'], ['sunset', 'sunset sky'], ['abstract', 'abstract colorful background'], ['texture', 'texture pattern'], ['shopping', 'shopping bags']];
  const QP = new URLSearchParams(location.search); if (QP.get('livetopics')) LIVE_TOPICS.length = Math.min(LIVE_TOPICS.length, +QP.get('livetopics')); // test hook
  const MUST = {}; // topic key -> regex its photos must match (checked against the photo's own title/tags)
  async function loadTopics() {
    try { const r = await fetch('data/photo-topics.json'); if (r.ok) { const j = await r.json(); const list = j.topics.map(t => [t.k, t.q]); j.topics.forEach(t => { MUST[t.k] = t.must ? new RegExp(t.must, 'i') : null; }); LIVE_TOPICS.length = 0; LIVE_TOPICS.push(...list); } } catch { }
    if (QP.get('livetopics')) LIVE_TOPICS.length = Math.min(LIVE_TOPICS.length, +QP.get('livetopics')); live.total = LIVE_TOPICS.length;
  }
  const LIB_VERSION = 3; // bump when the matching rules change: older libraries (built without the relevance filter) are rebuilt
  const DAY = 864e5, live = { running: false, done: 0, total: LIVE_TOPICS.length };
  const siteTag = s => ({ Pixabay: 'px', Pexels: 'pe', Unsplash: 'un', Openverse: 'ov' }[s] || 'lv');
  const liveHave = () => { const c = C.stock?.config?.() || {}; return !!(c.proxy || c.pixabay || c.pexels || c.unsplash); };
  function chipUi() {
    let el = document.getElementById('libChip'); if (!el) { el = Object.assign(document.createElement('button'), { id: 'libChip', className: 'lib-chip', hidden: true }); document.body.appendChild(el); }
    return el;
  }
  C.buildPhotoLibrary = async ({ force = false } = {}) => {
    if (live.running) return 0;
    let saved = await C.kv.get('livecat').catch(() => null); if (saved && saved.ver !== LIB_VERSION) saved = null; // old library: rebuild with the strict relevance filter
    await loadTopics(); const have = saved?.photos?.length > 150;
    if (have && !PH.ready) setCatalog(saved.photos); // the cached library works instantly and offline, with or without keys
    if (have && !force && saved.complete !== false && Date.now() - saved.t < 7 * DAY) return PH.list.length;
    if (C.vault?.state() === 'locked' && !(await C.vault.tryRemembered())) { // keys are locked: offer to unlock (never prompt uninvited)
      const chip = chipUi(); chip.hidden = false; chip.disabled = false; chip.innerHTML = 'Unlock your photo keys to refresh the template photos'; chip.onclick = async () => { chip.hidden = true; if (await C.vault.ensure()) C.buildPhotoLibrary({ force }); }; return have ? PH.list.length : 0;
    }
    if (!liveHave()) return have ? PH.list.length : 0;
    live.running = true; const resume = !force && saved && saved.complete === false ? saved.idx || 0 : 0; live.done = resume; const chip = chipUi(); chip.onclick = null; const all = [], seen = new Set(saved?.photos?.map(p => p.id) || []); if (saved?.photos) all.push(...saved.photos);
    chip.hidden = false; chip.disabled = true;
    try {
      for (const [topic, q] of LIVE_TOPICS.slice(resume)) {
        chip.innerHTML = `<i></i><span>Building your photo library ${live.done}/${live.total}</span>`;
        try {
          const must = MUST[topic], txt = it => `${it.tags || ''} ${it.title || ''}`.toLowerCase();
          // strict relevance: for a specific topic the photo's own tags/title must mention it (no tags = rejected), so "pizza" never gets a cake
          const r = await C.stock.search(q, { page: 1, kind: 'photo' }), items = (r.items || []).filter(it => it.full && it.thumb && !seen.has(it.id) && (!must || must.test(txt(it)))).slice(0, 10);
          items.forEach(it => { seen.add(it.id); const w = it.w || 1600, h = it.h || 1000; all.push({ id: it.id, s: 'lv', site: it.site, t: it.thumb, f: it.full, dl: it.site === 'Unsplash' ? it.dl : undefined, w, h, o: w > h * 1.15 ? 'l' : h > w * 1.15 ? 'p' : 's', c: '#8a8fa3', by: it.by || it.site, l: it.site === 'Unsplash' ? `${it.link}?utm_source=chitra_studio&utm_medium=referral` : it.link, g: txt(it).slice(0, 140), k: [topic] });
          });
        } catch (e) { if (live.done === 0 && /401|403|429/.test(String(e.message))) break; }
        live.done++; if (live.done % 4 === 0) { C.kv.set('livecat', { ver: LIB_VERSION, t: Date.now(), photos: all.slice(-900), idx: live.done, complete: false }).catch(() => { }); if (live.done % 8 === 0 && all.length > 60) setCatalog(all); } // a reload mid-way resumes instead of restarting
        await new Promise(r => setTimeout(r, QP.get('livedelay') ? +QP.get('livedelay') : 450));
      }
      if (all.length > 900) all.splice(0, all.length - 900);
      if (all.length) { await C.kv.set('livecat', { ver: LIB_VERSION, t: Date.now(), photos: all, idx: live.total, complete: true }).catch(() => { }); setCatalog(all); }
    } finally { live.running = false; chip.hidden = true; }
    return all.length;
  };
  document.addEventListener('chitra:keys', () => C.buildPhotoLibrary({ force: true }));
  C.addCommand && C.addCommand('Rebuild photo library (fresh photos)', () => C.buildPhotoLibrary({ force: true }).then(n => n && C.toast(`Photo library ready - ${n} photos`, '')));

  /* Owner: download the live library as data/photos.json so EVERY visitor gets the photographic templates.
     Only photo sources that allow hot-linking go in (Unsplash, Pexels). Pixabay's terms forbid hot-linking, so for Pixabay use tools/harvest-photos.mjs (downloads + resizes the files into the repo). */
  C.exportCatalog = async () => {
    const saved = await C.kv.get('livecat').catch(() => null); const list = (saved?.photos || []).filter(p => p.site === 'Unsplash' || p.site === 'Pexels');
    if (!list.length) return C.toast('Nothing to export yet - build the library first (needs Unsplash/Pexels keys)', '');
    const blob = new Blob([JSON.stringify({ v: 1, updated: new Date().toISOString().slice(0, 10), photos: list })], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'photos.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    C.toast(`Exported ${list.length} photos - put the file in the repo as data/photos.json`, ''); return list.length;
  };
  C.addCommand && C.addCommand('Export photo catalog (data/photos.json)', C.exportCatalog);

  C.loadCatalog = async (url = 'data/photos.json') => {
    try {
      const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) return 0; const cat = await r.json(); if (!cat?.photos?.length) return 0;
      return setCatalog(cat.photos);
    } catch { return 0; }
  };
  C.photoCatalog = PH;
  C.loadCatalog(new URLSearchParams(location.search).get('catalog') || undefined).then(n => { if (!n && !new URLSearchParams(location.search).has('nolive')) setTimeout(() => C.buildPhotoLibrary().catch(() => { }), 2500); });
})();
