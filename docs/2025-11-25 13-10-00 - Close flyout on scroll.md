# Close Flyout Menu on Scroll

**Date:** 2025-11-25 13:10:00

## Summary

Added automatic closing of the header flyout navigation menu when the user starts scrolling.

## Changes

### `src/components/Header.jsx`

Added a new `useEffect` hook that listens for scroll events when the menu is open:

```jsx
// Close menu on scroll
useEffect(() => {
  if (!isOpen || isClosing) return;

  const handleScroll = () => {
    closeMenu();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, [isOpen, isClosing, closeMenu]);
```

## Behavior

- When the flyout menu is expanded (user clicked "..." button)
- And the user starts scrolling the page
- The menu automatically animates closed using the existing `closeMenu()` function
- Uses `passive: true` for optimal scroll performance
- Listener is only attached when menu is open and not already closing
- Cleanup removes the listener when menu closes or component unmounts

## Rationale

Improves UX by automatically dismissing the navigation flyout when the user's intent shifts to scrolling the page content, keeping the interface clean and unobtrusive.




