import { useQuery } from '@tanstack/react-query';
import { useGetProfile } from '../hooks/queries/useProfiles';
import { fullProfileApi } from '../services/api';
import QueryState from '../components/common/QueryState';
import ProfileCard from '../components/profile/ProfileCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, Star, Briefcase, Users, MessageSquare, Phone, Mail, MapPin, Shield, User } from 'lucide-react';
import { buildBrowseJobsRoute } from '../router/routes';

interface PublicProfilePageProps {
  principalId: string;
}

export default function PublicProfilePage({ principalId }: PublicProfilePageProps) {
  const { data: profile, isLoading, isError, error } = useGetProfile(principalId);

  // Fetch full profile with stats and feedbacks
  const { data: fullProfile } = useQuery({
    queryKey: ['full-profile', principalId],
    queryFn: () => fullProfileApi.getFullProfile(principalId),
    enabled: !!principalId,
  });

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => (window.location.hash = buildBrowseJobsRoute())}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="mx-auto max-w-3xl">
        <QueryState isLoading={isLoading} isError={isError} error={error} isEmpty={!profile} emptyMessage="Profile not found">
          {profile && (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <Card className="overflow-hidden">
                <div className={`h-28 bg-gradient-to-r ${profile.profileType === 'provider' ? 'from-primary/20 via-primary/10 to-accent/10' : 'from-accent/20 via-accent/10 to-primary/10'}`} />
                <CardContent className="-mt-10 space-y-4">
                  <div className="flex items-end gap-4">
                    {fullProfile?.profile?.profilePhoto || profile.profilePhoto ? (
                      <img
                        src={fullProfile?.profile?.profilePhoto || profile.profilePhoto}
                        alt={profile.name}
                        className="h-20 w-20 rounded-2xl object-cover border-4 border-card shadow-lg"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card border-4 border-card shadow-lg">
                        <div className={`flex h-full w-full items-center justify-center rounded-xl ${profile.profileType === 'provider' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                          <span className="text-3xl">{profile.profileType === 'provider' ? '🏢' : '👷'}</span>
                        </div>
                      </div>
                    )}
                    <div className="pb-1 space-y-1">
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={profile.profileType === 'provider' ? 'default' : 'secondary'}
                          className={profile.profileType === 'provider' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}
                        >
                          {profile.profileType === 'provider' ? '🏢 Provider' : '👷 Worker'}
                        </Badge>
                        {fullProfile?.profile?.badge && fullProfile.profile.badge !== 'none' && (
                          <Badge variant="outline" className="gap-1 capitalize">
                            <Shield className="h-3 w-3" />
                            {fullProfile.profile.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{profile.area}</span>
                    </div>
                    {fullProfile?.profile?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="font-mono">{fullProfile.profile.phone}</span>
                      </div>
                    )}
                    {fullProfile?.profile?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-mono">{fullProfile.profile.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {(fullProfile?.profile?.bio || profile.bio) && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{fullProfile?.profile?.bio || profile.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              {fullProfile?.stats && (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  <Card>
                    <CardContent className="py-4 text-center">
                      <Briefcase className="h-5 w-5 text-primary mx-auto mb-1" />
                      <p className="text-2xl font-bold">{fullProfile.stats.jobsPosted || 0}</p>
                      <p className="text-xs text-muted-foreground">Jobs Posted</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4 text-center">
                      <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{fullProfile.stats.applicationsReceived || 0}</p>
                      <p className="text-xs text-muted-foreground">Applications</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4 text-center">
                      <Star className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{fullProfile.stats.avgRating?.toFixed(1) || '—'}</p>
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4 text-center">
                      <MessageSquare className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{fullProfile.stats.totalReviews || 0}</p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Feedbacks / Reviews */}
              {fullProfile?.feedbacks && fullProfile.feedbacks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Reviews ({fullProfile.feedbacks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fullProfile.feedbacks.map((fb: any) => (
                      <div key={fb._id} className="border-b last:border-0 pb-4 last:pb-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{fb.fromName || 'Anonymous'}</p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`h-3 w-3 ${s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {fb.title && <p className="text-sm font-semibold">{fb.title}</p>}
                        <p className="text-sm text-muted-foreground">{fb.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </QueryState>
      </div>
    </div>
  );
}

