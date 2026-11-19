import { SITE_URL } from '../lib/site.js';

// Every page file except the 404 and the endpoints (they are not .astro files), so a new page is listed without editing this.
const files = Object.keys(import.meta.glob(['./**/*.astro', '!./404.astro']));
const paths = files.map((f) => f.slice(1).replace(/index\.astro$/, '').replace(/\.astro$/, '/')).sort();

export const GET = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}\n</urlset>\n`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
