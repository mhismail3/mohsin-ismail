import DOMPurify from 'dompurify';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Buffer } from 'buffer';

if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false,
});

const rawPosts = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const sanitizeConfig = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'src', 'title'],
};

const stripMarkdown = (text = '') =>
  text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildExcerpt = (content = '') => {
  const cleaned = stripMarkdown(content);
  return cleaned.length > 180 ? `${cleaned.slice(0, 180)}…` : cleaned;
};

const parseDate = (value) => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const posts = Object.entries(rawPosts).map(([path, raw]) => {
  const { data, content } = matter(raw);
  const slug = path.split('/').pop()?.replace('.md', '') ?? 'post';
  const html = DOMPurify.sanitize(marked.parse(content), sanitizeConfig);

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    dateValue: parseDate(data.date),
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary || buildExcerpt(content),
    content: html,
  };
}).sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

export const uniqueTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort(
  (a, b) => a.localeCompare(b),
);

export default posts;
