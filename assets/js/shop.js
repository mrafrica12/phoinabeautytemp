/* ============================================================
   PHOINA BEAUTY — SHOP & CART SYSTEM
   localStorage cart · M-Pesa checkout flow · WhatsApp order
   ============================================================ */

const PB_SHOP = (() => {

  let cart = JSON.parse(localStorage.getItem('pb_cart') || '[]');

  function saveCart() {
    localStorage.setItem('pb_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  }

  function addItem(id, name, price, image = '') {
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price, image, qty: 1 });
    }
    saveCart();
    if (window.showToast) {
      window.showToast(`${name} added to cart`);
    }
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function updateQty(id, qty) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (qty <= 0) {
      removeItem(id);
    } else {
      item.qty = qty;
      saveCart();
    }
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function buildWhatsAppOrder() {
    if (cart.length === 0) return null;
    const lines = cart.map(i =>
      `• ${i.name} x${i.qty} = KES ${(i.price * i.qty).toLocaleString()}`
    ).join('\n');
    const total = getTotal();
    return encodeURIComponent(
      `🛒 *Phoina Beauty Order*\n\n${lines}\n\n*Total: KES ${total.toLocaleString()}*\n\nPlease confirm my order and send M-Pesa payment details.`
    );
  }

  function checkoutViaWhatsApp() {
    const order = buildWhatsAppOrder();
    if (!order) {
      if (window.showToast) window.showToast('Your cart is empty', 'error');
      return;
    }
    window.open(`https://wa.me/16784380539?text=${order}`, '_blank');
  }

  /* ---------- MPESA PAYMENT MODAL ---------- */
  function showMpesaModal(amount, reference) {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div id="mpesaBackdrop" class="overlay-backdrop open" role="dialog" aria-modal="true">
        <div class="modal open" style="max-width:440px;">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-display text-2xl text-pb-charcoal">M-Pesa Payment</h2>
            <button id="closeMpesa" class="text-pb-muted hover:text-pb-charcoal" aria-label="Close">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="p-4 rounded mb-4" style="background:#E8F5E9;">
            <p class="text-sm font-semibold text-green-800 mb-1">Lipa Na M-Pesa</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><span class="text-green-600 text-xs uppercase tracking-wide block">Paybill</span><strong class="text-green-900 text-lg">000000</strong></div>
              <div><span class="text-green-600 text-xs uppercase tracking-wide block">Account</span><strong class="text-green-900 text-lg">PHOINA</strong></div>
              <div><span class="text-green-600 text-xs uppercase tracking-wide block">Amount</span><strong class="text-green-900 text-lg">KES ${amount.toLocaleString()}</strong></div>
              <div><span class="text-green-600 text-xs uppercase tracking-wide block">Reference</span><strong class="text-green-900 text-lg">${reference}</strong></div>
            </div>
          </div>

          <ol class="text-sm text-pb-muted space-y-2 mb-6">
            <li class="flex gap-2"><span class="font-bold text-pb-gold">1.</span> Go to M-Pesa → Lipa Na M-Pesa → Paybill</li>
            <li class="flex gap-2"><span class="font-bold text-pb-gold">2.</span> Enter Business Number: <strong>000000</strong></li>
            <li class="flex gap-2"><span class="font-bold text-pb-gold">3.</span> Account Number: <strong>PHOINA</strong></li>
            <li class="flex gap-2"><span class="font-bold text-pb-gold">4.</span> Enter Amount: <strong>KES ${amount.toLocaleString()}</strong></li>
            <li class="flex gap-2"><span class="font-bold text-pb-gold">5.</span> Enter PIN and confirm</li>
          </ol>

          <button id="mpesaDoneBtn" class="btn btn-primary w-full mb-3">I've Sent Payment</button>
          <button id="mpesaWaBtn" class="btn btn-whatsapp w-full">Confirm via WhatsApp</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('closeMpesa')?.addEventListener('click', () => modal.remove());
    document.getElementById('mpesaBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'mpesaBackdrop') modal.remove();
    });

    document.getElementById('mpesaDoneBtn')?.addEventListener('click', () => {
      modal.remove();
      const msg = encodeURIComponent(`Hi Phoina Beauty! I've sent M-Pesa payment of KES ${amount.toLocaleString()} for order ${reference}. Please confirm.`);
      window.open(`https://wa.me/16784380539?text=${msg}`, '_blank');
      clearCart();
      if (window.showToast) window.showToast('Payment sent! We\'ll confirm shortly. ✓');
    });

    document.getElementById('mpesaWaBtn')?.addEventListener('click', () => {
      const msg = encodeURIComponent(`Hi! I need help with M-Pesa payment for order ${reference} (KES ${amount.toLocaleString()})`);
      window.open(`https://wa.me/16784380539?text=${msg}`, '_blank');
    });
  }

  /* ---------- CART DRAWER ---------- */
  function renderCartDrawer() {
    let drawer = document.getElementById('cartDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'cartDrawer';
      document.body.appendChild(drawer);
    }

    const items = cart.map(item => `
      <div class="flex gap-3 py-3 border-b border-pb-beige">
        <div class="flex-1 min-w-0">
          <p class="font-medium text-pb-charcoal text-sm truncate">${item.name}</p>
          <p class="text-xs text-pb-muted mt-0.5">KES ${item.price.toLocaleString()} each</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button onclick="PB_SHOP.updateQty('${item.id}', ${item.qty - 1})"
                  class="w-6 h-6 rounded border border-pb-beige text-pb-charcoal text-xs flex items-center justify-center hover:border-pb-gold">−</button>
          <span class="w-6 text-center text-sm">${item.qty}</span>
          <button onclick="PB_SHOP.updateQty('${item.id}', ${item.qty + 1})"
                  class="w-6 h-6 rounded border border-pb-beige text-pb-charcoal text-xs flex items-center justify-center hover:border-pb-gold">+</button>
          <button onclick="PB_SHOP.removeItem('${item.id}')" class="ml-2 text-pb-muted hover:text-red-500">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/></svg>
          </button>
        </div>
      </div>`).join('');

    const total = getTotal();
    const ref   = 'PB' + Date.now().toString().slice(-6);

    drawer.innerHTML = `
      <div id="cartBackdrop" class="overlay-backdrop open">
        <div class="modal open" style="max-width:400px;">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-2xl text-pb-charcoal">Your Cart (${getCount()})</h2>
            <button id="closeCart" aria-label="Close cart">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          ${cart.length === 0
            ? `<div class="text-center py-12">
                <p class="font-display text-2xl text-pb-chocolate mb-2">Your cart is empty</p>
                <p class="text-sm text-pb-muted mb-6">Add some products to get started</p>
                <a href="shop.html" class="btn btn-primary btn-sm">Browse Products</a>
              </div>`
            : `<div class="overflow-y-auto max-h-72">${items}</div>
               <div class="mt-4 pt-4 border-t border-pb-beige">
                 <div class="flex justify-between items-center mb-4">
                   <span class="font-medium text-pb-charcoal">Total</span>
                   <span class="price text-xl">KES ${total.toLocaleString()}</span>
                 </div>
                 <button onclick="PB_SHOP.showMpesaModal(${total}, '${ref}')" class="btn btn-primary w-full mb-3">Pay with M-Pesa</button>
                 <button onclick="PB_SHOP.checkoutViaWhatsApp()" class="btn btn-whatsapp w-full">
                   <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.849L0 24l6.335-1.509A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.97 0-3.807-.53-5.392-1.453l-.387-.23-4.01.955.971-3.917-.252-.4A9.551 9.551 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z"/></svg>
                   Order via WhatsApp
                 </button>
               </div>`
          }
        </div>
      </div>`;

    document.getElementById('closeCart')?.addEventListener('click', () => drawer.remove());
    document.getElementById('cartBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'cartBackdrop') drawer.remove();
    });
  }

  function openCart() { renderCartDrawer(); }

  // Re-render if already open
  const _saveCart = saveCart;
  function saveCartAndRefresh() {
    _saveCart();
    if (document.getElementById('cartDrawer')) renderCartDrawer();
  }

  updateCartUI();

  return {
    addItem,
    removeItem,
    updateQty,
    clearCart,
    getTotal,
    getCount,
    openCart,
    checkoutViaWhatsApp,
    showMpesaModal,
    cart: () => cart
  };

})();

// Global helpers expected by inline onclick handlers
window.PB_SHOP = PB_SHOP;
window.addToCart = (id, name, price, image) => PB_SHOP.addItem(id, name, price, image);
window.openCart = () => PB_SHOP.openCart();
