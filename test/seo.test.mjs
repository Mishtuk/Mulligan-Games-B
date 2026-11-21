import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, LOGO } from '../src/lib/site.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const skip = !fs.existsSync(dist);
const PUBLIC = { index: '/', 'events/index': '/events/', 'shop/index': '/shop/', 'sell/index': '/sell/', 'visit/index': '/visit/', 'privacy/index': '/privacy/',
  ...Object.fromEntries(['mtg-star-trek','pokemon-delta-reign','riftbound-legacy','hololive-volume-vortex','one-piece-st37-38'].map((id) => [`shop/${id}/index`, `/shop/${id}/`])) };
const read = (f) => fs.readFileSync(path.join(dist, f), 'utf8');
const tag = (h, re) => h.match(re)?.[1];

test('sitemap.xml lists every public page once, with the site origin, and not the 404', { skip }, () => {
  const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  assert.deepEqual(locs, Object.values(PUBLIC).map((p) => SITE_URL + p).sort());
  assert.ok(!locs.some((l) => /404|nope/.test(l)));
});

test('robots.txt blocks /api/ and points at the sitemap', { skip }, () => {
  const r = read('robots.txt');
  assert.match(r, /^Disallow: \/api\/$/m);
  assert.ok(r.split('\n').includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
});

test('each public page: one canonical from SITE_URL, Open Graph and Twitter tags that match the title and description', { skip }, () => {
  for (const [file, p] of Object.entries(PUBLIC)) {
    const h = read(`${file}.html`);
    assert.equal(tag(h, /<link rel="canonical" href="([^"]+)"/), SITE_URL + p, `${p} canonical`);
    assert.equal((h.match(/rel="canonical"/g) ?? []).length, 1);
    const title = tag(h, /<title>([^<]*)<\/title>/), desc = tag(h, /<meta name="description" content="([^"]*)"/);
    const og = (k) => tag(h, new RegExp(`<meta property="og:${k}" content="([^"]*)"`));
    const tw = (k) => tag(h, new RegExp(`<meta name="twitter:${k}" content="([^"]*)"`));
    assert.equal(og('title'), title); assert.equal(tw('title'), title);
    assert.equal(og('description'), desc); assert.equal(tw('description'), desc);
    assert.equal(og('url'), SITE_URL + p);
    assert.equal(og('type'), 'website');
    assert.equal(og('image'), SITE_URL + LOGO.path); assert.equal(tw('image'), SITE_URL + LOGO.path);
    assert.equal(og('image:width'), String(LOGO.width)); assert.equal(og('image:height'), String(LOGO.height));
    assert.ok(og('image:alt'));
    assert.equal(tw('card'), 'summary');
    assert.ok(fs.existsSync(path.join(dist, LOGO.path)), 'the og:image file ships');
  }
});

test('the 404 is noindex and has no canonical', { skip }, () => {
  const h = read('404.html');
  assert.match(h, /<meta name="robots" content="noindex"/);
  assert.doesNotMatch(h, /rel="canonical"/);
});

test('JSON-LD is valid Store data: address, opening hours specification, sameAs, image, no "<" in the block', { skip }, () => {
  for (const file of Object.keys(PUBLIC)) {
    const raw = tag(read(`${file}.html`), /<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(raw && !raw.includes('<'), `${file}: block present and escaped`);
    const ld = JSON.parse(raw);
    assert.equal(ld['@type'], 'Store');
    assert.equal(ld.address['@type'], 'PostalAddress');
    for (const k of ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode']) assert.ok(ld.address[k], k);
    assert.ok(ld.openingHoursSpecification.length >= 1);
    for (const o of ld.openingHoursSpecification) {
      assert.match(o.dayOfWeek, /^(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day$/);
      assert.match(o.opens, /^\d\d:\d\d$/); assert.match(o.closes, /^\d\d:\d\d$/);
    }
    assert.ok(ld.sameAs.length >= 1 && ld.sameAs.every((u) => /^https:\/\//.test(u)));
    assert.equal(ld.image, SITE_URL + LOGO.path);
  }
});

test('hours are listed once per page: Visit has the table and its footer adds no second copy; other pages keep the footer list', { skip }, () => {
  const visit = read('visit/index.html');
  assert.equal((visit.match(/class="hours-table"/g) || []).length, 1);
  assert.ok(!/<dl class="hours"/.test(visit));
  assert.doesNotMatch(visit.slice(visit.indexOf("<footer")), /Hours<\/h2>|opening hours are above/i); // no stub link either
  for (const f of ['index.html', 'events/index.html', 'shop/index.html', 'sell/index.html', 'privacy/index.html']) {
    assert.match(read(f), /<dl class="hours"/, f);
  }
});

test('Visit shows the address once: its footer drops the Visit us column; other pages keep it', { skip }, () => {
  const foot = (f) => read(f).slice(read(f).indexOf('<footer'));
  assert.ok(!/<h2[^>]*>Visit us<\/h2>/.test(foot('visit/index.html')));
  assert.ok(!/Open in Maps/.test(foot('visit/index.html')));
  for (const f of ['index.html', 'events/index.html', 'shop/index.html', 'sell/index.html']) assert.match(foot(f), /Visit us<\/h2>/, f);
});
