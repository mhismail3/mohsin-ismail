import React, { useEffect, useState } from 'react';

/**
 * Toast notification component.
 * Automatically fades out after display duration.
 * 
 * @param {Object} props
 * @param {string} props.message - Toast message to display
 * @param {boolean} props.show - Whether to show the toast
 * @param {number} props.duration - Display duration in ms before fade (default: 1500)
 * @param {Function} props.onHide - Callback when toast finishes hiding
 */
const Toast = ({
  message,
  show,
  duration = 1500,
  onHide,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onHide) {
          // Wait for fade animation to complete
          setTimeout(onHide, 320);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!visible && !show) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default Toast;
