import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Briefcase, Clock, ArrowUpRight, IndianRupee, User } from 'lucide-react';
import type { Job } from '../../backend';
import { buildJobDetailRoute } from '../../router/routes';

// Category to emoji mapping for visual interest
const categoryIcons: Record<string, string> = {
  'cleaning': '🧹',
  'delivery': '🚚',
  'tutoring': '📚',
  'cooking': '🍳',
  'gardening': '🌱',
  'repair': '🔧',
  'painting': '🎨',
  'moving': '📦',
  'childcare': '👶',
  'tech': '💻',
  'writing': '✍️',
  'design': '🎯',
  'photography': '📸',
  'fitness': '💪',
  'music': '🎵',
};

const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon;
  }
  return '💼';
};

// Category-based gradient backgrounds
const getCategoryGradient = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes('tech') || lower.includes('design')) return 'from-blue-500/10 to-purple-500/10';
  if (lower.includes('clean') || lower.includes('garden')) return 'from-green-500/10 to-emerald-500/10';
  if (lower.includes('deliver') || lower.includes('moving')) return 'from-orange-500/10 to-amber-500/10';
  if (lower.includes('tutor') || lower.includes('writing')) return 'from-indigo-500/10 to-blue-500/10';
  if (lower.includes('cook') || lower.includes('food')) return 'from-red-500/10 to-orange-500/10';
  return 'from-primary/10 to-accent/5';
};

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const isOpen = job.status === 'open';
  const icon = getCategoryIcon(job.category);
  const gradient = getCategoryGradient(job.category);

  return (
    <a href={buildJobDetailRoute(job._id || job.id || '')} className="block group">
      <Card className="card-hover overflow-hidden border-transparent shadow-sm hover:shadow-xl hover:border-primary/20">
        {/* Gradient top bar */}
        <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xl`}>
                {icon}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors duration-200">
                  {job.title}
                </CardTitle>
                <Badge 
                  variant={isOpen ? 'default' : 'secondary'} 
                  className={`text-xs ${isOpen ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20' : ''}`}
                >
                  <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  {isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
          {job.salary && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
              <IndianRupee className="h-3 w-3" />
              {job.salary}
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1 border-t">
            <div className="flex items-center gap-1.5 pt-2">
              <MapPin className="h-3.5 w-3.5 text-primary/60" />
              <span>{job.area}</span>
            </div>
            {job.state && (
              <div className="flex items-center gap-1.5 pt-2">
                <span className="text-xs">📍</span>
                <span className="font-medium text-purple-600">{job.state}</span>
              </div>
            )}
            {job.postedBy && (
              <div className="flex items-center gap-1.5 pt-2">
                <User className="h-3.5 w-3.5 text-primary/60" />
                <span className="font-medium">by {typeof job.postedBy === 'string' ? job.postedBy.substring(0, 12) + '...' : 'Provider'}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 pt-2">
              <Briefcase className="h-3.5 w-3.5 text-primary/60" />
              <span>{job.category}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

