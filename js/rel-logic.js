// Pure rules for the Home release tabs and the New releases rotation (no DOM, no timers). Used by public/js/rel-tabs.js and test/rotation.test.mjs.
export const ROTATE_MS = 7000;
// Next slide index, wrapping both ways.
export const step = (i, n, dir = 1) => (n > 0 ? (((i + dir) % n) + n) % n : 0);
// Tabs, automatic activation: Left/Right wrap, Home/End jump. Returns the new index, or null for any other key (so Tab keeps its normal job).
export const tabKey = (key, i, n) => ({ ArrowRight: step(i, n, 1), ArrowLeft: step(i, n, -1), Home: 0, End: n - 1 })[key] ?? null;
// The timer may run only when nothing says stop: the visitor's Pause (sticky until Play), hover, focus inside, a hidden tab, reduced motion, or a single slide.
export const shouldRun = ({ paused, hover, focus, hidden, reduced, n }) => n > 1 && !paused && !hover && !focus && !hidden && !reduced;
// Reduced motion starts Paused and never auto-advances; Play stays off.
export const startsPaused = (reduced) => !!reduced;
export const slideLabel = (i, n, name) => `${i + 1} of ${n}: ${name}`;
export const dotLabel = (i, name) => `Show release ${i + 1}: ${name}`;
