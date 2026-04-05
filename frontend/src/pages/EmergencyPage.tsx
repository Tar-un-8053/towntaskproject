import { AlertTriangle, PhoneCall, ShieldAlert, HeartPulse, Siren, HelpCircle } from 'lucide-react';

const QUICK_CATEGORIES = [
  { id: 'crime', label: 'Crime', helpline: '100', icon: ShieldAlert, color: 'text-red-600' },
  { id: 'medical', label: 'Medical', helpline: '102', icon: HeartPulse, color: 'text-pink-600' },
  { id: 'women_safety', label: 'Women Safety', helpline: '1091', icon: Siren, color: 'text-orange-600' },
  { id: 'other', label: 'Other', helpline: '112', icon: HelpCircle, color: 'text-slate-600' },
] as const;

export default function EmergencyPage() {
  return (
    <div className="container py-8">
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-red-700">
          <AlertTriangle className="h-6 w-6" /> Towntask Emergency
        </h1>
        <p className="mt-2 text-sm text-red-700/90">
          Use the red floating Emergency button (bottom-right) to choose a category, log live location,
          and open instant call prompt.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {QUICK_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-lg font-semibold">{category.label}</p>
                </div>
                <Icon className={`h-6 w-6 ${category.color}`} />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">Helpline</span>
                <span className="font-semibold tracking-wide">{category.helpline}</span>
              </div>
              <a
                href={`tel:${category.helpline}`}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <PhoneCall className="h-4 w-4" /> Call Now
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
