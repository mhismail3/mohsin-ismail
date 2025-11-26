# First Real Post with Time Format

## Summary
Updated the blog to display times alongside dates on posts, and created the first real blog post about AI agent rules.

## Changes Made

### 1. Updated `formatDate` utility (`src/utils.js`)
- Previously only displayed: "Nov 25, 2025"
- Now displays: "Nov 25, 2025 7:55 PM"
- Uses `Intl.DateTimeFormat` for both date and time parts

### 2. Created first real post (`posts/2025-11-25-agent-rules.md`)
- Title: "The rules I give my AI agents"
- Date: November 25, 2025 at 7:55 PM PT (ISO: `2025-11-25T19:55:00-08:00`)
- Tags: ai, workflow, automation
- Content: A sanitized version of an AGENTS.MD file with all Amazon-specific content removed
- Includes mention of testing with Sonnet 4.5 and plans to test Opus 4.5

### 3. Removed example post
- Deleted `posts/2025-11-15-tactile-ui-field-notes.md`

## Technical Details

The date frontmatter now uses ISO 8601 format with timezone offset (`2025-11-25T19:55:00-08:00`) which JavaScript's `Date` constructor parses correctly, preserving the intended local time regardless of the user's timezone.

## Files Modified
- `src/utils.js` - Updated formatDate function
- `posts/2025-11-25-agent-rules.md` - New post (created)
- `posts/2025-11-15-tactile-ui-field-notes.md` - Removed
