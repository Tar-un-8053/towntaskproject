import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Mail, User, Briefcase, Wrench } from 'lucide-react';
import type { Profile } from '../../backend';

interface ProfileCardProps {
  profile: Profile;
  showEmail?: boolean;
}

export default function ProfileCard({ profile, showEmail = false }: ProfileCardProps) {
  const isProvider = profile.profileType === 'provider';

  return (
    <Card className="card-hover overflow-hidden">
      {/* Profile banner */}
      <div className={`h-20 bg-gradient-to-r ${isProvider ? 'from-primary/20 to-accent/10' : 'from-accent/20 to-primary/10'}`} />
      <CardHeader className="-mt-10 pb-3">
        <div className="flex items-end gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border-4 border-card shadow-md">
            <div className={`flex h-full w-full items-center justify-center rounded-xl ${isProvider ? 'bg-primary/10' : 'bg-accent/10'}`}>
              {isProvider ? <Briefcase className="h-7 w-7 text-primary" /> : <Wrench className="h-7 w-7 text-accent" />}
            </div>
          </div>
          <div className="flex-1 pb-1">
            <CardTitle className="text-lg">{profile.name}</CardTitle>
            <Badge 
              variant={isProvider ? 'default' : 'secondary'} 
              className={`mt-1 ${isProvider ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
            >
              {isProvider ? '🏢 Provider' : '👷 Worker'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary/60" />
          <span>{profile.area}</span>
        </div>
        {showEmail && profile.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary/60" />
            <span>{profile.email}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

