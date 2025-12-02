# Remove Clickable Ghost Area on Collapsed Header

**Date:** 2025-12-02 00:42:11  
**References:** `2025-12-02 00-36-38 - Fix photo hover ghost area on wide desktop.md`

## Problem

Follow-up to the previous fix: while the hover animation was constrained to the photo, the invisible brand-name area was still clickable and could trigger the dropdown menu to appear.

## Solution

Added `pointer-events` rules to constrain the interactive area to just the photo when collapsed:

```css
/* Constrain clickable area to just the photo when collapsed.
   The invisible brand-name area should not be interactive. */
.top-bar.collapsed .brand {
  pointer-events: none;
}

.top-bar.collapsed .brand-mark {
  pointer-events: auto;
}
```

This disables pointer events on the entire `.brand` button, then re-enables them only on the `.brand-mark` (photo) element.

## Files Changed

- `src/styles/components/header.css` (after line ~753)

## Result

When the header is collapsed:
- Only the circular photo is hoverable and clickable
- The ghost area where the name used to be is completely non-interactive
- Clicking the photo still correctly toggles the navigation menu
