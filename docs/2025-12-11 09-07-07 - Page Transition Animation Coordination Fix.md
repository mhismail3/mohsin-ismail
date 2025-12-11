# Page Transition Animation Coordination Fix

**Date:** 2025-12-11  
**Issue:** Header flickering and conflicting animations during page navigation

## Problem

When navigating between pages while scrolled down, multiple animations would conflict:

1. **Header flicker sequence:**
   - Header initially renders visible (initial state)
   - Header's scroll listener fires → detects "scrolled down" → collapses header
   - Smooth scroll to top begins
   - As scroll approaches top → header expands again
   - Result: visible → collapsed → visible flicker

2. **Competing animations:**
   - Content fade-in animation starts while smooth scroll is still in progress
   - Header collapse/expand animation overlaps with content animation
   - Smooth scroll animation adds visual noise

3. **Root cause:** Header was rendered inside each page component (and thus inside PageTransition), causing it to remount on every navigation due to `key={location.pathname}`.

## Solution

Two-part fix for completely seamless page transitions:

### Part 1: Move Header Outside PageTransition

**The key insight:** The header was inside the `PageTransition` component which uses `key={location.pathname}` to force remounting on navigation. This caused the header to unmount and remount on every route change, creating a brief flash.

**Solution:** Move the Header to the App level, outside of PageTransition:

```jsx
// App.jsx
<Router>
  <PageTransitionProvider>
    <div className="app">
      {/* Header lives OUTSIDE PageTransition - never remounts */}
      <Header label="Mohsin Ismail" onLogoClick={resetTags} />
      <PageTransition>
        <Routes>...</Routes>
      </PageTransition>
    </div>
  </PageTransitionProvider>
</Router>
```

### Part 2: Coordinate Visibility via Context

**PageTransitionContext** manages the transition state:
- **`isNavigating`**: True during navigation (header suspends scroll behavior)
- **`isReady`**: True when content should animate in

**Flow on navigation:**
1. Route changes → `isNavigating = true`, `isReady = false`
2. **Instant scroll to top** (`behavior: 'auto'`) in `useLayoutEffect` - before browser paints
3. Wait for DOM paint (double `requestAnimationFrame`)
4. `isReady = true` → content and header fade in together
5. After settling time (350ms) → `isNavigating = false`
6. Header can now react to scroll normally

### Header Visibility Classes

Since header is outside PageTransition, it can't rely on parent CSS selectors. Instead, it applies classes directly based on context state:

```jsx
// Header.jsx
const { isNavigating, isReady } = usePageTransition();

const headerClass = [
  'top-bar',
  // ... other classes
  isReady ? 'transition-ready' : 'transition-init',
].filter(Boolean).join(' ');
```

```css
/* page-transition.css */
.top-bar.transition-init {
  opacity: 0;
  pointer-events: none;
}

.top-bar.transition-ready {
  animation: simpleFadeIn 0.24s ease-out both;
}
```

## Files Changed

- `src/App.jsx` - Header moved to App level, outside PageTransition
- `src/pages/*.jsx` - Removed Header from all page components
- `src/components/layout/Header.jsx` - Uses context for visibility, suspends scroll during navigation
- `src/contexts/PageTransitionContext.jsx` - Manages navigation state
- `src/styles/components/page-transition.css` - Direct header classes instead of parent selectors
- `src/hooks/usePageTitle.js` - Simplified to just set document title
- `src/components/layout/PageLayout.jsx` - Removed scroll option

## Result

- **Zero header flicker** - Header never remounts, just updates its state
- **Instant scroll** - No visible scroll animation during navigation
- **Unified fade-in** - Header and content animate in together seamlessly
- **Proper scroll suspension** - Header doesn't react to scroll during transitions
- Works identically on fresh page loads and client-side navigation
