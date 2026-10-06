/* Unit tests for worker/api.js with an in-memory KV (no network, no Cloudflare needed). Run: node tests/worker.test.mjs */
import worker from '../worker/api.js';
import crypto from 'node:crypto';
const store = new Map();
const KV = { async get(k, o) { const v = store.get(k); if (v === undefined) return null; return o?.type === 'json' ? JSON.parse(v) : o?.type === 'stream' ? v : v; }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); }, async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })) }; } };
const env = { DATA: KV, SESSION_SECRET: 's3cret', DEV_ECHO_CODE: '1', STRIPE_WEBHOOK_SECRET: 'whsec_test', ALLOWED_ORIGIN: 'https://x.test' };
const call = (path, { method = 'GET', body, token, headers = {} } = {}) => worker.fetch(new Request('https://api.test' + path, { method, body: body && (typeof body === 'string' ? body : JSON.stringify(body)), headers: { ...(token ? { authorization: 'Bearer ' + token } : {}), ...headers } }), env).then(async r => ({ s: r.status, j: await r.json().catch(() => null), h: r.headers }));
let pass = 0, fail = 0; const ok = (n, c, x = '') => { c ? pass++ : fail++; console.log((c ? 'PASS' : 'FAIL') + ' | ' + n + (c ? '' : ' | ' + x)); };

let r = await call('/me'); ok('rejects anonymous', r.s === 401);
r = await call('/auth/start', { method: 'POST', body: { email: 'nope' } }); ok('rejects bad email', r.s === 400);
r = await call('/auth/start', { method: 'POST', body: { email: 'Ann@Example.com' } }); ok('starts sign-in', r.s === 200 && /^\d{6}$/.test(r.j.devCode), JSON.stringify(r));
const code = r.j.devCode;
r = await call('/auth/verify', { method: 'POST', body: { email: 'ann@example.com', code: '000000' } }); ok('wrong code refused', r.s === 400);
r = await call('/auth/verify', { method: 'POST', body: { email: 'ann@example.com', code } }); ok('right code signs in', r.s === 200 && r.j.token, JSON.stringify(r)); const token = r.j.token;
r = await call('/auth/verify', { method: 'POST', body: { email: 'ann@example.com', code } }); ok('code is single-use', r.s === 400);
r = await call('/me', { token }); ok('/me works with token', r.s === 200 && r.j.plan === 'free' && r.j.email === 'ann@example.com');
r = await call('/me', { token: token.slice(0, -2) + 'xx' }); ok('tampered token rejected', r.s === 401);
r = await call('/projects/abc123', { method: 'PUT', token, body: { name: 'Mug design', pages: [] } }); ok('save project', r.s === 200 && r.j.name === 'Mug design');
r = await call('/projects/abc123', { token }); ok('load project', r.s === 200 && r.j.name === 'Mug design');
r = await call('/projects', { token }); ok('list projects', r.s === 200 && r.j.items.length === 1 && r.j.items[0].id === 'abc123');
r = await call('/projects/../x', { method: 'PUT', token, body: '{}' }); ok('path traversal refused', r.s !== 200);
r = await call('/projects/bad id', { method: 'PUT', token, body: '{}' }); ok('bad id refused', r.s !== 200);
r = await call('/projects/abc124', { method: 'PUT', token, body: 'not json' }); ok('bad json refused', r.s === 400);
for (let i = 0; i < 4; i++) await call('/projects/p' + i + 'xyz', { method: 'PUT', token, body: { name: 'n' + i } });
r = await call('/projects/overlimit', { method: 'PUT', token, body: { name: 'six' } }); ok('free plan limited to 5 designs', r.s === 402, JSON.stringify(r));
r = await call('/projects/abc123', { method: 'PUT', token, body: { name: 'Renamed' } }); ok('existing design can still be updated at the limit', r.s === 200);
// other users cannot read mine
await call('/auth/start', { method: 'POST', body: { email: 'bob@example.com' } }); const bc = (await call('/auth/start', { method: 'POST', body: { email: 'bob@example.com' } })).j.devCode;
const bt = (await call('/auth/verify', { method: 'POST', body: { email: 'bob@example.com', code: bc } })).j.token;
r = await call('/projects/abc123', { token: bt }); ok('users are isolated', r.s === 404);
// stripe webhook
const evt = JSON.stringify({ type: 'checkout.session.completed', data: { object: { client_reference_id: 'ann@example.com', customer: 'cus_1', metadata: { plan: 'pro' } } } }), t = Math.floor(Date.now() / 1000);
const sig = crypto.createHmac('sha256', 'whsec_test').update(`${t}.${evt}`).digest('hex');
r = await call('/billing/webhook', { method: 'POST', body: evt, headers: { 'stripe-signature': `t=${t},v1=deadbeef` } }); ok('forged webhook refused', r.s === 400);
r = await call('/billing/webhook', { method: 'POST', body: evt, headers: { 'stripe-signature': `t=${t},v1=${sig}` } }); ok('valid webhook accepted', r.s === 200);
r = await call('/me', { token }); ok('plan upgraded to pro', r.j.plan === 'pro');
r = await call('/projects/overlimit', { method: 'PUT', token, body: { name: 'six' } }); ok('pro can save more', r.s === 200);
const old = Math.floor(Date.now() / 1000) - 4000, sig2 = crypto.createHmac('sha256', 'whsec_test').update(`${old}.${evt}`).digest('hex');
r = await call('/billing/webhook', { method: 'POST', body: evt, headers: { 'stripe-signature': `t=${old},v1=${sig2}` } }); ok('replayed (old) webhook refused', r.s === 400);
const del = JSON.stringify({ type: 'customer.subscription.deleted', data: { object: { customer: 'cus_1' } } }), s3 = crypto.createHmac('sha256', 'whsec_test').update(`${t}.${del}`).digest('hex');
await call('/billing/webhook', { method: 'POST', body: del, headers: { 'stripe-signature': `t=${t},v1=${s3}` } }); r = await call('/me', { token }); ok('cancellation downgrades to free', r.j.plan === 'free');
r = await call('/billing/checkout', { method: 'POST', token, body: { plan: 'pro' } }); ok('checkout says not configured (no keys)', r.s === 503);
r = await call('/projects', { method: 'OPTIONS' }); ok('CORS preflight', r.s === 204 && r.h.get('access-control-allow-origin') === 'https://x.test');
console.log(`\n${pass}/${pass + fail} passed`); process.exit(fail ? 1 : 0);
