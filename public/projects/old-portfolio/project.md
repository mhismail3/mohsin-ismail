---
title: Old Portfolio
slug: old-portfolio
date: 2025-09-15
summary: A static Astro rebuild of my retired portfolio, keeping older projects online for posterity with a clean, content-first layout.
github: https://github.com/mhismail3/personal-website-v2
live: https://mhismail3.github.io/personal-website-v2/
tags:
  - Astro
  - TypeScript
  - Static site
  - Markdown
  - GitHub Pages
status: Archived
cover: cover.jpeg
gallery:
  - gallery-1.png
  - gallery-2.png
  - gallery-3.png
---

Before I made the current site you're on, I rebuilt my old portfolio as a static Astro site so the projects from my earlier years stay discoverable.

### Static Astro shell
Built with Astro 4 and TypeScript, exported fully static for zero runtime overhead. The layout leans on one small global stylesheet and a BASE_URL-aware nav so it serves cleanly from GitHub Pages without any client-side framework.

### Content-first and lightweight
Navigation, skip links, and semantic templates come from `Base.astro`, keeping typography and spacing front and center. Aside from a small tag filter on the posts list, there is essentially no client JavaScript; everything else is server-rendered and kept under tight size budgets.

### Deployment and longevity
RSS/sitemap generation and Vitest coverage guard the build, and the site ships to GitHub Pages for low-touch hosting. With only Astro, Zod, and @astrojs/rss as dependencies, the archive stays easy to run locally or mirror elsewhere if the hosting target ever changes.
