import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Job, SearchParams } from '../../backend';

export function useJobSearch(params: SearchParams) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Job[]>({
    queryKey: ['jobs', params],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.jobSearch(params);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; category: string; area: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJob(data.title, data.category, data.area, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJobArea() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { jobId: string; area: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJobArea(data.jobId, data.area);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

