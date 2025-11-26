import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import posts from './posts';
import Header from './components/Header';
import AboutPanel from './components/AboutPanel';
import CodeBlock from './components/CodeBlock';
import { formatDate } from './utils';

// Example code for the CodeBlock demo
const EXAMPLE_CODE = `// Tactile button press physics
const useTactilePress = (ref) => {
  const [isPressed, setIsPressed] = useState(false);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);
    
    el.addEventListener('pointerdown', handleDown);
    el.addEventListener('pointerup', handleUp);
    el.addEventListener('pointerleave', handleUp);
    
    return () => {
      el.removeEventListener('pointerdown', handleDown);
      el.removeEventListener('pointerup', handleUp);
      el.removeEventListener('pointerleave', handleUp);
    };
  }, [ref]);
  
  return {
    style: {
      transform: isPressed 
        ? 'translate(4px, 4px)' 
        : 'translate(0, 0)',
      boxShadow: isPressed 
        ? 'none' 
        : '4px 4px 0px var(--ink)',
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    },
  };
};

export default useTactilePress;`;

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(null);
  const postBodyRef = useRef(null);
  const touchStateRef = useRef({ timer: null, startX: 0, startY: 0, activeEl: null });

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Mohsin Ismail`;
    } else {
      document.title = 'Post Not Found - Mohsin Ismail';
    }
    window.scrollTo(0, 0);
  }, [post]);

  // Handle clicks on images in post body using event delegation
  const handlePostBodyClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target.src);
    }
  };

  // Touch handling for images - only activate hover on press-and-hold, not scroll
  useEffect(() => {
    if (!post || !postBodyRef.current) return;
    const container = postBodyRef.current;
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
  }, [post, slug]);

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

        <div
          ref={postBodyRef}
          className="post-body full-content"
          onClick={handlePostBodyClick}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Render CodeBlock demo for field-notes post */}
        {slug === '2025-11-15-field-notes' && (
          <div className="post-body full-content" style={{ marginTop: '2rem' }}>
            <h2>Bonus: the hook</h2>
            <p>Here's the actual React hook that powers the press physics. Click "Copy" to grab it, or expand to see the full implementation:</p>
            <CodeBlock code={EXAMPLE_CODE} language="javascript" maxLines={10} />
          </div>
        )}

        <div className="post-footer">
          <div className="divider" />
          <Link to="/" className="btn outline">
            Back to all posts
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



