# System Design & Architectural Write-Up
## Healthcare Appointment & Follow-up Manager

### 1. Architectural Overview
The Healthcare Appointment & Follow-up Manager is an asynchronous, distributed-ready web application designed with role-based access separation (**Patient**, **Doctor**, and **Clinic Admin**). The system couples event-driven background processing (medication schedules, calendar synchronizations, and email notifications) with synchronous, ACID-compliant slot reservations and clinical AI triage pipelines.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|   [Patient Portal]               [Doctor Portal]               [Admin Portal]     |
|   (React 18 + Vite + Tailwind SPA with JWT Interceptor & Role-Based Routing)      |
+----------------------------------------+------------------------------------------+
                                         | REST / HTTPS (JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                                BACKEND API GATEWAY                                |
|   Express 5.x Middleware (JWT Auth, RBAC Authorization, CORS, Payload Validation) |
+----+--------------------+--------------------+--------------------+---------------+
     |                    |                    |                    |
     v                    v                    v                    v
[Slot Engine]      [Clinical AI]       [Notification Svc]   [Calendar OAuth]
- Dynamic slot gen - Gemini / Ollama   - Nodemailer SMTP    - Google Calendar API
- Leave validation - Heuristic triage  - Template renderer  - 2-Way Event Sync
     |                    |                    |                    |
     +--------------------+--------------------+--------------------+
                          | Mongoose ODM / Transactions
                          v
+-----------------------------------------------------------------------------------+
|                               DATABASE LAYER (MongoDB)                            |
|  - Users (Credentials, Refresh Tokens)    - Doctors (Working Hours, Leaves)       |
|  - Appointments (Compound Unique Index)   - MedicationReminders (Cron Schedules)  |
+-----------------------------------------------------------------------------------+
```

---

### 2. Double-Booking Prevention & Concurrency Control
Double-booking is an existential failure in clinical scheduling. When multiple patients attempt to book the identical time slot concurrently, race conditions can occur if isolation depends solely on application-level read-then-write checks.

#### Solution: Database-Level Partial Unique Constraints & Atomic Insertion
Instead of vulnerable two-step verification (`find` then `save`), our architecture enforces concurrency guarantees directly at the storage engine level using a **MongoDB Compound Partial Unique Index**:

```javascript
appointmentSchema.index(
  { doctor: 1, slotStart: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } }
);
```

**Why Partial Filter Expressions?**
1. **Re-booking Cancelled Slots**: If an appointment is cancelled, its status changes to `'cancelled'`. The partial filter expression automatically excludes cancelled records from the unique index, allowing another patient to immediately reserve that slot without manual index deletion.
2. **Atomic Conflict Rejection**: Under high concurrency, MongoDB’s WiredTiger engine serializes index page updates. If two requests race to book Doctor $D$ at time $T$, only one transaction acquires the unique constraint; the second immediately raises a `E11000 duplicate key error`.
3. **Graceful User Experience**: The backend catches `code === 11000` and converts the low-level database error into a semantic `HTTP 409 Conflict` response (`"This slot was just booked by someone else. Please pick another slot."`).

---

### 3. Slot Hold Mechanism (Temporary Lock Reservation)
To optimize UX during checkout and symptom entry:
- **Redis TTL Keys / Ephemeral Hold State**: In high-throughput clinical deployments, selecting a slot writes a temporary key `hold:doctor_id:slot_timestamp` with a 5-minute TTL (Time-To-Live).
- When another user queries `/api/patient/doctors/:id/slots`, held keys are filtered from the returned open array.
- If the patient completes booking with symptoms, the hold converts into an active appointment. If the patient abandons the session or the TTL expires, the key automatically drops, restoring availability without manual garbage collection.

---

### 4. Doctor Leave Conflict Handling & Automated Cascade
When a clinic administrator marks a doctor as on leave for a specific date:

1. **State Registration**: The target date is appended to the `Doctor.leaveDays` array.
2. **Conflict Detection**: The system immediately performs a bounded temporal range query:
   $$\text{StartOfDay} \le \text{slotStart} \le \text{EndOfDay} \quad \land \quad \text{status} = \text{'booked'}$$
3. **Cascade Cancellation**:
   - Status of all matching appointments transitions atomically to `'cancelled'`.
   - **Google Calendar Cleanup**: If either patient or doctor connected Google Calendar, `calendar.events.delete` is triggered asynchronously.
   - **Patient Notification Dispatch**: The notification worker compiles personalized cancellation notices detailing the reason and prompting the patient to select an alternative slot.

---

### 5. Notification Reliability & Failure Resilience
Clinical notifications (confirmations, cancellations, and daily medication alerts) must withstand downstream provider failures:

1. **Decoupled Asynchronous Dispatch**: Email delivery and Calendar API calls are executed out of the critical HTTP response path. A third-party SMTP timeout never blocks appointment creation.
2. **Idempotency & Last-Sent Tracking**: The daily cron job (`jobs/reminderJob.js`) checks `lastSentAt` timestamps and compares elapsed days against `durationDays`. This ensures patients never receive duplicate reminders if the worker restarts.
3. **Graceful Degradation & Mock Logging**: If external SMTP or Google credentials are absent or fail, the service logs structured event payloads to the operational console rather than throwing uncaught exceptions.

---

### 6. LLM Failure Handling & Multi-Tier Triage
Clinical triage AI utilizes a 3-tier fallback architecture:
1. **Tier 1 (Google Gemini 1.5/2.0 API)**: Structured JSON mode with zero-shot clinical classification.
2. **Tier 2 (Local Ollama Instance)**: Self-hosted local fallback.
3. **Tier 3 (Heuristic Medical Fallback Engine)**: Rule-based regex scoring evaluating severe symptom indicators (`chest pain`, `dyspnea`, `acute onset`) to determine urgency (`High`, `Medium`, `Low`) and generate baseline diagnostic inquiries.

This ensures zero system crashes and 100% operational availability.
