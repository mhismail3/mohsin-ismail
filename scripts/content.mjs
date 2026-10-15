/**
 * Node-side content loader shared by build scripts (validate-content, prerender-meta).
 * Mirrors the rules in src/data/posts.js and src/data/portfolioProjects.js:
 *   - posts:    public/posts/{slug}/post.md   (published unless `exclude: true`)
 *   - drafts:   drafts/{slug}/post.md         (dev server only, never built)
 *   - projects: public/projects/{slug}/project.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const DRAFTS_DIR = path.join(ROOT_DIR, 'drafts');

const listDirs = (dir) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : []);

/** Parse a markdown file; throws with the file path on bad frontmatter. */
export function readMarkdown(file) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    const { data, content } = matter(raw);
    return { data, content };
  } catch (err) {
    throw new Error(`${path.relative(ROOT_DIR, file)}: invalid frontmatter (${err.message})`);
  }
}

function loadPostsFrom(dir, { draft }) {
  return listDirs(dir)
    .filter((slug) => fs.existsSync(path.join(dir, slug, 'post.md')))
    .map((slug) => {
      const file = path.join(dir, slug, 'post.md');
      const { data, content } = readMarkdown(file);
      return { slug, file, dir: path.join(dir, slug), data, content, draft, excluded: data.exclude === true };
    });
}

export const loadPosts = () => loadPostsFrom(path.join(PUBLIC_DIR, 'posts'), { draft: false });
export const loadDrafts = () => loadPostsFrom(DRAFTS_DIR, { draft: true });
/** Posts that get a public URL. */
export const publishedPosts = () => loadPosts().filter((p) => !p.excluded);

export function loadProjects() {
  const dir = path.join(PUBLIC_DIR, 'projects');
  return listDirs(dir)
    .filter((folder) => fs.existsSync(path.join(dir, folder, 'project.md')))
    .map((folder) => {
      const file = path.join(dir, folder, 'project.md');
      const { data, content } = readMarkdown(file);
      return { slug: data.slug || folder, folder, file, dir: path.join(dir, folder), data, content };
    });
}

/** Mini posts have no title; use a short excerpt so page titles never show the raw slug. */
export function postTitle(post, excerptFn) {
  if (post.data.title) return String(post.data.title);
  if (post.data.type === 'mini') {
    const text = excerptFn(post.content, 60);
    return text || 'Note';
  }
  return post.slug;
}
