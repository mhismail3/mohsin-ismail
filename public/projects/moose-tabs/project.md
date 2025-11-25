---
title: Moose Tabs
slug: moose-tabs
date: 2025-06-23
summary: A Chrome extension that transforms the chaotic flat tab bar into an intelligent hierarchical tree view. Features a custom recursive hierarchy engine, bidirectional drag-and-drop with depth-aware drop zones, and real-time multi-window sync via Manifest V3 service workers.
github: https://github.com/mhismail3/moose-tabs
live: https://chromewebstore.google.com/detail/moose-tabs-organize-your/ecgdnamlhfodmjokjobadclppaddeond
tags:
  - React 18
  - JavaScript
  - Chrome Extension V3
  - react-dnd
  - Webpack
status: Completed
cover: cover.jpg
gallery:
  - gallery-1.jpeg
  - gallery-2.png
  - gallery-3.png
  - gallery-4.gif
  - gallery-5.png
---

I developed Moose Tabs over a weekend to solve my own frustration with managing 50+ browser tabs. Chrome's flat tab bar becomes unusable at scale, and existing solutions felt outdated or clunky. The challenge: build a modern, performant tree view with sophisticated drag-and-drop that runs entirely locally using Chrome's Manifest V3 architecture.

## Core Architecture & Challenges

### Global Animation Coordination via Singleton Pattern

One of the trickier problems was animating tabs smoothly during reorders—both the moved tabs *and* the displaced ones need to animate simultaneously, even though they're in completely different parts of the component tree.

*   **Solution**: I implemented a module-level singleton with a pub/sub notification system. The `useTabAnimations` hook provides a `subscribe()` function that registers listeners to a global `Set`. When a drag completes, `startAnimation()` updates the global state and notifies all subscribers, triggering synchronized CSS animations across the entire tree without prop drilling.

### Depth-Aware Drop Zone Priority System

In a nested tree, dragging over a parent tab also triggers the drop zone on all its ancestors—a classic z-order problem with `react-dnd`.

*   **Solution**: I built a `DropZoneContext` with a priority system: **deeper levels always win**. When multiple tabs detect a hover, the context compares nesting depths and only the deepest target becomes the "active" drop zone. This ensures you can precisely target a nested child without the parent stealing the drop.

### Bidirectional Index Recalculation

Moving tabs in Chrome is deceptively complex. When you move a tab *down* the list, removing it from its original position shifts all indices above it by -1. Moving *up* has no shift. Get this wrong and tabs land one position off.

*   **The Math**: For downward moves, I calculate `adjustedIndex = targetIndex - countOfDraggedTabsBeforeTarget`. For upward moves, no adjustment. The code also handles moving entire family trees (parent + all descendants) in a single batch while preserving their relative order.

### Position-Based Drop Intent Detection

Rather than cluttering the UI with separate "sibling" and "child" drop targets, I detect intent from the cursor position: **left 60% = sibling, right 40% = child**.

*   **Visual Feedback**: Drop zones dynamically color-code based on target depth using a level-based hierarchy (green → yellow → red → blue → steel blue for deep nesting). The CSS generates pseudo-elements with pulsing animations that match the accent color of the *target* level.

### Runtime Custom Drag Preview

The default browser drag image is ugly and doesn't represent nested structures. I generate a custom preview at drag start by:

1.  Cloning the tab's `.tab-content` element
2.  Resolving CSS custom properties via `getComputedStyle()` to inline actual colors
3.  Adding stacked card pseudo-elements if the tab has children (visual cue that you're moving a branch)
4.  Applying a subtle rotation and elevated shadow for that "lifted" feel

### Service Worker Resilience

Manifest V3 service workers can suspend at any time, wiping in-memory state. On any message from the sidebar, the background script calls `ensureHierarchyInitialized()` which compares the in-memory tab count against Chrome's actual tabs. If they diverge, it rebuilds the entire tree from scratch—invisible to the user.

### Pinned Tab Constraints

Chrome's pinned tabs have strict ordering rules: pinned must stay before unpinned, and you can't interleave them. I implemented synchronous validation in the drop handler: pinned tabs can only drop after other pinned tabs, and unpinned tabs can only drop after the *last* pinned tab or any unpinned tab. Invalid drops trigger a shake animation.

### Fuzzy Search with Character-Order Matching

The search isn't a simple substring match—it's fuzzy. Typing "ggl" matches "Google" because all characters appear in order, even if not consecutively. This lets users find tabs with minimal typing, configurable for case sensitivity and URL inclusion.
