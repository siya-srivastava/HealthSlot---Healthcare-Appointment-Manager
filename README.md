# HealthSlot - Healthcare Appointment Manager

**Live Application:** https://healthslot-healthcare-appointment.onrender.com/
**Backend API:** https://healthslot-healthcare-appointment-manager-1ov1.onrender.com/

---

## Table of Contents

- [Setup Guide](#setup-guide)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [LLM Prompt Templates](#llm-prompt-templates)
- [Google Calendar Setup](#google-calendar-setup)

---

## Setup Guide

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB (local instance or MongoDB Atlas URI)

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values (see [Environment Variables](#environment-variables) section below).

```bash
npm install
npm run dev
```

The backend API server starts on `http://localhost:5000`.

### Frontend Setup

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the required values.

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (required)
MONGODB_URI=mongodb://localhost:27017/healthcare_appointment

# Authentication (required)
JWT_SECRET=your_jwt_secret_minimum_32_characters

# Email (required for appointment confirmation emails)
# Sign up at https://app.brevo.com and generate an API key under Settings > API Keys
BREVO_API_KEY=xkeysib-your-brevo-api-key
EMAIL_USER=your-verified-sender@gmail.com

# LLM Integration (optional - falls back to heuristic triage if omitted)
# Option A: Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Option B: Ollama (local)
OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=llama3

# Google Calendar OAuth 2.0 (optional - see Google Calendar Setup section)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
```

---

## Demo Accounts

The backend auto-seeds these accounts on first startup. You can also use the one-click login buttons on the sign-in page.

| Role | Email | Password |
|---|---|---|
| Patient | patient@demo.com | patient123 |
| Doctor | doctor@demo.com | doctor123 |
| Administrator | admin@demo.com | admin123 |

---

## Database Schema

### User

```javascript
{
  name:               String,   // required
  email:              String,   // required, unique, lowercase
  password:           String,   // required, bcrypt hashed
  role:               String,   // enum: "patient" | "doctor" | "admin", default: "patient"
  googleRefreshToken: String    // stored after Google Calendar OAuth, default: null
}
```

### Doctor

```javascript
{
  user:             ObjectId,   // ref: User, required, unique
  specialisation:   String,     // required (e.g. "Cardiology")
  workingHours: {
    start:          String,     // required (e.g. "09:00")
    end:            String      // required (e.g. "17:00")
  },
  workingDays:      [String],   // e.g. ["Monday", "Wednesday", "Friday"]
  slotDurationMins: Number,     // default: 30
  leaveDays:        [Date]      // dates on which doctor is unavailable
}
```

### Appointment

```javascript
{
  patient:                ObjectId,   // ref: User, required
  doctor:                 ObjectId,   // ref: Doctor, required
  slotStart:              Date,       // required
  slotEnd:                Date,       // required
  status:                 String,     // enum: "booked" | "cancelled" | "completed", default: "booked"
  symptomsText:           String,     // patient-submitted symptoms
  preVisitSummary: {
    urgency:              String,     // "Low" | "Medium" | "High"
    chiefComplaint:       String,
    questions:            [String]    // AI-generated diagnostic questions for the doctor
  },
  postVisitNotes:         String,     // doctor's raw clinical notes
  postVisitSummary:       String,     // AI-generated patient-friendly summary
  calendarEventIdPatient: String,     // Google Calendar event ID for the patient
  calendarEventIdDoctor:  String      // Google Calendar event ID for the doctor
}
```

A compound unique index on `{ doctor, slotStart }` with a partial filter on `{ status: "booked" }` prevents double-booking at the database level.

### MedicationReminder

```javascript
{
  appointment:     ObjectId,   // ref: Appointment, required
  patient:         ObjectId,   // ref: User, required
  medicationName:  String,     // required
  timesPerDay:     Number,     // required
  durationDays:    Number,     // required
  startDate:       Date,       // default: Date.now
  lastSentAt:      Date,       // updated after each reminder email dispatch
  active:          Boolean     // set to false once durationDays is exceeded
}
```

---

## API Documentation

All protected routes require an `Authorization: Bearer <token>` header. The JWT token is returned on login and registration.

### Authentication - `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register a new user account |
| POST | /api/auth/login | Public | Authenticate and receive a JWT token |
| GET | /api/auth/me | Bearer Token | Fetch the authenticated user's profile |
| POST | /api/auth/seed-demo | Public | Seed demo accounts (runs automatically on startup) |

#### POST /api/auth/register
```json
// Request body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "patient"
}

// Response 201
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "patient" }
}
```

#### POST /api/auth/login
```json
// Request body
{
  "email": "jane@example.com",
  "password": "securepassword"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "patient" }
}
```

---

### Patient Services - `/api/patient`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | /api/patient/doctors | Any | List doctors, filter by `?specialisation=Cardiology` |
| GET | /api/patient/doctors/:id/slots | Any | Get available slots for a doctor on `?date=YYYY-MM-DD` |
| POST | /api/patient/appointments | Patient | Book a slot with symptom intake and AI pre-triage |
| GET | /api/patient/appointments | Patient | Fetch the patient's appointment history |
| GET | /api/patient/reminders | Patient | Fetch active and past medication reminders |
| PUT | /api/patient/appointments/:id/cancel | Patient | Cancel a booked appointment |

#### POST /api/patient/appointments
```json
// Request body
{
  "doctorId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "slotStart": "2026-09-01T09:00:00.000Z",
  "slotEnd": "2026-09-01T09:30:00.000Z",
  "symptomsText": "I have had a persistent headache for three days with mild nausea."
}

// Response 201
{
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "...",
    "status": "booked",
    "preVisitSummary": {
      "urgency": "Medium",
      "chiefComplaint": "Persistent headache for three days with mild nausea",
      "questions": ["...", "...", "..."]
    }
  }
}
```

---

### Doctor Services - `/api/doctor`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | /api/doctor/appointments | Doctor | Retrieve the consultation queue with AI pre-visit summaries |
| GET | /api/doctor/profile | Doctor | View the doctor's own schedule and working configuration |
| PUT | /api/doctor/appointments/:id/complete | Doctor | Submit clinical notes, generate patient summary, create medication reminder |

#### PUT /api/doctor/appointments/:id/complete
```json
// Request body
{
  "postVisitNotes": "Patient presents with tension headache. Prescribed Ibuprofen 400mg TID for 5 days. Follow up if symptoms persist beyond 7 days.",
  "medicationName": "Ibuprofen 400mg",
  "timesPerDay": 3,
  "durationDays": 5
}

// Response 200
{
  "message": "Appointment completed",
  "appointment": {
    "status": "completed",
    "postVisitNotes": "...",
    "postVisitSummary": "AI-generated patient-friendly summary..."
  }
}
```

---

### Administration - `/api/admin`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | /api/admin/stats | Admin | Fetch system KPIs: total appointments, active patients, doctors, cancellation rate |
| GET | /api/admin/doctors | Admin | List all registered physicians |
| POST | /api/admin/doctors | Admin | Onboard a new physician profile |
| DELETE | /api/admin/doctors/:id | Admin | Remove a physician from the directory |
| POST | /api/admin/doctors/:id/leave | Admin | Record a leave day; auto-cancels conflicting bookings and notifies patients |
| GET | /api/admin/appointments | Admin | View the clinic-wide appointment ledger |

#### POST /api/admin/doctors
```json
// Request body
{
  "name": "Dr. Priya Sharma",
  "email": "priya.sharma@clinic.com",
  "password": "securepassword",
  "specialisation": "Neurology",
  "workingHours": { "start": "10:00", "end": "18:00" },
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "slotDurationMins": 30
}
```

#### POST /api/admin/doctors/:id/leave
```json
// Request body
{
  "date": "2026-09-15"
}

// Response 200
{
  "message": "Leave day registered for 9/15/2026. 2 conflicting booking(s) cancelled and patients notified via email.",
  "affectedCount": 2
}
```

---

### Calendar Integration - `/api/calendar`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/calendar/connect | Bearer Token | Generate Google OAuth 2.0 authorization URL |
| GET | /api/calendar/oauth/callback | Public | OAuth redirect callback, exchanges code for refresh token |
| POST | /api/calendar/connect-demo | Bearer Token | Enable demo calendar sync mode (no OAuth required) |
| GET | /api/calendar/status | Bearer Token | Check the user's current calendar connection status |
| POST | /api/calendar/disconnect | Bearer Token | Revoke stored OAuth tokens and disconnect calendar |

---

## LLM Prompt Templates

The system supports Google Gemini and Ollama as LLM backends. If neither is configured, a keyword-based heuristic fallback handles triage automatically.

### Pre-Visit Clinical Triage Prompt

Sent to the LLM when a patient submits symptoms during booking.

```text
You are a clinical AI triage assistant. Analyse these patient symptoms and return ONLY a valid JSON object in this exact format with no extra text or markdown formatting:
{
  "urgency": "Low" or "Medium" or "High",
  "chiefComplaint": "Concise summary of main complaint (1 sentence)",
  "questions": ["Doctor diagnostic question 1", "Doctor diagnostic question 2", "Doctor diagnostic question 3"]
}

Symptoms: <symptomsText>
```

Expected response format:
```json
{
  "urgency": "Medium",
  "chiefComplaint": "Persistent headache lasting three days accompanied by mild nausea",
  "questions": [
    "How would you describe the location and type of pain - is it throbbing, pressure-like, or sharp?",
    "Have you experienced similar episodes before, and if so, how long did they last?",
    "Are you currently taking any medications, including over-the-counter pain relief?"
  ]
}
```

### Post-Visit Patient Summary Prompt

Sent to the LLM after a doctor submits clinical notes for a completed consultation.

```text
Convert these clinical doctor notes into a simple, patient-friendly summary.
Include a clear medication schedule and follow-up steps if mentioned. Write in plain, reassuring, easy-to-understand language.

Clinical notes: <clinicalNotes>
```

### Heuristic Fallback Logic

When no LLM is configured, urgency is determined by keyword matching:

| Urgency | Trigger Keywords |
|---|---|
| High | chest pain, difficulty breathing, shortness of breath, severe, unconscious, stroke, heavy bleeding, high fever, fracture |
| Medium | fever, vomiting, infection, migraine, persistent, swelling, acute, dizziness |
| Low | all other cases |

---

## Google Calendar Setup

These steps are required only if you want two-way Google Calendar sync for appointments. The application works fully without this integration.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.

2. In the project, navigate to **APIs and Services** and click **Enable APIs and Services**. Search for and enable the **Google Calendar API**.

3. Go to **APIs and Services > Credentials** and click **Create Credentials > OAuth 2.0 Client ID**.

4. Set the application type to **Web application**.

5. Under **Authorized redirect URIs**, add:
   - For local development: `http://localhost:5000/api/calendar/oauth/callback`
   - For production: `https://your-backend-domain.onrender.com/api/calendar/oauth/callback`

6. Click **Create** and copy the generated **Client ID** and **Client Secret**.

7. Add them to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
   ```

8. In the Google Cloud Console under **OAuth consent screen**, add your Gmail address as a test user while the app is in development mode.

Once configured, users can connect their Google Calendar from within the app. All booked appointments will automatically create calendar events for both the patient and the doctor, and cancelled appointments will remove those events.
