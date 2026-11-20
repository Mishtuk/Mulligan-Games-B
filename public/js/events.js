// Events page: game filter, today's marks, dates for each weekday, seats left, sign-up messages and checks.
// Everything works without this file (all rows show, seats "ask"); this only improves it.
import { zoned } from '/js/hours.js';
import { emailOk, plural, showResult, startSending, readJson } from '/js/form-state.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const tz = readJson('hours-data')?.tz ?? 'America/New_York';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

let reordered = false;
function dated() {
  const z = zoned(tz), [y, m, d] = z.date.split('-').map(Number);
  for (const sec of $$('.day[data-day]')) {
    const ahead = (Number(sec.dataset.day) - z.day + 7) % 7;
    const t = new Date(Date.UTC(y, m - 1, d + ahead));
    const el = $('[data-day-date]', sec);
    el.textContent = `${ahead === 0 ? 'Today' : DOW[t.getUTCDay()]} ${MONTHS[t.getUTCMonth()]} ${t.getUTCDate()}`;
    el.hidden = false;
    sec.dataset.ahead = ahead;
    const today = ahead === 0;
    sec.toggleAttribute('data-today', today);
    for (const tr of $$('tbody tr', sec)) { tr.toggleAttribute('data-today', today); }
  }
  // Time order from today: today first, then the next six days (the page ships Wed..Tue for no-JS)
  const sheet = $('.sheet');
  if (sheet) for (const sec of $$('.day[data-day]').sort((a, b) => a.dataset.ahead - b.dataset.ahead)) sheet.append(sec);
  // The browser scrolled to #wednesday etc. before the reorder moved it: scroll again (the .day scroll-margin clears the sticky header)
  if (!reordered && sheet && /^#[a-z]+$/.test(location.hash)) document.querySelector(`.day${location.hash}`)?.scrollIntoView();
  reordered = true;
  // Special nights already past (the page may be older than the visit)
  for (const li of $$('.ticket[data-date]')) {
    li.toggleAttribute('data-past', li.dataset.date < z.date);
    if (li.dataset.date === z.date) li.setAttribute('data-today', '');
  }
}

function filter() {
  const game = new URLSearchParams(location.search).get('game') || 'all';
  const known = $$('[data-filter]').some((c) => c.dataset.filter === game);
  const g = known ? game : 'all';
  for (const c of $$('[data-filter]')) { if (c.dataset.filter === g) c.setAttribute('aria-current', 'page'); else c.removeAttribute('aria-current'); }
  const label = $(`[data-filter="${g}"]`)?.textContent ?? '';
  // A game with no weekly night shows the whole sheet instead (what is on), with a line above saying so.
  const rows = $$('tbody tr[data-game]');
  const empty = g !== 'all' && !rows.some((r) => r.dataset.game === g && !r.hasAttribute('data-past'));
  const eff = empty ? 'all' : g;
  for (const r of $$('tbody tr[data-game], .ticket[data-game]')) {
    r.hidden = (eff !== 'all' && r.dataset.game !== eff) || r.hasAttribute('data-past');
  }
  // Filtered: a day with no shown rows is hidden (closed days too).
  let weekly = 0;
  for (const sec of $$('.day')) {
    const shown = $$('tbody tr', sec).filter((r) => !r.hidden).length;
    weekly += shown;
    sec.hidden = eff !== 'all' && shown === 0;
  }
  const tickets = $$('.ticket[data-game]');
  const specialShown = tickets.filter((t) => !t.hidden).length;
  const sn = $('#special-none');
  if (sn && tickets.length) {
    sn.hidden = specialShown > 0;
    sn.textContent = g === 'all' ? 'No special nights on the calendar yet.' : `No ${label} special nights booked.`;
  }
  const on = [...new Set(rows.map((r) => r.dataset.game))].map((id) => $(`[data-filter="${id}"]`)?.textContent).filter(Boolean).join(', ');
  const none = $('#ev-none');
  if (none) {
    none.hidden = !empty;
    none.textContent = '';
    if (empty) {
      none.append(`No ${label} nights listed. On instead: ${on}. `);
      const ask = document.createElement('a'), vh = document.createElement('span');
      ask.href = '/visit/#contact'; ask.textContent = 'Ask us';
      vh.className = 'vh'; vh.textContent = ` about ${label}`;
      ask.append(vh); none.append(ask);
    }
  }
  // Spoken result: a live region that is always in the page; filled a beat after load so it is announced.
  const say = $('#ev-status');
  if (say) { const msg = g === 'all' ? '' : empty ? `No ${label} nights listed. Showing what is on instead: ${on}. Ask us about ${label}.` : `${weekly} ${label} ${weekly === 1 ? 'night' : 'nights'} this week`; setTimeout(() => { say.textContent = msg; }, 250); }
}

async function seats() {
  const status = $('#su-seats'), sel = $('#su-event');
  if (!status || !sel) return;
  let map = null;
  try { const r = await fetch('/api/seats', { headers: { Accept: 'application/json' } }); if (r.ok) map = await r.json(); } catch { /* offline or no Worker */ }
  const say = () => {
    const left = map ? map[sel.value] : undefined;
    status.textContent = left === undefined ? 'Seats: ask at the counter' : left === 0 ? 'Full. You will join the waitlist.' : `Seats left: ${left}`;
  };
  sel.addEventListener('change', say);
  say();
}

// The sign-up list is seeded by hand: drop nights that have already passed (store zone) and say so honestly when none are left.
function pruneNights() {
  const sel = $('#su-event'), form = $('#signup-form');
  if (!sel || !form) return;
  const today = zoned(tz).date;
  for (const o of $$('option[data-date]', sel)) if (o.dataset.date < today) o.remove();
  const none = sel.options.length === 0;
  form.hidden = none;
  const msg = $('#signup-empty');
  if (msg) msg.hidden = !none;
}

function formState() {
  const form = $('#signup-form');
  if (!form) return;
  showResult(form, 'signup', { signup: 'ok', waitlist: 'wait' });

  const list = $('#signup-err-list'), server = $('#signup-err-server'), head = $('#signup-err-h'), err = $('#signup-err');
  const rules = [
    ['su-event', 'Choose a night.', (el) => !!el.value],
    ['su-name', 'Enter your first name.', (el) => !!el.value.trim()],
    ['su-email', 'Enter a valid email.', (el) => emailOk(el.value)],
  ];
  const clear = () => { for (const f of $$('.field-err', form)) f.remove(); for (const el of $$('[aria-invalid]', form)) { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); } };

  form.addEventListener('submit', (e) => {
    clear();
    const bad = rules.filter(([id, , ok2]) => !ok2(document.getElementById(id)));
    if (bad.length) {
      e.preventDefault();
      list.textContent = '';
      for (const [id, msg] of bad) {
        const el = document.getElementById(id), p = document.createElement('p');
        p.className = 'field-err'; p.id = `${id}-err`; p.textContent = `Error: ${msg}`;
        el.after(p); el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id);
        const li = document.createElement('li'), a = document.createElement('a');
        a.href = `#${id}`; a.textContent = msg; li.append(a); list.append(li);
      }
      head.textContent = '';
      const s = document.createElement('strong'); s.textContent = 'Error:';
      head.append(s, ` ${plural(bad.length)} to check.`);
      server.hidden = true; err.hidden = false; err.focus();
      return;
    }
    if (!startSending(form)) e.preventDefault();
  });
  $('#signup-err-list').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) { e.preventDefault(); document.getElementById(a.hash.slice(1))?.focus(); }
  });
}

function run() { dated(); filter(); }
run();
pruneNights();
seats();
formState();
document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
