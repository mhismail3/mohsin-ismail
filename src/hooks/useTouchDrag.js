import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Custom hook for touch-only draggable behavior with snap-back animation.
 * Designed specifically for iOS Safari with careful attention to:
 * - Distinguishing tap from drag gestures
 * - Preventing scroll interference during drag
 * - Smooth 60fps position updates with direct DOM manipulation
 * - Natural spring-like snap-back animation
 * - Haptic-like visual feedback
 * 
 * PERFORMANCE CRITICAL:
 * This hook uses direct DOM manipulation to achieve butter-smooth 60fps dragging.
 * Position updates bypass React's render cycle entirely:
 * 
 * 1. Touch position stored in ref (no re-renders)
 * 2. RAF loop reads ref and updates DOM directly via element.style.transform
 * 3. Transforms composed correctly: translate3d(x,y,0) scale(s)
 * 4. CSS transitions disabled during drag, enabled during snap-back
 * 
 * Why? React state updates → VDOM diffing → reconciliation adds 16-50ms lag,
 * causing visible jitter. Direct DOM manipulation is instantaneous (<5ms).
 * 
 * This is the same technique used by react-spring, framer-motion, etc.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether drag is currently enabled
 * @param {Function} options.onTap - Callback when gesture is detected as tap (not drag)
 * @param {number} options.dragThreshold - Pixels of movement before drag activates (default: 8)
 * @param {number} options.tapTimeout - Max ms for a touch to be considered a tap (default: 200)
 * @param {number} options.snapDuration - Duration of snap-back in ms (default: 450)
 * @param {number} options.dragScale - Scale factor during drag (default: 1.08)
 * @returns {Object} - { ref, isDragging, isSnapping }
 */
const useTouchDrag = ({
  enabled = true,
  onTap,
  dragThreshold = 8,
  tapTimeout = 200,
  snapDuration = 450,
  dragScale = 1.08,
} = {}) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  // Refs for tracking touch state without re-renders
  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isDragging: false,
    rafId: null,
    identifier: null, // Track the specific touch
  });

  // Check if device has touch capability (coarse pointer = touch/stylus)
  const isTouchDevice = useRef(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Primary check: coarse pointer (finger/stylus)
      // Secondary: hover: none (touch-only devices)
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const hasNoHover = window.matchMedia('(hover: none)').matches;
      isTouchDevice.current = hasCoarsePointer || hasNoHover;
    }
  }, []);

  // Apply transform directly to DOM for maximum responsiveness
  const applyTransform = useCallback((x, y, scale) => {
    const element = ref.current;
    if (!element) return;
    
    // Compose transform: translate first, then scale
    // This ensures the scale doesn't affect the translation
    const transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    element.style.transform = transform;
    // Force GPU acceleration
    element.style.willChange = 'transform';
  }, []);

  // Update position smoothly using requestAnimationFrame
  const updatePosition = useCallback(() => {
    const state = touchState.current;
    if (!state.isDragging) return;

    // Apply the transform directly to DOM - bypass React render cycle
    applyTransform(state.deltaX, state.deltaY, dragScale);
    
    state.rafId = requestAnimationFrame(updatePosition);
  }, [applyTransform, dragScale]);

  // Start snap-back animation
  const snapBack = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    
    setIsSnapping(true);
    
    // Apply CSS transition for snap-back
    const transition = `transform ${snapDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
    element.style.transition = transition;
    
    // Return to origin with scale 1
    applyTransform(0, 0, 1);
    
    // Clear snapping state after animation completes
    setTimeout(() => {
      setIsSnapping(false);
      element.style.transition = '';
      element.style.willChange = '';
    }, snapDuration);
  }, [snapDuration, applyTransform]);

  // Touch start handler
  const handleTouchStart = useCallback((e) => {
    if (!enabled || !isTouchDevice.current) return;
    
    // Only handle single touch
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const state = touchState.current;
    const element = ref.current;

    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.currentX = touch.clientX;
    state.currentY = touch.clientY;
    state.deltaX = 0;
    state.deltaY = 0;
    state.startTime = Date.now();
    state.isDragging = false;
    state.identifier = touch.identifier;

    // Cancel any existing animation frame
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    // Reset snap state if re-grabbing during snap
    if (element) {
      element.style.transition = '';
    }
    setIsSnapping(false);
  }, [enabled]);

  // Touch move handler
  const handleTouchMove = useCallback((e) => {
    if (!enabled || !isTouchDevice.current) return;

    const state = touchState.current;
    
    // Find our tracked touch
    const touch = Array.from(e.touches).find(
      t => t.identifier === state.identifier
    );
    if (!touch) return;

    // Update current position
    state.currentX = touch.clientX;
    state.currentY = touch.clientY;

    // Calculate deltas
    state.deltaX = state.currentX - state.startX;
    state.deltaY = state.currentY - state.startY;
    const distance = Math.sqrt(state.deltaX * state.deltaX + state.deltaY * state.deltaY);

    // If we've moved past threshold, activate drag mode
    if (!state.isDragging && distance > dragThreshold) {
      state.isDragging = true;
      setIsDragging(true);

      const element = ref.current;
      if (element) {
        // Disable transitions during drag for immediate response
        element.style.transition = 'none';
      }
      
      // Start the animation loop immediately
      state.rafId = requestAnimationFrame(updatePosition);
      
      // Prevent default to stop scroll
      e.preventDefault();
    }

    // If dragging, prevent default to stop scroll (non-passive listener needed)
    if (state.isDragging) {
      e.preventDefault();
    }
  }, [enabled, dragThreshold, updatePosition]);

  // Touch end handler
  const handleTouchEnd = useCallback((e) => {
    if (!enabled || !isTouchDevice.current) return;

    const state = touchState.current;

    // Verify this is our tracked touch ending
    const touch = Array.from(e.changedTouches).find(
      t => t.identifier === state.identifier
    );
    if (!touch) return;

    // Cancel animation frame
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    const elapsed = Date.now() - state.startTime;
    const distance = Math.sqrt(state.deltaX * state.deltaX + state.deltaY * state.deltaY);

    // Determine if this was a tap or drag
    if (!state.isDragging && distance < dragThreshold && elapsed < tapTimeout) {
      // It's a tap!
      e.preventDefault(); // Prevent click event duplication
      onTap?.();
    } else if (state.isDragging) {
      // End drag, trigger snap-back
      e.preventDefault();
      snapBack();
    }

    // Reset state
    state.isDragging = false;
    state.identifier = null;
    state.deltaX = 0;
    state.deltaY = 0;
    setIsDragging(false);
  }, [enabled, dragThreshold, tapTimeout, onTap, snapBack]);

  // Touch cancel handler (iOS can fire this during gesture conflicts)
  const handleTouchCancel = useCallback(() => {
    const state = touchState.current;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    if (state.isDragging) {
      snapBack();
    }

    state.isDragging = false;
    state.identifier = null;
    setIsDragging(false);
  }, [snapBack]);

  // Attach touch listeners with proper options
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // touchstart and touchend can be passive
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    
    // touchmove must be non-passive to allow preventDefault during drag
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);

      // Cleanup any pending animation frame and reset element
      const state = touchState.current;
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
      }
      if (element) {
        element.style.transform = '';
        element.style.transition = '';
        element.style.willChange = '';
      }
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return {
    ref,
    isDragging,
    isSnapping,
  };
};

export default useTouchDrag;
