// Pages preview only: forms do not send here.
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  let m = form.querySelector('.preview-msg');
  if (!m) {
    m = document.createElement('p');
    m.className = 'preview-msg';
    m.setAttribute('role', 'alert');
    m.tabIndex = -1;
    m.textContent = "Forms don't send in this preview. Nothing you typed was sent. Stop by the store or use the links on the Visit page instead.";
    form.append(m);
  }
  m.focus();
}, true);
