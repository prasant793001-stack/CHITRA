/* Chitra Studio – studio tools: Magic Resize, version history, Brand kit, "describe it" template finder, send-to-print hand-off. */
(() => {
  const C = window.chitra, CFG = window.CHITRA_CONFIG || {}, { $, $$, toast, canvas, kv, ico } = C;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };
  function modal(id, html) {
    const m = Object.assign(document.createElement('div'), { className: 'modal', id, hidden: true }); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="sheet"><button class="x" aria-label="Close">${ico('x', 18)}</button>${html}</div>`; document.body.appendChild(m);
    $('.x', m).onclick = () => { m.hidden = true; }; m.addEventListener('mousedown', e => { if (e.target === m) m.hidden = true; }); return m;
  }
  const busyBar = msg => { const d = document.createElement('div'); d.className = 'studio-busy'; d.innerHTML = `<i></i><span>${esc(msg)}</span>`; document.body.appendChild(d); return { set: t => { $('span', d).textContent = t; }, done: () => d.remove() }; };

  /* ================= Magic Resize ================= */
  const RZ = ['Instagram post', 'Instagram portrait', 'Story / Reel / TikTok', 'Facebook post', 'Pinterest pin', 'YouTube thumbnail', 'A4', 'A3', 'Flyer', 'Poster 18×24 in', '11 oz mug wrap', 'T-shirt front', 'Presentation 16:9', 'LinkedIn banner', 'Business card', 'Postcard'];
  const rz = modal('resizeModal', `<h2>Magic Resize</h2><p class="tip">Pick the formats you need — Chitra makes a copy of this design in each one, re-fitted and saved to your projects.</p><div class="chips big rz-grid" id="rzGrid"></div><button class="cta wide" id="rzGo">Create copies</button>`);
  async function resizeTo(prods) {
    C.flushCommit(); await C.saveNow();
    const W = C.W, H = C.H, objs = canvas.toJSON(C.EXTRA).objects, bg = canvas.backgroundColor, name = $('#projectName').value.replace(/ · .*$/, ''), origId = C.projectId, job = busyBar('Resizing…');
    try {
      for (const [i, p] of prods.entries()) {
        job.set(`Creating ${p.name} (${i + 1}/${prods.length})…`);
        await C.newDocument({ product: p, template: 'blank', name: `${name} · ${p.name}` });
        const W2 = C.W, H2 = C.H, s = Math.min(W2 / W, H2 / H), copy = JSON.parse(JSON.stringify(objs));
        await new Promise(res => fabric.util.enlivenObjects(copy, list => {
          C.history.busy = true;
          list.forEach(o => {
            if (o.slot) return;
            if (o.type === 'rect' && o.width * o.scaleX >= W * 0.98 && o.height * o.scaleY >= H * 0.98) o.set({ left: 0, top: 0, width: W2, height: H2, scaleX: 1, scaleY: 1 }); // full-bleed backdrops stretch
            else o.set({ left: W2 / 2 + (o.left - W / 2) * s, top: H2 / 2 + (o.top - H / 2) * s, scaleX: o.scaleX * s, scaleY: o.scaleY * s });
            o.setCoords(); canvas.add(o);
          });
          canvas.backgroundColor = bg || ''; C.history.busy = false; canvas.renderAll(); res();
        }));
        C.commit(); C.flushCommit(); await C.saveNow();
      }
    } finally { job.done(); }
    await C.openProject(origId); toast(`${prods.length} cop${prods.length > 1 ? 'ies' : 'y'} saved to Projects`, '');
  }
  function openResize() {
    $('#rzGrid').innerHTML = RZ.map(n => { const p = C.productByName(n); return `<label class="chip rz"><input type="checkbox" value="${esc(n)}"><span>${ico(C.prodIconName(p), 14)} ${esc(n)} <small>${esc(C.dim(p))}</small></span></label>`; }).join('');
    rz.hidden = false;
  }
  $('#rzGo', rz).onclick = async () => { const names = $$('#rzGrid input:checked').map(i => i.value); if (!names.length) return toast('Tick at least one format', ''); rz.hidden = true; await resizeTo(names.map(C.productByName)); };

  /* ================= Version history ================= */
  const vh = modal('verModal', `<h2>Version history</h2><p class="tip">Chitra keeps snapshots as you work. Open one as a copy — your current design is never overwritten.</p><div class="ver-list" id="verList"></div><button class="btn wide" id="verNow">Save a version now</button>`);
  let lastVer = 0;
  async function addVersion(force) {
    const id = C.projectId; if (!id) return; if (!force && Date.now() - lastVer < 4 * 60 * 1000) return;
    const raw = await kv.get('proj:' + id); if (!raw) return; const size = typeof raw === 'string' ? raw.length : 0; if (size > 12e6) return;
    const list = (await kv.get('ver:' + id)) || []; if (list[0] && list[0].raw === raw) return;
    list.unshift({ t: Date.now(), thumb: C.cardThumb?.() || null, raw }); lastVer = Date.now(); await kv.set('ver:' + id, list.slice(0, 8));
  }
  document.addEventListener('chitra:saved', () => { addVersion(false).catch(() => { }); });
  async function openHistory() {
    const id = C.projectId, list = (await kv.get('ver:' + id)) || []; vh.hidden = false;
    $('#verList').innerHTML = list.length ? list.map((v, i) => `<div class="ver"><img alt="" src="${v.thumb || ''}"><div><b>${new Date(v.t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</b><small>${i === 0 ? 'Latest snapshot' : 'Earlier'}</small></div><button class="btn" data-v="${i}">Open copy</button></div>`).join('') : '<p class="tip">No versions yet — they appear a few minutes into editing, or tap “Save a version now”.</p>';
    $$('#verList [data-v]').forEach(b => b.onclick = async () => {
      const v = list[+b.dataset.v], o = JSON.parse(v.raw), nid = C.uid(); o.id = nid; o.name = (o.name || 'Design') + ' (restored)'; await kv.set('proj:' + nid, JSON.stringify(o));
      const metas = await C.store.list(), m = metas.find(x => x.id === id) || {}; await C.store.saveMeta({ ...m, id: nid, name: o.name, updated: Date.now(), thumb: v.thumb }); vh.hidden = true; await C.openProject(nid);
    });
  }
  $('#verNow', vh).onclick = async () => { await C.saveNow(); await addVersion(true); toast('Version saved', ''); openHistory(); };
  $('#saveChip')?.addEventListener('click', openHistory); if ($('#saveChip')) $('#saveChip').style.cursor = 'pointer';

  /* ================= Brand kit ================= */
  const bk = modal('brandModal', `<h2>Brand kit</h2><p class="tip">Save your look once, apply it to any design in one tap.</p>
    <h4>Colours</h4><div class="brand-cols" id="bkCols"></div><div class="row"><input type="color" id="bkPick" value="#6d4aff"><button class="btn" id="bkAdd">Add colour</button></div>
    <h4>Fonts</h4><div class="row"><label>Headings<select id="bkHead"></select></label><label>Body<select id="bkBody"></select></label></div>
    <h4>Logo</h4><div class="row"><img id="bkLogo" alt="" hidden><label class="btn"><input type="file" id="bkFile" accept="image/*" hidden>Upload logo</label><button class="btn" id="bkPlace">Add logo to design</button></div>
    <button class="cta wide" id="bkApply">Apply brand to this design</button>`);
  const getBrand = () => ({ colors: lsGet('chitra.brandkit.colors', lsGet('chitra.brand', [])), head: lsGet('chitra.brandkit.head', 'Poppins'), body: lsGet('chitra.brandkit.body', 'Inter'), logo: lsGet('chitra.brandkit.logo', null) });
  function paintBrand() {
    const b = getBrand(), fonts = (C.FONT_LIB || []).map(f => f[0]);
    $('#bkCols').innerHTML = b.colors.length ? b.colors.map((c, i) => `<button style="background:${c}" data-i="${i}" title="${c} (click to remove)" aria-label="Remove colour ${c}"></button>`).join('') : '<small class="tip">No colours yet.</small>';
    $$('#bkCols [data-i]').forEach(x => x.onclick = () => { const l = getBrand().colors; l.splice(+x.dataset.i, 1); lsSet('chitra.brandkit.colors', l); lsSet('chitra.brand', l); paintBrand(); });
    $('#bkHead').innerHTML = $('#bkBody').innerHTML = fonts.map(f => `<option>${esc(f)}</option>`).join(''); $('#bkHead').value = b.head; $('#bkBody').value = b.body;
    const lg = $('#bkLogo'); if (b.logo) { lg.src = b.logo; lg.hidden = false; } else lg.hidden = true;
  }
  $('#bkAdd', bk).onclick = () => { const l = getBrand().colors, c = $('#bkPick').value; if (!l.includes(c)) l.push(c); lsSet('chitra.brandkit.colors', l); lsSet('chitra.brand', l); paintBrand(); document.dispatchEvent(new Event('chitra:brand')); };
  $('#bkHead', bk).onchange = e => lsSet('chitra.brandkit.head', e.target.value); $('#bkBody', bk).onchange = e => lsSet('chitra.brandkit.body', e.target.value);
  $('#bkFile', bk).onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); lsSet('chitra.brandkit.logo', c.toDataURL('image/png')); paintBrand(); }; im.src = r.result; }; r.readAsDataURL(f); };
  $('#bkPlace', bk).onclick = () => { const l = getBrand().logo; if (!l) return toast('Upload a logo first', ''); bk.hidden = true; fabric.Image.fromURL(l, im => { im.scaleToWidth(C.u() * 0.22); im.set({ left: C.W - im.getScaledWidth() - C.u() * 0.04, top: C.H - im.getScaledHeight() - C.u() * 0.04 }); C.place(im); }); };
  $('#bkApply', bk).onclick = async () => {
    const b = getBrand(); bk.hidden = true; await C.ensureTplFonts?.([b.head, b.body]); await C.loadFont?.(b.head); await C.loadFont?.(b.body);
    const texts = canvas.getObjects().filter(C.isText), big = Math.max(0, ...texts.map(t => t.fontSize * t.scaleY));
    texts.forEach(t => { t.set('fontFamily', t.fontSize * t.scaleY >= big * 0.6 ? b.head : b.body); t.initDimensions?.(); t.dirty = true; });
    if (b.colors.length >= 2) C.applyPalette({ n: 'Brand', c: b.colors }, true);
    canvas.requestRenderAll(); C.commit(); toast('Brand applied', '');
  };
  function openBrand() { paintBrand(); bk.hidden = false; }

  /* ================= "Describe it" template finder ================= */
  const PROD_WORDS = [[/mug|cup|coffee cup/, 'mug'], [/t-?shirt|tee|dtf|hoodie|shirt/, 'tshirt'], [/instagram|insta|post|feed/, 'social'], [/story|reel|tiktok/, 'story'], [/pinterest|pin\b/, 'pinterest'], [/poster|event/, 'poster'], [/flyer|leaflet/, 'flyer'], [/invit|party|wedding|birthday|shower/, 'invite'], [/business card|card/, 'card'], [/certificate|award/, 'cert'], [/menu|restaurant/, 'menu'], [/youtube|thumbnail/, 'youtube'], [/slide|presentation|deck/, 'slides'], [/wallpaper/, 'wallpaper'], [/sticker|label/, 'sticker'], [/tumbler|pillow|tote|coaster|mouse ?pad|phone case/, 'merch']];
  const STOP = new Set('a an the for my our your me i want need make create design with of to on in and some new please template'.split(' '));
  function describe(q) {
    q = q.toLowerCase().trim(); if (!q) return null;
    const cat = (PROD_WORDS.find(([re]) => re.test(q)) || [])[1], words = q.split(/[^a-z0-9']+/).filter(w => w && !STOP.has(w));
    const META = C.TEMPLATE_META, names = Object.keys(META).filter(n => !cat || META[n].cat === cat);
    const scored = names.map(n => { const hay = `${META[n].n} ${META[n].t || ''}`.toLowerCase(); let s = 0; words.forEach(w => { if (hay.includes(w)) s += 3; }); return [n, s + Math.random() * 0.5]; }).sort((a, b) => b[1] - a[1]);
    const pick = scored[Math.floor(Math.random() * Math.min(6, scored.length))]; if (!pick) return null;
    const stripWords = PROD_WORDS.map(([re]) => re.source).join('|'); const title = q.replace(new RegExp(`\\b(${stripWords})\\b`, 'g'), ' ').split(/\s+/).filter(w => w && !STOP.has(w)).join(' ');
    return { id: pick[0], title: title.length > 2 ? title.replace(/\b\w/g, m => m.toUpperCase()) : '' };
  }
  async function magic(q) {
    const r = describe(q); if (!r) return toast('Try words like “birthday mug” or “summer sale instagram”', '');
    const m = C.TEMPLATE_META[r.id], job = busyBar('Designing…'); try {
      await C.ensureTplFonts(m.f); await C.newDocument({ product: C.productByName(m.p), template: r.id, name: r.title || m.n });
      if (r.title) { const ts = canvas.getObjects().filter(C.isText).sort((a, b) => b.fontSize * b.scaleY * b.getScaledWidth() - a.fontSize * a.scaleY * a.getScaledWidth()); const t = ts[0]; if (t) { t.set('text', /^[A-Z0-9 &'.,!?-]+$/.test(t.text) ? r.title.toUpperCase() : r.title); t.initDimensions?.(); t.dirty = true; canvas.requestRenderAll(); C.commit(); } }
    } finally { job.done(); } toast('Made it — tweak anything you like', '');
  }

  /* ================= Send to print shop ================= */
  const pr = modal('printModal', `<h2>Send to print</h2><p class="tip" id="prSum"></p>
    <div class="row"><label>Your name<input id="prName" placeholder="Your name"></label><label>Quantity<input id="prQty" type="number" min="1" value="1"></label></div>
    <label class="block">Notes for the printer<textarea id="prNote" rows="3" placeholder="Fabric colour, size, deadline…"></textarea></label>
    <div class="pr-btns"><button class="cta" id="prShare">${ico('share-2', 16) || ''}Send print file</button><button class="btn" id="prWa">WhatsApp message</button><button class="btn" id="prMail">Email</button></div><p class="tip" id="prHint"></p>`);
  const isMug = () => /mug|tumbler|coaster|sublim|pillow|mouse/i.test(C.product?.name || $('#productName').textContent);
  function jobText() { const n = $('#projectName').value; return `Print order — ${n}\nProduct: ${$('#productName').textContent} (${$('#sizeInfo').textContent})\nQuantity: ${$('#prQty').value}\nFrom: ${$('#prName').value || '—'}\nNotes: ${$('#prNote').value || '—'}\n${isMug() ? 'File: mirrored PNG for sublimation' : 'File: transparent PNG for DTF'}`; }
  function openPrint() { $('#prSum').textContent = `${$('#productName').textContent} · ${$('#sizeInfo').textContent}`; const s = CFG.shop || {}; $('#prHint').textContent = s.name ? `Sending to ${s.name}.` : 'Set your shop’s WhatsApp / email in config.js (shop) to send straight to the printer.'; pr.hidden = false; }
  $('#prWa', pr).onclick = () => { const s = CFG.shop || {}; window.open(`https://wa.me/${(s.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(jobText())}`, '_blank', 'noopener'); };
  $('#prMail', pr).onclick = () => { const s = CFG.shop || {}; location.href = `mailto:${s.email || ''}?subject=${encodeURIComponent('Print order — ' + $('#projectName').value)}&body=${encodeURIComponent(jobText())}`; };
  $('#prShare', pr).onclick = async () => {
    const kind = isMug() ? 'sub' : 'dtf'; let el; try { el = C.renderDesign(false); } catch { return toast('Could not render — an image blocks exporting', ''); }
    if (kind === 'sub') { const m = document.createElement('canvas'); m.width = el.width; m.height = el.height; const g = m.getContext('2d'); g.translate(m.width, 0); g.scale(-1, 1); g.drawImage(el, 0, 0); el = m; }
    const blob = await new Promise(r => el.toBlob(r, 'image/png')), file = new File([blob], `${$('#projectName').value.replace(/\W+/g, '-')}-${kind}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Print order', text: jobText() }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    C.exportFile(kind); toast('File downloaded — attach it to your WhatsApp/email message', '');
  };

  /* ================= entry points ================= */
  const quick = document.createElement('div'); quick.className = 'studio-tools';
  quick.innerHTML = `<form class="magic-form" id="magicForm"><i>${ico('wand-sparkles', 16)}</i><input id="magicIn" placeholder="Describe it: “birthday mug for dad”…" aria-label="Describe your design" autocomplete="off"><button class="cta" aria-label="Create">${ico('arrow-right', 16) || 'Go'}</button></form>
    <div class="st-grid"><button data-st="resize">${ico('scaling', 18)}<span>Magic Resize</span></button><button data-st="brand">${ico('palette', 18)}<span>Brand kit</span></button><button data-st="history">${ico('clock', 18)}<span>History</span></button><button data-st="print">${ico('printer', 18)}<span>Send to print</span></button></div>`;
  $('#surprise')?.after(quick);
  $('#magicForm').onsubmit = e => { e.preventDefault(); const v = $('#magicIn').value; $('#magicIn').value = ''; magic(v); };
  const ACT = { resize: openResize, brand: openBrand, history: openHistory, print: openPrint };
  $$('.st-grid [data-st]').forEach(b => b.onclick = () => ACT[b.dataset.st]());
  C.addCommand('Magic Resize (copy to other sizes)', openResize); C.addCommand('Brand kit', openBrand); C.addCommand('Version history', openHistory); C.addCommand('Send to print shop', openPrint);
  // Home: describe-it on the hero search
  const hf = $('#heroForm'); if (hf) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn magic-hero'; b.innerHTML = `${ico('wand-sparkles', 15)} Surprise me with this`; hf.after(b); b.onclick = () => { const v = $('#heroInput').value.trim(); if (!v) return toast('Type an idea first — e.g. “eid mug”', ''); magic(v); }; }
  Object.assign(C, { openResize, openBrand, openHistory, openPrint, magic, describe, resizeTo });
})();
