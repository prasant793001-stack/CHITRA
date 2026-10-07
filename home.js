/* Chitra Studio – splash screen, Canva-style Home (projects, print layouts, templates, trending),
   editor template panel and the pricing screen. Uses window.chitra + window.CHITRA_CONFIG. */
(() => {
  const C = window.chitra, CFG = window.CHITRA_CONFIG || {};
  const { $, $$, toast, confetti } = C;
  const META = C.TEMPLATE_META;
  const CATS = [['all', 'All'], ...Object.entries(C.CAT_LABEL || {})];
  const TINT = ['#efe7ff', '#dff6ff', '#fff0d9', '#e4f9e8', '#ffe6f0', '#fff6c8', '#e8ecff'];
  const CAT_ICON = { mug: 'coffee', tshirt: 'shirt', social: 'camera', story: 'smartphone', pinterest: 'pin', poster: 'image', flyer: 'newspaper', invite: 'gift', card: 'credit-card', cert: 'award', menu: 'utensils', youtube: 'video', slides: 'presentation', wallpaper: 'monitor', merch: 'shopping-bag', sticker: 'sticker' };
  const plan = () => { try { return localStorage.getItem('chitra.plan') || 'free'; } catch { return 'free'; } };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };

  /* ================= template thumbnails (lazy, cached, one at a time) ================= */
  const cache = {}; let chain = C.fontsReady;
  /* flat design -> realistic product photo (mug / tee / tumbler ...) so the grid looks like a store, not clip-art */
  async function mockThumb(flatUrl, meta, seed) {
    const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = flatUrl; }); if (!img) return flatUrl;
    let art = document.createElement('canvas'); art.width = img.width; art.height = img.height; art.getContext('2d').drawImage(img, 0, 0);
    { // trim transparent margins so the print fills the product like a real order would
      const s = document.createElement('canvas'), N = 96; s.width = s.height = N; const g = s.getContext('2d', { willReadFrequently: true }); g.drawImage(art, 0, 0, N, N); const d = g.getImageData(0, 0, N, N).data; let x0 = N, y0 = N, x1 = -1, y1 = -1;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (d[(y * N + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 > x0 && y1 > y0 && meta.mockKind === 'shirt') { const pad = 2, sx = Math.max(0, x0 - pad) / N * img.width, sy = Math.max(0, y0 - pad) / N * img.height, sw = Math.min(N, x1 - x0 + 1 + 2 * pad) / N * img.width, sh = Math.min(N, y1 - y0 + 1 + 2 * pad) / N * img.height; const c2 = document.createElement('canvas'); c2.width = Math.round(sw); c2.height = Math.round(sh); c2.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c2.width, c2.height); art = c2; }
    }
    let lum = 0, wsum = 0; { const s = document.createElement('canvas'); s.width = s.height = 32; const g = s.getContext('2d', { willReadFrequently: true }); g.drawImage(art, 0, 0, 32, 32); const d = g.getImageData(0, 0, 32, 32).data; for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; lum += a * (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; wsum += a; } }
    const mean = wsum > 3 ? lum / wsum : 0.3, dark = mean > 0.62, color = meta.mockKind === 'shirt' ? (dark ? '#23283d' : ['#ffffff', '#f1ece3', '#dfe9f5', '#f6e3e3'][seed % 4]) : (dark ? '#23283d' : '#ffffff');
    let opts = {};
    if (meta.mockKind === 'mug' || meta.mockKind === 'tumbler') { // keep the whole headline visible: real wraps leave white sides
      const wide = document.createElement('canvas'); wide.width = Math.round(art.width * 1.38); wide.height = art.height; wide.getContext('2d').drawImage(art, (wide.width - art.width) / 2, 0); opts = { arc: 3.25, ratio: art.height / art.width * 1.0 }; art = wide;
    }
    const m = C.mockRender(meta.mockKind, art, color, 1 + (seed % 3), opts), out = document.createElement('canvas'); out.width = out.height = 420; out.getContext('2d').drawImage(m, 0, 0, 420, 420); return out.toDataURL('image/jpeg', 0.82);
  }
  function thumbFor(name) {
    if (cache[name]) return Promise.resolve(cache[name]);
    chain = chain.then(async () => {
      if (cache[name]) return; const meta = META[name], key = `tpl:${C.TPL_VERSION}:${name}`;
      if (meta.gen) { try { const hit = await C.kv.get(key); if (hit) { cache[name] = hit; return; } } catch { } }
      const ok = await C.ensureTpl(name, 'thumb'); await new Promise(r => setTimeout(r, 0));
      C.__photoKind = 'thumb'; let url; try { url = C.renderTemplateThumb(name, C.productByName(meta.p), meta.mockKind ? 900 : 340); } finally { C.__photoKind = null; }
      if (url && meta.mockKind) url = await mockThumb(url, meta, name.length + name.charCodeAt(name.length - 1));
      cache[name] = url;
      if (!ok) { const u = cache[name]; setTimeout(() => { if (cache[name] === u) delete cache[name]; }, 0); return; } // never cache a fallback render
      if (meta.gen && cache[name]) C.kv.set(key, cache[name]).catch(() => { });
    });
    return chain.then(() => cache[name]);
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); const im = e.target; thumbFor(im.dataset.tpl).then(u => { if (u) { im.src = u; im.classList.add('ready'); } }); } }), { rootMargin: '400px' }) : null;
  function fillThumbs(root) { $$('img[data-tpl]:not(.ready)', root).forEach(im => io ? io.observe(im) : thumbFor(im.dataset.tpl).then(u => { if (u) { im.src = u; im.classList.add('ready'); } })); }
  const ratio = n => { if (META[n].mockKind) return '1.000'; const p = C.productByName(META[n].p); return (p.w / p.h).toFixed(3); };
  /* paged grid: renders 48 cards, "Show more" adds the next batch (keeps 2,000 templates fast) */
  function pagedGrid(el, names, card, bind, step = 48) {
    let shown = 0; el.innerHTML = '';
    const more = document.createElement('button'); more.className = 'btn show-more';
    const next = () => { const slice = names.slice(shown, shown + step); shown += slice.length; const tmp = document.createElement('div'); tmp.innerHTML = slice.map(card).join(''); const frag = document.createDocumentFragment(); [...tmp.children].forEach(c => frag.appendChild(c)); el.insertBefore(frag, more); bind(el); more.hidden = shown >= names.length; more.textContent = `Show more (${names.length - shown} left)`; };
    more.onclick = next; el.appendChild(more); if (!names.length) el.insertBefore(Object.assign(document.createElement('p'), { className: 'tip', textContent: 'No templates match — try another word.' }), more); next();
  }

  /* ================= pro gating + pricing ================= */
  function guardPro(meta) { if (CFG.gating && meta?.pro && plan() === 'free') { openPricing(); return false; } return true; }
  function openPricing() {
    const cur = plan(), sym = CFG.currency || '$';
    $('#planGrid').innerHTML = (CFG.plans || []).map(p => `<div class="plan${p.id === 'pro' ? ' hot' : ''}${p.id === cur ? ' cur' : ''}">
      ${p.badge ? `<em>${esc(p.badge)}</em>` : ''}<h3>${esc(p.name)}</h3><p class="blurb">${esc(p.blurb || '')}</p>
      <div class="price"><b>${p.price ? sym + p.price : 'Free'}</b><span>${p.price ? '/ ' + esc(p.per) : esc(p.per)}</span></div>
      <ul>${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <button class="${p.id === 'pro' ? 'cta' : 'btn'} wide" data-plan="${p.id}">${p.id === cur ? 'Your plan' : p.price ? 'Choose ' + esc(p.name) : 'Use Free'}</button></div>`).join('');
    $('#planNote').textContent = CFG.checkoutUrl ? 'Secure checkout opens in a new tab.' : 'Payments are not connected yet — "Choose" saves a local preview of the plan so you can see how it will feel.';
    $$('#planGrid [data-plan]').forEach(b => b.onclick = () => {
      const id = b.dataset.plan;
      if (C.cloud?.enabled && id !== 'free') { C.cloud.checkout(id); return; }
      if (CFG.checkoutUrl && id !== 'free') { window.open(`${CFG.checkoutUrl}${CFG.checkoutUrl.includes('?') ? '&' : '?'}plan=${id}`, '_blank', 'noopener'); return; }
      try { localStorage.setItem('chitra.plan', id); } catch { } toast(`${id === 'free' ? 'Free' : id === 'pro' ? 'Pro' : 'Business'} plan preview on`, '💎'); confetti(); openPricing();
    });
    $('#pricing').hidden = false;
  }
  ['hmPricing', 'hmNavPro', 'hmPromoBtn', 'proBtn'].forEach(id => $('#' + id).onclick = openPricing);

  /* ================= creating designs ================= */
  async function fromTemplate(name) {
    const m = META[name]; if (!guardPro(m)) return;
    await C.ensureTpl(name, 'full');
    await C.newDocument({ product: C.productByName(m.p), template: name, name: m.n }); confetti(innerWidth / 2, innerHeight / 3, 70);
  }
  const QUICK = [['file-text', 'A4 page', 'A4'], ['image', 'A3 poster', 'A3'], ['coffee', 'Mug wrap', '11 oz mug wrap'], ['shirt', 'T-shirt', 'T-shirt front'], ['cup-soda', 'Tumbler', '20 oz tumbler'], ['camera', 'Instagram', 'Instagram post'], ['smartphone', 'Story', 'Story / Reel / TikTok'], ['credit-card', 'Business card', 'Business card'], ['presentation', 'Presentation', 'Presentation 16:9']];
  function renderQuick() {
    $('#hmQuick').innerHTML = QUICK.map(([i, n, p]) => `<button data-q="${esc(p)}"><i>${C.ico(i, 22)}</i><span>${n}</span></button>`).join('') +
      `<button data-q="@sheet"><i>${C.ico('printer', 22)}</i><span>Print sheet</span></button><button data-q="@custom"><i>${C.ico('ruler', 22)}</i><span>Custom size</span></button>`;
    $$('#hmQuick [data-q]').forEach(b => b.onclick = async () => {
      const q = b.dataset.q;
      if (q === '@custom') { C.openPicker('create'); $('#customSize').click(); }
      else if (q === '@sheet') { const d = C.LAYOUTS.find(l => l.id === 'mug-a4-3'); await C.useBuiltin(d, true); $('#rail [data-tab=layouts]').click(); }
      else await C.newDocument({ product: C.productByName(q), template: 'blank' });
    });
  }
  $('#hmCreate').onclick = () => C.openPicker('create');
  $('#hmMakeLayout').onclick = async () => { await C.newDocument({ product: C.productByName('A4'), template: 'blank', name: 'My print layout' }); const b = $('#rail [data-tab=layouts]'); if (!b.classList.contains('on')) b.click(); };
  $('#homeBtn').onclick = () => C.showHome();

  /* ================= Home sections ================= */
  function projCard(m) {
    const thumb = m.thumb ? `<img src="${m.thumb}" alt="">` : `<span class="ph">${C.ico('palette', 28)}</span>`;
    return `<article class="pcard2" data-open="${m.id}"><div class="thumb chk">${thumb}</div><div class="meta"><b>${esc(m.name)}</b><small>${esc(m.product || '')}${m.pages > 1 ? ` · ${m.pages} pages` : ''} · ${ago(m.updated)}</small></div><button class="dots" data-menu="${m.id}" title="More">⋯</button></article>`;
  }
  async function renderRecent() {
    const l = await C.store.list(), row = $('#hmRecent');
    row.innerHTML = l.length ? l.map(projCard).join('') : `<div class="empty-card"><span>${C.ico('palette', 30)}</span><b>No designs yet</b><small>Pick a template below or hit “Create a design”.</small></div>`;
    $$('#hmRecent [data-open]').forEach(a => a.onclick = e => { if (e.target.closest('[data-menu]')) return; C.openProject(a.dataset.open); });
    $$('#hmRecent [data-menu]').forEach(b => b.onclick = e => { e.stopPropagation(); cardMenu(b, b.dataset.menu); });
  }
  function cardMenu(btn, id) {
    $('.cardmenu')?.remove(); const m = document.createElement('div'); m.className = 'cardmenu glass';
    m.innerHTML = `<button data-a="open">${C.ico('folder-open', 15)} Open</button><button data-a="rename">${C.ico('pencil', 15)} Rename</button><button data-a="dup">${C.ico('copy', 15)} Duplicate</button><button data-a="del" class="danger">${C.ico('trash-2', 15)} Delete</button>`;
    document.body.appendChild(m); const r = btn.getBoundingClientRect(); m.style.top = r.bottom + 4 + 'px'; m.style.left = Math.min(r.left, innerWidth - 170) + 'px';
    m.onclick = async e => {
      const a = e.target.dataset.a; if (!a) return; m.remove();
      if (a === 'open') C.openProject(id);
      if (a === 'rename') { const cur = (await C.store.list()).find(x => x.id === id); const n = prompt('Rename design', cur?.name || ''); if (n) { await C.store.rename(id, n); renderRecent(); } }
      if (a === 'dup') { await C.store.duplicate(id); toast('Design duplicated', '⧉'); renderRecent(); }
      if (a === 'del' && confirm('Delete this design? This cannot be undone.')) { await C.store.remove(id); renderRecent(); }
    };
  }
  document.addEventListener('click', e => { if (!e.target.closest('.cardmenu') && !e.target.closest('[data-menu]')) $('.cardmenu')?.remove(); });

  async function renderLayoutRow() {
    const mine = await C.listMine();
    const b = C.LAYOUTS.map(l => `<article class="lcard" data-b="${l.id}"><div class="thumb"><img src="${C.layoutThumb(l, 240)}" alt=""></div><div class="meta"><b>${esc(l.name)}</b><small>${l.slots.length} print area${l.slots.length > 1 ? 's' : ''} · ${l.sheet}</small></div>${l.hot ? '<em class="tagc">Popular</em>' : ''}</article>`).join('');
    const m = mine.map(x => `<article class="lcard mine" data-m="${x.id}"><div class="thumb">${x.thumb ? `<img src="${x.thumb}" alt="">` : `<span class="ph">${C.ico('printer', 28)}</span>`}</div><div class="meta"><b>${esc(x.name)}</b><small>Saved by you · ${x.areas || 0} area${x.areas === 1 ? '' : 's'}</small></div><em class="tagc you">Mine</em></article>`).join('');
    $('#hmLayoutRow').innerHTML = m + b;
    $$('#hmLayoutRow [data-b]').forEach(a => a.onclick = () => C.useBuiltin(C.LAYOUTS.find(l => l.id === a.dataset.b), true));
    $$('#hmLayoutRow [data-m]').forEach(a => a.onclick = () => C.useMine(a.dataset.m, true));
  }

  let tplCat = 'all';
  const tplCard = (name, big) => { const m = META[name]; return `<article class="tcard${big ? ' big' : ''}" data-t="${name}"><div class="thumb chk" style="aspect-ratio:${ratio(name)}"><img data-tpl="${name}" alt="${esc(m.n)}"></div>${m.pro ? `<em class="crown">${C.ico('crown', 12)} Pro</em>` : ''}<div class="meta"><b>${esc(m.n)}</b><small>${esc(m.p)}</small></div></article>`; };
  function renderTemplates() {
    $('#hmTplTabs').innerHTML = CATS.map(([k, n]) => `<button class="chip${k === tplCat ? ' on' : ''}" data-c="${k}">${n}</button>`).join('');
    $$('#hmTplTabs [data-c]').forEach(b => b.onclick = () => { tplCat = b.dataset.c; renderTemplates(); });
    const counts = {}; Object.values(META).forEach(m => { counts[m.cat] = (counts[m.cat] || 0) + 1; });
    $('#hmCatTiles').innerHTML = Object.entries(C.CAT_LABEL).map(([k, n], i) => `<button class="cat-tile" data-ct="${k}" style="--tint:${TINT[i % TINT.length]}"><b>${n}</b><small>${counts[k] || 0} designs</small><span>${C.ico(CAT_ICON[k] || 'layout-template', 34)}</span></button>`).join('');
    $$('#hmCatTiles [data-ct]').forEach(b => b.onclick = () => { tplCat = b.dataset.ct; renderTemplates(); $('#hmTemplates').scrollIntoView({ behavior: 'smooth' }); });
    const names = C.listTemplates({ cat: tplCat });
    pagedGrid($('#hmTplGrid'), names, n => tplCard(n), bindTpl);
  }
  function bindTpl(root) { fillThumbs(root); $$('[data-t]', root).forEach(a => a.onclick = () => fromTemplate(a.dataset.t)); }
  async function renderTrending() {
    let items = []; try { const r = await fetch(CFG.communityFeed || 'community.json', { cache: 'no-cache' }); items = (await r.json()).items || []; } catch { }
    if (!items.length) items = C.listTemplates().slice(0, 10).map(t => ({ template: t, title: META[t].n, by: 'Chitra team', tag: META[t].cat }));
    items = items.filter(i => META[i.template]);
    $('#hmTrendRow').innerHTML = items.map(i => `<article class="tcard big" data-t="${i.template}"><div class="thumb chk"><img data-tpl="${i.template}" alt=""></div><em class="fire">${C.ico('flame', 12)} Trending</em><div class="meta"><b>${esc(i.title || META[i.template].n)}</b><small>by ${esc(i.by || 'Chitra team')} · ${esc(i.tag || '')}</small></div></article>`).join('');
    bindTpl($('#hmTrendRow'));
  }

  /* ---- search ---- */
  async function search(q) {
    q = q.trim().toLowerCase(); const res = $('#hmResults'), sec = $('#hmSections');
    if (!q) { res.hidden = true; sec.hidden = false; return; }
    const prods = C.PRODUCTS.filter(p => `${p.name} ${p.g} ${C.dim(p)}`.toLowerCase().includes(q));
    const tpls = C.listTemplates({ q });
    const mine = (await C.store.list()).filter(m => m.name.toLowerCase().includes(q));
    const lays = C.LAYOUTS.filter(l => l.name.toLowerCase().includes(q));
    res.innerHTML = `<h2>Results for “${esc(q)}”</h2>
      ${prods.length ? `<h4>Sizes & products</h4><div class="chips big">${prods.slice(0, 14).map((p, i) => `<button class="chip" data-p="${C.PRODUCTS.indexOf(p)}">${C.ico(C.prodIconName(p), 14)} ${esc(p.name)} <small>${esc(C.dim(p))}</small></button>`).join('')}</div>` : ''}
      ${lays.length ? `<h4>Print layouts</h4><div class="hrow">${lays.map(l => `<article class="lcard" data-b="${l.id}"><div class="thumb"><img src="${C.layoutThumb(l, 220)}" alt=""></div><div class="meta"><b>${esc(l.name)}</b></div></article>`).join('')}</div>` : ''}
      ${tpls.length ? `<h4>Templates <small>${tpls.length} found</small></h4><div class="tpl-grid" id="hmResTpl"></div>` : ''}
      ${mine.length ? `<h4>Your designs</h4><div class="hrow">${mine.map(projCard).join('')}</div>` : ''}
      ${!(prods.length || tpls.length || mine.length || lays.length) ? `<div class="empty-card"><span>${C.ico('search', 30)}</span><b>Nothing found</b><small>Try “mug”, “A4”, “poster” or “Instagram”.</small></div>` : ''}`;
    res.hidden = false; sec.hidden = true; if (tpls.length) pagedGrid($('#hmResTpl'), tpls, n => tplCard(n), bindTpl); bindTpl(res);
    $$('#hmResults [data-p]').forEach(b => b.onclick = () => C.newDocument({ product: C.PRODUCTS[+b.dataset.p], template: 'blank' }));
    $$('#hmResults [data-b]').forEach(a => a.onclick = () => C.useBuiltin(C.LAYOUTS.find(l => l.id === a.dataset.b), true));
    $$('#hmResults [data-open]').forEach(a => a.onclick = () => C.openProject(a.dataset.open));
  }
  $('#hmSearch').addEventListener('input', e => { $('#heroInput').value = e.target.value; search(e.target.value); });
  $('#heroForm').onsubmit = e => { e.preventDefault(); $('#hmSearch').value = $('#heroInput').value; search($('#heroInput').value); };
  $('#heroInput').addEventListener('input', e => { $('#hmSearch').value = e.target.value; search(e.target.value); });

  /* ---- left nav ---- */
  $$('#hmNav [data-go]').forEach(b => b.onclick = () => {
    $('#hmSearch').value = ''; $('#heroInput').value = ''; search('');
    const el = document.getElementById(b.dataset.go); el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $$('#hmNav button').forEach(x => x.classList.toggle('on', x === b));
  });

  async function refreshHome() { renderRecent(); renderLayoutRow(); }
  document.addEventListener('chitra:templates', () => { if (!$('#home').hidden) { renderTemplates(); renderTrending(); } renderEditorTemplates(); });
  document.addEventListener('chitra:home', refreshHome); document.addEventListener('chitra:layouts', renderLayoutRow);

  /* ================= editor "Design" panel ================= */
  let edCat = 'all';
  let edQ = '';
  function renderEditorTemplates() {
    if (!$('#tplSearch')) { const i = document.createElement('input'); i.id = 'tplSearch'; i.type = 'search'; i.placeholder = 'Search templates…'; i.className = 'panel-search'; $('#tplTabs').before(i); i.oninput = () => { edQ = i.value.trim().toLowerCase(); renderEditorTemplates(); }; }
    $('#tplTabs').innerHTML = CATS.map(([k, n]) => `<button class="chip${k === edCat ? ' on' : ''}" data-ec="${k}">${n}</button>`).join('');
    $$('#tplTabs [data-ec]').forEach(b => b.onclick = () => { edCat = b.dataset.ec; renderEditorTemplates(); });
    const names = C.listTemplates({ cat: edCat, q: edQ });
    pagedGrid($('#tplGrid'), names, n => `<button class="tcard2" data-et="${n}"><div class="thumb chk" style="aspect-ratio:${ratio(n)}"><img data-tpl="${n}" alt=""></div>${META[n].pro ? `<em class="crown">${C.ico('crown', 12)}</em>` : ''}<b>${esc(META[n].n)}</b></button>`, el => { fillThumbs(el); $$('[data-et]', el).forEach(b => b.onclick = () => applyTemplate(b.dataset.et)); }, 30);
  }
  async function applyTemplate(name) {
    const m = META[name]; if (!guardPro(m)) return;
    await C.ensureTpl(name, 'full');
    const p = C.productByName(m.p);
    if (C.canvas.getObjects().filter(o => !o.slot).length && !confirm('Replace your current design with this template?')) return;
    if ((p.w !== C.W || p.h !== C.H) && confirm(`“${m.n}” is made for ${p.name} (${C.dim(p)}). Resize this page to match?`)) { C.canvas.discardActiveObject(); C.setSize(p.w, p.h, false, p.guide, p.dpi, p); }
    C.loadTemplate(name);
  }

  /* ================= splash → Home ================= */
  function enterHome() {
    $('#home').hidden = false; document.body.classList.add('on-home'); renderQuick(); refreshHome(); renderTemplates(); renderTrending(); renderEditorTemplates();
  }
  function splash() {
    const sp = $('#splash'); let seen = false; try { seen = !!sessionStorage.getItem('chitra.splash'); } catch { }
    if (seen || new URLSearchParams(location.search).has('nosplash')) { sp.remove(); enterHome(); return; }
    let n = 3, done = false; const count = $('#spCount'), bar = $('#spBar');
    requestAnimationFrame(() => { bar.style.width = '100%'; });
    const finish = () => { if (done) return; done = true; clearInterval(t); try { sessionStorage.setItem('chitra.splash', '1'); } catch { } sp.classList.add('out'); enterHome(); setTimeout(() => sp.remove(), 600); };
    const t = setInterval(() => { n--; if (n <= 0) return finish(); count.textContent = n; count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop'); }, 800);
    sp.onclick = finish;
  }
  splash();
  Object.assign(C, { fromTemplate, openPricing, applyTemplate });
})();
