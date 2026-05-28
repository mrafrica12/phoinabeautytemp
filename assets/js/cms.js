/* ============================================================
   PHOINA BEAUTY — CMS DATA LAYER
   Fetches live data from Google Apps Script / Google Sheets
   Falls back to static data if API is unavailable
   ============================================================ */

const PB_CMS = (() => {

  // Replace with your deployed Google Apps Script web app URL
  const API_BASE = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /* ---------- CACHE HELPERS ---------- */
  function cacheSet(key, data) {
    try {
      localStorage.setItem(`pb_${key}`, JSON.stringify({ ts: Date.now(), data }));
    } catch (_) {}
  }

  function cacheGet(key) {
    try {
      const raw = localStorage.getItem(`pb_${key}`);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL) return data;
      localStorage.removeItem(`pb_${key}`);
    } catch (_) {}
    return null;
  }

  /* ---------- FETCH WRAPPER ---------- */
  async function apiFetch(endpoint, params = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const url = new URL(API_BASE);
    url.searchParams.set('action', endpoint);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    try {
      const res = await fetch(url.toString(), { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cacheSet(cacheKey, data);
      return data;
    } catch (err) {
      console.warn('[PB CMS] API unavailable, using fallback data:', err.message);
      return null;
    }
  }

  /* ---------- LOCAL-OR-FETCH (reads localStorage admin edits first) ---------- */
  async function getLocalOrFetch(storeName, jsonPath) {
    try {
      const raw = localStorage.getItem(`pb_${storeName}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    try {
      const res = await fetch(jsonPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json[storeName] ?? json;
    } catch (err) {
      console.warn(`[PB CMS] Could not load ${storeName}:`, err.message);
      return null;
    }
  }

  /* ---------- STATIC FALLBACK DATA ---------- */
  const FALLBACK = {
    events: [
      {
        id: 'e1', title: 'Bridal Makeup Masterclass',
        description: 'Hands-on bridal makeup workshop with kit provided.',
        date: '2026-06-14', time: '10:00 AM',
        price: 3500, status: 'upcoming',
        whatsappLink: 'https://wa.me/254733934358?text=Bridal+Masterclass+Registration',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
        featured: true
      },
      {
        id: 'e2', title: 'Natural Hair & Skincare Expo',
        description: 'Product demos, consultations, and live styling all day.',
        date: '2026-06-21', time: '9:00 AM – 5:00 PM',
        price: 0, status: 'upcoming',
        whatsappLink: 'https://wa.me/254733934358?text=Hair+Expo+RSVP',
        image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
        featured: true
      },
      {
        id: 'e3', title: 'Professional Makeup Academy — July Intake',
        description: '3-month intensive professional certification program.',
        date: '2026-07-07', time: 'Full Day',
        price: 25000, status: 'upcoming',
        whatsappLink: 'https://wa.me/254733934358?text=Academy+July+Enrollment',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        featured: true
      }
    ],

    products: [
      {
        id: 'p1', name: 'Luxury Foundation', category: 'makeup',
        price: 2500, promoPrice: null, status: 'in_stock',
        badge: 'bestseller', rating: 5, reviews: 142,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80',
        description: 'Full-coverage, long-wear foundation for all skin tones.', featured: true
      },
      {
        id: 'p2', name: 'Nude Lip Collection', category: 'makeup',
        price: 1800, promoPrice: null, status: 'in_stock',
        badge: 'new', rating: 5, reviews: 87,
        image: 'https://images.unsplash.com/photo-1583241475880-083f84372725?auto=format&fit=crop&w=500&q=80',
        description: 'Six beautiful nudes designed for African skin tones.', featured: true
      },
      {
        id: 'p3', name: 'Argan Hair Oil', category: 'hair',
        price: 1200, promoPrice: 1500, status: 'in_stock',
        badge: 'sale', rating: 4, reviews: 63,
        image: 'https://images.unsplash.com/photo-1626870849640-2e52e7a8d8f6?auto=format&fit=crop&w=500&q=80',
        description: 'Pure Moroccan argan oil for intense shine and moisture.', featured: true
      },
      {
        id: 'p4', name: 'Professional Brush Set', category: 'kits',
        price: 4500, promoPrice: null, status: 'in_stock',
        badge: 'limited', rating: 5, reviews: 34,
        image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=500&q=80',
        description: '20-piece professional brush set in luxury travel case.', featured: true
      }
    ],

    banners: [
      {
        id: 'b1', title: 'Where African Beauty Becomes Empire.',
        subtitle: 'Luxury studio · Academy · Premium products',
        cta: 'Book Now', ctaLink: 'booking.html',
        image: 'https://images.unsplash.com/photo-1609340261710-9ce73cde7c04?auto=format&fit=crop&w=1920&q=80',
        active: true
      }
    ],

    testimonials: [
      {
        id: 't1', name: 'Grace Wanjiku', role: 'Bridal Client · Nairobi',
        review: 'Best bridal makeup I\'ve ever had. My photos were absolutely stunning.',
        rating: 5, approved: true,
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=80&q=80'
      },
      {
        id: 't2', name: 'Fatuma Hassan', role: 'Academy Graduate · Mombasa',
        review: 'The academy course transformed my passion into a career.',
        rating: 5, approved: true,
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=80&q=80'
      }
    ]
  };

  /* ---------- PUBLIC API ---------- */

  async function getEvents(featured = false) {
    const apiData = await apiFetch('events', featured ? { featured: '1' } : {});
    const localData = await getLocalOrFetch('events', 'assets/data/events.json');
    const events = apiData?.events || (Array.isArray(localData) ? localData : null) || FALLBACK.events;
    return events.filter(e => (e.status !== 'past') && (featured ? e.featured : true));
  }

  async function getProducts(category = 'all', featured = false) {
    const apiData = await apiFetch('products', { category, featured: featured ? '1' : '0' });
    const localData = await getLocalOrFetch('products', 'assets/data/products.json');
    const products = apiData?.products || (Array.isArray(localData) ? localData : null) || FALLBACK.products;
    const active = products.filter(p => p.status !== 'inactive' && (featured ? p.featured : true));
    return category === 'all' ? active : active.filter(p => p.category === category);
  }

  async function getBanners() {
    const data = await apiFetch('banners');
    return data?.banners || FALLBACK.banners;
  }

  async function getTestimonials() {
    const apiData = await apiFetch('testimonials');
    const localData = await getLocalOrFetch('testimonials', 'assets/data/testimonials.json');
    const list = apiData?.testimonials || (Array.isArray(localData) ? localData : null) || FALLBACK.testimonials;
    return list.filter(t => t.approved);
  }

  async function getServices(featured = false) {
    const data = await getLocalOrFetch('services', 'assets/data/services.json');
    const list = Array.isArray(data) ? data : (data?.services || []);
    return list.filter(s => s.status === 'active' && (featured ? s.featured : true));
  }

  async function getGallery(featured = false, limit = 0) {
    const data = await getLocalOrFetch('gallery', 'assets/data/gallery.json');
    const list = Array.isArray(data) ? data : (data?.gallery || []);
    let items = list.filter(g => g.status === 'active' && (featured ? g.featured : true));
    return limit > 0 ? items.slice(0, limit) : items;
  }

  async function getStaff() {
    const data = await getLocalOrFetch('staff', 'assets/data/staff.json');
    const list = Array.isArray(data) ? data : (data?.staff || []);
    return list.filter(s => s.status === 'active');
  }

  async function getAcademy() {
    const data = await getLocalOrFetch('academy', 'assets/data/academy.json');
    return Array.isArray(data) ? data : (data?.courses || []);
  }

  async function getSettings() {
    const data = await getLocalOrFetch('settings', 'assets/data/settings.json');
    return data || {};
  }

  async function submitBooking(formData, options = {}) {
    const openWhatsAppOnFail = options.openWhatsAppOnFail !== false;
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        body: JSON.stringify({ action: 'createBooking', ...formData }),
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await res.json();
      return result;
    } catch (err) {
      if (!openWhatsAppOnFail) {
        throw err;
      }
      const msg = encodeURIComponent(
        `New Booking Request:\nName: ${formData.name}\nService: ${formData.service}\nDate: ${formData.date}\nPhone: ${formData.phone}`
      );
      window.open(`https://wa.me/254733934358?text=${msg}`, '_blank');
      return { success: true, fallback: true };
    }
  }

  async function submitAcademyApplication(formData) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        body: JSON.stringify({ action: 'academyApplication', ...formData }),
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      const msg = encodeURIComponent(
        `Academy Application:\nName: ${formData.name}\nCourse: ${formData.course}\nPhone: ${formData.phone}`
      );
      window.open(`https://wa.me/254733934358?text=${msg}`, '_blank');
      return { success: true, fallback: true };
    }
  }

  /* ---------- DYNAMIC CONTENT RENDERER ---------- */

  function renderEventCard(event) {
    const date = new Date(event.date);
    const day   = date.getDate();
    const month = date.toLocaleString('en-KE', { month: 'short' });
    const price = event.price === 0 ? 'FREE' : `KES ${event.price.toLocaleString()}`;
    const statusMap = {
      upcoming: { cls: 'status-live', label: 'Upcoming' },
      live:     { cls: 'status-live', label: 'Live Now' },
      soldout:  { cls: 'status-cancelled', label: 'Sold Out' },
      completed:{ cls: 'status-completed', label: 'Completed' },
    };
    const st = statusMap[event.status] || statusMap.upcoming;

    return `
      <div class="event-card reveal">
        <div class="event-date-block">
          <span class="event-day">${day}</span>
          <span class="event-month">${month}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <span class="status-badge ${st.cls} text-xs">${st.label}</span>
              <h3 class="font-display text-xl text-pb-charcoal mt-1">${event.title}</h3>
            </div>
            <span class="price text-sm flex-shrink-0">${price}</span>
          </div>
          <p class="text-sm text-pb-muted mb-3">${event.description}</p>
          <div class="flex flex-wrap items-center gap-3">
            <span class="label-text text-xs text-pb-muted">${event.time}</span>
            ${event.status !== 'soldout' && event.status !== 'completed' ? `
              <a href="${event.whatsappLink}" target="_blank" class="btn btn-primary btn-sm">
                Register Now
              </a>` : ''}
          </div>
        </div>
      </div>`;
  }

  function renderProductCard(product) {
    const badgeMap = {
      new:        { cls: 'badge-new',        label: 'New' },
      bestseller: { cls: 'badge-bestseller', label: 'Bestseller' },
      sale:       { cls: 'badge-sale',       label: `Save ${Math.round((1 - product.price / product.promoPrice) * 100)}%` },
      limited:    { cls: 'badge-limited',    label: 'Limited' },
    };
    const badge   = badgeMap[product.badge];
    const stars   = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
    const waLink  = `https://wa.me/254733934358?text=I+want+to+buy+${encodeURIComponent(product.name)}`;

    return `
      <div class="product-card reveal" data-category="${product.category}">
        <div class="relative overflow-hidden" style="aspect-ratio:1/1;">
          ${badge ? `<span class="product-badge ${badge.cls}">${badge.label}</span>` : ''}
          <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy">
        </div>
        <div class="p-4">
          <p class="label-text text-pb-muted text-xs mb-1">${product.category}</p>
          <h3 class="font-medium text-pb-charcoal mb-2">${product.name}</h3>
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="price text-lg">KES ${product.price.toLocaleString()}</span>
              ${product.promoPrice ? `<span class="text-pb-muted line-through text-sm ml-2">KES ${product.promoPrice.toLocaleString()}</span>` : ''}
            </div>
            <div class="stars text-xs">${stars}</div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary btn-sm flex-1 text-xs" onclick="addToCart('${product.id}', '${product.name}', ${product.price})">Add to Cart</button>
            <a href="${waLink}" target="_blank" class="btn btn-sm px-2" style="background:#25D366;color:#fff;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.849L0 24l6.335-1.509A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.97 0-3.807-.53-5.392-1.453l-.387-.23-4.01.955.971-3.917-.252-.4A9.551 9.551 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/></svg>
            </a>
          </div>
        </div>
      </div>`;
  }

  /* ---------- RENDERERS ---------- */

  const WA_SVG = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.849L0 24l6.335-1.509A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.97 0-3.807-.53-5.392-1.453l-.387-.23-4.01.955.971-3.917-.252-.4A9.551 9.551 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/></svg>`;

  function renderServiceCard(service, delay = '') {
    const slug = service.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const waText = encodeURIComponent(`${service.name} inquiry`);
    const waPhone = (window.PB_SETTINGS && window.PB_SETTINGS.whatsapp) || '254733934358';
    return `
      <div class="service-card reveal${delay ? ' reveal-delay-' + delay : ''}" data-category="${service.category}">
        <div class="relative overflow-hidden" style="aspect-ratio:3/4;">
          <img src="${service.image}" alt="${service.name}" class="service-card-img" loading="lazy">
          <div class="service-card-overlay">
            <div>
              <span class="label-text text-pb-gold text-xs block mb-1">${service.name}</span>
              <p class="text-white text-sm leading-snug">${service.description || ''}</p>
            </div>
          </div>
        </div>
        <div class="service-card-body">
          <h3 class="font-display text-xl text-white mb-1">${service.name}</h3>
          <p class="text-xs text-pb-muted mb-3">${(service.subtags || []).join(' · ')}</p>
          <div class="flex items-center justify-between">
            <span class="price"><span class="price-from">from</span>${service.priceDisplay || 'KES ' + (service.price || 0).toLocaleString()}</span>
            <div class="flex gap-2">
              <a href="booking.html?service=${slug}" class="btn btn-primary btn-sm text-xs px-3">Book</a>
              <a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" class="btn btn-sm text-xs px-2" style="background:#25D366;color:#fff;">${WA_SVG}</a>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderGalleryItem(item) {
    const instaIcon = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="3"/><path d="M16.5 7.5v0"/></svg>`;
    return `
      <div class="gallery-item" data-category="${item.category || ''}" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title || 'Phoina Beauty'}" loading="lazy">
        <div class="gallery-overlay">${instaIcon}</div>
      </div>`;
  }

  function renderStaffCard(member) {
    const skills = (member.skills || []).slice(0, 3).map(s => `<span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(201,169,110,.12);color:#C9A96E;">${s}</span>`).join('');
    return `
      <div class="reveal" style="text-align:center;">
        <div class="relative overflow-hidden rounded-lg mb-4" style="aspect-ratio:3/4;max-width:240px;margin:0 auto;">
          <img src="${member.image}" alt="${member.name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
        </div>
        <p class="label-text text-pb-gold text-xs mb-1">${member.department || ''}</p>
        <h3 class="font-display text-xl text-pb-black mb-0.5">${member.name}</h3>
        <p class="text-sm text-pb-muted mb-3">${member.role}</p>
        <div class="flex flex-wrap justify-center gap-1">${skills}</div>
      </div>`;
  }

  function renderTestimonialCard(t) {
    const stars = '★'.repeat(t.rating || 5) + '☆'.repeat(5 - (t.rating || 5));
    return `
      <div class="testimonial-card reveal">
        <div class="stars text-pb-gold text-sm mb-3">${stars}</div>
        <p class="text-pb-charcoal leading-relaxed mb-6 italic">"${t.review}"</p>
        <div class="flex items-center gap-3">
          ${t.image ? `<img src="${t.image}" alt="${t.name}" class="w-10 h-10 rounded-full object-cover" loading="lazy">` : `<div class="w-10 h-10 rounded-full bg-pb-gold/20 flex items-center justify-center"><span class="font-display text-pb-gold">${t.name[0]}</span></div>`}
          <div>
            <p class="font-medium text-pb-charcoal text-sm">${t.name}</p>
            <p class="text-xs text-pb-muted">${t.role || ''}</p>
          </div>
        </div>
      </div>`;
  }

  /* ---------- LIVE REFRESH HELPERS ---------- */
  function _reobserve(el) {
    el.querySelectorAll('.reveal').forEach(r => {
      if (window._revealObserver) window._revealObserver.observe(r);
    });
  }

  async function refreshEvents(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const events = await getEvents();
    el.innerHTML = events.map(renderEventCard).join('');
    _reobserve(el);
  }

  async function refreshProducts(containerId, category = 'all') {
    const el = document.getElementById(containerId);
    if (!el) return;
    const products = await getProducts(category, true);
    el.innerHTML = products.slice(0, 4).map(renderProductCard).join('');
    _reobserve(el);
  }

  async function refreshServices(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const services = await getServices(true);
    el.innerHTML = services.slice(0, 8).map((s, i) => renderServiceCard(s, (i % 4) + 1)).join('');
    _reobserve(el);
  }

  async function refreshGallery(containerId, limit = 6) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const items = await getGallery(false, limit);
    el.innerHTML = items.map(renderGalleryItem).join('');
  }

  async function refreshTestimonials(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const list = await getTestimonials();
    el.innerHTML = list.map(renderTestimonialCard).join('');
    _reobserve(el);
  }

  async function refreshStaff(containerId, limit = 8) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const staff = await getStaff();
    el.innerHTML = staff.slice(0, limit).map(renderStaffCard).join('');
    _reobserve(el);
  }

  return {
    getEvents,
    getProducts,
    getBanners,
    getTestimonials,
    getServices,
    getGallery,
    getStaff,
    getAcademy,
    getSettings,
    submitBooking,
    submitAcademyApplication,
    renderEventCard,
    renderProductCard,
    renderServiceCard,
    renderGalleryItem,
    renderStaffCard,
    renderTestimonialCard,
    refreshEvents,
    refreshProducts,
    refreshServices,
    refreshGallery,
    refreshTestimonials,
    refreshStaff,
    FALLBACK
  };

})();

window.PB_CMS = PB_CMS;

// Expose globally
window.PB_CMS = PB_CMS;
