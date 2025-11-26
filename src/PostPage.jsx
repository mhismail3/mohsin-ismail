import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import posts from './posts';
import Header from './components/Header';
import AboutPanel from './components/AboutPanel';
import CodeBlock from './components/CodeBlock';
import { formatDate } from './utils';

/**
 * Component that renders post content with CodeBlock components
 * replacing the placeholder divs
 */
const PostContent = ({ html, codeBlocks, onImageClick }) => {
  const containerRef = useRef(null);
  const touchStateRef = useRef({ timer: null, startX: 0, startY: 0, activeEl: null });

  // Parse HTML and find code block placeholders
  const contentParts = useMemo(() => {
    if (!html) return [];
    
    const parts = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;
    
    // Process all child nodes
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
      }
      
      // For other nodes, get the outer HTML
      if (node.nodeType === Node.ELEMENT_NODE) {
        parts.push({
          type: 'html',
          content: node.outerHTML,
          key: `html-${parts.length}`,
        });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        parts.push({
          type: 'html',
          content: node.textContent,
          key: `text-${parts.length}`,
        });
      }
    };
    
    body.childNodes.forEach(processNode);
    return parts;
  }, [html, codeBlocks]);

  // Touch handling for images
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const state = touchStateRef.current;
    const HOLD_DELAY = 120;
    const MOVE_THRESHOLD = 10;

    const clearTouchState = () => {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      if (state.activeEl) {
        state.activeEl.classList.remove('touch-hover');
        state.activeEl = null;
      }
    };

    const handleTouchStart = (e) => {
      if (e.target.tagName !== 'IMG') return;
      const touch = e.touches[0];
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.activeEl = e.target;
      
      state.timer = setTimeout(() => {
        if (state.activeEl) {
          state.activeEl.classList.add('touch-hover');
        }
      }, HOLD_DELAY);
    };

    const handleTouchMove = (e) => {
      if (!state.timer && !state.activeEl?.classList.contains('touch-hover')) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - state.startX);
      const dy = Math.abs(touch.clientY - state.startY);
      
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        clearTouchState();
      }
    };

    const handleTouchEnd = () => {
      clearTouchState();
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      clearTouchState();
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const handleClick = (e) => {
    if (e.target.tagName === 'IMG') {
      onImageClick(e.target.src);
    }
  };

  return (
    <div ref={containerRef} className="post-body full-content" onClick={handleClick}>
      {contentParts.map((part) => {
        if (part.type === 'codeblock') {
          return (
            <CodeBlock
              key={part.key}
              code={part.code}
              language={part.language}
              maxLines={12}
            />
          );
        }
        return (
          <div
            key={part.key}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </div>
  );
};

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Mohsin Ismail`;
    } else {
      document.title = 'Post Not Found - Mohsin Ismail';
    }
    window.scrollTo(0, 0);
  }, [post]);

  if (!post) {
    return (
      <div className="frame">
        <Header label="Mohsin Ismail" onLogoClick={() => navigate('/')} />
        <section className="panel">
          <div className="eyebrow">404</div>
          <h2>Post not found</h2>
          <Link to="/" className="btn outline">
            Return Home
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" onLogoClick={() => navigate('/')} />

      <article className="panel post-page">
        <div className="post-page-head">
          <Link to="/" className="back-link">
            ← All Posts
          </Link>
          <div className="eyebrow">{formatDate(post.date)}</div>
          <h1 className="post-title">{post.title}</h1>
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span key={tag} className="pill small disabled">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <PostContent
          html={post.content}
          codeBlocks={post.codeBlocks}
          onImageClick={setSelectedImage}
        />

        <div className="post-footer">
          <Link to="/" className="back-link">
            ← All Posts
          </Link>
        </div>
      </article>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size view" />
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}

      <AboutPanel />
    </div>
  );
};

export default PostPage;
