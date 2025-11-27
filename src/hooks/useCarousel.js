import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook for carousel scroll behavior and active item tracking.
 * Handles mouse-driven auto-scroll on desktop and active item detection.
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.items - Array of items to display in carousel
 * @param {boolean} options.isTouch - Whether device is touch-enabled
 * @returns {Object} - { trackRef, itemRefs, activeIndex, handleScroll, handleMouseMove, handleMouseLeave }
 */
const useCarousel = ({ items = [], isTouch = false } = {}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const requestRef = useRef(null);
  const activeRafRef = useRef(null);
  const mouseXRef = useRef(0);
  const isHoveringRef = useRef(false);

  // Reset refs when items change
  useEffect(() => {
    itemRefs.current = [];
    setActiveIndex(0);
  }, [items]);

  // Calculate which item is closest to center
  const updateActiveItem = useCallback(() => {
    const track = trackRef.current;
    if (!track || !items.length) return;

    const centerX = track.scrollLeft + track.clientWidth / 2;

    let closestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((node, idx) => {
      if (!node) return;
      const itemCenter = node.offsetLeft + node.offsetWidth / 2;
      const distance = Math.abs(itemCenter - centerX);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
  }, [items.length]);

  // Initial active item calculation
  useEffect(() => {
    const id = requestAnimationFrame(updateActiveItem);
    return () => cancelAnimationFrame(id);
  }, [updateActiveItem, items.length]);

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

  // Animation loop for mouse-driven scrolling
  const animate = useCallback(() => {
    if (isTouch || !trackRef.current || !isHoveringRef.current) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const container = trackRef.current;
    const { left, width } = container.getBoundingClientRect();
    const centerX = left + width / 2;

    // Calculate distance from center (-1 to 1)
    const delta = (mouseXRef.current - centerX) / (width / 2);

    // Apply deadzone in the middle
    if (Math.abs(delta) > 0.1) {
      const speed = delta * 8;
      container.scrollLeft += speed;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isTouch]);

  // Start animation loop
  useEffect(() => {
    if (!isTouch) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTouch, animate]);

  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    mouseXRef.current = e.clientX;
    isHoveringRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
  }, []);

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
    handleMouseMove,
    handleMouseLeave,
  };
};

export default useCarousel;



