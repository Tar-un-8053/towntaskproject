import { useQuery } from '@tanstack/react-query';
import { useJobSearch } from '../hooks/queries/useJobs';
import { useGetCallerUserProfile } from '../hooks/queries/useCallerContext';
import { useGetMyApplications } from '../hooks/queries/useApplications';
import { useGetProfile } from '../hooks/queries/useProfiles';
import { jobDetailApi } from '../services/api';
import QueryState from '../components/common/QueryState';
import ApplyToJobDialog from '../components/applications/ApplyToJobDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MapPin, Briefcase, Calendar, User, ArrowLeft, Navigation, Star, Phone, Mail, Users, MessageSquare, Shield } from 'lucide-react';
import JobsMap from '../components/jobs/JobsMap';
import { buildBrowseJobsRoute, buildPublicProfileRoute } from '../router/routes';

interface JobDetailPageProps {
  jobId: string;
}

export default function JobDetailPage({ jobId }: JobDetailPageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: jobs, isLoading, isError, error } = useJobSearch({});
  const { data: myApplications } = useGetMyApplications();

  const job = jobs?.find((j) => (j._id || j.id || '') === jobId);
  const { data: posterProfile } = useGetProfile(job?.postedBy || '');

  // Fetch enhanced job detail with poster info, reviews, application count
  const { data: jobDetail } = useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: () => jobDetailApi.getJobDetail(jobId),
    enabled: !!jobId,
  });

  const isWorker = userProfile?.profileType === 'worker';
  const isJobOwner = job && userProfile && job.postedBy === userProfile.name;
  const isOpen = job?.status === 'open';

  const hasApplied = myApplications?.some((app) => (app.jobId || '') === jobId);

  const isLocalMatch = job && userProfile && job.area.toLowerCase().trim() === userProfile.area.toLowerCase().trim();

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => (window.location.hash = buildBrowseJobsRoute())}>
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      <QueryState isLoading={isLoading} isError={isError} error={error} isEmpty={!job} emptyMessage="Job not found">
        {job && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                {/* Category header image */}
                <div className="relative h-40 bg-gradient-to-r from-primary/20 to-accent/10 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${job.category.toLowerCase().includes('tech') ? '1531482615713-2afd69097998' : job.category.toLowerCase().includes('clean') ? '1581578731548-c64695cc6952' : job.category.toLowerCase().includes('cook') ? '1556909114-f6e7ad7d3136' : job.category.toLowerCase().includes('tutor') ? '1523050854058-8df90110c9f1' : job.category.toLowerCase().includes('deliver') ? '1566576912321-d58ddd7a6088' : job.category.toLowerCase().includes('garden') ? '1416879595882-3373a0480b5b' : job.category.toLowerCase().includes('repair') ? '1504148455328-c376907d081c' : '1521737711867-e3b97375f902'}?w=800&h=300&fit=crop&q=80`}
                    alt={job.category}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
                <CardHeader className="-mt-8 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={isOpen ? 'default' : 'secondary'}>{isOpen ? 'Open' : 'Closed'}</Badge>
                        {isLocalMatch && (
                          <Badge variant="outline" className="border-accent text-accent">
                            Local Match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {new Date(Number(job.createdAt) / 1000000).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {isWorker && isOpen && !hasApplied && (
                    <div className="pt-4">
                      <ApplyToJobDialog jobId={job._id} jobTitle={job.title} />
                    </div>
                  )}

                  {hasApplied && (
                    <div className="rounded-lg border border-accent/50 bg-accent/5 p-4">
                      <p className="text-sm font-medium text-accent">You have already applied to this job</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Location Map */}
              {job.lat && job.lng && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" />
                      Job Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <JobsMap jobs={[job]} height="250px" />
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.area}
                    </p>
                  </CardContent>
                </Card>
              )}

              {(posterProfile || jobDetail?.poster) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Posted By
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      {jobDetail?.poster?.profilePhoto ? (
                        <img src={jobDetail.poster.profilePhoto} alt="" className="h-12 w-12 rounded-full object-cover border-2 border-primary/20" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{posterProfile?.name || jobDetail?.poster?.name}</p>
                        <p className="text-sm text-muted-foreground">{posterProfile?.area || jobDetail?.poster?.area}</p>
                      </div>
                    </div>

                    {/* Contact info (masked) */}
                    {jobDetail?.poster?.phone && (
                      <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono text-muted-foreground">{jobDetail.poster.phone}</span>
                        </div>
                        {jobDetail.poster.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono text-muted-foreground">{jobDetail.poster.email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating & Badge */}
                    {jobDetail?.poster && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {jobDetail.poster.avgRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold">{jobDetail.poster.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                        {jobDetail.poster.badge && jobDetail.poster.badge !== 'none' && (
                          <Badge variant="outline" className="gap-1 capitalize">
                            <Shield className="h-3 w-3" />
                            {jobDetail.poster.badge}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => (window.location.hash = buildPublicProfileRoute(job.postedBy.toString()))}
                    >
                      View Full Profile
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Application Count */}
              {jobDetail?.applicationCount !== undefined && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{jobDetail.applicationCount}</p>
                        <p className="text-xs text-muted-foreground">Applicants</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              {jobDetail?.reviews && jobDetail.reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Reviews ({jobDetail.reviews.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {jobDetail.reviews.slice(0, 5).map((review: any) => (
                      <div key={review._id} className="border-b last:border-0 pb-3 last:pb-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}

