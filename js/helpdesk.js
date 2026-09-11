/**
 * Campus Fix AI - Help Desk & Interactive AI Assistant
 * Provides 24/7 campus emergency hotlines, fresher FAQs,
 * and an interactive AI Campus Assistant chatbot.
 */

const CampusHelpDesk = window.CampusHelpDesk = (() => {

  const botKnowledgeBase = [
    {
      keywords: ['canteen', 'food', 'token', 'queue', 'lunch', 'breakfast', 'order', 'dosa', 'thali', 'coffee'],
      reply: '🍽️ <strong>Canteen Queue System:</strong> Open the <strong>Canteen Queue System</strong> domain, pick your food items, and click "Generate Wait-Free Token". You will receive an instant digital token (e.g. #CT-104) and an automated email. When your food is ready at the counter, you will hear an audio reminder chime!'
    },
    {
      keywords: ['voice', 'speak', 'audio', 'sound', 'directions', 'hear', 'navigator'],
      reply: '🔊 <strong>Voice Assistance Navigation:</strong> In the <strong>Campus Navigation</strong> domain, click the "🔊 Listen Route (Voice Assistance)" button or use the microphone button to speak your destination. Our Web Speech engine will read turn-by-turn walking steps aloud!'
    },
    {
      keywords: ['roll', 'rollno', 'login', 'register', 'password', 'sign in', 'account'],
      reply: '👤 <strong>Roll Number Sign-In:</strong> You can log in directly with your college Roll Number (e.g. 22CS108 or your registered roll number) and password. If you are registering a new account, Roll Number is a primary required field.'
    },
    {
      keywords: ['water', 'drinking', 'cooler', 'tap', 'thirsty'],
      reply: '💧 <strong>Drinking Water Facilities:</strong> Water coolers with RO purifiers are available on every floor of Main Academic Block (near rooms 105, 205, 305) and Science Block. If a cooler is leaking or empty, report it under <strong>Student Complaints & Campus Issues</strong>!'
    },
    {
      keywords: ['bench', 'broken', 'desk', 'chair', 'furniture'],
      reply: '🪑 <strong>Broken Benches / Furniture:</strong> To report damaged desks or exposed screws, head to <strong>Student Complaints & Campus Issues</strong> and upload photo or video proof. Our AI classifier automatically alerts the Estate Maintenance Team.'
    },
    {
      keywords: ['lost', 'found', 'calculator', 'wallet', 'money', 'missing', 'belonging', 'keys'],
      reply: '🔍 <strong>Lost & Found System:</strong> Report your lost item with a photo/video under <strong>Lost & Found</strong>. When someone turns in a matching item, our AI matcher calculates similarity and immediately sends an automated alert email to you!'
    },
    {
      keywords: ['event', 'hackathon', 'workshop', 'symposium', 'game', 'sports', 'cricket', 'badminton', 'pass'],
      reply: '🎟️ <strong>Events & Games Passes:</strong> Open <strong>Events & Games Registration</strong> to sign up for hackathons, tech fests, cricket, football, or badminton tournaments. An official pass with your Roll Number is automatically sent to your Virtual Mailbox!'
    },
    {
      keywords: ['emergency', 'medical', 'first aid', 'doctor', 'ambulance'],
      reply: '🚨 <strong>Emergency Medical Centre:</strong> Located at Ground Floor, Amenities Block (AM-002). 24/7 on-duty medical officer and ambulance available. Call: <strong>044-24567891</strong>.'
    }
  ];

  function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const messagesBox = document.getElementById('chatbot-messages');
    if (!input || !messagesBox) return;

    const userText = input.value.trim();
    if (!userText) return;

    // Append user message
    messagesBox.innerHTML += `
      <div class="flex justify-end mb-3">
        <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%] text-sm shadow-sm">
          ${userText}
        </div>
      </div>
    `;

    input.value = '';
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Simulate AI thinking
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let matchedReply = null;

      for (const item of botKnowledgeBase) {
        if (item.keywords.some(k => lower.includes(k))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = `🤖 I understand you are asking about <em>"${userText}"</em>. You can easily navigate to the relevant domain above:
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Campus Navigation:</strong> For classrooms and lab routes</li>
            <li><strong>Campus Issues:</strong> For water, benches, electricity</li>
            <li><strong>Lost & Found:</strong> For missing belongings & AI match alerts</li>
            <li><strong>Events & Games:</strong> For registrations & digital passes</li>
          </ul>`;
      }

      messagesBox.innerHTML += `
        <div class="flex justify-start mb-3">
          <div class="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] text-sm border border-slate-200 shadow-sm leading-relaxed">
            <div class="flex items-center gap-1.5 font-bold text-xs text-blue-600 mb-1">
              <i class="fa-solid fa-sparkles"></i> Campus AI Assistant
            </div>
            ${matchedReply}
          </div>
        </div>
      `;

      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 450);
  }

  return {
    sendChatMessage
  };
})();
