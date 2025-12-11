---
title: "Moose Tabs v2"
date: "2025-12-08T17:32:00-08:00"
tags:
  - chrome extensions
  - ai
  - automation
  - tabs
---

I just shipped version 2.0.0^[There's no reason to call it 2.0.0 since the last version was 1.0.0 - but here we are.] of [Moose Tabs](https://chromewebstore.google.com/detail/moose-tabs-organize-your/ecgdnamlhfodmjokjobadclppaddeond), my Chrome extension for organizing tabs into a hierarchical tree view.

The headline new feature is an AI Toolkit that can group messy tabs using your own API key (OpenAI, Anthropic, Gemini, etc.). Everything runs client-side, so no data leaves your browser except to the LLM provider you choose. 

The system extracts page metadata, generates meaningful group names, and lets you preview the reorganization before committing.

Other highlights:

- **Toolbar popup view** — A compact micro-view for quick access without keeping the sidebar open, sharing live state via `chrome.runtime.connect` ports.
- **Enhanced theming** — Full parity with Chrome's System/Light/Dark preferences, plus first-class support for high contrast and reduced motion accessibility settings.

For the full technical breakdown of the v2.0.0 updates, as well as details on the original v1 foundation, check out the [Moose Tabs project page](/portfolio/moose-tabs).

