import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * FooterDockContext - Optimized for iOS Safari
 *
 * ARCHITECTURE (Inverted Model):
 * The FAB's "home" is the AboutPanel. When docked, the FAB is portaled INTO
 * the panel DOM and uses position:absolute - no JS calculations needed.
 * When floating, it's portaled back to body and uses position:fixed.
 *
 * This inversion eliminates jitter because:
 * - Docked state = pure CSS positioning (absolute relative to panel)
 * - Floating state = position:fixed (calculations only happen while scrolling anyway)
 * - The docked position requires ZERO JavaScript updates
 */

const FooterDockContext = createContext(null);

export const useFooterDock = () => {
  const context = useContext(FooterDockContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      dockProgress: 0,
      isDocked: false,
      dockTarget: null,
      fabOffset: { x: 0, y: 0 },
      portalTarget: null,
      setDockProgress: () => {},
      setDockTarget: () => {},
      setFabOffset: () => {},
      setFabElement: () => {},
      setPortalTarget: () => {},
      getProgress: () => 0,
      getFabElement: () => null,
      getPortalTarget: () => null,
    };
  }
  return context;
};

export const FooterDockProvider = ({ children }) => {
  // Only isDocked triggers React re-renders (for CSS class updates and portal switching)
  const [isDocked, setIsDocked] = useState(false);

  // All other values stored in refs (no re-renders during scroll)
  const progressRef = useRef(0);
  const fabOffsetRef = useRef({ x: 0, y: 0 });
  const dockTargetRef = useRef(null);
  const fabElementRef = useRef(null);
  const portalTargetRef = useRef(null); // DOM element to portal FAB into when docked

  // Setters that don't trigger re-renders
  const setDockProgress = useCallback((progress) => {
    progressRef.current = progress;
    // Only update React state if isDocked status changed
    const newIsDocked = progress >= 0.95;
    setIsDocked(prev => prev !== newIsDocked ? newIsDocked : prev);
  }, []);

  const setDockTarget = useCallback((element) => {
    dockTargetRef.current = element;
  }, []);

  const setFabOffset = useCallback((offset) => {
    fabOffsetRef.current = offset;
  }, []);

  const setFabElement = useCallback((element) => {
    fabElementRef.current = element;
  }, []);

  const setPortalTarget = useCallback((element) => {
    portalTargetRef.current = element;
  }, []);

  // Getters for imperative access
  const getProgress = useCallback(() => progressRef.current, []);
  const getFabElement = useCallback(() => fabElementRef.current, []);
  const getDockTarget = useCallback(() => dockTargetRef.current, []);
  const getFabOffset = useCallback(() => fabOffsetRef.current, []);
  const getPortalTarget = useCallback(() => portalTargetRef.current, []);

  const value = {
    // React state (triggers re-renders)
    isDocked,
    // Ref values (read current value, no re-render guarantee)
    dockProgress: progressRef.current,
    dockTarget: dockTargetRef.current,
    fabOffset: fabOffsetRef.current,
    portalTarget: portalTargetRef.current,
    // Setters
    setDockProgress,
    setDockTarget,
    setFabOffset,
    setFabElement,
    setPortalTarget,
    // Getters (for imperative access to current values)
    getProgress,
    getFabElement,
    getDockTarget,
    getFabOffset,
    getPortalTarget,
  };

  return (
    <FooterDockContext.Provider value={value}>
      {children}
    </FooterDockContext.Provider>
  );
};

export { FooterDockContext };
