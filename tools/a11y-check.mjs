// npm run a11y [baseUrl]: accessibility and motion checks in real Chrome (CDP). Needs `npm run build` first.
// Without a URL it serves dist/ itself on port 4399. Checks: 200% text zoom on all paths at 1280/390/320 (no sideways
// scroll, no clipped text), tilted text stays within 3deg and nothing sits on top of text, drawn shapes are aria-hidden,
// body text >= .8rem, menu sheet (Enter, Esc returns focus, focus out and outside click close), motion off => 0 animations and no transitions, forms: empty submit -> focused error summary, ?sent= -> success panel, and with scripts OFF every form posted for real (good and bad email) plus every :target result panel (success, waitlist, error) visible and in view at 100% and 200% text.
import { spawn } from 'node:child_process';
import { launch, sleep } from './cdp.mjs';

const PATHS = ['/', '/events/', '/shop/', '/sell/', '/visit/', '/privacy/', '/nope'];
let base = process.argv[2], server = null;
if (!base) {
  const port = process.env.PORT || 4399; base = `http://localhost:${port}`;
  server = spawn(process.execPath, ['tools/serve.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  for (let i = 0; i < 30; i++) { try { if ((await fetch(base + '/')).ok) break; } catch {} await sleep(200); }
}
const fails = [];
const ok = (c, m) => { if (!c) { fails.push(m); console.log('FAIL', m); } };

// Sideways scroll, anything past the right edge outside a scroller, clipped text.
const zoomProbe = `(() => { const out = [], de = document.documentElement;
 if (de.scrollWidth > innerWidth + 1) out.push('sideways scroll ' + de.scrollWidth + ' > ' + innerWidth);
 for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e), r = e.getBoundingClientRect();
  if (!r.width || cs.visibility === 'hidden' || e.closest('[hidden],.vh,.hp,thead')) continue;
  if (r.right > innerWidth + 1) { let p = e.parentElement, scr = false; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') { scr = true; break; } p = p.parentElement; } if (!scr) out.push('past right edge: ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 30)); }
  if (!e.children.length && cs.overflowX === 'hidden' && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && cs.textOverflow !== 'ellipsis') out.push('clipped x: ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 30));
  if (cs.overflowY === 'hidden' && e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0 && e.textContent.trim()) out.push('clipped y: ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 30)); }
 return [...new Set(out)].slice(0, 8); })()`;

// Effective rotation of every text element <= 3deg; no text covered by an unrelated element; drawn shapes hidden from AT.
const shapeProbe = `(() => { const out = [];
 const ang = (e) => { let a = 0; for (let n = e; n && n !== document.documentElement; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.transform !== 'none') { const m = new DOMMatrix(cs.transform); a += Math.atan2(m.b, m.a) * 180 / Math.PI; } if (cs.rotate !== 'none') a += parseFloat(cs.rotate); } return a; };
 const hasText = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
 for (const e of document.querySelectorAll('body *')) { if (!hasText(e)) continue; const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === 'hidden' || e.closest('[hidden],.vh,.hp,thead') || e.closest('details:not([open]) > :not(summary)')) continue;
  const a = ang(e); if (Math.abs(a) > 3) out.push('text rotated ' + a.toFixed(1) + 'deg: ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 24));
  const cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 12); if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
  const clipped = (() => { for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) { if (getComputedStyle(n).overflow !== 'visible') { const q = n.getBoundingClientRect(); if (cx < q.left || cx > q.right || cy < q.top || cy > q.bottom) return true; } } return false; })(); if (clipped) continue;
  const top = document.elementFromPoint(cx, cy); if (top && top !== e && !e.contains(top) && !top.contains(e) && !(top.tagName === 'A' && top.closest('li,article,tr,.pocket')?.contains(e))) out.push('text covered by ' + top.tagName + '.' + top.className + ': ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 24)); }
 for (const e of document.querySelectorAll('.cback,.sleeve,.slots,.clip,.tape,.misprint,.box-sil,.hand,.stub-no,[class*=mp-]')) if (!e.closest('[aria-hidden=true]')) out.push('drawn shape not aria-hidden: ' + e.tagName + '.' + e.className);
 return [...new Set(out)].slice(0, 10); })()`;

// Body text under 12.8px (.8rem); decorative aria-hidden text is exempt.
const smallProbe = `(() => { const out = []; for (const e of document.querySelectorAll('body *')) { if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue; const cs = getComputedStyle(e);
 if (!e.getBoundingClientRect().width || cs.visibility === 'hidden' || e.closest('.vh,.hp,[hidden],[aria-hidden=true]')) continue;
 if (parseFloat(cs.fontSize) < 12.79) out.push(cs.fontSize + ' ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 24)); } return [...new Set(out)].slice(0, 8); })()`;

// A word split across two lines (Range rects per word) in pocket titles and short labels (chips, buttons, summaries, nav).
const wordProbe = `(() => { const out = [], sel = '.pocket-title, .chip, .btn, button, summary, nav a, label, th, .sign *, .slab > *';
 for (const e of document.querySelectorAll(sel)) { if (!e.getBoundingClientRect().width || e.closest('[hidden],.vh,.hp,thead,details:not([open]) > :not(summary)')) continue;
  const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode()); ) { const re = /\\S+/g; for (let m; (m = re.exec(n.data)); ) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
   const tops = new Set([...r.getClientRects()].filter((q) => q.width).map((q) => Math.round(q.top / 4))); if (tops.size > 1 && getComputedStyle(n.parentElement).visibility !== 'hidden') out.push(m[0] + ' in ' + e.tagName + '.' + e.className); } } }
 return [...new Set(out)].slice(0, 8); })()`;

// Scrim/panel contrast: text inside .rel ads and Instagram cards is made transparent, the page is screenshotted, and every sample
// of the pixels behind each text element (5x3 grid + corners, worst one counts) must reach 4.5:1 (3:1 at 24px+). Unlike check-site's
// GROUND this does not skip text on boxes, so the Star Trek scrim and the themed panels are measured.
const scrimProbe = `async (p) => { const f = [], im = await createImageBitmap(new Blob([Uint8Array.from(atob(p), (c) => c.charCodeAt())])),
 c = new OffscreenCanvas(im.width, im.height).getContext('2d'), k = im.width / innerWidth; c.drawImage(im, 0, 0);
 const Y = (a) => { const [r, g, b] = a.map((v) => ((v /= 255) <= .04 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)); return .2126 * r + .7152 * g + .0722 * b; };
 let n = 0;
 for (const e of document.querySelectorAll('.rel *')) { if (![...e.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()) || e.closest('[hidden],.vh,[aria-hidden=true]')) continue;
  const r = e.getBoundingClientRect(), s = getComputedStyle(e); if (!r.width || !r.height) continue; n++;
  const m = s.color.match(/[\\d.]+/g).map(Number), al = m[3] ?? 1; let worst = 99;
  const rot = s.rotate !== 'none' || !!e.closest('.sticker'); for (const fy of rot ? [.5] : [0, .5, 1]) for (const fx of rot ? [.2, .5, .8] : [0, .25, .5, .75, 1]) { const px = c.getImageData(Math.min(im.width - 1, (r.left + Math.min(5, r.width / 2) + (r.width - 2 * Math.min(5, r.width / 2)) * fx) * k), Math.min(im.height - 1, (r.top + Math.min(5, r.height / 2) + (r.height - 2 * Math.min(5, r.height / 2)) * fy) * k), 1, 1).data;
   const t = Y([0, 1, 2].map((i) => m[i] * al + px[i] * (1 - al))), g = Y([px[0], px[1], px[2]]); worst = Math.min(worst, (Math.max(g, t) + .05) / (Math.min(g, t) + .05)); }
  if (worst < (parseFloat(s.fontSize) >= 24 ? 3 : 4.5)) f.push('contrast ' + worst.toFixed(2) + ' ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 24)); }
 return { n, f: [...new Set(f)].slice(0, 8) }; }`;

const b = await launch();
try {
  // 1. zoom 200% (root font-size only, like browser text zoom); then shapes at 100% with a tall viewport so elementFromPoint sees all
  for (const w of [1280, 390, 320]) for (const p of PATHS) {
    const t = await b.page({ w, h: 800 });
    await t.go(base + p);
    await t.ev(`document.documentElement.style.fontSize='200%'`); await sleep(300);
    const r = await t.ev(zoomProbe); if (r.length) ok(false, `zoom 200% ${w} ${p}: ${r.join('; ')}`);
    if (w !== 320) {
      await t.ev(`document.querySelectorAll('details').forEach((d) => (d.open = true))`);
      const sm = await t.ev(smallProbe); if (sm.length) ok(false, `small text (<.8rem) ${w} ${p}: ${sm.join('; ')}`);
      await t.ev(`document.documentElement.style.fontSize=''`); await sleep(100);
      const h = await t.ev(`document.documentElement.scrollHeight`);
      await t.cdp('Emulation.setDeviceMetricsOverride', { width: w, height: Math.min(h, 16000), deviceScaleFactor: 1, mobile: w < 600 }); await sleep(200);
      const s = await t.ev(shapeProbe); if (s.length) ok(false, `shapes ${w} ${p}: ${s.join('; ')}`);
    }
    await t.close();
  }
  // 1d. scrim/panel contrast behind text in the Home ads and Instagram cards (4.5:1, 3:1 at 24px+), 390 and 1280, Motion off
  for (const w of [390, 1280]) {
    const t = await b.page({ w, h: 800 }); await t.go(base + '/');
    await t.ev(`document.documentElement.dataset.motion = 'off'; document.querySelectorAll('.rel img').forEach((i) => (i.loading = 'eager')); document.querySelectorAll('.rel *').forEach((e) => { e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); })`); await sleep(400);
    const h = await t.ev(`document.documentElement.scrollHeight`);
    await t.cdp('Emulation.setDeviceMetricsOverride', { width: w, height: Math.min(h, 16000), deviceScaleFactor: 1, mobile: w < 600 }); await sleep(600);
    await t.ev(`document.documentElement.scrollTop = 0`);
    const shot = await t.cdp('Page.captureScreenshot', { format: 'png' }); if (process.env.SCRIM_SHOT) (await import('node:fs')).writeFileSync(process.env.SCRIM_SHOT + w + '.png', Buffer.from(shot.data, 'base64'));
    // colours come from the live page, so restore them for reading getComputedStyle while the screenshot holds the pixels
    await t.ev(`document.querySelectorAll('.rel *').forEach((e) => { e.style.removeProperty('color'); e.style.removeProperty('text-shadow'); })`);
    const r = await t.ev(`(${scrimProbe})("${shot.data}")`);
    ok(r.n >= 20, `scrim contrast @${w}: only ${r.n} text nodes found in .rel`);
    for (const m of r.f) ok(false, `scrim contrast @${w}: ${m}`);
    await t.close();
  }
  // 1b. no word broken mid-word in pocket titles, slabs and short labels at 320, 390, 430 and the two-column 768 and 1024
  // (loop 60: the Home Sell slab stacked "Your cards" one letter per line at 768)
  for (const w of [320, 390, 430, 768, 1024]) for (const p of PATHS) {
    const t = await b.page({ w, h: 800 }); await t.go(base + p);
    const r = await t.ev(wordProbe); if (r.length) ok(false, `word broken mid-word ${w} ${p}: ${r.join('; ')}`);
    await t.close();
  }
  // 1c. Sell side column: sticky only while it fits the window (guide folded); open guide => not sticky
  for (const h of [500, 700, 800]) {
    const t = await b.page({ w: 1280, h }); await t.go(base + '/sell/');
    const q = (open) => t.ev(`(() => { document.querySelectorAll('.sell-side details').forEach((d) => (d.open = ${open})); const e = document.querySelector('.sell-side'); return { pos: getComputedStyle(e).position, tall: Math.round(e.getBoundingClientRect().height) }; })()`);
    let r = await q(false); ok(h < 608 ? r.pos !== 'sticky' : r.pos === 'sticky' && r.tall + 88 <= h, `sell side folded @1280x${h}: sticky only when it fits ${JSON.stringify(r)}`);
    r = await q(true); ok(r.pos !== 'sticky' || r.tall + 88 <= h, `sell side guide open @1280x${h}: not sticky when taller than the window ${JSON.stringify(r)}`);
    await t.close();
  }
  // 2. menu sheet
  {
    const t = await b.page({ w: 390, h: 844 }); await t.go(base + '/events/');
    const st = () => t.ev(`({exp: document.getElementById('menu-btn').getAttribute('aria-expanded'), open: document.getElementById('menu-sheet').hasAttribute('data-open'), act: document.activeElement.id || document.activeElement.textContent.trim().slice(0, 20)})`);
    await t.ev(`document.getElementById('menu-btn').focus()`); await t.enter();
    let s = await st(); ok(s.exp === 'true' && s.open, 'menu: Enter opens the sheet ' + JSON.stringify(s));
    await t.tab(); s = await st(); ok(/Events/.test(s.act), 'menu: Tab lands on the first sheet link: ' + s.act);
    await t.esc(); s = await st(); ok(s.exp === 'false' && !s.open && s.act === 'menu-btn', 'menu: Esc closes and returns focus to Menu ' + JSON.stringify(s));
    await t.ev(`document.getElementById('menu-btn').focus()`); await t.enter(); for (let i = 0; i < 6; i++) await t.tab();
    s = await st(); ok(s.exp === 'false', 'menu: tabbing out of the sheet closes it ' + JSON.stringify(s));
    await t.ev(`document.getElementById('menu-btn').click()`);
    for (const type of ['mousePressed', 'mouseReleased']) await t.cdp('Input.dispatchMouseEvent', { type, x: 200, y: 700, button: 'left', clickCount: 1 });
    s = await st(); ok(s.exp === 'false', 'menu: click outside closes ' + JSON.stringify(s));
    await t.close();
  }
  // 2b. Events filter in the accessibility tree: every game filter => a status line with the count (or "No X nights listed"),
  // and hidden days/rows/tickets are gone from the tree (not just painted away).
  {
    const games = JSON.parse((await import('node:fs')).readFileSync('src/data/games.json', 'utf8'));
    for (const g of games) {
      const t = await b.page({ w: 1280, h: 900 }); await t.go(base + '/events/?game=' + g.id); await sleep(500);
      await t.cdp('Accessibility.enable');
      const { nodes } = await t.cdp('Accessibility.getFullAXTree');
      const live = (n) => !n.ignored;
      const names = (role) => nodes.filter((n) => live(n) && n.role?.value === role).map((n) => n.name?.value || '');
      const dom = await t.ev(`({ rows: [...document.querySelectorAll('tbody tr[data-game]')].map((r) => ({ game: r.dataset.game, fmt: r.querySelector('th')?.textContent.trim().slice(0, 20), hidden: r.hidden || !!r.closest('[hidden]') })),
        days: [...document.querySelectorAll('.day')].map((d) => ({ h: d.querySelector('h3').firstChild.textContent.trim(), hidden: !!d.closest('[hidden]') })),
        tickets: [...document.querySelectorAll('.ticket[data-game]')].map((r) => ({ game: r.dataset.game, h: r.querySelector('h3').textContent.trim(), hidden: r.hidden })) })`);
      const shown = dom.rows.filter((r) => !r.hidden).length;
      const want = shown ? `${shown} ${g.name} ${shown === 1 ? 'night' : 'nights'} this week` : `No ${g.name} nights listed`;
      const st = nodes.filter((n) => live(n) && n.role?.value === 'status' && n.name?.value !== undefined).map((n) => n.childIds && nodes.filter((c) => n.childIds.includes(c.nodeId)).map((c) => c.name?.value).join(''));
      ok(st.includes(want), `events filter ${g.id}: status line "${want}" in the AX tree, got ${JSON.stringify(st)}`);
      ok(dom.rows.every((r) => r.hidden === (r.game !== g.id)), `events filter ${g.id}: only ${g.id} rows left unhidden`);
      const heads = names('heading'), rowheads = names('rowheader');
      for (const d of dom.days) ok(d.hidden === !heads.some((h) => h.startsWith(d.h)), `events filter ${g.id}: ${d.h} ${d.hidden ? 'hidden day still in' : 'shown day missing from'} the AX tree`);
      ok(rowheads.length === shown, `events filter ${g.id}: ${rowheads.length} row headers in the AX tree, ${shown} rows shown`);
      for (const k of dom.tickets) ok(k.hidden === !heads.includes(k.h), `events filter ${g.id}: ticket "${k.h}" ${k.hidden ? 'hidden but in' : 'shown but not in'} the AX tree`);
      await t.close();
    }
  }
  // 3. motion: off => no animations, no transitions, on every path; reduced motion starts off with the switch disabled
  const motionProbe = `(() => { let tr = 0; for (const e of document.querySelectorAll('body *')) { const d = getComputedStyle(e).transitionDuration; if (d.split(',').some((x) => parseFloat(x) > 0)) tr++; }
    const m = document.getElementById('motion'); return { dm: document.documentElement.dataset.motion, pressed: m.getAttribute('aria-pressed'), disabled: m.disabled, anims: document.getAnimations().length, tr }; })()`;
  {
    const t = await b.page({ w: 1280, h: 800 }); await t.go(base + '/');
    let s = await t.ev(motionProbe); ok(s.dm === 'on' && s.pressed === 'true', 'motion: default on ' + JSON.stringify(s));
    await t.ev(`document.getElementById('motion').click()`); await sleep(80);
    for (const p of PATHS) { if (p !== '/') await t.go(base + p); s = await t.ev(motionProbe); ok(s.dm === 'off' && s.pressed === 'false' && s.anims === 0 && s.tr === 0, `motion off ${p}: ${JSON.stringify(s)}`); }
    await t.go(base + '/'); await t.ev(`document.getElementById('motion').focus()`); await t.enter(); s = await t.ev(motionProbe); ok(s.dm === 'on', 'motion: Enter toggles back on');
    await t.close();
    const r = await b.page({ w: 1280, h: 800, reduce: true });
    for (const p of PATHS) { await r.go(base + p); s = await r.ev(motionProbe); ok(s.dm === 'off' && s.anims === 0 && s.tr === 0 && s.disabled, `reduced motion ${p}: ${JSON.stringify(s)}`); }
    await r.close();
  }
  // 4. forms: an empty submit shows a focused error summary (no script error); ?sent= shows the focused success panel
  for (const [p, name, fid] of [['/', 'request', 'request-form'], ['/events/', 'signup', 'signup-form'], ['/shop/', 'request', 'request-form'], ['/sell/', 'buylist', 'buylist-form'], ['/visit/', 'contact', 'contact-form']]) {
    const t = await b.page({ w: 390, h: 844 }); await t.go(base + p);
    await t.ev(`window.__errs = []; addEventListener('error', (e) => __errs.push(e.message)); const f = document.getElementById('${fid}'); for (const el of f.querySelectorAll('input:not([type=hidden]):not([type=radio]), textarea')) el.value = ''; const s = f.querySelector('#su-event'); if (s) s.value = ''; f.querySelector('button[type=submit]').click()`); await sleep(200);
    let s = await t.ev(`(() => { const a = document.activeElement; return { errs: __errs, focus: a.id, panel: a.classList.contains('form-msg') && !a.hidden, links: a.querySelectorAll('a').length, url: location.pathname + location.search }; })()`);
    ok(!s.errs.length && s.panel && s.links > 0 && s.url === p, `form ${p}: empty submit shows a focused error summary ${JSON.stringify(s)}`);
    const sent = p === '/events/' ? 'signup' : name;
    await t.go(`${base}${p}?sent=${sent}`); await sleep(100);
    s = await t.ev(`({ focus: document.activeElement.id, hidden: document.getElementById('${fid}').hidden })`);
    ok(s.focus === `${name}-ok` && s.hidden, `form ${p}: ?sent=${sent} focuses the success panel ${JSON.stringify(s)}`);
    await t.close();
  }
  // 5. scripts OFF, end to end: post all 5 forms through the browser (good and bad email); the Worker redirects to #<form>-ok|-wait|-err,
  // that result panel must show and sit in view, at 100% and at 200% text. Then every result panel by URL, at 390 and 1280.
  const FORMS = [['/', 'request-form'], ['/shop/', 'request-form'], ['/events/', 'signup-form'], ['/sell/', 'buylist-form'], ['/visit/', 'contact-form']];
  const panelProbe = `(() => { const e = document.querySelector(':target'); if (!e) return { id: null }; const r = e.getBoundingClientRect(); return { id: e.id, disp: getComputedStyle(e).display, top: Math.round(r.top), bottom: Math.round(r.bottom), tall: Math.round(r.height), vh: innerHeight, text: e.textContent.trim().length }; })()`;
  const refocus = `(() => { const id = location.hash.slice(1); location.hash = ''; location.hash = '#' + id; return 0; })()`;
  const panelOk = (r, want) => r.id && want.test(r.id) && r.disp !== 'none' && r.text > 0 && r.top >= 0 && r.bottom <= r.vh; // fully in view, under no header
  const noJs = async (w) => { const t = await b.page({ w, h: 844 }); await t.cdp('Emulation.setScriptExecutionDisabled', { value: true }); return t; };
  for (const bad of [false, true]) for (const [p, fid] of FORMS) {
    const t = await noJs(390); await t.go(base + p);
    const email = bad ? 'not-an-email' : `a11y${Date.now() % 1e6}${Math.random().toString(36).slice(2, 6)}@example.com`;
    await t.ev(`(() => { const f = document.getElementById('${fid}'); f.noValidate = true;
      const set = (n, v) => f.querySelectorAll('[name="' + n + '"]').forEach((e, i) => { if (i === 0 || n !== 'item_name[]') e.value = v; });
      set('name', 'A11y'); set('email', '${email}'); set('cards', 'Sol Ring'); set('message', 'Hello <b>&'); set('item_name[]', 'Sol Ring');
      f.querySelectorAll('[name="item_qty[]"]').forEach((e, i) => (e.value = i ? '' : '1'));
      const pay = f.querySelector('[name=payout][value=cash]'); if (pay) pay.checked = true;
      const ev = f.querySelector('[name=event_id]'); if (ev) ev.selectedIndex = 0;
      f.querySelector('button[type=submit]').click(); return 0; })()`);
    await sleep(1500);
    const want = bad ? /-err$/ : /-(ok|wait)$/, tag = `${bad ? 'bad email' : 'good'} ${p}`;
    let r = await t.ev(panelProbe); ok(panelOk(r, want), `no-JS post, ${tag}: result panel ${JSON.stringify(r)}`);
    await t.ev(`document.documentElement.style.fontSize='200%'`); await t.ev(refocus); await sleep(300);
    r = await t.ev(panelProbe); ok(panelOk(r, want), `no-JS post, ${tag}, 200% text: result panel ${JSON.stringify(r)}`);
    await t.close();
  }
  const RESULTS = ['/?sent=request#request-ok', '/?request=error#request-err', '/shop/?sent=request#request-ok', '/shop/?request=error#request-err', '/events/?sent=signup#signup-ok', '/events/?sent=waitlist#signup-wait', '/events/?signup=error#signup-err', '/sell/?sent=buylist#buylist-ok', '/sell/?buylist=error#buylist-err', '/visit/?sent=contact#contact-ok', '/visit/?contact=error#contact-err'];
  for (const [w, zooms] of [[390, ['', '200%']], [1280, ['200%']]]) for (const u of RESULTS) for (const z of zooms) {
    const t = await noJs(w); await t.go(base + u);
    if (z) { await t.ev(`document.documentElement.style.fontSize='${z}'`); await t.ev(refocus); await sleep(300); }
    const r = await t.ev(panelProbe); ok(panelOk(r, /./), `no-JS result ${u} @${w} ${z || '100%'}: ${JSON.stringify(r)}`);
    await t.close();
  }
} finally { b.quit(); server?.kill(); }
console.log(fails.length ? `a11y: ${fails.length} failure(s)` : 'a11y: all checks passed');
process.exit(fails.length ? 1 : 0);
