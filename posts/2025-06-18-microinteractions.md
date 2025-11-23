---
title: "Microinteractions: lighten the press"
date: "2025-06-18"
tags: ["animation", "frontend", "motion"]
summary: "Tiny motion polish: press states compress shadows while keeping the element visually stationary."
---

Buttons now compress in sync with their shadows. Hover moves `2px` with a `2px` shadow; active moves `4px` and drops the shadow entirely. That subtle change keeps the illusion of a physical key without causing layout jump.

![Toggle GIF](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3l3aWVtN2FqNnd3d2lybWNtbmVyd2FiNTRvcjZmdGJvN2R5ZXlhbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRuo6sLetdllPAQ/giphy.gif)

It’s all implemented with pure CSS transitions at `0.1s` so the interface stays snappy on low-powered devices.
