import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import OtpInput from '../auth/OtpInput';
import {
  Loader2, Camera, Phone, Mail, Shield, CheckCircle2,
  AlertTriangle, ArrowRight, X, Zap
} from 'lucide-react';
import { volunteerApi } from '../../services/api';

interface InstantVerificationDialogProps {
  userPhone: string;
  userEmail?: string;
  onComplete: () => void;
  onClose: () => void;
}

type Step = 'intro' | 'selfie' | 'mobile_otp' | 'email_otp' | 'aadhaar' | 'submitting' | 'done';

export default function InstantVerificationDialog({
  userPhone,
  userEmail,
  onComplete,
  onClose,
}: InstantVerificationDialogProps) {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data
  const [selfieUrl, setSelfieUrl] = useState('');
  const [selfieCapturing, setSelfieCapturing] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileDevOtp, setMobileDevOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailDevOtp, setEmailDevOtp] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera
  const startCamera = async () => {
    setSelfieCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('Camera access denied');
      setSelfieCapturing(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setSelfieUrl(canvas.toDataURL('image/jpeg', 0.8));
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setSelfieCapturing(false);
    }
  };

  const handleSelfieNext = () => {
    if (!selfieUrl) return setError('Please capture a selfie');
    setError('');
    sendMobileOtp();
  };

  // Send mobile OTP
  const sendMobileOtp = async () => {
    setLoading(true);
    try {
      const res = await volunteerApi.sendVerificationOtp({ target: userPhone, type: 'phone' });
      setMobileDevOtp(res.otp || '');
      setStep('mobile_otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileOtpComplete = (otp: string) => {
    setMobileOtp(otp);
    if (userEmail) {
      sendEmailOtp();
    } else {
      setStep('aadhaar');
    }
  };

  // Send email OTP
  const sendEmailOtp = async () => {
    setLoading(true);
    try {
      const res = await volunteerApi.sendVerificationOtp({ target: userEmail!, type: 'email' });
      setEmailDevOtp(res.otp || '');
      setStep('email_otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send email OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpComplete = (otp: string) => {
    setEmailOtp(otp);
    setStep('aadhaar');
  };

  const handleAadhaarSubmit = async () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return setError('Please enter a valid 12-digit Aadhaar number');
    }
    setError('');
    setStep('submitting');
    setLoading(true);
    try {
      await volunteerApi.instantVerify({
        selfieUrl,
        mobileOtp,
        emailOtp: emailOtp || undefined,
        aadhaarNumber,
        phone: userPhone,
        email: userEmail,
      });
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setStep('aadhaar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Instant Volunteer Verification</h2>
              <p className="text-sm text-white/80">Quick verification to accept this emergency</p>
            </div>
          </div>

          {/* Mini progress */}
          <div className="flex gap-1 mt-4">
            {['selfie', 'mobile_otp', 'email_otp', 'aadhaar'].map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                ['intro', 'selfie', 'mobile_otp', 'email_otp', 'aadhaar', 'submitting', 'done'].indexOf(step) > i
                  ? 'bg-white' : 'bg-white/30'
              }`} />
            ))}
          </div>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* INTRO */}
          {step === 'intro' && (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-800 font-medium">An emergency needs your help!</p>
                <p className="text-xs text-amber-600 mt-1">
                  Complete a quick verification (takes ~2 min) to accept this emergency.
                  This gives you temporary access for up to 2 emergencies.
                </p>
              </div>

              <div className="space-y-2 text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Required steps:</p>
                <div className="space-y-1.5">
                  {[
                    { icon: <Camera className="h-4 w-4" />, text: 'Live Selfie Capture' },
                    { icon: <Phone className="h-4 w-4" />, text: 'Mobile OTP Re-verification' },
                    { icon: <Mail className="h-4 w-4" />, text: 'Email OTP Re-verification' },
                    { icon: <Shield className="h-4 w-4" />, text: 'Aadhaar Number Entry' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-left">
                <p className="text-xs text-blue-700">
                  <strong>Temp verified limits:</strong> Max 2 emergencies, expires in 7 days.
                  Complete full KYC for unlimited access.
                </p>
              </div>

              <Button onClick={() => setStep('selfie')}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500">
                Start Verification <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* SELFIE */}
          {step === 'selfie' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">Step 1: Live Selfie Capture</p>

              {!selfieUrl && !selfieCapturing && (
                <Button onClick={startCamera} variant="outline" className="w-full h-24 flex-col gap-2 border-2 border-dashed">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span>Open Camera</span>
                </Button>
              )}

              {selfieCapturing && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border-2 border-primary">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
                  </div>
                  <Button onClick={captureSelfie} className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                    <Camera className="mr-2 h-4 w-4" /> Capture
                  </Button>
                </div>
              )}

              {selfieUrl && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border-2 border-green-400">
                    <img src={selfieUrl} alt="Selfie" className="w-full rounded-xl" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setSelfieUrl(''); startCamera(); }} className="flex-1 text-sm">
                      Retake
                    </Button>
                    <Button onClick={handleSelfieNext} disabled={loading} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ArrowRight className="ml-1 h-4 w-4" /></>}
                    </Button>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* MOBILE OTP */}
          {step === 'mobile_otp' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">Step 2: Mobile OTP Verification</p>
              <p className="text-xs text-muted-foreground text-center">
                OTP sent to +91 {userPhone.slice(0, 2)}****{userPhone.slice(-4)}
              </p>

              <OtpInput onComplete={handleMobileOtpComplete} disabled={loading} />

              {mobileDevOtp && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-center">
                  <p className="text-xs text-amber-600">Dev OTP: <span className="font-mono font-bold">{mobileDevOtp}</span></p>
                </div>
              )}
            </div>
          )}

          {/* EMAIL OTP */}
          {step === 'email_otp' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">Step 3: Email OTP Verification</p>
              <p className="text-xs text-muted-foreground text-center">
                OTP sent to {userEmail?.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
              </p>

              <OtpInput onComplete={handleEmailOtpComplete} disabled={loading} />

              {emailDevOtp && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-center">
                  <p className="text-xs text-amber-600">Dev OTP: <span className="font-mono font-bold">{emailDevOtp}</span></p>
                </div>
              )}
            </div>
          )}

          {/* AADHAAR */}
          {step === 'aadhaar' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">Step {userEmail ? '4' : '3'}: Aadhaar Number</p>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-700">
                  Only your Aadhaar number is required. No document upload needed for instant verification.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Aadhaar Number (12 digits) *</Label>
                <Input
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                  className="text-lg font-mono tracking-widest text-center"
                />
                {aadhaarNumber.length === 12 && (
                  <p className="text-xs text-green-600 text-center">
                    Will be stored as: XXXX-XXXX-{aadhaarNumber.slice(-4)}
                  </p>
                )}
              </div>

              <Button onClick={handleAadhaarSubmit} disabled={aadhaarNumber.length !== 12}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500">
                Complete Verification <Shield className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* SUBMITTING */}
          {step === 'submitting' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
              <p className="text-sm font-medium">Verifying your identity...</p>
              <p className="text-xs text-muted-foreground">This may take a moment</p>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div className="text-center py-6 space-y-5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-700">Verification Complete!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  You're temporarily verified. You can now accept this emergency.
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-left">
                <p className="text-xs text-amber-700 font-medium">Temp Verification Limits:</p>
                <ul className="text-xs text-amber-600 mt-1.5 space-y-1">
                  <li>• Maximum 2 emergencies total</li>
                  <li>• Expires in 7 days</li>
                  <li>• Complete full KYC for unlimited access</li>
                </ul>
              </div>
              <Button onClick={onComplete} className="w-full h-11 bg-green-600 hover:bg-green-700">
                Accept Emergency Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
