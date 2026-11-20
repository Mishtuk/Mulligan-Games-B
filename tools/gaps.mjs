// npm run gaps [-- paths...] [--base=url]: dead-space check in real Chrome (CDP). Needs `npm run build` first.
// For each width (390, 768, 1024, 1280, 1600) it paints a vertical map of what is really drawn inside <main>
// (text, images, svg, form controls, borders and backgrounds of leaf shapes) and prints every blank vertical run over
// 120px between two things. Box padding does not count as content, so a box with a big empty belly shows up too.
// Also prints "thin" rows: a full-width sibling row where one cell's content covers under half its box width while the
// other is taller (the empty-third case). Exit 1 if anything is found. Without --base it serves dist/ on port 4398.
import { spawn } from 'node:child_process';
import { launch, sleep } from './cdp.mjs';

const args = process.argv.slice(2);
const baseArg = args.find((a) => a.startsWith('--base='));
// Git Bash rewrites a leading / into C:/Program Files/Git/: undo that so the gate works without MSYS_NO_PATHCONV
const paths = args.filter((a) => !a.startsWith('--')).map((a) => a.replace(/^[A-Za-z]:[\/]Program Files[\/]Git/i, '') || '/');
if (!paths.length) paths.push('/');
const WIDTHS = [390, 768, 1024, 1280, 1600];
const LIMIT = 120;
let base = baseArg?.slice(7), server = null;
if (!base && !args.includes('--selftest')) {
  const port = process.env.PORT || 4398; base = `http://localhost:${port}`;
  server = spawn(process.execPath, ['tools/serve.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  for (let i = 0; i < 30; i++) { try { if ((await fetch(base + '/')).ok) break; } catch {} await sleep(200); }
}

const probe = `(() => {
  const main = document.querySelector('main'); if (!main) return { err: 'no main' };
  const top0 = main.getBoundingClientRect().top + scrollY, bot0 = main.getBoundingClientRect().bottom + scrollY;
  const rects = [];
  const add = (r) => { if (r.width > 1 && r.height > 0) rects.push([r.top + scrollY, r.bottom + scrollY, r.left, r.right]); };
  const skip = (e) => e.closest('[hidden],.vh,.hp,script,style,noscript') || getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).display === 'none';
  const w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { if (!n.textContent.trim() || skip(n.parentElement)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) add(r); }
  for (const e of main.querySelectorAll('*')) {
    if (skip(e)) continue; const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    if (/^(IMG|SVG|VIDEO|CANVAS|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME)$/i.test(e.tagName)) { add(r); continue; }
    const paint = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
    const leaf = !e.querySelector('*') || e.matches('i,.box-sil,.sleeve,[aria-hidden]');
    if (paint && leaf && !e.textContent.trim()) add(r);
    if (e.matches('.box-sil') || e.matches('.box-sil *')) add(r);
    for (const pe of ['::before', '::after']) { const ps = getComputedStyle(e, pe); if (ps.content !== 'none' && ps.display !== 'none' && ps.position !== 'absolute' && parseFloat(ps.height) > 0) add({ top: r.top, bottom: r.top + parseFloat(ps.height), left: r.left, right: r.right, width: r.width, height: parseFloat(ps.height) }); }
  }
  rects.sort((a, b) => a[0] - b[0]);
  const runs = []; let cur = top0;
  for (const [t, b] of rects) { if (t - cur > ${LIMIT}) runs.push([Math.round(cur - top0), Math.round(t - top0), Math.round(t - cur)]); cur = Math.max(cur, b); }
  if (bot0 - cur > ${LIMIT}) runs.push([Math.round(cur - top0), Math.round(bot0 - top0), Math.round(bot0 - cur)]);
  // thin rows: direct children of the page wrapper sharing a row, one box whose content spans < 50% of its width
  const thin = [], wrap = main.querySelector('.wrap') || main;
  const kids = [...wrap.children].flatMap((k) => k.matches('.duo') ? [...k.children] : [k]).filter((k) => k.getBoundingClientRect().width > 0 && getComputedStyle(k).display !== 'none');
  for (const k of kids) {
    const kr = k.getBoundingClientRect(); if (kr.width < 300 || kr.height < 120) continue;
    const mine = rects.filter((r) => r[0] >= kr.top + scrollY - 1 && r[1] <= kr.bottom + scrollY + 1 && r[2] >= kr.left - 1 && r[3] <= kr.right + 1);
    if (!mine.length) continue;
    const l = Math.min(...mine.map((r) => r[2])), rt = Math.max(...mine.map((r) => r[3]));
    const boxed = (e) => parseFloat(getComputedStyle(e).borderTopWidth) > 0;
    const sib = boxed(k) && kids.some((o) => o !== k && boxed(o) && Math.abs(o.getBoundingClientRect().top - kr.top) < 40 && Math.abs(o.getBoundingClientRect().height - kr.height) > 8);
    // only a page title block (header with the h1 and lede) may be left-aligned and short; every other block counts
    if (!(k.matches('header') && k.querySelector('h1')) && (rt - l) / kr.width < 0.55 && kr.width < innerWidth * .9 || sib) thin.push((k.className || k.tagName) + ' w' + Math.round(kr.width) + ' h' + Math.round(kr.height) + ' content ' + Math.round((rt - l) / kr.width * 100) + '% wide' + (sib ? ', unequal sibling height' : ''));
  }
  // nested rows: inside any grid row (at any depth) one column's content ends > LIMIT px above its sibling column's
  const nested = [];
  for (const g of main.querySelectorAll('*')) {
    if (skip(g) || getComputedStyle(g).display !== 'grid' || g.closest('form')) continue;
    // narrow: only repeated cards (same tag and a real class), not a form, its fields or a classless section pair
    const cells = [...g.children].filter((c) => !skip(c) && c.getBoundingClientRect().width > 120 && c.className && [...g.children].filter((o) => o.tagName === c.tagName && o.className === c.className).length > 1);
    const rows = new Map(); for (const c of cells) { const k = Math.round(c.getBoundingClientRect().top / 8); rows.set(k, [...(rows.get(k) || []), c]); }
    for (const row of rows.values()) {
      if (row.length < 2 || new Set(row.map((c) => Math.round(c.getBoundingClientRect().left))).size < 2) continue;
      const ends = row.map((c) => { const cr = c.getBoundingClientRect(), m = rects.filter((r) => r[0] >= cr.top + scrollY - 1 && r[1] <= cr.bottom + scrollY + 1 && r[2] >= cr.left - 1 && r[3] <= cr.right + 1); return m.length ? Math.max(...m.map((r) => r[1])) : cr.top + scrollY; });
      const lo = Math.min(...ends), hi = Math.max(...ends);
      if (hi - lo > ${LIMIT}) nested.push('row in ' + (g.className || g.tagName) + ': a column ends ' + Math.round(hi - lo) + 'px above its sibling (y ' + Math.round(lo - top0) + ' vs ' + Math.round(hi - top0) + ')');
    }
  }
  return { runs, thin, nested, h: Math.round(bot0 - top0) };
})()`;

const b = await launch(); let bad = 0;
// --selftest: the nested-row check must flag a ragged grid row and pass an even one (two data: pages, 1280 wide)
if (args.includes('--selftest')) {
  const page = (right) => 'data:text/html,' + encodeURIComponent('<style>body{margin:0;font:16px sans-serif}.g{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}p{margin:0 0 8px}</style><main><div class="wrap"><div class="g"><div class="card">' + '<p>left column text</p>'.repeat(14) + '</div><div class="card">' + '<p>right column text</p>'.repeat(right) + '</div></div></div></main>');
  let fail = 0;
  for (const [right, want] of [[3, true], [13, false]]) {
    const t = await b.page({ w: 1280, h: 900 }); await t.go(page(right)); const r = await t.ev(probe); await t.close();
    const got = r.nested.length > 0; console.log('selftest ragged=' + want + ': ' + (got === want ? 'ok' : 'WRONG ' + JSON.stringify(r.nested))); if (got !== want) fail++;
  }
  b.quit(); server?.kill(); process.exit(fail ? 1 : 0);
}
for (const path of paths) for (const w of WIDTHS) {
  const t = await b.page({ w, h: 900 }); await t.go(base + path);
  const r = await t.ev(probe); await t.close();
  if (r.err) { console.log(path, w, r.err); bad++; continue; }
  const msgs = [...r.runs.map(([a, z, h]) => `blank ${h}px at y ${a}-${z}`), ...r.thin, ...r.nested];
  console.log(`${path} @${w} (main ${r.h}px): ${msgs.length ? '' : 'ok'}`);
  for (const m of msgs) { console.log('  ' + m); bad++; }
}
b.quit(); server?.kill();
process.exit(bad ? 1 : 0);
