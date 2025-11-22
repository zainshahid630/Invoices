import { useEffect, useRef, EffectCallback } from 'react';

/**
 * useEffectOnce Hook
 * 
 * Runs effect only once, even in React 18 Strict Mode
 * which intentionally double-mounts components in development.
 * 
 * This prevents duplicate API calls during development.
 * 
 * Usage:
 * useEffectOnce(() => {
 *   loadData();
 * });
 */
export function useEffectOnce(effect: EffectCallback) {
  const hasRun = useRef(false);
  const cleanup = useRef<void | (() => void)>();

  useEffect(() => {
    // Skip if already run
    if (hasRun.current) {
      return cleanup.current;
    }

    hasRun.current = true;
    cleanup.current = effect();

    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * useEffectDebounced Hook
 * 
 * Runs effect with debouncing to prevent rapid re-executions
 * 
 * Usage:
 * useEffectDebounced(() => {
 *   fetchData(searchTerm);
 * }, [searchTerm], 500);
 */
export function useEffectDebounced(
  effect: EffectCallback,
  deps: React.DependencyList,
  delay: number = 500
) {
  const cleanup = useRef<void | (() => void)>();

  useEffect(() => {
    const handler = setTimeout(() => {
      cleanup.current = effect();
    }, delay);

    return () => {
      clearTimeout(handler);
      if (cleanup.current) {
        cleanup.current();
      }
    };
  }, [...deps, delay]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * useStrictModeGuard Hook
 * 
 * Detects if component is in Strict Mode double-render
 * and prevents duplicate side effects
 */
export function useStrictModeGuard() {
  const renderCount = useRef(0);
  const isStrictMode = useRef(false);

  useEffect(() => {
    renderCount.current += 1;
    
    // If this is the second render in quick succession, we're in Strict Mode
    if (renderCount.current === 2) {
      isStrictMode.current = true;
    }
  }, []);

  return {
    isStrictMode: isStrictMode.current,
    shouldSkip: renderCount.current % 2 === 0 && isStrictMode.current,
  };
}
