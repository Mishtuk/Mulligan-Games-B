# Loop 10 review (boss, lens 10): loops 1-9

Shots: `before-*` and `after-*` here, all 7 paths at 390 and 1280 (Motion on) plus Home 390 Motion off.
Runs (port 4310): `npm test` 119/119; check-site PASS on all 7 paths (overflow 320-1600, reduced motion, ids,
CSP, Tab + rings, contrast); `.work/motion.mjs`, `zoom.mjs` (200% text, 320/390/1280), `forms.mjs`, `menu.mjs`: 0 fails.

## Score (independent; loops self-scored 29/30)
| Axis | Score | Evidence |
|---|---|---|
| Card-shop identity | 3 | Binder week, pairings sheet, buylist receipt, taped hours, slab labels are real shop objects. But Shop, Sell rail, Visit rules, 404 and most of Home read as a neat bordered form site; no photos; game list is flat bars. |
| Main actions | 4 | Events/Shop/Visit one tap everywhere; Tonight + binder above the fold at 390. "Find a card" lands on a form, not stock (honest, no store yet). |
| Content truth | 4 | No invented fees/phone/rates; jargon test holds. Many "ask in store" lines (fees, parking, age, rates) make pages thin, correctly. |
| Accessibility + motion | 5 | Run evidence above. Drawn shapes are `aria-hidden`, static (no animation). |
| Craft | 3 | Home 1280: want-list box spans full width with the form in the left half (specificity bug: `.home > .box:not(.hero)` beats `.home .request`). Visit hours table header "HOURS" left over right-aligned times. Privacy lists butt into the next paragraph. 404 is an empty dashed pocket. |
| Code | 4 | Strict CSP, escaped JSON, prepared statements, budget/SEO/meta tests. Risks: sign-up seed covers 4 weeks from 2026-11-19 and must be re-run by hand; `SITE_URL` placeholder. |
| **Total** | **23/30** | |

## What held (loops 1-9)
- L1 binder from Wednesday, logo crop; L2 sheet from today + seed from events.json; L3 data-only products (D6);
  L4 receipt slip; L5 no-jargon test; L6 200% text, menu focus-out, form error summaries; L7 bands; L8 copy + meta
  test; L9 100cqw bands, CSP without unsafe-inline, SEO. No regressions found in tests, check-site or the shots.

## Fixed or undone this loop
- (a) Worker: removed the 411 on a missing Content-Length. `readCapped()` streams the body with a 30,000-byte cap
  (declared length over the cap refused before reading; streamed body cancelled as soon as it passes). New test:
  no-length post and an 8-byte-chunk stream both save; a 5 MB stream with no length errors, is cancelled after <20
  chunks, stores nothing.
- (b) DESIGN.md brought in line: toploader removed (D6), Wednesday-first binder, plain-word tabs that never repeat
  the heading, bands/airy rhythm, Shop On the shelf panel, receipt slip details, Visit layout, footer, current CTAs.
- (c) Ruling: DRAW, do not remove. Empty white squares replaced with generic CSS objects: sealed = booster box
  (sky lid, orange body), preorders = one booster pack (crimped ends, -8deg, static). Same on Shop product pockets.
- Cut tabs that repeated their heading: Home "SEALED", Shop "SINGLES", Sell "HOW WE PAY" and "CONDITION"; Sell
  rail now lines up with the slip at 1280.

## Where it still reads generic (owner: "make it more reflect a card shop")
- Home: hero is a white box with a slogan (any cafe could use it); the want-list form is the biggest thing on the
  page; "What we play" is seven flat bars; "Stop in" box is generic.
- Events: strongest page. Generic parts: the sign-up form box and the plain filter buttons.
- Shop: weakest. A contact form plus a table, a text-only Sealed band and a one-line Preorders. Nothing looks like
  a singles case, a shelf or a counter.
- Sell: receipt slip works; the right rail is two plain boxes and a long stacked guide.
- Visit: address band and taped hours work; house rules are a bullet list, not a posted sign; contact form generic.
- 404: a dashed empty pocket reads as a missing placeholder, not a "misprint". Privacy: plain, fine.
- Chrome: footer repeats the whole hours table on Visit.

## Priority list, loops 11-20
- 11 Home (lens 1): fix the 1280 want-list box (7 cols or two-column form, no empty half); hero gets one drawn shop object (sleeved-card fan or playmat edge); game pockets look like sleeved cards, not bars.
- 12 Events (lens 2): sign-up as a clipboard sign-up sheet (ruled lines, seat count); guard seed staleness (build warns or test fails when signup-events has under 7 days left).
- 13 Shop (lens 3): biggest gap. Drawn singles display case (rows of generic sleeved cards behind glass, "Ask at the counter") above the want list; On the shelf panel shows box + pack shapes.
- 14 Sell (lens 4): rail as a counter sign ("We pay in cash or store credit"); condition guide reused compactly; fill the empty column under the slip at 1280.
- 15 Visit + chrome (lens 5): house rules as a taped posted sign; hours header alignment; drop footer hours on /visit/; 404 "Misprint." as a misprinted card shape.
- 16 A11y + motion (lens 6): re-run all .work checks on the new objects; Events pairings stacks on a viewport px query (container query in rem); Privacy list spacing.
- 17 Identity + craft (lens 7): designer review against "card shop at a glance": one real shop object per page, rhythm audit, Home vs Shop consistency.
- 18 Copy (lens 8): Shop and Visit lines in shop words (prerelease, Commander pod, sleeves, bulk) where facts allow; no invented facts.
- 19 Code (lens 9): seed automation (dates computed at deploy or by the Worker), SITE_URL check, font preload, budget after new CSS shapes.
- 20 Review (lens 10): re-score with fresh shots and runs; target identity 4, craft 4.
