import React from 'react';
import { usePageTitle } from '../../hooks';
import Header from './Header';

/**
 * @deprecated This component is currently unused. Header is now rendered at the App
 * level outside PageTransition to prevent remounting on navigation.
 * Kept for backwards compatibility and potential future use.
 * 
 * Common page layout wrapper.
 * Handles document title and page structure.
 * 
 * NOTE: Scroll-to-top is now handled by PageTransitionContext for proper
 * coordination with page transitions.
 * 
 * @param {Object} props
 * @param {string} props.title - Page title for document.title
 * @param {React.ReactNode} props.children - Page content
 * @param {Function} props.onLogoClick - Optional callback for logo click
 */
const PageLayout = ({
  title,
  children,
  onLogoClick,
}) => {
  usePageTitle(title);

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" onLogoClick={onLogoClick} />
      {children}
    </div>
  );
};

export default PageLayout;
