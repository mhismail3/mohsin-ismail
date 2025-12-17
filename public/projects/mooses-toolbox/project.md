---
title: Moose's Toolbox
slug: mooses-toolbox
date: 2025-12-16
summary: A collection of browser-based utility tools with a retro-inspired aesthetic. EXIF viewer, MOV-to-GIF converter, and link explorer—all running 100% client-side with no uploads, no accounts, and no tracking.
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

Rather than spinning up separate repos for each tool, I built a lightweight template system. Each tool lives in its own `/tools/{name}/` folder with an `index.html` and `script.js`. The shared foundation provides:

* **Theme Engine**: A global dark/light toggle that persists to `localStorage` and respects system preferences via `prefers-color-scheme`. The theme state syncs instantly across tabs using the Storage event.
* **File Drop Zones**: A reusable component that handles drag-and-drop, file picker fallback, and visual feedback states (idle, hover, processing, error). Built on native File and DataTransfer APIs.
* **Toast Notifications**: Non-blocking status messages that stack and auto-dismiss. Used for clipboard confirmations, error states, and processing completion.

### EXIF Viewer

The first tool extracts metadata from JPEG and TIFF images. The data gets parsed into four collapsible sections: Camera & Settings, Date & Time, Location, and Image Details. GPS coordinates are clickable—they open directly in Google Maps. A "Copy All" button formats everything as plain text for pasting into notes or reports.

The viewer uses a streaming approach to read only the EXIF segment rather than loading the entire image into memory, which keeps it fast even on large RAW-converted JPEGs.

### MOV to GIF

Screen recordings on macOS default to MOV format, but GIFs are still the universal currency for demos and documentation. This tool decodes video frames using the browser's native `VideoDecoder` API, applies optional dithering and palette optimization, then encodes to GIF entirely in-memory.

Users can adjust output quality, frame rate, and dimensions before conversion. The preview updates in real-time as settings change, so you can dial in the file size before committing to the full encode.

### Link Explorer

A simple but useful debugging tool for checking redirect chains and inspecting link metadata. Paste a URL and it progressively fetches headers, follows redirects, and displays the final destination along with any intermediate hops. Useful for catching tracking redirects, validating short links, and debugging OAuth callback flows.

### The Design

I went with a retro-inspired aesthetic—muted earthy tones, subtle shadows, and card-based layouts with a slight paper texture. The hover states add a gentle lift effect that makes the interface feel tactile without being distracting. Everything scales cleanly from mobile to desktop using CSS Grid with responsive breakpoints.

The whole thing deploys to GitHub Pages with a custom domain. No build step, no bundler, no dependencies—just vanilla HTML, CSS, and JavaScript that works.
