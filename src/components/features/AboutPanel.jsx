import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { contactLinks } from './AboutContent';
import { useFooterDock } from '../../contexts';

const AboutPanel = () => {
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [buttonOpacity, setButtonOpacity] = useState(1);
  const { setDockProgress, setDockTarget, dockProgress, fabOffset } = useFooterDock();

  // Track if user has scrolled at all - prevents docking on short pages initially visible
  const hasScrolledRef = useRef(false);
  const initialScrollCheckedRef = useRef(false);

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

  // Cache for viewport measurements (avoid reading on every scroll)
  const viewportCacheRef = useRef({ height: 0, safeArea: 0, fabCenterY: 0 });
  const lastProgressRef = useRef(0);

  // Register this panel as the dock target and calculate dock progress
  useEffect(() => {
    if (!isMobile || !panelRef.current) {
      setDockTarget(null);
      setDockProgress(0);
      return;
    }

    // Register the panel element as dock target
    setDockTarget(panelRef.current);

    // Reset scroll tracking on mount
    hasScrolledRef.current = false;
    initialScrollCheckedRef.current = false;

    // Cache viewport measurements (expensive to read every frame)
    const updateViewportCache = () => {
      const viewportHeight = window.innerHeight;
      const safeArea = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--safe-area-inset-bottom') || '0',
        10
      ) || 0;
      // FAB center Y position (bottom: 20px + safe area, size: 48px)
      const fabCenterY = viewportHeight - 20 - safeArea - 24;
      viewportCacheRef.current = { height: viewportHeight, safeArea, fabCenterY };
    };
    updateViewportCache();

    const COLLAPSE_THRESHOLD = 80;
    const startDockingThreshold = 80;

    const calculateProgress = () => {
      const panel = panelRef.current;
      if (!panel) return;

      // Track scroll threshold
      if (!initialScrollCheckedRef.current) {
        initialScrollCheckedRef.current = true;
        if (window.scrollY > COLLAPSE_THRESHOLD) {
          hasScrolledRef.current = true;
        }
      } else if (window.scrollY > COLLAPSE_THRESHOLD) {
        hasScrolledRef.current = true;
      }

      // Don't dock until user has scrolled enough to see the FAB
      if (!hasScrolledRef.current) {
        if (lastProgressRef.current !== 0) {
          lastProgressRef.current = 0;
          setDockProgress(0);
        }
        return;
      }

      const rect = panel.getBoundingClientRect();
      const { fabCenterY } = viewportCacheRef.current;
      const distanceToFabCenter = fabCenterY - rect.top;

      let progress = 0;
      if (distanceToFabCenter < 0) {
        progress = 0;
      } else if (distanceToFabCenter >= startDockingThreshold) {
        progress = 1;
      } else {
        progress = distanceToFabCenter / startDockingThreshold;
      }

      // Only update if progress changed significantly (reduces re-renders)
      if (Math.abs(progress - lastProgressRef.current) > 0.01) {
        lastProgressRef.current = progress;
        setDockProgress(progress);
      }
    };

    calculateProgress(); // Initial check

    // Throttle scroll handler with RAF
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        calculateProgress();
      });
    };

    const handleResize = () => {
      updateViewportCache();
      calculateProgress();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      setDockTarget(null);
      setDockProgress(0);
    };
  }, [isMobile, setDockProgress, setDockTarget]);

  // Button fades out when photo is docked
  const isDocked = isMobile && dockProgress >= 0.95;

  // Calculate button opacity based on FAB proximity to button
  // This makes the fade feel "caused" by the photo approaching
  useEffect(() => {
    if (!isMobile || !buttonRef.current || dockProgress === 0) {
      setButtonOpacity(1);
      return;
    }

    const button = buttonRef.current;
    const buttonRect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0', 10) || 0;

    // FAB's current position (center point)
    // Normal position: right: 30px, bottom: 20px + safe area, size: 48px
    const fabSize = viewportWidth <= 320 ? 36 : viewportWidth <= 360 ? 40 : 48;
    const fabBottom = viewportWidth <= 320 ? 12 : viewportWidth <= 360 ? 16 : 20;
    const fabNormalCenterX = viewportWidth - 30 - fabSize / 2;
    const fabNormalCenterY = viewportHeight - fabBottom - safeAreaBottom - fabSize / 2;

    // FAB's current center with offset applied
    const fabCurrentCenterX = fabNormalCenterX + fabOffset.x;
    const fabCurrentCenterY = fabNormalCenterY + fabOffset.y;

    // Button center
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // Distance between FAB center and button center
    const distance = Math.sqrt(
      Math.pow(fabCurrentCenterX - buttonCenterX, 2) +
      Math.pow(fabCurrentCenterY - buttonCenterY, 2)
    );

    // Fade starts when FAB is within 120px, fully faded at 40px
    const fadeStartDistance = 120;
    const fadeEndDistance = 40;

    let opacity = 1;
    if (distance <= fadeEndDistance) {
      opacity = 0;
    } else if (distance < fadeStartDistance) {
      // Smooth fade based on proximity
      opacity = (distance - fadeEndDistance) / (fadeStartDistance - fadeEndDistance);
    }

    setButtonOpacity(opacity);
  }, [isMobile, dockProgress, fabOffset]);

  const panelClass = [
    'panel',
    'about-panel',
    'about-panel-compact',
    dockProgress > 0 ? 'docking' : '',
    isDocked ? 'docked' : '',
  ].filter(Boolean).join(' ');

  // Style for button fade - use CSS variable for smooth transition
  const buttonStyle = isMobile && dockProgress > 0 ? {
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
