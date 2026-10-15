'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';

interface LenisProviderProps {
  children: React.ReactNode;
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  useEffect(() => {
    // Only initialize smooth scroll on non-touch devices or when user prefers motion
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      allowNestedScroll: true,
      prevent: (node) => {
        if (!node || !(node instanceof HTMLElement)) return false;
        // Never hijack scrolling inside any modal, dialog, popover, or scrollable container
        return Boolean(
          node.hasAttribute('data-lenis-prevent') ||
          node.closest('[data-lenis-prevent]') ||
          node.closest('.overflow-y-auto') ||
          node.closest('.overflow-x-auto') ||
          node.closest('.overflow-auto') ||
          node.closest('[role="dialog"]')
        );
      },
    });

    // Pause Lenis when any modal locks body scroll
    const observer = new MutationObserver(() => {
      if (typeof document !== 'undefined' && document.body.style.overflow === 'hidden') {
        lenis.stop();
      } else {
        lenis.start();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
