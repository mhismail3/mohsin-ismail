# Portfolio Masonry Layout

Reference: `docs/2025-11-24 00-35-00 - Portfolio masonry layout.md`

## Issue
The portfolio moodboard was using CSS Grid with `grid-template-columns`. Because project cards have varying aspect ratios/heights, this caused "gaps" in the grid layout. Items in row 2 would start at the height of the tallest item in row 1, leaving whitespace below shorter items in row 1.

## Solution
Implemented a "Masonry" style layout using CSS Flexbox and JavaScript column distribution.

1.  **Logic Change (`PortfolioPage.jsx`)**:
    - Added `columnCount` state that updates based on window width (3 cols > 1080px, 2 cols > 720px, 1 col <= 720px).
    - Distributes `visibleItems` into `columns` arrays round-robin style.
    - Renders a flex container with column divs, each containing their respective items.

2.  **CSS Change (`index.css`)**:
    - Changed `.moodboard` to `display: flex; flex-direction: row`.
    - Added `.moodboard-column` with `display: flex; flex-direction: column`.
    - Removed the `grid-template-columns` media queries for `.moodboard`.

## Result
Items now stack vertically within their columns, eliminating vertical gaps between items caused by row alignment. The visual layout is now a true masonry grid.

