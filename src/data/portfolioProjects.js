import { parseDate, formatShortDate } from '../utils/formatDate';
import { parseFrontmatter, parseMarkdown, SANITIZE_CONFIG_BASIC } from '../utils/markdown';

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
  
  // Parse markdown content to HTML
  const description = parseMarkdown(content, SANITIZE_CONFIG_BASIC);
  
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
