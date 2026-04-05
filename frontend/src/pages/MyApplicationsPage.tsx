import { useGetMyApplications } from '../hooks/queries/useApplications';
import { useJobSearch } from '../hooks/queries/useJobs';
import { useGetCallerUserProfile } from '../hooks/queries/useCallerContext';
import QueryState from '../components/common/QueryState';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MapPin, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { buildJobDetailRoute } from '../router/routes';

export default function MyApplicationsPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: applications, isLoading: appsLoading, isError: appsError, error: appsErrorObj } = useGetMyApplications();
  const { data: allJobs, isLoading: jobsLoading } = useJobSearch({});

  const isWorker = userProfile?.profileType === 'worker';

  const isLoading = appsLoading || jobsLoading;

  if (!isWorker) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Only workers can access this page. Please create a worker profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getJobForApplication = (jobId: string) => {
    return allJobs?.find((job) => (job._id || job.id || '') === jobId);
  };

  const getStatusVariant = (status: any) => {
    const s = typeof status === 'string' ? status : Object.keys(status || {})[0];
    if (s === 'accepted') return 'default';
    if (s === 'rejected') return 'destructive';
    return 'secondary';
  };

  const getStatusLabel = (status: any) => {
    const s = typeof status === 'string' ? status : Object.keys(status || {})[0];
    if (s === 'accepted') return 'Accepted';
    if (s === 'rejected') return 'Rejected';
    return 'Pending';
  };

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="container py-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2 animate-fade-in-up">
              <h1 className="text-4xl font-extrabold tracking-tight">
                My <span className="gradient-text">Applications</span>
              </h1>
              <p className="text-muted-foreground">Track your job applications</p>
            </div>
            <div className="hidden md:block animate-fade-in-up stagger-1">
              <div className="relative">
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-60" />
                <img
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=280&h=180&fit=crop&q=80"
                  alt="Applications tracking"
                  className="relative w-56 h-36 rounded-2xl object-cover shadow-lg border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">

      <QueryState
        isLoading={isLoading}
        isError={appsError}
        error={appsErrorObj}
        isEmpty={!applications || applications.length === 0}
        emptyMessage="You haven't applied to any jobs yet. Browse jobs to get started."
      >
        <div className="space-y-4">
          {applications?.map((application) => {
            const job = getJobForApplication(application.jobId);
            const isLocalMatch = job && userProfile && job.area.toLowerCase().trim() === userProfile.area.toLowerCase().trim();

            return (
              <Card key={application._id || application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{job?.title || 'Job not found'}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={getStatusVariant(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                        {isLocalMatch && (
                          <Badge variant="outline" className="border-accent text-accent">
                            Local Match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job && (
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
                        <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Your Cover Letter</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>

                  {job && (
                    <Button variant="outline" onClick={() => (window.location.hash = buildJobDetailRoute(job._id || job.id || ''))}>
                      View Job Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </QueryState>
      </div>
    </div>
  );
}

