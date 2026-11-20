import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const skip = !fs.existsSync(dist);
const pages = ['index', 'events/index', 'shop/index', 'sell/index', 'visit/index', 'privacy/index', '404'];
const read = (f) => fs.readFileSync(path.join(dist, f));

// Loop 39 measure (HTML+CSS+JS, fonts counted raw): heaviest raw page Events 125,812 bytes; heaviest gzipped page Home 18,616 (Events 18,270, Sell 17,764).
// Budget is about 5% above the heaviest page. Before adding CSS, put it in the page file, not global.css; trim before raising.
// D7 (loop 52): owner-requested New releases + Instagram sections on Home cost ~3.3k gzip; budget set ~5% above
// Home's measured 21,651 gzip / 136,116 raw. Do not raise again without a DECISIONS.md entry.
// D8 (loop 57): +300 gzip so the store's own bio line is never cut to fit the budget.
const BUDGET = { raw: 143000, gzip: 23200 }; // D12 (T2, 23,104 measured; was 22700) D9 (loop 69): back to the D7 line; Home measured 22,3xx after loops 61-68 trims

// Every CSS and JS file the page loads: linked files plus the modules they import.
function assets(html) {
  const seen = new Set(), queue = [...html.matchAll(/(?:href|src)="(\/(?:_astro|js)\/[^"]+)"/g)].map((m) => m[1]);
  while (queue.length) {
    const f = queue.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    if (f.endsWith('.js')) for (const m of read(f).toString().matchAll(/from\s*["'](?:\.\/|\/js\/)([^"']+)["']/g)) queue.push('/js/' + m[1]);
  }
  return [...seen];
}
const fontFiles = () => fs.readdirSync(path.join(dist, 'fonts')).map((f) => `/fonts/${f}`);

test('page weight: HTML + CSS + JS + every font stays inside the budget', { skip }, () => {
  const fonts = fontFiles().reduce((n, f) => n + read(f).length, 0);
  for (const p of pages) {
    const html = read(`${p}.html`), files = assets(html.toString());
    const raw = html.length + fonts + files.reduce((n, f) => n + read(f).length, 0);
    const gz = [html, ...files.map(read)].reduce((n, b) => n + zlib.gzipSync(b).length, 0);
    assert.ok(raw <= BUDGET.raw, `${p}: ${raw} bytes raw (budget ${BUDGET.raw})`);
    assert.ok(gz <= BUDGET.gzip, `${p}: ${gz} bytes gzipped (budget ${BUDGET.gzip})`);
  }
});

test('every font file has an @font-face, and only the headline and body fonts are preloaded', { skip }, () => {
  const css = fs.readdirSync(path.join(dist, '_astro')).filter((f) => f.endsWith('.css')).map((f) => read(`_astro/${f}`).toString()).join('\n');
  for (const f of fontFiles()) assert.ok(css.includes(f), `${f} has no @font-face`);
  for (const p of pages) {
    const links = [...read(`${p}.html`).toString().matchAll(/<link rel="preload"[^>]*as="font"[^>]*>/g)].map((m) => m[0]);
    assert.deepEqual(links.map((l) => l.match(/href="([^"]+)"/)[1]), ['/fonts/titan-one-latin-400.woff2', '/fonts/atkinson-hyperlegible-latin-400.woff2'], p);
    for (const l of links) assert.match(l, /crossorigin/); // font fetches are CORS requests; without it the preload is wasted
  }
});

test('every img has width and height', { skip }, () => {
  for (const p of pages) for (const m of read(`${p}.html`).toString().matchAll(/<img\b[^>]*>/g)) {
    assert.match(m[0], /\swidth="\d+"/, `${p}: ${m[0]}`);
    assert.match(m[0], /\sheight="\d+"/, `${p}: ${m[0]}`);
  }
});

test('no inline styles: built pages need no style-src unsafe-inline', { skip }, () => {
  for (const p of pages) assert.doesNotMatch(read(`${p}.html`).toString(), /<style\b|\sstyle="/, p);
});

test('dead code guard: every file in public/js is loaded by a built page', { skip }, () => {
  const used = new Set(pages.flatMap((p) => assets(read(`${p}.html`).toString())));
  for (const f of fs.readdirSync(path.join(root, 'public', 'js'))) assert.ok(used.has(`/js/${f}`), `public/js/${f} is not loaded by any page`);
});
