import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));

test('data files: ids unique, store facts present, nothing invented', () => {
  const ev = json('src/data/events.json'), store = json('src/data/store.json');
  const ids = [...ev.weekly, ...ev.oneoffs].map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ev.weekly.every((e) => e.id && e.day >= 0 && e.day <= 6 && /^\d\d:\d\d$/.test(e.time)));
  assert.equal(store.timezone, 'America/New_York');
  assert.equal(store.address.street, '445 York Road');
  assert.equal(store.phone, null);
  assert.equal(store.email, null);
  assert.equal(store.links.discord, null);
  assert.match(store.mapsUrl, /^https:\/\//);
});

test('CSS: colour literals only inside :root', () => {
  for (const f of ['src/styles/global.css', 'src/styles/home.css']) {
    const css = read(f).replace(/:root\s*\{[^}]*\}/, '');
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/, f);
  }
});

test('CSS: motion (transition, animation, translate on hover) only inside the gated media block', () => {
  const css = read('src/styles/global.css');
  const gate = css.indexOf('@media (prefers-reduced-motion: no-preference)');
  assert.ok(gate > 0);
  const before = css.slice(0, gate);
  assert.doesNotMatch(before, /transition\s*:|animation\s*:|@keyframes/);
});

test('layout and pages: no inline scripts or inline handlers (CSP), JSON data blocks only', () => {
  for (const f of ['src/layouts/Base.astro', 'src/pages/index.astro', 'src/components/TonightStrip.astro', 'src/components/OpenChip.astro']) {
    const s = read(f);
    assert.doesNotMatch(s, /<[a-z][^>]*\son[a-z]+\s*=\s*["{]/i, `${f} inline handler`);
    for (const m of s.matchAll(/<script\b([^>]*)>/g)) {
      assert.ok(/\bsrc=/.test(m[1]) || /application\/(ld\+)?json/.test(m[1]), `${f}: inline executable script <script${m[1]}>`);
    }
  }
});

test('home: card request form posts the Worker field names with a honeypot', () => {
  const s = read('src/pages/index.astro');
  assert.match(s, /action="\/api\/request"/);
  for (const n of ['name="cards"', 'name="game"', 'name="name"', 'name="email"', 'name="website"']) assert.ok(s.includes(n), n);
  const worker = read('src/worker.js');
  for (const g of ['magic', 'pokemon', 'one-piece', 'riftbound', 'hololive', 'tabletop', 'other']) {
    assert.ok(worker.includes(`'${g}'`) && s.includes(`'${g}'`), g);
  }
});

test('layout: non-affiliation line, privacy link, skip link, one motion-boot script first in head', () => {
  const s = read('src/layouts/Base.astro');
  assert.match(s, /Not affiliated with Wizards of the Coast/);
  assert.match(s, /href="\/privacy\/"/);
  assert.match(s, /href="#main"/);
  assert.ok(s.indexOf('motion-boot.js') < s.indexOf('<title>'));
});

test('headings never start with "The" + a word', () => {
  for (const f of ['src/pages/index.astro', 'src/components/BinderWeek.astro', 'src/components/TonightStrip.astro']) {
    for (const m of read(f).matchAll(/<h[1-3][^>]*>\s*(The\s+\w+)/g)) assert.fail(`${f}: ${m[1]}`);
  }
});

test('logo, favicon and fonts exist', () => {
  for (const f of ['public/img/logo/mulligan-games-340.png', 'public/img/logo/apple-touch-180.png', 'public/favicon-32.png',
    'public/fonts/titan-one-latin-400.woff2', 'public/fonts/atkinson-hyperlegible-latin-400.woff2',
    'public/fonts/atkinson-hyperlegible-latin-700.woff2', 'public/fonts/space-mono-latin-700.woff2']) {
    assert.ok(fs.existsSync(path.join(root, f)), f);
  }
});

test('binder week: open nights lead (Wednesday first), closed Monday and Tuesday last', () => {
  const s = read('src/components/BinderWeek.astro');
  assert.match(s, /const order = \[3, 4, 5, 6, 0, 1, 2\]/);
  const html = read('dist/index.html');
  const pos = (n) => html.indexOf(`>${n}</a></h3>`);
  assert.ok(pos('Wednesday') > 0 && pos('Wednesday') < pos('Sunday') && pos('Sunday') < pos('Monday') && pos('Monday') < pos('Tuesday'));
});
