import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook that provides a click handler for content with internal links.
 * Uses React Router navigation for same-origin links while allowing
 * external links, hash links, and mailto links to work normally.
 * 
 * Use this on containers that render HTML content with links
 * (e.g., dangerouslySetInnerHTML).
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onBeforeNavigate - Optional callback before navigation
 * @returns {{ handleLinkClick: (e: Event) => boolean }} Handler that returns true if navigation occurred
 * 
 * @example
 * const { handleLinkClick } = useInternalLinkNavigation();
 * 
 * <div onClick={handleLinkClick} dangerouslySetInnerHTML={{ __html: content }} />
 */
const useInternalLinkNavigation = ({ onBeforeNavigate } = {}) => {
  const navigate = useNavigate();

  const handleLinkClick = useCallback((e) => {
    // Find the closest anchor element
    const link = e.target.closest('a[href]');
    if (!link) return false;
    
    const href = link.getAttribute('href');
    if (!href) return false;

    // Determine link type
    const isHashLink = href.startsWith('#');
    const isMailto = href.startsWith('mailto:');
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    const isAbsoluteInternal = isExternal && href.startsWith(window.location.origin);
    const isRelativeInternal = href.startsWith('/');

    // Allow hash links, mailto, and true external links to work normally
    if (isHashLink || isMailto) {
      return false;
    }

    // Handle relative internal links (e.g., /blog, /posts/my-post)
    if (isRelativeInternal) {
      e.preventDefault();
      onBeforeNavigate?.();
      navigate(href);
      return true;
    }

    // Handle same-origin absolute URLs
    if (isAbsoluteInternal) {
      e.preventDefault();
      const path = href.replace(window.location.origin, '');
      onBeforeNavigate?.();
      navigate(path);
      return true;
    }

    // External link - let browser handle it normally
    return false;
  }, [navigate, onBeforeNavigate]);

  return { handleLinkClick };
};

export default useInternalLinkNavigation;
