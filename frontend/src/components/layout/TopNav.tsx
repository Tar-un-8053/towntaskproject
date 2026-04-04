import { useEffect, useMemo, useState } from 'react';
import { useGetCallerUserProfile } from '../../hooks/queries/useCallerContext';
import {
  buildBrowseJobsRoute, buildMyProfileRoute, buildProviderJobsRoute,
  buildMyApplicationsRoute, buildAnalyticsRoute, buildSmartSearchRoute,
  buildEmergencyRoute, buildVolunteerRoute, buildFeedbackRoute, buildChatRoute,
} from '../../router/routes';
import LoginButton from '../auth/LoginButton';
import { Briefcase, User, FileText, Search, Menu, X, BarChart3, AlertTriangle, Shield, Radar, MessageCircle, MessageSquare } from 'lucide-react';
import { chatApi } from '../../services/api';
import { getChatSocket } from '../../services/chatSocket';
import { Badge } from '../ui/badge';

export default function TopNav() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isProvider = userProfile?.profileType === 'provider';
  const isWorker = userProfile?.profileType === 'worker';
  const userId = useMemo(
    () => (userProfile as any)?.userId || localStorage.getItem('userId') || '',
    [userProfile]
  );

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    const socket = getChatSocket(userId);

    const syncUnreadCount = async () => {
      try {
        const res = await chatApi.getUnreadCount();
        if (mounted) setUnreadCount(res.count || 0);
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };

    const handleUnreadEvent = (payload: { count?: number }) => {
      if (mounted) {
        setUnreadCount(typeof payload?.count === 'number' ? payload.count : 0);
      }
    };

    syncUnreadCount();
    const intervalId = window.setInterval(syncUnreadCount, 15000);
    socket.on('chat_unread_count', handleUnreadEvent);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      socket.off('chat_unread_count', handleUnreadEvent);
    };
  }, [userId]);

  const navLinks = [
    { href: buildBrowseJobsRoute(), icon: Search, label: 'Browse Jobs', show: true },
    { href: buildSmartSearchRoute(), icon: Radar, label: 'Smart Search', show: true },
    { href: buildAnalyticsRoute(), icon: BarChart3, label: 'Analytics', show: true },
    { href: buildProviderJobsRoute(), icon: Briefcase, label: 'My Jobs', show: isProvider },
    { href: buildMyApplicationsRoute(), icon: FileText, label: 'My Applications', show: isWorker },
    { href: buildVolunteerRoute(), icon: Shield, label: 'Volunteer', show: true },
    { href: buildFeedbackRoute(), icon: MessageSquare, label: 'Feedback', show: true },
    { href: buildMyProfileRoute(), icon: User, label: 'Profile', show: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass animate-slide-down">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <a href={buildBrowseJobsRoute()} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text">Towntask</span>
          </a>
          {!isLoading && userProfile && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.filter(l => l.show).map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/5 ${link.className || 'text-muted-foreground hover:text-foreground'}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && userProfile && (
            <a
              href={buildChatRoute()}
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open messages"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </a>
          )}

          {!isLoading && userProfile && (
            <a
              href={buildEmergencyRoute()}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
            >
              <AlertTriangle className="h-4 w-4 animate-pulse" /> Emergency
            </a>
          )}

          <LoginButton />
          {!isLoading && userProfile && (
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && !isLoading && userProfile && (
        <div className="md:hidden border-t animate-slide-down">
          <nav className="container py-3 flex flex-col gap-1">
            <a
              href={buildChatRoute()}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/5 hover:text-foreground"
            >
              <span className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4" /> Messages
              </span>
              {unreadCount > 0 && <Badge className="text-xs">{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
            </a>
            <a
              href={buildEmergencyRoute()}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white"
            >
              <AlertTriangle className="h-4 w-4 animate-pulse" /> Emergency
            </a>
            {navLinks.filter(l => l.show).map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-primary/5 ${link.className || 'text-muted-foreground hover:text-foreground'}`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

