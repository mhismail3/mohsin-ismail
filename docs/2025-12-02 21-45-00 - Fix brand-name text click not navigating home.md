# Fix Brand-Name Text Click Not Navigating Home

**Date:** 2025-12-02 21:45:00  
**References:** `2025-12-02 00-42-11 - Remove clickable ghost area on collapsed header.md`

## Problem

After the previous fix to remove the clickable ghost area when collapsed, the "Mohsin Ismail" brand-name text became non-clickable even when visible (non-collapsed state). Users could hover the text (seeing the color change to pine), but clicking it did not navigate home.

### Root Cause

The `useTouchDrag` hook is attached only to `.brand-mark-inner` (the photo element). When clicking the brand-name text:

1. Click event targets `.brand-name`
2. Bubbles up to `.brand` button
3. `handleBrandClick` runs
4. But it only did `e.preventDefault()` — no navigation logic

The drag hook never sees clicks on the text because it only monitors the photo element.

## Solution

Modified `handleBrandClick` to coordinate with the drag hook:

```jsx
const handleBrandClick = useCallback((e) => {
  // Check if click originated from within the brand-mark (photo)
  const brandMark = e.currentTarget.querySelector('.brand-mark');
  if (brandMark && brandMark.contains(e.target)) {
    // Photo clicks handled by drag hook - just prevent default
    e.preventDefault();
    return;
  }
  
  // Click was on brand-name text - navigate home when not collapsed
  if (!isCollapsed) {
    handleHome();
  }
}, [isCollapsed, handleHome]);
```

### Behavior by State

**Non-collapsed (name visible):**
- Clicking photo → drag hook handles it → `handlePhotoTap()` → `handleHome()`
- Clicking name text → `handleBrandClick` → `handleHome()` ✓

**Collapsed (name hidden):**
- CSS `pointer-events: none` on `.brand` and `.brand-name` prevents text clicks
- Photo has `pointer-events: auto` → drag hook handles it → `handlePhotoTap()` → `toggleMenu()`
- Click bubbles to button, but `isCollapsed` check prevents `handleHome()` call

## Files Changed

- `src/components/layout/Header.jsx` — Updated `handleBrandClick` handler

## Result

- Brand-name text is clickable when visible (non-collapsed state)
- Photo icon works correctly in both states (home navigation or menu toggle)
- Ghost area remains non-interactive when collapsed
- Hover effects work correctly in both states
