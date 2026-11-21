# Admin, live data and logs: architecture plan

Advisor plan, 2026-11-20, for the boss. Nothing is built yet. Owner goal (CONTEXT 2026-11-20): managers sign in, add singles,
shop items, events and sales, make small changes, and see the site's logs, without a developer. Binding: hard rules 1, 3, 5,
6; D3; D5 (Astro static + one Worker + D1); D10/D11 (the Pages preview never fakes a send or real data).

## 1. Sign-in and roles
- **One prefix:** pages `/admin/...`, API **`/admin/api/...`** (not `/api/admin/...`, on purpose): one Access path and one AUD
  cover page and API, and every `/api/*` route stays public by design. D1 is the source of truth after launch.
- Access app (self-hosted) on `<domain>/admin*`, deny by default, Allow policy = owner and managers' emails, one-time PIN by
  email (no new account; Google optional), 8 hour session (shared shop PC).
- `src/admin/auth.js` = kit `verifyAccess` (patterns/event-admin.md) unchanged: RS256 only; JWKS from
  `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` (1 h cache, unknown `kid` refetch at most every 5 min); Web
  Crypto signature; `iss`, `aud` contains `ACCESS_AUD`, `exp`, `nbf`. The header's presence alone is never trusted.
- Role: lower-cased `email` claim in `OWNER_EMAILS` -> owner; else an active `staff` row -> staff; else 403 "Not on the
  staff list" plus an `auth.denied` log row. Two locks: the Access policy and the staff table.
- Dev bypass only when `env.LOCAL === '1'` **and** hostname is `localhost`/`127.0.0.1`: identity `dev@localhost`, role from
  `DEV_ROLE`, red "Local dev" bar. Tests: LOCAL=1 on `mulligan.test` (worker.test.mjs origin) still needs a real JWT;
  `wrangler.jsonc` never has a `LOCAL` var (deploy.test.mjs).
- `wrangler.jsonc`: `"workers_dev": false`, `"preview_urls": false`; `run_worker_first` adds `"/admin"`, `"/admin/*"`, so
  admin HTML and JS never skip the check. Sign out = link to `/cdn-cgi/access/logout`. Expired session: `api()` uses
  `redirect: 'manual'`; a redirect or non-JSON reply says "You were signed out. Reload to sign in." and keeps the form.
- **Why not our own password login:** we would store hashes and build reset mail (a mail provider), lockout and sessions,
  with no second factor; one bug exposes customer data in the inbox. Access is free, leaves us no secret to leak, and logs
  sign-ins. Revisit (with the advisor) only if the domain cannot be on Cloudflare or staff exceed the free seats.
- Owner only: Staff list, log retention, deleting inbox rows (privacy requests). Owner and staff: events, shop items,
  sales, releases (add, edit, cancel, hide), inbox read and "handled", Log read. The API enforces it, the UI only hides.

## 2. Data model (D1, `?` binds only)
- `migrations/0001_base.sql` = today's `schema.sql` verbatim, `0002_admin.sql` the rest; `wrangler d1 migrations apply
  mulligan` (`migrations_dir` in wrangler.jsonc). Never edit an applied migration. Tests and `tools/serve.mjs` load the folder
  in order; `src/worker/d1-shim.js` gains `batch()` as one transaction. Editable tables get `rev`, `updated_at`, `updated_by`.

| Table | Columns (beyond id) | Notes |
|---|---|---|
| `event_series` new | slug id, day 0-6, time, game, title, fee_cents, seats, signup, notes, certainty, active, sort | Weekly nights; keeps events.json ids |
| `events` extend | + series_id, local_date, local_time, minutes, notes, signup; keeps starts_at UTC, seats, fee_cents, cancelled | One-offs, and series dates with state (sign-ups, cancelled, moved). UNIQUE(series_id, local_date) |
| `items` new | kind single/sealed/accessory, game, name, set_name, set_code, number, cond, finish, lang, price_cents (NULL = ask), qty, image_url, status draft/live/hidden, notes_internal | Index (status, kind, game, name); qty 0 = sold out; notes_internal never public |
| `sales` new | title, details, starts_on, ends_on (store dates), game, link_path, active, sort | Public when active and today in range |
| `releases` new | json id, name, game, gameId, dates, types, ad, cta, theme, unit, image_key, credit, source_url, certainty, sort | Decision below |
| `staff`, `settings` new | email PK, active, added_by, added_at / key PK, value | Owners are not rows; log_retention_days=180 |
| `audit_log` new | at UTC, actor, role, action, entity, entity_id, before_json, after_json, ip_hash, ok | Index (at), (entity, entity_id) |
| `signins`, `form_stats` new | email + iat UNIQUE, at, ip_hash, country / day + form + outcome PK, n | |
| inbox (existing) | registrations, buylists (+items), requests, contacts: + handled_at, handled_by | Public form rows |

- **Releases:** text moves to D1 (names, dates, ad line, CTA, certainty, order, show/hide) so managers fix dates and add a
  set; **images stay build-time files** chosen by key from `public/media/releases/manifest.json`, or the game's drawn
  generic theme (owner 2026-11-20). A publisher image requires credit and source URL; only `Confirmed` rows show. Why:
  images need sharp and the hard rule 12 licence check, which stays a team job.
- **Seed:** `node tools/seed-d1.mjs > .work/seed.sql` (INSERT OR IGNORE, the tested `q()` quoting): weekly -> event_series,
  dated one-offs -> events (undated ones skipped, listed on stderr), releases.json -> releases. Items and sales start empty;
  prices live only in D1, never in the repo (hard rule 5). The S5 parity test proves day one looks the same.

## 3. API
- Router: `/admin*` -> `src/admin/index.js` (auth before anything else is read); form routes and `/api/seats` unchanged.
- Every admin write: POST/PUT/DELETE only (no GET mutation); `Origin` equals the site origin (missing = 403); `Sec-Fetch-Site`
  if sent is `same-origin`; `content-type: application/json` only (415); body <= 16 KB via `readCapped`; a JSON object with
  allow-listed keys only (unknown = 422); no CORS headers ever; fixed short error strings; `Cache-Control: no-store`.
- Update = `... SET ..., rev = rev + 1 WHERE id = ? AND rev = ?`; 0 rows -> 409 "Changed by <who> at <time>, reload". The
  change and its `audit_log` row run in one `db.batch`. Limits: `ADMIN_LIMIT` 120 writes/60 s per email; `SEARCH_LIMIT`
  30/60 s per IP on public search. Lists page by 50 (max 200).
- Endpoints: `GET|POST /admin/api/{series,events,items,sales,releases}`, `PUT .../<id>`, `POST .../<id>/cancel|hide`;
  `GET /admin/api/inbox?form=&handled=&page=`, `POST .../inbox/<form>/<id>/handled`, `DELETE .../inbox/<form>/<id>` (owner);
  `GET /admin/api/log?entity=&actor=&from=&to=&page=`; `GET|POST|DELETE .../staff`, `PUT .../settings` (owner); `GET .../me`.
- Public: `GET /api/public/{events,shop,sales}`: explicit column lists (never `SELECT *`), live/active rows only, no
  `notes_internal`/`updated_by`, `public, max-age=60`. Shop `q` <= 60 chars, LIKE `ESCAPE '\'` with `%` and `_` escaped.

| Field | Rule |
|---|---|
| title, name / set_name | trimmed, 1-100 / 0-80 chars, no control characters |
| notes, details, ad | 0-500 chars, plain text, rendered as text only |
| game, cond, finish, kind, status | from fixed lists (games.json ids; NM LP MP HP DMG; ...) |
| date, time, day | real `YYYY-MM-DD`; `HH:MM` 00:00-23:59 in the store zone; 0-6 |
| price_cents, fee_cents, qty, seats | integers: 0-1,000,000 or null; 0-999; 0-500 or null and never below seated |
| link_path, image_url; staff email | `/`-relative, not `//`, no `\`; images only `/media/items/` until R2 is approved; email: form Worker rule, lower-cased |

## 4. Live public pages: Worker-side HTML (chosen over client refresh)
- **Why:** with client refresh, JS off or a slow fetch shows a cancelled night as on, the worst wrong answer to "is there
  Commander tonight?"; new singles would also be invisible to search engines. Server-side fixes both with no client cost.
- **How:** the build wraps each live region in markers (`<!--live:weekly-->...<!--/live:weekly-->`: weekly, specials,
  tonight, signup-options, sales, singles, releases). `run_worker_first` adds `/`, `/events/`, `/shop/`, `/shop/singles/`.
  The Worker fetches the built asset, reads D1 once and swaps only those regions with a pure `splice(html, regions)` that
  Node tests run as is (HTMLRewriter is not in Node). Rows come only from `src/lib/html.js` `h(tag, attrs, ...kids)`:
  fixed tag and attribute names, every value escaped, URLs `/`-relative or https; no raw-HTML path (grep test). Astro keeps
  escaped output, no `set:html`. Same `data-*` attributes, so `events.js`, `shop-live.js` and the hold flow keep working.
- The Worker sets the security headers on these responses (test). Cache API 30 s per path; the admin says "live within a
  minute". **Fallback:** D1 error or 1.5 s timeout -> the built page unchanged plus the text line "Showing our usual
  schedule. Ask at the counter for changes." Pages has no Worker and keeps build-time JSON (D10).
- A daily Cron Trigger creates the next 4 weeks of sign-up dates (INSERT OR IGNORE): retires README "re-seed every 3 weeks".
- **Singles:** `/shop/singles/` = GET form (name, game, condition, foil) rendered by the Worker: in-stock live singles, 50 a
  page with Next/Previous links, price or "Ask at the counter", "Hold this card" -> the existing want-list prefill; none ->
  "Not in stock: send a want list". Home "Find a card" and Shop Singles point here once one live single exists (the Worker
  sets the href); until then they stay on `/shop/`. The Home gzip budget test (D7-D12) also runs on the rendered seed output.

## 5. Admin UI
- Real pages built by Astro with an `AdminBase` layout (noindex, not in sitemap, no Turnstile): `/admin/` Dashboard, `events/`,
  `shop/`, `sales/`, `releases/`, `inbox/`, `log/`, `staff/` (owner). Not a router: each has its own title, Back works, a screen
  reader hears a new page. JS: `/admin/js/core.js` (api, el, status line, error summary, form binding) + one module per page;
  `textContent` only (grep test: no `innerHTML`), no inline script or style. Worker-set CSP on /admin: `default-src 'self';
  script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'`, no-store.
- Dashboard: signed in as X (role) + Sign out, tonight's events with seats, live sales, new inbox count, last 10 changes.
  Events: weekly table + next 6 weeks; add one-off or weekly, edit, cancel one date, pause a series. Shop: filter table,
  quick-add single (stays on the form, focus back to Name), qty -1/+1, sold out, hide. Bulk paste: later (see 10).
- Keyboard and screen reader: skip link; tables with caption and `th scope`; row buttons name their row ("Edit Pauper Night");
  labels on every input; the public forms' error summary; `role="status"` results; focus to the form heading on Edit and back
  to the row after Save; `confirm()` before destructive actions; 48px targets; 200% text and 390 px without sideways scroll.

## 6. GitHub Pages preview: demo mode
- `build:pages` also builds `/admin/` and swaps `/admin/js/api.js` for `api-demo.js` (localStorage). The production bundle has
  no demo code; the demo bundle makes no network call (tests both ways). No login screen is drawn (nothing to collect a password).
- Fixed banner: "Demo: changes stay in this browser. This is not the store's data and nothing here reaches the website."
  Starts from build-time JSON (real public schedule and releases, labelled "from the site's build"); shop, sales, inbox, log
  start empty; "Add sample rows" names rows "Sample: ..."; "Reset demo"; storage errors fall back to memory and say so.

## 7. Logs and privacy
- Logged: every admin write (actor, role, action, entity, before/after JSON); denied sign-ins; sign-ins (one row per Access
  token `iat`, country, ip hash); form outcomes as daily counts (ok, waitlist, invalid, turnstile, honeypot, rate limited),
  never names or emails; Worker errors (route + short message, no body), at most one a minute. Inbox actions log the row
  id only. `ip_hash` = HMAC-SHA256(IP, `LOG_SALT` secret), 12 hex chars.
- Append-only from the app (no edit or delete endpoint); a daily cron deletes rows older than `log_retention_days` (180,
  owner sets 30-730). Inbox rows: no auto-delete until the owner picks (advice: 12 months after handled). Owner and staff read
  the Log; Access keeps its own sign-in log.
- Privacy page (same slice): staff sign-ins and hashed network address kept 180 days; form counts carry no names; Access
  cookie only for staff on /admin; how long form rows stay, once the owner decides.

## 8. Backups, restore, switch-on
- D1 Time Travel (docs: 7 days Free, 30 Paid; confirm): `wrangler d1 time-travel restore mulligan --timestamp=<ISO>`. Weekly
  and before each migration: `wrangler d1 export mulligan --remote --output downloads/backups/mulligan-<date>.sql` (customer
  data: never committed, kept in the owner's private storage). One restore drill on a scratch database before launch.
- Owner steps, each with the owner's OK (hard rule 6): 1) domain on Cloudflare; 2) `wrangler d1 create mulligan`, id into
  wrangler.jsonc, `wrangler d1 migrations apply mulligan --remote`, then the seed; 3) Zero Trust team, Access app on `/admin*`,
  Allow policy with the emails, PIN login, 8 h session, team + AUD into `vars`; 4) `wrangler secret put` `OWNER_EMAILS`,
  `LOG_SALT`, `TURNSTILE_SECRET`; 5) deploy; 6) logged out, `curl -I` on `/admin/` and `/admin/api/me` gives a redirect or 403;
  7) sign in, add each manager in Staff **and** in the Access policy (both needed; the Staff screen says so).

## 9. Build order (one slice per brief, advisor or mediator paired; S4 early so the owner can try the admin on Pages)
| # | Slice | Tests | Advisor review before merge |
|---|---|---|---|
| S0 | Migrations folder, shim `batch()`, seed-d1, schema.sql retired | migrations apply in order; hostile seed strings stay text | |
| S1 | Auth: verifyAccess, roles, LOCAL guard, /admin gate, logout, signins, headers | kit JWT matrix (none, garbage, wrong key/aud/iss, expired, alg none, unknown kid); LOCAL off localhost = 403 | **yes** |
| S2 | API core + series/events CRUD + audit in batch + ADMIN_LIMIT | bad/missing Origin, non-JSON, GET write, 17 KB, unknown key, stale rev 409, audit rolls back with a failed write, SQLi/XSS verbatim | **yes** |
| S3 | Admin shell, Dashboard, Events page | hostile titles render as text; keyboard path; a11y 390/1280/200% | |
| S4 | Pages demo mode | no network in demo bundle; no demo code in prod; banner on every page | **yes** |
| S5 | Live regions (`splice`, `h()`), Events/Home, sign-up options, cron, fallback | parity with build on seed; D1 down = built page; escaping fuzz; headers; budget | **yes** |
| S6 | Shop items API + page + `/shop/singles/` | LIKE wildcards inert; SEARCH_LIMIT trips; no notes_internal public; no-JS search | **yes** |
| S7 | Sales API + page + public banner | store-zone dates; inactive never public | |
| S8 | Inbox + Log pages, form_stats, retention cron, privacy page | staff delete = 403; no PII in log rows; cron keeps newer rows | **yes** |
| S9 | Releases to D1 + page | unknown image key refused; publisher image without credit refused | |
| S10 | Owner runbook in README, restore drill | drill written up with its date | |

## 10. Risks and owner decisions
- **POS first (before S6):** if the store keeps singles in BinderPOS, TCGplayer or Shopify, typing stock twice will rot; link
  or sync instead (CONTEXT open question). Also: prices online, or "Ask at the counter"? Bulk paste import only after this.
- **Cost:** none expected. Workers Free 100k requests/day (views of the 4 live paths now count), D1 Free, Cron, Rate
  Limiting, Access Free. Access seats stated as 50 free, but the kit could not confirm it on Cloudflare's pages (2026-11-19):
  the owner checks the dashboard. Workers Paid ($5/month) only past the cap. **Domain:** Access needs it on Cloudflare (open).
- Drift: Access policy vs staff table (Staff page states both steps; denials logged); Astro baseline vs Worker `h()` (S5 parity test; keep regions few).
- The inbox holds customer emails and staff can read it: the owner confirms who reads it (open question) and for how long.
- Out until the owner OKs them: singles photo uploads (R2: EXIF strip, type/size check, own path); hours and closures.
