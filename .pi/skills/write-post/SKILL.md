---
name: write-post
description: Draft, create, or update a blog post (long or mini) for Mohsin's site in his own voice, as an unpublished draft he can review. Use when asked to write, outline, draft, edit, or publish a post or post-like copy (project write-ups, About text).
---

# Writing a post in Mohsin's voice

Read the voice guide (`guides/voice.md` locally if present, otherwise `~/.tron/workspace/files/mohsin-ismail-site/voice.md`; it is private and git-ignored, never commit it) in full before you write. It's short, and it's the whole point of this skill. The repo is public: never commit the voice guide or drafts.

## 1. Gather substance before prose

A post in his voice runs on specifics. Before drafting, collect what happened, what he wanted, what he tried, what didn't work, versions, models, prices, numbers, time spent, links, and his opinion. Get these from his notes, the repo or project in question, commit history, or by asking him through `ask_user` when something only he knows is missing. Never invent personal details, opinions, numbers, or anecdotes. If you don't have a fact, leave a `TODO(mohsin): …` placeholder for him to fill in.

## 2. Create it as a draft (never publish directly)

```
drafts/YYYY-MM-DD-kebab-title/post.md     # git-ignored; date = today (local), slug from the title
drafts/YYYY-MM-DD-kebab-title/*.png       # images next to the post, referenced as ![caption](file.png)
```

Frontmatter:

```yaml
---
title: "Plain specific title"          # omit for type: mini
date: "2026-10-15T14:30:00-07:00"      # ISO with offset, quoted
tags:
  - lowercase tag
# type: mini                           # 1-4 sentence reaction/note, no title
# enableTableOfContents: true          # only with 4+ ## sections
---
```

The dev server shows drafts at `/posts/<slug>` and in the blog list. Production builds never include `drafts/`, and git ignores it. To let Mohsin read a draft on another device, copy it to `~/.tron/workspace/files/mohsin-ismail-site/drafts/`.

## 3. Draft the post

- Never invent personal details, feelings, or opinions. Use `TODO(mohsin): …` placeholders. `npm run validate` blocks publishing while any remain.
- Follow the arc: what he wanted or what bugged him, what he did, what worked or didn't, where it stands now, then a link. Stop there.
- Write in first person, in plain sentences, with contractions. Use spaced hyphens and **no em dashes**. Use at most one exclamation mark.
- Write prose, not bullet points. Put asides in footnotes `^[...]`.
- Credit agents and models honestly when they did the work.
- When updating an existing post: change only what was asked, keep his wording elsewhere, and never rename the folder.

## 4. Check it

1. `npm run lint:voice -- drafts/<slug>/post.md` fixes every flag, or you keep one deliberately and say why.
2. Re-read it against the self-check list at the end of the voice guide.
3. `npm run validate` checks frontmatter, image paths, and internal links.
4. Render it in a real browser at desktop and mobile widths. Drafts only exist on the dev server:
   ```
   npm run dev -- --port 5173 --strictPort &
   npm run check:browser -- --url http://localhost:5173 --only-pages --pages /posts/<slug>,/blog --out shots/draft-<slug>
   ```
   It needs 0 problems. Then look at the mobile and desktop PNGs yourself.
5. Show Mohsin the draft (path, plus the screenshots via `display`).

## 5. Publishing (only with his explicit OK via `ask_user`)

Move the folder with `mv drafts/<slug> public/posts/<slug>` (then `git add`) and update `date:` to the publish time if he wants. Run `npm run build` and `npm run check:browser -- --pages /posts/<slug>`. Commit it on a branch. Merging to `main` deploys it, so that also waits for his OK.
