# Advisor to the boss (meeting, 2026-11-20)
Basis: designer.md, coder.md, mediator.md, CONTEXT.md, DECISIONS.md D7-D10, loop-brief. Pairing: advisor sits with boss<->coder/designer; mediator sits with coder<->designer handoffs.

## 1. Conflicts
- **A (IG thumbnails vs budget): YES, CSS-only drawn thumbs.** Owner asked for the Instagram strip and a finished look; D8 says trim code, never words. Try it in CSS under the 22,700 line (reuse the release-card frame class, no new SVG). If over by under ~300 B, boss writes D11 raising the line (D7 precedent); do not cut post text.
- **B (releases vs want list): releases ABOVE the form.** Owner asked for releases on Home; the form keeps its heading/words, only moves. No collapsing the form (it is the find-a-card path).
- **C (no-JS GET): STRIP names** in the build:pages pass, keep action=preview-form.html. Hard rule 5 spirit/privacy, zero visual cost, real build untouched. Record as D11 (amends D10c). Add a test: dist-pages forms have no name= ; normal build hash unchanged.

## 2. Work plan (4 tasks, Sonnet all; none is "hard")
Mediator rides every coder<->designer handoff; advisor with the boss on each brief and "done?" check.
- **T1 Coder (pages + a11y plumbing)** - partner: advisor. Files: tools/ build:pages post-build script, src/scripts/site.js (menu inert), Hold anchor (shop component), preview banner CSS, DECISIONS.md D11. Items 1, 4, 13, 12. Done when: names stripped + test, Tab cannot reach main/footer with menu open, #req-cards target, banner 28px, npm test green, a11y clean. Runs FIRST, alone for its builds.
- **T2 Coder, Home/Header** - partner: mediator (designer supplies thumb art + header choice: pill in bar). Files: src/pages/index.astro, Instagram and header components, header/home CSS. Items 6 (B), 2 (A), 3, 8 (Home part), Confirm-with-store line. Done when: order fixed, equal-height IG cards with thumbs, pill in header at 768, Home gzip <= 22,700 (or D11), 390 and 1280 shots look right.
- **T3 Designer->coder, Shop+Visit+Events+Sell** - partner: mediator. Files: shop page/CSS, visit page/CSS, events page, sell CSS (step copy 14px). Items 5 (grid and shelf height only), 7 (sourced art else drawn pack), 9, 10. Done when: one 4-up grid, shorter shelf, rotate 0, equal rows, filler table removed, check-site + gaps green on those 4 paths.
- **T4 Boss/advisor gate** (below).
- **Parallel:** T1 and T2 share site.js/CSS and builds: run T1 then T2. T3 touches different pages but shares global CSS and dist/: run T3 in parallel with T2 ONLY if each uses its own PORT (43NN) and builds in its own worktree/copy; otherwise sequential. Never two npm run build or a11y at once on one dist/. Safe default: T1, then T2 and T3 staggered (builds one at a time).

## 3. Cut / defer
DROP: robots/sitemap subpath, favicon.ico (15). LATER: Sell CLS (trace first), shop game tabs and prices (need POS data), walk-in tag (adds claim), footer chips and 404 alignment (only if T3 has time left), publisher images (owner OK). Owner list: photos, POS, weekly nights, IG dates.

## 4. Gate and republish
1. `npm run build`, `npm test`, check-site on all 7 paths, `npm run a11y` (no servers running), gaps on all 7; Home budget line.
2. Confirm normal build hash unchanged vs D10b rule (apart from real source edits); `npm run build:pages` clean, grep dist-pages for `name=` in forms.
3. Advisor review of diff vs hard rules and D7-D11 (no new facts, store words intact).
4. Commit (author per CONTEXT.md), push gh-pages from dist-pages (boss pushes).
5. Verify live: 7 pages 200, 404, /preview-form.html, no requests outside /Mulligan-Games-B/, banner and noindex present, screenshots 390/1280 of Home, Shop, Visit. Log in refinement-log + HANDOFF.
