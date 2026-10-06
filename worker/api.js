/* Chitra Studio – account, cloud-save and billing API (Cloudflare Worker + KV).
   Bindings: KV namespace  DATA.   Secrets/vars: SESSION_SECRET, ALLOWED_ORIGIN, RESEND_KEY, MAIL_FROM,
   STRIPE_KEY, STRIPE_WEBHOOK_SECRET, PRICE_PRO, PRICE_BIZ, APP_URL.  (see docs/BACKEND.md)  */
const enc = new TextEncoder(), dec = new TextDecoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const hmac = async (secret, data) => crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), enc.encode(data));
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const FREE_LIMIT = 5, MAX_BODY = 20 * 1024 * 1024;
const PLAN_LIMITS = { free: FREE_LIMIT, pro: 1000, biz: 5000 };

const cors = env => ({ 'access-control-allow-origin': env.ALLOWED_ORIGIN || '*', 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'GET,PUT,POST,DELETE,OPTIONS', 'vary': 'origin' });
const json = (env, o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', ...cors(env) } });
const safeEq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

async function makeToken(env, email, days = 30) { const p = b64u(enc.encode(JSON.stringify({ e: email, x: Date.now() + days * 864e5 }))); return `${p}.${b64u(await hmac(env.SESSION_SECRET, p))}`; }
async function readToken(env, req) {
  const m = /^Bearer (.+)$/.exec(req.headers.get('authorization') || ''); if (!m) return null; const [p, s] = m[1].split('.'); if (!p || !s) return null;
  if (!safeEq(b64u(await hmac(env.SESSION_SECRET, p)), s)) return null; try { const o = JSON.parse(dec.decode(unb64u(p))); return o.x > Date.now() ? o.e : null; } catch { return null; }
}
const getUser = async (env, email) => (await env.DATA.get(`user:${email}`, { type: 'json' })) || { plan: 'free' };
const putUser = (env, email, u) => env.DATA.put(`user:${email}`, JSON.stringify(u));
const validEmail = e => typeof e === 'string' && e.length < 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validId = id => /^[a-z0-9_-]{4,40}$/i.test(id);

async function sendCode(env, email, code) {
  if (env.DEV_ECHO_CODE === '1') return true;
  if (!env.RESEND_KEY) throw new Error('mail not configured');
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: env.MAIL_FROM, to: email, subject: `Your Chitra code: ${code}`, html: `<p>Your Chitra Studio sign-in code is</p><p style="font-size:28px;font-weight:800;letter-spacing:4px">${code}</p><p>It expires in 10 minutes. If you didn't ask for it, ignore this email.</p>` }) });
  return r.ok;
}

async function stripeVerify(env, req, raw) {
  const h = req.headers.get('stripe-signature') || '', t = /t=(\d+)/.exec(h)?.[1], sigs = [...h.matchAll(/v1=([a-f0-9]+)/g)].map(m => m[1]);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - +t) > 300) return false;
  const want = hex(await hmac(env.STRIPE_WEBHOOK_SECRET, `${t}.${raw}`)); return sigs.some(s => safeEq(s, want));
}
const form = o => Object.entries(o).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/') return json(env, { ok: true, service: 'chitra-api' });

      /* ---- stripe webhook (no user token; verified by signature) ---- */
      if (path === '/billing/webhook' && req.method === 'POST') {
        const raw = await req.text(); if (!(await stripeVerify(env, req, raw))) return json(env, { error: 'bad signature' }, 400);
        const ev = JSON.parse(raw), o = ev.data?.object || {};
        if (ev.type === 'checkout.session.completed') { const email = (o.client_reference_id || o.customer_details?.email || '').toLowerCase(), plan = o.metadata?.plan === 'biz' ? 'biz' : 'pro'; if (email) { const u = await getUser(env, email); await putUser(env, email, { ...u, plan, customer: o.customer }); if (o.customer) await env.DATA.put(`cust:${o.customer}`, email); } }
        if (ev.type === 'customer.subscription.deleted') { const email = await env.DATA.get(`cust:${o.customer}`); if (email) { const u = await getUser(env, email); await putUser(env, email, { ...u, plan: 'free' }); } }
        return json(env, { received: true });
      }

      /* ---- customer approval links: public read / comment / approve (the link itself is the secret) ---- */
      const sm = /^\/share\/([a-z0-9]{10,20})(?:\/(comment|approve))?$/i.exec(path);
      if (sm) {
        const id = sm[1], key = `s:${id}`, rec = await env.DATA.get(key, { type: 'json' }); if (!rec) return json(env, { error: 'This link has expired or does not exist' }, 404);
        if (!sm[2] && req.method === 'GET') return json(env, { name: rec.name, image: rec.image, comments: rec.comments, approved: rec.approved, created: rec.created });
        if (req.method === 'POST') {
          const ip = req.headers.get('cf-connecting-ip') || 'anon', rk = `rlc:${id}:${ip}`, n = +((await env.DATA.get(rk)) || 0); if (n >= 12) return json(env, { error: 'Too many messages — try again later' }, 429); await env.DATA.put(rk, String(n + 1), { expirationTtl: 3600 });
          const b = await req.json().catch(() => ({})), who = String(b.name || 'Customer').replace(/[<>]/g, '').slice(0, 40) || 'Customer';
          if (sm[2] === 'comment') { const text = String(b.text || '').replace(/[<>]/g, '').trim().slice(0, 400); if (!text) return json(env, { error: 'Write a comment first' }, 400); if (rec.comments.length >= 40) return json(env, { error: 'Comment limit reached' }, 400); rec.comments.push({ by: who, text, at: Date.now() }); rec.approved = null; }
          else rec.approved = { by: who, at: Date.now() };
          await env.DATA.put(key, JSON.stringify(rec), { expirationTtl: 2592000 }); return json(env, { ok: true, approved: rec.approved, comments: rec.comments });
        }
      }

      /* ---- anonymous client error reports (for the closed beta) ---- */
      if (path === '/log' && req.method === 'POST') {
        const ip = req.headers.get('cf-connecting-ip') || 'anon', rk = `rll:${ip}`, n = +((await env.DATA.get(rk)) || 0); if (n >= 20) return json(env, { ok: false }, 429); await env.DATA.put(rk, String(n + 1), { expirationTtl: 3600 });
        const raw = (await req.text()).slice(0, 2000); let b = {}; try { b = JSON.parse(raw); } catch { return json(env, { error: 'bad json' }, 400); }
        const rec = { at: Date.now(), msg: String(b.msg || '').slice(0, 300), src: String(b.src || '').slice(0, 120), ua: String(b.ua || '').slice(0, 160), v: String(b.v || '').slice(0, 20) };
        await env.DATA.put(`log:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`, JSON.stringify(rec), { expirationTtl: 604800 }); return json(env, { ok: true });
      }

      /* ---- sign-in with an emailed code ---- */
      if (path === '/auth/start' && req.method === 'POST') {
        const { email } = await req.json().catch(() => ({})); const e = String(email || '').trim().toLowerCase(); if (!validEmail(e)) return json(env, { error: 'Enter a valid email' }, 400);
        const rk = `rl:${e}`, n = +((await env.DATA.get(rk)) || 0); if (n >= 5) return json(env, { error: 'Too many attempts — try again in an hour' }, 429); await env.DATA.put(rk, String(n + 1), { expirationTtl: 3600 });
        const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1e6).padStart(6, '0');
        await env.DATA.put(`code:${e}`, JSON.stringify({ h: hex(await hmac(env.SESSION_SECRET, code + e)), tries: 0 }), { expirationTtl: 600 });
        if (!(await sendCode(env, e, code))) return json(env, { error: 'Could not send the email' }, 502);
        return json(env, env.DEV_ECHO_CODE === '1' ? { sent: true, devCode: code } : { sent: true });
      }
      if (path === '/auth/verify' && req.method === 'POST') {
        const b = await req.json().catch(() => ({})), e = String(b.email || '').trim().toLowerCase(), code = String(b.code || '').trim(); const rec = await env.DATA.get(`code:${e}`, { type: 'json' });
        if (!rec) return json(env, { error: 'Code expired — request a new one' }, 400);
        if (rec.tries >= 5) { await env.DATA.delete(`code:${e}`); return json(env, { error: 'Too many wrong codes' }, 429); }
        if (!safeEq(rec.h, hex(await hmac(env.SESSION_SECRET, code + e)))) { await env.DATA.put(`code:${e}`, JSON.stringify({ ...rec, tries: rec.tries + 1 }), { expirationTtl: 600 }); return json(env, { error: 'That code is not right' }, 400); }
        await env.DATA.delete(`code:${e}`); const u = await getUser(env, e); await putUser(env, e, u); return json(env, { token: await makeToken(env, e), email: e, plan: u.plan });
      }

      /* ---- everything below needs a signed-in user ---- */
      const email = await readToken(env, req); if (!email) return json(env, { error: 'Sign in required' }, 401);
      if (path === '/me') { const u = await getUser(env, email); return json(env, { email, plan: u.plan }); }

      if (path === '/projects' && req.method === 'GET') { const l = await env.DATA.list({ prefix: `p:${email}:` }); return json(env, { items: await Promise.all(l.keys.map(async k => ({ id: k.name.split(':').pop(), ...(await env.DATA.get(`m:${k.name.slice(2)}`, { type: 'json' })) }))) }); }
      const pm = /^\/projects\/([^/]+)$/.exec(path);
      if (pm) {
        const id = pm[1]; if (!validId(id)) return json(env, { error: 'bad id' }, 400); const key = `p:${email}:${id}`;
        if (req.method === 'GET') { const v = await env.DATA.get(key); return v ? new Response(v, { headers: { 'content-type': 'application/json', ...cors(env) } }) : json(env, { error: 'not found' }, 404); }
        if (req.method === 'DELETE') { await env.DATA.delete(key); await env.DATA.delete(`m:${email}:${id}`); return json(env, { ok: true }); }
        if (req.method === 'PUT') {
          const len = +req.headers.get('content-length') || 0; if (len > MAX_BODY) return json(env, { error: 'Design too large' }, 413);
          const body = await req.text(); if (body.length > MAX_BODY) return json(env, { error: 'Design too large' }, 413);
          const exists = await env.DATA.get(key, { type: 'stream' }); if (!exists) { const u = await getUser(env, email), n = (await env.DATA.list({ prefix: `p:${email}:` })).keys.length; if (n >= (PLAN_LIMITS[u.plan] ?? FREE_LIMIT)) return json(env, { error: `Your plan allows ${PLAN_LIMITS[u.plan] ?? FREE_LIMIT} saved designs — upgrade for more` }, 402); }
          let meta = {}; try { const o = JSON.parse(body); meta = { name: String(o.name || 'Untitled').slice(0, 80), updated: Date.now() }; } catch { return json(env, { error: 'bad json' }, 400); }
          await env.DATA.put(key, body); await env.DATA.put(`m:${email}:${id}`, JSON.stringify(meta)); return json(env, { ok: true, ...meta });
        }
      }

      if (path === '/share' && req.method === 'POST') {
        const b = await req.json().catch(() => ({})), img = String(b.image || ''); if (!/^data:image\/(png|jpeg|webp);base64,/.test(img) || img.length > 4e6) return json(env, { error: 'Image missing or too large' }, 400);
        const mine = (await env.DATA.list({ prefix: `so:${email}:` })).keys.length; if (mine >= 50) return json(env, { error: 'Too many active approval links — wait for some to expire' }, 429);
        const id = [...crypto.getRandomValues(new Uint8Array(8))].map(x => 'abcdefghijkmnpqrstuvwxyz23456789'[x % 32]).join('') + String(Date.now() % 100).padStart(2, '0'), name = String(b.name || 'Design').slice(0, 80);
        await env.DATA.put(`s:${id}`, JSON.stringify({ owner: email, name, image: img, comments: [], approved: null, created: Date.now() }), { expirationTtl: 2592000 }); await env.DATA.put(`so:${email}:${id}`, JSON.stringify({ name }), { expirationTtl: 2592000 });
        return json(env, { id });
      }
      if (path === '/billing/checkout' && req.method === 'POST') {
        const { plan } = await req.json().catch(() => ({})), price = plan === 'biz' ? env.PRICE_BIZ : env.PRICE_PRO; if (!env.STRIPE_KEY || !price) return json(env, { error: 'Billing is not configured yet' }, 503);
        const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { authorization: `Bearer ${env.STRIPE_KEY}`, 'content-type': 'application/x-www-form-urlencoded' }, body: form({ mode: 'subscription', 'line_items[0][price]': price, 'line_items[0][quantity]': 1, success_url: `${env.APP_URL}?paid=1`, cancel_url: `${env.APP_URL}?paid=0`, client_reference_id: email, customer_email: email, 'metadata[plan]': plan === 'biz' ? 'biz' : 'pro', allow_promotion_codes: 'true' }) });
        const s = await r.json(); return r.ok ? json(env, { url: s.url }) : json(env, { error: s.error?.message || 'Stripe error' }, 502);
      }
      return json(env, { error: 'not found' }, 404);
    } catch (e) { return json(env, { error: 'Server error' }, 500); }
  },
};
