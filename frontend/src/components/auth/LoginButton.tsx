import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { buildSignInRoute } from '../../router/routes';

export default function LoginButton() {
  const { clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      window.location.hash = '#/';
    } else {
      window.location.hash = buildSignInRoute();
    }
  };

  return (
    <Button
      onClick={handleAuth}
      variant={isAuthenticated ? 'outline' : 'default'}
      className="gap-2"
    >
      {isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Sign Out
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Sign In
        </>
      )}
    </Button>
  );
}

