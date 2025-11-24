# Safari glass background

- Moved the base gradient onto `html` and let `body` inherit it with `min-height: 100vh/100dvh` so Safari samples the gradient for Liquid Glass tinting instead of a flat fallback and overscroll no longer shows white.
- Updated `#root` and `.app` to use `vh/svh/dvh` fallbacks, keeping the background continuous across dynamic viewport changes on iOS 26 while preserving existing spacing/layout.
- Kept the existing grain + glass overlay stack; they remain pointerless at z-index 0 so the content layer stays unchanged while the page now has a single uniform background for Safari to blur against.
- Rationale: iOS 26 tints its chrome from page backgrounds (not theme-color); putting the gradient at the root and covering the full viewport ensures the tab/toolbar glass picks up the intended cream gradient instead of a solid tint.
