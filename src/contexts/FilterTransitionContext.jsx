import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * FilterTransitionContext
 * 
 * Orchestrates in-page filtering/pagination animations to prevent chaos from
 * multiple independent animation systems firing simultaneously.
 * 
 * The problem this solves:
 * - Header collapse/expand has its own CSS transitions
 * - Active tags appear/disappear based on React state
 * - Scroll position changes trigger header reactions
 * 
 * STREAMLINED APPROACH (no fade-out flicker):
 * Instead of fade-out → update → fade-in (which feels flickery), we now:
 * 1. Scroll to top instantly (invisible jump)
 * 2. Signal header to check scroll position and expand if needed
 * 3. Update state immediately (content swaps instantly)
 * 4. New cards animate in with subtle stagger
 * 
 * This feels snappier because content doesn't disappear and reappear.
 * 
 * Animation Phases:
 * - 'idle': No transition in progress
 * - 'out': Brief signal phase - header checks scroll, content stays visible
 * - 'in': New cards animate in with stagger
 */

const FilterTransitionContext = createContext({
  isFiltering: false,
  filterPhase: 'idle',
  transitionType: 'filter',
  startFilterTransition: () => {},
});

// Animation timing constants - elegant pacing for instant swap + staggered entrance
const SIGNAL_MS = 16; // One frame to let header respond to scroll position change
const STAGGER_COMPLETE_MS = 480; // Time for staggered entrance to complete (slower for elegant feel)
const FADE_OUT_MS = 250; // Smooth fade-out for pagination transitions (matches CSS)
const FADE_IN_MS = 400; // Slower fade-in for smooth entrance (matches CSS)

export const FilterTransitionProvider = ({ children }) => {
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterPhase, setFilterPhase] = useState('idle'); // 'idle' | 'out' | 'update' | 'in'
  const [transitionType, setTransitionType] = useState('filter'); // 'filter' | 'pagination'

  const pendingUpdateRef = useRef(null);
  const timeoutRef = useRef(null);
  
  /**
   * Start an orchestrated filter transition
   *
   * @param {Function} updateFn - The state update function to execute
   * @param {Object} options - Optional configuration
   * @param {boolean} options.scrollToTop - Whether to scroll to top (default: true if scrolled)
   * @param {boolean} options.isPagination - Whether this is a pagination change (uses fade-out)
   */
  const startFilterTransition = useCallback((updateFn, options = {}) => {
    const { scrollToTop = true, isPagination = false } = options;
    
    // Check if we're already transitioning - queue the update
    if (isFiltering) {
      pendingUpdateRef.current = updateFn;
      return;
    }
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip animation, just update state
      if (scrollToTop && window.scrollY > 100) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      updateFn();
      return;
    }
    
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // TWO DIFFERENT FLOWS:
    // 1. Tag filtering: instant swap + staggered entrance (snappy, no fade-out)
    // 2. Pagination: smooth crossfade (fade-out → swap → fade-in)

    if (isPagination) {
      // PAGINATION FLOW: Smooth crossfade for page changes

      // STEP 1: Start fade-out phase (NO scroll yet - prevents visible jump)
      setIsFiltering(true);
      setTransitionType('pagination');
      setFilterPhase('out');

      // STEP 2: After fade-out completes, scroll and swap content
      timeoutRef.current = setTimeout(() => {
        // Scroll to top while content is faded out (invisible jump)
        if (scrollToTop && typeof window !== 'undefined' && window.scrollY > 100) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }

        setFilterPhase('update');

        // Execute the state update
        updateFn();

        // STEP 3: Wait one frame for React to render new content
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // STEP 4: Start fade-in animation
            setFilterPhase('in');

            // STEP 5: After fade-in completes, return to idle
            timeoutRef.current = setTimeout(() => {
              setIsFiltering(false);
              setFilterPhase('idle');
              setTransitionType('filter');

              // Handle any queued updates
              if (pendingUpdateRef.current) {
                const pending = pendingUpdateRef.current;
                pendingUpdateRef.current = null;
                timeoutRef.current = setTimeout(() => {
                  startFilterTransition(pending, options);
                }, 30);
              }
            }, FADE_IN_MS + 100); // Base fade-in + small buffer
          });
        });
      }, FADE_OUT_MS);
    } else {
      // TAG FILTER FLOW: Instant swap + staggered entrance (original behavior)

      // STEP 1: Scroll to top instantly (before any visual changes)
      if (scrollToTop && typeof window !== 'undefined' && window.scrollY > 100) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      // STEP 2: Signal 'out' phase briefly so header can check scroll position
      setIsFiltering(true);
      setTransitionType('filter');
      setFilterPhase('out');

      // STEP 3: After one frame, update state and start entrance animation
      timeoutRef.current = setTimeout(() => {
        // Execute the state update - content swaps instantly
        updateFn();

        // Wait for React to render the new content
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // STEP 4: Start staggered entrance animation
            setFilterPhase('in');

            // STEP 5: After entrance animation completes, return to idle
            timeoutRef.current = setTimeout(() => {
              setIsFiltering(false);
              setFilterPhase('idle');

              // Handle any queued updates
              if (pendingUpdateRef.current) {
                const pending = pendingUpdateRef.current;
                pendingUpdateRef.current = null;
                timeoutRef.current = setTimeout(() => {
                  startFilterTransition(pending, options);
                }, 30);
              }
            }, STAGGER_COMPLETE_MS);
          });
        });
      }, SIGNAL_MS);
    }
  }, [isFiltering]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <FilterTransitionContext.Provider value={{
      isFiltering,
      filterPhase,
      transitionType,
      startFilterTransition
    }}>
      {children}
    </FilterTransitionContext.Provider>
  );
};

/**
 * Hook to access filter transition state and controls
 *
 * @returns {{
 *   isFiltering: boolean,
 *   filterPhase: 'idle' | 'out' | 'update' | 'in',
 *   transitionType: 'filter' | 'pagination',
 *   startFilterTransition: (updateFn: Function, options?: Object) => void
 * }}
 */
export const useFilterTransition = () => {
  return useContext(FilterTransitionContext);
};

export { FilterTransitionContext };

export default FilterTransitionContext;

