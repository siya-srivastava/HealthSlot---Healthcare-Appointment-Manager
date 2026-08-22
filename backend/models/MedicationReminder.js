const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationName: {
    type: String,
    required: true
  },
  timesPerDay: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  lastSentAt: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicationReminder', reminderSchema);