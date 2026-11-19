import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/worker.js';
import { makeD1 } from '../src/worker/d1-shim.js';

const schema = fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');
const ORIGIN = 'https://mulligan.test';
const XSS = '<script>alert(1)</script>';
const SQLI = "' OR 1=1 --";

function newEnv() {
  const DB = makeD1(schema);
  DB.raw.exec('DELETE FROM events'); // drop the placeholder seeds; tests add their own
  return { DB, LOCAL: '1', ASSETS: { fetch: () => new Response('asset') } };
}
const future = (days) => `strftime('%Y-%m-%d %H:%M', 'now', '+${days} days')`;
function addEvent(env, id, seats) {
  env.DB.raw.exec(`INSERT INTO events (id, title, game, starts_at, seats) VALUES (${id}, 'Test event', 'magic', ${future(2)}, ${seats ?? 'NULL'})`);
}
function post(env, path, fields, headers = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) for (const x of [].concat(v)) fd.append(k, x);
  return worker.fetch(new Request(ORIGIN + path, { method: 'POST', body: fd, headers: { referer: ORIGIN + '/somewhere/?old=1', ...headers } }), env);
}
const rows = (env, sql) => env.DB.raw.prepare(sql).all().map((r) => ({ ...r }));
const loc = (r) => r.headers.get('location');

// Per form: route, form name, valid fields, a hostile variant, and the table/column that must hold the literal text.
const FORMS = [
  { path: '/api/signup', form: 'signup', home: '/events/', table: 'registrations', col: 'name',
    setup: (env) => addEvent(env, 1, null),
    valid: { event_id: '1', name: 'Sam', email: 'sam@example.com', players_note: '2 players' },
    hostile: (s) => ({ event_id: '1', name: s, email: 'h@example.com', players_note: s }) },
  { path: '/api/buylist', form: 'buylist', home: '/sell/', table: 'buylists', col: 'name',
    valid: { name: 'Sam', email: 'sam@example.com', payout: 'cash', 'item_name[]': ['Sol Ring', 'Lightning Bolt'], 'item_set[]': ['C21', ''], 'item_cond[]': ['NM', 'LP'], 'item_qty[]': ['2', '1'], note: 'hi' },
    hostile: (s) => ({ name: s, email: 'h@example.com', payout: 'credit', 'item_name[]': [s], 'item_set[]': [s], 'item_cond[]': ['NM'], 'item_qty[]': ['1'], note: s }) },
  { path: '/api/request', form: 'request', home: '/shop/', table: 'requests', col: 'name',
    valid: { name: 'Sam', email: 'sam@example.com', game: 'magic', cards: 'Sol Ring\nCounterspell' },
    hostile: (s) => ({ name: s, email: 'h@example.com', game: 'magic', cards: s }) },
  { path: '/api/contact', form: 'contact', home: '/visit/', table: 'contacts', col: 'name',
    valid: { name: 'Sam', email: 'sam@example.com', message: 'Are you open Monday?' },
    hostile: (s) => ({ name: s, email: 'h@example.com', message: s }) },
];

for (const f of FORMS) {
  test(`${f.path}: valid input redirects to ?sent=${f.form} and stores a row`, async () => {
    const env = newEnv(); f.setup?.(env);
    const r = await post(env, f.path, f.valid);
    assert.equal(r.status, 303);
    assert.equal(loc(r), `/somewhere/?sent=${f.form}#${f.form}`);
    assert.equal(rows(env, `SELECT * FROM ${f.table}`).length, 1);
  });

  test(`${f.path}: empty input redirects to ?${f.form}=error and stores nothing`, async () => {
    const env = newEnv(); f.setup?.(env);
    const r = await post(env, f.path, {});
    assert.equal(r.status, 303);
    assert.equal(loc(r), `/somewhere/?${f.form}=error#${f.form}`);
    assert.equal(rows(env, `SELECT * FROM ${f.table}`).length, 0);
  });

  test(`${f.path}: bad email is an error`, async () => {
    const env = newEnv(); f.setup?.(env);
    const r = await post(env, f.path, { ...f.valid, email: 'not-an-email' });
    assert.equal(loc(r), `/somewhere/?${f.form}=error#${f.form}`);
  });

  for (const hostile of [XSS, SQLI]) {
    test(`${f.path}: hostile input ${JSON.stringify(hostile)} is stored inert and never reflected`, async () => {
      const env = newEnv(); f.setup?.(env);
      const r = await post(env, f.path, f.hostile(hostile));
      assert.equal(r.status, 303);
      assert.equal(await r.text(), '');
      assert.doesNotMatch(loc(r), /script|OR%20|OR 1|alert/);
      assert.equal(rows(env, `SELECT ${f.col} AS v FROM ${f.table}`)[0].v, hostile);
      if (f.path === '/api/buylist') assert.equal(rows(env, 'SELECT item_name AS v FROM buylist_items')[0].v, hostile);
      const tables = rows(env, "SELECT name FROM sqlite_master WHERE type = 'table'").map((t) => t.name);
      assert.ok(tables.includes('events') && tables.includes(f.table));
    });
  }

  test(`${f.path}: honeypot gives a silent 303 success and stores nothing`, async () => {
    const env = newEnv(); f.setup?.(env);
    const r = await post(env, f.path, { ...f.valid, website: 'http://spam.example' });
    assert.equal(r.status, 303);
    assert.equal(loc(r), `/somewhere/?sent=${f.form}#${f.form}`);
    assert.equal(rows(env, `SELECT * FROM ${f.table}`).length, 0);
  });

  test(`${f.path}: Referer from another origin falls back to ${f.home}`, async () => {
    const env = newEnv(); f.setup?.(env);
    const r = await post(env, f.path, f.valid, { referer: 'https://evil.example/phish/' });
    assert.equal(loc(r), `${f.home}?sent=${f.form}#${f.form}`);
  });

  test(`${f.path}: GET is 405, never a page`, async () => {
    const r = await worker.fetch(new Request(ORIGIN + f.path), newEnv());
    assert.equal(r.status, 405);
  });
}

test('buylist: rows are stored with item fields and blank rows skipped', async () => {
  const env = newEnv();
  await post(env, '/api/buylist', FORMS[1].valid);
  const items = rows(env, 'SELECT item_name, item_set, item_cond, qty FROM buylist_items ORDER BY id');
  assert.deepEqual(items, [
    { item_name: 'Sol Ring', item_set: 'C21', item_cond: 'NM', qty: 2 },
    { item_name: 'Lightning Bolt', item_set: '', item_cond: 'LP', qty: 1 },
  ]);
});

test('buylist: bad condition, bad qty, no items, or more than 40 items are errors', async () => {
  const base = FORMS[1].valid;
  const bad = [
    { ...base, 'item_cond[]': ['XX', 'LP'] },
    { ...base, 'item_qty[]': ['0', '1'] },
    { ...base, 'item_qty[]': ['100', '1'] },
    { ...base, 'item_name[]': [], 'item_set[]': [], 'item_cond[]': [], 'item_qty[]': [] },
    { ...base, 'item_name[]': Array(41).fill('Card'), 'item_set[]': Array(41).fill(''), 'item_cond[]': Array(41).fill('NM'), 'item_qty[]': Array(41).fill('1') },
  ];
  for (const fields of bad) {
    const env = newEnv();
    assert.equal(loc(await post(env, '/api/buylist', fields)), '/somewhere/?buylist=error#buylist');
    assert.equal(rows(env, 'SELECT * FROM buylists').length, 0);
  }
  const env = newEnv();
  const forty = { ...base, 'item_name[]': Array(40).fill('Card'), 'item_set[]': Array(40).fill(''), 'item_cond[]': Array(40).fill('NM'), 'item_qty[]': Array(40).fill('1') };
  assert.equal(loc(await post(env, '/api/buylist', forty)), '/somewhere/?sent=buylist#buylist');
  assert.equal(rows(env, 'SELECT * FROM buylist_items').length, 40);
});

test('buylist: payout must be cash or credit', async () => {
  const env = newEnv();
  assert.equal(loc(await post(env, '/api/buylist', { ...FORMS[1].valid, payout: 'bitcoin' })), '/somewhere/?buylist=error#buylist');
});

test('signup: 2-seat event, third sign-up goes to the waitlist', async () => {
  const env = newEnv(); addEvent(env, 7, 2);
  const go = (email) => post(env, '/api/signup', { event_id: '7', name: 'P', email });
  assert.equal(loc(await go('a@example.com')), '/somewhere/?sent=signup#signup');
  assert.equal(loc(await go('b@example.com')), '/somewhere/?sent=signup#signup');
  assert.equal(loc(await go('c@example.com')), '/somewhere/?sent=waitlist#signup');
  assert.deepEqual(rows(env, 'SELECT email, waitlist FROM registrations ORDER BY id'),
    [{ email: 'a@example.com', waitlist: 0 }, { email: 'b@example.com', waitlist: 0 }, { email: 'c@example.com', waitlist: 1 }]);
});

test('signup: duplicate email makes no second row and is an error', async () => {
  const env = newEnv(); addEvent(env, 7, 5);
  await post(env, '/api/signup', { event_id: '7', name: 'P', email: 'a@example.com' });
  const r = await post(env, '/api/signup', { event_id: '7', name: 'P', email: 'A@Example.com' });
  assert.equal(loc(r), '/somewhere/?signup=error#signup');
  assert.equal(rows(env, 'SELECT * FROM registrations').length, 1);
});

test('signup: unknown, cancelled and past events are errors', async () => {
  const env = newEnv(); addEvent(env, 7, 5);
  env.DB.raw.exec("INSERT INTO events (id, title, starts_at, cancelled) VALUES (8, 'Off', '2999-01-01 10:00', 1), (9, 'Past', '2000-01-01 10:00', 0)");
  for (const id of ['99', '8', '9', 'abc']) {
    assert.equal(loc(await post(env, '/api/signup', { event_id: id, name: 'P', email: 'a@example.com' })), '/somewhere/?signup=error#signup');
  }
  assert.equal(rows(env, 'SELECT * FROM registrations').length, 0);
});

test('signup: an event without seats never fills', async () => {
  const env = newEnv(); addEvent(env, 3, null);
  for (const e of ['a', 'b', 'c']) await post(env, '/api/signup', { event_id: '3', name: 'P', email: `${e}@example.com` });
  assert.deepEqual(rows(env, 'SELECT DISTINCT waitlist FROM registrations'), [{ waitlist: 0 }]);
});

test('GET /api/seats returns {event_id: seats_left} for events with seats only', async () => {
  const env = newEnv(); addEvent(env, 7, 2); addEvent(env, 3, null);
  await post(env, '/api/signup', { event_id: '7', name: 'P', email: 'a@example.com' });
  let r = await worker.fetch(new Request(ORIGIN + '/api/seats'), env);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await r.json(), { 7: 1 });
  await post(env, '/api/signup', { event_id: '7', name: 'P', email: 'b@example.com' });
  await post(env, '/api/signup', { event_id: '7', name: 'P', email: 'c@example.com' }); // waitlist
  r = await worker.fetch(new Request(ORIGIN + '/api/seats'), env);
  assert.deepEqual(await r.json(), { 7: 0 });
});

test('unknown /api/* is a 404 JSON; other paths go to assets', async () => {
  const env = newEnv();
  const r = await worker.fetch(new Request(ORIGIN + '/api/nope'), env);
  assert.equal(r.status, 404);
  assert.deepEqual(await r.json(), { error: 'Not found' });
  assert.equal(await (await worker.fetch(new Request(ORIGIN + '/'), env)).text(), 'asset');
});

test('rate limit: a blocked caller gets 429 and nothing is stored', async () => {
  const env = { ...newEnv(), FORM_LIMIT: { limit: async () => ({ success: false }) } };
  const r = await post(env, '/api/contact', FORMS[3].valid);
  assert.equal(r.status, 429);
  assert.equal(rows(env, 'SELECT * FROM contacts').length, 0);
});

test('turnstile: with a real secret and no token the post is refused; missing secret outside local fails closed', async () => {
  const env = { ...newEnv(), TURNSTILE_SECRET: 'other' };
  assert.equal(loc(await post(env, '/api/contact', FORMS[3].valid)), '/somewhere/?contact=error#contact');
  const prod = { ...newEnv(), LOCAL: undefined };
  assert.equal(loc(await post(prod, '/api/contact', FORMS[3].valid)), '/somewhere/?contact=error#contact');
});
