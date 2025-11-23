---
title: "Inked cards for small screens"
date: "2025-05-22"
tags: ["layout", "mobile", "ux"]
summary: "Swapped tall grids for horizontal row cards so metadata stays visible on phones."
---

I rebuilt the card layout into horizontal rows: thumbnail + text + actions. Each thumb is constrained with `object-fit: contain` and an explicit aspect ratio so tall receipts don’t blow up the card height.

The result: a compact feed that shows tags and actions without scrolling on mobile Safari.
