---
name: site-styling
description: Change the look of Mohsin's site using its existing design tokens and shared components (retro borders, offset shadows, dark mode). Use for any CSS, layout, component markup, theme, or responsive change in this repo.
---

# Styling the site

Read `guides/styling.md` before touching CSS or markup. Use `styling-guide.md` as the deeper design reference.

## Rules

- Use tokens from `src/styles/tokens.css`. Never use raw colors outside it. If no token fits, add one in `tokens.css` with both a `:root` (light) and a `[data-theme="dark"]` value.
- Reuse `Button`, `Pill`, `Icon`, and `ProgressiveImage`, plus the feature components and the `.frame` / `.panel` / `.eyebrow` layout classes, before writing new markup. New shared styles get their own file in `src/styles/components/`, imported from `src/styles/index.css`.
- Mobile first: check 390px wide with no horizontal scroll, `hover: none` touch states, `prefers-reduced-motion`, and safe-area insets.
- Keep diffs small. Restyling unrelated parts of a page is out of scope unless Mohsin asks for it.

## Verify

1. `npm run validate` runs the style guardrails: imports, the raw-color ratchet, and no colors in JSX.
2. Run `npm run build && npm run check:browser -- --out shots/after --compare shots/before`. Take the baseline first.
3. Look at the changed screenshots yourself, in light and dark, on desktop and mobile.
4. Show Mohsin the before and after (see the `site-update` skill) and get his `ask_user` approval before final validation or merge.
5. If you removed raw colors from a file, lower its number in `BASELINE` in `scripts/check-styles.mjs`.
