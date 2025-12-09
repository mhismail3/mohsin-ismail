---
title: Moose Tabs
slug: moose-tabs
date: 2025-12-09
summary: A Chrome extension that transforms the chaotic flat tab bar into an intelligent hierarchical tree view. Features a custom recursive hierarchy engine, bidirectional drag-and-drop with depth-aware drop zones, and real-time multi-window sync via Manifest V3 service workers.
github: https://github.com/mhismail3/moose-tabs
live: https://chromewebstore.google.com/detail/moose-tabs-organize-your/ecgdnamlhfodmjokjobadclppaddeond
tags:
  - React 18
  - JavaScript
  - Chrome Extension V3
  - react-dnd
  - Webpack
  - AI Integration
  - LLM
status: Completed
cover: cover.jpg
gallery:
  - gallery-1.jpeg
  - gallery-2.png
  - gallery-3.png
  - gallery-4.png
  - gallery-5.png
---

## Version 2.0.0 — December 2025

After living with the 1.0 release, I realized that while a manual tree is great, maintaining it takes effort. Version 2.0 introduces an "AI Organization Toolkit" to automate that cognitive load, along with major architectural improvements to make the extension feel more native.

### Local-First AI Organization Architecture

The core feature of 2.0 is the ability to group messy tabs instantly using AI. I wanted to avoid the privacy nightmare of sending user history to a central server, so I built a "Bring Your Own Key" (BYOK) system.

The extension talks directly to your chosen provider (OpenAI, Anthropic, Gemini, etc.) from your browser - no middleman server. I implemented a content script that safely injects into active tabs (using strictly scoped `activeTab` permissions) to scrape metadata like page titles and descriptions. This context is fed into the LLM prompt to generate meaningful group names like "React Docs" or "Jira Tickets" rather than generic "Work" buckets. The prompts are tuned to output a strict JSON schema that maps tabs to groups. The system then diffs this AI suggestion against your current tree, allowing you to preview the reorganization before committing it.

### The Toolbar Popup View

Not everyone wants a permanent sidebar taking up screen real estate. I refactored the main `TabTreeComponent` to be environment-agnostic. It now mounts in two places: the side panel and a new toolbar popup.

Both views share the same live data source. I switched from simple message passing to long-lived `chrome.runtime.connect` ports. This ensures that if you reorder a tab in the popup, the sidebar (if open) animates the change in real-time without desyncing.

### Enhanced Theme Engine

The theming system got a total overhaul. I implemented a `MutationObserver` on the `<html>` root to detect system theme changes instantly. The UI now mirrors Chrome's native "System/Light/Dark" preference automatically but includes a manual override stored in `chrome.storage.sync`.

---

## Version 1.0.0 — June 2025

I developed Moose Tabs over a few weeks as a way to self-organize tabs in a fast way. Chrome's flat tab bar becomes unusable at scale, and existing solutions felt clunky. The challenge was to build a modern, performant tree view with sophisticated drag-and-drop that runs entirely locally using Chrome's Manifest V3 architecture.

### Global Animation Coordination via Singleton Pattern

One of the trickier problems was animating tabs smoothly during reorders. Both the moved tabs *and* the displaced ones need to animate simultaneously, even though they're in completely different parts of the component tree. 

The solution was to implement a module-level singleton with a pub/sub notification system. The `useTabAnimations` hook provides a `subscribe()` function that registers listeners to a global `Set`. When a drag completes, `startAnimation()` updates the global state and notifies all subscribers, triggering synchronized CSS animations across the entire tree without prop drilling.

### Depth-Aware Drop Zone Priority System

In a nested tree, dragging over a parent tab also triggers the drop zone on all its ancestors, which is apparently a classic z-order problem with `react-dnd`. The solution was to build a `DropZoneContext` with a priority system: deeper levels always win. When multiple tabs detect a hover, the context compares nesting depths and only the deepest target becomes the "active" drop zone. This ensures you can precisely target a nested child without the parent stealing the drop.

### Position-Based Drop Intent Detection

Rather than cluttering the UI with separate "sibling" and "child" drop targets, I detect intent from the cursor position: left 60% = sibling, right 40% = child.

* Visual Feedback: Drop zones dynamically color-code based on target depth using a level-based hierarchy (green → yellow → red → blue → steel blue for deep nesting). The CSS generates pseudo-elements with pulsing animations that match the accent color of the *target* level.

### Service Worker Resilience

Manifest V3 service workers can suspend at any time, wiping in-memory state. On any message from the sidebar, the background script calls `ensureHierarchyInitialized()` which compares the in-memory tab count against Chrome's actual tabs. If they diverge, it rebuilds the entire tree from scratch—invisible to the user.

### Pinned Tab Constraints

Chrome's pinned tabs have strict ordering rules: pinned must stay before unpinned, and you can't interleave them. I implemented synchronous validation in the drop handler: pinned tabs can only drop after other pinned tabs, and unpinned tabs can only drop after the *last* pinned tab or any unpinned tab. Invalid drops trigger a shake animation.

### Fuzzy Search with Character-Order Matching

The search isn't a simple substring match—it's fuzzy. Typing "ggl" matches "Google" because all characters appear in order, even if not consecutively. This lets users find tabs with minimal typing, configurable for case sensitivity and URL inclusion.
