/**
 * CampusConnect AI - Central Router & Application Coordinator
 * Coordinates:
 * 1. Global navigation history stack & universal back button
 * 2. Top menu bar (Profile Picture, Help Desk, FAQs, Logout, Mailbox)
 * 3. Five specialized campus domains (Lost & Found, Canteen Queue, Navigation with Voice, Events & Games, Complaints & Issues)
 * 4. Toast engine & Web Audio synthesizer
 */

// Global navigation history stack
const NavigationStack = {
  history: ['home'],
  currentView: 'home',

  push(viewId) {
    if (this.currentView === viewId) return;
    this.history.push(viewId);
    this.currentView = viewId;
    this.updateUI();
  },

  back() {
    if (this.history.length > 1) {
      this.history.pop();
      const prev = this.history[this.history.length - 1] || 'home';
      this.currentView = prev;
      window.navigateTo(prev, false);
    } else {
      window.navigateTo('home', false);
    }
  },

  updateUI() {
    const backBtn = document.getElementById('global-back-button');
    const breadcrumb = document.getElementById('navbar-breadcrumb');
    const helpdeskBtn = document.getElementById('nav-helpdesk-btn');
    const faqBtn = document.getElementById('nav-faq-btn');
    const mailboxBtn = document.getElementById('nav-mailbox-btn');

    if (this.currentView === 'auth') {
      if (backBtn) {
        backBtn.classList.add('opacity-0', 'pointer-events-none', 'invisible');
        backBtn.style.display = 'none';
      }
      if (breadcrumb) {
        breadcrumb.innerHTML = `<span class="text-blue-600 font-bold"><i class="fa-solid fa-user-lock mr-1.5 text-xs"></i>Student Access Portal</span>`;
      }
      if (helpdeskBtn) helpdeskBtn.style.display = 'none';
      if (faqBtn) faqBtn.style.display = 'none';
      if (mailboxBtn) mailboxBtn.style.display = 'none';
      return;
    } else {
      if (helpdeskBtn) helpdeskBtn.style.display = 'inline-flex';
      if (faqBtn) faqBtn.style.display = 'inline-flex';
      if (mailboxBtn) mailboxBtn.style.display = 'inline-flex';
    }

    if (!backBtn) return;

    if (this.currentView === 'home') {
      backBtn.classList.add('opacity-0', 'pointer-events-none', 'invisible');
      backBtn.classList.remove('opacity-100', 'visible');
      backBtn.style.display = 'none';
      if (breadcrumb) breadcrumb.innerHTML = `<span class="text-slate-400">Campus Overview</span>`;
    } else {
      backBtn.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
      backBtn.classList.add('opacity-100', 'visible');
      backBtn.style.display = 'inline-flex';

      const viewNames = {
        'lost-found': 'Lost & Found System',
        'canteen': 'Canteen Queue System',
        'navigation': 'Campus Navigation (Voice Guide)',
        'events-games': 'Events & Games Registration',
        'complaints-issues': 'Student Complaints & Campus Issues',
        'helpdesk': 'Help Desk & Emergency',
        'mailbox': 'Automated Virtual Mailbox'
      };

      if (breadcrumb) {
        breadcrumb.innerHTML = `
          <a href="javascript:void(0)" onclick="window.navigateTo('home')" class="hover:text-blue-600 transition">Home</a>
          <span class="text-slate-300">/</span>
          <span class="text-blue-600 font-semibold">${viewNames[this.currentView] || this.currentView}</span>
        `;
      }
    }
  }
};

/**
 * Universal View Navigator
 */
window.navigateTo = function(viewId, pushHistory = true) {
  const loggedIn = window.CampusAuth ? window.CampusAuth.isLoggedIn() : false;

  // Strict route protection: If not logged in, force navigation to 'auth'
  if (!loggedIn && viewId !== 'auth') {
    viewId = 'auth';
    if (window.showAppToast) {
      window.showAppToast('Please sign in or register with your Roll Number.', 'info');
    }
  }

  // Handle alias redirects
  if (viewId === 'issues' || viewId === 'complaints') viewId = 'complaints-issues';
  if (viewId === 'events' || viewId === 'games') viewId = 'events-games';

  // If already logged in and navigating to 'auth', redirect to 'home'
  if (loggedIn && viewId === 'auth') {
    viewId = 'home';
  }

  const views = document.querySelectorAll('.app-view');
  views.forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('block');
    v.style.display = 'none';
  });

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('block');
    targetView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (pushHistory) {
    NavigationStack.push(viewId);
  } else {
    NavigationStack.currentView = viewId;
    NavigationStack.updateUI();
  }

  // Domain specific view refresh triggers
  try {
    if (viewId === 'lost-found' && window.CampusLostFound) CampusLostFound.renderItems();
    if (viewId === 'canteen' && window.CampusCanteen) {
      CampusCanteen.renderMenu();
      CampusCanteen.renderQueueBoard();
    }
    if (viewId === 'navigation' && window.CampusNavigator) CampusNavigator.init();
    if (viewId === 'events-games' && window.CampusEventsGames) CampusEventsGames.renderItems();
    if (viewId === 'complaints-issues' && window.CampusComplaintsIssues) CampusComplaintsIssues.renderList();
    if (viewId === 'mailbox') renderMailboxView();
    if (viewId === 'faqs' && window.CampusFAQ) CampusFAQ.renderFAQs();
  } catch (err) {
    console.error('Error refreshing domain view:', err);
  }
};

window.goBack = function() {
  NavigationStack.back();
};

/**
 * Modal helpers
 */
window.showAppModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
  }
};

window.hideAppModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
};

/**
 * Toast Notification Engine
 */
window.showAppToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'warning' ? 'bg-amber-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';

  toast.className = `toast-animate flex items-center space-x-3 px-4 py-3 rounded-xl text-white text-xs font-medium shadow-2xl ${bg} pointer-events-auto transition-all max-w-md`;
  toast.innerHTML = `
    <div class="text-base">
      ${type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : type === 'warning' ? '<i class="fa-solid fa-bell"></i>' : type === 'error' ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-info-circle"></i>'}
    </div>
    <div class="flex-1">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white ml-2">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

/**
 * File upload helper for Photo and Video files with instant preview
 */
window.handleMediaUpload = function(inputEl, previewContainerId) {
  const file = inputEl.files[0];
  const container = document.getElementById(previewContainerId);
  if (!file || !container) return;

  const isVideo = file.type.startsWith('video/');
  const reader = new FileReader();

  reader.onload = function(e) {
    const dataUrl = e.target.result;
    container.dataset.mediaUrl = dataUrl;
    container.dataset.mediaType = isVideo ? 'video' : 'image';

    container.innerHTML = `
      <div class="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-52 flex items-center justify-center">
        ${
          isVideo ? `
            <video src="${dataUrl}" controls class="w-full max-h-52"></video>
          ` : `
            <img src="${dataUrl}" class="w-full max-h-52 object-cover" />
          `
        }
        <button type="button" onclick="clearMediaUpload('${inputEl.id}', '${previewContainerId}')"
                class="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1.5 hover:bg-rose-700 transition shadow">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
        <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white uppercase">
          ${isVideo ? 'Video Uploaded' : 'Photo Uploaded'}
        </span>
      </div>
    `;
  };

  reader.readAsDataURL(file);
};

window.clearMediaUpload = function(inputId, previewContainerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(previewContainerId);
  if (input) input.value = '';
  if (container) {
    delete container.dataset.mediaUrl;
    delete container.dataset.mediaType;
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400">
        <i class="fa-solid fa-cloud-arrow-up text-3xl mb-2 text-slate-400"></i>
        <p class="text-xs font-semibold text-slate-600">Click or drag & drop to upload Photo or Video</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, MP4, WEBM up to 25MB</p>
      </div>
    `;
  }
};

/**
 * Virtual Mailbox View Engine
 */
function renderMailboxView() {
  const listEl = document.getElementById('mailbox-letters-list');
  if (!listEl) return;

  const mails = CampusStore.getMailbox();
  const unreadCount = mails.filter(m => !m.read).length;

  updateMailboxBadges(unreadCount);

  if (mails.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <i class="fa-regular fa-envelope-open text-4xl text-slate-300 mb-2"></i>
        <p class="text-sm font-semibold text-slate-700">No emails yet</p>
        <p class="text-xs text-slate-400 mt-1">Automated emails for canteen tokens, match alerts, events, and complaints will appear here.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = mails.map(m => `
    <div onclick="openMailReader('${m.id}')"
         class="cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
           !m.read ? 'bg-blue-50/70 border-blue-200 font-medium' : 'bg-white hover:bg-slate-50 border-slate-200'
         }">
      <div class="flex items-center justify-between gap-2 mb-1">
        <div class="flex items-center gap-2">
          ${!m.read ? '<span class="w-2 h-2 rounded-full bg-blue-600"></span>' : ''}
          <span class="text-xs text-slate-500 font-semibold truncate max-w-[220px]">${m.sender}</span>
        </div>
        <span class="text-[11px] text-slate-400 whitespace-nowrap">${m.date}</span>
      </div>
      <h4 class="text-sm text-slate-900 ${!m.read ? 'font-bold' : 'font-semibold'} truncate mb-1">${m.subject}</h4>
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span class="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">${m.category || 'Notification'}</span>
        <span class="text-blue-600 hover:underline">Click to open & view email &rarr;</span>
      </div>
    </div>
  `).join('');
}

function openMailReader(mailId) {
  const mail = CampusStore.getMailbox().find(m => m.id === mailId);
  if (!mail) return;

  CampusStore.markMailAsRead(mailId);
  renderMailboxView();

  document.getElementById('mail-reader-subject').textContent = mail.subject;
  document.getElementById('mail-reader-sender').textContent = mail.sender;
  document.getElementById('mail-reader-recipient').textContent = mail.recipient;
  document.getElementById('mail-reader-date').textContent = mail.date;
  document.getElementById('mail-reader-content').innerHTML = mail.body;

  window.showAppModal('mail-reader-modal');
}

function closeMailReader() {
  window.hideAppModal('mail-reader-modal');
}

function updateMailboxBadges(count) {
  const badges = document.querySelectorAll('.mailbox-badge');
  badges.forEach(b => {
    if (count > 0) {
      b.textContent = count;
      b.classList.remove('hidden');
      b.style.display = 'flex';
    } else {
      b.classList.add('hidden');
      b.style.display = 'none';
    }
  });
}

// Global listener for new incoming mail
window.addEventListener('campus_new_mail', (e) => {
  const mails = CampusStore.getMailbox();
  const unreadCount = mails.filter(m => !m.read).length;
  updateMailboxBadges(unreadCount);
});

/**
 * Initialize on DOM Load
 */
document.addEventListener('DOMContentLoaded', () => {
  CampusAuth.renderAuthUI();

  const mails = CampusStore.getMailbox();
  updateMailboxBadges(mails.filter(m => !m.read).length);

  setupEventHandlers();

  // If user is authenticated, open home dashboard; otherwise show auth gate
  if (CampusAuth.isLoggedIn()) {
    window.navigateTo('home');
  } else {
    window.navigateTo('auth');
  }
});

function setupEventHandlers() {
  // 1. Portal Login Form
  const portalLoginForm = document.getElementById('portal-login-form');
  if (portalLoginForm) {
    portalLoginForm.addEventListener('submit', (e) => {
      CampusAuth.handlePortalLogin(e);
    });
  }

  // 2. Portal Register Form
  const portalRegForm = document.getElementById('portal-register-form');
  if (portalRegForm) {
    portalRegForm.addEventListener('submit', (e) => {
      CampusAuth.handlePortalRegister(e);
    });
  }

  // 3. Lost & Found Form
  const lfForm = document.getElementById('lost-found-form');
  if (lfForm) {
    lfForm.addEventListener('submit', (e) => {
      CampusLostFound.handleFormSubmit(e);
    });
  }

  // 4. Events & Games Reg Form
  const egForm = document.getElementById('eg-register-form');
  if (egForm) {
    egForm.addEventListener('submit', (e) => {
      CampusEventsGames.handleRegistrationSubmit(e);
    });
  }

  // 5. Complaints & Issues Form
  const ciForm = document.getElementById('ci-form');
  if (ciForm) {
    ciForm.addEventListener('submit', (e) => {
      CampusComplaintsIssues.handleFormSubmit(e);
    });
  }

  // 6. Profile Edit Form
  const profileForm = document.getElementById('profile-edit-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      CampusAuth.saveProfileFromModal(e);
    });
  }
}
