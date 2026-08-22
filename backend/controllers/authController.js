const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { seedDemoData } = require('../services/seedService');

const JWT_SECRET = process.env.JWT_SECRET || 'healthcare_fallback_secret_key_2026';

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'patient'
    });

    await newUser.save();

    // If registering as a doctor directly from registration page, create default doctor profile
    if (newUser.role === 'doctor') {
      await Doctor.create({
        user: newUser._id,
        specialisation: 'General Medicine',
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slotDurationMins: 30,
        leaveDays: []
      });
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isCalendarConnected: false
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    // If demo account not yet seeded in MongoDB, auto-seed on demand
    if (!user && (email === 'admin@demo.com' || email === 'doctor@demo.com' || email === 'patient@demo.com')) {
      await seedDemoData();
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let doctorProfileId = null;
    if (user.role === 'doctor') {
      let doc = await Doctor.findOne({ user: user._id });
      if (!doc) {
        doc = await Doctor.create({
          user: user._id,
          specialisation: 'General Medicine',
          workingHours: { start: '09:00', end: '17:00' },
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          slotDurationMins: 30,
          leaveDays: []
        });
      }
      doctorProfileId = doc._id;
    }

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId: doctorProfileId,
        isCalendarConnected: Boolean(user.googleRefreshToken)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId: doctorProfile?._id,
        doctorProfile: doctorProfile,
        isCalendarConnected: Boolean(user.googleRefreshToken)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const seedDemo = async (req, res) => {
  try {
    await seedDemoData();
    res.json({ message: 'Demo accounts seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to seed demo data', error: err.message });
  }
};

module.exports = { register, login, getMe, seedDemo };