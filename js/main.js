/* ========================================
   TARVELING — Main JavaScript
   ======================================== */

'use strict';

// ─── Utility ─────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Header Scroll Behaviour ─────────────
const header = $('#header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ─── Mobile Nav ────────────────────────────
const hamburger = $('#hamburger');
const mobileNav = $('#mobileNav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    // Animate hamburger
    const spans = $$('span', hamburger);
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  // Close on outside click
  document.addEventListener('click', e => {
    if (!header.contains(e.target)) {
      mobileNav.classList.remove('open');
      $$('span', hamburger).forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

// ─── Active nav link ─────────────────────
(function setActiveLink() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  $$('.nav__link, .footer__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();

// ─── Scroll Reveal ───────────────────────
(function initReveal() {
  const targets = $$('.reveal, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

// ─── Hero Floating Particles ─────────────
(function initParticles() {
  const container = $('#particles');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'hero__particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-duration: ${Math.random() * 20 + 15}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
})();

// ─── Search Bar Tabs ─────────────────────
(function initSearchTabs() {
  const tabs = $$('.search-bar__tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
})();

// ─── Search Form ─────────────────────────
const searchBtn = $('#searchBtn');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const dest = $('#searchDest')?.value.trim();
    const type = $('#searchType')?.value;
    // Build query params and navigate to trips
    const params = new URLSearchParams();
    if (dest) params.set('dest', dest);
    if (type) params.set('type', type);
    window.location.href = `trips.html${params.toString() ? '?' + params.toString() : ''}`;
  });
  // Enter key in the destination field
  $('#searchDest')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchBtn.click();
  });
}

// ─── Trips Filter ─────────────────────────
(function initFilter() {
  const filterBtns = $$('.filter-btn');
  const cards = $$('.trip-card[data-category]');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          // Re-trigger animation
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 50);
        }
      });
    });
  });
})();

// ─── Testimonial Slider ──────────────────
(function initSlider() {
  const track = $('#testimonialTrack');
  const dots = $$('.testimonials__dot');
  const prevBtn = $('#prevSlide');
  const nextBtn = $('#nextSlide');
  if (!track) return;

  let current = 0;
  const slides = $$('.testimonials__slide', track);
  const total = slides.length;
  let autoTimer;

  const goTo = idx => {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => { goTo(+dot.dataset.slide); resetAuto(); });
  });

  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };
  const startAuto = () => { autoTimer = setInterval(() => goTo(current + 1), 5000); };
  startAuto();
})();

// ─── Wishlist / Save Cards ───────────────
(function initWishlist() {
  let saved = JSON.parse(localStorage.getItem('tarveling_wishlist') || '[]');

  function updateBtn(btn, id) {
    const active = saved.includes(id);
    btn.classList.toggle('active', active);
    btn.title = active ? 'Remove from wishlist' : 'Add to wishlist';
  }

  $$('.dest-card__wish, .trip-card__wishlist').forEach(btn => {
    const id = btn.dataset.id || btn.closest('.trip-card')?.querySelector('.trip-card__title')?.textContent.slice(0, 20) || Math.random().toString(36);
    updateBtn(btn, id);
    btn.addEventListener('click', () => {
      const idx = saved.indexOf(id);
      if (idx === -1) saved.push(id);
      else saved.splice(idx, 1);
      localStorage.setItem('tarveling_wishlist', JSON.stringify(saved));
      updateBtn(btn, id);
      // Micro feedback
      btn.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease' });
    });
  });
})();

// ─── Newsletter Form ─────────────────────
const newsletterForm = $('#newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const emailEl = $('#newsletterEmail');
    const email = emailEl?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailEl?.classList.add('error');
      return;
    }
    emailEl.classList.remove('error');
    // Simulate success
    newsletterForm.innerHTML = `
      <div style="text-align:center; padding:20px 0; color:var(--clr-text);">
        <div style="font-size:2.5rem; margin-bottom:12px;">🎉</div>
        <div style="font-size:var(--fs-lg); font-weight:700; margin-bottom:8px;">You're In!</div>
        <div style="color:var(--clr-text-muted);">Welcome to the Tarveling community. Check your inbox for a welcome gift!</div>
      </div>`;
  });
}

// ─── Contact Form (contact.html) ─────────
const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const successEl = $('#formSuccess');
    contactForm.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
    setTimeout(() => {
      contactForm.reset();
      contactForm.style.display = '';
      if (successEl) successEl.style.display = 'none';
    }, 5000);
  });
}

// ─── Back to Top ─────────────────────────
const backToTop = $('#backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Destination Filters (destinations.html) ──
(function initDestFilter() {
  const filterBtns = $$('.dest-filter-btn');
  const cards = $$('.dest-full-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.region === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

// ─── Search on trips.html from URL params ──
(function readURLParams() {
  if (!location.pathname.includes('trips')) return;
  const params = new URLSearchParams(location.search);
  const dest = params.get('dest');
  const type = params.get('type');
  const searchInput = $('#tripSearchInput');
  const typeSelect = $('#tripTypeSelect');
  if (dest && searchInput) searchInput.value = dest;
  if (type && typeSelect) typeSelect.value = type;
})();

// ─── Smooth anchor links ─────────────────
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Lazy Image fade-in ──────────────────
(function initLazyFade() {
  $$('img[loading="lazy"]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; });
    if (img.complete) img.style.opacity = '1';
  });
})();
