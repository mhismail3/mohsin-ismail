import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * @deprecated This component is currently unused. Footnotes are now handled by
 * FootnotePopupManager in PostPage.jsx which provides better iOS Safari support.
 * Kept for backwards compatibility and potential future use.
 * 
 * InlineFootnote renders a small circular bubble (superscript-style) that
 * expands into a popover with additional inline context. Designed for use
 * inside post bodies where markdown footnotes are converted into placeholders.
 *
 * Robustness features:
 * - Custom event coordination ensures only one footnote is open at a time
 * - Click on bubble toggles open/close reliably
 * - Click outside or press Escape closes the popover
 * - Bubble visual state always matches open state
 */
const InlineFootnote = ({ content, index }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const instanceIdRef = useRef(`footnote-${Math.random().toString(36).slice(2, 11)}`);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // Listen for other footnotes opening - close this one when another opens
  useEffect(() => {
    const handleOtherOpen = (event) => {
      // Another footnote opened, close this one
      if (event.detail !== instanceIdRef.current) {
        close();
      }
    };

    document.addEventListener('footnote:open', handleOtherOpen);
    return () => document.removeEventListener('footnote:open', handleOtherOpen);
  }, [close]);

  // Handle bubble click - toggle open/close
  const handleBubbleClick = useCallback((event) => {
    // Stop propagation to prevent document-level click handler from firing
    event.stopPropagation();

    if (open) {
      close();
    } else {
      // Dispatch event to close any other open footnotes
      document.dispatchEvent(
        new CustomEvent('footnote:open', { detail: instanceIdRef.current })
      );
      setOpen(true);
    }
  }, [open, close]);

  // Close when clicking outside the footnote
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      // If click is outside our root element, close
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        close();
      }
    };

    // Use a microtask delay to avoid the opening click from immediately triggering close
    // This ensures the click that opened the popover doesn't also close it
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open, close]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, close]);

  // Keyboard toggle for accessibility
  const handleKeyToggle = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleBubbleClick(event);
    }
  }, [handleBubbleClick]);

  return (
    <span className="footnote-inline" ref={rootRef}>
      <button
        type="button"
        className={`footnote-bubble ${open ? 'open' : ''}`}
        onClick={handleBubbleClick}
        onKeyDown={handleKeyToggle}
        aria-expanded={open}
        aria-label={`Footnote ${index + 1}`}
      >
        <span className="footnote-bubble-inner">{index + 1}</span>
      </button>

      <span className={`footnote-popover ${open ? 'visible' : ''}`} role="note">
        <span className="footnote-popover-content" dangerouslySetInnerHTML={{ __html: content }} />
      </span>
    </span>
  );
};

export default InlineFootnote;
