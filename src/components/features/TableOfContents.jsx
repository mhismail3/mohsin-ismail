import React, { useState, useCallback, useRef } from 'react';

/**
 * TableOfContents Component
 * 
 * Displays an expandable/collapsible table of contents for blog posts.
 * Clicking on a heading scrolls smoothly to that section with an ease-in-out animation.
 */
const TableOfContents = ({ headings }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);

  // Don't render if there are no headings
  if (!headings || headings.length === 0) {
    return null;
  }

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleHeadingClick = useCallback((e, id) => {
    e.preventDefault();
    
    const element = document.getElementById(id);
    if (!element) return;

    // Get header height for offset (accounting for fixed header)
    const headerHeight = 120; // Approximate header height + some padding
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    // Smooth scroll with ease-in-out timing
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    // Add a brief highlight effect to the target heading
    element.classList.add('toc-target-highlight');
    setTimeout(() => {
      element.classList.remove('toc-target-highlight');
    }, 2000);
  }, []);

  // Strip markdown from heading text for display
  const cleanHeadingText = (text) => {
    return text
      .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1') // Links → just the link text
      .replace(/`([^`]*)`/g, '$1')              // Inline code → just the code text
      .replace(/[*_~]/g, '');                   // Remove emphasis markers
  };

  return (
    <nav className="toc" aria-label="Table of contents">
      <button
        type="button"
        className={`toc-toggle ${isExpanded ? 'toc-toggle--expanded' : ''}`}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="toc-list"
      >
        <span className="toc-toggle-icon">
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="toc-chevron"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
        <span className="toc-toggle-label">Table of Contents</span>
        <span className="toc-toggle-count">{headings.length}</span>
      </button>

      <div
        id="toc-list"
        ref={contentRef}
        className={`toc-content ${isExpanded ? 'toc-content--expanded' : ''}`}
        style={{
          maxHeight: isExpanded ? `${contentRef.current?.scrollHeight || 500}px` : '0px',
        }}
      >
        <ol className="toc-list">
          {headings.map((heading, index) => (
            <li 
              key={heading.id} 
              className={`toc-item toc-item--h${heading.level}`}
              style={{ '--item-index': index }}
            >
              <a
                href={`#${heading.id}`}
                className="toc-link"
                onClick={(e) => handleHeadingClick(e, heading.id)}
              >
                <span className="toc-link-number">{index + 1}</span>
                <span className="toc-link-text">{cleanHeadingText(heading.text)}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default TableOfContents;
