# Toggle Icon Animation and Slower Button Timing

## Summary
Added bouncy animated transitions for the menu toggle button icon (ellipsis ↔ chevron) and slightly slowed down the Portfolio/About button animations.

## Changes

### Toggle Icon Animation (`Header.jsx` + `index.css`)
Refactored the toggle button to render both icons simultaneously, using CSS to animate between them:

- **Ellipsis icon**: Scales from 0.5 → 1 with bouncy easing
- **Chevron up (mobile)**: Rotates 180° → 0° while scaling up with bounce
- **Chevron right (desktop)**: Rotates -90° → 0° while scaling up with bounce

The `.toggle-icon-wrap` container positions icons absolutely so they can crossfade smoothly. The `.visible` class controls which icon is shown.

### Slower Button Animations

**Mobile buttons:**
- Opening: 0.42s transform (was 0.32s), stagger 40ms/100ms (was 30ms/80ms)
- Closing: 0.22s transform (was 0.18s), stagger 60ms/0ms (was 50ms/0ms)

**Desktop buttons:**
- Opening: 0.4s transform (was 0.32s), stagger 40ms/80ms (was 30ms/60ms)  
- Closing: 0.2s transform (was 0.16s), stagger 40ms/0ms (was 30ms/0ms)

Also increased `CLOSE_ANIMATION_DURATION` constant from 180ms → 220ms to match new timings.

## Technical Notes
- Icons use `position: absolute` within a fixed-size wrapper for smooth overlap
- Bouncy easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` - the 1.56 creates overshoot
- Different rotation directions create visual interest (chevron-up spins down, chevron-right spins clockwise)

## Files Changed
- `src/components/Header.jsx` - Restructured toggle button with both icons
- `src/index.css` - Added `.toggle-icon-wrap` and `.toggle-icon` styles, updated button timing



