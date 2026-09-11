/**
 * CampusConnect AI - Student Complaints and Campus Issues
 * Domain 5:
 * 1. Unified portal for reporting Campus Facility Issues (Drinking water, Broken benches, Fans)
 *    and Student Complaints (Canteen hygiene, Transport, Hostels, Anti-ragging)
 * 2. Photo and Video proof upload with live playback preview
 * 3. AI Priority Triage (Critical, High, Medium, Low) and department routing
 * 4. Mail Automation: Sends receipt email with Complaint Tracking ID and resolution updates
 * 5. Upvote system for campus problems
 */

const CampusComplaintsIssues = window.CampusComplaintsIssues = (() => {

  let activeFilter = 'all'; // 'all', 'facility', 'complaint'
  let uploadedMediaData = { url: '', type: '' };

  function renderList() {
    const container = document.getElementById('complaints-issues-list');
    if (!container) return;

    let items = CampusStore.getIssues();
    if (activeFilter !== 'all') {
      items = items.filter(item => item.domainType === activeFilter);
    }

    const searchQuery = (document.getElementById('issues-search-input')?.value || '').toLowerCase();
    if (searchQuery) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery) ||
        item.block.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-clipboard-check text-4xl text-slate-300 mb-2"></i>
          <p class="text-sm font-semibold text-slate-700">No issues or complaints found</p>
          <p class="text-xs text-slate-400 mt-1">Click "Post Issue / Complaint" to report a campus problem.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const isVideo = item.mediaType === 'video';
      const isFacility = item.domainType === 'facility';

      return `
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col md:flex-row gap-5">
          <!-- Media Thumbnail / Video Preview -->
          ${item.mediaUrl ? `
            <div class="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative flex items-center justify-center">
              ${isVideo ? `
                <video src="${item.mediaUrl}" controls class="w-full h-full object-cover"></video>
                <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                  <i class="fa-solid fa-video mr-1"></i> Video Proof
                </span>
              ` : `
                <img src="${item.mediaUrl}" alt="${item.title}" class="w-full h-full object-cover" />
                <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                  <i class="fa-regular fa-image mr-1"></i> Photo Proof
                </span>
              `}
            </div>
          ` : ''}

          <!-- Content Details -->
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isFacility ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'
                  }">
                    ${isFacility ? 'Campus Facility' : 'Student Grievance'}
                  </span>
                  <span class="text-xs font-semibold text-slate-500">${item.category}</span>
                </div>

                <!-- Status Badge -->
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(item.status)}">
                  ${item.status}
                </span>
              </div>

              <h3 class="text-base font-bold text-slate-900 leading-snug">${item.title}</h3>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed">${item.description}</p>

              <!-- Location & AI Triage Meta -->
              <div class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <i class="fa-solid fa-location-dot text-rose-500 mr-1"></i>
                  <strong>${item.block}</strong> ${item.floor ? `&bull; ${item.floor}` : ''} (${item.locationDetails})
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-slate-400">Assigned:</span>
                  <span class="font-semibold text-slate-700">${item.aiTriage?.department || 'Facilities Desk'}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityClass(item.priority)}">
                    ${item.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer: Reporter & Upvote -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Reported by <strong class="text-slate-700">${item.reportedBy}</strong>
                ${item.reporterRollNo ? `(Roll: ${item.reporterRollNo})` : ''} &bull; ${item.reportedAt}
              </div>

              <button type="button" onclick="CampusComplaintsIssues.upvoteIssue('${item.id}')"
                      class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs">
                <i class="fa-regular fa-thumbs-up"></i>
                <span>Affected Too (${item.upvotes || 0})</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Under Review':
      case 'Under Investigation': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  function getPriorityClass(p) {
    switch (p) {
      case 'Critical': return 'bg-rose-100 text-rose-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  function setFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll('.ci-filter-btn').forEach(b => {
      if (b.dataset.filter === filter) {
        b.classList.add('bg-blue-600', 'text-white');
        b.classList.remove('bg-white', 'text-slate-700');
      } else {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-white', 'text-slate-700');
      }
    });
    renderList();
  }

  function upvoteIssue(issueId) {
    const issues = CampusStore.getIssues();
    const item = issues.find(i => i.id === issueId);
    if (!item) return;

    item.upvotes = (item.upvotes || 0) + 1;
    CampusStore.updateIssue(issueId, { upvotes: item.upvotes });
    renderList();
    if (window.showAppToast) window.showAppToast(`Upvoted! Priority escalated (+1)`, 'success');
  }

  function openPostModal() {
    const user = CampusStore.getCurrentUser();
    if (!user) {
      if (window.showAppToast) window.showAppToast('Please sign in to lodge a complaint or issue.', 'info');
      if (window.navigateTo) window.navigateTo('auth');
      return;
    }

    const modal = document.getElementById('modal-post-complaint-issue');
    if (!modal) return;

    // Reset fields
    document.getElementById('ci-form')?.reset();
    uploadedMediaData = { url: '', type: '' };
    document.getElementById('ci-media-preview-box')?.classList.add('hidden');

    document.getElementById('ci-reporter-name').value = user.fullName;
    document.getElementById('ci-reporter-roll').value = user.rollNo || '';
    document.getElementById('ci-reporter-email').value = user.email;

    if (window.showAppModal) {
      window.showAppModal('modal-post-complaint-issue');
    } else {
      modal.classList.remove('hidden');
    }
  }

  function closePostModal() {
    if (window.hideAppModal) {
      window.hideAppModal('modal-post-complaint-issue');
    } else {
      const modal = document.getElementById('modal-post-complaint-issue');
      if (modal) modal.classList.add('hidden');
    }
  }

  function handleMediaFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const previewBox = document.getElementById('ci-media-preview-box');
    const previewImg = document.getElementById('ci-preview-img');
    const previewVideo = document.getElementById('ci-preview-video');
    const isVideo = file.type.startsWith('video');

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedMediaData = {
        url: e.target.result,
        type: isVideo ? 'video' : 'image'
      };

      if (previewBox) previewBox.classList.remove('hidden');

      if (isVideo) {
        if (previewImg) previewImg.classList.add('hidden');
        if (previewVideo) {
          previewVideo.classList.remove('hidden');
          previewVideo.src = e.target.result;
        }
      } else {
        if (previewVideo) previewVideo.classList.add('hidden');
        if (previewImg) {
          previewImg.classList.remove('hidden');
          previewImg.src = e.target.result;
        }
      }
    };
    reader.readAsDataURL(file);
  }

  function handleFormSubmit(event) {
    if (event) event.preventDefault();
    const user = CampusStore.getCurrentUser();
    if (!user) return;

    const title = document.getElementById('ci-title')?.value;
    const category = document.getElementById('ci-category')?.value;
    const domainType = document.getElementById('ci-domain-type')?.value || 'facility';
    const block = document.getElementById('ci-block')?.value;
    const floor = document.getElementById('ci-floor')?.value || 'Ground Floor';
    const locationDetails = document.getElementById('ci-location-details')?.value || '';
    const description = document.getElementById('ci-description')?.value;
    const priority = document.getElementById('ci-priority')?.value || 'High';

    if (!title || !description) {
      if (window.showAppToast) window.showAppToast('Please enter both title and description.', 'error');
      return;
    }

    // Default sample image if none provided
    const mediaUrl = uploadedMediaData.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    const mediaType = uploadedMediaData.type || 'image';

    const newTicketId = (domainType === 'facility' ? 'ISS-' : 'CMP-') + Math.floor(100 + Math.random() * 900);

    const issueObj = {
      id: newTicketId,
      title: title.trim(),
      category,
      domainType,
      block,
      floor,
      locationDetails,
      description: description.trim(),
      mediaUrl,
      mediaType,
      status: 'Reported',
      priority,
      reportedBy: user.fullName,
      reporterRollNo: user.rollNo,
      reporterEmail: user.email,
      reportedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upvotes: 1,
      aiTriage: {
        urgency: priority,
        department: getDepartmentForCategory(category),
        actionEstimate: 'Logged in system. Inspection squad assigned.'
      }
    };

    CampusStore.addIssue(issueObj);

    // Mail Automation
    CampusMailer.sendComplaintReceipt(issueObj, user);

    closePostModal();
    renderList();
  }

  function getDepartmentForCategory(cat) {
    if (cat.includes('Water') || cat.includes('Sanitation')) return 'Plumbing & Sanitation Cell';
    if (cat.includes('Benches') || cat.includes('Furniture')) return 'Estate & Carpentry Department';
    if (cat.includes('Electrical') || cat.includes('Fan')) return 'Electrical Maintenance Works';
    if (cat.includes('Canteen') || cat.includes('Mess')) return 'Canteen Food Hygiene Committee';
    if (cat.includes('Transport')) return 'Campus Transport & Bus Management';
    if (cat.includes('Hostel')) return 'Chief Warden & Hostel Maintenance';
    if (cat.includes('Ragging')) return 'Anti-Ragging Squad & Student Proctor Office';
    return 'Campus General Maintenance';
  }

  return {
    init: () => {
      renderList();
    },
    renderList,
    setFilter,
    upvoteIssue,
    openPostModal,
    closePostModal,
    handleMediaFileChange,
    handleFormSubmit
  };
})();
