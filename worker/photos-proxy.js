/* Chitra photo proxy - a free Cloudflare Worker that holds your stock-photo API keys so they never reach the browser.
   Deploy: dash.cloudflare.com > Workers > Create > paste this file > Settings > Variables > add secrets
   PIXABAY_KEY, PEXELS_KEY (optional UNSPLASH_KEY, ALLOWED_ORIGIN = https://prasant793001-stack.github.io) > Deploy.
   Then put the worker URL in config.js as photoProxy. */
const J = (o, origin, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'access-control-allow-origin': origin, 'cache-control': 'public, max-age=300' } });
const get = async u => { const r = await fetch(u, { headers: { 'user-agent': 'chitra-studio' } }); if (!r.ok) throw new Error(r.status); return r.json(); };
const N = {
  pixabay: h => ({ id: 'p' + h.id, thumb: h.webformatURL, full: h.largeImageURL, w: h.imageWidth, h: h.imageHeight, by: h.user, link: h.pageURL, site: 'Pixabay', title: h.tags, tags: h.tags || '' }),
  pexels: p => ({ id: 'x' + p.id, thumb: p.src.medium, full: p.src.large2x || p.src.large, w: p.width, h: p.height, by: p.photographer, link: p.url, site: 'Pexels', title: p.alt || '', tags: p.alt || '' }),
  unsplash: p => ({ id: 'u' + p.id, dl: p.id, thumb: p.urls.small, full: p.urls.regular, w: p.width, h: p.height, by: p.user?.name, link: p.links?.html, site: 'Unsplash', title: p.alt_description || '', tags: `${p.alt_description || ''} ${p.description || ''}` }),
};
export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || '*', url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET', 'access-control-allow-headers': '*' } });
    if (req.headers.get('origin') && env.ALLOWED_ORIGIN && req.headers.get('origin') !== env.ALLOWED_ORIGIN) return J({ error: 'forbidden' }, origin, 403);
    if (url.pathname === '/track') { // Unsplash asks apps to ping the download endpoint when a photo is used
      const id = (url.searchParams.get('id') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
      if (id && env.UNSPLASH_KEY) await fetch(`https://api.unsplash.com/photos/${id}/download?client_id=${env.UNSPLASH_KEY}`).catch(() => { });
      return J({ ok: true }, origin);
    }
    if (url.pathname !== '/search') return J({ ok: true }, origin);
    const q = encodeURIComponent((url.searchParams.get('q') || '').slice(0, 100)), page = Math.max(1, +url.searchParams.get('page') || 1), kind = url.searchParams.get('kind') === 'graphic' ? 'graphic' : 'photo';
    const jobs = [];
    if (env.PIXABAY_KEY) jobs.push(get(`https://pixabay.com/api/?key=${env.PIXABAY_KEY}&q=${q}&page=${page}&per_page=24&safesearch=true&image_type=${kind === 'graphic' ? 'vector' : 'photo'}`).then(j => ({ items: j.hits.map(N.pixabay), more: page * 24 < j.totalHits })));
    if (kind === 'photo' && env.PEXELS_KEY) jobs.push(fetch(`https://api.pexels.com/v1/search?query=${q}&page=${page}&per_page=24`, { headers: { Authorization: env.PEXELS_KEY } }).then(r => r.json()).then(j => ({ items: (j.photos || []).map(N.pexels), more: !!j.next_page })));
    if (kind === 'photo' && env.UNSPLASH_KEY) jobs.push(get(`https://api.unsplash.com/search/photos?query=${q}&page=${page}&per_page=24&client_id=${env.UNSPLASH_KEY}`).then(j => ({ items: j.results.map(N.unsplash), more: page < j.total_pages })));
    const ok = (await Promise.allSettled(jobs)).filter(r => r.status === 'fulfilled').map(r => r.value);
    if (!ok.length) return J({ items: [], more: false, notConnected: !jobs.length }, origin);
    const out = [], max = Math.max(...ok.map(o => o.items.length));
    for (let i = 0; i < max; i++) ok.forEach(o => { if (o.items[i]) out.push(o.items[i]); });
    return J({ items: out, more: ok.some(o => o.more) }, origin);
  },
};
