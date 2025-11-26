# Home Page Refactor to Landing Page

**Date:** 2025-11-26 20:45:00  
**Type:** Major Refactor

## Summary

Refactored the site navigation structure so the home page becomes a "sample/landing" page that showcases the best of the site, while moving the full blog functionality to its own dedicated page.

## Changes Made

### New Files
- **`src/BlogPage.jsx`** - New page containing the full blog functionality:
  - All posts with pagination (10 per page)
  - Tag filtering with tag cloud
  - Active tag display and clear functionality
  - AboutPanel at the bottom

### Modified Files

#### `src/Home.jsx`
- Completely refactored from blog listing to landing page
- Now displays:
  1. **Latest Project** - Single featured portfolio project at top with "View all projects" link
  2. **Recent Posts** - Latest 3 blog posts with "View all posts" link (no tag filtering)
  3. **About Panel** - Shortened about me section

#### `src/App.jsx`
- Added `/blog` route pointing to `BlogPage`
- Home page (`/`) no longer receives tag/pagination state (not needed)
- BlogPage receives the `selectedTags`, `setSelectedTags`, `page`, and `setPage` props

#### `src/components/Header.jsx`
- Added "Blog" to navigation links (now: Blog, Portfolio, About)
- Updated `CLOSE_ANIMATION_DURATION` from 300ms to 350ms to accommodate 3-button stagger

#### `src/index.css`
- Added styles for featured project panel (`.featured-project-panel`, `.featured-project-card`, etc.)
- Added `.see-all-link` styles for "View all" links
- Updated nav button stagger timing for 3 buttons instead of 2:
  - Mobile open: 20ms, 70ms, 120ms
  - Mobile close: 80ms, 40ms, 0ms
  - Desktop open: 30ms, 75ms, 120ms
  - Desktop close: 80ms, 40ms, 0ms

## Navigation Structure

**Before:**
- `/` - All posts (was the blog)
- `/portfolio` - Portfolio grid
- `/about` - About page

**After:**
- `/` - Landing page (featured project + recent posts + about teaser)
- `/blog` - All posts with pagination and tag filtering
- `/portfolio` - Portfolio grid
- `/about` - About page

## Design Notes

- Featured project image has `max-height: 420px` (280px on mobile) with `object-fit: cover` to prevent overly tall images
- "View all" links have hover animation that slides right
- Recent posts section shows exactly 3 posts without tag filtering (tags on posts are non-interactive on home page)

## Rationale

The home page now serves as a "sample" of the entire website, giving visitors an immediate overview of:
1. What kind of projects I work on (latest project)
2. What I write about (recent blog posts)
3. Who I am (about teaser)

This creates a more engaging first impression compared to jumping straight into a blog listing.

