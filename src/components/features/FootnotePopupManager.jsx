import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DOMPurify, marked } from '../../utils/markdown';

/**
 * FootnotePopupManager - Manages footnote popup lifecycle and positioning.
 *
 * This component handles its own DOM lifecycle to avoid triggering parent re-renders.
 * It's used via ref with imperative methods: show(), hide(), isOpen(), getActiveTrigger().
 *
 * Features:
 * - iOS Safari safe area support for popup positioning
 * - Generation-based stale handler invalidation
 * - Cooldown mechanism to prevent race conditions on touch devices
 * - Keyboard (Escape), click-outside, and scroll dismissal
 * - Close animation support with proper cleanup
 */
const FootnotePopupManager = React.forwardRef((props, ref) => {
  const [popup, setPopup] = useState(null);
  const popupRef = useRef(null);
  // Track the currently active trigger element for cleanup
  const activeTriggerRef = useRef(null);
  // Track close animation timeout so we can cancel it
  const closeTimeoutRef = useRef(null);
  // Generation counter to invalidate stale handlers/timeouts
  const generationRef = useRef(0);
  // Cooldown period after show() during which closes are blocked
  // This handles iOS race conditions with touch events
  const showCooldownRef = useRef(false);

  // Parse content
  const parsedContent = useMemo(() => {
    if (!popup?.content) return '';
    const rawHtml = marked.parseInline(popup.content);
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['em', 'strong', 'code', 'a', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  }, [popup?.content]);

  // Track if close is in progress to prevent double-triggers
  const closingRef = useRef(false);

  // Close handlers - with animation
  // Returns the trigger element that was just closed (for toggle detection)
  const handleClose = useCallback(() => {
    // Block closes during cooldown period after show()
    if (showCooldownRef.current) return null;
    if (closingRef.current) return null;

    // Capture generation at start of close
    const closeGeneration = generationRef.current;

    // Capture the trigger that's being closed BEFORE clearing state
    const closedTrigger = activeTriggerRef.current;

    // If there's no active trigger, nothing to close
    if (!closedTrigger) return null;

    // Always clean up the active trigger class
    closedTrigger.classList.remove('footnote-trigger--active');
    activeTriggerRef.current = null;

    if (!popup) return closedTrigger;

    closingRef.current = true;

    // Add closing animation class
    if (popupRef.current) {
      popupRef.current.classList.add('footnote-popup--closing');
      // Wait for animation to complete before removing
      closeTimeoutRef.current = setTimeout(() => {
        // Multiple safety checks before actually closing:
        // 1. Check if generation changed (a new popup was opened via show())
        if (generationRef.current !== closeGeneration) {
          closingRef.current = false;
          return; // Stale close, ignore
        }
        // 2. Check cooldown (in case show() was called recently)
        if (showCooldownRef.current) {
          closingRef.current = false;
          return; // show() was just called, ignore
        }
        // 3. Check if a new trigger became active (shouldn't happen if above checks pass)
        if (activeTriggerRef.current !== null) {
          closingRef.current = false;
          return; // A new popup is active, ignore
        }

        setPopup(null);
        closingRef.current = false;
        closeTimeoutRef.current = null;
      }, 150); // Match animation duration
    } else {
      setPopup(null);
      closingRef.current = false;
    }

    return closedTrigger;
  }, [popup]);

  // Expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    show: (data) => {
      // Increment generation to invalidate any stale handlers/timeouts
      generationRef.current += 1;

      // Cancel any pending close animation
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      // Reset closing state
      closingRef.current = false;

      // Enable cooldown to block any stale close attempts
      // This handles iOS race conditions where events fire between show() and effect cleanup
      // The cooldown must be longer than the longest handler registration delay (scroll = 100ms)
      // plus React's render time (~16-30ms), so we use 250ms to be safe
      showCooldownRef.current = true;
      setTimeout(() => {
        showCooldownRef.current = false;
      }, 250); // 250ms cooldown - covers React render + all handler registration delays

      // Clean up old trigger's active class if switching to a different trigger
      if (activeTriggerRef.current && activeTriggerRef.current !== data.triggerElement) {
        activeTriggerRef.current.classList.remove('footnote-trigger--active');
      }

      // Remove closing animation class if present (from a previous close attempt)
      if (popupRef.current) {
        popupRef.current.classList.remove('footnote-popup--closing');
      }

      // Track the active trigger for cleanup
      activeTriggerRef.current = data.triggerElement;
      setPopup(data);
    },
    // hide() now properly cleans up and returns the closed trigger
    hide: () => handleClose(),
    isOpen: () => popup !== null,
    getActiveTrigger: () => activeTriggerRef.current,
  }), [handleClose, popup]);

  // Handle close button tap with visible feedback
  const closeButtonRef = useRef(null);

  const handleCloseButtonTap = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Add pressed state immediately for visual feedback
    if (closeButtonRef.current) {
      closeButtonRef.current.classList.add('footnote-popup-close--pressed');
    }

    // Delay the close slightly so user sees the tap feedback
    setTimeout(() => {
      handleClose();
    }, 100);
  }, [handleClose]);

  useEffect(() => {
    if (!popup) return;

    // Capture generation at effect creation to detect stale handlers
    const effectGeneration = generationRef.current;

    const handleKeyDown = (e) => {
      // Ignore if this handler is stale (a new popup was opened)
      if (generationRef.current !== effectGeneration) return;
      // Also check cooldown (for iOS race conditions)
      if (showCooldownRef.current) return;
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [popup, handleClose]);

  useEffect(() => {
    if (!popup) return;

    // Capture generation at effect creation to detect stale handlers
    const effectGeneration = generationRef.current;

    const handleClickOutside = (e) => {
      // Ignore if this handler is stale (a new popup was opened)
      if (generationRef.current !== effectGeneration) return;
      // Also check cooldown (for iOS race conditions)
      if (showCooldownRef.current) return;

      if (popupRef.current && !popupRef.current.contains(e.target) &&
          popup.triggerElement && !popup.triggerElement.contains(e.target)) {
        handleClose();
      }
    };

    // Delay adding handlers to avoid the opening tap from triggering close
    // Only use click event - touchend can cause duplicate event issues on iOS
    // The click event is synthesized from touch events, so it's sufficient
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100); // 100ms delay for better iOS compatibility

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [popup, handleClose]);

  // Close on scroll
  useEffect(() => {
    if (!popup) return;

    // Capture generation at effect creation to detect stale handlers
    const effectGeneration = generationRef.current;

    const handleScroll = () => {
      // Ignore if this handler is stale (a new popup was opened)
      if (generationRef.current !== effectGeneration) return;
      // Also check cooldown (for iOS race conditions)
      if (showCooldownRef.current) return;
      handleClose();
    };

    // Delay adding the scroll handler to avoid triggering on popup positioning/switching
    // This is especially important on iOS where layout changes can trigger scroll events
    const scrollTimer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }, 100); // 100ms delay - matches time for popup to fully render and position

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [popup, handleClose]);

  if (!popup) return null;

  // Note: We render the popup directly without an overlay wrapper.
  // Previously there was a .footnote-overlay with position:fixed; inset:0;
  // but this caused iOS Safari (especially iOS 26 with floating tab bar) to
  // render a solid color behind the browser chrome. Click-outside detection
  // is handled via document event listeners, so the overlay wasn't needed.
  return createPortal(
    <div
      ref={popupRef}
      className={`footnote-popup footnote-popup--${popup.position.placement}`}
      style={{
        top: `${popup.position.top}px`,
        left: `${popup.position.left}px`,
        width: `${popup.position.width}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      role="tooltip"
    >
      <div className="footnote-popup-header">
        <span className="footnote-popup-number">{popup.number}</span>
        <button
          ref={closeButtonRef}
          className="footnote-popup-close"
          onClick={handleCloseButtonTap}
          onTouchStart={(e) => {
            // Add pressed state on touch for immediate feedback
            e.currentTarget.classList.add('footnote-popup-close--pressed');
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="footnote-popup-content" dangerouslySetInnerHTML={{ __html: parsedContent }} />
    </div>,
    document.body
  );
});

FootnotePopupManager.displayName = 'FootnotePopupManager';

export default FootnotePopupManager;

