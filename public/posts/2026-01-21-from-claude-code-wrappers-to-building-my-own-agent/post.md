---
title: "From Claude Code Wrappers to Building My Own Agent"
date: "2026-01-21T16:50:00-08:00"
tags:
  - ai
  - agents
  - ios
  - swift
  - typescript
  - claude code
---

About a month ago I wrote about [trying to access Claude Code remotely](/posts/2025-12-20-an-experiment-) through Telegram and Discord bots. That experiment didn't pan out, but it got me thinking - why was I fighting someone else's harness when I could just build my own?

So that's what I did. I called it **[Tron](https://github.com/mhismail3/tron)**.

---

The core problem with wrapping Claude Code was that I was always working against the grain. Parsing terminal output is fragile - you're constantly chasing edge cases in formatting, and getting feature parity with every slash command and confirmation prompt is a moving target. The Agent SDK was cleaner, but that meant paying for API calls on top of my Max subscription, which felt silly.

At some point I realized I was approaching it backwards. Instead of wrapping an existing agent, I could just build one from scratch around the models directly - that way I own the whole stack and can do whatever I want with it.

---

The setup is pretty straightforward: a TypeScript server runs on my Mac mini as a persistent daemon, handling the agent loop, tool execution, and storing everything as events in SQLite. Every action the agent takes becomes an immutable event, which means I can fork a session from any point in history or rewind if something goes wrong (this has already saved me a few times).

The main client is a fully native iOS app - SwiftUI, real-time streaming over WebSocket, offline-capable with a local event database. I can start a session on my laptop and pick it up on my phone. The whole thing *just works*, and I've been using it daily for the past few weeks.

---

Here's the thing I keep coming back to: people talk about vibecoding like it's only good for quick prototypes. Get to 85% and then hand it off to a "real" engineer. But I don't think that's right - with enough persistence you can push through to 99%. It just takes more iterations than most people expect.

Tron has event sourcing for crash safety, a four-level memory hierarchy so the agent doesn't lose context, multi-model support if I want to swap between Claude and GPT mid-session. None of this came out perfect on the first try, but I kept iterating, kept fixing edge cases, kept polishing the small details. The agent helped me build the agent, which is kind of fun to think about.

I'm still adding features, but the core is solid enough that I use it every day. Code's on [GitHub](https://github.com/mhismail3/tron) if you want to take a look!
