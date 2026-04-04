import { useEffect, useState, useRef } from 'react';
import { buildSignInRoute, buildSignUpRoute } from '../router/routes';
import { Button } from '../components/ui/button';

/* ---------- animated counter hook ---------- */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ---------- fade-in-on-scroll wrapper ---------- */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ============================================================ */
export default function LandingPage() {
  /* ---- parallax scroll offset ---- */
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---- stats counters ---- */
  const jobsCounter = useCountUp(31, 1800);
  const statesCounter = useCountUp(9, 1600);
  const categoriesCounter = useCountUp(10, 1400);
  const usersCounter = useCountUp(500, 2000);

  /* ---- data ---- */
  const categories = [
    { emoji: '🏠', name: 'Home Repairs', desc: 'Plumbing, electrical, painting & more' },
    { emoji: '🧹', name: 'Cleaning', desc: 'Deep cleaning, laundry & housekeeping' },
    { emoji: '📦', name: 'Delivery', desc: 'Last-mile & local courier services' },
    { emoji: '👩‍🏫', name: 'Tutoring', desc: 'Academic coaching & skill classes' },
    { emoji: '🍳', name: 'Cooking', desc: 'Home cooks, catering & tiffin service' },
    { emoji: '🛠️', name: 'Carpentry', desc: 'Furniture, fixtures & woodwork' },
    { emoji: '💇', name: 'Beauty', desc: 'Salon, grooming & spa at home' },
    { emoji: '🌱', name: 'Gardening', desc: 'Landscaping & plant care' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up for free and set up your worker or provider profile in under 2 minutes.', icon: '👤' },
    { num: '02', title: 'Browse or Post Jobs', desc: 'Find local opportunities or post jobs to hire skilled workers nearby.', icon: '📋' },
    { num: '03', title: 'Apply & Connect', desc: 'Apply with one click and connect directly with employers in your neighbourhood.', icon: '🤝' },
    { num: '04', title: 'Get Hired', desc: 'Get selected, start working, and grow your local reputation.', icon: '🎉' },
  ];

  const testimonials = [
    {
      name: 'Ravi Kumar',
      role: 'Electrician – Delhi',
      avatar: 'https://i.pravatar.cc/80?img=11',
      text: 'Towntask helped me find consistent jobs in my neighbourhood. My income doubled in just 3 months!',
    },
    {
      name: 'Priya Sharma',
      role: 'Home Owner – Mumbai',
      avatar: 'https://i.pravatar.cc/80?img=5',
      text: 'I posted a plumbing job and got 4 applications within an hour. Super easy to find trustworthy workers.',
    },
    {
      name: 'Amit Patel',
      role: 'Tutor – Ahmedabad',
      avatar: 'https://i.pravatar.cc/80?img=12',
      text: 'The state-wise analytics let me know where demand is growing. I relocated and tripled my students!',
    },
  ];

  const states = [
    'Delhi', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal', 'Tamil Nadu',
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden scroll-smooth">

      {/* ======================== NAVBAR ======================== */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <span className="text-xl font-extrabold tracking-tight gradient-text">Towntask</span>
          <div className="flex items-center gap-3">
            <a href={buildSignInRoute()} className="text-sm font-medium text-foreground hover:text-primary transition-colors">Sign In</a>
            <Button size="sm" onClick={() => { window.location.hash = buildSignUpRoute(); }}>Sign Up Free</Button>
          </div>
        </div>
      </nav>

      {/* ======================== HERO ======================== */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-4">
        {/* BG blobs */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="pointer-events-none absolute top-10 -left-20 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-[120px]"
             style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
        <div className="pointer-events-none absolute bottom-10 -right-20 h-[34rem] w-[34rem] rounded-full bg-accent/10 blur-[120px]"
             style={{ transform: `translateY(${scrollY * -0.1}px)` }} />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* left */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-5 animate-fade-in-up">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Now Live — Find Jobs Near You
                </span>

                <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                  Find <span className="gradient-text">Local Work</span> in Your Neighborhood
                </h1>

                <p className="mx-auto max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
                  India's growing platform for hyper-local jobs. Connect with providers and workers
                  in your area — browse, apply, and start earning today.
                </p>
              </div>

              <div className="animate-fade-in-up stagger-2 flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                <Button size="lg" className="px-8 shadow-lg" onClick={() => { window.location.hash = buildSignUpRoute(); }}>Get Started Free</Button>
                <Button variant="outline" size="lg" onClick={() => { window.location.hash = buildSignInRoute(); }}>Sign In</Button>
                <a href="#how-it-works" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  See how it works &darr;
                </a>
              </div>

              {/* trust signals */}
              <div className="flex flex-wrap gap-5 justify-center lg:justify-start text-sm text-muted-foreground animate-fade-in-up stagger-3">
                {['100% Free', 'Location-based', '9 States', '10+ Categories'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* right — hero image + floating cards */}
            <div className="hidden lg:block animate-fade-in-up stagger-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-40" />
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=500&fit=crop&q=80"
                  alt="People working together"
                  className="relative w-full rounded-3xl object-cover shadow-2xl aspect-[4/3]"
                />
                {/* floating cards */}
                <div className="absolute -bottom-6 -left-6 glass rounded-xl p-4 shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-lg">📍</div>
                    <div>
                      <div className="text-sm font-semibold">Local Jobs</div>
                      <div className="text-xs text-muted-foreground">In your neighbourhood</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-5 -right-5 glass rounded-xl p-4 shadow-xl animate-float" style={{ animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg">👷</div>
                    <div>
                      <div className="text-sm font-semibold">500+</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/40 flex items-start justify-center pt-1.5">
            <div className="h-2 w-1 rounded-full bg-muted-foreground/60 animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ======================== STATS BAR ======================== */}
      <section className="relative border-y bg-muted/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-14 sm:grid-cols-4">
          {[
            { ref: jobsCounter.ref, value: jobsCounter.count, suffix: '+', label: 'Jobs Available' },
            { ref: statesCounter.ref, value: statesCounter.count, suffix: '', label: 'States Covered' },
            { ref: categoriesCounter.ref, value: categoriesCounter.count, suffix: '+', label: 'Job Categories' },
            { ref: usersCounter.ref, value: usersCounter.count, suffix: '+', label: 'Active Users' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 120} className="text-center">
              <div ref={s.ref} className="text-4xl font-extrabold gradient-text sm:text-5xl">
                {s.value}{s.suffix}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-24">
        <Reveal className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">How It Works</span>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Get Started in 4 Easy Steps</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Whether you're looking for work or hiring — our platform makes it simple.</p>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 140}>
              <div className="group relative rounded-2xl border bg-card p-6 card-hover text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-transform group-hover:scale-110">
                  {s.icon}
                </div>
                <span className="absolute top-4 right-4 text-xs font-bold text-primary/40">{s.num}</span>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======================== CATEGORIES ======================== */}
      <section className="bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Explore</span>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Popular Job Categories</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">From home repairs to tutoring — discover opportunities across many fields.</p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group rounded-2xl border bg-card p-5 card-hover flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl transition-transform group-hover:scale-110">
                    {c.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-snug">{c.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== FEATURE SHOWCASE ======================== */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=450&fit=crop&q=80"
              alt="Analytics dashboard"
              className="w-full rounded-2xl shadow-xl object-cover aspect-[4/3]"
            />
          </Reveal>
          <Reveal delay={200} className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Smart Analytics</span>
            <h2 className="text-3xl font-extrabold sm:text-4xl leading-tight">
              State-wise Job <span className="gradient-text">Insights</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our built-in analytics dashboard shows you which states have the most opportunities, fastest-growing
              markets, and category breakdowns — so you can make smarter career decisions.
            </p>
            <ul className="space-y-3">
              {['Interactive bar charts & rankings', 'Category-wise distribution', 'Growing markets detection', 'Detailed state breakdown table'].map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent text-xs">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-28 grid items-center gap-14 lg:grid-cols-2">
          <Reveal delay={200} className="space-y-6 order-2 lg:order-1">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Map View</span>
            <h2 className="text-3xl font-extrabold sm:text-4xl leading-tight">
              Find Jobs on a <span className="gradient-text">Live Map</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Switch between grid and map view to discover jobs geographically. Each pin on our interactive
              Leaflet map shows job details so you can find work closest to you.
            </p>
            <ul className="space-y-3">
              {['Interactive Leaflet map', 'Grid ↔ Map toggle', 'Emoji category markers', 'Auto-fit to visible jobs'].map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent text-xs">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=450&fit=crop&q=80"
              alt="Map view of jobs"
              className="w-full rounded-2xl shadow-xl object-cover aspect-[4/3]"
            />
          </Reveal>
        </div>
      </section>

      {/* ======================== STATES COVERAGE ======================== */}
      <section className="bg-muted/20 py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">All Across India</span>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Covering 9 States & Growing</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              We're expanding rapidly. Here are the states currently served with active job listings.
            </p>
          </Reveal>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {states.map((st, i) => (
              <Reveal key={st} delay={i * 80}>
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-5 py-2.5 text-sm font-medium shadow-sm card-hover cursor-default">
                  📍 {st}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== TESTIMONIALS ======================== */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</span>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Loved by Workers & Providers</h2>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="rounded-2xl border bg-card p-6 card-hover space-y-4 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20" />
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
                <div className="flex gap-0.5 text-amber-400 text-sm">{'★★★★★'}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======================== FEATURES GRID ======================== */}
      <section className="bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Features</span>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Everything You Need</h2>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Search by title, category, area, or state with an instant filter UI.' },
              { icon: '🗺️', title: 'Interactive Maps', desc: 'Visualize all jobs on an interactive Leaflet map with emoji markers.' },
              { icon: '📊', title: 'State Analytics', desc: 'Bar charts, rankings, and tables to analyse where the demand is.' },
              { icon: '👤', title: 'Rich Profiles', desc: 'Create profiles as worker or provider and showcase your skills.' },
              { icon: '📱', title: 'Fully Responsive', desc: 'Works seamlessly on phones, tablets, and desktops.' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Built with React + Vite for instant page loads and smooth UX.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group rounded-2xl border bg-card p-6 card-hover h-full">
                  <div className="mb-3 text-3xl transition-transform group-hover:scale-110">{f.icon}</div>
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== CTA ======================== */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 hero-gradient opacity-60" />
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

        <Reveal className="relative z-10 mx-auto max-w-2xl px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-5xl leading-tight">
            Ready to Find Your Next <span className="gradient-text">Local Opportunity</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join hundreds of workers and providers across India. It's completely free to get started.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 justify-center">
            <Button size="lg" className="px-8 shadow-lg" onClick={() => { window.location.hash = buildSignUpRoute(); }}>Sign Up Free</Button>
            <Button variant="outline" size="lg" onClick={() => { window.location.hash = buildSignInRoute(); }}>Sign In</Button>
          </div>
        </Reveal>
      </section>

      {/* ======================== FOOTER ======================== */}
      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <span className="text-lg font-extrabold gradient-text">Towntask</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                India's growing platform for hyper-local jobs. Connecting workers and providers in your neighbourhood.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Browse Jobs</li>
                <li>Post a Job</li>
                <li>Analytics Dashboard</li>
                <li>Map View</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Home Repairs</li>
                <li>Cleaning</li>
                <li>Delivery</li>
                <li>Tutoring</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">States</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Delhi</li>
                <li>Maharashtra</li>
                <li>Karnataka</li>
                <li>& 6 more…</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Towntask. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer">Privacy</span>
              <span className="hover:text-foreground cursor-pointer">Terms</span>
              <span className="hover:text-foreground cursor-pointer">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
