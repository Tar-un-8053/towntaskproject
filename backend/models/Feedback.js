const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  fromUser: { type: String, required: true },
  toUser: { type: String }, // optional - for user-to-user feedback
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  type: { type: String, enum: ['app', 'job', 'provider', 'worker', 'suggestion'], default: 'app' },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String },
  message: { type: String, required: true },
  category: { type: String, enum: ['general', 'bug', 'feature', 'complaint', 'appreciation'], default: 'general' },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  adminReply: { type: String },
}, { timestamps: true });

feedbackSchema.index({ fromUser: 1 });
feedbackSchema.index({ toUser: 1 });
feedbackSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
