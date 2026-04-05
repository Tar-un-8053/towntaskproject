const mongoose = require('mongoose');

const emergencyPostSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  // Type: 'high' = life-threatening SOS, 'light' = urgent service need
  type: { type: String, enum: ['high', 'light'], required: true },
  // High emergency categories
  category: {
    type: String,
    enum: ['crime', 'medical', 'women_safety', 'personal_safety', 'vehicle_breakdown', 'civil_help', 'other',
           // Light emergency categories
           'tutor', 'plumber', 'electrician', 'mechanic', 'doctor', 'general_service'],
    required: true,
  },
  description: { type: String, required: true },
  // Location
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  // Status tracking
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'EXPIRED'],
    default: 'OPEN',
  },
  // Volunteer assignment
  acceptedBy: { type: String, default: null },
  acceptedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },
  // Broadcast tracking
  currentRadius: { type: Number, default: 20 }, // km - current broadcast radius
  broadcastHistory: [{
    radius: Number,
    sentAt: Date,
    notifiedCount: Number,
  }],
  remindersSent: { type: Number, default: 0 },
  lastReminderAt: { type: Date, default: null },
  // Light emergency specific
  urgencyLevel: {
    type: String,
    enum: ['normal', 'urgent', 'immediate'],
    default: 'normal',
  },
  isPaidBoost: { type: Boolean, default: false },
  // Misuse prevention
  fakeReportCount: { type: Number, default: 0 },
  reportedBy: [{ type: String }], // userIds who reported as fake
  // Disclaimer accepted
  disclaimerAccepted: { type: Boolean, default: false },
}, { timestamps: true });

emergencyPostSchema.index({ location: '2dsphere' });
emergencyPostSchema.index({ status: 1, type: 1 });
emergencyPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmergencyPost', emergencyPostSchema);
