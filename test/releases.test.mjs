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

test('status: real data, fixed build days: Star Trek is shown through Feb 11 2027 (day 90) and gone from Feb 12', () => {
  const ids = (t) => shownReleases(rel, t).map((r) => r.id);
  assert.ok(ids('2026-11-20').includes('mtg-star-trek'));
  assert.ok(ids('2027-02-11').includes('mtg-star-trek'));
  assert.ok(!ids('2027-02-12').includes('mtg-star-trek'));
  assert.ok(!ids('2027-02-20').includes('mtg-star-trek')); // a build on 2027-02-20 does not advertise Star Trek as new
  assert.equal(releaseLabel('2026-11-13', '2027-02-20'), 'Out now');
  assert.deepEqual(ids('2027-02-20'), ['riftbound-legacy', 'one-piece-st37-38', 'hololive-volume-vortex']); // out first, then coming by date
  assert.equal(ids('2027-08-01').length, 0); // everything old: the section hides, no crash
});

test('status: any build day leaves a featured set with a publisher image (the component never indexes a drawn panel)', () => {
  for (let d = Date.UTC(2026, 10, 1); d < Date.UTC(2027, 8, 1); d += 864e5) {
    const t = new Date(d).toISOString().slice(0, 10), rows = shownReleases(rel, t);
    const feat = rows.find((r) => r.id === 'mtg-star-trek') ?? rows.find((r) => r.image);
    if (rows.some((r) => r.image)) assert.ok(feat?.image, t);
  }
});

test('status: "today" is the New York day, not UTC', () => {
  // 2026-11-14 03:00 UTC is still Nov 13, 10pm in New York: a Nov 14 release is not out yet.
  const today = zoned(TZ, new Date('2026-11-14T03:00:00Z')).date;
  assert.equal(today, '2026-11-13');
  assert.equal(isOut('2026-11-14', today), false);
  assert.equal(releaseLabel('2026-11-14', today), 'Coming soon');
  assert.equal(releaseLabel('2026-11-14', zoned(TZ, new Date('2026-11-14T05:00:00Z')).date), 'Out now');
});

test('releases.json: only Confirmed rows (an ad states its date as fact, so a Likely date never ships); every image row has width, height, credit and a JPEG fallback', () => {
  assert.ok(rel.length >= 4);
  for (const r of rel) {
    assert.match(r.certainty, /^Confirmed/, r.id);
    const i = r.image;
    if (!i) { assert.equal(r.id, 'one-piece-st37-38'); continue; } // drawn panel, no publisher image
    assert.ok(i.width > 0 && i.height > 0 && /^Image: /.test(r.credit), r.id);
    for (const f of [i.jpg, ...i.webp.map((w) => w[0])]) assert.ok(fs.existsSync(path.join(root, 'public', f)), f);
  }
});

test('built Home: New releases cards are complete pictures and the featured one is Star Trek', { skip: !built }, () => {
  const h = home();
  assert.match(h, /<h3>Star Trek has landed at Mulligan\.<\/h3>/);
  assert.match(h, /Main set \(TRK\) and Commander decks \(TRC\)/); // owner-requested products line (rule 5)
  assert.match(h, /class="rel-date"/);
  assert.match(h, /Hold a box for me/);
  assert.match(h, /Hold a deck for me/);
  assert.match(h, /Get Star Trek: hold one for me/); // featured CTA (loop 70)
  const all = [...h.matchAll(/<(?:article|li) class="rel[^"]*"[\s\S]*?<\/(?:article|li)>/g)].map((m) => m[0]);
  const cards = all.filter((c) => /<img/.test(c) && !/class="rel-art"/.test(c)).filter((c) => !/ig-card/.test(c));
  assert.ok(cards.length >= 3);
  for (const c of cards) {
    assert.match(c, /<source type="image\/webp" srcset="[^"]+-(320|480|578|960)\.webp/);
    const img = c.match(/<img\b[^>]*>/)[0];
    assert.match(img, /\swidth="\d+"/); assert.match(img, /\sheight="\d+"/); assert.match(img, /\salt=""/); // decorative: the card text names the set
    assert.match(c, /class="rel-credit">Image: /);
    assert.match(c, /data-status>(Out now|Coming soon)</);
  }
  assert.doesNotMatch(cards.join(''), /fetchpriority/); // the whole section is below the fold (see test/images.test.mjs)
  assert.equal([...cards.join('').matchAll(/<img\b[^>]*loading="lazy"/g)].length, [...cards.join('').matchAll(/<img\b/g)].length); // every card image is lazy
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
  assert.match(h, /Show post from Instagram/);
  assert.match(h, /Follow @mulligangames/);
  const js = fs.readFileSync(path.join(dist, 'js/home-live.js'), 'utf8');
  assert.match(js, /instagram\.com\/p\/\$\{a\.dataset\.ig\}\/embed/);
  // Chrome-verified 2026-11-20: the /embed page renders with exactly this sandbox and a strict-origin referrer
  assert.match(js, /sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'/);
  assert.match(js, /referrerPolicy = 'strict-origin'/);
  assert.match(js, /onclick/); // the iframe is created inside the click handler only
});

test('CSP: frame-src allows instagram.com and script-src does not change', () => {
  const csp = fs.readFileSync(path.join(root, 'public/_headers'), 'utf8').match(/Content-Security-Policy:\s*(.+)/)[1];
  assert.match(csp, /frame-src [^;]*https:\/\/www\.instagram\.com/);
  assert.match(csp, /script-src 'self' https:\/\/challenges\.cloudflare\.com;/);
  assert.doesNotMatch(csp.match(/script-src[^;]*/)[0], /instagram/);
  assert.equal(csp.match(/frame-src ([^;]*)/)[1], 'https://challenges.cloudflare.com https://www.instagram.com'); // no wildcard, no extra host
  assert.doesNotMatch(csp.replace(/frame-src [^;]*/, ''), /instagram/); // not in connect-src, img-src or default-src either
});

test('footer and privacy lines', { skip: !built }, () => {
  assert.match(home(), /Game names and set images belong to their publishers\./);
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
  assert.ok(dates[0] > dates[1]); // out now, newest first (Star Trek, then Delta Reign)
  assert.deepEqual(dates.slice(2), [...dates.slice(2)].sort()); // then coming, soonest first
});

test('Instagram promo cards use the ad language and keep the click-to-load link', { skip: !built }, () => {
  const cards = [...home().matchAll(/<li class="rel ig-card"[\s\S]*?<\/li>/g)].map((m) => m[0]);
  assert.ok(cards.length >= 2);
  for (const c of cards) { assert.match(c, /data-ig="/); }
  assert.match(cards[0], /Feb 20 and Mar 14. Confirm with the store./); assert.match(cards[0], /[$]15 or [$]30 entry/);
});

test('release ads: one link per ad whose name says the set; publisher images are decorative (alt=""); art panel hidden from AT', { skip: !built }, () => {
  const h = home();
  const ads = [...h.matchAll(/<(?:article|li) class="rel[^"]*"[^>]*data-release[\s\S]*?<\/(?:article|li)>/g)].map((m) => m[0]).filter((c) => !/ig-card/.test(c));
  assert.ok(ads.length >= 5);
  for (const c of ads) {
    const links = [...c.matchAll(/<a [^>]*href="\/shop\/[a-z0-9-]+\/"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
    assert.equal(links.length, 1, c.slice(0, 90));
    const set = c.includes('data-theme="star-trek"') ? 'Star Trek' : (c.match(/<p class="rel-name">([^<]+)/) ?? c.match(/<p class="rel-game">[^<]*· ([^<]+)</))[1];
    assert.ok(links[0].includes(set), `${links[0]} names ${set}`);
    assert.doesNotMatch(c, /<img(?![^>]*\salt="")/);
  }
});

test('release ads and Instagram: releases.css has no animation, and its only transition is the rotation crossfade under no-preference; the facade has a title, moves focus and has a Hide button', () => {
  const css = fs.readFileSync(path.join(root, 'src/styles/releases.css'), 'utf8');
  assert.doesNotMatch(css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[^{]*\{[^}]*\}[^{]*\{[^}]*\}\s*\}/, ''), /animation|transition|@keyframes/); // the only motion is the 400ms crossfade, inside no-preference
  const js = fs.readFileSync(path.join(root, 'public/js/home-live.js'), 'utf8');
  assert.match(js, /f\.title = /); assert.match(js, /x\.focus\(\)/); assert.match(js, /Escape/); assert.match(js, /Hide this post/); assert.match(js, /b\.focus\(\)/);
});

test('Star Trek product shot: official box on Home (inset) and Shop (Sealed pocket), sized, credited; Hold is a button-shaped link', { skip: !built }, () => {
  const p = JSON.parse(fs.readFileSync(path.join(root, 'src/data/releases.json'), 'utf8')).find((r) => r.id === 'mtg-star-trek').product;
  assert.ok(p.width > 0 && p.height > 0 && p.alt && /^Image: /.test(p.credit) && /^https:\/\/magic\.wizards\.com\//.test(p.sourceUrl));
  for (const [u] of p.webp) assert.ok(fs.statSync(path.join(dist, u)).size < 120000);
  assert.match(home(), /class="rel-product"/);
  const shop = fs.readFileSync(path.join(dist, 'shop/index.html'), 'utf8');
  assert.match(shop, /<img src="\/media\/releases\/star-trek-bundle-480\.jpg"[^>]*alt="[^"]+"/);
  assert.match(shop, /<a class="btn hold" href="\/shop\/\?hold=[^"]+" data-hold=/);
});
