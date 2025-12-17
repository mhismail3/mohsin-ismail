---
title: Moose's Toolbox
slug: mooses-toolbox
date: 2025-12-16
summary: A collection of browser-based utility tools with a retro-inspired aesthetic. All running 100% client-side with no uploads, no accounts, and no tracking.
github: https://github.com/mhismail3/mooses-toolbox
live: https://tools.mhismail.com/
tags:
  - JavaScript
  - HTML5
  - CSS3
  - GitHub Pages
  - Browser APIs
status: "🚀 Shipped"
cover: cover.png
gallery:
  - gallery-1.png
  - gallery-2.png
  - gallery-3.png
---

I kept running into the same annoyance: needing a quick utility—strip EXIF data, convert a screen recording to GIF, check where a link redirects—and every online tool was either plastered with ads, required an account, or silently uploaded my files to some server. So I built my own.

Moose's Toolbox is a growing collection of browser-based utilities that run entirely client-side. Drop a file in, get your result out, and nothing ever leaves your machine.

### The Architecture

Each tool is intentionally lightweight and portable—just an `index.html` for the UI and an `app.js` for the logic. A shared `shared.css` stylesheet keeps the visual language consistent across all tools, using the same design system as this portfolio site.

Every tool includes a dark/light mode toggle that persists to `localStorage` and respects system preferences via `prefers-color-scheme`. An `Info` button on each page provides usage instructions without cluttering the main interface.

### Current Tools

**EXIF Viewer** extracts metadata from JPEG and TIFF images—camera settings, GPS coordinates, timestamps—and displays it in collapsible sections. GPS coordinates link directly to Google Maps. A "Copy All" button formats everything as plain text.

**MOV to GIF** converts screen recordings (common on macOS) into animated GIFs. Users can adjust output quality, frame rate, and dimensions before conversion. The encoding happens entirely in-memory using browser APIs.

**Link Explorer** traces redirect chains and inspects link metadata. Paste a URL and it progressively fetches headers, follows redirects, and displays the final destination. Useful for debugging OAuth flows or validating shortened links.

### Deployment

The whole thing deploys to GitHub Pages with a custom domain at [tools.mhismail.com](https://tools.mhismail.com/). No build step, no bundler, no dependencies—just vanilla HTML, CSS, and JavaScript.