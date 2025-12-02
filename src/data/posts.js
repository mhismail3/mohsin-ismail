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

/**
 * Custom blockquote renderer that detects and styles attributions.
 * 
 * Attribution format: Lines starting with — (em-dash), – (en-dash), or -- (double dash)
 * 
 * Supported patterns:
 * - `— Author Name`
 * - `— Author Name, *Source Title*`
 * - `— Author Name, *Source Title*, additional info`
 * 
 * Creates semantic HTML structure:
 * <blockquote class="attributed-quote">
 *   <div class="quote-text">...</div>
 *   <footer class="quote-attribution">
 *     <cite class="quote-author">Author Name</cite>
 *     <span class="quote-source">Source Title</span>
 *     <span class="quote-context">additional info</span>
 *   </footer>
 * </blockquote>
 */
const blockquoteRenderer = {
  blockquote(token) {
    // Get the raw text content to check for attribution
    const rawText = token.raw || '';
    
    // Check if there's an attribution line (starts with em-dash, en-dash, or --)
    const attributionMatch = rawText.match(/^>\s*(?:—|–|--)\s*(.+)$/m);
    
    if (!attributionMatch) {
      // No attribution, render normally
      const body = this.parser.parse(token.tokens);
      return `<blockquote>\n${body}</blockquote>\n`;
    }
    
    // Extract the attribution line
    const attributionLine = attributionMatch[1].trim();
    
    // Parse the attribution: "Author Name, *Source*, context"
    // First, extract italic parts (source/work titles)
    const italicMatch = attributionLine.match(/\*([^*]+)\*/);
    const source = italicMatch ? italicMatch[1].trim() : null;
    
    // Remove the italic part to get remaining text
    const withoutItalics = attributionLine.replace(/\*[^*]+\*/g, '|||PLACEHOLDER|||');
    const parts = withoutItalics.split(',').map(p => p.trim());
    
    // First part is always the author
    const author = parts[0].replace('|||PLACEHOLDER|||', '').trim();
    
    // Check for additional context (parts after source)
    let context = '';
    if (parts.length > 1) {
      // Find parts that aren't the placeholder (source was there)
      const contextParts = parts.slice(1).filter(p => p !== '|||PLACEHOLDER|||' && p !== '');
      if (contextParts.length > 0) {
        context = contextParts.join(', ').trim();
      }
    }
    
    // Filter out the attribution line from tokens
    const filteredTokens = token.tokens.filter(t => {
      if (t.type === 'paragraph' && t.raw) {
        const trimmed = t.raw.trim();
        return !trimmed.match(/^(?:—|–|--)\s*/);
      }
      return true;
    });
    
    // Render the quote text
    const quoteText = this.parser.parse(filteredTokens);
    
    // Build the attribution footer
    let attributionHtml = `<footer class="quote-attribution">`;
    attributionHtml += `<cite class="quote-author">${author}</cite>`;
    if (source) {
      attributionHtml += `<span class="quote-source">${source}</span>`;
    }
    if (context) {
      attributionHtml += `<span class="quote-context">${context}</span>`;
    }
    attributionHtml += `</footer>`;
    
    return `<blockquote class="attributed-quote">
<div class="quote-text">${quoteText}</div>
${attributionHtml}
</blockquote>\n`;
  }
};

// Apply custom renderer
marked.use({ renderer: blockquoteRenderer });

// Posts now live in folders: /public/posts/{slug}/post.md
// Images can be placed alongside: /public/posts/{slug}/image.png
const rawPosts = import.meta.glob('../../public/posts/*/post.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const sanitizeConfig = {
  ADD_TAGS: ['iframe', 'div', 'figure', 'figcaption', 'footer', 'cite'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'src', 'title', 'data-code', 'data-language', 'data-codeblock', 'data-postimage', 'data-src', 'data-caption', 'class'],
};

const stripMarkdown = (text = '') =>
  text
    .replace(/```[\s\S]*?```/g, ' ')           // Remove code blocks
    .replace(/`([^`]*)`/g, '$1')               // Inline code → just the code text
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')      // Remove images entirely
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')   // Links → just the link text (not URL)
    .replace(/[#>*_~\-]/g, ' ')                // Remove markdown syntax chars
    .replace(/\s+/g, ' ')                      // Collapse whitespace
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



