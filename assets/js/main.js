/* ============================================================
   PHOINA BEAUTY — CORE JAVASCRIPT
   Navigation · Animations · Scroll · Mobile Menu · Toasts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAVIGATION SCROLL ---------- */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  /* Mobile bottom CTA bar — reveal after 28% of viewport scrolled */
  const mobileCTABar = document.querySelector('.mobile-cta-bar');

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    /* Nav scroll state */
    if (current > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    /* Mobile bottom bar: show after scrolling ~28% of viewport height */
    if (mobileCTABar) {
      if (current > window.innerHeight * 0.28) {
        mobileCTABar.classList.add('visible');
      } else {
        mobileCTABar.classList.remove('visible');
      }
    }

    lastScroll = current;
  }, { passive: true });

  /* ---------- MOBILE MENU ---------- */
  const menuBtn   = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');

  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.contains('open');
    mobileNav?.classList.toggle('open');
    menuBtn?.classList.toggle('active');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Close on outside tap
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
      mobileNav.classList.remove('open');
      menuBtn?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close on link click
  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuBtn?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* ---------- HERO SLIDESHOW ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots   = document.querySelectorAll('#heroDots .hero-dot');
  let heroIdx = 0;
  let heroTimer;

  function goToHeroSlide(n) {
    heroSlides[heroIdx]?.classList.remove('active');
    heroDots[heroIdx]?.classList.remove('active');
    heroIdx = (n + heroSlides.length) % heroSlides.length;
    heroSlides[heroIdx]?.classList.add('active');
    heroDots[heroIdx]?.classList.add('active');
  }

  function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goToHeroSlide(heroIdx + 1), 5500);
  }

  if (heroSlides.length) {
    // Animate hero text content immediately
    animateHeroContent();
    // Start auto-advance
    startHeroTimer();
    // Dot click — restart timer on manual nav
    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goToHeroSlide(i); startHeroTimer(); });
    });
  }

  function animateHeroContent() {
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
  }

  /* ---------- INTERSECTION OBSERVER — SCROLL REVEALS ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .fade-in').forEach(el => {
    // Skip hero elements — those are handled separately
    if (!el.closest('#hero')) {
      revealObserver.observe(el);
    }
  });

  /* ---------- FILTER TABS (SHOP SECTION) ---------- */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.filter-tabs');
      parent?.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      filterProducts(filter);
    });
  });

  function filterProducts(filter) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.querySelectorAll('.product-card').forEach(card => {
      const category = card.dataset.category || 'all';
      const show = filter === 'all' || category === filter;
      card.style.display = show ? '' : 'none';
      if (show) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      }
    });
  }

  /* ---------- TESTIMONIAL SLIDER — removed (section deleted) ---------- */

  /* ---------- COUNTER ANIMATION ---------- */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    const suffix = el.dataset.suffix || '+';

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- TOAST NOTIFICATIONS ---------- */
  window.showToast = function(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'error' ? '#C0392B' : 'var(--pb-gold)';
    toast.textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  };

  /* ---------- SMOOTH ANCHOR SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- LAZY IMAGE LOADING ENHANCEMENT ---------- */
  if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          lazyObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(img => lazyObserver.observe(img));
  }

  /* ---------- ACTIVE NAV LINK ---------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.style.color = 'var(--pb-gold)';
    }
  });

  /* ---------- KEYBOARD ACCESSIBILITY ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileNav?.classList.contains('open')) {
        mobileNav.classList.remove('open');
        menuBtn?.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  /* ---------- BOOKING FORM: VALIDATE → SHEETS → WHATSAPP ---------- */
  const bookingForm = document.getElementById('bookingForm');
  const bookingDate = document.getElementById('bookingDate');
  const feedback = document.getElementById('bookingFeedback');

  if (bookingDate) {
    bookingDate.min = new Date().toISOString().split('T')[0];
  }

  function setFeedback(message, type = 'success') {
    if (!feedback) {
      window.showToast?.(message, type);
      return;
    }
    feedback.className = `form-feedback show ${type}`;
    feedback.textContent = message;
  }

  function generateBookingId() {
    return `PB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function selectBookingService(button) {
    document.querySelectorAll('.service-btn').forEach(btn => {
      btn.classList.remove('selected');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
    const selectedService = document.getElementById('selectedService');
    if (selectedService) selectedService.value = button.dataset.service || '';
  }

  window.selectService = selectBookingService;

  const urlService = new URLSearchParams(window.location.search).get('service');
  if (urlService) {
    document.querySelectorAll('.service-btn').forEach(btn => {
      if ((btn.dataset.service || '').toLowerCase().includes(urlService.toLowerCase())) {
        selectBookingService(btn);
      }
    });
  }

  function validateBooking(form) {
    let valid = true;
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        valid = false;
      }
    });
    const email = form.querySelector('[name="email"]');
    if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.classList.add('is-invalid');
      valid = false;
    }
    return valid;
  }

  function buildBookingPayload(form) {
    const data = Object.fromEntries(new FormData(form));
    const bookingId = generateBookingId();
    return {
      bookingId,
      timestamp: new Date().toISOString(),
      formType: data.formType || 'Appointment Booking',
      source: data.source || 'Website',
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      pickupLocation: data.pickupLocation || 'Phoina Beauty Studio',
      dropoffLocation: data.dropoffLocation || '',
      pickupDate: data.date || '',
      pickupTime: data.time || '',
      vehicleType: data.service || '',
      passengers: data.passengers || '1',
      specialRequest: data.notes || '',
      status: 'New',
      assignedDriver: '',
      vehicleAssigned: '',
      priceEstimate: data.amount || '',
      finalPrice: '',
      paymentStatus: 'Pending',
      followUpRequired: 'Yes',
      lastContactedDate: '',
      notes: data.notes || '',
      service: data.service || '',
      date: data.date || '',
      time: data.time || ''
    };
  }

  function buildWhatsAppMessage(payload) {
    return encodeURIComponent(
      `New Phoina Beauty booking request\n\n` +
      `Booking ID: ${payload.bookingId}\n` +
      `Name: ${payload.name}\n` +
      `Phone: ${payload.phone}\n` +
      `Email: ${payload.email || 'Not provided'}\n` +
      `Service: ${payload.vehicleType}\n` +
      `Date: ${payload.pickupDate}\n` +
      `Time: ${payload.pickupTime}\n` +
      `Notes: ${payload.specialRequest || 'None'}\n\n` +
      `Please confirm my appointment.`
    );
  }

  async function submitBookingForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitBtn = document.getElementById('submitBtn') || form.querySelector('[type="submit"]');

    if (!validateBooking(form)) {
      setFeedback('Please complete the highlighted details before submitting.', 'error');
      return;
    }

    const payload = buildBookingPayload(form);
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Securing your request...';
    }

    try {
      if (window.PB_CMS?.submitBooking) {
        const result = await window.PB_CMS.submitBooking(payload, { openWhatsAppOnFail: false });
        if (result?.error) throw new Error(result.error);
      }
      setFeedback(`Booking ${payload.bookingId} received. Opening WhatsApp so our team can confirm with you.`, 'success');
      window.open(`https://wa.me/254733934358?text=${buildWhatsAppMessage(payload)}`, '_blank', 'noopener');
      form.reset();
      document.querySelectorAll('.service-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      });
    } catch (err) {
      console.warn('[PB Booking] Submission failed:', err.message);
      setFeedback('We could not save to the booking sheet. Please try again or contact us on WhatsApp.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || 'Confirm Booking';
      }
    }
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', submitBookingForm);
  }

});
