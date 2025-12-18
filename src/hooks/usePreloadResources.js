import { useEffect, useRef } from 'react';

/**
 * Import the image manifest to get optimized image URLs
 */
let imageManifest = {};
try {
  imageManifest = await import('../data/image-manifest.json');
  imageManifest = imageManifest.default || imageManifest;
} catch {
  // Manifest not available yet
}

/**
 * Get the best image URL for preloading (prefers WebP)
 */
const getPreloadUrl = (src) => {
  if (!src) return null;

  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
  const optimizedData = imageManifest[normalizedSrc];

  if (optimizedData?.webp) {
    // Get the largest WebP version
    const webpUrls = Object.entries(optimizedData.webp);
    if (webpUrls.length > 0) {
      const sorted = webpUrls.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
      return { url: sorted[0][1], type: 'image/webp' };
    }
  }

  // Fallback to original
  return { url: src, type: null };
};

/**
 * Hook to preload critical images using <link rel="preload">
 * This tells the browser to start fetching these resources immediately,
 * even before they're discovered in the DOM.
 *
 * Implements Rauch's "Predict behavior" principle.
 *
 * @param {string[]} imageSrcs - Array of image URLs to preload
 * @param {Object} options
 * @param {boolean} options.enabled - Whether to enable preloading (default: true)
 * @param {string} options.fetchpriority - Priority hint ('high', 'low', 'auto')
 */
const usePreloadImages = (imageSrcs = [], options = {}) => {
  const { enabled = true, fetchpriority = 'high' } = options;
  const preloadedRefs = useRef(new Set());

  useEffect(() => {
    if (!enabled || !imageSrcs.length) return;

    const links = [];

    for (const src of imageSrcs) {
      // Skip if already preloaded
      if (preloadedRefs.current.has(src)) continue;

      const preloadData = getPreloadUrl(src);
      if (!preloadData?.url) continue;

      // Check if a preload link already exists for this URL
      const existing = document.querySelector(
        `link[rel="preload"][href="${preloadData.url}"]`
      );
      if (existing) {
        preloadedRefs.current.add(src);
        continue;
      }

      // Create and inject preload link
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = preloadData.url;
      if (preloadData.type) {
        link.type = preloadData.type;
      }
      if (fetchpriority) {
        link.fetchPriority = fetchpriority;
      }

      document.head.appendChild(link);
      links.push(link);
      preloadedRefs.current.add(src);
    }

    // Cleanup on unmount (optional - preload links can persist)
    return () => {
      // We don't remove preload links since the browser has already
      // started fetching them. Removing would waste the work done.
    };
  }, [imageSrcs.join(','), enabled, fetchpriority]);
};

/**
 * Hook to prefetch resources for likely-to-visit pages
 * Uses <link rel="prefetch"> for lower priority background fetching
 *
 * @param {string[]} urls - Array of URLs to prefetch
 * @param {Object} options
 * @param {boolean} options.enabled - Whether to enable prefetching
 * @param {string} options.as - Resource type ('document', 'image', 'script', etc.)
 */
const usePrefetch = (urls = [], options = {}) => {
  const { enabled = true, as = 'document' } = options;
  const prefetchedRefs = useRef(new Set());

  useEffect(() => {
    if (!enabled || !urls.length) return;

    for (const url of urls) {
      // Skip if already prefetched
      if (prefetchedRefs.current.has(url)) continue;

      // Check if prefetch link already exists
      const existing = document.querySelector(
        `link[rel="prefetch"][href="${url}"]`
      );
      if (existing) {
        prefetchedRefs.current.add(url);
        continue;
      }

      // Create and inject prefetch link
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      if (as) {
        link.as = as;
      }

      document.head.appendChild(link);
      prefetchedRefs.current.add(url);
    }
  }, [urls.join(','), enabled, as]);
};

/**
 * Hook to prerender likely-to-visit pages
 * Uses the Speculation Rules API when available, falls back to prefetch
 *
 * @param {string[]} urls - Array of page URLs to prerender
 * @param {Object} options
 * @param {boolean} options.enabled - Whether to enable prerendering
 * @param {string} options.eagerness - Prerender eagerness ('immediate', 'eager', 'moderate', 'conservative')
 */
const usePrerender = (urls = [], options = {}) => {
  const { enabled = true, eagerness = 'moderate' } = options;
  const prerenderRef = useRef(null);

  useEffect(() => {
    if (!enabled || !urls.length) return;

    // Check if Speculation Rules API is supported
    if (HTMLScriptElement.supports?.('speculationrules')) {
      // Use Speculation Rules API for better prerendering
      const rules = {
        prerender: [
          {
            source: 'list',
            urls: urls,
            eagerness: eagerness,
          },
        ],
      };

      // Remove existing speculation rules script
      if (prerenderRef.current) {
        prerenderRef.current.remove();
      }

      const script = document.createElement('script');
      script.type = 'speculationrules';
      script.textContent = JSON.stringify(rules);
      document.head.appendChild(script);
      prerenderRef.current = script;

      return () => {
        if (prerenderRef.current) {
          prerenderRef.current.remove();
          prerenderRef.current = null;
        }
      };
    } else {
      // Fallback to prefetch for older browsers
      for (const url of urls) {
        const existing = document.querySelector(
          `link[rel="prefetch"][href="${url}"]`
        );
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          link.as = 'document';
          document.head.appendChild(link);
        }
      }
    }
  }, [urls.join(','), enabled, eagerness]);
};

export { usePreloadImages, usePrefetch, usePrerender };
export default usePreloadImages;
