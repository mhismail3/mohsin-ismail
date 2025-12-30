---
title: "From HTML Tools to Homebrew CLI Tools"
date: "2025-12-18T23:30:00-08:00"
tags:
  - homebrew
  - cli
  - automation
  - moose's toolbox
  - mistral ocr 3
---

A few weeks ago I built [Moose's Toolbox](https://tools.mhismail.com/), a collection of lightweight browser-based utilities. Each tool is self-contained: one HTML file for UI, one JavaScript file for logic, and a shared stylesheet for consistency.

It works great for ad-hoc tasks. But I wanted to just use some tools like these from the terminal directly. CLI tools integrate seamlessly into workflows that HTML tools can't work well with:

- Shell scripts that chain multiple operations
- CI/CD pipelines running automated tasks
- Agent workflows calling tools as SDK primitives
- Terminal multiplexers running tools in background sessions

Here is the Homebrew tap I created to house these tools: [homebrew-tools](https://github.com/mhismail3/homebrew-tools).

```bash
# Install
brew tap mhismail3/tools
brew install mistral-ocr

# Upgrade
brew upgrade
```

This makes it trivial to distribute utilities to other machines or share them with others without worrying about environment setup.

### Building for AI Integration

The first tool in the tap is `mistral-ocr`, which extracts text from images using Mistral's new OCR 3 API. It supports multiple formats (PNG, JPEG, WebP, AVIF) and flexible output options:

```bash
# Copy to clipboard
mistral-ocr screenshot.png -o clipboard

# Pipe to another command
mistral-ocr receipt.jpg | grep "Total:"

# Save to file
mistral-ocr document.png -o text.txt
```

### The Pattern Going Forward

Each tool in `homebrew-tools` follows the same architecture philosophy I established with Moose's Toolbox:

1. **Single-purpose**: Each tool does exactly one thing
2. **Self-contained**: Minimal dependencies, clear interfaces
3. **Portable**: Easy to install, easy to update, easy to remove
4. **Composable**: Designed to pipe into other commands

As I continue building tools, the tap becomes a growing library of reliable primitives, both for my own terminal use and for AI agents to invoke.