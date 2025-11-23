# Portfolio site setup

- Scaffolded a Vite + React portfolio (no SSR) with dynamic `base` derived from `VITE_BASE_PATH` or `GITHUB_REPOSITORY` for GitHub Pages compatibility.
- Implemented markdown-driven posts via `import.meta.glob` (`query: '?raw'` + `gray-matter`) and render with `marked` + `DOMPurify` (iframe attrs allowed for embeds). Posts live in `posts/` and are sorted reverse-chronologically; pagination is 10 per page.
- UI follows `docs/styling-guide.md`: Newsreader + DM Serif Display, retro shadows (4px→2px→0px), glass panels, dashed insets, and grain background. Mobile-first layout; top bar shows name/About with tag-selected header swap.
- Tag pills filter the feed and swap the header label to the active tag; brand click or clear buttons reset the filter. Posts include toggleable full content, tag rows, and About section anchor.
- Added sample content (12 markdown files) covering images, GIFs, and iframe embed; run `npm run dev` for local preview, `npm run build` for production (note: `gray-matter` emits an eval warning during build).
