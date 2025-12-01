import DOMPurify from 'dompurify';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Buffer } from 'buffer';
import { parseDate } from '../utils/formatDate';

if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false,
});

// Posts now live in folders: /public/posts/{slug}/post.md
// Images can be placed alongside: /public/posts/{slug}/image.png
const rawPosts = import.meta.glob('../../public/posts/*/post.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const sanitizeConfig = {
  ADD_TAGS: ['iframe', 'div', 'figure', 'figcaption'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'src', 'title', 'data-code', 'data-language', 'data-codeblock', 'data-postimage', 'data-src', 'data-caption'],
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

/**
 * Build an excerpt from post content for 4-line preview.
 * CSS constrains display to 4 lines via max-height - we provide MORE text
 * than needed so the 4th line is always fully filled when content exists.
 * ~120 chars per line × 4 lines = ~480 chars minimum; using 800 to ensure
 * the CSS constraint (not character limit) determines the cutoff point.
 */
const buildExcerpt = (content = '') => {
  const cleaned = stripMarkdown(content);
  // Provide generous text so CSS max-height becomes the limiting factor
  return cleaned.slice(0, 800);
};

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

/**
 * Extract images from markdown and replace with placeholders.
 * Stores image data (src, alt/caption) for later rendering with PostImage component.
 * Returns { processedContent, images }
 */
const extractImages = (markdown, basePath) => {
  const images = [];
  // Match markdown images: ![alt text](path)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  const processedContent = markdown.replace(imageRegex, (match, alt, src) => {
    const index = images.length;
    
    // Resolve relative paths to the post's folder
    // If src doesn't start with http/https or /, it's relative to the post folder
    let resolvedSrc = src;
    if (!src.startsWith('http') && !src.startsWith('/')) {
      resolvedSrc = `${basePath}/${src}`;
    }
    
    images.push({
      src: resolvedSrc,
      caption: alt.trim(),
    });
    
    // Return a placeholder div that we'll replace with PostImage component
    return `<div data-postimage="${index}" data-src="${encodeURIComponent(resolvedSrc)}" data-caption="${encodeURIComponent(alt.trim())}"></div>`;
  });
  
  return { processedContent, images };
};

const posts = Object.entries(rawPosts).map(([path, raw]) => {
  const { data, content } = matter(raw);
  
  // Extract slug from folder name: ../../public/posts/{slug}/post.md
  const pathParts = path.split('/');
  const slug = pathParts[pathParts.length - 2] ?? 'post';
  
  // Base path for resolving relative images in this post
  const basePath = `/posts/${slug}`;
  
  // Extract code blocks before parsing markdown
  const { processedContent: contentAfterCode, codeBlocks } = extractCodeBlocks(content);
  
  // Extract images and resolve paths
  const { processedContent: contentAfterImages, images } = extractImages(contentAfterCode, basePath);
  
  // Parse markdown (code blocks and images are now placeholders)
  const html = DOMPurify.sanitize(marked.parse(contentAfterImages), sanitizeConfig);

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    dateValue: parseDate(data.date),
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: buildExcerpt(content),
    content: html,
    codeBlocks,
    images,
    basePath,
  };
}).sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

export const uniqueTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort(
  (a, b) => a.localeCompare(b),
);

export default posts;



