import React, { createContext, useContext, useState, useLayoutEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransitionContext
 * 
 * Coordinates page transitions across the app to prevent animation conflicts.
 * Specifically solves the problem of:
 * - Header flickering (visible → collapsed → visible) during navigation
 * - Content fading while the page is still scrolling
 * - Multiple competing animations
 * 
 * The solution:
 * 1. Track navigation state (`isNavigating`)
 * 2. Scroll to top INSTANTLY before any content renders
 * 3. Delay animations until scroll is complete and DOM is ready
 * 4. Header suspends scroll-based behavior during transitions
 * 
 * Flow on navigation:
 * 1. Route changes → `isNavigating` becomes true, `isReady` becomes false
 * 2. Instant scroll to top (synchronous, in useLayoutEffect)
 * 3. Wait for DOM paint (double rAF)
 * 4. `isReady` becomes true → content fades in
 * 5. After animation duration → `isNavigating` becomes false
 * 6. Header can now react to scroll normally
 */

const PageTransitionContext = createContext({
  isNavigating: false,
  isReady: false,
});

// Duration to keep `isNavigating` true after `isReady` becomes true
// This ensures header doesn't react to scroll until content animation is well underway
const NAVIGATION_SETTLING_TIME = 350; // ms

export const PageTransitionProvider = ({ children }) => {
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(true); // Start navigating on mount
  const previousPathRef = useRef(location.pathname);
  const timeoutRef = useRef(null);

  // Synchronously scroll to top and prepare for animation
  useLayoutEffect(() => {
    const isNewNavigation = previousPathRef.current !== location.pathname;
    previousPathRef.current = location.pathname;

    // Clear any pending timeout from previous navigation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Start navigation state
    setIsNavigating(true);
    setIsReady(false);

    // CRITICAL: Scroll to top INSTANTLY and SYNCHRONOUSLY
    // This happens in useLayoutEffect before the browser paints,
    // so the user never sees the page at the old scroll position
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Wait for DOM to be painted before triggering animations
    // Double rAF ensures we're past the first paint
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        setIsReady(true);
        
        // Keep isNavigating true for a bit longer so header doesn't
        // immediately react to scroll. This ensures animations settle.
        timeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
        }, NAVIGATION_SETTLING_TIME);
      });
      
      // Cleanup inner frame
      return () => cancelAnimationFrame(frame2);
    });

    return () => {
      cancelAnimationFrame(frame1);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]);

  // For initial page load, we don't want to start in navigating state
  // after the first animation completes
  useLayoutEffect(() => {
    // Initial load - scroll to top immediately
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  return (
    <PageTransitionContext.Provider value={{ isNavigating, isReady }}>
      {children}
    </PageTransitionContext.Provider>
  );
};

/**
 * Hook to access page transition state
 * 
 * @returns {{ isNavigating: boolean, isReady: boolean }}
 * - isNavigating: true during navigation transition (header should suspend scroll behavior)
 * - isReady: true when content should animate in
 */
export const usePageTransition = () => {
  return useContext(PageTransitionContext);
};

// Named export for use in index.js barrel export
export { PageTransitionContext };

export default PageTransitionContext;






