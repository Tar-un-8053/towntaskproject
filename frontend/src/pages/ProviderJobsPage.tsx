import { useJobSearch } from '../hooks/queries/useJobs';
import { useGetCallerUserProfile } from '../hooks/queries/useCallerContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import JobCard from '../components/jobs/JobCard';
import CreateJobDialog from '../components/jobs/CreateJobDialog';
import QueryState from '../components/common/QueryState';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProviderJobsPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: allJobs, isLoading, isError, error } = useJobSearch({});

  const isProvider = userProfile?.profileType === 'provider';

  // Filter jobs posted by current user (workaround: backend doesn't expose caller principal)
  // This is a limitation - we can't reliably filter by poster without backend support
  const myJobs = allJobs || [];

  if (!isProvider) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Only providers can access this page. Please create a provider profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="container py-10">
          <div className="flex items-center justify-between">
            <div className="space-y-3 animate-fade-in-up">
              <h1 className="text-4xl font-extrabold tracking-tight">
                My <span className="gradient-text">Jobs</span>
              </h1>
              <p className="text-muted-foreground">Manage your job postings</p>
              <div className="flex items-center gap-3 pt-1">
                <img
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=100&h=100&fit=crop&q=80"
                  alt=""
                  className="h-10 w-10 rounded-xl object-cover shadow ring-2 ring-primary/20"
                />
                <img
                  src="https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop&q=80"
                  alt=""
                  className="h-10 w-10 rounded-xl object-cover shadow ring-2 ring-accent/20"
                />
                <img
                  src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=100&h=100&fit=crop&q=80"
                  alt=""
                  className="h-10 w-10 rounded-xl object-cover shadow ring-2 ring-primary/20"
                />
              </div>
            </div>
            <CreateJobDialog />
          </div>
        </div>
      </div>
      <div className="container py-8">

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={myJobs.length === 0}
        emptyMessage="You haven't posted any jobs yet. Click 'Post New Job' to get started."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {myJobs.map((job, idx) => (
            <div key={job._id || job.id || idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <JobCard job={job} />
            </div>
          ))}
        </div>
      </QueryState>
      </div>
    </div>
  );
}

