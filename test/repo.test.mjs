import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', 'dist', 'dist-pages', 'downloads', '.git', '.astro', '.wrangler', '.work']);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

test('no secrets in the repo (keys, tokens, private keys, real Turnstile secrets)', () => {
  const TEST_SECRETS = ['1x0000000000000000000000000000000AA', '2x0000000000000000000000000000000AA', '3x0000000000000000000000000000000AA'];
  const patterns = [
    ['private key block', new RegExp('-----BEGIN [A-Z ]*PRIVATE ' + 'KEY-----')],
    ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}/],
    ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{30,}/],
    ['Stripe/secret key', /\b[sr]k_(live|test)_[A-Za-z0-9]{16,}/],
    ['AWS key id', /\bAKIA[0-9A-Z]{16}\b/],
    ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
    ['Anthropic/OpenAI key', /\bsk-[A-Za-z0-9_-]{20,}/],
    ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
    ['bearer token', /\bBearer\s+[A-Za-z0-9._~+/-]{24,}/],
  ];
  const hits = [];
  for (const file of walk(root)) {
    if (path.basename(file) === 'package-lock.json') continue;
    let s;
    try { s = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (s.includes('\0')) continue;
    for (const [name, re] of patterns) if (re.test(s)) hits.push(`${name}: ${path.relative(root, file)}`);
    for (const m of s.matchAll(/(?:SECRET|TOKEN|API_?KEY|PASSWORD)\s*[=:]\s*["']?([A-Za-z0-9_\-./+]{12,})/g)) {
      if (!TEST_SECRETS.includes(m[1]) && !/^</.test(m[1])) hits.push(`assigned secret ${m[1].slice(0, 6)}...: ${path.relative(root, file)}`);
    }
  }
  assert.deepEqual(hits, []);
  assert.ok(!fs.existsSync(path.join(root, '.dev.vars')) || /\.dev\.vars/.test(fs.readFileSync(path.join(root, '.gitignore'), 'utf8')));
});

test('.dev.vars is git-ignored', () => {
  assert.match(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'), /^\.dev\.vars$/m);
});

test('public/_headers: strict CSP and standard headers', () => {
  const h = fs.readFileSync(path.join(root, 'public', '_headers'), 'utf8');
  const csp = h.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? '';
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /form-action 'self'/);
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self' https:\/\/challenges\.cloudflare\.com(;|$)/);
  assert.doesNotMatch(csp, /'unsafe-(inline|eval)'/); // scripts and styles both
  assert.doesNotMatch(csp, /\*(?!\.)/);
  for (const name of ['X-Content-Type-Options: nosniff', 'Referrer-Policy:', 'Permissions-Policy:']) assert.ok(h.includes(name), name);
});

test('wrangler.jsonc has assets, D1 mulligan and the form rate limit', () => {
  const w = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
  for (const s of ['"ASSETS"', '"404-page"', '"/api/*"', '"database_name": "mulligan"', '"FORM_LIMIT"', '"src/worker.js"']) assert.ok(w.includes(s), s);
});
