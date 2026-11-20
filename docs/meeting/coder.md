# Coder review, live Pages preview (2026-11-20)
Method: headless Chrome (tools/cdp.mjs) against https://mishtuk.github.io/Mulligan-Games-B/, scripts .work/coder-review.mjs, coder-int.mjs, coder-esc.mjs, coder-ig.mjs. Shots: docs/meeting/shots/coder-*.png. Nothing edited.

## Result: nothing P0 or P1 found
All 6 pages x 390 and 1280: 0 console/JS errors, 0 failed requests, 0 requests outside /Mulligan-Games-B/, 0 broken images, no
horizontal overflow (scrollWidth = viewport at 390; 1265 at 1280 = scrollbar), all 4 fonts load (Titan One, Atkinson 400/700, Space Mono 700),
one h1 per page, noindex on every page, canonical and og:url use the github.io base. /nope gives the styled 404; /preview-form.html 200.
Layout shift (CLS, lower is better): 0.000 to 0.007 everywhere except /sell/ at 1280 = 0.034 (still "good", under 0.1).
Load (DCL/load, one run): / 547ms at 390 (21 requests), other pages 80 to 435ms. Transfer is not trustworthy here (the profile cache gave 0 B on
repeat pages); first cold load: / about 151 KB over 21 requests, the others about 80 to 220 KB. Light.

## Flows checked (JS on)
- Hold link: /shop/?hold=mtg-star-trek#hold-... fills the cards box ("Hold: Star Trek ..."), focuses it, note "Hold for Star Trek filled in". Bogus id: generic line, no crash.
- Events filters: ?game=magic shows 13 of 15 rows, aria-current moves; unknown game -> All; a game with no weekly night shows all (by design, with a line).
- Instagram: no iframe until tap; tap loads instagram.com/p/<code>/embed (544px tall). Only request outside the base, and only after tap (expected).
- Forms (events, sell, visit, shop): all four show "Forms don't send in this preview. Nothing you typed was sent.", URL stays clean, no fake success.
- Motion switch: on -> off, saved in localStorage, survives reload, 0 running animations when off.
- Menu at 390: opens (aria-expanded true), 5 links all on screen, Esc closes and returns focus to the button.

## Findings
- P2 / 390 / Menu does not lock page scroll or inert the page: body overflow stays visible and main is not inert (test: scrollTo(0,600) works with sheet open). Sheet sits under the header, so it reads fine; keyboard Tab can reach hidden-behind content. Fix: set main/footer `inert` while open (site.js menu toggle), optional `overflow:hidden` on html.
- P2 / all / no-JS form fallback on Pages is method=get to preview-form.html, so whatever the visitor typed lands in the URL (history, referrer-free but visible). Per D10(c) this is deliberate; only matters for a no-JS visitor. Fix if wanted: drop the `name` attributes via the post-build pass, or use `fieldset disabled`; or accept it, it is a preview and the page says nothing was sent.
- P3 / 1280 /sell/ / CLS 0.034 (largest of any page): likely the buylist row/form slip or the swapped fonts. Cause unconfirmed (did not trace the shifting node). Fix: check with a layout-shift observer reporting `sources`; reserve the height or use `font-display: optional`/size-adjust fallback.
- P3 / Pages only / robots.txt and sitemap.xml are served under /Mulligan-Games-B/, where crawlers never look (they read the host root, which belongs to the account). Harmless: noindex meta is the real protection (D10d). Sitemap lists github.io URLs, fine.
- P3 / Pages only / 404 is a real HTTP 404 serving 404.html (correct). favicon.ico 404s but pages declare favicon-32.png, so no request is made.
- P3 / cosmetic / Instagram cards on home show "Date: confirm with the store" for both posts; read as placeholder-ish text, a copy call not code.
- P3 / hold anchor: #hold-<id> targets a zero-height visually-hidden line, so the hash scroll does nothing; focus() on the cards box does the scrolling instead. Works, but the target is not meaningful with JS off (no-JS lands in the middle of the form area). Fix: point the hash at #req-cards or give the hold-line a visible position.

## Only breaks on Pages vs normal build
Nothing found that breaks. Differences by design: preview banner, noindex, GET fallback form, root-path rewrite (all asset URLs verified inside the base), no _headers (so no CSP on Pages: the strict CSP/frame-src protection exists only on the real host, so the IG embed and security headers are untested here).

## Not checked
Real phone Safari, slow-network throttling, no-JS run on Pages, a11y (covered by the a11y scripts), hold flow when localStorage is blocked.
