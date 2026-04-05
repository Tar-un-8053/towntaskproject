import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { profileApi, jobApi, applicationApi } from '../services/api';
import { Principal } from '@dfinity/principal';

// Actor interface that matches the backend API
interface BackendActor {
  getCallerUserRole: () => Promise<string>;
  getCallerUserProfile: () => Promise<any>;
  getCallerProfile: () => Promise<any>;
  getProfile: (principal: Principal) => Promise<any>;
  saveCallerProfile: (profile: any) => Promise<void>;
  jobSearch: (params: any) => Promise<any[]>;
  createJob: (title: string, category: string, area: string, description: string) => Promise<void>;
  updateJobArea: (jobId: string, area: string) => Promise<void>;
  getMyApplications: () => Promise<any[]>;
  applyToJob: (jobId: string, coverLetter: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: any) => Promise<void>;
}

interface UseActorReturn {
  actor: BackendActor | null;
  isFetching: boolean;
  error: Error | null;
}

// Convert string to mock Principal for compatibility
const stringToPrincipal = (id: string): Principal => {
  return Principal.fromText('2vxsx-fae'); // Mock principal
};

export function useActor(): UseActorReturn {
  const { identity } = useInternetIdentity();
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create actor with real API calls
  const actor: BackendActor = {
    getCallerUserRole: async () => {
      const response = await profileApi.getCallerUserRole();
      return response.role;
    },

    getCallerUserProfile: async () => {
      const response = await profileApi.getCallerProfile();
      return response.profile;
    },

    getCallerProfile: async () => {
      const response = await profileApi.getCallerProfile();
      return response.profile;
    },

    getProfile: async (principal: Principal) => {
      const response = await profileApi.getProfile(principal.toText());
      return response.profile;
    },

    saveCallerProfile: async (profile: any) => {
      await profileApi.saveCallerProfile(profile);
    },

    jobSearch: async (params: any) => {
      const response = await jobApi.searchJobs({
        area: params.area,
        title: params.title,
        category: params.category,
        state: params.state,
      });
      return response.jobs;
    },

    createJob: async (title: string, category: string, area: string, description: string) => {
      await jobApi.createJob({ title, category, area, description });
    },

    updateJobArea: async (jobId: string, area: string) => {
      await jobApi.updateJobArea(jobId, area);
    },

    getMyApplications: async () => {
      const response = await applicationApi.getMyApplications();
      return response.applications;
    },

    applyToJob: async (jobId: string, coverLetter: string) => {
      await applicationApi.applyToJob(jobId, coverLetter);
    },

    updateApplicationStatus: async (applicationId: string, status: any) => {
      const statusValue = Object.keys(status)[0];
      await applicationApi.updateApplicationStatus(applicationId, statusValue);
    },
  };

  useEffect(() => {
    // Simulate initialization
    setIsFetching(false);
  }, [identity]);

  return { 
    actor: identity ? actor : null, 
    isFetching, 
    error 
  };
}
