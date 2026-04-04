import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/queries/useCallerContext';
import { useHashRouter } from './router/useHashRouter';
import { ROUTES, buildBrowseJobsRoute, buildSignInRoute, buildSignUpRoute, buildVolunteerChoiceRoute, buildFullVerificationRoute, buildVolunteerRoute } from './router/routes';
import ProfileSetupDialog from './components/profile/ProfileSetupDialog';
import AppLayout from './components/layout/AppLayout';
import BrowseJobsPage from './pages/BrowseJobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import ProviderJobsPage from './pages/ProviderJobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import SmartSearchPage from './pages/SmartSearchPage';
import EmergencyPage from './pages/EmergencyPage';
import MyEmergenciesPage from './pages/MyEmergenciesPage';
import VolunteerPage from './pages/VolunteerPage';
import FeedbackPage from './pages/FeedbackPage';
import VolunteerChoicePage from './pages/VolunteerChoicePage';
import FullVerificationPage from './pages/FullVerificationPage';
import ChatPage from './pages/ChatPage';
import InstallPWAPrompt from './components/common/InstallPWAPrompt';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, isInitializing, loginWithAuth } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { currentRoute, params } = useHashRouter();

  const isAuthenticated = !!identity;

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center hero-gradient">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg animate-pulse-glow">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Towntask...</p>
        </div>
      </div>
    );
  }

  // Handle auth success callback  
  const handleAuthSuccess = (data: { userId: string; token: string; profile: any; isNewUser?: boolean }) => {
    loginWithAuth(data);
    if (data.isNewUser) {
      // New users go through volunteer choice flow
      window.location.hash = buildVolunteerChoiceRoute();
    } else {
      window.location.hash = buildBrowseJobsRoute();
    }
  };

  // Show Sign In / Sign Up pages if not authenticated and on those routes
  if (!isAuthenticated) {
    if (currentRoute === ROUTES.SIGN_IN) {
      return (
        <SignInPage
          onSuccess={handleAuthSuccess}
          onGoToSignUp={() => { window.location.hash = buildSignUpRoute(); }}
        />
      );
    }
    if (currentRoute === ROUTES.SIGN_UP) {
      return (
        <SignUpPage
          onSuccess={handleAuthSuccess}
          onGoToSignIn={() => { window.location.hash = buildSignInRoute(); }}
        />
      );
    }
    // Default: show landing page
    return <LandingPage />;
  }

  // Show profile setup if authenticated but no profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  // Show loading while profile is being fetched
  if (profileLoading || !isFetched) {
    return (
      <div className="flex h-screen items-center justify-center hero-gradient">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg animate-pulse-glow">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate page based on route
  const renderPage = () => {
    switch (currentRoute) {
      case ROUTES.BROWSE_JOBS:
        return <BrowseJobsPage />;
      case ROUTES.JOB_DETAIL:
        return <JobDetailPage jobId={params.id || ''} />;
      case ROUTES.MY_PROFILE:
        return <ProfilePage />;
      case ROUTES.PUBLIC_PROFILE:
        return <PublicProfilePage principalId={params.id || ''} />;
      case ROUTES.PROVIDER_JOBS:
        return <ProviderJobsPage />;
      case ROUTES.MY_APPLICATIONS:
        return <MyApplicationsPage />;
      case ROUTES.ANALYTICS:
        return <AnalyticsPage />;
      case ROUTES.SMART_SEARCH:
        return <SmartSearchPage />;
      case ROUTES.EMERGENCY:
        return <EmergencyPage />;
      case ROUTES.EMERGENCY_DETAIL:
        return <MyEmergenciesPage />;
      case ROUTES.MY_EMERGENCIES:
        return <MyEmergenciesPage />;
      case ROUTES.VOLUNTEER:
        return <VolunteerPage />;
      case ROUTES.VOLUNTEER_CHOICE:
        return (
          <VolunteerChoicePage
            onYes={() => { window.location.hash = buildFullVerificationRoute(); }}
            onSkip={() => { window.location.hash = buildBrowseJobsRoute(); }}
          />
        );
      case ROUTES.FULL_VERIFICATION:
        return (
          <FullVerificationPage
            onComplete={() => { window.location.hash = buildVolunteerRoute(); }}
            onBack={() => { window.location.hash = buildVolunteerChoiceRoute(); }}
          />
        );
      case ROUTES.FEEDBACK:
        return <FeedbackPage />;
      case ROUTES.CHAT:
        return <ChatPage applicationId={params.id || ''} />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <>
      <AppLayout>{renderPage()}</AppLayout>
      <InstallPWAPrompt />
    </>
  );
}

