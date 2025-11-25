# Staggered Close Animation for Nav Buttons

## Summary
Added a staggered closing animation for the navigation flyout buttons that mirrors the staggered opening animation, creating a smooth, polished interaction.

## Problem
When clicking the menu toggle to hide the navigation buttons, both Portfolio and About buttons would disappear instantly at the same time, while the opening animation had a nice staggered bounce effect.

## Solution
Implemented a proper closing animation sequence:

### JavaScript Changes (`src/components/Header.jsx`)
1. Added `isClosing` state to track when the menu is in the closing animation phase
2. Created `closeMenu()` callback that:
   - Sets `isClosing` to true immediately (triggers CSS closing animation)
   - After 180ms (animation duration), sets `isOpen` to false and `isClosing` to false
3. Updated `toggleMenu()` to call `closeMenu()` instead of directly setting `isOpen` to false
4. Added cleanup for timeouts on unmount

### CSS Changes (`src/index.css`)
1. Added `.closing` class styles for both mobile and desktop menus
2. Reversed stagger order for closing:
   - **Mobile**: About button closes first (0ms delay), Portfolio closes second (50ms delay)
   - **Desktop**: About button closes first (0ms delay), Portfolio closes second (30ms delay)
3. Used a faster, snappier easing for close (`cubic-bezier(0.55, 0, 0.85, 0.36)`) vs the bouncy open easing
4. Container maintains position during close animation to prevent layout shift

## Technical Details
- Opening animation: bouncy cubic-bezier (0.34, 1.56, 0.64, 1) with ~320ms duration
- Closing animation: ease-out cubic-bezier (0.55, 0, 0.85, 0.36) with ~180ms duration
- Closing is intentionally faster than opening for snappier feel
- `pointer-events: none` during close prevents accidental clicks
- Timeout cleanup prevents memory leaks and race conditions

## Files Changed
- `src/components/Header.jsx` - Added closing state management
- `src/index.css` - Added `.closing` CSS rules with reversed stagger

