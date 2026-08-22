# HealthSlot — Healthcare Appointment & Follow-up Manager

> A full-stack healthcare appointment and follow-up management platform featuring role-based portals (**Patient**, **Doctor**, **Admin**), AI clinical triage summaries, patient-friendly post-visit notes, automated medication reminder background jobs, 2-way Google Calendar OAuth 2.0 sync, and robust double-booking prevention.

---

## 🌟 Key Capabilities

1. **Role-Based Portals**:
   - **Patient Portal**: Discover specialists, pick dynamically calculated non-conflicting slots, submit symptoms for AI clinical triage, manage active appointments, cancel visits, and track daily medication reminders.
   - **Doctor Portal**: Daily queue and consultation schedule, review patient symptoms with **AI Pre-Visit Briefings** (Urgency badge, chief complaint, 3 diagnostic questions), write clinical consultation notes, and generate patient-friendly summaries with digital prescriptions.
   - **Admin Portal**: Metric dashboards, onboard new doctors (specialization, working hours, working days, slot duration), and assign leave days with automated conflict resolution & patient cancellation alerts.

2. **AI Clinical Intelligence**:
   - **Pre-Visit Triage**: Analyzes patient symptoms to determine urgency (`Low`, `Medium`, `High`), extracts the chief complaint, and drafts 3 diagnostic questions for the doctor.
   - **Post-Visit Patient Summary**: Translates dense doctor clinical notes into reassuring, plain-language patient summaries with dosage instructions and next steps.
   - **Graceful Fallback**: Resilient fallback engine supporting **Google Gemini API**, **Local Ollama**, and **Heuristic Medical Triage** ensuring 100% uptime with zero downtime.

3. **Concurrency & Double-Booking Prevention**:
   - MongoDB compound unique index `{ doctor: 1, slotStart: 1 }` with `partialFilterExpression: { status: 'booked' }`.
   - Simultaneous collision attempts trigger atomic constraint verification returning clean `HTTP 409 Conflict`.

4. **Doctor Leave Conflict Resolution**:
   - When an admin marks a doctor on leave, the system queries all conflicting active bookings, marks them `cancelled`, and sends automated notification emails to affected patients.

5. **Medication Reminder Engine**:
   - Daily background cron job (`node-cron`) automatically calculates elapsed prescription days against `durationDays` and sends reminder emails.

6. **Google Calendar 2-Way Synchronization**:
   - OAuth 2.0 integration allowing both patients and doctors to automatically sync booked appointments into their Google Calendars, with automatic event removal upon cancellation.

---

## 🏗 System Architecture

```
healthcare_appointment/
├── backend/
│   ├── server.js                      # Express API entry point & cron bootstrap
│   ├── .env.example                   # Environment configuration template
│   ├── models/
│   │   ├── User.js                    # User authentication & Google refresh tokens
│   │   ├── Doctor.js                  # Doctor profiles, working hours, days, leaves
│   │   ├── Appointment.js             # Appointments with AI triage & summaries
│   │   └── MedicationReminder.js      # Prescriptions & daily reminder schedules
│   ├── controllers/
│   │   ├── authController.js          # Register, Login, GetMe
│   │   ├── patientController.js       # Doctor search, slot generator, book, cancel
│   │   ├── doctorController.js        # Doctor queue, clinical notes, profile
│   │   └── adminController.js         # Stats, doctor CRUD, leave manager
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth
│   │   ├── patientRoutes.js           # /api/patient
│   │   ├── doctorRoutes.js            # /api/doctor
│   │   ├── adminRoutes.js             # /api/admin
│   │   └── calendarRoutes.js          # /api/calendar
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification & role-based authorization
│   ├── services/
│   │   ├── slotService.js             # Dynamic slot calculation engine
│   │   ├── llmService.js              # Gemini / Ollama / Heuristic triage
│   │   ├── emailService.js            # HTML templates & email dispatcher
│   │   └── calendarService.js         # Google Calendar OAuth 2.0 API
│   └── jobs/
│       └── reminderJob.js             # Daily automated cron job (9 AM)
├── frontend/
│   ├── src/
│   │   ├── components/                # Navbar, UrgencyBadge, CalendarModal, ProtectedRoute
│   │   ├── context/                   # AuthContext with 1-click Demo credentials
│   │   ├── pages/                     # LandingPage, LoginPage, RegisterPage
│   │   │   ├── patient/               # PatientDashboard, DoctorSearch, SlotModal, etc.
│   │   │   ├── doctor/                # DoctorDashboard, AppointmentCard, VisitNotesModal
│   │   │   └── admin/                 # AdminDashboard, DoctorManagement, LeaveManagerModal
│   │   └── services/api.js            # Axios client with JWT interceptor
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md
└── SYSTEM_DESIGN.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Tested on v22)
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI.

---

### Step 1: Configure Backend Environment

Navigate to `backend/` and copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/healthcare_appointment
JWT_SECRET=your_super_secret_jwt_key_2026

# Optional: Google Gemini API for cloud LLM triage
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Local Ollama
OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=llama3

# Optional: Nodemailer SMTP
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Optional: Google Calendar OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
```

> **Note**: If `GEMINI_API_KEY` or `OLLAMA_URL` are not provided, the built-in clinical triage heuristic fallback will activate automatically, ensuring all triage assessments function out of the box!

---

### Step 2: Start the Backend Server

```bash
cd backend
npm install
npm run dev
# or: node server.js
```

Backend will start on `http://localhost:5000`.

---

### Step 3: Start the Frontend Application

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ⚡ 1-Click Demo Accounts

On the **Login Page** (`http://localhost:5173/login`), click any of the **Quick 1-Click Demo** buttons to immediately test the platform:

| Role | Demo Email | Demo Password | Capabilities |
|---|---|---|---|
| **Patient** | `patient@demo.com` | `patient123` | Book slots, AI symptom triage, cancel visits, medication tracking |
| **Doctor** | `doctor@demo.com` | `doctor123` | Consultation queue, AI pre-visit briefing, complete notes, prescriptions |
| **Admin** | `admin@demo.com` | `admin123` | Onboard doctors, configure practice hours, assign leave days, clinic stats |

---

## 📊 Database Schema Design

### 1. `User` Schema
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  googleRefreshToken: { type: String, default: null }
}
```

### 2. `Doctor` Schema
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true, unique: true },
  specialisation: { type: String, required: true },
  workingHours: {
    start: { type: String, required: true }, // e.g. "09:00"
    end: { type: String, required: true }    // e.g. "17:00"
  },
  workingDays: [{ type: String, required: true }], // e.g. ["Monday", "Tuesday", ...]
  slotDurationMins: { type: Number, required: true, default: 30 },
  leaveDays: [{ type: Date }]
}
```

### 3. `Appointment` Schema
```javascript
{
  patient: { type: ObjectId, ref: 'User', required: true },
  doctor: { type: ObjectId, ref: 'Doctor', required: true },
  slotStart: { type: Date, required: true },
  slotEnd: { type: Date, required: true },
  status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' },
  symptomsText: String,
  preVisitSummary: {
    urgency: String, // "Low" | "Medium" | "High"
    chiefComplaint: String,
    questions: [String]
  },
  postVisitNotes: String,
  postVisitSummary: String,
  calendarEventIdPatient: String,
  calendarEventIdDoctor: String
}
// Unique compound index preventing double-booking
index({ doctor: 1, slotStart: 1 }, { unique: true, partialFilterExpression: { status: 'booked' } });
```

### 4. `MedicationReminder` Schema
```javascript
{
  appointment: { type: ObjectId, ref: 'Appointment', required: true },
  patient: { type: ObjectId, ref: 'User', required: true },
  medicationName: { type: String, required: true },
  timesPerDay: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  lastSentAt: { type: Date, default: null },
  active: { type: Boolean, default: true }
}
```

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new user account |
| `POST` | `/api/auth/login` | None | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Bearer | Get current authenticated user profile & calendar status |

### Patient Endpoints (`/api/patient`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/patient/doctors` | Bearer | All | Search doctors by specialization |
| `GET` | `/api/patient/doctors/:id/slots?date=YYYY-MM-DD` | Bearer | All | Get real-time available time slots |
| `POST` | `/api/patient/appointments` | Bearer | `patient` | Book slot with symptom AI pre-triage |
| `GET` | `/api/patient/appointments` | Bearer | `patient` | Get all patient appointments |
| `GET` | `/api/patient/reminders` | Bearer | `patient` | Get active/past medication schedules |
| `PUT` | `/api/patient/appointments/:id/cancel` | Bearer | `patient` | Cancel appointment & remove calendar event |

### Doctor Endpoints (`/api/doctor`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/doctor/appointments` | Bearer | `doctor` | Fetch doctor queue with AI triage briefings |
| `GET` | `/api/doctor/profile` | Bearer | `doctor` | View doctor working hours & leave days |
| `PUT` | `/api/doctor/appointments/:id/complete` | Bearer | `doctor` | Submit clinical notes, prescription & AI summary |

### Admin Endpoints (`/api/admin`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/admin/stats` | Bearer | `admin` | Overall clinic metrics & KPIs |
| `GET` | `/api/admin/doctors` | Bearer | `admin` | List all practicing doctors |
| `POST` | `/api/admin/doctors` | Bearer | `admin` | Onboard new doctor profile |
| `DELETE` | `/api/admin/doctors/:id` | Bearer | `admin` | Remove doctor profile |
| `POST` | `/api/admin/doctors/:id/leave` | Bearer | `admin` | Mark doctor leave & cancel conflicting visits |
| `GET` | `/api/admin/appointments` | Bearer | `admin` | Global clinic audit ledger |

### Google Calendar (`/api/calendar`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/calendar/connect` | Bearer | Generate Google OAuth 2.0 authorization URL |
| `GET` | `/api/calendar/status` | Bearer | Get Google Calendar connection state |
| `POST` | `/api/calendar/disconnect` | Bearer | Revoke / clear Google Calendar refresh token |
| `GET` | `/api/calendar/oauth/callback` | None | OAuth 2.0 exchange callback |

---

## 🤖 LLM Prompts & Guidance

### 1. Pre-Visit Clinical Triage
```
Analyse these symptoms and return ONLY a valid JSON object in this exact format with no extra text:
{
  "urgency": "Low" | "Medium" | "High",
  "chiefComplaint": "<concise 1-sentence summary of main complaint>",
  "questions": ["<Diagnostic question 1>", "<Diagnostic question 2>", "<Diagnostic question 3>"]
}

Symptoms: <symptomsText>
```

### 2. Post-Visit Patient Summary
```
Convert these clinical notes into a simple, patient-friendly summary.
Include a medication schedule and follow-up steps if mentioned. Write it in plain, reassuring language a non-medical person can understand.

Clinical notes: <clinicalNotes>
```

---

## 📅 Google Calendar OAuth 2.0 Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **Google Calendar API**.
3. Under **APIs & Services > Credentials**, create an **OAuth 2.0 Client ID** (Web application).
4. Add Authorized redirect URI:
   `http://localhost:5000/api/calendar/oauth/callback` (or your production backend URL).
5. Copy the Client ID and Client Secret into `backend/.env`.

---

## 🌐 Production Deployment Guide

### Deploying Backend (e.g. Render / Railway)
1. Push code to GitHub.
2. Create a **Web Service** on Render/Railway pointing to the `backend/` directory.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add Environment Variables from `backend/.env.example` (set `MONGO_URI` to MongoDB Atlas).

### Deploying Frontend (e.g. Vercel)
1. Import the repository on Vercel and select the `frontend/` directory as the root.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable `VITE_API_URL` to your deployed backend URL (e.g. `https://your-api.onrender.com/api`).
