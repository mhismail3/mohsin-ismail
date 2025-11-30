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

const rawPosts = import.meta.glob('../../public/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const sanitizeConfig = {
  ADD_TAGS: ['iframe', 'div'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'src', 'title', 'data-code', 'data-language', 'data-codeblock'],
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
 * ~80 chars per line × 4 lines = ~320 chars, using 400 for safety.
 * Always built from actual content, never frontmatter summary.
 */
const buildExcerpt = (content = '') => {
  const cleaned = stripMarkdown(content);
  // Return enough text for 4 lines with some buffer
  return cleaned.slice(0, 400);
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

const posts = Object.entries(rawPosts).map(([path, raw]) => {
  const { data, content } = matter(raw);
  const slug = path.split('/').pop()?.replace('.md', '') ?? 'post';
  
  // Extract code blocks before parsing markdown
  const { processedContent, codeBlocks } = extractCodeBlocks(content);
  
  // Parse markdown (code blocks are now placeholders)
  const html = DOMPurify.sanitize(marked.parse(processedContent), sanitizeConfig);

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    dateValue: parseDate(data.date),
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: buildExcerpt(content),
    content: html,
    codeBlocks,
  };
}).sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

export const uniqueTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort(
  (a, b) => a.localeCompare(b),
);

export default posts;



