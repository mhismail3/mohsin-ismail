import React, { useEffect, useMemo } from 'react';
import { useCarousel } from '../../hooks';
import { ProgressiveImage, preloadImage } from '../ui';

/**
 * Normalize an image entry to a consistent { src, caption } object.
 * Supports both string URLs and { src, caption? } objects.
 * 
 * @param {string|Object} image - Image URL string or { src, caption } object
 * @returns {{ src: string, caption?: string }}
 */
const normalizeImage = (image) => {
  if (typeof image === 'string') {
    return { src: image };
  }
  return { src: image.src, caption: image.caption };
};

/**
 * Shared carousel component for horizontal image galleries.
 * Features progressive image loading with blur-up effect and
 * smart preloading of adjacent images for smooth scrolling.
 * 
 * @param {Object} props
 * @param {Array<string|{ src: string, caption?: string }>} props.images - Array of image URLs or objects with optional captions
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
  // Normalize all images to { src, caption } objects for consistent handling
  const normalizedImages = useMemo(
    () => images.map(normalizeImage),
    [images]
  );

  // Extract just the URLs for the carousel hook
  const imageUrls = useMemo(
    () => normalizedImages.map((img) => img.src),
    [normalizedImages]
  );

  const {
    trackRef,
    setItemRef,
    activeIndex,
    handleScroll,
  } = useCarousel({ items: imageUrls });

  // Preload adjacent images when active index changes
  useEffect(() => {
    if (!imageUrls.length) return;

    // Preload next 2 and previous 1 images for smooth scrolling
    const preloadIndices = [
      activeIndex - 1,
      activeIndex + 1,
      activeIndex + 2,
    ].filter((idx) => idx >= 0 && idx < imageUrls.length && idx !== activeIndex);

    preloadIndices.forEach((idx) => {
      preloadImage(imageUrls[idx]).catch(() => {
        // Silently fail - the ProgressiveImage will handle error state
      });
    });
  }, [activeIndex, imageUrls]);

  // Preload the first few images on mount for immediate display
  useEffect(() => {
    if (!imageUrls.length) return;
    
    // Preload first 3 images immediately
    const initialImages = imageUrls.slice(0, 3);
    initialImages.forEach((src) => {
      preloadImage(src).catch(() => {});
    });
  }, [imageUrls]);

  // Determine if an image should load eagerly based on proximity to active
  const shouldLoadEager = (idx) => {
    // First 2 images load eagerly, plus anything within 1 of active index
    return idx < 2 || Math.abs(idx - activeIndex) <= 1;
  };

  return (
    <div className={`carousel-container ${className}`}>
      <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
        {normalizedImages.map((image, idx) => (
          <div key={`carousel-wrapper-${idx}`} className="carousel-item-wrapper">
            <button
              type="button"
              className={`carousel-item ${activeIndex === idx ? 'is-active' : ''}`}
              onClick={() => onImageClick?.(image.src)}
              ref={setItemRef(idx)}
            >
              <ProgressiveImage
                src={image.src}
                alt={`${altPrefix} ${idx + 1}`}
                eager={shouldLoadEager(idx)}
              />
              {renderBadge?.(image.src, idx)}
            </button>
            {image.caption && (
              <p className="carousel-item-caption">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
