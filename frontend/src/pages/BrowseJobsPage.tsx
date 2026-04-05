import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useJobSearch } from '../hooks/queries/useJobs';
import { analyticsApi } from '../services/api';
import JobCard from '../components/jobs/JobCard';
import JobsMap from '../components/jobs/JobsMap';
import QueryState from '../components/common/QueryState';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Search, MapPin, Briefcase, Filter, X, Sparkles, TrendingUp, Users, Building2, Map, LayoutGrid, Globe } from 'lucide-react';
import VolunteerReminderBanner from '../components/common/VolunteerReminderBanner';
import { buildVolunteerChoiceRoute } from '../router/routes';

// Popular categories for quick filter
const popularCategories = [
  { name: 'Cleaning', emoji: '🧹', color: 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20' },
  { name: 'Delivery', emoji: '🚚', color: 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-500/20' },
  { name: 'Tutoring', emoji: '📚', color: 'bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 border-indigo-500/20' },
  { name: 'Tech', emoji: '💻', color: 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-500/20' },
  { name: 'Cooking', emoji: '🍳', color: 'bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-500/20' },
  { name: 'Repair', emoji: '🔧', color: 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20' },
  { name: 'Gardening', emoji: '🌱', color: 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/20' },
  { name: 'Childcare', emoji: '👶', color: 'bg-pink-500/10 text-pink-700 hover:bg-pink-500/20 border-pink-500/20' },
  { name: 'Design', emoji: '🎯', color: 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-purple-500/20' },
  { name: 'Fitness', emoji: '💪', color: 'bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 border-teal-500/20' },
];

export default function BrowseJobsPage() {
  const [searchTitle, setSearchTitle] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchState, setSearchState] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Fetch available states for dropdown
  const { data: statesData } = useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const res = await analyticsApi.getStates();
      return res.states as string[];
    },
  });
  const states = statesData || [];

  const [activeFilters, setActiveFilters] = useState<{
    title?: string;
    area?: string;
    category?: string;
    state?: string;
  }>({});

  // Read state from URL on mount (from analytics page links)
  useEffect(() => {
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      const params = new URLSearchParams(hash.slice(qIdx + 1));
      const stateParam = params.get('state');
      if (stateParam) {
        setSearchState(stateParam);
        setActiveFilters(f => ({ ...f, state: stateParam }));
      }
    }
  }, []);

  const { data: jobs, isLoading, isError, error } = useJobSearch(activeFilters);

  const handleSearch = () => {
    setActiveFilters({
      title: searchTitle.trim() || undefined,
      area: searchArea.trim() || undefined,
      category: searchCategory.trim() || undefined,
      state: searchState.trim() || undefined,
    });
  };

  const handleClear = () => {
    setSearchTitle('');
    setSearchArea('');
    setSearchCategory('');
    setSearchState('');
    setActiveFilters({});
    // Clean URL params
    const hash = window.location.hash;
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      window.location.hash = hash.slice(0, qIdx);
    }
  };

  const hasActiveFilters = activeFilters.title || activeFilters.area || activeFilters.category || activeFilters.state;

  return (
    <div className="animate-fade-in">
      {/* Volunteer Reminder Banner */}
      <VolunteerReminderBanner onApplyNow={() => { window.location.hash = buildVolunteerChoiceRoute(); }} />

      {/* Hero Banner */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                Discover Opportunities
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Browse <span className="gradient-text">Jobs</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Find local opportunities that match your skills and location
              </p>
              {/* Mini image strip */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {['https://i.pravatar.cc/40?img=11','https://i.pravatar.cc/40?img=5','https://i.pravatar.cc/40?img=12','https://i.pravatar.cc/40?img=33'].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">500+</span> workers already hired</p>
              </div>
            </div>
            {/* Stats cards */}
            <div className="flex gap-4 animate-fade-in-up stagger-1">
              <div className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur border px-4 py-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{jobs?.length || '18'}+</p>
                  <p className="text-xs text-muted-foreground">Available Jobs</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur border px-4 py-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">10+</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Popular Categories */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Popular Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSearchCategory(cat.name);
                  setActiveFilters(f => ({ ...f, category: cat.name }));
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                  activeFilters.category === cat.name
                    ? cat.color + ' ring-2 ring-offset-1 ring-primary/30'
                    : 'bg-card hover:bg-muted border-border'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
            {activeFilters.category && (
              <button
                onClick={() => {
                  setSearchCategory('');
                  setActiveFilters(f => ({ ...f, category: undefined }));
                }}
                className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 text-xs font-medium hover:bg-destructive/20 transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>
        {/* Search Section */}
        <div className="mb-8 rounded-2xl border bg-card p-6 shadow-sm animate-fade-in-up stagger-1">
          {/* Main search bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search jobs by title..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-11"
              />
            </div>
            <Button onClick={handleSearch} className="h-11 px-6 gap-2 shadow-md hover:shadow-lg transition-shadow">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`h-11 gap-2 ${showFilters ? 'bg-primary/5 border-primary/30' : ''}`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid gap-4 md:grid-cols-3 animate-slide-down">
              <div className="space-y-2">
                <Label htmlFor="search-area" className="flex items-center gap-1.5 text-xs font-medium">
                  <MapPin className="h-3 w-3" /> Area / Location
                </Label>
                <Input
                  id="search-area"
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                  placeholder="e.g., Koramangala, Andheri..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-category" className="flex items-center gap-1.5 text-xs font-medium">
                  <Briefcase className="h-3 w-3" /> Category
                </Label>
                <Input
                  id="search-category"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="e.g., Cleaning, Delivery..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-state" className="flex items-center gap-1.5 text-xs font-medium">
                  <Globe className="h-3 w-3" /> State
                </Label>
                <select
                  id="search-state"
                  value={searchState}
                  onChange={(e) => {
                    setSearchState(e.target.value);
                    setActiveFilters(f => ({ ...f, state: e.target.value || undefined }));
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">All States</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active filters chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {activeFilters.title && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  "{activeFilters.title}"
                  <button title="Remove title filter" onClick={() => { setSearchTitle(''); setActiveFilters(f => ({...f, title: undefined})); }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeFilters.area && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  <MapPin className="h-3 w-3" /> {activeFilters.area}
                  <button title="Remove area filter" onClick={() => { setSearchArea(''); setActiveFilters(f => ({...f, area: undefined})); }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeFilters.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <Briefcase className="h-3 w-3" /> {activeFilters.category}
                  <button title="Remove category filter" onClick={() => { setSearchCategory(''); setActiveFilters(f => ({...f, category: undefined})); }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeFilters.state && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-700">
                  <Globe className="h-3 w-3" /> {activeFilters.state}
                  <button title="Remove state filter" onClick={() => { setSearchState(''); setActiveFilters(f => ({...f, state: undefined})); }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button onClick={handleClear} className="text-xs text-destructive hover:underline ml-2">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            {jobs && jobs.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''}
              </p>
            )}
            {/* View mode toggle */}
            <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                Map
              </button>
            </div>
          </div>

          {/* Map View */}
          {viewMode === 'map' && jobs && jobs.length > 0 && (
            <div className="mb-6 animate-fade-in-up">
              <JobsMap jobs={jobs} height="500px" />
            </div>
          )}

          {/* Grid View */}
          <QueryState
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={!jobs || jobs.length === 0}
            emptyMessage="No jobs found. Try adjusting your search filters."
          >
            {viewMode === 'grid' ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {jobs?.map((job, idx) => (
                  <div key={job._id || job.id || idx} className={`animate-fade-in-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {jobs?.map((job, idx) => (
                  <div key={job._id || job.id || idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            )}
          </QueryState>
        </div>
      </div>
    </div>
  );
}

