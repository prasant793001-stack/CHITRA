const cx = async (p, id) => p.evaluate(id => { const o = chitra.canvas.getObjects().find(x => x.__t === id); return o && o.getCenterPoint(); }, id);
const pt = (p, x, y) => p.evaluate(([x, y]) => { const c = chitra.canvas, r = c.upperCanvasEl.getBoundingClientRect(), z = c.getZoom(); return [r.left + x * z, r.top + y * z]; }, [x, y]);
module.exports = [
  { name: 'templates library size', run: async (p, ok) => { const n = await p.evaluate(() => Object.keys(chitra.TEMPLATE_META).length); ok('template library has 1000+ designs', n >= 1000, n); } },
  { name: 'home', run: async (p, ok) => { ok('home visible', await p.isVisible('#home')); ok('category tiles', await p.locator('#hmCatTiles .cat-tile').count() >= 12); } },
  { name: 'create doc + draw every template family', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('A4'), template: 'blank' })); await p.waitForTimeout(600);
    const bad = await p.evaluate(async () => { const out = []; const seen = new Set(); for (const [id, m] of Object.entries(chitra.TEMPLATE_META)) { const k = id.replace(/-\d+$/, ''); if (seen.has(k + (+id.split('-').pop() % 7))) continue; seen.add(k + (+id.split('-').pop() % 7)); await chitra.ensureTplFonts(m.f); const u = chitra.renderTemplateThumb(id, chitra.productByName(m.p), 120); if (!u || u.length < 500) out.push(id); } return out; });
    ok('sampled templates render', bad.length === 0, bad.join(',')); } },
  { name: 'text single vs double click', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => { chitra.canvas.clear(); const t = chitra.addText('heading'); t.__t = 'h'; chitra.canvas.discardActiveObject(); chitra.canvas.requestRenderAll(); });
    const c = await cx(p, 'h'); const [x, y] = await pt(p, c.x, c.y);
    await p.mouse.click(x, y); await p.waitForTimeout(250); let s = await p.evaluate(() => ({ sel: !!chitra.active(), ed: !!chitra.active()?.isEditing })); ok('single click selects only', s.sel && !s.ed);
    await p.mouse.dblclick(x, y); await p.waitForTimeout(300); ok('double click edits', await p.evaluate(() => !!chitra.active()?.isEditing)); } },
  { name: 'drag select from outside the page', only: 'desktop', run: async (p, ok) => {
    const r = await p.evaluate(() => { const c = chitra.canvas; c.clear(); [0, 1].forEach(i => c.add(new fabric.Rect({ left: 600 + i * 1000, top: 800, width: 500, height: 500, fill: '#6d4aff' }))); c.discardActiveObject(); c.requestRenderAll(); const b = c.upperCanvasEl.getBoundingClientRect(), z = c.getZoom(); return { l: b.left, t: b.top, z }; });
    await p.mouse.move(r.l - 100, r.t + 40); await p.mouse.down(); await p.mouse.move(r.l + 2000 * r.z, r.t + 1500 * r.z, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(200);
    ok('marquee selects 2 objects', await p.evaluate(() => chitra.canvas.getActiveObjects().length) === 2); } },
  { name: 'background remover (offline engine)', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.canvas.clear());
    const url = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 600; c.height = 500; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 600, 500); g.addColorStop(0, '#bcd7e8'); g.addColorStop(1, '#7fa6c4'); x.fillStyle = g; x.fillRect(0, 0, 600, 500); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(300, 290, 140, 160, 0, 0, 7); x.fill(); x.fillStyle = '#d0312d'; x.fillRect(200, 260, 200, 40); return c.toDataURL(); });
    await p.evaluate(u => new Promise(r => fabric.Image.fromURL(u, i => { i.scaleToWidth(1000); chitra.place(i); r(); })), url); await p.waitForTimeout(300);
    await p.evaluate(() => chitra.removeBg()); await p.waitForFunction(() => !document.querySelector('.busy'), null, { timeout: 20000 }).catch(() => { }); await p.waitForTimeout(2500);
    const a = await p.evaluate(() => { const o = chitra.active(), e = o.getElement(), c = document.createElement('canvas'); c.width = e.width; c.height = e.height; const x = c.getContext('2d'); x.drawImage(e, 0, 0); const g = (px, py) => x.getImageData(px * e.width / 600 | 0, py * e.height / 500 | 0, 1, 1).data[3]; return { bg: g(15, 15), body: g(300, 380), stripe: g(300, 280) }; });
    ok('background removed, subject (incl. white) kept', a.bg < 10 && a.body > 245 && a.stripe > 245, JSON.stringify(a)); } },
  { name: 'export png', only: 'desktop', run: async (p, ok) => { await p.evaluate(() => { chitra.canvas.clear(); chitra.addText('heading'); });
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.evaluate(() => chitra.exportFile('png'))]); ok('png download', /\.png$/.test(d.suggestedFilename()), d.suggestedFilename()); } },
  { name: 'print layout slots', only: 'desktop', run: async (p, ok) => { await p.evaluate(() => { const d = chitra.LAYOUTS.find(l => l.id === 'mug-a4-3'); return chitra.useBuiltin(d, true); }); await p.waitForTimeout(800); ok('3 mug slots on A4', await p.evaluate(() => chitra.slots().length) === 3); } },
  { name: 'mobile home + editor', only: 'mobile', run: async (p, ok) => { ok('no horizontal overflow on home', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('A4'), template: 'blank' })); await p.waitForTimeout(800);
    ok('no horizontal overflow in editor', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); } },
  { name: 'polish: a11y, save chip, shortcuts, tour', only: 'desktop', run: async (p, ok) => {
    ok('icon buttons have accessible names', await p.evaluate(() => [...document.querySelectorAll('#app button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length) === 0);
    ok('dialogs have role', await p.evaluate(() => [...document.querySelectorAll('.modal')].every(m => m.getAttribute('role') === 'dialog')));
    await p.evaluate(() => { localStorage.removeItem('chitra.tour'); chitra.newDocument({ product: chitra.productByName('A4'), template: 'blank' }); }); await p.waitForTimeout(2200);
    ok('first-run tour appears', await p.isVisible('.tour')); await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok('tour closes with Escape', !(await p.isVisible('.tour')));
    await p.evaluate(() => { chitra.canvas.clear(); chitra.addText('heading'); chitra.addText('body'); }); await p.waitForTimeout(2600);
    ok('save chip shows Saved', await p.evaluate(() => document.querySelector('#saveChip').dataset.s) === 'ok');
    await p.mouse.click(5, 400); await p.keyboard.press('Control+a'); ok('Ctrl+A selects all', await p.evaluate(() => chitra.canvas.getActiveObjects().length) === 2);
    await p.keyboard.press('Control+c'); await p.keyboard.press('Control+v'); await p.waitForTimeout(300); ok('Ctrl+C/V pastes', await p.evaluate(() => chitra.canvas.getObjects().length) === 4);
    await p.keyboard.press('Shift+?'); await p.waitForTimeout(200); ok('help sheet opens on ?', await p.isVisible('#helpModal')); await p.keyboard.press('Escape'); } },
  { name: 'template opens rendered (not blank)', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'ig-3' })); await p.waitForTimeout(1500);
    const px = await p.evaluate(() => { const c = chitra.canvas.lowerCanvasEl, x = c.getContext('2d'); const d = x.getImageData(c.width / 2 | 0, c.height * 0.2 | 0, 60, 60).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i]; return n; });
    ok('canvas pixels drawn after opening a template', px > 1000, px); } },
  { name: 'studio tools', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'ig-3', name: 'Resize me' })); await p.waitForTimeout(1200);
    await p.evaluate(() => chitra.resizeTo([chitra.productByName('Story / Reel / TikTok'), chitra.productByName('A4')])); await p.waitForTimeout(800);
    const metas = await p.evaluate(async () => (await chitra.store.list()).map(m => m.name + '|' + m.w + 'x' + m.h));
    ok('Magic Resize created 2 copies', metas.some(m => /Resize me · Story.*1080x1920/.test(m)) && metas.some(m => /Resize me · A4/.test(m)), metas.slice(0, 4).join(' ; '));
    ok('resized copy has content', await p.evaluate(() => chitra.canvas.getObjects().length) > 0);
    const d = await p.evaluate(() => chitra.describe('birthday mug for dad')); ok('describe finds a mug template', /^mug|^tee|^ig/.test(d.id) && d.title.toLowerCase().includes('dad'), JSON.stringify(d));
    await p.evaluate(() => chitra.magic('eid mug')); await p.waitForTimeout(1500);
    ok('magic opens a mug design', await p.evaluate(() => document.querySelector('#productName').textContent) === '11 oz mug wrap');
    await p.evaluate(() => chitra.canvas.add(new fabric.Rect({ width: 50, height: 50, left: 10, top: 10 }))); await p.evaluate(() => chitra.saveNow()); await p.evaluate(() => chitra.openHistory()); await p.click('#verNow'); await p.waitForTimeout(600);
    ok('version saved', await p.locator('#verList .ver').count() >= 1);
    await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.hidden = true));
    await p.evaluate(() => { document.querySelector('#pdfMarks').checked = true; });
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.evaluate(() => chitra.exportFile('pdf'))]);
    ok('PDF with crop marks downloads', /\.pdf$/.test(dl.suggestedFilename())); } },
  { name: 'photo templates accept photos', only: 'desktop', run: async (p, ok) => {
    const id = await p.evaluate(() => Object.keys(chitra.TEMPLATE_META).find(k => /^ig-/.test(k) && (chitra.TEMPLATE_META[k].t || '').includes('photocircle')));
    await p.evaluate(id => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: id }), id); await p.waitForTimeout(1200);
    const url = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 300; const x = c.getContext('2d'); x.fillStyle = '#f00'; x.fillRect(0, 0, 400, 300); return c.toDataURL(); });
    await p.evaluate(u => new Promise(r => fabric.Image.fromURL(u, i => { chitra.place(i); r(); })), url); await p.waitForTimeout(300);
    const r = await p.evaluate(() => { const o = chitra.canvas.getObjects(), im = o.find(x => x.type === 'image'), sl = o.find(x => x.slot); return { inSlot: !!im.inSlot, above: o.indexOf(im) === o.indexOf(sl) + 1, textAbove: o.slice(o.indexOf(im) + 1).some(x => /textbox/.test(x.type)) }; });
    ok('photo lands in the frame, above it, below the text', r.inSlot && r.above && r.textAbove, JSON.stringify(r)); } },
  { name: 'animated video export', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'ig-1' })); await p.waitForTimeout(1200);
    await p.evaluate(() => { document.querySelector('#anSpeed') || chitra.openAnimate(); document.querySelector('#anSpeed').value = 3; document.querySelectorAll('.modal').forEach(m => m.hidden = true); });
    const [d, r] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.evaluate(() => chitra.recordAnimation())]);
    ok('video downloads (.webm/.mp4) and is not empty', /\.(webm|mp4)$/.test(d.suggestedFilename()) && r.size > 5000, d.suggestedFilename() + ' ' + r.size);
    ok('design restored after recording', await p.evaluate(() => chitra.canvas.getObjects().every(o => o.opacity > 0))); } },
  { name: 'themed pages', only: 'desktop', run: async (p, ok) => {
    const r = await p.evaluate(async () => {
      const id = chitra.listTemplates({ cat: 'all' }).find(i => !chitra.TEMPLATE_META[i].real && chitra.TEMPLATE_META[i].p === 'Presentation 16:9') || chitra.listTemplates({}).find(i => !chitra.TEMPLATE_META[i].real);
      await chitra.ensureTpl(id, 'full'); await chitra.newDocument({ product: chitra.productByName(chitra.TEMPLATE_META[id].p), template: id });
      await new Promise(r => setTimeout(r, 600)); const th = chitra.themeOf(); chitra.addPage(false, 'content'); await new Promise(r => setTimeout(r, 800));
      const os = chitra.canvas.getObjects(), tx = os.filter(o => /textbox/.test(o.type));
      return { th, n: os.length, bg: chitra.canvas.backgroundColor, fonts: tx.map(o => o.fontFamily), pages: chitra.pages.length };
    });
    ok('Add page creates a themed page (not empty)', r.pages === 2 && r.n >= 3, JSON.stringify(r));
    ok('new page keeps the first page background', !!r.bg && r.bg === r.th.bg, r.bg + ' vs ' + r.th.bg);
    ok('new page heading uses the theme font', r.fonts[0] === r.th.head.f, r.fonts.join());
  } },
  { name: 'mock templates (marketing mockups)', only: 'desktop', run: async (p, ok) => {
    const n = await p.evaluate(() => Object.values(chitra.TEMPLATE_META).filter(m => m.mock).length); ok('200+ mock templates exist', n >= 200, n);
    ok('Mock templates is the first category', await p.evaluate(() => Object.keys(chitra.CAT_LABEL)[0] === 'mockup'));
    const r = await p.evaluate(async () => { const id = chitra.listTemplates({ cat: 'mockup' })[0]; await chitra.ensureTpl(id, 'full'); await chitra.newDocument({ product: chitra.productByName(chitra.TEMPLATE_META[id].p), template: id }); await new Promise(r => setTimeout(r, 900)); const os = chitra.canvas.getObjects(), im = os.find(o => o.mock); return { id, im: !!im, tx: os.filter(o => /textbox/.test(o.type)).length, kind: im?.mock?.kind }; });
    ok('mock template opens with a product picture + editable text', r.im && r.tx >= 2, JSON.stringify(r));
    const url = await p.evaluate(async () => { const id = chitra.listTemplates({ cat: 'mockup' })[5]; await chitra.ensureTpl(id, 'thumb'); return chitra.renderTemplateThumb(id, chitra.productByName(chitra.TEMPLATE_META[id].p), 300); });
    ok('mock template thumbnails render', !!url && url.length > 6000, url && url.length);
  } },
  { name: 'built-in graphics library', only: 'desktop', run: async (p, ok) => {
    ok('150+ built-in graphics', await p.evaluate(() => chitra.GRAPHICS_COUNT >= 150));
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'blank' })); await p.waitForTimeout(600);
    await p.click('#rail [data-tab=shapes]'); await p.click('#catGrid [data-el=graphics]'); await p.waitForTimeout(400); await p.click('.gx-tabs [data-m=b]'); await p.waitForTimeout(300);
    ok('graphics grid shows cards', await p.locator('.gfx-card').count() >= 30);
    await p.click('.gfx-card >> nth=24'); await p.waitForTimeout(500);
    ok('clicking a graphic places it on the page', await p.evaluate(() => chitra.canvas.getObjects().length >= 1 && chitra.canvas.getObjects().every(o => o.getScaledWidth() > 20)));
  } },
  { name: 'background remover keeps flat-graphic colours', only: 'desktop', run: async (p, ok) => {
    const r = await p.evaluate(async () => {
      await chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'blank' });
      const mk = outline => { const c = document.createElement('canvas'); c.width = 400; c.height = 300; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 400, 300); g.fillStyle = '#ff9933'; g.fillRect(60, 60, 280, 60); g.fillStyle = '#138808'; g.fillRect(60, 180, 280, 60); if (outline) { g.strokeStyle = '#999'; g.lineWidth = 3; g.strokeRect(60, 60, 280, 180); } g.strokeStyle = '#000080'; g.beginPath(); g.arc(200, 150, 20, 0, 7); g.stroke(); return c.toDataURL(); };
      const alphaAt = (o, fx, fy) => { const c = document.createElement('canvas'), el = o.getElement(); c.width = el.naturalWidth || el.width; c.height = el.naturalHeight || el.height; const g = c.getContext('2d'); g.drawImage(el, 0, 0); return g.getImageData(Math.round(c.width * fx), Math.round(c.height * fy), 1, 1).data[3]; };
      const out = {};
      for (const [name, outline, opt] of [['outlined', true, {}], ['open', false, {}], ['openKeep', false, { keepWhites: true }]]) {
        chitra.canvas.clear(); await chitra.addImageFromURL(mk(outline)); await new Promise(r => setTimeout(r, 500)); const o = chitra.canvas.getObjects().find(x => x.type === 'image'); chitra.canvas.setActiveObject(o);
        await chitra.removeBg(o, opt); await new Promise(r => setTimeout(r, 800)); const im = chitra.canvas.getObjects().find(x => x.type === 'image');
        out[name] = { corner: alphaAt(im, 0.02, 0.02), band: alphaAt(im, 0.3, 0.5), orange: alphaAt(im, 0.3, 0.3) };
      }
      return out;
    });
    ok('white margin removed, orange kept (outlined flag)', r.outlined.corner === 0 && r.outlined.orange > 240, JSON.stringify(r.outlined));
    ok('white stripe inside an outlined flag is kept', r.outlined.band > 240, JSON.stringify(r.outlined));
    ok('"Keep white parts" restores an open white stripe', r.openKeep.band > 240 && r.openKeep.corner === 0, JSON.stringify(r.openKeep));
  } },
  { name: 'premium graphics (Iconify)', only: 'desktop', run: async (p, ok, mobile, ctx) => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#f5b800"/><circle cx="11" cy="13" r="2" fill="#333"/><circle cx="21" cy="13" r="2" fill="#333"/></svg>';
    await ctx.route('https://api.iconify.design/**', r => { const u = r.request().url(); if (u.includes('/search')) return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ icons: ['fluent-emoji:pizza', 'noto:cat-face', 'circle-flags:in'], total: 3 }) }); r.fulfill({ status: 200, contentType: 'image/svg+xml', headers: { 'access-control-allow-origin': '*' }, body: svg }); });
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'blank' })); await p.waitForTimeout(500);
    await p.click('#rail [data-tab=shapes]'); await p.evaluate(() => { document.querySelector('#elBack')?.click(); document.querySelector('#catGrid [data-el=graphics]').click(); }); await p.waitForTimeout(1200);
    ok('premium graphics grid fills from the service', await p.locator('#pxGrid .gfx-card').count() === 3);
    await p.evaluate(() => document.querySelector('#pxGrid .gfx-card').click()); await p.waitForTimeout(800);
    ok('premium graphic is placed as a coloured vector', await p.evaluate(() => chitra.canvas.getObjects().length >= 1));
    await p.evaluate(() => document.querySelector('.gx-tabs [data-m=b]').click()); await p.waitForTimeout(300); ok('built-in tab still works', await p.locator('.gfx-card').count() > 20);
  } },
  { name: 'QR studio integration', only: 'desktop', run: async (p, ok) => {
    ok('QR & barcodes is an Elements category', await p.evaluate(() => !!document.querySelector('#catGrid [data-el=qr]')));
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'blank' })); await p.waitForTimeout(500);
    await p.evaluate(() => chitra.openQR()); await p.waitForTimeout(2500);
    const fr = p.frames().find(f => f.url().includes('studio/qr.html')); ok('QR studio loads inside the app', !!fr);
    ok('embedded mode shows the Add-to-design bar', fr && await fr.evaluate(() => !!document.getElementById('cxAdd')));
    const n0 = await p.evaluate(() => chitra.canvas.getObjects().length);
    await p.evaluate(() => { const f = document.querySelector('#qrFrame'); f.contentWindow.postMessage('noop', '*'); });
    await fr.evaluate(() => { document.getElementById('cxAdd').click(); }); await p.waitForTimeout(1500);
    ok('Add to my design places the picture on the page and closes the studio', await p.evaluate(n => chitra.canvas.getObjects().length > n && document.getElementById('qrStudio').hidden, n0), 'qr lib may be offline in tests');
  } },
  { name: 'real-photo templates (fixture catalog)', only: 'desktop', run: async (p, ok, mobile, ctx) => {
    const q = await ctx.newPage(); const errs = []; q.on('pageerror', e => errs.push(e.message));
    await q.goto('http://localhost:8123/?nosplash&catalog=tests/fixtures/photos.json'); await q.waitForTimeout(2500);
    const n = await q.evaluate(() => Object.values(chitra.TEMPLATE_META).filter(m => m.real).length); ok('fixture catalog yields only topic-matched photographic templates (unique, not repeated)', n >= 15 && n <= 36 * 2.6, n);
    const first = await q.evaluate(() => chitra.listTemplates({}).slice(0, 12).map(id => !!chitra.TEMPLATE_META[id].real)); ok('photographic designs are listed first', first.slice(0, 8).every(Boolean), first.join());
    const cats = await q.evaluate(() => new Set(chitra.listTemplates({}).slice(0, 12).map(id => chitra.TEMPLATE_META[id].cat)).size); ok('"All" mixes categories', cats >= 6, cats);
    await q.evaluate(async () => { const id = chitra.listTemplates({}).find(i => chitra.TEMPLATE_META[i].real); await chitra.ensureTpl(id, 'full'); await chitra.newDocument({ product: chitra.productByName('Instagram post'), template: id }); }); await q.waitForTimeout(1200);
    const r = await q.evaluate(() => { const im = chitra.canvas.getObjects().find(o => o.type === 'image'); return { img: !!im, credit: im?.credit?.by, text: chitra.canvas.getObjects().some(o => /textbox/.test(o.type)) }; }); ok('real template opens with a photo + live text', r.img && r.text && r.credit === 'Test Photographer', JSON.stringify(r));
    ok('credits file lists the photographer', (await q.evaluate(() => chitra.collectCredits().map(c => c.by))).includes('Test Photographer'));
    const px = await q.evaluate(() => { const c = chitra.canvas.lowerCanvasEl, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; const seen = new Set(); for (let i = 0; i < d.length; i += 400) seen.add((d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5)); return seen.size; }); ok('canvas shows a real image (many colours)', px > 12, px);
    await q.evaluate(() => chitra.showHome()); await q.waitForTimeout(500); await q.click('#hmCatTiles [data-ct=mug]'); await q.waitForTimeout(6000);
    const kinds = await q.evaluate(() => [...document.querySelectorAll('#hmTplGrid img[data-tpl].ready')].slice(0, 6).map(i => i.src.slice(0, 22))); ok('mug templates are shown on a realistic mug', kinds.length > 0 && kinds.every(k => k.startsWith('data:image/jpeg')), kinds.join(' | '));
    ok('no page errors in real-template flow', errs.length === 0, errs.join('|')); await q.close(); } },
  { name: 'live photo library + key vault', only: 'desktop', run: async (p, ok, mobile, ctx) => {
    const base = 'http://localhost:8123/tests/fixtures/photos/';
    await ctx.route('https://pixabay.com/api/**', r => { const q = new URL(r.request().url()).searchParams.get('q') || '', off = q.length % 12; const hits = Array.from({ length: 16 }, (_, i) => { const n = String((off + i * 2) % 36).padStart(2, '0'); return { id: `${q.length}${i}${n}`, webformatURL: `${base}f${n}_t.jpg`, largeImageURL: `${base}f${n}.jpg`, imageWidth: +n % 3 ? 1280 : 853, imageHeight: +n % 3 ? 853 : 1280, user: 'Mock Photographer', pageURL: 'https://pixabay.com/x', tags: q + ', photo' }; }); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ hits, totalHits: 100 }) }); });
    const q = await ctx.newPage(); const errs = []; q.on('pageerror', e => errs.push(e.message));
    await q.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('chitra.keys', JSON.stringify({ pixabay: 'PLAINKEY-123' })); } });
    await q.goto('http://localhost:8123/?nosplash&livetopics=14&livedelay=0'); ok('plaintext keys are detected', await q.evaluate(() => chitra.vault.state()) === 'plain');
    await q.waitForFunction(() => Object.values(chitra.TEMPLATE_META).some(m => m.real), null, { timeout: 40000 }).catch(() => { });
    const n = await q.evaluate(() => Object.values(chitra.TEMPLATE_META).filter(m => m.real).length); ok('library built from live search -> photographic templates (topic-matched only)', n >= 8, n);
    await q.evaluate(async () => { const id = chitra.listTemplates({})[0]; await chitra.ensureTpl(id, 'full'); await chitra.newDocument({ product: chitra.productByName('Instagram post'), template: id }); }); await q.waitForTimeout(1000);
    const r1 = await q.evaluate(() => { const im = chitra.canvas.getObjects().find(o => o.type === 'image'); return { img: !!im, by: im?.credit?.by, site: im?.credit?.site }; }); ok('live template carries a photo with credit', r1.img && r1.by === 'Mock Photographer' && r1.site === 'Pixabay', JSON.stringify(r1));
    const cached = await q.evaluate(async () => (await chitra.kv.get('ibindex'))?.length || 0); ok('photos are cached on the device after first use', cached > 0, cached);
    await q.evaluate(() => chitra.vault.save({ pixabay: 'PLAINKEY-123', unsplash: 'UNS-KEY-9' }, 'secret1', false));
    ok('keys no longer stored in plain text', await q.evaluate(() => localStorage.getItem('chitra.keys') === null && !localStorage.getItem('chitra.vault').includes('PLAINKEY') && !localStorage.getItem('chitra.vault').includes('UNS-KEY')));
    const dump = await q.evaluate(() => JSON.stringify({ ...localStorage })); ok('no key anywhere in localStorage', !/PLAINKEY|UNS-KEY/.test(dump));
    await q.goto('http://localhost:8123/?nosplash&nolive=1'); await q.waitForTimeout(800);
    ok('after reload the vault is locked and no key is usable', await q.evaluate(() => chitra.vault.state() === 'locked' && !chitra.stock.config().pixabay));
    ok('wrong passphrase refused', (await q.evaluate(() => chitra.vault.unlock('nope123'))) === false);
    ok('right passphrase unlocks', await q.evaluate(async () => (await chitra.vault.unlock('secret1')) && chitra.stock.config().pixabay === 'PLAINKEY-123' && chitra.stock.config().unsplash === 'UNS-KEY-9'));
    await q.evaluate(() => chitra.vault.save({ pixabay: 'PLAINKEY-123' }, 'secret1', true)); await q.goto('http://localhost:8123/?nosplash&nolive=1'); await q.waitForTimeout(600);
    ok('"remember on this device" unlocks silently', await q.evaluate(async () => (await chitra.vault.tryRemembered()) && chitra.stock.config().pixabay === 'PLAINKEY-123'));
    ok('no page errors in live/vault flow', errs.length === 0, errs.join('|')); await q.close(); } },
  { name: 'live library resumes after reload and exports a public catalog', only: 'desktop', run: async (p, ok, mobile, ctx) => {
    const base = 'http://localhost:8123/tests/fixtures/photos/';
    await ctx.route('https://api.unsplash.com/**', r => { const q = new URL(r.request().url()).searchParams.get('query') || ''; const results = Array.from({ length: 10 }, (_, i) => { const n = String((q.length + i * 3) % 36).padStart(2, '0'); return { id: `u${q.length}${i}${n}`, urls: { small: `${base}f${n}_t.jpg`, regular: `${base}f${n}.jpg` }, width: 1600, height: 1000, user: { name: 'Mock Unsplasher' }, links: { html: 'https://unsplash.com/photos/x' }, alt_description: q }; }); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ results, total_pages: 5 }) }); });
    const q = await ctx.newPage(); const errs = []; q.on('pageerror', e => errs.push(e.message));
    await q.addInitScript(() => { if (!sessionStorage.getItem('seeded2')) { sessionStorage.setItem('seeded2', '1'); localStorage.removeItem('chitra.vault'); localStorage.setItem('chitra.keys', JSON.stringify({ unsplash: 'UKEY' })); } });
    await q.goto('http://localhost:8123/?nosplash&livetopics=24&livedelay=250'); await q.evaluate(async () => { await chitra.kv.del('livecat'); await chitra.kv.del('vaultkey'); }); await q.waitForTimeout(4200);
    const mid = await q.evaluate(async () => { const s = await chitra.kv.get('livecat'); return s ? { complete: s.complete, idx: s.idx } : null; }); ok('progress is saved while building', !!mid && mid.complete === false && mid.idx >= 4, JSON.stringify(mid));
    await q.goto('http://localhost:8123/?nosplash&livetopics=24&livedelay=0'); for (let i = 0; i < 60; i++) { if (await q.evaluate(async () => (await chitra.kv.get('livecat'))?.complete === true)) break; await q.waitForTimeout(500); }
    ok('reload resumed and finished the library', await q.evaluate(async () => (await chitra.kv.get('livecat'))?.complete === true));
    const exp = await q.evaluate(async () => { const s = await chitra.kv.get('livecat'); return s.photos.filter(p => p.site === 'Unsplash').length; }); ok('unsplash photos present', exp > 20, exp);
    const [dl] = await Promise.all([q.waitForEvent('download', { timeout: 10000 }), q.evaluate(() => chitra.exportCatalog())]); ok('catalog export downloads photos.json', dl.suggestedFilename() === 'photos.json');
    ok('no page errors (resume/export)', errs.length === 0, errs.join('|')); await q.close(); } },
  { name: 'corner drag crops a photo (does not resize it)', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('A4'), template: 'blank' })); await p.waitForTimeout(500);
    const url = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 800; c.height = 600; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 800, 600); g.addColorStop(0, '#f00'); g.addColorStop(1, '#00f'); x.fillStyle = g; x.fillRect(0, 0, 800, 600); return c.toDataURL(); });
    await p.evaluate(u => new Promise(r => fabric.Image.fromURL(u, i => { i.scaleToWidth(1200); chitra.place(i); r(); })), url); await p.waitForTimeout(300);
    const info = () => p.evaluate(() => { const o = chitra.active(), c = chitra.canvas, b = c.upperCanvasEl.getBoundingClientRect(), pt = k => ({ x: b.left + o.oCoords[k].x, y: b.top + o.oCoords[k].y }); const br = o.getPointByOrigin('right', 'bottom'); return { sx: o.scaleX, sw: o.width, sh: o.height, cx: o.cropX || 0, cy: o.cropY || 0, tl: pt('tl'), br: pt('br'), mr: pt('mr'), brAbs: { x: br.x, y: br.y }, rs: o.oCoords.rs ? pt('rs') : null }; });
    const a = await info(); await p.mouse.move(a.tl.x, a.tl.y); await p.mouse.down(); await p.mouse.move(a.tl.x + 30, a.tl.y + 20, { steps: 6 }); await p.mouse.move(a.tl.x + 60, a.tl.y + 40, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(200);
    const b = await info(); ok('corner drag crops (scale unchanged, frame smaller, picture offset)', b.sx === a.sx && b.sw < a.sw && b.sh < a.sh && b.cx > 0 && b.cy > 0, JSON.stringify({ sx: [a.sx, b.sx], sw: [a.sw, b.sw], cx: b.cx }));
    ok('opposite corner stays put', Math.abs(b.brAbs.x - a.brAbs.x) < 1.5 && Math.abs(b.brAbs.y - a.brAbs.y) < 1.5, JSON.stringify([a.brAbs, b.brAbs]));
    const b2 = await info(); await p.mouse.move(b2.tl.x, b2.tl.y); await p.mouse.down(); await p.mouse.move(b2.tl.x - 200, b2.tl.y - 200, { steps: 8 }); await p.mouse.up(); const c2 = await info();
    ok('dragging outward restores the hidden part, never beyond the original', c2.cx >= 0 && c2.cy >= 0 && c2.sw <= 800 + 0.01 && c2.sw > b2.sw, JSON.stringify({ cx: c2.cx, sw: c2.sw }));
    await p.evaluate(() => { const o = chitra.active(); o.flipX = true; o.dirty = true; chitra.canvas.requestRenderAll(); o.setCoords(); }); const f1 = await info(); await p.mouse.move(f1.mr.x, f1.mr.y); await p.mouse.down(); await p.mouse.move(f1.mr.x - 80, f1.mr.y, { steps: 6 }); await p.mouse.up(); const f2 = await info();
    ok('crop works on a flipped photo', f2.sw < f1.sw && f2.sx === f1.sx, JSON.stringify([f1.sw, f2.sw]));
    const r0 = await info(); await p.mouse.move(r0.rs.x, r0.rs.y); await p.mouse.down(); await p.mouse.move(r0.rs.x + 80, r0.rs.y + 80, { steps: 6 }); await p.mouse.up(); const r1 = await info();
    ok('the round handle resizes (scale changes, crop kept)', r1.sx > r0.sx && Math.abs(r1.sw - r0.sw) < 0.01, JSON.stringify([r0.sx, r1.sx])); } },
  { name: 'mockups: every product, scenes, sheet, shuffle', only: 'desktop', run: async (p, ok) => {
    await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('Instagram post'), template: 'ig-5', name: 'Mock me' })); await p.waitForTimeout(1200);
    await p.evaluate(() => chitra.openMockup()); await p.waitForTimeout(500);
    const kinds = await p.evaluate(() => [...document.querySelectorAll('#mkGrid [data-k]')].map(b => b.dataset.k).filter(k => k !== 'photo')); ok('13 products offered', kinds.length >= 12, kinds.join(','));
    const bad = []; for (const k of kinds) { const r = await p.evaluate(async k => { document.querySelector(`#mkGrid [data-k=${k}]`).click(); await new Promise(r => setTimeout(r, 120)); const c = document.querySelector('#mockCanvas'), d = c.getContext('2d').getImageData(c.width / 2 - 40, c.height / 2 - 40, 80, 80).data; let seen = new Set(); for (let i = 0; i < d.length; i += 16) seen.add((d[i] >> 4) + ',' + (d[i + 1] >> 4)); return seen.size; }, k); if (r < 3) bad.push(k + ':' + r); }
    ok('every product draws real content', bad.length === 0, bad.join(' '));
    const sc = await p.evaluate(() => chitra.MOCK_SCENES.map(s => s.id).map(id => { const c = document.createElement('canvas'); c.width = c.height = 900; chitra.mockRenderScene(c, 'shirt', { scene: id, art: document.querySelector('#mockCanvas') }); const d = c.getContext('2d').getImageData(20, 20, 160, 160).data; let m = 0, n = 0; for (let i = 0; i < d.length; i += 4) { m += d[i]; n++; } m /= n; let v = 0; for (let i = 0; i < d.length; i += 4) v += (d[i] - m) ** 2; return [id, +Math.sqrt(v / n).toFixed(1)]; }));
    ok('textured scenes have real texture (pixel variation)', sc.filter(([id]) => ['wood', 'marble', 'concrete', 'linen', 'sunlit', 'kraft'].includes(id)).every(([, sd]) => sd > 1.6), JSON.stringify(sc));
    await p.evaluate(() => document.querySelector('#mkShuffle').click()); await p.waitForTimeout(200);
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.evaluate(() => document.querySelector('#mkSheet').click())]); ok('mockup sheet downloads', dl.suggestedFilename() === 'mockup-sheet.png');
    const [dl2] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.evaluate(() => document.querySelector('#mkSave').click())]); ok('single mockup downloads', /mockup\.png$/.test(dl2.suggestedFilename()));
    await p.evaluate(async () => { const i = new Image(); i.src = 'tests/fixtures/photos/f03.jpg'; await new Promise(r => { i.onload = r; }); document.querySelector('#mkGrid [data-k=photo]').click(); const f = await (await fetch('tests/fixtures/photos/f03.jpg')).blob(); const dt = new DataTransfer(); dt.items.add(new File([f], 'p.jpg', { type: 'image/jpeg' })); const inp = document.querySelector('#mkFile'); inp.files = dt.files; inp.dispatchEvent(new Event('change')); }); await p.waitForTimeout(800);
    ok('own product photo mode works', await p.evaluate(() => !document.querySelector('#mkPhotoBox').hidden));
    await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.hidden = true)); } },
];
