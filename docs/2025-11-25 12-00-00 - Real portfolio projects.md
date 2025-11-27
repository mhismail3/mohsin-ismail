# Real Portfolio Projects Migration

## Summary
Replaced all placeholder portfolio projects with real projects, starting with the Alces PDF Merger. Established a scalable folder structure for adding more projects in the future.

## Changes Made

### New Folder Structure
Created `/public/projects/` directory to store project assets:
```
public/
  projects/
    alces-pdf-merger/
      cover.jpg       (main portfolio card image)
      gallery-1.png   (screenshot 1)
      gallery-2.png   (screenshot 2)
      gallery-3.png   (screenshot 3)
      gallery-4.png   (screenshot 4)
```

### portfolioProjects.js Updates
- Removed all 12 placeholder projects
- Added real Alces PDF Merger project with:
  - Markdown description (parsed to HTML at build time)
  - Local image paths instead of Unsplash URLs
  - GitHub repo link
  - Live demo link
  - Tech stack tags
  - Status indicator
- Added markdown parsing support using existing `marked` + `dompurify` dependencies

### ProjectPage.jsx Updates
- Updated to render HTML descriptions using `dangerouslySetInnerHTML`
- Added support for `tags` array display
- Added support for `live` demo link button
- Added `status` display in the eyebrow
- Improved alt text for gallery images

### PortfolioPage.jsx Updates
- Removed Unsplash image optimization parameters
- Updated intro text to reflect real projects
- Simplified project processing function

### CSS Updates
- Added `.project-links` container for link buttons
- Added `.project-header .tag-row` styling

### Files Cleaned Up
- Deleted `/pdf-merger-files/` directory after migrating assets

## Rationale
- **Scalability**: The `/public/projects/{project-slug}/` structure makes it easy to add new projects by creating new folders
- **Markdown Support**: Rich descriptions with headers, lists, and code blocks make project writeups more detailed
- **Local Assets**: Eliminates dependency on external image services and ensures images are always available
- **Consistent Patterns**: Reuses the same markdown rendering pattern as blog posts

## Adding New Projects
To add a new project:
1. Create folder: `/public/projects/{project-slug}/`
2. Add images: `cover.jpg` + `gallery-*.{jpg,png}`
3. Add entry to `portfolioProjects.js` with markdown description




