# Slingshot Gesture Feature (Touch Devices Only)

## Overview

Added a new touch-only interaction for the collapsed header state. When the user scrolls down and only the photo icon is visible, they can **tap, hold, and drag down** to create a rubberband-like tension effect. Releasing the gesture "slingshots" the page smoothly back to the top.

This feature is **only active on touch screen interfaces** (devices with no hover capability).

## Behavior

1. **Activation Conditions:**
   - Touch device (detected via `(hover: none)` media query)
   - Header is collapsed (scrolled past threshold)
   - Menu is not open

2. **Gesture Flow:**
   - **Tap** (without hold): Opens the dropdown menu (existing behavior)
   - **Tap + Hold (120ms) + Drag Down**: Activates rubberband mode
   - **Release after threshold (35px pull)**: Triggers slingshot animation to top
   - **Release before threshold**: Snaps back to original position
   - **Drag up or sideways during hold**: Cancels the gesture

3. **Visual Feedback:**
   - Photo icon translates down and scales slightly during pull
   - Tension indicator (elastic line) appears below the photo
   - Arrow icon fades in when ready to release
   - Pulsing accent ring animation when threshold is met
   - Spring-physics scroll animation on release

## Technical Implementation

### Files Added/Modified

1. **`src/hooks/useSlingshotGesture.js`** (NEW)
   - Custom hook handling all touch gesture logic
   - Rubberband physics with logarithmic resistance
   - Spring-eased scroll animation
   - Returns gesture state and event handlers

2. **`src/hooks/index.js`** (MODIFIED)
   - Added export for `useSlingshotGesture`

3. **`src/components/layout/Header.jsx`** (MODIFIED)
   - Integrated slingshot gesture with collapsed brand-mark
   - Added touch interaction flag to prevent click double-firing
   - Added visual elements (tension indicator, arrow)
   - Applied dynamic transform styles based on gesture state

4. **`src/styles/components/header.css`** (MODIFIED)
   - Added slingshot-specific CSS classes and states
   - Tension indicator styling
   - Arrow indicator styling
   - Pulse animation when ready to release
   - Dark mode support

### Physics Constants

```javascript
holdDelay: 120,      // ms to distinguish tap from hold
pullThreshold: 35,   // px minimum pull to trigger slingshot
maxPull: 100,        // px maximum visual pull distance
resistance: 0.35,    // rubberband resistance factor
```

### Key Design Decisions

1. **Logarithmic Resistance**: Pull distance uses `maxPull * (1 - exp(-rawDistance * resistance / maxPull))` for natural rubber band feel where pulling becomes progressively harder.

2. **Smooth Scroll Animation**: Custom spring-like easing function with dynamic duration based on scroll distance (`300 + scrollY * 0.15`ms, capped at 600ms).

3. **Touch Event Handling**: Uses touch events (not pointer events) for reliability on mobile Safari. Prevents synthetic click events using both `preventDefault()` and a debounce flag.

4. **CSS-Only Pulse Animation**: The "ready to release" state uses CSS keyframe animation to avoid JS overhead.

## Testing Notes

- Feature only activates on touch devices - use Chrome DevTools device emulation or test on actual mobile device
- Scroll down to collapse header, then touch-hold-drag on the photo
- Visual threshold indicator (pulsing ring + arrow) shows when pull is sufficient
- Release should smoothly scroll to top with spring physics
