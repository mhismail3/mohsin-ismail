---
title: "Post Notes"
date: "2025-12-10T14:45:00-08:00"
tags:
  - design
  - opus 4.5
---

I added a tiny feature to my blog that I've wanted for a while (and Opus made so easy) - inline notes for posts.

Admittedly, the inspiration comes from Tim Urban's fantastic blog [Wait But Why](https://waitbutwhy.com/), and how he uses footnotes to add context & side comments.

Here's what they look like on this site.^[Notes render as small circular bubbles that expand when clicked or tapped.]

The bubbles sit inline^[You can include *emphasis*, `code`, and even [links](https://theuselessweb.com/) inside the footnote text.] with the text so you can keep the main flow readable.

## The Implementation

To add a post note, I use the caret-bracket syntax:

```text
Some sentence here.^[Note content goes inside the brackets.]
```

You can add more^[Each bubble is auto-numbered based on order of appearance.] than one^[So I don't need to worry about re-numbering if I add/remove content as I write.] footnote in the same paragraph, and they'll keep their numbering consistent throughout the post.

This feature is perfect for citations^[Like referencing a source without breaking flow.], clarifications, or tangential thoughts that don't belong in the main text.
