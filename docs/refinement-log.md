# Refinement log

Plan: `docs/refinement-plan.md`. Newest last. Score /30 (identity, actions, truth, a11y, craft, code).

| Loop | Lens | Score | Change | Handed on |
|---|---|---|---|---|
| 01 | Home | 20 -> 23 /30 | Logo cropped in CSS (bottom 18%, specks gone); binder starts Wednesday with Mon/Tue closed last; pocket titles clamp to container (no Wednesday overflow); 1280 hero sized to content with Tonight strip under it beside a taller binder; binder note shortened. | Check Events page order matches binder (Wed first?); hero h1 is large at 1280. |
| 02 | Events | 21 -> 24 /30 | Pairings sheet rotates from today with real dates (JS), ships Wed..Tue without JS; closed days one line; sign-up options and D1 seed both generated from events.json (tools/seed-events.mjs, 12 rows, UTC from New York); cut placeholder-nights line and lead's second sentence. | Re-run tools/seed-events.mjs weekly before seeding D1; check Home pockets still land on #day ids. |
