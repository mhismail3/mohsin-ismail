import { useCallback, useRef } from 'react';

/**
 * Hook for cursor-following shimmer effect on text.
 * Updates a CSS variable (--shimmer-x) based on mouse position.
 * 
 * @returns {Object} - { shimmerRef, shimmerHandlers }
 *   - shimmerRef: Attach to the element
 *   - shimmerHandlers: Spread onto the element ({ onMouseMove, onMouseLeave })
 */
export function useShimmerFollow() {
  const shimmerRef = useRef(null);
  
  const handleMouseMove = useCallback((e) => {
    const el = shimmerRef.current;
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    // Calculate cursor X position as percentage (0-100%)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    // Clamp to 0-100% range
    const clampedX = Math.max(0, Math.min(100, x));
    
    el.style.setProperty('--shimmer-x', `${clampedX}%`);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    const el = shimmerRef.current;
    if (!el) return;
    
    // Reset to fully hidden position (120% = completely off-screen)
    el.style.setProperty('--shimmer-x', '120%');
  }, []);
  
  return {
    shimmerRef,
    shimmerHandlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}

export default useShimmerFollow;

