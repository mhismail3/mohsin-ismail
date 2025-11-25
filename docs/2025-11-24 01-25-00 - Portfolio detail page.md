# Portfolio Detail Page

Reference: `docs/2025-11-24 01-25-00 - Portfolio detail page.md`

## Features
Implemented a comprehensive detail page for portfolio projects.

1.  **Data Model**: Updated `src/portfolioProjects.js` to include `slug`, `description`, `github` link, and `gallery` images.
2.  **Routing**: Added `/portfolio/:slug` route in `src/App.jsx`.
3.  **Component**: Created `src/ProjectPage.jsx`.
    - Displays project title, date, and description.
    - **GitHub Card**: A styled link to the repository with a "View Source" label and icon.
    - **Interactive Carousel**: A horizontal scrolling gallery that responds to mouse movement. Hovering near the edges accelerates the scroll in that direction; hovering near the center slows it down. Includes a fade mask on the edges.
    - **Lightbox**: Clicking any carousel image opens a modal overlay with the image centered, styled with a retro border and shadow.
4.  **Portfolio Grid**: Updated `src/PortfolioPage.jsx` to wrap project cards in `Link` components, enabling navigation to the detail page.

## Interaction Details
- **Carousel**: Uses `requestAnimationFrame` and mouse position tracking (`useRef`) to create a smooth, continuous scroll effect without direct scrollbars.
- **Lightbox**: Uses a fixed overlay with a blur backdrop. The image pop-in animation creates a satisfying "card" effect.




