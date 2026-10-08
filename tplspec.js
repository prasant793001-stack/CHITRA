/* Chitra Studio – TEMPLATE SPEC renderer. Hand-art-directed templates are plain JSON (data/templates/*.json, listed in data/templates/index.json):
   one LAYOUT x several colour/font VARIANTS. Anyone (or any AI agent using .claude/skills/template-builder) can add templates without touching code.
   Format reference: docs/TEMPLATE-SPEC.md.  Coordinates are fractions of the page (x,y,w,h of W/H); sizes ("size","sw","r") are fractions of the SHORT side. */
(() => {
  const C = window.chitra; if (!C || !C.TEMPLATES) return;
  const K = C.kit, META = C.TEMPLATE_META, TEMPLATES = C.TEMPLATES, fab = window.fabric;

  const resolve = (v, th) => (typeof v === 'string' && v[0] === '$' ? (th[v.slice(1)] ?? '#000000') : v);
  const fillOf = (f, th, w, h) => { f = resolve(f, th); if (f && typeof f === 'object' && f.grad) { const ang = ((f.angle ?? 90) * Math.PI) / 180, dx = Math.sin(ang), dy = -Math.cos(ang); return new fab.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: w / 2 - (dx * w) / 2, y1: h / 2 - (dy * h) / 2, x2: w / 2 + (dx * w) / 2, y2: h / 2 + (dy * h) / 2 }, colorStops: f.grad.map((c, i, a) => ({ offset: a.length === 1 ? 0 : i / (a.length - 1), color: resolve(c, th) })) }); } return f || 'transparent'; };
  const shadowOf = (s, th, k) => (s ? new fab.Shadow({ color: resolve(s.color ?? 'rgba(0,0,0,.25)', th), blur: (s.blur ?? 0.02) * k, offsetX: (s.x ?? 0) * k, offsetY: (s.y ?? 0.01) * k }) : undefined);
  const common = (L, th, W, H, k, extra = {}) => ({ opacity: L.opacity ?? 1, angle: L.rot || 0, shadow: shadowOf(L.shadow, th, k), globalCompositeOperation: L.blend || 'source-over', ...extra });

  function build(spec, th, fonts) {
    const W = K.W, H = K.H, k = Math.min(W, H), B = K.B, add = o => (B.add(o), o), fam = f => { f = resolve(f, th); return f === 'd' || f == null ? fonts[0] : f === 'b' ? fonts[1] : f; };
    const bg0 = spec.bg === 'transparent' ? '' : resolve(spec.bg ?? '$bg', th); K.clearAll(typeof bg0 === 'string' ? bg0 : th.bg);
    if (spec.bg && typeof spec.bg === 'object') { const r = new fab.Rect({ left: 0, top: 0, width: W, height: H, fill: fillOf(spec.bg, th, W, H), selectable: true }); add(r); }
    (spec.layers || []).forEach(L => {
      const x = (L.x ?? 0) * W, y = (L.y ?? 0) * H, w = (L.w ?? 0) * W, h = (L.h ?? 0) * H, c = rest => ({ left: x, top: y, ...common(L, th, W, H, k), ...rest });
      switch (L.t) {
        case 'rect': add(new fab.Rect(c({ width: L.full ? W : w, height: L.full ? H : h, ...(L.full ? { left: 0, top: 0 } : {}), fill: fillOf(L.fill, th, w, h), rx: (L.rx || 0) * k, ry: (L.rx || 0) * k, stroke: L.stroke ? resolve(L.stroke, th) : undefined, strokeWidth: (L.sw || 0) * k, strokeUniform: true }))); break;
        case 'ellipse': add(new fab.Ellipse(c({ rx: w / 2, ry: h / 2, fill: fillOf(L.fill, th, w, h), stroke: L.stroke ? resolve(L.stroke, th) : undefined, strokeWidth: (L.sw || 0) * k, strokeUniform: true }))); break;
        case 'line': add(new fab.Line([(L.x1 ?? 0) * W, (L.y1 ?? 0) * H, (L.x2 ?? 1) * W, (L.y2 ?? 0) * H], { ...common(L, th, W, H, k), stroke: resolve(L.stroke ?? '$ink', th), strokeWidth: (L.sw ?? 0.004) * k, strokeLineCap: 'round', strokeDashArray: L.dash ? L.dash.map(d => d * k) : undefined })); break;
        case 'poly': add(new fab.Polygon((L.pts || []).map(([px, py]) => ({ x: px * W, y: py * H })), { ...common(L, th, W, H, k), fill: fillOf(L.fill, th, w, h), stroke: L.stroke ? resolve(L.stroke, th) : undefined, strokeWidth: (L.sw || 0) * k, strokeLineJoin: 'round' })); break;
        case 'star': { const n = L.n || 5, R = (L.r ?? 0.1) * k, r = R * (L.inner ?? 0.45), pts = Array.from({ length: n * 2 }, (_, i) => { const a = (i * Math.PI) / n - Math.PI / 2, rad = i % 2 ? r : R; return { x: Math.cos(a) * rad, y: Math.sin(a) * rad }; }); add(new fab.Polygon(pts, { ...common(L, th, W, H, k), left: x, top: y, originX: 'center', originY: 'center', fill: fillOf(L.fill, th, R * 2, R * 2), stroke: L.stroke ? resolve(L.stroke, th) : undefined, strokeWidth: (L.sw || 0) * k, strokeLineJoin: 'round' })); break; }
        case 'text': {
          let size = (L.size ?? 0.06) * k, txt = String(L.text ?? ''); if (L.upper) txt = txt.toUpperCase();
          const mk = s => new fab.Textbox(txt, { ...c({}), left: L.anchor === 'c' ? x - w / 2 : x, width: w || W * 0.8, fontSize: s, fontFamily: fam(L.font), fontWeight: L.weight || (fam(L.font) === fonts[0] ? 700 : 400), fontStyle: L.italic ? 'italic' : 'normal', fill: fillOf(L.fill ?? '$ink', th, w, h), textAlign: L.align || 'left', lineHeight: L.lh ?? 1.12, charSpacing: (L.ls || 0) * 1000, stroke: L.stroke ? resolve(L.stroke, th) : undefined, strokeWidth: (L.sw || 0) * k, paintFirst: L.stroke ? 'stroke' : 'fill', strokeLineJoin: 'round', underline: !!L.underline });
          let t = mk(size); if (L.h) { for (let i = 0; i < 14 && t.height > L.h * H && size > k * 0.012; i++) { size *= 0.92; t = mk(size); } } // keep long words inside their box, whatever font loads
          add(t); break;
        }
        case 'graphic': { const svg = C.graphicSvg && C.graphicSvg(L.name, (L.pal || ['$a', '$b', '$soft']).map(v => resolve(v, th))); if (!svg) break; fab.loadSVGFromString(svg.svg, (objs, o) => { const g = fab.util.groupSVGElements(objs, o), s = (w || k * 0.3) / Math.max(g.width, 1); g.set({ left: x, top: y, scaleX: s, scaleY: s, ...common(L, th, W, H, k) }); add(g); }); break; }
        case 'icon': { const inner = (window.CHITRA_ICONS || {})[L.name]; if (!inner) break; const col = resolve(L.color ?? '$ink', th), sw = L.sw ?? 2; fab.loadSVGFromString(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`, (objs, o) => { const g = fab.util.groupSVGElements(objs, o), s = ((L.size ?? 0.08) * k) / 24; g.set({ left: x, top: y, scaleX: s, scaleY: s, ...common(L, th, W, H, k) }); g.isIcon = true; add(g); }); break; }
        case 'slot': { // a place for the customer's own photo
          add(new fab.Rect(c({ width: w, height: h, fill: resolve(L.fill ?? '$soft', th), rx: (L.rx || 0) * k, ry: (L.rx || 0) * k, stroke: resolve(L.stroke ?? '$a', th), strokeWidth: (L.sw ?? 0.004) * k, strokeDashArray: [k * 0.02, k * 0.014], strokeUniform: true })));
          add(new fab.Textbox(L.label || 'Your photo', { left: x, top: y + h / 2 - k * 0.025, width: w, fontSize: k * 0.04, fontFamily: fonts[1], fontWeight: 600, fill: resolve(L.color ?? '$a', th), textAlign: 'center' })); break;
        }
        case 'mock': { if (!C.mockPicture) break; const el = C.mockPicture(L.kind || 'mug', L.scene || 'studio', resolve(L.color ?? '#ffffff', th), L.art ?? 0, th, fonts); if (!el) break; const s = Math.max(w / el.width, h / el.height), im = new fab.Image(el, { left: x + (w - el.width * s) / 2, top: y + (h - el.height * s) / 2, scaleX: s, scaleY: s, originX: 'left', originY: 'top', ...common(L, th, W, H, k) }); im.mock = { kind: L.kind || 'mug', scene: L.scene || 'studio', color: resolve(L.color ?? '#ffffff', th) }; im.clipPath = new fab.Rect({ left: x, top: y, width: w, height: h, rx: (L.rx || 0) * k, ry: (L.rx || 0) * k, absolutePositioned: true }); add(im); break; }
        default: break;
      }
    });
  }

  let loaded = 0;
  function register(spec) {
    const variants = spec.variants && spec.variants.length ? spec.variants : [{}];
    variants.forEach((v, vi) => {
      const id = `tp-${spec.id}${variants.length > 1 ? '-' + (vi + 1) : ''}`, th = { bg: '#ffffff', ink: '#111111', a: '#6d4aff', b: '#ffb703', soft: '#efeaff', alt: '#f6f3ff', ...(spec.theme || {}), ...(v.theme || {}) }, fonts = v.fonts || spec.fonts || ['Poppins', 'Inter'];
      const used = new Set(fonts); (spec.layers || []).forEach(L => { if (L.font && L.font !== 'd' && L.font !== 'b') used.add(L.font); });
      META[id] = { n: v.name ? `${spec.name} · ${v.name}` : spec.name, title: spec.name, cat: spec.cat, p: spec.product, t: `${spec.name} ${(spec.tags || []).join(' ')} ${v.name || ''} ${spec.cat}`.toLowerCase(), f: [...used], pro: spec.pro ?? vi % 4 === 3, gen: 1, hand: 1 };
      TEMPLATES[id] = () => build(spec, th, fonts); loaded++;
    });
  }
  C.registerTemplateSpec = register;

  async function loadAll() {
    try {
      const idx = await (await fetch('data/templates/index.json')).json(); const base = (window.CHITRA_CONFIG || {}).assetBase || '';
      const files = await Promise.all((idx.files || []).map(f => fetch(base + 'data/templates/' + f).then(r => r.json()).catch(() => null)));
      files.filter(Boolean).forEach(f => (f.templates || []).forEach(register));
      if (loaded) { C.TPL_VERSION = C.TPL_VERSION + 's' + loaded; document.dispatchEvent(new CustomEvent('chitra:templates', { detail: { hand: loaded } })); }
    } catch (e) { console.info('[chitra] no hand-made template files', e.message); }
  }
  C.loadTemplateSpecs = loadAll; loadAll();
})();
