const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const MedicationReminder = require('../models/MedicationReminder');
const { generatePostVisitSummary } = require('../services/llmService');

const getMyAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctorProfile._id })
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ slotStart: 1 });

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { specialisation, workingHours, workingDays, slotDurationMins } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      { specialisation, workingHours, workingDays, slotDurationMins },
      { new: true }
    ).populate('user', 'name email');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const submitPostVisitNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { postVisitNotes, medicationName, timesPerDay, durationDays } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const postVisitSummary = await generatePostVisitSummary(postVisitNotes);

    appointment.postVisitNotes = postVisitNotes;
    appointment.postVisitSummary = postVisitSummary;
    appointment.status = 'completed';
    await appointment.save();

    let reminder = null;
    if (medicationName && timesPerDay && durationDays) {
      reminder = await MedicationReminder.create({
        appointment: appointment._id,
        patient: appointment.patient,
        medicationName,
        timesPerDay: Number(timesPerDay),
        durationDays: Number(durationDays)
      });
    }

    res.status(200).json({
      message: 'Post-visit notes and summary saved successfully',
      appointment,
      reminder
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getMyAppointments,
  getMyProfile,
  updateMyProfile,
  submitPostVisitNotes
};