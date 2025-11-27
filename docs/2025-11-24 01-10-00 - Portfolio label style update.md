# Portfolio label style update

Reference: `docs/2025-11-24 01-10-00 - Portfolio label style update.md`

## Change
Updated the styling of the project labels (`.project-pill` and `.pill-label`) in the portfolio grid.

## Details
1.  **Position & Shape**:
    - Removed `right: 12px` to allow the pill to shrink to fit its content rather than spanning the full width.
    - Anchored to the bottom-left corner (`left: 12px`, `bottom: 12px`).
    - Changed `border-radius` to `999px` for a true pill shape.
    - Reduced padding to `0.32rem 0.8rem 0.28rem` for a more compact look.

2.  **Glassy Effect**:
    - Decreased background opacity (`rgba(255, 255, 255, 0.65)`) to allow more background blur to show through.
    - Increased `backdrop-filter` blur to `16px`.
    - Added a subtle border (`rgba(255, 255, 255, 0.2)`) and shadow (`0 4px 12px rgba(0, 0, 0, 0.06)`) to enhance the glass aesthetic and separation from the image.

3.  **Typography**:
    - Reduced font size to `0.9rem`.
    - Set explicit line-height and color.

## Result
The labels are now small, compact "glass" pills sitting in the bottom-left corner of each project card, rather than wide bars spanning the bottom.








