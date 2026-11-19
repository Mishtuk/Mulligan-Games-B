import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

// Research certainty stays in the data files; no public page (text, JSON-LD or embedded data) may carry it.
test('built html has no research jargon', { skip: !fs.existsSync(dist) }, () => {
  const bad = [];
  for (const f of walk(dist).filter((x) => x.endsWith('.html'))) {
    const m = fs.readFileSync(f, 'utf8').match(/\b(Likely|Unverified|Confirmed|455)\b/g);
    if (m) bad.push(`${path.relative(dist, f)}: ${[...new Set(m)].join(', ')}`);
  }
  assert.deepEqual(bad, []);
});
