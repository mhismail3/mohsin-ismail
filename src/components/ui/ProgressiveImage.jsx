import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Import the image manifest (generated at build time)
// Falls back to empty object if not yet generated
let imageManifest = {};
try {
  imageManifest = await import('../../data/image-manifest.json');
  imageManifest = imageManifest.default || imageManifest;
} catch {
  // Manifest not available yet (dev mode before first build)
}

/**
 * Get optimized image data from manifest
 * Returns null if no optimized version exists
 */
const getOptimizedImage = (src) => {
  if (!src || !imageManifest) return null;

  // Normalize the path to match manifest keys
  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;

  return imageManifest[normalizedSrc] || null;
};

/**
 * Build srcset string from manifest data
 */
const buildSrcset = (optimizedData, useWebP = false) => {
  if (!optimizedData) return '';

  const sources = useWebP ? optimizedData.webp : optimizedData.srcset;
  if (!sources || Object.keys(sources).length === 0) return '';

  return Object.entries(sources)
    .map(([width, url]) => `${url} ${width}w`)
    .join(', ');
};

/**
 * Default sizes attribute for responsive images
 * Can be overridden via props
 */
const DEFAULT_SIZES = '(max-width: 480px) 400px, (max-width: 768px) 800px, 1200px';

/**
 * Progressive image component with blur-up loading effect.
 * Supports responsive images via srcset, WebP with fallback,
 * and blur placeholder (LQIP) for instant perceived loading.
 *
 * @param {Object} props
 * @param {string} props.src - Full resolution image URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Inline styles
 * @param {boolean} [props.eager] - Load immediately vs lazy
 * @param {string} [props.sizes] - Responsive sizes attribute
 * @param {Function} [props.onLoad] - Callback when image loads
 * @param {Function} [props.onError] - Callback on load error
 */
const ProgressiveImage = ({
  src,
  alt,
  className = '',
  style = {},
  eager = false,
  sizes = DEFAULT_SIZES,
  onLoad,
  onError,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Get optimized image data from manifest
  const optimizedData = useMemo(() => getOptimizedImage(src), [src]);

  // Build srcset strings
  const webpSrcset = useMemo(
    () => buildSrcset(optimizedData, true),
    [optimizedData]
  );
  const fallbackSrcset = useMemo(
    () => buildSrcset(optimizedData, false),
    [optimizedData]
  );

  // Get blur placeholder
  const blurPlaceholder = optimizedData?.blur || null;

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

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Check if image is already loaded from cache
  // This handles the case where onLoad fires before React attaches the handler
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && !isLoaded) {
      setIsLoaded(true);
    }
  });

  // Calculate aspect ratio for placeholder sizing
  const aspectRatio = optimizedData?.width && optimizedData?.height
    ? optimizedData.width / optimizedData.height
    : null;

  const placeholderStyle = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : {};

  // Determine if we have optimized versions available
  const hasOptimizedVersions = webpSrcset || fallbackSrcset;

  return (
    <div
      ref={containerRef}
      className={`progressive-image ${isLoaded ? 'is-loaded' : ''} ${hasError ? 'has-error' : ''} ${blurPlaceholder ? 'has-blur' : ''} ${className}`}
      style={style}
    >
      {/* Blur placeholder (LQIP) - shown until image loads */}
      {blurPlaceholder && !isLoaded && (
        <div
          className="progressive-image__blur"
          style={{
            backgroundImage: `url(${blurPlaceholder})`,
            ...placeholderStyle,
          }}
          aria-hidden="true"
        />
      )}

      {/* Shimmer/skeleton placeholder - fallback when no blur available */}
      {!blurPlaceholder && !isLoaded && (
        <div
          className="progressive-image__placeholder"
          style={placeholderStyle}
          aria-hidden="true"
        />
      )}

      {/* Actual image - using picture element for WebP with fallback */}
      {isInView && src && !hasError && (
        hasOptimizedVersions ? (
          <picture>
            {/* WebP sources for modern browsers */}
            {webpSrcset && (
              <source
                type="image/webp"
                srcSet={webpSrcset}
                sizes={sizes}
              />
            )}
            {/* Fallback srcset for older browsers */}
            {fallbackSrcset && (
              <source
                srcSet={fallbackSrcset}
                sizes={sizes}
              />
            )}
            {/* Base img element */}
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              className="progressive-image__img"
              decoding="async"
              loading={eager ? 'eager' : 'lazy'}
              onLoad={handleLoad}
              onError={handleError}
              {...rest}
            />
          </picture>
        ) : (
          // No optimized versions - use original image
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className="progressive-image__img"
            decoding="async"
            loading={eager ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            {...rest}
          />
        )
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
 * Now supports preloading WebP versions when available.
 *
 * @param {string} src - Image URL to preload
 * @param {boolean} preferWebP - Prefer WebP version if available
 * @returns {Promise} - Resolves when loaded, rejects on error
 */
export const preloadImage = (src, preferWebP = true) => {
  return new Promise((resolve, reject) => {
    // Check if we have an optimized WebP version
    const optimizedData = getOptimizedImage(src);

    let urlToPreload = src;

    if (preferWebP && optimizedData?.webp) {
      // Get the largest WebP version available
      const webpUrls = Object.entries(optimizedData.webp);
      if (webpUrls.length > 0) {
        // Sort by width descending and get largest
        const sorted = webpUrls.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
        urlToPreload = sorted[0][1];
      }
    }

    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
    img.src = urlToPreload;
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

/**
 * Get the blur placeholder for an image (useful for custom implementations)
 */
export const getBlurPlaceholder = (src) => {
  const optimizedData = getOptimizedImage(src);
  return optimizedData?.blur || null;
};

/**
 * Check if optimized versions exist for an image
 */
export const hasOptimizedVersion = (src) => {
  return getOptimizedImage(src) !== null;
};

export default ProgressiveImage;
