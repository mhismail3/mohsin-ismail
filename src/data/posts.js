import { parseDate } from '../utils/formatDate';
import {
  parseFrontmatter,
  stripMarkdown,
  DOMPurify,
  marked,
  SANITIZE_CONFIG_POSTS,
} from '../utils/markdown';

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

/**
 * Generate a URL-friendly slug from heading text.
 * Handles special characters, emojis, and multiple headings with same text.
 */
const generateHeadingId = (text, existingIds = new Set()) => {
  // Strip markdown formatting from heading text
  const cleanText = text
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1') // Links → just the link text
    .replace(/`([^`]*)`/g, '$1')              // Inline code → just the code text
    .replace(/[*_~]/g, '')                    // Remove emphasis markers
    .trim();
  
  // Generate base slug
  let baseSlug = cleanText
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove non-word chars except spaces and hyphens
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Collapse multiple hyphens
    .replace(/^-|-$/g, '');     // Trim leading/trailing hyphens
  
  // Fallback for empty slugs (e.g., emoji-only headings)
  if (!baseSlug) {
    baseSlug = 'section';
  }
  
  // Ensure uniqueness by appending number if needed
  let slug = baseSlug;
  let counter = 1;
  while (existingIds.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  existingIds.add(slug);
  
  return slug;
};

/**
 * Extract headings from markdown content for Table of Contents.
 * Only extracts headings from main content, skipping:
 * - Fenced code blocks (```...```)
 * - Blockquotes (lines starting with >)
 * - Indented code blocks (4+ spaces at start)
 * Returns array of { level, text, id } objects.
 */
const extractHeadings = (markdown) => {
  const headings = [];
  const existingIds = new Set();
  
  // First, remove fenced code blocks to avoid matching headings inside them
  // This handles ```language ... ``` blocks
  let cleanedMarkdown = markdown.replace(/```[\s\S]*?```/g, '');
  
  // Remove indented code blocks (lines starting with 4+ spaces or tab)
  // Process line by line to handle this correctly
  cleanedMarkdown = cleanedMarkdown
    .split('\n')
    .filter(line => {
      // Skip lines that are part of blockquotes (start with >)
      if (line.trimStart().startsWith('>')) return false;
      // Skip indented code blocks (4+ spaces or tab at start)
      if (/^(\s{4,}|\t)/.test(line)) return false;
      return true;
    })
    .join('\n');
  
  // Match markdown headings: ## Heading or ### Heading
  // Only match h2 and h3 for TOC (h1 is the post title)
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  
  let match;
  while ((match = headingRegex.exec(cleanedMarkdown)) !== null) {
    const level = match[1].length; // 2 for ##, 3 for ###
    const text = match[2].trim();
    const id = generateHeadingId(text, existingIds);
    
    headings.push({ level, text, id });
  }
  
  return headings;
};

/**
 * Add ID attributes to heading elements in parsed HTML.
 * Uses the pre-extracted headings to ensure consistent IDs.
 */
const addHeadingIds = (html, headings) => {
  if (!headings.length) return html;
  
  let headingIndex = 0;
  
  // Replace h2 and h3 tags with versions that include id attribute
  return html.replace(/<(h[23])>([^<]+)<\/h[23]>/g, (match, tag, content) => {
    if (headingIndex >= headings.length) return match;
    
    const heading = headings[headingIndex];
    headingIndex++;
    
    return `<${tag} id="${heading.id}">${content}</${tag}>`;
  });
};

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

/**
 * Extract inline footnotes from markdown and replace with placeholders.
 * Footnote syntax: ^[footnote text here]
 * The text inside brackets can contain inline markdown (emphasis, code, links).
 * Uses a bracket-balancing approach to handle nested brackets properly.
 * Skips footnotes inside inline code (backticks) to avoid incorrect processing.
 * Returns { processedContent, footnotes }
 */
const extractFootnotes = (markdown) => {
  const footnotes = [];
  
  // First, protect inline code by replacing backtick content with placeholders
  const inlineCodePlaceholders = [];
  let protectedMarkdown = markdown.replace(/`([^`]+)`/g, (match) => {
    const index = inlineCodePlaceholders.length;
    inlineCodePlaceholders.push(match);
    return `\x00INLINECODE${index}\x00`;
  });
  
  // Helper to restore inline code placeholders in a string
  const restoreInlineCode = (str) => {
    return str.replace(/\x00INLINECODE(\d+)\x00/g, (match, indexStr) => {
      const idx = parseInt(indexStr, 10);
      return inlineCodePlaceholders[idx] || match;
    });
  };
  
  // Now process footnotes with bracket-balancing
  let result = '';
  let i = 0;
  
  while (i < protectedMarkdown.length) {
    // Look for ^[
    if (protectedMarkdown[i] === '^' && protectedMarkdown[i + 1] === '[') {
      // Found start of footnote, now find matching ]
      let depth = 1;
      let j = i + 2;
      let content = '';
      
      while (j < protectedMarkdown.length && depth > 0) {
        if (protectedMarkdown[j] === '[') {
          depth++;
          content += protectedMarkdown[j];
        } else if (protectedMarkdown[j] === ']') {
          depth--;
          if (depth > 0) {
            content += protectedMarkdown[j];
          }
        } else {
          content += protectedMarkdown[j];
        }
        j++;
      }
      
      if (depth === 0) {
        // Successfully found matching bracket
        const index = footnotes.length;
        // Restore inline code in footnote content before storing
        const restoredContent = restoreInlineCode(content.trim());
        
        footnotes.push({
          content: restoredContent,
          number: index + 1,
        });
        
        // Add placeholder span with a unique class for easy selection
        result += `<span class="footnote-placeholder" data-footnote="${index}" data-content="${encodeURIComponent(restoredContent)}"></span>`;
        i = j;
      } else {
        // No matching bracket, keep as-is
        result += protectedMarkdown[i];
        i++;
      }
    } else {
      result += protectedMarkdown[i];
      i++;
    }
  }
  
  // Restore inline code placeholders in the main content
  result = restoreInlineCode(result);
  
  return { processedContent: result, footnotes };
};

const posts = Object.entries(rawPosts).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw);
  
  // Extract slug from folder name: ../../public/posts/{slug}/post.md
  const pathParts = path.split('/');
  const slug = pathParts[pathParts.length - 2] ?? 'post';
  
  // Base path for resolving relative images in this post
  const basePath = `/posts/${slug}`;
  
  // Extract headings for Table of Contents (before any processing)
  const headings = extractHeadings(content);
  
  // Extract code blocks before parsing markdown
  const { processedContent: contentAfterCode, codeBlocks } = extractCodeBlocks(content);
  
  // Extract images and resolve paths
  const { processedContent: contentAfterImages, images } = extractImages(contentAfterCode, basePath);
  
  // Extract inline footnotes
  const { processedContent: contentAfterFootnotes, footnotes } = extractFootnotes(contentAfterImages);
  
  // Parse markdown (code blocks, images, and footnotes are now placeholders)
  let html = DOMPurify.sanitize(marked.parse(contentAfterFootnotes), SANITIZE_CONFIG_POSTS);
  
  // Add IDs to headings for anchor linking
  html = addHeadingIds(html, headings);

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
    footnotes,
    headings,
    enableTableOfContents: data.enableTableOfContents === true,
    basePath,
  };
}).sort((a, b) => b.dateValue.getTime() - a.dateValue.getTime());

export const uniqueTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort(
  (a, b) => a.localeCompare(b),
);

export default posts;
