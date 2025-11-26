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

const buildExcerpt = (content = '') => {
  const cleaned = stripMarkdown(content);
  return cleaned.length > 180 ? `${cleaned.slice(0, 180)}…` : cleaned;
};

const parseDate = (value) => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
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
  
  // Parse tldr field if present (it's markdown too)
  const tldrHtml = data.tldr 
    ? DOMPurify.sanitize(marked.parse(data.tldr), sanitizeConfig)
    : null;

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    dateValue: parseDate(data.date),
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary || buildExcerpt(content),
    tldr: tldrHtml,
    content: html,
    codeBlocks,
  };
}).sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

export const uniqueTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort(
  (a, b) => a.localeCompare(b),
);

export default posts;
