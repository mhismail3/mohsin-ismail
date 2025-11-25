# Fix Portfolio Pill Positioning on iOS

## Context
Users reported that pill labels on portfolio project cards were "sticking" to the bottom edge on iOS Safari. This is likely due to `position: absolute` and `bottom: 12px` interacting poorly with dynamic container heights or aspect ratios in WebKit.

## Changes
- Refactored `.project-media` to use CSS Grid (`display: grid`) instead of `position: relative`.
- Stacked children (image and pill) using `grid-area: 1 / 1`.
- Replaced `position: absolute` on `.project-pill` with `align-self: end`, `justify-self: start`, and `margin: 12px`.

## Rationale
Using CSS Grid for overlay positioning avoids common issues with absolute positioning relative to fluid containers, ensuring the pill is always correctly offset from the container's corner regardless of the browser's layout calculation quirks.



