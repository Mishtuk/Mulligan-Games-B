# Loop 17 design review (card-shop identity and visual craft)

Shots: `before-*` and `after-*` here, 7 paths at 390 and 1280, full page (plus `fold-390/1280.png`, `hdr-1280-200.png`).
Rubric as loop 7: Nielsen 0-4 x10 (/40), audit /20 (type, colour, rhythm, card-shop identity, consistency, 0-4 each). Scores are loop 7 (after) -> loop 17 before -> loop 17 after.

| Page | Heuristics /40 | Audit /20 | Reads as a card shop at a glance? |
|---|---|---|---|
| Home | 34 -> 36 -> 36 | 17 -> 17 -> 18 | Yes: hero card hand, binder week, playmat band of sleeved cards. Hand now readable at 390. Sealed/Sell now share a row at 1280 instead of a mostly empty sky box. |
| Events | 35 -> 37 -> 37 | 17 -> 18 -> 18 | Yes. Taped pairings sheet plus clipboard sign-up; strongest page. |
| Shop | 33 -> 35 -> 36 | 16 -> 17 -> 18 | Yes (singles case). Glass-glare stripes cut: they ran through the ASK stickers. Case smaller so the want-list form starts about 40px higher. |
| Sell | 34 -> 36 -> 36 | 17 -> 18 -> 18 | Yes. Receipt stubs, slip, orange counter sign. Closed condition guide reads as a bare heading bar (P2). |
| Visit | 34 -> 36 -> 36 | 17 -> 18 -> 18 | Yes. Address band, taped hours, sky house-rules sign. |
| Privacy | 33 -> 34 -> 34 | 14 -> 15 -> 15 | Plain on purpose. |
| 404 | 30 -> 34 -> 35 | 12 -> 17 -> 18 | Yes: crooked misprint card. Now centred at 390 instead of hugging the left edge. |

Totals: heuristics 233 -> 249 -> 250 of 280; audit 106 -> 120 -> 123 of 140. Average site gain since loop 7 is mostly the drawn objects of loops 11-15.

## Object family audit (hero hand, sleeves, case, box/pack, clipboard, signs, stubs, misprint)
Shared already: 3px ink border, 4-5px radius, hard offset shadow, tokens only, aria-hidden, static, sky/orange/purple stripes with an orange diamond.
Drifts found and fixed:
- Card backs: `.cback` (sky stripes 0.35em), `.sleeve` on Home (pale `--bg2` stripes, different pitch), `.mp-art` (orange). `.sleeve` now uses the same sky/card stripes, so Home game cards and Shop case cards match.
- Shadow weights: cback 2px ink, top-loader 4px ink, booster box 4px purple, pack 3px ink. Small objects now all use `--shadow-sm` (3px purple); large objects (case, binder, signs, slip, misprint, hero) keep `--shadow` (6px). Ink shadows stay only on the purple playmat band.
- Radius: misprint sleeve 10px and clipboard clip 6px now `--radius`.
Not unified on purpose: signs rotate (-1/+1deg), misprint 2deg, hand fans; paper objects tilt, furniture (case, binder, clipboard) stays square.
Competing objects: the Shop case glare overlay (decoration over the labels) cut; the case was also the tallest thing before the Shop action (want list), now smaller (1.3rem -> 1.05rem at 1000px+). Home hero hand kept: it sits beside the headline, never between the user and a button.

## Issues, ranked (with status)
- P1 Header at 1280 with 200% text wrapped "Sell to us" onto three lines. Fixed: `body` is a container (`page`) and the header switches to the Menu button below `52rem` of page width, so it follows text zoom (200% at 1280 -> Menu; 100% unchanged from 820px). Nav links also `nowrap`. Verified `hdr-1280-200.png`.
- P1 Home hero hand tiny at 390 (about 53px). Fixed: 96px fan, still beside the h1; first binder pocket top is 649px at 390 (limit 844). Hand sized in px so it never covers text at 200% zoom.
- P1 Shop glare stripes crossed the ASK stickers and the case pushed the form down. Fixed (above).
- P1 Home 1280 "Sealed and preorders" sky box was 2/3 empty. Fixed: sealed and Sell share a row (cols 1-7 and 8-12).
- P2 Card-back pattern and shadow drift. Fixed (above).
- P2 404 misprint left-aligned with a blank right half at 390. Fixed (centred under 820px).
- P2 (open) Sell condition guide `<details>` closed looks like a heading with no affordance; Home "Sealed and preorders" pockets are two "Ask in store" chips that go nowhere new; Events filter buttons plain.
- P3 (open) Sell stub 1 wraps to three lines at 1280 so stubs have unequal heights; footer repeats hazard stripe (signature, fine).

## Checks
`npm run build` clean, `npm test` 123/123, check-site exit 0 on 7 paths, `npm run a11y` passed. Not done: motion-off re-shots (no motion added).
