import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ProgressiveImage } from '../ui';

/**
 * Lightbox modal component for full-screen image viewing.
 * Uses a portal to render at document.body level, ensuring proper
 * viewport centering regardless of scroll position or page length.
 * Features progressive loading with blur-up effect for large images.
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

  // Use portal to render at body level for reliable viewport positioning
  return createPortal(
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Separate backdrop element - does NOT inherit opacity from parent */}
      {/* Rendered first in DOM order so it appears behind content */}
      <div className="lightbox-backdrop" aria-hidden="true" />
      
      {/* Content wrapper for positioning the close button outside overflow:hidden */}
      <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-content">
          <ProgressiveImage 
            src={src} 
            alt={alt}
            eager={true}
          />
        </div>
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Lightbox;
