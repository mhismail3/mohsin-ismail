# Post Images Retro Style and Lightbox

## Date
2025-11-25 14:30:00

## Summary
Updated the styling of images in blog posts (both TL;DR expanded view and full post detail page) to match the retro border and solid shadow style used in project detail pages. Also added click-to-open lightbox functionality for post images.

## Changes

### CSS (`src/index.css`)
- Updated `.post-body img` styling to use `--border-retro` and `--shadow-retro` variables instead of the previous rounded/soft shadow style
- Added hover and active states with the retro "press" effect (translate + shadow collapse)
- Added `cursor: pointer` to indicate images are clickable
- Updated `.post-body video, .post-body iframe` to also use the retro border/shadow style for consistency

### PostCard.jsx (`src/components/PostCard.jsx`)
- Added `useState` for `selectedImage` to track which image is open in lightbox
- Added `useRef` for `postBodyRef` to reference the post body DOM element
- Added `useEffect` hook that attaches click handlers to all images when the TL;DR section is expanded
- Added lightbox modal component (same markup as ProjectPage) that displays when an image is clicked

### PostPage.jsx (`src/PostPage.jsx`)
- Added `useState` for `selectedImage` to track which image is open in lightbox
- Added `useRef` for `postBodyRef` to reference the post body DOM element
- Added `useEffect` hook that attaches click handlers to all images in the post content
- Added lightbox modal component (same markup as ProjectPage) that displays when an image is clicked

## Technical Notes
- The lightbox uses the existing `.lightbox-overlay` and `.lightbox-content` CSS classes that were already defined for ProjectPage
- Image click handlers are added/removed via `useEffect` since the content is rendered via `dangerouslySetInnerHTML`
- The effect cleanup properly removes event listeners to prevent memory leaks

