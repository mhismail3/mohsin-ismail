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
const Pagination = ({ page, totalPages, onPrev, onNext }) => (
  <div className="pagination">
    <Button
      variant="outline"
      size="small"
      onClick={onPrev}
      disabled={page === 1}
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
      disabled={page >= totalPages}
    >
      <span className="pagination-text">Next</span>
      <span className="pagination-arrow">→</span>
    </Button>
  </div>
);

export default Pagination;



