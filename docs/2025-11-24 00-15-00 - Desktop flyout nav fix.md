# Desktop flyout nav fix

Reference: `docs/2025-11-23 23-42-10 - Desktop header flyout nav.md`

## Context
The previous implementation of the desktop flyout nav had styling and animation issues:
- Buttons were too large.
- Buttons faded in/slid in a way that didn't look like they were coming "from under" the toggle.
- Positioning was slightly off.

## Changes
1. **Styling**: Added `small` class to navigation buttons in `Header.jsx` to reduce their size.
2. **Layering**: 
   - `top-bar-row` set to `z-index: 5` and `relative` to ensure it sits above the menu.
   - `top-menu.desktop` set to `z-index: 1` to sit behind the toggle button.
3. **Positioning & Animation**:
   - Adjusted `right` to `90px` to align the menu to the left of the toggle button (accounting for button width and padding).
   - Animation starts with `translateX(40px)` (tucked under the button) and transitions to `translateX(0)` (sliding out left).
   - Used `cubic-bezier(0.34, 1.56, 0.64, 1)` for a bounce/overshoot effect upon opening.

## Result
The menu now appears to slide out from underneath the "..." toggle button to the left, with a bouncy animation, and the buttons are more appropriately sized.
