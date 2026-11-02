/* Syntax-checks every app script and verifies index.html only references files that exist. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..'); let bad = 0;
for (const f of fs.readdirSync(root).filter(f => f.endsWith('.js'))) { try { new vm.Script(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }); } catch (e) { if (!/import|export/.test(e.message)) { console.error('SYNTAX', f, e.message); bad++; } } }
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href)="([^":#?]+\.(?:js|css|png|webmanifest|json))"/g)) if (!fs.existsSync(path.join(root, m[1]))) { console.error('MISSING', m[1]); bad++; }
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
for (const f of ['app.js', 'home.js', 'layouts.js', 'photo.js', 'fonts.js', 'elements.js']) for (const m of fs.readFileSync(path.join(root, f), 'utf8').matchAll(/\$\('#([A-Za-z][\w-]*)'\)/g)) if (!ids.has(m[1]) && !/^(stk|tplSearch|hmResTpl|hmCat)/.test(m[1])) console.warn('note: #' + m[1] + ' (' + f + ') is not in index.html (may be created at runtime)');
/* The service worker serves scripts cache-first, so a deploy only reaches returning visitors when sw.js itself changes (new worker → fresh precache →
   the page reloads on controllerchange). Tie the cache name to a fingerprint of every precached file; `node tools/check.js --fix` updates it. */
{ const crypto = require('crypto'), swPath = path.join(root, 'sw.js'), sw = fs.readFileSync(swPath, 'utf8'), list = (sw.match(/const ASSETS = \[([^\]]*)\]/) || [])[1] || '', h = crypto.createHash('sha256');
  for (const a of [...list.matchAll(/'([^']+)'/g)].map(m => m[1]).filter(a => a !== './')) { const f = path.join(root, a); if (!fs.existsSync(f)) { console.error('sw.js precaches a missing file', a); bad++; continue; } h.update(a + '\0').update(fs.readFileSync(f)); }
  const want = 'chitra-' + h.digest('hex').slice(0, 10), have = (sw.match(/const V = '([^']+)'/) || [])[1];
  if (have !== want) { if (process.argv.includes('--fix')) { fs.writeFileSync(swPath, sw.replace(/const V = '[^']+'/, `const V = '${want}'`)); console.log(`sw.js cache version ${have} -> ${want}`); } else { console.error(`sw.js cache version is stale (${have}, files say ${want}): run  node tools/check.js --fix  so returning visitors get this deploy`); bad++; } } }
console.log(bad ? 'FAILED' : 'OK'); process.exit(bad ? 1 : 0);
