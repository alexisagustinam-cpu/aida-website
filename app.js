(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-toggle');
  const dialog = document.querySelector('[data-dialog]');
  const closeDialog = () => dialog.close();

  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  const headerSentinel = document.querySelector('[data-header-sentinel]');
  if ('IntersectionObserver' in window && headerSentinel) {
    new IntersectionObserver(([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting), { threshold: 0 }).observe(headerSentinel);
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }));
  document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click', () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); dialog.showModal(); dialog.querySelector('input').focus(); }));
  document.querySelector('[data-close-dialog]').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  document.querySelectorAll('[data-contact-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => { const parent = field.closest('.field'); const empty = !field.value.trim(); parent.classList.toggle('is-invalid', empty); field.setAttribute('aria-invalid', String(empty)); valid &&= !empty; });
    const message = form.querySelector('[data-form-message]');
    message.textContent = valid ? 'La solicitud está lista para revisión, pero este formulario todavía no envía mensajes. Define el canal de recepción antes de usarlo en producción.' : 'Completa los campos indicados para continuar.';
  }));
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
  } else document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
})();
