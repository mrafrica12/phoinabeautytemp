/* ============================================================
   PHOINA BEAUTY — ADMIN SHARED JAVASCRIPT
   Sidebar · Toasts · Modals · Table helpers · Data CRUD
   ============================================================ */

/* ---------- SIDEBAR TOGGLE ---------- */
(function() {
  const sidebar  = document.getElementById('adminSidebar');
  const overlay  = document.getElementById('adminOverlay');
  const toggle   = document.getElementById('adminMenuToggle');

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', openSidebar);
  overlay?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 769) closeSidebar();
    });
  });
})();

/* ---------- TOAST ---------- */
function adminToast(message, type = 'default', duration = 3000) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'admin-toast';
    toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" id="toastIcon"></svg><span id="toastMsg"></span>`;
    document.body.appendChild(toast);
  }

  const icon = toast.querySelector('#toastIcon');
  const msg  = toast.querySelector('#toastMsg');

  toast.className = 'admin-toast';
  if (type === 'success') {
    toast.classList.add('success');
    icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
  } else if (type === 'error') {
    toast.classList.add('error');
    icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
  } else {
    icon.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
  }

  msg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

window.adminToast = adminToast;

/* ---------- MODAL HELPERS ---------- */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Close on backdrop click
document.querySelectorAll('.admin-modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });
});

// Close buttons
document.querySelectorAll('.admin-modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.admin-modal-backdrop')?.classList.remove('open');
  });
});

window.openModal  = openModal;
window.closeModal = closeModal;

/* ---------- FILTER CHIPS ---------- */
function initFilterChips(containerSelector, callback) {
  document.querySelectorAll(containerSelector + ' .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll(containerSelector + ' .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      callback(chip.dataset.filter || chip.textContent.trim().toLowerCase());
    });
  });
}

window.initFilterChips = initFilterChips;

/* ---------- TABLE SEARCH ---------- */
function initTableSearch(inputId, tableId, colIndexes) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    table.querySelectorAll('tbody tr').forEach(row => {
      const text = (colIndexes || [])
        .map(i => row.cells[i]?.textContent || '')
        .join(' ')
        .toLowerCase();
      row.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  });
}

window.initTableSearch = initTableSearch;

/* ---------- CMS DATA LAYER ---------- */
const PB_ADMIN = (() => {

  const STORES = {
    products: 'pb_products',
    services: 'pb_services',
    events: 'pb_events',
    gallery: 'pb_gallery',
    staff: 'pb_staff',
    schedule: 'pb_schedule',
    bookings: 'pb_bookings',
    academy: 'pb_academy',
    testimonials: 'pb_testimonials',
    settings: 'pb_settings'
  };

  function lsGet(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch(_) { return null; }
  }

  function lsSet(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(_) {}
  }

  async function loadJson(path) {
    try {
      const res = await fetch(path + '?v=' + Date.now());
      if (!res.ok) return null;
      return await res.json();
    } catch(_) { return null; }
  }

  async function getStore(name) {
    const lsKey = STORES[name];
    const cached = lsGet(lsKey);
    if (cached) return cached;

    const jsonPath = `../assets/data/${name}.json`;
    const jsonData = await loadJson(jsonPath);
    if (jsonData) {
      const list = jsonData[name] || jsonData.courses || jsonData.testimonials || Object.values(jsonData)[0];
      if (list) {
        lsSet(lsKey, list);
        return list;
      }
    }
    return [];
  }

  function saveStore(name, data) {
    lsSet(STORES[name], data);
  }

  async function getAll(name) {
    return getStore(name);
  }

  async function getById(name, id) {
    const list = await getStore(name);
    return list.find(item => item.id === id) || null;
  }

  async function save(name, item) {
    const list = await getStore(name);
    const idx  = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      item.id = item.id || genId(name);
      list.unshift(item);
    }
    saveStore(name, list);
    return item;
  }

  async function remove(name, id) {
    const list = await getStore(name);
    const updated = list.filter(i => i.id !== id);
    saveStore(name, updated);
    return updated;
  }

  function resetStore(name) {
    localStorage.removeItem(STORES[name]);
  }

  function genId(prefix) {
    return prefix.charAt(0) + Date.now().toString(36);
  }

  return { getAll, getById, save, remove, resetStore, saveStore, STORES };
})();

window.PB_ADMIN = PB_ADMIN;

/* ---------- STATUS DISPLAY HELPERS ---------- */
const STATUS_CONFIG = {
  new:         { label: 'New',         cls: 'status-new' },
  confirmed:   { label: 'Confirmed',   cls: 'status-confirmed' },
  paid:        { label: 'Paid',        cls: 'status-paid' },
  in_progress: { label: 'In Progress', cls: 'status-in_progress' },
  completed:   { label: 'Completed',   cls: 'status-completed' },
  cancelled:   { label: 'Cancelled',   cls: 'status-cancelled' },
  active:      { label: 'Active',      cls: 'status-active' },
  inactive:    { label: 'Inactive',    cls: 'status-inactive' },
  draft:       { label: 'Draft',       cls: 'status-draft' },
  upcoming:    { label: 'Upcoming',    cls: 'status-upcoming' },
  live:        { label: 'Live',        cls: 'status-live' },
  sold_out:    { label: 'Sold Out',    cls: 'status-sold_out' },
  past:        { label: 'Past',        cls: 'status-past' },
  available:   { label: 'Available',   cls: 'status-available' },
  booked:      { label: 'Booked',      cls: 'status-booked' },
  off:         { label: 'Off',         cls: 'status-off' },
  on_leave:    { label: 'On Leave',    cls: 'status-on_leave' }
};

function statusBadge(status) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'status-draft' };
  return `<span class="status-badge ${cfg.cls}">${cfg.label}</span>`;
}

window.statusBadge = statusBadge;

/* ---------- CONFIRM DELETE ---------- */
function confirmDelete(message, callback) {
  if (confirm(message || 'Are you sure you want to delete this item?')) {
    callback();
  }
}

window.confirmDelete = confirmDelete;

/* ---------- FORMAT DATE ---------- */
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch(_) { return dateStr; }
}

function fmtTime(timeStr) {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':');
    const d = new Date(); d.setHours(+h, +m);
    return d.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch(_) { return timeStr; }
}

window.fmtDate = fmtDate;
window.fmtTime = fmtTime;

/* ---------- WHATSAPP LINK BUILDER ---------- */
function waLink(phone, text) {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(text || '')}`;
}

window.waLink = waLink;

/* ---------- LOAD SETTINGS INTO NAV/PAGE ---------- */
async function applySettings() {
  const settings = await PB_ADMIN.getAll('settings');
  if (!settings || !settings.business) return;

  const { whatsapp } = settings.business;

  document.querySelectorAll('[data-wa-href]').forEach(el => {
    if (whatsapp) {
      const msg = el.dataset.waMsg || '';
      el.href = waLink(whatsapp, msg);
    }
  });
}

document.addEventListener('DOMContentLoaded', applySettings);
