import DOMPurify from 'dompurify';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Buffer } from 'buffer';

// Polyfill Buffer for gray-matter in browser
if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

// Configure marked for project descriptions
marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false,
});

const sanitizeConfig = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'src', 'title'],
};

// Import all markdown files from the projects directory
const rawProjects = import.meta.glob('../projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const parseDate = (value) => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const portfolioProjects = Object.entries(rawProjects).map(([path, raw]) => {
  const { data, content } = matter(raw);
  
  // Extract slug from filename if not provided in frontmatter
  const fileSlug = path.split('/').pop()?.replace('.md', '') ?? 'project';
  const slug = data.slug || fileSlug;
  
  // Parse markdown content to HTML
  const description = DOMPurify.sanitize(marked.parse(content), sanitizeConfig);
  
  // Build image paths from the public/projects/{slug}/ directory
  const basePath = `/projects/${slug}`;
  const cover = data.cover ? `${basePath}/${data.cover}` : null;
  const gallery = Array.isArray(data.gallery) 
    ? data.gallery.map((img) => `${basePath}/${img}`)
    : [];

  return {
    slug,
    title: data.title || fileSlug,
    date: data.date ? new Date(data.date).getFullYear().toString() : new Date().getFullYear().toString(),
    dateValue: parseDate(data.date),
    summary: data.summary || '',
    description,
    github: data.github || null,
    live: data.live || null,
    image: cover,
    gallery,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status || null,
  };
}).sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

export default portfolioProjects;
