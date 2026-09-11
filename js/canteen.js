/**
 * CampusConnect AI - Canteen Queue System
 * Domain 2:
 * 1. Browse digital canteen menu (Breakfast, Meals, Fast Food, Snacks, Beverages)
 * 2. Generate instant wait-free tokens (e.g. #CT-104) without physical waiting
 * 3. Mail Automation: Sends digital token receipt with items, counter, and QR visual
 * 4. Reminder System: Live queue tracking, audio chimes, visual alerts, and ready emails
 */

const CampusCanteen = window.CampusCanteen = (() => {

  let cart = []; // Array of { foodId, quantity }
  let activeCategory = 'all';

  // Web Audio API synthesized reminder chime (100% browser native, zero asset lag)
  function playReminderChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Two-tone cheerful doorbell / counter chime (E5 -> G#5)
      playTone(659.25, 0, 0.35);
      playTone(830.61, 0.25, 0.6);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  }

  /**
   * Render the canteen food menu
   */
  function renderMenu() {
    const container = document.getElementById('canteen-menu-grid');
    if (!container) return;

    let items = CampusStore.getCanteenMenu();
    if (activeCategory !== 'all') {
      items = items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());
    }

    const searchQuery = (document.getElementById('canteen-search-input')?.value || '').toLowerCase();
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-utensils text-4xl text-slate-300 mb-2"></i>
          <p class="text-sm font-semibold text-slate-700">No food items found</p>
          <p class="text-xs text-slate-400 mt-1">Try another search or select "All Items".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const inCart = cart.find(c => c.foodId === item.id);
      const qty = inCart ? inCart.quantity : 0;

      return `
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group">
          <div>
            <div class="relative h-36 w-full overflow-hidden bg-slate-100">
              <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
                ${item.category}
              </span>
              <span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
                <i class="fa-regular fa-clock mr-1"></i>${item.prepTime} min
              </span>
            </div>

            <div class="p-4">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-bold text-slate-900 text-sm leading-snug">${item.name}</h4>
                <span class="text-sm font-extrabold text-orange-600 shrink-0">₹${item.price}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">${item.description}</p>
              <div class="mt-2 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <i class="fa-solid fa-bell-concierge text-orange-500"></i> ${item.counter}
              </div>
            </div>
          </div>

          <div class="px-4 pb-4 pt-1">
            ${qty === 0 ? `
              <button type="button" onclick="CampusCanteen.addToCart('${item.id}')"
                      class="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-orange-200/80 cursor-pointer">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Add to Order</span>
              </button>
            ` : `
              <div class="flex items-center justify-between bg-orange-100/70 border border-orange-300 rounded-xl p-1">
                <button type="button" onclick="CampusCanteen.decrementCart('${item.id}')"
                        class="w-7 h-7 rounded-lg bg-white text-orange-700 font-bold hover:bg-orange-200 transition flex items-center justify-center cursor-pointer">
                  <i class="fa-solid fa-minus text-xs"></i>
                </button>
                <span class="text-xs font-extrabold text-orange-950 px-2">${qty}</span>
                <button type="button" onclick="CampusCanteen.addToCart('${item.id}')"
                        class="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition flex items-center justify-center cursor-pointer">
                  <i class="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Cart management
   */
  function addToCart(foodId) {
    const existing = cart.find(c => c.foodId === foodId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ foodId, quantity: 1 });
    }
    renderMenu();
    renderCartBar();
  }

  function decrementCart(foodId) {
    const idx = cart.findIndex(c => c.foodId === foodId);
    if (idx !== -1) {
      if (cart[idx].quantity > 1) {
        cart[idx].quantity -= 1;
      } else {
        cart.splice(idx, 1);
      }
    }
    renderMenu();
    renderCartBar();
  }

  function clearCart() {
    cart = [];
    renderMenu();
    renderCartBar();
  }

  function renderCartBar() {
    const bar = document.getElementById('canteen-cart-bar');
    if (!bar) return;

    if (cart.length === 0) {
      bar.classList.add('hidden');
      return;
    }

    bar.classList.remove('hidden');
    const menu = CampusStore.getCanteenMenu();

    let totalAmount = 0;
    let totalItemsCount = 0;
    let maxPrepTime = 3;

    const summaryParts = cart.map(c => {
      const item = menu.find(m => m.id === c.foodId);
      if (!item) return '';
      totalAmount += item.price * c.quantity;
      totalItemsCount += c.quantity;
      if (item.prepTime > maxPrepTime) maxPrepTime = item.prepTime;
      return `${item.name} (${c.quantity})`;
    }).filter(Boolean);

    document.getElementById('cart-items-count').textContent = `${totalItemsCount} Item${totalItemsCount > 1 ? 's' : ''}`;
    document.getElementById('cart-total-price').textContent = `₹${totalAmount}`;
    document.getElementById('cart-items-preview').textContent = summaryParts.join(', ');
    document.getElementById('cart-prep-time').textContent = `~${maxPrepTime} mins`;
  }

  /**
   * Generate Wait-Free Token
   */
  function generateToken() {
    if (cart.length === 0) {
      if (window.showAppToast) window.showAppToast('Please select at least one food item.', 'error');
      return;
    }

    const user = CampusStore.getCurrentUser();
    if (!user) {
      if (window.showAppToast) window.showAppToast('Please sign in to generate a canteen token.', 'info');
      if (window.navigateTo) window.navigateTo('auth');
      return;
    }

    const menu = CampusStore.getCanteenMenu();
    let totalAmount = 0;
    let maxPrepTime = 3;
    let counterSet = new Set();

    const summaryParts = cart.map(c => {
      const item = menu.find(m => m.id === c.foodId);
      if (!item) return '';
      totalAmount += item.price * c.quantity;
      if (item.prepTime > maxPrepTime) maxPrepTime = item.prepTime;
      if (item.counter) counterSet.add(item.counter);
      return `${item.name} x${c.quantity}`;
    }).filter(Boolean);

    const assignedCounter = counterSet.size > 0 ? Array.from(counterSet)[0] : 'Counter 1 (Hot Meals)';

    // Generate token number (e.g. CT-104)
    const existingTokens = CampusStore.getCanteenTokens();
    const tokenSeq = 100 + existingTokens.length + 1;
    const tokenNo = `CT-${tokenSeq}`;

    const tokenObj = {
      id: 'tkn_' + Date.now(),
      tokenNo,
      studentName: user.fullName,
      rollNo: user.rollNo,
      itemsSummary: summaryParts.join(', '),
      totalAmount,
      counter: assignedCounter,
      status: 'Preparing',
      createdAt: 'Just now',
      estReadyTime: `Approx ${maxPrepTime} mins`,
      notified: false
    };

    CampusStore.addCanteenToken(tokenObj);

    // Trigger Mail Automation
    CampusMailer.sendCanteenTokenConfirmation(tokenObj, user);

    // Play confirmation chime
    playReminderChime();

    // Clear cart
    clearCart();

    // Re-render queue display
    renderQueueBoard();

    // Show Token Success Modal
    openTokenModal(tokenObj);
  }

  function openTokenModal(token) {
    document.getElementById('modal-tkn-number').textContent = `#${token.tokenNo}`;
    document.getElementById('modal-tkn-counter').textContent = token.counter;
    document.getElementById('modal-tkn-items').textContent = token.itemsSummary;
    document.getElementById('modal-tkn-price').textContent = `₹${token.totalAmount}`;
    document.getElementById('modal-tkn-status').textContent = token.status;
    document.getElementById('modal-tkn-roll').textContent = token.rollNo || 'Student';

    if (window.showAppModal) {
      window.showAppModal('modal-canteen-token');
    } else {
      const modal = document.getElementById('modal-canteen-token');
      if (modal) modal.classList.remove('hidden');
    }
  }

  function closeTokenModal() {
    if (window.hideAppModal) {
      window.hideAppModal('modal-canteen-token');
    } else {
      const modal = document.getElementById('modal-canteen-token');
      if (modal) modal.classList.add('hidden');
    }
  }

  /**
   * Render Active Queue Tokens & Live Board
   */
  function renderQueueBoard() {
    const container = document.getElementById('canteen-queue-list');
    if (!container) return;

    const tokens = CampusStore.getCanteenTokens();
    const user = CampusStore.getCurrentUser();

    if (tokens.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center bg-white rounded-2xl border border-slate-200">
          <p class="text-xs text-slate-500">No active tokens in queue right now.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tokens.map(tkn => {
      const isMyToken = user && (tkn.rollNo === user.rollNo || tkn.studentName === user.fullName);
      const isReady = tkn.status === 'Ready';

      return `
        <div class="p-4 rounded-2xl border transition-all ${
          isReady
            ? 'bg-emerald-50/90 border-emerald-400 shadow-md ring-2 ring-emerald-200'
            : isMyToken
              ? 'bg-orange-50/80 border-orange-300 shadow-sm'
              : 'bg-white border-slate-200'
        }">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                isReady
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-orange-500 text-white'
              }">
                ${tkn.tokenNo}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-extrabold text-slate-900 text-sm">Token #${tkn.tokenNo}</span>
                  ${isMyToken ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Your Order</span>' : ''}
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  <span class="font-semibold text-slate-700">${tkn.counter}</span> &bull; <span class="text-slate-400">${tkn.createdAt}</span>
                </div>
              </div>
            </div>

            <span class="px-3 py-1 rounded-full text-xs font-bold ${
              isReady
                ? 'bg-emerald-200 text-emerald-900 flex items-center gap-1.5'
                : 'bg-amber-100 text-amber-800'
            }">
              ${isReady ? '<i class="fa-solid fa-bell fa-shake"></i> Ready for Pickup' : '<i class="fa-solid fa-fire text-xs"></i> Preparing'}
            </span>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="text-slate-600">
              <span class="font-medium text-slate-400">Order:</span> ${tkn.itemsSummary} (₹${tkn.totalAmount})
            </div>

            <div class="flex items-center gap-2">
              ${!isReady ? `
                <button type="button" onclick="CampusCanteen.simulateReady('${tkn.id}')"
                        class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Simulate order completion & test reminder chime">
                  <i class="fa-solid fa-bell"></i>
                  <span>Test "Call Token"</span>
                </button>
              ` : `
                <button type="button" onclick="CampusCanteen.markCollected('${tkn.id}')"
                        class="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold transition cursor-pointer">
                  Mark Collected
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Reminder System: Simulate Order Ready & Call Token
   */
  function simulateReady(tokenId) {
    const updated = CampusStore.updateCanteenToken(tokenId, {
      status: 'Ready',
      estReadyTime: 'Ready now at counter!'
    });

    if (!updated) return;

    // 1. Play Audio Reminder Chime
    playReminderChime();

    // 2. Dispatch Order Ready Email
    const user = CampusStore.getCurrentUser();
    CampusMailer.sendCanteenTokenReadyAlert(updated, user || {
      fullName: updated.studentName,
      rollNo: updated.rollNo,
      email: 'student@college.edu'
    });

    // 3. Show On-Screen Reminder Banner
    showReminderBanner(updated);

    // 4. Update Queue Display
    renderQueueBoard();
  }

  function showReminderBanner(token) {
    const banner = document.getElementById('canteen-reminder-alert');
    if (!banner) return;

    document.getElementById('reminder-token-no').textContent = `#${token.tokenNo}`;
    document.getElementById('reminder-counter-name').textContent = token.counter;
    document.getElementById('reminder-items-text').textContent = token.itemsSummary;

    banner.classList.remove('hidden');
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function dismissReminderBanner() {
    const banner = document.getElementById('canteen-reminder-alert');
    if (banner) banner.classList.add('hidden');
  }

  function markCollected(tokenId) {
    CampusStore.updateCanteenToken(tokenId, {
      status: 'Collected'
    });
    renderQueueBoard();
    if (window.showAppToast) window.showAppToast('Token marked as collected. Enjoy your meal!', 'success');
  }

  function setCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.canteen-cat-btn').forEach(btn => {
      if (btn.dataset.cat === cat) {
        btn.classList.add('bg-orange-600', 'text-white');
        btn.classList.remove('bg-white', 'text-slate-700');
      } else {
        btn.classList.remove('bg-orange-600', 'text-white');
        btn.classList.add('bg-white', 'text-slate-700');
      }
    });
    renderMenu();
  }

  return {
    init: () => {
      renderMenu();
      renderCartBar();
      renderQueueBoard();
    },
    renderMenu,
    addToCart,
    decrementCart,
    clearCart,
    generateToken,
    openTokenModal,
    closeTokenModal,
    renderQueueBoard,
    simulateReady,
    showReminderBanner,
    dismissReminderBanner,
    markCollected,
    setCategory,
    playReminderChime
  };
})();
