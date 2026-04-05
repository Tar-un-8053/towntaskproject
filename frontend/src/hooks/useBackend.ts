import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useBackend() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  return {
    actor,
    isActorLoading: isFetching,
    isAuthenticated,
  };
}

