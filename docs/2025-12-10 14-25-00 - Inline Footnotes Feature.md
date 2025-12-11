# Inline Footnotes Feature

**Date:** 2025-12-10  
**Type:** New Feature

## Overview

Implemented a comprehensive inline footnote system for blog posts. Footnotes appear as small circular superscript bubbles that, when clicked or tapped, open an animated popup displaying additional context.

## Markdown Syntax

```markdown
Some text^[This is the footnote content.] and more text.
```

The `^[...]` syntax is inspired by Pandoc's inline footnote format. Content inside the brackets can include inline markdown:
- *emphasis* and **strong** text
- `inline code`
- [links](https://example.com)

## Implementation Details

### Files Created
- `src/components/features/Footnote.jsx` - React component for the bubble trigger and popup
- `src/styles/components/footnote.css` - Styling with retro aesthetic matching the site

### Files Modified
- `src/data/posts.js` - Added `extractFootnotes()` function to parse `^[...]` syntax
- `src/pages/PostPage.jsx` - Added portal-based rendering of Footnote components
- `src/components/features/index.js` - Added Footnote export
- `src/styles/index.css` - Added footnote.css import

### Architecture

The footnote system uses a **portal-based approach**:

1. **Extraction (posts.js):** During markdown processing, `^[content]` patterns are extracted and replaced with `<span data-footnote="N">` placeholder elements. Footnote data is stored in an array.

2. **Rendering (PostPage.jsx):** The HTML is rendered normally with placeholder spans intact. After the component mounts, `useEffect` finds all `[data-footnote]` elements and stores them in state.

3. **Portal Injection:** React portals render `<Footnote>` components directly into the placeholder span elements, preserving the HTML structure perfectly.

This approach was chosen over HTML string splitting (which breaks DOM structure) because inline footnotes appear within paragraph elements and cannot be cleanly extracted without breaking the surrounding HTML.

### Footnote Component Features

- **Trigger Bubble:** Circular superscript with footnote number, styled with site's accent colors (aero/pine)
- **Animated Popup:** Bouncy scale-in animation using `var(--ease-bounce)`
- **Smart Positioning:** Popup positions below the trigger by default, flips above if insufficient viewport space
- **Click Outside to Close:** Transparent overlay detects clicks outside the popup
- **Escape Key Support:** Pressing Escape closes the popup
- **Scroll/Resize Handling:** Popup repositions if viewport changes while open
- **Accessibility:** Proper ARIA attributes, keyboard navigation support, focus management
- **Mobile Support:** Touch-friendly interactions, responsive popup sizing
- **Theme Support:** Full dark mode compatibility
- **Reduced Motion:** Respects `prefers-reduced-motion` preference

## Demo Post

A demo post was already created at `public/posts/2025-12-10-footnote-demo/post.md` showcasing the feature.

## Usage Notes

- Footnotes are auto-numbered based on order of appearance in the document
- Keep footnote content concise; they're meant for side-notes, not paragraphs
- The popup supports inline markdown for rich formatting
- Multiple footnotes can appear in the same paragraph

