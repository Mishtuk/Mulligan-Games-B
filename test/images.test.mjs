// Every <img>/<source> in dist/: real pixel size, every srcset file on disk, honest sizes, no image over 2x its slot.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const skip = !fs.existsSync(dist);
const sharp = skip ? null : (await import('sharp').catch(() => null))?.default;
const pages = ['index', 'events/index', 'shop/index', 'sell/index', 'visit/index', 'privacy/index', '404'];
const html = (p) => fs.readFileSync(path.join(dist, `${p}.html`), 'utf8');
const attr = (tag, n) => tag.match(new RegExp(String.raw`\s${n}="([^"]*)"`))?.[1];
const file = (u) => path.join(dist, u.replace(/^\//, ''));
const px = async (u) => { const m = await sharp(file(u)).metadata(); return [m.width, m.height]; };
const cands = (src) => attr(src, 'srcset').split(/,\s*/).map((c) => c.split(/\s+/));

// Slot width in CSS px for a `sizes` list at viewport width vw (values: Npx, Nvw, calc(Nvw - Mrem)).
function slot(sizes, vw) {
  for (const part of sizes.split(/,\s*(?=\(|[\dc])/)) {
    const m = part.match(/^(?:\(min-width:\s*(\d+)px\)\s+)?(.+)$/);
    if (m[1] && vw < Number(m[1])) continue;
    const expr = m[2].replace(/calc/, '').replace(/([\d.]+)vw/g, (_, n) => (n * vw) / 100).replace(/([\d.]+)rem/g, (_, n) => n * 16).replace(/px/g, '');
    assert.match(expr, /^[\d.+\-*/() ]+$/, sizes);
    return Function(`return ${expr}`)();
  }
  throw new Error(`no slot for ${vw} in ${sizes}`);
}

test('every built <img> carries the real pixel size of its file', { skip: skip || !sharp }, async () => {
  for (const p of pages) for (const [tag] of html(p).matchAll(/<img\b[^>]*>/g)) {
    const [w, h] = await px(attr(tag, 'src'));
    assert.deepEqual([Number(attr(tag, 'width')), Number(attr(tag, 'height'))], [w, h], `${p}: ${tag}`);
  }
});

test('every <source> srcset file exists, w descriptors are the real widths, aspect matches the fallback', { skip: skip || !sharp }, async () => {
  for (const p of pages) for (const [pic] of html(p).matchAll(/<picture>[\s\S]*?<\/picture>/g)) {
    const img = pic.match(/<img\b[^>]*>/)[0], ratio = attr(img, 'width') / attr(img, 'height');
    for (const [src] of pic.matchAll(/<source\b[^>]*>/g)) {
      const list = cands(src);
      if (list.length > 1) assert.ok(attr(src, 'sizes'), `${p}: w-descriptor srcset needs sizes: ${src}`);
      for (const [u, d] of list) {
        assert.ok(fs.existsSync(file(u)), `${p}: missing ${u}`);
        const [w, h] = await px(u);
        if (d) assert.equal(d, `${w}w`, `${p}: ${u}`);
        assert.ok(Math.abs(w / h - ratio) < 0.01, `${p}: ${u} aspect ${w}x${h} vs ${ratio}`);
      }
    }
  }
});

test('release images: the file Chrome picks at 1x is at most 2x its slot at 390, 768 and 1280', { skip: skip || !sharp }, async () => {
  const pics = [...html('index').matchAll(/<picture>[\s\S]*?<\/picture>/g)].map((m) => m[0]).filter((x) => /media\/releases/.test(x));
  assert.ok(pics.length >= 4);
  for (const pic of pics) {
    const src = pic.match(/<source\b[^>]*>/)[0];
    if (!attr(src, 'sizes')) { // featured: object-fit cover in a 26-31rem tall box, always 926-1120px wide: one 960 file, no srcset
      const [[u, d]] = cands(src);
      assert.ok(!d && cands(src).length === 1 && (await px(u))[0] >= 900, src);
      continue;
    }
    const list = cands(src).map(([u, d]) => [u, parseInt(d)]).sort((a, b) => a[1] - b[1]);
    for (const vw of [390, 768, 1280]) {
      const s = slot(attr(src, 'sizes'), vw), pick = list.find(([, w]) => w >= s) ?? list.at(-1);
      assert.ok(pick[1] <= 2 * s, `${pick[0]} is ${pick[1]}px for a ${Math.round(s)}px slot at ${vw}`);
    }
  }
});

test('lazy loading: every release image is lazy (the section is below the fold); none uses fetchpriority', { skip }, () => {
  for (const [tag] of html('index').matchAll(/<img\b[^>]*>/g)) {
    assert.doesNotMatch(tag, /fetchpriority/);
    if (/media\/releases/.test(tag)) assert.match(tag, /loading="lazy"/, tag);
  }
});
