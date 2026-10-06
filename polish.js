/* Chitra Studio – polish layer: accessibility, keyboard shortcuts, save status, offline banner, first-run tour, shortcut help. */
(() => {
  const C = window.chitra, { $, $$, toast } = C;
  const LOGO = '<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true"><path d="M43 22.5A15 15 0 1 0 43 41.5" fill="none" stroke="#fff" stroke-width="7.5" stroke-linecap="round"/><path d="M47 9l2.6 6.4L56 18l-6.4 2.6L47 27l-2.6-6.4L38 18l6.4-2.6z" fill="#ffc93c"/></svg>';
  $$('.logo-mark').forEach(m => { m.innerHTML = LOGO; });

  /* ---------- accessibility: names for icon-only controls, dialogs, focus ---------- */
  function label(root = document) {
    $$('button, label.ibtn, a', root).forEach(b => { if (!b.hasAttribute('aria-label') && !(b.textContent || '').trim()) { const t = b.getAttribute('title') || b.dataset.tip || b.dataset.ft || b.dataset.act || b.id; if (t) b.setAttribute('aria-label', t); } });
    $$('input:not([aria-label]):not([type=hidden])', root).forEach(i => { const t = i.getAttribute('placeholder') || i.title || i.id; if (t && !i.labels?.length) i.setAttribute('aria-label', t); });
  }
  label(); new MutationObserver(m => { if (m.some(r => r.addedNodes.length)) label(); }).observe(document.body, { childList: true, subtree: true });
  $('#c')?.setAttribute('aria-label', 'Design canvas. Use arrow keys to move the selected item.');
  $$('#rail button').forEach(b => b.setAttribute('aria-label', b.textContent.trim() || b.dataset.tab));
  const skip = Object.assign(document.createElement('a'), { href: '#stage', className: 'skip-link', textContent: 'Skip to canvas' }); document.body.prepend(skip);
  skip.onclick = e => { e.preventDefault(); $('#stage')?.focus?.(); };
  $('#stage')?.setAttribute('tabindex', '-1');

  let lastFocus = null;
  $$('.modal').forEach(m => {
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    new MutationObserver(() => {
      if (!m.hidden) { lastFocus = document.activeElement; setTimeout(() => (m.querySelector('[autofocus], input, button:not(.x)') || m).focus?.(), 50); }
      else if (lastFocus && document.contains(lastFocus)) { lastFocus.focus?.(); lastFocus = null; }
    }).observe(m, { attributes: true, attributeFilter: ['hidden'] });
    m.addEventListener('keydown', e => { // keep Tab inside the open dialog
      if (e.key !== 'Tab') return; const f = $$('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])', m).filter(x => !x.disabled && x.offsetParent);
      if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    m.addEventListener('mousedown', e => { if (e.target === m) m.hidden = true; }); // click the backdrop to close
  });

  /* ---------- save status chip ---------- */
  const chip = Object.assign(document.createElement('span'), { id: 'saveChip', className: 'save-chip', role: 'status' }); chip.innerHTML = `${C.ico('check', 13)}<em>Saved</em>`;
  $('#projectName')?.after(chip);
  const setChip = (s, t) => { chip.dataset.s = s; $('em', chip).textContent = t; };
  let dirty = false;
  document.addEventListener('chitra:dirty', () => { dirty = true; setChip('dirty', 'Unsaved…'); });
  document.addEventListener('chitra:saving', () => setChip('saving', 'Saving…'));
  document.addEventListener('chitra:saved', () => { dirty = false; setChip('ok', 'Saved'); });
  document.addEventListener('chitra:savefail', () => setChip('err', 'Not saved'));
  window.addEventListener('beforeunload', e => { if (dirty) { C.saveNow?.(); e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && dirty) C.saveNow?.(); }); // phones kill tabs without warning

  /* ---------- offline banner ---------- */
  const bar = Object.assign(document.createElement('div'), { className: 'offline-bar', hidden: true, role: 'status', innerHTML: `${C.ico('triangle-alert', 14)}<span>You're offline — editing still works and is saved on this device. Photos, AI tools and new fonts need internet.</span>` });
  document.body.appendChild(bar);
  const net = () => { bar.hidden = navigator.onLine; }; addEventListener('online', () => { net(); toast('Back online', ''); }); addEventListener('offline', net); net();

  /* ---------- keyboard shortcuts ---------- */
  let clip = null;
  const ed = () => { const a = document.activeElement; return /INPUT|SELECT|TEXTAREA/.test(a?.tagName) && !/range|color|checkbox/.test(a.type || ''); };
  document.addEventListener('keydown', async e => {
    if (ed() || C.active()?.isEditing || $$('.modal').some(m => !m.hidden) || $('#home') && !$('#home').hidden) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(), cv = C.canvas;
    if (mod && k === 'a') { e.preventDefault(); const os = cv.getObjects().filter(o => !o.slot && o.selectable !== false); cv.discardActiveObject(); if (os.length > 1) cv.setActiveObject(new fabric.ActiveSelection(os, { canvas: cv })); else if (os[0]) cv.setActiveObject(os[0]); cv.requestRenderAll(); }
    else if (mod && k === 'c') { const a = cv.getActiveObject(); if (a) { e.preventDefault(); a.clone(c => { clip = c; }, C.EXTRA); toast('Copied', ''); } }
    else if (mod && k === 'x') { const a = cv.getActiveObject(); if (a) { e.preventDefault(); a.clone(c => { clip = c; }, C.EXTRA); cv.getActiveObjects().forEach(o => cv.remove(o)); cv.discardActiveObject(); C.commit(); } }
    else if (mod && k === 'v' && clip) { e.preventDefault(); clip.clone(c => { cv.discardActiveObject(); c.set({ left: c.left + 40, top: c.top + 40, evented: true }); if (c.type === 'activeSelection') { c.canvas = cv; c.forEachObject(o => cv.add(o)); c.setCoords(); } else cv.add(c); clip.set({ left: clip.left + 40, top: clip.top + 40 }); cv.setActiveObject(c); cv.requestRenderAll(); C.commit(); }, C.EXTRA); }
    else if (mod && k === ']') { e.preventDefault(); const a = cv.getActiveObject(); if (a) { e.shiftKey ? cv.bringToFront(a) : cv.bringForward(a); cv.requestRenderAll(); C.commit(); } }
    else if (mod && k === '[') { e.preventDefault(); const a = cv.getActiveObject(); if (a) { e.shiftKey ? cv.sendToBack(a) : cv.sendBackwards(a); cv.requestRenderAll(); C.commit(); } }
    else if (mod && k === 's') { e.preventDefault(); C.saveNow?.().then?.(() => toast('Saved to this device', '')); }
    else if (mod && k === '0') { e.preventDefault(); C.fit(); }
    else if (k === '?' || (e.shiftKey && k === '/')) { e.preventDefault(); openHelp(); }
  });

  const SHORT = [['Select all', 'Ctrl A'], ['Copy · Cut · Paste', 'Ctrl C · X · V'], ['Duplicate', 'Ctrl D'], ['Undo · Redo', 'Ctrl Z · Y'], ['Group · Ungroup', 'Ctrl G · Shift G'], ['Forward · Back', 'Ctrl ] · ['], ['Move 1px · 10px', 'Arrows · Shift+Arrows'], ['Edit text', 'Enter or double-click'], ['Delete', 'Del'], ['Search any tool', 'Ctrl K'], ['Save', 'Ctrl S'], ['Fit to screen', 'Ctrl 0'], ['Draw selection box', 'Drag on empty space'], ['Add to selection', 'Shift + click']];
  const help = Object.assign(document.createElement('div'), { className: 'modal', id: 'helpModal', hidden: true }); help.setAttribute('role', 'dialog'); help.setAttribute('aria-modal', 'true');
  help.innerHTML = `<div class="sheet small"><button class="x" aria-label="Close">${C.ico('x', 18)}</button><h2>Shortcuts &amp; gestures</h2><div class="kbd-list">${SHORT.map(([a, b]) => `<div><span>${a}</span><kbd>${b}</kbd></div>`).join('')}</div><p class="tip">On a phone: one finger moves, two fingers resize &amp; rotate the selected item, double-tap edits.</p><button class="cta wide" id="tourBtn">Show me around again</button></div>`;
  document.body.appendChild(help);
  $('.x', help).onclick = () => { help.hidden = true; }; help.addEventListener('mousedown', e => { if (e.target === help) help.hidden = true; });
  function openHelp() { help.hidden = false; }
  $('#tourBtn', help).onclick = () => { help.hidden = true; startTour(true); };
  C.openHelp = openHelp; $('#hmHelp') && ($('#hmHelp').onclick = openHelp);

  /* ---------- first-run tour ---------- */
  const STEPS = [
    ['#rail', 'Everything lives here', 'Templates, Elements, Text, Uploads, AI Art and Magic tools — tap one to open its panel.', 'right'],
    ['#stage', 'One tap selects, two taps edit', 'Tap anything to move or resize it. Double-tap text or a photo to change it. Drag on empty space to select several.', 'left'],
    ['#productBtn', 'Print-ready from the start', 'Pick a mug, T-shirt, A4 or social size — Chitra sets the right resolution for you.', 'bottom'],
    ['#exportBtn', 'Export for your printer', 'Transparent PNG for DTF, mirrored PNG for sublimation, or a true-size PDF.', 'bottom'],
  ];
  let tourEl = null;
  function startTour(force) {
    try { if (!force && localStorage.getItem('chitra.tour')) return; } catch { }
    if (tourEl) return; let i = 0;
    tourEl = document.createElement('div'); tourEl.className = 'tour'; tourEl.innerHTML = '<div class="tour-hole"></div><div class="tour-card" role="dialog" aria-label="Quick tour"><b></b><p></p><div class="tour-actions"><button class="btn ghost" data-t="skip">Skip</button><span class="tour-dots"></span><button class="cta" data-t="next">Next</button></div></div>'; document.body.appendChild(tourEl);
    const hole = $('.tour-hole', tourEl), card = $('.tour-card', tourEl);
    const end = () => { tourEl.remove(); tourEl = null; try { localStorage.setItem('chitra.tour', '1'); } catch { } };
    const show = () => {
      const [sel, t, d] = STEPS[i], el = $(sel), r = el.getBoundingClientRect(), pad = 6;
      Object.assign(hole.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
      $('b', card).textContent = t; $('p', card).textContent = d; $('.tour-dots', card).innerHTML = STEPS.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join(''); $('[data-t=next]', card).textContent = i === STEPS.length - 1 ? 'Start creating' : 'Next';
      const cw = Math.min(320, innerWidth - 24); card.style.width = cw + 'px';
      let x = r.right + 14, y = r.top; if (x + cw > innerWidth - 12) { x = Math.max(12, Math.min(r.left, innerWidth - cw - 12)); y = r.bottom + 14; } if (y + 180 > innerHeight) y = Math.max(12, innerHeight - 200);
      card.style.left = x + 'px'; card.style.top = y + 'px';
    };
    tourEl.onclick = e => { const t = e.target.closest('[data-t]')?.dataset.t; if (t === 'skip') end(); else if (t === 'next') { if (++i >= STEPS.length) end(); else show(); } };
    show(); $('[data-t=next]', card).focus();
  }
  document.addEventListener('chitra:editor', () => setTimeout(() => { if (!$('#app').hidden) startTour(); }, 900));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && tourEl) { tourEl.remove(); tourEl = null; try { localStorage.setItem('chitra.tour', '1'); } catch { } } });

  /* ---------- optional analytics + error reports (only when configured in config.js) ---------- */
  const CFGP = window.CHITRA_CONFIG || {};
  if (CFGP.analytics?.plausibleDomain) { const s = Object.assign(document.createElement('script'), { defer: true, src: 'https://plausible.io/js/script.js' }); s.dataset.domain = CFGP.analytics.plausibleDomain; document.head.appendChild(s); }
  if (CFGP.apiUrl && CFGP.reportErrors !== false) {
    const seen = new Set(); const send = (msg, src) => { const key = msg + src; if (seen.has(key) || seen.size > 15) return; seen.add(key); try { navigator.sendBeacon?.(CFGP.apiUrl.replace(/\/$/, '') + '/log', new Blob([JSON.stringify({ msg, src, ua: navigator.userAgent, v: 'web' })], { type: 'text/plain' })); } catch { } };
    addEventListener('error', e => send(e.message || 'error', `${(e.filename || '').split('/').pop()}:${e.lineno}`)); addEventListener('unhandledrejection', e => send(String(e.reason?.message || e.reason || 'rejection').slice(0, 300), 'promise'));
  }
  $('#cmd') && C.addCommand?.('Keyboard shortcuts & help', openHelp);
})();
