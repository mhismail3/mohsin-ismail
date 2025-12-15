# Table of Contents Feature for Blog Posts

## Overview
Added an expandable/collapsible Table of Contents (TOC) component that appears underneath blog post titles when the post contains h2 or h3 headings.

## Implementation Details

### Files Created
- `src/components/features/TableOfContents.jsx` - React component with expand/collapse state and smooth scroll handling
- `src/styles/components/table-of-contents.css` - Styling matching the site's retro aesthetic

### Files Modified
- `src/data/posts.js` - Added heading extraction and ID generation for anchor links
  - New functions: `generateHeadingId()`, `extractHeadings()`, `addHeadingIds()`
  - Posts now include a `headings` array with `{ level, text, id }` objects
  - Added `id` to DOMPurify allowed attributes
- `src/pages/PostPage.jsx` - Added `TableOfContents` component after post title
- `src/components/features/index.js` - Exported the new component
- `src/styles/index.css` - Imported the new CSS file

## Features
1. **Automatic extraction**: Headings (h2, h3) are extracted from markdown content
2. **URL-friendly IDs**: Generated slugs handle special characters and duplicates
3. **Expand/collapse**: TOC starts collapsed and can be toggled
4. **Smooth scrolling**: Clicking a heading scrolls smoothly with ease-in-out animation
5. **Visual hierarchy**: h3 headings are indented to show nesting
6. **Staggered animation**: TOC items animate in sequence when expanded
7. **Target highlight**: Scrolled-to headings get a brief highlight pulse
8. **Conditional rendering**: TOC only appears on posts that have headings
9. **Dark mode support**: Proper styling for both light and dark themes
10. **Accessibility**: Proper ARIA labels and keyboard navigation support
11. **Reduced motion**: Respects `prefers-reduced-motion` preference

## Styling
The TOC uses the site's retro aesthetic:
- Border with shadow matching code blocks
- Numbered circles for each section
- Hover states with color transitions
- Badge showing total section count
- Chevron icon that rotates when expanded










