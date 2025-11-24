# Desktop flyout nav refinement

Reference: `docs/2025-11-24 00-15-00 - Desktop flyout nav fix.md`

## Issues Addressed
1.  **Header Expansion**: The header was slightly expanding in height when the menu opened on desktop because the `.expanded` class (shared with mobile) was adding padding.
2.  **Unclickable Buttons**: The navigation buttons were not clickable on desktop because the `.top-bar-row` (containing the logo and toggle) was layered above the menu (`z-index: 5` vs `z-index: 1`) and blocking pointer events.

## Changes
1.  **CSS Adjustments**:
    - Added `.top-bar.flyout.expanded` selector to explicitly reset `padding-bottom` and `box-shadow` to their original values, preventing any layout shift or visual "pop" on desktop when opening the menu.
    - Added `pointer-events: none` to `.top-bar-row` to allow clicks to pass through the empty space of the header row to the menu buttons underneath.
    - Added `pointer-events: auto` to `.top-bar-row > *` (direct children) so the logo and toggle button remain interactive.

## Result
The desktop flyout now opens without affecting the header's dimensions, and the buttons are fully clickable while maintaining the "slide out from under" visual layering.
