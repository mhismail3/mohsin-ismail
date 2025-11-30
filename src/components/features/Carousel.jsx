import React from 'react';
import { useCarousel } from '../../hooks';

/**
 * Shared carousel component for horizontal image galleries.
 * 
 * @param {Object} props
 * @param {Array<string>} props.images - Array of image URLs
 * @param {Function} props.onImageClick - Callback when image is clicked (receives image URL)
 * @param {string} props.altPrefix - Alt text prefix for images (default: 'Image')
 * @param {Function} props.renderBadge - Optional render function for badges (receives image URL, index)
 * @param {string} props.className - Additional CSS classes for container
 */
const Carousel = ({
  images = [],
  onImageClick,
  altPrefix = 'Image',
  renderBadge,
  className = '',
}) => {
  const {
    trackRef,
    setItemRef,
    activeIndex,
    handleScroll,
  } = useCarousel({ items: images });

  return (
    <div className={`carousel-container ${className}`}>
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
    </div>
  );
};

export default Carousel;



