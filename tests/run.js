/* End-to-end regression suite (Playwright + Chromium). Usage: npm run serve (other terminal) then npm test.  */
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8123/';
const results = []; const ok = (n, c, x = '') => { results.push(c); console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (x ? ' | ' + x : '')); };
const T = require('./cases');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const mobile of [false, true]) {
    const ctx = await b.newContext({ serviceWorkers: 'block', ...(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1366, height: 800 }, acceptDownloads: true }) }); // the service worker would bypass route mocks
    await ctx.route(/fonts\.(googleapis|gstatic)|jsdelivr|staticimgly/, r => r.abort());
    await ctx.addInitScript(() => { try { localStorage.setItem('chitra.tour', '1'); } catch { } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto(BASE + '?nosplash'); await p.waitForTimeout(1500);
    for (const t of T) if (!t.only || t.only === (mobile ? 'mobile' : 'desktop')) { try { await t.run(p, ok, mobile, ctx); } catch (e) { ok(t.name + ' (threw)', false, e.message.split('\n')[0]); } }
    await ctx.close();
  }
  ok('no uncaught page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await b.close(); const f = results.filter(r => !r).length; console.log(`\n${results.length - f}/${results.length} passed`); process.exit(f ? 1 : 0);
})();
