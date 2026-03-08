---
title: "Tron got a lot more real"
date: "2026-03-08T13:20:00-08:00"
tags:
  - ai
  - agents
  - ios
  - swift
  - automation
  - context engineering
enableTableOfContents: true
---

When I first wrote about **[Tron](https://github.com/mhismail3/tron)** back in January, it was already useful enough that I was using it every day. But it still felt like an ambitious personal tool - something that worked because I knew its edges and could work around them.

That has changed a lot over the past month and a half.

I went back through the commit history recently and realized I'd shipped a pretty absurd amount without ever stopping to write down what actually changed. The short version is that Tron is now much less of a "Claude Code alternative I tinker with" and much more of a real system with its own architecture, workflows, and opinions.

---

## The biggest shift: Rust took over the backend

The Jan 21 version of Tron still had more of its original shape: a TypeScript server, a native iOS client, event sourcing, memory, and multi-model support. Since then I moved the backend fully into Rust.

That was a bigger change than just "rewrite it in a faster language." It let me simplify the architecture around a single runtime, a single database story, and a much clearer boundary between the server, tools, model providers, memory, transcription, settings, and iOS client.

A lot of the work since then has been less about adding flashy features and more about removing structural weirdness:
- eliminating circular dependencies
- decomposing oversized modules
- consolidating settings and provider logic
- fixing brittle test patterns
- making the codebase document itself better

That kind of work is easy to understate because the app doesn't suddenly look different. But it's the difference between a project that's fun to demo and one that's pleasant to keep building on.

## Memory got meaningfully better

One of the things I cared about early was making Tron feel like it actually remembers what happened, not just the current prompt window. The original version already had a memory hierarchy, but I kept pushing it.

The biggest jump was **semantic memory v2**: Rust-native embeddings plus hybrid search. That gave me better recall quality, better control over the pipeline, and less "close enough" matching when I wanted the agent to pull back a specific thread from past work.

I also broadened what gets remembered. It isn't just code changes or session mechanics anymore. The memory layer got better at tracking the shape of actual work: decisions, context, lessons, and the surrounding facts that make future sessions feel less stateless.

That's one of the core ideas behind Tron for me. I don't want an agent that is only smart inside the current turn. I want one that can build continuity.

## The iPhone app stopped feeling like a companion app

The iOS client improved a lot during this stretch.

Some of that work was visual polish: smoother streaming, better token displays, cleaner tool chips, more consistent sheets, redesigned branding, a floating chat pill, and a persistent chat session with its own visual treatment. But the more important changes were about flow.

I added:
- a **persistent default chat** so there's always one main session I can drop into
- a **prompt queue** so I can type ahead while the agent is still working
- better **resume and reconstruction** so reconnecting doesn't feel fragile
- a **notification inbox** with deep linking and read state
- a full **source control/worktree sheet** so git context is visible from iOS
- better **batch task operations** in the UI
- cleaner **settings organization** and more transparent context auditing
- a **share extension** and device integrations, so the phone can hand the agent real-world context instead of being just a remote terminal

That last part matters a lot. I'm increasingly interested in the phone not as a thin window into a desktop agent, but as a first-class input device with its own context: clipboard, calendar, health data, notifications, shares, quick actions, all of it.

There's still more I want to do here, but the app now feels much closer to the product I had in my head.

## Automations turned Tron into something I can schedule

A big addition was the cron/automation system.

Tron can now run scheduled tasks, write memory ledgers after cron runs, skip no-op sessions, filter cron sessions properly in the UI, and present automations in a way that actually makes sense on the phone. I also spent time on all the annoying details that make scheduled systems either trustworthy or useless: human-readable schedules, better runtime state handling, batch operations, notification behavior, and separating dashboard noise from real sessions.

This is one of those features that quietly changes the product.

A chat agent is nice. An agent that can do work on a schedule, remember what it did, and surface the result to me later is much more interesting.

## Web research and tool cleanup made the agent feel sharper

The tool layer got a bunch of improvements too.

I added **`WebFetch`** and **`WebSearch`**, which sounds small, but it closes a pretty important gap. Before that, getting fresh external information into the system felt more awkward than it should have. Now the agent can search, fetch, summarize, and keep moving without everything turning into a browser-control problem.

I also cleaned up the tool surface:
- merged multiple search paths into a unified **`Search`** tool
- simplified browser tool naming
- removed redundant tools
- cleaned up subagent spawning
- added **batch task operations**
- improved logging and event ingestion so tool execution is easier to reason about afterward

I like tools best when they become boring. Not because they're unimportant, but because they're predictable.

## The operational side got much less janky

There was also a lot of work that fits under "the machine should behave like a machine."

The database got consolidated. Logging got less noisy and more structured. Client logs now flow into the same unified store. Deployment and artifact paths got cleaned up. The server and iOS client were decoupled more cleanly. The dev workflow got simpler. Worktree handling got safer. Source control visibility improved. Protection against touching cloud-synced folders got added.

There were also a lot of fixes that only show up as absence:
- fewer session resume issues
- fewer race conditions
- fewer duplicate events
- fewer bad token counts
- fewer model-switch edge cases
- fewer weird streaming artifacts
- fewer places where the UI and the runtime disagree about what's happening

That's most of the work, honestly. Just removing reasons to stop trusting the system.

## The product is more opinionated now

The January version of Tron was already personal software in the good sense. It reflected how I wanted an agent to work.

The current version is more opinionated than that. It has stronger defaults now:
- default chat mode
- persistent session behavior
- better task discipline
- more liberal notifications
- device-aware integrations
- clearer separation between quick one-off interactions and stateful ongoing work

I think that matters. Agents get messy fast when every capability is treated as equally important and every workflow is treated as user-configurable from day one. I'm finding that the better path is to pick a shape, make it coherent, and then keep smoothing the rough edges.

## What I think Tron is becoming

When I started this project, the motivating idea was pretty simple: I wanted something I fully owned, top to bottom, instead of wrapping someone else's agent and fighting their assumptions.

That part is still true. But I think the more interesting thing now is that Tron is turning into a kind of personal operating layer for agentic work.

Not just "send a prompt and get a reply," but:
- keep a durable event history
- remember useful context across sessions
- run scheduled work
- surface what matters on my phone
- make tools composable
- let the system become more helpful over time instead of more chaotic

It's still very much my own software, and that remains part of the appeal. I can move fast, change the shape of things when I need to, and build features that would never make sense in a generic product.

But it also means I can't hide behind "it's just an experiment" anymore. At this point I use it enough that every rough edge costs me real time. That's probably why so many of these commits are refactors, reliability fixes, and architectural cleanup. I'm not polishing for show. I'm just trying to make the thing I rely on less annoying tomorrow than it was yesterday.

I'm still adding features, but the foundation is much better now than it was in January. If you want to poke around, the code's on [GitHub](https://github.com/mhismail3/tron).
