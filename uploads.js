/* Chitra Studio – "Your art" library: everything a user uploads is kept on this device (IndexedDB) so it can be added again with one click,
   plus an optional CONNECTED FOLDER (e.g. the folder Creator Downloader / Pinterest downloads save to): its newest pictures are listed here
   and refresh whenever you come back to the app, so downloaded images are one click away from the canvas. Needs a Chromium browser for the folder part. */
(() => {
  const C = window.chitra; if (!C) return;
  const { $, $$, toast, kv, ico } = C, panel = $('[data-panel=upload]'); if (!panel) return;
  const KEY = 'uplidx', MAXN = 120, IMG = /\.(jpe?g|png|webp|gif|avif|bmp)$/i;

  /* ---------- the library ---------- */
  const list = async () => (await kv.get(KEY).catch(() => null)) || [];
  async function thumbOf(blob, max = 260) { const bm = await createImageBitmap(blob), k = Math.min(1, max / Math.max(bm.width, bm.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(bm.width * k)); c.height = Math.max(1, Math.round(bm.height * k)); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); const w = bm.width, h = bm.height; bm.close?.(); return { t: c.toDataURL('image/jpeg', .8), w, h }; }
  async function save(file, name) {
    try {
      if (!file || !/^image\//.test(file.type || 'image/png')) return; const sig = `${name || file.name || 'image'}|${file.size}`, l = await list(); if (l.some(x => x.sig === sig)) return;
      const { t, w, h } = await thumbOf(file), id = C.uid(); await kv.set('upb:' + id, file);
      l.unshift({ id, sig, name: (name || file.name || 'Image').replace(/\.\w+$/, '').slice(0, 40), t, w, h, at: Date.now(), size: file.size });
      while (l.length > MAXN) { const x = l.pop(); await kv.del('upb:' + x.id).catch(() => { }); } await kv.set(KEY, l); renderMine();
    } catch (e) { console.warn('upload not saved', e); }
  }
  const blobUrl = blob => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  C.uploads = { save, list };

  /* ---------- UI ---------- */
  const mine = document.createElement('div'); mine.id = 'uplMine'; mine.innerHTML = '<h4>Your uploads <button class="btn small" id="uplClear" hidden>Clear all</button></h4><div class="upl-grid" id="uplGrid"></div><p class="tip" id="uplNote"></p>';
  const fol = document.createElement('div'); fol.id = 'uplFolder'; fol.innerHTML = `<h4>Downloads folder <small>Pinterest · Creator Downloader</small></h4><div class="row2"><button class="btn" id="folPick">${ico('folder-open', 16)} Connect folder</button><button class="btn" id="folRefresh" hidden>${ico('rotate-cw', 16)} Refresh</button></div><p class="tip" id="folNote">Choose the folder your downloader saves to. New downloads appear here the moment you come back to Chitra — click one to add it.</p><div class="upl-grid" id="folGrid"></div>`;
  panel.append(mine, fol);

  async function renderMine() {
    const l = await list(), g = $('#uplGrid'); $('#uplClear').hidden = !l.length; $('#uplNote').textContent = l.length ? '' : 'Pictures you upload are kept here so you can use them again.';
    g.innerHTML = l.map(x => `<button class="upl-card" data-id="${x.id}" title="${x.name.replace(/"/g, '')} · ${x.w}×${x.h}"><img alt="" src="${x.t}"><i data-del="${x.id}" title="Remove">×</i></button>`).join('');
  }
  $('#uplGrid').onclick = async e => {
    const d = e.target.closest('[data-del]'); if (d) { e.stopPropagation(); const l = (await list()).filter(x => x.id !== d.dataset.del); await kv.set(KEY, l); await kv.del('upb:' + d.dataset.del).catch(() => { }); renderMine(); return; }
    const c = e.target.closest('[data-id]'); if (!c) return; const b = await kv.get('upb:' + c.dataset.id); if (!b) return toast('That picture is no longer stored', '⚠️'); C.addImageFromURL(await blobUrl(b));
  };
  $('#uplClear').onclick = async () => { if (!(await C.ask('Remove all saved uploads?', 'The pictures on your design are not affected.', 'Remove all'))) return; for (const x of await list()) await kv.del('upb:' + x.id).catch(() => { }); await kv.set(KEY, []); renderMine(); };

  /* ---------- connected folder (File System Access API) ---------- */
  let dir = null, files = [], busy = false; const supported = 'showDirectoryPicker' in window;
  if (!supported) { $('#folPick').disabled = true; $('#folNote').textContent = 'Connecting a folder needs desktop Chrome or Edge. On other browsers, upload the downloaded pictures above.'; }
  async function perm(h, ask) { try { let p = await h.queryPermission({ mode: 'read' }); if (p === 'prompt' && ask) p = await h.requestPermission({ mode: 'read' }); return p === 'granted'; } catch { return false; } }
  async function scan() {
    if (!dir || busy) return; busy = true; const out = [];
    try { for await (const [name, h] of dir.entries()) { if (h.kind === 'file' && IMG.test(name)) { const f = await h.getFile(); out.push({ name, h, at: f.lastModified, size: f.size }); } } } catch (e) { console.warn(e); } busy = false;
    out.sort((a, b) => b.at - a.at); files = out.slice(0, 150); drawFolder();
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(async e => { if (!e.isIntersecting) return; io.unobserve(e.target); const x = files.find(f => f.name === e.target.dataset.name); if (!x) return; try { const f = await x.h.getFile(), { t } = await thumbOf(f, 220); e.target.querySelector('img').src = t; } catch { } }), { rootMargin: '200px' }) : null;
  function drawFolder() {
    const g = $('#folGrid'); $('#folRefresh').hidden = false; $('#folNote').textContent = files.length ? `${dir.name} · ${files.length} newest pictures` : `${dir.name} has no pictures yet — download something and come back.`;
    g.innerHTML = files.map(x => `<button class="upl-card" data-name="${x.name.replace(/"/g, '&quot;')}" title="${x.name.replace(/"/g, '')}"><img alt=""></button>`).join(''); $$('#folGrid .upl-card').forEach(b => io ? io.observe(b) : 0);
  }
  $('#folGrid').onclick = async e => { const c = e.target.closest('[data-name]'); if (!c) return; const x = files.find(f => f.name === c.dataset.name); if (!x) return; try { const f = await x.h.getFile(); C.addImageFromURL(await blobUrl(f)); C.uploads.save(f, x.name); } catch { toast('Could not read that file — reconnect the folder', '⚠️'); } };
  $('#folPick').onclick = async () => {
    if (dir && !(await perm(dir, true))) dir = null;
    if (!dir) { try { dir = await window.showDirectoryPicker({ id: 'chitra-downloads', mode: 'read' }); await kv.set('dirhandle', dir); } catch { return; } }
    scan();
  };
  $('#folRefresh').onclick = scan;
  (async () => { if (!supported) return; try { const h = await kv.get('dirhandle'); if (h) { dir = h; if (await perm(h, false)) scan(); else { $('#folPick').lastChild.textContent = ' Reconnect folder'; $('#folNote').textContent = `Press Reconnect to let Chitra read “${h.name}” again (your browser asks once per visit).`; } } } catch { } })();
  addEventListener('focus', () => { if (dir && !panel.hidden) scan(); }); document.addEventListener('visibilitychange', () => { if (!document.hidden && dir && !panel.hidden) scan(); });
  document.addEventListener('click', e => { if (e.target.closest('#rail [data-tab=upload]') && dir) setTimeout(scan, 50); });
  renderMine();
})();
