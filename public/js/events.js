// Events page: game filter, today's marks, dates for each weekday, seats left, sign-up messages and checks.
// Everything works without this file (all rows show, seats "ask"); this only improves it.
import { zoned } from '/js/hours.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let tz = 'America/New_York';
try { tz = JSON.parse(document.getElementById('hours-data').textContent).tz; } catch { /* keep default */ }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    for (const tr of $$('tbody tr', sec)) { tr.toggleAttribute('data-today', today); $('[data-tonight-chip]', tr)?.toggleAttribute('hidden', !today); }
  }
  // Time order from today: today first, then the next six days (the page ships Wed..Tue for no-JS)
  const sheet = $('.sheet');
  if (sheet) for (const sec of $$('.day[data-day]').sort((a, b) => a.dataset.ahead - b.dataset.ahead)) sheet.append(sec);
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
  for (const r of $$('tbody tr[data-game], .ticket[data-game]')) {
    const out = g !== 'all' && r.dataset.game !== g;
    r.hidden = out || r.hasAttribute('data-past');
  }
  let weekly = 0;
  for (const sec of $$('.day')) {
    const rows = $$('tbody tr', sec), shown = rows.filter((r) => !r.hidden).length;
    weekly += shown;
    const table = $('table', sec), none = $('.day-none', sec);
    if (table) { table.hidden = rows.length > 0 && shown === 0; if (none) none.hidden = !(rows.length > 0 && shown === 0); }
  }
  const tickets = $$('.ticket[data-game]');
  const specialShown = tickets.filter((t) => !t.hidden).length;
  const sn = $('#special-none');
  if (sn && tickets.length) {
    sn.hidden = specialShown > 0;
    sn.textContent = g === 'all' ? 'No special nights on the calendar yet.' : `No ${label} special nights booked.`;
  }
  const none = $('#ev-none');
  if (none) { none.hidden = weekly > 0 || g === 'all'; none.textContent = weekly > 0 || g === 'all' ? '' : `No ${label} nights this week.`; }
}

async function seats() {
  const status = $('#su-seats'), sel = $('#su-event');
  if (!status || !sel) return;
  let map = null;
  try { const r = await fetch('/api/seats', { headers: { Accept: 'application/json' } }); if (r.ok) map = await r.json(); } catch { /* offline or no Worker */ }
  const say = () => {
    const left = map ? map[sel.value] : undefined;
    status.textContent = left === undefined ? 'Seats: ask' : left === 0 ? 'Full. You will join the waitlist.' : `Seats left: ${left}`;
  };
  sel.addEventListener('change', say);
  say();
}

function formState() {
  const form = $('#signup-form');
  if (!form) return;
  const q = new URLSearchParams(location.search);
  const sent = q.get('sent'), failed = q.get('signup') === 'error';
  const ok = $('#signup-ok'), wait = $('#signup-wait'), err = $('#signup-err');
  const panel = sent === 'signup' ? ok : sent === 'waitlist' ? wait : failed ? err : null;
  if (panel) {
    if (panel !== err) form.hidden = true;
    panel.hidden = false;
    requestAnimationFrame(() => panel.focus()); // after first layout, or the browser drops the focus
    try { history.replaceState(null, '', location.pathname + '#signup'); } catch { /* ignore */ }
  }

  const list = $('#signup-err-list'), server = $('#signup-err-server'), head = $('#signup-err-h');
  const rules = [
    ['su-event', 'Choose a night.', (el) => !!el.value],
    ['su-name', 'Enter your first name.', (el) => !!el.value.trim()],
    ['su-email', 'Enter a valid email.', (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())],
  ];
  const clear = () => { for (const f of $$('.field-err', form)) f.remove(); for (const el of $$('[aria-invalid]', form)) { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); } };

  form.addEventListener('submit', (e) => {
    const btn = $('button[type=submit]', form);
    if (btn.classList.contains('is-loading')) { e.preventDefault(); return; }
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
      head.append(s, ` fix ${bad.length} ${bad.length === 1 ? 'thing' : 'things'}.`);
      server.hidden = true; err.hidden = false; err.focus();
      return;
    }
    btn.textContent = 'Sending...'; btn.setAttribute('aria-disabled', 'true'); btn.classList.add('is-loading');
  });
  $('#signup-err-list').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) { e.preventDefault(); document.getElementById(a.hash.slice(1))?.focus(); }
  });
}

function run() { dated(); filter(); }
run();
seats();
formState();
document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
