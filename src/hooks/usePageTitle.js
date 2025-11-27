import { useEffect } from 'react';

/**
 * Custom hook for managing document title.
 * Sets the document title and optionally scrolls to top on mount.
 * 
 * @param {string} title - The page title to set
 * @param {Object} options - Configuration options
 * @param {boolean} options.scrollToTop - Whether to scroll to top on mount (default: true)
 * @param {string} options.scrollBehavior - Scroll behavior ('smooth' or 'auto', default: 'smooth')
 */
const usePageTitle = (title, { scrollToTop = true, scrollBehavior = 'smooth' } = {}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (scrollToTop && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    }
  }, [title, scrollToTop, scrollBehavior]);
};

export default usePageTitle;



