const Collector = require('../models/Collector');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { calculateDistance } = require('../utils/haversine');

// @desc Get assigned tasks for current collector
// @route GET /api/collectors/tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Complaint.find({
      'assignedCollector.collectorId': req.user._id
    }).sort({ updatedAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update task status (e.g., 'In Progress')
// @route PUT /api/collectors/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    complaint.status = status || 'In Progress';
    complaint.statusHistory.push({
      status: complaint.status,
      note: note || (complaint.status === 'In Progress' ? 'Collector is en route to location.' : `Task status updated to ${status}`),
      updatedBy: req.user.name
    });

    await complaint.save();

    // Notify Citizen
    await Notification.create({
      userId: complaint.userId,
      title: 'Collector En Route',
      message: `Collector ${req.user.name} is on the way to collect waste for ${complaint.complaintId}.`,
      type: 'status_update',
      relatedComplaintId: complaint.complaintId
    });

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Upload collection proof & resolve complaint
// @route POST /api/collectors/tasks/:id/proof
const uploadCollectionProof = async (req, res) => {
  try {
    const { notes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint task not found.' });
    }

    let proofImageUrl = '/uploads/sample-clean.jpg';
    if (req.file) {
      proofImageUrl = `/uploads/${req.file.filename}`;
    }

    complaint.collectionProof = {
      imageUrl: proofImageUrl,
      notes: notes || 'Area completely cleared, sanitized and waste segregated.',
      submittedAt: new Date()
    };
    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();

    complaint.statusHistory.push({
      status: 'Waste Collected',
      note: 'Collector gathered waste and took verification photograph.',
      updatedBy: req.user.name
    });
    complaint.statusHistory.push({
      status: 'Resolved',
      note: 'Collection verified. Area restored.',
      updatedBy: 'System Verification'
    });

    await complaint.save();

    // Update collector counters & reset to Available
    await Collector.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: { completedTasks: 1, assignedTasks: -1 },
        availability: 'Available'
      }
    );

    // Award +50 Eco Points to the citizen who reported it!
    await User.findByIdAndUpdate(complaint.userId, {
      $inc: { ecoPoints: 50 }
    });

    // Notify Citizen
    await Notification.create({
      userId: complaint.userId,
      title: 'Complaint Resolved! +50 Eco Points 🌱',
      message: `Your waste complaint ${complaint.complaintId} has been successfully collected and resolved. Clean area photo uploaded.`,
      type: 'reward',
      relatedComplaintId: complaint.complaintId
    });

    res.json({
      success: true,
      message: 'Collection proof verified and task marked as Resolved!',
      complaint
    });
  } catch (error) {
    console.error('Error uploading proof:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all collectors
// @route GET /api/collectors
const getAllCollectors = async (req, res) => {
  try {
    const collectors = await Collector.find().populate('userId', 'name email phone role');
    res.json({ success: true, count: collectors.length, collectors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get live tracking telemetry for all drivers/collectors
// @route GET /api/collectors/tracking
const getDriverTracking = async (req, res) => {
  try {
    const collectors = await Collector.find().populate('userId', 'name email phone avatar');

    const telemetry = await Promise.all(
      collectors.map(async (col) => {
        // Find active task assigned to this collector
        const activeTask = await Complaint.findOne({
          'assignedCollector.collectorId': col.userId?._id,
          status: { $in: ['Assigned', 'In Progress'] }
        }).select('complaintId wasteType priority status address latitude longitude imageUrl createdAt');

        let distanceToTask = null;
        let etaMinutes = null;
        if (activeTask && activeTask.latitude && activeTask.longitude) {
          distanceToTask = calculateDistance(col.latitude, col.longitude, activeTask.latitude, activeTask.longitude);
          etaMinutes = Math.max(2, Math.round((distanceToTask / 25) * 60));
        }

        return {
          _id: col._id,
          userId: col.userId?._id,
          name: col.userId?.name || 'Collector Driver',
          email: col.userId?.email || '',
          phone: col.userId?.phone || '+91 98765 00000',
          avatar: col.userId?.avatar || '',
          vehicle: col.vehicle,
          vehicleType: col.vehicleType,
          plateNumber: col.plateNumber || 'DL-01-WW-4021',
          availability: col.availability,
          speed: col.speed || (col.availability === 'On Task' ? 28 : 0),
          batteryLevel: col.batteryLevel || 84,
          latitude: col.latitude,
          longitude: col.longitude,
          currentAddress: col.currentAddress || 'City Service Zone',
          assignedTasks: col.assignedTasks,
          completedTasks: col.completedTasks,
          rating: col.rating,
          activeTask: activeTask
            ? {
                _id: activeTask._id,
                complaintId: activeTask.complaintId,
                wasteType: activeTask.wasteType,
                priority: activeTask.priority,
                status: activeTask.status,
                address: activeTask.address,
                latitude: activeTask.latitude,
                longitude: activeTask.longitude,
                distanceKm: distanceToTask,
                etaMinutes
              }
            : null
        };
      })
    );

    res.json({ success: true, count: telemetry.length, drivers: telemetry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update collector live GPS location
// @route PUT /api/collectors/:id/location
const updateCollectorLocation = async (req, res) => {
  try {
    const { latitude, longitude, speed, currentAddress, batteryLevel, availability } = req.body;

    const collector = await Collector.findById(req.params.id);
    if (!collector) {
      return res.status(404).json({ success: false, message: 'Collector not found.' });
    }

    if (latitude !== undefined) collector.latitude = latitude;
    if (longitude !== undefined) collector.longitude = longitude;
    if (speed !== undefined) collector.speed = speed;
    if (currentAddress !== undefined) collector.currentAddress = currentAddress;
    if (batteryLevel !== undefined) collector.batteryLevel = batteryLevel;
    if (availability !== undefined) collector.availability = availability;

    await collector.save();

    res.json({ success: true, collector });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyTasks,
  updateTaskStatus,
  uploadCollectionProof,
  getAllCollectors,
  getDriverTracking,
  updateCollectorLocation
};
