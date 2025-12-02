import { useCallback, useRef } from 'react';

/**
 * Lightweight hook for reliable tap feedback on iOS Safari.
 * Adds a CSS class immediately on touchstart for instant visual feedback,
 * removes it on touchend/touchcancel, and cancels if the user scrolls.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.activeClass - CSS class to apply (default: 'tap-active')
 * @param {number} options.moveThreshold - Pixels of movement before canceling (default: 10)
 * @returns {Object} - { getTapProps } function to spread onto interactive elements
 */
const useTapFeedback = ({
  activeClass = 'tap-active',
  moveThreshold = 10,
} = {}) => {
  const stateRef = useRef({
    startX: 0,
    startY: 0,
    activeEl: null,
  });

  const clearState = useCallback(() => {
    const state = stateRef.current;
    if (state.activeEl) {
      state.activeEl.classList.remove(activeClass);
      state.activeEl = null;
    }
  }, [activeClass]);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const state = stateRef.current;
    
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.activeEl = e.currentTarget;
    
    // Add class immediately for instant feedback
    e.currentTarget.classList.add(activeClass);
  }, [activeClass]);

  const handleTouchMove = useCallback((e) => {
    const state = stateRef.current;
    if (!state.activeEl) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - state.startX);
    const dy = Math.abs(touch.clientY - state.startY);

    // Cancel if user is scrolling
    if (dx > moveThreshold || dy > moveThreshold) {
      clearState();
    }
  }, [moveThreshold, clearState]);

  const handleTouchEnd = useCallback(() => {
    clearState();
  }, [clearState]);

  /**
   * Returns props to spread onto an interactive element.
   * Usage: <Link {...getTapProps()} to="/page">Link</Link>
   */
  const getTapProps = useCallback(() => ({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { getTapProps };
};

export default useTapFeedback;
