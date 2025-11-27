# Carousel Scroll Fix for Non-Touch Mobile Widths

## Problem
On devices with a mouse but a narrow viewport (e.g., resized desktop browser < 720px), the project page photo carousel's "hover to scroll" effect was malfunctioning.

## Root Cause
1. The JavaScript logic (`ProjectPage.jsx`) correctly identifies the device as non-touch (`hover: hover`) and enables the hover-based scroll animation.
2. However, the CSS (`index.css`) had a media query `@media (max-width: 720px)` that unconditionally enabled `scroll-snap-type: x mandatory`.
3. The CSS scroll snapping fought against the JavaScript's smooth `scrollLeft` updates, causing the carousel to stutter, get stuck, or fail to scroll smoothly when hovering.

## Solution
Updated the CSS to restrict scroll snapping behavior to touch devices only, even at small widths.

### Diff
`src/index.css`:
Split the `@media (max-width: 720px)` block into two:
1. Layout adjustments (height) apply to all screens < 720px.
2. Scroll snap properties (`scroll-snap-type`, `scroll-snap-align`) now apply only to `@media (max-width: 720px) and (hover: none)`.

## Verification
- **Desktop (Wide):** Hover scroll works (Snap OFF).
- **Desktop (Narrow < 720px):** Hover scroll works (Snap OFF). Previously broken.
- **Mobile (Touch):** Native scroll with snap works (Snap ON).








