import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zoned } from '../src/lib/hours.js';
import { releaseLabel, dateLine, isOut, isStale, shownReleases, fmtDate } from '../src/lib/releases.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = JSON.parse(fs.readFileSync(path.join(root, 'src/data/releases.json'), 'utf8'));
const dist = path.join(root, 'dist'), built = fs.existsSync(dist);
const home = () => fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const TZ = 'America/New_York';

test('status: out now on and after the release day, coming before', () => {
  assert.equal(releaseLabel('2026-11-13', '2026-11-13'), 'Out now');
  assert.equal(releaseLabel('2026-11-13', '2026-11-20'), 'Out now');
  assert.equal(releaseLabel('2027-02-06', '2026-11-20'), 'Coming soon');
  assert.equal(dateLine('2027-02-06', '2026-11-20'), 'In store Feb 6, 2027');
  assert.equal(dateLine('2026-11-06', '2026-11-20'), 'Released Nov 6');
  assert.equal(fmtDate('2026-11-06', '2026-11-20'), 'Nov 6');
});

test('status: too old after 90 days, kept at exactly 90', () => {
  assert.equal(isStale('2026-08-22', '2026-11-20'), false);
  assert.equal(isStale('2026-08-21', '2026-11-20'), true);
  assert.deepEqual(shownReleases([{ releaseDate: '2026-01-01' }, { releaseDate: '2027-01-01' }, { releaseDate: '2026-11-13' }], '2026-11-20').map((r) => r.releaseDate), ['2026-11-13', '2027-01-01']);
});

test('status: "today" is the New York day, not UTC', () => {
  // 2026-11-14 03:00 UTC is still Nov 13, 10pm in New York: a Nov 14 release is not out yet.
  const today = zoned(TZ, new Date('2026-11-14T03:00:00Z')).date;
  assert.equal(today, '2026-11-13');
  assert.equal(isOut('2026-11-14', today), false);
  assert.equal(releaseLabel('2026-11-14', today), 'Coming soon');
  assert.equal(releaseLabel('2026-11-14', zoned(TZ, new Date('2026-11-14T05:00:00Z')).date), 'Out now');
});

test('releases.json: only Confirmed or Likely rows; every image row has width, height, alt, credit and a JPEG fallback', () => {
  assert.ok(rel.length >= 4);
  for (const r of rel) {
    assert.match(r.certainty, /^(Confirmed|Likely)/, r.id);
    const i = r.image;
    if (!i) { assert.equal(r.id, 'one-piece-st37-38'); continue; } // drawn panel, no publisher image
    assert.ok(i.width > 0 && i.height > 0 && i.alt.length > 15 && /^Image: /.test(r.credit), r.id);
    for (const f of [i.jpg, ...i.webp.map((w) => w[0])]) assert.ok(fs.existsSync(path.join(root, 'public', f)), f);
  }
});

test('built Home: New releases cards are complete pictures and the featured one is Star Trek', { skip: !built }, () => {
  const h = home();
  assert.match(h, /<h3>New frontier\. New cards\.<\/h3>/);
  assert.match(h, /class="rel-date"/);
  assert.match(h, /Grab a pack/);
  assert.match(h, /Shop Star Trek in store/);
  const all = [...h.matchAll(/<(?:article|li) class="rel[^"]*"[\s\S]*?<\/(?:article|li)>/g)].map((m) => m[0]);
  const cards = all.filter((c) => /<img/.test(c));
  assert.ok(cards.length >= 3);
  for (const c of cards) {
    assert.match(c, /<source type="image\/webp" srcset="[^"]+-(480|578|960)\.webp/);
    const img = c.match(/<img\b[^>]*>/)[0];
    assert.match(img, /\swidth="\d+"/); assert.match(img, /\sheight="\d+"/); assert.match(img, /\salt="[^"]{15,}"/);
    assert.match(c, /class="rel-credit">Image: /);
    assert.match(c, /data-status>(Out now|Coming soon)</);
  }
  assert.doesNotMatch(cards.slice(1).join(''), /fetchpriority/); // only lazy below the featured one
  assert.equal([...cards.slice(1).join('').matchAll(/<img\b[^>]*loading="lazy"/g)].length, cards.length - 1);
});

test('Instagram facade: built pages make no request to Instagram before a tap', { skip: !built }, () => {
  for (const f of ['index.html', 'events/index.html', 'shop/index.html', 'privacy/index.html']) {
    const h = fs.readFileSync(path.join(dist, f), 'utf8');
    assert.doesNotMatch(h, /<iframe/i, f);
    assert.doesNotMatch(h, /<(?:script|link|img|source)\b[^>]*instagram\.com/i, f);
  }
  const h = home();
  const links = [...h.matchAll(/<a [^>]*data-ig="([\w-]+)"[^>]*>/g)];
  assert.ok(links.length >= 2);
  for (const [a, code] of links) { assert.ok(a.includes(`href="https://www.instagram.com/p/${code}/"`)); } // no JS: a plain link
  assert.match(h, /Show this post from Instagram/);
  assert.match(h, /Follow @mulligangames/);
  const js = fs.readFileSync(path.join(dist, 'js/home-live.js'), 'utf8');
  assert.match(js, /instagram\.com\/p\/\$\{a\.dataset\.ig\}\/embed/);
  assert.match(js, /onclick/); // the iframe is created inside the click handler only
});

test('CSP: frame-src allows instagram.com and script-src does not change', () => {
  const csp = fs.readFileSync(path.join(root, 'public/_headers'), 'utf8').match(/Content-Security-Policy:\s*(.+)/)[1];
  assert.match(csp, /frame-src [^;]*https:\/\/www\.instagram\.com/);
  assert.match(csp, /script-src 'self' https:\/\/challenges\.cloudflare\.com;/);
  assert.doesNotMatch(csp.match(/script-src[^;]*/)[0], /instagram/);
});

test('footer and privacy lines', { skip: !built }, () => {
  assert.match(home(), /Set images belong to their publishers\./);
  assert.match(fs.readFileSync(path.join(dist, 'privacy/index.html'), 'utf8'), /Instagram posts on the home page load from Instagram only after you tap/);
});

test('releases.json: TCG sets only, each with a theme (star-trek, or the game id for a generic set)', () => {
  const games = ['magic', 'pokemon', 'one-piece', 'riftbound', 'hololive', 'lorcana'];
  for (const r of rel) {
    assert.ok(games.includes(r.gameId), r.id);
    assert.equal(r.theme, r.id === 'mtg-star-trek' ? 'star-trek' : r.gameId, r.id);
  }
});

test('release ads: themed colours are :root tokens (no literals in releases.css) and every theme in the data has a panel rule', () => {
  const css = fs.readFileSync(path.join(root, 'src/styles/releases.css'), 'utf8');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  for (const th of new Set(rel.map((r) => r.theme).filter((x) => x !== 'star-trek'))) assert.match(css, new RegExp('data-theme=' + th), th);
});

test('release ads say the date once: chip is status only, one date line per card', { skip: !built }, () => {
  const h = home();
  const cards = [...h.matchAll(/<(?:article|li) class="rel[^"]*"[\s\S]*?<\/(?:article|li)>/g)].map((m) => m[0]).filter((c) => /data-release=/.test(c));
  assert.ok(cards.length >= 4);
  for (const c of cards) {
    const text = c.replace(/<[^>]+>/g, ' ');
    assert.equal((text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}\b/g) || []).length, 1, 'one date per ad: ' + text.replace(/\s+/g, ' ').slice(0, 80));
    assert.doesNotMatch(c, /Coming (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
  }
});

test('One Piece ad: drawn aria-hidden panel in place of a publisher image; sets are ordered out-now then by date', { skip: !built }, () => {
  const h = home();
  const op = h.match(/<li class="rel"[^>]*data-theme="one-piece"[\s\S]*?<\/li>/)[0];
  assert.match(op, /<div class="rel-art" aria-hidden="true">/);
  assert.doesNotMatch(op, /<img|<picture/);
  assert.match(op, /One Piece Card Game/); assert.match(op, /ST.37 and ST.38/);
  const dates = [...h.matchAll(/<li class="rel"[^>]*data-release="([\d-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(dates, [...dates].sort());
});

test('Instagram promo cards use the ad language and keep the click-to-load link', { skip: !built }, () => {
  const cards = [...home().matchAll(/<li class="rel ig-card"[\s\S]*?<\/li>/g)].map((m) => m[0]);
  assert.ok(cards.length >= 2);
  for (const c of cards) { assert.match(c, /class="rel-date"/); assert.match(c, /From @mulligangames/); assert.match(c, /data-ig="/); }
  assert.match(cards[0], /Date: confirm with the store/); assert.match(cards[0], /[$]15 or [$]30 entry/);
});
