// Contact form: success / error panels from ?sent=contact or ?contact=error, and a "Sending..." state.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const q = new URLSearchParams(location.search);
  const sent = q.get('sent') === 'contact', failed = q.get('contact') === 'error';
  const ok = document.getElementById('contact-ok'), err = document.getElementById('contact-err');
  if (sent && ok) { form.hidden = true; ok.hidden = false; }
  if (failed && err) err.hidden = false;
  if (sent || failed) {
    const p = sent ? ok : err; requestAnimationFrame(() => p?.focus());
    try { history.replaceState(null, '', location.pathname + '#contact'); } catch { /* ignore */ }
  }
  form.addEventListener('submit', (e) => {
    const b = form.querySelector('button[type=submit]');
    if (b?.getAttribute('aria-disabled')) { e.preventDefault(); return; }
    if (b) { b.textContent = 'Sending...'; b.setAttribute('aria-disabled', 'true'); }
  });
})();
