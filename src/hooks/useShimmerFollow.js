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

export default useShimmerFollow;
