# Post Markdown Structure

## Summary
Refactored the posts system to use a complete markdown-based structure similar to project.md files. Posts now contain all metadata including a separate `tldr` field, and code blocks are automatically rendered as `CodeBlock` components.

## Changes

### Deleted Files
- All 12 sample posts in `posts/` directory

### New Files
- `posts/2025-11-15-tactile-ui-field-notes.md` - Sample post demonstrating new structure

### Modified Files
- `src/posts.js` - Updated to parse `tldr` field and extract code blocks
- `src/PostPage.jsx` - Renders CodeBlock components from markdown code fences
- `src/components/PostCard.jsx` - Uses `tldr` field for expandable preview

## New Post Structure

```markdown
---
title: "Post Title"
date: "2025-11-15"
tags:
  - tag1
  - tag2
summary: "One-line summary shown on post cards"
tldr: |
  Multi-line markdown content shown when 
  clicking the tl;dr button on the home page.
  
  Supports **bold**, lists, etc.
---

Full post content goes here with markdown.

Code blocks are automatically converted to CodeBlock components:

\`\`\`javascript
const example = true;
\`\`\`
```

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title |
| `date` | Yes | Publication date (YYYY-MM-DD) |
| `tags` | Yes | Array of tag strings |
| `summary` | Yes | One-line description for cards |
| `tldr` | No | Markdown content for expandable preview |
| Content | Yes | Full post content after frontmatter |

## Code Block Detection

Code fences in markdown are automatically:
1. Extracted with their language identifier
2. Replaced with placeholder divs during parsing
3. Rendered as `<CodeBlock>` components on the post page
4. Language is auto-uppercased in the header (e.g., `typescript` → `TYPESCRIPT`)

## How It Works

1. `posts.js` uses `gray-matter` to parse frontmatter
2. Code blocks are extracted with regex and stored in `codeBlocks` array
3. Placeholders are inserted in HTML: `<div data-codeblock="0" ...></div>`
4. `PostPage.jsx` parses the HTML and replaces placeholders with React `<CodeBlock>` components
5. `PostCard.jsx` renders `tldr` HTML for the expandable preview





