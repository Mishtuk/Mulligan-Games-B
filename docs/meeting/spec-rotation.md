# Spec: New releases rotation (designer -> mediator -> coder)
Owner 2026-11-20: "make new releases cycle through other advertisements like the ones below it." Hard rules 2, 3, 13 apply.

## What rotates
- Slides = every release ad `shownReleases()` returns, Star Trek first while under 90 days, then date order. The grid below is unchanged and still lists the full set (the ad on show included). Nothing is filtered or removed per slide.
- Each slide is the existing `.rel-feat` card: own theme (`data-theme`: Trek deep space, Pokemon bright, Riftbound, Holo, One Piece), own art, status line, "Hold one" CTA and image credit. No restyling; themes never blend.

## Timing and transition
- Advance every 7s. The timer restarts after any manual change and after Play.
- Transition: 400ms opacity crossfade only (stacked in one grid cell). No slide, zoom or parallax. One change per 7s is far under 3 per second (WCAG 2.3.1). Each slide has its own opaque background, so no dark/white flash.
- `prefers-reduced-motion: reduce`: never auto-advances, starts "Paused", Play disabled with the note "Auto-play is off (your device setting)". Swaps are instant. Prev, next and dots still work.

## Controls (one bar under the card)
- Pause/Play button with visible text ("Pause" / "Play") and icon; label changes, no `aria-pressed`. 48x48 minimum.
- "Previous ad" and "Next ad" buttons, 48x48, wrap around.
- Position: mono text "2 of 5", always visible, plus dots in a `<ul>`. Each dot is a 48px target (12px visual) named "Show ad 2: Star Trek", `aria-current="true"` on the current one, filled shape not colour alone.
- Order: Pause, Prev, "2 of 5", Next; dots wrap beneath at 390. Focus ring 3px (`--link`).

## Stops
- Hover over card or controls pauses; leaving resumes only if the user had not pressed Pause.
- Keyboard focus anywhere inside the section (controls or the CTA) pauses; resumes on focus leaving, same condition.
- Hidden tab (`visibilitychange`) pauses. A user's Pause is sticky until Play.

## Announcements
- Wrapper `role="group" aria-roledescription="carousel" aria-label="New releases"`; each slide `role="group" aria-roledescription="slide" aria-label="2 of 5: <name>"`.
- Slide track has `aria-live="off"` while the timer runs (nothing announced on auto-advance); it switches to `polite` only for a manual change (Prev, Next, dot), so "2 of 5: Name" is read once. Hidden slides are `inert` and `aria-hidden="true"` so Tab never enters them.

## Layout and mobile
- No layout shift: all slides share one CSS grid cell (`grid-area: 1/1`), so the box is the tallest slide's height; inactive slides `opacity:0; visibility:hidden`. Check at 390, 768, 1280 with the longest copy; the art box keeps its min-height.
- 390: full-width card; controls in two rows (buttons, then dots); 8px gaps, 48px targets. Swipe is an optional extra, never the only way.

## Without JS
- The controls bar is `hidden` until script adds `.js` to `<html>`. Server markup contains all slides; `html:not(.js) .rel-slide:not(:first-child){display:none}` shows ad 1 only. The other ads are in the grid below.

## Tests to add
Reduced motion never advances; hover and focus pause; Pause is sticky; live region off while timer runs; hidden slides inert; identical height at 3 widths; no-JS shows one slide.
