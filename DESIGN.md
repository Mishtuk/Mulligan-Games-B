# Design spec: Mulligan Games B ("Pairings Wall")

Written by the designer for the coder. Sources: `docs/review/directions.md` (A + advisor conditions), `DECISIONS.md` D3-D5, `docs/research/*`. Kit picks (read-only kit): preset `neo-brutalist` adapted (colours, display face, radius changed), site type `card-game-store`, patterns `site-header`, `motion-switch`, `cross-document-view-transition`, `ticket-card`, `product-card`, `enquiry-form`, `ph`. Where this file and a prototype disagree, tell the designer.
**Status:** 2026-11-19, brought in line with the build at loop 10 (after D6 and loops 1-9). Designed: everything below. Waits on owner: phone/email, photos, fees, buylist rates, hosted store, Discord, confirmed hours.
**Main actions, one tap from every page:** Events, Shop, Visit (header and Menu sheet).

## 1. The idea
A card shop is paper and plastic: pairings taped to the wall, a binder open on the counter, price stickers, a case of toploaders. The site is that counter. Near-white ground, ink-black 3px borders and hard purple shadows (the logo's thick outline made into a border language), sky tint panels (the letters), orange fills (the inner edge). Every object is drawn from real shop things (binder page, pairings sheet, slab label, buylist receipt, taped hours sheet, booster box and pack), generic shapes only. Nothing is cream, serif, pill-shaped or video.
1. **Binder week** is the Home IDEA: seven day pockets starting Wednesday (Mon and Tue are closed, so they sit last) plus Monthly series and Open play, 5:7 pockets on a binder page with a ring-hole strip. A pocket is in the first 390px screen.
2. **One Pocket (5:7)** is the shared frame for binder days, sealed and preorder tiles, and mini game pockets.
3. **Pairings sheet** is the Events table: taped paper, ruled rows, real `<table>`.
4. **Tab and stripe**: mono folder tab with a plain word ("FIND A CARD", "SIGN UP"), no numbers, only where it adds to the heading (never repeats it). No hazard stripe (cut loop 37).
5. **Sticker price chip and slab label** for prices and condition.
6. **Events data is one file** (`src/data/events.json`); Home binder, Tonight, Events sheet and the D1 seed all read it. No featured single until the owner sends a real card photo (D6).

## 2. Tokens (light only; `color-scheme: light`; never auto-invert)
```css
:root {
  color-scheme: light;
  --bg: #FAF8FF;          /* page; never warm toward cream */
  --bg2: #DDF0FB;         /* sky tint panels */
  --card: #FFFFFF;        /* pocket / paper surface */
  --bg3: #E7E3F0;         /* closed or disabled pocket */
  --text: #1B1030;
  --muted: #4B4560;
  --line: #1B1030;        /* borders, decoration */
  --soft-line: #8D86A6;   /* thin dividers, UI only (3.3) */
  --accent: #F28C28;      /* FILL only */
  --on-accent: #1B1030;
  --accent2: #5B2A86;     /* secondary button fill, tab */
  --on-accent2: #FFFFFF;
  --link: #5B2A86;
  --alt: #5B2A86;
  --sky: #7EC8F0;         /* FILL only */
  --error: #B3261E;
  --ok: #1E6B3A;
  --font-display: "Titan One", "Arial Black", system-ui, sans-serif;
  --font-body: "Atkinson Hyperlegible", system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
  --display-weight: 400;  /* Titan One has one weight */
  --tracking: 0; --display-case: none;
  --border-w: 3px; --radius: 5px;
  --shadow: 6px 6px 0 var(--accent2); --shadow-sm: 3px 3px 0 var(--accent2);
  --step--1: .875rem;
  --step-0: clamp(1rem,.95rem + .25vw,1.125rem);
  --step-1: clamp(1.25rem,1.1rem + .7vw,1.5rem);
  --step-2: clamp(1.6rem,1.3rem + 1.4vw,2.25rem);
  --step-3: clamp(2.2rem,1.6rem + 3vw,3.75rem);
  --display: clamp(2.6rem,1rem + 9vw,7rem);   /* hero only */
  --s-1:.5rem; --s-2:.75rem; --s-3:1rem; --s-4:1.5rem; --s-5:2.25rem;
  --section: clamp(2.75rem,1.5rem + 5vw,6rem);
  --gutter: clamp(16px,12px + 2vw,40px);
  --measure: 62ch; --tap: 48px; --max: 1200px;
}
```
**Computed pairs (WCAG, node):**
| Pair | Ratio | Rule |
|---|---|---|
| text/bg 17.1; text/card 18.1; text/bg2 15.4; text/bg3 14.3 | pass | body, headings |
| muted/bg 8.6; muted/card 9.1; muted/bg2 7.7; muted/bg3 7.2 | pass | secondary text |
| link(purple)/bg 9.4; /card 9.9; /bg2 8.5 | pass | links, focus ring |
| on-accent ink / orange 7.4 | pass | primary button text |
| white / purple 9.9; bg / purple 9.4 | pass | secondary button, tab text (tab = bg on ink 17.1) |
| error/bg 6.2, /card 6.5; ok/bg 6.2, /bg2 5.6 | pass | messages (always with icon + word) |
| ink / sky 9.8; ink-border / bg 17.1 | pass | sky fills carry ink text |
| soft-line / bg 3.3; focus purple / bg 9.4; purple ring on orange button 4.0 | >=3 | UI edges only |
| Release ads (loop 53): trek-text/trek-bg 17.2; trek-glow/trek-bg 12.3 (10.2 on the scrim mid-tone); pk ink/pk-bg 16.4, pk-hi/pk-bg 6.0; rift-ink/rift-bg 14.1, rift-gold/rift-bg 8.9; holo-ink/holo-bg 12.3, holo-hi/holo-bg 6.7 | pass | ad panels and date lines; stripe colours (pk-red/blue/yellow, holo-sky/lav, mana-*) are decoration only, never text |
**Banned pairs:** text in `--sky` on anything light (1.7); text in `--accent` orange on `--bg`/`--card` (2.3); orange as the only edge of a control (needs the ink border); `--soft-line` or `--muted` as text on `--bg3` under 4.5 (it is 7.2, fine) but never `--soft-line` as text (3.3); text on the hazard stripe; white on orange (2.3); any pair not in the table.
Focus: `:focus-visible { outline: 3px solid var(--link); outline-offset: 3px; }`, on orange buttons the ring is offset so it lands on `--bg`.

### Fonts (max 4 files, self-host, `font-display: swap`, CSP `font-src 'self'`)
| Role | Font (Fontsource id) | Files | Use |
|---|---|---|---|
| Display | Titan One `titan-one` | latin-400 | H1/H2, pocket day names, big numbers; sentence case; never body, never past ~3 lines |
| Body | Atkinson Hyperlegible `atkinson-hyperlegible` | latin-400, latin-700 | everything else; 16px minimum |
| Mono | Space Mono `space-mono` | latin-700 | tab labels, prices, times, table numbers, slab labels |
URL pattern: `https://cdn.jsdelivr.net/fontsource/fonts/<id>@latest/latin-<weight>-normal.woff2` (download to `downloads/fonts/`, move used files to `public/fonts/`). Total 4 files.
**Why beside the logo:** the wordmark is chunky, rounded-edge letters with a thick outline; Titan One is a heavy rounded game-box face with the same weight and softness, so headings read as the same family without copying the blackletter-ish letterforms. Space Grotesk was too neutral ("startup"). Atkinson is for legibility at small size and has friendly open shapes. Verify at build: screenshot the header (logo 160px wide, about 56px tall) beside a 28px Titan One H1 and the 340px logo on Home; if the display looks too toylike with parents, fallback is `bowlby-one` latin-400 (same slot). Headings never start with "The" + a word.
| Type scale | Phone / desktop | Notes |
|---|---|---|
| Display (hero H1) | 2.6rem to 7rem, lh 1.05 | one or two lines; width-fit not required |
| H2 | 1.6 to 2.25rem Titan One, lh 1.15 | |
| H3 / pocket title | 1.25 to 1.5rem Titan One | |
| Body | 1 to 1.125rem Atkinson, lh 1.55 | measure 62ch |
| Label | .875rem Space Mono 700 uppercase, tracking .04em | never below 14px |

### Layout
Max 1200px, gutter 16px at 390, breakpoints 390 (check), 820 (nav to Menu), 1280 (check). 12-col grid at desktop, single column and 2-col pockets on phone. Sections spaced `--section` with a varied rhythm, never box after box: bordered `.box` (cards sit higher via shadow), full-bleed `.band` (width `100cqw` on the container `main`, no overflow clip: purple playmat on Home "What we play", booster-crimp top edge on Shop Sealed, sky address band on Visit) and unboxed `.airy` sections. Radius 4-6px on boxes, pockets, buttons, inputs; chips and stickers 4px (no pills anywhere).

## 3. Motion (low; nothing moves on its own)
- Moves: button press (translate 4px 4px, shadow 6px to 2px) and Pocket hover/focus lift (translate -2px -2px, shadow grows). Both 120ms ease-out, only on `:hover` / `:active` / `:focus-visible`.
- Page change: cross-document view transition, crossfade 150ms (kit pattern); instant under Motion off.
- Motion switch (kit `motion-switch`): in the header on every page, visible label "Motion: on/off", real `<button aria-pressed>`, 48px, default on unless `prefers-reduced-motion: reduce` (then off and the switch says off); choice in `localStorage` (try/catch), applied as `data-motion="off"` on `<html>`. All motion CSS is under `@media (prefers-reduced-motion: no-preference) { html:not([data-motion="off"]) ... }`.
- Banned: foil shimmer, glow, pulse, parallax, autoplay carousel or video, spinning dice, counters that animate, flash/strobe, sound. Nothing flashes over 3/s.

## 4. Components (states: default, hover, focus, pressed, disabled, empty, loading, error where relevant)
**Header.** Sticky, bg `--bg`, 3px bottom border. Left: logo as link to Home (`<img alt="Mulligan Games, home">`, 340x120 source shown 160px wide at 390, 170px at 1280, explicit width/height). At >=820: nav Events, Shop, Sell to us, Visit (links, 48px, current page = 3px underline in `--accent2` plus `aria-current`), then the Open chip and the Motion switch. Below 820: logo, Motion switch, and a "Menu" button (48px, `aria-expanded`) opening a full-width bordered sheet (all five destinations incl. Home, 56px rows, Events/Shop/Visit first, Esc and focus return, no scroll lock trap). Under the header at 390: a one-line strip with the Open chip. Skip link first. **Open chip:** computed in the browser from `store.json` hours in America/New_York: "Open now, until 10pm" (sky fill, ink text) or "Opens Wed 2pm" (white, ink border); with JS off shows "Hours" linking to Visit. Chip text and an icon, never colour alone.
**Footer.** `--bg2` with 3px top border (no stripe). Three blocks (stack at 390): Visit us (address + Open in Maps); Hours (today marked) with one line "Hours and nights can change. Confirm with the store." (on Visit the Hours block is one link, "Opening hours are above", and the Visit us column drops); Find us online (Instagram, X, Patreon, TopDeck, Wizards locator, Privacy in two 48px columns; Discord, phone, email only when set). Legal line: "Not affiliated with Wizards of the Coast, The Pokémon Company, Bandai or any publisher. Game names belong to their owners."
**Buttons.** `.btn` primary: orange fill, ink text, 3px ink border, radius 5, `--shadow` 6px purple, min-height 48. Secondary: `--accent2` fill, white text. Ghost: transparent, ink border. Hover: lift (motion on). Pressed: translate 4px, shadow 2px (motion on); with motion off pressed = shadow removed and bg darken via border only. Disabled: `--bg3`, muted text, no shadow, `aria-disabled`. Loading: label becomes "Sending..." and disabled.
**Chips.** 2px ink border, 4px radius, 14-16px text, filter chips are links/buttons 48px high with `aria-pressed`/`aria-current`; selected = sky fill + check mark. Status chips: "Tonight", "Today", "Full", "Waitlist" with word + border. Research words ("Likely", "Unverified") never appear on a public page (`test/no-jargon.test.mjs`).
**Pocket (5:7).** `aspect-ratio: 5/7` (min-height grows if text needs it; never clip: use `min-height` not fixed height, at 200% zoom the grid drops to 1 column). Real `<li>` with an `<a>` or `<button>` stretched over it. Anatomy: title bar (Titan One, ink on sky, 3px bottom border), art window (photo, or CSS placeholder), text box (white `--card`), foot line (mono price/time + sticker). 3px ink border, radius 5, `--shadow-sm`. States: hover lift; focus ring; pressed shadow 0; selected = orange tab; closed = `--bg3`, dashed 3px border, text "Closed" (still a list item); empty = dashed, "Nothing booked yet". Variants: **binder pocket** (day name, game, time, fee chip; face shows day, game, time, fee; text-only look = sky title bar over white body, designed on purpose); **sealed tile** (art window draws a generic booster box in CSS: sky lid over an orange body; name, game, "Ask in store" chip); **preorder tile** (art window draws one booster pack: purple, crimped ends, tilted -8deg, static; release date in mono); **mini** (game name only, What we play). Sealed and preorder tiles render from `products.json` rows; Home shows one generic pair until rows exist, Shop shows the "On the shelf" panel instead (D6).
**Binder page container.** `--bg2` panel, 3px border, left strip of ring-hole circles (CSS radial gradient, decorative, `aria-hidden`), pockets in a grid inside: 3 cols at 1280, 2 cols at 390; at 200% zoom 1 col. `<ol>` of 9 items, Wednesday first. Pocket links are named by day + main night + time/fee.
**Toploader.** Removed (D6) until the owner sends a real card photo; no component exists.
**Slab-style condition label.** 3-part strip, 3px ink border: left name (body 700), right condition big (mono 700, 1.5rem: NM/LP/MP/HP/DMG), bottom tiny id (mono .75rem is NOT used; id is 14px). Sky fill, ink text. No grading-company colours or names.
**Tab and stripe section label.** `.box` position relative, 3px ink border, `--shadow-sm`; `.tab` at top-left, ink bg, `--bg` text, mono 700 14px uppercase ("FIND A CARD"), translated up 100%. The hazard stripe is gone (loop 37).
**Sticker price chip.** Bg `--card`, 2px ink border, 4px radius, mono 700, rotate 2deg (max 3), `box-shadow: 2px 2px 0 var(--line)`; price text ink on white. Shown only for a known price or fee; an unknown one shows no chip (loop 38). No "ASK" stickers, no tape pieces on the Sell sign or Visit hours (loop 37).
**Forms.** Visible `<label>` above every field (never placeholder-only), 48px inputs, 3px ink border, radius 5, focus ring. Required marked "(required)" in text. Error summary at top (`role="alert"`, `tabindex=-1`, focused on submit failure, border 3px `--error`, icon + "Fix N things:" with links to fields); field error under the field in `--error` with "Error:" prefix. Success: replaces form with a bordered `--bg2` panel, `role="status"`, what happens next, link back. Honeypot `.hp` field (off-screen, `tabindex=-1`, `autocomplete=off`). Works without JS (POST then 303 to `?sent=<form>#<form>-ok`, panel by `:target`). **Turnstile** (loop 50, `src/components/Turnstile.astro` before each submit button): only when `TURNSTILE_SITE_KEY` (src/lib/site.js or env at build) is set: `.cf-turnstile` compact + interaction-only (invisible unless Cloudflare asks; fits 320px), api.js once per form page, a noscript line "Sending needs scripts on (a spam check). Or ask at the counter."; no key = nothing rendered or loaded (local). `build:deploy` refuses an empty or test key. No child data beyond first name.
**Pairings table.** `<table>` with `<caption class="vh">`, `<th scope>`; one block per day (day name + mono date), columns Time, Game (sleeve swatch + name), Format, Fee, Seat (Hold a seat only when seats exist; Add to calendar on every row, lined up); one visible header row (aria-hidden) over per-day tables with a visually hidden thead. Paper `--card`, ruled 1px `--soft-line` rows, 3px outer border, two CSS tape strips on the top corners (decorative). Row for today: sky fill + "Tonight" chip. At 390: each row becomes a block (`display:block` rows, cells `display:flex` with `data-label` shown via `::before` in mono), still a real table for AT (`role` kept). Unknown fees show nothing.
**Placeholder photo (`Photo.astro`, two slots: Visit storefront, Events play room; `store.json` `photos.*` null = placeholder, filled = real `<img>`).** `.ph`: `--bg2` fill, diagonal 1px `--soft-line` hatch, centered mono "Photo coming", fixed aspect via variants (4:3, 5:7, 16:9, 1:1). Never a person. Alt text empty+`role="img" aria-label="Photo coming: <what>"`. The Events placeholder is hidden under 52rem page width (it adds ~180px at 390); a real photo always shows. Real photo replaces it with a 3px ink border, `loading="lazy"`, width/height set.

## 5. Pages (390 first, then 1280)
Titles: "<Page> | Mulligan Games, Warminster PA". Every page: header, `<main id="main">`, footer. Hazard stripe max one.

### Home (`/`)
Purpose: what's on this week, find a card, when to come in. Source: `events.json`, `store.json`.
```
390                      1280
[logo]   [Motion][Menu]  [logo] Events Shop Sell Visit [Open] [Motion]
[Open now, until 10pm]   +-----------------------+  +------------+
+----------------------+ | Pull up a chair.      |  | binder page |
| TONIGHT   Fri        | | Singles, sealed,      |  | o [Wed][Thu]|
| Draft FNM 7pm $20 [Join]| and games most nights.|  | o [Fri][Sat]|
+----------------------+ | [Find a card] [Events]|  | o [Sun][Mon]|
o [Fri ] [Sat ]  <- binder +-----------------------+  +------------+
o [Sun ] [Mon ]  (above   TONIGHT strip full width
  fold: top row visible)
```
Top to bottom at 390: (1) header + Open chip strip; (2) hero: H1 "Pull up a chair." + the store's line ("Singles, sealed and games most nights in Warminster. Stop in and stay for a game."), buttons "Find a card" (Shop) and "This week" (Events) (hero line now: "Singles and sealed product, with Commander, draft and more most nights. Stop in and stay for a game."); (3) **Tonight** box: today's events from `events.json` by time, with fee sticker; (4) **Binder week** from Wednesday, today's pocket flagged, each pocket links to `/events/#<day>`; a pocket sits inside the first 844px; (5) "Not in the binder?" want-list form (tab FIND A CARD) posting `/api/request`: cards, game, first name, email, "Send my want list"; (6) **What we play** on the purple playmat band: mini pockets to `/events/?game=`; (7) Sealed and preorders: booster box + booster pack pockets ("Ask in store") until `products.json` has rows; (8) Sell to us, unboxed: slab YOUR CARDS / CASH OR STORE CREDIT + "Build my buylist"; (9) footer (the old "Stop in" box is cut: the footer carries it). At 1280: hero then Tonight left, binder page right (even 3x3, equal pockets), want-list form full width in one row, What we play band, then Sealed and preorders beside Sell to us.
Empty states: no events -> "No nights booked yet. Check Discord or ask in store." Done when: pocket above fold at 390, text readable with no images, JS off still shows server-rendered events.

### Home: New releases and From our Instagram (loop 52, owner feature)
- **New releases** (ads, loop 53) sits right after the binder. Star Trek featured: a deep-space banner, key art full-bleed (`object-fit: cover`) under a `--trek-bg` scrim gradient (bottom-up on phones, left-to-right from 720px), text real HTML: mono caps eyebrow, sleek-caps headline "New frontier. New cards.", uppercase date line ("OUT NOW · RELEASED NOV 13"), "Star Trek has landed at Mulligan.", products line, button "Shop Star Trek in store" to /visit/#contact, credit. Cues only: starfield, deep green, wide-spaced caps; no LCARS, insignia or logos. Smaller ads per set (4 across from 960px, 2 across below): image on top over a stripe, themed panel below by `theme` (`pokemon` type-colour stripe + pale yellow; `riftbound` navy + gold caps; `hololive` pastel pink + sky/lavender stripe; `magic` mana-pip stripe; no `one-piece` row yet), headline "Out now. Grab a pack." / "Hold a box for Jan 29", set name, uppercase date line, status chip, credit. Theme colours are `:root` tokens in global.css (pairs in section 2; a test bars colour literals in releases.css). TCG sets only. Data: `src/data/releases.json` (Confirmed/Likely rows; each has a `theme`). Status ("Out now" / "Coming <date>", hidden after 90 days) is computed at build and again in `public/js/home-live.js` against today in America/New_York. Images are picture/WebP 480+ with JPEG fallback, lazy except the featured one. No motion, no carousel, no prices or stock claims.
- **From our Instagram**: promo text cards from `src/data/instagram.json` (past/cancelled posts left out) with a click-to-load facade: "Show this post from Instagram" is a plain link without JS; on click `public/js/home-live.js` inserts the sandboxed embed iframe. CSP frame-src allows https://www.instagram.com only. "Follow @mulligangames" link below.

### Events (`/events/`)
Purpose: see week and sign up. Source `events.json`. Top: H1 "Game nights", filter chips by game (links `?game=magic`, "All" default; works without JS via static sections plus JS enhancement; selected = sky + check). Then one **pairings sheet** of seven days from today with real dates (JS rotates it; without JS it ships Wednesday to Tuesday), today's rows sky + "Tonight"; closed days are one line. At 390 each row becomes a bordered label/value block. **Special nights**: ticket cards (date stub left, title, fee sticker, Add to calendar). "Hold a seat" form (tab SIGN UP) for events with a cap: night select, first name, email, optional note; posts `/api/signup`; seats left from `/api/seats`, full = waitlist. Sign-up rows come from `events.json` at build time (`seedEvents`, stable ids); `tools/seed-events.mjs` prints the matching D1 seed for deploy day. Scripts off: the Worker redirects to `#<form>-ok|-wait|-err` and the panel shows by `:target`. `.ics` per event. One quiet "Confirm with the store" line under the sheet. 1280: chips on top, sheet left, special nights + sign-up clipboard (+ play-room photo slot) right. A game with no nights hides the whole sheet and says "No <game> nights listed."; the result is announced in `#ev-status` (role=status).

### Shop (`/shop/`)
Tabs as in-page sections with chips: Singles | Sealed | Preorders (anchors, all content on one page; nav "Shop"). **Singles:** a drawn singles case (two shelf rows with shelf tags, card backs patterned by the tag's games), the folded condition guide ("Show condition guide", same component as Sell), then the "Not in the case? Ask for it." want-list form (worked example "Sol Ring, Commander Masters, NM, 1") posting `/api/request`; no hosted store yet. **Sealed** (booster-crimp band): pockets only from `products.json` rows, else box + pack on a shelf edge, "Ask at the counter for a box or a deck." + "Ask about stock". **Preorders:** a mono pre-order slip ("Ask for the release date and price", Ask us). 1280: Sealed and Preorders as two equal columns.

### Sell to us (`/sell/`)
Buylist slip: a receipt panel (white, ink border, mono) headed "MULLIGAN GAMES · BUYLIST" with dashed tear lines. Rows (card name, set, condition select, qty) as parallel `item_*[]` fields: one row with JS (Remove hidden on a single row), three without; one-line rows from 820px. "Add a row", "Cash or store credit" radios, name, email, note; foot count "LINES: N" (`aria-live="polite"`, no prices); "Send my buylist" posts `/api/buylist`. After: success panel saying what happens next. Top: three numbered steps. Right column: "We buy cards" counter sign (cash or store credit, rates at the counter, bulk) and the folded condition guide; sticky at 1280 only while the guide is folded and the window is >= 38rem tall. LINES total shows only once a card is named. 1280: slip left, sign right; two columns switch on container width in rem (200% text safe).

### Visit (`/visit/`)
Sky address band: 445 street-number placard + "Open in Maps" (no embed), storefront photo slot (2:1, right at 900+); Hours sheet (7 rows, today sky + "Today" chip); "Ask us something" contact form (tab CONTACT, `/api/contact`); "House rules" taped sign (Bring line, one "Age rules and entry fees: confirm with the store."). Discord and phone only when set. 1280: hours | form, rules full width below.

### 404 and privacy
404: H1 "Misprint.", sentence, buttons Home / Events, a drawn misprinted card (no motion). Privacy: plain text page, what each form stores (D1 rows), no analytics or trackers, delete on request; a Turnstile line appears only when a site key is set.

## 6. Data model (coder reads these; Home and Events both read events.json)
- `src/data/store.json`: `{name, timezone:"America/New_York", address:{street:"445 York Road", city, state, zip, certainty:"Likely (455 on Wizards)"}, hours:[{day,0-6,open,close|closed}] (shape from schedule-draft), hoursCertainty:"Likely", links:{instagram,x,patreon,topdeck,wizardsLocator,discord:null,tiktok:null}, phone:null, email:null, mapsUrl, placeholders:["phone","email","discord","parking","fees","rates"]}`. Null = hidden or "Ask in store"; never invent.
- `src/data/events.json`: `{weekly:[{id,day,time,game,format,fee|null,cap|null,source,certainty}], oneoffs:[{id,date|null,time,title,game,fee,cap,signup,source,certainty}]}` (copy of `docs/research/schedule-draft.json`). Certainty fields stay in data only: never rendered or embedded; `Unverified` rows (e.g. date null) are not shown; the Events sheet has one "Confirm with the store" line. Seats left is computed from D1, never stored.
- `src/data/games.json`: `[{id:"magic",name,color}]` for Magic, Pokemon, One Piece, Riftbound, Hololive, Tabletop, D&D (labels only, no publisher logos).
- `src/data/products.json`: empty array at launch (sealed, preorder rows: `{game,name,price|null,releaseDate,kind}`).
Facts flagged Likely: hours, address (445 vs 455), whole weekly schedule, fees. Confirmed: two one-offs. Unverified: Pokemon/One Piece/Hololive/Riftbound/D&D weekly nights, Discord invite.

## 7. Copy direction
Friendly, short, local, a little dry. Words: binder, sleeve, pairings, playmat, prerelease, store credit, top 8, bulk, table, seat. Lines: H1 "Pull up a chair." CTAs say what happens: "Find a card", "This week", "Hold my seat", "Send my want list", "Build my buylist", "Send my buylist", "Send my message", "Open in Maps". Section heads: "Tonight", "Binder week", "Not in the binder?", "What we play", "Sell to us", "Stop in". Titles and descriptions unique per page (`test/meta.test.mjs`). Empty: "Nothing booked yet." 404: "Misprint." Refuse: "elevate", "seamless", "journey", "unleash", "world-class", "your one-stop shop", exclamation overload, headings starting "The" + a word, invented prices/rates/ratings/reviews, player names, publisher logos or card art.

**Glossary (canonical words, loop 18).** One name per thing, one verb per action.
- **want list** (Home and Shop form, privacy). Never "card request" or "wish list". Button: "Send my want list".
- **buylist** (the list you send on /sell/); the page and nav are "Sell to us". Never "sell list". Button: "Send my buylist"; step: "Build your buylist".
- **store credit** (never bare "credit"), with "cash". Rates: "Rates are set at the counter."
- **Unknowns (loop 28), two phrases only.** "**Confirm with the store**" for a fact we might have wrong or do not have (nights, dates, hours, age rules, listed fees). "**Ask at the counter**" for what is settled in person (rates, prices, stock, bulk, preorders, open seats, grading, how a game is taught). An unknown fee shows nothing (no chip, no dash, no "Fee: ask"; .ics omits it); Visit carries the one line "Age rules and entry fees: confirm with the store." "Ask us" stays for the contact form. Never "ask the store", "ask the counter", "ask in store", or a bare "Fee: ask" / "Seats: ask". Enforced by `test/voice.test.mjs` over dist/.
- **hold a seat** for every event sign-up button and link ("Hold my seat" on the form); the clipboard stays "Sign-up sheet". Table column: "Seat".
- **game night** (page, h1), **pairings sheet** (weekly table), **special nights** (one-offs), **binder week** (Home), **tonight**.
- **singles**, **sealed**, **preorders**, **condition guide** (NM to DMG), **sleeved**, **bulk**, **Commander**, **draft FNM**, **cEDH** (only where events.json has it).
- Sends: "Send my ..." on every form button. Success: "**Got it.** X sent." plus what happens next. Error: "**Error:** that did not send." plus "Nothing was sent. Please check ... and send it again, or ask at the counter." Field-check summary: "**Error:** N things to check." No blame, no "you must".

## 8. Photos and media
Needed from owner: storefront, play room, singles case, a shot of tables during a night. Until then `.ph` placeholders (4:3 hero card, 16:9 visit, 1:1 tiles). Real people only with consent, none staged. No video, no embed by default (maps is a link).

## 9. References used
| Reference | Took | Did not take |
|---|---|---|
| Kit neo-brutalist preset | border, hard shadow, tab-and-stripe, tokens shape | yellow/blue palette, 0 radius, Space Grotesk, pill nav |
| Ultra PRO / Dragon Shield | white page, objects carry colour | their art, logos |
| Face to Face Games | event card = dated title + one button | carousel |
| Misty Mountain / Nutmeg / Cardsurfer | events with price, table counts, sell page | their copy |

## 10. Checks the build must pass
- Screenshots 390x844 and 1280x800, Motion on and off (switch and reduced-motion), look at them; no horizontal scroll at 320, 390, 768, 1024, 1280, 1600.
- 200% text zoom: no clipping, pockets drop to 1 column, tables stack.
- `tools/check-site.mjs` on `/`, `/events/`, `/shop/`, `/sell/`, `/visit/`, 404, privacy: no duplicate ids, 48px targets, one h1, labels, alt, a skip link.
- Contrast: a test asserts every pair in section 2 (>=4.5 text, >=3 UI); banned pairs not used.
- `document.getAnimations().length` is 0 at rest; Motion off removes hover lift and transition; nothing flashes.
- Forms: valid, empty, hostile input, honeypot, 303 redirect; output escaped.
- Home: a pocket visible inside the first 844px at 390; no "The"+word headings; footer non-affiliation line present; no placeholder data shown as fact. No stripe, no ASK stickers.
