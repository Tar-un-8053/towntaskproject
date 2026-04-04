const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, index: true },
  area: { type: String },
  city: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePhoto: { type: String, default: '' }, // URL to profile image
  profileType: { type: String, enum: ['provider', 'worker'], default: 'worker' },
  // Geo location
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  skills: [{ type: String }],
  // Volunteer fields
  isVerified: { type: Boolean, default: false },
  isVolunteer: { type: Boolean, default: false },
  volunteerStatus: {
    type: String,
    enum: ['NOT_APPLIED', 'PENDING_VERIFICATION', 'UNDER_REVIEW', 'TEMP_VERIFIED', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
    default: 'NOT_APPLIED',
  },
  verificationLevel: { type: String, enum: ['NONE', 'TEMP', 'FULL'], default: 'NONE' },
  volunteerAvailable: { type: Boolean, default: false }, // ON/OFF toggle for emergency alerts
  volunteerAppliedAt: { type: Date, default: null },
  volunteerSkippedAt: { type: Date, default: null }, // When user skipped volunteer choice
  reminderCount: { type: Number, default: 0 }, // Max 3 reminders
  lastReminderAt: { type: Date, default: null },
  reminderDismissedAt: { type: Date, default: null },
  tempEmergencyCount: { type: Number, default: 0 }, // Max 2 for TEMP_VERIFIED
  tempVerifiedAt: { type: Date, default: null }, // Auto-expire after 7 days
  fullVerifiedAt: { type: Date, default: null },
  emergencyUsageCount: { type: Number, default: 0 },
  emergencyUsageResetDate: { type: Date, default: Date.now },
  trustScore: { type: Number, default: 0 },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  badgeLevel: { type: String, enum: ['none', 'bronze', 'silver', 'gold'], default: 'none' },
  // Misuse tracking
  suspendedUntil: { type: Date, default: null },
  fakeReportCount: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  password: { type: String, default: '' }, // hashed password for password-based login
}, { timestamps: true });

// Geo index for location-based queries
profileSchema.index({ location: '2dsphere' });
profileSchema.index({ skills: 1 });
profileSchema.index({ city: 1 });
profileSchema.index({ city: 1, skills: 1 });

module.exports = mongoose.model('Profile', profileSchema);
