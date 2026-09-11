const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    vehicle: {
      type: String,
      required: true,
      default: 'Truck-01 (Compactor)'
    },
    vehicleType: {
      type: String,
      enum: ['Truck', 'Van', 'Compactor', 'Electric Cart'],
      default: 'Truck'
    },
    availability: {
      type: String,
      enum: ['Available', 'On Task', 'Offline'],
      default: 'Available'
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    currentAddress: {
      type: String,
      default: ''
    },
    assignedTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.8
    },
    speed: {
      type: Number,
      default: 0
    },
    batteryLevel: {
      type: Number,
      default: 85
    },
    plateNumber: {
      type: String,
      default: 'DL-01-WW-4021'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Collector', collectorSchema);
