// Buylist slip: add / remove rows, live "N lines" count, success and error panels from ?sent=buylist / ?buylist=error.
// The slip is server-rendered with 5 rows and works without this file. The Worker reads item_name[], item_set[], item_cond[], item_qty[].
export const MAX_ROWS = 40;

// A line counts when the card name has text. Blank rows are skipped by the Worker too.
export const countLines = (names) => names.filter((n) => String(n ?? '').trim() !== '').length;
export const linesText = (n) => `${n} ${n === 1 ? 'line' : 'lines'}`;

// Which row gets focus after removing row `i` from a list that now has `remaining` rows: the one that took its place, else the last. -1 = none left.
export const focusAfterRemove = (i, remaining) => (remaining === 0 ? -1 : Math.min(i, remaining - 1));

export const stateFromQuery = (search) => {
  const q = new URLSearchParams(search);
  return q.get('sent') === 'buylist' ? 'sent' : q.get('buylist') === 'error' ? 'error' : null;
};

if (typeof document !== 'undefined') {
  const form = document.getElementById('buylist-form');
  if (form) {
    const list = form.querySelector('.slip-rows'), add = document.getElementById('add-row'), count = document.getElementById('line-count');
    const rows = () => [...list.children];
    const names = () => rows().map((r) => r.querySelector('[name="item_name[]"]').value);
    const refresh = () => {
      rows().forEach((r, i) => {
        r.setAttribute('aria-label', `Card ${i + 1}`);
        r.querySelector('.row-no').textContent = String(i + 1);
        const rm = r.querySelector('.row-remove');
        rm.hidden = false;
        rm.setAttribute('aria-label', `Remove card ${i + 1}`);
      });
      const full = rows().length >= MAX_ROWS;
      add.disabled = full;
      add.textContent = full ? `Limit of ${MAX_ROWS} lines` : 'Add a row';
    };
    const announce = () => { count.textContent = linesText(countLines(names())); };

    add.hidden = false;
    refresh();
    announce();

    add.addEventListener('click', () => {
      if (rows().length >= MAX_ROWS) return;
      const row = rows()[0].cloneNode(true);
      row.querySelector('[id]')?.removeAttribute('id'); // the first row's id must stay unique
      row.querySelector('[required]')?.removeAttribute('required');
      for (const el of row.querySelectorAll('input')) el.value = el.name === 'item_qty[]' ? '1' : '';
      row.querySelector('select').value = 'NM';
      list.append(row);
      refresh();
      announce();
      row.querySelector('[name="item_name[]"]').focus();
    });
    list.addEventListener('click', (e) => {
      const rm = e.target.closest('.row-remove');
      if (!rm) return;
      const row = rm.closest('.slip-row'), i = rows().indexOf(row);
      if (rows().length === 1) { // never leave the slip empty: clear the row instead
        for (const el of row.querySelectorAll('input')) el.value = el.name === 'item_qty[]' ? '1' : '';
        row.querySelector('select').value = 'NM';
        row.querySelector('[name="item_name[]"]').focus();
      } else {
        row.remove();
        const next = focusAfterRemove(i, rows().length);
        rows()[next].querySelector('[name="item_name[]"]').focus();
      }
      refresh();
      announce();
    });
    form.addEventListener('change', announce);

    // Result panels
    const state = stateFromQuery(location.search);
    const ok = document.getElementById('buylist-ok'), err = document.getElementById('buylist-err');
    if (state === 'sent' && ok) { form.hidden = true; ok.hidden = false; ok.focus(); }
    if (state === 'error' && err) { err.hidden = false; err.focus(); }
    if (state) { try { history.replaceState(null, '', location.pathname + '#buylist'); } catch { /* ignore */ } }

    form.addEventListener('submit', (e) => {
      const b = form.querySelector('button[type=submit]');
      if (b?.getAttribute('aria-disabled')) { e.preventDefault(); return; }
      if (b) { b.textContent = 'Sending...'; b.setAttribute('aria-disabled', 'true'); }
    });
  }
}
