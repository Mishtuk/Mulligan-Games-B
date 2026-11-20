import { defineConfig } from 'astro/config';
import { SITE_URL, isPlaceholderOrigin, TURNSTILE_SITE_KEY, siteKeyProblem } from './src/lib/site.js';

// Deploy guard: `npm run build:deploy` (or DEPLOY=1) refuses to build while SITE_URL is still a placeholder, so a
// build with canonical, sitemap, robots and og tags pointing at mulligangames.example never ships. It also refuses a
// missing or test Turnstile site key: the Worker rejects form posts without a token once TURNSTILE_SECRET is set.
// Plain `npm run build` is unaffected.
if (process.env.DEPLOY) {
  const problems = [
    isPlaceholderOrigin(SITE_URL) && `SITE_URL in src/lib/site.js is still the placeholder ${SITE_URL} (set the real https origin)`,
    siteKeyProblem(TURNSTILE_SITE_KEY) && `${siteKeyProblem(TURNSTILE_SITE_KEY)} (set the public site key in src/lib/site.js or the TURNSTILE_SITE_KEY env var)`,
  ].filter(Boolean);
  if (problems.length) throw new Error(`DEPLOY build refused: ${problems.join('; ')}.`);
}

export default defineConfig({
  output: 'static',
  outDir: './dist',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
});
