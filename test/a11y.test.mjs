import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emailOk, plural } from '../public/js/form-check.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const built = fs.existsSync(dist);
const pages = ['index.html', 'events/index.html', 'shop/index.html', 'sell/index.html', 'visit/index.html', 'privacy/index.html', '404.html'];
const html = (p) => fs.readFileSync(path.join(dist, p), 'utf8');

test('every page: one h1 and no skipped heading level', { skip: !built }, () => {
  for (const p of pages) {
    const h = [...html(p).matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
    assert.equal(h.filter((n) => n === 1).length, 1, `${p} h1 count`);
    assert.equal(h[0], 1, `${p} starts at h1`);
    h.forEach((n, i) => assert.ok(i === 0 || n <= h[i - 1] + 1, `${p} skips from h${h[i - 1]} to h${n}`));
  }
});

test('every page: each nav is named, each table has a caption, ids are unique', { skip: !built }, () => {
  for (const p of pages) {
    const s = html(p);
    for (const m of s.matchAll(/<nav\b[^>]*>/g)) assert.match(m[0], /aria-label(ledby)?=/, `${p} unnamed nav`);
    const tables = (s.match(/<table\b/g) || []).length;
    assert.equal((s.match(/<caption\b/g) || []).length, tables, `${p} table without caption`);
    const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(ids.filter((x, i) => ids.indexOf(x) !== i), [], `${p} duplicate ids`);
  }
});

test('binder pocket links are named by day plus the pocket text, and every referenced id exists', { skip: !built }, () => {
  const s = html('index.html');
  const links = [...s.matchAll(/<a href="[^"]*" id="[^"]+" aria-labelledby="([^"]+)">([^<]+)<\/a>/g)];
  assert.ok(links.length >= 9, 'nine pockets');
  for (const [, refs] of links) for (const id of refs.split(' ')) assert.ok(s.includes(`id="${id}"`), `missing ${id}`);
  const wed = links.find((l) => l[2] === 'Wednesday');
  assert.equal(wed[1].split(' ').length, 3, 'title, body and foot (time, fee)');
});

test('buylist rows keep list-item semantics (no role override) and a "Card N" name', { skip: !built }, () => {
  const s = html('sell/index.html');
  assert.doesNotMatch(s, /<li class="slip-row"[^>]*role=/);
  assert.match(s, /<li class="slip-row" aria-label="Card 1"/);
});

test('form panels: success is role=status, error panels are focusable, the checker is loaded', { skip: !built }, () => {
  const forms = [['index.html', 'request'], ['events/index.html', 'signup'], ['shop/index.html', 'request'], ['sell/index.html', 'buylist'], ['visit/index.html', 'contact']];
  for (const [p, n] of forms) {
    const s = html(p);
    assert.match(s, new RegExp(`id="${n}-ok" role="status" tabindex="-1" hidden`), `${p} success panel`);
    assert.match(s, new RegExp(`id="${n}-err" role="alert" tabindex="-1" hidden`), `${p} error panel`);
    if (n !== 'signup') assert.match(s, /\/js\/form-check\.js/, `${p} loads form-check.js`);
  }
});

test('motion switch is a named toggle on every page', { skip: !built }, () => {
  for (const p of pages) assert.match(html(p), /<button type="button" id="motion" aria-pressed="true">Motion: on<\/button>/, p);
});

test('form-check helpers', () => {
  assert.ok(emailOk('a@b.co') && !emailOk('a@b') && !emailOk('a b@c.d') && !emailOk(''));
  assert.equal(plural(1), '1 thing');
  assert.equal(plural(3), '3 things');
});

test('sell: counter sign, three numbered stubs, condition guide folded and linked to Shop', { skip: !built }, () => {
  const s = html('sell/index.html');
  assert.match(s, /class="sign"[\s\S]*Rates are set at the counter/);
  assert.equal((s.match(/class="stub"/g) || []).length, 3);
  assert.match(s, /<details class="cond-fold"[\s\S]*href="\/shop\/#condition"/);
});

test('scripts off: each form result panel is the redirect fragment and shows by :target; a sent form steps aside', { skip: !built }, () => {
  const css = fs.readFileSync(path.resolve(dist, '..', 'src/styles/global.css'), 'utf8');
  assert.match(css, /\.form-msg\[hidden\]:target \{ display: block !important; \}/); // beats [hidden] { display: none !important }
  assert.match(css, /:has\(> \.form-msg\.ok:target\) > form \{ display: none; \}/);
  for (const [p, name] of [['index.html', 'request'], ['shop/index.html', 'request'], ['events/index.html', 'signup'], ['sell/index.html', 'buylist'], ['visit/index.html', 'contact']]) {
    const h = html(p);
    for (const k of ['ok', 'err']) assert.match(h, new RegExp(`class="form-msg (ok|error)" id="${name}-${k}"[^>]*hidden`), `${p} #${name}-${k}`);
    // panel and form are siblings, so the :has() rule can hide the form
    assert.match(h, new RegExp(`id="${name}-ok"[\\s\\S]*?<form[^>]*id="${name}-form"`), p);
  }
});
