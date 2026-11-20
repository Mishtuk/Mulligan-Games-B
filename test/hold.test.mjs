import test from 'node:test';
import assert from 'node:assert/strict';
import { holdFor } from '../public/js/hold.js';

const pocket = (id) => ({ dataset: { hold: id, line: `Hold: ${id}`, game: 'magic' } });
const holds = [pocket('mtg-star-trek'), pocket('riftbound-legacy')];

test('hold param: a known release id finds its pocket', () => {
  assert.equal(holdFor('?hold=riftbound-legacy', holds), holds[1]);
  assert.equal(holdFor('?a=1&hold=mtg-star-trek', holds), holds[0]);
});

test('hold param: unknown, missing, empty and hostile values find nothing', () => {
  for (const q of ['?hold=nope', '', '?hold=', '?hold=MTG-STAR-TREK', '?hold=<img src=x onerror=alert(1)>', '?hold=%3Cscript%3E', '?hold=mtg-star-trek%00', "?hold=' OR 1=1 --", '?hold[]=mtg-star-trek']) {
    assert.equal(holdFor(q, holds), null, q);
  }
});

test('hold flow: the status line, focus and the stale-section hide are wired', async () => {
  const { readFileSync } = await import('node:fs');
  const shop = readFileSync('dist/shop/index.html', 'utf8'), js = readFileSync('public/js/hold.js', 'utf8'), live = readFileSync('public/js/home-live.js', 'utf8');
  assert.match(shop, /id="req-hold"[^>]*role="status"[^>]*hidden/);
  assert.match(shop, /data-hold="[^"]+" data-name="[^"]+"/);
  assert.match(js, /Hold for \$\{h\.dataset\.name\} filled in\. Add your name and email\./);
  assert.match(js, /cards\.focus\(\)/);
  assert.match(live, /home-releases[\s\S]*sec\.hidden = !/);
});

// Run the real home-live.js against a tiny fake DOM: all ads stale hides the whole section, one live ad keeps it.
async function runHomeLive(dates) {
  const { readFileSync } = await import('node:fs');
  const url = (f) => new URL(`../public/js/${f}`, import.meta.url).href;
  const src = readFileSync('public/js/home-live.js', 'utf8').replace("'/js/hours.js'", `'${url('hours.js')}'`).replace("'/js/form-state.js'", `'${url('form-state.js')}'`).replace("'/js/releases.js'", `'${url('releases.js')}'`);
  const mk = (d) => ({ dataset: { release: d }, hidden: false, querySelector: (q) => (q === '[data-status]' ? { textContent: '' } : null), querySelectorAll: () => [] });
  const ads = dates.map(mk), sec = { hidden: false, querySelectorAll: () => ads };
  const keep = globalThis.document;
  globalThis.document = {
    getElementById: (id) => (id === 'hours-data' ? { textContent: JSON.stringify({ tz: 'America/New_York', hours: [] }) } : null),
    querySelectorAll: (q) => (q === '[data-release]' ? ads : []), querySelector: (q) => (q === '.home-releases' ? sec : null),
  };
  try { await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64') + '#' + Math.random()); } finally { globalThis.document = keep; }
  return { sec, ads };
}

test('home-live: when every ad is stale the New releases section is hidden; one live ad keeps it', async () => {
  const stale = await runHomeLive(['2020-01-01', '2021-06-01']);
  assert.ok(stale.ads.every((a) => a.hidden)); assert.equal(stale.sec.hidden, true);
  const live = await runHomeLive(['2020-01-01', '2099-01-01']);
  assert.equal(live.ads[1].hidden, false); assert.equal(live.sec.hidden, false);
});

test('hold prefill: query text never reaches the page as markup (text and value only)', async () => {
  const { readFileSync } = await import('node:fs');
  const js = readFileSync('public/js/hold.js', 'utf8');
  assert.doesNotMatch(js, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(/);
  assert.match(js, /note\.textContent = /); assert.match(js, /cards\.value = h\.dataset\.line/);
  assert.doesNotMatch(js, /location\.search[^;]*(?:textContent|value|innerHTML)/); // the query only selects a key
});

test('stale hold: every id in releases.json has a #hold-<id> line on Shop (generic when the set is not shown); hold.js says the same line', async () => {
  const { readFileSync } = await import('node:fs');
  const { GENERIC } = await import('../public/js/hold.js');
  assert.equal(GENERIC, 'Write the set you want held in the cards box below.');
  const shop = readFileSync('dist/shop/index.html', 'utf8'), all = JSON.parse(readFileSync('src/data/releases.json', 'utf8'));
  for (const r of all) assert.match(shop, new RegExp(`class="hold-line" id="hold-${r.id}"`), r.id);
});

// Loop 80: Shop pockets follow today in the browser like Home's ads. Run the real shop-live.js against a fake DOM: a set
// built as "coming" that is out now moves to Sealed with its date and hold line; a set 90+ days old hides; an emptied column
// shows its "Nothing ... yet" line.
async function runShopLive(sealed, pre) {
  const { readFileSync } = await import('node:fs');
  const url = (f) => new URL(`../public/js/${f}`, import.meta.url).href;
  const src = readFileSync('public/js/shop-live.js', 'utf8').replace("'/js/hours.js'", `'${url('hours.js')}'`).replace("'/js/form-state.js'", `'${url('form-state.js')}'`).replace("'/js/releases.js'", `'${url('releases.js')}'`);
  const ul = () => ({ hidden: false, nextElementSibling: { hidden: true }, items: [], append(el) { el.parentNode.items = el.parentNode.items.filter((x) => x !== el); el.parentNode = this; this.items.push(el); } });
  const lists = { out: ul(), soon: ul() };
  const mk = (d, list) => {
    const cls = new Set([list === lists.out ? 'pocket-sealed' : 'pocket-preorder']), sil = { cls: new Set(list === lists.out ? [] : ['is-pack']) };
    sil.classList = { toggle: (c, on) => (on ? sil.cls.add(c) : sil.cls.delete(c)) };
    const el = { dataset: { release: d }, hidden: false, parentNode: list, cls, classList: { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)) },
      when: { textContent: '' }, a: { dataset: { line: 'built', lineOut: `Hold: ${d} (sealed product)`, lineSoon: `Hold: ${d} (preorder)` } }, sil };
    el.querySelector = (q) => ({ '[data-hold]': el.a, '[data-when]': el.when, '.box-sil': sil })[q] ?? null;
    list.items.push(el); return el;
  };
  const pockets = [...sealed.map((d) => mk(d, lists.out)), ...pre.map((d) => mk(d, lists.soon))];
  const keep = globalThis.document;
  globalThis.document = {
    getElementById: (id) => (id === 'hours-data' ? { textContent: JSON.stringify({ tz: 'America/New_York', hours: [] }) } : null),
    querySelector: (q) => ({ '#sealed ul': lists.out, '#preorders ul': lists.soon })[q] ?? null,
    querySelectorAll: (q) => (q === '#stock [data-release]' ? pockets : []),
  };
  try { await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64') + '#' + Math.random()); } finally { globalThis.document = keep; }
  return { lists, pockets };
}
const day = (k) => new Date(Date.now() + k * 864e5).toISOString().slice(0, 10);

test('shop-live: a stale build moves an out-now set from Preorders to Sealed, hides 90-day-old sets, keeps coming ones', async () => {
  const [old, recent, nowOut, coming] = [day(-200), day(-5), day(-12), day(30)];
  const { lists, pockets } = await runShopLive([old, recent], [nowOut, coming]);
  const [pOld, pRecent, pNowOut, pComing] = pockets;
  assert.equal(pOld.hidden, true);
  assert.deepEqual(lists.out.items.filter((e) => !e.hidden), [pRecent, pNowOut]); // newest out first
  assert.deepEqual(lists.soon.items, [pComing]);
  assert.ok(pNowOut.cls.has('pocket-sealed') && !pNowOut.cls.has('pocket-preorder') && !pNowOut.sil.cls.has('is-pack'));
  assert.match(pNowOut.when.textContent, /^Released /);
  assert.equal(pNowOut.a.dataset.line, `Hold: ${nowOut} (sealed product)`);
  assert.match(pComing.when.textContent, /^In store /);
  assert.equal(lists.out.hidden, false); assert.equal(lists.out.nextElementSibling.hidden, true);
  assert.equal(lists.soon.hidden, false);
});

test('shop-live: a column left with nothing shows its empty line; every set stale empties both', async () => {
  const moved = await runShopLive([], [day(-3)]);
  assert.equal(moved.lists.soon.hidden, true); assert.equal(moved.lists.soon.nextElementSibling.hidden, false);
  assert.equal(moved.lists.out.hidden, false);
  const stale = await runShopLive([day(-300)], [day(-120)]);
  for (const l of Object.values(stale.lists)) { assert.equal(l.hidden, true); assert.equal(l.nextElementSibling.hidden, false); }
});

test('shop-live is loaded before hold.js (the hold line is fixed before the prefill reads it)', async () => {
  const { readFileSync } = await import('node:fs');
  const shop = readFileSync('dist/shop/index.html', 'utf8');
  assert.ok(shop.indexOf('/js/shop-live.js') > 0 && shop.indexOf('/js/shop-live.js') < shop.indexOf('/js/hold.js'));
  assert.match(shop, /<li class="pocket pocket-(?:sealed|preorder)" data-release="\d{4}-\d\d-\d\d">/);
  assert.match(shop, /data-line-out="Hold: [^"]+" data-line-soon="Hold: [^"]+"/);
  assert.doesNotMatch(readFileSync('public/js/shop-live.js', 'utf8'), /innerHTML|outerHTML|insertAdjacentHTML/);
});
