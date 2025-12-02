# Fix Photo Hover Ghost Area on Wide Desktop

**Date:** 2025-12-02 00:36:38

## Problem

On wide desktop (≥1100px), when the header collapses and the profile photo slides to the left, hovering over the area where the name title would have been (to the right of the photo) still triggered the photo's depression/hover animation—even though that area is visually empty.

## Root Cause

The `.brand` button element contains both:
- `.brand-mark` (the circular photo)
- `.brand-name` (the text "Mohsin Ismail")

When collapsed:
1. The `.brand-name` fades out via `opacity: 0` but still occupies space in the layout
2. The entire `.brand` button is transformed left by 86px
3. The hover effect was triggered by `.brand:hover`, which fires when hovering **anywhere** in the button area—including the invisible name region

## Solution

Changed the hover and active selectors from targeting the entire `.brand` button to targeting only the `.brand-mark` span:

**Before:**
```css
.top-bar.collapsed .brand:hover .brand-mark-inner { ... }
.top-bar.collapsed .brand:active .brand-mark-inner { ... }
```

**After:**
```css
.top-bar.collapsed .brand-mark:hover .brand-mark-inner { ... }
.top-bar.collapsed .brand-mark:active .brand-mark-inner { ... }
```

This ensures the visual hover/active effects only appear when the cursor is directly over the photo element itself, not the ghost area of the invisible name.

## Files Changed

- `src/styles/components/header.css` (lines ~755-773)

## Notes

- The `.brand` button remains fully clickable (including the invisible area) for accessibility
- Only the **visual feedback** (hover animation) is now constrained to the photo
- The `.brand-name` already had `pointer-events: none` in collapsed state, but that doesn't shrink the parent button's interactive bounding box
