# Fix Portfolio Pill Positioning on iOS (Part 2)

## Context
The initial grid fix failed to prevent the "Field Notes" pill from being clipped at the bottom on iOS. This was due to `margin` or `align-self: end` not interacting correctly with the clipping mask or container height on WebKit/iOS when combined with `aspect-ratio` and flexible containers.

## Changes
- Changed `.project-card` from `display: flex` to `display: block` to avoid flex-child sizing quirks on iOS.
- Added `isolation: isolate` and `transform: translateZ(0)` to `.project-card` to force correct clipping and stacking contexts on iOS (fixing the "bleed" through border-radius).
- Refactored `.project-media` grid to use **explicit tracks** for padding instead of margins.
    - `grid-template-columns: 12px minmax(0, 1fr) 12px`
    - `grid-template-rows: minmax(0, 1fr) auto 12px`
- Positioned `.project-pill` in the center-left cell (col 2, row 2), ensuring it is mathematically guaranteed to be 12px from the bottom and left, regardless of margin collapsing or sub-pixel rendering.
- Added explicit `z-index` layering (Image: 1, Pill: 2) to ensure the pill sits above the image.

## Rationale
Explicit grid tracks are more robust than padding or margins for overlay positioning, as they reserve layout space that cannot be collapsed or ignored by the browser's layout engine. The transform hack fixes the specific iOS bug where child elements ignore `overflow: hidden` on rounded corners.
