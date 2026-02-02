/* assets/main.js */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', String(expanded));
      menu.classList.toggle('is-open', expanded);
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    });

    // Close menu on link click (mobile)
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (window.matchMedia('(min-width: 1024px)').matches) return;
      setExpanded(false);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (window.matchMedia('(min-width: 1024px)').matches) return;
      const isOpen = menu.classList.contains('is-open');
      if (!isOpen) return;
      if (e.target === toggle || toggle.contains(e.target) || menu.contains(e.target)) return;
      setExpanded(false);
    });
  }

  // Smooth scroll (for browsers without CSS smooth or when you want offset handling)
  // Keep it minimal: only intercept same-page anchors.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const header = document.querySelector('.site-header');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const y = window.scrollY + target.getBoundingClientRect().top - headerH - 10;

    window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
    history.pushState(null, '', href);
  });

  // Intersection Observer: lazy load images
  const lazyImages = Array.from(document.querySelectorAll('img.lazy[data-src]'));
  lazyImages.forEach(img => img.classList.add('is-loading'));

  const loadImg = (img) => {
    const src = img.getAttribute('data-src');
    if (!src) return;

    img.src = src;
    img.removeAttribute('data-src');

    const onLoad = () => {
      img.classList.remove('is-loading');
      img.classList.add('is-loaded');
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
    const onError = () => {
      img.classList.remove('is-loading');
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        loadImg(img);
        io.unobserve(img);
      });
    }, { root: null, rootMargin: '200px 0px', threshold: 0.01 });

    lazyImages.forEach(img => io.observe(img));
  } else {
    // Fallback
    lazyImages.forEach(loadImg);
  }

  // Reveal animations
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.section, .hero, .site-footer');
    revealTargets.forEach(el => el.classList.add('reveal'));

    const rio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          rio.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    revealTargets.forEach(el => rio.observe(el));
  }
})();
