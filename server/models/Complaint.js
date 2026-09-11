const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imageUrl: {
      type: String,
      required: [true, 'Garbage photo is required']
    },
    wasteType: {
      type: String,
      enum: ['Plastic', 'Organic', 'Metal', 'Glass', 'Paper', 'E-Waste', 'Hazardous', 'General'],
      default: 'General'
    },
    confidence: {
      type: Number,
      default: 85
    },
    description: {
      type: String,
      default: ''
    },
    aiSummary: {
      type: String,
      default: ''
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      default: 'Location detected via GPS'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    priorityReason: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Collected', 'Resolved', 'Rejected'],
      default: 'Pending'
    },
    assignedCollector: {
      collectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      phone: String,
      vehicle: String,
      assignedAt: Date
    },
    collectionProof: {
      imageUrl: String,
      notes: String,
      submittedAt: Date
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        note: String,
        updatedBy: String
      }
    ],
    resolvedAt: Date
  },
  {
    timestamps: true
  }
);

// Helpful indexes for geospatial and status queries
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
