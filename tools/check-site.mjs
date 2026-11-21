#!/usr/bin/env node
// Shared site check (no packages): raw CDP over WebSocket to a local Chrome or Edge. Needs Node 22+.
// Usage: node tools/check-site.mjs <base-url> [/ /about.html ...] [--port 9222] [--chrome path]
//   Without --port it starts a headless browser itself (CHROME env or --chrome, else Chrome, then Edge).
//   With --port it attaches to one you started: chrome --headless=new --remote-debugging-port=9222 --user-data-dir=%TEMP%\chk about:blank
// Checks per page: no sideways overflow at 320-1600; getAnimations() 0 with reduced motion emulated;
// no duplicate ids; no console errors or CSP violations; Tab reaches every control with a visible ring (390 and 1280);
// rendered-ground contrast (4.5:1, 3:1 at 24px+) and `.ln` width, scrolled down the whole page (390 and 1280).
// Project copy (Mulligan-Games-B): text under the sticky header (and the product pages' bottom .holdbar) is skipped (loop 29: the 'What we play' 2.45 flake was the header's orange Menu button passing over the heading's corner at one scroll step, not a low-contrast ground; measured: the band is flat #5B2A86 at every scroll offset, 399 samples at 390 and 1280); radio groups count as one Tab stop; the deliberate 404 page status is not a console error.
// Exit 0 = clean, 1 = failures (listed), 2 = could not run.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf(n); return i < 0 ? null : args.splice(i, 2)[1]; };
const port = opt('--port'), chromeArg = opt('--chrome'), theme = opt('--theme') === 'light' ? 'light' : 'dark'; // --theme light stores mg-theme=light, so the whole run checks the light theme
const base = (args.shift() || '').replace(/\/$/, ''), pages = args.length ? args : ['/'];
if (!/^https?:\/\//.test(base)) { console.error('usage: node tools/check-site.mjs <base-url> [paths...] [--port N] [--chrome path]'); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// The SKILL step 4 rendered-ground check (text on the sampled pixels; text on a coloured box is skipped; best of 4 corners).
const GROUND = "async p=>{const f=[],im=await createImageBitmap(new Blob([Uint8Array.from(atob(p),c=>c.charCodeAt())])),c=new OffscreenCanvas(im.width,im.height).getContext('2d'),k=im.width/innerWidth,Y=a=>{const[r,g,b]=a.map(v=>(v/=255)<=.04?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b},boxed=a=>{for(;a!=document.body;a=a.parentElement)if(getComputedStyle(a).backgroundColor!='rgba(0, 0, 0, 0)')return 1};c.drawImage(im,0,0);let hb=0,fb=1e9,tg=document.querySelector('.holdbar')&&document.querySelector('.theme-toggle')?.getBoundingClientRect();for(const a of document.querySelectorAll('body>*,.holdbar,header,nav')){const p=getComputedStyle(a).position;if((p=='sticky'||p=='fixed')&&a.getBoundingClientRect().top<innerHeight/2)hb=Math.max(hb,a.getBoundingClientRect().bottom);else if(p=='fixed'&&a.classList.contains('holdbar'))fb=a.getBoundingClientRect().top}for(const e of document.querySelectorAll('h1,h2,h3,p,li,a,button,label,small')){const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(e.firstElementChild||boxed(e)||!r.width||r.top<hb||r.bottom>fb||(tg&&r.bottom>tg.top&&r.right>tg.left&&r.top<tg.bottom)||r.bottom>innerHeight||!e.textContent.trim())continue;const t=Y(s.color.match(/[\\d.]+/g).slice(0,3).map(Number)),q=Math.max(...[[2,2],[r.width-3,2],[2,r.height-3],[r.width-3,r.height-3]].map(([x,y])=>{const g=Y([...c.getImageData((r.left+x)*k,(r.top+y)*k,1,1).data]);return(Math.max(g,t)+.05)/(Math.min(g,t)+.05)}));if(q<(parseFloat(s.fontSize)>=24?3:4.5))f.push('contrast '+q.toFixed(2)+' '+e.tagName+' '+e.textContent.trim().slice(0,20))}document.querySelectorAll('.ln').forEach(l=>l.offsetWidth>l.parentElement.clientWidth+1&&f.push('.ln wider than box: '+l.textContent));return f}";
const FOCUSABLE = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[tabindex],[contenteditable=true]';

async function connect() {
  let proc = null, profile = null, wsUrl;
  if (port) wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()).webSocketDebuggerUrl;
  else {
    const exe = [chromeArg, process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => p && existsSync(p));
    if (!exe) throw new Error('no Chrome or Edge found: pass --chrome <path> or --port <N>');
    profile = mkdtempSync(join(tmpdir(), 'chk-'));
    proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    wsUrl = await new Promise((res, rej) => { let log = ''; proc.stderr.on('data', (d) => { log += d; const m = log.match(/ws:\/\/\S+/); if (m) res(m[0]); }); setTimeout(() => rej(new Error('no DevTools URL')), 15000); });
  }
  const ws = new WebSocket(wsUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('cannot reach DevTools at ' + wsUrl)); });
  let id = 0; const pend = new Map(), handlers = [];
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } else if (m.method) handlers.forEach((h) => h(m)); };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const cdp = (m, p) => send(m, p, sessionId);
  const close = async () => { try { await send('Target.closeTarget', { targetId }); } catch {} ws.close(); if (proc) { proc.kill(); try { rmSync(profile, { recursive: true, force: true }); } catch {} } };
  return { cdp, on: (h) => handlers.push((m) => m.sessionId === sessionId && h(m)), close };
}

const fails = [];
let b;
try { b = await connect(); } catch (e) { console.error('check-site could not run: ' + e.message); process.exit(2); }
try {
  const { cdp } = b;
  const ev = async (expression) => { const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  let errs = new Set(), loaded = null;
  b.on((m) => {
    if (m.method === 'Runtime.exceptionThrown') errs.add('script error: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.add('console.error: ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') { const e = m.params.entry; if(/favicon.ico/.test(e.url||""))return; if(/ 404 \(/.test(e.text)&&/\/(nope|404)(\.html)?$/.test(e.url||""))return; errs.add((/Content Security Policy/i.test(e.text) ? 'CSP violation: ' : 'console: ') + e.text.slice(0, 220) + (e.url ? ' (' + e.url + ')' : '')); }
    if (m.method === 'Page.loadEventFired' && loaded) loaded();
  });
  for (const d of ['Page', 'Runtime', 'Log']) await cdp(d + '.enable');
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  let initId = null;
  // motion: 'on' = no-preference; 'off' or 'reduce' = device reduced-motion emulated (no site switch)
  async function load(path, w, motion) {
    if (initId) await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: initId });
    ({ identifier: initId } = await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.removeItem('motion')}catch{}try{${theme === 'light' ? "localStorage.setItem('mg-theme','light')" : "localStorage.removeItem('mg-theme')"}}catch{}` }));
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: motion !== 'on' ? 'reduce' : 'no-preference' }] });
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
    const done = new Promise((r) => { loaded = r; setTimeout(r, 15000); });
    await cdp('Page.navigate', { url: base + path }); await done; loaded = null;
    await ev('document.fonts.ready.then(()=>0)'); await sleep(500);
  }
  const scrollAll = async (each) => { const H = await ev('document.documentElement.scrollHeight'), vh = await ev('innerHeight'); for (let y = 0; y < H; y += Math.floor(vh * 0.75)) { await ev(`scrollTo(0,${y});0`); await sleep(150); if (each) await each(); } await ev('scrollTo(0,0);0'); };

  for (const path of pages) {
    const bad = (what, msg) => { fails.push(`${path}  ${what}: ${msg}`); };
    errs = new Set();
    // 1. overflow, 320-1600
    for (const w of [320, 390, 768, 1024, 1280, 1600]) {
      await load(path, w, 'off');
      const o = await ev(`(()=>{const d=document.documentElement,sw=Math.max(d.scrollWidth,document.body.scrollWidth),wide=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,3).map(e=>e.tagName.toLowerCase()+(e.className&&typeof e.className=='string'?'.'+e.className.trim().split(/\\s+/)[0]:''));return {x:sw-innerWidth,wide}})()`);
      if (o.x > 0) bad(`overflow @${w}`, `page is ${o.x}px wider than the window` + (o.wide.length ? ` (reaches past the edge: ${o.wide.join(', ')})` : ''));
    }
    // 2. animations: reduced motion emulated
    for (const mo of ['reduce']) {
      await load(path, 1280, mo); const n = new Set();
      await scrollAll(async () => (await ev(`document.getAnimations().map(a=>a.animationName||a.transitionProperty||a.constructor.name)`)).forEach((x) => n.add(x)));
      if (n.size) bad('animations (reduced motion)', `getAnimations() not empty: ${[...n].join(', ')}`);
    }
    // 3. duplicate ids
    await load(path, 1280, 'off');
    const dup = await ev(`[...new Set([...document.querySelectorAll('[id]')].map(e=>e.id).filter((x,i,a)=>a.indexOf(x)!==i))]`);
    if (dup.length) bad('duplicate ids', dup.join(', '));
    // 4. Tab reaches every visible control, each with a visible focus ring
    for (const w of [390, 1280]) {
      await load(path, w, 'off');
      const total = await ev(`(()=>{window.__seen=new Set();window.__d=(e)=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className=='string'&&e.className?'.'+e.className.trim().split(/\\s+/)[0]:'')+' "'+(e.getAttribute('aria-label')||e.textContent||e.value||e.getAttribute('href')||'').trim().replace(/\\s+/g,' ').slice(0,24)+'"';window.__vis=(e)=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility=='visible'&&!e.closest('[inert],[hidden]')&&!e.disabled&&e.tabIndex>=0&&r.right>0&&r.left<document.documentElement.scrollWidth};return [...document.querySelectorAll(${JSON.stringify(FOCUSABLE)})].filter(window.__vis).length})()`);
      const noRing = new Set(); let guard = 0, first = null;
      while (guard++ < total + 12) {
        for (const type of ['keyDown', 'keyUp']) await cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        const r = await ev(`(()=>{const e=document.activeElement;if(!e||e===document.body)return null;if(e.closest(".cf-turnstile"))return {d:"turnstile",ring:true,key:-2};const s=getComputedStyle(e),ring=(s.outlineStyle!='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!='none';window.__seen.add(e);return {d:window.__d(e),ring,key:[...document.querySelectorAll('*')].indexOf(e)}})()`);
        if (!r) break;
        if (first === null) first = r.key; else if (r.key === first) break;
        if (!r.ring) noRing.add(r.d);
      }
      const missed = await ev(`[...document.querySelectorAll(${JSON.stringify(FOCUSABLE)})].filter(e=>window.__vis(e)&&!window.__seen.has(e)&&!(e.type=='radio'&&e.name&&[...window.__seen].some(t=>t.type=='radio'&&t.name==e.name&&t.form==e.form))).map(window.__d)`);
      if (missed.length) bad(`keyboard @${w}`, `Tab never reached: ${missed.slice(0, 8).join('; ')}${missed.length > 8 ? ` (+${missed.length - 8} more)` : ''}`);
      if (noRing.size) bad(`focus ring @${w}`, `no visible ring on: ${[...noRing].slice(0, 8).join('; ')}`);
    }
    // 5. rendered-ground contrast + headline overflow, scrolled down the whole page
    for (const w of [390, 1280]) {
      await load(path, w, 'off'); const found = new Set();
      await scrollAll(async () => {
        const { data } = await cdp('Page.captureScreenshot', { format: 'png' });
        const r = await cdp('Runtime.evaluate', { expression: `(${GROUND})("${data}")`, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) found.add('check script error: ' + r.exceptionDetails.text); else r.result.value.forEach((x) => found.add(x));
      });
      for (const f of found) bad(`ground @${w}`, f);
    }
    // 6. console errors and CSP violations seen over every load above
    for (const e of errs) bad('console', e);
  }
} catch (e) { console.error('check-site could not run: ' + e.message); await b.close(); process.exit(2); }
await b.close();
if (fails.length) { console.log(`FAIL  ${base}  ${pages.length} page(s), ${fails.length} problem(s)\n` + fails.map((f) => '  - ' + f).join('\n')); process.exit(1); }
console.log(`PASS  ${base}  ${pages.join(' ')}  [${theme} theme]  (overflow 320-1600, animations off/reduced, ids, console/CSP, Tab + rings, ground contrast)`);
