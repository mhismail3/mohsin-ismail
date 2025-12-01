# Progressive Image Loading for Carousels

**Date:** 2025-12-01  
**Purpose:** Improve UX for large images in carousels by adding progressive loading with blur-up effect

## Problem

The site has large images (some up to 5.2MB) that can take a long time to load, especially in photo carousels. This caused:
- Blank spaces while images loaded
- Poor perceived performance
- No visual feedback during loading

## Solution

Implemented a comprehensive progressive image loading system with:

### 1. `ProgressiveImage` Component (`src/components/ui/ProgressiveImage.jsx`)

A new component that provides:
- **Lazy loading** via Intersection Observer with 200px preload margin
- **Shimmer skeleton placeholder** while loading
- **Blur-up transition** when image loads (blur → sharp)
- **Error state handling** with fallback UI
- **Eager loading option** for immediately visible images

Exported utilities:
- `preloadImage(src)` - Preload a single image programmatically
- `useImagePreloader(srcs, enabled)` - Hook for bulk preloading

### 2. CSS Styles (`src/styles/components/progressive-image.css`)

- Animated shimmer effect for placeholder
- Smooth blur/opacity/scale transition (0.5s)
- Theme-aware shimmer highlights (light/dark)
- Reduced motion support (`prefers-reduced-motion`)
- Carousel and Lightbox-specific integrations

### 3. Carousel Enhancements (`src/components/features/Carousel.jsx`)

Smart preloading strategy:
- First 3 images preload on mount
- Adjacent images preload as user scrolls (next 2, previous 1)
- First 2 images + nearby images load eagerly
- Remaining images lazy load

### 4. Lightbox Integration (`src/components/features/Lightbox.jsx`)

- Uses `ProgressiveImage` for full-size images
- Faster transition (0.3s) for focused content
- Maintains blur-up effect for large images

## Files Changed

- `src/components/ui/ProgressiveImage.jsx` (new)
- `src/components/ui/index.js` (export added)
- `src/styles/components/progressive-image.css` (new)
- `src/styles/index.css` (import added)
- `src/components/features/Carousel.jsx` (updated)
- `src/components/features/Lightbox.jsx` (updated)
- `src/styles/components/lightbox.css` (updated)

## UX Improvements

1. **Immediate feedback** - Users see shimmer placeholders instantly
2. **Smooth transitions** - Images fade in with blur-up effect
3. **Perceived performance** - Adjacent images preload for smooth scrolling
4. **Accessibility** - Reduced motion support, error states, proper alt text
5. **Bandwidth efficiency** - Off-screen images only load when approaching viewport

## Technical Notes

- Uses native Intersection Observer API (no dependencies)
- Image preloading uses `new Image()` pattern
- CSS transitions handle the visual effect (no JS animation)
- Component handles both carousel thumbnails and lightbox full-size images
