import React, { useEffect, useRef, useState } from 'react';

/**
 * InlineFootnote renders a small circular bubble (superscript-style) that
 * expands into a popover with additional inline context. Designed for use
 * inside post bodies where markdown footnotes are converted into placeholders.
 */
const InlineFootnote = ({ content, index }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close when clicking outside the footnote
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleKeyToggle = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleOpen();
    }
  };

  return (
    <span className="footnote-inline" ref={rootRef}>
      <button
        type="button"
        className={`footnote-bubble ${open ? 'open' : ''}`}
        onClick={toggleOpen}
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



