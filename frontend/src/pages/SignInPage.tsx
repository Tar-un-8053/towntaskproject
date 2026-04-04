import { useState } from 'react';
import OtpInput from '../components/auth/OtpInput';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, ArrowLeft, Phone, Shield, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

interface SignInPageProps {
  onSuccess: (data: { userId: string; token: string; profile: any }) => void;
  onGoToSignUp: () => void;
}

type Step = 'phone' | 'otp' | 'password';

export default function SignInPage({ onSuccess, onGoToSignUp }: SignInPageProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [sentTo, setSentTo] = useState<{ phone?: string; email?: string } | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      return setError('Please enter a valid 10-digit phone number');
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.signin({ phone });
      setHasPassword(res.hasPassword || false);
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

  const handlePasswordLogin = async () => {
    if (!password.trim()) {
      return setError('Please enter your password');
    }
    setError('');
    setLoading(true);
    try {
      const res = await authApi.signinWithPassword({ phone, password });
      if (res.success) {
        toast.success('Signed in successfully');
        onSuccess({ userId: res.userId, token: res.token, profile: res.profile });
      }
    } catch (err: any) {
      const message = err.message || 'Invalid password';
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
        toast.success('Signed in successfully');
        onSuccess({ userId: res.userId, token: res.token, profile: res.profile });
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
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-5xl relative animate-fade-in-up grid lg:grid-cols-5 overflow-hidden rounded-2xl shadow-xl border bg-card">
        {/* Left panel */}
        <div className="hidden lg:flex lg:col-span-2 relative bg-gradient-to-br from-accent/80 to-primary flex-col items-center justify-center p-8 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=900&fit=crop&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative z-10 space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome Back!</h2>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">Sign in with your phone number to access your account and local jobs.</p>
            </div>
            <div className="space-y-3 text-left">
              {[
                { icon: '📱', text: 'Quick OTP verification' },
                { icon: '🔐', text: 'Password login available' },
                { icon: '📍', text: 'See jobs in your area' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <div className="flex -space-x-2 justify-center">
                {['https://i.pravatar.cc/40?img=11','https://i.pravatar.cc/40?img=5','https://i.pravatar.cc/40?img=12','https://i.pravatar.cc/40?img=33','https://i.pravatar.cc/40?img=47'].map((src, i) => (
                  <img key={i} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-white/50 object-cover" />
                ))}
              </div>
              <p className="text-xs text-white/70 mt-2">500+ active users on Towntask</p>
            </div>
          </div>
        </div>

        {/* Right - form */}
        <div className="lg:col-span-3 p-0">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-3 pb-4">
              {(step === 'otp' || step === 'password') && (
                <button onClick={() => { setStep('phone'); setError(''); setPassword(''); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
              <div>
                <CardTitle className="text-2xl">
                  {step === 'phone' ? 'Sign In' : step === 'password' ? 'Enter Password' : 'Verify Phone'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {step === 'phone'
                    ? 'Enter your registered phone number'
                    : step === 'password'
                      ? 'Enter your password to sign in'
                      : sentTo
                        ? `OTP sent to ${sentTo.phone || phone}${sentTo.email ? ` & ${sentTo.email}` : ''}`
                        : `Enter the 6-digit OTP sent to +91 ${phone}`}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Step 1: Phone */}
              {step === 'phone' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone Number
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex h-10 items-center rounded-md border px-3 bg-muted text-sm font-medium text-muted-foreground">+91</div>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSendOtp} className="w-full h-11 shadow-md hover:shadow-lg transition-shadow" disabled={loading || phone.length < 10}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</> : 'Send OTP'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button onClick={onGoToSignUp} className="text-primary font-semibold hover:underline">Sign Up</button>
                  </p>
                </div>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-8 w-8 text-primary" />
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
                          <span className="text-xs">📧</span>
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

                  {hasPassword && (
                    <div className="border-t pt-4 text-center">
                      <button
                        onClick={() => { setStep('password'); setError(''); }}
                        className="text-sm text-primary font-semibold hover:underline flex items-center gap-1.5 mx-auto"
                      >
                        <Lock className="h-3.5 w-3.5" /> Sign in with Password instead
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Password Login */}
              {step === 'password' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 border p-3 text-center">
                    <p className="text-sm text-muted-foreground">Signing in as <span className="font-mono font-semibold text-foreground">+91 {phone}</span></p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pr-10"
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
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

                  <Button onClick={handlePasswordLogin} className="w-full h-11 shadow-md hover:shadow-lg transition-shadow" disabled={loading || !password.trim()}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
                  </Button>

                  <div className="border-t pt-4 text-center">
                    <button
                      onClick={() => { setStep('otp'); setError(''); }}
                      className="text-sm text-primary font-semibold hover:underline flex items-center gap-1.5 mx-auto"
                    >
                      <Shield className="h-3.5 w-3.5" /> Use OTP instead
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
