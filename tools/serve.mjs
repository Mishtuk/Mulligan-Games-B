// Local static server for dist/: applies public/_headers, 404.html with 404, /path/ -> index.html,
// and forwards /api/* to the Worker in-process with an in-memory D1 and no Turnstile / rate limit.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../src/worker.js';
import { makeD1 } from '../src/worker/d1-shim.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const PORT = Number(process.env.PORT ?? 4321);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.xml': 'application/xml' };

const env = {
  DB: makeD1(fs.readFileSync(path.join(root, 'schema.sql'), 'utf8')),
  LOCAL: '1',
  ASSETS: { fetch: () => new Response('Not found', { status: 404 }) },
};

// public/_headers: a line starting at column 0 is a path pattern, indented lines are "Name: value".
function loadHeaders() {
  const rules = [];
  let cur = null;
  for (const line of fs.readFileSync(path.join(root, 'public', '_headers'), 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (!/^\s/.test(line)) { cur = { re: new RegExp('^' + line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'), h: {} }; rules.push(cur); }
    else if (cur) { const i = line.indexOf(':'); cur.h[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  }
  return rules;
}
const rules = loadHeaders();
function headersFor(pathname) {
  const out = {};
  for (const r of rules) if (r.re.test(pathname)) Object.assign(out, r.h);
  // Plain http on localhost: do not upgrade requests or pin HSTS.
  delete out['Strict-Transport-Security'];
  if (out['Content-Security-Policy']) out['Content-Security-Policy'] = out['Content-Security-Policy'].replace(/;?\s*upgrade-insecure-requests/, '');
  return out;
}

function findFile(pathname) {
  const rel = path.normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  const full = path.join(dist, rel);
  if (full !== dist && !full.startsWith(dist + path.sep)) return null;
  const tries = pathname.endsWith('/') ? [path.join(full, 'index.html')] : [full, path.join(full, 'index.html'), full + '.html'];
  return tries.find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) ?? null;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const base = headersFor(url.pathname);
    if (url.pathname.startsWith('/api/')) {
      const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req);
      const r = await worker.fetch(new Request(url, { method: req.method, headers: req.headers, body }), env);
      res.writeHead(r.status, { ...base, ...Object.fromEntries(r.headers) });
      return res.end(Buffer.from(await r.arrayBuffer()));
    }
    let file = findFile(url.pathname), status = 200;
    if (!file) { file = path.join(dist, '404.html'); status = 404; }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { ...base, 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(status, { ...base, 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`));
