# Designer review (meeting, 2026-11-20)
Live preview, 7 pages x 390/768/1280, all 21 shots looked at: `docs/meeting/shots/designer-<page>-<w>.png`. Script: `.work/designer-meeting.mjs`.
No horizontal scroll at any width (scrollWidth = viewport minus scrollbar). Nothing is broken; the issues below are balance and finish.

## Ranked defects
**P1** Home, 1280: the Instagram strip is two text-only boxes with unequal heights, big empty space under the first card's price chip, and no image or drawn object. It reads as a text dump next to the rich release ads above it. Fix: give each post a drawn thumbnail (the pairings sheet, a trophy/ticket) in the same frame as the release cards; equal heights; chip row pinned to the foot.
**P1** Home, 768: the header is in phone mode ("Menu"), and the "Open now, until midnight" pill drops out as a tiny stray line above the H1, outside the header bar. Looks like a leftover. Fix: keep the pill inside the header at 768 (shorten to "Open now") or move it into the Menu sheet.
**P1** Shop, 1280: Sealed (2 pockets) and Preorders (3) float centred in a full-width pale blue band, narrow columns with big side gaps; the Singles shelf above is a wall of 16 identical drawn card backs. Two different widths and nothing to tell a customer what a single costs or looks like. Fix: left-align and use one shared 4-up grid for Sealed + Preorders; shrink the shelf to 2 rows of 6 with labelled game tabs; add a "Photo coming" tile only where real.
**P2** Home, 1280: hero is a big empty white card; "Pull up a chair." plus tiny cards leaves dead space under the buttons, while Binder week beside it is dense and tiny (7pm / $10 text about 11px). Fix: tighten hero height to match the binder, raise binder day text to 13-14px.
**P2** Home, all: the drawn Riftbound/Hololive/One Piece tiles mix real key art (Delta Reign, Hololive) with a flat drawn placeholder (One Piece beige tile with an X and star). The placeholder looks unfinished next to real art. Fix: swap in the real Starter Deck art as on Shop, or a consistent drawn pack for all.
**P2** Home, 390: page is 5,590px, the form "Not in the binder?" (4 large fields) sits above New releases, so the visual highlight is pushed to about the 55% mark. Fix: place New releases before the want-list form, or collapse the form to one line plus a button.
**P2** Visit, 1280: storefront drawing is blank (two sky rectangles) beside a dashed "Photo coming" strip whose centred text is on a white patch that clips the stripe pattern. Fix: add a door sign/hours sticker to the drawing; give the placeholder a clean solid label.
**P2** Visit, 1280: House rules sheet is tilted about 1 degree with ragged, uneven dash rules and a mixed 3-column text flow; small "Age rules" note is stranded left. Looks slightly wonky rather than intentional. Fix: reduce the tilt or none, equal-height rows, move the note to the foot.
**P2** Events, 1280: the right column is long (Special nights, orange clipboard form, Ask-us, drawn table, "Photo coming") and ends well above the sheet; the drawn card table and Photo-coming box are filler. Fix: drop the filler drawing, keep only Photo coming, or sticky the clipboard.
**P3** Footer, all: "Find us online" links are a loose 2-col list with uneven row gaps and long underlined text; reads as default. Fix: a row of 5 chip-links with equal widths.
**P3** Events 1280: "Hold a seat" button on Friday 7pm rows only; rows without it leave the right column ragged. Add a faint "Walk in" tag.
**P3** 404 (1280): good, but the card drawing pokes above the panel top; align its top to the card.
**P3** Preview banner: solid purple bar full width on every page. Clear and honest, but it is as tall as the header and doubles the chrome on phones. Fix: 28px height, 12-13px text, still not dismissible.
**P3** Sell, 768: the 3-step strip is tight (text 12px), "1/2/3" numerals are big and the copy tiny. Raise copy to 14px.

## Looks best (keep)
1. Star Trek release ad on Home: dark art, mono eyebrow, one orange CTA, credit line. Strongest piece on the site.
2. Pairings sheet on Events: taped paper, today highlighted, price chips, clear Hold a seat. Reads instantly.
3. Visit hours table with today row marked and the 445 address block; plus the 404 "Misprint." card (on-brand, friendly).
Overall type pairing (Titan One + Atkinson + Space Mono) and ink-border/purple-shadow language are consistent across all pages.
