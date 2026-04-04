import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { AlertTriangle, Loader2, MapPin, PhoneCall, ShieldAlert, HeartPulse, Siren } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { emergencyApi } from '../../services/api';
import { toast } from 'react-toastify';

type EmergencyCategoryId = 'crime' | 'medical' | 'women_safety' | 'other';

interface EmergencyCategory {
  id: EmergencyCategoryId;
  label: string;
  helpline: string;
  icon: ComponentType<{ className?: string }>;
}

const CATEGORIES: EmergencyCategory[] = [
  { id: 'crime', label: 'Crime', helpline: '100', icon: ShieldAlert },
  { id: 'medical', label: 'Medical', helpline: '102', icon: HeartPulse },
  { id: 'women_safety', label: 'Women Safety', helpline: '1091', icon: Siren },
  { id: 'other', label: 'Other', helpline: '112', icon: AlertTriangle },
];

export default function EmergencyFab() {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otherDescription, setOtherDescription] = useState('');
  const [activeCategory, setActiveCategory] = useState<EmergencyCategory | null>(null);

  const locationReady = useMemo(() => !!location && !locationLoading, [location, locationLoading]);

  const fetchLocation = () => {
    setLocationLoading(true);
    setLocationError('');

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported on this device.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setLocation(null);
        setLocationError('Please enable location access to log emergency records.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (categoryOpen) {
      fetchLocation();
    }
  }, [categoryOpen]);

  const openCallPrompt = (category: EmergencyCategory) => {
    setActiveCategory(category);
    setCallOpen(true);
  };

  const logEmergency = async (category: EmergencyCategory, description?: string) => {
    if (!location) {
      toast.error('Location is required to send emergency alert.');
      return false;
    }

    try {
      await emergencyApi.createHighEmergency({
        category: category.id,
        description,
        lat: location.lat,
        lng: location.lng,
        disclaimerAccepted: true,
      });
      toast.success('Emergency sent successfully. Help is being alerted.');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Emergency logging failed. Call helpline immediately.');
      return false;
    }
  };

  const handleCategoryClick = async (category: EmergencyCategory) => {
    if (category.id === 'other') {
      setCategoryOpen(false);
      setOtherOpen(true);
      return;
    }

    setSubmitting(true);
    await logEmergency(category);
    setSubmitting(false);
    setCategoryOpen(false);
    openCallPrompt(category);
  };

  const handleOtherSubmit = async () => {
    if (otherDescription.trim().length < 5) {
      toast.error('Please add a short description for Other emergency.');
      return;
    }

    const otherCategory = CATEGORIES.find((category) => category.id === 'other');
    if (!otherCategory) return;

    setSubmitting(true);
    await logEmergency(otherCategory, otherDescription.trim());
    setSubmitting(false);
    setOtherDescription('');
    setOtherOpen(false);
    setCategoryOpen(false);
    openCallPrompt(otherCategory);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setCategoryOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-red-500/30 transition hover:bg-red-700"
        aria-label="Emergency quick action"
      >
        <AlertTriangle className="h-4 w-4 animate-pulse" />
        Emergency
      </button>

      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Emergency Assistance</DialogTitle>
            <DialogDescription>
              Select a category to instantly log your location and proceed to emergency calling.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5" /> Location status
            </div>
            {locationLoading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Getting your current location...
              </div>
            )}
            {!locationLoading && location && (
              <div>
                Location ready: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
            {!locationLoading && !location && <div className="text-red-600">{locationError}</div>}
            {!locationLoading && !location && (
              <button
                type="button"
                onClick={fetchLocation}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Retry location access
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  type="button"
                  variant="outline"
                  disabled={!locationReady || submitting}
                  onClick={() => handleCategoryClick(category)}
                  className="h-16 justify-start gap-2"
                >
                  <Icon className="h-4 w-4" /> {category.label}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={otherOpen} onOpenChange={setOtherOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Other Emergency</DialogTitle>
            <DialogDescription>Share a short description before we show the call prompt.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="otherEmergencyDescription">Description</Label>
            <Textarea
              id="otherEmergencyDescription"
              value={otherDescription}
              onChange={(event) => setOtherDescription(event.target.value)}
              placeholder="Briefly describe your emergency"
              rows={4}
              maxLength={300}
            />
            <p className="text-right text-xs text-muted-foreground">{otherDescription.length}/300</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOtherOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={submitting} onClick={handleOtherSubmit}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={callOpen} onOpenChange={setCallOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Call Now</DialogTitle>
            <DialogDescription>
              {activeCategory ? `${activeCategory.label} helpline is ready.` : 'Emergency helpline is ready.'}
            </DialogDescription>
          </DialogHeader>

          {activeCategory && (
            <div className="rounded-lg border bg-muted/40 p-4 text-center">
              <p className="text-xs text-muted-foreground">Helpline</p>
              <p className="text-3xl font-bold tracking-wide">{activeCategory.helpline}</p>
            </div>
          )}

          <DialogFooter>
            <a
              href={`tel:${activeCategory?.helpline || '112'}`}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <PhoneCall className="h-4 w-4" /> Call Now
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
