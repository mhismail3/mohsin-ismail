---
name: site-update
description: Make and verify any change to Mohsin's personal site (mhismail.com) - code, content plumbing, portfolio projects, About copy, build/deploy scripts. Use for any edit in this repo; it defines the branch, build, real-browser mobile/desktop check, and approval steps.
---

# Updating the site

Read `AGENTS.md` at the repo root first. It covers the structure, commands, and content rules.

## Workflow

1. **Branch or worktree.** Never work on `main` (pushing it deploys). Use `git worktree add -b <branch> ../mohsin-ismail-<topic> origin/main`, run `npm ci`, and use Homebrew Node.
2. **Baseline.** Before editing, run `npm run build && npm run check:browser -- --out shots/before` (about 3 minutes). Add `--pages /route,/route` for routes you'll touch that aren't in the default list.
3. **Change.** Reuse the existing components and tokens (see the `site-styling` skill). Keep content loaders crash-proof.
4. **Fast loop.** `npm run validate` takes seconds. `npm run dev` gives hot reload and includes `drafts/`.
5. **Verify.** Run `npm run build`, then `npm run check:browser -- --out shots/after --compare shots/before`.
   - 0 problems is required: no console errors, failed first-party requests, broken images or links, or horizontal overflow, on desktop 1440 and iPhone 390×844 in both light and dark.
   - Every "changed" screenshot is either intended or explained. Compare the `--fold` image (what a visitor sees first) as well as the full page.
   - If something looks off, open the PNGs in `shots/after/` and look at them. A passing check doesn't mean the page looks right.
6. **Visual changes need approval.** Copy the relevant before and after PNGs to `~/.tron/workspace/files/mohsin-ismail-site/<topic>/` and show them to Mohsin with `display`. Ask for approval with `ask_user` before final validation or merge. To let him check on his phone, offer `npm run dev -- --host 127.0.0.1 --port 5173` plus `tailscale serve --bg 5173` (tailnet-only). Never use `tailscale funnel` or any public tunnel, and run `tailscale serve reset` when done.
7. **Commit and push the branch** in small checkpoints. Merging to `main` (which deploys) needs his explicit OK via `ask_user`.

## Gotchas

- `exclude: true` posts still ship their raw `post.md` in `dist/`. Private drafts go in `drafts/`.
- Never rename a published post folder, because the slug is the URL.
- Commit `src/data/image-manifest.json` when images change. Don't commit `public/optimized/`.
- The About carousel's full-page screenshot can come out blank in Chromium (a capture artifact). Its fold screenshot is authoritative.
- Third-party embeds (YouTube) are masked in screenshots, and their blocked tracker requests are ignored by the check.
