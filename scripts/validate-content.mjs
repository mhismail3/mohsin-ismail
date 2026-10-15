#!/usr/bin/env node
/**
 * Fail-fast content checks, run first in `npm run build` (and in CI).
 * Catches the mistakes that otherwise ship silently: bad frontmatter, missing
 * dates/titles, images that don't exist, internal links to missing or hidden
 * posts/projects, and folder names that don't follow the slug convention.
 *
 *   npm run validate            # published content + drafts
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, PUBLIC_DIR, loadPosts, loadDrafts, loadProjects } from './content.mjs';

const errors = [];
const warnings = [];
const rel = (f) => path.relative(ROOT_DIR, f);
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`);

const POST_KEYS = new Set(['title', 'date', 'tags', 'type', 'exclude', 'enableTableOfContents']);
const PROJECT_KEYS = new Set(['title', 'slug', 'date', 'summary', 'github', 'live', 'tags', 'status', 'cover', 'gallery', 'excludeCoverFromCarousel']);
const SLUG_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;

let posts; let drafts; let projects;
try {
  posts = loadPosts();
  drafts = loadDrafts();
  projects = loadProjects();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}

const visiblePosts = new Set(posts.filter((p) => !p.excluded).map((p) => p.slug));
const allPosts = new Set(posts.map((p) => p.slug));
const projectSlugs = new Set(projects.map((p) => p.slug));

const validDate = (d) => d && !Number.isNaN(new Date(d instanceof Date ? d : String(d)).getTime());

/** Strip fenced and inline code so examples inside code aren't treated as links. */
const proseOnly = (md) => md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

function checkBody(item, { isDraft }) {
  const body = proseOnly(item.content);
  for (const [, src] of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(https?:|data:)/.test(src)) continue;
    const file = src.startsWith('/') ? path.join(PUBLIC_DIR, src) : path.join(item.dir, src);
    if (!fs.existsSync(file)) err(item.file, `image not found: ${src}`);
  }
  for (const [, href] of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const clean = href.split(/[?#]/)[0].replace(/\/$/, '');
    const post = clean.match(/^\/posts\/([^/]+)$/);
    const project = clean.match(/^\/portfolio\/([^/]+)$/);
    if (post) {
      if (!allPosts.has(post[1])) err(item.file, `link to missing post: ${href}`);
      else if (!visiblePosts.has(post[1]) && !isDraft) err(item.file, `link to excluded post: ${href}`);
    } else if (project) {
      if (!projectSlugs.has(project[1])) err(item.file, `link to missing project: ${href}`);
    } else if (['', '/blog', '/about', '/portfolio'].includes(clean)) {
      // static routes
    } else if (!fs.existsSync(path.join(PUBLIC_DIR, clean))) {
      err(item.file, `link to missing file/route: ${href}`);
    }
  }
}

for (const p of [...posts, ...drafts]) {
  const { data } = p;
  if (!SLUG_RE.test(p.slug)) warn(p.file, `folder name should be YYYY-MM-DD-kebab-title (got "${p.slug}")`);
  if (!validDate(data.date)) err(p.file, 'missing or invalid `date` (use ISO with offset, e.g. "2026-03-08T13:20:00-08:00")');
  const type = data.type || 'long';
  if (!['long', 'mini'].includes(type)) err(p.file, `unknown type "${data.type}" (long | mini)`);
  if (type === 'long' && !data.title) err(p.file, 'long posts need a `title`');
  if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some((t) => typeof t !== 'string'))) err(p.file, '`tags` must be a list of strings');
  if (!p.content.trim()) err(p.file, 'empty body');
  Object.keys(data).filter((k) => !POST_KEYS.has(k)).forEach((k) => warn(p.file, `unknown frontmatter key "${k}"`));
  if (!p.draft && /TODO\(mohsin\)|^DRAFT\b/m.test(p.content)) err(p.file, 'published post still contains a TODO(mohsin) placeholder or DRAFT note');
  checkBody(p, { isDraft: p.draft });
}

const seenSlugs = new Set();
for (const proj of projects) {
  const { data } = proj;
  if (seenSlugs.has(proj.slug)) err(proj.file, `duplicate project slug "${proj.slug}"`);
  seenSlugs.add(proj.slug);
  if (data.slug && data.slug !== proj.folder) warn(proj.file, `slug "${data.slug}" differs from folder "${proj.folder}" (images resolve from /projects/${data.slug}/)`);
  if (!data.title) err(proj.file, 'missing `title`');
  if (!validDate(data.date)) err(proj.file, 'missing or invalid `date`');
  if (!data.summary) warn(proj.file, 'missing `summary` (used on cards and OG description)');
  const imgDir = path.join(PUBLIC_DIR, 'projects', proj.slug);
  const files = [data.cover, ...(Array.isArray(data.gallery) ? data.gallery.map((g) => (typeof g === 'string' ? g : g?.src)) : [])].filter((f) => f !== undefined);
  for (const f of files) {
    if (!f || !fs.existsSync(path.join(imgDir, f))) err(proj.file, `image not found: ${f}`);
  }
  Object.keys(data).filter((k) => !PROJECT_KEYS.has(k)).forEach((k) => warn(proj.file, `unknown frontmatter key "${k}"`));
  checkBody(proj, { isDraft: false });
}

const aboutFile = path.join(PUBLIC_DIR, 'about', 'about.md');
if (!fs.existsSync(aboutFile)) {
  errors.push('public/about/about.md is missing');
} else {
  const raw = fs.readFileSync(aboutFile, 'utf8');
  const gallery = raw.match(/^gallery:\n((?:\s+-\s+.+\n)+)/m)?.[1].split('\n').map((l) => l.replace(/^\s+-\s+/, '').trim()).filter(Boolean) || [];
  gallery.forEach((g) => { if (!fs.existsSync(path.join(PUBLIC_DIR, 'about', g))) err(aboutFile, `image not found: ${g}`); });
}

warnings.forEach((w) => console.warn(`⚠️  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`❌ ${e}`));
  console.error(`\nContent validation failed: ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`✅ Content OK: ${visiblePosts.size} published post(s), ${posts.length - visiblePosts.size} excluded, ${drafts.length} draft(s), ${projects.length} project(s)${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`);
