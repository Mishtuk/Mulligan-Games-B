# Design directions (designer, 2026-11-19)

Brief: owner wants it to "reflect a card shop"; old site (cream paper, brick, serif, pills, video hero) is out. Logo (viewed): sky-blue letters, thick deep-purple outline, thin orange inner edge, on white. Ratios below are WCAG, computed by me (node, sRGB formula). Fonts are Fontsource ids (OFL; confirm licence on Fontsource). Pages (type file): Home, Events, Shop (singles / sealed / preorders), Sell to us, Visit. Main actions one tap from every page: Events, Shop, Visit (header bar on phone: three 48px targets plus Menu).

## Shared across all three: the 5:7 "pocket"
One `Pocket` component, aspect-ratio 5/7, built from a real `<li>`/`<article>` with text (never an image of text). Anatomy borrowed from a card, drawn generic (rule 12): title bar (top), art window (photo or marked placeholder), text box (body), foot line (price / time / condition chip). Same frame is a binder pocket, a case card, an event night, a sealed tile. States: hover (lift or shift, motion-gated), focus (3px ring in --link), pressed, selected, disabled/out-of-stock (greyed, never hidden). Skin differs per direction (below). Empty state: a pocket with a dashed edge and "Nothing booked yet".

---
## A. "Pairings Wall" (neo-brutalist, adapted to the logo)
**Case.** A card shop wall is paper taped up: pairings sheets, price stickers, a binder open on the counter. This takes the kit's neo-brutalist preset (3px black borders, hard shadows, stickers, mono labels) and swaps its yellow/blue for the logo's own purple, sky and orange, so the wordmark's thick outline is literally the site's border language. Reads as a hobby-shop counter: loud, practical, game-night.
**Palette.** --bg #FAF8FF  --bg2 #DDF0FB (sky tint)  --text #1B1030  --muted #4B4560  --line #1B1030  --accent #F28C28 (fill only)  --on-accent #1B1030  --link #5B2A86  --alt #5B2A86  extra --sky #7EC8F0 (fill), --shadow 6px 6px 0 #5B2A86.
Ratios: text/bg 17.1; muted/bg 8.6, /bg2 7.7; text/bg2 15.4; on-accent/accent 7.4; link/bg 9.4, /bg2 8.5; white on purple 9.9; sky vs ink 9.8. Orange vs bg is 2.3, so orange is never text or the only edge (a 3px ink border always carries it). Beside the logo: logo sits on --bg (near white) in a 3px bordered plate; its purple outline and our shadow/border purple match, sky tint panels echo the letters, orange buttons echo the inner edge.
**Fonts.** `space-grotesk` 500/700 (display and body), `space-mono` 400/700 (labels, prices, pairings).
**Pocket skin.** 3px ink border, 0 radius, hard purple shadow; mono tab label "01 / WED" stuck top-left; sticker price chip rotated 2deg (never more than 3).
**Home IDEA: pairings board.** This week's events as a taped paper sheet: real `<table>` with header row (Night, Game, Time, Fee, Seats), ruled lines, mono table numbers "T1..T8", two tape strips at the top corners, one "Tonight" row highlighted with a sky fill and a "Sign up" press button. Shape: tall sheet, 5 columns at 1280, collapses to stacked rows (label: value) at 390. No player names.
**Hero 390 / 1280.**
```
390                         1280
+-----------------+   +----------------------------------------------+
|[logo]  [Menu]   |   |[logo]  Events Shop Sell Visit   [Open now]   |
|+---------------+|   |+--------------------------------------+ (S) |
|| TONIGHT:      || |   || MULLIGAN   (width-fit headline)      |     |
|| Pauper 7pm    ||   |+--------------------------------------+     |
|+---(sticker)---+|   | [ search singles....... ][Find]  chips: MTG |
|[search][Find]   |   | PAIRINGS SHEET: T1 Pauper 7pm $10  [Sign up]|
|chips MTG PKM OP |   |                                              |
+-----------------+   +----------------------------------------------+
```
**Menu / transition.** Floating pill nav per kit is out (pill = old site); use a flat 3px-bordered bar, five labels at 1280, "Menu" button opening a full-width bordered sheet at 390. Cross-document crossfade 150ms.
**Motion.** Low: press-down buttons (shadow 6px to 2px) only; Motion switch kills even that. Nothing moves alone.
**4 signature moves.** (1) Tab-and-stripe section labels with hazard stripe in orange/ink; (2) hard purple offset shadows; (3) rotated sticker price chips; (4) width-fit display headline.
**Risk.** Neo-brutalism can feel generic "startup" and shout too much for parents of 8-year-olds; mitigate with real photos and plain copy, and keep stripe use to one per page.

---
## B. "Display Case" (dark, lit glass, fantasy-lite)
**Case.** The best thing in a card shop is the lit glass case of singles at night. A deep-purple page with lit shelf rows, toploaders and slab-style labels makes every card object glow; the fantasy tone of the wordmark finally has a home. It reads as "evening game night", the hours when most events actually run (2pm-12am).
**Palette.** --bg #1C0E30  --bg2 #2B1748  --text #F4EEFF  --muted #BDB1D6  --line #7A62A3 (UI only)  --accent #7EC8F0  --on-accent #1C0E30  --link #7EC8F0  --alt #F28C28; extra --plate #FFFFFF (logo plate).
Ratios: text/bg 16.0, /bg2 14.0; muted/bg 9.0, /bg2 7.9; on-accent/accent 9.9; link/bg 9.9, /bg2 8.6; orange/bg 7.4, /bg2 6.5; ink on orange 7.4; line/bg 3.6 (UI >= 3). Beside the logo: the wordmark needs white, so it sits on a white rounded-rect "label plate" (purple on white 9.9) like a shelf label; the dark page is the case, the plate is the price tag. Sky accent equals the letters, orange is the second ink.
**Fonts.** `cinzel` 600/700 (small-caps labels and H1/H2 only, never body), `alegreya-sans` 400/700 (body), `jetbrains-mono` 400/700 (prices, grades).
**Pocket skin.** Toploader frame: 2px --line border, 6px radius, top notch, inner 1px highlight, thicker 5px frame for the "featured" ones; slab label chip at the foot (condition big right, name left, tiny id bottom) in sky/ink, no grading-company trade dress. Shelf lip: 3px --line bar under each row with a faint top light bar.
**Home IDEA: toploader of the week.** One large toploader (about 5:7, 320px wide at 390, 420 at 1280) on a lit shelf, beside a short story ("why this one") and a slab label with condition and a "Ask at the counter" link. Below it a shelf row of 4 more pockets (new in). Placeholder: generic card back drawn in CSS until owner photos arrive.
**Hero 390 / 1280.**
```
390                         1280
+-----------------+   +----------------------------------------------+
|[plate:logo][=]  |   |[plate:logo]  Events Shop Sell Visit [Open now]|
|OPEN TONIGHT     |   | TONIGHT 7PM            +-----+  The pick:    |
| until 10pm      |   | Pauper  [Sign up]      |TOP- |  short story  |
|+----toploader--+|   |                        |LOAD |  [slab label] |
||  [5:7 pick]   ||   | [search singles......][Find]  +--+--+--+--+  |
|+---------------+|   |=======shelf lip========|  |  |  |  | new in  |
|[search....][Go] |   +----------------------------------------------+
|[Events][Visit]  |
+-----------------+
```
**Menu / transition.** Bottom-anchored tab bar at 390 (Events, Shop, Sell, Visit + More), thumb reach; top bar at 1280. Crossfade 150ms.
**Motion.** Low: hover lift 2px and a static foil gradient on the featured toploader that never animates; Motion switch off removes lift. Nothing autoplays.
**4 signature moves.** (1) Lit shelf rows with lip; (2) toploader frame on featured items; (3) slab-style condition label; (4) logo on a white label plate.
**Risk.** Dark theme: photos of cards and shop shot in daylight can look washed or clash; the logo plate looks pasted if misjudged; Cinzel is decorative, keep it off long text. Needs its own checked dark tokens (done above) and no auto-invert.

---
## C. "Deck Shelf" (clean white, colour from the products)
**Case.** Ultra PRO and Dragon Shield keep the page white and let sleeves and deck boxes supply colour. This does that for a local shop: white and cool-grey chrome that matches the logo's white ground, and a rack of flat-colour deck boxes (one per game night: Commander, Draft, Pokemon, One Piece, Tabletop) carrying the colour. It reads as "a wall of product", and is the calmest for parents and the densest for prices.
**Palette.** --bg #FFFFFF  --bg2 #EDF1F8  --text #1F1830  --muted #55506A  --line #8A86A0 (UI)  --accent #5B2A86  --on-accent #FFFFFF  --link #5B2A86  --alt #9A4507 (copper, text-safe)  extras: deck-box fills --box-teal #0F6E7A, --box-green #2E6B3A, --box-blue #2F5FB0, --box-orange #F28C28 (ink text), --sky #7EC8F0 (tint only).
Ratios: text/bg 17.1, /bg2 15.1; muted/bg 7.7, /bg2 6.8; on-accent/accent 9.9; link/bg 9.9; copper/bg 6.5, /bg2 5.7; white on teal 5.9, green 6.4, blue 6.2; ink on orange 6.9; line/bg 3.5 (UI). Beside the logo: logo on pure white, no plate, full-size in the header; purple is the single action colour (buttons), orange only as the "Tonight" chip and tag fills.
**Fonts.** `barlow-condensed` 600/700 (uppercase headings), `barlow` 400/600 (body), `ibm-plex-mono` 400/600 (prices, tables).
**Pocket skin.** Deck-box front: 1px --line edge, 8px radius, flat game colour fill with a lid line at 12% height and a thumb notch; art window below it; text box white. Sealed and preorders use a booster crimp (clip-path zigzag top and bottom, static).
**Home IDEA: binder-week page.** A 3x3 binder page: seven pockets Mon-Sun (Mon-Tue marked "Closed" in a greyed pocket) plus "Monthly series" and "Open play", chrome ring-holes down the left edge, thin plastic edge on each pocket. Each pocket: day, game, time, fee chip; tap opens a details panel (Enter/Space, no flip needed). At 390 it becomes a 2-column page, scrolling vertically; at 1280 a true 3x3.
**Hero 390 / 1280.**
```
390                         1280
+-----------------+   +----------------------------------------------+
|[LOGO]     [Menu]|   |[LOGO]    Events Shop Sell Visit    [Open now] |
|OPEN NOW til 10pm|   | THIS WEEK AT MULLIGAN       +--+--+--+  binder|
|[search....][Go] |   | [search singles.......][Go] |Wd|Th|Fr| page  |
|+--+--+          |   |  [Commander][Draft][Pokemon]|Sa|Su|Mo|       |
||Wd|Th|  binder |   |  Singles | Sealed | Preorder|Pk|Op|..|       |
|+--+--+  page    |   +----------------------------------------------+
|[Events][Visit]  |
+-----------------+
```
**Menu / transition.** Plain sticky top bar (kit class `plain`), "Menu" opens a full-width list at 390; no pill. Crossfade 150ms.
**Motion.** Low: hover/focus outline and 2px lift on pockets only; details panel opens instantly under Motion off. Nothing moves alone.
**4 signature moves.** (1) Binder page with ring holes; (2) deck-box colour tiles per game; (3) booster-crimp preorder tiles; (4) price-tag chip in mono.
**Risk.** Safest and tidiest, so it could drift to "generic Shopify store" unless the binder and deck-box objects are drawn with real craft and photos; it has the least personality at first glance.

---
## Recommendation
**A "Pairings Wall"** is my pick: it is the only one built on the kit's preset, it carries the logo's thick purple outline into every border, it handles the dense Events/price data best on a phone, and it is clearly a card-shop counter, not a template. Borrow B's toploader as the Shop page's featured-single treatment and C's binder-week for the Events page. If the owner wants the most "wow" and evening mood, choose B.

---
## Advisor critique (2026-11-19)
Verdict: go with changes. Pick A's skin, change A's Home idea.

**Ratios re-run (node, WCAG):** A text/bg 17.1, muted/bg2 7.7, ink on orange 7.4, orange/bg 2.3; B muted/bg2 7.9, line/bg 3.6, orange/bg 7.4; C line/bg 3.5, white/teal 5.9, white/blue 6.2, copper/bg 6.5; sky/white 1.8. All match the stated numbers. Contrast is not the deciding risk; the lines at 3.5-3.6 pass only because they are UI edges, and must stay out of text.

**1. Card shop at a glance on a phone (390px)**
- A: first screen is a bordered "TONIGHT" box, a search bar and chips. It reads "event listing / zine", not "cards". The pocket is not above the fold. Needs one card-shaped object in the first screen.
- B: strongest instant read (lit case, toploader, slab label) and fits evening use. But the first screen holds one big placeholder toploader, which is a drawn card back until owner photos arrive.
- C: binder pockets are visible on the first screen, so it reads cards best by shape. Chrome is plain, so it can pass for a generic store.

**2. Logo fit.** The wordmark is chunky sky letters, thick purple outline, thin orange edge, blackletter-ish, on white, and it is wide and short (about 340x110). A: 3px borders echo the outline, but 0-radius square edges fight the rounded letter forms; use a 4-6px radius. B: logo must sit on a white plate, which the team already flags as a pasted-on risk. C: logo on white native, cleanest. Space Grotesk plus mono says "startup", not "fantasy game shop"; the logo carries all the fantasy.

**3. Accessibility.** All three pass. Extra risks: A's hazard stripe is busy for low-vision/dyslexic readers (keep to one, decorative, no text on it). B's bottom tab bar with 4 items plus "More" crowds 48px targets at 320px; B needs separately tested dark focus rings. C's colored deck-box fills mean text colour varies per box; the orange box needs ink text, a easy slip.

**4. Build and maintenance (small static Astro).** A is cheapest: borders, solid shadows, no gradients or clip-path. C adds clip-path crimps and ring-hole art. B adds a dark token set, glow/gradient layers, plate, and the screenshot risk with daylight photos. B's toploader-of-the-week needs a weekly human edit plus a real photo; a small shop will let it go stale. Events data (one JSON/D1 source) feeds both the binder and the pairings table with no extra upkeep.

**5. Home IDEA.** Ranked for this goal ("what's on this week, when to come in") and for card-shop read:
1. Binder week: 5:7 pockets are the site's shared component, it answers "what's on", it is the clearest card object, and it degrades well (text-only pocket looks intended). At 390 use 2 columns, showing day, game and time on the face.
2. Pairings board: best for dense desktop data, but at 390 it collapses to stacked label:value rows, which is a plain list. Keep it as the Events page detail view (real `<table>` on desktop).
3. Toploader of the week: nice for Shop, wrong for Home. It needs photos and weekly content, and it answers no main action.
Yes, swap A's Home idea to binder week.

**6. Drift to the old look.** A: none (near-white bg, no serif, no pill, no video). Watch that A's bg #FAF8FF never warms toward cream. B: no, but Cinzel plus Alegreya is "serif + fantasy", the nearest to the old serif; keep Cinzel off body. C: closest to a plain Shopify look, not to the old site. No direction uses a pill or video; keep it so.

**Recommendation: A "Pairings Wall" skin (borders, offset shadow, sticker chips), Home IDEA = binder week.** Borrow two moves only: (a) C's binder-week and ring-hole strip for Home, with A's pocket skin; (b) B's toploader for the Shop page's one featured single. Pairings table moves to Events.

**DESIGN.md must:**
1. Show one 5:7 pocket (or a binder row) in the first 390px screen of Home, above the fold, with the search bar and "Tonight" row; first screen must read "cards" without the copy.
2. Give pockets a 4-6px radius (not 0) and name a display face with more game-shop character than Space Grotesk, checked next to the logo at 340px and 170px header size; or state why not.
3. List binder-week 390 behaviour: 2 columns, text on the pocket face (day, game, time, fee), a text-only pocket state that looks designed, Mon/Tue closed pockets still real list items, 48px targets, 200% zoom with no sideways scroll.
4. Limit hazard stripe to one per page, no text on it, and state that orange and sky are fills only; text/line pairs below 4.5 and 3 are listed as banned.
5. Record the rule that Home and Events read from one events data source, and that toploader/featured content is optional with a CSS placeholder, never required for launch.
