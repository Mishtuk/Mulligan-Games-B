import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROTATE_MS, step, tabKey, shouldRun, startsPaused, slideLabel, dotLabel } from '../public/js/rel-logic.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const built = fs.existsSync(dist);
const home = () => fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const idle = { paused: false, hover: false, focus: false, hidden: false, reduced: false, n: 5 };

test('rotation: 7 seconds, next index wraps both ways', () => {
  assert.equal(ROTATE_MS, 7000);
  assert.equal(step(4, 5), 0); assert.equal(step(0, 5, -1), 4); assert.equal(step(1, 5), 2); assert.equal(step(0, 0), 0);
});

test('rotation: the timer runs only when nothing says stop', () => {
  assert.equal(shouldRun(idle), true);
  for (const k of ['paused', 'hover', 'focus', 'hidden', 'reduced']) assert.equal(shouldRun({ ...idle, [k]: true }), false, k);
  assert.equal(shouldRun({ ...idle, n: 1 }), false); // one slide: nothing to rotate
});

test('rotation: reduced motion starts Paused and never runs, whatever else is true', () => {
  assert.equal(startsPaused(true), true); assert.equal(startsPaused(false), false);
  assert.equal(shouldRun({ ...idle, reduced: true }), false);
  assert.equal(shouldRun({ ...idle, reduced: true, paused: false, hover: false, focus: false }), false);
});

test('rotation: a visitor Pause is sticky (hover or focus leaving does not restart it)', () => {
  const s = { ...idle, paused: true, hover: true };
  assert.equal(shouldRun(s), false);
  assert.equal(shouldRun({ ...s, hover: false }), false);
  assert.equal(shouldRun({ ...s, hover: false, paused: false }), true); // only Play restarts
});

test('writer strings: slide, dot and position labels', () => {
  assert.equal(slideLabel(1, 5, 'Star Trek'), '2 of 5: Star Trek');
  assert.equal(dotLabel(1, 'Star Trek'), 'Show release 2: Star Trek');
});

test('tabs keyboard model: arrows wrap, Home and End jump, other keys are left alone', () => {
  assert.equal(tabKey('ArrowRight', 4, 5), 0); assert.equal(tabKey('ArrowLeft', 0, 5), 4);
  assert.equal(tabKey('ArrowRight', 1, 5), 2); assert.equal(tabKey('Home', 3, 5), 0); assert.equal(tabKey('End', 0, 5), 4);
  assert.equal(tabKey('Tab', 0, 5), null); assert.equal(tabKey('Enter', 0, 5), null);
});

test('built Home: 5 tabs, 5 panels, matching ids, first panel only active, one panel per tab', { skip: !built }, () => {
  const h = home();
  const tabs = [...h.matchAll(/<a id="(tr-tab-[^"]+)" href="[^"]+" data-tab="([^"]+)"/g)];
  assert.equal(tabs.length, 5);
  for (const [, id, rel] of tabs) assert.match(h, new RegExp(`id="tr-panel-${rel}" data-panel="${rel}"`), id);
  assert.equal([...h.matchAll(/class="rel tr-panel"[^>]*data-active/g)].length, 1);
  assert.equal([...h.matchAll(/<img\b[^>]*fetchpriority="high"/g)].length, 1); // first panel art only
  assert.match(h, /See what's in the box/);
  assert.doesNotMatch(h, /role="tab"/); // added by script, so no-JS is a plain list of links
});

test('built Home: no duplicate ids, slides and grid never share an id, one carousel, no timer in markup', { skip: !built }, () => {
  const h = home();
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids.filter((x, i) => ids.indexOf(x) !== i), []);
  assert.equal([...h.matchAll(/aria-roledescription="carousel"/g)].length, 1);
  const slides = [...h.matchAll(/id="slide-([^"]+)"/g)].length, grid = [...h.matchAll(/<li class="rel" id="rel-/g)].length;
  assert.equal(slides, 5); assert.equal(grid, 5);
  assert.match(h, /class="rel-track" aria-live="off"/);
  assert.equal([...h.matchAll(/class="rel-slide[^"]*"[^>]*data-active/g)].length + [...h.matchAll(/class="rel rel-slide"[^>]*data-active/g)].length, 1);
  for (const t of ['Pause', 'Previous release', 'Next release', 'Show release 2: Delta Reign', '1 of 5', 'Auto-play is off (your device setting)']) assert.ok(h.includes(t), t);
});

test('no-JS and reduced-motion CSS: only slide 1 shows without .js; crossfade only under no-preference', () => {
  const css = fs.readFileSync(path.resolve(dist, '..', 'src/styles/releases.css'), 'utf8');
  assert.match(css, /html:not\(\.js\) \.rel-slide:not\(:first-child\) \{ display: none; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)[^{]*\{\s*\.rel-slide \{ transition: opacity \.4s/);
  assert.match(css, /\.rel-slide \{ grid-area: 1 \/ 1;/); // one grid cell: no layout shift
});

test('rel-tabs.js: inert and aria-hidden on inactive slides, hover/focus/visibility wired, no setInterval without shouldRun', () => {
  const js = fs.readFileSync(path.resolve(dist, '..', 'public/js/rel-tabs.js'), 'utf8');
  for (const re of [/toggleAttribute\('inert'/, /aria-hidden/, /pointerenter/, /focusin/, /visibilitychange/, /shouldRun/]) assert.match(js, re);
  assert.equal([...js.matchAll(/setInterval/g)].length, 1);
});
