import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Progressive image component with blur-up loading effect.
 * Shows a smooth transition from placeholder to full image.
 * 
 * @param {Object} props
 * @param {string} props.src - Full resolution image URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Inline styles
 * @param {boolean} [props.eager] - Load immediately vs lazy
 * @param {Function} [props.onLoad] - Callback when image loads
 * @param {Function} [props.onError] - Callback on load error
 */
const ProgressiveImage = ({
  src,
  alt,
  className = '',
  style = {},
  eager = false,
  onLoad,
  onError,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (eager || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [eager]);

  // Preload the image
  useEffect(() => {
    if (!isInView || !src) return;

    // Check if already cached
    const img = new Image();
    
    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    // If image is in browser cache, it loads synchronously
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    // Check if already complete (cached)
    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, onLoad, onError]);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`progressive-image ${isLoaded ? 'is-loaded' : ''} ${hasError ? 'has-error' : ''} ${className}`}
      style={style}
    >
      {/* Shimmer/skeleton placeholder */}
      <div className="progressive-image__placeholder" aria-hidden="true" />
      
      {/* Actual image - only render when in view */}
      {isInView && src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="progressive-image__img"
          decoding="async"
          {...rest}
        />
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="progressive-image__error" aria-label="Failed to load image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>
      )}
    </div>
  );
};

/**
 * Preload an image programmatically.
 * Useful for preloading adjacent carousel images.
 * 
 * @param {string} src - Image URL to preload
 * @returns {Promise} - Resolves when loaded, rejects on error
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
    img.src = src;
  });
};

/**
 * Hook to preload multiple images.
 * 
 * @param {string[]} srcs - Array of image URLs to preload
 * @param {boolean} enabled - Whether to start preloading
 */
export const useImagePreloader = (srcs = [], enabled = true) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled || !srcs.length) return;

    let mounted = true;
    setLoadedCount(0);
    setIsComplete(false);

    const loadImages = async () => {
      for (const src of srcs) {
        if (!mounted) break;
        try {
          await preloadImage(src);
          if (mounted) {
            setLoadedCount((prev) => prev + 1);
          }
        } catch {
          // Continue loading other images even if one fails
          if (mounted) {
            setLoadedCount((prev) => prev + 1);
          }
        }
      }
      if (mounted) {
        setIsComplete(true);
      }
    };

    loadImages();

    return () => {
      mounted = false;
    };
  }, [srcs.join(','), enabled]);

  return {
    loadedCount,
    totalCount: srcs.length,
    isComplete,
    progress: srcs.length ? loadedCount / srcs.length : 1,
  };
};

export default ProgressiveImage;
