import React, { useEffect, useCallback } from 'react';

/**
 * Lightbox modal component for full-screen image viewing.
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text (default: 'Full size view')
 * @param {Function} props.onClose - Callback when lightbox is closed
 */
const Lightbox = ({ src, alt = 'Full size view', onClose }) => {
  // Close on escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }, [onClose]);

  useEffect(() => {
    if (src) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [src, handleKeyDown]);

  if (!src) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} />
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Lightbox;


