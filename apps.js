/* Chitra Studio – built-in studios. "QR & barcode studio" is the owner's UDesign QR app, bundled in studio/qr.html and opened in a window inside the editor;
   its "Add to my design" button sends the finished picture straight onto the page (no download / upload round-trip). */
(() => {
  const C = window.chitra; if (!C) return; const $$ = C.$$;
  const m = Object.assign(document.createElement('div'), { className: 'modal', id: 'qrStudio', hidden: true }); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="sheet studio-sheet"><button class="x" aria-label="Close">${C.ico('x', 18)}</button><iframe id="qrFrame" title="QR code and barcode studio" allow="clipboard-write"></iframe></div>`;
  document.body.appendChild(m);
  const frame = m.querySelector('iframe'), close = () => { m.hidden = true; };
  m.querySelector('.x').onclick = close; m.addEventListener('mousedown', e => { if (e.target === m) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) close(); });
  C.openQR = () => { if (!frame.src) frame.src = 'studio/qr.html'; m.hidden = false; };
  window.addEventListener('message', async e => {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'chitra:add-image' || typeof e.data.dataUrl !== 'string' || !e.data.dataUrl.startsWith('data:image/')) return;
    if (document.body.classList.contains('on-home')) await C.newDocument({ product: C.productByName('Instagram post'), template: 'blank' }); // opened from Home: start a page first
    C.addImageFromURL(e.data.dataUrl); close(); C.toast(`${e.data.name || 'Image'} added to your design`, '');
  });
  /* theme: liquid glass dark / light */
  const setTheme = t => { document.documentElement.dataset.theme = t; try { localStorage.setItem('chitra.theme', t); } catch { } $$('[data-themebtn]').forEach(b => { b.innerHTML = C.ico(t === 'glass' ? 'sun' : 'moon', 18); b.title = t === 'glass' ? 'Switch to light glass' : 'Switch to dark glass'; }); document.querySelector('meta[name=theme-color]')?.setAttribute('content', t === 'glass' ? '#0a0820' : '#eef0ff'); };
  $$('[data-themebtn]').forEach(b => { b.onclick = () => setTheme(document.documentElement.dataset.theme === 'glass' ? 'glass-light' : 'glass'); }); setTheme(document.documentElement.dataset.theme || 'glass'); C.setTheme = setTheme;
  C.addCommand && C.addCommand('Switch light / dark glass theme', () => setTheme(document.documentElement.dataset.theme === 'glass' ? 'glass-light' : 'glass'));
  C.addCommand && C.addCommand('QR code & barcode studio', C.openQR);
  const b = document.getElementById('qrBtn'); if (b) b.onclick = C.openQR;
})();
