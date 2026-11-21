// Buylist slip: add / remove rows, live "N lines" count, success and error panels from ?sent=buylist / ?buylist=error.
// The slip is server-rendered with 3 rows (JS trims it to 1) and works without this file. The Worker reads item_name[], item_set[], item_cond[], item_qty[].
import { showResult, guardSend } from './form-state.js';

export const MAX_ROWS = 40;

// A line counts when the card name has text. Blank rows are skipped by the Worker too.
export const countLines = (names) => names.filter((n) => String(n ?? '').trim() !== '').length;

// The total text: nothing until at least one card has a name.
export const totalText = (names) => { const n = countLines(names); return n ? `lines: ${n}` : ''; };

// Remove only shows when there is more than one row.
export const showRemove = (rowCount) => rowCount > 1;

// Which row gets focus after removing row `i` from a list that now has `remaining` rows: the one that took its place, else the last. -1 = none left.
export const focusAfterRemove = (i, remaining) => (remaining === 0 ? -1 : Math.min(i, remaining - 1));

if (typeof document !== 'undefined') {
  const form = document.getElementById('buylist-form');
  if (form) {
    const list = form.querySelector('.slip-rows'), add = document.getElementById('add-row'), total = document.getElementById('line-total');
    const rows = () => [...list.children];
    const names = () => rows().map((r) => r.querySelector('.slip-in').value);
    const refresh = () => {
      rows().forEach((r, i) => {
        r.setAttribute('aria-label', `Card ${i + 1}`);
        r.querySelector('.row-no').textContent = String(i + 1);
        const rm = r.querySelector('.row-remove');
        rm.hidden = !showRemove(rows().length);
        rm.setAttribute('aria-label', `Remove card ${i + 1}`);
      });
      const full = rows().length >= MAX_ROWS;
      add.disabled = full;
      add.textContent = full ? `Limit of ${MAX_ROWS} lines` : 'Add a row';
    };
    const announce = () => { total.textContent = totalText(names()); };

    // JS starts the slip at one row; the extra server rows are only for no-JS use.
    rows().slice(1).forEach((r) => { if (!r.querySelector('.slip-in').value.trim()) r.remove(); });
    add.hidden = false;
    refresh();
    announce();

    add.addEventListener('click', () => {
      if (rows().length >= MAX_ROWS) return;
      const row = rows()[0].cloneNode(true);
      row.querySelector('[id]')?.removeAttribute('id'); // the first row's id must stay unique
      row.querySelector('[required]')?.removeAttribute('required');
      for (const el of row.querySelectorAll('input')) el.value = el.type === 'number' ? '1' : '';
      row.querySelector('select').value = 'NM';
      list.append(row);
      refresh();
      announce();
      row.querySelector('.slip-in').focus();
    });
    list.addEventListener('click', (e) => {
      const rm = e.target.closest('.row-remove');
      if (!rm) return;
      const row = rm.closest('.slip-row'), i = rows().indexOf(row);
      if (rows().length === 1) { // never leave the slip empty: clear the row instead
        for (const el of row.querySelectorAll('input')) el.value = el.type === 'number' ? '1' : '';
        row.querySelector('select').value = 'NM';
        row.querySelector('.slip-in').focus();
      } else {
        row.remove();
        const next = focusAfterRemove(i, rows().length);
        rows()[next].querySelector('.slip-in').focus();
      }
      refresh();
      announce();
    });
    form.addEventListener('change', announce);

    showResult(form, 'buylist');
    guardSend(form);
  }
}
