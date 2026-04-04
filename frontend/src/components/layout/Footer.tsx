import { Heart, Briefcase, MapPin, Users } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-muted/60 mt-auto">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg gradient-text">Towntask</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting local talent with nearby opportunities. Find work in your neighborhood.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Platform</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>Area-based job matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <span>Worker & Provider profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Easy job applications</span>
              </div>
            </div>
          </div>

          {/* Stats look */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Why Towntask?</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-primary/5 p-3 text-center">
                <div className="text-lg font-bold text-primary">100%</div>
                <div className="text-xs text-muted-foreground">Free to use</div>
              </div>
              <div className="rounded-lg bg-accent/5 p-3 text-center">
                <div className="text-lg font-bold text-accent">Local</div>
                <div className="text-xs text-muted-foreground">Jobs near you</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              Made with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 animate-pulse" /> in India
            </p>
            <p>&copy; {currentYear} Towntask. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

