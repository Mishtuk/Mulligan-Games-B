# Loop 57 identity review (designer, lens 7)

Shots: `home|events|shop|sell|visit|privacy|nope-{390,768,1024,1280,1600}.png` (fresh, full page), plus `*-after` for Privacy,
`ig-before/after-*`, `rel-after-*`. All 35 opened; 390 and 1280 read closely, 768/1024/1600 checked for layout breaks.
Bar (phase 2): reads as this card shop at a glance, one strong card object per page with real info, one object family,
no generic boxes left.

## Table (yes/no = reads as THIS card shop at a glance)
| Page | 390 | 768 | 1024 | 1280 | 1600 | Object carrying it / why |
|---|---|---|---|---|---|---|
| Home | yes | yes | yes | yes | yes | Hand of card backs, binder-week pockets, Tonight slip, playmat band of sleeves. Ads and Instagram now share the 3px frame and purple offset shadow. |
| Events | yes | yes | yes | yes | yes | Taped pairings sheet, per-game swatches, ticket-date special nights, sign-up clipboard. Strongest page. |
| Shop | yes | yes | yes | yes | yes | Glass case with two shelves of sleeved cards, box + pack, preorder slip. Photo-free but intended. |
| Sell | yes | yes | yes | yes | yes | Buylist receipt slip, orange "We buy cards" sign, 1-2-3 stubs. |
| Visit | yes | yes | yes | yes | yes | 445 placard, taped house-rules notice, hours sheet. Dashed photo slot reads as a slot, not a bug. |
| Privacy | no -> yes | no -> yes | no -> yes | no -> yes | no -> yes | Before: a plain document column (rules and bullets, no shop object at all). After: three tabbed cards. |
| 404 | yes | yes | yes | yes | yes | "Misprint." with the drawn misprinted card. |

## Phase-2 bar: remaining gaps
- Identity 5 still needs real photos (storefront, play room): two dashed slots remain (Visit, Events).
- Privacy is now in the box + tab family but is still text; that is right for a legal page. It has no card object with
  its own information, so it carries the family, not a hero object.
- Home 1280: Star Trek banner is the one place that is not Mulligan-coloured (by design: publisher art). Its frame is now ours.

## Home: one site or two? (priority 2)
Before: the ads read as a poster strip dropped between Mulligan sections: each ad had a coloured offset shadow (theme bar
colour, 3px; banner 6px) while every other object on the site (box, pocket, slip, buttons) throws the purple `--shadow-sm`
/ `--shadow`; Instagram cards had an orange shadow. Border weight, radius and tag type already matched.
Change: every `.rel` uses `var(--shadow-sm)` and the banner `var(--shadow)`. Theme colour stays on the image rule
(pokemon stripe, rift gold, hololive lavender, op rope), the surface, the date line and the chip, so the ads keep publisher
art and themes and the frame is Mulligan's. Rhythm: section headings, `--section` gap and 3px borders already matched.
Verdict after: one site. Residual: ad h2 headings ("New releases", "From our Instagram") are bare headings while Tonight and
Want list use `.tab` labels; left as is (headings on a plain ground are the Binder week pattern).

## Weakest page change (priority 3): Privacy
Existing `.box` + `.tab` (Kept / Never / Yours) replace the three hairline-divided text blocks; two columns from 900px,
"Ask us to delete your data" full width on the sky box. No new object, no new copy, no facts added. The tabs are
`aria-hidden` labels; headings unchanged.

## Instagram buttons (priority 4)
Full-width "Show this post from Instagram" at 390 made the shadow bleed past the card edge. Label is now "Show post from
Instagram" at natural width (about 250px, shadow inside the card). Escape closes an open post and returns focus to the
Show button; focus now lands on "Hide this post" when a post opens (an iframe would swallow Escape). Test updated.

## Score (strict; start 27)
| Axis | Before | After | Evidence |
|---|---|---|---|
| Identity | 4 | 4 | Privacy and Home ads closed two weak spots; photos still missing, so not 5. |
| Main actions | 4 | 4 | Unchanged. |
| Truth | 5 | 5 | No facts added; two sentences cut. |
| A11y + motion | 5 | 5 | Escape added; a11y probe run. |
| Craft | 4 | 4 | Gaps gate clean, but loop 50 named Home 1280 sealed/sell right third unresolved. |
| Code | 5 | 5 | 162 tests, D7 budget kept by cutting copy. |
| **Total** | 27 | **27** | |
