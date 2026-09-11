/**
 * Campus Fix AI - Lost & Found System
 * Handles Lost & Found reports with photo/video uploads, AI similarity matching,
 * and automated email dispatch upon detection of matching items.
 */

const CampusLostFound = window.CampusLostFound = (() => {

  let activeFilter = 'all';

  /**
   * AI Matching Logic: calculates similarity score between a lost and a found item
   */
  function calculateSimilarity(itemA, itemB) {
    let score = 0;
    let maxScore = 100;

    // 1. Category match (30 pts)
    if (itemA.category && itemB.category && itemA.category.toLowerCase() === itemB.category.toLowerCase()) {
      score += 30;
    }

    // 2. Title token matching (35 pts)
    const tokensA = (itemA.title || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2);
    const tokensB = (itemB.title || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2);

    let matchingTokens = 0;
    tokensA.forEach(t => {
      if (tokensB.includes(t)) matchingTokens++;
    });

    if (tokensA.length > 0) {
      const titleRatio = matchingTokens / Math.min(tokensA.length, tokensB.length || 1);
      score += Math.min(35, Math.round(titleRatio * 35));
    }

    // 3. Location proximity (15 pts)
    const locA = (itemA.location || '').toLowerCase();
    const locB = (itemB.location || '').toLowerCase();
    const keywords = ['science', 'tech', 'main', 'library', 'lab', 'canteen', 'ground', 'bench', 'gate', 'block'];
    for (const kw of keywords) {
      if (locA.includes(kw) && locB.includes(kw)) {
        score += 15;
        break;
      }
    }

    // 4. Description overlap (20 pts)
    const descA = (itemA.description || '').toLowerCase();
    const descB = (itemB.description || '').toLowerCase();
    const commonWords = ['black', 'blue', 'silver', 'casio', 'wallet', 'calculator', 'bag', 'card', 'key', 'cash', 'money', 'dell', 'bottle'];
    let descMatches = 0;
    commonWords.forEach(word => {
      if (descA.includes(word) && descB.includes(word)) descMatches++;
    });
    score += Math.min(20, descMatches * 10);

    return Math.min(99, Math.max(score, 20));
  }

  /**
   * Run AI Matcher across all pairs to find matches
   */
  function findAIMatchesForNewItem(newItem) {
    const allItems = CampusStore.getLostFound();
    const targetType = newItem.type === 'lost' ? 'found' : 'lost';
    const candidates = allItems.filter(i => i.type === targetType && i.id !== newItem.id && i.status !== 'Resolved');

    const matches = [];
    candidates.forEach(candidate => {
      const score = calculateSimilarity(newItem, candidate);
      if (score >= 50) {
        matches.push({
          candidate,
          score
        });
      }
    });

    return matches;
  }

  /**
   * Submit a new report (Lost or Found)
   */
  function submitReport(formData) {
    const user = CampusAuth.getCurrentUser();
    const isLost = formData.type === 'lost';

    const newItem = {
      id: 'lf_' + Date.now(),
      type: formData.type, // 'lost' or 'found'
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location.trim(),
      date: formData.date || new Date().toISOString().split('T')[0],
      description: formData.description.trim(),
      contactEmail: formData.contactEmail || (user ? user.email : 'student@college.edu'),
      contactPhone: formData.contactPhone || (user ? user.phone : ''),
      reporterRollNo: user ? user.rollNo : 'Student',
      finderName: !isLost ? (formData.finderName || (user ? user.fullName : 'Anonymous Student')) : undefined,
      mediaUrl: formData.mediaUrl || '',
      mediaType: formData.mediaType || 'image',
      status: 'Open',
      createdAt: new Date().toLocaleString()
    };

    CampusStore.addLostFoundItem(newItem);

    // Run AI Matching Engine
    const matches = findAIMatchesForNewItem(newItem);

    if (matches.length > 0) {
      matches.sort((a, b) => b.score - a.score);
      const topMatch = matches[0];

      // Update statuses to indicate match
      CampusStore.updateLostFoundItem(newItem.id, { status: 'AI Match Detected' });
      CampusStore.updateLostFoundItem(topMatch.candidate.id, { status: 'AI Match Detected' });

      // Automatically dispatch email notification to the lost item owner
      const lostItem = isLost ? newItem : topMatch.candidate;
      const foundItem = isLost ? topMatch.candidate : newItem;
      CampusMailer.sendLostFoundMatchAlert(lostItem, foundItem, topMatch.score);

      showMatchCelebrationModal(lostItem, foundItem, topMatch.score);
    } else {
      if (window.showAppToast) {
        window.showAppToast(`Success! Your ${formData.type} item report is published. AI is monitoring for matches.`, 'success');
      }
    }

    renderItems();
    return newItem;
  }

  /**
   * Modal displaying live match celebration
   */
  function showMatchCelebrationModal(lostItem, foundItem, score) {
    document.getElementById('match-score-badge').textContent = `${score}% AI Match Confidence`;
    document.getElementById('match-lost-title').textContent = lostItem.title;
    document.getElementById('match-found-title').textContent = foundItem.title;
    document.getElementById('match-found-location').textContent = foundItem.location;
    document.getElementById('match-found-desc').textContent = foundItem.description;
    const emailTarget = document.getElementById('match-user-email-target');
    if (emailTarget) emailTarget.textContent = lostItem.contactEmail;

    window.showAppModal('ai-match-modal');
  }

  function closeMatchModal() {
    window.hideAppModal('ai-match-modal');
  }

  /**
   * Render Lost & Found items into grid
   */
  function renderItems() {
    const container = document.getElementById('lost-found-grid');
    if (!container) return;

    let items = CampusStore.getLostFound();

    if (activeFilter === 'lost') {
      items = items.filter(i => i.type === 'lost');
    } else if (activeFilter === 'found') {
      items = items.filter(i => i.type === 'found');
    } else if (activeFilter === 'matched') {
      items = items.filter(i => i.status.includes('Match'));
    }

    const searchQuery = (document.getElementById('lost-found-search')?.value || '').toLowerCase();
    if (searchQuery) {
      items = items.filter(i =>
        i.title.toLowerCase().includes(searchQuery) ||
        i.location.toLowerCase().includes(searchQuery) ||
        i.description.toLowerCase().includes(searchQuery) ||
        i.category.toLowerCase().includes(searchQuery)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-magnifying-glass text-4xl text-slate-300 mb-3"></i>
          <h3 class="text-lg font-semibold text-slate-700">No items found</h3>
          <p class="text-sm text-slate-500 mt-1">Try adjusting your search query or filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => {
      const isLost = item.type === 'lost';
      const badgeColor = isLost ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
      const isMatched = item.status.includes('Match');

      return `
        <div class="glass-card rounded-2xl overflow-hidden border ${isMatched ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'} flex flex-col justify-between">
          <!-- Media Preview (Photo or Video) -->
          <div class="relative bg-slate-900 h-48 flex items-center justify-center overflow-hidden">
            ${
              item.mediaUrl ? (
                item.mediaType === 'video' ? `
                  <video src="${item.mediaUrl}" controls class="w-full h-full object-cover"></video>
                ` : `
                  <img src="${item.mediaUrl}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                `
              ) : `
                <div class="text-slate-500 text-center p-4">
                  <i class="fa-solid fa-image text-4xl mb-2 text-slate-600"></i>
                  <p class="text-xs">No media uploaded</p>
                </div>
              `
            }
            <div class="absolute top-3 left-3 flex gap-2">
              <span class="px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border shadow-sm ${badgeColor}">
                ${item.type.toUpperCase()}
              </span>
              ${isMatched ? `
                <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-600 text-white shadow-sm flex items-center gap-1">
                  <i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i> AI Match
                </span>
              ` : ''}
            </div>
            <div class="absolute top-3 right-3">
              <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-black/60 backdrop-blur-md text-white">
                ${item.category}
              </span>
            </div>
          </div>

          <!-- Content Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-bold text-slate-800 text-base leading-tight">${item.title}</h3>
              </div>
              <p class="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <i class="fa-solid fa-location-dot text-blue-500"></i>
                <span>${item.location}</span>
                <span class="text-slate-300">&bull;</span>
                <span>${item.date}</span>
              </p>
              <p class="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">${item.description}</p>
            </div>

            <!-- Card Footer -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="text-slate-500">
                <span class="font-medium text-slate-700">${isLost ? 'Reported by' : 'Found by'}:</span>
                <p class="truncate max-w-[140px] text-slate-600">${item.contactEmail}</p>
              </div>

              <div class="flex gap-1.5">
                ${isMatched ? `
                  <button onclick="window.navigateTo('mailbox')" class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-1">
                    <i class="fa-solid fa-envelope-open-text"></i> View Mail
                  </button>
                ` : `
                  <button onclick="CampusLostFound.showDetailModal('${item.id}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition">
                    Details
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function showDetailModal(itemId) {
    const item = CampusStore.getLostFound().find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('lf-detail-title').textContent = item.title;
    document.getElementById('lf-detail-type').textContent = item.type.toUpperCase();
    document.getElementById('lf-detail-category').textContent = item.category;
    document.getElementById('lf-detail-location').textContent = item.location;
    document.getElementById('lf-detail-date').textContent = item.date;
    document.getElementById('lf-detail-desc').textContent = item.description;
    document.getElementById('lf-detail-contact').textContent = `${item.contactEmail} ${item.contactPhone ? ' | ' + item.contactPhone : ''}`;

    const mediaContainer = document.getElementById('lf-detail-media');
    if (item.mediaUrl) {
      if (item.mediaType === 'video') {
        mediaContainer.innerHTML = `<video src="${item.mediaUrl}" controls class="w-full rounded-xl max-h-72"></video>`;
      } else {
        mediaContainer.innerHTML = `<img src="${item.mediaUrl}" class="w-full rounded-xl max-h-72 object-cover" />`;
      }
    } else {
      mediaContainer.innerHTML = `<div class="p-8 text-center text-slate-400 bg-slate-100 rounded-xl">No photo or video uploaded</div>`;
    }

    window.showAppModal('lost-found-detail-modal');
  }

  function closeDetailModal() {
    window.hideAppModal('lost-found-detail-modal');
  }

  function setFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll('.lf-filter-btn').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-white', 'text-slate-600');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-white', 'text-slate-600');
      }
    });
    renderItems();
  }

  function openReportModal(type = 'lost') {
    document.getElementById('report-type-input').value = type;
    document.getElementById('report-modal-heading').textContent = type === 'lost' ? 'Report a Lost Item / Missing Belonging' : 'Report a Found Item';
    const finderContainer = document.getElementById('finder-name-container');
    if (finderContainer) {
      finderContainer.classList.toggle('hidden', type === 'lost');
      finderContainer.style.display = type === 'lost' ? 'none' : 'block';
    }

    const user = CampusAuth.getCurrentUser();
    if (user) {
      document.getElementById('report-contact-email').value = user.email;
      document.getElementById('report-contact-phone').value = user.phone || '';
    }

    window.showAppModal('lost-found-report-modal');
  }

  function closeReportModal() {
    window.hideAppModal('lost-found-report-modal');
  }

  function handleFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const previewBox = document.getElementById('lf-media-preview-box');
    submitReport({
      type: document.getElementById('report-type-input').value,
      title: document.getElementById('report-item-title').value,
      category: document.getElementById('report-category').value,
      location: document.getElementById('report-location').value,
      date: document.getElementById('report-date').value,
      description: document.getElementById('report-description').value,
      contactEmail: document.getElementById('report-contact-email').value,
      contactPhone: document.getElementById('report-contact-phone').value,
      finderName: document.getElementById('report-finder-name')?.value,
      mediaUrl: previewBox ? previewBox.dataset.mediaUrl : '',
      mediaType: previewBox ? previewBox.dataset.mediaType : 'image'
    });
    closeReportModal();
    const form = document.getElementById('lost-found-form');
    if (form) form.reset();
    if (window.clearMediaUpload) clearMediaUpload('lf-file-input', 'lf-media-preview-box');
  }

  return {
    init: () => {
      renderItems();
    },
    renderItems,
    submitReport,
    setFilter,
    showDetailModal,
    closeDetailModal,
    openReportModal,
    closeReportModal,
    closeMatchModal,
    handleFormSubmit
  };
})();
