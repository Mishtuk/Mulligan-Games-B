// /shop/?hold=<release-id>: fill the want list for a release. The id is only a key into the pockets built from releases.json;
// the text comes from the page's own data attributes, never from the query string.
export const holdFor = (search, holds) => {
  const id = new URLSearchParams(search).get('hold');
  return holds.find((h) => h.dataset.hold === id) ?? null;
};
export const GENERIC = 'Write the set you want held in the cards box below.';
if (typeof document !== 'undefined') {
  const id = new URLSearchParams(location.search).get('hold');
  const h = holdFor(location.search, [...document.querySelectorAll('[data-hold]')]);
  const cards = document.getElementById('req-cards'), game = document.getElementById('req-game');
  // A known set fills the box; a set no longer shown (old bookmark) gets the generic line and the cursor, nothing prefilled.
  if (id && cards && game && !cards.value) {
    const note = document.getElementById('req-hold');
    if (h) {
      cards.value = h.dataset.line;
      if ([...game.options].some((o) => o.value === h.dataset.game)) game.value = h.dataset.game;
    }
    // Say it and put the cursor there: focus reads the label plus this line (name is the page's own text, set as text).
    note.textContent = h ? `Hold for ${h.dataset.name} filled in. Add your name and email.` : GENERIC; note.hidden = false;
    cards.setAttribute('aria-describedby', 'req-hold ' + cards.getAttribute('aria-describedby'));
    requestAnimationFrame(() => cards.focus());
  }
}
