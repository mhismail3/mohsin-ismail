---
title: "Embeds that match the paper aesthetic"
date: "2024-12-30"
tags: ["embeds", "markdown", "demo"]
summary: "Verified that markdown posts can mix images, GIFs, and rich embeds without breaking the layout."
---

This feed now allows inline embeds inside markdown. A quick example: a GitHub star button in an iframe renders cleanly inside the post without leaking styles.

<iframe
  src="https://ghbtns.com/github-btn.html?user=mohsinismail&repo=portfolio&type=star&count=true"
  title="GitHub Stars"
  width="150"
  height="20"
  frameborder="0"
  scrolling="0"
  loading="lazy"
></iframe>

And an image still sits comfortably in the flow:

![Desk photo](https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80)

Everything inherits the same serif typography, borders, and shadows so the page stays cohesive.
