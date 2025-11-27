# TLDR hide jitter smoothing

- Hiding the TL;DR introduced a slight jitter after removing the border/padding to clear the collapsed gap; the abrupt removal at collapse caused a visible snap.
- Added matching transitions for `padding-top` and `border-top-width` on `.post-body` within the card so those values animate alongside the grid collapse and opacity/transform, keeping the hide animation smooth while still removing the extra space.
- Previous gap fix (`2025-11-27 00-23-03 - TLDR collapsed gap fix.md`) remains intact; this only smooths the collapse timing.
