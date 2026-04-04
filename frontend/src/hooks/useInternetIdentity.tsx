import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Identity } from '@dfinity/agent';

type LoginStatus = 'idle' | 'logging-in' | 'error';

interface AuthData {
  userId: string;
  token: string;
  phone?: string;
}

interface InternetIdentityContextType {
  identity: Identity | null;
  isInitializing: boolean;
  loginStatus: LoginStatus;
  login: () => Promise<void>;
  loginWithAuth: (data: { userId: string; token: string; profile?: any }) => void;
  clear: () => Promise<void>;
  authData: AuthData | null;
}

const InternetIdentityContext = createContext<InternetIdentityContextType>({
  identity: null,
  isInitializing: true,
  loginStatus: 'idle',
  login: async () => {},
  loginWithAuth: () => {},
  clear: async () => {},
  authData: null,
});

interface InternetIdentityProviderProps {
  children: ReactNode;
}

export function InternetIdentityProvider({ children }: InternetIdentityProviderProps) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [authData, setAuthData] = useState<AuthData | null>(null);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const saved = localStorage.getItem('towntask_auth');
        if (saved) {
          const data = JSON.parse(saved) as AuthData;
          setAuthData(data);
          setIdentity({} as Identity);
          // Also update the old userId for backward compat
          localStorage.setItem('userId', data.userId);
        }
      } catch (error) {
        localStorage.removeItem('towntask_auth');
      } finally {
        setIsInitializing(false);
      }
    };

    checkExistingSession();
  }, []);

  const loginWithAuth = useCallback((data: { userId: string; token: string; profile?: any }) => {
    const auth: AuthData = { userId: data.userId, token: data.token };
    localStorage.setItem('towntask_auth', JSON.stringify(auth));
    localStorage.setItem('userId', data.userId);
    setAuthData(auth);
    setIdentity({} as Identity);
    setLoginStatus('idle');
  }, []);

  const login = useCallback(async () => {
    // Legacy login - now handled by SignIn/SignUp pages
    setLoginStatus('logging-in');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIdentity({} as Identity);
      localStorage.setItem('internetIdentity', 'mock');
      setLoginStatus('idle');
    } catch (error) {
      setLoginStatus('error');
      throw error;
    }
  }, []);

  const clear = useCallback(async () => {
    setIdentity(null);
    setAuthData(null);
    localStorage.removeItem('towntask_auth');
    localStorage.removeItem('internetIdentity');
    localStorage.removeItem('userId');
  }, []);

  return (
    <InternetIdentityContext.Provider
      value={{
        identity,
        isInitializing,
        loginStatus,
        login,
        loginWithAuth,
        clear,
        authData,
      }}
    >
      {children}
    </InternetIdentityContext.Provider>
  );
}

export function useInternetIdentity(): InternetIdentityContextType {
  const context = useContext(InternetIdentityContext);
  if (!context) {
    throw new Error('useInternetIdentity must be used within an InternetIdentityProvider');
  }
  return context;
}
