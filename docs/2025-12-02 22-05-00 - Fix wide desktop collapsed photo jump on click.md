# Fix Wide Desktop Collapsed Photo Jump on Click

**Date:** 2025-12-02 22:05:00  
**References:** `2025-12-02 00-42-11 - Remove clickable ghost area on collapsed header.md`

## Problem

On wide desktop (≥1100px), when the header is collapsed:
1. The photo icon appeared offset to the left (too far left)
2. Clicking and holding the photo caused it to "slide back to the right"
3. When dragging, the photo had a consistent offset from the mouse cursor

## Root Cause

CSS transform conflict between two rules:

**Wide desktop rule (line ~1169):**
```css
@media (min-width: 1100px) {
  .top-bar.collapsed .brand {
    transform: translateX(-86px);
  }
}
```

**Global active state rule (line ~214):**
```css
.top-bar.collapsed .brand:active,
.top-bar.collapsed .brand.tap-active {
  transform: none;
}
```

When the user clicked (triggering `:active`), the global rule **completely overrode** the wide-desktop `translateX(-86px)` with `transform: none`, causing the element to jump to the right (back to x=0).

This also caused the drag offset issue because:
1. The drag hook captured `startX` based on the `:active` position (at x=0)
2. When `:active` ended, the CSS snapped the element back to x=-86px
3. The drag deltas were now calculated from the wrong baseline

## Solution

Added an override inside the 1100px media query to preserve the collapsed transform when `:active`:

```css
@media (min-width: 1100px) {
  /* Preserve the collapsed transform when :active on wide desktop.
     The global .brand:active rule sets transform:none which would override
     the translateX(-86px), causing an unwanted jump when clicking. */
  .top-bar.collapsed .brand:active,
  .top-bar.collapsed .brand.tap-active {
    transform: translateX(-86px);
  }
}
```

## Files Changed

- `src/styles/components/header.css` — Added `:active` override inside 1100px media query

## Result

- Photo stays at correct position (-86px) when clicking on wide desktop
- No jump when clicking and holding
- Drag behavior works correctly without offset
- Existing behavior on narrower screens is unchanged (global `transform: none` still applies)
