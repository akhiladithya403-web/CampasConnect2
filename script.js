/* ==========================================================================
   CampusConnect AI - Beginner-Friendly JavaScript Engine
   ========================================================================== */

// --- GLOBAL APPLICATION STATE ---
let currentUser = {
  fullName: 'Arun Kumar',
  rollNo: '22CS108',
  email: 'arunkumar.student@college.edu',
  department: 'Computer Science & Engineering',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
};

let mailbox = [];
let canteenTokens = [];
let lostFoundItems = [
  { id: 1, type: 'lost', title: 'Casio Scientific Calculator', location: 'Physics Lab', description: 'Black color fx-991EX with name sticker', contactEmail: 'arunkumar.student@college.edu', rollNo: '22CS108' },
  { id: 2, type: 'found', title: 'Casio Scientific Calculator', location: 'Science Block SB-004', description: 'Black calculator with blue sticker found on table', contactEmail: 'security@college.edu', rollNo: 'Security' }
];

// --- 1. VIEW NAVIGATION ---
function navigateTo(viewId) {
  const views = document.querySelectorAll('.app-view');
  views.forEach(v => v.classList.add('hidden'));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Refresh view contents
  if (viewId === 'lost-found') renderLostFound();
  if (viewId === 'mailbox') renderMailbox();
}

// --- 2. AUTHENTICATION (ROLL NUMBER LOGIN & REGISTRATION) ---
function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login-btn');
  const tabReg = document.getElementById('tab-register-btn');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
  } else {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

function handleLogin(event) {
  event.preventDefault();
  const rollInput = document.getElementById('login-roll').value.trim();
  const passInput = document.getElementById('login-password').value.trim();

  if (!rollInput || !passInput) {
    showToast('Please enter your Roll Number and Password!');
    return;
  }

  currentUser.rollNo = rollInput.toUpperCase();
  currentUser.fullName = rollInput.toUpperCase() === '22CS108' ? 'Arun Kumar' : 'Student ' + rollInput.toUpperCase();

  updateHomeMenuBar();
  showToast(`Welcome back, ${currentUser.fullName}!`);
  navigateTo('home');
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const roll = document.getElementById('reg-roll').value.trim().toUpperCase();
  const email = document.getElementById('reg-email').value.trim();
  const dept = document.getElementById('reg-dept').value;

  currentUser = {
    fullName: name,
    rollNo: roll,
    email: email,
    department: dept,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  };

  updateHomeMenuBar();
  showToast(`Account created for Roll Number ${roll}!`);
  navigateTo('home');
}

function demoLogin() {
  document.getElementById('login-roll').value = '22CS108';
  document.getElementById('login-password').value = 'password123';
  handleLogin(new Event('submit'));
}

function logout() {
  showToast('You have been logged out.');
  navigateTo('auth');
}

function updateHomeMenuBar() {
  document.getElementById('home-user-name').textContent = currentUser.fullName;
  document.getElementById('home-user-roll').textContent = currentUser.rollNo;
  document.getElementById('home-user-dept').textContent = currentUser.department.split(' ')[0];
}

// --- 3. DOMAIN 1: LOST & FOUND SYSTEM ---
function renderLostFound() {
  const container = document.getElementById('lost-found-list');
  container.innerHTML = lostFoundItems.map(item => `
    <div class="domain-card">
      <div>
        <span class="badge-${item.type === 'lost' ? 'danger' : 'success'}">${item.type.toUpperCase()}</span>
        <h4 style="margin-top: 8px;">${item.title}</h4>
        <p><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
        <p style="margin-top: 6px;">${item.description}</p>
      </div>
      <p style="font-size: 0.75rem; color: #64748b; margin-top: 10px;">Contact: ${item.contactEmail}</p>
    </div>
  `).join('');
}

function handleLostFoundSubmit(event) {
  event.preventDefault();
  const type = document.getElementById('lf-type').value;
  const title = document.getElementById('lf-title').value.trim();
  const location = document.getElementById('lf-location').value.trim();
  const desc = document.getElementById('lf-desc').value.trim();

  const newItem = {
    id: Date.now(),
    type,
    title,
    location,
    description: desc,
    contactEmail: currentUser.email,
    rollNo: currentUser.rollNo
  };

  lostFoundItems.unshift(newItem);
  closeModal('modal-lost-found');
  showToast(`${type.toUpperCase()} report published!`);

  // AI SIMILARITY MATCH ENGINE: Checks if titles and locations match
  const opposite = type === 'lost' ? 'found' : 'lost';
  const match = lostFoundItems.find(i => i.type === opposite && i.title.toLowerCase().includes(title.toLowerCase()));

  if (match) {
    // AUTOMATIC EMAIL SENT TO USER
    const mailSubject = `✨ Match Alert: Found item matches your ${title}!`;
    const mailBody = `Hello ${currentUser.fullName}, an item matching '${title}' was reported at ${match.location}. Claim it at Main Security Office Gate 1 with your Roll Number: ${currentUser.rollNo}.`;
    sendAutomatedMail('Lost & Found Desk', mailSubject, mailBody);
    alert(`🎉 AI Match Detected!\nAn automated email alert has been dispatched to your Mailbox!`);
  }

  renderLostFound();
}

// --- 4. DOMAIN 2: CANTEEN QUEUE SYSTEM & REMINDER CHIME ---
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const playNote = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playNote(659.25, 0, 0.3);   // Note E5
    playNote(830.61, 0.2, 0.5); // Note G#5
  } catch (e) { console.log('Chime error', e); }
}

function generateCanteenToken(foodItem, price, counter) {
  const tokenNo = 'CT-' + Math.floor(100 + Math.random() * 900);
  const token = {
    id: Date.now(),
    tokenNo,
    foodItem,
    price,
    counter,
    rollNo: currentUser.rollNo,
    status: 'Preparing'
  };

  canteenTokens.unshift(token);

  // Play audio chime
  playChime();

  // Automated Email Receipt
  sendAutomatedMail('Canteen Food Court', `🍽️ Token #${tokenNo} Confirmed`, `Your token #${tokenNo} for ${foodItem} (₹${price}) has been generated. Collect at ${counter} when called.`);

  // Show Token Modal
  document.getElementById('token-display-number').textContent = `#${tokenNo}`;
  document.getElementById('token-display-counter').textContent = counter;
  document.getElementById('token-display-item').textContent = foodItem;
  document.getElementById('token-display-price').textContent = price;
  document.getElementById('token-display-roll').textContent = currentUser.rollNo;
  openModal('modal-canteen-token');

  renderCanteenQueue();
}

function renderCanteenQueue() {
  const container = document.getElementById('canteen-queue-container');
  container.innerHTML = canteenTokens.map(t => `
    <div class="canteen-item-card" style="margin-top: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4>Token #${t.tokenNo} &bull; ${t.foodItem}</h4>
          <p>${t.counter} &bull; Roll: ${t.rollNo}</p>
        </div>
        <span class="btn btn-secondary">${t.status}</span>
        ${t.status !== 'Ready' ? `
          <button class="btn btn-warning" onclick="testCallToken(${t.id})">🔔 Test 'Call Token'</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function testCallToken(tokenId) {
  const token = canteenTokens.find(t => t.id === tokenId);
  if (token) {
    token.status = 'Ready at Counter!';
    playChime();
    sendAutomatedMail('Canteen Desk', `🔔 [READY FOR PICKUP] Token #${token.tokenNo}`, `Your order #${token.tokenNo} is freshly ready at ${token.counter}!`);
    showToast(`🔔 Reminder: Token #${token.tokenNo} is ready!`);
    renderCanteenQueue();
  }
}

// --- 5. DOMAIN 3: NAVIGATION SYSTEM WITH VOICE ASSISTANCE ---
const synth = window.speechSynthesis;

function speak(text) {
  if (!synth) {
    alert('Voice speech synthesis not supported on your browser.');
    return;
  }
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Clear pacing

  document.getElementById('voice-wave-box').classList.remove('hidden');
  utterance.onend = () => {
    document.getElementById('voice-wave-box').classList.add('hidden');
  };

  synth.speak(utterance);
}

function selectRoute(name, block, room, directions) {
  const script = `Navigating to ${name}, located in ${block}, ${room}. Walking directions: ${directions}. You have arrived.`;
  speak(script);
  showToast(`🔊 Voice Guide reading route to ${name}...`);
}

function pauseVoice() { if (synth) synth.pause(); }
function resumeVoice() { if (synth) synth.resume(); }
function stopVoice() {
  if (synth) synth.cancel();
  document.getElementById('voice-wave-box').classList.add('hidden');
}

function startMicSearch() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Microphone speech recognition not supported on this browser.');
    return;
  }
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();
  showToast('🎙️ Listening... Speak room name (e.g. Physics Lab)');
  recognition.onresult = (e) => {
    const spoken = e.results[0][0].transcript;
    alert(`You said: "${spoken}". Routing to destination...`);
    selectRoute(spoken, 'Campus Block', 'Room', 'Follow the main hallway corridor straight ahead.');
  };
  recognition.start();
}

// --- 6. DOMAIN 4: EVENTS & GAMES REGISTRATION ---
function openEventRegister(title, type) {
  document.getElementById('event-reg-modal-title').textContent = `Register: ${title}`;
  document.getElementById('event-reg-target-title').value = title;
  document.getElementById('ev-reg-name').value = currentUser.fullName;
  document.getElementById('ev-reg-roll').value = currentUser.rollNo;
  document.getElementById('ev-reg-email').value = currentUser.email;
  openModal('modal-event-reg');
}

function handleEventRegSubmit(event) {
  event.preventDefault();
  const eventTitle = document.getElementById('event-reg-target-title').value;
  const passId = 'PASS-' + Math.floor(100000 + Math.random() * 900000);

  // Automated Email Ticket
  sendAutomatedMail('Events Coordinator', `🎟️ Admission Pass for ${eventTitle} (Pass #${passId})`, `Hello ${currentUser.fullName}, your registration for '${eventTitle}' is confirmed. Present Pass ID #${passId} with your Roll Number: ${currentUser.rollNo} at the venue entrance.`);

  closeModal('modal-event-reg');
  showToast(`🎟️ Pass #${passId} issued and emailed to your mailbox!`);
}

// --- 7. DOMAIN 5: STUDENT COMPLAINTS & CAMPUS ISSUES ---
let complaintItems = [
  { id: 'ISS-101', title: 'Water Cooler in Tech Block leaking', category: 'Drinking Water', desc: 'Cold water dispenser tap broken', reportedBy: 'Arun Kumar', status: 'In Progress' }
];

function handleComplaintSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('cmp-title').value.trim();
  const category = document.getElementById('cmp-category').value;
  const desc = document.getElementById('cmp-desc').value.trim();
  const ticketId = 'ISS-' + Math.floor(100 + Math.random() * 900);

  complaintItems.unshift({
    id: ticketId,
    title,
    category,
    desc,
    reportedBy: currentUser.fullName,
    status: 'Reported'
  });

  // Automated Email Receipt
  sendAutomatedMail('Campus Maintenance Cell', `📋 Acknowledgment Receipt: Ticket #${ticketId}`, `Your complaint regarding '${title}' has been registered with priority triage. Reference Ticket ID: #${ticketId}. Assigned to Estate & Maintenance Department.`);

  closeModal('modal-complaint');
  showToast(`Complaint lodged! Receipt sent to mailbox.`);
  renderComplaints();
}

function renderComplaints() {
  const container = document.getElementById('complaints-list');
  if (!container) return;
  container.innerHTML = complaintItems.map(c => `
    <div class="domain-card">
      <div>
        <span class="badge-danger">${c.category}</span>
        <h4 style="margin-top: 8px;">${c.title}</h4>
        <p>${c.desc}</p>
        <p style="font-size: 0.75rem; color: #64748b; margin-top: 8px;">Ticket: #${c.id} &bull; Status: ${c.status}</p>
      </div>
    </div>
  `).join('');
}

// --- 8. VIRTUAL MAILBOX (AUTOMATED EMAIL VIEWER) ---
function sendAutomatedMail(sender, subject, body) {
  mailbox.unshift({
    id: Date.now(),
    sender,
    subject,
    body,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  document.getElementById('mail-count').textContent = mailbox.length;
}

function renderMailbox() {
  const container = document.getElementById('mailbox-list');
  if (mailbox.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 24px;">No emails yet. Try generating a canteen token or registering for an event!</p>`;
    return;
  }
  container.innerHTML = mailbox.map(m => `
    <div class="receipt-box">
      <div style="display: flex; justify-content: space-between;">
        <strong>${m.sender}</strong>
        <span style="color: #64748b;">${m.time}</span>
      </div>
      <h4 style="color: #2563eb; margin: 6px 0;">${m.subject}</h4>
      <p>${m.body}</p>
    </div>
  `).join('');
}

// --- 9. PHOTO & VIDEO PREVIEW HELPER ---
function previewMedia(input, previewContainerId) {
  const file = input.files[0];
  const container = document.getElementById(previewContainerId);
  if (!file || !container) return;

  container.classList.remove('hidden');
  const reader = new FileReader();
  reader.onload = function(e) {
    const isVideo = file.type.startsWith('video');
    if (isVideo) {
      container.innerHTML = `<video src="${e.target.result}" controls></video>`;
    } else {
      container.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    }
  };
  reader.readAsDataURL(file);
}

// --- 10. MODAL HELPERS & TOAST ---
function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  updateHomeMenuBar();
  renderComplaints();
  renderLostFound();
});