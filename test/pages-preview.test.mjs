import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist-pages');
const BASE = '/Mulligan-Games-B';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const read = (f) => fs.readFileSync(f, 'utf8');
let files;
before(() => {
  const r = spawnSync(process.execPath, ['tools/build-pages.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  files = walk(out);
});
const text = () => files.filter((f) => /\.(html|css|js|xml|txt)$/.test(f));
const html = () => files.filter((f) => f.endsWith('.html'));

test('Pages build: no root-absolute internal URLs left', () => {
  const bad = [];
  const re = /(?:href=|src=|action=)["']\/(?!Mulligan-Games-B\/|Mulligan-Games-B["'])|url\(\s*["']?\/(?!Mulligan-Games-B\/)|(?:import|from)\s*["']\/(?!Mulligan-Games-B\/)|fetch\(\s*["'`]\/(?!Mulligan-Games-B\/)/;
  for (const f of text()) { const m = read(f).match(re); if (m) bad.push(path.relative(out, f) + ': ' + m[0]); }
  assert.deepEqual(bad, []);
});
test('Pages build: never a double slash from the rewrite', () => {
  for (const f of text()) assert.doesNotMatch(read(f), /Mulligan-Games-B\/\//, f);
});
test('Pages build: noindex, banner and preview script on every HTML page; no _headers; robots disallows all', () => {
  assert.ok(html().length >= 8);
  for (const f of html()) {
    if (f.endsWith('preview-form.html')) continue;
    const s = read(f);
    assert.match(s, /<meta name="robots" content="noindex"/, f);
    assert.match(s, /Preview of a concept site\. Forms don't send here\./, f);
    assert.match(s, /js\/preview-forms\.js/, f);
  }
  assert.ok(!fs.existsSync(path.join(out, '_headers')));
  assert.match(read(path.join(out, 'robots.txt')), /Disallow: \/\s/);
  assert.doesNotMatch(read(path.join(out, 'robots.txt')), /Allow: \//);
});
test('Pages build: canonical, sitemap use the Pages origin; forms point at preview-form.html with GET', () => {
  const home = read(path.join(out, 'index.html'));
  assert.match(home, /rel="canonical" href="https:\/\/mishtuk\.github\.io\/Mulligan-Games-B\/"/);
  assert.match(read(path.join(out, 'sitemap.xml')), /<loc>https:\/\/mishtuk\.github\.io\/Mulligan-Games-B\/shop\/<\/loc>/);
  assert.doesNotMatch(home, /mulligangames\.example/);
  for (const f of html()) for (const m of read(f).matchAll(/<form\b[^>]*>/g)) {
    assert.match(m[0], new RegExp(`action="${BASE}/preview-form\.html"`), f);
    assert.match(m[0], /method="get"/, f);
  }
  const pf = read(path.join(out, 'preview-form.html'));
  assert.match(pf, /Forms don't send in this preview/);
  assert.match(pf, new RegExp(`href="${BASE}/"`));
});
test('preview-forms.js: capture-phase, stops the real handlers, never claims success', () => {
  const s = read(path.join(out, 'js/preview-forms.js'));
  assert.match(s, /addEventListener\('submit'[\s\S]*true\)/);
  assert.match(s, /preventDefault\(\)/);
  assert.match(s, /stopImmediatePropagation\(\)/);
  assert.match(s, /Forms don't send in this preview/);
  assert.doesNotMatch(s, /thanks|success|received|we got/i);
});
test('normal build has none of the Pages additions', () => {
  const dist = path.join(root, 'dist');
  if (!fs.existsSync(dist)) return;
  for (const f of walk(dist).filter((f) => /\.(html|txt|xml)$/.test(f))) {
    const s = read(f);
    assert.doesNotMatch(s, /Mulligan-Games-B|preview-forms|Preview of a concept site/, f);
  }
  assert.ok(!fs.existsSync(path.join(dist, 'js/preview-forms.js')));
  assert.ok(!fs.existsSync(path.join(dist, 'preview-form.html')));
});
test('Pages build (D11C): no name= on any form field, so a no-JS GET submit carries nothing; the banner is slim', () => {
  let fields = 0;
  for (const f of html()) {
    const s = read(f);
    for (const m of s.matchAll(/<(?:input|select|textarea|button)\b[^>]*>/g)) { if (/\btype="radio"/.test(m[0])) continue; fields++; assert.doesNotMatch(m[0], /\sname=/, f + ' ' + m[0]); }
    for (const m of s.matchAll(/<form\b[^>]*>/g)) assert.match(m[0], new RegExp(`action="${BASE}/preview-form\.html"`), f);
  }
  assert.ok(fields > 10);
  assert.match(read(path.join(out, 'index.html')), /\.preview-banner\{[^}]*min-height:28px/);
  const dist = path.join(root, 'dist');
  if (fs.existsSync(dist)) assert.match(read(path.join(dist, 'index.html')), /<input[^>]* name="/); // the normal build keeps names
});
