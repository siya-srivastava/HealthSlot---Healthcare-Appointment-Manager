const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  slotStart: {
    type: Date,
    required: true
  },
  slotEnd: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed'],
    default: 'booked'
  },
  symptomsText: String,
  preVisitSummary: {
    urgency: String,
    chiefComplaint: String,
    questions: [String]
  },
  postVisitNotes: String,
  postVisitSummary: String,
  calendarEventIdPatient: {
    type: String,
    default: null
  },
  calendarEventIdDoctor: {
    type: String,
    default: null
  }
}, { timestamps: true });

appointmentSchema.index(
  { doctor: 1, slotStart: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);