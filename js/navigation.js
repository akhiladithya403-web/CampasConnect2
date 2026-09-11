/**
 * CampusConnect AI - Campus Navigation System with Voice Assistance
 * Domain 3:
 * 1. Explore university buildings, labs, classrooms, seminar halls, and amenities
 * 2. Origin & Destination campus route finder
 * 3. Turn-by-turn walking directions for freshers
 * 4. Voice Assistance: Browser SpeechSynthesis to speak directions aloud with controls
 * 5. Speech Recognition: Speak destination query via microphone
 */

const CampusNavigator = window.CampusNavigator = (() => {

  let selectedBlock = 'all';
  let selectedCategory = 'all';
  let activeDestination = null;
  let currentUtterance = null;
  let isSpeaking = false;

  // Web Speech API Voice Assistance
  const synth = window.speechSynthesis;

  function speakText(text, onComplete) {
    if (!synth) {
      if (window.showAppToast) window.showAppToast('Speech synthesis is not supported on this browser.', 'info');
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Friendly, clear pacing
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    currentUtterance = utterance;
    isSpeaking = true;
    updateVoiceUI(true);

    utterance.onend = () => {
      isSpeaking = false;
      updateVoiceUI(false);
      if (onComplete) onComplete();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      isSpeaking = false;
      updateVoiceUI(false);
    };

    synth.speak(utterance);
  }

  function pauseVoice() {
    if (synth && synth.speaking) {
      synth.pause();
      isSpeaking = false;
      updateVoiceUI(false, true);
    }
  }

  function resumeVoice() {
    if (synth && synth.paused) {
      synth.resume();
      isSpeaking = true;
      updateVoiceUI(true);
    }
  }

  function stopVoice() {
    if (synth) {
      synth.cancel();
      isSpeaking = false;
      updateVoiceUI(false);
    }
  }

  function updateVoiceUI(speaking, paused = false) {
    const waveContainer = document.getElementById('voice-audio-wave');
    const voiceStatus = document.getElementById('voice-status-text');
    const btnSpeak = document.getElementById('btn-speak-route');

    if (waveContainer) {
      if (speaking) {
        waveContainer.classList.remove('hidden');
        waveContainer.style.display = 'flex';
      } else {
        waveContainer.classList.add('hidden');
        waveContainer.style.display = 'none';
      }
    }

    if (voiceStatus) {
      if (speaking) {
        voiceStatus.textContent = '🔊 Voice Assistance Speaking...';
        voiceStatus.className = 'text-xs font-bold text-blue-600 animate-pulse';
      } else if (paused) {
        voiceStatus.textContent = '⏸️ Voice Assistance Paused';
        voiceStatus.className = 'text-xs font-semibold text-amber-600';
      } else {
        voiceStatus.textContent = 'Voice Guidance Ready';
        voiceStatus.className = 'text-xs font-medium text-slate-500';
      }
    }

    if (btnSpeak) {
      if (speaking) {
        btnSpeak.innerHTML = `<i class="fa-solid fa-stop mr-1.5"></i> Stop Voice`;
        btnSpeak.className = 'px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center shadow-sm cursor-pointer';
        btnSpeak.onclick = stopVoice;
      } else {
        btnSpeak.innerHTML = `<i class="fa-solid fa-volume-high mr-1.5"></i> Listen Route (Voice Assistance)`;
        btnSpeak.className = 'px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center shadow-sm cursor-pointer';
        btnSpeak.onclick = () => speakCurrentRoute();
      }
    }
  }

  function speakCurrentRoute() {
    if (!activeDestination) return;
    const script = activeDestination.voiceScript || activeDestination.directions;
    speakText(script);
  }

  function speakStep(stepText) {
    speakText(stepText);
  }

  /**
   * Microphone voice search using SpeechRecognition API
   */
  function startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('btn-mic-search');

    if (!SpeechRecognition) {
      // Fallback prompt if browser does not support webkitSpeechRecognition
      const fallbackQuery = prompt('Speech recognition not available. Type campus destination to navigate (e.g. Canteen, AI Lab, Library):');
      if (fallbackQuery) {
        const input = document.getElementById('nav-search-input');
        if (input) input.value = fallbackQuery;
        renderDirectory();
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      if (micBtn) {
        micBtn.classList.add('bg-rose-500', 'text-white', 'animate-pulse');
      }

      if (window.showAppToast) window.showAppToast('🎙️ Listening... Say a destination (e.g. "Canteen", "AI Lab", "Library")', 'info');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (micBtn) micBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');

        const input = document.getElementById('nav-search-input');
        if (input) input.value = transcript;
        renderDirectory();

        // Auto select first match and speak
        const places = CampusStore.getNavigationPlaces();
        const match = places.find(p =>
          p.name.toLowerCase().includes(transcript.toLowerCase()) ||
          p.roomNo.toLowerCase().includes(transcript.toLowerCase()) ||
          p.category.toLowerCase().includes(transcript.toLowerCase())
        );

        if (match) {
          selectDestination(match.id);
          speakText(`Found ${match.name}. Here are the directions: ${match.directions}`);
        } else {
          speakText(`Searched for ${transcript}. Please choose from the list.`);
        }
      };

      recognition.onerror = () => {
        if (micBtn) micBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
      };

      recognition.onend = () => {
        if (micBtn) micBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
      };

      recognition.start();
    } catch (e) {
      console.warn('Mic search error:', e);
      if (micBtn) micBtn.classList.remove('bg-rose-500', 'text-white', 'animate-pulse');
    }
  }

  /**
   * Render Navigation Directory
   */
  function renderDirectory() {
    const container = document.getElementById('nav-places-list');
    if (!container) return;

    let places = CampusStore.getNavigationPlaces();

    if (selectedBlock !== 'all') {
      places = places.filter(p => p.block.toLowerCase().includes(selectedBlock.toLowerCase()));
    }
    if (selectedCategory !== 'all') {
      places = places.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    const searchQuery = (document.getElementById('nav-search-input')?.value || '').toLowerCase();
    if (searchQuery) {
      places = places.filter(p =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.roomNo.toLowerCase().includes(searchQuery) ||
        p.block.toLowerCase().includes(searchQuery) ||
        p.floor.toLowerCase().includes(searchQuery) ||
        (p.equipment && p.equipment.toLowerCase().includes(searchQuery))
      );
    }

    if (places.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-map-location-dot text-4xl text-slate-300 mb-2"></i>
          <p class="text-sm font-semibold text-slate-700">No rooms or labs found</p>
          <p class="text-xs text-slate-400 mt-1">Try a different keyword or block filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = places.map(place => {
      const isSelected = activeDestination && activeDestination.id === place.id;
      const categoryIcon = getCategoryIcon(place.category);

      return `
        <div onclick="CampusNavigator.selectDestination('${place.id}')"
             class="cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
               isSelected
                 ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-100'
                 : 'bg-white hover:bg-slate-50 border-slate-200'
             }">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-600'}">
                <i class="${categoryIcon} text-lg"></i>
              </div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">${place.name}</h4>
                <div class="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                  <span class="font-semibold text-blue-600">${place.roomNo}</span>
                  <span>&bull;</span>
                  <span>${place.block}</span>
                  <span>&bull;</span>
                  <span>${place.floor}</span>
                </div>
              </div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'}">
              ${place.category}
            </span>
          </div>

          <p class="text-xs text-slate-600 mt-2.5 line-clamp-2">
            <i class="fa-solid fa-compass text-slate-400 mr-1"></i> ${place.landmark}
          </p>
        </div>
      `;
    }).join('');
  }

  function getCategoryIcon(category) {
    switch (category) {
      case 'Lab': return 'fa-solid fa-flask';
      case 'Classroom': return 'fa-solid fa-chalkboard-user';
      case 'Auditorium': return 'fa-solid fa-masks-theater';
      case 'Amenity': return 'fa-solid fa-utensils';
      default: return 'fa-solid fa-building';
    }
  }

  function selectDestination(placeId) {
    const places = CampusStore.getNavigationPlaces();
    const place = places.find(p => p.id === placeId);
    if (!place) return;

    activeDestination = place;
    stopVoice();
    renderDirectory();
    renderRouteGuide(place);
    updateVisualMap(place);
  }

  function renderRouteGuide(place) {
    const container = document.getElementById('nav-route-display');
    if (!container) return;

    // Split directions into discrete actionable steps
    const steps = place.directions.split('. ').filter(s => s.trim().length > 0);

    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-3">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
              <i class="fa-solid fa-location-crosshairs"></i> Destination Selected
            </div>
            <h3 class="text-xl font-bold text-slate-900">${place.name} (${place.roomNo})</h3>
            <p class="text-xs text-slate-500 mt-1">${place.block} &bull; ${place.floor} &bull; Landmark: ${place.landmark}</p>
          </div>

          <!-- Voice Assistance Action Button -->
          <div class="flex items-center gap-2">
            <button id="btn-speak-route" type="button" onclick="CampusNavigator.speakCurrentRoute()"
                    class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center shadow-sm cursor-pointer"
                    title="Speak route directions with voice assistant">
              <i class="fa-solid fa-volume-high mr-1.5"></i>
              <span>Listen Route (Voice Assistance)</span>
            </button>
            <button onclick="CampusNavigator.shareDirections('${place.id}')" class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Copy Directions">
              <i class="fa-regular fa-copy text-base"></i>
            </button>
          </div>
        </div>

        <!-- Voice Wave Visualizer Bar -->
        <div id="voice-audio-wave" class="hidden items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 mb-4">
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-1">
              <span class="w-1.5 h-5 bg-blue-600 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-7 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
              <span class="w-1.5 h-4 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
              <span class="w-1.5 h-6 bg-blue-700 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
            </div>
            <span id="voice-status-text" class="text-xs font-bold text-blue-700">🔊 Voice Assistance is reading directions aloud...</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <button type="button" onclick="CampusNavigator.pauseVoice()" class="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer" title="Pause">
              <i class="fa-solid fa-pause"></i>
            </button>
            <button type="button" onclick="CampusNavigator.resumeVoice()" class="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer" title="Resume">
              <i class="fa-solid fa-play"></i>
            </button>
            <button type="button" onclick="CampusNavigator.stopVoice()" class="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer" title="Stop">
              <i class="fa-solid fa-stop"></i>
            </button>
          </div>
        </div>

        <!-- Turn-by-Turn Steps with Audio Pronunciation Buttons -->
        <div class="mb-5">
          <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Turn-by-Turn Spoken Guidance</h4>
          <div class="space-y-2.5">
            ${steps.map((step, index) => `
              <div class="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition flex items-start justify-between gap-3 group">
                <div class="flex items-start space-x-3">
                  <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ${index + 1}
                  </span>
                  <p class="text-xs text-slate-700 font-medium leading-relaxed">${step.trim()}</p>
                </div>
                <button type="button" onclick="CampusNavigator.speakStep('${step.replace(/'/g, "\\'")}')"
                        class="p-1.5 rounded-lg bg-white hover:bg-blue-100 text-slate-500 hover:text-blue-700 text-xs transition shrink-0 cursor-pointer shadow-2xs"
                        title="Pronounce this step">
                  <i class="fa-solid fa-volume-low"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Room Meta Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span class="text-slate-400 block font-medium">In-Charge / Faculty:</span>
            <span class="text-slate-800 font-semibold">${place.inCharge || 'Department Faculty'}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Equipment & Amenities:</span>
            <span class="text-slate-800 font-semibold">${place.equipment || 'Standard classroom facilities'}</span>
          </div>
        </div>
      </div>
    `;
  }

  function updateVisualMap(place) {
    const mapContainer = document.getElementById('campus-visual-map');
    if (!mapContainer) return;

    const nodes = mapContainer.querySelectorAll('.campus-node');
    nodes.forEach(n => {
      n.classList.remove('active-route', 'ring-4', 'ring-blue-500');
      if (n.dataset.block && place.block.toLowerCase().includes(n.dataset.block.toLowerCase())) {
        n.classList.add('active-route');
      }
    });

    const statusBadge = document.getElementById('map-status-pill');
    if (statusBadge) {
      statusBadge.innerHTML = `<i class="fa-solid fa-compass fa-spin text-blue-600 mr-1.5"></i> Route Active: <strong>${place.roomNo}</strong> (${place.block})`;
    }
  }

  function shareDirections(placeId) {
    const places = CampusStore.getNavigationPlaces();
    const place = places.find(p => p.id === placeId);
    if (!place) return;

    const text = `CampusConnect AI Directions to ${place.name} (${place.roomNo}):\nBlock: ${place.block}, Floor: ${place.floor}\nRoute: ${place.directions}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (window.showAppToast) window.showAppToast('Directions copied to clipboard!', 'success');
    }
  }

  function setFilter(type, value) {
    if (type === 'block') selectedBlock = value;
    if (type === 'category') selectedCategory = value;
    renderDirectory();
  }

  return {
    init: () => {
      renderDirectory();
      const firstPlace = CampusStore.getNavigationPlaces()[0];
      if (firstPlace) {
        selectDestination(firstPlace.id);
      }
    },
    renderDirectory,
    selectDestination,
    speakCurrentRoute,
    speakStep,
    pauseVoice,
    resumeVoice,
    stopVoice,
    startVoiceSearch,
    setFilter,
    shareDirections
  };
})();
