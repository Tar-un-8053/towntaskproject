import { Button } from '../components/ui/button';
import { Home, SearchX } from 'lucide-react';
import { buildBrowseJobsRoute } from '../router/routes';

export default function NotFoundPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in-up">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150" />
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=300&h=220&fit=crop&q=80"
            alt="Lost"
            className="w-60 h-44 rounded-2xl object-cover shadow-xl opacity-80"
          />
          <div className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card border shadow-lg">
            <SearchX className="h-8 w-8 text-primary/60" />
          </div>
        </div>
      </div>
      <h1 className="text-7xl font-extrabold gradient-text mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
      <Button 
        onClick={() => (window.location.hash = buildBrowseJobsRoute())} 
        className="gap-2 shadow-md hover:shadow-lg transition-shadow"
        size="lg"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
}

