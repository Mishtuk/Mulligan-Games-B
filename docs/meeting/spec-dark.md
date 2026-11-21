# Spec: Dark mode (default) and the sun/moon button
Owner 2026-11-20: dark mode is the default; one small round button bottom-right that turns sun into moon and moon into sun, not a switch. Hard rules 2, 3, 13 apply.

## Mechanism
- Default is dark for everyone (ignores OS preference; the owner chose it). Choice stored in `localStorage` key `mg-theme` = `dark|light`, every read and write in try/catch; if storage fails the page just stays dark.
- `<html data-theme="dark">` set before first paint by an external, blocking `<script src="/js/theme-init.js">` in `<head>` (no inline script, CSP-safe; no `defer`). Static HTML ships with `data-theme="dark"` so no-JS is dark too.
- CSS: `:root{color-scheme:dark; ...dark tokens}` and `:root[data-theme="light"]{color-scheme:light; ...current light tokens}`. Also set `<meta name="color-scheme" content="dark light">` and `<meta name="theme-color">` per theme (JS updates it).
- `@media print{ :root{ light tokens } .theme-toggle{display:none} }` forces light, ink on white.

## Dark tokens (replace values only; names unchanged)
```css
:root { color-scheme: dark;
  --bg:#120B1E; --bg2:#16283A; --card:#1D1330; --bg3:#2A2140;
  --text:#F3EEFB; --muted:#BDB4D0;
  --line:#A99BCB;  --soft-line:#7468A0;
  --accent:#F28C28; --on-accent:#1B1030;      /* unchanged: fill + ink */
  --accent2:#9B72D6; --on-accent2:#1B1030;    /* lighter purple: button fill AND hard shadow */
  --link:#C8ADF7; --sky:#7EC8F0;
  --error:#FF8F86; --ok:#6FD79A;
  /* release themes: unchanged, they are self-contained panels */
  --trek-bg:#04100E; --trek-text:#E8F5EE; --trek-glow:#6FE3B4;
  --pk-bg:#FFF4C9; --pk-hi:#B42318; --pk-red:#E8402A; --pk-blue:#2F80ED; --pk-yellow:#FFD23F;
  --rift-bg:#0C1D3A; --rift-ink:#F6EBCB; --rift-gold:#E2B84A;
  --holo-bg:#FDE7F3; --holo-ink:#3B1A52; --holo-hi:#7B2D9B; --holo-sky:#8FD3F4; --holo-lav:#C4B1F0;
  --op-bg:#134B6B; --op-ink:#F6EBCB; --op-hi:#F2C98A; --op-sea:#0F2A4A; --op-parch:#F2E3BC; --op-rope:#8A5A2B;
  /* --shadow, --shadow-sm, fonts, sizes, spacing: unchanged (shadow reads --accent2) */ }
```
Rules: borders become light lavender `--line` (3px kept); the hard shadow becomes the lighter purple (5.3:1 on `--bg`, 4.9 on `--card`), so the offset still reads. Any literal `#1B1030` or `#fff` used for text or borders outside `:root` must move to a token (coder greps).

## Contrast (WCAG, computed)
Text needs 4.5, UI 3.
- `--text` on bg 16.9, card 15.5, bg2 13.2, bg3 13.3. `--muted` on bg 9.7, card 8.9, bg2 7.6, bg3 7.6.
- `--link` on bg 9.9, card 9.1, bg2 7.7, bg3 7.8. Focus ring (`--link`, 3px, offset 3px) on bg 9.9.
- `--on-accent` on `--accent` 7.4; on `--sky` 9.8; on `--accent2` 5.0.
- `--error` on bg 8.7, card 8.0. `--ok` on bg 10.9, card 10.0, bg2 8.5.
- UI: `--line` on bg 7.5, card 6.9, bg2 5.9. `--soft-line` on bg 3.9, card 3.6. `--accent2` shadow on bg 5.3, card 4.9. `--accent` on bg 7.8, `--sky` on bg 10.4.
- Release panels (unchanged, own pairs): Trek text 17.2, glow 12.3; Pokemon hi on bg 6.0; Holo ink 12.3, hi 6.7; Riftbound ink 14.1, gold 8.9; One Piece ink 7.9, hi 6.0.
- Banned: `--accent2` or `--soft-line` as text; `--muted` on any release panel; `--link` or white on `--accent` (focus ring vs orange is 1.3, so no ring drawn on orange: use offset so ring sits on page); white text on `--accent2` (3.6); light-theme `#5B2A86` on dark (1.9); `--bg2` vs `--bg` as the only separator (1.3, needs a `--line` border).

## Logo, images, drawn objects
- Official logo PNG has a white ground: never recolour, invert or filter it. In dark it sits on a "sign plate": `#FFFFFF` rounded 5px, 8px padding, 2px `--line` border (the logo's own ink outline stays on white at 18:1). Plate wraps header and footer logo and the admin top bar.
- Publisher images (release art, product shots): untouched, no dimming or filters. Each keeps its 3px `--line` border so a bright Pokemon or Holo panel reads as a card on a dark table; credits stay `--muted` on `--bg` (9.7).
- Drawn objects (binder page, case, slips, signs, clipboard, sleeves): SVG/CSS fills use tokens so they follow the theme: paper surfaces `--card`, ink strokes `--line`, hard purple edges `--accent2`; binder ring holes `--bg`; closed pockets `--bg3` with `--muted` text. Hard-coded light fills (`#fff`, cream) are replaced by tokens; illustrations with a fixed palette keep a light "paper" object (it is a prop) but gain the 3px `--line` border.
- Star Trek banner is already dark (`#04100E` on page `#120B1E` is near-identical): keep the 3px `--line` border and `--shadow` so it stays a distinct object.
- Admin back-office uses the same dark tokens; banners, chips and toasts use `--bg2`/`--card` with `--line` borders and word plus icon status (`--ok`, `--error` text only on bg/card). Demo banner keeps `--sky` fill with `--on-accent` ink (9.8).

## Toggle button
- One `<button type="button" class="theme-toggle">`, 48x48, `border-radius:50%`, `--bg3` fill, 3px `--line` border, `--text` icon 24px. Not a switch: no track, no knob, no `role="switch"`, no `aria-pressed`.
- Icon shows the mode you will GET: in dark mode (default) a SUN; click -> light mode, a MOON; click -> back. Accessible name is the action, updated on each click: "Switch to light mode" (while dark) / "Switch to dark mode" (while light); a `title` repeats it. Icons are inline SVG with `aria-hidden="true"`.
- Position: `position:fixed; right:max(16px, env(safe-area-inset-right)); bottom:max(16px, env(safe-area-inset-bottom)); z-index:30` (below menu sheet and dialogs, above content). Placed in the DOM after `<main>` and footer so Tab reaches it last.
- Never cover the footer's last link or form buttons: `body` gets `padding-bottom: calc(48px + 32px + env(safe-area-inset-bottom))` (80px), and the footer's last 80px is empty space. On forms at 390, sticky submit bars sit at `bottom: 80px`. Admin 390: button sits at `bottom: calc(64px + 16px + inset)` above the bottom nav.
- No animation; the icon swaps instantly, theme change is instant (no transition on colours). Focus ring: 3px `--link` with 3px offset, 9.9:1 on dark, and in light `#5B2A86` on `#FAF8FF` as today. At 200% zoom it stays 48 CSS px, fixed in the corner, and the body padding keeps content clear; at 400% it may overlap nothing because padding scales with rem-free px.
- Tests: default dark with empty storage; throwing storage still renders; choice survives reload; name flips with state; button not inside a form; print is light; no inline script in built HTML.
