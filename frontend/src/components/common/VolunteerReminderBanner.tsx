import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Shield, X, ArrowRight, Bell } from 'lucide-react';
import { volunteerApi } from '../../services/api';

interface VolunteerReminderBannerProps {
  onApplyNow: () => void;
}

export default function VolunteerReminderBanner({ onApplyNow }: VolunteerReminderBannerProps) {
  const [visible, setVisible] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    checkReminder();
  }, []);

  const checkReminder = async () => {
    try {
      const res = await volunteerApi.checkReminder();
      if (res.showReminder) {
        setVisible(true);
        setReminderCount(res.reminderCount || 0);
      }
    } catch {
      // Silent fail
    }
  };

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      await volunteerApi.dismissReminder();
    } catch {
      // Non-blocking
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 mb-6 animate-fade-in-up shadow-sm">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        disabled={dismissing}
        className="absolute top-3 right-3 text-orange-400 hover:text-orange-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-md">
          <Shield className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-orange-800">
              Be a Hero in Your Community
            </h3>
          </div>
          <p className="text-xs text-orange-700 leading-relaxed">
            Become a Verified Emergency Volunteer Today. Help nearby people during emergencies,
            boost your trust score, and get a verified badge on your profile.
          </p>

          <div className="flex items-center gap-3 mt-3">
            <Button
              onClick={onApplyNow}
              size="sm"
              className="h-8 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs font-semibold"
            >
              Apply Now <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
            <button
              onClick={handleDismiss}
              disabled={dismissing}
              className="text-xs text-orange-500 hover:text-orange-700 font-medium"
            >
              Remind me later
            </button>
          </div>

          {reminderCount > 0 && (
            <p className="text-[10px] text-orange-400 mt-2">
              Reminder {reminderCount + 1} of 3
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
