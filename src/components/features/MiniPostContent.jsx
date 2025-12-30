import React, { useMemo, useRef, useEffect } from 'react';
import { useTouchHover, useInternalLinkNavigation } from '../../hooks';
import CodeBlock from './CodeBlock';
import PostImage from './PostImage';

/**
 * Lightweight content renderer for mini (commentary) posts.
 * Simplified version of PostContent without lightbox/footnote popup management.
 * Renders inline within PostCard when expanded.
 */
const MiniPostContent = ({ post }) => {
  const { handleLinkClick } = useInternalLinkNavigation();
  const { containerRef } = useTouchHover({
    selector: '.post-image img',
    hoverClass: 'touch-hover',
  });
  const contentRef = useRef(null);

  const { content: html, codeBlocks, images, footnotes } = post;

  // Parse HTML and find code block / image placeholders
  const contentParts = useMemo(() => {
    if (!html) return [];

    const parts = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;

        if (el.hasAttribute('data-codeblock')) {
          const index = parseInt(el.getAttribute('data-codeblock'), 10);
          const codeBlock = codeBlocks[index];
          if (codeBlock) {
            parts.push({
              type: 'codeblock',
              language: codeBlock.language,
              code: codeBlock.code,
              key: `code-${index}`,
            });
          }
          return;
        }

        if (el.hasAttribute('data-postimage')) {
          const index = parseInt(el.getAttribute('data-postimage'), 10);
          const image = images?.[index];
          if (image) {
            parts.push({
              type: 'postimage',
              src: image.src,
              caption: image.caption,
              key: `image-${index}`,
            });
          }
          return;
        }
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        parts.push({ type: 'html', content: node.outerHTML, key: `html-${parts.length}` });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        parts.push({ type: 'html', content: node.textContent, key: `text-${parts.length}` });
      }
    };

    body.childNodes.forEach(processNode);
    return parts;
  }, [html, codeBlocks, images]);

  // Inject simple footnote markers (no popup, just superscript numbers with title tooltip)
  useEffect(() => {
    if (!contentRef.current || !footnotes?.length) return;

    const placeholders = contentRef.current.querySelectorAll('.footnote-placeholder[data-footnote]');

    placeholders.forEach((span) => {
      // Skip if already processed
      if (span.querySelector('.footnote-marker')) return;

      const index = parseInt(span.getAttribute('data-footnote'), 10);
      const footnote = footnotes[index];
      if (!footnote) return;

      // Create a simple superscript marker with tooltip
      const marker = document.createElement('sup');
      marker.className = 'footnote-marker';
      marker.textContent = footnote.number;
      marker.title = footnote.content;

      span.appendChild(marker);
    });
  }, [contentParts, footnotes]);

  const handleClick = (e) => {
    handleLinkClick(e);
  };

  return (
    <span
      ref={(el) => {
        containerRef.current = el;
        contentRef.current = el;
      }}
      className="post-body mini-post-body"
      onClick={handleClick}
    >
      {contentParts.map((part, index) => {
        if (part.type === 'codeblock') {
          return (
            <CodeBlock
              key={part.key}
              code={part.code}
              language={part.language}
              maxLines={8}
            />
          );
        }
        if (part.type === 'postimage') {
          return (
            <PostImage
              key={part.key}
              src={part.src}
              caption={part.caption}
            />
          );
        }
        // First HTML part renders inline (no wrapper), rest get span wrappers
        // This allows the first paragraph to flow with the title
        return (
          <span
            key={part.key}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </span>
  );
};

export default MiniPostContent;
