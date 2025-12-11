# Theme Transition Consistency Fix

## Problem
When toggling between light and dark modes, some UI elements immediately changed color while others animated smoothly, causing a jarring visual inconsistency. This was visible in the screenshots where elements like pills, buttons, and the header background would flash during theme transitions.

## Root Cause
Many elements used CSS variables that change between themes (e.g., `--bg-white`, `--ink`, `--color-border`, `--shadow-retro-sm`), but lacked appropriate `transition` properties for those color-related properties. While `base.css` had transitions on `html` and `body`, individual components either:
1. Had no transitions at all for theme-sensitive colors
2. Had explicit `transition` properties that didn't include theme-sensitive properties (overriding any global transitions)

## Solution
Applied a two-part fix:

### 1. Global Theme Transition Variables (`tokens.css`)
Added new CSS custom properties for consistent theme transition timing:
```css
--theme-transition-duration: 0.2s;
--theme-transition-ease: ease;
```

### 2. Universal Theme Transition Rule (`base.css`)
Added a global transition rule applying to all elements and pseudo-elements:
```css
*,
*::before,
*::after {
  transition-property: background-color, border-color, color, fill, stroke, 
                       box-shadow, filter, outline-color, text-decoration-color;
  transition-duration: var(--theme-transition-duration, 0.2s);
  transition-timing-function: var(--theme-transition-ease, ease);
}
```

### 3. Component-Level Transition Updates
Updated all components with explicit `transition` properties to include theme-related properties:

**Files Updated:**
- `components/button.css` - Added `border-color`, updated timing
- `components/pill.css` - Added `border-color`, updated timing for `.pill` and `.pill.icon-btn`
- `components/panel.css` - Added `box-shadow`, updated to use theme variables
- `components/header.css` - Updated `.top-bar`, `.theme-toggle`, `.brand`, `.brand-mark-inner`, `.top-menu`
- `components/carousel.css` - Added `background-color`, `border-color` to `.carousel-item`
- `components/lightbox.css` - Updated `.lightbox-close`
- `components/code-block.css` - Updated `.code-block-copy`, `.code-block-expand`
- `components/post-card.css` - Updated `.post-title-link`, `.post-body img`, `.post-body blockquote`, `.post-body blockquote cite`, `.post-body a`
- `pages/about.css` - Updated `.contact-icon-btn`
- `pages/blog.css` - Updated `.back-link`, `.post-nav-link`, `.post-nav-label`, `.post-nav-title`
- `pages/portfolio.css` - Updated `.project-card`, `.featured-project-card`
- `pages/project.css` - Updated `.github-card`, `.github-arrow`

## Properties Transitioned
The following properties are now consistently transitioned during theme changes:
- `background-color` - Panel backgrounds, button fills, etc.
- `border-color` - Retro borders, dashed lines
- `color` - Text colors
- `fill` / `stroke` - SVG icons
- `box-shadow` - Retro shadows, soft shadows
- `filter` - Drop shadows on social icons
- `outline-color` - Focus outlines
- `text-decoration-color` - Link underlines

## Additional Fixes (Follow-up)

### Menu Toggle Button Override
The `.menu-toggle` had its transitions overridden by a collapse animation rule at line 677 in `header.css`. Updated to include theme transition properties alongside the opacity collapse transition:
```css
.top-bar .brand-name,
.top-bar .menu-toggle {
  transition: opacity var(--collapse-duration) var(--collapse-ease),
              background-color var(--theme-transition-duration) var(--theme-transition-ease),
              border-color var(--theme-transition-duration) var(--theme-transition-ease),
              box-shadow var(--theme-transition-duration) var(--theme-transition-ease),
              color var(--theme-transition-duration) var(--theme-transition-ease);
}
```

### Gradient Fade Elements
CSS gradients cannot be transitioned directly (they snap to new values). For elements using gradients with theme variables, added opacity transitions to soften the change:
- `.post-excerpt.has-overflow::after` - Post card text truncation fade
- `.code-block-fade` - Code block truncation fade

## Result
All UI elements now animate smoothly and consistently when toggling between light and dark themes, eliminating the visual "flash" that occurred before.








