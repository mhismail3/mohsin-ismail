import React, { useEffect, useMemo } from 'react';
import { useCarousel } from '../../hooks';
import { ProgressiveImage, preloadImage } from '../ui';

/**
 * Shared carousel component for horizontal image galleries.
 * Features progressive image loading with blur-up effect and
 * smart preloading of adjacent images for smooth scrolling.
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

  // Preload adjacent images when active index changes
  useEffect(() => {
    if (!images.length) return;

    // Preload next 2 and previous 1 images for smooth scrolling
    const preloadIndices = [
      activeIndex - 1,
      activeIndex + 1,
      activeIndex + 2,
    ].filter((idx) => idx >= 0 && idx < images.length && idx !== activeIndex);

    preloadIndices.forEach((idx) => {
      preloadImage(images[idx]).catch(() => {
        // Silently fail - the ProgressiveImage will handle error state
      });
    });
  }, [activeIndex, images]);

  // Preload the first few images on mount for immediate display
  useEffect(() => {
    if (!images.length) return;
    
    // Preload first 3 images immediately
    const initialImages = images.slice(0, 3);
    initialImages.forEach((src) => {
      preloadImage(src).catch(() => {});
    });
  }, [images]);

  // Determine if an image should load eagerly based on proximity to active
  const shouldLoadEager = (idx) => {
    // First 2 images load eagerly, plus anything within 1 of active index
    return idx < 2 || Math.abs(idx - activeIndex) <= 1;
  };

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
            <ProgressiveImage
              src={img}
              alt={`${altPrefix} ${idx + 1}`}
              eager={shouldLoadEager(idx)}
            />
            {renderBadge?.(img, idx)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
