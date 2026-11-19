// The one place the public origin lives. TO SET before launch (see HANDOFF "To set"): the real domain, no trailing slash.
export const SITE_URL = 'https://mulligangames.example';
export const LOGO = { path: '/img/logo/mulligan-games-340.png', width: 340, height: 120 };
// True for an origin that must not ship: not https, localhost, or a reserved test name (.example, .test, .invalid, .localhost).
export const isPlaceholderOrigin = (url) => {
  try { const u = new URL(url); return u.protocol !== 'https:' || /(^localhost$|\.(example|test|invalid|localhost)$|^example\.(com|org|net)$)/.test(u.hostname); } catch { return true; }
};
