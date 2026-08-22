const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialisation: {
    type: String,
    required: true
  },
  workingHours: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  workingDays: {
    type: [String],
    required: true
  },
  slotDurationMins: {
    type: Number,
    required: true,
    default: 30
  },
  leaveDays: [
    {
      type: Date
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);