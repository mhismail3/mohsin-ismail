import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { contactLinks } from './AboutContent';
import { useFooterDock } from '../../contexts';

/**
 * AboutPanel - Footer dock target panel
 *
 * This component owns the unified scroll handler that:
 * 1. Calculates dock progress based on panel position
 * 2. Calculates FAB position and applies it directly to DOM
 * 3. All in a single RAF-throttled handler to avoid race conditions
 *
 * Key iOS Safari optimizations:
 * - Uses visualViewport API to detect toolbar expand/contract
 * - Compensates for toolbar changes via transform offset
 * - CSS uses `bottom` positioning (layout viewport), JS adjusts for visual viewport
 * - Immediate recalculation on visualViewport resize events
 * - The toolbarCompensation value keeps FAB stable as toolbar animates
 */
const AboutPanel = () => {
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [buttonOpacity, setButtonOpacity] = useState(1);
  const { setDockProgress, setDockTarget, setFabOffset, isDocked, getProgress, getFabElement } = useFooterDock();

  // Track if user has scrolled enough to see FAB
  const hasScrolledRef = useRef(false);
  const initialScrollCheckedRef = useRef(false);

  // RAF tracking
  const rafIdRef = useRef(null);

  // Debounce timer for resize events
  const resizeDebounceRef = useRef(null);

  // Track docked state to skip recalculations when fully docked
  const isFullyDockedRef = useRef(false);
  // Cache the docked offset (computed once when fully docked)
  const dockedOffsetRef = useRef({ x: 0, y: 0 });
  // Cache the scroll position when FAB became fully docked (to detect undock)
  const dockedScrollYRef = useRef(0);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 840px)').matches);
    };
    checkMobile();
    const media = window.matchMedia('(max-width: 840px)');
    media.addEventListener('change', checkMobile);
    return () => media.removeEventListener('change', checkMobile);
  }, []);

  // Unified scroll handler - single source of truth for all dock calculations
  useEffect(() => {
    if (!isMobile || !panelRef.current) {
      setDockTarget(null);
      setDockProgress(0);
      return;
    }

    const panel = panelRef.current;
    setDockTarget(panel);

    // Reset scroll tracking
    hasScrolledRef.current = false;
    initialScrollCheckedRef.current = false;

    const COLLAPSE_THRESHOLD = 80;
    const DOCK_START_THRESHOLD = 80;

    // Get current visual viewport dimensions (called every frame for accuracy)
    const getViewportInfo = () => {
      const vv = window.visualViewport;
      const visualHeight = vv ? vv.height : window.innerHeight;
      const layoutHeight = window.innerHeight;
      const viewportWidth = vv ? vv.width : window.innerWidth;

      // Toolbar compensation: difference between layout and visual viewport
      // When iOS Safari toolbar expands, visual viewport shrinks but CSS bottom stays fixed
      // We need to compensate by moving the FAB up by this difference
      const toolbarOffset = layoutHeight - visualHeight;

      // Calculate FAB dimensions based on viewport width
      let fabSize = 48;
      let fabNormalBottom = 20; // Distance from bottom of visual viewport
      if (viewportWidth <= 320) {
        fabSize = 36;
        fabNormalBottom = 12;
      } else if (viewportWidth <= 360) {
        fabSize = 40;
        fabNormalBottom = 16;
      }

      // Safe area only matters for the actual bottom padding
      const safeArea = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom') || '0',
        10
      ) || 0;

      return {
        visualHeight,
        layoutHeight,
        viewportWidth,
        toolbarOffset,
        fabSize,
        fabNormalBottom,
        fabNormalRight: 30,
        safeArea,
      };
    };

    // Unified calculation - runs on every scroll/resize frame
    const calculate = () => {
      const currentScrollY = window.scrollY;
      const fab = getFabElement();
      if (!fab) return;

      // Check if user has scrolled past threshold
      if (!initialScrollCheckedRef.current) {
        initialScrollCheckedRef.current = true;
        if (currentScrollY > COLLAPSE_THRESHOLD) {
          hasScrolledRef.current = true;
        }
      } else if (currentScrollY > COLLAPSE_THRESHOLD) {
        hasScrolledRef.current = true;
      }

      const viewport = getViewportInfo();
      const { visualHeight, layoutHeight, viewportWidth, toolbarOffset, fabSize, fabNormalBottom, fabNormalRight, safeArea } = viewport;

      // Toolbar compensation: move FAB up when toolbar expands (visual viewport shrinks)
      // This keeps FAB visually stable relative to the visible screen bottom
      const toolbarCompensation = -toolbarOffset;

      // Don't dock until FAB is visible
      if (!hasScrolledRef.current) {
        isFullyDockedRef.current = false;
        setDockProgress(0);
        fab.style.setProperty('--dock-offset-x', '0px');
        fab.style.setProperty('--dock-offset-y', `${toolbarCompensation}px`);
        setFabOffset({ x: 0, y: toolbarCompensation });
        return;
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // LOCKED DOCKED STATE
      // When fully docked, the FAB position is locked. We only check if we should
      // undock by monitoring scroll position changes. This prevents jitter from
      // iOS Safari toolbar changes during small touch movements.
      // ═══════════════════════════════════════════════════════════════════════════
      if (isFullyDockedRef.current) {
        // Track the "deepest" scroll position (furthest down the page)
        // This ensures small scroll-ups don't incorrectly trigger undock
        if (currentScrollY > dockedScrollYRef.current) {
          dockedScrollYRef.current = currentScrollY;
        }

        // Check if user has scrolled UP significantly enough to potentially undock
        // Use a threshold to avoid undocking from toolbar-induced viewport changes
        const scrollDelta = dockedScrollYRef.current - currentScrollY;
        const UNDOCK_SCROLL_THRESHOLD = 15; // Only undock if user scrolls up 15+ px

        if (scrollDelta > UNDOCK_SCROLL_THRESHOLD) {
          // User scrolled up - exit locked state and recalculate
          isFullyDockedRef.current = false;
        } else {
          // Still docked - keep the cached offset and don't recalculate
          // The cached offset is relative to the layout viewport, so it stays stable
          setDockProgress(1);
          return;
        }
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // DYNAMIC CALCULATION (not docked or transitioning)
      // ═══════════════════════════════════════════════════════════════════════════
      const panelRect = panel.getBoundingClientRect();

      // FAB's visual position (where it appears on screen after CSS bottom positioning)
      const fabVisualCenterX = viewportWidth - fabNormalRight - (fabSize / 2);
      const fabVisualCenterY = visualHeight - fabNormalBottom - safeArea - (fabSize / 2);

      // Calculate dock progress based on panel position relative to where FAB appears
      const distanceToFabCenter = fabVisualCenterY - panelRect.top;
      let progress = 0;
      if (distanceToFabCenter < 0) {
        progress = 0;
      } else if (distanceToFabCenter >= DOCK_START_THRESHOLD) {
        progress = 1;
      } else {
        progress = distanceToFabCenter / DOCK_START_THRESHOLD;
      }

      // Update progress (context handles isDocked notification)
      setDockProgress(progress);

      if (progress > 0) {
        // Dock target position (right side of panel, vertically centered)
        const panelInnerPadding = 20;
        const targetCenterX = panelRect.right - panelInnerPadding - (fabSize / 2);
        const targetCenterY = panelRect.top + (panelRect.height / 2);

        // When fully docked (progress >= 0.95), lock position for stability
        const isFullyDocked = progress >= 0.95;

        if (isFullyDocked) {
          // ═══════════════════════════════════════════════════════════════════════
          // COMPUTE STABLE DOCKED OFFSET (done once, then locked)
          //
          // The key insight: FAB uses CSS `bottom` positioning (layout viewport).
          // To dock it relative to the panel, we need to calculate an offset that
          // works in layout viewport coordinates, NOT visual viewport coordinates.
          //
          // Panel's absolute document position = scrollY + panelRect.top (visual)
          // This gives us a scroll-independent reference point.
          // ═══════════════════════════════════════════════════════════════════════

          // FAB's CSS position: bottom: (fabNormalBottom + safeArea), right: fabNormalRight
          // In absolute document coordinates, FAB center Y when at scroll=0 would be:
          // documentHeight - fabCssBottom - fabSize/2
          // But we need it relative to the layout viewport for the transform...

          // Actually, the transform needs to move the FAB from its CSS position
          // (fixed at bottom-right of layout viewport) to the panel position.
          //
          // FAB CSS center in layout viewport: (viewportWidth - fabNormalRight - fabSize/2,
          //                                     layoutHeight - fabNormalBottom - safeArea - fabSize/2)
          //
          // Panel center in layout viewport: (targetCenterX, targetCenterY + toolbarOffset)
          // (adding toolbarOffset because panelRect.top is relative to visual viewport)

          const fabLayoutCenterX = viewportWidth - fabNormalRight - (fabSize / 2);
          const fabLayoutCenterY = layoutHeight - fabNormalBottom - safeArea - (fabSize / 2);

          const panelLayoutCenterX = targetCenterX; // X coordinates are the same
          const panelLayoutCenterY = targetCenterY + toolbarOffset;

          const stableDeltaX = panelLayoutCenterX - fabLayoutCenterX;
          const stableDeltaY = panelLayoutCenterY - fabLayoutCenterY;

          // Lock the position
          isFullyDockedRef.current = true;
          dockedScrollYRef.current = currentScrollY;
          dockedOffsetRef.current = { x: stableDeltaX, y: stableDeltaY };

          fab.style.setProperty('--dock-offset-x', `${stableDeltaX}px`);
          fab.style.setProperty('--dock-offset-y', `${stableDeltaY}px`);
          setFabOffset({ x: stableDeltaX, y: stableDeltaY });
        } else {
          // TRANSITIONING: Interpolate between floating position and dock target
          const fullDeltaX = targetCenterX - fabVisualCenterX;
          const fullDeltaY = targetCenterY - fabVisualCenterY;

          const currentDeltaX = fullDeltaX * progress;
          const currentDeltaY = (fullDeltaY * progress) + toolbarCompensation;

          fab.style.setProperty('--dock-offset-x', `${currentDeltaX}px`);
          fab.style.setProperty('--dock-offset-y', `${currentDeltaY}px`);
          setFabOffset({ x: currentDeltaX, y: currentDeltaY });
        }
      } else {
        // Not docking at all
        fab.style.setProperty('--dock-offset-x', '0px');
        fab.style.setProperty('--dock-offset-y', `${toolbarCompensation}px`);
        setFabOffset({ x: 0, y: toolbarCompensation });
      }
    };

    // Initial calculation
    calculate();

    // Scroll handler with RAF throttling
    const handleScroll = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        calculate();
      });
    };

    // Resize handler - recalculate for toolbar changes
    // CRITICAL: When fully docked, skip recalculation to prevent jitter
    // The docked position is stable and doesn't need to change with toolbar
    const handleResize = () => {
      // When fully docked, don't recalculate - the position is stable
      if (isFullyDockedRef.current) {
        return;
      }

      // Cancel any pending RAF to avoid double-calculation
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Immediate recalculation
      calculate();
    };

    // Debounced resize for expensive operations (orientation change, etc.)
    // Also respects the locked docked state
    const handleResizeDebounced = () => {
      if (resizeDebounceRef.current) {
        clearTimeout(resizeDebounceRef.current);
      }
      resizeDebounceRef.current = setTimeout(() => {
        // Skip if fully docked - position is stable
        if (isFullyDockedRef.current) return;
        calculate();
      }, 100);
    };

    const vv = window.visualViewport;

    // Main scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Window resize (orientation change, etc.)
    window.addEventListener('resize', handleResizeDebounced, { passive: true });

    // Visual viewport listeners for iOS Safari toolbar
    if (vv) {
      // Resize fires when toolbar expands/contracts
      vv.addEventListener('resize', handleResize, { passive: true });
      // Scroll fires when visual viewport pans (keyboard, etc.)
      vv.addEventListener('scroll', handleResize, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResizeDebounced);
      if (vv) {
        vv.removeEventListener('resize', handleResize);
        vv.removeEventListener('scroll', handleResize);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (resizeDebounceRef.current) {
        clearTimeout(resizeDebounceRef.current);
      }
      setDockTarget(null);
      setDockProgress(0);
    };
  }, [isMobile, setDockProgress, setDockTarget, setFabOffset, getFabElement]);

  // Button opacity based on dock state
  useEffect(() => {
    if (!isMobile) {
      setButtonOpacity(1);
      return;
    }
    const progress = getProgress();
    if (progress <= 0.5) {
      setButtonOpacity(1);
    } else if (progress >= 0.95) {
      setButtonOpacity(0);
    } else {
      setButtonOpacity(1 - ((progress - 0.5) / 0.45));
    }
  }, [isMobile, isDocked, getProgress]);

  const panelClass = [
    'panel',
    'about-panel',
    'about-panel-compact',
    isDocked ? 'docked' : '',
  ].filter(Boolean).join(' ');

  const buttonStyle = isMobile ? {
    '--button-opacity': buttonOpacity,
  } : {};

  return (
    <section
      id="about"
      ref={panelRef}
      className={panelClass}
    >
      <div className="panel-head">
        <div className="eyebrow">Get in Touch</div>
        <Link
          ref={buttonRef}
          to="/about"
          className={`see-all-link${isDocked ? ' dock-hidden' : ''}`}
          style={buttonStyle}
        >
          More about me &rarr;
        </Link>
      </div>
      <div className="about-body">
        <div className="contact-links contact-links-compact">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              className="contact-icon-btn"
              href={link.href}
              aria-label={link.label}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPanel;
