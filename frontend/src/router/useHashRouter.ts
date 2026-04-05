import { useEffect, useState } from 'react';

interface RouteParams {
  [key: string]: string;
}

export function useHashRouter() {
  const [currentRoute, setCurrentRoute] = useState<string>('');
  const [params, setParams] = useState<RouteParams>({});

  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.slice(1); // Remove #
      const [path] = hash.split('?');
      const segments = path.split('/').filter(Boolean);

      if (segments.length === 0) {
        setCurrentRoute('browse');
        setParams({});
      } else if (segments.length === 1) {
        setCurrentRoute(segments[0]);
        setParams({});
      } else {
        setCurrentRoute(segments[0]);
        setParams({ id: segments[1] });
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  return { currentRoute, params };
}

export function navigate(path: string) {
  window.location.hash = path;
}

