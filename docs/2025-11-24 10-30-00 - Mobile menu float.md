# Mobile Menu Float Animation

## Context
The previous mobile menu expanded the header height to reveal links. This behavior was deemed "jittery" and the user requested a floating menu that slides/bounces in beneath the toggle button.

## Changes

### Components
- **Header.jsx**: 
  - Removed `menuHeight`, `menuRef`, and `menuContentRef` logic as the menu no longer pushes content (is absolute).
  - Removed `expanded` class toggling for mobile (only applied for desktop/flyout logic if needed, but effectively unused for mobile now).
  - Simplified render logic.

### Styles
- **index.css**:
  - Refactored `.top-menu` (base/mobile) to use `position: absolute`, `right: 14px`, `top: calc(100% + 8px)`.
  - Added `backdrop-filter`, `box-shadow`, `border-radius` to create a floating card effect.
  - Changed animation to use `transform: translateY(-12px) scale(0.92)` -> `translateY(0) scale(1)` with a bouncy bezier curve.
  - Updated `.top-menu-content` to stack items vertically (`flex-direction: column`) on mobile.
  - Updated `.top-menu.desktop` to explicitly reset/override the new base styles (border, shadow, background, flex-direction) to maintain the existing desktop "flyout to left" behavior.

## Result
- **Mobile**: Clicking "..." (chevron) opens a floating dropdown menu aligned to the right, beneath the button. It bounces in. It does not push page content.
- **Desktop**: Remains unchanged (slides out to the left of the button).
