'use client';

import { useState, useEffect } from 'react';

let globalHasHydrated = false;

/**
 * Hook to safely handle hydration without flickering spinners on SPA navigations.
 * - On first page load (SSR + initial hydration): returns `false` to match server output.
 * - After first hydration and for ALL subsequent client-side navigations: returns `true` immediately.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(globalHasHydrated);

  useEffect(() => {
    globalHasHydrated = true;
    setMounted(true);
  }, []);

  return mounted;
}
