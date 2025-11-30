import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Custom hook for carousel scroll behavior and active item tracking.
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Array of items to display in carousel
 * @returns {Object} - { trackRef, setItemRef, activeIndex, handleScroll }
 */
const useCarousel = ({ items = [] } = {}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const activeRafRef = useRef(null);

  // Calculate which item is closest to center, with edge case handling
  const updateActiveItem = useCallback(() => {
    const track = trackRef.current;
    if (!track || !items.length) return;

    const { scrollLeft, clientWidth, scrollWidth } = track;
    const edgeThreshold = 5; // pixels of tolerance for edge detection

    // Edge case: scrolled all the way to the left
    if (scrollLeft <= edgeThreshold) {
      setActiveIndex((prev) => (prev === 0 ? prev : 0));
      return;
    }

    // Edge case: scrolled all the way to the right
    if (scrollLeft + clientWidth >= scrollWidth - edgeThreshold) {
      const lastIndex = items.length - 1;
      setActiveIndex((prev) => (prev === lastIndex ? prev : lastIndex));
      return;
    }

    // Normal case: find item closest to center
    const centerX = scrollLeft + clientWidth / 2;

    let closestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    // Use bounded loop to avoid stale refs from previous item arrays
    for (let idx = 0; idx < items.length; idx++) {
      const node = itemRefs.current[idx];
      if (!node) continue;
      const itemCenter = node.offsetLeft + node.offsetWidth / 2;
      const distance = Math.abs(itemCenter - centerX);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = idx;
      }
    }

    setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
  }, [items.length]);

  // Initial/updated active item calculation - useLayoutEffect for synchronous DOM measurement
  useLayoutEffect(() => {
    updateActiveItem();
  }, [updateActiveItem]);

  // Handle scroll events with RAF throttling
  const handleScroll = useCallback(() => {
    if (activeRafRef.current) return;
    activeRafRef.current = requestAnimationFrame(() => {
      activeRafRef.current = null;
      updateActiveItem();
    });
  }, [updateActiveItem]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => updateActiveItem();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (activeRafRef.current) {
        cancelAnimationFrame(activeRafRef.current);
        activeRafRef.current = null;
      }
    };
  }, [updateActiveItem]);

  // Create ref callback for items
  const setItemRef = useCallback((index) => (el) => {
    itemRefs.current[index] = el;
  }, []);

  return {
    trackRef,
    itemRefs,
    setItemRef,
    activeIndex,
    handleScroll,
  };
};

export default useCarousel;



