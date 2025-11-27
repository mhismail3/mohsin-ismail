# Fix Copy Link for HashRouter

**Date:** 2025-11-25 13:15:00

## Summary

Fixed the "copy link" button on post cards to generate correct URLs after switching from BrowserRouter to HashRouter.

## Problem

After switching to HashRouter, the copy link button was generating URLs like:
```
https://example.com/posts/my-post
```

But HashRouter requires URLs in the format:
```
https://example.com/#/posts/my-post
```

## Changes

### `src/components/PostCard.jsx`

Updated the URL construction in `handleCopyLink`:

**Before:**
```javascript
const url = `${window.location.origin}/posts/${post.slug}`;
```

**After:**
```javascript
const url = `${window.location.origin}/#/posts/${post.slug}`;
```

## Rationale

HashRouter uses the URL hash (`#`) to manage client-side routing, which is necessary for GitHub Pages hosting where server-side routing isn't available. All internal links must include the `/#` prefix for the router to properly handle them.





