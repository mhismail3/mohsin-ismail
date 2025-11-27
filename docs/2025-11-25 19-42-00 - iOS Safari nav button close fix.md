# iOS Safari Nav Button Close Fix

## Problem
On iPhone Safari, tapping the up arrow button to hide the Portfolio and About buttons would cause them to get stuck - they wouldn't disappear.

## Root Causes Identified

### 1. CSS Specificity Issue
When closing, the element has BOTH `visible` AND `closing` classes:
```
top-menu visible closing mobile
```

Both `.top-menu.mobile.visible .btn` and `.top-menu.mobile.closing .btn` had equal specificity (3 class selectors each). While source order should make `.closing` win, iOS Safari can be buggy with equal-specificity selectors.

### 2. `transform-style: preserve-3d` Causing Layer Issues
iOS Safari has known issues with `preserve-3d` causing elements to get stuck in compositing layers. We weren't actually doing any 3D transforms - just 2D transforms with rotation.

### 3. `will-change` Persistence
iOS Safari can have issues where elements with `will-change` get "stuck" in a compositing layer and don't update properly during class changes.

### 4. Missing `-webkit-` Prefixes
iOS Safari sometimes requires explicit webkit-prefixed properties for transforms and transitions.

## Fixes Applied

### 1. Increased CSS Specificity for Closing
Changed:
```css
.top-menu.mobile.closing .btn { ... }
```
To:
```css
.top-menu.mobile.visible.closing .btn { ... }
```

This uses 4 class selectors instead of 3, guaranteeing it overrides `.visible` styles.

### 2. Removed Problematic 3D Properties
Removed:
```css
transform-style: preserve-3d;
-webkit-transform-style: preserve-3d;
will-change: transform, opacity;
```

Kept only:
```css
-webkit-backface-visibility: hidden;
backface-visibility: hidden;
```

### 3. Added `-webkit-` Prefixes
Added explicit webkit-prefixed versions:
- `-webkit-transform`
- `-webkit-transform-origin`
- `-webkit-transition`
- `-webkit-transition-delay`

## Files Changed
- `src/index.css` - Fixed mobile and desktop nav button animation CSS

## Testing
Test on iOS Safari by:
1. Open the site on iPhone
2. Tap the "..." button to show nav
3. Tap the up arrow to hide nav
4. Buttons should now animate out properly




