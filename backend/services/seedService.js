const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');

const seedDemoData = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      const hashedAdminPass = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Clinic Administrator',
        email: 'admin@demo.com',
        password: hashedAdminPass,
        role: 'admin'
      });
      console.log('✓ Demo Admin account seeded (admin@demo.com / admin123)');
    }

    const doctor1Exists = await User.findOne({ email: 'doctor@demo.com' });
    if (!doctor1Exists) {
      const hashedDoctorPass = await bcrypt.hash('doctor123', 10);
      const docUser1 = await User.create({
        name: 'Sarah Connor',
        email: 'doctor@demo.com',
        password: hashedDoctorPass,
        role: 'doctor'
      });

      await Doctor.create({
        user: docUser1._id,
        specialisation: 'Cardiology',
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slotDurationMins: 30,
        leaveDays: []
      });
      console.log('✓ Demo Doctor account seeded (doctor@demo.com / doctor123 - Cardiology)');
    }

    const doctor2Exists = await User.findOne({ email: 'doctor2@demo.com' });
    if (!doctor2Exists) {
      const hashedDoctorPass2 = await bcrypt.hash('doctor123', 10);
      const docUser2 = await User.create({
        name: 'Marcus Vance',
        email: 'doctor2@demo.com',
        password: hashedDoctorPass2,
        role: 'doctor'
      });

      await Doctor.create({
        user: docUser2._id,
        specialisation: 'General Medicine',
        workingHours: { start: '08:30', end: '16:30' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        slotDurationMins: 30,
        leaveDays: []
      });
    }

    const doctor3Exists = await User.findOne({ email: 'doctor3@demo.com' });
    if (!doctor3Exists) {
      const hashedDoctorPass3 = await bcrypt.hash('doctor123', 10);
      const docUser3 = await User.create({
        name: 'Elena Rostova',
        email: 'doctor3@demo.com',
        password: hashedDoctorPass3,
        role: 'doctor'
      });

      await Doctor.create({
        user: docUser3._id,
        specialisation: 'Dermatology',
        workingHours: { start: '10:00', end: '18:00' },
        workingDays: ['Monday', 'Wednesday', 'Friday'],
        slotDurationMins: 45,
        leaveDays: []
      });
    }

    const patientExists = await User.findOne({ email: 'patient@demo.com' });
    if (!patientExists) {
      const hashedPatientPass = await bcrypt.hash('patient123', 10);
      await User.create({
        name: 'John Doe',
        email: 'patient@demo.com',
        password: hashedPatientPass,
        role: 'patient'
      });
      console.log('✓ Demo Patient account seeded (patient@demo.com / patient123)');
    }
  } catch (err) {
    console.log('Seed check skipped/completed:', err.message);
  }
};

module.exports = { seedDemoData };
