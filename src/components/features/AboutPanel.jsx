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
      // visualViewport.offsetTop accounts for iOS Safari URL bar
      const viewportOffsetTop = vv ? vv.offsetTop : 0;

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
        viewportOffsetTop,
        toolbarOffset,
        fabSize,
        fabNormalBottom,
        fabNormalRight: 30,
        safeArea,
      };
    };

    // Unified calculation - runs on every scroll/resize frame
    const calculate = () => {
      const panelRect = panel.getBoundingClientRect();
      const viewport = getViewportInfo();
      const { visualHeight, layoutHeight, viewportWidth, toolbarOffset, fabSize, fabNormalBottom, fabNormalRight, safeArea } = viewport;

      // Check if user has scrolled past threshold
      if (!initialScrollCheckedRef.current) {
        initialScrollCheckedRef.current = true;
        if (window.scrollY > COLLAPSE_THRESHOLD) {
          hasScrolledRef.current = true;
        }
      } else if (window.scrollY > COLLAPSE_THRESHOLD) {
        hasScrolledRef.current = true;
      }

      const fab = getFabElement();
      if (!fab) return;

      // Toolbar compensation: move FAB up when toolbar expands (visual viewport shrinks)
      // This keeps FAB visually stable relative to the visible screen bottom
      const toolbarCompensation = -toolbarOffset;

      // Don't dock until FAB is visible
      if (!hasScrolledRef.current) {
        setDockProgress(0);
        fab.style.setProperty('--dock-offset-x', '0px');
        fab.style.setProperty('--dock-offset-y', `${toolbarCompensation}px`);
        setFabOffset({ x: 0, y: toolbarCompensation });
        return;
      }

      // FAB's visual position (where it appears on screen after CSS bottom positioning)
      // CSS positions from layout viewport bottom, but we calculate relative to visual viewport
      const fabVisualCenterX = viewportWidth - fabNormalRight - (fabSize / 2);
      // Where FAB appears in visual viewport (accounting for toolbar)
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

        // When fully docked (progress >= 0.95), use a stable calculation method
        // that doesn't depend on visual viewport changes
        const isFullyDocked = progress >= 0.95;

        if (isFullyDocked) {
          // STABLE DOCKED POSITION: Calculate offset from FAB's CSS position
          // FAB CSS: bottom: X, right: 30px (relative to layout viewport)
          // We need to move it to panel position (also relative to layout viewport)

          // FAB's CSS position in layout viewport coordinates
          const fabCssBottom = fabNormalBottom + safeArea;
          const fabCssRight = fabNormalRight;

          // FAB center in layout viewport coordinates (from top-left)
          const fabLayoutX = viewportWidth - fabCssRight - (fabSize / 2);
          const fabLayoutY = layoutHeight - fabCssBottom - (fabSize / 2);

          // Panel target in layout viewport coordinates
          // panelRect is already in viewport coordinates, but we need layout viewport
          // Since layout viewport = visual viewport + toolbar offset at top,
          // and panelRect.top is relative to visual viewport top...
          // Actually panelRect is relative to the current viewport (visual on iOS)
          // So we need to convert to layout viewport coordinates
          const panelTargetX = targetCenterX; // X is the same
          const panelTargetY = targetCenterY + toolbarOffset; // Adjust for toolbar

          // Calculate stable offset (doesn't change with toolbar)
          const stableDeltaX = panelTargetX - fabLayoutX;
          const stableDeltaY = panelTargetY - fabLayoutY;

          fab.style.setProperty('--dock-offset-x', `${stableDeltaX}px`);
          fab.style.setProperty('--dock-offset-y', `${stableDeltaY}px`);
          setFabOffset({ x: stableDeltaX, y: stableDeltaY });
        } else {
          // TRANSITIONING: Interpolate with toolbar compensation
          const fullDeltaX = targetCenterX - fabVisualCenterX;
          const fullDeltaY = targetCenterY - fabVisualCenterY;

          const currentDeltaX = fullDeltaX * progress;
          const currentDeltaY = (fullDeltaY * progress) + toolbarCompensation;

          fab.style.setProperty('--dock-offset-x', `${currentDeltaX}px`);
          fab.style.setProperty('--dock-offset-y', `${currentDeltaY}px`);
          setFabOffset({ x: currentDeltaX, y: currentDeltaY });
        }
      } else {
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

    // Resize handler - recalculate immediately for toolbar changes
    // The key insight: we recalculate positions each frame using current viewport
    // so the FAB naturally adjusts to toolbar size changes
    const handleResize = () => {
      // Cancel any pending RAF to avoid double-calculation
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Immediate recalculation
      calculate();
    };

    // Debounced resize for expensive operations (not currently needed but kept for future)
    const handleResizeDebounced = () => {
      if (resizeDebounceRef.current) {
        clearTimeout(resizeDebounceRef.current);
      }
      resizeDebounceRef.current = setTimeout(() => {
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
