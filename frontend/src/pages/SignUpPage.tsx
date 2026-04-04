import { useState } from 'react';
import OtpInput from '../components/auth/OtpInput';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, ArrowLeft, Phone, MapPin, User as UserIcon, Mail, Briefcase, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

interface SignUpPageProps {
  onSuccess: (data: { userId: string; token: string; profile: any; isNewUser?: boolean }) => void;
  onGoToSignIn: () => void;
}

type Step = 'details' | 'location' | 'otp';

export default function SignUpPage({ onSuccess, onGoToSignIn }: SignUpPageProps) {
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [area, setArea] = useState('');
  const [profileType, setProfileType] = useState<'worker' | 'provider'>('worker');
  const [devOtp, setDevOtp] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [sentTo, setSentTo] = useState<{ phone?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetailsNext = () => {
    if (!name.trim()) return setError('Full name is required');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setError('Valid email is required');
    if (!phone.trim() || phone.length < 10) return setError('Valid 10-digit phone number is required');
    if (!password.trim() || password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setStep('location');
  };

  const handleLocationNext = async () => {
    if (!area.trim()) return setError('Please enter your location');
    setError('');
    setLoading(true);
    try {
      const res = await authApi.signup({ name, phone, email, area, profileType, password });
      setDevOtp(res.otp || '');
      setEmailPreviewUrl(res.emailPreviewUrl || '');
      if (res.sentTo) setSentTo(res.sentTo);
      setStep('otp');
    } catch (err: any) {
      const message = err.message || 'Failed to send OTP';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (otp: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp({ phone, otp });
      if (res.success) {
        toast.success('Account created successfully');
        onSuccess({ userId: res.userId, token: res.token, profile: res.profile, isNewUser: res.isNewUser });
      }
    } catch (err: any) {
      const message = err.message || 'Invalid OTP';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.sendOtp({ phone });
      setDevOtp(res.otp || '');
      setEmailPreviewUrl(res.emailPreviewUrl || '');
      setError('');
    } catch (err: any) {
      const message = err.message || 'Failed to resend OTP';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center hero-gradient px-4 py-10">
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-5xl relative animate-fade-in-up grid lg:grid-cols-5 overflow-hidden rounded-2xl shadow-xl border bg-card">
        {/* Left panel */}
        <div className="hidden lg:flex lg:col-span-2 relative bg-gradient-to-br from-primary/90 to-primary flex-col items-center justify-center p-8 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=900&fit=crop&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative z-10 space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=160&h=160&fit=crop&q=80" alt="Team" className="h-16 w-16 rounded-full object-cover ring-2 ring-white/50" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Join Towntask</h2>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">Create your free account and start finding local opportunities today.</p>
            </div>
            <div className="space-y-3 text-left">
              {[
                { icon: '📍', text: 'Location-based job matching' },
                { icon: '⚡', text: 'Free to use forever' },
                { icon: '🔒', text: 'Secure OTP verification' },
                { icon: '🤝', text: 'Direct employer connect' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - form */}
        <div className="lg:col-span-3 p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-3 pb-4">
              {step !== 'details' && (
                <button onClick={() => setStep(step === 'otp' ? 'location' : 'details')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {['details', 'location', 'otp'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step === s ? 'bg-primary text-primary-foreground shadow-md' :
                      ['details', 'location', 'otp'].indexOf(step) > i ? 'bg-green-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {['details', 'location', 'otp'].indexOf(step) > i ? '✓' : i + 1}
                    </div>
                    {i < 2 && <div className={`h-0.5 w-8 rounded ${['details', 'location', 'otp'].indexOf(step) > i ? 'bg-green-500' : 'bg-muted'}`} />}
                  </div>
                ))}
              </div>

              <div>
                <CardTitle className="text-2xl">
                  {step === 'details' && 'Create Account'}
                  {step === 'location' && 'Your Location'}
                  {step === 'otp' && 'Verify Phone'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {step === 'details' && 'Enter your basic details to get started'}
                  {step === 'location' && 'Enter your area so we can show you local jobs'}
                  {step === 'otp' && (sentTo
                    ? `OTP sent to ${sentTo.phone || phone}${sentTo.email ? ` & ${sentTo.email}` : ''}`
                    : `Enter the 6-digit OTP sent to +91 ${phone}`)}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Step 1: Basic Details */}
              {step === 'details' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5" /> Full Name *
                    </Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email *
                    </Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Mobile Number *
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex h-10 items-center rounded-md border px-3 bg-muted text-sm font-medium text-muted-foreground">+91</div>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" className="flex-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> I am a *
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setProfileType('worker')}
                        className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                          profileType === 'worker' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}>
                        <div className="text-2xl mb-1">👷</div>
                        <div className="font-semibold text-sm">User</div>
                        <div className="text-xs text-muted-foreground">Looking for jobs & services</div>
                      </button>
                      <button type="button" onClick={() => setProfileType('provider')}
                        className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                          profileType === 'provider' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}>
                        <div className="text-2xl mb-1">🏢</div>
                        <div className="font-semibold text-sm">Freelancer / Provider</div>
                        <div className="text-xs text-muted-foreground">Offering services & posting jobs</div>
                      </button>
                    </div>
                  </div>

                  <Button onClick={handleDetailsNext} className="w-full h-11 shadow-md hover:shadow-lg transition-shadow">
                    Continue
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button onClick={onGoToSignIn} className="text-primary font-semibold hover:underline">Sign In</button>
                  </p>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 'location' && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Why do we need your location?</p>
                      <p className="text-xs text-muted-foreground mt-1">We use your area to show you relevant local jobs in your neighbourhood. You can change this anytime.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area" className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Area / Location *
                    </Label>
                    <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g., Koramangala Bangalore, Andheri Mumbai..." />
                    <p className="text-xs text-muted-foreground">Enter your city, neighbourhood, or region</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Popular locations:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad', 'Jaipur'].map((loc) => (
                        <button key={loc} onClick={() => setArea(loc)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all hover:bg-primary/5 hover:border-primary/30 ${area === loc ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}>
                          📍 {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleLocationNext} className="w-full h-11 shadow-md hover:shadow-lg transition-shadow" disabled={loading || !area.trim()}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</> : 'Send OTP & Continue'}
                  </Button>
                </div>
              )}

              {/* Step 3: OTP */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {sentTo && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-blue-700">OTP sent to:</p>
                      {sentTo.phone && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="font-mono">{sentTo.phone}</span>
                        </div>
                      )}
                      {sentTo.email && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="font-mono">{sentTo.email}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <OtpInput onComplete={handleOtpComplete} disabled={loading} />

                  {devOtp && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                      <p className="text-xs text-amber-600 font-medium">Dev Mode — OTP: <span className="font-mono text-base font-bold text-amber-800">{devOtp}</span></p>
                      {emailPreviewUrl ? (
                        <a href={emailPreviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                          <Mail className="h-4 w-4" /> View OTP Email ✉️
                        </a>
                      ) : (
                        <p className="text-[10px] text-amber-500 mt-1">OTP also sent to your email ✉️</p>
                      )}
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </div>
                  )}

                  <div className="text-center">
                    <button onClick={handleResendOtp} disabled={loading} className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                      Didn't receive OTP? Resend
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
