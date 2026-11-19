import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const pages = ['index', 'events/index', 'shop/index', 'sell/index', 'visit/index', 'privacy/index', '404'];
const meta = (p) => {
  const h = fs.readFileSync(path.join(dist, `${p}.html`), 'utf8');
  return { p, title: h.match(/<title>([^<]*)<\/title>/)?.[1], desc: h.match(/<meta name="description" content="([^"]*)"/)?.[1] };
};

// Search results show ~60 characters of title and ~155 of description.
test('every page has a unique title and description within search-result length', { skip: !fs.existsSync(dist) }, () => {
  const all = pages.map(meta);
  for (const m of all) {
    assert.ok(m.title && m.desc, `${m.p}: title and description present`);
    assert.ok(m.title.length <= 70, `${m.p}: title ${m.title.length} chars`);
    assert.ok(m.desc.length >= 60 && m.desc.length <= 160, `${m.p}: description ${m.desc.length} chars`);
  }
  assert.equal(new Set(all.map((m) => m.title)).size, all.length, 'titles are unique');
  assert.equal(new Set(all.map((m) => m.desc)).size, all.length, 'descriptions are unique');
});
