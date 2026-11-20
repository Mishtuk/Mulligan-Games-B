// npm run build:pages: the GitHub Pages preview build (https://mishtuk.github.io/Mulligan-Games-B/), into dist-pages/.
// Astro builds with PAGES=1 (Pages origin in SITE_URL, outDir dist-pages); then ONE post-build pass here rewrites internal
// root paths to the sub-path and adds the Pages-only preview pieces (noindex, banner, form interception). The source and the
// normal `npm run build` (dist/) are untouched. Nothing in this file runs in the normal build.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist-pages');
const BASE = '/Mulligan-Games-B';
const MSG = "Forms don't send in this preview";

fs.rmSync(out, { recursive: true, force: true });
const r = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { cwd: root, stdio: 'inherit', env: { ...process.env, PAGES: '1' } });
if (r.status !== 0) process.exit(r.status ?? 1);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

// _headers is a Cloudflare file; Pages ignores it and the CSP in it would not apply anyway.
fs.rmSync(path.join(out, '_headers'), { force: true });

// First segments of every root path the site uses (public/ folders, Astro assets, pages, root files). A match must follow a
// quote, "(", "=", or a srcset comma, so "https://x/img/..." and "//" are never touched, and the base itself never matches.
const TOP = '(?:js|img|media|fonts|_astro|api|events|shop|sell|visit|privacy|favicon[\\w.-]*|sitemap\\.xml|robots\\.txt|404)';
const REF = new RegExp('(["\'\\x60(=]|,\\s)\\/(?=' + TOP + '(?:[/"\'\\x60)\\s?#.]|$))', 'g');
const HOME = /(href=["'])\/(["'])/g;     // href="/"
const HASH_HOME = /(["'`])\/(#[\w-]*["'`])/g; // '/#x' style
const rewrite = (s) => s.replace(REF, `$1${BASE}/`).replace(HOME, `$1${BASE}/$2`).replace(HASH_HOME, `$1${BASE}/$2`);

const STYLE = `<style>.preview-banner{background:var(--accent2,#5B2A86);color:var(--on-accent2,#fff);font:1rem/1.4 var(--font-body,system-ui,sans-serif);padding:.75rem var(--gutter,16px);text-align:center;min-height:48px;display:flex;align-items:center;justify-content:center}.preview-msg{margin:1rem 0;padding:.75rem 1rem;border:3px solid var(--line,#1B1030);border-radius:5px;background:var(--bg2,#DDF0FB);color:var(--text,#1B1030);font-weight:700}</style>`;
const BANNER = `<div class="preview-banner" role="note">Preview of a concept site. Forms don't send here.</div>`;

for (const f of walk(out)) {
  const ext = path.extname(f);
  if (!['.html', '.css', '.js', '.xml', '.txt'].includes(ext)) continue;
  let s = fs.readFileSync(f, 'utf8');
  if (path.basename(f) === 'robots.txt') { fs.writeFileSync(f, 'User-agent: *\nDisallow: /\n'); continue; }
  if (ext === '.html') {
    // Forms first: action to the static page, GET so a no-JS submit never posts (the Worker does not exist here).
    s = s.replace(/<form\b[^>]*>/g, (tag) => tag.replace(/\saction="[^"]*"/, '').replace(/\smethod="[^"]*"/, '').replace(/^<form/, `<form action="${BASE}/preview-form.html" method="get"`));
  }
  // No Worker on Pages: skip the seat-count request (it would 404 and log a console error); events.js already handles a failed fetch.
  if (ext === '.js') s = s.replace(/fetch\('\/api\/seats',\s*\{[^)]*\}\s*\}\)/g, "Promise.reject(new Error('preview: no Worker'))");
  s = rewrite(s);
  if (ext === '.html') {
    s = s.replace(/<head>/, `<head><meta name="robots" content="noindex" />${STYLE}`)
      .replace(/(<body[^>]*>)/, `$1${BANNER}`)
      .replace(/<\/body>/, `<script src="${BASE}/js/preview-forms.js" defer></script></body>`);
  }
  fs.writeFileSync(f, s);
}

// Capture-phase submit intercept: runs before every page handler, cancels the send, says so, never reports success.
fs.writeFileSync(path.join(out, 'js/preview-forms.js'), `// Pages preview only: forms do not send here.
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  let m = form.querySelector('.preview-msg');
  if (!m) {
    m = document.createElement('p');
    m.className = 'preview-msg';
    m.setAttribute('role', 'alert');
    m.tabIndex = -1;
    m.textContent = "${MSG}. Nothing you typed was sent. Stop by the store or use the links on the Visit page instead.";
    form.append(m);
  }
  m.focus();
}, true);
`);

fs.writeFileSync(path.join(out, 'preview-form.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" /><title>Preview form | Mulligan Games concept</title>
<link rel="stylesheet" href="${BASE}/preview-form.css" /></head>
<body><main><h1>${MSG}</h1>
<p>This is a preview of a concept site, so there is nothing on the other end of the form. Nothing you typed was sent.</p>
<p><a href="${BASE}/">Back to the preview home page</a></p></main></body></html>
`);
fs.writeFileSync(path.join(out, 'preview-form.css'), `body{margin:0;background:#FAF8FF;color:#1B1030;font:1.125rem/1.5 system-ui,sans-serif}main{max-width:40rem;margin:0 auto;padding:2rem 1rem}a{color:#5B2A86;display:inline-block;padding:.75rem 0;min-height:48px}\n`);
console.log(`dist-pages ready (${walk(out).length} files)`);
