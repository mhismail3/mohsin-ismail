import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for rubberband slingshot gesture on touch devices.
 * 
 * When the user taps, holds, and drags down on an element, it creates
 * a rubberband-like tension effect. Releasing "slingshots" smoothly
 * to scroll the page to the top.
 * 
 * Physics:
 * - Uses logarithmic resistance for natural rubberband feel
 * - Tension builds with diminishing returns (harder to pull further)
 * - Release animation uses spring physics easing
 * 
 * @param {Object} options
 * @param {boolean} options.enabled - Whether the gesture is active
 * @param {number} options.holdDelay - Time in ms to distinguish hold from tap (default: 120)
 * @param {number} options.pullThreshold - Min pull distance to trigger slingshot (default: 40)
 * @param {number} options.maxPull - Maximum visual pull distance (default: 120)
 * @param {number} options.resistance - Rubberband resistance factor (default: 0.4)
 * @param {Function} options.onTap - Called when gesture is a tap (not a hold+drag)
 * @returns {Object} Gesture state and handlers
 */
const useSlingshotGesture = ({
  enabled = true,
  holdDelay = 120,
  pullThreshold = 40,
  maxPull = 120,
  resistance = 0.4,
  onTap,
} = {}) => {
  // Gesture state
  const [isHolding, setIsHolding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isReleasing, setIsReleasing] = useState(false);
  
  // Refs for gesture tracking
  const touchStartRef = useRef(null);
  const holdTimerRef = useRef(null);
  const isHoldConfirmedRef = useRef(false);
  const elementRef = useRef(null);
  
  // Cleanup on unmount or disable
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  // Reset state when disabled
  useEffect(() => {
    if (!enabled) {
      setIsHolding(false);
      setIsDragging(false);
      setPullDistance(0);
      setIsReleasing(false);
      isHoldConfirmedRef.current = false;
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    }
  }, [enabled]);

  /**
   * Calculate rubberband pull with logarithmic resistance
   * This creates the natural "harder to pull further" feel
   */
  const calculateRubberbandPull = useCallback((rawDistance) => {
    if (rawDistance <= 0) return 0;
    
    // Logarithmic resistance formula
    // The more you pull, the harder it gets (diminishing returns)
    const dampedDistance = maxPull * (1 - Math.exp(-rawDistance * resistance / maxPull));
    
    return Math.min(dampedDistance, maxPull);
  }, [maxPull, resistance]);

  /**
   * Smooth scroll to top with spring-like easing
   */
  const slingshotToTop = useCallback(() => {
    setIsReleasing(true);
    setPullDistance(0);
    
    // Animate scroll to top with custom spring easing
    const startY = window.scrollY;
    const duration = Math.min(600, 300 + startY * 0.15); // Dynamic duration based on distance
    const startTime = performance.now();
    
    // Spring easing function - overshoots slightly then settles
    const springEase = (t) => {
      // Custom spring curve: fast start, slight overshoot, settle
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    };
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = springEase(progress);
      
      window.scrollTo(0, startY * (1 - eased));
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Animation complete - clean up
        setTimeout(() => {
          setIsReleasing(false);
          setIsDragging(false);
          setIsHolding(false);
        }, 100);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }, []);

  /**
   * Reset gesture state without scrolling
   */
  const resetGesture = useCallback(() => {
    setIsReleasing(true);
    setPullDistance(0);
    
    // Animate pull reset
    setTimeout(() => {
      setIsReleasing(false);
      setIsDragging(false);
      setIsHolding(false);
      isHoldConfirmedRef.current = false;
    }, 200);
  }, []);

  /**
   * Touch start handler
   */
  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
    
    isHoldConfirmedRef.current = false;
    
    // Start hold timer
    holdTimerRef.current = setTimeout(() => {
      isHoldConfirmedRef.current = true;
      setIsHolding(true);
    }, holdDelay);
  }, [enabled, holdDelay]);

  /**
   * Touch move handler
   */
  const handleTouchMove = useCallback((e) => {
    if (!enabled || !touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // If we haven't confirmed hold yet, check if this is a drag that should cancel
    if (!isHoldConfirmedRef.current) {
      // Allow small movement during hold detection
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        // Too much movement - cancel hold detection (this is a scroll/swipe)
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        touchStartRef.current = null;
        return;
      }
      return;
    }
    
    // We're in hold mode - now track the pull
    if (deltaY > 0) {
      // Pulling down - apply rubberband physics
      e.preventDefault(); // Prevent page scroll during gesture
      
      setIsDragging(true);
      const rubberbandDistance = calculateRubberbandPull(deltaY);
      setPullDistance(rubberbandDistance);
    } else if (deltaY < -10) {
      // Pulling up significantly - cancel the gesture
      resetGesture();
      touchStartRef.current = null;
    } else if (Math.abs(deltaX) > 30) {
      // Horizontal movement - cancel
      resetGesture();
      touchStartRef.current = null;
    }
  }, [enabled, calculateRubberbandPull, resetGesture]);

  /**
   * Touch end handler
   */
  const handleTouchEnd = useCallback((e) => {
    if (!enabled) return;
    
    // Clear hold timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    // Check if this was a tap (no hold confirmed, minimal movement)
    if (!isHoldConfirmedRef.current && touchStartRef.current) {
      const timeDelta = Date.now() - touchStartRef.current.timestamp;
      if (timeDelta < holdDelay + 50) {
        // This was a quick tap - trigger tap callback
        if (onTap) {
          e.preventDefault();
          onTap(e);
        }
        touchStartRef.current = null;
        return;
      }
    }
    
    // If we were dragging, check if we should slingshot
    if (isDragging && pullDistance >= pullThreshold) {
      // Threshold met - slingshot to top!
      slingshotToTop();
    } else if (isHolding || isDragging) {
      // Not enough pull - reset
      resetGesture();
    }
    
    touchStartRef.current = null;
    isHoldConfirmedRef.current = false;
  }, [enabled, holdDelay, isDragging, isHolding, pullDistance, pullThreshold, onTap, slingshotToTop, resetGesture]);

  /**
   * Touch cancel handler
   */
  const handleTouchCancel = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    resetGesture();
    touchStartRef.current = null;
    isHoldConfirmedRef.current = false;
  }, [resetGesture]);

  // Calculate derived visual state
  const pullProgress = pullDistance / maxPull; // 0 to 1
  const isReadyToRelease = pullDistance >= pullThreshold;
  const tensionLevel = Math.min(pullDistance / pullThreshold, 1); // 0 to 1 for threshold
  
  return {
    // State
    isHolding,
    isDragging,
    isReleasing,
    pullDistance,
    pullProgress,
    isReadyToRelease,
    tensionLevel,
    
    // Event handlers
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    
    // Ref for the target element
    ref: elementRef,
  };
};

export default useSlingshotGesture;
