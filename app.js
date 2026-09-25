// ─── Configuración del sitio ────────────────────────────────────────────────
// Completa estos datos antes de publicar. Los canales vacíos no se muestran.
// formEndpoint: URL que recibe el formulario por POST (JSON). Sirve un webhook
// de n8n/Make/Zapier, Formspree o una función propia. Si está vacío, el
// formulario abre WhatsApp (o el correo) con el mensaje ya redactado.
const SITE = {
  formEndpoint: '',
  // Link de tu tipo de evento en Cal.com. Con esto puesto, el formulario pasa
  // a un paso 2 con el calendario embebido y ya lleno con lo que la persona
  // escribió. Los identificadores de las preguntas de reserva en Cal.com
  // deben llamarse exactamente "negocio" y "servicio" (Advanced → Booking
  // Questions → Identificador) para que el prefill funcione.
  bookingUrl: 'https://cal.com/agustinmejias/diagnostico-gratuito',
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

  // Fondo oscuro detrás del menú en el teléfono (fuera del header, que tiene backdrop-filter).
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.append(backdrop);
  const setMenu = open => {
    menu.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Cerrar menú' : 'Abrir menú';
    nav.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
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
    // En el teléfono: nombre de la etapa, barra de avance y puntos bajo la fila de íconos.
    const caption = document.createElement('p');
    caption.className = 'flow-caption';
    caption.setAttribute('aria-hidden', 'true');
    const progress = document.createElement('div');
    progress.className = 'flow-progress';
    const dots = document.createElement('p');
    dots.className = 'swipe-hint';
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = tabs.map(() => '<i></i>').join('');
    flow.after(caption, progress);
    system.append(dots);
    const STAGE_MS = 6000;
    const canAutoplay = !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window;
    let current = 0;
    let timer = null;
    let stopped = !canAutoplay; // el usuario tomó el control: no volvemos a avanzar solos
    let inView = false;
    let paused = false;

    system.style.setProperty('--stage-duration', `${STAGE_MS}ms`);
    const select = (index, { focus = false } = {}) => {
      const previous = current;
      current = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        const active = i === current;
        tab.setAttribute('aria-selected', String(active));
        tab.classList.toggle('is-done', i < current);
        tab.tabIndex = active ? 0 : -1;
        panels[i].classList.toggle('is-off', !active);
        panels[i].inert = !active;
      });
      const panel = panels[current];
      panel.classList.remove('is-entering', 'from-prev');
      void panel.offsetWidth;
      panel.classList.add('is-entering');
      panel.classList.toggle('from-prev', current < previous && !(previous === tabs.length - 1 && current === 0));
      caption.innerHTML = `<b>${tabs[current].querySelector('b').textContent}</b><span>${tabs[current].querySelector('small').textContent}</span>`;
      caption.classList.remove('is-changing');
      void caption.offsetWidth;
      caption.classList.add('is-changing');
      progress.style.setProperty('--stage-color', getComputedStyle(tabs[current]).getPropertyValue('--stage-color'));
      [...dots.children].forEach((dot, i) => dot.classList.toggle('is-on', i === current));
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
    // En el teléfono se desliza el panel a los lados para cambiar de etapa.
    let touch = null;
    system.querySelector('.stage-panels').addEventListener('touchstart', event => {
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    system.querySelector('.stage-panels').addEventListener('touchend', event => {
      if (!touch) return;
      const dx = event.changedTouches[0].clientX - touch.x;
      const dy = event.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      stop();
      select(current + (dx < 0 ? 1 : -1));
      track('system_swipe', { stage: current + 1 });
    }, { passive: true });
    // Solo el mouse pausa el avance; en pantallas táctiles pointerleave no llega hasta tocar otra cosa.
    system.addEventListener('pointerenter', event => { if (event.pointerType !== 'mouse') return; paused = true; restartProgress(); });
    system.addEventListener('pointerleave', event => { if (event.pointerType !== 'mouse') return; paused = false; restartProgress(); });
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

  // ─── Cal.com: carga el embed oficial una sola vez, bajo un namespace propio
  // para no chocar con otro script que use Cal.com en la misma página.
  const CAL_NAMESPACE = 'aida-diagnostico';
  function loadCalApi() {
    if (window.Cal) return window.Cal;
    const globalCal = function (...args) {
      const api = globalCal;
      if (!api.loaded) {
        api.ns = {};
        api.q = api.q || [];
        const script = document.createElement('script');
        script.src = 'https://app.cal.com/embed/embed.js';
        document.head.appendChild(script);
        api.loaded = true;
      }
      if (args[0] === 'init') {
        const namespace = args[1];
        const inner = function (...innerArgs) { inner.q.push(innerArgs); };
        inner.q = [];
        if (typeof namespace === 'string') {
          api.ns[namespace] = api.ns[namespace] || inner;
          api.ns[namespace](...args);
          api.q.push(['initNamespace', namespace]);
        } else {
          api.q.push(args);
        }
        return;
      }
      api.q.push(args);
    };
    window.Cal = globalCal;
    return globalCal;
  }

  /** Convierte los datos del formulario en los query params que Cal.com usa
   * para prellenar su formulario de reserva. Los identificadores "negocio" y
   * "servicio" deben coincidir con los configurados en Cal.com. */
  function calPrefillParams(data) {
    return {
      name: data.name,
      email: data.email,
      attendeePhoneNumber: data.phone.replace(/[^\d+]/g, ''),
      notes: data.context,
      negocio: data.business,
      servicio: data.service,
    };
  }

  function calLinkFromUrl(url) {
    try {
      return new URL(url).pathname.replace(/^\/+/, '');
    } catch {
      return url.replace(/^https?:\/\/[^/]+\//, '');
    }
  }

  function mountBooking(data) {
    const container = document.querySelector('[data-booking-embed]');
    const fallback = document.querySelector('[data-booking-fallback]');
    const fallbackLink = document.querySelector('[data-booking-fallback-link]');
    const params = calPrefillParams(data);
    const calLink = calLinkFromUrl(SITE.bookingUrl);

    container.innerHTML = '<p class="booking-loading">Cargando el calendario…</p>';
    fallback.hidden = true;
    fallbackLink.href = `${SITE.bookingUrl}?${new URLSearchParams(params).toString()}`;

    // Si el script no carga en unos segundos (bloqueador, red, Cal.com caído),
    // se ofrece el mismo calendario, prellenado, en una pestaña aparte.
    const fallbackTimer = setTimeout(() => { fallback.hidden = false; }, 5000);

    // Cal.com agrega su iframe como hijo del contenedor sin quitar lo que
    // había antes: en cuanto aparece, se quita el texto "Cargando…" a mano.
    const removeLoadingText = () => container.querySelector('.booking-loading')?.remove();
    if ('MutationObserver' in window) {
      const ready = new MutationObserver(() => {
        if (container.querySelector('iframe')) { removeLoadingText(); ready.disconnect(); }
      });
      ready.observe(container, { childList: true });
    }

    const Cal = loadCalApi();
    Cal('init', CAL_NAMESPACE, { origin: 'https://cal.com' });
    Cal.ns[CAL_NAMESPACE]('inline', {
      elementOrSelector: container,
      calLink,
      config: { ...params, layout: 'month_view', locale: 'es' },
    });
    Cal.ns[CAL_NAMESPACE]('ui', {
      styles: { branding: { brandColor: '#164bd8' } },
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
    Cal.ns[CAL_NAMESPACE]('on', {
      action: 'linkReady',
      callback: () => { clearTimeout(fallbackTimer); fallback.hidden = true; removeLoadingText(); },
    });
    Cal.ns[CAL_NAMESPACE]('on', {
      action: 'bookingSuccessful',
      callback: () => track('generate_lead', { method: 'calendar', service: data.service }),
    });
  }

  // ─── Formulario ──────────────────────────────────────────────────────────
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const formMessage = contactForm.querySelector('.form-message');
    const submitButton = contactForm.querySelector('[data-form-submit]');
    const formPanel = document.querySelector('[data-form-panel]');
    const bookingStep = document.querySelector('[data-booking-step]');
    const bookingBack = document.querySelector('[data-booking-back]');
    const phoneInput = contactForm.elements.phone;
    const showMessage = (text, isError = false) => {
      formMessage.textContent = text;
      formMessage.classList.toggle('is-error', isError);
    };
    const isValidPhone = value => /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 8;
    phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));

    bookingBack?.addEventListener('click', () => {
      bookingStep.hidden = true;
      contactForm.hidden = false;
    });

    contactForm.addEventListener('submit', async event => {
      event.preventDefault();
      const phone = phoneInput.value.trim();
      phoneInput.setCustomValidity(phone && !isValidPhone(phone) ? 'Escribe un número de WhatsApp válido, con código de país.' : '');
      if (!contactForm.checkValidity()) {
        showMessage('Revisa los campos marcados para continuar.', true);
        contactForm.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(contactForm));
      if (data.website) return; // honeypot: solo lo completan los bots
      delete data.website;

      if (SITE.bookingUrl) {
        contactForm.hidden = true;
        bookingStep.hidden = false;
        bookingStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        mountBooking(data);
        track('booking_step_view', { service: data.service });
        return;
      }

      const summary = `Hola AIDA, soy ${data.name} de ${data.business}. Quiero un diagnóstico gratuito.\n\nMe interesa: ${data.service}\n${data.context}\n\nContacto: ${data.email} / ${data.phone}`;

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

  // ─── Barra fija de CTA en móvil ──────────────────────────────────────────
  const mobileCta = document.querySelector('[data-mobile-cta]');
  if (mobileCta && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let formVisible = false;
    const update = () => mobileCta.classList.toggle('is-visible', !heroVisible && !formVisible);
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; update(); })
      .observe(document.querySelector('#inicio'));
    new IntersectionObserver(entries => {
      formVisible = entries.some(entry => entry.isIntersecting);
      update();
    }, { rootMargin: '0px 0px -20% 0px' }).observe(document.querySelector('#formulario'));
    mobileCta.querySelector('.button').addEventListener('click', () => track('mobile_cta_click'));
  }

  // ─── Cifras animadas ─────────────────────────────────────────────────────
  const counters = [...document.querySelectorAll('.facts strong, .case-result strong')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  counters.forEach(el => {
    const match = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
    if (!match || reduceMotion || !('IntersectionObserver' in window)) return;
    const [, prefix, value, suffix] = match;
    const target = Number(value);
    el.classList.add('count');
    const run = () => {
      el.style.minWidth = `${el.getBoundingClientRect().width}px`; // evita saltos de layout
      const start = performance.now();
      const duration = 1400;
      const step = now => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(step);
      };
      el.textContent = `${prefix}0${suffix}`;
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      // Espera a que termine la animación de entrada del bloque.
      setTimeout(run, el.closest('.reveal') ? 250 : 0);
    }, { threshold: 0.6 });
    observer.observe(el);
  });

  // ─── Animaciones de entrada ──────────────────────────────────────────────
  const revealItems = [...document.querySelectorAll('.reveal')];
  const show = item => item.classList.add('is-visible');
  document.querySelectorAll('.stagger, .stagger-self').forEach(list => {
    [...list.children].forEach((child, i) => child.style.setProperty('--i', i));
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(show);
    return;
  }
  // Lo que entra a la vez aparece en cascada, en orden de lectura; lo que entra solo, sin esperar.
  const observer = new IntersectionObserver(entries => {
    entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left))
      .forEach((entry, i) => {
        entry.target.style.setProperty('--reveal-delay', `${Math.min(i * 90, 360)}ms`);
        show(entry.target);
        observer.unobserve(entry.target);
      });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
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

// ─── Rueda de proyectos ─────────────────────────────────────────────────────
// En escritorio la lista de proyectos se vuelve una rueda: en reposo los
// trabajos forman un anillo alrededor del título; al girar, el anillo se abre
// en un tambor vertical con un proyecto al frente y sus vecinos girando en
// perspectiva hacia arriba y abajo. Todo depende de un número, `turn`:
// 0 es el anillo, 1 es el tambor con el primer proyecto al frente, y cada
// entero siguiente es un proyecto más. En celular (o sin JS) queda el
// carrusel deslizable del HTML.
(() => {
  const root = document.querySelector('[data-works]');
  if (!root) return;
  const list = root.querySelector('.works-list');
  const cards = [...list.children];
  const count = cards.length;
  const last = count - 1;
  const desktop = matchMedia('(min-width: 900px) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  // Geometría: la tarjeta se mide contra el escenario; lo demás, contra la tarjeta.
  const CARD_H = 0.44;      // alto de la tarjeta del frente, del escenario
  const CARD_MAX_W = 0.4;   // … pero nunca más ancha que esto del escenario
  const CARD_RATIO = 4 / 3; // mismas proporciones que las fotos
  const STEP = 33;          // grados entre tarjetas en el tambor
  const DRUM = 2.22;        // radio del tambor, en altos de tarjeta
  const LENS = 2.7;         // distancia de perspectiva
  const RING_R = 1.14;      // radio del anillo
  const RING_MAX = 0.31;    // … pero el anillo cabe en el escenario
  const BOW = 1.82;         // el tambor se curva hacia la izquierda al alejarse del frente
  const CULL = 1.6;         // vecinos que vale la pena dibujar
  const WHEEL_UNITS = 700;  // delta de la ruedita que equivale a un proyecto
  const DRAG_UNITS = 380;   // píxeles arrastrados que equivalen a un proyecto
  const SETTLE = 140;       // pausa tras el último giro antes de asentarse
  const EASE = 0.12;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const rad = deg => (deg * Math.PI) / 180;
  const place = (ringDeg, drumDeg, ringR, drumR, bow, m) =>
    `translateX(${m * -bow * (1 - Math.cos(rad(drumDeg)))}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${-m * drumDeg}deg) translateZ(${m * drumR}px)`;

  let teardown = null;

  const mount = () => {
    const label = root.dataset.label || 'Proyectos';
    const stage = document.createElement('div');
    stage.className = 'works-stage';
    stage.tabIndex = 0;
    stage.setAttribute('aria-label', `${label}. Usa las flechas arriba y abajo para girar la rueda.`);
    const ring = document.createElement('p');
    ring.className = 'works-ring-label';
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = `<span>${label.replace(/\s*('\d+)$/, '<em>$1</em>')}</span>`;
    const front = document.createElement('p');
    front.className = 'works-front';
    front.setAttribute('aria-live', 'polite');
    const index = document.createElement('ol');
    index.className = 'works-index';
    const hint = document.createElement('p');
    hint.className = 'works-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Gira con la rueda del mouse o arrastra ↓';

    const faces = cards.map(card => {
      const img = card.querySelector('img');
      const face = document.createElement('span');
      face.className = 'work-face';
      img.before(face);
      face.append(img);
      img.sizes = '44vw';
      img.loading = 'eager';
      return face;
    });
    const buttons = cards.map((card, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = card.dataset.title;
      b.addEventListener('click', () => to(i + 1));
      li.append(b);
      index.append(li);
      return b;
    });

    list.before(stage);
    stage.append(list);
    root.append(ring, front, index, hint);
    root.classList.add('is-wheel');

    let turn = 0, target = 0, active = -1, frame = 0, settling = 0;
    let g = {};

    const measure = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
      const cardH = cardW / CARD_RATIO;
      const ringR = Math.min(cardH * RING_R, h * RING_MAX);
      g = {
        w, cardW, cardH, ringR, drumR: cardH * DRUM, bow: cardH * BOW,
        ringScale: clamp((((2 * Math.PI * ringR) / count) * 0.82) / cardW, 0.16, 1),
      };
      stage.style.perspective = `${cardH * LENS}px`;
      cards.forEach(card => {
        card.style.width = `${cardW}px`;
        card.style.height = `${cardH}px`;
        card.style.marginLeft = `${-cardW / 2}px`;
        card.style.marginTop = `${-cardH / 2}px`;
      });
      ring.style.fontSize = `${clamp(ringR * 0.17, 26, 52)}px`;
      front.style.maxWidth = `${Math.max(160, (w - cardW) / 2 - w * 0.05 - 36)}px`;
      front.querySelector('b')?.style.setProperty('font-size', `${clamp(cardH * 0.11, 26, 46)}px`);
    };

    const setActive = i => {
      if (i === active) return;
      active = i;
      const card = cards[i];
      front.innerHTML = `<i>${String(i + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}</i><b></b><span></span>`;
      front.querySelector('b').textContent = card.dataset.title;
      front.querySelector('span').textContent = card.dataset.meta;
      front.querySelector('b').style.fontSize = `${clamp(g.cardH * 0.11, 26, 46)}px`;
      buttons.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target - turn;
      if (Math.abs(gap) < 0.0005) turn = target;
      else turn += gap * (reduced.matches ? 1 : EASE);
      const m = clamp(turn, 0, 1);
      const pos = Math.max(0, turn - 1);
      list.style.transform = `translateZ(${-m * g.drumR}px)`;
      cards.forEach((card, i) => {
        const d = i - pos;
        card.style.transform = place(d * (360 / count), d * STEP, g.ringR, g.drumR, g.bow, m);
        const hidden = m > 0.5 && Math.abs(d) > CULL;
        card.style.opacity = hidden ? '0' : '1';
        card.style.pointerEvents = hidden ? 'none' : '';
        faces[i].style.transform = `scale(${g.ringScale + (1 - g.ringScale) * m})`;
      });
      ring.style.opacity = String(1 - m);
      hint.style.opacity = String(1 - m);
      front.style.opacity = String(m);
      setActive(clamp(Math.round(pos), 0, last));
    };

    const to = next => { target = clamp(next, 0, last + 1); };

    // La ruedita solo gira la rueda mientras el escenario está completo en
    // pantalla y todavía tiene a dónde ir; en los extremos la página sigue.
    const inView = () => {
      const r = stage.getBoundingClientRect();
      return r.top > -r.height * 0.12 && r.bottom < innerHeight + r.height * 0.12;
    };
    const onWheel = event => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || !inView()) return;
      const next = target + event.deltaY / WHEEL_UNITS;
      if (next <= 0 || next >= last + 1) return;
      event.preventDefault();
      to(next);
      clearTimeout(settling);
      settling = setTimeout(() => to(Math.round(target)), SETTLE);
    };

    let dragY = null, moved = 0;
    const onDown = event => {
      if (event.button !== 0 || event.target.closest('.works-index')) return;
      dragY = event.clientY; moved = 0;
      stage.setPointerCapture(event.pointerId);
    };
    const onMove = event => {
      if (dragY === null) return;
      moved += Math.abs(dragY - event.clientY);
      to(target + (dragY - event.clientY) / DRAG_UNITS);
      dragY = event.clientY;
    };
    const onUp = event => {
      if (dragY === null) return;
      dragY = null;
      if (moved < 6) {
        // Un clic en el anillo abre la rueda en ese proyecto; en el tambor, lo trae al frente.
        const card = document.elementsFromPoint(event.clientX, event.clientY).find(el => el.classList?.contains('work'));
        const i = cards.indexOf(card);
        if (i >= 0) to(i + 1);
        else if (target < 1) to(1);
        return;
      }
      if (target > 1) to(Math.round(target));
      else if (target > 0) to(target > 0.35 ? 1 : 0);
    };
    const onKey = event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') to(Math.round(target) + 1);
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') to(Math.round(target) - 1);
      else if (event.key === 'Home') to(0);
      else if (event.key === 'End') to(last + 1);
      else return;
      event.preventDefault();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('keydown', onKey);
    // Solo anima mientras la sección está cerca de la pantalla.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) frame = requestAnimationFrame(draw);
    }, { rootMargin: '200px 0px' });
    io.observe(root);
    draw();

    teardown = () => {
      cancelAnimationFrame(frame); clearTimeout(settling); ro.disconnect(); io.disconnect();
      stage.replaceWith(list);
      [ring, front, index, hint].forEach(el => el.remove());
      root.classList.remove('is-wheel');
      list.style.transform = '';
      cards.forEach((card, i) => {
        card.removeAttribute('style');
        const img = faces[i].querySelector('img');
        img.sizes = '(max-width: 760px) 82vw, 44vw';
        faces[i].replaceWith(img);
      });
      teardown = null;
    };
  };

  const sync = () => {
    if (desktop.matches && !teardown) mount();
    else if (!desktop.matches && teardown) teardown();
  };
  desktop.addEventListener('change', sync);
  sync();
})();

// ─── Preguntas frecuentes: abrir y cerrar con suavidad ──────────────────────
// <details> abre de golpe; aquí se anima la altura de la fila entre cerrada y
// abierta. Sin JS o con movimiento reducido queda el comportamiento nativo.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return;
  document.querySelectorAll('.faq details').forEach(details => {
    const summary = details.querySelector('summary');
    let animation = null;
    const run = (from, to, done) => {
      animation?.cancel();
      details.style.overflow = 'hidden';
      animation = details.animate({ height: [`${from}px`, `${to}px`] }, { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      animation.onfinish = () => { animation = null; details.style.overflow = ''; done?.(); };
    };
    summary.addEventListener('click', event => {
      event.preventDefault();
      const start = details.offsetHeight;
      const closing = details.open && !details.classList.contains('is-closing');
      if (closing) {
        details.classList.add('is-closing');
        run(start, summary.offsetHeight + 1, () => { details.open = false; details.classList.remove('is-closing'); });
      } else {
        details.classList.remove('is-closing');
        details.open = true;
        run(start, details.offsetHeight);
      }
    });
  });
})();
