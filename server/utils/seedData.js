const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Collector = require('../models/Collector');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wastewise_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Collector.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleaned existing database records.');

    // 1. Create Users
    const citizen = await User.create({
      name: 'Sai Kumar',
      email: 'citizen@wastewise.org',
      password: 'citizen123',
      phone: '+91 98765 11111',
      role: 'citizen',
      ecoPoints: 420,
      badges: [
        { name: 'Eco Starter', icon: '🌱', earnedAt: new Date(Date.now() - 30 * 86400000) },
        { name: 'Active Spotter', icon: '📷', earnedAt: new Date(Date.now() - 15 * 86400000) },
        { name: 'Community Guardian', icon: '🛡️', earnedAt: new Date(Date.now() - 2 * 86400000) }
      ]
    });

    const collectorRaj = await User.create({
      name: 'Raj Kumar',
      email: 'raj@wastewise.org',
      password: 'collector123',
      phone: '+91 98765 22222',
      role: 'collector',
      ecoPoints: 0
    });

    const collectorAmit = await User.create({
      name: 'Amit Singh',
      email: 'amit@wastewise.org',
      password: 'collector123',
      phone: '+91 98765 33333',
      role: 'collector',
      ecoPoints: 0
    });

    const admin = await User.create({
      name: 'Pooja Verma (Chief Officer)',
      email: 'admin@wastewise.org',
      password: 'admin123',
      phone: '+91 98765 44444',
      role: 'admin',
      ecoPoints: 0
    });

    // Leaderboard citizens
    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@wastewise.org',
      password: 'password123',
      phone: '+91 98765 55555',
      role: 'citizen',
      ecoPoints: 850,
      badges: [{ name: 'Eco Champion', icon: '🏆', earnedAt: new Date() }]
    });

    const rahul = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@wastewise.org',
      password: 'password123',
      phone: '+91 98765 66666',
      role: 'citizen',
      ecoPoints: 980,
      badges: [{ name: 'Legendary Recycler', icon: '🌟', earnedAt: new Date() }]
    });

    const aman = await User.create({
      name: 'Aman Deep',
      email: 'aman@wastewise.org',
      password: 'password123',
      phone: '+91 98765 77777',
      role: 'citizen',
      ecoPoints: 720,
      badges: [{ name: 'Green Crusader', icon: '🎖️', earnedAt: new Date() }]
    });

    console.log('✅ Seeded Users (Citizen, 2 Collectors, Admin, Leaderboard citizens).');

    // 2. Create Collector Profiles (With GPS Proximity)
    // Base center: 31.2210, 75.7720 (Phagwara / Campus Area)
    await Collector.create({
      userId: collectorRaj._id,
      vehicle: 'Truck-12 (Heavy Compactor)',
      vehicleType: 'Compactor',
      availability: 'Available',
      latitude: 31.2350, // ~2.1 km away
      longitude: 75.7820,
      currentAddress: 'Sector 8 Transit Hub',
      assignedTasks: 2,
      completedTasks: 28,
      rating: 4.9
    });

    await Collector.create({
      userId: collectorAmit._id,
      vehicle: 'Van-04 (Quick Response)',
      vehicleType: 'Van',
      availability: 'On Task',
      latitude: 31.2480, // ~4.8 km away
      longitude: 75.7990,
      currentAddress: 'Industrial Extension Gate 2',
      assignedTasks: 3,
      completedTasks: 19,
      rating: 4.7
    });

    console.log('✅ Seeded Collector profiles with real GPS coordinates.');

    // 3. Create Realistic Complaints
    const complaintsData = [
      {
        complaintId: 'WW-10245',
        userId: citizen._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'Plastic',
        confidence: 94,
        description: 'Large pile of plastic bottles and packaging dumped near the college main road gate.',
        aiSummary: 'High-density plastic accumulation near College Road Gate',
        latitude: 31.2210,
        longitude: 75.7720,
        address: 'College Road, Phagwara, Punjab',
        priority: 'HIGH',
        priorityReason: 'Large plastic waste accumulation detected in a public area with high foot traffic.',
        status: 'Assigned',
        assignedCollector: {
          collectorId: collectorRaj._id,
          name: collectorRaj.name,
          phone: collectorRaj.phone,
          vehicle: 'Truck-12 (Heavy Compactor)',
          assignedAt: new Date(Date.now() - 40 * 60000)
        },
        statusHistory: [
          { status: 'Complaint Created', note: 'Reported by citizen with GPS photo.', updatedBy: citizen.name, timestamp: new Date(Date.now() - 60 * 60000) },
          { status: 'AI Analyzed', note: 'Classified: Plastic (94%), Priority: HIGH', updatedBy: 'WasteWise AI', timestamp: new Date(Date.now() - 59 * 60000) },
          { status: 'Assigned', note: 'Assigned to Raj Kumar (Truck-12)', updatedBy: admin.name, timestamp: new Date(Date.now() - 40 * 60000) }
        ]
      },
      {
        complaintId: 'WW-10246',
        userId: citizen._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'Organic',
        confidence: 91,
        description: 'Vegetable peelings and rotting market waste accumulating behind the vegetable market.',
        aiSummary: 'Rotting vegetable market waste behind Mandi Lane',
        latitude: 31.2285,
        longitude: 75.7650,
        address: 'Subzi Mandi Lane 3, Phagwara',
        priority: 'MEDIUM',
        priorityReason: 'Organic perishable waste with odor potential.',
        status: 'Pending',
        statusHistory: [
          { status: 'Complaint Created', note: 'Reported by citizen.', updatedBy: citizen.name, timestamp: new Date(Date.now() - 25 * 60000) },
          { status: 'AI Analyzed', note: 'Classified: Organic (91%), Priority: MEDIUM', updatedBy: 'WasteWise AI', timestamp: new Date(Date.now() - 24 * 60000) }
        ]
      },
      {
        complaintId: 'WW-10247',
        userId: citizen._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'Hazardous',
        confidence: 96,
        description: 'Chemical containers and medical packaging discarded next to the clinic gutter.',
        aiSummary: 'Hazardous medical waste near Clinic Lane',
        latitude: 31.2190,
        longitude: 75.7805,
        address: 'Civil Hospital Back Alley, Phagwara',
        priority: 'CRITICAL',
        priorityReason: 'Hazardous material or severe drainage obstruction detected near sensitive healthcare location.',
        status: 'Pending',
        statusHistory: [
          { status: 'Complaint Created', note: 'Urgent citizen alert.', updatedBy: citizen.name, timestamp: new Date(Date.now() - 15 * 60000) },
          { status: 'AI Analyzed', note: 'Classified: Hazardous (96%), Priority: CRITICAL', updatedBy: 'WasteWise AI', timestamp: new Date(Date.now() - 14 * 60000) }
        ]
      },
      {
        complaintId: 'WW-10248',
        userId: priya._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'Metal',
        confidence: 89,
        description: 'Sharp scrap metal sheets and discarded iron rods lying across walkway.',
        aiSummary: 'Sharp industrial metal scrap on pedestrian footpath',
        latitude: 31.2420,
        longitude: 75.7880,
        address: 'Industrial Focal Point, Plot 14, Phagwara',
        priority: 'MEDIUM',
        priorityReason: 'Sharp metal pieces creating transit hazard.',
        status: 'In Progress',
        assignedCollector: {
          collectorId: collectorAmit._id,
          name: collectorAmit.name,
          phone: collectorAmit.phone,
          vehicle: 'Van-04 (Quick Response)',
          assignedAt: new Date(Date.now() - 90 * 60000)
        },
        statusHistory: [
          { status: 'Complaint Created', note: 'Citizen report.', updatedBy: priya.name, timestamp: new Date(Date.now() - 120 * 60000) },
          { status: 'Assigned', note: 'Assigned to Amit Singh', updatedBy: admin.name, timestamp: new Date(Date.now() - 90 * 60000) },
          { status: 'In Progress', note: 'Collector en route to location.', updatedBy: collectorAmit.name, timestamp: new Date(Date.now() - 30 * 60000) }
        ]
      },
      {
        complaintId: 'WW-10249',
        userId: rahul._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'Plastic',
        confidence: 95,
        description: 'Overflowing commercial waste bin spilling onto the main street.',
        aiSummary: 'Overflowing commercial plastic bin near Clock Tower',
        latitude: 31.2150,
        longitude: 75.7690,
        address: 'Clock Tower Bazaar, Phagwara',
        priority: 'HIGH',
        priorityReason: 'Overflowing waste in commercial shopping district.',
        status: 'Pending',
        statusHistory: [
          { status: 'Complaint Created', note: 'Citizen alert with GPS photo.', updatedBy: rahul.name, timestamp: new Date(Date.now() - 50 * 60000) },
          { status: 'AI Analyzed', note: 'Classified: Plastic (95%), Priority: HIGH', updatedBy: 'WasteWise AI', timestamp: new Date(Date.now() - 49 * 60000) }
        ]
      },
      {
        complaintId: 'WW-10250',
        userId: citizen._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'Glass',
        confidence: 92,
        description: 'Crushed glass bottles scattered across the bus terminal pavement.',
        aiSummary: 'Broken glass bottles near Bus Terminal',
        latitude: 31.2260,
        longitude: 75.7760,
        address: 'Central Bus Stand Platform 2, Phagwara',
        priority: 'HIGH',
        priorityReason: 'High transit pedestrian zone with sharp glass hazard.',
        status: 'Resolved',
        assignedCollector: {
          collectorId: collectorRaj._id,
          name: collectorRaj.name,
          phone: collectorRaj.phone,
          vehicle: 'Truck-12 (Heavy Compactor)',
          assignedAt: new Date(Date.now() - 180 * 60000)
        },
        collectionProof: {
          imageUrl: '/uploads/sample-clean.jpg',
          notes: 'Bus stop pavement swept clean, all glass shards securely boxed and transported.',
          submittedAt: new Date(Date.now() - 35 * 60000)
        },
        statusHistory: [
          { status: 'Complaint Created', note: 'Reported by citizen.', updatedBy: citizen.name, timestamp: new Date(Date.now() - 200 * 60000) },
          { status: 'Assigned', note: 'Assigned to Raj Kumar.', updatedBy: admin.name, timestamp: new Date(Date.now() - 180 * 60000) },
          { status: 'In Progress', note: 'Collector reached site.', updatedBy: collectorRaj.name, timestamp: new Date(Date.now() - 100 * 60000) },
          { status: 'Waste Collected', note: 'Area swept and disinfected.', updatedBy: collectorRaj.name, timestamp: new Date(Date.now() - 40 * 60000) },
          { status: 'Resolved', note: 'Proof verified and archived.', updatedBy: 'System', timestamp: new Date(Date.now() - 35 * 60000) }
        ],
        resolvedAt: new Date(Date.now() - 35 * 60000)
      },
      {
        complaintId: 'WW-10251',
        userId: aman._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'Paper',
        confidence: 88,
        description: 'Stack of damp cardboard packaging boxes outside the university library.',
        aiSummary: 'Cardboard box stack outside Library gate',
        latitude: 31.2310,
        longitude: 75.7620,
        address: 'University Library Circle, Phagwara',
        priority: 'LOW',
        priorityReason: 'Dry non-hazardous recyclable paper.',
        status: 'Resolved',
        collectionProof: {
          imageUrl: '/uploads/sample-clean.jpg',
          notes: 'Diverted 24kg clean cardboard to paper recycling center.',
          submittedAt: new Date(Date.now() - 120 * 60000)
        },
        resolvedAt: new Date(Date.now() - 120 * 60000)
      },
      {
        complaintId: 'WW-10252',
        userId: priya._id,
        imageUrl: '/uploads/sample-garbage.jpg',
        wasteType: 'E-Waste',
        confidence: 94,
        description: 'Old CRT monitor and wiring dumped behind the electronics market.',
        aiSummary: 'Discarded electronics & cable wiring',
        latitude: 31.2230,
        longitude: 75.7790,
        address: 'Tech Market Lane 4, Phagwara',
        priority: 'MEDIUM',
        priorityReason: 'Electronic waste containing heavy metals.',
        status: 'Pending'
      }
    ];

    await Complaint.insertMany(complaintsData);
    console.log('✅ Seeded 8 realistic complaints with statuses, coordinates & proof images.');

    // 4. Create Notifications
    await Notification.create([
      {
        userId: citizen._id,
        title: 'Task Assigned',
        message: 'Your complaint WW-10245 has been assigned to collector Raj Kumar (Truck-12).',
        type: 'task_assigned',
        relatedComplaintId: 'WW-10245',
        read: false
      },
      {
        userId: citizen._id,
        title: 'Complaint Resolved! +50 Eco Points 🌱',
        message: 'Your complaint WW-10250 (Central Bus Stand) was verified clean! +50 Eco Points awarded.',
        type: 'reward',
        relatedComplaintId: 'WW-10250',
        read: false
      },
      {
        userId: collectorRaj._id,
        title: 'New Waste Collection Task Assigned',
        message: 'Task WW-10245 assigned at College Road, Phagwara. Priority: HIGH.',
        type: 'task_assigned',
        relatedComplaintId: 'WW-10245',
        read: false
      }
    ]);

    console.log('=============================================');
    console.log('🎉 WasteWise Database Seeded Successfully!');
    console.log('=============================================');
    console.log('Demo Credentials:');
    console.log('👤 Citizen:   citizen@wastewise.org  / citizen123');
    console.log('🚛 Collector: raj@wastewise.org      / collector123');
    console.log('👨💼 Admin:     admin@wastewise.org    / admin123');
    console.log('=============================================');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
