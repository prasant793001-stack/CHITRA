/* End-to-end: real browser + real worker code (in-memory KV). Needs the static server on :8123. */
import { chromium } from 'playwright'; import { start } from './devapi.mjs';
const srv = await start(8788); let pass = 0, fail = 0; const ok = (n, c, x = '') => { c ? pass++ : fail++; console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (c ? '' : ' | ' + x)); };
const b = await chromium.launch(); const mk = async () => { const ctx = await b.newContext({ viewport: { width: 1366, height: 800 } }); await ctx.route(/fonts\./, r => r.abort()); await ctx.route('**/config.js', async r => { const t = await (await r.fetch()).text(); r.fulfill({ body: t.replace("apiUrl: ''", "apiUrl: 'http://localhost:8788'"), contentType: 'application/javascript' }); }); await ctx.addInitScript(() => localStorage.setItem('chitra.tour', '1')); return ctx; };
const errs = []; const ctx = await mk(), p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8123/?nosplash'); await p.waitForTimeout(1500);
ok('sign-in button visible', await p.isVisible('#acctBtn'));
await p.click('#acctBtn'); await p.fill('#auEmail', 'maker@example.com'); await p.click('#auGo'); await p.waitForSelector('#auCode:not([hidden])'); await p.click('#auGo'); await p.waitForTimeout(800);
ok('signed in', await p.evaluate(() => chitra.cloud.signedIn && chitra.cloud.email === 'maker@example.com'));
await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('A4'), template: 'poster-1', name: 'Cloud poster' })); await p.waitForTimeout(1500);
await p.evaluate(() => chitra.saveNow()); await p.waitForTimeout(5500);
const remote = await p.evaluate(() => chitra.cloud.api('/projects')); ok('design reached the cloud', remote.items.some(i => i.name === 'Cloud poster'), JSON.stringify(remote));
// second device
const ctx2 = await mk(), p2 = await ctx2.newPage(); await p2.goto('http://localhost:8123/?nosplash'); await p2.waitForTimeout(1200);
await p2.click('#acctBtn'); await p2.fill('#auEmail', 'maker@example.com'); await p2.click('#auGo'); await p2.waitForSelector('#auCode:not([hidden])'); await p2.click('#auGo'); await p2.waitForTimeout(2500);
const local2 = await p2.evaluate(async () => (await chitra.store.list()).map(m => m.name)); ok('design appears on a second device', local2.includes('Cloud poster'), local2.join(','));
ok('plan is free by default', await p2.evaluate(() => localStorage.getItem('chitra.plan')) === 'free');
await p2.evaluate(() => chitra.cloud.checkout('pro')); await p2.waitForTimeout(500);
// approval link round-trip
await p.evaluate(() => chitra.newDocument({ product: chitra.productByName('11 oz mug wrap'), template: 'mug-1', name: 'Mug for Zed' })); await p.waitForTimeout(1200);
const link = await p.evaluate(() => chitra.cloud.share()); ok('approval link created', /\?view=[a-z0-9]{10,}/.test(link), link);
const ctx3 = await mk(), p3 = await ctx3.newPage(); await p3.goto(link); await p3.waitForSelector('#vName'); await p3.waitForTimeout(800);
ok('customer sees the design', await p3.evaluate(() => document.querySelector('#vName').textContent) === 'Mug for Zed' && await p3.evaluate(() => document.querySelector('#vImg').naturalWidth > 0));
ok('customer view hides the editor', !(await p3.isVisible('#home')));
await p3.fill('#vWho', 'Zed'); await p3.fill('#vText', 'Bigger logo please'); await p3.click('#vSend'); await p3.waitForTimeout(600); await p3.click('#vOk'); await p3.waitForTimeout(600);
ok('customer comment + approval shown', (await p3.textContent('#vCom')).includes('Bigger logo please') && (await p3.textContent('#vState')).includes('Approved by Zed'));
const fb = await p.evaluate(async () => { const id = JSON.parse(localStorage.getItem('chitra.shares'))[0].id; return chitra.cloud.api('/share/' + id); }); ok('designer sees the feedback', fb.approved?.by === 'Zed' && fb.comments.length === 1);
ok('page errors', errs.length === 0, errs.join('|'));
await b.close(); srv.close(); console.log(`\n${pass}/${pass + fail} passed`); process.exit(fail ? 1 : 0);
