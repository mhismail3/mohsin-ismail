import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - Content wrapper that forces remount on navigation
 * 
 * The key={pathname} prop forces React to unmount/remount all children
 * when the route changes. This ensures:
 * - Fresh component state on each page
 * - CSS animations restart from initial state
 * 
 * ANIMATION ARCHITECTURE:
 * Animations are NOT triggered by classes on this component. Instead,
 * the parent .app div gets .app-transition-init/.app-transition-ready classes.
 * This ensures BOTH the header (outside PageTransition) and content (inside)
 * animate from a single source of truth - eliminating timing mismatches.
 * 
 * See App.jsx (AppContent component) for the animation trigger.
 * See page-transition.css for the unified animation rules.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();

  // Using pathname as key forces React to unmount/remount the wrapper
  // on each route change, resetting all content state
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;
