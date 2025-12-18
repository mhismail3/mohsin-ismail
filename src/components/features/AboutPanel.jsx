import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { contactLinks } from './AboutContent';
import { useFooterDock } from '../../contexts';

/**
 * AboutPanel - Footer dock target panel
 *
 * This component owns the unified scroll handler that:
 * 1. Calculates dock progress based on panel position
 * 2. Calculates FAB offset and applies it directly to DOM
 * 3. All in a single RAF-throttled handler to avoid race conditions
 *
 * Key iOS Safari optimizations:
 * - Uses visualViewport API for accurate viewport height
 * - Direct DOM manipulation (no React state during scroll)
 * - Single scroll handler (no competing listeners)
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

  // Cache for expensive calculations
  const cacheRef = useRef({
    viewportHeight: 0,
    viewportWidth: 0,
    safeArea: 0,
    fabSize: 48,
    fabNormalBottom: 20,
    fabNormalRight: 30,
    fabCenterY: 0,
  });

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

    // Update viewport cache - uses visualViewport for iOS Safari accuracy
    const updateCache = () => {
      // Use visualViewport for iOS Safari (accounts for dynamic toolbar)
      const vv = window.visualViewport;
      const viewportHeight = vv ? vv.height : window.innerHeight;
      const viewportWidth = vv ? vv.width : window.innerWidth;

      const safeArea = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom') || '0',
        10
      ) || 0;

      // Calculate FAB dimensions based on viewport width
      let fabSize = 48;
      let fabNormalBottom = 20;
      if (viewportWidth <= 320) {
        fabSize = 36;
        fabNormalBottom = 12;
      } else if (viewportWidth <= 360) {
        fabSize = 40;
        fabNormalBottom = 16;
      }

      const fabCenterY = viewportHeight - fabNormalBottom - safeArea - (fabSize / 2);

      cacheRef.current = {
        viewportHeight,
        viewportWidth,
        safeArea,
        fabSize,
        fabNormalBottom,
        fabNormalRight: 30,
        fabCenterY,
      };
    };

    updateCache();

    // Unified calculation - runs on every scroll frame
    const calculate = () => {
      const cache = cacheRef.current;
      const panelRect = panel.getBoundingClientRect();

      // Check if user has scrolled past threshold
      if (!initialScrollCheckedRef.current) {
        initialScrollCheckedRef.current = true;
        if (window.scrollY > COLLAPSE_THRESHOLD) {
          hasScrolledRef.current = true;
        }
      } else if (window.scrollY > COLLAPSE_THRESHOLD) {
        hasScrolledRef.current = true;
      }

      // Don't dock until FAB is visible
      if (!hasScrolledRef.current) {
        setDockProgress(0);
        // Reset FAB position via direct DOM
        const fab = getFabElement();
        if (fab) {
          fab.style.setProperty('--dock-offset-x', '0px');
          fab.style.setProperty('--dock-offset-y', '0px');
        }
        setFabOffset({ x: 0, y: 0 });
        return;
      }

      // Calculate dock progress
      const distanceToFabCenter = cache.fabCenterY - panelRect.top;
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

      // Calculate and apply FAB position directly to DOM
      const fab = getFabElement();
      if (fab && progress > 0) {
        const { viewportWidth, viewportHeight, safeArea, fabSize, fabNormalBottom, fabNormalRight } = cache;

        // FAB's normal center position
        const fabNormalCenterX = viewportWidth - fabNormalRight - (fabSize / 2);
        const fabNormalCenterY = viewportHeight - fabNormalBottom - safeArea - (fabSize / 2);

        // Dock target position (right side of panel, vertically centered)
        const panelInnerPadding = 20;
        const targetCenterX = panelRect.right - panelInnerPadding - (fabSize / 2);
        const targetCenterY = panelRect.top + (panelRect.height / 2);

        // Full offset when fully docked
        const fullDeltaX = targetCenterX - fabNormalCenterX;
        const fullDeltaY = targetCenterY - fabNormalCenterY;

        // Apply progress (snap to 1 when >= 0.95 for clean docking)
        const effectiveProgress = progress >= 0.95 ? 1 : progress;
        const currentDeltaX = fullDeltaX * effectiveProgress;
        const currentDeltaY = fullDeltaY * effectiveProgress;

        // Direct DOM update - no React re-render
        fab.style.setProperty('--dock-offset-x', `${currentDeltaX}px`);
        fab.style.setProperty('--dock-offset-y', `${currentDeltaY}px`);

        // Store offset for button fade calculation
        setFabOffset({ x: currentDeltaX, y: currentDeltaY });
      } else if (fab) {
        fab.style.setProperty('--dock-offset-x', '0px');
        fab.style.setProperty('--dock-offset-y', '0px');
        setFabOffset({ x: 0, y: 0 });
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

    // Resize handler - update cache and recalculate
    const handleResize = () => {
      updateCache();
      calculate();
    };

    // Use visualViewport resize for iOS Safari toolbar changes
    const vv = window.visualViewport;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    if (vv) {
      vv.addEventListener('resize', handleResize, { passive: true });
      vv.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (vv) {
        vv.removeEventListener('resize', handleResize);
        vv.removeEventListener('scroll', handleScroll);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setDockTarget(null);
      setDockProgress(0);
    };
  }, [isMobile, setDockProgress, setDockTarget, setFabOffset, getFabElement]);

  // Button opacity based on dock state (simple - no complex calculations)
  useEffect(() => {
    if (!isMobile) {
      setButtonOpacity(1);
      return;
    }
    // Simple fade: start fading at 50% progress, fully hidden at 95%
    const progress = getProgress();
    if (progress <= 0.5) {
      setButtonOpacity(1);
    } else if (progress >= 0.95) {
      setButtonOpacity(0);
    } else {
      // Linear fade from 50% to 95%
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
