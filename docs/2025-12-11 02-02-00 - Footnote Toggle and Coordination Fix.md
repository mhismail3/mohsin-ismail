# Footnote Toggle and Coordination Fix

**Date:** 2025-12-11 02:02:00

## Problem

Two issues with footnote bubbles:

1. **Toggle-close broken**: Clicking a footnote bubble to open it, then clicking the same bubble again to close it, would leave the bubble in the "active" visual state (styled/enlarged) instead of reverting to normal. Had to click again to reopen, then use the X button or click outside to properly close.

2. **Multi-footnote coordination broken**: Clicking one footnote to open it, then clicking a different footnote to open that one, would close the first popup but leave the first bubble in the "active" visual state.

## Root Cause Analysis

The codebase has TWO separate footnote implementations:

1. **PostPage.jsx** - DOM-based system using `.footnote-trigger` and `.footnote-popup` classes (from `footnote.css`)
2. **InlineFootnote.jsx** - React component using `.footnote-bubble` and `.footnote-popover` classes (from `post-card.css`)

### PostPage.jsx Issues

**Bug 1 - hide() bypassed cleanup:**
```javascript
// The hide() method directly set state without removing active class
React.useImperativeHandle(ref, () => ({
  hide: () => setPopup(null),  // ← Skipped handleClose() entirely!
}));
```

**Bug 2 - Toggle detection was inverted:**
```javascript
// The check happened AFTER calling hide()
if (popupManagerRef.current.isOpen()) {
  popupManagerRef.current.hide();  // ← This removed the active class
  if (trigger.classList.contains('footnote-trigger--active')) {  // ← Always false now!
    return;  // ← Never reached
  }
}
```

### InlineFootnote.jsx Issues

- Used `pointerdown` with capture phase which could interfere with click events
- No coordination between multiple footnote instances - clicking one wouldn't close others
- Event handling was fragile and could have race conditions

## Solution

### PostPage.jsx Changes

1. **Track active trigger in ref** - Added `activeTriggerRef` to track which trigger is currently active

2. **Track close timeout in ref** - Added `closeTimeoutRef` to track the 150ms close animation timeout

3. **Fixed hide() to use handleClose()** - The `hide()` method now properly calls `handleClose()` which:
   - Removes the active class from the trigger
   - Clears the active trigger ref
   - Plays closing animation

4. **Fixed toggle detection** - Check `getActiveTrigger() === trigger` BEFORE calling `hide()`:
```javascript
const isClickingActiveTrigger = popupManagerRef.current.getActiveTrigger() === trigger;

if (popupManagerRef.current.isOpen()) {
  popupManagerRef.current.hide();
  if (isClickingActiveTrigger) {
    return;  // Just close, don't reopen
  }
}
```

5. **Fixed switching between footnotes** with comprehensive race condition protection:

```javascript
// Generation counter invalidates stale handlers
const generationRef = useRef(0);

show: (data) => {
  // Increment generation to invalidate any stale handlers/timeouts
  generationRef.current += 1;
  
  // Cancel any pending close animation
  if (closeTimeoutRef.current) {
    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  }
  
  // Clean up old trigger's active class if switching
  if (activeTriggerRef.current && activeTriggerRef.current !== data.triggerElement) {
    activeTriggerRef.current.classList.remove('footnote-trigger--active');
  }
  
  closingRef.current = false;
  activeTriggerRef.current = data.triggerElement;
  setPopup(data);
},
```

6. **Protected all event handlers with generation checks** - Each useEffect captures the generation at creation time:

```javascript
useEffect(() => {
  if (!popup) return;
  
  // Capture generation at effect creation
  const effectGeneration = generationRef.current;
  
  const handleClickOutside = (e) => {
    // Ignore if this handler is stale (a new popup was opened)
    if (generationRef.current !== effectGeneration) return;
    // ... handle close
  };
  // ...
}, [popup, handleClose]);
```

This ensures that when switching from one footnote to another:
- The old handlers are immediately invalidated by the generation increment
- Even if stale handlers fire before React's cleanup runs, they check the generation and exit early
- The new popup opens cleanly without interference

7. **Changed click handler to skip hide() when switching** - When clicking a different footnote, we now call show() directly instead of hide() + show(). The show() method handles cleanup of the old popup internally, avoiding race conditions.

8. **Added cooldown period for iOS compatibility** - After `show()` is called, a 50ms cooldown blocks all close attempts:

```javascript
showCooldownRef.current = true;
setTimeout(() => {
  showCooldownRef.current = false;
}, 50);
```

This handles iOS race conditions where touch events fire between `show()` being called and React's effect cleanup running.

9. **Delayed scroll handler registration** - The scroll handler is now registered after 100ms (instead of immediately) to avoid triggering on popup positioning/switching:

```javascript
const scrollTimer = setTimeout(() => {
  window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
}, 100);
```

10. **Increased click/touchend handler delay** - Changed from 10ms to 50ms for better iOS compatibility where touch events can fire in unexpected order.

11. **Added cooldown checks to all handlers** - Every event handler now checks both generation AND the cooldown flag before calling `handleClose()`:

```javascript
const handleClickOutside = (e) => {
  if (generationRef.current !== effectGeneration) return;
  if (showCooldownRef.current) return;  // Added for iOS
  // ...
};
```

### InlineFootnote.jsx Changes

1. **Switched from pointerdown to click** - More reliable for toggle detection

2. **Added custom event coordination** - Uses `footnote:open` custom event so clicking any footnote automatically closes others:
```javascript
document.dispatchEvent(
  new CustomEvent('footnote:open', { detail: instanceIdRef.current })
);
```

3. **Proper event isolation** - Uses `stopPropagation()` on bubble click to prevent document-level handlers from interfering

4. **Stable unique IDs** - Each footnote instance gets a unique ID for coordination

## Files Changed

- `src/pages/PostPage.jsx` - Fixed FootnotePopupManager and click handling logic
- `src/components/features/InlineFootnote.jsx` - Complete rewrite with robust event handling

## Testing

Test these scenarios:

1. Click bubble to open → Click same bubble to close → Bubble should revert to normal
2. Click bubble A to open → Click bubble B → Bubble A should close AND revert to normal
3. Click bubble to open → Click X button → Should close and revert
4. Click bubble to open → Click outside → Should close and revert
5. Click bubble to open → Press Escape → Should close and revert
