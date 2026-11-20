# Photo swap: the 2 photo slots

Two slots only: **Visit storefront** and **Events play room**. Both show a marked "Photo coming" box until `src/data/store.json`
`photos.*` is filled. Real photos only (CONTEXT hard rule 4). No stock, no AI-made or AI-upscaled images.

## The shots to take

| | Visit storefront (`photos.storefront`) | Events play room (`photos.playRoom`) |
|---|---|---|
| What | The shop front at 445 York Road from across or along the sidewalk: door, window, sign. | The play space with tables set for a night: empty chairs, mats, deck boxes, dice. Nothing happening yet. |
| Framing | Landscape 2:1, door left or right of centre, sign inside the top third, a little pavement at the bottom. Keep verticals straight. | Landscape 2:1, shot from a corner at table height or just above, so the rows of tables lead the eye in. |
| Light | Daylight, shop open, sign lit if it is. Overcast is better than harsh sun; avoid glare on the glass. Phone held level, no wide-angle distortion. | Shop lights on, tables tidy, before doors open or after close. Turn off flash. |
| People | None. Wait for a gap in traffic; no faces, no number plates in focus. | None. Empty room, no faces. If anyone must be in it, get written OK first and keep them out of focus; the site rule is simpler: leave them out. |
| Do not show | Neighbours' signs or customers, publisher logos, card art in the window if you can avoid it. | Card art, publisher logos or posters, personal items, screens with names or emails. |

Shoot at least 3000 px on the long side (phone main camera is fine, not digital zoom), keep the original, and crop to 2:1 afterwards.

## Sizes (2:1 crop, 2x for phones)

| Slot | Rendered at | Export widths (2:1) |
|---|---|---|
| Visit | 480 px wide at 900 px and up, 416 px from 700, full width below (390 px phone = 780 px at 2x) | 480 x 240, 960 x 480, 1440 x 720 |
| Events | 352 px wide (22rem side column) at wide sheet widths, full column width on phones | 480 x 240, 960 x 480, 1440 x 720 |

Use the same three widths for both so the files are easy to make. The 960 px file is the `src` fallback.

## Export format and file names

The `Photo` component prints one `<img>` with `srcset` today, so **ship JPEG** (quality 78 to 82, progressive, strip GPS and camera EXIF,
sRGB). Target under 120 KB for 960 px and 40 KB for 480 px. Put files in `public/img/`:

```
public/img/storefront-480.jpg   storefront-960.jpg   storefront-1440.jpg
public/img/play-room-480.jpg    play-room-960.jpg    play-room-1440.jpg
```

AVIF or WebP (about 30 to 50 percent smaller) is optional later: export the same names with `.avif` / `.webp` and change
`src/components/Photo.astro` to wrap the `<img>` in `<picture>` with one `<source type="image/avif" srcset=...>` and one
`<source type="image/webp" ...>` before the JPEG. That is a code change (a loop for the coder), not needed for launch.

## store.json fields (exact)

Edit `src/data/store.json`, replace `"storefront": null` with:

```json
"storefront": {
  "src": "/img/storefront-960.jpg",
  "alt": "The Mulligan Games storefront on York Road, door and sign in daylight",
  "width": 960,
  "height": 480,
  "srcset": "/img/storefront-480.jpg 480w, /img/storefront-960.jpg 960w, /img/storefront-1440.jpg 1440w",
  "sizes": "(min-width: 900px) 30rem, (min-width: 700px) 26rem, 100vw"
}
```

and `"playRoom": null` with:

```json
"playRoom": {
  "src": "/img/play-room-960.jpg",
  "alt": "The play room with tables, mats and chairs set for game night",
  "width": 960,
  "height": 480,
  "srcset": "/img/play-room-480.jpg 480w, /img/play-room-960.jpg 960w, /img/play-room-1440.jpg 1440w",
  "sizes": "(min-width: 52rem) 22rem, 100vw"
}
```

`width` and `height` are the pixel size of the `src` file (they reserve the space, so the page does not jump). Alt text says what is
in the picture, plainly; rewrite it to match the real shot. Leave a slot `null` if its photo is not ready: the other still works.

## Check after the swap

1. `npm run build && npm test` (the photo test needs `src`, `alt`, `width`, `height`, and fails if "Photo coming" is still on a page that has a photo).
2. `grep -rl 'class="ph' dist` returns nothing for any slot you filled. Before launch no placeholder may remain.
3. Look at Visit and Events at 390 and 1280: the photo is sharp, not stretched (2:1), border and radius match the other boxes.
4. `npm run a11y`, then `build:deploy`.
