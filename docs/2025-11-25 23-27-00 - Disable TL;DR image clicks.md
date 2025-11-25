# Disable TL;DR Image Clicks

**Date:** 2025-11-25

## Summary
Removed the ability to click/interact with images in the TL;DR preview section on the home page. Users must now open the full post page to view images in full screen.

## Changes

### `src/index.css`
Added CSS rule to disable pointer events on images within post card TL;DR sections:

```css
/* Disable image click in TL;DR preview (home page post cards) */
.post-card .post-body img {
  pointer-events: none;
  cursor: default;
}
```

## Rationale
- Encourages users to read the full post rather than just viewing images in preview
- Keeps the TL;DR section as a quick summary without full image interaction
- Images remain fully interactive on the dedicated post page (`/posts/:slug`)

## Technical Details
- The selector `.post-card .post-body img` specifically targets images within the TL;DR expanded content on post cards
- This does NOT affect images on the full post page (which uses `.post-body.full-content` class without a `.post-card` parent)
- `pointer-events: none` prevents all mouse/touch interaction including clicks
- `cursor: default` ensures no pointer/zoom cursor appears on hover
