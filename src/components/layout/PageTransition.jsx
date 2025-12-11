import React, { useState, useLayoutEffect } from 'react';
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
 * To prevent FOUC (Flash of Unstyled Content):
 * - Content starts with .page-transition-init (hidden)
 * - After component mounts, we wait a frame then add .page-transition-ready
 * - CSS animations only trigger when .page-transition-ready is present
 * 
 * Scroll behavior is handled by usePageTitle hook in individual pages,
 * keeping concerns separated.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Wait for the component to fully mount and paint before triggering animations
  // This prevents the flash where content appears briefly before animations start
  useLayoutEffect(() => {
    // Reset ready state on route change
    setIsReady(false);
    
    // Use double rAF to ensure the DOM is painted before animations start
    // First rAF: schedules callback before next paint
    // Second rAF: ensures we're past the paint
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        setIsReady(true);
      });
      return () => cancelAnimationFrame(frame2);
    });
    
    return () => cancelAnimationFrame(frame1);
  }, [location.pathname]);

  // Using pathname as key forces React to unmount/remount the wrapper
  // on each route change, triggering the CSS animation fresh each time
  const className = isReady 
    ? 'page-transition page-transition-ready' 
    : 'page-transition page-transition-init';

  return (
    <div key={location.pathname} className={className}>
      {children}
    </div>
  );
};

export default PageTransition;

