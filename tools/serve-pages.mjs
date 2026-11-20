// Local static server for dist-pages/ under /Mulligan-Games-B/ (what GitHub Pages does). Everything outside the sub-path is 404.
// Usage: node tools/serve-pages.mjs  (PORT env, default 4390)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..', 'dist-pages');
const BASE = '/Mulligan-Games-B/';
const PORT = Number(process.env.PORT ?? 4390);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.xml': 'application/xml', '.ics': 'text/calendar' };
const find = (p) => [p, path.join(p, 'index.html')].find((f) => f.startsWith(dir) && fs.existsSync(f) && fs.statSync(f).isFile());

http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  let file = null, status = 404;
  if (pathname === '/Mulligan-Games-B') { res.writeHead(301, { Location: BASE }); return res.end(); }
  if (pathname.startsWith(BASE)) {
    const rel = decodeURIComponent(pathname.slice(BASE.length));
    file = find(path.join(dir, path.normalize(rel)));
    if (file) status = 200;
  }
  if (!file) file = path.join(dir, '404.html');
  res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  res.end(fs.existsSync(file) ? fs.readFileSync(file) : 'Not found');
}).listen(PORT, () => console.log(`Serving dist-pages/ at http://localhost:${PORT}${BASE}`));
