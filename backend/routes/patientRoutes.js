const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  searchDoctors,
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  getMyMedicationReminders,
  cancelAppointment
} = require('../controllers/patientController');

router.get('/doctors', protect, searchDoctors);
router.get('/doctors/:id/slots', protect, getAvailableSlots);
router.post('/appointments', protect, authorize('patient'), bookAppointment);
router.get('/appointments', protect, authorize('patient'), getMyAppointments);
router.get('/reminders', protect, authorize('patient'), getMyMedicationReminders);
router.put('/appointments/:id/cancel', protect, authorize('patient'), cancelAppointment);

module.exports = router;