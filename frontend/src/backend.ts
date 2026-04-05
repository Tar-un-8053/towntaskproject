import { Principal } from '@dfinity/principal';

export type UserRole = 'seeker' | 'provider';

export interface Profile {
  id: Principal;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  role: UserRole;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Job {
  _id: string;
  id?: string;
  title: string;
  category: string;
  area: string;
  state: string;
  description: string;
  providerId?: Principal;
  postedBy?: string;
  status: 'active' | 'filled' | 'cancelled' | 'open';
  salary?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StateAnalytics {
  _id: string;
  state: string;
  totalJobs: number;
  categories: { category: string; count: number }[];
  avgSalary: string;
  topCategory: string;
}

export interface SearchParams {
  category?: string;
  area?: string;
  query?: string;
  state?: string;
}

// Runtime constants for variant types
export const Variant_pending_rejected_accepted = {
  pending: { pending: null },
  rejected: { rejected: null },
  accepted: { accepted: null },
} as const;

export const Variant_closed_open = {
  closed: { closed: null },
  open: { open: null },
} as const;

export const Variant_provider_worker = {
  provider: { provider: null },
  worker: { worker: null },
} as const;

// Type definitions
export type VariantPendingRejectedAccepted = 
  | { pending: null }
  | { rejected: null }
  | { accepted: null };

export type VariantClosedOpen = 
  | { closed: null }
  | { open: null };

export type VariantProviderWorker = 
  | { provider: null }
  | { worker: null };

export interface JobApplication {
  _id: string;
  id?: string;
  jobId: string;
  applicant: string;
  applicantId?: Principal;
  coverLetter: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ===== NEW FEATURE TYPES =====

export type EmergencyType = 'high' | 'light';
export type EmergencyStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'EXPIRED';
export type UrgencyLevel = 'normal' | 'urgent' | 'immediate';
export type VolunteerStatus = 'none' | 'pending' | 'verified' | 'suspended';
export type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold';

export interface EmergencyPost {
  _id: string;
  userId: string;
  type: EmergencyType;
  category: string;
  description: string;
  lat: number;
  lng: number;
  status: EmergencyStatus;
  acceptedBy?: string;
  acceptedAt?: string;
  resolvedAt?: string;
  currentRadius: number;
  urgencyLevel?: UrgencyLevel;
  fakeReportCount: number;
  isApproximate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerVerification {
  userId: string;
  aadhaarVerified: boolean;
  panVerified: boolean;
  faceVerified: boolean;
  mobileVerified: boolean;
  emailVerified: boolean;
  documentStatus: string;
  verificationStatus: string;
  faceMatchScore: number;
  nameMatchScore: number;
  fraudFlags: string[];
}

export interface Rating {
  _id: string;
  fromUser: string;
  toUser: string;
  emergencyId: string;
  type: 'emergency' | 'service';
  helpfulness: number;
  behavior: number;
  safety: number;
  responseTime: number;
  overallScore: number;
  reviewText: string;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  fromUser: string;
  toUser?: string;
  jobId?: string;
  type: 'app' | 'job' | 'provider' | 'worker' | 'suggestion';
  rating: number;
  title?: string;
  message: string;
  category: 'general' | 'bug' | 'feature' | 'complaint' | 'appreciation';
  status: 'pending' | 'reviewed' | 'resolved';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}
