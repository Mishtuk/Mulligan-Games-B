# Set-release ad references (checked 2026-11-20)

Scope: TCG set releases only (owner, 2026-11-20). Blocked: Instagram and Facebook posts are login-walled (Facebook search 404), so no social post could be read; refs below are publisher pages, retailer listings and press. Fetch tools summarise pages, so layout notes marked (inferred) come from file names or text only; no images viewed or downloaded.

## 1. Reference ads (13)
| # | Who / URL | Layout, headline, date, CTA, badges | Works because | So we should... |
|---|---|---|---|---|
| 1 | WotC product page, magic.wizards.com/en/products/star-trek | Full-width key-art hero under set title; caps section heads ("THE SHIP IS YOURS, CAPTAIN"); date in body copy ("begins November 6"); CTAs "Buy Now", "Your Local Store"; tags "Available Now"/"Coming Soon" | Art does the work, one clear status tag | Lead with the key art, put status as a text badge |
| 2 | WPN retailer article, wpn.wizards.com/en/news/make-it-so-helping-your-customers-chart-a-course-in-magic-the-gathering-star-trek | Store-facing pitch: "Make It So", "Docking Bays Open!", "make your store their starbase" | Gives stores a voice: the shop is the launch pad | Write "your local starbase" style lines in our own words |
| 3 | WPN dates, wpn.wizards.com/en/news/star-trek-dates-and-details | Plain dated list: prerelease Nov 6-12, release Nov 13, Commander Party Nov 20-26 | Dates scan in seconds | Show prerelease / release / next event as a 3-row date strip |
| 4 | WotC buyer's guide, magic.wizards.com/en/news/feature/star-trek-buyers-guide | Product-by-product guide; "preorder at your local game store" | Tells buyers what to ask for | Name products (Play Boosters, Commander decks), no prices |
| 5 | WotC where-to-play, magic.wizards.com/en/news/feature/where-to-play-star-trek | Store-locator CTA | Sends people to the counter, not a cart | CTA "Find us / Visit", link to Visit page |
| 6 | Riot press release, gamespress.com/Step-Into-the-Spotlight-in-Riftbound-Radiance-Available-Now | Headline "Radiance Is Out Now"; dateline above; "Find it at your local game store"; upbeat stage/music tone | "Out Now" + local-store CTA is the exact message we need | Use "Out now" badge + "Find it at the counter" |
| 7 | UVS retailer PDF, uvsgames.com/wp-content/uploads/2026/07/Radiance-Dates-and-Details.pdf | Dates sheet for stores (Pre-Rift Oct 16-22, release Oct 23) | Same dates in every store's ad | Always show release + prerelease dates |
| 8 | Stomping Grounds TCG listing, stompinggroundstcg.com/products/riftbound-league-of-legends-tcg-radiance-booster-box | Product card, "[PREORDER]" prefix, "Available for preorder", release date, local pickup option | Preorder label in the title | Use a "Preorder" / "Hold a box" badge, no cart |
| 9 | One Piece official, en.onepiece-cardgame.com | Carousel slides: tagline, caps title with set code, own line "AVAILABLE DEC. 18, 2026"; CTA "Begin Your Adventure"; whole banner clickable | Date on its own uppercase line | Copy the date-line treatment; no carousel (motion) |
| 10 | hololive OCG official, en.hololive-official-cardgame.com | Banner row, separate mobile portrait art, then thumbnail row; dates YYYY.MM.DD | Mobile-specific crops | Provide a tall mobile crop for the featured banner |
| 11 | pokemon.com/us/pokemon-tcg | Tile grid, 16:9 image over title + blurb, whole tile is the link; lead tile = newest set | Simple tiles scale to many sets | Smaller cards in this tile format |
| 12 | Riot "How to buy Riftbound", riftbound.leagueoflegends.com/en-us/news/announcements/how-to-buy-riftbound | Directs buyers to local game stores | Official backing for store-first buying | Say "buy it in store" plainly |
| 13 | GameNerdz listing, gamenerdz.com/riftbound-league-of-legends-tcg-radiance-booster-box-preorder | Preorder retail card (online store pattern) | Shows what NOT to copy: cart language | Keep status badge, drop "Add to cart" |

Local-store Instagram/Facebook posts could not be read; patterns above are the standard ones (square key art, set name, date, "in store now"). Sibling research: docs/research/instagram.md.

## 2. Theme notes per set (releases-draft.json)
- **mtg-star-trek (themed crossover):** Safe to evoke: starfield black, deep-space green/teal/blue from the key art, thin sleek sans, widely-spaced caps, "warp", "final frontier", "boldly go", "starbase", "make it so" (generic phrases, no logo lockups). Avoid: LCARS rounded-bar layouts, Starfleet delta, Trek or Magic logos, the franchise typeface, character likenesses. Official key art is allowed (hard rule 12) with credit line.
- **pokemon-delta-reign / flowing-fists (standard):** Bright, energetic, rounded and friendly; type-colour accents (fire red, water blue, electric yellow); big clean sans; parent-friendly tone. Flowing Fists hints fighting-type (warm orange/red) but stay generic.
- **riftbound-legacy (standard, League-style):** Hextech fantasy: deep navy/teal with gold and bright cyan glow, bold fantasy caps, "Pre-Rift" and "Rift" language is fine as plain text. Radiance tone was stage/music, upbeat.
- **One Piece (no image, dates only):** Anime pirate adventure: warm sea-blue and parchment/brown, bold caps, "Set sail", "Begin your adventure"; map and compass shapes drawn generically.
- **hololive-volume-vortex (standard, idol/VTuber):** Pastel pink/sky/lavender on white, sparkle shapes (static), rounded friendly type, stage/idol language ("on stage", "debut").
- **Lorcana/Warhammer:** not researched; use generic storybook-fantasy / grim-industrial if added.

## 3. CTA wording bank (shop voice, no checkout, no prices)
1. Shop the new set
2. Out now at the counter
3. Hold a box for me (ask in store)
4. Cracking packs this week
5. Ask us about preorders
6. New in the case
7. Stop in and grab a pack
8. Your local starbase is open (Star Trek only)
9. Come see it on the shelf
10. Pick yours up in store
Badges: Out now, Preorder, Coming [date], Prerelease [date]. Dates only if confirmed in releases.md; "Likely" ones carry "Date to be confirmed".

## 4. Recommended layout (featured banner + cards)
1. Section "New releases" on the homepage, one featured banner then a row of 2-4 smaller cards.
2. Featured = newest out-now big set (Star Trek): official key art 16:9, tall crop under 600px wide.
3. Headline, date line and CTA are real HTML text beside or below the art, never baked into the image.
4. Date line in its own uppercase row: "OUT NOW - NOV 13, 2026", with prerelease line beneath.
5. Badge as text chip with a border (Out now / Preorder / Coming), never colour alone.
6. One primary CTA "Find it at the counter" linking to Visit, secondary "Ask about a box" linking to Contact.
7. Cards: 16:9 image, game name, set name, badge, date; whole card is one link, 48px target.
8. Text on a solid or scrimmed panel at 4.5:1 or better; sets' look shown only through a small accent border/colour per game.
9. No carousel, autoplay or animation; stacked on phones, tall crop on mobile, descriptive alt text.
10. Credit line under each image plus footer "not affiliated" line; no prices; Instagram only via click-to-load embed (rule 13).
