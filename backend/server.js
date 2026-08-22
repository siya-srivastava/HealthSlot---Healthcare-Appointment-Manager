const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const { startReminderJob } = require('./jobs/reminderJob');
const { seedDemoData } = require('./services/seedService');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Healthcare Appointment & Follow-up Manager API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patient: '/api/patient',
      doctor: '/api/doctor',
      admin: '/api/admin',
      calendar: '/api/calendar'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/calendar', calendarRoutes);

const connectDB = async () => {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully via MONGO_URI');
      await seedDemoData();
      startReminderJob();
      return;
    } catch (err) {
      console.log('Failed to connect to configured MONGO_URI:', err.message);
    }
  }

  // Try standard local MongoDB
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/healthcare_appointment', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('Connected to local MongoDB (127.0.0.1:27017)');
    await seedDemoData();
    startReminderJob();
    return;
  } catch (localErr) {
    console.log('Local MongoDB not running, starting zero-config embedded database...');
  }

  // Fallback to embedded in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('Connected to embedded in-memory MongoDB successfully!');
    await seedDemoData();
    startReminderJob();
  } catch (memErr) {
    console.error('Fatal Database Connection Error:', memErr.message);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));