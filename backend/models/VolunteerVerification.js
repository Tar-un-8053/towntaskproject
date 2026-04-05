const mongoose = require('mongoose');

const volunteerVerificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  // Document details (encrypted/hashed in production)
  aadhaarNumber: { type: String, default: '' }, // Last 4 digits stored, full hash stored
  aadhaarFrontUrl: { type: String, default: '' }, // Secure file path
  aadhaarBackUrl: { type: String, default: '' },
  panNumber: { type: String, default: '' }, // Masked PAN
  panUrl: { type: String, default: '' },
  // Selfie verification
  selfieUrl: { type: String, default: '' },
  faceVerified: { type: Boolean, default: false },
  faceMatchScore: { type: Number, default: 0 }, // 0-100
  // Verification steps
  mobileVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  aadhaarVerified: { type: Boolean, default: false },
  panVerified: { type: Boolean, default: false },
  // Document validation
  documentStatus: {
    type: String,
    enum: ['not_submitted', 'pending_review', 'verified', 'rejected'],
    default: 'not_submitted',
  },
  // Overall status
  verificationStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'temp_verified', 'verified', 'rejected', 'suspended'],
    default: 'not_started',
  },
  verificationType: { type: String, enum: ['FULL', 'TEMP', 'NONE'], default: 'NONE' },
  rejectionReason: { type: String, default: '' },
  // Name matching
  nameOnAadhaar: { type: String, default: '' },
  nameOnPan: { type: String, default: '' },
  nameMatchScore: { type: Number, default: 0 },
  // Address fields
  address: { type: String, default: '' },
  addressLat: { type: Number, default: 0 },
  addressLng: { type: Number, default: 0 },
  addressSource: { type: String, enum: ['aadhaar', 'manual', 'none'], default: 'none' },
  // DigiLocker
  digilockerVerified: { type: Boolean, default: false },
  digilockerData: { type: mongoose.Schema.Types.Mixed, default: null },
  // Fraud detection flags
  fraudFlags: [{ type: String }],
  // Terms & conditions
  termsAccepted: { type: Boolean, default: false },
  codeOfConductAccepted: { type: Boolean, default: false },
  riskAcknowledged: { type: Boolean, default: false },
  declarationAccepted: { type: Boolean, default: false }, // Final declaration for full verification
  // Temp verification fields
  tempVerifiedAt: { type: Date, default: null },
  tempExpiresAt: { type: Date, default: null }, // 7 days from temp verification
  // Dates
  submittedAt: { type: Date },
  verifiedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('VolunteerVerification', volunteerVerificationSchema);
