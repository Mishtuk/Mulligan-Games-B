// Client-side check for the request (Home, Shop), buylist (Sell) and contact (Visit) forms.
// Empty required fields or a bad email: no send; the form's error panel becomes a summary (links to each field),
// each field gets its own message tied with aria-describedby and aria-invalid, and the panel takes focus.
// Runs on document capture so it checks before the "Sending..." handlers on the form.
export const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
export const plural = (n) => `${n} ${n === 1 ? 'thing' : 'things'}`;

if (typeof document !== 'undefined') {
  const labelOf = (el) => {
    const l = el.closest('fieldset')?.querySelector('legend') ?? el.labels?.[0] ?? document.querySelector(`label[for="${el.id}"]`);
    const c = l.cloneNode(true);
    c.querySelectorAll('.hint').forEach((h) => h.remove());
    return c.textContent.replace(/\s*\(required\)/, '').replace(/\s+/g, ' ').trim();
  };
  const problems = (form) => {
    const out = [], seen = new Set();
    for (const el of form.querySelectorAll('[required]')) {
      if (el.closest('.hp') || seen.has(el.name + el.id) || (el.type === 'radio' && seen.has(el.name))) continue;
      if (el.type === 'radio') { seen.add(el.name); if (form.querySelector(`input[name="${el.name}"]:checked`)) continue; out.push([el, `${labelOf(el)}: choose one.`]); continue; }
      const v = el.value.trim();
      if (!v) out.push([el, `${labelOf(el)}: ${el.tagName === 'SELECT' ? 'choose one' : 'fill this in'}.`]);
      else if (el.type === 'email' && !emailOk(v)) out.push([el, `${labelOf(el)}: enter a valid email.`]);
    }
    return out;
  };
  const forms = [...document.querySelectorAll('#request-form, #buylist-form, #contact-form')];
  for (const form of forms) form.noValidate = true;
  const panelFor = (form) => document.getElementById(form.id.replace('-form', '-err'));
  const clear = (form) => {
    form.querySelectorAll('.field-err').forEach((n) => {
      const el = form.querySelector(`[aria-describedby~="${n.id}"]`);
      if (el) { const rest = el.getAttribute('aria-describedby').split(' ').filter((t) => t !== n.id).join(' '); rest ? el.setAttribute('aria-describedby', rest) : el.removeAttribute('aria-describedby'); }
      n.remove();
    });
    form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
  };
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!forms.includes(form)) return;
    clear(form);
    const bad = problems(form);
    if (!bad.length) return;
    e.preventDefault(); e.stopPropagation();
    const panel = panelFor(form);
    const list = document.createElement('ul'); list.className = 'err-list'; list.id = form.id + '-errs';
    for (const [el, msg] of bad) {
      const id = el.id || (el.id = `${form.id}-${el.name}`), note = document.createElement('p');
      note.className = 'field-err'; note.id = `${id}-err`; note.textContent = `Error: ${msg}`;
      (el.type === 'radio' ? el.closest('fieldset') : el).insertAdjacentElement(el.type === 'radio' ? 'beforeend' : 'afterend', note);
      el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), note.id].filter(Boolean).join(' '));
      const li = document.createElement('li'), a = document.createElement('a');
      a.href = `#${id}`; a.textContent = msg; li.append(a); list.append(li);
    }
    const h = document.createElement(panel.querySelector('h2') ? 'h2' : 'h3'), s = document.createElement('strong');
    s.textContent = 'Error:'; h.append(s, ` fix ${plural(bad.length)}.`);
    panel.replaceChildren(h, list);
    panel.hidden = false; panel.focus();
  }, true);
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('.form-msg.error a[href^="#"]');
    if (!a) return;
    const f = document.getElementById(a.hash.slice(1));
    if (f) { e.preventDefault(); f.focus(); }
  });
}
