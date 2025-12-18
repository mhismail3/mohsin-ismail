import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * FooterDockContext
 *
 * Manages communication between the footer dock panel (AboutPanel) and the
 * floating FAB photo in the Header. When the user scrolls to the bottom and
 * the footer panel comes into view, the FAB "docks" into the panel.
 *
 * State:
 * - dockProgress: 0-1 value indicating how much the photo has docked
 * - isDocked: boolean, true when fully docked (progress >= 0.95)
 * - dockTarget: DOM element reference for the dock target panel
 * - fabOffset: { x, y } offset of FAB from its normal position (for button animation)
 */
const FooterDockContext = createContext({
  dockProgress: 0,
  isDocked: false,
  dockTarget: null,
  fabOffset: { x: 0, y: 0 },
  setDockProgress: () => {},
  setDockTarget: () => {},
  setFabOffset: () => {},
});

export const useFooterDock = () => {
  const context = useContext(FooterDockContext);
  if (!context) {
    // Return default values if used outside provider (safe fallback)
    return {
      dockProgress: 0,
      isDocked: false,
      dockTarget: null,
      fabOffset: { x: 0, y: 0 },
      setDockProgress: () => {},
      setDockTarget: () => {},
      setFabOffset: () => {},
    };
  }
  return context;
};

export const FooterDockProvider = ({ children }) => {
  const [dockProgress, setDockProgressState] = useState(0);
  const [fabOffset, setFabOffsetState] = useState({ x: 0, y: 0 });
  const dockTargetRef = useRef(null);

  const setDockProgress = useCallback((progress) => {
    setDockProgressState(progress);
  }, []);

  const setDockTarget = useCallback((element) => {
    dockTargetRef.current = element;
  }, []);

  const setFabOffset = useCallback((offset) => {
    setFabOffsetState(offset);
  }, []);

  const isDocked = dockProgress >= 0.95;

  return (
    <FooterDockContext.Provider
      value={{
        dockProgress,
        isDocked,
        dockTarget: dockTargetRef.current,
        fabOffset,
        setDockProgress,
        setDockTarget,
        setFabOffset,
      }}
    >
      {children}
    </FooterDockContext.Provider>
  );
};

export { FooterDockContext };
