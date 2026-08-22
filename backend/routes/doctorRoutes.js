const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getMyAppointments,
  getMyProfile,
  updateMyProfile,
  submitPostVisitNotes
} = require('../controllers/doctorController');

router.get('/appointments', protect, authorize('doctor'), getMyAppointments);
router.get('/profile', protect, authorize('doctor'), getMyProfile);
router.put('/profile', protect, authorize('doctor'), updateMyProfile);
router.put('/appointments/:id/complete', protect, authorize('doctor'), submitPostVisitNotes);

module.exports = router;