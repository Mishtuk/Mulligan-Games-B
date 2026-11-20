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
