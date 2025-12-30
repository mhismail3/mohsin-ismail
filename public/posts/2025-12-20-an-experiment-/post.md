---
title: "An experiment in remote Claude Code access"
date: "2025-12-20T16:58:00-08:00"
tags:
  - claude code
  - claude agent sdk
  - discord
  - telegram
  - automation
  - opus 4.5
---

Claude Code with Opus 4.5 is a powerhouse - but I'd love to be able to have access to it, running on my own machine with my own filesystem, on the go. So I spent the last couple of days attempting to build a way to access Claude Code remotely from my phone. I called it [Claude Moose](https://github.com/mhismail3/claude-moose).

---

I started with Telegram since the bot API is straightforward. The goal was to stream Claude Code's terminal output as replies in a Telegram chat. I got a persistent process running on my Mac Mini and could initiate sessions through the bot but quickly ran into roadblocks getting Claude to reliably message what it was doing and actually respond. And Telegram wasn't reliably sending input back to the session when Claude requested user confirmation.

I pivoted to Discord and had Opus 4.5 rewrite the implementation in Python. The same core issues were there - misformatted terminal output, the bot failing to recognize inputs, sessions hanging unexpectedly.

The underlying problem was trying to wrangle raw CLI output through a messaging layer. I switched to the Agent SDK hoping for a more robust approach to message parsing and I/O handling. This got me *nearly* there, until I ran out of API credits and realized my Claude Max plan wasn't going to cover it 🥲.

![](gallery-1.png)

---

I'm now having Opus rewrite everything to be purely CLI-based, using Tmux for session management. Still a work in progress.

In the meantime, if I need remote Claude access, the practical path is just to SSH into a machine running Claude Code. It's not as elegant as a messaging bot, but it makes use of the subscription I'm already paying for.

I pushed everything to [GitHub](https://github.com/mhismail3/claude-moose) if you want to take a look!