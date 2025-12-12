# 3D Button Press Animation Fix

## Problem

The menu button hover/click animations had an incorrect "depression" effect:
- The solid shadow was moving when the button was hovered
- The button surface was moving AWAY from the shadow
- This created a confusing visual where both elements moved independently

## Root Cause

The previous implementation changed both `transform` and `box-shadow` values independently:
```css
/* INCORRECT - shadow moves with button AND changes offset */
.btn:hover {
  transform: translateY(2px) scale(0.98);
  box-shadow: 1px 1px 0px color;
}
```

This caused the shadow to visually shift because:
1. `transform: translate()` moves the button AND its attached box-shadow
2. Changing `box-shadow` offset simultaneously created a second movement

## Solution

For a proper 3D press effect, the shadow must stay at a **fixed visual position** while only the button surface moves **toward** the shadow.

The key insight: `transform + box-shadow offset = constant (initial shadow offset)`

### For 2px shadow (base buttons, theme toggle, collapsed menu):
| State  | Transform      | Box-Shadow | Visual Shadow Position |
|--------|---------------|------------|------------------------|
| Normal | translate(0,0)| 2px 2px    | (2,2) from button origin |
| Hover  | translate(1,1)| 1px 1px    | (2,2) from button origin |
| Active | translate(2,2)| 0px 0px    | (2,2) from button origin |

### For 3px shadow (visible flyout menu buttons):
| State  | Transform        | Box-Shadow    | Visual Shadow Position |
|--------|-----------------|---------------|------------------------|
| Normal | translate(0,0)  | 3px 3px       | (3,3) from button origin |
| Hover  | translate(1.5,1.5)| 1.5px 1.5px | (3,3) from button origin |
| Active | translate(3,3)  | 0px 0px       | (3,3) from button origin |

## Files Changed

- `src/styles/components/button.css` - Base `.btn` hover/active states
- `src/styles/components/header.css` - Theme toggle, flyout menu buttons (desktop/mobile/collapsed)

## Visual Result

- Shadow stays anchored in a fixed position (like a depression in a surface)
- Button surface moves down-right toward the shadow on hover
- Button fully "sinks" into the shadow on click/active
- Creates a satisfying, physically-plausible 3D tactile feedback

## Additional Changes

- Removed `scale(0.98)` and `scale(0.96)` from hover/active states as these aren't part of a true 3D press effect
- Changed `translateY()` to `translate()` to move on both axes (matching the diagonal shadow direction)
- Fixed disabled button hover to preserve shadow instead of removing it















