import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../../contexts';

/**
 * PageTransition - Elegant page transition wrapper
 * 
 * Provides a subtle fade + lift animation when navigating between routes.
 * Works in coordination with PageTransitionContext which handles:
 * - Instant scroll to top (before content renders)
 * - Navigation state tracking (for header coordination)
 * - Animation timing with double-rAF
 * 
 * The animation is minimal and refined to match the site's aesthetic:
 * - Quick fade from 0 → 1 opacity
 * - Subtle upward movement (10px → 0)
 * - ~280-320ms duration with ease-out timing
 * 
 * FOUC Prevention:
 * - Content starts with .page-transition-init (hidden)
 * - When isReady from context becomes true, .page-transition-ready is applied
 * - CSS animations only trigger when .page-transition-ready is present
 * 
 * Header Coordination:
 * - Header uses the same context to suspend scroll behavior during transitions
 * - Header fades in together with content for a unified appearance
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const { isReady } = usePageTransition();

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
