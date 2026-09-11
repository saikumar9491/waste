require('dotenv').config();
const mongoose = require('mongoose');

const Complaint = require('../models/Complaint');
const Collector = require('../models/Collector');
const Notification = require('../models/Notification');
const User = require('../models/User');

async function cleanDatabase() {
  try {
    console.log('Connecting to MongoDB:', process.env.MONGO_URI ? 'URI defined' : 'No URI');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database.');

    // 1. Delete all complaints
    const deletedComplaints = await Complaint.deleteMany({});
    console.log(`Deleted ${deletedComplaints.deletedCount} complaints.`);

    // 2. Delete all notifications
    const deletedNotifications = await Notification.deleteMany({});
    console.log(`Deleted ${deletedNotifications.deletedCount} notifications.`);

    // 3. Delete all collectors
    const deletedCollectors = await Collector.deleteMany({});
    console.log(`Deleted ${deletedCollectors.deletedCount} collector profiles.`);

    // 4. Delete all demo users except balisaikumar9491@gmail.com
    const deletedUsers = await User.deleteMany({
      email: { $ne: 'balisaikumar9491@gmail.com' }
    });
    console.log(`Deleted ${deletedUsers.deletedCount} demo users.`);

    // 5. Ensure admin balisaikumar9491@gmail.com exists with clean state
    const adminUser = await User.findOneAndUpdate(
      { email: 'balisaikumar9491@gmail.com' },
      {
        name: 'Sai Kumar',
        email: 'balisaikumar9491@gmail.com',
        role: 'admin',
        ecoPoints: 0,
        badges: [],
        authProvider: 'google',
        phone: ''
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Admin account confirmed: ${adminUser.email} (Role: ${adminUser.role}, Points: ${adminUser.ecoPoints})`);

    console.log('Database successfully cleaned for production launch!');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning database:', err);
    process.exit(1);
  }
}

cleanDatabase();
