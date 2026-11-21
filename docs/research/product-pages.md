# Sealed-product detail pages: what big shops do, and what we should do

All sources "checked 2026-11-20". Fetches were partly blocked or rate-limited (HTTP 429), so several sites rest
on search snippets only; those are marked. Layout notes are from page text, not screenshots, so image size and
mobile behaviour are inferred or unknown. Do not treat gaps as findings.

## Per-site notes
**TCGplayer** (https://www.tcgplayer.com, checked 2026-11-20). BLOCKED: fetch returned only the site title (JS app). Help page
https://help.tcgplayer.com/hc/en-us/articles/115005293167 returned 403. Not verified firsthand; widely known as a
marketplace page (market price plus many seller listings), but that is not confirmed here. Sealed prices on
third-party trackers are said to come from it (https://outof.games/realms/pokemon-tcg/products/).

**Card Kingdom** https://www.cardkingdom.com/mtg/wilds-of-eldraine/wilds-of-eldraine-set-booster-box (checked 2026-11-20).
Text-only in fetch (no gallery seen). Title, intro prose, $399.99, Add To Cart, "6 items available" (real count).
Contents as a bulleted per-pack list (12 cards, 1-5 rares or higher, 1 traditional foil). No specs table, no
related items, no reviews. "US Shipping Only" block. Plain and fast; stock count is honest.

**Noble Knight Games** https://www.nobleknight.com/P/2148077352/Wilds-of-Eldraine---Set-Booster-Box (checked 2026-11-20).
Title, publisher line, stock line "Last Stocked on 8/5/2025" with "Notify Me When Back In-Stock", "Add to Want List".
Bulleted description; a labelled spec table (publisher, product line, year, dimensions, part numbers); Related and
Recently Viewed; trust seals; shipping thresholds. Clutter: mega-menus, chatbot, popups, sale banner, newsletter.

**Star City Games** https://starcitygames.com/edge-of-eternities-play-booster-box-sld-mtg-bbx-eoe-en/ (checked 2026-11-20).
One image, breadcrumb "Sealed Products", price, quantity box, "Out of stock" button, wish list. Contents: "30 Play
Booster Packs" then per-pack rarity breakdown. Related Products row with prices and stock. Specs only hidden in
JSON-LD. Note: "online orders not eligible for Buy-A-Box / Prerelease Early Sale" (promo caveat). Unlabelled
quantity controls (accessibility flaw).

**Cool Stuff Inc** https://www.coolstuffinc.com (checked 2026-11-20). BLOCKED/empty fetch. Skipped.

**Face to Face Games** https://facetofacegames.com/en-us/products/marvel-super-heroes-play-booster-box (checked 2026-11-20).
Fetch 429; snippet only: shows release date (2026-06-19), "53 in stock", "Low stock: 3 left" on another box,
"30 play boosters per box"; box toppers named in contents ("36 draft boosters plus one box topper"). Support page
on Buy-a-Box preorder promos: https://support.facetofacegames.com/en-US/do-booster-box-pre-orders-include-a-buy-a-box-promo-3214351.

**Pokemon Center** https://www.pokemoncenter.com/category/elite-trainer-box (checked 2026-11-20). BLOCKED (bot check). Skipped.
**ChannelFireball**: not fetched (time/rate limits). Not claimed.

**Midwest Cards** (strong independent, Next.js not Shopify)
https://www.midwestcards.com/products/magic-the-gathering-wilds-of-eldraine-set-booster-box (checked 2026-11-20).
Best contents design seen: 5-photo carousel with enlarge, price $429.95, "Out of stock" plus "restocks happen
weekly", "Why rip this" bullets, "What's in the box" icon list (30 packs, 12 cards per pack), "Card highlights",
tabs (Overview / Inside the box / Box format), "More Magic" related row. No pickup info on page. Duplicate nav.

**Local Shopify shops** Flipside Gaming (https://www.flipsidegaming.com/collections/pre-orders/sealed), Card Cavern
(https://www.cardcaverntradingcards.com/collections/one-piece-sealed-products/products/kingdoms-of-intrigue-booster-box),
Time Travelers (https://timetravelersonline.com/collections/in-store-only-products), PokeBox USA: all fetches 429.
Only from snippets (checked 2026-11-20): Flipside says preorder quantities are capped, they sell out, shipping plus curbside
pickup, ships days before release. A different shop's policy: $5 deposit per preorder, balance at pickup, bonuses
handed over at pickup, preorder limited to one per customer. Layout of these pages: UNVERIFIED.

## Patterns across the shops we did read
- Contents: bulleted per-pack counts (cards per pack, rarity slots, foil/land/token) plus packs per box. Rarely the
  box extras (sleeves, dice, promo, deck box) in a labelled list; ETB-style contents are the weak spot.
- Stock: a count (Card Kingdom, F2F) or a plain "Out of stock" button (SCG). Out-of-stock pages stay up with notify.
- Specs table appears on only one of four (Noble Knight). Related rows on three. Reviews rarely on page.
- Annoying: mega-menus, chat bots, popups, seals, newsletter, duplicate nav, unlabeled controls, one small image.

## They do better / we do better
| Topic | They do better | We do better |
|---|---|---|
| Images | Several photos and zoom (Midwest) | Publisher key art with credit, one clear hero, no tiny thumbnails |
| Contents | Rarity-slot breakdown, tabs, card highlights | One short labelled list: packs, cards per pack, extras |
| Price and cart | Live cart, quantity, Notify Me, want list | No checkout: "Hold at the counter", no cart friction |
| Stock | Exact counts, restock history | Honest wording set by staff ("on the shelf", "arriving", "ask us"), never a fake count |
| Pickup | Ship thresholds, flat rates | Local pickup is the only fulfilment; hours and address next to the button |
| Events | None seen | "Release night / prerelease for this set" with date, linked to the events page |
| Related | Related rows with prices | Other products from the same set plus the matching event |
| Specs | Part numbers, dimensions (Noble Knight) | Skip SKUs; show release date and what format it is for |
| Trust and reviews | Seals, review links | Real shop, real counter; no seals or popups |
| Look | Template shop chrome, ads, upsells | Card-shop look, calm, one primary action |

## Recommendation: a real page at /shop/<release-id>/ (not a dialog)
Reasons: shareable and linkable URL from an ad, Instagram or text; works with no JS (static page built from the
release data); one `<h1>`, normal back button and focus order; no focus-trap or dialog ARIA to get wrong; each page
can carry its own title, description and share image. A dialog is only a nicety on top and can be skipped.
1. Breadcrumb: Shop > Set name; back link to the shop grid.
2. Hero: product image (credited), title, set, game badge, status badge (Pre-order / Out now / Sold out).
3. Facts line: release date, format (play, set, collector, ETB, starter), price if we publish one.
4. Action block: "Ask us to hold this" (opens the existing hold form, prefilled), plus pickup hours and address.
5. Stock note: staff-written status and "updated <date>"; never a count we cannot back.
6. "What's in the box": bulleted list with counts (e.g. 30 packs, 14 cards per pack, extras). Source line.
7. Short description: 2 to 3 sentences, no hype.
8. Events tie-in: next release night / prerelease for this set (link), if one exists.
9. Details list: game, set code, release date, product type, language, publisher, image credit.
10. Related: same-set products and other new releases (max 4 cards).
11. Fine print: holds are not sales, payment at the counter, hold length, policy link.
12. Mobile: one column, action block directly under the hero, sticky "Ask us to hold this" bar.
Data per release: id, title, game, set, type, release_date, status, image + credit + source URL, price (optional),
stock_note + updated, contents[] ({label, count, note}), description, event_ids[], related_ids[], details{}.
Ads link to /shop/<release-id>/ and the page tells the same story as the ad.
