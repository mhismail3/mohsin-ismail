import React from 'react';
import Button from '../ui/Button';

/**
 * Pagination component for navigating through pages.
 * 
 * @param {Object} props
 * @param {number} props.page - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPrev - Callback for previous page
 * @param {Function} props.onNext - Callback for next page
 */
const Pagination = ({ page, totalPages, onPrev, onNext }) => {
  const hidePrev = page === 1;
  const hideNext = page >= totalPages;

  return (
    <div className="pagination">
      <Button
        variant="outline"
        size="small"
        onClick={onPrev}
        style={hidePrev ? { visibility: 'hidden' } : undefined}
        aria-hidden={hidePrev}
        tabIndex={hidePrev ? -1 : undefined}
      >
        <span className="pagination-text">Previous</span>
        <span className="pagination-arrow">←</span>
      </Button>
      <span className="muted pagination-status">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="small"
        onClick={onNext}
        style={hideNext ? { visibility: 'hidden' } : undefined}
        aria-hidden={hideNext}
        tabIndex={hideNext ? -1 : undefined}
      >
        <span className="pagination-text">Next</span>
        <span className="pagination-arrow">→</span>
      </Button>
    </div>
  );
};

export default Pagination;



