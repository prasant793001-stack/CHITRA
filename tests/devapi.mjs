/* Local dev server that runs worker/api.js against an in-memory KV (for tests and trying the cloud features offline). */
import http from 'node:http'; import worker from '../worker/api.js';
const store = new Map();
const KV = { async get(k, o) { const v = store.get(k); if (v === undefined) return null; return o?.type === 'json' ? JSON.parse(v) : v; }, async put(k, v) { store.set(k, v); }, async delete(k) { store.delete(k); }, async list({ prefix }) { return { keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })) }; } };
const env = { DATA: KV, SESSION_SECRET: 'dev-secret', DEV_ECHO_CODE: '1', ALLOWED_ORIGIN: '*' };
export function start(port = 8788) {
  return new Promise(res => { const s = http.createServer(async (req, rsp) => { const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined; const r = await worker.fetch(new Request(`http://localhost:${port}${req.url}`, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env); rsp.writeHead(r.status, Object.fromEntries(r.headers)); rsp.end(Buffer.from(await r.arrayBuffer())); }).listen(port, () => res(s)); });
}
if (process.argv[1].endsWith('devapi.mjs')) start().then(() => console.log('dev API on :8788'));
