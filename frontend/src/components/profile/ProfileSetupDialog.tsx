import { useState } from 'react';
import { useSaveCallerProfile } from '../../hooks/queries/useProfiles';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [profileType, setProfileType] = useState<'worker' | 'provider'>('worker');

  const saveProfile = useSaveCallerProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !area.trim()) return;

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        area: area.trim(),
        profileType: profileType,
      });
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center hero-gradient px-4">
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="w-full max-w-4xl relative animate-fade-in-up grid lg:grid-cols-5 overflow-hidden rounded-2xl shadow-xl border bg-card">
        {/* Left side — illustration panel */}
        <div className="hidden lg:flex lg:col-span-2 relative bg-gradient-to-br from-primary/90 to-primary flex-col items-center justify-center p-8 text-white">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=900&fit=crop&q=80')] bg-cover bg-center" />
          <div className="relative z-10 space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=160&h=160&fit=crop&q=80" alt="Team" className="h-16 w-16 rounded-full object-cover ring-2 ring-white/50" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Join Towntask</h2>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">Connect with local opportunities and grow your career in your neighbourhood.</p>
            </div>
            <div className="space-y-3 text-left">
              {[
                { icon: '📍', text: 'Hyper-local job matching' },
                { icon: '⚡', text: 'Apply with one click' },
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

        {/* Right side — form */}
        <div className="lg:col-span-3">
      <Card className="border-0 shadow-none">
        <CardHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-2">
            <span className="text-2xl">👋</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Towntask!</CardTitle>
          <CardDescription>Let's set up your profile to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area / Location *</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., Downtown Seattle, Brooklyn NY, etc."
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your city, neighborhood, or region for local job matching
              </p>
            </div>

            <div className="space-y-2">
              <Label>I am a *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setProfileType('worker')}
                  className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    profileType === 'worker'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="text-2xl mb-2">👷</div>
                  <div className="font-semibold">Worker</div>
                  <div className="text-xs text-muted-foreground">Looking for jobs</div>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileType('provider')}
                  className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    profileType === 'provider'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-semibold">Provider</div>
                  <div className="text-xs text-muted-foreground">Posting jobs</div>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 shadow-md hover:shadow-lg transition-shadow" disabled={saveProfile.isPending || !name.trim() || !area.trim()}>
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}

