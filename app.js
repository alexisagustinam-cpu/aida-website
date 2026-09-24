// ─── Configuración del sitio ────────────────────────────────────────────────
// Completa estos datos antes de publicar. Los canales vacíos no se muestran.
// formEndpoint: URL que recibe el formulario por POST (JSON). Sirve un webhook
// de n8n/Make/Zapier, Formspree o una función propia. Si está vacío, el
// formulario abre WhatsApp (o el correo) con el mensaje ya redactado.
const SITE = {
  formEndpoint: '',
  bookingUrl: '', // agenda online (Cal.com, Calendly…), ej. 'https://cal.com/aida/diagnostico'
  whatsapp: '',   // solo dígitos con código de país, ej. '593991234567'
  email: '',      // ej. 'hola@aida.com'
  instagram: '',  // URL completa
  linkedin: '',   // URL completa
};

window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.menu-toggle');
  const menuLabel = menu.querySelector('[data-menu-label]');

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  const track = (name, data = {}) => {
    window.va?.('event', { name, ...data });
    (window.dataLayer = window.dataLayer || []).push({ event: name, ...data });
  };

  // ─── Canales de contacto ─────────────────────────────────────────────────
  const whatsappUrl = text => `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  const channels = [
    SITE.whatsapp && { label: 'WhatsApp', href: whatsappUrl('Hola AIDA, quiero hablar de un proyecto.') },
    SITE.email && { label: SITE.email, href: `mailto:${SITE.email}` },
    SITE.instagram && { label: 'Instagram', href: SITE.instagram },
    SITE.linkedin && { label: 'LinkedIn', href: SITE.linkedin },
  ].filter(Boolean);

  if (channels.length) {
    document.querySelectorAll('[data-contact-links]').forEach(list => {
      list.innerHTML = '';
      channels.forEach(({ label, href }) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        if (href.startsWith('http')) { link.target = '_blank'; link.rel = 'noopener'; }
        item.append(link);
        list.append(item);
      });
      list.hidden = false;
    });
  }
  if (SITE.bookingUrl) {
    document.querySelectorAll('[data-booking-link]').forEach(link => {
      link.href = SITE.bookingUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.hidden = false;
      link.addEventListener('click', () => track('booking_click'));
    });
  }
  if (SITE.whatsapp) {
    document.querySelectorAll('[data-whatsapp-link]').forEach(link => {
      link.href = whatsappUrl('Hola AIDA, quiero hablar de un proyecto.');
      link.target = '_blank';
      link.rel = 'noopener';
      link.hidden = false;
      link.addEventListener('click', () => track('whatsapp_click'));
    });
  }

  // ─── Cabecera y menú ─────────────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, { threshold: 0.05 }).observe(document.querySelector('#inicio'));
  }

  const setMenu = open => {
    menu.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    nav.classList.toggle('is-open', open);
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (nav.classList.contains('is-open') && !header.contains(event.target)) setMenu(false);
  });

  // ─── Sistema: recorrido por etapas ───────────────────────────────────────
  const system = document.querySelector('[data-system]');
  if (system) {
    const tabs = [...system.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const flow = system.querySelector('.flow');
    const STAGE_MS = 6000;
    const canAutoplay = !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window;
    let current = 0;
    let timer = null;
    let stopped = !canAutoplay; // el usuario tomó el control: no volvemos a avanzar solos
    let inView = false;
    let paused = false;

    system.style.setProperty('--stage-duration', `${STAGE_MS}ms`);
    const select = (index, { focus = false } = {}) => {
      current = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        const active = i === current;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      const panel = panels[current];
      panel.classList.remove('is-entering');
      void panel.offsetWidth;
      panel.classList.add('is-entering');
      // Centra la pestaña activa en móvil sin mover la página verticalmente.
      const tab = tabs[current];
      if (flow.scrollWidth > flow.clientWidth) {
        flow.scrollTo({ left: tab.offsetLeft - (flow.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
      }
      if (focus) tab.focus();
      restartProgress();
    };
    const restartProgress = () => {
      system.classList.remove('is-playing');
      clearTimeout(timer);
      if (stopped || !inView || paused) return;
      void system.offsetWidth;
      system.classList.add('is-playing');
      timer = setTimeout(() => select(current + 1), STAGE_MS);
    };
    const stop = () => { stopped = true; restartProgress(); };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { stop(); select(i); track('system_stage', { stage: i + 1 }); });
      tab.addEventListener('keydown', event => {
        const keys = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
        if (!(event.key in keys)) return;
        event.preventDefault();
        stop();
        select(keys[event.key], { focus: true });
      });
    });
    system.addEventListener('pointerenter', () => { paused = true; restartProgress(); });
    system.addEventListener('pointerleave', () => { paused = false; restartProgress(); });
    system.addEventListener('focusin', () => { paused = true; restartProgress(); });
    system.addEventListener('focusout', () => { paused = false; restartProgress(); });
    if (canAutoplay) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        restartProgress();
      }, { threshold: 0.45 }).observe(system);
    }
    select(0);
  }

  // ─── Formulario ──────────────────────────────────────────────────────────
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const formMessage = contactForm.querySelector('.form-message');
    const submitButton = contactForm.querySelector('[type="submit"]');
    const channelInput = contactForm.elements.channel;
    const showMessage = (text, isError = false) => {
      formMessage.textContent = text;
      formMessage.classList.toggle('is-error', isError);
    };
    const isValidChannel = value => {
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      const phone = /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 8;
      return email || phone;
    };
    channelInput.addEventListener('input', () => channelInput.setCustomValidity(''));

    contactForm.addEventListener('submit', async event => {
      event.preventDefault();
      const value = channelInput.value.trim();
      channelInput.setCustomValidity(value && !isValidChannel(value) ? 'Escribe un número de WhatsApp o un correo válido.' : '');
      if (!contactForm.checkValidity()) {
        showMessage('Revisa los campos marcados para continuar.', true);
        contactForm.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(contactForm));
      if (data.website) return; // honeypot: solo lo completan los bots
      delete data.website;
      const summary = `Hola AIDA, soy ${data.name} de ${data.business}. Quiero un diagnóstico gratuito.\n\nMe interesa: ${data.service}\n${data.context}\n\nContacto: ${data.channel}`;

      if (SITE.formEndpoint) {
        submitButton.disabled = true;
        showMessage('Enviando…');
        try {
          const response = await fetch(SITE.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...data, page: location.href, submittedAt: new Date().toISOString() }),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          contactForm.reset();
          showMessage('¡Gracias! Recibimos tu mensaje y te contactaremos pronto.');
          track('generate_lead', { method: 'form' });
        } catch {
          showMessage(SITE.whatsapp || SITE.email
            ? 'No pudimos enviar el formulario. Escríbenos directamente por los canales de contacto.'
            : 'No pudimos enviar el formulario. Inténtalo de nuevo en unos minutos.', true);
        } finally {
          submitButton.disabled = false;
        }
      } else if (SITE.whatsapp) {
        window.open(whatsappUrl(summary), '_blank', 'noopener');
        showMessage('Abrimos WhatsApp con tu mensaje listo. Solo tienes que enviarlo.');
        track('generate_lead', { method: 'whatsapp' });
      } else if (SITE.email) {
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Diagnóstico: ${data.business}`)}&body=${encodeURIComponent(summary)}`;
        showMessage('Abrimos tu correo con el mensaje listo. Solo tienes que enviarlo.');
        track('generate_lead', { method: 'email' });
      } else {
        showMessage('El formulario todavía no está conectado. Por favor, vuelve a intentarlo pronto.', true);
        console.warn('AIDA: configura SITE.formEndpoint, SITE.whatsapp o SITE.email en app.js');
      }
    });
  }

  // ─── Animaciones de entrada ──────────────────────────────────────────────
  const revealItems = [...document.querySelectorAll('.reveal')];
  const show = item => item.classList.add('is-visible');
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min((index % 5) * 65, 260)}ms`);
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(show);
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      show(entry.target);
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
  revealItems.forEach(item => observer.observe(item));

  // Algunos navegadores no disparan IntersectionObserver en scrolls muy rápidos.
  // Respaldo con un solo cálculo por frame que se desactiva al terminar.
  let pending = false;
  const revealInViewport = () => {
    pending = false;
    const hidden = revealItems.filter(item => !item.classList.contains('is-visible'));
    if (!hidden.length) {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      return;
    }
    hidden.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight * 1.05) show(item);
    });
  };
  const schedule = () => {
    if (!pending) { pending = true; requestAnimationFrame(revealInViewport); }
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  schedule();
})();
