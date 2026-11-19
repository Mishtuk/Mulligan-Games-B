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
