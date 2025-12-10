---
title: Alces PDF Merger
slug: alces-pdf-merger
date: 2025-11-20
summary: A client-side PDF merging tool built with React 19 and Vite. Drop multiple PDFs, reorder pages via drag-and-drop, and download a freshly sequenced document—all without files leaving your browser.
github: https://github.com/mhismail3/Alces-PDF-Merger
live: https://mhismail3.github.io/Alces-PDF-Merger/
tags:
  - React 19
  - TypeScript
  - Vite
  - pdf-lib
  - pdfjs-dist
  - localforage
status: "🚀 Shipped"
cover: cover.jpg
gallery:
  - gallery-1.png
  - gallery-2.png
  - src: gallery-3.gif
    caption: "Enjoyed working on the little details"
  - gallery-4.png
  - gallery-5.png
---

I developed this PDF Merger over the weekend as a way to test out the new Gemini 3 and GPT 5.1-Codex-Max models. And because merging PDFs is something I often have to do and I hate that I have to go do it on some website with ads. It runs entirely client-side using React 19 and Vite, ensuring no user documents ever leave the browser.

I chose a hybrid approach to handle PDF operations, using two distinct libraries for their specific strengths:
* Visualization (`pdfjs-dist`): Used solely for rendering high-fidelity thumbnails to HTML5 Canvases.
* Manipulation (`pdf-lib`): Handles the binary operations - extracting pages, stitching documents, and generating the final download.

To protect against accidental tab closures, I implemented a persistence layer using `localforage` (IndexedDB). This saves the full workspace state, including page order and raw file data.

The UI relies heavily on `@dnd-kit` for page reordering. To ensure a native feel on touch devices, I configured custom `PointerSensor` constraints (requiring 5-6px of movement before activation). This prevents the common issue where scrolling on mobile accidentally triggers a drag operation.

I set up the build pipeline for fast deployment to GitHub Pages. The `vite.config.ts` dynamically determines the base path using the `GITHUB_REPOSITORY` env variable, allowing the site to deploy correctly even if the repository name changes, without manual config updates.
