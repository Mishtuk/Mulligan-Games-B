// Turnstile on the 5 forms, both modes: no site key (local) = no widget and no Cloudflare script anywhere;
// a site key = one widget inside each form and the api.js script once per form page. Deploy builds refuse a missing key.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { TURNSTILE_SITE_KEY, siteKeyProblem, isTestSiteKey } from '../src/lib/site.js';
import worker from '../src/worker.js';
import { makeD1 } from '../src/worker/d1-shim.js';

const root = new URL('..', import.meta.url);
const FORM_PAGES = { 'index.html': 'request-form', 'shop/index.html': 'request-form', 'events/index.html': 'signup-form',
  'sell/index.html': 'buylist-form', 'visit/index.html': 'contact-form' };
const OTHER_PAGES = ['privacy/index.html', '404.html'];
const API = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const formHtml = (html, id) => { const at = html.indexOf(`<form id="${id}"`); return at < 0 ? '' : html.slice(at, html.indexOf('</form>', at)); };

test('siteKeyProblem: empty, Cloudflare test keys and junk are refused; a real-looking key passes', () => {
  assert.match(siteKeyProblem(''), /empty/);
  for (const k of ['1x00000000000000000000AA', '2x00000000000000000000AB', '3x00000000000000000000FF']) { assert.ok(isTestSiteKey(k), k); assert.match(siteKeyProblem(k), /test key/); }
  assert.match(siteKeyProblem('0x4AAA "><script>'), /does not look/);
  assert.equal(siteKeyProblem('0x4AAAAAAABkMYinukE8nzYS'), null);
});

const load = (env) => spawnSync(process.execPath, ['-e', "import('./astro.config.mjs')"], { cwd: root, env: { ...process.env, DEPLOY: '', TURNSTILE_SITE_KEY: '', ...env }, encoding: 'utf8' });
test('astro.config.mjs: DEPLOY=1 refuses a missing or test site key; a real-looking key clears that check', () => {
  if (siteKeyProblem(TURNSTILE_SITE_KEY)) assert.match(load({ DEPLOY: '1' }).stderr, /DEPLOY build refused:.*TURNSTILE_SITE_KEY is empty/);
  assert.match(load({ DEPLOY: '1', TURNSTILE_SITE_KEY: '1x00000000000000000000AA' }).stderr, /TURNSTILE_SITE_KEY is a Cloudflare test key/);
  assert.doesNotMatch(load({ DEPLOY: '1', TURNSTILE_SITE_KEY: '0x4AAAAAAABkMYinukE8nzYS' }).stderr, /TURNSTILE_SITE_KEY/);
  assert.equal(load({ TURNSTILE_SITE_KEY: '' }).status, 0); // plain build: no key needed
});

test('local mode (no site key): built pages carry no widget and load nothing from Cloudflare', { skip: TURNSTILE_SITE_KEY ? 'dist/ built with a site key' : !fs.existsSync(new URL('../dist/index.html', import.meta.url)) && 'build first' }, () => {
  for (const p of [...Object.keys(FORM_PAGES), ...OTHER_PAGES]) {
    const html = fs.readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /cf-turnstile|challenges\.cloudflare\.com/, p);
    assert.doesNotMatch(html, /<script[^>]+src="https?:/, `${p}: no external script`);
  }
  assert.doesNotMatch(fs.readFileSync(new URL('../dist/privacy/index.html', import.meta.url), 'utf8'), /Turnstile/, 'privacy names no check that does not run');
});

test('key mode: a build with TURNSTILE_SITE_KEY puts one widget inside each of the 5 forms and api.js once per form page', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'mg-turnstile-'));
  const key = '1x00000000000000000000AA'; // Cloudflare's public always-pass test site key (a plain build allows it)
  try {
    const r = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', out, '--silent'],
      { cwd: root, env: { ...process.env, DEPLOY: '', TURNSTILE_SITE_KEY: key }, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    for (const [p, id] of Object.entries(FORM_PAGES)) {
      const html = fs.readFileSync(path.join(out, p), 'utf8');
      assert.equal((html.match(/class="cf-turnstile"/g) || []).length, 1, `${p}: one widget`);
      assert.match(formHtml(html, id), new RegExp(`<div class="cf-turnstile" data-sitekey="${key}"[^>]*>`), `${p}: widget inside #${id}`);
      const scripts = html.match(/<script[^>]+src="https:[^"]+"[^>]*>/g) || [];
      assert.deepEqual(scripts.map((s) => s.match(/src="([^"]+)"/)[1]), [API], `${p}: only Cloudflare's api.js, once`);
      assert.match(scripts[0], /\basync\b/);
    }
    for (const p of OTHER_PAGES) assert.doesNotMatch(fs.readFileSync(path.join(out, p), 'utf8'), /cf-turnstile|challenges\.cloudflare\.com/, p);
    assert.match(fs.readFileSync(path.join(out, 'privacy/index.html'), 'utf8'), /Cloudflare Turnstile/, 'privacy page names the third-party check');
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('CSP in public/_headers lets the widget run: script-src, frame-src and connect-src allow challenges.cloudflare.com', () => {
  const csp = fs.readFileSync(new URL('../public/_headers', import.meta.url), 'utf8').match(/Content-Security-Policy: (.+)/)[1];
  const dir = (n) => (csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(n + ' ')) || '').split(/\s+/);
  for (const n of ['script-src', 'frame-src', 'connect-src']) assert.ok(dir(n).includes('https://challenges.cloudflare.com'), n);
  assert.ok(!dir('script-src').includes("'unsafe-inline'"));
});

test('Worker reads the field the widget posts (cf-turnstile-response) and sends it to siteverify', async () => {
  const schema = fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');
  const env = { DB: makeD1(schema), TURNSTILE_SECRET: 'real-secret', ASSETS: { fetch: () => new Response('') } };
  const real = globalThis.fetch; const seen = [];
  globalThis.fetch = async (u, init) => { seen.push([String(u), init.body.get('response'), init.body.get('secret')]); return Response.json({ success: init.body.get('response') === 'good' }); };
  try {
    const send = async (token) => {
      const fd = new FormData();
      for (const [k, v] of Object.entries({ name: 'Sam', email: 'sam@example.com', message: 'Hi', 'cf-turnstile-response': token })) fd.append(k, v);
      return (await worker.fetch(new Request('https://mulligan.test/api/contact', { method: 'POST', body: fd }), env)).headers.get('location');
    };
    assert.match(await send('good'), /sent=contact/);
    assert.match(await send('bad'), /contact=error/);
    assert.deepEqual(seen[0], ['https://challenges.cloudflare.com/turnstile/v0/siteverify', 'good', 'real-secret']);
  } finally { globalThis.fetch = real; }
});
