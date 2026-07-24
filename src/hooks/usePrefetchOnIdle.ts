import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to prefetch routes when the browser is idle.
 * Uses requestIdleCallback with a fallback to setTimeout.
 */
export function usePrefetchOnIdle(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefetch = () => {
      routes.forEach((route) => {
        router.prefetch(route);
      });
    };

    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(prefetch, { timeout: 3000 });
      return () => cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(prefetch, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [routes, router]);
}
