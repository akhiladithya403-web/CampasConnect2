/**
 * CampusConnect AI - Authentication & Profile Management
 * Beginner-friendly login and registration supporting:
 * - Student Roll Number (e.g. 22CS108), Gmail/Email, or Phone Number
 * - Password verification
 * - Top Menu Bar integration (Profile Picture, Help Desk, FAQs, Logout)
 */

const CampusAuth = window.CampusAuth = (() => {

  function getCurrentUser() {
    return CampusStore.getCurrentUser();
  }

  function isLoggedIn() {
    return !!CampusStore.getCurrentUser();
  }

  /**
   * Register a new student account
   */
  function register({ fullName, rollNo, identifier, password, department, year, avatar }) {
    if (!fullName || !fullName.trim()) throw new Error('Please enter your full name.');
    if (!rollNo || !rollNo.trim()) throw new Error('Please enter your student Roll Number.');
    if (!identifier || !identifier.trim()) throw new Error('Please enter your email or phone number.');
    if (!password || password.length < 4) throw new Error('Password must be at least 4 characters long.');

    const cleanRoll = rollNo.trim().toUpperCase();
    const isEmail = identifier.includes('@');
    const email = isEmail ? identifier.trim().toLowerCase() : `${identifier.replace(/\D/g, '')}@student.college.edu`;
    const phone = !isEmail ? identifier.trim() : '';

    const users = CampusStore.getUsersList();
    const existing = users.find(u =>
      (u.profile && u.profile.rollNo && u.profile.rollNo.toUpperCase() === cleanRoll) ||
      (isEmail && u.email && u.email.toLowerCase() === email) ||
      (!isEmail && u.phone && u.phone === phone)
    );

    if (existing) {
      if (existing.profile?.rollNo?.toUpperCase() === cleanRoll) {
        throw new Error(`Roll Number "${cleanRoll}" is already registered. Please sign in.`);
      }
      throw new Error(`An account with this email/phone already exists. Please sign in.`);
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    ];
    const chosenAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newUserProfile = {
      id: 'usr_' + Date.now(),
      fullName: fullName.trim(),
      rollNo: cleanRoll,
      email: email,
      phone: phone,
      department: department || 'Computer Science & Engineering',
      year: year || '1st Year (Fresher)',
      avatar: chosenAvatar,
      joinedDate: 'September 2026'
    };

    const newUserRecord = {
      email,
      phone,
      password,
      profile: newUserProfile
    };

    CampusStore.addUser(newUserRecord);
    CampusStore.setCurrentUser(newUserProfile);
    sessionStorage.setItem('cc_authenticated', '1');
    renderAuthUI();

    if (window.showAppToast) {
      window.showAppToast(`Welcome to CampusConnect AI, ${newUserProfile.fullName}!`, 'success');
    }
    if (window.navigateTo) {
      window.navigateTo('home');
    }

    return newUserProfile;
  }

  /**
   * Log in using Roll Number OR Email OR Phone + Password
   */
  function login(identifier, password) {
    if (!identifier || !identifier.trim()) throw new Error('Please enter your Roll Number, Email, or Phone.');
    if (!password) throw new Error('Please enter your password.');

    const cleanId = identifier.trim().toLowerCase();
    const users = CampusStore.getUsersList();

    const matchedUser = users.find(u => {
      const matchRoll = u.profile && u.profile.rollNo && u.profile.rollNo.trim().toLowerCase() === cleanId;
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const matchPhone = u.phone && u.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '');
      return (matchRoll || matchEmail || matchPhone) && u.password === password;
    });

    if (!matchedUser) {
      throw new Error('Invalid Roll Number / Email / Phone or password. Please check your credentials or click "Demo Student Login".');
    }

    CampusStore.setCurrentUser(matchedUser.profile);
    sessionStorage.setItem('cc_authenticated', '1');
    renderAuthUI();

    if (window.showAppToast) {
      window.showAppToast(`Welcome back, ${matchedUser.profile.fullName}!`, 'success');
    }
    if (window.navigateTo) {
      window.navigateTo('home');
    }

    return matchedUser.profile;
  }

  /**
   * Fast Demo Login using pre-seeded student account (Roll: 22CS108)
   */
  function demoLogin() {
    try {
      const errBox = document.getElementById('portal-auth-error');
      if (errBox) {
        errBox.classList.add('hidden');
        errBox.style.display = 'none';
      }
      return login('22CS108', 'password123');
    } catch (err) {
      showAuthError(err.message);
    }
  }

  /**
   * Clean Logout
   */
  function logout() {
    CampusStore.clearCurrentUser();
    sessionStorage.removeItem('cc_authenticated');
    renderAuthUI();
    if (window.showAppToast) {
      window.showAppToast('You have been logged out successfully.', 'info');
    }
    if (window.navigateTo) {
      window.navigateTo('auth');
    }
  }

  /**
   * Update student profile details
   */
  function updateProfile(updatedData) {
    const current = CampusStore.getCurrentUser();
    if (!current) return;

    const updated = { ...current, ...updatedData };
    CampusStore.setCurrentUser(updated);

    const users = CampusStore.getUsersList();
    const idx = users.findIndex(u => u.profile && u.profile.id === current.id);
    if (idx !== -1) {
      users[idx].profile = updated;
      localStorage.setItem('cc_registered_users', JSON.stringify(users));
    }

    renderAuthUI();
    if (window.showAppToast) {
      window.showAppToast('Profile updated successfully!', 'success');
    }
    return updated;
  }

  /**
   * Render Header Menu Bar & Auth State
   */
  function renderAuthUI() {
    const user = getCurrentUser();
    const profileContainer = document.getElementById('navbar-user-profile');
    const authBtnContainer = document.getElementById('navbar-auth-btn-group');

    if (!profileContainer || !authBtnContainer) return;

    if (user) {
      profileContainer.classList.remove('hidden');
      profileContainer.style.display = 'block';
      profileContainer.innerHTML = `
        <div class="relative cursor-pointer" id="user-menu-trigger">
          <div onclick="CampusAuth.openProfileModal()" class="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 transition-colors border border-slate-200" title="Click to view/edit your profile">
            <img src="${user.avatar}" alt="${user.fullName}" class="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500 shadow-xs" />
            <div class="hidden sm:block text-left text-xs leading-tight pr-1">
              <div class="font-bold text-slate-800 truncate max-w-[130px]">${user.fullName}</div>
              <div class="text-blue-600 font-semibold truncate max-w-[130px] text-[11px]"><i class="fa-solid fa-id-card text-[10px] mr-0.5"></i> ${user.rollNo || 'Student'}</div>
            </div>
            <i class="fa-solid fa-user-pen text-slate-400 text-xs hidden sm:inline"></i>
          </div>
        </div>
      `;

      authBtnContainer.innerHTML = `
        <button type="button" onclick="CampusAuth.logout()"
                class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition shadow-xs cursor-pointer"
                title="Log out of CampusConnect AI">
          <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
          <span class="hidden sm:inline">Log Out</span>
        </button>
      `;

      // Update Home Page Menu Bar
      const homeAvatar = document.getElementById('home-user-avatar');
      const homeName = document.getElementById('home-user-name');
      const homeRoll = document.getElementById('home-user-roll');
      const homeDept = document.getElementById('home-user-dept-pill');

      if (homeAvatar) homeAvatar.src = user.avatar;
      if (homeName) homeName.textContent = user.fullName;
      if (homeRoll) homeRoll.textContent = user.rollNo || 'Student';
      if (homeDept) homeDept.textContent = (user.department || 'CSE').split(' ')[0];
    } else {
      profileContainer.classList.add('hidden');
      profileContainer.style.display = 'none';
      profileContainer.innerHTML = '';

      authBtnContainer.innerHTML = `
        <button type="button" onclick="window.navigateTo('auth')"
                class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition cursor-pointer">
          <i class="fa-solid fa-user-lock text-xs"></i>
          <span>Sign In</span>
        </button>
      `;
    }
  }

  function showAuthError(message) {
    const errorBox = document.getElementById('portal-auth-error');
    if (!errorBox) {
      alert(message);
      return;
    }
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
    errorBox.style.display = 'block';
  }

  function switchAuthTab(tab) {
    const loginTab = document.getElementById('auth-portal-tab-login');
    const registerTab = document.getElementById('auth-portal-tab-register');
    const loginPane = document.getElementById('portal-login-pane');
    const registerPane = document.getElementById('portal-register-pane');
    const errorBox = document.getElementById('portal-auth-error');

    if (errorBox) {
      errorBox.classList.add('hidden');
      errorBox.style.display = 'none';
    }

    if (tab === 'login') {
      loginTab?.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      loginTab?.classList.remove('text-slate-300');
      registerTab?.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      registerTab?.classList.add('text-slate-300');

      loginPane?.classList.remove('hidden');
      if (loginPane) loginPane.style.display = 'block';
      registerPane?.classList.add('hidden');
      if (registerPane) registerPane.style.display = 'none';
    } else {
      registerTab?.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      registerTab?.classList.remove('text-slate-300');
      loginTab?.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      loginTab?.classList.add('text-slate-300');

      registerPane?.classList.remove('hidden');
      if (registerPane) registerPane.style.display = 'block';
      loginPane?.classList.add('hidden');
      if (loginPane) loginPane.style.display = 'none';
    }
  }

  function openProfileModal() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('prof-modal-avatar').src = user.avatar;
    document.getElementById('prof-modal-name').value = user.fullName;
    document.getElementById('prof-modal-roll').value = user.rollNo || '';
    document.getElementById('prof-modal-email').value = user.email;
    document.getElementById('prof-modal-dept').value = user.department;
    document.getElementById('prof-modal-year').value = user.year;

    if (window.showAppModal) {
      window.showAppModal('modal-profile-viewer');
    } else {
      const modal = document.getElementById('modal-profile-viewer');
      if (modal) modal.classList.remove('hidden');
    }
  }

  function closeProfileModal() {
    if (window.hideAppModal) {
      window.hideAppModal('modal-profile-viewer');
    } else {
      const modal = document.getElementById('modal-profile-viewer');
      if (modal) modal.classList.add('hidden');
    }
  }

  function saveProfileFromModal(event) {
    if (event) event.preventDefault();
    const fullName = document.getElementById('prof-modal-name')?.value;
    const rollNo = document.getElementById('prof-modal-roll')?.value;
    const department = document.getElementById('prof-modal-dept')?.value;
    const year = document.getElementById('prof-modal-year')?.value;

    if (!fullName || !rollNo) {
      if (window.showAppToast) window.showAppToast('Name and Roll Number are required!', 'error');
      return;
    }

    updateProfile({
      fullName: fullName.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      department,
      year
    });

    closeProfileModal();
  }

  function changeAvatar(url) {
    updateProfile({ avatar: url });
    const img = document.getElementById('prof-modal-avatar');
    if (img) img.src = url;
  }

  async function handlePortalLogin(event) {
    if (event) event.preventDefault();
    const idInput = document.getElementById('portal-login-id');
    const passInput = document.getElementById('portal-login-password');
    if (!idInput || !passInput) return;

    const identifier = idInput.value.trim();
    const password = passInput.value.trim();

    const errorBox = document.getElementById('portal-auth-error');
    if (errorBox) {
      errorBox.classList.add('hidden');
      errorBox.style.display = 'none';
    }

    try {
      // Attempt Java Backend Authentication
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          CampusStore.setCurrentUser(data.user);
          renderAuthUI();
          if (window.showAppToast) {
            window.showAppToast(`Welcome back, ${data.user.fullName}! (Java Backend Verified)`, 'success');
          }
          if (window.navigateTo) {
            window.navigateTo('home');
          }
          return;
        }
      }
    } catch (e) {
      // Offline / Local storage fallback
    }

    try {
      login(identifier, password);
    } catch (err) {
      showAuthError(err.message);
    }
  }

  async function handlePortalRegister(event) {
    if (event) event.preventDefault();
    const nameInput = document.getElementById('portal-reg-fullname');
    const rollInput = document.getElementById('portal-reg-roll');
    const idInput = document.getElementById('portal-reg-id');
    const deptInput = document.getElementById('portal-reg-dept');
    const yearInput = document.getElementById('portal-reg-year');
    const passInput = document.getElementById('portal-reg-password');

    const regData = {
      fullName: nameInput?.value || '',
      rollNo: rollInput?.value || '',
      identifier: idInput?.value || '',
      password: passInput?.value || '',
      department: deptInput?.value || 'Computer Science & Engineering',
      year: yearInput?.value || '1st Year (Fresher)'
    };

    const errorBox = document.getElementById('portal-auth-error');
    if (errorBox) {
      errorBox.classList.add('hidden');
      errorBox.style.display = 'none';
    }

    try {
      // Attempt Java Backend Registration
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          CampusStore.setCurrentUser(data.user);
          CampusStore.addUser({
            email: data.user.email,
            phone: data.user.phone,
            password: regData.password,
            profile: data.user
          });
          renderAuthUI();
          if (window.showAppToast) {
            window.showAppToast(`Account registered on Java Server, ${data.user.fullName}!`, 'success');
          }
          if (window.navigateTo) {
            window.navigateTo('home');
          }
          return;
        }
      }
    } catch (e) {
      // Offline / Local storage fallback
    }

    try {
      register(regData);
    } catch (err) {
      showAuthError(err.message);
    }
  }

  return {
    getCurrentUser,
    isLoggedIn,
    login,
    register,
    demoLogin,
    logout,
    updateProfile,
    renderAuthUI,
    showAuthError,
    switchAuthTab,
    openProfileModal,
    closeProfileModal,
    saveProfileFromModal,
    changeAvatar,
    handlePortalLogin,
    handlePortalRegister
  };
})();
