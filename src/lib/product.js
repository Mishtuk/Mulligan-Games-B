// Product detail pages (/shop/<release-id>/): joins releases.json with product-contents.json and the writer's strings
// (docs/copy/visual-batch.md section 4). No MSRP is ever read: D13 says prices read "Ask at the counter".
import releases from '../data/releases.json' with { type: 'json' };
import contents from '../data/product-contents.json' with { type: 'json' };
import { fmtDate, isOut } from './releases.js';
import { DAY_SHORT, fmtTime } from './hours.js';

// One page per confirmed release. "singles" is reserved for the singles search (D13) and is never emitted.
export const productReleases = () => releases.filter((r) => /^Confirmed/.test(r.certainty) && r.id !== 'singles');

// Writer's table (section 4): title, meta description, h1, summary. Title is used whole (it already ends "| Mulligan Games").
export const COPY = {
  'mtg-star-trek': { title: 'Star Trek Magic set | Mulligan Games', description: 'Star Trek for Magic is out now at Mulligan Games in Warminster. See what is in each box and hold one.', h1: 'Star Trek', summary: 'Sixty years of crews, adversaries and starships come to Magic, with new cards and mechanics. Released Nov 13; prerelease ran Nov 6 to 12.' },
  'pokemon-delta-reign': { title: 'Mega Evolution: Delta Reign | Mulligan Games', description: 'Mega Evolution: Delta Reign is out now. See what is in each box and hold one at Mulligan Games in Warminster.', h1: 'Mega Evolution: Delta Reign', summary: 'A Mega Evolution series set of over 135 cards, released Nov 6, built around Pokemon ex and Trainer cards.' },
  'one-piece-st37-38': { title: 'One Piece starter decks ST-37, ST-38 | Mulligan Games', description: 'Two One Piece starter decks land Dec 18. See what is in each and hold one at Mulligan Games in Warminster.', h1: 'Starter decks ST-37 and ST-38', summary: 'ST-37 is a Red/Blue deck of fast, repeated attacks; ST-38 is a Blue/Black Baroque Works deck about cycling your hand. Cards are tournament legal 7 days after release.' },
  'riftbound-legacy': { title: 'Riftbound Legacy | Mulligan Games', description: 'Riftbound Legacy arrives Jan 29. See what we know about the set and hold one at Mulligan Games in Warminster.', h1: 'Riftbound: Legacy', summary: "Riftbound's 2027 opener has 239 cards, 93 of them Showcase. Pre-Rift events run Jan 22 to 28." },
  'hololive-volume-vortex': { title: 'Hololive Volume Vortex | Mulligan Games', description: 'Hololive Volume Vortex arrives Mar 19. See the set and hold a pack at Mulligan Games in Warminster.', h1: 'Volume Vortex', summary: 'Released Mar 19, with BIG3 (Oozora Subaru, Shirogane Noel, Yukihana Lamy) on the packaging, new color variations and cards for existing decks.' },
};

// D4 and the writer's rewrites of the "not stated" lines (section 4). Everything else in contents[] is printed verbatim.
export const D4 = 'Contents not announced yet';
export const LINE_REWRITE = {
  'packs per box and cards per pack not stated on the page': 'Packs per box and cards per pack: not announced yet',
  'Pack and display counts not stated': 'Pack and display counts: not announced yet',
};
export const boxLine = (s) => LINE_REWRITE[s] ?? s;

// Confirmed rows only. `hidden` counts the rows we leave out (Likely), which become one "More ... products" note.
export function productsFor(id) {
  const all = contents[id]?.products ?? [];
  const shown = all.filter((p) => p.certainty === 'Confirmed').map((p) => ({ id: p.id, name: p.name, type: p.type, lines: (p.contents ?? []).map(boxLine) }));
  return { shown, hidden: all.length - shown.length };
}

// D1 / D2 hero status (writer section 4); product-live.js refreshes it in the store's zone.
export const productStatus = (r, today) => isOut(r.releaseDate, today)
  ? `Out now. In store since ${fmtDate(r.releaseDate, today)}`
  : `In store ${fmtDate(r.releaseDate, today)}${r.prereleaseDate ? `. Prerelease ${fmtDate(r.prereleaseDate, today)}` : ''}`;

// "Legacy (Set 6)" -> "Legacy": the name the Likely-row note uses.
export const shortSet = (r) => r.name.replace(/\s*\(.*?\)\s*/g, '').replace(/^Booster Pack: /, '');
// Deck sets say "deck", the rest say "one" (D6).
export const holdCta = (r) => (r.unit === 'deck' ? 'Hold a deck for me' : 'Hold one for me');
// D10: "Celebrating this set: Star Trek Commander Party, Sat Nov 21, 2pm."
export const eventLine = (e, today) => `Celebrating this set: ${e.title}, ${DAY_SHORT[new Date(e.date + 'T12:00:00Z').getUTCDay()]} ${fmtDate(e.date, today)}, ${fmtTime(e.time)}.`;
