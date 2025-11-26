import React from 'react';
import { useCarousel, useIsTouch } from '../../hooks';

/**
 * Shared carousel component for horizontal image galleries.
 * 
 * @param {Object} props
 * @param {Array<string>} props.images - Array of image URLs
 * @param {Function} props.onImageClick - Callback when image is clicked (receives image URL)
 * @param {string} props.hint - Custom hint text (overrides default)
 * @param {string} props.altPrefix - Alt text prefix for images (default: 'Image')
 * @param {Function} props.renderBadge - Optional render function for badges (receives image URL, index)
 * @param {string} props.className - Additional CSS classes for container
 */
const Carousel = ({
  images = [],
  onImageClick,
  hint,
  altPrefix = 'Image',
  renderBadge,
  className = '',
}) => {
  const isTouch = useIsTouch();
  
  const {
    trackRef,
    setItemRef,
    activeIndex,
    handleScroll,
    handleMouseMove,
    handleMouseLeave,
  } = useCarousel({ items: images, isTouch });

  const defaultHint = isTouch ? 'Scroll to view more' : 'Hover sides to scroll';

  return (
    <div
      className={`carousel-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
        {images.map((img, idx) => (
          <button
            key={`carousel-${idx}`}
            type="button"
            className={`carousel-item ${activeIndex === idx ? 'is-active' : ''}`}
            onClick={() => onImageClick?.(img)}
            ref={setItemRef(idx)}
          >
            <img
              src={img}
              alt={`${altPrefix} ${idx + 1}`}
              loading="eager"
            />
            {renderBadge?.(img, idx)}
          </button>
        ))}
      </div>
      <div className="carousel-hint">{hint || defaultHint}</div>
    </div>
  );
};

export default Carousel;
