// The one place the public origin lives. TO SET before launch (see HANDOFF "To set"): the real domain, no trailing slash.
// PAGES=1 (npm run build:pages, the noindex GitHub Pages preview) uses the Pages origin incl. sub-path; the normal build is unchanged.
export const SITE_URL = process.env.PAGES ? 'https://mishtuk.github.io/Mulligan-Games-B' : 'https://mulligangames.example';
export const LOGO = { path: '/img/logo/mulligan-games-340.png', width: 340, height: 120 };
// True for an origin that must not ship: not https, localhost, or a reserved test name (.example, .test, .invalid, .localhost).
export const isPlaceholderOrigin = (url) => {
  try { const u = new URL(url); return u.protocol !== 'https:' || /(^localhost$|\.(example|test|invalid|localhost)$|^example\.(com|org|net)$)/.test(u.hostname); } catch { return true; }
};

// Turnstile (spam check on the 5 forms). TO SET before launch: the PUBLIC site key from Cloudflare > Turnstile (the secret
// goes in `wrangler secret put TURNSTILE_SECRET`, never here). Empty = no widget and no Cloudflare script (local builds; the
// local server passes posts without a token). A TURNSTILE_SITE_KEY env var at build time wins over this line.
const SITE_KEY = '';
export const TURNSTILE_SITE_KEY = String(process.env.TURNSTILE_SITE_KEY || SITE_KEY).trim();
// Cloudflare's public test site keys (always pass / fail / interactive): fine for a local check, never for a live site.
export const isTestSiteKey = (k) => /^[123]x0{20}[A-F]{2}$/.test(k);
// What a deploy build must refuse about the site key; null when it is fine.
export const siteKeyProblem = (k) => !k ? 'TURNSTILE_SITE_KEY is empty' : isTestSiteKey(k) ? 'TURNSTILE_SITE_KEY is a Cloudflare test key'
  : !/^[0-9A-Za-z_-]{10,100}$/.test(k) ? 'TURNSTILE_SITE_KEY does not look like a site key' : null;
