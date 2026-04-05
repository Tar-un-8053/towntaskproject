// In production, use the backend URL from env; in dev, Vite proxy handles it
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to get user ID from localStorage
const getUserId = () => {
  const authData = localStorage.getItem('towntask_auth');
  if (authData) {
    try {
      return JSON.parse(authData).userId;
    } catch {}
  }
  return localStorage.getItem('userId') || 'user-' + Math.random().toString(36).substring(7);
};

// Helper to save user ID
const setUserId = (id: string) => {
  localStorage.setItem('userId', id);
};

// Initialize user ID if not exists
if (!localStorage.getItem('userId')) {
  setUserId(getUserId());
}

// Generic fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const userId = getUserId();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    throw error;
  }
}

// Auth APIs
export const authApi = {
  signup: (data: { name: string; phone: string; email?: string; area: string; profileType: string; password?: string }) =>
    apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  signin: (data: { phone: string }) =>
    apiFetch('/api/auth/signin', { method: 'POST', body: JSON.stringify(data) }),
  signinWithPassword: (data: { phone: string; password: string }) =>
    apiFetch('/api/auth/signin-password', { method: 'POST', body: JSON.stringify(data) }),
  setPassword: (data: { password: string }) =>
    apiFetch('/api/auth/set-password', { method: 'POST', body: JSON.stringify(data) }),
  sendOtp: (data: { phone: string }) =>
    apiFetch('/api/auth/send-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: { phone: string; otp: string }) =>
    apiFetch('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
};

// Profile APIs
export const profileApi = {
  getCallerProfile: () => apiFetch('/api/profile'),
  getProfile: (principalId: string) => apiFetch(`/api/profile/${principalId}`),
  saveCallerProfile: (profile: any) => 
    apiFetch('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),
  getCallerUserRole: () => apiFetch('/api/role'),
};

// Job APIs
export const jobApi = {
  getAllJobs: () => apiFetch('/api/jobs'),
  searchJobs: (params: { area?: string; title?: string; category?: string; state?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.area) queryParams.append('area', params.area);
    if (params.title) queryParams.append('title', params.title);
    if (params.category) queryParams.append('category', params.category);
    if (params.state) queryParams.append('state', params.state);
    return apiFetch(`/api/jobs/search?${queryParams.toString()}`);
  },
  getJob: (jobId: string) => apiFetch(`/api/jobs/${jobId}`),
  createJob: (data: { title: string; category: string; area: string; description: string }) =>
    apiFetch('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateJobArea: (jobId: string, area: string) =>
    apiFetch(`/api/jobs/${jobId}/area`, {
      method: 'PUT',
      body: JSON.stringify({ area }),
    }),
};

// Application APIs
export const applicationApi = {
  getMyApplications: () => apiFetch('/api/applications/my'),
  applyToJob: (jobId: string, coverLetter: string) =>
    apiFetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, coverLetter }),
    }),
  updateApplicationStatus: (applicationId: string, status: string) =>
    apiFetch(`/api/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getJobApplications: (jobId: string) => apiFetch(`/api/jobs/${jobId}/applications`),
};

// Analytics APIs
export const analyticsApi = {
  getStateWise: () => apiFetch('/api/analytics/state-wise'),
  getCategoryWise: () => apiFetch('/api/analytics/category-wise'),
  getStates: () => apiFetch('/api/states'),
};

// Smart Search APIs
export const smartSearchApi = {
  searchJobs: (data: { query?: string; category?: string; lat: number; lng: number; serviceMode?: string }) =>
    apiFetch('/api/jobs/smart-search', { method: 'POST', body: JSON.stringify(data) }),
  searchProviders: (data: { skill?: string; lat: number; lng: number; serviceMode?: string }) =>
    apiFetch('/api/providers/smart-search', { method: 'POST', body: JSON.stringify(data) }),
};

// Emergency APIs
export const emergencyApi = {
  createHighEmergency: (data: {
    category: string; description?: string; lat: number; lng: number; disclaimerAccepted?: boolean;
  }) => apiFetch('/api/emergency/high', { method: 'POST', body: JSON.stringify(data) }),
  createLightEmergency: (data: {
    category: string; description: string; lat?: number; lng?: number; urgencyLevel: string;
  }) => apiFetch('/api/emergency/light', { method: 'POST', body: JSON.stringify(data) }),
  getEmergencies: (params?: { lat?: number; lng?: number; type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.lat) q.append('lat', params.lat.toString());
    if (params?.lng) q.append('lng', params.lng.toString());
    if (params?.type) q.append('type', params.type);
    if (params?.status) q.append('status', params.status);
    return apiFetch(`/api/emergencies?${q.toString()}`);
  },
  getMyEmergencies: () => apiFetch('/api/emergencies/my'),
  getEmergency: (id: string) => apiFetch(`/api/emergency/${id}`),
  acceptEmergency: (id: string) =>
    apiFetch(`/api/emergency/${id}/accept`, { method: 'PUT' }),
  cancelVolunteer: (id: string) =>
    apiFetch(`/api/emergency/${id}/cancel-volunteer`, { method: 'PUT' }),
  resolveEmergency: (id: string) =>
    apiFetch(`/api/emergency/${id}/resolve`, { method: 'PUT' }),
  expandRadius: (id: string) =>
    apiFetch(`/api/emergency/${id}/expand`, { method: 'PUT' }),
  reportFake: (id: string) =>
    apiFetch(`/api/emergency/${id}/report-fake`, { method: 'PUT' }),
};

// Volunteer APIs
export const volunteerApi = {
  register: (data: { termsAccepted: boolean; codeOfConductAccepted: boolean; riskAcknowledged: boolean }) =>
    apiFetch('/api/volunteer/register', { method: 'POST', body: JSON.stringify(data) }),
  skip: () =>
    apiFetch('/api/volunteer/skip', { method: 'POST' }),
  submitDocuments: (data: {
    aadhaarNumber: string; aadhaarFrontUrl: string; aadhaarBackUrl: string;
    panNumber: string; panUrl: string; selfieUrl: string;
    nameOnAadhaar: string; nameOnPan: string;
    address?: string; addressLat?: number; addressLng?: number; addressSource?: string;
    declarationAccepted: boolean; digilockerVerified?: boolean;
  }) => apiFetch('/api/volunteer/submit-documents', { method: 'POST', body: JSON.stringify(data) }),
  instantVerify: (data: {
    selfieUrl: string; mobileOtp: string; emailOtp?: string;
    aadhaarNumber: string; phone: string; email?: string;
  }) => apiFetch('/api/volunteer/instant-verify', { method: 'POST', body: JSON.stringify(data) }),
  sendVerificationOtp: (data: { target: string; type: 'phone' | 'email' }) =>
    apiFetch('/api/volunteer/send-verification-otp', { method: 'POST', body: JSON.stringify(data) }),
  getStatus: () => apiFetch('/api/volunteer/status'),
  checkReminder: () => apiFetch('/api/volunteer/reminder-check'),
  dismissReminder: () =>
    apiFetch('/api/volunteer/dismiss-reminder', { method: 'POST' }),
  toggleAvailability: () => apiFetch('/api/volunteer/toggle-availability', { method: 'PUT' }),
};

// Rating APIs
export const ratingApi = {
  submitRating: (data: {
    toUser: string; emergencyId: string; type: string;
    helpfulness: number; behavior: number; safety: number; responseTime: number;
    reviewText?: string;
  }) => apiFetch('/api/ratings', { method: 'POST', body: JSON.stringify(data) }),
  getUserRatings: (userId: string) => apiFetch(`/api/ratings/${userId}`),
};

// Profile location update
export const locationApi = {
  updateLocation: (lat: number, lng: number) =>
    apiFetch('/api/profile/location', { method: 'PUT', body: JSON.stringify({ lat, lng }) }),
};

// Feedback APIs
export const feedbackApi = {
  submit: (data: {
    type?: string; rating: number; title?: string; message: string;
    category?: string; toUser?: string; jobId?: string;
  }) => apiFetch('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getMyFeedbacks: () => apiFetch('/api/feedback/my'),
  getAll: (params?: { type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.status) q.append('status', params.status);
    return apiFetch(`/api/feedback?${q.toString()}`);
  },
  getUserFeedbacks: (userId: string) => apiFetch(`/api/feedback/user/${userId}`),
};

// Enhanced job detail
export const jobDetailApi = {
  getJobDetail: (jobId: string) => apiFetch(`/api/jobs/${jobId}/detail`),
};

// Full profile with feedback & stats
export const fullProfileApi = {
  getFullProfile: (userId: string) => apiFetch(`/api/profile/${userId}/full`),
};

// Chat APIs
export const chatApi = {
  getUnreadCount: () => apiFetch('/api/chat/unread-count'),
  getConversations: () => apiFetch('/api/chat/conversations'),
  getMessages: (applicationId: string) => apiFetch(`/api/chat/${applicationId}/messages`),
  sendMessage: (applicationId: string, message: string) =>
    apiFetch(`/api/chat/${applicationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  markAsRead: (applicationId: string) =>
    apiFetch(`/api/chat/${applicationId}/read`, {
      method: 'POST',
    }),
};
