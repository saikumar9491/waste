const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Collector = require('../models/Collector');
const aiService = require('../services/aiService');
const { rankCollectors } = require('../utils/haversine');
const path = require('path');

// @desc Create new waste complaint
// @route POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { latitude, longitude, address, description, wasteTypeManual, priorityManual } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'GPS coordinates (latitude and longitude) are required.' });
    }

    // Determine image URL
    let imageUrl = '/uploads/sample-garbage.jpg';
    let imageLocalPath = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      imageLocalPath = req.file.path;
    }

    // Run AI Validation & Classification
    const originalFilename = req.file ? req.file.originalname : '';
    const aiResult = await aiService.analyzeImage(imageLocalPath, originalFilename, description);

    // Reject submission if no waste detected and no manual override
    if (!aiResult.wasteDetected && !wasteTypeManual) {
      return res.status(400).json({
        success: false,
        wasteDetected: false,
        message: 'No recognizable waste detected in the image. Please upload a valid waste photo.'
      });
    }

    const wasteType = wasteTypeManual || aiResult.wasteType || 'General';
    const confidence = Math.round((aiResult.confidence || 0.94) * 100);
    const priority = priorityManual || aiResult.priority || 'MEDIUM';
    const priorityReason = aiResult.priorityReason || 'Assessed by WasteWise AI Engine';

    // Run AI Summary
    const aiSummary = aiService.generateSummary(description, address);

    // Generate unique Complaint ID (e.g., WW-10245)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const complaintId = `WW-${randomSuffix}`;

    const complaint = await Complaint.create({
      complaintId,
      userId: req.user._id,
      imageUrl,
      wasteType,
      confidence,
      description: description || '',
      aiSummary,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || 'College Road, Phagwara',
      priority,
      priorityReason,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Complaint Created',
          note: 'Citizen submitted waste complaint with photo & GPS location.',
          updatedBy: req.user.name
        },
        {
          status: 'AI Analyzed',
          note: `AI classified as ${wasteType} (${confidence}% confidence). Priority set to ${priority}.`,
          updatedBy: 'WasteWise AI Engine'
        }
      ]
    });

    // Create confirmation notification for citizen
    await Notification.create({
      userId: req.user._id,
      title: 'Waste Report Submitted',
      message: `Your complaint ${complaintId} has been successfully registered and analyzed by AI (${priority} Priority).`,
      type: 'status_update',
      relatedComplaintId: complaintId
    });

    res.status(201).json({
      success: true,
      message: 'Waste report submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all complaints with filters
// @route GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const { status, priority, wasteType, myComplaints, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (wasteType && wasteType !== 'all') filter.wasteType = wasteType;
    if (myComplaints === 'true' || req.user.role === 'citizen') {
      filter.userId = req.user._id;
    }

    if (search) {
      filter.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { aiSummary: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email phone')
      .populate('assignedCollector.collectorId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single complaint
// @route GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { complaintId: req.params.id }]
    })
      .populate('userId', 'name email phone')
      .populate('assignedCollector.collectorId', 'name email phone');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Find nearest recommended collectors for this complaint's location
    const allCollectors = await Collector.find().populate('userId', 'name email phone');
    const collectorsWithUserData = allCollectors.map((c) => ({
      _id: c._id,
      userId: c.userId?._id,
      name: c.userId?.name || 'Collector',
      phone: c.userId?.phone || '+91 98765 00000',
      vehicle: c.vehicle,
      vehicleType: c.vehicleType,
      availability: c.availability,
      latitude: c.latitude,
      longitude: c.longitude,
      currentAddress: c.currentAddress,
      assignedTasks: c.assignedTasks,
      completedTasks: c.completedTasks,
      rating: c.rating
    }));

    const rankedCollectors = rankCollectors(complaint.latitude, complaint.longitude, collectorsWithUserData);

    res.json({
      success: true,
      complaint,
      recommendedCollectors: rankedCollectors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update complaint status
// @route PUT /api/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (status) complaint.status = status;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    complaint.statusHistory.push({
      status: status || complaint.status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user.name
    });

    await complaint.save();

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Assign collector to complaint
// @route PUT /api/complaints/:id/assign
const assignCollector = async (req, res) => {
  try {
    const { collectorId, name, phone, vehicle } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.assignedCollector = {
      collectorId,
      name,
      phone: phone || '+91 98765 43210',
      vehicle: vehicle || 'Truck-12 (Heavy Compactor)',
      assignedAt: new Date()
    };
    complaint.status = 'Assigned';

    complaint.statusHistory.push({
      status: 'Assigned',
      note: `Assigned to ${name} (${vehicle || 'Truck'}).`,
      updatedBy: req.user.name
    });

    await complaint.save();

    // Increment assignedTasks on collector record
    await Collector.findOneAndUpdate({ userId: collectorId }, { $inc: { assignedTasks: 1 }, availability: 'On Task' });

    // Notify Collector
    await Notification.create({
      userId: collectorId,
      title: 'New Waste Collection Task Assigned',
      message: `Task ${complaint.complaintId} assigned at ${complaint.address}. Priority: ${complaint.priority}.`,
      type: 'task_assigned',
      relatedComplaintId: complaint.complaintId
    });

    // Notify Citizen
    await Notification.create({
      userId: complaint.userId,
      title: 'Collector Assigned',
      message: `Your complaint ${complaint.complaintId} has been assigned to collector ${name} (${vehicle}).`,
      type: 'status_update',
      relatedComplaintId: complaint.complaintId
    });

    res.json({
      success: true,
      message: `Collector ${name} assigned successfully.`,
      complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete complaint
// @route DELETE /api/complaints/:id
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    await complaint.deleteOne();
    res.json({ success: true, message: 'Complaint deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  assignCollector,
  deleteComplaint
};
