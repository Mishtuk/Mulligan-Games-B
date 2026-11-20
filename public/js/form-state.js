// Shared form helpers: ?sent=x / ?x=error result panels, the "Sending..." lock, JSON data blocks. No document access at load.
export const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
export const plural = (n) => `${n} ${n === 1 ? 'thing' : 'things'}`;

// ?sent=<name> -> 'ok'; ?<name>=error -> 'err'. `sent` maps other ?sent= values to a panel suffix.
function resultFromQuery(search, name, sent = { [name]: 'ok' }) {
  const q = new URLSearchParams(search);
  return sent[q.get('sent')] ?? (q.get(name) === 'error' ? 'err' : null);
}

// Shows #<name>-<ok|wait|err> (hides the form unless an error), focuses it, swaps the query for #<name>.
export function showResult(form, name, sent) {
  const key = resultFromQuery(location.search, name, sent), panel = key && document.getElementById(`${name}-${key}`);
  if (!panel) return null;
  if (key !== 'err') form.hidden = true;
  panel.hidden = false;
  requestAnimationFrame(() => panel.focus());
  try { history.replaceState(null, '', `${location.pathname}#${name}`); } catch { /* ignore */ }
  return key;
}

// False when a send is already under way (cancel the submit).
export function startSending(form) {
  const b = form.querySelector('button[type=submit]');
  if (b?.getAttribute('aria-disabled')) return false;
  if (b) { b.textContent = 'Sending...'; b.setAttribute('aria-disabled', 'true'); }
  return true;
}
export const guardSend = (form) => form.addEventListener('submit', (e) => { if (!startSending(form)) e.preventDefault(); });

export const readJson = (id) => { try { return JSON.parse(document.getElementById(id)?.textContent ?? 'null'); } catch { return null; } };
