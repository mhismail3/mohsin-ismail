# Touch-Specific Hover Behavior

## Date
2025-11-25 15:00:00

## Summary
Updated hover behavior for touch devices (iOS Safari, mobile) so that hover effects only activate on deliberate press-and-hold, not during scrolling. Desktop hover behavior remains unchanged.

## Problem
On touch devices, CSS `:hover` states are "sticky" - they activate on tap and stay active until tapping elsewhere. This causes unwanted hover effects when users are just scrolling through content.

## Solution
1. **CSS**: Wrap existing `:hover` styles in `@media (hover: hover) and (pointer: fine)` so they only apply on devices with true hover capability (mouse/trackpad)
2. **JavaScript**: For touch devices, use touch event handlers with scroll detection to apply a `.touch-hover` class only on deliberate press-and-hold

## Implementation Details

### CSS Changes (`index.css`)
- `.post-body img:hover` and `:active` wrapped in `@media (hover: hover) and (pointer: fine)`
- `.project-card:hover` wrapped in `@media (hover: hover) and (pointer: fine)`
- Added `.post-body img.touch-hover` class with same styles as hover
- Added `.project-card.touch-hover` class with same styles as hover

### JavaScript Touch Handler Logic
Applied to: `PostCard.jsx`, `PostPage.jsx`, `PortfolioPage.jsx`

1. **touchstart**: Records initial touch position, starts a 120ms timer
2. **touchmove**: If finger moves > 10px from start position, cancels the timer (user is scrolling)
3. **Timer completes**: Adds `.touch-hover` class to element (user is holding)
4. **touchend/touchcancel**: Immediately removes `.touch-hover` class

### Parameters
- `HOLD_DELAY`: 120ms - time before hover activates (prevents flash during scroll)
- `MOVE_THRESHOLD`: 10px - movement tolerance before considering it a scroll

## Behavior
- **Desktop**: Normal CSS hover behavior, unchanged
- **Touch (scrolling)**: No hover effect - finger movement cancels before timer completes
- **Touch (press-and-hold)**: Hover effect activates after 120ms, releases immediately when finger lifts
