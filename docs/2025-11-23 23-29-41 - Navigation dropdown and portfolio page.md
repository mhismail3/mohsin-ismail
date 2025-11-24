# Navigation dropdown and portfolio page

- Replaced the top-right “About” link with an ellipsis toggle in `Header` that animates the sticky bar open/closed and reveals `Portfolio` and `About` buttons for routing.
- Added `/portfolio` with an endless-scroll, lazy-loaded 3-column moodboard on desktop and paginated single-column list on mobile; projects are seeded in `src/portfolioProjects.js`.
- Added `/about` page that reuses the existing About content; kept the home-page panel for continuity.
- Styled portfolio cards to mimic the retro button treatment (border + shadow) with a blurred title pill that matches the header glass effect.
- Navigation buttons now highlight the active page; brand button still resets home filters and scrolls up.
