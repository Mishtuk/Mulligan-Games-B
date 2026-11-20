// Release status (no DOM), shared by browser, Astro (src/lib/releases.js) and tests. Dates YYYY-MM-DD vs today in America/New_York.
export const STALE_DAYS = 90;
const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const n = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8)) / 864e5;
export const fmtDate = (d, t) => `${M[+d.slice(5, 7) - 1]} ${+d.slice(8)}${d.slice(0, 4) === t.slice(0, 4) ? '' : ', ' + d.slice(0, 4)}`;
export const isOut = (d, t) => d <= t;
export const isStale = (d, t) => n(t) - n(d) > STALE_DAYS;
export const releaseLabel = (d, t) => (isOut(d, t) ? 'Out now' : 'Coming soon');
// The one place a date is said: "Released Nov 6" / "In store Jan 29, 2027" (shown uppercase).
export const dateLine = (d, t) => `${isOut(d, t) ? 'Released' : 'In store'} ${fmtDate(d, t)}`;
// Not too old; out now first (newest first), then coming (soonest first).
export const shownReleases = (rows, t) => rows.filter((r) => !isStale(r.releaseDate, t)).sort((a, b) => {
  const x = isOut(a.releaseDate, t), y = isOut(b.releaseDate, t);
  return x !== y ? (x ? -1 : 1) : x ? b.releaseDate.localeCompare(a.releaseDate) : a.releaseDate.localeCompare(b.releaseDate);
});
