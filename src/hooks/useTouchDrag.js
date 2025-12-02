import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Custom hook for draggable behavior with snap-back animation.
 * Works on BOTH touch devices (iOS/Android) and desktop (mouse).
 * 
 * Features:
 * - Distinguishing tap/click from drag gestures
 * - Preventing scroll interference during drag (touch)
 * - Preventing native image drag behavior (desktop)
 * - Smooth 60fps position updates with direct DOM manipulation
 * - Natural spring-like snap-back animation
 * - Haptic-like visual feedback (scale on drag)
 * - iOS SAFE AREA BOUNDS - prevents icon from going under status bar/home indicator
 * - VIEWPORT BOUNDS - keeps element within visible area on all devices
 * 
 * PERFORMANCE CRITICAL:
 * This hook uses direct DOM manipulation to achieve butter-smooth 60fps dragging.
 * Position updates bypass React's render cycle entirely:
 * 
 * 1. Position stored in ref (no re-renders)
 * 2. RAF loop reads ref and updates DOM directly via element.style.transform
 * 3. Transforms composed correctly: translate3d(x,y,0) scale(s)
 * 4. CSS transitions disabled during drag, enabled during snap-back
 * 5. Drag bounds clamped to respect iOS safe area insets + viewport
 * 
 * Why? React state updates → VDOM diffing → reconciliation adds 16-50ms lag,
 * causing visible jitter. Direct DOM manipulation is instantaneous (<5ms).
 * 
 * This is the same technique used by react-spring, framer-motion, etc.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether drag is currently enabled
 * @param {Function} options.onTap - Callback when gesture is detected as tap/click (not drag)
 * @param {number} options.dragThreshold - Pixels of movement before drag activates (default: 8)
 * @param {number} options.tapTimeout - Max ms for a touch to be considered a tap (default: 200)
 * @param {number} options.snapDuration - Duration of snap-back in ms (default: 450)
 * @param {number} options.dragScale - Scale factor during drag (default: 1.08)
 * @param {number} options.boundsPadding - Padding from viewport edges (default: 12)
 * @returns {Object} - { ref, isDragging, isSnapping }
 */
const useTouchDrag = ({
  enabled = true,
  onTap,
  dragThreshold = 8,
  tapTimeout = 200,
  snapDuration = 450,
  dragScale = 1.08,
  boundsPadding = 12,
} = {}) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  // Refs for tracking drag state without re-renders
  const dragState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isDragging: false,
    rafId: null,
    // For touch: track specific touch identifier
    touchId: null,
    // For mouse: track if mouse button is down
    mouseDown: false,
    // Input type for current drag session
    inputType: null, // 'touch' | 'mouse'
    // Bounds for clamping (calculated on drag start)
    bounds: {
      minX: -Infinity,
      maxX: Infinity,
      minY: -Infinity,
      maxY: Infinity,
    },
  });

  /**
   * Get iOS safe area insets from CSS custom properties.
   * These are set in tokens.css using env(safe-area-inset-*).
   * Falls back to 0 for desktop browsers (which is correct - no safe areas).
   */
  const getSafeAreaInsets = useCallback(() => {
    if (typeof window === 'undefined') {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    
    const style = getComputedStyle(document.documentElement);
    
    // Parse the CSS custom property values (e.g., "47px" → 47)
    const parseInset = (prop) => {
      const value = style.getPropertyValue(prop).trim();
      return parseInt(value, 10) || 0;
    };
    
    return {
      top: parseInset('--safe-area-inset-top'),
      right: parseInset('--safe-area-inset-right'),
      bottom: parseInset('--safe-area-inset-bottom'),
      left: parseInset('--safe-area-inset-left'),
    };
  }, []);

  /**
   * Calculate drag bounds based on element position, viewport, and safe areas.
   * Called on drag start to establish the "play area" for dragging.
   * Works for both touch (iOS safe areas) and desktop (viewport bounds).
   */
  const calculateBounds = useCallback((element) => {
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    const safeArea = getSafeAreaInsets();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = boundsPadding;
    
    // Account for scale: element grows by (scale - 1) * size / 2 on each side
    const scaleOffset = ((dragScale - 1) * Math.max(rect.width, rect.height)) / 2;
    const effectivePadding = padding + scaleOffset;
    
    // Effective viewport bounds (safe area + padding)
    // On desktop, safe area values are 0, so this just uses viewport + padding
    const minViewX = safeArea.left + effectivePadding;
    const maxViewX = vw - safeArea.right - effectivePadding;
    const minViewY = safeArea.top + effectivePadding;
    const maxViewY = vh - safeArea.bottom - effectivePadding;
    
    // Calculate max delta in each direction
    // For the element's left edge to stay >= minViewX: rect.left + deltaX >= minViewX
    // Therefore: deltaX >= minViewX - rect.left
    const minX = minViewX - rect.left;
    const maxX = maxViewX - rect.right;
    const minY = minViewY - rect.top;
    const maxY = maxViewY - rect.bottom;
    
    return { minX, maxX, minY, maxY };
  }, [getSafeAreaInsets, boundsPadding, dragScale]);

  /**
   * Clamp delta values within calculated bounds.
   */
  const clampDelta = useCallback((rawX, rawY, bounds) => {
    const { minX, maxX, minY, maxY } = bounds;
    return {
      x: Math.max(minX, Math.min(maxX, rawX)),
      y: Math.max(minY, Math.min(maxY, rawY)),
    };
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
    const state = dragState.current;
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

  /**
   * Common drag start logic for both touch and mouse.
   */
  const startDrag = useCallback((clientX, clientY, inputType, touchId = null) => {
    const state = dragState.current;
    const element = ref.current;

    state.startX = clientX;
    state.startY = clientY;
    state.currentX = clientX;
    state.currentY = clientY;
    state.deltaX = 0;
    state.deltaY = 0;
    state.startTime = Date.now();
    state.isDragging = false;
    state.inputType = inputType;
    state.touchId = touchId;
    state.mouseDown = inputType === 'mouse';

    // Calculate bounds for this drag session
    const bounds = calculateBounds(element);
    if (bounds) {
      state.bounds = bounds;
    }

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
  }, [calculateBounds]);

  /**
   * Common drag move logic for both touch and mouse.
   * Returns true if drag was activated, false otherwise.
   */
  const moveDrag = useCallback((clientX, clientY) => {
    const state = dragState.current;
    
    // Update current position
    state.currentX = clientX;
    state.currentY = clientY;

    // Calculate raw deltas
    const rawDeltaX = state.currentX - state.startX;
    const rawDeltaY = state.currentY - state.startY;
    
    // Clamp deltas to stay within safe area bounds
    const clamped = clampDelta(rawDeltaX, rawDeltaY, state.bounds);
    state.deltaX = clamped.x;
    state.deltaY = clamped.y;
    
    // Use raw distance for threshold check
    const distance = Math.sqrt(rawDeltaX * rawDeltaX + rawDeltaY * rawDeltaY);

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
      return true; // Drag activated
    }
    
    return false;
  }, [clampDelta, dragThreshold, updatePosition]);

  /**
   * Common drag end logic for both touch and mouse.
   */
  const endDrag = useCallback(() => {
    const state = dragState.current;

    // Cancel animation frame
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    const elapsed = Date.now() - state.startTime;
    const distance = Math.sqrt(state.deltaX * state.deltaX + state.deltaY * state.deltaY);

    // Determine if this was a tap/click or drag
    if (!state.isDragging && distance < dragThreshold && elapsed < tapTimeout) {
      // It's a tap/click!
      onTap?.();
    } else if (state.isDragging) {
      // End drag, trigger snap-back
      snapBack();
    }

    // Reset state
    state.isDragging = false;
    state.touchId = null;
    state.mouseDown = false;
    state.inputType = null;
    state.deltaX = 0;
    state.deltaY = 0;
    setIsDragging(false);
  }, [dragThreshold, tapTimeout, onTap, snapBack]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUCH EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    
    // Only handle single touch
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, 'touch', touch.identifier);
  }, [enabled, startDrag]);

  const handleTouchMove = useCallback((e) => {
    if (!enabled) return;

    const state = dragState.current;
    if (state.inputType !== 'touch') return;
    
    // Find our tracked touch
    const touch = Array.from(e.touches).find(
      t => t.identifier === state.touchId
    );
    if (!touch) return;

    const activated = moveDrag(touch.clientX, touch.clientY);
    
    // Prevent default to stop scroll when drag activates or is active
    if (activated || state.isDragging) {
      e.preventDefault();
    }
  }, [enabled, moveDrag]);

  const handleTouchEnd = useCallback((e) => {
    if (!enabled) return;

    const state = dragState.current;
    if (state.inputType !== 'touch') return;

    // Verify this is our tracked touch ending
    const touch = Array.from(e.changedTouches).find(
      t => t.identifier === state.touchId
    );
    if (!touch) return;

    e.preventDefault(); // Prevent click event from also firing
    endDrag();
  }, [enabled, endDrag]);

  const handleTouchCancel = useCallback(() => {
    const state = dragState.current;
    if (state.inputType !== 'touch') return;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    if (state.isDragging) {
      snapBack();
    }

    state.isDragging = false;
    state.touchId = null;
    state.inputType = null;
    setIsDragging(false);
  }, [snapBack]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MOUSE EVENT HANDLERS (Desktop)
  // ═══════════════════════════════════════════════════════════════════════════

  const handleMouseDown = useCallback((e) => {
    if (!enabled) return;
    
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    // Prevent native image drag behavior
    e.preventDefault();
    
    startDrag(e.clientX, e.clientY, 'mouse');
  }, [enabled, startDrag]);

  // Mouse move handler - attached to document to track outside element
  const handleMouseMove = useCallback((e) => {
    const state = dragState.current;
    if (!state.mouseDown || state.inputType !== 'mouse') return;

    moveDrag(e.clientX, e.clientY);
  }, [moveDrag]);

  // Mouse up handler - attached to document to catch release anywhere
  const handleMouseUp = useCallback((e) => {
    const state = dragState.current;
    if (!state.mouseDown || state.inputType !== 'mouse') return;

    // Only handle left mouse button
    if (e.button !== 0) return;

    endDrag();
  }, [endDrag]);

  // Handle mouse leaving window (treat as cancel)
  const handleMouseLeave = useCallback((e) => {
    const state = dragState.current;
    if (!state.mouseDown || state.inputType !== 'mouse') return;

    // Only trigger if leaving the document entirely
    if (e.relatedTarget === null) {
      if (state.isDragging) {
        snapBack();
      }
      state.mouseDown = false;
      state.inputType = null;
      setIsDragging(false);
    }
  }, [snapBack]);

  // Prevent context menu on right-click during drag
  const handleContextMenu = useCallback((e) => {
    const state = dragState.current;
    if (state.isDragging) {
      e.preventDefault();
    }
  }, []);

  // Prevent native drag behavior on the element
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Attach event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // ─────────────────────────────────────────────────────────────────────────
    // TOUCH EVENTS (on element)
    // ─────────────────────────────────────────────────────────────────────────
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    // ─────────────────────────────────────────────────────────────────────────
    // MOUSE EVENTS
    // mousedown on element, move/up on document (to track outside element)
    // ─────────────────────────────────────────────────────────────────────────
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('dragstart', handleDragStart); // Prevent native drag
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('contextmenu', handleContextMenu);

    // Set cursor style to indicate draggable
    element.style.cursor = 'grab';
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';

    return () => {
      // Touch cleanup
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);

      // Mouse cleanup
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('contextmenu', handleContextMenu);

      // Reset element styles
      element.style.cursor = '';
      element.style.userSelect = '';
      element.style.webkitUserSelect = '';

      // Cleanup any pending animation frame and reset element
      const state = dragState.current;
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
      }
      if (element) {
        element.style.transform = '';
        element.style.transition = '';
        element.style.willChange = '';
      }
    };
  }, [
    enabled,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleContextMenu,
    handleDragStart,
  ]);

  // Update cursor during drag
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    
    if (isDragging) {
      element.style.cursor = 'grabbing';
    } else {
      element.style.cursor = 'grab';
    }
  }, [isDragging, enabled]);

  return {
    ref,
    isDragging,
    isSnapping,
  };
};

export default useTouchDrag;
