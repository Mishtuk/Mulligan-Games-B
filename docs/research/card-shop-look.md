# What makes a site look like a card shop (checked 2026-11-19)

Scope: look and feel only. Store patterns (events, buylist, hours) are already in `card-shops.md` and not repeated.
Source limits: many card sites returned 403 to the fetcher or gave markup only (no CSS), so visual claims marked
"inferred" come from page structure and image names, not rendered screens. Check them in a real browser before copying anything.

## 1. The physical shop as design vocabulary

Frame ratio 63x88mm = 5:7 (0.716). Source: general card spec, widely documented; confirm against a sleeve maker page. Everything below is our own generic shapes (rule 12).

| Real object | Web element | How (layout / component / texture / motion) | Watch out |
|---|---|---|---|
| Binder page, 3x3 pockets | Weekly schedule, product shelf, "new in" | CSS grid 3 cols, 5:7 pockets, thin clear-plastic edge (1px light border + inner highlight), ring holes down one edge as a decorative strip | Pockets must be real `<li>`s with text, not images of text |
| Penny sleeve | Image frame for any card/product photo | 5:7 box, 6px radius, faint gloss gradient, 1px edge | Keep low contrast decoration out of text |
| Toploader | Featured single / "case card" | Thicker rigid frame, taller bevel, small top notch; used for the 1-2 hero singles | One or two per page, not every item |
| Graded slab label | Buylist "slip", condition badge, price chip | Small label strip: grade/condition big at right, name left, tiny ID bottom; own colors, no PSA red or logo | Never name or imitate PSA/CGC trade dress |
| Price sticker / handwritten tag | Price on a single | Rotated 1-2 deg paper chip, handwriting font for numbers only | Price text still 4.5:1, never rotate past 3 deg |
| Glass display case | Singles "case" section | Lit shelf rows: light bar on top, row divider as a shelf lip, shadow beneath | Skip heavy reflections (perf, contrast) |
| Deck box | Category tiles (Commander, Draft, Pokemon, Tabletop) | Box front with lid line and thumb notch, one flat color each | Colors from our palette, not game brand colors |
| Playmat | Page background for the Events/Play area | Large soft pattern (stitched border, subtle play-zone circles) at under 8% contrast | Decorative only |
| Pairings sheet on a wall | Events list | Monospace-ish table, ruled lines, table numbers, tape strip at corners, paper off-white | Real `<table>`/list semantics for screen readers |
| Life counter / dice | Hours "open now" dial, loading, stepper for quantities | d20 or counter as icon + number; one-step click, no spinning | No rolling animation unless user clicks and reduced motion off |
| Booster pack | Preorder tiles, "new release" | Crimped top/bottom edge via clip-path, foil as a static gradient | Foil shimmer = animation: off by default, hover-only, reduced-motion off |
| Card frame itself | Every card-like component | Rounded corner, name bar, art window, text box, type line: use as page-section anatomy (title bar, picture, body, footer line) | Generic layout, no publisher frame, no set symbols |

Sources: structural facts about each object are common hobby knowledge; web-element mappings are our proposals. Ratio/shape inspiration: Ramotion card-UI article (states: hover, pressed, selected, disabled) https://www.ramotion.com/blog/card-ui-design/ (checked 2026-11-19). So we should: build one `Pocket` (5:7) component and reuse it in binder, case and tiles so the whole site shares one frame.

## 2. Sites to study

| Site | What it does visually / UX (reads as cards) | So we should... |
|---|---|---|
| Ultra PRO https://www.ultrapro.com | White/light page so colorful sleeves, deck boxes, playmats supply the colour; angled and open-box product shots, uppercase bold headings, mega-menu with thumbnails (fetched; text-level read) | Keep the page chrome calm and white (matches our logo on white) and let card-shaped objects carry colour |
| Dragon Shield https://www.dragonshield.com | Catalog organised by colour (sleeve colours, two-tone deck-box names like "Black & Lilac"), square product shots, "New" badges, fantasy copy line (inferred from markup) | Offer shop-by-colour tiles, and a short fantasy-flavoured line per section |
| BCW | Not fetched this pass | Check by hand |
| Card Kingdom https://www.cardkingdom.com | Header fetched only; light-blue accent in icon file names (inferred); separate buy/sell/sealed/accessories tabs; skip-to-content link present | Copy the skip link habit; sell/buylist gets a top-level tab |
| Face to Face Games https://www.facetofacegames.com | Image-tile category mega-menu, event cards = image + bold dated title + venue + "Sign Up Now"; "WE BUY ALL YOUR CARDS!" strip; carousel has a Pause control; orange buttons (inferred) | Event card with date in the title and one button; if any carousel, ship Pause and no autoplay |
| EDHREC https://edhrec.com | Ranked lists with big rank number + card thumbnail; navigation grouped by colour identity with icon set; Random link; deck-recs form | Use "rank number + picture" lists for what's popular on Fridays; give a "Random card" delight link |
| Archidekt https://archidekt.com/news/20605672 | Four deck views (stacks, text, grid, table) and a pinned preview of the hovered card (from Archidekt dev news) | Singles results: grid/list toggle and a pinned larger preview on desktop, tap-to-expand on phone |
| PSA / CGC (labels) https://www.psacard.com : 403. https://www.cgccards.com : text only | Label anatomy from guides: variety top, grade + descriptor right, cert number bottom, QR on back https://zero-pop.vercel.app/blog/how-to-read-a-psa-label (checked 2026-11-19; secondary source) | Make our own "slab label" chip (condition big, ID small) in our colours, never the red band |
| Scryfall, Moxfield, TCGplayer | Blocked (403) or no content returned. Archidekt/Moxfield search results gave no design reviews | Look at them by hand; note in review loop |

What others miss (synthesis of the above + `card-shops.md`, our judgment): most store sites are generic Shopify grids with a product photo on white. What reads as "cards" is a consistent 5:7 frame, a shelf/binder rhythm, paper-and-ink details (tags, pairings sheets), and colour that comes from products instead of the template. Standouts also keep chrome plain so objects pop.

## 3. Type and colour next to the logo

Logo facts (from owner brief): sky-blue letters ~#7EC8F0, thick deep-purple outline ~#5B2A86, thin orange inner edge, on white.
Contrast (our own calculation, recheck with the kit checker): #5B2A86 on white is about 10:1 (OK for text); #7EC8F0 on white is about 1.8:1 (never body text; fills only, or on purple); orange ~#F28C28 on white is about 2.4:1 (fills and borders only; use a darker orange ~#B45309 for text, about 5:1).
Fonts below are free on Google Fonts/Fontsource (OFL); I did not fetch each licence page (Google Fonts specimen pages returned only titles), so confirm licence on Fontsource.

| Option | Palette | Fonts | Why |
|---|---|---|---|
| A. Game night (friendly) | White #FFFFFF, paper #FBF7EE, purple #5B2A86 text/headings, sky #7EC8F0 fills, orange #F28C28 accents, ink #1F1830 | Headings: Fredoka (rounded, friendly) or Baloo 2; body: Nunito; prices/tags: Caveat | Round letters echo the chunky logo outline; warm and kid/parent friendly |
| B. Old-school shelf (fantasy lite) | Parchment #F6EFE0, deep purple #3E1B5E, sky #7EC8F0, copper #B45309, slate #2B2D42 | Headings: Cinzel Decorative sparingly / Cinzel for small caps labels; body: Alegreya Sans or Source Sans 3; numbers: JetBrains Mono for pairings | Fantasy tone like the wordmark, but serif only in headings so it stays readable |
| C. Tournament table (clean, sporty) | White, off-white #F4F6FA, purple #5B2A86, sky #7EC8F0 as tint areas, orange as the only action colour, charcoal | Headings: Barlow Condensed (uppercase); body: Barlow; mono: IBM Plex Mono for pairings/prices | Dense info (events, prices) fits; condensed caps echo pairing sheets |

Our recommendation: A palette with B's paper tone, Fredoka-or-Alegreya heading, Nunito body, Caveat for price tags only. One accent action colour (orange, with dark text on it). Sources: contrast numbers computed by us per WCAG formula; font fit is our judgment.

## 4. Phone must-haves not already in card-shops.md

| Need | Detail | Source / reasoning |
|---|---|---|
| "Tonight" strip | Top of Home: today's event(s), start time, price, "seats left" if known; sorted by time; empty state says "no events tonight, next: ..." | Pairs with Face to Face event card pattern (date in title + one button) https://www.facetofacegames.com (checked 2026-11-19) |
| Singles search | Search box with camera-free typing, remember last game filter, results grid/list toggle, condition + price on chip, in-stock-only default | Archidekt view options https://archidekt.com/news/20605672 (checked 2026-11-19) |
| Card preview | Tap card = large preview sheet with swipe, not a new page | Archidekt pinned preview, same URL |
| Buylist | "Slip" you build: line items, qty, condition, running total, cash vs credit toggle, share/save as text to bring in; no account | Our proposal; Face to Face "WE BUY ALL YOUR CARDS" strip https://www.facetofacegames.com |
| Preorders | Release date, deposit rule, pickup window as one chip row | Our proposal; reuse booster-pack tile |
| Hours | "Open now / opens at X" computed from schedule; holiday override; tap-to-call and tap-for-directions | Our proposal |
| Skip link, pause control | Skip to main content; any carousel has Pause | Card Kingdom skip link, Face to Face Pause control (fetched markup) |

## 5. Signature ideas (Home elements only a card shop has)

| Idea | What it is | A11y / epilepsy-safe | Risk |
|---|---|---|---|
| 1. Binder week | A 3x3 binder page: seven pockets for Mon-Sun (plus "monthly" and "open play"), each pocket a card-shaped night (game, time, price). Tap flips a pocket open to details | Real ordered list of seven items; focus ring on each pocket; Enter/Space opens details panel (no flip needed); flip is a short 200 ms fade, off under reduced motion and Motion switch; no flashing | Looks the same when images missing: text-only fallback must look intended |
| 2. Pairings board | Events list styled as a taped pairings sheet: table numbers, ruled lines, "Table 3 - Commander - 7pm" rows | Real `<table>` with headers; tape and paper are CSS, static; high contrast ink on paper | Do not fake player names (no personal data) |
| 3. Buylist price slip | A narrow receipt/price slip with typed lines and a total, handwriting for the total | Live total in `aria-live="polite"` region, updates debounced, no animated counters; labels on all inputs; 48px steppers | Do not publish real rates until owner confirms (CONTEXT open questions) |
| 4. Toploader of the week | One hero single in a toploader with graded-style label chip (condition big, ID small) beside a short story | Alt text states card name/condition; no shimmer; foil optional and hover-only, static under reduced motion | Must be generic art/placeholder until owner photos arrive (rule 4) |

Shared rules for all four: nothing moves on its own; every animation behind `prefers-reduced-motion: no-preference` AND the site Motion switch; no flashing (WCAG 2.3.1); targets 48px; 200% zoom without sideways scroll; visible focus; text never on #7EC8F0 or plain orange.
