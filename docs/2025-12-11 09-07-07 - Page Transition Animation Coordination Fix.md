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

3. **Root cause:** No coordination between scroll restoration, header behavior, and content animations.

## Solution

Created a unified coordination system using React context:

### 1. PageTransitionContext (`src/contexts/PageTransitionContext.jsx`)

New context that manages navigation state and coordinates all animations:

- **`isNavigating`**: True during the entire navigation transition (header should suspend scroll behavior)
- **`isReady`**: True when content should animate in

**Flow on navigation:**
1. Route changes → `isNavigating = true`, `isReady = false`
2. **Instant scroll to top** (`behavior: 'auto'`) in `useLayoutEffect` - happens BEFORE browser paints
3. Wait for DOM paint (double `requestAnimationFrame`)
4. `isReady = true` → content and header fade in together
5. After settling time (350ms) → `isNavigating = false`
6. Header can now react to scroll normally

### 2. Header Changes (`src/components/layout/Header.jsx`)

- Added `usePageTransition()` hook
- Header resets to expanded state when navigation starts
- Scroll-based collapse behavior is **suspended** during `isNavigating = true`
- Added `.navigating` class for CSS coordination

### 3. CSS Changes (`src/styles/components/page-transition.css`)

- Header now participates in page transition animation
- Hidden during `.page-transition-init` (opacity: 0)
- Fades in with content during `.page-transition-ready`
- Uses `simpleFadeIn` (no transform) to avoid position issues

### 4. Simplified Scroll Logic

- Removed scroll-to-top from `usePageTitle` hook (now just handles document title)
- Removed scroll-to-top from `Header.jsx` navigation handlers (only scrolls if staying on same page)
- Removed scroll-to-top from `App.jsx` tag change handler
- All navigation scroll is now centralized in `PageTransitionContext`

## Key Implementation Details

**Instant scroll in `useLayoutEffect`:**
```javascript
useLayoutEffect(() => {
  window.scrollTo({ top: 0, behavior: 'auto' });
  // ... rest of animation setup
}, [location.pathname]);
```

This is critical because:
- `useLayoutEffect` runs synchronously before the browser paints
- `behavior: 'auto'` makes the scroll instant (no animation)
- User never sees the page at the old scroll position

**Header suspension:**
```javascript
useEffect(() => {
  if (isNavigating) return; // Don't react to scroll during navigation
  // ... scroll handler
}, [isCollapsed, isNavigating]);
```

## Files Changed

- `src/contexts/PageTransitionContext.jsx` (new)
- `src/contexts/index.js` (export new context)
- `src/components/layout/PageTransition.jsx` (use context instead of local state)
- `src/components/layout/Header.jsx` (suspend scroll, add navigating class)
- `src/components/layout/PageLayout.jsx` (remove scroll option)
- `src/styles/components/page-transition.css` (include header in transition)
- `src/hooks/usePageTitle.js` (remove scroll logic)
- `src/App.jsx` (wrap with PageTransitionProvider, remove scroll from tag change)

## Result

- No more header flickering on navigation
- No more visible scroll animation during navigation
- Header and content fade in together seamlessly
- Scroll-to-top happens instantly before any render
- Header resumes normal scroll behavior after animations settle
