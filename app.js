(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-toggle');
  const dialog = document.querySelector('[data-dialog]');
  const closeDialog = () => dialog.close();

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    const headerObserver = new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, { threshold: 0.05 });
    headerObserver.observe(document.querySelector('#inicio'));
  }

  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  }));

  document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    dialog.showModal();
    dialog.querySelector('[data-close-dialog]').focus();
  }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', closeDialog));
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const formMessage = contactForm.querySelector('.form-message');
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        formMessage.textContent = 'Completa los campos obligatorios para continuar.';
        formMessage.classList.add('is-error');
        contactForm.reportValidity();
        return;
      }
      formMessage.textContent = 'Gracias. El formulario está listo para conectarse al canal de recepción de AIDA.';
      formMessage.classList.remove('is-error');
    });
  }

  const revealItems = [...document.querySelectorAll('.reveal')];
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min((index % 5) * 65, 260)}ms`);
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach(item => observer.observe(item));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('.hero .reveal').forEach(item => item.classList.add('is-visible'));
    }));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  // Some browsers do not dispatch IntersectionObserver for positioned children
  // during fast scrolls. This tiny fallback keeps visual content discoverable.
  const revealInViewport = () => revealItems.forEach(item => {
    if (item.classList.contains('is-visible')) return;
    const rect = item.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight * 1.05) item.classList.add('is-visible');
  });
  addEventListener('scroll', revealInViewport, { passive: true });
  addEventListener('resize', revealInViewport, { passive: true });
  requestAnimationFrame(revealInViewport);
})();
