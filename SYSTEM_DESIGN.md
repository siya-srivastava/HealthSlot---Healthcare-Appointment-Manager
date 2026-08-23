# HealthSlot - System Design

---

## Double-Booking Prevention

The most critical correctness requirement in any appointment system is ensuring that two patients cannot book the same doctor at the same time slot. In HealthSlot, this is enforced at two independent layers so that neither can be bypassed on its own.

At the database layer, the Appointment collection carries a compound unique index on the `doctor` and `slotStart` fields, but only for documents where `status` is `"booked"`. This is a partial unique index in MongoDB. The practical effect is that once a slot is booked, any second attempt to insert a document for the same doctor and start time will throw a duplicate key error (`error code 11000`) before the record ever persists. Cancelled appointments are excluded from the index so that a slot freed by a cancellation becomes immediately available again without any cleanup job.

At the application layer, the `/api/patient/doctors/:id/slots` endpoint computes available slots on the fly before a patient ever sees the booking screen. It generates all theoretical slots from the doctor's working hours and slot duration, then queries the database for already-booked slots on that date and removes them from the response. This means a patient is only ever shown genuinely available slots.

The database constraint is the authoritative guard. The application-layer filtering is a usability layer that reduces the chance of a race condition reaching the database in the first place. If two users do manage to submit simultaneously for the same slot, exactly one will succeed and the other will receive a clear conflict response that instructs them to pick another slot.

---

## Doctor Leave Conflict Handling

When an administrator marks a doctor on leave for a specific date, the system needs to handle two things: blocking new bookings on that day, and dealing with appointments that were already confirmed before the leave was recorded.

For new bookings, the slot generation logic checks the doctor's `leaveDays` array before returning any slots. If the requested date falls on a leave day, the endpoint returns an empty slot list with a clear message. No slots are shown, so no booking can be made.

For existing bookings, the leave registration endpoint queries all appointments for that doctor on the given date that are still in `"booked"` status. Each of those appointments is updated to `"cancelled"`, and a cancellation email is dispatched to the patient notifying them that their appointment has been affected by a schedule change and asking them to rebook. The number of affected appointments is returned in the admin response so the administrator has visibility into the impact of the leave entry.

This is handled synchronously in a single request so that by the time the admin sees the confirmation, every conflicting appointment has already been cancelled and every affected patient has been notified.

---

## Slot Hold Mechanism

HealthSlot does not implement an explicit time-limited slot reservation or hold before a booking is confirmed. This is a deliberate choice given the current scale of the application.

The booking flow is designed to be short: a patient selects a slot, submits symptoms, and the booking is confirmed in the same request. The AI pre-visit triage runs as part of that same request with a timeout, and if the LLM does not respond in time, the system falls back to a rule-based triage result and continues. There is no multi-step checkout where a slot sits in a pending state waiting for the user to complete a payment or a form on a second screen.

The race condition window is therefore very narrow. The compound unique index at the database level handles any collision that does occur in that window cleanly, without corrupting data or creating ghost bookings. If the application were to grow to a scale where simultaneous contention on popular slots became frequent, the natural extension would be a short-lived Redis lock acquired at the start of the booking request and released once the database write either succeeds or fails.

---

## Notification Failure Handling

Email delivery in HealthSlot is treated as a best-effort operation. A failed email should never cause an appointment booking to fail or roll back, because from the system's perspective the appointment record is the source of truth, not the notification.

In `patientController.js`, both the patient confirmation email and the doctor alert email are wrapped in a try-catch block that is separate from the appointment persistence logic. If the Brevo API returns an error or the network call fails, the error is logged to the server console and execution continues. The appointment has already been saved to the database at that point, so the booking stands regardless of whether the email went through.

The same pattern applies to leave cancellation notifications in `adminController.js`. If a patient's email address is missing or the delivery fails, the appointment is still cancelled and the slot is still freed. The notification failure is recorded in the logs so it can be investigated, but it does not block the administrative operation.

This separation means the core booking and scheduling logic is never held hostage to the availability of a third-party email service. Operators can diagnose delivery issues independently by checking the Render logs or the Brevo dashboard, without those issues affecting what patients and doctors experience in the application itself.
