#!/usr/bin/env node
/* Chitra local bridge — runs ONLY on the owner's Windows PC and lets Chitra search / import pictures from Creator Downloader (Pinterest).
 *   node server.mjs            (reads bridge.config.json next to this file; default port 8787)
 * Chitra (owner mode) calls:  GET /health   GET /search?q=word&page=1   GET /file/<id>
 * It never leaves your PC: it only answers requests from your own browser (127.0.0.1) and only serves files from the configured folder.
 *
 * Providers (bridge.config.json "provider"):
 *   "folder"  - searches the pictures already saved in a folder (the one Creator Downloader downloads into) by file/folder name, newest first.
 *   "command" - first runs YOUR downloader command for a new search word (so it fetches fresh Pinterest pictures into the folder), waits, then lists the folder.
 *               "cmd" may contain {q} (the search word) and {out} (the folder). Example for a CLI: ["C:\\Program Files\\Creator Downloader\\cd.exe","--search","{q}","--out","{out}"]
 *   "http"    - forwards to an HTTP API your downloader exposes: "searchUrl": "http://127.0.0.1:PORT/search?q={q}&page={page}" returning {items:[{id,thumb,full,title}]}.
 */
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { spawn } from 'node:child_process';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), cfgPath = path.join(here, 'bridge.config.json');
const CFG = { port: 8787, provider: 'folder', folder: path.join(process.env.USERPROFILE || process.env.HOME || '.', 'Downloads', 'Creator Downloader'), allowOrigins: ['https://prasant793001-stack.github.io', 'http://localhost:8123'], perPage: 40, commandTimeoutSec: 120, ...(fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {}), ...(process.env.BRIDGE_CONFIG ? JSON.parse(process.env.BRIDGE_CONFIG) : {}) };
const IMG = /\.(jpe?g|png|webp|gif|avif)$/i, MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };
const idOf = p => crypto.createHash('sha1').update(p).digest('hex').slice(0, 16); const index = new Map(); // id -> absolute path
function scan(dir, depth = 0, out = []) { let es = []; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; } for (const e of es) { const p = path.join(dir, e.name); if (e.isDirectory() && depth < 3) scan(p, depth + 1, out); else if (e.isFile() && IMG.test(e.name)) { let st; try { st = fs.statSync(p); } catch { continue; } out.push({ p, name: e.name, rel: path.relative(CFG.folder, p), at: st.mtimeMs, size: st.size }); } } return out; }
const done = new Set();
async function runCommand(q) {
  if (CFG.provider !== 'command' || !CFG.cmd || done.has(q)) return; done.add(q);
  const [exe, ...args] = CFG.cmd.map(a => String(a).replaceAll('{q}', q).replaceAll('{out}', CFG.folder));
  await new Promise(res => { const ch = spawn(exe, args, { windowsHide: true, stdio: 'ignore' }); const t = setTimeout(() => { try { ch.kill(); } catch { } res(); }, CFG.commandTimeoutSec * 1000); ch.on('exit', () => { clearTimeout(t); res(); }); ch.on('error', () => { clearTimeout(t); res(); }); });
}
async function search(q, page, base) {
  if (CFG.provider === 'http') { const r = await fetch(CFG.searchUrl.replaceAll('{q}', encodeURIComponent(q)).replaceAll('{page}', page)); return r.json(); }
  if (q) await runCommand(q);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean), all = scan(CFG.folder).filter(f => !words.length || words.every(w => f.rel.toLowerCase().includes(w))).sort((a, b) => b.at - a.at), from = (page - 1) * CFG.perPage, slice = all.slice(from, from + CFG.perPage);
  return { items: slice.map(f => { const id = idOf(f.p); index.set(id, f.p); return { id, title: f.name.replace(/\.\w+$/, ''), thumb: `${base}/file/${id}`, full: `${base}/file/${id}`, by: 'Pinterest (your downloader)' }; }), more: from + CFG.perPage < all.length };
}
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '', ok = !origin || CFG.allowOrigins.includes(origin) || /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin);
  const cors = { 'access-control-allow-origin': ok && origin ? origin : 'null', 'access-control-allow-private-network': 'true', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,OPTIONS', vary: 'origin' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); } if (!ok) { res.writeHead(403, cors); return res.end('forbidden'); }
  const u = new URL(req.url, `http://${req.headers.host}`), base = `http://${req.headers.host}`;
  try {
    if (u.pathname === '/health') { res.writeHead(200, { ...cors, 'content-type': 'application/json' }); return res.end(JSON.stringify({ ok: true, provider: CFG.provider, folder: CFG.folder })); }
    if (u.pathname === '/search') { const j = await search((u.searchParams.get('q') || '').trim().slice(0, 100), Math.max(1, +u.searchParams.get('page') || 1), base); res.writeHead(200, { ...cors, 'content-type': 'application/json' }); return res.end(JSON.stringify(j)); }
    const m = /^\/file\/([a-f0-9]{16})$/.exec(u.pathname);
    if (m) { let p = index.get(m[1]); if (!p) { scan(CFG.folder).forEach(f => index.set(idOf(f.p), f.p)); p = index.get(m[1]); } if (!p || !p.startsWith(CFG.folder)) { res.writeHead(404, cors); return res.end(); } res.writeHead(200, { ...cors, 'content-type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream', 'cache-control': 'max-age=3600' }); return fs.createReadStream(p).pipe(res); }
    res.writeHead(404, cors); res.end('not found');
  } catch (e) { res.writeHead(500, { ...cors, 'content-type': 'application/json' }); res.end(JSON.stringify({ error: String(e.message || e) })); }
});
server.listen(CFG.port, '127.0.0.1', () => console.log(`Chitra bridge ready on http://127.0.0.1:${CFG.port}  (provider: ${CFG.provider}, folder: ${CFG.folder})`));
