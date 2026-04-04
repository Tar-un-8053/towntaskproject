import { useState, useEffect } from 'react';
import { volunteerApi } from '../services/api';
import { buildFullVerificationRoute } from '../router/routes';
import { toast } from 'react-toastify';
import {
  Shield, CheckCircle, FileText, Camera, Phone, Mail, Loader2,
  AlertTriangle, Award, Star, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Lock,
} from 'lucide-react';

type Step = 'status' | 'intro' | 'terms' | 'documents' | 'complete';

const BADGE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  none: { label: 'No Badge', color: 'text-gray-400', icon: '—' },
  bronze: { label: 'Bronze Helper', color: 'text-amber-600', icon: '🥉' },
  silver: { label: 'Silver Helper', color: 'text-gray-500', icon: '🥈' },
  gold: { label: 'Gold Community Protector', color: 'text-yellow-500', icon: '🥇' },
};

export default function VolunteerPage() {
  const [step, setStep] = useState<Step>('status');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [codeOfConductAccepted, setCodeOfConductAccepted] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  // Documents
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [nameOnAadhaar, setNameOnAadhaar] = useState('');
  const [nameOnPan, setNameOnPan] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState<string>('');
  const [aadhaarBack, setAadhaarBack] = useState<string>('');
  const [panImage, setPanImage] = useState<string>('');
  const [selfie, setSelfie] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [docResult, setDocResult] = useState<any>(null);

  // Expandable sections
  const [showResponsibilities, setShowResponsibilities] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await volunteerApi.getStatus();
      setStatus(res);
      if (res.isVerified && res.isVolunteer) {
        setStep('status');
      }
    } catch (err) {
      // Not registered yet, that's fine
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!termsAccepted || !codeOfConductAccepted || !riskAcknowledged) {
      setError('Please accept all terms and conditions.');
      return;
    }
    setError('');
    try {
      await volunteerApi.register({ termsAccepted, codeOfConductAccepted, riskAcknowledged });
      setStep('documents');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFileSelect = (setter: (val: string) => void) => {
    // In production, use file upload to S3/CloudStorage
    // For now, simulate with a placeholder URL
    setter(`https://secure-storage.towntask.app/docs/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
  };

  const handleSubmitDocuments = async () => {
    // Validate
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setError('Enter valid 12-digit Aadhaar number'); return;
    }
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      setError('Enter valid PAN number (format: ABCDE1234F)'); return;
    }
    if (!nameOnAadhaar || !nameOnPan) {
      setError('Enter name as on documents'); return;
    }
    if (!aadhaarFront || !aadhaarBack || !panImage || !selfie) {
      setError('All documents and selfie are required'); return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await volunteerApi.submitDocuments({
        aadhaarNumber,
        aadhaarFrontUrl: aadhaarFront,
        aadhaarBackUrl: aadhaarBack,
        panNumber: panNumber.toUpperCase(),
        panUrl: panImage,
        selfieUrl: selfie,
        nameOnAadhaar,
        nameOnPan,
        declarationAccepted: true,
      });
      setDocResult(res);
      setStep('complete');
      await loadStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await volunteerApi.toggleAvailability();
      setStatus({ ...status, volunteerAvailable: res.volunteerAvailable });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Temp verified volunteer
  if (status?.volunteerStatus === 'TEMP_VERIFIED' && step === 'status') {
    const daysLeft = status.tempVerifiedAt
      ? Math.max(0, 7 - Math.floor((Date.now() - new Date(status.tempVerifiedAt).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Temp Verified Volunteer</h1>
            </div>
            <p className="text-yellow-100">Limited access — {daysLeft} days remaining</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="font-medium text-yellow-800 mb-1">Temporary Verification</p>
            <p className="text-sm text-yellow-700">
              You can accept up to <strong>2 emergencies</strong> within <strong>{daysLeft} days</strong>.
              Used: {status.tempEmergencyCount || 0}/2.
            </p>
          </div>
          <button
            onClick={() => { window.location.hash = buildFullVerificationRoute(); }}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Complete Full Verification →
          </button>
        </div>
      </div>
    );
  }

  // Pending / Under review
  if ((status?.volunteerStatus === 'PENDING_VERIFICATION' || status?.volunteerStatus === 'UNDER_REVIEW') && step === 'status') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <h1 className="text-2xl font-bold">Verification In Progress</h1>
            </div>
            <p className="text-purple-100">
              {status.volunteerStatus === 'PENDING_VERIFICATION' ? 'Submit your documents to continue' : 'Your documents are being reviewed'}
            </p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {status.volunteerStatus === 'PENDING_VERIFICATION' ? (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Documents Required</h3>
              <p className="text-gray-500 mb-4">You've registered as a volunteer. Submit your documents to complete verification.</p>
              <button
                onClick={() => setStep('documents')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Upload Documents
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Under Review</h3>
              <p className="text-gray-500">Your documents are being manually reviewed. This usually takes 24-48 hours.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rejected
  if (status?.volunteerStatus === 'REJECTED' && step === 'status') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Verification Rejected</h1>
            </div>
            <p className="text-red-100">Your volunteer application was not approved</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-gray-600 mb-4">Your documents didn't pass verification. You may re-apply with correct documents.</p>
            <button
              onClick={() => setStep('intro')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Re-Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Already verified volunteer - show dashboard
  if (status?.isVerified && status?.isVolunteer && step === 'status') {
    const badge = BADGE_CONFIG[status.badgeLevel || 'none'];
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Verified Volunteer</h1>
            </div>
            <p className="text-green-100">You're making a difference in your community</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <span className="text-2xl">{badge.icon}</span>
              <p className={`text-sm font-medium mt-1 ${badge.color}`}>{badge.label}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{status.trustScore}</p>
              <p className="text-sm text-gray-500">Trust Score</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-orange-600">{status.emergencyUsageCount}</p>
              <p className="text-sm text-gray-500">Emergencies Used</p>
            </div>
          </div>

          {/* Availability toggle */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Emergency Alerts</p>
              <p className="text-sm text-gray-500">
                {status.volunteerAvailable
                  ? 'You will receive emergency alerts nearby'
                  : 'Emergency alerts are paused'}
              </p>
            </div>
            <button onClick={handleToggleAvailability} className="focus:outline-none">
              {status.volunteerAvailable ? (
                <ToggleRight className="w-12 h-12 text-green-500" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-gray-400" />
              )}
            </button>
          </div>

          {/* Verification status */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-900">Verification Complete</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <Phone className="w-4 h-4" /> Mobile Verified
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Mail className="w-4 h-4" /> Email Verified
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <FileText className="w-4 h-4" /> Aadhaar Verified
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <FileText className="w-4 h-4" /> PAN Verified
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Camera className="w-4 h-4" /> Face Verified
              </div>
            </div>
          </div>

          {/* Emergency Limits */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="font-medium text-blue-800 mb-1">Your Emergency Limits</p>
            <p className="text-sm text-blue-700">
              As a verified volunteer, you can post up to <strong>10 high emergencies</strong> per month.
              You've used {status.emergencyUsageCount} this month.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Become a Volunteer</h1>
          </div>
          <p className="text-blue-100">Help your community in times of need</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['intro', 'terms', 'documents', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-blue-600 text-white' :
                ['intro', 'terms', 'documents', 'complete'].indexOf(step) > i
                  ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {['intro', 'terms', 'documents', 'complete'].indexOf(step) > i ? '✓' : i + 1}
              </div>
              {i < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* STEP: Intro */}
        {(step === 'status' || step === 'intro') && (
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Volunteer Program</h2>
              <p className="text-gray-600 mb-4">
                Join our verified volunteer network to help community members in emergencies.
                Only verified volunteers receive High Emergency (SOS) alerts.
              </p>

              <button
                onClick={() => setShowResponsibilities(!showResponsibilities)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4"
              >
                <span className="font-medium text-gray-700">Responsibilities & Requirements</span>
                {showResponsibilities ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showResponsibilities && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-600 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">Responsibilities:</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Respond to emergency alerts in your area when available</li>
                      <li>Provide genuine help to those in need</li>
                      <li>Maintain professional and respectful behavior</li>
                      <li>Report fake or abusive emergencies</li>
                      <li>Keep your availability status updated</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Risks:</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>You may encounter dangerous situations</li>
                      <li>The platform does not provide insurance or liability coverage</li>
                      <li>Personal safety should always be your priority</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Verification Required:</h4>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Aadhaar Card (Front & Back)</li>
                      <li>PAN Card</li>
                      <li>Live Selfie (Face match)</li>
                      <li>Mobile OTP (already done)</li>
                      <li>Email verification</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg mb-4 text-sm text-yellow-800">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>Your documents are encrypted and stored securely. They are never shared publicly.</span>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3 p-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-700">Earn badges: Bronze → Silver → Gold</span>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-700">Higher visibility in skill marketplace</span>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-700">Up to 10 high emergencies per month (vs 1 for normal users)</span>
                </div>
              </div>

              <button
                onClick={() => setStep('terms')}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Start Verification
              </button>
            </div>
          </div>
        )}

        {/* STEP: Terms */}
        {step === 'terms' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Agreements</h2>

            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <span className="font-medium text-gray-900">Terms of Service</span>
                  <p className="text-sm text-gray-500 mt-1">
                    I agree to the volunteer terms of service, including responsibilities,
                    code of conduct, and emergency response guidelines.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={codeOfConductAccepted}
                  onChange={(e) => setCodeOfConductAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <span className="font-medium text-gray-900">Code of Conduct</span>
                  <p className="text-sm text-gray-500 mt-1">
                    I will maintain professional behavior, respect privacy,
                    and never misuse emergency information.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={riskAcknowledged}
                  onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <span className="font-medium text-gray-900">Risk Acknowledgment</span>
                  <p className="text-sm text-gray-500 mt-1">
                    I understand that responding to emergencies involves risks. The platform
                    does not provide insurance. My personal safety is my responsibility.
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('intro'); setError(''); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={!termsAccepted || !codeOfConductAccepted || !riskAcknowledged}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP: Documents */}
        {step === 'documents' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Document Verification</h2>
            <p className="text-sm text-gray-500 mb-6">Upload your identity documents for verification</p>

            <div className="space-y-5">
              {/* Aadhaar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="Enter 12-digit Aadhaar number"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                  maxLength={12}
                />
                <p className="text-xs text-gray-400 mt-1">{aadhaarNumber.length}/12 digits</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name on Aadhaar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameOnAadhaar}
                  onChange={(e) => setNameOnAadhaar(e.target.value)}
                  placeholder="Full name as on Aadhaar card"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Front</label>
                  <button
                    onClick={() => handleFileSelect(setAadhaarFront)}
                    className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 text-sm ${
                      aadhaarFront ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-300 text-gray-500 hover:border-blue-400'
                    }`}
                  >
                    {aadhaarFront ? <><CheckCircle className="w-6 h-6" /> Uploaded</> : <><Camera className="w-6 h-6" /> Upload Front</>}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Back</label>
                  <button
                    onClick={() => handleFileSelect(setAadhaarBack)}
                    className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 text-sm ${
                      aadhaarBack ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-300 text-gray-500 hover:border-blue-400'
                    }`}
                  >
                    {aadhaarBack ? <><CheckCircle className="w-6 h-6" /> Uploaded</> : <><Camera className="w-6 h-6" /> Upload Back</>}
                  </button>
                </div>
              </div>

              {/* PAN */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="ABCDE1234F"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 uppercase"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name on PAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameOnPan}
                  onChange={(e) => setNameOnPan(e.target.value)}
                  placeholder="Full name as on PAN card"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Image</label>
                <button
                  onClick={() => handleFileSelect(setPanImage)}
                  className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 text-sm ${
                    panImage ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-300 text-gray-500 hover:border-blue-400'
                  }`}
                >
                  {panImage ? <><CheckCircle className="w-6 h-6" /> Uploaded</> : <><Camera className="w-6 h-6" /> Upload PAN</>}
                </button>
              </div>

              {/* Selfie */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Live Selfie <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Take a clear selfie for face verification against your ID</p>
                <button
                  onClick={() => handleFileSelect(setSelfie)}
                  className={`w-full h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 ${
                    selfie ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-300 text-gray-500 hover:border-blue-400'
                  }`}
                >
                  {selfie ? (
                    <><CheckCircle className="w-8 h-8" /> Selfie Captured</>
                  ) : (
                    <><Camera className="w-8 h-8" /> <span className="text-sm">Take Selfie</span></>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setStep('terms'); setError(''); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmitDocuments}
                disabled={submitting}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: Complete */}
        {step === 'complete' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            {docResult?.autoVerified ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
                <p className="text-gray-600 mb-4">
                  You are now a verified volunteer. You will receive emergency alerts
                  from people in need near your location.
                </p>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm">
                    <strong>Face Match Score:</strong> {docResult.verification?.faceMatchScore}%<br/>
                    <strong>Name Match Score:</strong> {docResult.verification?.nameMatchScore}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Under Review</h2>
                <p className="text-gray-600 mb-4">
                  Your documents have been submitted for manual review. You'll be notified
                  within 24-48 hours.
                </p>
                {docResult?.fraudFlags?.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm font-medium">Flags detected:</p>
                    <ul className="text-yellow-700 text-sm mt-1">
                      {docResult.fraudFlags.map((f: string) => (
                        <li key={f}>• {f.replace('_', ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => { setStep('status'); loadStatus(); }}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
