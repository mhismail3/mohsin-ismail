# Styling conventions

This page tells you how to change the look of the site without drifting from its design system. The design is retro and minimal: cream and ink colors, solid "retro" borders, offset shadows, a serif display font, and full dark mode. `styling-guide.md` at the repo root covers the design rationale in depth. This page lists the working rules, and `npm run validate` enforces the mechanical ones (via `scripts/check-styles.mjs`).

## Where styles live

```
src/styles/
  index.css            the only stylesheet entry (imported once in src/main.jsx)
  tokens.css           ALL design tokens: colors, type, spacing, radius, shadows, motion, z-index
                       light theme in :root, dark overrides in [data-theme="dark"]
  base.css             resets, body, typography defaults, .frame / layout primitives
  components/*.css     one file per shared component (button, pill, panel, header, carousel, ...)
  pages/*.css          page-specific layout (blog, portfolio, project, about)
```

Rules (checked by `npm run validate`):

1. A new CSS file must be added to `src/styles/index.css` with `@import`. Components never import CSS themselves.
2. Raw color literals (`#hex`, `rgb()`, `rgba()`, `hsl()`) belong only in `tokens.css`. Everywhere else, use `var(--token)`. If no token fits, add one in `tokens.css` with both light and dark values. Old files have a ratcheted baseline in `scripts/check-styles.mjs`, which may go down but never up.
3. JSX never hard-codes colors. Use a class plus tokens instead. Inline `style={{}}` is only for values computed at runtime (positions, sampled colors).

## Tokens to reach for

| Need | Tokens |
|---|---|
| Text | `--color-text`, `--color-text-muted`, `--ink`, `--muted` |
| Surfaces | `--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-surface-hover`, `--color-surface-muted`, `--panel-bg`, `--bg-card` |
| Accent | `--pine` (green accent), `--clay`, `--aero` |
| Borders | `--border-retro`, `--retro-border-color`, `--color-border`, `--color-border-subtle`, `--line` |
| Shadows | `--shadow-retro-sm/-retro/-retro-lg` (offset, tactile), `--shadow-soft`, `--shadow-container*`, `--card-shadow-*` |
| Type | `--font-display`, `--font-body`, `--font-mono`; sizes `--text-xs … --text-4xl`; `--leading-*`, `--tracking-*` |
| Spacing | `--space-2xs … --space-4xl` |
| Radius | `--radius-sm/md/lg/full` |
| Motion | `--duration-fast/normal/slow/slower`, `--ease-out`, `--ease-snap`, `--ease-spring-*`, `--ease-bounce` |
| Layering | `--z-base`, `--z-dropdown`, `--z-sticky`, `--z-fixed`, `--z-modal` |

Dark mode is automatic when you use tokens, because `[data-theme="dark"]` in `tokens.css` overrides them. Don't write `[data-theme="dark"] .my-thing { color: … }` unless a component really needs a different treatment, and even then use tokens.

## Shared components (use before writing new markup)

`src/components/ui/`:
- `Button` renders `.btn` with variants `outline` (default), `ghost`, `primary`, `size="small"`, and `active`. Existing markup also uses `className="btn outline small"` directly, which is fine.
- `Pill` renders `.pill` for tags and toggles, with variants `default | active | reset | disabled | icon | project-link` and `size="small"`.
- `Icon` is an inline SVG set: link, copy, check, chevronUp/Down, externalLink, github, arrowLeft/Right, close, sun, moon. Add new icons here rather than inlining SVGs.
- `ProgressiveImage` should handle every content image. It uses the optimized `srcset`, WebP, blur placeholder, and lazy loading from `image-manifest.json`. Don't use a raw `<img>` for content images.

`src/components/features/` holds the larger building blocks: `PostCard`, `ProjectCard`, `FeaturedProjectCard`, `Carousel`, `Lightbox`, `CodeBlock`, `PostImage`, `TableOfContents`, `TagCloud`, `Pagination`, `FootnotePopupManager`, `MiniPostContent`, `AboutPanel`/`AboutContent`.

`src/components/layout/`: `Header` (top bar, menu, mobile FAB) and `PageTransition`.

Layout classes: `.frame` wraps page content, `.panel` is the card container with retro border and shadow, and `.eyebrow` is the small uppercase label above titles. Pages are a `.frame` holding one or more `.panel` sections.

## Responsive and touch

- Most rules target `max-width: 640px` (phone) and `480px` (small phone). `useIsMobile()` switches at 840px. Header and About have their own breakpoint at 1099px.
- Use `@media (hover: none)` for touch-specific behavior. Pair `:hover` effects with the `useTapFeedback` / `useTouchHover` hooks so touch devices get feedback.
- Respect `@media (prefers-reduced-motion: reduce)` for any new animation.
- Respect safe areas with `--safe-area-inset-*` for anything fixed to the bottom of the screen.
- Never let content cause horizontal scroll at 390px wide. `npm run check:browser` fails on it.

## Visual change workflow

1. Before changing anything, run `npm run build && npm run check:browser -- --out shots/before`.
2. Make the change.
3. Run `npm run build && npm run check:browser -- --out shots/after --compare shots/before`.
4. Look at every screenshot the diff lists, at both the `--fold` image (what a visitor sees first) and the full-page image. Expected changes should show up only where you meant them to. Full-page diffs on the About carousel alone are a known Chromium capture artifact, so check its fold image instead.
5. Show Mohsin the before and after screenshots and get his OK before merging.
