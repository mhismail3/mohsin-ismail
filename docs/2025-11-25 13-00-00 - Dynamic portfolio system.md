# Dynamic Portfolio System

## Summary
Converted the portfolio system from a hardcoded array to a dynamic file-based system similar to how blog posts work. Also fixed UI issues with button icons and updated text styling.

## Changes Made

### New Dynamic System
Projects are now loaded from markdown files in the `projects/` directory:

```
projects/
  alces-pdf-merger.md    (frontmatter + content)

public/projects/
  alces-pdf-merger/
    cover.jpg            (main image)
    gallery-1.png        (gallery images)
    gallery-2.png
    ...
```

### Markdown Frontmatter Schema
Each project markdown file uses this frontmatter:

```yaml
---
title: Project Title
slug: project-slug           # Used for URLs and image paths
date: 2025-11-20             # ISO date for sorting
summary: Short description for portfolio grid
github: https://github.com/...
live: https://live-demo-url.com
tags:
  - React
  - TypeScript
status: Completed
cover: cover.jpg             # Filename in public/projects/{slug}/
gallery:
  - gallery-1.png            # Filenames auto-prefixed with /projects/{slug}/
  - gallery-2.png
---

Full markdown description content goes here...
```

### portfolioProjects.js Updates
- Now uses Vite's `import.meta.glob` to dynamically import all `../projects/*.md` files
- Parses frontmatter using `gray-matter`
- Parses content to HTML using `marked` + `dompurify`
- Auto-constructs image paths from `public/projects/{slug}/`
- Sorts projects by date (newest first)

### UI Fixes

#### Button Icons (ProjectPage.jsx)
- Changed "Live Demo" text to "Visit"
- Replaced nested `<div className="icon">` with inline SVG using `pill-icon` class
- Icons now properly vertically aligned with text

#### CSS Updates (index.css)
- Added `.pill.project-link-pill` for proper padding
- Added `.pill-icon` with 14px size for centered alignment
- Updated `.project-description` with reduced font-size (0.95rem)
- Added tighter spacing for h2, h3, p, ul, li elements
- Added code styling for inline code blocks

## Adding New Projects

1. Create markdown file: `projects/{slug}.md` with frontmatter
2. Create image folder: `public/projects/{slug}/`
3. Add images: `cover.jpg` + `gallery-*.{jpg,png}`
4. Done! The project will auto-appear on the portfolio page

No code changes required to add new projects.
