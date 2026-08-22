# HealthSlot

HealthSlot is a web platform designed to streamline outpatient appointment booking, clinical consultation preparation, and post-visit patient follow-ups. It provides role-specific dashboards for patients, doctors, and clinic administrators, alongside automated pre-visit symptom evaluation and daily medication reminder jobs.

**Live Application URL**: https://healthslot-healthcare-appointment.onrender.com/

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- MongoDB instance (local service or MongoDB Atlas URI)
- npm or yarn

---

### 1. Setting Up the Backend

Navigate to the `backend` directory and copy the environment template:

```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/healthcare_appointment
JWT_SECRET=your_jwt_secret_key

# Optional: LLM Integration (falls back to built-in rule-based triage if omitted)
GEMINI_API_KEY=
OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=llama3

# Optional: Email Service
EMAIL_USER=
EMAIL_PASS=

# Optional: Google Calendar OAuth 2.0
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
```

Install dependencies and start the backend development server:

```bash
npm install
npm run dev
```

The API service runs on `http://localhost:5000`.

---

### 2. Setting Up the Frontend

Open a new terminal window, navigate to the `frontend` directory, install the required packages, and launch Vite:

```bash
cd frontend
npm install
npm run dev
```

The user interface will be accessible at `http://localhost:5173`.

---

## Demo Accounts

For immediate testing, you can use the pre-seeded credentials or click the corresponding 1-click login buttons on the sign-in page:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| Patient | patient@demo.com | patient123 | Doctor search, appointment booking, symptom intake, medication reminders |
| Doctor | doctor@demo.com | doctor123 | Consultation queue, pre-visit triage review, clinical notes, prescriptions |
| Administrator | admin@demo.com | admin123 | Physician directory management, practice hours, leave scheduling, clinic audit ledger |

---

## Database Schemas

### User Model
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  googleRefreshToken: { type: String, default: null }
}
```

### Doctor Model
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

### Appointment Model
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
```
*Note: A compound unique index `{ doctor: 1, slotStart: 1 }` with `{ partialFilterExpression: { status: 'booked' } }` is enforced at the database level to prevent double-booking.*

### Medication Reminder Model
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

## API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create a new user account |
| POST | /api/auth/login | Public | Authenticate credentials and return JWT token |
| GET | /api/auth/me | Bearer Token | Fetch authenticated user profile and calendar sync status |

### Patient Services (`/api/patient`)
| Method | Endpoint | Authorization | Role | Description |
|---|---|---|---|---|
| GET | /api/patient/doctors | Bearer Token | Any | List practicing doctors filtered by specialization |
| GET | /api/patient/doctors/:id/slots | Bearer Token | Any | Compute available slots for a given date |
| POST | /api/patient/appointments | Bearer Token | Patient | Book a slot with symptom intake & AI pre-triage |
| GET | /api/patient/appointments | Bearer Token | Patient | Fetch patient booking history |
| GET | /api/patient/reminders | Bearer Token | Patient | Fetch active and past medication reminder schedules |
| PUT | /api/patient/appointments/:id/cancel | Bearer Token | Patient | Cancel an appointment and release slot |

### Doctor Services (`/api/doctor`)
| Method | Endpoint | Authorization | Role | Description |
|---|---|---|---|---|
| GET | /api/doctor/appointments | Bearer Token | Doctor | Retrieve consultation schedule with AI pre-visit briefing |
| GET | /api/doctor/profile | Bearer Token | Doctor | View practicing hours, days, and slot duration |
| PUT | /api/doctor/appointments/:id/complete | Bearer Token | Doctor | Save clinical notes, generate patient summary, and create reminder |

### Administration (`/api/admin`)
| Method | Endpoint | Authorization | Role | Description |
|---|---|---|---|---|
| GET | /api/admin/stats | Bearer Token | Admin | Fetch system KPIs and aggregate metrics |
| GET | /api/admin/doctors | Bearer Token | Admin | List all registered physicians |
| POST | /api/admin/doctors | Bearer Token | Admin | Onboard a new physician profile |
| DELETE | /api/admin/doctors/:id | Bearer Token | Admin | Remove a physician profile from directory |
| POST | /api/admin/doctors/:id/leave | Bearer Token | Admin | Record physician leave and handle existing bookings |
| GET | /api/admin/appointments | Bearer Token | Admin | View clinic-wide appointment ledger |

### Calendar Integration (`/api/calendar`)
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| GET | /api/calendar/connect | Bearer Token | Generate OAuth 2.0 authorization URL |
| POST | /api/calendar/connect-demo | Bearer Token | Enable instantaneous local demo sync |
| GET | /api/calendar/status | Bearer Token | Check active calendar connection state |
| POST | /api/calendar/disconnect | Bearer Token | Revoke stored calendar authorization tokens |
| GET | /api/calendar/oauth/callback | Public | OAuth callback receiver for token exchange |

---

## AI Prompt Templates

### Pre-Visit Clinical Triage
```text
Analyse these symptoms and return ONLY a valid JSON object in this exact format with no extra text:
{
  "urgency": "Low" | "Medium" | "High",
  "chiefComplaint": "<concise 1-sentence summary of main complaint>",
  "questions": ["<Diagnostic question 1>", "<Diagnostic question 2>", "<Diagnostic question 3>"]
}

Symptoms: <symptomsText>
```

### Post-Visit Patient Summary
```text
Convert these clinical notes into a simple, patient-friendly summary.
Include a medication schedule and follow-up steps if mentioned. Write it in plain, reassuring language a non-medical person can understand.

Clinical notes: <clinicalNotes>
```

---

## Google Calendar Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Google Calendar API**.
3. Under **Credentials**, create an **OAuth 2.0 Client ID** configured as a Web application.
4. Set the Authorized redirect URI to:
   `http://localhost:5000/api/calendar/oauth/callback`
5. Copy the generated Client ID and Client Secret into `backend/.env`.
