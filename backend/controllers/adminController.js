const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicationReminder = require('../models/MedicationReminder');
const bcrypt = require('bcryptjs');
const { sendEmail, cancellationEmail } = require('../services/emailService');

const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialisation, workingHours, workingDays, slotDurationMins } = req.body;

    if (!name || !email || !password || !specialisation || !workingHours || !workingDays) {
      return res.status(400).json({ message: 'All fields including working hours and days are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'doctor'
    });
    await newUser.save();

    const newDoctor = new Doctor({
      user: newUser._id,
      specialisation,
      workingHours,
      workingDays,
      slotDurationMins: Number(slotDurationMins) || 30
    });
    await newDoctor.save();

    const populatedDoctor = await Doctor.findById(newDoctor._id).populate('user', 'name email');

    res.status(201).json({ message: 'Doctor created successfully', doctor: populatedDoctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true }).populate('user', 'name email');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ message: 'Doctor updated successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(id);

    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addLeaveDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Leave date is required' });
    }

    const doctor = await Doctor.findById(id).populate('user', 'name email');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const leaveDate = new Date(date);
    const alreadyOnLeave = doctor.leaveDays.some(
      (d) => new Date(d).toDateString() === leaveDate.toDateString()
    );

    if (!alreadyOnLeave) {
      doctor.leaveDays.push(leaveDate);
      await doctor.save();
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const affectedAppointments = await Appointment.find({
      doctor: id,
      status: 'booked',
      slotStart: { $gte: startOfDay, $lte: endOfDay }
    }).populate('patient', 'name email');

    for (const appt of affectedAppointments) {
      appt.status = 'cancelled';
      await appt.save();

      if (appt.patient?.email) {
        try {
          await sendEmail(
            appt.patient.email,
            'Appointment Cancelled - Doctor Unavailable',
            cancellationEmail(
              appt.patient.name,
              doctor.user.name,
              appt.slotStart,
              'Doctor is marked on leave on this date. Please log in and rebook for another convenient slot.'
            )
          );
        } catch (eErr) {
          console.error('Leave cancellation email error:', eErr.message);
        }
      }
    }

    res.status(200).json({
      message: `Leave day registered for ${new Date(date).toLocaleDateString()}. ${affectedAppointments.length} conflicting booking(s) cancelled and patients notified via email.`,
      doctor,
      affectedCount: affectedAppointments.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getClinicStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      slotStart: { $gte: startOfToday, $lte: endOfToday }
    });

    const bookedAppointments = await Appointment.countDocuments({ status: 'booked' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const activeMedications = await MedicationReminder.countDocuments({ active: true });

    res.status(200).json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      bookedAppointments,
      completedAppointments,
      cancelledAppointments,
      activeMedications
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ slotStart: -1 });

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  addLeaveDay,
  getClinicStats,
  getAllAppointments
};