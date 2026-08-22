const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  addLeaveDay,
  getClinicStats,
  getAllAppointments
} = require('../controllers/adminController');

router.post('/doctors', protect, authorize('admin'), createDoctor);
router.get('/doctors', protect, authorize('admin'), getAllDoctors);
router.put('/doctors/:id', protect, authorize('admin'), updateDoctor);
router.delete('/doctors/:id', protect, authorize('admin'), deleteDoctor);
router.post('/doctors/:id/leave', protect, authorize('admin'), addLeaveDay);
router.get('/stats', protect, authorize('admin'), getClinicStats);
router.get('/appointments', protect, authorize('admin'), getAllAppointments);

module.exports = router;