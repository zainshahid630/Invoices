import { useEffect, useRef, DependencyList, EffectCallback } from 'react';

/**
 * A stable version of useEffect that prevents duplicate calls
 * in React Strict Mode by tracking if the effect has already run
 * 
 * Use this for API calls that should only run once on mount
 */
export function useStableEffect(effect: EffectCallback, deps?: DependencyList) {
  const hasRun = useRef(false);
  const cleanupRef = useRef<void | (() => void)>();

  useEffect(() => {
    // In production or if already run, execute normally
    if (process.env.NODE_ENV === 'production' || !hasRun.current) {
      hasRun.current = true;
      cleanupRef.current = effect();
    }

    // Cleanup function
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook to get user session without causing re-renders
 * Memoizes the session data
 */
export function useSession() {
  const sessionRef = useRef<any>(null);

  if (!sessionRef.current) {
    const session = localStorage.getItem('seller_session') || localStorage.getItem('session');
    if (session) {
      try {
        sessionRef.current = JSON.parse(session);
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    }
  }

  return sessionRef.current;
}
