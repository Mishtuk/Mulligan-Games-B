import { defineConfig } from 'astro/config';
import { SITE_URL, isPlaceholderOrigin } from './src/lib/site.js';

// Deploy guard: `npm run build:deploy` (or DEPLOY=1) refuses to build while SITE_URL is still a placeholder, so a
// build with canonical, sitemap, robots and og tags pointing at mulligangames.example never ships. Plain `npm run build` is unaffected.
if (process.env.DEPLOY && isPlaceholderOrigin(SITE_URL)) {
  throw new Error(`DEPLOY build refused: SITE_URL in src/lib/site.js is still the placeholder ${SITE_URL}. Set the real https origin first.`);
}

export default defineConfig({
  output: 'static',
  outDir: './dist',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
});
