# Complete Design System & Styling Guide

A comprehensive guide to a retro-inspired, minimal design system with warm aesthetics, tactile elements, and complete dark mode support.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Border & Radius](#border--radius)
6. [Shadows & Depth](#shadows--depth)
7. [Layout Structure](#layout-structure)
8. [Components](#components)
9. [Animations & Transitions](#animations--transitions)
10. [Advanced CSS Features](#advanced-css-features)
11. [Responsive Design](#responsive-design)
12. [Accessibility](#accessibility)
13. [Performance Optimizations](#performance-optimizations)

---

## Design Philosophy

The design system is built around a **retro-inspired, minimal aesthetic** with the following principles:

- **Warm, organic color palette** - Cream backgrounds with ink-dark text
- **Tactile, physical elements** - Solid borders and offset shadows that evoke paper and printing
- **Serif typography** - Classic, readable fonts for body and display text
- **Glassmorphic surfaces** - Subtle blur effects and translucent backgrounds
- **Thoughtful dark mode** - Complete theme support with smooth transitions
- **Progressive enhancement** - Works without JavaScript, enhanced with it
- **iOS Safari optimizations** - Careful attention to mobile performance
- **3D button press effects** - Physical feedback on interactive elements

---

## Color System

### Base Palette

```css
/* Light theme base colors */
--cream: #f8f3e8;      /* Warm background base */
--ink: #1f1a14;        /* Primary text color */
--line: #e2d7c8;       /* Subtle border color */
--muted: #5b5249;      /* Secondary text */

/* Accent Colors */
--aero: #2c8f7a;       /* Primary accent - teal/green */
--pine: #0f7363;       /* Darker accent - hover states */
--clay: #c45b37;       /* Tertiary accent - orange/terracotta */
```

### Semantic Color Mapping (Light Theme)

```css
/* Core colors */
--color-bg: var(--cream);
--color-text: var(--ink);
--color-text-muted: var(--muted);
--color-border: var(--line);
--color-border-subtle: rgba(31, 26, 20, 0.08);

/* Surface colors */
--color-surface: #fffefb;
--color-surface-elevated: #fdfbf7;
--color-surface-glass: rgba(255, 255, 255, 0.82);
--color-surface-glass-solid: rgba(255, 255, 255, 0.96);

/* Interactive state colors */
--color-surface-active: #e0f2f1;      /* Active/selected state */
--color-surface-hover: #fdfbf7;       /* Hover state */
--color-surface-warning: #fbe9e7;     /* Warning/destructive actions */
--color-surface-success: #e8f5e9;     /* Success states */
--color-surface-muted: #f2f7f4;       /* Muted backgrounds */

/* Misc UI colors */
--color-selection: #dfeeea;           /* Text selection */
--color-overlay: rgba(248, 243, 232, 0.92); /* Modal backdrop */
--color-badge: #eaeaea;               /* Badge backgrounds */
--color-panel-border-inner: rgba(31, 26, 20, 0.04); /* Decorative borders */

/* Panel backgrounds */
--panel-bg: #fffefb;
--bg-card: var(--color-surface);
--bg-white: #ffffff;

/* Fade colors for text truncation gradients */
--color-fade-start: rgba(255, 254, 251, 0);
--color-fade-end: #fffefb;
```

### Dark Theme Overrides

Apply with `[data-theme="dark"]` attribute on the root element:

```css
[data-theme="dark"] {
  color-scheme: dark;

  /* Core colors */
  --color-bg: #1a1816;
  --color-text: #f0ebe3;
  --color-text-muted: #a39e96;
  --color-border: #3a3530;
  --color-border-subtle: rgba(255, 255, 255, 0.06);

  /* Surface colors */
  --color-surface: #24221e;
  --color-surface-elevated: #2c2a25;
  --color-surface-glass: rgba(36, 34, 30, 0.92);
  --color-surface-glass-solid: rgba(44, 42, 37, 0.96);

  /* Interactive state colors */
  --color-surface-active: #1a3330;
  --color-surface-hover: #2c2a25;
  --color-surface-warning: #3a2a26;
  --color-surface-success: #1a3324;
  --color-surface-muted: #282826;

  /* Misc UI colors */
  --color-selection: #1a3330;
  --color-overlay: rgba(26, 24, 22, 0.94);
  --color-badge: #3a3530;
  --color-panel-border-inner: rgba(255, 255, 255, 0.04);

  /* Panel backgrounds */
  --panel-bg: #24221e;
  --bg-card: var(--color-surface);
  --bg-white: #24221e;

  /* Fade colors */
  --color-fade-start: rgba(36, 34, 30, 0);
  --color-fade-end: #24221e;

  /* Override base palette for direct usage */
  --cream: #1a1816;
  --ink: #f0ebe3;
  --line: #3a3530;
  --muted: #a39e96;

  /* Retro borders & shadows - softer in dark mode */
  --retro-shadow-color: #0e0e0c;
  --retro-border-color: #3a3530;
}
```

### Shadow Colors

```css
/* Light theme */
--shadow-color: rgba(31, 26, 20, 0.15);
--shadow-color-medium: rgba(31, 26, 20, 0.6);
--shadow-color-strong: rgba(31, 26, 20, 0.7);

/* Dark theme (in [data-theme="dark"]) */
--shadow-color: rgba(0, 0, 0, 0.3);
--shadow-color-medium: rgba(0, 0, 0, 0.5);
--shadow-color-strong: rgba(0, 0, 0, 0.6);
```

### Usage Guidelines

- Use **aero** (`#2c8f7a`) for links, primary actions, and accents
- Use **pine** (`#0f7363`) for hover states and emphasis
- Use **clay** (`#c45b37`) for warnings, destructive actions, or alternative emphasis
- Use **muted** for secondary information and labels
- Maintain WCAG AA contrast ratios (4.5:1 for normal text)

---

## Typography

### Font Families

Import from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

```css
--font-display: 'DM Serif Display', serif;     /* Headings, titles */
--font-body: 'Newsreader', serif;              /* Body text, paragraphs */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Type Scale

```css
--text-xs: 0.68rem;    /* ~10.88px at base 16px */
--text-sm: 0.78rem;    /* ~12.48px */
--text-base: 0.95rem;  /* ~15.2px */
--text-md: 1rem;       /* 16px - body base size */
--text-lg: 1.1rem;     /* ~17.6px */
--text-xl: 1.3rem;     /* ~20.8px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: clamp(2rem, 5vw, 2.8rem);    /* Responsive 32px-44.8px */
--text-4xl: clamp(2.4rem, 6vw, 3.4rem);  /* Responsive 38.4px-54.4px */
```

### Line Heights

```css
--leading-tight: 1.1;      /* Headings, compact text */
--leading-snug: 1.3;       /* Subheadings, tight paragraphs */
--leading-normal: 1.45;    /* General text */
--leading-relaxed: 1.6;    /* Body copy (default) */
--leading-loose: 1.65;     /* Extra relaxed */
```

### Letter Spacing

```css
--tracking-tight: 0.01em;   /* Headings (slight tightening) */
--tracking-normal: 0;       /* Default */
--tracking-wide: 0.08em;    /* Labels, eyebrows */
--tracking-wider: 0.16em;   /* All-caps labels */
```

### Typography Usage

```css
/* All headings */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  color: var(--color-text);
  margin: 0 0 0.35em;
  letter-spacing: var(--tracking-tight);
}

/* Body text */
body {
  font-family: var(--font-body);
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
}

/* Eyebrow labels (small caps) */
.eyebrow {
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* Muted text */
.muted {
  color: var(--color-text-muted);
}

/* Monospace elements */
code, .mono {
  font-family: var(--font-mono);
  font-size: 0.9em;
}
```

### Font Rendering

```css
:root {
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
```

---

## Spacing System

Consistent spacing scale based on 4px increments with semantic naming:

```css
--space-2xs: 4px;
--space-xs: 6px;
--space-sm: 8px;
--space-md: 10px;
--space-base: 12px;   /* Base unit */
--space-lg: 14px;
--space-xl: 16px;
--space-2xl: 18px;
--space-3xl: 22px;
--space-4xl: 28px;
```

### Usage Guidelines

- Use `--space-base` (12px) as the default gap for most elements
- Use `--space-sm` to `--space-md` for tight spacing (form elements, buttons)
- Use `--space-xl` to `--space-3xl` for section spacing
- Use `--space-2xs` to `--space-xs` for micro-spacing (badges, pills)

---

## Border & Radius

### Retro Border Style

The signature **retro border** is a thick, solid line:

```css
--border-retro: 1.5px solid var(--ink);

/* In dark mode */
--retro-border-color: #3a3530;
--border-retro: 1.5px solid var(--retro-border-color);
```

### Border Radius

```css
--radius-sm: 6px;      /* Small elements - inputs, badges, pills */
--radius-md: 14px;     /* Medium containers */
--radius-lg: 22px;     /* Panels, cards, header */
--radius-full: 999px;  /* Circular buttons, pills */
```

### Usage

- **Panels, cards, header**: `border-radius: var(--radius-lg)` (22px)
- **Buttons, inputs, pills**: `border-radius: var(--radius-sm)` (6px)
- **Icon buttons**: `border-radius: var(--radius-full)` (999px)

---

## Shadows & Depth

### Retro Offset Shadows

The key visual signature - hard-edged, offset shadows:

```css
--retro-shadow-color: var(--ink);     /* Light: #1f1a14, Dark: #0e0e0c */
--shadow-retro: 4px 4px 0px var(--retro-shadow-color);
--shadow-retro-sm: 2px 2px 0px var(--retro-shadow-color);
--shadow-retro-lg: 5px 5px 0px var(--retro-shadow-color);
```

**3D Button Press Effect:**

The shadow represents a fixed depth. When pressed, the element moves toward the shadow (down-right):

```css
.btn {
  box-shadow: var(--shadow-retro-sm);  /* 2px 2px */
  transition: transform var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease;
}

/* Hover: moves 1px down-right, shadow shrinks by 1px */
@media (hover: hover) {
  .btn:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px var(--retro-shadow-color);
  }
}

/* Active: moves 2px down-right, shadow disappears */
.btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px var(--retro-shadow-color);
}

/* Formula: transform + box-shadow = constant (initial offset)
   - Normal:  (0,0) + (2,2) = (2,2)
   - Hover:   (1,1) + (1,1) = (2,2)
   - Active:  (2,2) + (0,0) = (2,2) */
```

### Container Shadows (Multi-Layer)

For panels and elevated surfaces:

```css
/* Standard elevation */
--shadow-container:
  0 1px 2px rgba(31, 26, 20, 0.08),
  0 3px 6px rgba(31, 26, 20, 0.06),
  0 8px 16px rgba(31, 26, 20, 0.06),
  0 16px 32px rgba(31, 26, 20, 0.04);

/* Large elevation (modals, large panels) */
--shadow-container-lg:
  0 1px 2px rgba(31, 26, 20, 0.10),
  0 4px 8px rgba(31, 26, 20, 0.07),
  0 12px 24px rgba(31, 26, 20, 0.08),
  0 24px 48px rgba(31, 26, 20, 0.05);

/* Scrolled/elevated state (header on scroll) */
--shadow-container-scrolled:
  0 1px 2px rgba(31, 26, 20, 0.12),
  0 4px 8px rgba(31, 26, 20, 0.08),
  0 12px 24px rgba(31, 26, 20, 0.10),
  0 24px 40px rgba(31, 26, 20, 0.06);

/* Expanded state (e.g., menu open) */
--shadow-container-expanded:
  0 2px 4px rgba(31, 26, 20, 0.14),
  0 6px 12px rgba(31, 26, 20, 0.10),
  0 16px 32px rgba(31, 26, 20, 0.12),
  0 32px 56px rgba(31, 26, 20, 0.08);
```

In dark mode, use higher opacity blacks:

```css
--shadow-container:
  0 1px 2px rgba(0, 0, 0, 0.18),
  0 3px 6px rgba(0, 0, 0, 0.14),
  0 8px 16px rgba(0, 0, 0, 0.14),
  0 16px 32px rgba(0, 0, 0, 0.10);
```

### Soft Shadows

```css
--shadow-soft: 0 12px 30px rgba(31, 26, 20, 0.08);
--shadow-soft-lg: 0 20px 50px rgba(31, 26, 20, 0.08);
```

---

## Layout Structure

### App Container

```css
.app {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;  /* Safari viewport height */
  min-height: 100dvh;  /* Dynamic viewport height for mobile */
  padding: 18px 10px 64px;
}

@media (min-width: 840px) {
  .app {
    padding: 28px 28px 72px;
  }
}
```

### Content Frame

```css
.frame {
  max-width: var(--max-width-content);  /* 860px */
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
  z-index: var(--z-base);
}

@media (min-width: 840px) {
  .frame {
    gap: var(--space-3xl);
  }
}
```

### Layout Constants

```css
--max-width-content: 860px;
--header-height-mobile: 95px;
--header-height-desktop: 105px;
```

---

## Components

### Header (Top Bar)

Fixed glassmorphic header with blur effect:

```css
.top-bar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  position: fixed;
  top: 18px;
  left: 10px;
  right: 10px;
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: 12px;
  background: var(--color-surface-glass);
  border: 0.5px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-container);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: var(--z-fixed);
}

/* Elevated shadow on scroll */
.top-bar.scrolled {
  box-shadow: var(--shadow-container-scrolled);
}

@media (min-width: 840px) {
  .top-bar {
    top: 28px;
    left: 28px;
    right: 28px;
    padding: 14px 20px;
  }
}
```

**Header Spacer:**

```css
/* Push content below fixed header */
.top-bar + * {
  margin-top: var(--header-height-mobile);
}

@media (min-width: 840px) {
  .top-bar + * {
    margin-top: var(--header-height-desktop);
  }
}
```

**Theme Toggle Button:**

```css
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: var(--border-retro);
  border-radius: var(--radius-full);
  background: var(--bg-white);
  color: var(--ink);
  cursor: pointer;
  box-shadow: var(--shadow-retro-sm);
  transition: transform var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease,
              color var(--duration-fast) ease;
}

@media (hover: hover) {
  .theme-toggle:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px var(--retro-shadow-color);
    color: var(--pine);
  }
}

.theme-toggle:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px var(--retro-shadow-color);
}

.theme-toggle:focus-visible {
  outline: 2px dashed var(--clay);
  outline-offset: 4px;
}
```

### Panel (Card Container)

Main content panels with decorative inner border:

```css
.panel {
  position: relative;
  background: var(--panel-bg);
  border: 0.5px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.4rem 1.35rem;
  box-shadow: var(--shadow-container-lg);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* Decorative dashed inner border */
.panel::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: calc(var(--radius-lg) - 8px);
  pointer-events: none;
  border: 1px dashed var(--color-panel-border-inner);
}

@media (min-width: 840px) {
  .panel {
    padding: 1.8rem 1.6rem;
  }
}

@media (max-width: 640px) {
  .panel {
    padding: 1.1rem 0.85rem;
  }

  .panel::before {
    inset: 5px;
  }
}
```

**Panel Header:**

```css
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-base);
  flex-wrap: wrap;
}
```

### Buttons

Standard button with retro shadow:

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: var(--border-retro);
  border-radius: var(--radius-sm);
  padding: 0.65rem 1rem 0.55rem 1rem;
  font-weight: 600;
  font-size: var(--text-md);
  line-height: 1.0;
  background: var(--bg-white);
  color: var(--ink);
  -webkit-text-fill-color: var(--ink);
  box-shadow: var(--shadow-retro-sm);
  cursor: pointer;
  transition: transform var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease,
              color var(--duration-slow) var(--ease-out);
}

/* Small button */
.btn.small {
  padding: 0.45rem 0.8rem 0.35rem 0.8rem;
  font-size: var(--text-base);
}

/* Primary button */
.btn.primary {
  background: var(--aero);
  color: var(--bg-white);
  -webkit-text-fill-color: var(--bg-white);
}

/* Ghost button */
.btn.ghost {
  background: var(--color-ghost-bg);
  border: 2px solid transparent;
}

/* Interactive states */
@media (hover: hover) {
  .btn:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px var(--retro-shadow-color);
    color: var(--pine);
    -webkit-text-fill-color: var(--pine);
  }

  .btn.primary:hover {
    color: var(--bg-white);
    -webkit-text-fill-color: var(--bg-white);
  }
}

.btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px var(--retro-shadow-color);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn:focus-visible {
  outline: 2px dashed var(--clay);
  outline-offset: 4px;
}
```

### Pills (Tags)

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 0.38rem 0.68rem 0.20rem 0.68rem;
  border: var(--border-retro);
  border-radius: var(--radius-sm);
  background: var(--bg-white);
  box-shadow: 2px 2px 0px var(--shadow-color);
  font-weight: 600;
  font-size: 0.82rem;
  line-height: 1.0;
  color: var(--ink);
  -webkit-text-fill-color: var(--ink);
  cursor: pointer;
  transition: transform var(--duration-fast) ease,
              box-shadow var(--duration-fast) ease,
              color var(--duration-slow) var(--ease-out);
}

/* Active/selected state */
.pill.active {
  background: var(--color-surface-active);
  border-color: var(--pine);
  color: var(--pine);
  -webkit-text-fill-color: var(--pine);
}

/* Small pill */
.pill.small {
  padding: 0.3rem 0.4rem 0.15rem;
  font-size: 0.70rem;
}

/* Interactive states */
@media (hover: hover) {
  .pill:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px var(--shadow-color);
    background: var(--color-surface-hover);
    color: var(--pine);
    -webkit-text-fill-color: var(--pine);
  }
}

.pill:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.pill:focus-visible {
  outline: 2px dashed var(--clay);
  outline-offset: 4px;
}
```

**Tag Count (inside pills):**

```css
.tag-count {
  color: var(--color-text-muted);
  font-weight: 500;
  margin-left: 0.25em;
  transition: color var(--duration-slow) var(--ease-out);
}

.pill.active .tag-count {
  color: var(--pine);
  opacity: 0.7;
}
```

### Forms

**Input Fields:**

```css
.input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: var(--border-retro);
  border-radius: var(--radius-sm);
  background: var(--bg-white);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-md);
  box-shadow: inset 1px 1px 2px rgba(31, 26, 20, 0.08);
  transition: border-color var(--duration-normal) ease,
              box-shadow var(--duration-normal) ease;
}

.input:focus {
  outline: none;
  border-color: var(--pine);
  box-shadow: inset 1px 1px 2px rgba(31, 26, 20, 0.08),
              0 0 0 2px rgba(15, 115, 99, 0.15);
}

.input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}
```

**Labels:**

```css
.label {
  display: block;
  font-weight: 600;
  margin-bottom: var(--space-xs);
  color: var(--color-text);
}
```

### Empty State

```css
.empty-state {
  padding: 1rem;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-sm);
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-surface-glass);
}
```

---

## Animations & Transitions

### Timing Functions

```css
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-snap: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring-out: cubic-bezier(0.34, 1.4, 0.64, 1);
--ease-spring-settle: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Duration

```css
--duration-fast: 0.1s;      /* Quick interactions - shadows, transforms */
--duration-normal: 0.2s;    /* Standard transitions - colors, borders */
--duration-slow: 0.3s;      /* Deliberate animations - theme icons */
--duration-slower: 0.4s;    /* Very deliberate */
```

### Theme Transitions

Global transitions for theme switching:

```css
/* Disable all transitions on page load */
html:not(.theme-ready) *,
html:not(.theme-ready) *::before,
html:not(.theme-ready) *::after {
  transition: none !important;
}

/* Global theme transitions (applied after page load)
   IMPORTANT: Exclude 'color' from global rule for iOS Safari performance.
   Text color changes instantly (not jarring), while backgrounds animate smoothly. */
*,
*::before,
*::after {
  transition-property: background-color, border-color, box-shadow,
                       filter, outline-color;
  transition-duration: var(--theme-transition-duration);  /* 0.2s */
  transition-timing-function: var(--theme-transition-ease);  /* ease */
}

/* Interactive elements get additional color transitions */
a,
button,
.pill,
.btn,
[role="button"] {
  transition-property: background-color, border-color, box-shadow,
                       filter, outline-color, color, fill, stroke,
                       text-decoration-color, transform, -webkit-text-fill-color;
  transition-duration: var(--theme-transition-duration);
  transition-timing-function: var(--theme-transition-ease);
}
```

### Theme Icon Animation

```css
.theme-toggle-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.theme-icon {
  position: absolute;
  opacity: 0;
  transform: scale(0.5) rotate(-90deg);
  transition: opacity var(--duration-normal) ease-out,
              transform var(--duration-slow) var(--ease-snap);
}

.theme-icon.visible {
  opacity: 1;
  transform: scale(1) rotate(0deg);
  transition: opacity var(--duration-normal) ease-out,
              transform var(--duration-slow) var(--ease-bounce);
}

.theme-icon.sun {
  transform: scale(0.5) rotate(90deg);
}

.theme-icon.sun.visible {
  transform: scale(1) rotate(0deg);
}
```

### Loading Spinner

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--pine);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

---

## Advanced CSS Features

### Animatable Gradient Colors (@property)

CSS gradients normally can't be transitioned because gradient color values change instantly. By registering custom properties with `@property`, the browser treats them as animatable colors:

```css
/* Gradient fade end color - used for text truncation fades */
@property --gradient-fade-end {
  syntax: '<color>';
  inherits: true;
  initial-value: #fffefb;
}

/* Gradient fade start (transparent version) */
@property --gradient-fade-start {
  syntax: '<color>';
  inherits: true;
  initial-value: rgba(255, 254, 251, 0);
}

/* Usage in gradients - now animates smoothly during theme changes */
.text-fade {
  background: linear-gradient(
    to bottom,
    var(--gradient-fade-start),
    var(--gradient-fade-end)
  );
}

/* Update in dark theme */
[data-theme="dark"] {
  --gradient-fade-end: #24221e;
  --gradient-fade-start: rgba(36, 34, 30, 0);
}
```

**Browser support:** Chrome 85+, Edge 85+, Safari 15.4+, Firefox 128+
**Fallback:** Colors change instantly (still functional, just not animated)

### iOS Safe Area Insets

```css
:root {
  /* Expose safe area insets as CSS custom properties
     Critical for drag bounds on iOS devices with notch/Dynamic Island */
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
}

/* Usage in components */
.fixed-element {
  top: calc(18px + var(--safe-area-inset-top));
  left: calc(10px + var(--safe-area-inset-left));
  right: calc(10px + var(--safe-area-inset-right));
}
```

---

## Responsive Design

### Breakpoints

```css
/* Small phones */
@media (max-width: 480px) { }

/* Tablets and small laptops */
@media (max-width: 540px) { }
@media (max-width: 640px) { }

/* Desktop */
@media (min-width: 840px) { }
```

### Mobile-First Patterns

**Grid Layouts:**

```css
.grid {
  display: grid;
  grid-template-columns: 1fr;  /* Mobile: single column */
  gap: var(--space-base);
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);  /* Desktop: 2 columns */
  }
}
```

**Flexible Forms:**

```css
.form-row {
  display: flex;
  gap: var(--space-sm);
}

@media (max-width: 540px) {
  .form-row {
    flex-direction: column;  /* Stack on mobile */
  }

  .form-row .btn {
    width: 100%;  /* Full-width buttons */
  }
}
```

### Touch Targets

Ensure all interactive elements meet the 48x48px minimum:

```css
/* Disable tap highlight on mobile */
a,
button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

### Viewport Units

Use dynamic viewport height for mobile Safari:

```css
body {
  min-height: 100vh;   /* Standard */
  min-height: 100svh;  /* Small viewport (with browser chrome) */
  min-height: 100dvh;  /* Dynamic viewport (adapts to chrome visibility) */
}
```

### Hover States

Only apply hover effects on devices that support hover:

```css
/* Prevents "sticky hover" on touch devices (iOS Safari) */
@media (hover: hover) {
  .btn:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px var(--retro-shadow-color);
  }
}
```

---

## Accessibility

### Focus Styles

Custom focus indicators using dashed outlines:

```css
.btn:focus-visible,
.pill:focus-visible {
  outline: 2px dashed var(--clay);
  outline-offset: 4px;
}

.input:focus {
  outline: none;
  border-color: var(--pine);
  box-shadow: inset 1px 1px 2px rgba(31, 26, 20, 0.08),
              0 0 0 2px rgba(15, 115, 99, 0.15);
}
```

### Screen Reader Only Content

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Text Selection

```css
::selection {
  background: var(--color-selection);
  color: var(--color-text);
}
```

### Color Scheme Meta Tags

```html
<!-- Light theme -->
<meta name="theme-color" content="#f8f3e8" media="(prefers-color-scheme: light)">

<!-- Dark theme -->
<meta name="theme-color" content="#1a1816" media="(prefers-color-scheme: dark)">
```

### ARIA Labels

Always include descriptive ARIA labels for icon-only buttons:

```html
<button type="button" class="theme-toggle" aria-label="Toggle dark mode">
  <!-- Icon SVG -->
</button>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

### Semantic HTML

Use proper semantic elements:

- `<header>` for top bar
- `<main>` for primary content
- `<section>` for panel groups
- `<dialog>` for modals
- `<nav>` for navigation

---

## Performance Optimizations

### iOS Safari Text Color Performance

**Problem:** iOS Safari struggles when thousands of text elements all animate their color simultaneously during theme changes - it throttles/batches them, causing text to appear to transition much slower than backgrounds.

**Solution:** Let text color change instantly (it's not jarring), and only add explicit color transitions to interactive elements:

```css
/* Global transitions - EXCLUDE 'color' */
*,
*::before,
*::after {
  transition-property: background-color, border-color, box-shadow,
                       filter, outline-color;
  /* NOT including 'color' */
}

/* Only add color transitions to interactive elements */
a,
button,
.pill,
.btn {
  transition-property: background-color, border-color, box-shadow,
                       filter, outline-color, color, transform;
  /* Now includes 'color' */
}
```

### Tap Feedback (Touch Devices)

```css
.tap-feedback {
  transition: transform 0.08s ease-out,
              color 0.08s ease-out,
              background-color 0.08s ease-out,
              box-shadow 0.08s ease-out;
}
```

Pair with JavaScript to add `.tap-active` class on `touchstart` for reliable iOS feedback.

### Will-Change for Animations

```css
.animating-element {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.animating-element.finished {
  will-change: auto;
}
```

---

## Z-Index Scale

Consistent layering system:

```css
--z-base: 1;          /* Default content */
--z-dropdown: 10;     /* Dropdowns, tooltips */
--z-sticky: 20;       /* Sticky elements */
--z-fixed: 100;       /* Fixed header */
--z-modal: 1000;      /* Modals, overlays */
```

---

## Implementation Checklist

### Initial Setup

- [ ] Import Google Fonts: DM Serif Display, Newsreader, JetBrains Mono
- [ ] Add theme meta tags for iOS Safari
- [ ] Set up CSS custom properties (light theme)
- [ ] Add dark theme overrides with `[data-theme="dark"]`
- [ ] Implement theme toggle JavaScript
- [ ] Add `.theme-ready` class after DOM load to enable transitions
- [ ] Set up @property declarations for animatable gradients

### Base Styles

- [ ] Apply box-sizing reset
- [ ] Set up global theme transitions (excluding 'color' for performance)
- [ ] Configure font rendering optimizations
- [ ] Set background colors on `html` and `body`
- [ ] Style text selection
- [ ] Add safe area inset CSS variables

### Typography

- [ ] Apply font families to appropriate elements
- [ ] Set heading sizes and styles
- [ ] Configure line heights and letter spacing
- [ ] Add utility classes (`.eyebrow`, `.muted`)

### Layout

- [ ] Create `.app` container with proper padding
- [ ] Build `.frame` with max-width constraint
- [ ] Implement fixed `.top-bar` with glassmorphism
- [ ] Add responsive breakpoints
- [ ] Set up viewport height fallbacks (vh, svh, dvh)

### Components

- [ ] Build button component with 3D retro shadow
- [ ] Create panel component with decorative inner border
- [ ] Style pill/tag components
- [ ] Style form inputs with focus states
- [ ] Add empty state component
- [ ] Create theme toggle with icon animation

### Interactivity

- [ ] Add 3D shadow animation on buttons/pills
- [ ] Implement theme toggle icon transition
- [ ] Set up tap feedback for touch devices
- [ ] Test all hover states with `@media (hover: hover)`
- [ ] Add focus-visible styles

### Accessibility

- [ ] Add focus-visible styles to all interactive elements
- [ ] Include ARIA labels on icon buttons
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios (WCAG AA: 4.5:1)
- [ ] Add screen reader only text where needed
- [ ] Implement reduced motion support

### Testing

- [ ] Test light and dark themes
- [ ] Verify smooth theme transitions
- [ ] Test on iOS Safari (text color performance)
- [ ] Check responsive layouts on mobile
- [ ] Verify touch targets (minimum 48x48px)
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Check safe area insets on notched devices

---

## Design Principles Summary

This design system emphasizes:

- **Warmth** through cream/ink palette
- **Tactility** via retro borders and offset shadows
- **Readability** with serif typography
- **Depth** through multi-layer shadow systems
- **Performance** with iOS-optimized transitions
- **Accessibility** with comprehensive keyboard and screen reader support
- **Craft** through thoughtful details and smooth animations

The result is a design that feels both digital and physical, modern and timeless.
