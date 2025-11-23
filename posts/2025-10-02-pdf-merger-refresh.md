---
title: "PDF Merger refresh"
date: "2025-10-02"
tags: ["pdf", "tooling", "frontend"]
summary: "Refined the PDF merger UI with clearer drop targets, live payload stats, and stronger tactile feedback."
---

I tightened the PDF merger that powers my personal toolkit. The goals:

- Prevent duplicate ingest on nested drop zones by stopping both `dragover` and `drop` propagation.
- Keep render and storage buffers separate. The storage bytes are copied into a `Uint8Array` before persisting, which avoids detached buffers in IndexedDB.
- Pair a simple serif hierarchy with a warm paper background to match the rest of the studio aesthetic.

![PDF merger UI](https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=1200&q=80)

The result is a calmer import stack and a responsive page order lane. The payload counter updates in real time so you can see memory pressure before exporting.
