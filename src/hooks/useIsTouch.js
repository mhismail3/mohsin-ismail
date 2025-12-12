import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if device has touch capability (no hover).
 * Listens for media query changes to handle dynamic changes.
 * 
 * @returns {boolean} - Whether device is touch-only (no hover)
 */
const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setTouchState = () => {
      setIsTouch(window.matchMedia('(hover: none)').matches);
    };

    setTouchState();

    const media = window.matchMedia('(hover: none)');
    const handler = (e) => setIsTouch(e.matches);
    media.addEventListener('change', handler);

    return () => media.removeEventListener('change', handler);
  }, []);

  return isTouch;
};

export default useIsTouch;
