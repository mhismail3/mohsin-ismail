import { useEffect, useRef } from 'react';

/**
 * Custom hook for touch-and-hold hover effect.
 * Applies a CSS class when user touches and holds on an element,
 * but cancels if they start scrolling.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.selector - CSS selector for target elements (e.g., '.project-card', 'IMG')
 * @param {string} options.hoverClass - CSS class to apply on touch-hold (default: 'touch-hover')
 * @param {number} options.holdDelay - Delay in ms before applying hover class (default: 120)
 * @param {number} options.moveThreshold - Pixel movement threshold to cancel (default: 10)
 * @returns {Object} - { containerRef } to attach to the container element
 */
const useTouchHover = ({
  selector,
  hoverClass = 'touch-hover',
  holdDelay = 120,
  moveThreshold = 10,
} = {}) => {
  const containerRef = useRef(null);
  const touchStateRef = useRef({
    timer: null,
    startX: 0,
    startY: 0,
    activeEl: null,
  });

  useEffect(() => {
    if (!containerRef.current || !selector) return;

    const container = containerRef.current;
    const state = touchStateRef.current;

    const clearTouchState = () => {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      if (state.activeEl) {
        state.activeEl.classList.remove(hoverClass);
        state.activeEl = null;
      }
    };

    const handleTouchStart = (e) => {
      // Find the target element using the selector
      const target = selector.toUpperCase() === e.target.tagName
        ? e.target
        : e.target.closest(selector);
      
      if (!target) return;

      const touch = e.touches[0];
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.activeEl = target;

      state.timer = setTimeout(() => {
        if (state.activeEl) {
          state.activeEl.classList.add(hoverClass);
        }
      }, holdDelay);
    };

    const handleTouchMove = (e) => {
      if (!state.timer && !state.activeEl?.classList.contains(hoverClass)) return;

      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - state.startX);
      const dy = Math.abs(touch.clientY - state.startY);

      if (dx > moveThreshold || dy > moveThreshold) {
        clearTouchState();
      }
    };

    const handleTouchEnd = () => {
      clearTouchState();
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      clearTouchState();
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [selector, hoverClass, holdDelay, moveThreshold]);

  return { containerRef };
};

export default useTouchHover;


