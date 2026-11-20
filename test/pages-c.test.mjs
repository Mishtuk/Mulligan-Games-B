import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countLines, totalText, showRemove, focusAfterRemove, MAX_ROWS } from '../public/js/sell-rows.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('buylist rows: line count ignores blank names', () => {
  assert.equal(countLines(['', '  ', 'Lightning Bolt', undefined, 'Goblin']), 2);
  assert.equal(countLines([]), 0);
  assert.equal(totalText(['', '  ']), '', 'no total until a card has a name');
  assert.equal(totalText(['', 'Bolt']), 'lines: 1');
  assert.equal(showRemove(1), false, 'no Remove on a single row');
  assert.equal(showRemove(2), true);
  assert.equal(MAX_ROWS, 40); // the Worker's MAX_ITEMS
});

test('buylist rows: focus after removing a row', () => {
  assert.equal(focusAfterRemove(0, 3), 0);
  assert.equal(focusAfterRemove(2, 2), 1); // removed the last row: focus the new last row
  assert.equal(focusAfterRemove(0, 0), -1);
});

// ---- build output (needs `npm run build`) ----
const PAGES = ['shop/index.html', 'sell/index.html', 'visit/index.html', 'privacy/index.html', '404.html'];
const html = (f) => fs.readFileSync(path.join(root, 'dist', f), 'utf8');
const built = PAGES.every((f) => fs.existsSync(path.join(root, 'dist', f)));

test('built pages: one h1, a title with the site name, a meta description, no "The"+word headings', { skip: !built && 'run npm run build first' }, () => {
  for (const f of PAGES) {
    const s = html(f);
    assert.equal((s.match(/<h1[\s>]/g) ?? []).length, 1, `${f} h1 count`);
    assert.match(s, /<title>[^<]+ \| Mulligan Games, Warminster PA<\/title>/, `${f} title`);
    assert.match(s, /<meta name="description" content="[^"]{20,}"/, `${f} description`);
    for (const m of s.matchAll(/<h[1-3][^>]*>\s*(The\s+\w+)/g)) assert.fail(`${f}: heading "${m[1]}"`);
  }
});

test('built pages: every input, select and textarea has a label', { skip: !built && 'run npm run build first' }, () => {
  for (const f of PAGES) {
    const s = html(f);
    for (const m of s.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
      const attrs = m[2];
      if (/type="(hidden|submit)"/.test(attrs)) continue;
      const id = attrs.match(/\sid="([^"]+)"/)?.[1];
      const before = s.slice(0, m.index), openLabel = before.lastIndexOf('<label'), closeLabel = before.lastIndexOf('</label>');
      const wrapped = openLabel > closeLabel; // inside an open <label>
      const forLabel = id && new RegExp(`<label[^>]*\\sfor="${id}"`).test(s);
      assert.ok(wrapped || forLabel, `${f}: unlabelled ${m[1]} ${attrs.trim().slice(0, 60)}`);
    }
  }
});

test('built pages: forms post the Worker routes and field names', { skip: !built && 'run npm run build first' }, () => {
  const sell = html('sell/index.html');
  assert.match(sell, /action="\/api\/buylist"/);
  for (const n of ['item_name[]', 'item_set[]', 'item_cond[]', 'item_qty[]', 'payout', 'name', 'email', 'website']) assert.ok(sell.includes(`name="${n}"`), `sell ${n}`);
  assert.equal((sell.match(/name="item_name\[\]"/g) ?? []).length, 3, 'three server-rendered rows');
  assert.match(sell, /aria-live="polite"/);
  const visit = html('visit/index.html');
  assert.match(visit, /action="\/api\/contact"/);
  for (const n of ['name', 'email', 'message', 'website']) assert.ok(visit.includes(`name="${n}"`), `visit ${n}`);
  const shop = html('shop/index.html');
  assert.match(shop, /action="\/api\/request"/);
  for (const n of ['cards', 'game', 'name', 'email', 'website']) assert.ok(shop.includes(`name="${n}"`), `shop ${n}`);
});

test('built pages: no duplicate ids, no hazard stripe, no invented prices', { skip: !built && 'run npm run build first' }, () => {
  for (const f of PAGES) {
    const s = html(f), ids = [...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${f} duplicate ids`);
    assert.ok((s.match(/class="stripe/g) ?? []).length === 0, `${f} stripes`);
    assert.doesNotMatch(s.replace(/<script[\s\S]*?<\/script>/g, ''), /\$\d/, `${f} shows a price`);
  }
});

test('photo slots: at most 2, marked placeholders while store.json photos are null, real img once set', { skip: !built && 'run npm run build first' }, () => {
  const store = JSON.parse(read('src/data/store.json'));
  assert.deepEqual(Object.keys(store.photos).sort(), ['playRoom', 'storefront']);
  const pages = { storefront: 'visit/index.html', playRoom: 'events/index.html' };
  let ph = 0;
  for (const [k, f] of Object.entries(pages)) {
    const s = html(f);
    if (store.photos[k] === null) { const has = /class="ph[ "]/.test(s); assert.equal(/Photo coming:/.test(s), has, `${f} marked placeholder (local build) or nothing (deploy build)`); assert.doesNotMatch(s, /<figure[^>]*>\s*<\/figure>/, `${f} no empty figure`); ph++; }
    else { const p = store.photos[k]; assert.ok(p.src && p.alt && p.width && p.height, `${k} needs src, alt, width, height`); assert.match(s, /<img [^>]*width=/, `${f} img`); assert.doesNotMatch(s, /Photo coming:/); }
  }
  for (const f of PAGES) assert.ok((html(f).match(/class="ph[ "]/g) ?? []).length <= 1, `${f} more than one slot`);
});

test('visit page hides phone, email and Discord while they are null', { skip: !built && 'run npm run build first' }, () => {
  const s = html('visit/index.html'), store = JSON.parse(read('src/data/store.json'));
  if (!store.phone) assert.doesNotMatch(s, /href="tel:/);
  if (!store.links.discord) assert.doesNotMatch(s, /Discord/);
});

test('page scripts have no inline handlers and page CSS has no colour literals', () => {
  for (const f of ['src/pages/shop/index.astro', 'src/pages/sell/index.astro', 'src/pages/visit/index.astro', 'src/pages/404.astro', 'src/pages/privacy/index.astro']) {
    const s = read(f);
    assert.doesNotMatch(s, /<[a-z][^>]*\son[a-z]+\s*=/i, `${f} inline handler`);
    for (const m of s.matchAll(/<script\b([^>]*)>/g)) assert.match(m[1], /\bsrc=/, `${f}: inline script`);
  }
  for (const f of ['shared', 'shop-only', 'sell', 'visit', 'pages']) assert.doesNotMatch(read(`src/styles/${f}.css`), /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/, f);
});

test('shop: Sealed and Preorders come from releases.json (confirmed rows, out = sealed, coming = preorders) with a hold link each', { skip: !built && 'run npm run build first' }, async () => {
  const { holdHref, holdLine } = await import('../src/lib/shop.js');
  const rels = JSON.parse(fs.readFileSync(path.join(root, 'src/data/releases.json'), 'utf8'));
  assert.equal(holdHref('mtg-star-trek'), '/shop/?hold=mtg-star-trek#hold-mtg-star-trek');
  assert.equal(holdLine({ name: 'Star Trek', types: 'Main set' }, true), 'Hold: Star Trek (Main set)');
  assert.equal(holdLine({ name: 'X' }, false), 'Hold: X (preorder)');
  const shop = html('shop/index.html');
  const ids = [...shop.matchAll(/data-hold="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length > 0);
  for (const id of ids) {
    assert.ok(rels.some((r) => r.id === id && r.certainty === 'Confirmed'), id);
    assert.ok(shop.includes(`href="/shop/?hold=${id}#hold-${id}"`), `link ${id}`);
    assert.match(shop, new RegExp(`<p class="hold-line" id="hold-${id}">Holding [^<]+\\? Write "Hold: [^<]+" in the cards box below(?: and choose [A-Za-z ]+ as the game)?\.</p>`), `scripts-off line ${id}`);
    // loop 80: scripts off, a non-Magic set names its game (the select starts on Magic)
    if (rels.find((r) => r.id === id).gameId !== 'magic') assert.match(shop, new RegExp(`id="hold-${id}">[^<]+ and choose [A-Za-z ]+ as the game\\.</p>`), `game ${id}`);
  }
  const home = html('index.html');
  for (const m of home.matchAll(/id="rel-([a-z0-9]+-[^"]+)"/g)) assert.ok(home.includes(`href="/shop/?hold=${m[1]}#hold-${m[1]}"`), `home ${m[1]}`);
  assert.doesNotMatch(shop, /Preorders at the counter|shelf-art/);
  assert.match(shop, /Sol Ring, Commander Masters, NM, 1/);
  assert.doesNotMatch(shop, /Photo coming/);
});

// Loop 70: the pocket's core rules lived in home.css, so Shop's Sealed/Preorders pockets (loop 63) rendered with no title bar or
// padding for seven loops. Every built page that renders a pocket must load the stylesheet that styles its title bar and body.
test('every page with a pocket loads the pocket core styles', { skip: !fs.existsSync(path.join(root, 'dist')) && 'run npm run build first' }, () => {
  for (const f of ['index.html', 'shop/index.html', 'events/index.html', 'sell/index.html', 'visit/index.html']) {
    const html = read(`dist/${f}`);
    if (!/class="pocket /.test(html)) continue;
    const css = [...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map((m) => read(`dist${m[1]}`)).join('\n');
    for (const sel of ['.pocket-title{', '.pocket-body{', '.pocket-foot{']) assert.ok(css.includes(sel), `${f} loads ${sel}`);
  }
});

// Loop 80: Shop pockets in a row share title/art/text/foot rows (a 3-line title pushed its art 40px below the neighbour's),
// and drawn and photographed art windows have one shape. Measured in Chrome at 320-1600: every row's art and foot tops equal.
test('shop pockets: subgrid rows and one art-window shape', () => {
  const shop = read('src/styles/shop-only.css'), pocket = read('src/styles/pocket.css');
  assert.match(shop, /\.shop-grid \.pocket \{[^}]*grid-row: span 4;[^}]*grid-template-rows: subgrid;/);
  assert.match(pocket, /\.box-sil, \.box-shot \{[^}]*aspect-ratio: 4 \/ 3;/);
  assert.doesNotMatch(shop, /\.box-shot \{[^}]*aspect-ratio/);
});
