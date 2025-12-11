import { useEffect } from 'react';

/**
 * Custom hook for managing document title.
 * Sets the document title on mount.
 * 
 * NOTE: Scroll-to-top is now handled by PageTransitionContext for proper
 * coordination with page transitions. This hook no longer handles scroll.
 * 
 * @param {string} title - The page title to set
 * @param {Object} options - Configuration options (kept for backwards compatibility)
 * @param {boolean} options.scrollToTop - DEPRECATED: Scroll is handled by PageTransitionContext
 * @param {string} options.scrollBehavior - DEPRECATED: Scroll is handled by PageTransitionContext
 */
const usePageTitle = (title, options = {}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    // Scroll-to-top is now handled by PageTransitionContext
    // This ensures scroll happens BEFORE content renders, preventing
    // the visible scroll animation and header flicker issues
  }, [title]);
};

export default usePageTitle;



