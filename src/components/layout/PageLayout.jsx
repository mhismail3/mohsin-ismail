import React from 'react';
import { usePageTitle } from '../../hooks';
import Header from './Header';

/**
 * Common page layout wrapper.
 * Handles document title, scroll reset, and page structure.
 * 
 * @param {Object} props
 * @param {string} props.title - Page title for document.title
 * @param {React.ReactNode} props.children - Page content
 * @param {Function} props.onLogoClick - Optional callback for logo click
 * @param {boolean} props.scrollToTop - Whether to scroll to top on mount (default: true)
 */
const PageLayout = ({
  title,
  children,
  onLogoClick,
  scrollToTop = true,
}) => {
  usePageTitle(title, { scrollToTop });

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" onLogoClick={onLogoClick} />
      {children}
    </div>
  );
};

export default PageLayout;


