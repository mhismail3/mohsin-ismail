import DOMPurify from 'dompurify';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Buffer } from 'buffer';

// Polyfill Buffer for gray-matter in browser
if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false,
});

const sanitizeConfig = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'src', 'title', 'target', 'rel'],
};

// Import the about.md file
const rawAbout = import.meta.glob('../../public/about/about.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Get the raw content (there's only one file)
const raw = Object.values(rawAbout)[0] || '';
const { data, content } = matter(raw);

// Parse markdown content to HTML
const html = DOMPurify.sanitize(marked.parse(content), sanitizeConfig);

// Build gallery paths
const gallery = Array.isArray(data.gallery)
  ? data.gallery.map((item) => `/about/${item}`)
  : [];

const aboutContent = {
  content: html,
  gallery,
};

export default aboutContent;
