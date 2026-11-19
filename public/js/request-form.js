// Card request form: success / error panels from ?sent=request or ?request=error, and a "Sending..." state.
(() => {
  const form = document.getElementById('request-form');
  if (!form) return;
  const q = new URLSearchParams(location.search);
  const sent = q.get('sent') === 'request', failed = q.get('request') === 'error';
  const ok = document.getElementById('request-ok'), err = document.getElementById('request-err');
  if (sent && ok) { form.hidden = true; ok.hidden = false; }
  if (failed && err) { err.hidden = false; }
  if (sent || failed) {
    const target = sent ? ok : err;
    target?.focus();
    try { history.replaceState(null, '', location.pathname + '#request'); } catch { /* ignore */ }
  }
  form.addEventListener('submit', (e) => {
    const b = form.querySelector('button[type=submit]');
    if (b?.classList.contains('is-loading')) { e.preventDefault(); return; }
    if (b) { b.textContent = 'Sending...'; b.setAttribute('aria-disabled', 'true'); b.classList.add('is-loading'); }
  });
})();
