const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicationReminder = require('../models/MedicationReminder');
const User = require('../models/User');
const { generateSlotsForDay } = require('../services/slotService');
const { generatePreVisitSummary } = require('../services/llmService');
const { sendEmail, bookingConfirmationEmail, cancellationEmail } = require('../services/emailService');
const { createCalendarEvent, deleteCalendarEvent } = require('../services/calendarService');

const searchDoctors = async (req, res) => {
  try {
    const { specialisation } = req.query;
    const filter = specialisation ? { specialisation: new RegExp(specialisation, 'i') } : {};

    const doctors = await Doctor.find(filter).populate('user', 'name email');
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required, e.g. ?date=2026-08-25' });
    }

    const doctor = await Doctor.findById(id).populate('user', 'name email');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.workingDays.includes(dayName)) {
      return res.status(200).json({ slots: [], message: `Doctor does not consult on ${dayName}s` });
    }

    const isOnLeave = doctor.leaveDays.some(
      (leave) => new Date(leave).toDateString() === new Date(date).toDateString()
    );
    if (isOnLeave) {
      return res.status(200).json({ slots: [], message: 'Doctor is on leave on this date' });
    }

    const allSlots = generateSlotsForDay(doctor.workingHours, doctor.slotDurationMins, date);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: id,
      status: 'booked',
      slotStart: { $gte: startOfDay, $lte: endOfDay }
    });

    const bookedTimes = bookedAppointments.map((a) => a.slotStart.getTime());

    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot.slotStart.getTime())
    );

    res.status(200).json({ slots: availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, slotStart, slotEnd, symptomsText } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !slotStart || !slotEnd || !symptomsText) {
      return res.status(400).json({ message: 'Doctor, slot times, and symptoms description are required' });
    }

    const preVisitSummary = await generatePreVisitSummary(symptomsText);

    const newAppointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      symptomsText,
      preVisitSummary,
      status: 'booked'
    });

    await newAppointment.save();

    const patient = await User.findById(patientId);
    const doctor = await Doctor.findById(doctorId).populate('user', 'name email googleRefreshToken');

    if (patient && doctor) {
      sendEmail(
        patient.email,
        'Appointment Confirmed',
        bookingConfirmationEmail(patient.name, doctor.user.name, slotStart)
      );
      sendEmail(
        doctor.user.email,
        'New Appointment Booked',
        `<p>You have a new appointment with ${patient.name} on ${new Date(slotStart).toLocaleString()}.</p><p>Urgency: <strong>${preVisitSummary.urgency}</strong></p>`
      );

      if (patient.googleRefreshToken) {
        const result = await createCalendarEvent(patient.googleRefreshToken, {
          summary: `Appointment with Dr. ${doctor.user.name}`,
          description: `Healthcare appointment booked via app.\nSymptoms: ${symptomsText}`,
          startTime: slotStart,
          endTime: slotEnd
        });
        if (result.success) {
          newAppointment.calendarEventIdPatient = result.eventId;
        }
      }

      if (doctor.user.googleRefreshToken) {
        const result = await createCalendarEvent(doctor.user.googleRefreshToken, {
          summary: `Appointment with ${patient.name}`,
          description: `Patient symptoms: ${symptomsText}\nUrgency: ${preVisitSummary.urgency}\nChief Complaint: ${preVisitSummary.chiefComplaint}`,
          startTime: slotStart,
          endTime: slotEnd
        });
        if (result.success) {
          newAppointment.calendarEventIdDoctor = result.eventId;
        }
      }

      await newAppointment.save();
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This slot was just booked by someone else. Please pick another slot.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
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

const getMyMedicationReminders = async (req, res) => {
  try {
    const reminders = await MedicationReminder.find({ patient: req.user.id })
      .populate({
        path: 'appointment',
        populate: {
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name email googleRefreshToken' }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';

    const patient = await User.findById(appointment.patient);

    if (patient && patient.googleRefreshToken && appointment.calendarEventIdPatient) {
      await deleteCalendarEvent(patient.googleRefreshToken, appointment.calendarEventIdPatient);
    }
    if (appointment.doctor?.user?.googleRefreshToken && appointment.calendarEventIdDoctor) {
      await deleteCalendarEvent(appointment.doctor.user.googleRefreshToken, appointment.calendarEventIdDoctor);
    }

    await appointment.save();

    if (patient && appointment.doctor?.user) {
      sendEmail(
        patient.email,
        'Appointment Cancelled',
        cancellationEmail(patient.name, appointment.doctor.user.name, appointment.slotStart, 'Cancelled by patient')
      );
    }

    res.status(200).json({ message: 'Appointment cancelled successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  searchDoctors,
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  getMyMedicationReminders,
  cancelAppointment
};