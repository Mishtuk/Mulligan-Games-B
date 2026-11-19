# Loop 20 review (boss, lens 10): loops 11-19

Shots here: `before-*` / `after-*` (7 paths at 390 and 1280, Motion on; Home 390 Motion off), `e2e-*` (each form
posted end to end through the browser, same-origin Referer, JS on, JS on with a bad email, JS off), `nojs-*`.
Runs (port 4320): `npm test` 126/126; check-site PASS 7 paths; `npm run a11y` PASS (now also runs every form).

## Score (independent; loops 11-19 self-scored 29-30, not credible)
| Axis | Found | After | Evidence |
|---|---|---|---|
| Card-shop identity | 4 | 4 | Up from 3: hero card hand, game cards on a playmat, singles case, clipboard sheet, buylist receipt, taped signs, misprint card. One shop object per page holds. Still no photos; Shop Sealed/Preorders are text bands; the 7 game cards are identical backs. |
| Main actions | 4 | 4 | Events/Shop/Visit one tap, Tonight above the fold at 390. Game names on the play cards are 11.2px (the way into a game's nights). "Find a card" lands on a want-list form, and that form is the biggest block on Home. |
| Content truth | 4 | 4 | No invented fees, rates, phone. Hero line read badly ("Singles, sealed, and Commander, draft and more most nights"): rewritten. "Confirm with the store" and "ask at the counter" both still used. |
| A11y + motion | 4 | 5 | Found: Events sign-up client check threw `ReferenceError: err` (loop 19), so a bad email showed nothing; with scripts off no form showed any result; with scripts off the sticky header held the open menu (about 340px of 844). All fixed and covered by runs. |
| Craft | 3 | 3 | No layout bugs, but dead space at 1280: Home want-list left column, Shop Sealed/Preorders bands, Sell column under the sign; Sell guide summary set in heavy display type wraps to 2 lines; Visit hours table stopped short of its sheet (fixed); "Warhammer and tabletop" label crammed. |
| Code | 3 | 4 | Found: the loop-19 regression shipped with tests green; prebuild rewrote 2 tracked files on every build day; ids were positions (1..n), so a build and a D1 seed from different days mapped "id 1" to different nights (wrong-night sign-ups). Fixed below. Open: SITE_URL placeholder, Sell gzip 0.6% under budget. |
| **Total** | **22** | **25/30** | 22 is below loop 10's 23 because of the stricter bar (no-JS results were missing then too) and the loop-19 regression. |

## What held (11-19)
Shared `.cback`/`.sign` family, Home 1280 want-list fix, clipboard, receipt stubs, misprint 404, one hours table on
Visit, pairings container query, `npm run a11y`, nested-interactive test. Loop 17 page-width header (`body` as an
inline-size container, query in rem) checked: Menu at 390 and at 200% text, desktop nav at 1280, nothing fixed-position
under body, so no side effect. Drawn objects: all aria-hidden, static, no text covered (a11y run). Not over-decorated:
no page has an object between the user and see this week / find a card / visit; objects sit beside or above the actions.

## Fixed or undone this loop
- Regression: `public/js/events.js` declares `err` again and uses the shared `emailOk`. `tools/a11y-check.mjs` now
  submits every form empty (error summary must take focus, no script error) and loads `?sent=` (success panel
  focused); proven to fail on the old file.
- Scripts off: the Worker redirects to `#<form>-ok|-wait|-err`; `.form-msg[hidden]:target` shows the panel and a sent
  form steps aside (`:has()`); the Events noscript excuse line is cut; `html:not(.js) .site-header` is static.
  Worker tests and a new a11y test updated.
- Seed ruling: prebuild REMOVED (it made every build day dirty `schema.sql` and `signup-events.json`). The Events page
  builds its list with `seedEvents()`; ids are stable (`YYYYMMDDHHMM*10+slot`); `tools/seed-events.mjs` prints
  `INSERT OR IGNORE` SQL for deploy day; `schema.sql` is tables only; `signup-events.json` deleted; serve.mjs seeds
  the local D1. Builds are reproducible per date and leave the tree clean.
- Hero line rewritten; Visit hours table fills its taped sheet.

## Where it still reads generic (owner: "make it more reflect a card shop")
- Shop: Sealed and Preorders are a sky band and a sentence; Home draws a booster box and pack, Shop does not.
- Home: the want-list form outweighs the binder; game cards all share one back, so nothing says which game is which.
- Visit: "Ask us something" is a plain contact box; Address band is a plain band (no storefront or street sign).
- Sell 1280: empty column under the We buy cards sign. Events: big gap before the clipboard at 1280.

## Priority list, loops 21-29
- 21 Home: shrink the want list at 1280 (one row: textarea + game + email, or fold it behind a "Not in the binder?" button); game cards get a per-game back colour/mark (no logos) and >= .85rem labels that fit (Warhammer).
- 22 Events: close the gap above the clipboard at 1280 (sheet and special nights beside it); fold the repeated "Tonight" chips on today's rows into the day header.
- 23 Shop: Sealed band draws the booster box and pack (reuse `.box-sil`) on a shelf edge; Preorders as a small pre-order slip; one heading, not "Sealed product" + "On the shelf".
- 24 Sell: fill the 1280 column under the sign (open condition guide there, or a "what we look at" card); guide summary in body type, one line; LINES total aligned to the slip edge.
- 25 Visit + chrome: Address band as a street-number sign or storefront placard with Maps; contact box shorter; Motion button does nothing without JS (hide it under `html:not(.js)`).
- 26 A11y: 11.2px labels audit (min .8rem body-text labels); re-run e2e forms with JS off at 200% text; check `:target` panel lands under no header on every form.
- 27 Identity: designer pass on 1280 rhythm only (dead space on Home, Shop, Sell); no new objects unless one replaces a plain box.
- 28 Copy: one phrase for unknowns ("ask at the counter" vs "confirm with the store"); Shop and Visit leads in shop words.
- 29 Code: e2e form run (`.work/e2e20.mjs`) into `npm run a11y` with JS off; trim CSS before the Sell gzip budget; SITE_URL check that fails a deploy build.

## Loop 30 (review) should check
No-JS and JS form results on all 5 forms (run, not read); seed ids stable across two build dates; `git status` clean
after a build; 1280 dead space gone; game labels readable; independent score target identity 5 or a photo plan, craft 4.
