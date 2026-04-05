const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  fromUser: { type: String, required: true, index: true },
  toUser: { type: String, required: true, index: true },
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyPost' },
  type: { type: String, enum: ['emergency', 'service'], required: true },
  // Rating scores (1-5)
  helpfulness: { type: Number, min: 1, max: 5, required: true },
  behavior: { type: Number, min: 1, max: 5, required: true },
  safety: { type: Number, min: 1, max: 5, required: true },
  responseTime: { type: Number, min: 1, max: 5, required: true },
  // Overall
  overallScore: { type: Number, min: 1, max: 5 },
  reviewText: { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate ratings for same emergency
ratingSchema.index({ fromUser: 1, toUser: 1, emergencyId: 1 }, { unique: true });

// Pre-save: compute overall score
ratingSchema.pre('save', function(next) {
  this.overallScore = (this.helpfulness + this.behavior + this.safety + this.responseTime) / 4;
  next();
});

module.exports = mongoose.model('Rating', ratingSchema);
