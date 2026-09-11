/**
 * CampusConnect AI - Interactive FAQ System
 * Displays categorized, accordion-style questions and beginner-friendly answers
 * for all 5 domains and portal navigation.
 */

const CampusFAQ = window.CampusFAQ = (() => {

  let activeCategory = 'all';

  function renderFAQs() {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    let faqs = CampusStore.getFAQs();
    if (activeCategory !== 'all') {
      faqs = faqs.filter(f => f.category.toLowerCase() === activeCategory.toLowerCase());
    }

    const searchQuery = (document.getElementById('faq-search-input')?.value || '').toLowerCase();
    if (searchQuery) {
      faqs = faqs.filter(f =>
        f.question.toLowerCase().includes(searchQuery) ||
        f.answer.toLowerCase().includes(searchQuery) ||
        f.category.toLowerCase().includes(searchQuery)
      );
    }

    if (faqs.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-circle-question text-3xl text-slate-300 mb-2"></i>
          <p class="text-xs text-slate-500 font-semibold">No questions found matching your query.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = faqs.map((faq, index) => {
      return `
        <div class="faq-item bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
          <button type="button" onclick="CampusFAQ.toggleAccordion('${faq.id}')"
                  class="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer">
            <div class="flex items-center space-x-3">
              <span class="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                ${index + 1}
              </span>
              <div>
                <span class="font-bold text-slate-900 text-sm">${faq.question}</span>
                <span class="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">${faq.category}</span>
              </div>
            </div>
            <i id="faq-chevron-${faq.id}" class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200"></i>
          </button>

          <div id="faq-answer-${faq.id}" class="hidden px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
            ${faq.answer}
          </div>
        </div>
      `;
    }).join('');
  }

  function toggleAccordion(faqId) {
    const answer = document.getElementById(`faq-answer-${faqId}`);
    const chevron = document.getElementById(`faq-chevron-${faqId}`);
    if (!answer) return;

    const isHidden = answer.classList.contains('hidden');
    if (isHidden) {
      answer.classList.remove('hidden');
      if (chevron) chevron.classList.add('rotate-180', 'text-blue-600');
    } else {
      answer.classList.add('hidden');
      if (chevron) chevron.classList.remove('rotate-180', 'text-blue-600');
    }
  }

  function setCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.faq-cat-btn').forEach(b => {
      if (b.dataset.cat === cat) {
        b.classList.add('bg-blue-600', 'text-white');
        b.classList.remove('bg-white', 'text-slate-600');
      } else {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-white', 'text-slate-600');
      }
    });
    renderFAQs();
  }

  function openFaqModal() {
    if (window.showAppModal) {
      window.showAppModal('modal-faq-viewer');
    } else {
      const modal = document.getElementById('modal-faq-viewer');
      if (modal) modal.classList.remove('hidden');
    }
    renderFAQs();
  }

  function closeFaqModal() {
    if (window.hideAppModal) {
      window.hideAppModal('modal-faq-viewer');
    } else {
      const modal = document.getElementById('modal-faq-viewer');
      if (modal) modal.classList.add('hidden');
    }
  }

  return {
    init: () => {
      renderFAQs();
    },
    renderFAQs,
    toggleAccordion,
    setCategory,
    openFaqModal,
    closeFaqModal
  };
})();
