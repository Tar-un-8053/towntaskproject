import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { JobApplication } from '../../backend';

export function useGetMyApplications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobApplication[]>({
    queryKey: ['myApplications'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyApplications();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { jobId: string; coverLetter: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyToJob(data.jobId, data.coverLetter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { applicationId: string; status: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateApplicationStatus(data.applicationId, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
  });
}

