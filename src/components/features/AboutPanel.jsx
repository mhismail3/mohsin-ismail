import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { contactLinks } from './AboutContent';
import { useFooterDock } from '../../contexts';

/**
 * AboutPanel - Footer dock target panel
 *
 * ARCHITECTURE (Inverted Model):
 * The FAB's "home" is this panel. When docked, the FAB is portaled INTO
 * this panel's DOM and uses position:absolute - no JS calculations needed.
 * When floating, it uses position:fixed with JS-calculated offsets.
 *
 * This inversion eliminates jitter because:
 * - Docked state = pure CSS positioning (absolute relative to panel)
 * - Floating state = position:fixed (calculations only during active scroll)
 * - The docked position requires ZERO JavaScript updates
 *
 * The panel provides a portal target element that the Header's FAB
 * portals into when docked.
 */
const AboutPanel = () => {
  const panelRef = useRef(null);
  const portalRef = useRef(null); // Portal target for docked FAB
  const [isMobile, setIsMobile] = useState(false);
  const { setDockProgress, setDockTarget, setFabOffset, setPortalTarget, isDocked, getFabElement } = useFooterDock();

  // Track if user has scrolled enough to see FAB
  const hasScrolledRef = useRef(false);
  const initialScrollCheckedRef = useRef(false);

  // RAF tracking
  const rafIdRef = useRef(null);

  // Detect mobile/tablet viewport (FAB docking is used up to 1099px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 1099px)').matches);
    };
    checkMobile();
    const media = window.matchMedia('(max-width: 1099px)');
    media.addEventListener('change', checkMobile);
    return () => media.removeEventListener('change', checkMobile);
  }, []);

  // Register portal target with context
  useEffect(() => {
    if (isMobile && portalRef.current) {
      setPortalTarget(portalRef.current);
    }
    return () => setPortalTarget(null);
  }, [isMobile, setPortalTarget]);

  // Scroll handler - determines dock progress and floating FAB position
  // When docked, FAB is portaled into panel and uses CSS positioning - no JS needed
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

    // Get viewport info for floating FAB positioning
    const getViewportInfo = () => {
      const vv = window.visualViewport;
      const visualHeight = vv ? vv.height : window.innerHeight;
      const layoutHeight = window.innerHeight;
      const viewportWidth = vv ? vv.width : window.innerWidth;
      const toolbarOffset = layoutHeight - visualHeight;

      let fabSize = 48;
      let fabNormalBottom = 20;
      if (viewportWidth <= 320) {
        fabSize = 36;
        fabNormalBottom = 12;
      } else if (viewportWidth <= 360) {
        fabSize = 40;
        fabNormalBottom = 16;
      }

      const safeArea = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom') || '0',
        10
      ) || 0;

      return { visualHeight, viewportWidth, toolbarOffset, fabSize, fabNormalBottom, fabNormalRight: 30, safeArea };
    };

    const calculate = () => {
      const currentScrollY = window.scrollY;

      // Check if user has scrolled past threshold (FAB visibility)
      if (!initialScrollCheckedRef.current) {
        initialScrollCheckedRef.current = true;
        if (currentScrollY > COLLAPSE_THRESHOLD) {
          hasScrolledRef.current = true;
        }
      } else if (currentScrollY > COLLAPSE_THRESHOLD) {
        hasScrolledRef.current = true;
      }

      const fab = getFabElement();
      if (!fab) return;

      const panelRect = panel.getBoundingClientRect();
      const viewport = getViewportInfo();
      const { visualHeight, viewportWidth, toolbarOffset, fabSize, fabNormalBottom, fabNormalRight, safeArea } = viewport;

      // Toolbar compensation for floating FAB
      const toolbarCompensation = -toolbarOffset;

      // FAB not visible yet
      if (!hasScrolledRef.current) {
        setDockProgress(0);
        fab.style.setProperty('--dock-offset-x', '0px');
        fab.style.setProperty('--dock-offset-y', `${toolbarCompensation}px`);
        setFabOffset({ x: 0, y: toolbarCompensation });
        return;
      }

      // Calculate dock progress based on panel position
      const fabVisualCenterY = visualHeight - fabNormalBottom - safeArea - (fabSize / 2);
      const distanceToFabCenter = fabVisualCenterY - panelRect.top;

      let progress = 0;
      if (distanceToFabCenter < 0) {
        progress = 0;
      } else if (distanceToFabCenter >= DOCK_START_THRESHOLD) {
        progress = 1;
      } else {
        progress = distanceToFabCenter / DOCK_START_THRESHOLD;
      }

      // Calculate the full dock position (used for both transitioning and docked states)
      const panelInnerPadding = 20;
      const targetCenterX = panelRect.right - panelInnerPadding - (fabSize / 2);
      const targetCenterY = panelRect.top + (panelRect.height / 2);
      const fabVisualCenterX = viewportWidth - fabNormalRight - (fabSize / 2);

      const fullDeltaX = targetCenterX - fabVisualCenterX;
      const fullDeltaY = targetCenterY - fabVisualCenterY;

      // Update progress - when >= 0.95, isDocked becomes true and FAB portals into panel
      setDockProgress(progress);

      // Position the FAB based on dock progress
      // CRITICAL: Even when fully docked (progress >= 0.95), we keep the transform offset
      // applied. This ensures the FAB stays in the correct visual position during the
      // brief moment between when isDocked becomes true and when React portals the element.
      // Once portaled, the .docked CSS class overrides the transform anyway.
      if (progress >= 0.95) {
        // Fully docked - apply full dock offset (no interpolation, no toolbar compensation)
        // The .docked CSS will override this transform once the portal completes
        fab.style.setProperty('--dock-offset-x', `${fullDeltaX}px`);
        fab.style.setProperty('--dock-offset-y', `${fullDeltaY}px`);
        setFabOffset({ x: fullDeltaX, y: fullDeltaY });
      } else if (progress > 0) {
        // TRANSITIONING: Interpolate position toward dock target
        const currentDeltaX = fullDeltaX * progress;
        const currentDeltaY = (fullDeltaY * progress) + toolbarCompensation;

        fab.style.setProperty('--dock-offset-x', `${currentDeltaX}px`);
        fab.style.setProperty('--dock-offset-y', `${currentDeltaY}px`);
        setFabOffset({ x: currentDeltaX, y: currentDeltaY });
      } else {
        // Not docking - just apply toolbar compensation
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

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setDockTarget(null);
      setDockProgress(0);
    };
  }, [isMobile, setDockProgress, setDockTarget, setFabOffset, getFabElement]);

  const panelClass = [
    'panel',
    'about-panel',
    'about-panel-compact',
    isDocked ? 'docked' : '',
  ].filter(Boolean).join(' ');

  return (
    <section
      id="about"
      ref={panelRef}
      className={panelClass}
    >
      <div className="panel-head">
        <div className="eyebrow">Get in Touch</div>
        {/* Only show "More about me" on wide desktop (1100px+) where photo slides left */}
        {!isMobile && (
          <Link
            to="/about"
            className="see-all-link"
          >
            More about me &rarr;
          </Link>
        )}
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
      {/* Portal target for docked FAB - FAB is rendered here when docked */}
      {isMobile && <div ref={portalRef} className="fab-dock-target" />}
    </section>
  );
};

export default AboutPanel;
