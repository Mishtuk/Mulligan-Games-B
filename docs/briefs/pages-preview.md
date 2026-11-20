# Brief: GitHub Pages preview (boss -> coder, advisor paired)

Owner, 2026-11-20: "When you are completely done, push the website out onto pages for me to look at."

**Task:** a preview build of the site for GitHub Pages at `https://mishtuk.github.io/Mulligan-Games-B/`, published from
a `gh-pages` branch (the boss pushes and enables Pages; the coder builds and tests).

**Files allowed:** `astro.config.mjs`, `package.json` (scripts), `tools/build-pages.mjs` (new), `src/lib/site.js`,
`src/layouts/Base.astro`, `src/components/*` and `public/js/*` only where a hard-coded root path must respect the
base, `test/pages-preview.test.mjs` (new), `README.md` (one short section), `HANDOFF.md` (log line).

**Must do**
1. `npm run build:pages` builds to `dist-pages/` with the base path `/Mulligan-Games-B/` (Astro `base` + `site`
   via an env flag, e.g. `PAGES=1`). Every internal link, script, style, font, image, `.ics`, sitemap and the 404
   page works under the sub-path: no request in the built site goes to the domain root. Prefer Astro's
   `import.meta.env.BASE_URL` in source; a post-build rewrite only for what can't use it, and only for internal paths.
2. Preview honesty: `<meta name="robots" content="noindex">` on every page and a `robots.txt` that disallows all,
   so the concept is never listed as Mulligan's real site. A slim, accessible banner on every page: "Preview of a
   concept site. Forms don't send here." (tokens only, 48px-safe, no motion).
3. Forms: there is no Worker on Pages, so posts would 405/404. On the Pages build each form shows the honest
   "Forms don't send in this preview" message on submit instead of posting (JS on); with JS off the form's action
   points to a static page `preview-form.html` that says the same and links back. Never fake a success.
4. Instagram facade and Turnstile: unchanged behaviour (Turnstile key is empty, so nothing renders).
5. The normal `npm run build` (Cloudflare target) must be byte-for-byte unaffected: no base, no banner, no noindex.
6. Tests: the Pages build has no root-absolute internal URLs (`href="/`, `src="/`, `url(/`, `import "/`,
   `fetch('/`) except the base-prefixed ones; noindex on every page; banner present; the normal build has none
   of these. `npm test`, and `npm run check:all` on the normal build, stay green.
7. Check the Pages build by serving `dist-pages/` under `/Mulligan-Games-B/` locally (a tiny static server with a
   sub-path) and running `tools/check-site.mjs` against `http://localhost:PORT/Mulligan-Games-B/` on all 7 paths,
   plus screenshots of Home and Shop at 390 and 1280. Look at them.

**Done when:** `dist-pages/` passes the checks above; the coder reports the exact commands; nothing is pushed.
**Out of scope:** any design or copy change beyond the banner and the preview form message; deploying to Cloudflare.
