import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';
import { buildBrowseJobsRoute } from '../router/routes';
import { 
  BarChart3, MapPin, Briefcase, TrendingUp, ArrowRight, 
  Building2, PieChart, Activity, ChevronDown, ChevronUp, Sparkles, IndianRupee
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

// State colors for visual distinction
const stateColors: Record<string, string> = {
  'Delhi': '#7c3aed',
  'Karnataka': '#0891b2',
  'Maharashtra': '#dc2626',
  'Uttar Pradesh': '#ea580c',
  'Telangana': '#059669',
  'Rajasthan': '#d97706',
  'Gujarat': '#2563eb',
  'West Bengal': '#7c2d12',
  'Tamil Nadu': '#be185d',
};

const stateEmojis: Record<string, string> = {
  'Delhi': '🏛️',
  'Karnataka': '🌴',
  'Maharashtra': '🎬',
  'Uttar Pradesh': '🕌',
  'Telangana': '💎',
  'Rajasthan': '🏰',
  'Gujarat': '🦁',
  'West Bengal': '🌸',
  'Tamil Nadu': '🛕',
};

const categoryEmojis: Record<string, string> = {
  'Cleaning': '🧹', 'Delivery': '🚚', 'Tutoring': '📚', 'Cooking': '🍳',
  'Gardening': '🌱', 'Repair': '🔧', 'Painting': '🎨', 'Moving': '📦',
  'Childcare': '👶', 'Tech': '💻', 'Writing': '✍️', 'Design': '🎯',
  'Photography': '📸', 'Fitness': '💪', 'Music': '🎵',
};

export default function AnalyticsPage() {
  const { data: stateData, isLoading: stateLoading } = useQuery({
    queryKey: ['analytics', 'state-wise'],
    queryFn: async () => {
      const res = await analyticsApi.getStateWise();
      return res;
    },
  });

  const { data: categoryData, isLoading: catLoading } = useQuery({
    queryKey: ['analytics', 'category-wise'],
    queryFn: async () => {
      const res = await analyticsApi.getCategoryWise();
      return res;
    },
  });

  const [expandedState, setExpandedState] = useState<string | null>(null);

  const analytics = stateData?.analytics || [];
  const totalJobs = stateData?.totalJobs || 0;
  const totalStates = stateData?.totalStates || 0;
  const catAnalytics = categoryData?.analytics || [];

  // Find max jobs for bar chart scale
  const maxJobs = useMemo(() => Math.max(...analytics.map((s: any) => s.totalJobs), 1), [analytics]);

  // Top state
  const topState = analytics[0];

  const isLoading = stateLoading || catLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg animate-pulse-glow">
            <BarChart3 className="h-7 w-7 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-3xl space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <BarChart3 className="h-3 w-3" />
                Job Market Analytics
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                State-Wise <span className="gradient-text">Job Analysis</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover which states have the most job opportunities and analyze the job market across India
              </p>
            </div>
            <div className="hidden md:block animate-fade-in-up stagger-1 shrink-0">
              <div className="relative">
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-60" />
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=280&h=200&fit=crop&q=80"
                  alt="Analytics dashboard"
                  className="relative w-56 h-40 rounded-2xl object-cover shadow-lg border"
                />
                <div className="absolute -bottom-3 -left-3 flex items-center gap-2 rounded-xl bg-card border shadow-lg px-3 py-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold">Growing Markets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 animate-fade-in-up">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{totalJobs}</p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{totalStates}</p>
                  <p className="text-xs text-muted-foreground">States Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                  <PieChart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{catAnalytics.length}</p>
                  <p className="text-xs text-muted-foreground">Job Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{topState?.state || '—'}</p>
                  <p className="text-xs text-muted-foreground">Top State ({topState?.totalJobs || 0} jobs)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Chart + State Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bar Chart */}
          <Card className="lg:col-span-2 animate-fade-in-up stagger-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Jobs by State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.map((state: any, idx: number) => {
                  const pct = Math.round((state.totalJobs / maxJobs) * 100);
                  const color = stateColors[state.state] || '#6366f1';
                  const emoji = stateEmojis[state.state] || '📍';
                  return (
                    <div 
                      key={state.state} 
                      className="group cursor-pointer"
                      onClick={() => setExpandedState(expandedState === state.state ? null : state.state)}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg">{emoji}</span>
                        <span className="text-sm font-medium w-32 truncate">{state.state}</span>
                        <div className="flex-1 h-8 bg-muted/50 rounded-lg overflow-hidden relative">
                          <div 
                            className="h-full rounded-lg transition-all duration-700 ease-out flex items-center"
                            style={{ 
                              width: `${pct}%`, 
                              backgroundColor: color,
                              animationDelay: `${idx * 0.1}s`,
                              minWidth: '40px',
                            }}
                          >
                            <span className="text-white text-xs font-bold px-2">{state.totalJobs}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                        {expandedState === state.state ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Expanded details */}
                      {expandedState === state.state && (
                        <div className="ml-9 mt-2 mb-3 p-3 rounded-lg border bg-card/50 animate-slide-down">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {state.categories.map((cat: any) => (
                              <Badge key={cat.category} variant="secondary" className="text-xs gap-1">
                                <span>{categoryEmojis[cat.category] || '📌'}</span>
                                {cat.category}: {cat.count}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.hash = `${buildBrowseJobsRoute()}?state=${encodeURIComponent(state.state)}`;
                            }}
                          >
                            View {state.state} Jobs <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* State Ranking Cards */}
          <div className="space-y-4 animate-fade-in-up stagger-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  State Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.slice(0, 5).map((state: any, idx: number) => {
                  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                  const emoji = stateEmojis[state.state] || '📍';
                  return (
                    <div key={state.state} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-lg">{medals[idx]}</span>
                      <span className="text-lg">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{state.state}</p>
                        <p className="text-xs text-muted-foreground">{state.totalJobs} jobs • Top: {state.topCategory}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Low opportunity states */}
            {analytics.length > 5 && (
              <Card className="border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Growing Markets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analytics.slice(-3).reverse().map((state: any) => {
                    const emoji = stateEmojis[state.state] || '📍';
                    return (
                      <div key={state.state} className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/5">
                        <span className="text-lg">{emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{state.state}</p>
                          <p className="text-xs text-muted-foreground">{state.totalJobs} jobs — Growth potential</p>
                        </div>
                        <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-600">
                          Emerging
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Category Distribution Section */}
        <Card className="animate-fade-in-up stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Category Distribution Across States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catAnalytics.map((cat: any) => {
                const emoji = categoryEmojis[cat.category] || '📌';
                const maxCat = catAnalytics[0]?.totalJobs || 1;
                const pct = Math.round((cat.totalJobs / maxCat) * 100);
                return (
                  <div key={cat.category} className="flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm transition-shadow">
                    <span className="text-2xl">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{cat.category}</p>
                        <Badge variant="secondary" className="text-xs">{cat.totalJobs}</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Available in {cat.statesCount} state{cat.statesCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* State-wise Detailed Table */}
        <Card className="animate-fade-in-up stagger-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Detailed State-wise Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">State</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Total Jobs</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground">Open Jobs</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Top Category</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground">Categories</th>
                    <th className="text-right py-3 px-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((state: any, idx: number) => {
                    const emoji = stateEmojis[state.state] || '📍';
                    return (
                      <tr key={state.state} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-medium">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span>{emoji}</span>
                            <span className="font-medium">{state.state}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{state.totalJobs}</Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant="outline" className="border-green-500/30 text-green-600">{state.openJobs}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-xs">
                            {categoryEmojis[state.topCategory] || '📌'} {state.topCategory}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {state.categories.slice(0, 3).map((c: any) => (
                              <Badge key={c.category} variant="secondary" className="text-xs">
                                {c.category}
                              </Badge>
                            ))}
                            {state.categories.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{state.categories.length - 3}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="gap-1 text-xs"
                            onClick={() => {
                              window.location.hash = `${buildBrowseJobsRoute()}?state=${encodeURIComponent(state.state)}`;
                            }}
                          >
                            View <ArrowRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
