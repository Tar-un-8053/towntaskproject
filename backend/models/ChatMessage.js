const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    senderId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    readBy: [{ type: String }],
  },
  { timestamps: true }
);

chatMessageSchema.index({ applicationId: 1, createdAt: 1 });
chatMessageSchema.index({ receiverId: 1, createdAt: -1 });
chatMessageSchema.index({ receiverId: 1, readBy: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
