# Project detail touch optimization

Reference: `docs/2025-11-24 01-35-00 - Project detail touch optimization.md`

## Changes
Optimized the project gallery carousel for touch devices.

1.  **Animation Logic (`src/ProjectPage.jsx`)**:
    - Added logic to detect touch capabilities using `window.matchMedia('(hover: none)')`.
    - If a touch device is detected (`isTouch` is true), the `requestAnimationFrame` loop for the mouse-based hover scrolling is disabled.
    - Updated the hint text to display "Scroll to view more" on touch devices.

2.  **CSS Updates (`src/index.css`)**:
    - Added a media query for mobile (`max-width: 720px`) to:
        - Enable `scroll-snap-type: x mandatory` on the `.carousel-track` container.
        - Set `scroll-snap-align: center` on items.
        - Enable `-webkit-overflow-scrolling: touch` for smooth momentum scrolling on iOS.

## Result
On desktop (hover-capable), the "roulette" mouse-follow animation remains active. On mobile/touch devices, the animation is disabled, and users can natively swipe left/right with snap points for a standard, comfortable touch experience.





