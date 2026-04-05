import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Profile } from '../../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProfile(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile | null>({
    queryKey: ['profile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      return actor.getProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

