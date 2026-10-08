/* Chitra Studio – built-in graphics library. ~25 hand-built vector designs x 6 colour-ways = 150 high-quality, gradient-filled, fully editable graphics
   that work offline (no stock service needed). Each is generated as clean SVG and dropped on the canvas as a normal grouped object. */
(() => {
  const C = window.chitra; if (!C) return;
  const { $, $$ } = C, u = () => C.kit.u();
  const PAL = [['#7c3aed', '#f472b6', '#fde68a'], ['#0ea5e9', '#22d3ee', '#fef08a'], ['#f97316', '#ef4444', '#fde68a'], ['#10b981', '#84cc16', '#fef9c3'], ['#1f2937', '#f59e0b', '#fde68a'], ['#ec4899', '#8b5cf6', '#bfdbfe']];
  const rng = seed => { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
  const f = n => +n.toFixed(1); let gn = 0; const gid = () => 'cg' + (++gn);
  const lin = (id, a, b, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const smooth = pts => { const n = pts.length; let d = `M${f(pts[0][0])},${f(pts[0][1])}`; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`; } return d + 'Z'; };
  const poly = pts => pts.map(p => `${f(p[0])},${f(p[1])}`).join(' ');
  const star = (cx, cy, R, r, n) => Array.from({ length: n * 2 }, (_, i) => { const a = (i * Math.PI) / n - Math.PI / 2, rad = i % 2 ? r : R; return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]; });
  const sparkle = (cx, cy, s, fill) => `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0,-80 Q0,0 80,0 Q0,0 0,80 Q0,0 -80,0 Q0,0 0,-80Z" fill="${fill}"/>`;

  /* generators: (palette, rng) -> { vb:[w,h], body, tags, pack } */
  const G = [
    ['Blob', 'Shapes', 'blob organic shape abstract', (p, r) => { const id = gid(), pts = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * 6.283, d = 58 + r() * 34; return [100 + Math.cos(a) * d, 100 + Math.sin(a) * d]; }); return { vb: [200, 200], body: `<defs>${lin(id, p[0], p[1])}</defs><path d="${smooth(pts)}" fill="url(#${id})"/>` }; }],
    ['Waves', 'Shapes', 'wave water sea divider abstract', (p, r) => { const ph = r() * 3; const L = [0, 1, 2].map(l => { let d = 'M0,160 L0,' + (70 + l * 26); for (let x = 0; x <= 400; x += 10) d += ` L${x},${f(70 + l * 26 + Math.sin((x / 400) * 6.283 * (1 + l * 0.5) + l * 1.3 + ph) * 15)}`; return `<path d="${d} L400,160Z" fill="${p[l]}" opacity="${1 - l * 0.18}"/>`; }); return { vb: [400, 160], body: L.join('') }; }],
    ['Half rings', 'Shapes', 'rainbow arc rings circle boho', p => ({ vb: [200, 110], body: [0, 1, 2, 0, 1].map((k, i) => `<path d="M${10 + i * 15},105 A${90 - i * 15},${90 - i * 15} 0 0 1 ${190 - i * 15},105" fill="none" stroke="${p[k]}" stroke-width="12" stroke-linecap="round"/>`).join('') })],
    ['Sunburst', 'Shapes', 'sun rays burst retro', (p) => { const id = gid(); return { vb: [200, 200], body: `<defs>${lin(id, p[2], p[1])}</defs>${Array.from({ length: 14 }, (_, i) => `<line x1="100" y1="100" x2="${f(100 + Math.cos(i * 0.4488) * 95)}" y2="${f(100 + Math.sin(i * 0.4488) * 95)}" stroke="${p[0]}" stroke-width="7" stroke-linecap="round" opacity=".85"/>`).join('')}<circle cx="100" cy="100" r="46" fill="url(#${id})"/>` }; }],
    ['Starburst badge', 'Badges', 'badge sale label starburst seal', (p) => { const id = gid(); return { vb: [200, 200], body: `<defs>${lin(id, p[0], p[1])}</defs><polygon points="${poly(star(100, 100, 96, 82, 22))}" fill="url(#${id})"/><circle cx="100" cy="100" r="66" fill="none" stroke="${p[2]}" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/><polygon points="${poly(star(100, 100, 30, 12, 5))}" fill="${p[2]}"/>` }; }],
    ['Scallop seal', 'Badges', 'badge seal stamp quality guarantee', (p) => { const id = gid(); return { vb: [200, 200], body: `<defs>${lin(id, p[0], p[1])}</defs><g fill="url(#${id})">${Array.from({ length: 18 }, (_, i) => `<circle cx="${f(100 + Math.cos(i * 0.349) * 78)}" cy="${f(100 + Math.sin(i * 0.349) * 78)}" r="17"/>`).join('')}<circle cx="100" cy="100" r="78"/></g><circle cx="100" cy="100" r="62" fill="none" stroke="${p[2]}" stroke-width="3"/><circle cx="100" cy="100" r="54" fill="none" stroke="${p[2]}" stroke-width="1.5" opacity=".7"/>` }; }],
    ['Ribbon banner', 'Badges', 'banner ribbon title label', (p) => { const id = gid(); return { vb: [400, 140], body: `<defs>${lin(id, p[0], p[1], 0, 0, 0, 1)}</defs><path d="M0,40 L80,40 L80,112 L0,112 L26,76Z" fill="${p[1]}"/><path d="M400,40 L320,40 L320,112 L400,112 L374,76Z" fill="${p[1]}"/><path d="M70,112 L90,112 L90,128 Z" fill="#000" opacity=".25"/><path d="M330,112 L310,112 L310,128 Z" fill="#000" opacity=".25"/><rect x="62" y="22" width="276" height="90" rx="6" fill="url(#${id})"/><rect x="72" y="32" width="256" height="70" rx="3" fill="none" stroke="${p[2]}" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round"/>` }; }],
    ['Speech bubble', 'Badges', 'speech bubble chat comment quote', (p) => ({ vb: [200, 170], body: `<rect x="21" y="21" width="170" height="115" rx="30" fill="${p[1]}"/><path d="M62,128 L52,164 L100,132Z" fill="${p[1]}"/><rect x="15" y="15" width="170" height="115" rx="30" fill="${p[0]}"/><path d="M56,122 L46,158 L94,126Z" fill="${p[0]}"/><circle cx="62" cy="72" r="9" fill="${p[2]}"/><circle cx="100" cy="72" r="9" fill="${p[2]}"/><circle cx="138" cy="72" r="9" fill="${p[2]}"/>` })],
    ['Arch frame', 'Frames', 'frame arch border wedding boho', (p) => ({ vb: [200, 260], body: `<path d="M20,250 L20,110 A80,80 0 0 1 180,110 L180,250Z" fill="none" stroke="${p[0]}" stroke-width="6"/><path d="M34,236 L34,112 A66,66 0 0 1 166,112 L166,236Z" fill="none" stroke="${p[1]}" stroke-width="2"/><circle cx="100" cy="22" r="5" fill="${p[2]}"/><circle cx="82" cy="30" r="3" fill="${p[1]}"/><circle cx="118" cy="30" r="3" fill="${p[1]}"/>` })],
    ['Double frame', 'Frames', 'frame border rounded double', (p) => ({ vb: [220, 180], body: `<rect x="8" y="8" width="204" height="164" rx="22" fill="none" stroke="${p[0]}" stroke-width="6"/><rect x="22" y="22" width="176" height="136" rx="12" fill="none" stroke="${p[1]}" stroke-width="2"/>${[[22, 22], [198, 22], [22, 158], [198, 158]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${p[2]}" stroke="${p[0]}" stroke-width="2"/>`).join('')}` })],
    ['Corner brackets', 'Frames', 'frame corners brackets viewfinder', (p) => ({ vb: [220, 180], body: [[10, 10, 1, 1], [210, 10, -1, 1], [10, 170, 1, -1], [210, 170, -1, -1]].map(([x, y, sx, sy]) => `<path d="M${x},${y + 46 * sy} L${x},${y} L${x + 46 * sx},${y}" fill="none" stroke="${p[0]}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x + 12 * sx},${y + 34 * sy} L${x + 12 * sx},${y + 12 * sy} L${x + 34 * sx},${y + 12 * sy}" fill="none" stroke="${p[1]}" stroke-width="2.5" stroke-linecap="round"/>`).join('') })],
    ['Laurel wreath', 'Frames', 'wreath laurel award leaves circle', (p) => ({ vb: [200, 200], body: Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * 6.283 + 0.2; if (a > 5.2 && a < 6.0) return ''; const x = 100 + Math.cos(a) * 74, y = 100 + Math.sin(a) * 74, rot = (a * 180) / Math.PI + 90 + (i % 2 ? 28 : -28); return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="15" ry="6" transform="rotate(${f(rot)} ${f(x)} ${f(y)})" fill="${p[i % 2]}"/>`; }).join('') + `<circle cx="100" cy="100" r="74" fill="none" stroke="${p[1]}" stroke-width="1.5" opacity=".5"/>` })],
    ['Flower', 'Nature', 'flower floral bloom petals daisy', (p) => { const id = gid(); return { vb: [200, 200], body: `<defs>${lin(id, p[0], p[1], 0, 0, 0, 1)}</defs>${Array.from({ length: 8 }, (_, i) => `<ellipse cx="100" cy="52" rx="19" ry="44" transform="rotate(${i * 45} 100 100)" fill="url(#${id})"/>`).join('')}${Array.from({ length: 8 }, (_, i) => `<ellipse cx="100" cy="70" rx="11" ry="26" transform="rotate(${i * 45 + 22.5} 100 100)" fill="${p[1]}" opacity=".55"/>`).join('')}<circle cx="100" cy="100" r="22" fill="${p[2]}"/><circle cx="100" cy="100" r="22" fill="none" stroke="${p[0]}" stroke-width="3" opacity=".4"/>` }; }],
    ['Leaf sprig', 'Nature', 'leaf branch sprig botanical plant olive', (p) => ({ vb: [130, 250], body: `<path d="M65,244 Q52,140 66,10" fill="none" stroke="${p[0]}" stroke-width="4" stroke-linecap="round"/>${Array.from({ length: 8 }, (_, i) => { const y = 222 - i * 26, s = i % 2 ? 1 : -1, x = 62 + s * 24 + (i % 3), rot = -s * 32; return `<ellipse cx="${x}" cy="${y}" rx="${24 - i * 1.4}" ry="9" transform="rotate(${rot} ${x} ${y})" fill="${p[i % 2]}"/>`; }).join('')}<ellipse cx="66" cy="14" rx="7" ry="16" fill="${p[1]}"/>` })],
    ['Rainbow cloud', 'Nature', 'cloud sky weather cute', (p) => ({ vb: [220, 150], body: `<g fill="${p[2]}" opacity=".95"><circle cx="70" cy="95" r="40"/><circle cx="115" cy="75" r="50"/><circle cx="160" cy="98" r="38"/><rect x="70" y="95" width="90" height="43" rx="21"/></g><path d="M62,128 A48,48 0 0 1 158,128" fill="none" stroke="${p[0]}" stroke-width="7" stroke-linecap="round"/><path d="M72,128 A38,38 0 0 1 148,128" fill="none" stroke="${p[1]}" stroke-width="7" stroke-linecap="round"/>` })],
    ['Sparkles', 'Decor', 'sparkle star shine glitter twinkle', (p) => { const id = gid(); return { vb: [200, 200], body: `<defs>${lin(id, p[0], p[1])}</defs>${sparkle(100, 100, 1.05, `url(#${id})`)}${sparkle(160, 40, 0.38, p[2])}${sparkle(40, 154, 0.3, p[1])}` }; }],
    ['Confetti', 'Decor', 'confetti party celebrate burst', (p, r) => ({ vb: [200, 200], body: Array.from({ length: 46 }, (_, i) => { const x = r() * 190 + 5, y = r() * 190 + 5, c = p[i % 3], rot = Math.floor(r() * 360), t = i % 3; return t === 0 ? `<rect x="${f(x)}" y="${f(y)}" width="9" height="${f(4 + r() * 8)}" rx="2" fill="${c}" transform="rotate(${rot} ${f(x)} ${f(y)})"/>` : t === 1 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 3)}" fill="${c}"/>` : `<polygon points="${f(x)},${f(y - 6)} ${f(x + 6)},${f(y + 5)} ${f(x - 6)},${f(y + 5)}" fill="${c}" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`; }).join('') })],
    ['Halftone', 'Decor', 'halftone dots pattern gradient texture', (p) => ({ vb: [200, 200], body: Array.from({ length: 100 }, (_, i) => { const x = i % 10, y = (i / 10) | 0, k = 1 - (x + y) / 18; return `<circle cx="${10 + x * 20}" cy="${10 + y * 20}" r="${f(Math.max(0.6, 9 * k))}" fill="${p[0]}"/>`; }).join('') })],
    ['Memphis set', 'Decor', 'memphis squiggle zigzag retro 80s shapes', (p) => ({ vb: [220, 200], body: `<path d="M20,40 q10,-18 20,0 t20,0 t20,0 t20,0" fill="none" stroke="${p[0]}" stroke-width="7" stroke-linecap="round"/><polygon points="150,20 190,20 170,56" fill="none" stroke="${p[1]}" stroke-width="6" stroke-linejoin="round"/><path d="M24,150 a34,34 0 0 1 68,0Z" fill="${p[1]}"/><g stroke="${p[2]}" stroke-width="7" stroke-linecap="round"><line x1="150" y1="130" x2="150" y2="166"/><line x1="132" y1="148" x2="168" y2="148"/></g><circle cx="190" cy="100" r="10" fill="${p[0]}"/><circle cx="110" cy="100" r="6" fill="${p[2]}"/><path d="M104,40 l16,0 l-8,-16Z" fill="${p[0]}"/>` })],
    ['Brush stroke', 'Decor', 'brush paint stroke highlight swoosh', (p) => { const id = gid(); return { vb: [400, 100], body: `<defs>${lin(id, p[0], p[1], 0, 0, 1, 0)}</defs><path d="M8,58 Q70,22 170,44 T392,36 L394,56 Q320,84 200,64 T10,74Z" fill="url(#${id})"/><path d="M40,62 Q120,50 200,60" fill="none" stroke="#fff" stroke-width="2" opacity=".25" stroke-linecap="round"/>` }; }],
    ['Curved arrow', 'Arrows', 'arrow curve doodle pointer direction', (p) => ({ vb: [200, 180], body: `<path d="M26,150 C50,50 130,24 164,78" fill="none" stroke="${p[0]}" stroke-width="8" stroke-linecap="round"/><path d="M144,56 L172,84 L134,94" fill="none" stroke="${p[0]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="152" r="7" fill="${p[1]}"/>` })],
    ['Heart', 'Shapes', 'heart love valentine', (p) => { const id = gid(); return { vb: [200, 190], body: `<defs>${lin(id, p[1], p[0], 0, 0, 1, 1)}</defs><path d="M100,178 C14,118 24,34 78,34 C92,34 100,46 100,52 C100,46 108,34 122,34 C176,34 186,118 100,178Z" fill="url(#${id})"/><path d="M52,62 Q58,46 74,46" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".5"/>` }; }],
    ['Star', 'Shapes', 'star rating favourite award', (p) => { const id = gid(); return { vb: [200, 200], body: `<defs>${lin(id, p[2], p[1], 0, 0, 1, 1)}</defs><polygon points="${poly(star(100, 104, 92, 40, 5))}" fill="url(#${id})" stroke="${p[0]}" stroke-width="5" stroke-linejoin="round"/>` }; }],
    ['Lightning', 'Shapes', 'lightning bolt energy power flash', (p) => { const id = gid(); return { vb: [160, 200], body: `<defs>${lin(id, p[2], p[1], 0, 0, 0, 1)}</defs><polygon points="96,6 22,112 78,112 58,194 140,76 84,76" fill="url(#${id})" stroke="${p[0]}" stroke-width="5" stroke-linejoin="round"/>` }; }],
    ['Crown', 'Shapes', 'crown king queen royal luxury', (p) => { const id = gid(); return { vb: [200, 150], body: `<defs>${lin(id, p[2], p[1], 0, 0, 0, 1)}</defs><path d="M20,128 L10,40 L58,84 L100,20 L142,84 L190,40 L180,128Z" fill="url(#${id})" stroke="${p[0]}" stroke-width="5" stroke-linejoin="round"/><rect x="20" y="128" width="160" height="14" rx="5" fill="${p[0]}"/><circle cx="100" cy="30" r="7" fill="${p[0]}"/><circle cx="12" cy="42" r="6" fill="${p[0]}"/><circle cx="188" cy="42" r="6" fill="${p[0]}"/>` }; }],
    ['Divider', 'Decor', 'divider line ornament separator flourish', (p) => ({ vb: [400, 40], body: `<line x1="10" y1="20" x2="170" y2="20" stroke="${p[0]}" stroke-width="3" stroke-linecap="round"/><line x1="230" y1="20" x2="390" y2="20" stroke="${p[0]}" stroke-width="3" stroke-linecap="round"/><polygon points="${poly(star(200, 20, 16, 6, 4))}" fill="${p[1]}"/><circle cx="178" cy="20" r="3.5" fill="${p[2]}" stroke="${p[0]}" stroke-width="1.5"/><circle cx="222" cy="20" r="3.5" fill="${p[2]}" stroke="${p[0]}" stroke-width="1.5"/>` })],
    ['Location pin', 'Badges', 'pin map location marker place', (p) => { const id = gid(); return { vb: [140, 200], body: `<defs>${lin(id, p[1], p[0], 0, 0, 0, 1)}</defs><ellipse cx="70" cy="186" rx="30" ry="7" fill="#000" opacity=".15"/><path d="M70,176 C20,112 12,92 12,68 A58,58 0 0 1 128,68 C128,92 120,112 70,176Z" fill="url(#${id})"/><circle cx="70" cy="68" r="22" fill="${p[2]}"/>` }; }],
    ['Price tag', 'Badges', 'price tag sale discount label offer', (p) => ({ vb: [200, 140], body: `<path d="M16,70 L66,16 H178 Q190,16 190,28 V112 Q190,124 178,124 H66Z" fill="${p[0]}"/><circle cx="62" cy="70" r="11" fill="#fff"/><rect x="92" y="50" width="76" height="9" rx="4.5" fill="${p[2]}"/><rect x="92" y="72" width="54" height="9" rx="4.5" fill="${p[1]}"/>` })],
  ];
  const PACKS = ['All', ...[...new Set(G.map(g => g[1]))]];
  const ALL = []; G.forEach(([name, pack, tags, fn], gi) => PAL.forEach((p, pi) => { ALL.push({ id: `${gi}-${pi}`, name, pack, tags: `${name} ${pack} ${tags}`.toLowerCase(), gi, pi, p, seed: gi * 7 + pi + 1, fn }); }));
  const build = it => { const r = it.fn(it.p, rng(it.seed)); return { ...r, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.vb[0]} ${r.vb[1]}" width="${r.vb[0]}" height="${r.vb[1]}">${r.body}</svg>` }; };
  const thumbs = new Map(); const svgOf = it => thumbs.get(it.id) || (thumbs.set(it.id, build(it)), thumbs.get(it.id));

  function add(it) {
    const { svg, vb } = build(it); // fresh gradient ids for every placed copy
    window.fabric.loadSVGFromString(svg, (objs, opts) => {
      const g = window.fabric.util.groupSVGElements(objs, opts), s = (u() * (vb[0] > vb[1] ? 0.55 : 0.4)) / Math.max(vb[0], vb[1]);
      g.set({ scaleX: s, scaleY: s });
      C.place(g); C.commit();
    });
  }

  const builtinView = (view, fallback) => {
    let pack = 'All', q = '', shown = 60;
    const draw = () => {
      const list = ALL.filter(it => (pack === 'All' || it.pack === pack) && (!q || it.tags.includes(q)));
      view.innerHTML = `<div class="gx-tabs"><button data-m="p">Premium</button><button class="on">Shapes &amp; decor</button></div><div class="chips" id="gxChips">${PACKS.map(n => `<button class="chip${n === pack ? ' on' : ''}" data-p="${n}">${n}</button>`).join('')}</div>
        <div class="gfx-grid">${list.slice(0, shown).map(it => `<button class="gfx-card" data-id="${it.id}" title="${it.name}">${svgOf(it).svg.replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"')}</button>`).join('')}</div>
        ${list.length > shown ? '<button class="btn wide" id="gxMore" style="margin-top:10px">Show more</button>' : ''}${list.length ? '' : '<p class="tip">No built-in graphics match.</p>'}
        <button class="btn wide" id="gxOnline" style="margin-top:12px">${C.ico('search', 15)} Search millions more online</button><p class="tip">Click to add. Select a graphic to recolour it.</p>`;
      $$('.gx-tabs [data-m=p]', view).forEach(b => b.onclick = () => C.graphicsView(view, fallback));
      $$('#gxChips [data-p]', view).forEach(b => b.onclick = () => { pack = b.dataset.p; shown = 60; draw(); });
      $$('.gfx-card', view).forEach(b => b.onclick = () => add(ALL.find(x => x.id === b.dataset.id)));
      $('#gxMore', view) && ($('#gxMore', view).onclick = () => { shown += 60; draw(); });
      $('#gxOnline', view).onclick = () => fallback();
    };
    draw(); const hook = v => { q = v.trim().toLowerCase(); shown = 60; draw(); }; C.__gxHook = hook; return hook;
  };
  C.GRAPHICS_COUNT = ALL.length;
  C.GRAPHIC_NAMES = G.map(g => g[0]);
  C.graphicSvg = (name, pal) => { const g = G.find(x => x[0] === name); if (!g) return null; const r = g[3](pal && pal.length >= 3 ? pal : PAL[0], rng(7)); return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.vb[0]} ${r.vb[1]}" width="${r.vb[0]}" height="${r.vb[1]}">${r.body}</svg>`, vb: r.vb }; }; // used by hand-made template specs

  /* ---- Premium colour graphics: Microsoft Fluent Emoji 3D/flat (MIT), Google Noto (Apache-2.0), Circle Flags (MIT), Flat Color Icons (MIT), served by the free Iconify API ---- */
  const API = 'https://api.iconify.design', SETS = { graphics: 'fluent-emoji,fluent-emoji-flat,noto,flat-color-icons', stickers: 'fluent-emoji,noto,fluent-emoji-flat', flags: 'circle-flags,noto' };
  const CHIPS = { graphics: ['Food', 'Animals', 'Heart', 'Party', 'Travel', 'Nature', 'Sports', 'Music', 'Tech', 'Business', 'Weather', 'Flag', 'Fire', 'Star', 'Gift', 'Flower', 'Camera', 'Rocket', 'Crown', 'Sparkles'], stickers: ['Smile', 'Love', 'Party', 'Pizza', 'Coffee', 'Cat', 'Dog', 'Sun', 'Fire', 'Trophy', 'Gift', 'Cake', 'Balloon', 'Sparkles', 'Rainbow', 'Thumbs up'] };
  C.premiumView = (view, kind, builtin) => {
    let q = '', start = 0, token = 0, sets = SETS[kind] || SETS.graphics, flags = false;
    const draw = () => {
      view.innerHTML = `<div class="gx-tabs"><button class="on" data-m="p">Premium</button>${builtin ? '<button data-m="b">Shapes &amp; decor</button>' : ''}</div><div class="chips" id="pxChips">${(CHIPS[kind] || CHIPS.graphics).map(c => `<button class="chip" data-q="${c}">${c}</button>`).join('')}<button class="chip" data-q="@flags">🏳️ Flags</button></div>
        <div class="gfx-grid" id="pxGrid"></div><button id="pxMore" class="btn wide" hidden style="margin-top:10px">Load more</button><p class="tip" id="pxNote"></p>
        <p class="tip" style="font-size:11px">Colour graphics: Microsoft Fluent Emoji (MIT), Google Noto (Apache-2.0), Circle Flags &amp; Flat Color Icons (MIT), via Iconify.</p>`;
      $$('.gx-tabs [data-m=b]', view).forEach(b => b.onclick = () => builtin());
      $$('#pxChips [data-q]', view).forEach(b => b.onclick = () => { flags = b.dataset.q === '@flags'; q = flags ? 'flag' : b.dataset.q; $('#elSearch').value = flags ? '' : q; $$('#pxChips .chip', view).forEach(x => x.classList.toggle('on', x === b)); run(true); });
      $('#pxMore', view).onclick = () => run(false);
    };
    async function run(reset) {
      const grid = $('#pxGrid', view), more = $('#pxMore', view), note = $('#pxNote', view), my = ++token;
      if (reset) { start = 0; grid.innerHTML = '<p class="tip" style="grid-column:1/-1">Searching…</p>'; more.hidden = true; note.textContent = ''; }
      try {
        const r = await fetch(`${API}/search?query=${encodeURIComponent(q || 'sparkles')}&limit=60&start=${start}&prefixes=${flags ? SETS.flags : sets}`); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (my !== token) return;
        if (reset) grid.innerHTML = ''; const icons = (j.icons || []);
        if (!icons.length && reset) grid.innerHTML = '<p class="tip" style="grid-column:1/-1">No results. Try another word.</p>';
        icons.forEach(id => { const [pre, name] = id.split(':'), b = document.createElement('button'); b.className = 'gfx-card'; b.title = name.replace(/-/g, ' '); b.innerHTML = `<img loading="lazy" alt="" src="${API}/${pre}/${name}.svg?height=96">`; b.onclick = () => addPremium(pre, name); grid.appendChild(b); });
        start += icons.length; more.hidden = start >= (j.total || 0);
      } catch (e) { console.warn(e); if (my === token && reset) { grid.innerHTML = `<div class="empty-card retry"><b>Couldn't load graphics</b><small>${navigator.onLine ? 'The graphics service did not answer.' : 'You are offline — the built-in set still works.'}</small><button class="btn" id="pxRetry">Try again</button></div>`; $('#pxRetry', view).onclick = () => run(true); } }
    }
    draw(); q = (CHIPS[kind] || CHIPS.graphics)[0]; $('#pxChips .chip', view)?.classList.add('on'); run(true);
    const hook = v => { flags = false; q = v.trim() || q; run(true); }; C.__gxHook = hook; return v => C.__gxHook(v);
  };
  async function addPremium(pre, name) {
    try {
      const svg = await (await fetch(`${API}/${pre}/${name}.svg?height=512`)).text();
      window.fabric.loadSVGFromString(svg, (objs, opts) => { const g = window.fabric.util.groupSVGElements(objs, opts), s = (u() * 0.32) / Math.max(g.width || 512, g.height || 512); g.set({ scaleX: s, scaleY: s }); C.place(g); C.commit(); });
    } catch { C.toast('Could not load that graphic — check your connection', '⚠️'); }
  }
  C.graphicsView = (view, fallback) => C.premiumView(view, 'graphics', () => builtinView(view, fallback));

})();
