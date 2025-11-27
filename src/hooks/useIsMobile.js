import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if viewport is mobile-sized.
 * Listens for resize events and updates state accordingly.
 * 
 * @param {number} breakpoint - Width breakpoint in pixels (default: 840)
 * @returns {boolean} - Whether viewport is at or below breakpoint
 */
const useIsMobile = (breakpoint = 840) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;

