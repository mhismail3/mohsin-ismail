# Header Navigation Flicker Fix

## Date
2025-12-11

## References
- Previous: `2025-12-11 13-12-00 - Header Animation Refinement.md`

## Problem
When the header was collapsed (user scrolled down, only photo visible) and the user clicked the photo to navigate to another page, the header would briefly flash:
1. The collapsed header would briefly expand (show full header bar)
2. Then disappear
3. Then fade in with the animation

## Root Cause
The issue was a timing conflict between React's render cycle and state updates:

1. **Navigation triggers** → PageTransitionContext's `useLayoutEffect` sets `isReady=false` and `isNavigating=true`
2. **Header re-renders** with new context values, but `isCollapsed` state is still `true`
3. **Header's `useEffect`** runs AFTER render, setting `isCollapsed=false`
4. **Second re-render** shows expanded header styling
5. **Flash occurs** because:
   - CSS transitions on background/border/shadow animate during collapsed→expanded change
   - `animation-fill-mode: both` could retain old animation end values
   - `visibility` wasn't being controlled, only `opacity`

## Solution

### 1. Use `useLayoutEffect` instead of `useEffect` for collapsed state reset
**File:** `src/components/layout/Header.jsx`

```jsx
// BEFORE (runs after paint - causes flash)
useEffect(() => {
  if (isNavigating) {
    setIsCollapsed(false);
  }
}, [isNavigating]);

// AFTER (runs synchronously before paint - no flash)
useLayoutEffect(() => {
  if (isNavigating) {
    setIsCollapsed(false);
  }
}, [isNavigating]);
```

This ensures the collapsed state change happens in the same synchronous cycle as the context update, before the browser paints.

### 2. Add `visibility: hidden` and `animation: none` to init state
**File:** `src/styles/components/page-transition.css`

```css
.top-bar.transition-init {
  opacity: 0;
  visibility: hidden;  /* Robust fallback - truly hidden */
  animation: none;     /* Clear previous animation state */
  pointer-events: none;
}

.top-bar.transition-ready {
  visibility: visible;  /* Override visibility */
  animation: headerFadeIn 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) both;
  pointer-events: auto;
}
```

Benefits:
- `visibility: hidden` ensures nothing is visible even if CSS transitions or opacity conflicts occur
- `animation: none` clears any retained animation state from `animation-fill-mode: both`

## Result
The header now transitions smoothly during navigation:
1. Header is hidden immediately (visibility + opacity)
2. State changes happen synchronously (no visual flash)
3. Header fades in elegantly with the new page

## Files Modified
- `src/components/layout/Header.jsx` - Changed `useEffect` to `useLayoutEffect`
- `src/styles/components/page-transition.css` - Added `visibility` and `animation: none`
