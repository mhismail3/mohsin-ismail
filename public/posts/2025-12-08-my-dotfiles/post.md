---
title: "Writing My Own Dotfiles"
date: "2025-12-08T01:00:00-08:00"
tags:
  - dotfiles
  - macos
  - automation
enableTableOfContents: true
---

I've long been intrigued by the idea of having a "perfect backup" strategy for all of my devices and tools. But I've mostly ended up doing this manually, by writing Notion pages for myself listing out all of the apps and configuration changes to be made on any new machine. Lately, after exploring some of the blogs and posts by the various smart people discussing AI on X, I found out about the world of dotfiles, and decided to use AI to speed-write^[I consider myself a perfectionist, and I'm sure that I could spend countless hours endlessly tweaking my config in order to get it *exactly* right, but there would certainly be diminishing returns. 

So, my goal (for now) was to bootstrap the most important tools and things in order to start coding with agents quickly.] my own [dotfiles](https://github.com/mhismail3/dotfiles).

For the uninitiated, dotfiles are hidden configuration files (many start with a `.`) that customize your shell, git, editors, and other tools. The idea of a dotfiles repo is to version-control all of these configs so that setting up a new Mac becomes a single command instead of hours of manual configuration.

I recently got the base Mac Mini M4 to use as a home server, so I figured this was a great opportunity to configure my dotfiles with the following goal: **Bootstrap my Mac Mini with one command to map to my current Macbook setup.**

```bash
curl -fsSL https://raw.githubusercontent.com/mhismail3/dotfiles/main/start.sh | zsh
```

So far this is what I'm working on - running this command on a brand new Mac, and everything is good to go.

## Inspiration

I was heavily inspired by [Dries Vints](https://github.com/driesvints/dotfiles) and [Mathias Bynens](https://github.com/mathiasbynens/dotfiles) - two dotfiles repos that have been refined and referenced over the years. Dries' approach to organizing the bootstrap script and Brewfile was particularly helpful, and Mathias' `.macos` file (which configures hundreds of macOS system preferences via the command line) was incredibly helpful to use as a baseline. I picked and chose the parts that made sense for my workflow, and am working on adding more things specific to my preference.

## What Gets Installed

The `Brewfile` is the heart of the system. It's a manifest of everything Homebrew should install:

**Dev tools** - git, gh (GitHub CLI), neovim, tmux, jq, httpie, and all the version managers (pyenv, nvm, rbenv, rustup).

**Apps** - Cursor, VS Code, Arc, Warp, Raycast, 1Password, Things 3, and others.

**AI CLIs** - Cursor Agent, Claude Code, Gemini CLI, OpenAI Codex CLI. Having all three AI coding assistants available from the terminal is the ultimate goal, to be able to SSH in and get stuff done remotely.

I've replaced most of the default Unix tools with modern alternatives that are faster and have better defaults:
- `bat` instead of `cat` (syntax highlighting!)
- `eza` instead of `ls` (colors, git status, icons)
- `fd` instead of `find` (actually usable syntax)
- `ripgrep` instead of `grep` (blazing fast)
- `zoxide` instead of `cd` (remembers your frequent directories)
- `htop` and `btop` instead of `top`

## The Automated Mac Setup

The `.macos` file is where it gets interesting. It does the following:

- Automatically sets up my exact Dock order, so no more manually dragging icons around.
- Sets up Finder to show hidden files, path bar, status bar, and sets up the sidebar exactly how I like it.
- Configure keyboard with fast key repeat, tap to click, all the ergonomic stuff.
- Points to my Synology NAS Drive folder so screenshots sync across devices.

---

This is still very much a work in progress. I'm refining things as I go - adding new tools, tweaking preferences, and figuring out what I actually need on the home server versus my daily driver. The nice thing about having it all in a git repo is that I can iterate freely, and if something breaks, rolling back is just a `git checkout` away.

If you're curious, the repo is public at [github.com/mhismail3/dotfiles](https://github.com/mhismail3/dotfiles).
