# Portfolio endless scroll fix

Reference: `docs/2025-11-24 01-05-00 - Portfolio endless scroll fix.md`

## Issue
The portfolio page previously used a "roulette" style infinite scroll that repeated the same 12 projects indefinitely. The user wanted to update this to:
1.  Show 10 items initially.
2.  Lazy load the rest as the user scrolls.
3.  Stop loading when all projects are shown (no repetition).
4.  Apply this behavior to mobile as well (remove pagination).
5.  Remove the "Endless scroll is on..." label.

## Changes
1.  **Data Logic (`src/PortfolioPage.jsx`)**:
    - Removed `buildPool` and infinite repetition logic.
    - Initialized `items` with the first 10 entries from `portfolioProjects.js`.
    - Updated `loadMore` to slice the remaining items from `portfolioProjects` until exhausted, then sets `hasMore = false`.
    - Helper `processProject` now just appends minimal metadata and processes the image URL without index-based logic (since no duplicates exist).

2.  **UI Changes**:
    - Removed the pagination controls for mobile and the "Endless scroll" text for desktop.
    - Enabled the IntersectionObserver (`scroll-sentinel`) for both desktop and mobile to handle lazy loading uniformly.
    - Updated the descriptive text in `panel-head` to "Scroll to explore."

## Result
The portfolio now displays a finite list of unique projects, loading them progressively as the user scrolls on both desktop and mobile, without looping content.

