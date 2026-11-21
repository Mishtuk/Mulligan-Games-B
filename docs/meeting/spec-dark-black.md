# Spec: Black dark mode and a de-purpled light mode (supersedes the colour values in spec-dark.md)
Owner 2026-11-21: dark should be black, not purple; avoid generic AI colours. Mechanism, toggle, logo plate size and tests in spec-dark.md stay. Token names unchanged; values change. Hard rules 2, 3, 13 apply. All ratios WCAG 2.x, computed.

## Where purple survives (the whole list)
1. Inside the official logo PNG (its outline), never recoloured. 2. The Hololive panel (`--holo-*`, its own pairs). Nowhere else: no page, surface, border, shadow, link, button, tab, focus ring or admin chrome. `--accent2` stops meaning purple: it is now SKY. Coder greps `#5B2A86 #9B72D6 #C8ADF7 #1B1030 #120B1E #1D1330 #2A2140 #A99BCB #7468A0 #FAF8FF #E7E3F0 #8D86A6 #4B4560` and removes every hit outside the logo and `--holo-*`.

## Dark tokens (neutral: R, G, B within 2 of each other; no blue or purple cast)
```css
:root[data-theme="dark"] { color-scheme: dark;
  --bg:#0B0B0C; --bg2:#171718; --card:#131314; --bg3:#232325;
  --text:#F4F4F2; --muted:#B3B3B8;
  --line:#C8C8CC; --soft-line:#77777C;
  --accent:#F28C28; --on-accent:#0B0B0C;      /* orange fill, black ink */
  --accent2:#7EC8F0; --on-accent2:#0B0B0C;    /* sky fill AND hard shadow colour */
  --link:#7EC8F0; --sky:#7EC8F0;
  --error:#FF8F86; --ok:#6FD79A;
  --shadow:6px 6px 0 var(--accent2); --shadow-sm:3px 3px 0 var(--accent2); }
```
Hard shadow stays a solid offset block, now sky (10.7 on bg). Primary cards and panels: sky shadow. The one primary action per view: orange fill with a sky shadow. Orange shadow only on hover/pressed state of sky-filled things and on the open-today highlight (`.tonight-day`, `[data-today]`). Borders stay 3px, now light neutral grey `--line`. No gradients, no glow.

## Dark contrast (text >=4.5, UI >=3)
| Pair | bg | card | bg2 | bg3 |
|---|---|---|---|---|
| `--text` | 17.9 | 16.9 | 16.3 | 14.2 |
| `--muted` | 9.4 | 8.9 | 8.6 | 7.5 |
| `--link` / sky | 10.7 | 10.1 | 9.7 | 8.5 |
| `--error` | 8.9 | 8.4 | 8.1 | 7.1 |
| `--ok` | 11.1 | 10.5 | 10.1 | 8.9 |
| `--accent` (UI, orange text only as UI) | 8.0 | 7.6 | 7.3 | 6.4 |
| `--line` (UI) | 11.8 | 11.1 | 10.7 | 9.4 |
| `--soft-line` (UI) | 4.4 | 4.2 | 4.0 | 3.5 |
- `--on-accent` on orange 8.0; on sky 10.7. Focus ring 3px `--link`, offset 3px: 10.7 on bg. Sky shadow vs bg 10.7, vs card 10.1.
- Release panels unchanged: Trek text 17.2, Pokemon hi 6.0, Holo ink 12.3, Riftbound ink 14.1, One Piece ink 7.9.
- Banned: `--soft-line`, `--accent` or `--accent2` as small text on a button fill of the same hue; white text on orange (2.5) or sky (1.8); `--muted` on any release panel; ring drawn on an orange fill (use offset so it sits on the page); `--bg2` vs `--bg` or `--bg3` vs `--bg` as the only separator (1.1 / 1.3, needs a `--line` border); any tint toward blue/purple in `--bg*`/`--card` (e.g. `#0B0B14`).
- Page is near-black, panels step up only 3-8 percent in grey; depth comes from the 3px border plus hard shadow, not from lighter purple-ish layers.

## Logo plate and images (dark)
Plate unchanged in shape: `#FFFFFF`, radius 5px, padding 8px, 2px `--line` border. On black it reads as a bright sign, which is the intent; the logo's purple outline appears only here (18:1 on white). Publisher images: untouched, 3px `--line` border. Drawn objects use tokens: paper `--card`, ink strokes `--line`, hard edges `--accent2` (sky), pockets `--bg3`, ring holes `--bg`.

## Light tokens (purple removed as UI colour; ink is neutral near-black)
```css
:root, :root[data-theme="light"] {
  --bg:#FAFAFA; --bg2:#DDF0FB; --card:#FFFFFF; --bg3:#E9E9EB;
  --text:#111214; --muted:#4A4D55;
  --line:#111214; --soft-line:#85888F;
  --accent:#F28C28; --on-accent:#111214;
  --accent2:#7EC8F0; --on-accent2:#111214;   /* secondary button + tab: sky fill, ink text (10.2) */
  --link:#0B5C8A; --sky:#7EC8F0; --error:#B3261E; --ok:#1E6B3A;
  --shadow:6px 6px 0 var(--line); --shadow-sm:3px 3px 0 var(--line); }
```
Hard shadow becomes solid ink (classic card-shop sticker look); orange shadow allowed on the single primary button. Links `#0B5C8A` deep sky: 6.9 on bg, 7.2 card, 6.2 bg2, 5.9 bg3; focus ring same colour, 6.9 on bg. `--text` 18.0/18.7/16.0; `--muted` 8.1/8.5/7.2; `--error` 6.3/6.5; `--ok` 6.2/6.5; `--line` 18.0; `--soft-line` 3.4 on bg, 3.5 card, 3.0 bg2 (UI only; not on `--bg3`, 2.9). Ink on orange 7.6, on sky 10.2. Orange text: `#A04A00` 5.8 on bg when needed; plain `#F28C28` is fill only (2.5 on white). Banned: sky or orange as text on light (1.8 / 2.5); white on sky; `--soft-line` on `--bg3`; any `#5B2A86`.
Tabs: active = orange fill + ink border; inactive = card + ink border. Secondary buttons: sky fill. Logo stays the only place purple shows; its plate needs no frame in light.

## Release panels
Trek, Pokemon, Riftbound, One Piece: unchanged. Their outer frame and shadow must use `--line` and `--shadow` (now neutral/sky in dark, ink in light), not purple. Hololive panel keeps its own lavender/purple inside the panel only; its frame and shadow still follow the site tokens, not `--holo-hi`. Trek banner on black is near-identical to the page: keep 3px `--line` + sky shadow so it separates.

## What reads as AI-generic, and what we do instead
- Purple/indigo/violet backgrounds or gradient washes: flat near-black and ink, sky and orange from the logo.
- Gradient text, gradient buttons, mesh blobs: flat fills only.
- Neon glow, blurred coloured shadows, glow on hover: hard offset blocks, no blur anywhere.
- Glassmorphism (frosted blur panels): opaque cards with 3px borders.
- Blue-tinted "slate" dark greys: neutral greys, check R~G~B.
- Soft shadows, big radius pills, emoji icons, identical 3-up feature cards: 5px radius, stickers, tickets, price tags, binder pockets.
- Purple-on-white default links and buttons: sky-blue links, orange primary actions.
- Rule of thumb: if a colour is not the logo's sky/orange, an object colour, or a release panel's own, it should be grey or ink.

## Advisor review + boss rulings (2026-11-21, final say) - apply these with the spec
- Advisor verified 17 contrast pairs; all match. GO after these fixes.
- Dark card hard shadow: neutral grey by default (`--shadow: 6px 6px 0 #5A5A5F`, about 3:1 on bg), one variable in the dark block so it can be swapped in one line. Sky stays for fills, links and the focus ring; orange stays the primary action (and today/pressed states). Look at one screenshot; only if the grey reads flat may it go to the sky shadow as specced.
- Hover: no colour change on orange or card elements; hover = the existing lift/shadow change (motion-gated) plus, for links, underline thickness. Sky-filled hover as specced.
- Light primary button: orange shadow not required; ink hard shadow like other cards.
- The `prefers-color-scheme` block in global.css (old purple values, ~lines 57-62) gets the SAME new dark values (one source of truth: generate both from one list or keep them identical with a test).
- Orange text on dark is allowed (8.0:1). `--on-accent2` is a new token: add it explicitly.
- Add `#16283A` (old blue-ish dark bg2) to the purple/tint grep-out list.
