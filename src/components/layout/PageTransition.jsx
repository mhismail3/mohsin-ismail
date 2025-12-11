import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - Elegant page transition wrapper
 * 
 * Provides a subtle fade + lift animation when navigating between routes.
 * Uses CSS animations triggered by location changes, with a unique key
 * to force re-mount and animation replay on each navigation.
 * 
 * The animation is minimal and refined to match the site's aesthetic:
 * - Quick fade from 0 → 1 opacity
 * - Subtle upward movement (12px → 0)
 * - ~280ms duration with ease-out timing
 * 
 * Scroll behavior is handled by usePageTitle hook in individual pages,
 * keeping concerns separated.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();

  // Using pathname as key forces React to unmount/remount the wrapper
  // on each route change, triggering the CSS animation fresh each time
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;

