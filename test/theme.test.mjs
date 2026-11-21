import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// Run theme-init.js against a fake document and storage.
function init(storage) {
  const attrs = {}, meta = { content: '', setAttribute(k, v) { this.content = v; } };
  const document = { documentElement: { style: {}, setAttribute: (k, v) => { attrs[k] = v; } }, querySelector: () => meta };
  vm.runInNewContext(read('public/js/theme-init.js'), { document, localStorage: storage });
  return { attrs, style: document.documentElement.style, meta };
}
const store = (v) => ({ getItem: () => v });
const throwing = { getItem() { throw new Error('blocked'); } };

test('theme-init: dark by default, stored light respected, junk and blocked storage stay dark', () => {
  assert.equal(init(store(null)).attrs['data-theme'], 'dark');
  assert.equal(init(store('light')).attrs['data-theme'], 'light');
  assert.equal(init(store('light')).style.colorScheme, 'light');
  assert.equal(init(store('light')).meta.content, '#FAF8FF');
  assert.equal(init(store('dark')).attrs['data-theme'], 'dark');
  assert.equal(init(store('purple')).attrs['data-theme'], 'dark');
  assert.equal(init(throwing).attrs['data-theme'], 'dark');
});

test('layout: dark in the static HTML, external theme-init first in head, one named toggle with two icons, not a switch', () => {
  const s = read('src/layouts/Base.astro');
  assert.match(s, /<html lang="en" data-theme="dark">/);
  assert.ok(s.indexOf('theme-init.js') > 0 && s.indexOf('theme-init.js') < s.indexOf('motion-boot.js') && s.indexOf('theme-init.js') < s.indexOf('<title>'));
  assert.match(s, /<script is:inline src="\/js\/theme-init\.js"><\/script>/); // external: has src, no defer
  assert.doesNotMatch(s, /theme-init\.js"[^>]*defer/);
  const btn = s.match(/<button type="button" class="theme-toggle"[^>]*>[\s\S]*?<\/button>/)[0];
  assert.match(btn, /aria-label="Switch to light mode"/);
  assert.doesNotMatch(btn, /aria-pressed|role="switch"/);
  assert.equal((btn.match(/aria-hidden="true"/g) || []).length, 2);
  assert.ok(s.indexOf('</footer>') < s.indexOf('class="theme-toggle"'), 'toggle after main and footer so Tab reaches it last');
  assert.ok(!/<form[\s\S]*theme-toggle[\s\S]*<\/form>/.test(s));
});

test('site.js: toggle flips the name and saves mg-theme in try/catch', () => {
  const js = read('public/js/site.js');
  assert.match(js, /Switch to dark mode/); assert.match(js, /Switch to light mode/);
  assert.match(js, /try \{ localStorage\.setItem\('mg-theme', t\); \} catch/);
});

test('CSS: dark tokens for the default, light base, print stays light, 48px round button, privacy says what is saved', () => {
  const css = read('src/styles/global.css');
  assert.match(css, /:root\[data-theme="dark"\]\s*\{[^}]*--bg: #120B1E/);
  assert.match(css, /:root, :root\[data-theme="light"\]\s*\{[^}]*--bg: #FAF8FF/);
  assert.match(css, /@media not print\s*\{\s*:root\[data-theme="dark"\]/);
  assert.match(css, /\.theme-toggle \{[^}]*width: 48px; height: 48px[^}]*border-radius: 50%/);
  assert.match(css, /@media print \{ \.theme-toggle \{ display: none; \}/);
  assert.match(read('src/pages/privacy/index.astro'), /only thing saved in this browser is your light or dark choice/);
});

test('Pages build: theme-init.js ships under the base path, external, first in head', { skip: !fs.existsSync(path.join(root, 'dist-pages/index.html')) }, () => {
  const h = fs.readFileSync(path.join(root, 'dist-pages/index.html'), 'utf8');
  assert.match(h, /<html lang="en" data-theme="dark">/);
  assert.match(h, /<script src="\/Mulligan-Games-B\/js\/theme-init\.js"><\/script>/);
  assert.ok(fs.existsSync(path.join(root, 'dist-pages/js/theme-init.js')));
  assert.ok(h.indexOf('theme-init.js') < h.indexOf('<title>'));
  assert.doesNotMatch(h.replace(/<script type="(?:application\/(?:ld\+)?json)"[^>]*>[\s\S]*?<\/script>/g, ''), /<script(?![^>]*\ssrc=)[^>]*>/, 'no inline script');
});
