# CampusConnect AI 🎓🤖
> **Smart College Student Portal with Roll Number Authentication, 5 Specialized Domains & Automated Email System**

**CampusConnect AI** is a beginner-friendly, all-in-one college web portal built to modernize and simplify student campus life. It eliminates physical queues, recovers lost belongings with AI auto-matching, assists freshers with voice-guided navigation, issues digital event and athlete passes, and resolves campus facility grievances with photo and video proof.

---

## 🚀 How to Run the Application

CampusConnect AI runs as a **Full-Stack Application** using **Java 26 SE (Backend)** + **HTML5, CSS, & JavaScript (Frontend)** with persistent database storage:

### Option 1: One-Click Windows Launcher (Recommended)
Simply double-click the **`run.bat`** file in the project folder (or run `./run.ps1` in PowerShell):
- Automatically compiles `server/CampusConnectServer.java` using `javac`
- Starts the Java backend server on port `8080`
- Automatically opens **`http://localhost:8080`** in your browser

```cmd
run.bat
```

### Option 2: Manual Terminal Command
```powershell
cd "d:\campax fix ai"
javac -d . server/CampusConnectServer.java
java server.CampusConnectServer
```
Then open your browser and navigate to:
👉 **`http://localhost:8080`**

### Option 3: Direct Browser Launch
You can also open `index.html` directly in any web browser (`file:///d:/campax%20fix%20ai/index.html`). The application includes automatic offline fallback to browser `localStorage` so all features work seamlessly.

---

## 👤 Pre-configured Demo Student Account

You can sign in directly using your college **Roll Number** or create a new student account:

| Field | Value |
|---|---|
| **Primary Login (Roll Number / Email)** | **`22CS108`** *(or `arunkumar.student@college.edu`)* |
| **Password** | **`password123`** |
| **Student Name** | Arun Kumar |
| **Department** | Computer Science & Engineering |
| **Roll Number** | `22CS108` |
| **Year of Study** | 3rd Year |

> ⚡ **Quick Test Tip**: You can also click the green **"One-Click Demo Student Login (Roll: 22CS108)"** button on the sign-in page to enter immediately!

---

## 🌟 Top Menu Bar Features

The sticky top menu bar provides rapid access from any page on campus:

1. **Profile Picture Pill**: Displays the student's avatar, full name, and Roll Number (`22CS108`). Clicking it opens the interactive **Profile Viewer & Editor Modal** to view or modify details.
2. **Help Desk**: Direct shortcut to 24/7 campus emergency hotlines (Medical clinic, Security Gate 1, Anti-Ragging Cell, Dean of Student Affairs) and the interactive **AI Campus Assistant Chatbot**.
3. **FAQs**: Interactive accordion covering beginner-friendly questions and answers for all 5 domains.
4. **Log Out Button**: Safely logs out the student and returns to the access gate.
5. **Virtual Mailbox (Envelope Icon)**: Live notification badge counter that stores all simulated automated emails received by the student (Lost & Found matches, Canteen tokens, Event admission passes, and Complaint receipts).
6. **Universal Back Button**: Steps back through your navigation history with breadcrumb trails.

---

## 🏛️ The Five Specialized Campus Domains

### 1. 🔍 Lost and Found System
- **Photo & Video Proof**: Upload clear photos or video clips of misplaced or discovered items.
- **AI Similarity Matching**: Algorithm compares item categories, title keywords, location proximity, and description features.
- **Automated Email Alert**: When an item matches requirements (>75% similarity), an automated alert email is instantly dispatched to the student's mailbox with match confidence and security desk collection instructions.

### 2. 🍽️ Canteen Queue System
- **Zero Queue Waiting**: Browse the digital menu (Breakfast, South Indian Thalis, Fast Food, Snacks, Beverages) with live pricing and preparation times.
- **Wait-Free Token Generation**: Add items to your order and generate an instant digital token (e.g. `#CT-104`) with an assigned counter.
- **Mail Automation**: Dispatches a full digital canteen token receipt to your email with itemized summary and total bill.
- **Reminder System**:
  - Web Audio API synthesized **audio reminder chime** plays when the counter calls your order.
  - On-screen visual reminder alert banner.
  - Interactive **"Test 'Call Token'"** simulator button to demonstrate order-ready reminders in 1 click!

### 3. 🗺️ Campus Navigation System with Voice Assistance
- **Campus Route Directory**: Find computer labs (TB-305), IoT labs, physics/chemistry science labs, lecture halls, and amenities.
- **Turn-by-Turn Guidance**: Detailed walking directions tailored for freshers.
- **Web Speech API Voice Assistance**:
  - Click **"🔊 Listen Route (Voice Assistance)"** to hear turn-by-turn directions spoken aloud in natural speech.
  - Audio wave visualizer with **Pause**, **Resume**, and **Stop** controls.
  - Individual audio pronunciation buttons on every single step.
  - **🎙️ Speak Destination**: Voice speech recognition search via microphone.

### 4. 🎟️ Events and Games Registration
- **Unified Domain**: Seamless tab switcher between **College Events & Tech Fests** (HackCampus, AI Masterclass, Startup Summit) and **Sports & Games Tournaments** (Cricket, Football, Badminton, Esports).
- **Mandatory Student Identification**: Registration form pre-fills with student's **Roll Number**, Full Name, Email, Department, and Year.
- **Mail Automation**: Generates an official digital admission ticket or athlete pass with unique Pass ID, venue, rules, and coordinator info, dispatched directly to the student's mailbox.

### 5. 📋 Student Complaints and Campus Issues
- **Unified Grievance & Facility Portal**:
  - Report campus facility failures: Insufficient drinking water, broken benches, electrical/fan faults.
  - File student grievances: Canteen food hygiene, bus transport delays, hostel maintenance, anti-ragging.
- **Photo & Video Proof**: Upload evidence photos or video clips with instant playback preview.
- **AI Priority Triage**: Automated urgency classification (Critical / High / Medium / Low) and routing to the designated maintenance department.
- **Mail Automation**: Dispatches an official acknowledgment receipt with a unique Complaint Tracking Reference ID (e.g. `ISS-482`, `CMP-103`).
- **Community Upvotes**: "Affected Too" upvote counter to prioritize urgent issues.

---

## 📁 File Structure

```
d:\campax fix ai\
├── index.html                  # Main single-page application shell & modals
├── README.md                   # Documentation & beginner guide
├── css/
│   └── styles.css              # Custom styling, animations, voice visualizer & chimes
├── js/
│   ├── store.js                # LocalStorage engine with pre-seeded campus data
│   ├── mailer.js               # Email automation templates for all 5 domains
│   ├── auth.js                 # Roll Number login/registration & menu bar profile manager
│   ├── canteen.js              # Canteen queue system, wait-free tokens & reminder chime
│   ├── navigation.js           # Navigation system with Web Speech API Voice Assistance
│   ├── lost-found.js           # Lost & Found with photo/video upload & AI auto-matcher
│   ├── events-games.js         # Unified Events & Sports/Games with automated passes
│   ├── complaints-issues.js    # Unified Complaints & Campus Issues with photo/video proof
│   ├── faq.js                  # Interactive FAQs accordion system
│   ├── helpdesk.js             # Emergency hotlines & AI Campus Assistant Chatbot
│   └── app.js                  # Central router, history back button & audio alerts
└── server/
    └── WebServer.java          # Built-in lightweight Java 26 static web server
```

---

## 💡 Beginner-Friendly Code Design

- **Vanilla Web Technologies**: Built with clean, readable HTML5, Tailwind CSS, and modular JavaScript without confusing framework boilerplate.
- **Zero External Audio Assets**: Audio reminder chimes and voice guidance use native browser Web Audio and Web Speech APIs—they work offline and never fail from missing MP3 files.
- **Persistent State**: Utilizes `localStorage` so registrations, tokens, issues, and emails persist across page refreshes.
