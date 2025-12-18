import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * FooterDockContext - Optimized for iOS Safari
 *
 * Uses a hybrid approach:
 * - React state only for isDocked (triggers class updates)
 * - Direct DOM manipulation for transform values during scroll
 * - Store refs for values that don't need re-renders
 *
 * Key optimizations:
 * - Single unified scroll handler in AboutPanel
 * - Direct DOM manipulation for transform updates
 * - Minimal React re-renders (only when isDocked changes)
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
      setDockProgress: () => {},
      setDockTarget: () => {},
      setFabOffset: () => {},
      setFabElement: () => {},
      getProgress: () => 0,
      getFabElement: () => null,
    };
  }
  return context;
};

export const FooterDockProvider = ({ children }) => {
  // Only isDocked triggers React re-renders (for CSS class updates)
  const [isDocked, setIsDocked] = useState(false);

  // All other values stored in refs (no re-renders during scroll)
  const progressRef = useRef(0);
  const fabOffsetRef = useRef({ x: 0, y: 0 });
  const dockTargetRef = useRef(null);
  const fabElementRef = useRef(null);

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

  // Getters for imperative access
  const getProgress = useCallback(() => progressRef.current, []);
  const getFabElement = useCallback(() => fabElementRef.current, []);
  const getDockTarget = useCallback(() => dockTargetRef.current, []);
  const getFabOffset = useCallback(() => fabOffsetRef.current, []);

  const value = {
    // React state (triggers re-renders)
    isDocked,
    // Ref values (read current value, no re-render guarantee)
    dockProgress: progressRef.current,
    dockTarget: dockTargetRef.current,
    fabOffset: fabOffsetRef.current,
    // Setters
    setDockProgress,
    setDockTarget,
    setFabOffset,
    setFabElement,
    // Getters (for imperative access to current values)
    getProgress,
    getFabElement,
    getDockTarget,
    getFabOffset,
  };

  return (
    <FooterDockContext.Provider value={value}>
      {children}
    </FooterDockContext.Provider>
  );
};

export { FooterDockContext };
