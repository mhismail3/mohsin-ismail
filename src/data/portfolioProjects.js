import { parseDate, formatShortDate } from '../utils/formatDate';
import { parseFrontmatter, SANITIZE_CONFIG_POSTS, DOMPurify, marked } from '../utils/markdown';

/**
 * Extract code blocks from markdown and replace with placeholders.
 * Returns { processedContent, codeBlocks }
 */
const extractCodeBlocks = (markdown) => {
  const codeBlocks = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  const processedContent = markdown.replace(codeBlockRegex, (match, language, code) => {
    const index = codeBlocks.length;
    const lang = language || 'text';
    const trimmedCode = code.trim();

    codeBlocks.push({
      language: lang,
      code: trimmedCode,
    });

    // Return a placeholder div that we'll replace with CodeBlock component
    return `<div data-codeblock="${index}" data-language="${lang}" data-code="${encodeURIComponent(trimmedCode)}"></div>`;
  });

  return { processedContent, codeBlocks };
};

// Import all project.md files from public/projects/{slug}/ directories
const rawProjects = import.meta.glob('../../public/projects/*/project.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const portfolioProjects = Object.entries(rawProjects).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw);

  // Extract slug from path: ../../public/projects/{slug}/project.md
  const pathParts = path.split('/');
  const slugIndex = pathParts.indexOf('projects') + 1;
  const fileSlug = pathParts[slugIndex] || 'project';
  const slug = data.slug || fileSlug;

  // Extract code blocks before parsing markdown
  const { processedContent, codeBlocks } = extractCodeBlocks(content);

  // Parse markdown content to HTML (code blocks are now placeholders)
  const description = DOMPurify.sanitize(marked.parse(processedContent), SANITIZE_CONFIG_POSTS);
  
  // Build image paths from the /projects/{slug}/ directory (served from public)
  const basePath = `/projects/${slug}`;
  const cover = data.cover ? `${basePath}/${data.cover}` : null;
  
  // Gallery items can be either strings or objects with { src, caption }
  // Normalize to consistent format while preserving backward compatibility
  const gallery = Array.isArray(data.gallery) 
    ? data.gallery.map((item) => {
        if (typeof item === 'string') {
          return `${basePath}/${item}`;
        }
        // Object format: { src: 'filename.png', caption: 'optional caption' }
        return {
          src: `${basePath}/${item.src}`,
          caption: item.caption,
        };
      })
    : [];

  return {
    slug,
    title: data.title || fileSlug,
    date: formatShortDate(data.date),
    dateValue: parseDate(data.date),
    summary: data.summary || '',
    description,
    codeBlocks,
    github: data.github || null,
    live: data.live || null,
    image: cover,
    gallery,
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status || null,
  };
}).sort((a, b) => {
  const isArchivedA = typeof a.status === 'string' && a.status.toLowerCase() === 'archived';
  const isArchivedB = typeof b.status === 'string' && b.status.toLowerCase() === 'archived';

  if (isArchivedA && !isArchivedB) return 1;
  if (isArchivedB && !isArchivedA) return -1;

  return b.dateValue.getTime() - a.dateValue.getTime();
});

export default portfolioProjects;
