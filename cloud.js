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
  const setPlan = (p, info = {}) => { ls.set('chitra.plan', p === 'trial' ? 'pro' : (p || 'free')); ls.set('chitra.trial', p === 'trial' ? '1' : null); ls.set('chitra.trialEnds', info.trialEndsAt || null); ls.set('chitra.interval', info.interval || null); document.dispatchEvent(new Event('chitra:plan')); paintAccount(); };

  /* ---------- sign-in dialog ---------- */
  const m = Object.assign(document.createElement('div'), { className: 'modal', id: 'authModal', hidden: true }); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="sheet small"><button class="x" aria-label="Close">${ico('x', 18)}</button><h2>Sign in to Chitra</h2><p class="tip" id="auHint">We'll email you a 6-digit code — no password needed. Your designs then follow you to every device.</p>
    <form id="auForm"><input id="auEmail" type="email" placeholder="you@example.com" autocomplete="email" required><input id="auCode" inputmode="numeric" maxlength="6" placeholder="6-digit code" autocomplete="one-time-code" hidden><button class="cta wide" id="auGo">Email me a code</button></form><p class="tip err" id="auErr"></p></div>`;
  if (CFG.googleClientId) { // one-tap Google sign-in (free); the ID token is verified by the server
    const box = Object.assign(document.createElement('div'), { id: 'auGoogle', style: 'display:flex;justify-content:center;margin:12px 0 4px' }); $('#auForm', m).after(box);
    const sc = Object.assign(document.createElement('script'), { src: 'https://accounts.google.com/gsi/client', async: true, onload: () => {
      window.google.accounts.id.initialize({ client_id: CFG.googleClientId, callback: async resp => { try { const r = await api('/auth/google', { method: 'POST', body: { credential: resp.credential } }); ls.set('chitra.token', r.token); ls.set('chitra.email', r.email); setPlan(r.plan, r); m.hidden = true; toast(r.plan === 'trial' ? 'Welcome! Your 7-day free trial is on' : 'Signed in', ''); pull(); } catch (err) { $('#auErr').textContent = err.message; } } });
      window.google.accounts.id.renderButton(box, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 280 }); } }); document.head.appendChild(sc);
  }
  document.body.appendChild(m); $('.x', m).onclick = () => { m.hidden = true; }; m.addEventListener('mousedown', e => { if (e.target === m) m.hidden = true; });
  let stage = 'email';
  $('#auForm').onsubmit = async e => {
    e.preventDefault(); const em = $('#auEmail').value.trim(), btn = $('#auGo'); $('#auErr').textContent = ''; btn.disabled = true;
    try {
      if (stage === 'email') { const r = await api('/auth/start', { method: 'POST', body: { email: em } }); stage = 'code'; $('#auCode').hidden = false; $('#auCode').focus(); btn.textContent = 'Sign in'; $('#auHint').textContent = `Code sent to ${em}. Check your inbox (and spam).`; if (r.devCode) $('#auCode').value = r.devCode; }
      else { const r = await api('/auth/verify', { method: 'POST', body: { email: em, code: $('#auCode').value.trim() } }); ls.set('chitra.token', r.token); ls.set('chitra.email', r.email); setPlan(r.plan, r); if (r.plan === 'trial') toast(`Welcome! Your 7-day free trial is on — everything is unlocked`, ''); m.hidden = true; stage = 'email'; $('#auCode').hidden = true; $('#auCode').value = ''; btn.textContent = 'Email me a code'; paintAccount(); toast(`Signed in as ${r.email}`, ''); pull(); }
    } catch (err) { $('#auErr').textContent = err.message || 'Something went wrong'; } finally { btn.disabled = false; }
  };
  function signOut(silent) { ls.set('chitra.token', null); ls.set('chitra.email', null); setPlan('free'); paintAccount(); if (!silent) toast('Signed out', ''); }
  cloud.signIn = () => { m.hidden = false; setTimeout(() => $('#auEmail').focus(), 60); };

  /* ---------- account button ---------- */
  const btn = Object.assign(document.createElement('button'), { className: 'btn acct-btn', id: 'acctBtn' }); $('.hm-top .spacer')?.after(btn);
  function paintAccount() { const left = ls.get('chitra.trial') ? Math.max(0, Math.ceil(((+ls.get('chitra.trialEnds') || 0) - Date.now()) / 864e5)) : null; btn.innerHTML = cloud.signedIn ? `<span class="avatar">${(cloud.email || '?')[0].toUpperCase()}</span><span>${cloud.email}</span>${left != null ? `<em class="trial-pill">Trial · ${left}d left</em>` : ''}` : `${ico('users', 16)}<span>Sign in</span>`; btn.title = cloud.signedIn ? 'Click to sign out' : 'Sign in to sync your designs'; }
  btn.onclick = async () => { if (cloud.signedIn) { if (await C.ask(`Sign out of ${cloud.email}?`, 'Designs stay on this device.', 'Sign out', false)) signOut(); } else cloud.signIn(); }; paintAccount();

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
      const me = await api('/me'); setPlan(me.plan, me); setStatus('ok');
    } catch (e) { setStatus('err'); } finally { busy = false; }
  }
  const setStatus = s => { btn.dataset.sync = s; };
  document.addEventListener('chitra:home', () => { pull(); });
  addEventListener('online', () => { pull(); push().catch(() => { }); });
  if (cloud.signedIn) pull();
  if (/[?&]paid=1/.test(location.search)) { setTimeout(async () => { try { const me = await api('/me'); setPlan(me.plan, me); toast('Thank you! Your plan is now ' + me.plan.toUpperCase(), ''); C.confetti(); } catch { } history.replaceState(null, '', location.pathname); }, 800); }


  /* ---------- customer approval links ---------- */
  const shares = () => { try { return JSON.parse(ls.get('chitra.shares') || '[]'); } catch { return []; } };
  cloud.share = async () => {
    if (!cloud.signedIn) { toast('Sign in to create approval links', ''); cloud.signIn(); return null; }
    let el; try { el = C.renderDesign(true); } catch { toast('Could not render this design', ''); return null; }
    const k = Math.min(1, 1400 / Math.max(el.width, el.height)), c = document.createElement('canvas'); c.width = Math.round(el.width * k); c.height = Math.round(el.height * k); c.getContext('2d').drawImage(el, 0, 0, c.width, c.height);
    let q = 0.88, img = c.toDataURL('image/jpeg', q); while (img.length > 3.8e6 && q > 0.4) { q -= 0.12; img = c.toDataURL('image/jpeg', q); }
    const name = $('#projectName').value; const r = await api('/share', { method: 'POST', body: { name, image: img } });
    const l = shares(); l.unshift({ id: r.id, name, at: Date.now() }); ls.set('chitra.shares', JSON.stringify(l.slice(0, 20)));
    return `${location.origin}${location.pathname}?view=${r.id}`;
  };
  const pm = $('#printModal');
  if (pm) {
    const box = document.createElement('div'); box.className = 'approve-box'; box.innerHTML = `<h4>Customer approval</h4><p class="tip">Send your customer a link to look at the design, comment and approve it — no account needed.</p><div class="pr-btns"><button class="btn" id="apMake">Create approval link</button><button class="btn" id="apCheck">Check feedback</button></div><input id="apLink" readonly hidden><p class="tip" id="apStatus"></p><div id="apList"></div>`;
    $('#prHint', pm).before(box);
    $('#apMake').onclick = async e => { e.target.disabled = true; try { const url = await cloud.share(); if (!url) return; const li = $('#apLink'); li.hidden = false; li.value = url; li.select(); try { await navigator.clipboard.writeText(url); } catch { } $('#apStatus').textContent = 'Link copied. Paste it into WhatsApp or email.'; if (navigator.share) navigator.share({ title: 'Please review my design', url }).catch(() => { }); } catch (err) { $('#apStatus').textContent = err.message; } finally { e.target.disabled = false; } };
    $('#apCheck').onclick = async () => {
      const l = shares()[0]; if (!l) return ($('#apStatus').textContent = 'Create an approval link first.');
      try { const r = await api('/share/' + l.id); $('#apStatus').innerHTML = r.approved ? `<b class="ok">Approved by ${esc(r.approved.by)}</b> ${new Date(r.approved.at).toLocaleString()}` : `Waiting for approval · ${r.comments.length} comment${r.comments.length === 1 ? '' : 's'}`; $('#apList').innerHTML = r.comments.map(m => `<div class="cm"><b>${esc(m.by)}</b> ${esc(m.text)}</div>`).join(''); } catch (err) { $('#apStatus').textContent = err.message; }
    };
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }

  /* ---------- the page a customer sees ---------- */
  const vid = new URLSearchParams(location.search).get('view');
  if (vid && /^[a-z0-9]{10,20}$/i.test(vid)) {
    document.getElementById('splash')?.remove();
    const v = Object.assign(document.createElement('div'), { id: 'viewer' }); v.innerHTML = `<header><b>${ico('sparkles', 18)} Chitra</b><span>Design review</span></header><main><div class="v-img"><img id="vImg" alt="Design to review"></div><aside><h2 id="vName">Loading…</h2><p class="tip" id="vState"></p><div id="vCom"></div><input id="vWho" placeholder="Your name" maxlength="40"><textarea id="vText" rows="3" placeholder="Tell the designer what to change…" maxlength="400"></textarea><div class="pr-btns"><button class="btn" id="vSend">Send comment</button><button class="cta" id="vOk">${ico('check', 16)} Approve design</button></div></aside></main>`;
    document.body.appendChild(v); document.body.classList.add('viewing');
    const paint = r => { $('#vImg').src = r.image || $('#vImg').src; $('#vName').textContent = r.name; $('#vState').innerHTML = r.approved ? `<b class="ok">Approved by ${esc(r.approved.by)}</b>` : 'Please review this design, then approve it or leave a comment.'; $('#vCom').innerHTML = (r.comments || []).map(m => `<div class="cm"><b>${esc(m.by)}</b> ${esc(m.text)}</div>`).join(''); };
    api('/share/' + vid).then(paint).catch(e => { $('#vName').textContent = 'Link not available'; $('#vState').textContent = e.message; });
    const post = async (kind, body) => { try { const r = await api(`/share/${vid}/${kind}`, { method: 'POST', body: { name: $('#vWho').value.trim() || 'Customer', ...body } }); const full = await api('/share/' + vid); paint(full); return r; } catch (e) { $('#vState').textContent = e.message; } };
    $('#vSend').onclick = async () => { const t = $('#vText').value.trim(); if (!t) return; await post('comment', { text: t }); $('#vText').value = ''; };
    $('#vOk').onclick = () => post('approve', {});
  }

  /* ---------- checkout ---------- */
  cloud.checkout = async plan => {
    if (!cloud.signedIn) { toast('Sign in first, then choose your plan', ''); cloud.signIn(); return; }
    try { const r = await api('/billing/checkout', { method: 'POST', body: { plan } }); location.href = r.url; } catch (e) { toast(e.message, ''); }
  };
})();
