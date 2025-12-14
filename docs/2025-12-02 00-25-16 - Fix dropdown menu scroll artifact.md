# Fix: Dropdown Menu Scroll Artifact on Desktop

**Date:** 2025-12-02  
**Type:** Bug fix  
**Files Modified:** `src/styles/components/header.css`

## Problem

When the header was collapsed (photo icon on the left side) and the dropdown menu was open, scrolling up quickly caused a visual artifact where the menu appeared to "jump" or show a "phantom" as it moved from its left-aligned position to the default right-aligned position before disappearing.

## Root Cause

The CSS rules for the `.from-collapsed` menu positioning required `.top-bar.collapsed` as an ancestor selector:

```css
/* BEFORE - required .collapsed ancestor */
.top-bar.collapsed .top-menu.from-collapsed {
  left: 14px;
  right: auto;
  /* ... */
}
```

When the user scrolled up quickly:
1. The header transitions from collapsed to not-collapsed (`isCollapsed` becomes `false`)
2. The menu is still in its close animation (`isClosing` state is `true`)
3. The CSS positioning rules no longer apply because `.top-bar.collapsed` selector doesn't match
4. The menu snaps to its default right-aligned position before disappearing

## Solution

Made the `.from-collapsed` class self-sufficient - it now maintains its positioning regardless of whether `.top-bar` has the `.collapsed` class. The JavaScript already correctly sets `openedWhileCollapsed` state and adds the `from-collapsed` class, so the CSS just needed to respect that class alone.

```css
/* AFTER - no .collapsed ancestor required */
.top-menu.desktop.from-collapsed,
.top-menu.mobile.from-collapsed {
  left: 14px;
  right: auto;
  /* ... */
}
```

### Changes Made

1. **Main positioning rules** (lines 785-939):
   - Changed `.top-bar.collapsed .top-menu.from-collapsed` to `.top-menu.desktop.from-collapsed, .top-menu.mobile.from-collapsed`
   - Updated all nested selectors (`.visible`, `.closing`, `.btn`, hover states, etc.) to use `.top-menu.from-collapsed` without the `.top-bar.collapsed` ancestor

2. **Wide desktop media query** (1100px+, lines 996-1017):
   - **Important specificity fix**: Changed `.top-menu.from-collapsed` to `.top-menu.desktop.from-collapsed, .top-menu.mobile.from-collapsed`
   - The 1100px rules must use the SAME specificity as the 840px rules to ensure cascade order wins
   - Without matching specificity, `left: 18px` from 840px would override `left: auto; right: calc(100% + 20px)` from 1100px

## Why This Works

The `from-collapsed` class is ONLY added when the menu was opened while the header was collapsed. The JavaScript tracks this with the `openedWhileCollapsed` state:

```javascript
// Header.jsx - when opening menu
setOpenedWhileCollapsed(isCollapsed);
setIsOpen(true);
```

And uses it for the class:
```javascript
// menuClass includes 'from-collapsed' when openedWhileCollapsed is true
openedWhileCollapsed ? 'from-collapsed' : '',
```

This state persists through the close animation, so by making the CSS respond to `.from-collapsed` alone (without requiring `.top-bar.collapsed`), the menu maintains its position throughout the entire animation cycle.

## CSS Specificity Note

The fix required careful attention to CSS specificity:
- Base rules: `.top-menu.desktop.from-collapsed` = 3 classes (specificity 0,3,0)
- 840px rules: `.top-menu.desktop.from-collapsed` = 3 classes (specificity 0,3,0)
- 1100px rules: MUST also use `.top-menu.desktop.from-collapsed` (specificity 0,3,0)

If the 1100px rules used only `.top-menu.from-collapsed` (2 classes, specificity 0,2,0), they would lose to the higher-specificity 840px rules, causing incorrect menu positioning on wide desktop.

## Testing

To test this fix:
1. Scroll down on a long page until the header collapses (photo icon moves to left on wide desktop)
2. Click the photo to open the dropdown menu
3. While the menu is open, scroll up quickly (before the menu closes)
4. The menu should close smoothly in place without jumping to the right side


















