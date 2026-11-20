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
