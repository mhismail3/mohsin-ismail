---
title: "Moose's Toolbox: My take on HTML Tools"
date: "2025-12-16T22:48:00-08:00"
tags:
  - moose's toolbox
  - automation
  - ai
  - opus 4.5
  - html tools
---

Like many, I read [Simon Willison's excellent post on building HTML Tools](https://simonwillison.net/2025/Dec/10/html-tools/) recently, and I was immediately inspired to come up with my own version.

Introducing: **[Moose's Toolbox](https://tools.mhismail.com/)**, available for you to check out and use!

---

I've been using AI to build various things at an incredible clip - it's been a boon for rapid prototyping. And often times I find myself asking Claude to do the same things over and over again. In the past I'd with I could have my own little developer toolkit to whip out at a moment's notice. Now, with AI, that becomes a reality.

I mostly followed Simon's guidance from his blog post on keeping these single-purpose tools lightweight and portable. Each tool is an `index.html` file for the UI and an `app.js` file for the logic. There's a common `shared.css` stylesheet to keep the theme consistent across all of this. I ported over the design theme from this website - for consistency, and because it's been tried and tested at this point.

So far, in the last day or two I've already gotten Claude Opus 4.5 to write 3 tools for me: **EXIF Viewer**, **MOV to GIF**, and **Link Explorer** (I'm sure I'll add more soon enough). Each tool lives on its own page, come with a light/dark mode toggle, and an `Info` button with instructions on how to use.

All tools live in a single repository, where they're deployed via Github Pages to [tools.mhismail.com](https://tools.mhismail.com/).