---
title: "Field notes on tactile UI"
date: "2025-11-15"
tags: ["design", "frontend", "ux"]
summary: "Micro-case studies from making tactile controls feel crisp across mobile and desktop."
---

I spent the week revisiting the tactile system that powers most of my interfaces. Three quick wins:

1. **Press physics**: buttons now translate `4px → 2px → 0px` to mirror the hard shadow collapse. It keeps the element visually stationary while it “drops".
2. **Serif everywhere**: Newsreader for UI text plus DM Serif Display for headers keeps the editorial vibe consistent.
3. **Glass panels**: swapping flat cards for a light glass gradient made long-form reading feel calmer.

![Interface notebook](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80)

Each change was tested on mobile first. The press model stays responsive on touch screens without jank, and the grain overlay is tuned so text stays crisp. If you’re looking for a starting point, grab the tokens in this repo and wire the same physics into your components.
