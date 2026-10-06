/* Chitra Studio – font showcase (Canva-style): default text styles, font combinations, and a searchable
   library where every font name is drawn in its own typeface. Fonts are fetched on demand (Google Fonts, OFL). */
(() => {
  const C = window.chitra;
  const { $, $$, toast, canvas } = C;
  const B = true; // has a real bold (700) weight on Google Fonts
  const LIB = [
    // Sans serif
    ['Poppins', 'Sans', B], ['Montserrat', 'Sans', B], ['Open Sans', 'Sans', B], ['Roboto', 'Sans', B], ['Lato', 'Sans', B], ['Nunito', 'Sans', B], ['Raleway', 'Sans', B], ['Work Sans', 'Sans', B], ['DM Sans', 'Sans', B],
    ['Manrope', 'Sans', B], ['Rubik', 'Sans', B], ['Quicksand', 'Sans', B], ['Fredoka', 'Sans', B], ['Josefin Sans', 'Sans', B], ['Barlow', 'Sans', B], ['Oswald', 'Sans', B], ['Archivo', 'Sans', B], ['Plus Jakarta Sans', 'Sans', B],
    ['Outfit', 'Sans', B], ['Urbanist', 'Sans', B], ['Sora', 'Sans', B], ['Lexend', 'Sans', B], ['Inter', 'Sans', B], ['Karla', 'Sans', B],
    // Serif
    ['Playfair Display', 'Serif', B], ['Merriweather', 'Serif', B], ['Lora', 'Serif', B], ['Cormorant Garamond', 'Serif', B], ['DM Serif Display', 'Serif'], ['Libre Baskerville', 'Serif', B], ['Abril Fatface', 'Serif'],
    ['Bitter', 'Serif', B], ['Crimson Text', 'Serif', B], ['Cinzel', 'Serif', B], ['Spectral', 'Serif', B],
    // Display / bold
    ['Bangers', 'Display'], ['Anton', 'Display'], ['Bebas Neue', 'Display'], ['Chewy', 'Display'], ['Righteous', 'Display'], ['Alfa Slab One', 'Display'], ['Bungee', 'Display'], ['Luckiest Guy', 'Display'], ['Fugaz One', 'Display'],
    ['Titan One', 'Display'], ['Rammetto One', 'Display'], ['Black Ops One', 'Display'], ['Monoton', 'Display'], ['Shrikhand', 'Display'], ['Passion One', 'Display'], ['Archivo Black', 'Display'], ['Paytone One', 'Display'],
    ['Bowlby One', 'Display'], ['Lilita One', 'Display'], ['Russo One', 'Display'],
    // Script
    ['Pacifico', 'Script'], ['Lobster', 'Script'], ['Dancing Script', 'Script', B], ['Satisfy', 'Script'], ['Great Vibes', 'Script'], ['Sacramento', 'Script'], ['Kaushan Script', 'Script'], ['Yellowtail', 'Script'],
    ['Courgette', 'Script'], ['Cookie', 'Script'], ['Lobster Two', 'Script', B], ['Allura', 'Script'], ['Parisienne', 'Script'], ['Marck Script', 'Script'], ['Tangerine', 'Script', B], ['Pinyon Script', 'Script'],
    // Handwriting
    ['Caveat', 'Handwriting', B], ['Permanent Marker', 'Handwriting'], ['Patrick Hand', 'Handwriting'], ['Indie Flower', 'Handwriting'], ['Shadows Into Light', 'Handwriting'], ['Amatic SC', 'Handwriting', B],
    ['Rock Salt', 'Handwriting'], ['Gloria Hallelujah', 'Handwriting'], ['Covered By Your Grace', 'Handwriting'], ['Reenie Beanie', 'Handwriting'], ['Nanum Pen Script', 'Handwriting'],
    // Mono
    ['Space Mono', 'Mono', B], ['Roboto Mono', 'Mono', B], ['Courier Prime', 'Mono', B], ['JetBrains Mono', 'Mono', B],
    // Arabic
    ['Cairo', 'Arabic', B], ['Tajawal', 'Arabic', B], ['Almarai', 'Arabic', B], ['Amiri', 'Arabic', B], ['Reem Kufi', 'Arabic'], ['Lalezar', 'Arabic'], ['Changa', 'Arabic', B], ['El Messiri', 'Arabic', B], ['Aref Ruqaa', 'Arabic', B],
    // Hindi / Devanagari
    ['Hind', 'Hindi', B], ['Mukta', 'Hindi', B], ['Tiro Devanagari Hindi', 'Hindi'], ['Yatra One', 'Hindi'], ['Rozha One', 'Hindi'], ['Baloo 2', 'Hindi', B], ['Teko', 'Hindi', B], ['Khand', 'Hindi', B], ['Kalam', 'Hindi', B],
  ];
  const CATS = ['All', 'Sans', 'Serif', 'Display', 'Script', 'Handwriting', 'Mono', 'Arabic', 'Hindi'];
  const CAT_TITLE = { Sans: 'Sans serif', Serif: 'Serif', Display: 'Display & bold', Script: 'Script', Handwriting: 'Handwriting', Mono: 'Monospace', Arabic: 'Arabic · العربية', Hindi: 'Hindi · हिन्दी' };
  const byName = Object.fromEntries(LIB.map(f => [f[0], f]));

  /* ---------- loading (one stylesheet per font, so a single bad name can never break the rest) ---------- */
  const injected = new Set();
  function loadCss(name) {
    if (injected.has(name)) return; injected.add(name);
    const f = byName[name], l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}${f && f[2] ? ':wght@400;700' : ''}&display=swap`; document.head.appendChild(l);
  }
  async function loadFont(name) { loadCss(name); try { await Promise.race([document.fonts.load(`40px "${name}"`), new Promise(r => setTimeout(r, 4000))]); } catch { } }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { loadCss(e.target.dataset.font); io.unobserve(e.target); } }), { rootMargin: '300px' }) : null;

  /* ---------- applying a font ---------- */
  const textTargets = () => C.canvas.getActiveObjects().filter(o => C.isText(o) || C.isArch(o));
  async function pickFont(name, cb) {
    await loadFont(name);
    const ts = textTargets();
    if (ts.length) {
      ts.forEach(o => { if (C.isArch(o)) C.setProp(o, 'fontFamily', name); else { o.set('fontFamily', name); o.initDimensions?.(); o.dirty = true; } });
      fabric.util.clearFabricFontCache(name); canvas.requestRenderAll(); C.commit(); C.refreshProps(); toast(`Font: ${name}`, '');
    } else { const o = C.addText('heading', { fontFamily: name }); o.set('text', name); canvas.requestRenderAll(); }
    recent(name); cb?.(name);
  }
  const recents = () => { try { return JSON.parse(localStorage.getItem('chitra.fonts') || '[]'); } catch { return []; } };
  const recent = n => { try { localStorage.setItem('chitra.fonts', JSON.stringify([n, ...recents().filter(x => x !== n)].slice(0, 6))); } catch { } };

  /* ---------- list rendering ---------- */
  function renderList(box, { q = '', cat = 'All', current = '', onPick }) {
    q = q.trim().toLowerCase(); box.innerHTML = '';
    const frag = document.createDocumentFragment(); let last = '';
    const rec = !q && cat === 'All' ? recents().filter(n => byName[n]) : [];
    const rows = [...rec.map(n => ['@recent', byName[n]]), ...LIB.filter(f => (cat === 'All' || f[1] === cat) && (!q || f[0].toLowerCase().includes(q) || f[1].toLowerCase().includes(q))).map(f => [f[1], f])];
    rows.forEach(([g, f]) => {
      const title = g === '@recent' ? 'Recently used' : CAT_TITLE[g];
      if (!q && title !== last) { const h = document.createElement('div'); h.className = 'font-cat'; h.textContent = title; frag.appendChild(h); last = title; }
      const r = document.createElement('div'); r.className = 'font-row' + (f[0] === current ? ' on' : ''); r.dataset.font = f[0]; r.setAttribute('role', 'button');
      const isAr = f[1] === 'Arabic', isHi = f[1] === 'Hindi';
      r.innerHTML = `<span class="fn" style="font-family:'${f[0]}',sans-serif">${isAr ? 'أهلاً بكم · ' : isHi ? 'नमस्ते · ' : ''}${f[0]}</span><small>${f[1]}</small>`;
      r.onclick = () => onPick(f[0]); frag.appendChild(r); io ? io.observe(r) : loadCss(f[0]);
    });
    if (!frag.childNodes.length) box.innerHTML = '<p class="tip" style="padding:14px">No fonts match. Try “bold”, “script” or a name.</p>'; else box.appendChild(frag);
  }

  /* ---------- Text panel ---------- */
  let cat = 'All', q = '';
  const drawPanel = () => renderList($('#fontList'), { q, cat, current: currentFont, onPick: n => pickFont(n) });
  $('#fontCats').innerHTML = CATS.map(c => `<button class="chip${c === 'All' ? ' on' : ''}" data-fc="${c}">${c}</button>`).join('');
  $$('#fontCats [data-fc]').forEach(b => b.onclick = () => { cat = b.dataset.fc; $$('#fontCats .chip').forEach(x => x.classList.toggle('on', x === b)); drawPanel(); });
  $('#fontSearch').addEventListener('input', e => { q = e.target.value; $('#textHome').hidden = !!q; drawPanel(); });

  /* ---------- default styles + combinations ---------- */
  const DEFAULT_FONT = 'Fredoka';
  const COMBOS = [
    { h: 'Playfair Display', s: 'Lato', bg: '#fff4cc', fg: '#3a2800', t: ['Elegant Day', 'save the date'] }, { h: 'Anton', s: 'Open Sans', bg: '#ff7a1a', fg: '#fff', t: ['BOLD MOVE', 'make some noise'] },
    { h: 'Pacifico', s: 'Quicksand', bg: '#dff7ea', fg: '#0f5c38', t: ['Hello Summer', 'sunny days ahead'] }, { h: 'Bebas Neue', s: 'Montserrat', bg: '#1d2433', fg: '#ffc42e', t: ['FRESH & NEW', 'now in store'] },
    { h: 'DM Serif Display', s: 'DM Sans', bg: '#fff', fg: '#1d2433', t: ['Modern Classic', 'timeless style'] }, { h: 'Lobster', s: 'Poppins', bg: '#fff0e0', fg: '#b34700', t: ['Coffee Time', 'fresh every morning'] },
    { h: 'Abril Fatface', s: 'Nunito', bg: '#f1ffe0', fg: '#3f6b00', t: ['Grand Sale', 'up to 50% off'] }, { h: 'Amatic SC', s: 'Raleway', bg: '#fffaf0', fg: '#1d2433', t: ['handmade', 'with love & care'] },
    { h: 'Righteous', s: 'Work Sans', bg: '#ffc42e', fg: '#1d2433', t: ['GAME NIGHT', 'bring your crew'] }, { h: 'Lalezar', s: 'Cairo', bg: '#e4f6f3', fg: '#0b5f56', t: ['أهلاً وسهلاً', 'نورتونا في متجرنا'] },
    { h: 'Yatra One', s: 'Hind', bg: '#fff0e0', fg: '#8a2c00', t: ['नमस्ते', 'आपका स्वागत है'] }, { h: 'Shrikhand', s: 'Karla', bg: '#fde8ec', fg: '#b3173c', t: ['Sweet Treats', 'baked fresh daily'] },
  ];
  $('#comboGrid').innerHTML = COMBOS.map((c, i) => `<button class="combo" data-combo="${i}" style="background:${c.bg};color:${c.fg}"><span class="c-h" style="font-family:'${c.h}'">${c.t[0]}</span><span class="c-s" style="font-family:'${c.s}'">${c.t[1]}</span></button>`).join('');
  COMBOS.forEach(c => { loadCss(c.h); loadCss(c.s); });
  $$('#comboGrid [data-combo]').forEach(b => b.onclick = async () => {
    const c = COMBOS[b.dataset.combo]; await Promise.all([loadFont(c.h), loadFont(c.s)]);
    const k = C.u(), mk = (t, size, fam, y, extra = {}) => { const o = new fabric.Textbox(t, { width: C.W * 0.78, fontSize: size, fontFamily: fam, fill: c.bg === '#fff' || c.bg === '#fffaf0' || c.bg === '#fff4cc' ? '#1d2433' : c.bg === '#ff7a1a' ? '#1d2433' : c.fg, textAlign: 'center', originX: 'center', originY: 'center', left: C.W / 2, top: C.H * y, ...extra }); canvas.add(o); return o; };
    C.history.busy = true; const h = mk(c.t[0], k * 0.12, c.h, 0.42, { fontWeight: 'normal' }); const s2 = mk(c.t[1], k * 0.05, c.s, 0.56); C.history.busy = false;
    canvas.setActiveObject(h); canvas.requestRenderAll(); C.commit(); C.refreshProps(); if (window.matchMedia('(max-width:800px)').matches) $('#flyout').classList.add('collapsed'); void s2;
  });
  $$('.td').forEach(b => { b.style.fontFamily = `'${DEFAULT_FONT}',sans-serif`; });

  /* ---------- picker (opened from the inspector's font button) ---------- */
  let currentFont = DEFAULT_FONT, fpCat = 'All', fpQ = '';
  const drawPicker = () => renderList($('#fpList'), { q: fpQ, cat: fpCat, current: currentFont, onPick: n => { pickFont(n, () => { $('#fontPicker').hidden = true; }); } });
  $('#fpCats').innerHTML = CATS.map(c => `<button class="chip${c === 'All' ? ' on' : ''}" data-pc="${c}">${c}</button>`).join('');
  $$('#fpCats [data-pc]').forEach(b => b.onclick = () => { fpCat = b.dataset.pc; $$('#fpCats .chip').forEach(x => x.classList.toggle('on', x === b)); drawPicker(); });
  $('#fpSearch').addEventListener('input', e => { fpQ = e.target.value; drawPicker(); });
  $('#fontBtn').onclick = () => { fpQ = ''; $('#fpSearch').value = ''; $('#fontPicker').hidden = false; drawPicker(); $('#fpList').scrollTop = 0; };

  /* ---------- keep the inspector's font button in sync with the selection ---------- */
  const fontUI = {
    sync(name) { currentFont = name; const el = $('#fontBtnName'); if (el) { el.textContent = name; el.style.fontFamily = `'${name}',sans-serif`; } loadCss(name); },
  };
  C.fontUI = fontUI; Object.assign(C, { pickFont, FONT_LIB: LIB });
  drawPanel();
})();
