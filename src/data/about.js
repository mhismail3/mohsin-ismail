import { parseFrontmatter, parseMarkdown, SANITIZE_CONFIG_BASIC } from '../utils/markdown';

// Import the about.md file
const rawAbout = import.meta.glob('../../public/about/about.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Get the raw content (there's only one file)
const raw = Object.values(rawAbout)[0] || '';
const { data, content } = parseFrontmatter(raw);

// Parse markdown content to HTML
const html = parseMarkdown(content, SANITIZE_CONFIG_BASIC);

// Build gallery paths
const gallery = Array.isArray(data.gallery)
  ? data.gallery.map((item) => `/about/${item}`)
  : [];

const aboutContent = {
  content: html,
  gallery,
};

export default aboutContent;
