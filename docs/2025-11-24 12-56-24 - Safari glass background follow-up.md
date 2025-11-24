# Safari glass background follow-up

- Removed the fixed `.glass-gradient` overlay so Safari stops sampling a transparent fixed layer near the edges; this lets the chrome tint pull from the actual page background instead of flattening to white.
- Put the gradient directly on both `html` and `body` with explicit `background-color` plus the existing cream gradient, and kept full-height fallbacks (`vh/svh/dvh`) so the background spans the whole viewport and overscroll areas for Safari’s Liquid Glass.
- Added `viewport-fit=cover` to the meta viewport so the background paints into the safe areas behind the status/tab bars on iOS.
- Expectation: with Reduce Transparency off, Safari should now tint from the cream gradient (not white) at both the top status bar and bottom search/tab bar when scrolled to the top.
