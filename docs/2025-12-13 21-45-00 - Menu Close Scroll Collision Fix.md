# Menu Close Scroll Collision Fix

**Date:** 2025-12-13  
**Component:** `header.css`  
**Issue:** Visual glitch on wide desktop when menu closes during scroll

## Problem

On wide desktop (≥1100px), when the menu is open with buttons appearing to the left of the profile photo, quickly scrolling would cause a visual glitch where menu buttons would "jump" to a different position before disappearing.

### Root Cause

On wide desktop, the menu has different CSS `top` values depending on the header's collapsed state:

```css
/* Non-collapsed: menu at header top */
.top-bar:not(.collapsed) .top-menu.from-collapsed {
  top: 14px;
}

/* Collapsed: menu below the photo */
.top-bar.collapsed .top-menu.from-collapsed {
  top: calc(100% + 8px);  /* inherited from base styles */
}
```

When the user scrolls with the menu open:
1. The menu close animation starts (~400ms fade out)
2. The header collapses/expands based on scroll position
3. The CSS selector changes (`.collapsed` added or removed)
4. The menu's `top` value instantly jumps to the new position
5. This causes buttons to visually jump mid-animation

## Solution

Added a CSS rule that locks the menu position during the closing animation, making it independent of the header's collapsed state:

```css
/* 
 * CRITICAL: Lock menu position during close animation.
 * When user scrolls while menu is closing, the header may collapse/expand,
 * which would normally change the menu's `top` value and cause a visual jump.
 * By using a fixed position during closing, the menu fades out in place
 * regardless of header state changes.
 */
.top-menu.from-collapsed.closing {
  top: calc(100% + 8px);
  left: auto;
  right: calc(100% + 20px);
}
```

This rule has higher specificity than the collapsed/non-collapsed rules because:
- It doesn't depend on `.top-bar.collapsed` or `.top-bar:not(.collapsed)`
- The `.closing` class is only present during the close animation
- When `.closing` is active, the menu uses a consistent position regardless of header state

## Why This Works

1. The `.closing` class is added when the close animation starts
2. This CSS rule overrides the collapsed-dependent positioning
3. The menu fades out in a fixed position (below the header)
4. The header is free to collapse/expand without affecting the menu
5. After the animation completes, `.closing` is removed and the menu is hidden anyway

## Alternative Considered

Initially tried a JavaScript solution using a ref to prevent collapse/expand state changes during closing. This was rejected because it prevented the header from collapsing at all during the close animation, which looked wrong - the header should still respond to scroll.

The CSS-only solution is cleaner: let the header collapse/expand normally, but make the closing menu's position independent of that state.
