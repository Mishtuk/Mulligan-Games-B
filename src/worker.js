// One Worker for the site's forms. Pattern: kit cloudflare-form-worker. Column names come from this file, never from the request.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEST_SECRET = '1x0000000000000000000000000000000AA'; // Cloudflare's public always-pass Turnstile test secret
const CONDS = ['NM', 'LP', 'MP', 'HP', 'DMG'];
const GAMES = ['magic', 'pokemon', 'one-piece', 'riftbound', 'hololive', 'tabletop', 'other'];
const MAX_ITEMS = 40;
const MAX_BODY = 30000;

const UPCOMING = "starts_at > strftime('%Y-%m-%d %H:%M', 'now')";
// One statement, so two people cannot take the last seat: seated while seats remain (no seats = no limit), else waitlist.
const SIGNUP_SQL = `INSERT OR IGNORE INTO registrations (event_id, name, email, players_note, waitlist)
  SELECT id, ?2, ?3, ?4, COALESCE((SELECT count(*) FROM registrations WHERE event_id = ?1 AND waitlist = 0) >= seats, 0)
  FROM events WHERE id = ?1 AND cancelled = 0 AND ${UPCOMING}`;

const text = (max, opt) => ({ max, opt });
const FORMS = {
  '/api/signup': { form: 'signup', home: '/events/', save: saveSignup, fields: {
    event_id: { type: 'int', min: 1, max: 1e13 }, name: text(80), email: { type: 'email' }, players_note: text(200, 1) } },
  '/api/buylist': { form: 'buylist', home: '/sell/', save: saveBuylist, fields: {
    name: text(80), email: { type: 'email' }, payout: { type: 'pick', of: ['cash', 'credit'] }, note: text(500, 1) } },
  '/api/request': { form: 'request', home: '/shop/', pages: ['/shop/', '/'], save: saveRequest, fields: {
    name: text(80), email: { type: 'email' }, game: { type: 'pick', of: GAMES }, cards: { type: 'lines', max: 50, line: 100 } } },
  '/api/contact': { form: 'contact', home: '/visit/', save: saveContact, fields: {
    name: text(80), email: { type: 'email' }, message: text(1000) } },
};

function validate(fields, b) {
  const errors = {}, v = {};
  for (const [k, f] of Object.entries(fields)) {
    const s = String(b[k] ?? '').trim();
    let x = s;
    if (!s) { if (!f.opt) errors[k] = 'Required'; v[k] = ''; continue; }
    if (f.type === 'email') { if (!EMAIL.test(s) || s.length > 120) errors[k] = 'Valid email required'; x = s.toLowerCase(); }
    else if (f.type === 'int') { x = Number(s); if (!Number.isInteger(x) || x < f.min || x > f.max) errors[k] = 'Whole number'; }
    else if (f.type === 'pick') { if (!f.of.includes(s)) errors[k] = 'Choose one'; }
    else if (f.type === 'lines') {
      const ls = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (ls.length > f.max || ls.some((l) => l.length > f.line)) errors[k] = 'Too long';
      x = ls.join('\n');
    } else if (s.length > (f.max ?? 200)) errors[k] = 'Too long';
    v[k] = x;
  }
  return { errors, v };
}

// Buylist rows arrive as parallel fields item_name[], item_set[], item_cond[], item_qty[]. Blank rows are skipped.
function readItems(fd) {
  const names = fd.getAll('item_name[]'), sets = fd.getAll('item_set[]'), conds = fd.getAll('item_cond[]'), qtys = fd.getAll('item_qty[]');
  const rows = [];
  for (let i = 0; i < Math.max(names.length, sets.length, qtys.length); i++) {
    const name = String(names[i] ?? '').trim(), set = String(sets[i] ?? '').trim();
    if (!name && !set) continue;
    const cond = String(conds[i] ?? 'NM').trim(), qty = Number(String(qtys[i] ?? '1').trim());
    if (!name || name.length > 100 || set.length > 80 || !CONDS.includes(cond) || !Number.isInteger(qty) || qty < 1 || qty > 99) return null;
    rows.push([name, set, cond, qty]);
  }
  return rows.length >= 1 && rows.length <= MAX_ITEMS ? rows : null;
}

async function saveSignup(env, v) {
  const r = await env.DB.prepare(SIGNUP_SQL).bind(v.event_id, v.name, v.email, v.players_note).run();
  if (!r.meta.changes) return { ok: false }; // repeat email, cancelled, past or unknown event
  const row = await env.DB.prepare('SELECT waitlist FROM registrations WHERE event_id = ? AND email = ?').bind(v.event_id, v.email).first();
  return { ok: true, waitlist: !!row?.waitlist };
}
async function saveBuylist(env, v, fd) {
  const items = readItems(fd);
  if (!items) return { ok: false };
  const r = await env.DB.prepare('INSERT INTO buylists (name, email, payout, note) VALUES (?, ?, ?, ?)').bind(v.name, v.email, v.payout, v.note).run();
  for (const [name, set, cond, qty] of items) {
    await env.DB.prepare('INSERT INTO buylist_items (buylist_id, item_name, item_set, item_cond, qty) VALUES (?, ?, ?, ?, ?)')
      .bind(r.meta.last_row_id, name, set, cond, qty).run();
  }
  return { ok: true };
}
async function saveRequest(env, v) {
  await env.DB.prepare('INSERT INTO requests (name, email, game, cards) VALUES (?, ?, ?, ?)').bind(v.name, v.email, v.game, v.cards).run();
  return { ok: true };
}
async function saveContact(env, v) {
  await env.DB.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)').bind(v.name, v.email, v.message).run();
  return { ok: true };
}

async function human(token, ip, env) {
  if (env.TURNSTILE_SECRET === TEST_SECRET) return true;
  if (!env.TURNSTILE_SECRET) return env.LOCAL === '1'; // missing secret passes only in local mode, never in production
  if (!token || String(token).length > 2048) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET); body.append('response', token); if (ip) body.append('remoteip', ip);
  try { return (await (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })).json()).success === true; }
  catch { return false; }
}

// Back to the page that sent the form, but only a page from the form's own fixed list (never a raw Referer path).
function pageOf(req, cfg) {
  try {
    const ref = new URL(req.headers.get('referer') ?? '');
    if (ref.origin === new URL(req.url).origin && (cfg.pages ?? [cfg.home]).includes(ref.pathname)) return ref.pathname;
  } catch { /* no or bad Referer */ }
  return cfg.home;
}

// Reads the body up to max bytes; null when it is bigger. A declared Content-Length over the cap is refused before
// reading. A body sent without one (HTTP/2, chunked, some proxies) is streamed and cut off as soon as it passes the cap.
async function readCapped(req, max) {
  const declared = req.headers.get('content-length');
  if (/^\d+$/.test(declared ?? '') && Number(declared) > max) return null;
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader(), parts = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) { await reader.cancel().catch(() => {}); return null; }
    parts.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.byteLength; }
  return out;
}

const NO_STORE = { 'Cache-Control': 'no-store' };
const json = (data, status = 200) => Response.json(data, { status, headers: NO_STORE });
const plain = (text, status, headers = {}) => new Response(text, { status, headers: { ...NO_STORE, ...headers } });
const FORM_TYPES = /^(application\/x-www-form-urlencoded|multipart\/form-data)\b/i;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);

    if (url.pathname === '/api/seats') {
      if (req.method !== 'GET') return plain('Method not allowed', 405, { Allow: 'GET' });
      try {
        const { results } = await env.DB.prepare(`SELECT id, seats - (SELECT count(*) FROM registrations WHERE event_id = e.id AND waitlist = 0) AS seats_left
          FROM events e WHERE seats IS NOT NULL AND cancelled = 0 AND ${UPCOMING}`).all();
        return json(Object.fromEntries(results.map((r) => [r.id, Math.max(0, r.seats_left)])));
      } catch (err) {
        console.error('seats failed', err?.message);
        return json({ error: 'Try again later' }, 500);
      }
    }

    const cfg = FORMS[url.pathname];
    if (!cfg) return json({ error: 'Not found' }, 404);
    if (req.method !== 'POST') return plain('Method not allowed', 405, { Allow: 'POST' });
    // A browser form post names its own origin; a different one is another site posting for the visitor.
    const origin = req.headers.get('origin');
    if (origin && origin !== url.origin) return plain('Forbidden', 403);
    if (!FORM_TYPES.test(req.headers.get('content-type') ?? '')) return plain('Unsupported', 415);

    const page = pageOf(req, cfg);
    // The #<form>-ok|-wait|-err fragment shows the panel by CSS :target when scripts are off; the script reads the query.
    const done = (ok, sent = cfg.form) => new Response(null, { status: 303,
      headers: { ...NO_STORE, Location: `${page}?${ok ? `sent=${sent}` : `${cfg.form}=error`}#${cfg.form}-${!ok ? 'err' : sent === 'waitlist' ? 'wait' : 'ok'}` } });

    const ip = req.headers.get('CF-Connecting-IP') ?? '';
    if (env.FORM_LIMIT && !(await env.FORM_LIMIT.limit({ key: ip + url.pathname })).success) return plain('Slow down', 429);
    const raw = await readCapped(req, MAX_BODY);
    if (!raw) return done(false); // over the cap, with or without a Content-Length header
    const fd = await new Response(raw, { headers: { 'content-type': req.headers.get('content-type') } }).formData()
      .catch(() => new FormData());
    const b = Object.fromEntries([...fd.entries()].map(([k, x]) => [k, typeof x === 'string' ? x : '']));
    if (b.website) return done(true); // honeypot: pretend success, store nothing
    if (!(await human(b['cf-turnstile-response'], ip, env))) return done(false);

    const { errors, v } = validate(cfg.fields, b);
    if (Object.keys(errors).length) return done(false);
    try {
      const r = await cfg.save(env, v, fd);
      return r.ok ? done(true, r.waitlist ? 'waitlist' : cfg.form) : done(false);
    } catch (err) {
      console.error('form save failed', url.pathname, err?.message);
      return done(false);
    }
  },
};
