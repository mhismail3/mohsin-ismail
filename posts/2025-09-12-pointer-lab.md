---
title: "Pointer lab: mobile drag & delete"
date: "2025-09-12"
tags: ["mobile", "dnd", "ux"]
summary: "Dialed in pointer settings so drag-and-drop stays responsive on mobile Safari while keeping inline deletes tap-friendly."
---

Mobile drag felt sticky, so I rebuilt the interaction with a `PointerSensor` and a tiny activation distance (6px). Inline delete buttons now stop `pointerdown` and `click` propagation, which prevents accidental drags while tapping.

The change log is short but the result is big: cards lift quickly, land smoothly, and the delete action never blocks a tap. All padding is tightened for thumb reach on narrow viewports.
