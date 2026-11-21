import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import releases from '../src/data/releases.json' with { type: 'json' };
import contents from '../src/data/product-contents.json' with { type: 'json' };
import { COPY, boxLine, productReleases, D4 } from '../src/lib/product.js';
import { holdHref, productHref } from '../src/lib/shop.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const skip = !fs.existsSync(dist);
const read = (f) => fs.readFileSync(path.join(dist, f), 'utf8');
const ids = productReleases().map((r) => r.id);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const text = (h) => h.replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('every confirmed release has a page, singles is never emitted, and the sitemap lists them', { skip }, () => {
  assert.ok(ids.length >= 5);
  assert.ok(!ids.includes('singles'));
  assert.ok(!fs.existsSync(path.join(dist, 'shop', 'singles')));
  const site = read('sitemap.xml');
  for (const id of ids) { assert.ok(fs.existsSync(path.join(dist, 'shop', id, 'index.html')), id); assert.match(site, new RegExp(`<loc>[^<]*/shop/${id}/</loc>`)); assert.ok(COPY[id], `${id} has the writer's copy`); }
});

test('contents lists match product-contents.json: Confirmed rows only, verbatim (the two "not stated" lines use the writer rewrites)', { skip }, () => {
  for (const id of ids) {
    const h = text(read(`shop/${id}/index.html`));
    const rows = contents[id].products;
    for (const p of rows.filter((x) => x.certainty === 'Confirmed')) {
      assert.ok(h.includes(esc(p.name).replace(/&#39;/g, "'")) || h.includes(p.name.replace(/&/g, '&amp;')) || h.includes(p.name), `${id}: name ${p.name}`);
      for (const l of p.contents) assert.ok(h.includes(boxLine(l)), `${id}: ${l}`);
    }
    for (const p of rows.filter((x) => x.certainty !== 'Confirmed')) { assert.ok(!h.includes(p.name), `${id}: Likely row shown: ${p.name}`); assert.doesNotMatch(h, /not stated/); }
  }
  const rift = read('shop/riftbound-legacy/index.html');
  assert.match(rift, /More Legacy products: contents not announced yet\./);
  assert.match(read('shop/hololive-volume-vortex/index.html'), /Packs per box and cards per pack: not announced yet/);
  assert.ok(D4 === 'Contents not announced yet');
});

test('no price on a product page: no "$", no msrp, price line reads Ask at the counter', { skip }, () => {
  for (const id of ids) {
    const h = read(`shop/${id}/index.html`), main = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
    assert.doesNotMatch(main, /\$\d|\$\s?\d|msrp/i, id);
    assert.doesNotMatch(h, /"offers"|"price"|availability/i, `${id} JSON-LD must not claim an offer`);
    assert.match(main, /<span>Price<\/span> <strong>Ask at the counter<\/strong>/, id);
    assert.match(h, /"@type":"Product"/);
  }
});

test('each product page: one h1, title <= 60, description <= 155, canonical, breadcrumb, no duplicate ids, hold link is the existing flow', { skip }, () => {
  for (const id of ids) {
    const h = read(`shop/${id}/index.html`);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1, id);
    const title = text(h.match(/<title>([^<]*)<\/title>/)[1]), desc = text(h.match(/<meta name="description" content="([^"]*)"/)[1]);
    assert.equal(title, COPY[id].title); assert.ok(title.length <= 60, `${id} title ${title.length}`);
    assert.equal(desc, COPY[id].description); assert.ok(desc.length <= 155, `${id} desc ${desc.length}`);
    assert.match(h, new RegExp(`<link rel="canonical" href="[^"]*/shop/${id}/"`));
    assert.match(h, /<nav[^>]*aria-label="Breadcrumb"/); assert.match(h, /aria-current="page"/);
    const idl = [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(idl.filter((x, i) => idl.indexOf(x) !== i), [], `${id} duplicate ids`);
    assert.equal(h.split(`href="${holdHref(id)}"`).length - 1, 2, `${id}: hero button and sticky bar`);
    assert.ok(!/<form\b/.test(h.slice(h.indexOf('<main'), h.indexOf('</main>'))), `${id}: no new form`);
    assert.match(h, /class="holdbar"/);
  }
});

test('events tie-in only where an event names the release (Star Trek)', { skip }, () => {
  assert.match(read('shop/mtg-star-trek/index.html'), /Celebrating this set: Star Trek Commander Party, Sat Nov 21, 2pm\./);
  assert.doesNotMatch(read('shop/riftbound-legacy/index.html'), /Celebrating this set/);
});

test('every link to a release from Home and Shop resolves to a built product page; no hold links on ads', { skip }, () => {
  const hrefs = (f) => [...read(f).matchAll(/href="(\/shop\/[a-z0-9-]+\/)"/g)].map((m) => m[1]);
  for (const f of ['index.html', 'shop/index.html']) {
    const h = hrefs(f).filter((x) => x !== '/shop/');
    for (const x of h) assert.ok(fs.existsSync(path.join(dist, x, 'index.html')), `${f} -> ${x}`);
    for (const id of ids) assert.ok(h.includes(productHref(id)), `${f} links ${id}`);
  }
  const home = read('index.html');
  assert.doesNotMatch(home, /href="\/shop\/#hold-|href="\/shop\/\?hold=/, 'Home ads open the product page, not the hold line');
  assert.match(read('shop/index.html'), /data-hold="mtg-star-trek"/); // pockets keep holding
});

test('home top tabs and panel CTAs go to /shop/<id>/', { skip }, () => {
  const h = read('index.html');
  for (const id of ids) assert.match(h, new RegExp(`id="tr-tab-${id}" href="/shop/${id}/"`));
});

test('tab strip scrolls with an edge cue and keeps 48px targets', () => {
  const css = fs.readFileSync(path.join(root, 'src/styles/releases.css'), 'utf8');
  assert.match(css, /\.tr-tabs \{[^}]*overflow-x: auto/);
  assert.match(css, /data-more-r\]::after/);
  assert.match(css, /\.tr-tabs a \{[^}]*min-height: 48px/);
  assert.match(fs.readFileSync(path.join(root, 'public/js/rel-tabs.js'), 'utf8'), /data-more-r/);
});
