import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePageTitle, useTouchHover, useTapFeedback, useInternalLinkNavigation, useShimmerFollow } from '../hooks';
import { posts } from '../data';
import { formatDateParts } from '../utils/formatDate';
import { AboutPanel, CodeBlock, FootnotePopupManager, Lightbox, PostImage, TableOfContents } from '../components/features';
import { Pill } from '../components/ui';

/**
 * Component that renders post content with CodeBlock, PostImage, and Footnotes.
 * Footnotes are injected as DOM elements and managed without causing re-renders.
 */
const PostContent = ({ html, codeBlocks, images, footnotes, onImageClick }) => {
  const { handleLinkClick } = useInternalLinkNavigation();
  const { containerRef } = useTouchHover({
    selector: '.post-image img',
    hoverClass: 'touch-hover',
  });
  const contentRef = useRef(null);
  const popupManagerRef = useRef(null);
  const buttonsInjectedRef = useRef(false);

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
            parts.push({ type: 'codeblock', language: codeBlock.language, code: codeBlock.code, key: `code-${index}` });
          }
          return;
        }
        
        if (el.hasAttribute('data-postimage')) {
          const index = parseInt(el.getAttribute('data-postimage'), 10);
          const image = images?.[index];
          if (image) {
            parts.push({ type: 'postimage', src: image.src, caption: image.caption, key: `image-${index}` });
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

  // Inject footnote buttons after render - using useLayoutEffect to run synchronously
  useEffect(() => {
    if (!contentRef.current || !footnotes?.length) return;
    
    const injectButtons = () => {
      const placeholders = contentRef.current.querySelectorAll('.footnote-placeholder[data-footnote]');
      
      placeholders.forEach((span) => {
        // Skip if already has a button
        if (span.querySelector('.footnote-trigger')) return;
        
        const index = parseInt(span.getAttribute('data-footnote'), 10);
        const footnote = footnotes[index];
        if (!footnote) return;
        
        const button = document.createElement('button');
        button.className = 'footnote-trigger';
        button.setAttribute('type', 'button');
        button.setAttribute('data-footnote-index', String(index));
        button.setAttribute('aria-label', `Footnote ${footnote.number}`);
        button.innerHTML = `<span class="footnote-trigger-number">${footnote.number}</span>`;
        
        span.appendChild(button);
      });
      
      buttonsInjectedRef.current = true;
    };
    
    // Run immediately
    injectButtons();
    
    // Also set up a MutationObserver to re-inject if DOM changes
    const observer = new MutationObserver(() => {
      // Check if buttons still exist
      const existingButtons = contentRef.current?.querySelectorAll('.footnote-trigger');
      if (!existingButtons?.length && buttonsInjectedRef.current) {
        injectButtons();
      }
    });
    
    observer.observe(contentRef.current, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, [contentParts, footnotes]);

  // Handle footnote trigger clicks and internal link navigation via event delegation
  const handleClick = useCallback((e) => {
    // Check for internal link clicks first - if navigation occurred, stop processing
    if (handleLinkClick(e)) {
      return;
    }
    
    const trigger = e.target.closest('.footnote-trigger');
    if (!trigger) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const index = parseInt(trigger.getAttribute('data-footnote-index'), 10);
    const footnote = footnotes?.[index];
    if (!footnote || !popupManagerRef.current) return;
    
    // Check if we're clicking the currently active trigger (toggle close)
    const isClickingActiveTrigger = popupManagerRef.current.getActiveTrigger() === trigger;
    
    // If clicking the same trigger that's currently open, just close it
    if (isClickingActiveTrigger) {
      popupManagerRef.current.hide();
      return;
    }
    
    // Otherwise, open the new popup (show() handles cleanup of any existing popup)
    // Calculate position with iOS Safari safe area support
    const rect = trigger.getBoundingClientRect();
    // Use clientWidth for more reliable viewport width (excludes scrollbar, more consistent on iOS)
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    
    // Get safe area insets from CSS custom properties (set in tokens.css)
    const computedStyle = getComputedStyle(document.documentElement);
    const safeLeft = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10) || 0;
    const safeRight = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10) || 0;
    
    // Available width accounting for safe areas and padding
    const padding = 12;
    const availableWidth = viewportWidth - safeLeft - safeRight - (padding * 2);
    const popupWidth = Math.min(320, availableWidth);
    
    // Calculate left position - center on trigger, then constrain to viewport
    const triggerCenter = rect.left + rect.width / 2;
    const minLeft = safeLeft + padding;
    const maxLeft = viewportWidth - safeRight - padding - popupWidth;
    
    // Constrain left position so popup stays within bounds
    let left = Math.max(minLeft, Math.min(maxLeft, triggerCenter - popupWidth / 2));
    
    // Vertical positioning
    const spaceBelow = viewportHeight - rect.bottom;
    let placement = 'below';
    let top = rect.bottom + 8;
    
    if (spaceBelow < 150 && rect.top > spaceBelow) {
      placement = 'above';
      top = rect.top - 8;
    }
    
    // Add active class
    trigger.classList.add('footnote-trigger--active');
    
    // Show popup
    popupManagerRef.current.show({
      index,
      content: footnote.content,
      number: footnote.number,
      position: { top, left, placement, width: popupWidth },
      triggerElement: trigger,
    });
  }, [footnotes, handleLinkClick]);

  return (
    <>
      <div 
        ref={(el) => { containerRef.current = el; contentRef.current = el; }} 
        className="post-body full-content"
        onClick={handleClick}
      >
        {contentParts.map((part) => {
          if (part.type === 'codeblock') {
            return <CodeBlock key={part.key} code={part.code} language={part.language} maxLines={12} />;
          }
          if (part.type === 'postimage') {
            return <PostImage key={part.key} src={part.src} caption={part.caption} onClick={onImageClick} />;
          }
          return <div key={part.key} dangerouslySetInnerHTML={{ __html: part.content }} />;
        })}
      </div>
      
      {/* Popup manager lives outside the content to avoid re-render issues */}
      <FootnotePopupManager ref={popupManagerRef} />
    </>
  );
};

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const postIndex = posts.findIndex((p) => p.slug === slug);
  const post = postIndex !== -1 ? posts[postIndex] : null;
  const [selectedImage, setSelectedImage] = useState(null);
  const { getTapProps } = useTapFeedback();
  const { shimmerRef, shimmerHandlers } = useShimmerFollow();

  const prevPost = postIndex !== -1 && postIndex < posts.length - 1 ? posts[postIndex + 1] : null;
  const nextPost = postIndex !== -1 && postIndex > 0 ? posts[postIndex - 1] : null;

  usePageTitle(
    post ? `${post.title} - Mohsin Ismail` : 'Post Not Found - Mohsin Ismail',
    { scrollToTop: true, scrollBehavior: 'auto' }
  );

  if (!post) {
    return (
      <div className="frame">
        {/* Header is rendered at App level - outside PageTransition to prevent flicker */}
        <section className="panel">
          <div className="eyebrow">404</div>
          <h2>Post not found</h2>
          <Link to="/" className="btn outline">Return Home</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="frame">
      {/* Header is rendered at App level - outside PageTransition to prevent flicker */}

      <article className="panel post-page">
        <div className="post-page-head">
          <Link to="/blog" className="back-link" {...getTapProps()}>← All Posts</Link>
          <div className="eyebrow">
            {(() => {
              const { datePart, timePart } = formatDateParts(post.date);
              return <>{datePart}<span className="eyebrow-dot">•</span>{timePart}</>;
            })()}
          </div>
          <h1 
            ref={shimmerRef}
            className="post-title"
            {...shimmerHandlers}
          >{post.title}</h1>
          
          {/* Table of Contents - only shown if explicitly enabled in frontmatter */}
          {post.enableTableOfContents && <TableOfContents headings={post.headings} />}
        </div>

        <PostContent
          html={post.content}
          codeBlocks={post.codeBlocks}
          images={post.images}
          footnotes={post.footnotes}
          onImageClick={setSelectedImage}
        />

        <div className="tag-row post-tags">
          {post.tags.map((tag) => (
            <Pill key={tag} size="small" onClick={() => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}>
              #{tag}
            </Pill>
          ))}
        </div>

        <div className="post-footer">
          <nav className="post-nav">
            {prevPost ? (
              <Link to={`/posts/${prevPost.slug}`} className="post-nav-link post-nav-prev" {...getTapProps()}>
                <span className="post-nav-label">← Previous Post</span>
                <span className="post-nav-title">{prevPost.title}</span>
              </Link>
            ) : <div className="post-nav-spacer" />}
            {nextPost ? (
              <Link to={`/posts/${nextPost.slug}`} className="post-nav-link post-nav-next" {...getTapProps()}>
                <span className="post-nav-label">Next Post →</span>
                <span className="post-nav-title">{nextPost.title}</span>
              </Link>
            ) : <div className="post-nav-spacer" />}
          </nav>
        </div>
      </article>

      <Lightbox src={selectedImage} alt="Full size view" onClose={() => setSelectedImage(null)} />
      <AboutPanel />
    </div>
  );
};

export default PostPage;
