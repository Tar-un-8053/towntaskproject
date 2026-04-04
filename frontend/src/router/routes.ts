export const ROUTES = {
  BROWSE_JOBS: 'browse',
  JOB_DETAIL: 'job',
  MY_PROFILE: 'profile',
  PUBLIC_PROFILE: 'user',
  PROVIDER_JOBS: 'my-jobs',
  MY_APPLICATIONS: 'my-applications',
  ANALYTICS: 'analytics',
  SIGN_IN: 'signin',
  SIGN_UP: 'signup',
  SMART_SEARCH: 'smart-search',
  EMERGENCY: 'emergency',
  EMERGENCY_DETAIL: 'emergency-detail',
  MY_EMERGENCIES: 'my-emergencies',
  VOLUNTEER: 'volunteer',
  VOLUNTEER_CHOICE: 'volunteer-choice',
  FULL_VERIFICATION: 'full-verification',
  FEEDBACK: 'feedback',
  CHAT: 'chat',
} as const;

export function buildJobDetailRoute(jobId: string | number): string {
  return `#/${ROUTES.JOB_DETAIL}/${jobId}`;
}

export function buildPublicProfileRoute(principalId: string): string {
  return `#/${ROUTES.PUBLIC_PROFILE}/${principalId}`;
}

export function buildBrowseJobsRoute(): string {
  return `#/${ROUTES.BROWSE_JOBS}`;
}

export function buildMyProfileRoute(): string {
  return `#/${ROUTES.MY_PROFILE}`;
}

export function buildProviderJobsRoute(): string {
  return `#/${ROUTES.PROVIDER_JOBS}`;
}

export function buildMyApplicationsRoute(): string {
  return `#/${ROUTES.MY_APPLICATIONS}`;
}

export function buildAnalyticsRoute(): string {
  return `#/${ROUTES.ANALYTICS}`;
}

export function buildSignInRoute(): string {
  return `#/${ROUTES.SIGN_IN}`;
}

export function buildSignUpRoute(): string {
  return `#/${ROUTES.SIGN_UP}`;
}

export function buildSmartSearchRoute(): string {
  return `#/${ROUTES.SMART_SEARCH}`;
}

export function buildEmergencyRoute(): string {
  return `#/${ROUTES.EMERGENCY}`;
}

export function buildEmergencyDetailRoute(id: string): string {
  return `#/${ROUTES.EMERGENCY_DETAIL}/${id}`;
}

export function buildMyEmergenciesRoute(): string {
  return `#/${ROUTES.MY_EMERGENCIES}`;
}

export function buildVolunteerRoute(): string {
  return `#/${ROUTES.VOLUNTEER}`;
}

export function buildVolunteerChoiceRoute(): string {
  return `#/${ROUTES.VOLUNTEER_CHOICE}`;
}

export function buildFullVerificationRoute(): string {
  return `#/${ROUTES.FULL_VERIFICATION}`;
}

export function buildFeedbackRoute(): string {
  return `#/${ROUTES.FEEDBACK}`;
}

export function buildChatRoute(applicationId?: string): string {
  return applicationId ? `#/${ROUTES.CHAT}/${applicationId}` : `#/${ROUTES.CHAT}`;
}

