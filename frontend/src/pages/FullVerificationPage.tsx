import { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Loader2, ArrowLeft, ArrowRight, Shield, Camera, FileText,
  MapPin, CheckCircle2, Upload, AlertTriangle, CreditCard, User as UserIcon
} from 'lucide-react';
import { volunteerApi } from '../services/api';
import { toast } from 'react-toastify';

interface FullVerificationPageProps {
  onComplete: () => void;
  onBack: () => void;
}

type VerificationStep = 'terms' | 'aadhaar' | 'pan' | 'selfie' | 'address' | 'declaration' | 'complete';
type UploadKey = 'aadhaarFront' | 'aadhaarBack' | 'panImage';

export default function FullVerificationPage({ onComplete, onBack }: FullVerificationPageProps) {
  const [step, setStep] = useState<VerificationStep>('terms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [codeOfConduct, setCodeOfConduct] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  // Aadhaar
  const [aadhaarMethod, setAadhaarMethod] = useState<'digilocker' | 'upload'>('upload');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [nameOnAadhaar, setNameOnAadhaar] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState('');
  const [aadhaarBack, setAadhaarBack] = useState('');
  const [digilockerVerified, setDigilockerVerified] = useState(false);

  // PAN
  const [panNumber, setPanNumber] = useState('');
  const [nameOnPan, setNameOnPan] = useState('');
  const [panImage, setPanImage] = useState('');
  const [uploadingKey, setUploadingKey] = useState<UploadKey | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<UploadKey, number>>({
    aadhaarFront: 0,
    aadhaarBack: 0,
    panImage: 0,
  });

  // Selfie
  const [selfieUrl, setSelfieUrl] = useState('');
  const [selfieCapturing, setSelfieCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Address
  const [address, setAddress] = useState('');
  const [addressLat, setAddressLat] = useState(0);
  const [addressLng, setAddressLng] = useState(0);
  const [addressSource, setAddressSource] = useState<'aadhaar' | 'manual'>('manual');

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const allSteps: VerificationStep[] = ['terms', 'aadhaar', 'pan', 'selfie', 'address', 'declaration', 'complete'];
  const stepIndex = allSteps.indexOf(step);
  const progressPercent = Math.round((stepIndex / (allSteps.length - 1)) * 100);

  const handleTermsSubmit = async () => {
    if (!termsAccepted || !codeOfConduct || !riskAcknowledged) {
      return setError('Please accept all agreements to continue.');
    }
    setError('');
    setLoading(true);
    try {
      await volunteerApi.register({ termsAccepted, codeOfConductAccepted: codeOfConduct, riskAcknowledged });
      setStep('aadhaar');
    } catch (err: any) {
      const message = err.message || 'Failed to start registration';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDigiLocker = async () => {
    // Simulated DigiLocker integration
    setLoading(true);
    setTimeout(() => {
      setDigilockerVerified(true);
      setNameOnAadhaar('Verified via DigiLocker');
      setAadhaarNumber('999988887777');
      setLoading(false);
      toast.success('DigiLocker verification completed');
    }, 2000);
  };

  const handleFileUpload = (key: UploadKey, setter: (val: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const allowedTypes = ['application/pdf'];
        const isImage = file.type.startsWith('image/');
        const isPdf = allowedTypes.includes(file.type);
        if (!isImage && !isPdf) {
          setError('Only PDF and image files are supported.');
          toast.error('Only PDF and image files are supported');
          return;
        }

        setUploadingKey(key);
        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

        const reader = new FileReader();
        reader.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          setUploadProgress((prev) => ({ ...prev, [key]: percent }));
        };
        reader.onload = () => {
          setter(reader.result as string);
          setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
          setUploadingKey(null);
          toast.success(`${file.name} uploaded`);
        };
        reader.onerror = () => {
          setUploadingKey(null);
          setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
          setError('Upload failed. Please try again.');
          toast.error('Upload failed. Please try again.');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAadhaarNext = () => {
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return setError('Please enter a valid 12-digit Aadhaar number');
    }
    if (!digilockerVerified && (!aadhaarFront || !aadhaarBack)) {
      return setError('Please upload Aadhaar front and back images');
    }
    if (!nameOnAadhaar.trim()) {
      return setError('Please enter the name as on Aadhaar');
    }
    setError('');
    setStep('pan');
  };

  const handlePanNext = () => {
    if (!panNumber || !/^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      return setError('Please enter a valid PAN number (e.g., ABCDE1234F)');
    }
    if (!panImage) {
      return setError('Please upload PAN card image');
    }
    if (!nameOnPan.trim()) {
      return setError('Please enter the name as on PAN card');
    }
    setError('');
    setStep('selfie');
  };

  // Start camera for selfie
  const startCamera = async () => {
    setSelfieCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setSelfieUrl(dataUrl);
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setSelfieCapturing(false);
    }
  };

  const handleSelfieNext = () => {
    if (!selfieUrl) return setError('Please capture a live selfie');
    setError('');
    setStep('address');
  };

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddressLat(pos.coords.latitude);
        setAddressLng(pos.coords.longitude);
      },
      () => setError('Unable to get location. Please enter manually.')
    );
  };

  const handleAddressNext = () => {
    if (!address.trim()) return setError('Please enter your address');
    setError('');
    setStep('declaration');
  };

  const handleFinalSubmit = async () => {
    if (!declarationAccepted) return setError('Please accept the declaration to continue');
    setError('');
    setLoading(true);
    try {
      await volunteerApi.submitDocuments({
        aadhaarNumber,
        aadhaarFrontUrl: aadhaarFront,
        aadhaarBackUrl: aadhaarBack,
        panNumber: panNumber.toUpperCase(),
        panUrl: panImage,
        selfieUrl,
        nameOnAadhaar,
        nameOnPan,
        address,
        addressLat,
        addressLng,
        addressSource,
        declarationAccepted,
        digilockerVerified,
      });
      toast.success('Documents uploaded successfully');
      setStep('complete');
    } catch (err: any) {
      const message = err.message || 'Submission failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const maskAadhaar = (num: string) => {
    if (num.length < 4) return num;
    return 'XXXX-XXXX-' + num.slice(-4);
  };

  return (
    <div className="flex min-h-screen items-center justify-center hero-gradient px-4 py-10">
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-2xl relative animate-fade-in-up">
        <Card className="shadow-xl border">
          <CardHeader className="space-y-3 pb-4">
            {step !== 'complete' && (
              <button
                onClick={() => {
                  if (stepIndex > 0) setStep(allSteps[stepIndex - 1]);
                  else onBack();
                }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}

            {/* Progress bar */}
            {step !== 'complete' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Step {stepIndex + 1} of {allSteps.length - 1}</span>
                  <span>{progressPercent}%</span>
                </div>
                <progress
                  className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-orange-500 [&::-webkit-progress-value]:to-red-500"
                  value={progressPercent}
                  max={100}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {step === 'terms' && 'Terms & Conditions'}
                  {step === 'aadhaar' && 'Aadhaar Verification'}
                  {step === 'pan' && 'PAN Card Verification'}
                  {step === 'selfie' && 'Live Face Verification'}
                  {step === 'address' && 'Address Confirmation'}
                  {step === 'declaration' && 'Final Declaration'}
                  {step === 'complete' && 'Verification Submitted!'}
                </CardTitle>
                <CardDescription>
                  {step === 'terms' && 'Review and accept volunteer terms'}
                  {step === 'aadhaar' && 'Verify your identity with Aadhaar'}
                  {step === 'pan' && 'Upload your PAN card for verification'}
                  {step === 'selfie' && 'Take a real-time selfie for face match'}
                  {step === 'address' && 'Confirm your residential address'}
                  {step === 'declaration' && 'Confirm all details are genuine'}
                  {step === 'complete' && 'Your documents are being reviewed'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* STEP: Terms */}
            {step === 'terms' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-3">
                  <p className="text-sm font-medium text-orange-800">By becoming a volunteer, you agree to:</p>
                  <ul className="space-y-1.5 text-xs text-orange-700">
                    <li>• Respond to emergencies when available</li>
                    <li>• Maintain respectful and helpful behavior</li>
                    <li>• Keep your identity information accurate</li>
                    <li>• Follow safety guidelines during emergencies</li>
                    <li>• Not misuse emergency privileges</li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                  <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary" />
                  <div>
                    <span className="text-sm font-medium">I accept the Terms & Conditions</span>
                    <p className="text-xs text-muted-foreground mt-0.5">I have read and agree to all volunteer program terms.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                  <input type="checkbox" checked={codeOfConduct} onChange={(e) => setCodeOfConduct(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary" />
                  <div>
                    <span className="text-sm font-medium">I accept the Code of Conduct</span>
                    <p className="text-xs text-muted-foreground mt-0.5">I will behave responsibly during all emergency responses.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                  <input type="checkbox" checked={riskAcknowledged} onChange={(e) => setRiskAcknowledged(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary" />
                  <div>
                    <span className="text-sm font-medium">I acknowledge the risks involved</span>
                    <p className="text-xs text-muted-foreground mt-0.5">I understand volunteering may involve physical risk.</p>
                  </div>
                </label>

                <Button onClick={handleTermsSubmit} disabled={loading || !termsAccepted || !codeOfConduct || !riskAcknowledged}
                  className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Continue to Verification <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP: Aadhaar */}
            {step === 'aadhaar' && (
              <div className="space-y-4">
                {/* Method selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAadhaarMethod('digilocker')}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      aadhaarMethod === 'digilocker' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                    <div className="text-lg mb-1">🔐</div>
                    <div className="font-semibold text-xs">DigiLocker</div>
                    <div className="text-[10px] text-muted-foreground">Preferred — secure & instant</div>
                  </button>
                  <button onClick={() => setAadhaarMethod('upload')}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      aadhaarMethod === 'upload' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                    <div className="text-lg mb-1">📄</div>
                    <div className="font-semibold text-xs">Upload Documents</div>
                    <div className="text-[10px] text-muted-foreground">Upload front & back images</div>
                  </button>
                </div>

                {aadhaarMethod === 'digilocker' && !digilockerVerified && (
                  <Button onClick={handleDigiLocker} disabled={loading} variant="outline" className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                    Connect DigiLocker
                  </Button>
                )}

                {digilockerVerified && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">DigiLocker verified successfully!</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Aadhaar Number *</Label>
                  <Input
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                  />
                  {aadhaarNumber.length === 12 && (
                    <p className="text-xs text-green-600">Display: {maskAadhaar(aadhaarNumber)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Name as on Aadhaar *</Label>
                  <Input value={nameOnAadhaar} onChange={(e) => setNameOnAadhaar(e.target.value)} placeholder="Full name as on Aadhaar card" />
                </div>

                {aadhaarMethod === 'upload' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Aadhaar Front (PDF/Image) *</Label>
                      <button onClick={() => handleFileUpload('aadhaarFront', setAadhaarFront)}
                        disabled={uploadingKey === 'aadhaarFront'}
                        className={`mt-1 w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs transition-colors ${
                          aadhaarFront ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary/50'
                        }`}>
                        {uploadingKey === 'aadhaarFront'
                          ? <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          : aadhaarFront
                            ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                            : <Upload className="h-5 w-5 text-muted-foreground" />}
                        <span className="mt-1 text-muted-foreground">{aadhaarFront ? 'Uploaded' : 'Upload'}</span>
                      </button>
                      {uploadProgress.aadhaarFront > 0 && uploadProgress.aadhaarFront < 100 && (
                        <progress
                          className="mt-1 h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
                          value={uploadProgress.aadhaarFront}
                          max={100}
                        />
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Aadhaar Back (PDF/Image) *</Label>
                      <button onClick={() => handleFileUpload('aadhaarBack', setAadhaarBack)}
                        disabled={uploadingKey === 'aadhaarBack'}
                        className={`mt-1 w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs transition-colors ${
                          aadhaarBack ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary/50'
                        }`}>
                        {uploadingKey === 'aadhaarBack'
                          ? <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          : aadhaarBack
                            ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                            : <Upload className="h-5 w-5 text-muted-foreground" />}
                        <span className="mt-1 text-muted-foreground">{aadhaarBack ? 'Uploaded' : 'Upload'}</span>
                      </button>
                      {uploadProgress.aadhaarBack > 0 && uploadProgress.aadhaarBack < 100 && (
                        <progress
                          className="mt-1 h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
                          value={uploadProgress.aadhaarBack}
                          max={100}
                        />
                      )}
                    </div>
                  </div>
                )}

                <Button onClick={handleAadhaarNext} className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP: PAN */}
            {step === 'pan' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> PAN Number *
                  </Label>
                  <Input
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                  {panNumber.length === 10 && /^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber) && (
                    <p className="text-xs text-green-600">Valid PAN format</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Name as on PAN Card *</Label>
                  <Input value={nameOnPan} onChange={(e) => setNameOnPan(e.target.value)} placeholder="Full name as on PAN card" />
                </div>

                <div>
                  <Label className="text-xs">PAN Card (PDF/Image) *</Label>
                  <button onClick={() => handleFileUpload('panImage', setPanImage)}
                    disabled={uploadingKey === 'panImage'}
                    className={`mt-1 w-full h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-xs transition-colors ${
                      panImage ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary/50'
                    }`}>
                    {uploadingKey === 'panImage'
                      ? <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      : panImage
                        ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                        : <Upload className="h-5 w-5 text-muted-foreground" />}
                    <span className="mt-1 text-muted-foreground">{panImage ? 'PAN card uploaded' : 'Upload PAN card image'}</span>
                  </button>
                  {uploadProgress.panImage > 0 && uploadProgress.panImage < 100 && (
                    <progress
                      className="mt-1 h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
                      value={uploadProgress.panImage}
                      max={100}
                    />
                  )}
                </div>

                <Button onClick={handlePanNext} className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP: Selfie */}
            {step === 'selfie' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm text-blue-800 font-medium">Real-time selfie required</p>
                  <p className="text-xs text-blue-600 mt-1">Your face will be matched with your Aadhaar photo for identity verification.</p>
                </div>

                {!selfieUrl && !selfieCapturing && (
                  <Button onClick={startCamera} variant="outline" className="w-full h-28 flex-col gap-2 border-2 border-dashed">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span>Open Camera</span>
                  </Button>
                )}

                {selfieCapturing && (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border-2 border-primary">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
                      <div className="absolute inset-0 border-4 border-white/30 rounded-xl pointer-events-none" />
                    </div>
                    <Button onClick={captureSelfie} className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                      <Camera className="mr-2 h-4 w-4" /> Capture Selfie
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
                    <Button variant="outline" onClick={() => { setSelfieUrl(''); startCamera(); }} className="w-full text-sm">
                      Retake Selfie
                    </Button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                <Button onClick={handleSelfieNext} className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500" disabled={!selfieUrl}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP: Address */}
            {step === 'address' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAddressSource('aadhaar')}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      addressSource === 'aadhaar' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                    <span className="text-sm font-medium">From Aadhaar</span>
                    <p className="text-[10px] text-muted-foreground">Auto-fetch from documents</p>
                  </button>
                  <button onClick={() => setAddressSource('manual')}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      addressSource === 'manual' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                    <span className="text-sm font-medium">Enter Manually</span>
                    <p className="text-[10px] text-muted-foreground">Type your address</p>
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Full Address *
                  </Label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full residential address"
                    rows={3}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>

                <Button variant="outline" onClick={handleGetLocation} className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Confirm with Geo-location
                </Button>
                {addressLat !== 0 && (
                  <p className="text-xs text-green-600 text-center">
                    Location confirmed: {addressLat.toFixed(4)}, {addressLng.toFixed(4)}
                  </p>
                )}

                <Button onClick={handleAddressNext} className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP: Declaration */}
            {step === 'declaration' && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-xl bg-muted/50 border p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Verification Summary</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aadhaar</span>
                      <span className="font-mono">{maskAadhaar(aadhaarNumber)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name (Aadhaar)</span>
                      <span>{nameOnAadhaar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PAN</span>
                      <span className="font-mono">{panNumber.slice(0, 2)}XXXX{panNumber.slice(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Face Verified</span>
                      <span className="text-green-600">✓ Captured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="text-right max-w-[200px] truncate">{address}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-orange-200 bg-orange-50 cursor-pointer">
                  <input type="checkbox" checked={declarationAccepted} onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-orange-400 text-orange-500" />
                  <div>
                    <span className="text-sm font-bold text-orange-800">Final Declaration</span>
                    <p className="text-xs text-orange-700 mt-1">
                      "I confirm all details provided are genuine and accurate. I understand that providing
                      false information may result in permanent account suspension."
                    </p>
                  </div>
                </label>

                <Button onClick={handleFinalSubmit} disabled={loading || !declarationAccepted}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Shield className="mr-2 h-5 w-5" />}
                  Submit for Verification
                </Button>
              </div>
            )}

            {/* STEP: Complete */}
            {step === 'complete' && (
              <div className="text-center space-y-6 py-6">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-700">Verification Submitted!</h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Your documents are under review. You'll be notified once the admin approves your verification.
                    This usually takes 24-48 hours.
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-left">
                  <p className="text-xs font-semibold text-blue-700 mb-2">What happens next?</p>
                  <ul className="space-y-1.5 text-xs text-blue-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 shrink-0" /> Admin reviews your documents</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 shrink-0" /> Face match with Aadhaar photo</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 shrink-0" /> Name & document validation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 shrink-0" /> Verified badge on your profile</li>
                  </ul>
                </div>
                <Button onClick={onComplete} className="w-full h-11">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
