---
title: "Vite base-path helper for Pages"
date: "2025-07-08"
tags: ["devops", "vite", "github"]
summary: "A tiny helper that reads VITE_BASE_PATH or GITHUB_REPOSITORY to keep GitHub Pages deploys working after repo renames."
---

I keep shipping small Vite sites to GitHub Pages and kept forgetting to update the `base` path. The helper now:

1. Reads `VITE_BASE_PATH` first for custom domains.
2. Falls back to `GITHUB_REPOSITORY` and grabs the repo slug.
3. Normalizes to `/slug/` with leading and trailing slashes so assets resolve cleanly.

That change removed a whole class of blank-page deploys when repos move.
