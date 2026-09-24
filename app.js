(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-toggle');
  const dialog = document.querySelector('[data-dialog]');
  const closeDialog = () => dialog.close();
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 8), { passive: true });
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); nav.classList.toggle('is-open', !open); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }));
  document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click', () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); dialog.showModal(); dialog.querySelector('[data-close-dialog]').focus(); }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', closeDialog));
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 }); document.querySelectorAll('.reveal').forEach(item => observer.observe(item)); } else document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
})();
