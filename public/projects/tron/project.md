---
title: Tron
slug: tron
date: 2026-02-05
summary: A personal AI coding agent built from scratch — event-sourced TypeScript server, native iOS client over WebSocket, multi-model LLM support, and a sub-agent system for parallel task execution. The whole stack is mine, from the system prompt to the context window.
github: https://github.com/mhismail3/tron
tags:
  - TypeScript
  - Swift
  - SwiftUI
  - SQLite
  - WebSocket
  - AI Agents
  - Event Sourcing
  - iOS
status: "🔄 Active"
cover: cover.png
excludeCoverFromCarousel: true
gallery:
  - 04-context-progress-pill.gif
  - 07-skills-sheet.gif
  - 08-adding-skill.gif
  - 09-skill-detail-sheet.gif
  - 10-attaching-photo.gif
  - 08-reconnecting-connected.gif
  - 05-push-notification.gif
  - 03-model-pill-popup.gif
  - 02-tap-plus-button.gif
  - 06-edit-tool-chip.gif
---

## Why Build Your Own Agent

I wrote about this a bit in a [previous blog post](/posts/2026-01-21-from-claude-code-wrappers-to-building-my-own-agent) — after spending weeks trying to wrap Claude Code through Telegram bots and Discord, I realized I was fighting someone else's abstractions. Parsing terminal output is fragile. The Agent SDK meant paying for API calls on top of a Max subscription. Everything felt like a workaround.

What I actually wanted was control. Control over the system prompt — what the agent knows, how it reasons, what persona it takes on. Control over the context window — when to compact, what to preserve, how to manage memory across sessions. Control over the execution layer — which tools are available, how they're validated, what happens before and after every action the agent takes.

So I built **Tron** from scratch. TypeScript server, event-sourced state, real-time streaming, multi-model LLM support, and eventually a native iOS app as the primary interface.

---

## The Architecture

The server runs as a persistent daemon on my Mac mini. It handles the full agent loop: receiving messages, constructing prompts, streaming LLM responses, executing tools, and recording everything as immutable events in SQLite.

The event sourcing part is the foundation everything else is built on. Every user message, every assistant response, every tool call and result — all of it gets written as an event with a `parentId` forming a tree structure. This means I can fork a session from any point in history, rewind if something goes wrong, or reconstruct the full state of any conversation by walking the event chain. It's not just for auditability — it's saved me real debugging time more than once.

On top of that sits a layered architecture: core types and dependency injection at the bottom, then infrastructure (logging, settings, auth), then the LLM provider layer, then capabilities (tools, hooks, guardrails), then the runtime (agent loop, context management), and finally the interface layer that exposes everything over JSON-RPC 2.0 via WebSocket.

### Multi-Model Support

Tron supports three LLM providers through a unified interface — Anthropic (Claude Opus 4.6, Opus/Sonnet/Haiku 4.5), OpenAI (GPT 5.2 Codex, GPT 5 and 5.1 Codex), and Google (Gemini 3 Pro/Flash). Each provider follows the same composition pattern: an auth module, a message converter, a stream handler, and provider-specific types. Swapping models mid-session is a first-class operation. I mostly use Claude Opus 4.5, but being able to drop into Gemini 3 Flash for quick tasks or test against GPT 5.2 Codex keeps things flexible. Claude Opus 4.6 released today (2/5/2026) and I already have full support for it, including its new adaptive thinking and effort parameter.

---

## From Terminal to iOS

I started with two interfaces: a terminal UI built with Ink (React for the terminal) and a React web app. Both connected to the server over WebSocket and worked fine for desktop use. But the whole reason I started this project was wanting to use my agent on the go — so pretty quickly the focus shifted to building a native iOS app.

The iOS client is pure SwiftUI with an MVVM architecture. Large view models are split across extension files to keep things manageable — `ChatViewModel+Connection.swift` handles WebSocket management, `ChatViewModel+Events.swift` handles event subscriptions, `ChatViewModel+Messaging.swift` handles sending messages, and so on. It streams responses in real-time, maintains a local event database for offline access, and supports push notifications via APNS so the agent can ping my phone when a long-running task finishes.

The transition from web to native was the right call. The app feels *responsive* in a way that a web client wrapped in a mobile browser never could — proper keyboard handling, native gestures, smooth streaming text.

---

## Interesting Bits

### Event-Sourced State

Every interaction is an immutable event — user messages, assistant responses, tool calls, tool results — each with a `parentId` forming a tree. This means I can fork a session from any point in history, rewind when something goes sideways, or reconstruct the full state of any conversation by walking the event chain. The `Adapt` tool takes advantage of this: the agent can deploy new versions of *itself*, hot-swap the running binary, and if the deploy breaks something, roll back by replaying from a known-good event.

### Context Compaction

Tron tracks token usage against the model's limit and, when it hits a threshold, uses the LLM itself to summarize older turns into a compressed form. It preserves recent turns in full, extracts structured facts and decisions, and records the compaction as its own event. On top of that sits a four-level memory hierarchy: the system prompt sets baseline behavior, skills inject domain knowledge, path-scoped rules files (like `AGENTS.md`) provide directory-level context, and session memory carries forward within a conversation.

### Voice Notes

The iOS app supports voice input that gets transcribed locally on the Mac mini using a Parakeet v3 0.5B model — no audio leaves the network. I can hold the mic button, say what I need, and it arrives as text in the agent's context. Fast enough to feel instant, private enough that I don't think twice about dictating sensitive project details.

### Obsidian Integration

Tron has read/write access to my Obsidian vault. The `@search-notes` skill lets the agent search through personal notes and surface relevant context — project logs, meeting notes, reference material — and weave it into the conversation. It can also write back to the vault, so the agent can create or update notes as part of a task.

### Streaming Across the Stack

Three LLM providers, each with their own SSE format and quirks, normalized into a unified event stream over WebSocket. The iOS app renders streaming text incrementally with proper SwiftUI state management so it doesn't jank. Small details like handling thinking blocks, tool-use deltas, and partial JSON in tool calls all needed individual attention — but getting it right is what makes the app feel alive rather than loading.

---

## What Tron Can Do

Some of the things I've built into Tron that I haven't seen in other agent tools:

### Local, Private AI

Tron runs entirely on my machine. The server is a daemon on my Mac mini, the agent reads and writes my actual files, and the iOS app connects over Tailscale — my phone talks to my server over my own private network. No data passes through a third-party relay. The only external calls are to the model APIs themselves (Anthropic, OpenAI, Google). Everything else — the event store, the tool execution, the context management — stays local.

### Native iOS Integration

Every feature in the iOS app is built from scratch in SwiftUI — no web views, no thin wrappers around a chat API. Tool calls render as purpose-built chip components with expandable detail views. The model picker, context budget indicator, skills browser, and attachment flow are all native interfaces designed around how I actually use the agent. Push notifications arrive via APNS with rich previews of what the agent accomplished. Session management, workspace switching, and full event history browsing are all first-class screens, not afterthoughts. The goal was an app where every interaction feels considered — and nothing feels like it was bolted on.

### Multimodal, Multi-Model Support

Three providers, every frontier model, and more than just text in. Tron supports Claude Opus 4.6 through Haiku 4.5, GPT 5.2 Codex through GPT 5, and Gemini 3 Pro and Flash — all swappable mid-session. On the input side, you can attach photos from your camera roll, files from disk, or inject domain-specific skills into the system prompt. The agent gets whatever context it needs, in whatever format makes sense.

### Sub-Agents with Tool Controls

Tron has a sub-agent system where the primary agent can spawn child agents for parallel task execution. The interesting part is the tool denial configuration — you can give a sub-agent access to all tools, restrict specific ones, or create a text-only sub-agent with no tool access at all. You can even deny specific *patterns* within a tool, like blocking `rm -rf` in Bash while allowing everything else. Sub-agents can run in-process (blocking, for quick tasks) or in a Tmux session (fire-and-forget, for long-running work).

---

## Demos

<div class="video-demos">

<div class="video-demo-item">
<h3>The Interface</h3>
<div class="video-short-wrapper">
<iframe src="https://www.youtube.com/embed/Tm0KkVxsK8s" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
</div>

<div class="video-demo-item">
<h3>Chatting with an Agent</h3>
<div class="video-short-wrapper">
<iframe src="https://www.youtube.com/embed/wfa9PY34QmI" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
</div>

<div class="video-demo-item">
<h3>Some Other Features</h3>
<div class="video-short-wrapper">
<iframe src="https://www.youtube.com/embed/PGV61_YvPLk" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
</div>

</div>

---

## What's Next

The sub-agent system is the thing I'm most excited about. Right now it's a proof of concept — one primary agent spawning child agents for isolated tasks. But the foundation is there for real multi-agent workflows: agents that can coordinate, share context selectively, and divide complex projects into parallel workstreams.

Beyond multi-agent, I'm working on better memory persistence across sessions — so the agent builds up project-specific knowledge over time rather than starting cold every conversation. And there's more to do on the iOS side: better artifact rendering, collaborative editing views, and tighter integration with Xcode workflows.

The core is solid. I use it every day. But the interesting work is just getting started.
