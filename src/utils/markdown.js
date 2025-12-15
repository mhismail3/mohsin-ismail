/**
 * Shared markdown processing utilities.
 * Consolidates common markdown parsing, sanitization, and Buffer polyfill.
 */

import DOMPurify from 'dompurify';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Buffer } from 'buffer';

// ─────────────────────────────────────────────────────────────────────────────
// BUFFER POLYFILL
// gray-matter requires Buffer in browser environment
// ─────────────────────────────────────────────────────────────────────────────

if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKED CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZATION CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Basic sanitization config for simple markdown content.
 * Allows iframes for embeds (YouTube, etc.)
 */
export const SANITIZE_CONFIG_BASIC = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 'src', 'title', 'target', 'rel'],
};

/**
 * Extended sanitization config for blog posts with custom components.
 * Includes support for code blocks, images, footnotes, and semantic blockquotes.
 */
export const SANITIZE_CONFIG_POSTS = {
  ADD_TAGS: ['iframe', 'div', 'figure', 'figcaption', 'footer', 'cite', 'span', 'button', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  ADD_ATTR: [
    'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading', 
    'src', 'title', 'data-code', 'data-language', 'data-codeblock', 
    'data-postimage', 'data-src', 'data-caption', 'data-footnote', 
    'data-content', 'data-number', 'class', 'aria-label', 'type', 'id',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PARSING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse frontmatter and content from raw markdown string.
 * 
 * @param {string} raw - Raw markdown with frontmatter
 * @returns {{ data: Object, content: string }} Parsed frontmatter and content
 */
export const parseFrontmatter = (raw) => {
  return matter(raw);
};

/**
 * Parse markdown content to HTML and sanitize.
 * 
 * @param {string} markdown - Markdown content
 * @param {Object} sanitizeConfig - DOMPurify configuration (default: SANITIZE_CONFIG_BASIC)
 * @returns {string} Sanitized HTML
 */
export const parseMarkdown = (markdown, sanitizeConfig = SANITIZE_CONFIG_BASIC) => {
  const html = marked.parse(markdown);
  return DOMPurify.sanitize(html, sanitizeConfig);
};

/**
 * Parse inline markdown (single line, no block elements).
 * 
 * @param {string} markdown - Inline markdown
 * @param {Object} sanitizeConfig - DOMPurify configuration
 * @returns {string} Sanitized HTML
 */
export const parseInlineMarkdown = (markdown, sanitizeConfig = SANITIZE_CONFIG_BASIC) => {
  const html = marked.parseInline(markdown);
  return DOMPurify.sanitize(html, sanitizeConfig);
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXT PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Remove footnotes from text using bracket balancing.
 * Handles nested brackets like ^[text with [link](url)]
 * 
 * @param {string} text - Text containing footnotes
 * @returns {string} Text with footnotes removed
 */
export const stripFootnotes = (text) => {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    if (text[i] === '^' && text[i + 1] === '[') {
      // Found footnote start, skip to matching ]
      let depth = 1;
      let j = i + 2;
      
      while (j < text.length && depth > 0) {
        if (text[j] === '[') depth++;
        else if (text[j] === ']') depth--;
        j++;
      }
      
      // Skip the entire footnote
      i = j;
    } else {
      result += text[i];
      i++;
    }
  }
  
  return result;
};

/**
 * Strip markdown syntax from text, returning plain text.
 * Useful for generating excerpts and search content.
 * 
 * @param {string} text - Markdown text
 * @returns {string} Plain text
 */
export const stripMarkdown = (text = '') =>
  stripFootnotes(text)                         // Remove footnotes first (handles nested brackets)
    .replace(/```[\s\S]*?```/g, ' ')           // Remove code blocks
    .replace(/`([^`]*)`/g, '$1')               // Inline code → just the code text
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')      // Remove images entirely
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')   // Links → just the link text (not URL)
    .replace(/[#>*_~\-]/g, ' ')                // Remove markdown syntax chars
    .replace(/\s+/g, ' ')                      // Collapse whitespace
    .trim();

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORTS FOR CONVENIENCE
// ─────────────────────────────────────────────────────────────────────────────

export { DOMPurify, marked, matter };
