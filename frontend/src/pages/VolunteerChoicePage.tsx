import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, Heart, Star, ArrowRight, Clock, CheckCircle2, Users, Loader2 } from 'lucide-react';
import { volunteerApi } from '../services/api';

interface VolunteerChoicePageProps {
  onYes: () => void;       // Navigate to full verification flow
  onSkip: () => void;      // Navigate to dashboard
}

export default function VolunteerChoicePage({ onYes, onSkip }: VolunteerChoicePageProps) {
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const handleYes = async () => {
    setLoading(true);
    onYes();
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await volunteerApi.skip();
    } catch (e) {
      // Non-blocking — still navigate
    }
    onSkip();
  };

  return (
    <div className="flex min-h-screen items-center justify-center hero-gradient px-4 py-10">
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-2xl relative animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-200">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Would you like to become a{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Community Emergency Volunteer?
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Join our network of verified volunteers who help nearby people during emergencies. It's safe, voluntary, and makes a real difference.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Help Nearby People</h3>
                  <p className="text-xs text-muted-foreground mt-1">Respond to emergencies within your area and save lives.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Safe & Voluntary</h3>
                  <p className="text-xs text-muted-foreground mt-1">Accept emergencies only when you're available. No obligations.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Verified Identity</h3>
                  <p className="text-xs text-muted-foreground mt-1">KYC verification ensures trust and safety for everyone.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Boost Your Profile</h3>
                  <p className="text-xs text-muted-foreground mt-1">Higher trust score, verified badge, and priority visibility.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-primary">
              <Users className="h-5 w-5" />
              500+
            </div>
            <p className="text-xs text-muted-foreground">Active Volunteers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              1200+
            </div>
            <p className="text-xs text-muted-foreground">Emergencies Resolved</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-orange-500">
              <Star className="h-5 w-5" />
              4.8
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleYes}
            disabled={loading}
            className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting Verification...</>
            ) : (
              <>
                YES, I'M IN
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <Button
            onClick={handleSkip}
            disabled={skipping}
            variant="ghost"
            className="w-full h-12 text-muted-foreground hover:text-foreground"
          >
            {skipping ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting...</>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                SKIP FOR NOW
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You can always become a volunteer later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
