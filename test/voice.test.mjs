import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const text = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// DESIGN.md glossary: a fact we may have wrong says "Confirm with the store"; a fact settled in person says "ask at the counter".
// Every other way of saying "we don't know" is banned. Each entry is one wording, so a failure names what to fix.
const BANNED = [
  /\bask (?:the|in|in the|at the) (?:store|shop)\b/i,   // "ask the store", "ask in store", "ask at the shop" ("ask at the counter" is the allowed one)
  /\bask the counter\b/i,                               // missing "at"
  /\bask staff\b/i,
  /\bcheck with (?:the|us)\b/i,
  /\bconfirm (?:at|in) the\b/i,                         // the allowed form is "confirm with the store"
  /\bcall the (?:store|shop)\b/i,
  /\b(?:Fee|Seats): ask(?! at the counter)/i,            // chip labels that only say "ask"
  /\bTB[AD]\b/,                                         // TBA / TBD, upper case only so "tba" inside a word or id cannot trip it
];

test('built pages use only the two unknown phrases', { skip: !fs.existsSync(dist) }, () => {
  const bad = [];
  let counter = 0, store = 0;
  for (const f of walk(dist).filter((x) => /\.(html|js)$/.test(x))) {
    const raw = fs.readFileSync(f, 'utf8');
    const t = f.endsWith('.html') ? text(raw) : raw;
    for (const re of BANNED) { const m = t.match(re); if (m) bad.push(`${path.relative(dist, f)}: ${m[0]}`); }
    counter += (t.match(/ask at the counter/gi) || []).length;
    store += (t.match(/confirm with the store/gi) || []).length;
  }
  assert.deepEqual(bad, []);
  assert.ok(counter > 0 && store > 0);
});

// Loop 38: an unknown fee is shown by showing nothing (one quiet line on Visit). No "Fee: ask" text, no dash chip, in any page or the .ics.
test('no unknown-fee chip or "Fee: ask" text anywhere in dist', { skip: !fs.existsSync(dist) }, () => {
  const bad = [];
  for (const f of walk(dist).filter((x) => /\.(html|js|json|ics)$/.test(x))) {
    const raw = fs.readFileSync(f, 'utf8');
    const t = f.endsWith('.html') ? text(raw) : raw;
    if (/Fee: ask|Fee:\s*[–-]|fee[^<]{0,12}ask at the counter/i.test(t)) bad.push(path.relative(dist, f));
    if (/<td[^>]*data-label="Fee"[^>]*>\s*(<span[^>]*>\s*)?[–-]/.test(raw)) bad.push(`${path.relative(dist, f)}: dash fee cell`);
    if (/<span class="sticker">(?!\$\d)/.test(raw)) bad.push(`${path.relative(dist, f)}: non-dollar sticker`);
  }
  assert.deepEqual(bad, []);
});

test('Events play-room table and placeholder are hidden under 52rem page width; a real photo is never hidden', () => {
  const css = fs.readFileSync(path.resolve(dist, '..', 'src', 'styles', 'events.css'), 'utf8');
  assert.ok(css.includes("@container page (max-width: 51.99rem) { .ev-room:not(:has(.photo)) { display: none; } }"));
  assert.doesNotMatch(css, /[^h]\.ev-photo\s*\{\s*display:\s*none/);
  const photo = fs.readFileSync(path.resolve(dist, '..', 'src', 'components', 'Photo.astro'), 'utf8');
  assert.match(photo, /class:list=\{\['ph', cls\]\}/); // placeholder carries .ph
  assert.match(photo, /class:list=\{\['photo', cls\]\}/); // real image carries .photo, not .ph
});

// Loop 48: one spelling (Pokemon) outside the legal line; no exclamation marks; Visit footer has no Hours block or stub link.
test('copy: Pokemon spelling, no exclamation marks, Visit footer has no Hours heading', { skip: !fs.existsSync(dist) }, () => {
  const bad = [];
  for (const f of walk(dist).filter((x) => x.endsWith('.html'))) {
    const t = text(fs.readFileSync(f, 'utf8')).replace(/The Pokémon Company/g, '');
    if (/Pokémon/.test(t)) bad.push(`${path.relative(dist, f)}: Pokémon`);
    if (/!/.test(t.replace(/<!doctype html>/i, ''))) bad.push(`${path.relative(dist, f)}: !`);
  }
  assert.deepEqual(bad, []);
  const visit = fs.readFileSync(path.join(dist, 'visit', 'index.html'), 'utf8');
  const foot = visit.slice(visit.indexOf('<footer'));
  assert.doesNotMatch(foot, /<h2[^>]*>Hours<\/h2>/);
  assert.doesNotMatch(foot, /opening hours are above|class="hours"/); // the page shows the hours; the footer adds no stub
});

// Loop 58: release ads and Instagram cards stay in shop voice. No online checkout is implied, no price appears in an ad,
// and the only fees shown are the two stated in docs/research/instagram.md.
test('release ads and Instagram cards: shop voice, no checkout language, no invented prices', { skip: !fs.existsSync(dist) }, () => {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const sec = (cls) => text(html.match(new RegExp(`<section class="${cls}"[^>]*>[\\s\\S]*?</section>`))[0]);
  const rel = sec('home-releases'), ig = sec('home-ig');
  const NO = /buy (?:it )?online|add to cart|order now|buy now|shop now|checkout|check out|free shipping|\bshipping\b|in stock|sold out|limited (?:time|stock)|hurry|don'?t miss|\d+% off/i;
  for (const [name, t] of [['releases', rel], ['instagram', ig]]) {
    assert.doesNotMatch(t, NO, name);
    assert.doesNotMatch(t, /ask (?:in|at the) (?:store|shop)|in-store/i, name);
  }
  assert.doesNotMatch(rel, /\$\s?\d/); // no prices on a release ad
  assert.deepEqual([...new Set(ig.match(/\$\d+/g))].sort(), ['$15', '$30']); // the two fees as stated, nothing else
  assert.match(rel, /Pick up Star Trek at the counter/);
  assert.match(rel, /Main set \(TRK\) and Commander decks \(TRC\)/);
  assert.match(ig, /Date: confirm with the store/);
  assert.match(ig, /Dates: confirm with the store/);
  // Browser-built strings in home-live.js follow the same rules.
  const js = fs.readFileSync(path.resolve(dist, '..', 'public', 'js', 'home-live.js'), 'utf8');
  assert.doesNotMatch(js, NO);
});
