/**
 * CampusConnect AI - Events and Games Registration
 * Domain 4:
 * 1. Browse and register for Campus Events (Hackathons, Workshops, Summits)
 * 2. Browse and register for Games & Sports Tournaments (Cricket, Football, Badminton, Esports)
 * 3. Pre-fills student Roll Number, Name, Department, and Year of study
 * 4. Mail Automation: Sends digital Admission Pass / Athlete Pass to user's registered email
 */

const CampusEventsGames = window.CampusEventsGames = (() => {

  let activeTab = 'events'; // 'events' or 'games'
  let currentTargetItem = null;

  function switchTab(tab) {
    activeTab = tab;
    const tabEvents = document.getElementById('tab-btn-events');
    const tabGames = document.getElementById('tab-btn-games');

    if (tab === 'events') {
      tabEvents?.classList.add('bg-blue-600', 'text-white', 'shadow-xs');
      tabEvents?.classList.remove('text-slate-600', 'bg-transparent');
      tabGames?.classList.remove('bg-blue-600', 'text-white', 'shadow-xs');
      tabGames?.classList.add('text-slate-600', 'bg-transparent');
    } else {
      tabGames?.classList.add('bg-blue-600', 'text-white', 'shadow-xs');
      tabGames?.classList.remove('text-slate-600', 'bg-transparent');
      tabEvents?.classList.remove('bg-blue-600', 'text-white', 'shadow-xs');
      tabEvents?.classList.add('text-slate-600', 'bg-transparent');
    }

    renderItems();
  }

  function renderItems() {
    const container = document.getElementById('events-games-grid');
    if (!container) return;

    const searchQuery = (document.getElementById('events-games-search')?.value || '').toLowerCase();

    if (activeTab === 'events') {
      let events = CampusStore.getEvents();
      if (searchQuery) {
        events = events.filter(e =>
          e.title.toLowerCase().includes(searchQuery) ||
          e.category.toLowerCase().includes(searchQuery) ||
          e.venue.toLowerCase().includes(searchQuery) ||
          e.description.toLowerCase().includes(searchQuery)
        );
      }

      if (events.length === 0) {
        container.innerHTML = `<div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200"><p class="text-xs text-slate-500">No events found matching your search.</p></div>`;
        return;
      }

      container.innerHTML = events.map(ev => `
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group">
          <div>
            <div class="relative h-44 w-full overflow-hidden bg-slate-100">
              <img src="${ev.banner}" alt="${ev.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-blue-700 shadow-xs">
                ${ev.category}
              </span>
              <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
                ${ev.seatsFilled}/${ev.seatsTotal} Registered
              </span>
            </div>

            <div class="p-5">
              <h3 class="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">${ev.title}</h3>
              <div class="flex items-center space-x-3 text-xs text-slate-500 mt-2.5">
                <span><i class="fa-regular fa-calendar mr-1 text-blue-600"></i>${ev.date}</span>
                <span>&bull;</span>
                <span><i class="fa-solid fa-location-dot mr-1 text-rose-500"></i>${ev.venue}</span>
              </div>
              <p class="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">${ev.description}</p>
              <div class="flex flex-wrap gap-1 mt-3">
                ${ev.tags.map(t => `<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">${t}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="p-5 pt-0">
            <button type="button" onclick="CampusEventsGames.openRegisterModal('event', '${ev.id}')"
                    class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer">
              <i class="fa-solid fa-ticket"></i>
              <span>Register for Event (Get Pass)</span>
            </button>
          </div>
        </div>
      `).join('');
    } else {
      let games = CampusStore.getGames();
      if (searchQuery) {
        games = games.filter(g =>
          g.title.toLowerCase().includes(searchQuery) ||
          g.sport.toLowerCase().includes(searchQuery) ||
          g.venue.toLowerCase().includes(searchQuery) ||
          g.teamFormat.toLowerCase().includes(searchQuery)
        );
      }

      if (games.length === 0) {
        container.innerHTML = `<div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200"><p class="text-xs text-slate-500">No tournaments found matching your search.</p></div>`;
        return;
      }

      container.innerHTML = games.map(gm => `
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group">
          <div>
            <div class="relative h-44 w-full overflow-hidden bg-slate-100">
              <img src="${gm.banner}" alt="${gm.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                ${gm.sport.toUpperCase()}
              </span>
              <span class="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
                ${gm.registeredTeams}/${gm.maxTeams} Teams
              </span>
            </div>

            <div class="p-5">
              <h3 class="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors">${gm.title}</h3>
              <div class="flex items-center space-x-3 text-xs text-slate-500 mt-2.5">
                <span><i class="fa-regular fa-clock mr-1 text-amber-600"></i>${gm.schedule}</span>
                <span>&bull;</span>
                <span><i class="fa-solid fa-trophy mr-1 text-amber-500"></i>${gm.teamFormat}</span>
              </div>
              <p class="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">${gm.description}</p>
              <div class="mt-3 text-[11px] font-medium text-slate-500">
                <i class="fa-solid fa-user-shield text-slate-400 mr-1"></i> Referee/Coach: ${gm.coordinator}
              </div>
            </div>
          </div>

          <div class="p-5 pt-0">
            <button type="button" onclick="CampusEventsGames.openRegisterModal('game', '${gm.id}')"
                    class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer">
              <i class="fa-solid fa-medal"></i>
              <span>Register for Tournament (Athlete Pass)</span>
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  function openRegisterModal(type, id) {
    const user = CampusStore.getCurrentUser();
    if (!user) {
      if (window.showAppToast) window.showAppToast('Please sign in to register.', 'info');
      if (window.navigateTo) window.navigateTo('auth');
      return;
    }

    let targetItem = null;
    if (type === 'event') {
      targetItem = CampusStore.getEvents().find(e => e.id === id);
    } else {
      targetItem = CampusStore.getGames().find(g => g.id === id);
    }

    if (!targetItem) return;
    currentTargetItem = { type, data: targetItem };

    const modal = document.getElementById('modal-event-game-reg');
    if (!modal) return;

    document.getElementById('eg-modal-title').textContent = targetItem.title;
    document.getElementById('eg-modal-type-badge').textContent = type === 'event' ? 'CAMPUS EVENT' : 'SPORTS TOURNAMENT';
    document.getElementById('eg-reg-name').value = user.fullName || '';
    document.getElementById('eg-reg-roll').value = user.rollNo || '';
    document.getElementById('eg-reg-email').value = user.email || '';
    document.getElementById('eg-reg-dept').value = user.department || 'Computer Science & Engineering';
    document.getElementById('eg-reg-year').value = user.year || '1st Year (Fresher)';

    const teamField = document.getElementById('eg-reg-team-group');
    if (teamField) {
      if (type === 'game') {
        teamField.classList.remove('hidden');
      } else {
        teamField.classList.add('hidden');
      }
    }

    if (window.showAppModal) {
      window.showAppModal('modal-event-game-reg');
    } else {
      modal.classList.remove('hidden');
    }
  }

  function closeRegisterModal() {
    if (window.hideAppModal) {
      window.hideAppModal('modal-event-game-reg');
    } else {
      const modal = document.getElementById('modal-event-game-reg');
      if (modal) modal.classList.add('hidden');
    }
    currentTargetItem = null;
  }

  function handleRegistrationSubmit(event) {
    if (event) event.preventDefault();
    if (!currentTargetItem) return;

    const fullName = document.getElementById('eg-reg-name')?.value;
    const rollNo = document.getElementById('eg-reg-roll')?.value;
    const email = document.getElementById('eg-reg-email')?.value;
    const department = document.getElementById('eg-reg-dept')?.value;
    const year = document.getElementById('eg-reg-year')?.value;
    const teamName = document.getElementById('eg-reg-team')?.value || 'Solo Participant';

    if (!fullName || !rollNo || !email) {
      if (window.showAppToast) window.showAppToast('Please fill all required fields.', 'error');
      return;
    }

    const studentData = {
      fullName: fullName.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      email: email.trim(),
      department,
      year,
      teamName
    };

    if (currentTargetItem.type === 'event') {
      CampusStore.registerForEvent({
        eventId: currentTargetItem.data.id,
        ...studentData,
        registeredAt: new Date().toLocaleString()
      });
      // Mail Automation
      CampusMailer.sendEventRegistrationConfirmation(currentTargetItem.data, studentData);
    } else {
      CampusStore.registerForGame({
        gameId: currentTargetItem.data.id,
        ...studentData,
        registeredAt: new Date().toLocaleString()
      });
      // Mail Automation
      CampusMailer.sendGameRegistrationConfirmation(currentTargetItem.data, studentData);
    }

    closeRegisterModal();
    renderItems();
  }

  return {
    init: () => {
      renderItems();
    },
    switchTab,
    renderItems,
    openRegisterModal,
    closeRegisterModal,
    handleRegistrationSubmit
  };
})();
