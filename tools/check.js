/* Syntax-checks every app script and verifies index.html only references files that exist. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..'); let bad = 0;
for (const f of fs.readdirSync(root).filter(f => f.endsWith('.js'))) { try { new vm.Script(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f }); } catch (e) { if (!/import|export/.test(e.message)) { console.error('SYNTAX', f, e.message); bad++; } } }
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href)="([^":#?]+\.(?:js|css|png|webmanifest|json))"/g)) if (!fs.existsSync(path.join(root, m[1]))) { console.error('MISSING', m[1]); bad++; }
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
for (const f of ['app.js', 'home.js', 'layouts.js', 'photo.js', 'fonts.js', 'elements.js']) for (const m of fs.readFileSync(path.join(root, f), 'utf8').matchAll(/\$\('#([A-Za-z][\w-]*)'\)/g)) if (!ids.has(m[1]) && !/^(stk|tplSearch|hmResTpl|hmCat)/.test(m[1])) console.warn('note: #' + m[1] + ' (' + f + ') is not in index.html (may be created at runtime)');
console.log(bad ? 'FAILED' : 'OK'); process.exit(bad ? 1 : 0);
