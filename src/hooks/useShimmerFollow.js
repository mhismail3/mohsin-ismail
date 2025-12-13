import { useCallback, useRef } from 'react';

/**
 * Hook for cursor-following shimmer effect on text.
 * Updates CSS variables based on mouse position:
 *   --shimmer-x: horizontal position (0-100%)
 *   --shimmer-width: band width (0% hidden, 20% visible) for fade in/out
 * 
 * @returns {Object} - { shimmerRef, shimmerHandlers }
 *   - shimmerRef: Attach to the element
 *   - shimmerHandlers: Spread onto the element ({ onMouseEnter, onMouseMove, onMouseLeave })
 */
export function useShimmerFollow() {
  const shimmerRef = useRef(null);
  const isActiveRef = useRef(false);
  
  const handleMouseEnter = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el) return;
    
    isActiveRef.current = true;
    
    // Calculate initial position
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    
    // Set position first, then grow width (fade in)
    // Width of 25% creates a soft, blended shimmer band
    el.style.setProperty('--shimmer-x', `${clampedX}%`);
    el.style.setProperty('--shimmer-width', '25%');
  }, []);
  
  const handleMouseMove = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    // Calculate cursor X position as percentage (0-100%)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    // Clamp to 0-100% range
    const clampedX = Math.max(0, Math.min(100, x));
    
    el.style.setProperty('--shimmer-x', `${clampedX}%`);
    
    // Ensure width is set (in case mouseenter was missed)
    if (isActiveRef.current && el.style.getPropertyValue('--shimmer-width') !== '25%') {
      el.style.setProperty('--shimmer-width', '25%');
    }
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    const el = shimmerRef.current;
    if (!el) return;
    
    isActiveRef.current = false;
    
    // Shrink width to 0 (fade out) - CSS transition handles the animation
    el.style.setProperty('--shimmer-width', '0%');
    
    // Position stays where it was; the width shrinking makes it invisible
    // No need to move --shimmer-x
  }, []);
  
  return {
    shimmerRef,
    shimmerHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}

export default useShimmerFollow;
