import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const text = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// DESIGN.md glossary: unknowns use "confirm with the store" (facts we may have wrong) or "ask at the counter" (settled in person). No other wording.
const BANNED = [/ask (the|in|in the|at the) (store|shop|counter(?!\b))/i, /ask the counter/i, /ask in (the )?(store|shop)/i, /ask staff/i, /check with (the|us)/i,
  /confirm (at|in) the/i, /call the (store|shop)/i, /Fee: ask(?! at the counter)/i, /Seats: ask(?! at the counter)/i, /\bTBA\b|\bTBD\b/];

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

test('Events play-room placeholder is hidden under 52rem page width; a real photo is never hidden', () => {
  const css = fs.readFileSync(path.resolve(dist, '..', 'src', 'styles', 'events.css'), 'utf8');
  assert.match(css, /@container page \(max-width: 51\.99rem\) \{ \.ph\.ev-photo \{ display: none; \} \}/);
  assert.doesNotMatch(css, /[^h]\.ev-photo\s*\{\s*display:\s*none/);
  const photo = fs.readFileSync(path.resolve(dist, '..', 'src', 'components', 'Photo.astro'), 'utf8');
  assert.match(photo, /class:list=\{\['ph', cls\]\}/); // placeholder carries .ph
  assert.match(photo, /class:list=\{\['photo', cls\]\}/); // real image carries .photo, not .ph
});
