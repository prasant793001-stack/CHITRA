/* Chitra Studio – accounts & cloud sync (talks to worker/api.js). Only active when CHITRA_CONFIG.apiUrl is set. */
(() => {
  const C = window.chitra, CFG = window.CHITRA_CONFIG || {}, { $, $$, toast, kv, ico } = C;
  const API = (CFG.apiUrl || '').replace(/\/$/, '');
  const ls = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { } } };
  const cloud = { enabled: !!API, get token() { return ls.get('chitra.token'); }, get email() { return ls.get('chitra.email'); }, get signedIn() { return !!ls.get('chitra.token'); } };
  C.cloud = cloud; if (!API) return;

  async function api(path, { method = 'GET', body, raw } = {}) {
    const r = await fetch(API + path, { method, headers: { ...(cloud.token ? { authorization: 'Bearer ' + cloud.token } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined });
    if (r.status === 401 && cloud.token) { signOut(true); throw new Error('Session expired — sign in again'); }
    const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.error || `Error ${r.status}`); e.status = r.status; throw e; } return j;
  }
  cloud.api = api;
  const setPlan = p => { ls.set('chitra.plan', p || 'free'); document.dispatchEvent(new Event('chitra:plan')); };

  /* ---------- sign-in dialog ---------- */
  const m = Object.assign(document.createElement('div'), { className: 'modal', id: 'authModal', hidden: true }); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="sheet small"><button class="x" aria-label="Close">${ico('x', 18)}</button><h2>Sign in to Chitra</h2><p class="tip" id="auHint">We'll email you a 6-digit code — no password needed. Your designs then follow you to every device.</p>
    <form id="auForm"><input id="auEmail" type="email" placeholder="you@example.com" autocomplete="email" required><input id="auCode" inputmode="numeric" maxlength="6" placeholder="6-digit code" autocomplete="one-time-code" hidden><button class="cta wide" id="auGo">Email me a code</button></form><p class="tip err" id="auErr"></p></div>`;
  document.body.appendChild(m); $('.x', m).onclick = () => { m.hidden = true; }; m.addEventListener('mousedown', e => { if (e.target === m) m.hidden = true; });
  let stage = 'email';
  $('#auForm').onsubmit = async e => {
    e.preventDefault(); const em = $('#auEmail').value.trim(), btn = $('#auGo'); $('#auErr').textContent = ''; btn.disabled = true;
    try {
      if (stage === 'email') { const r = await api('/auth/start', { method: 'POST', body: { email: em } }); stage = 'code'; $('#auCode').hidden = false; $('#auCode').focus(); btn.textContent = 'Sign in'; $('#auHint').textContent = `Code sent to ${em}. Check your inbox (and spam).`; if (r.devCode) $('#auCode').value = r.devCode; }
      else { const r = await api('/auth/verify', { method: 'POST', body: { email: em, code: $('#auCode').value.trim() } }); ls.set('chitra.token', r.token); ls.set('chitra.email', r.email); setPlan(r.plan); m.hidden = true; stage = 'email'; $('#auCode').hidden = true; $('#auCode').value = ''; btn.textContent = 'Email me a code'; paintAccount(); toast(`Signed in as ${r.email}`, ''); pull(); }
    } catch (err) { $('#auErr').textContent = err.message || 'Something went wrong'; } finally { btn.disabled = false; }
  };
  function signOut(silent) { ls.set('chitra.token', null); ls.set('chitra.email', null); setPlan('free'); paintAccount(); if (!silent) toast('Signed out', ''); }
  cloud.signIn = () => { m.hidden = false; setTimeout(() => $('#auEmail').focus(), 60); };

  /* ---------- account button ---------- */
  const btn = Object.assign(document.createElement('button'), { className: 'btn acct-btn', id: 'acctBtn' }); $('.hm-top .spacer')?.after(btn);
  function paintAccount() { btn.innerHTML = cloud.signedIn ? `<span class="avatar">${(cloud.email || '?')[0].toUpperCase()}</span><span>${cloud.email}</span>` : `${ico('users', 16)}<span>Sign in</span>`; btn.title = cloud.signedIn ? 'Click to sign out' : 'Sign in to sync your designs'; }
  btn.onclick = () => { if (cloud.signedIn) { if (confirm(`Sign out of ${cloud.email}? Designs stay on this device.`)) signOut(); } else cloud.signIn(); }; paintAccount();

  /* ---------- sync ---------- */
  let pushT = null, busy = false;
  async function push() {
    if (!cloud.signedIn || !C.projectId || !navigator.onLine) return;
    const id = C.projectId, raw = await kv.get('proj:' + id); if (!raw) return; const body = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (body.length > 19e6) return toast('This design is too large to sync (images are heavy) — it stays on this device', '');
    try { await api('/projects/' + id, { method: 'PUT', body }); setStatus('ok'); } catch (e) { setStatus('err'); if (e.status === 402) toast(e.message, ''); }
  }
  document.addEventListener('chitra:saved', () => { if (!cloud.signedIn) return; clearTimeout(pushT); pushT = setTimeout(() => push().catch(() => { }), 4000); });
  async function pull() {
    if (!cloud.signedIn || busy || !navigator.onLine) return; busy = true;
    try {
      const { items } = await api('/projects'), local = await C.store.list(); let n = 0;
      for (const r of items) { const l = local.find(x => x.id === r.id); if (l && l.updated >= (r.updated || 0)) continue; const raw = await api('/projects/' + r.id); await kv.set('proj:' + r.id, JSON.stringify(raw)); await C.store.saveMeta({ id: r.id, name: r.name || raw.name || 'Untitled', updated: r.updated || Date.now(), thumb: l?.thumb || null, w: 0, h: 0, dpi: 300, product: '', pages: (raw.pages || []).length }); n++; }
      if (n) { document.dispatchEvent(new CustomEvent('chitra:home')); toast(`${n} design${n > 1 ? 's' : ''} synced from your account`, ''); }
      const me = await api('/me'); setPlan(me.plan); setStatus('ok');
    } catch (e) { setStatus('err'); } finally { busy = false; }
  }
  const setStatus = s => { btn.dataset.sync = s; };
  document.addEventListener('chitra:home', () => { pull(); });
  addEventListener('online', () => { pull(); push().catch(() => { }); });
  if (cloud.signedIn) pull();
  if (/[?&]paid=1/.test(location.search)) { setTimeout(async () => { try { const me = await api('/me'); setPlan(me.plan); toast('Thank you! Your plan is now ' + me.plan.toUpperCase(), ''); C.confetti(); } catch { } history.replaceState(null, '', location.pathname); }, 800); }

  /* ---------- checkout ---------- */
  cloud.checkout = async plan => {
    if (!cloud.signedIn) { toast('Sign in first, then choose your plan', ''); cloud.signIn(); return; }
    try { const r = await api('/billing/checkout', { method: 'POST', body: { plan } }); location.href = r.url; } catch (e) { toast(e.message, ''); }
  };
})();
