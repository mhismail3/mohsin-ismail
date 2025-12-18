import { useCallback, useRef } from 'react';

/**
 * Hook for cursor/touch-following shimmer effect on text.
 * Updates CSS variables based on pointer position:
 *   --shimmer-x: horizontal position (0-100%)
 *   --shimmer-width: band width (0% hidden, 25% visible) for fade in/out
 *
 * Desktop: Shimmer follows cursor on hover
 * Touch: Shimmer follows finger drag, or sweeps across on tap
 *
 * @returns {Object} - { shimmerRef, shimmerHandlers }
 *   - shimmerRef: Attach to the element
 *   - shimmerHandlers: Spread onto the element (mouse + touch events)
 */
export function useShimmerFollow() {
  const shimmerRef = useRef(null);
  const isActiveRef = useRef(false);
  const touchStartRef = useRef({ x: 0, time: 0 });
  const sweepAnimationRef = useRef(null);

  // Helper to calculate X position as percentage
  const getXPercent = useCallback((clientX) => {
    const el = shimmerRef.current;
    if (!el) return 50;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, x));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // MOUSE HANDLERS (Desktop)
  // ─────────────────────────────────────────────────────────────────────────────

  const handleMouseEnter = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el) return;

    // Cancel any ongoing sweep animation
    if (sweepAnimationRef.current) {
      cancelAnimationFrame(sweepAnimationRef.current);
      sweepAnimationRef.current = null;
    }

    isActiveRef.current = true;

    // Remove hidden class to enable gradient
    el.classList.remove('shimmer-hidden');
    
    const clampedX = getXPercent(e.clientX);
    el.style.setProperty('--shimmer-x', `${clampedX}%`);
    el.style.setProperty('--shimmer-width', '25%');
  }, [getXPercent]);

  const handleMouseMove = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el) return;

    const clampedX = getXPercent(e.clientX);
    el.style.setProperty('--shimmer-x', `${clampedX}%`);

    // Ensure width is set (in case mouseenter was missed)
    if (isActiveRef.current && el.style.getPropertyValue('--shimmer-width') !== '25%') {
      el.style.setProperty('--shimmer-width', '25%');
    }
  }, [getXPercent]);

  const handleMouseLeave = useCallback(() => {
    const el = shimmerRef.current;
    if (!el) return;

    isActiveRef.current = false;
    el.style.setProperty('--shimmer-width', '0%');
    // Add hidden class to show solid base color (no gradient)
    el.classList.add('shimmer-hidden');
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // TOUCH HANDLERS (Mobile/Tablet)
  // ─────────────────────────────────────────────────────────────────────────────

  // Animate a sweep across the title (for tap gesture)
  const animateSweep = useCallback((startX) => {
    const el = shimmerRef.current;
    if (!el) return;

    // Determine sweep direction based on tap position
    // Tap on left side → sweep right, tap on right side → sweep left
    const sweepLeft = startX > 50;
    const startPos = sweepLeft ? 100 : 0;
    const endPos = sweepLeft ? 0 : 100;

    const duration = 400; // ms
    const startTime = performance.now();

    // Disable CSS transition during JS-driven animation
    el.classList.add('shimmer-sweeping');

    // Show shimmer immediately at start position
    el.style.setProperty('--shimmer-x', `${startPos}%`);
    el.style.setProperty('--shimmer-width', '25%');

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentX = startPos + (endPos - startPos) * eased;
      el.style.setProperty('--shimmer-x', `${currentX}%`);

      if (progress < 1) {
        sweepAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // Re-enable CSS transitions, then fade out
        el.classList.remove('shimmer-sweeping');
        el.style.setProperty('--shimmer-width', '0%');
        sweepAnimationRef.current = null;
      }
    };

    sweepAnimationRef.current = requestAnimationFrame(animate);
  }, []);

  const handleTouchStart = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el) return;

    // Cancel any ongoing sweep animation
    if (sweepAnimationRef.current) {
      cancelAnimationFrame(sweepAnimationRef.current);
      sweepAnimationRef.current = null;
    }

    const touch = e.touches[0];
    const clampedX = getXPercent(touch.clientX);

    // Store touch start info for tap detection
    touchStartRef.current = {
      x: touch.clientX,
      time: performance.now(),
    };

    isActiveRef.current = true;
    el.style.setProperty('--shimmer-x', `${clampedX}%`);
    el.style.setProperty('--shimmer-width', '25%');
  }, [getXPercent]);

  const handleTouchMove = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el || !isActiveRef.current) return;

    const touch = e.touches[0];
    const clampedX = getXPercent(touch.clientX);
    el.style.setProperty('--shimmer-x', `${clampedX}%`);
  }, [getXPercent]);

  const handleTouchEnd = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el) return;

    const endTime = performance.now();
    const touchDuration = endTime - touchStartRef.current.time;

    // Check if this was a quick tap (< 200ms and minimal movement)
    // changedTouches contains the touch that ended
    const endTouch = e.changedTouches[0];
    const moveDistance = Math.abs(endTouch.clientX - touchStartRef.current.x);

    const isTap = touchDuration < 200 && moveDistance < 20;

    isActiveRef.current = false;

    if (isTap) {
      // Trigger sweep animation on tap
      const tapX = getXPercent(endTouch.clientX);
      animateSweep(tapX);
    } else {
      // Regular touch end - fade out
      el.style.setProperty('--shimmer-width', '0%');
    }
  }, [getXPercent, animateSweep]);

  const handleTouchCancel = useCallback(() => {
    const el = shimmerRef.current;
    if (!el) return;

    isActiveRef.current = false;
    el.style.setProperty('--shimmer-width', '0%');
  }, []);

  return {
    shimmerRef,
    shimmerHandlers: {
      // Mouse events (desktop)
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      // Touch events (mobile/tablet)
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}

/**
 * Hook for container-level shimmer effect that applies to multiple elements.
 * Tracks mouse position on a container and applies shimmer to multiple target elements.
 * Each target element gets its own shimmer position calculated relative to its bounds.
 *
 * Performance optimizations:
 * - Caches bounding rects on mouseenter (avoids layout thrashing)
 * - Uses requestAnimationFrame for smooth 60fps updates
 * - Batches all element updates in a single frame
 *
 * Desktop only - no touch support (use useShimmerFollow for touch).
 *
 * @returns {Object} - { containerHandlers, registerTarget, clearTargets }
 *   - containerHandlers: Spread onto the container element (e.g., .post-head)
 *   - registerTarget: Function to register a target element ref
 *   - clearTargets: Function to clear all registered targets
 */
export function useShimmerFollowGroup() {
  const targetsRef = useRef([]);
  const rectsRef = useRef(new Map()); // Cached bounding rects
  const isActiveRef = useRef(false);
  const rafRef = useRef(null);
  const pendingClientX = useRef(null);

  // Register a target element for shimmer effect
  const registerTarget = useCallback((element) => {
    if (element && !targetsRef.current.includes(element)) {
      targetsRef.current.push(element);
      // Start with shimmer hidden (no gradient visible on page load)
      element.classList.add('shimmer-hidden');
    }
  }, []);

  // Clear all registered targets
  const clearTargets = useCallback(() => {
    targetsRef.current = [];
    rectsRef.current.clear();
  }, []);

  // Cache all bounding rects (call on mouseenter, before any animation)
  const cacheRects = useCallback(() => {
    rectsRef.current.clear();
    targetsRef.current.forEach((el) => {
      if (el) {
        rectsRef.current.set(el, el.getBoundingClientRect());
      }
    });
  }, []);

  // Calculate X position using cached rect (no layout thrashing)
  const getXPercentCached = useCallback((clientX, element) => {
    const rect = rectsRef.current.get(element);
    if (!rect) return 50;
    const x = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, x));
  }, []);

  // Apply shimmer to all registered targets (called in RAF)
  const applyShimmerFrame = useCallback(() => {
    const clientX = pendingClientX.current;
    if (clientX === null) return;
    
    targetsRef.current.forEach((el) => {
      if (!el) return;
      const clampedX = getXPercentCached(clientX, el);
      el.style.setProperty('--shimmer-x', `${clampedX}%`);
    });
    
    rafRef.current = null;
  }, [getXPercentCached]);

  // Schedule a shimmer update for the next frame
  const scheduleUpdate = useCallback((clientX) => {
    pendingClientX.current = clientX;
    
    // Only schedule if we don't already have a pending frame
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(applyShimmerFrame);
    }
  }, [applyShimmerFrame]);

  // Clear shimmer from all registered targets
  const clearShimmer = useCallback(() => {
    // Cancel any pending frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    targetsRef.current.forEach((el) => {
      if (!el) return;
      // Start fade-out transition by setting width to 0%
      el.style.setProperty('--shimmer-width', '0%');
      // Delay adding shimmer-hidden class until after the CSS transition completes
      // This allows the --shimmer-width transition to animate the fade out
      // (350ms matches the fade-out transition duration in post-card.css)
      setTimeout(() => {
        // Only add class if element still exists and shimmer is still at 0%
        if (el && el.style.getPropertyValue('--shimmer-width') === '0%') {
          el.classList.add('shimmer-hidden');
        }
      }, 350);
    });
  }, []);

  // Show shimmer on all targets
  const showShimmer = useCallback(() => {
    targetsRef.current.forEach((el) => {
      if (!el) return;
      // Remove hidden class first to enable gradient
      el.classList.remove('shimmer-hidden');
      el.style.setProperty('--shimmer-width', '25%');
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // MOUSE HANDLERS (Desktop only)
  // ─────────────────────────────────────────────────────────────────────────────

  const handleMouseEnter = useCallback((e) => {
    isActiveRef.current = true;
    
    // Cache all rects once at the start (avoids layout thrashing during move)
    cacheRects();
    
    // Set initial position immediately (no RAF delay for first frame)
    targetsRef.current.forEach((el) => {
      if (!el) return;
      const rect = rectsRef.current.get(el);
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedX = Math.max(0, Math.min(100, x));
      el.style.setProperty('--shimmer-x', `${clampedX}%`);
    });
    
    // Show shimmer (triggers fade-in)
    showShimmer();
  }, [cacheRects, showShimmer]);

  const handleMouseMove = useCallback((e) => {
    if (!isActiveRef.current) return;
    scheduleUpdate(e.clientX);
  }, [scheduleUpdate]);

  const handleMouseLeave = useCallback(() => {
    isActiveRef.current = false;
    clearShimmer();
    rectsRef.current.clear(); // Clear cached rects
  }, [clearShimmer]);

  return {
    containerHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    registerTarget,
    clearTargets,
  };
}

export default useShimmerFollow;
