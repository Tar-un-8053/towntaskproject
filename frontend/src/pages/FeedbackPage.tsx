import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Loader2, Star, Send, MessageSquare, ThumbsUp, Bug, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'general', label: 'General', icon: MessageSquare, color: 'text-blue-600' },
  { value: 'appreciation', label: 'Appreciation', icon: ThumbsUp, color: 'text-green-600' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-600' },
  { value: 'complaint', label: 'Complaint', icon: AlertCircle, color: 'text-orange-600' },
];

const TYPES = [
  { value: 'app', label: 'App Feedback' },
  { value: 'job', label: 'Job Review' },
  { value: 'provider', label: 'Provider Review' },
  { value: 'worker', label: 'Worker Review' },
  { value: 'suggestion', label: 'Suggestion' },
];

function StarRating({ rating, onChange, size = 'lg' }: { rating: number; onChange: (r: number) => void; size?: 'sm' | 'lg' }) {
  const starSize = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`transition-all duration-200 hover:scale-110 ${
            star <= rating ? 'text-amber-400 drop-shadow-sm' : 'text-muted-foreground/30 hover:text-amber-300'
          }`}
        >
          <Star className={`${starSize} ${star <= rating ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const starSize = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [type, setType] = useState('app');
  const [submitted, setSubmitted] = useState(false);

  const { data: myFeedbacks, isLoading } = useQuery({
    queryKey: ['my-feedbacks'],
    queryFn: feedbackApi.getMyFeedbacks,
  });

  const submitMutation = useMutation({
    mutationFn: feedbackApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      setRating(0);
      setTitle('');
      setMessage('');
      setCategory('general');
      setType('app');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const handleSubmit = () => {
    if (rating === 0 || !message.trim()) return;
    submitMutation.mutate({ rating, title: title.trim(), message: message.trim(), category, type });
  };

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="container py-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2 animate-fade-in-up">
              <h1 className="text-4xl font-extrabold tracking-tight">
                <span className="gradient-text">Feedback</span> & Reviews
              </h1>
              <p className="text-muted-foreground">Share your experience and help us improve</p>
            </div>
            <div className="hidden md:block animate-fade-in-up stagger-1">
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-primary/20 blur-lg opacity-60" />
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=240&h=160&fit=crop&q=80"
                  alt="Feedback"
                  className="relative w-48 h-32 rounded-2xl object-cover shadow-lg border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Submit Feedback Form */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Submit Feedback
                </CardTitle>
                <CardDescription>Rate your experience and leave a message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {submitted && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Feedback submitted successfully!</p>
                  </div>
                )}

                {/* Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feedback Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setType(t.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          type === t.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'border-border hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                          category === cat.value
                            ? 'bg-primary/5 border-primary/30 shadow-sm'
                            : 'border-border hover:border-primary/20 hover:bg-muted/50'
                        }`}
                      >
                        <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating *</Label>
                  <div className="flex items-center gap-3">
                    <StarRating rating={rating} onChange={setRating} />
                    {rating > 0 && (
                      <span className="text-sm font-medium text-amber-600">{rating}/5</span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title (optional)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your feedback"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message *</Label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more about your experience..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={rating === 0 || !message.trim() || submitMutation.isPending}
                  className="w-full gap-2 shadow-md"
                >
                  {submitMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Submit Feedback</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* My Feedbacks */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              My Feedback History
              {myFeedbacks?.length > 0 && (
                <Badge variant="secondary" className="ml-2">{myFeedbacks.length}</Badge>
              )}
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !myFeedbacks || myFeedbacks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No feedback submitted yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Share your first review above!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myFeedbacks.map((fb: any) => {
                  const cat = CATEGORIES.find((c) => c.value === fb.category);
                  return (
                    <Card key={fb._id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-1 bg-gradient-to-r from-amber-400/30 to-primary/20" />
                      <CardContent className="py-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            {fb.title && <p className="font-semibold text-sm">{fb.title}</p>}
                            <StarDisplay rating={fb.rating} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{fb.type}</Badge>
                            {cat && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <cat.icon className={`h-3 w-3 ${cat.color}`} />
                                {cat.label}
                              </Badge>
                            )}
                            <Badge
                              variant={fb.status === 'resolved' ? 'default' : fb.status === 'reviewed' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {fb.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{fb.message}</p>
                        {fb.adminReply && (
                          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mt-2">
                            <p className="text-xs font-semibold text-primary mb-1">Admin Reply:</p>
                            <p className="text-sm text-muted-foreground">{fb.adminReply}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground/60">
                          {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
