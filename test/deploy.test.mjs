import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { SITE_URL, isPlaceholderOrigin } from '../src/lib/site.js';

test('isPlaceholderOrigin: reserved names, localhost, http and junk are placeholders; a real https origin is not', () => {
  for (const u of ['https://mulligangames.example', 'https://a.test', 'http://mulligan.games', 'https://localhost', 'https://example.com', 'nonsense', '']) assert.ok(isPlaceholderOrigin(u), u);
  for (const u of ['https://mulligan.games', 'https://www.mulligangames.com']) assert.ok(!isPlaceholderOrigin(u), u);
});

// Loads the config only (no build), with and without DEPLOY.
const load = (env) => spawnSync(process.execPath, ['-e', "import('./astro.config.mjs')"], { env: { ...process.env, DEPLOY: '', ...env }, encoding: 'utf8' });
test('astro.config.mjs: DEPLOY=1 fails while SITE_URL is a placeholder; a normal load works', () => {
  assert.equal(load({}).status, 0);
  const r = load({ DEPLOY: '1' });
  if (isPlaceholderOrigin(SITE_URL)) { assert.notEqual(r.status, 0); assert.match(r.stderr, /DEPLOY build refused/); } else assert.equal(r.status, 0);
});

import { photoMode } from '../src/lib/photo.js';
import fs from 'node:fs';
test('photoMode: null photo is a placeholder locally and nothing on a deploy build; a real photo is always an img', () => {
  const p = { src: '/img/a.jpg', alt: 'x', width: 960, height: 480 };
  assert.equal(photoMode(null, false), 'placeholder');
  assert.equal(photoMode(null, true), 'none');
  assert.equal(photoMode(p, false), 'img');
  assert.equal(photoMode(p, true), 'img');
});
test('Photo.astro renders nothing for mode none (no figure, no "Photo coming")', () => {
  const s = fs.readFileSync(new URL('../src/components/Photo.astro', import.meta.url), 'utf8');
  assert.match(s, /\) : null\}/);
  assert.equal((s.match(/Photo coming/g) || []).length, 1); // only inside the placeholder branch
});
