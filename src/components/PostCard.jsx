import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils';
import LinkIcon from './LinkIcon';

const PostCard = ({ post, onTagClick, selectedTags = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const postBodyRef = useRef(null);
  const touchStateRef = useRef({ timer: null, startX: 0, startY: 0, activeEl: null });

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    // Construct the URL with hash for HashRouter
    const url = `${window.location.origin}/#/posts/${post.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2200);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Handle clicks on images in post body using event delegation
  const handlePostBodyClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImage(e.target.src);
    }
  };

  // Touch handling for images - only activate hover on press-and-hold, not scroll
  useEffect(() => {
    if (!expanded || !postBodyRef.current) return;
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
  }, [expanded]);

  return (
    <article className={`post-card ${expanded ? 'expanded' : ''}`}>
      <div className="post-head">
        <div className="post-meta">
          <div className="eyebrow">{formatDate(post.date)}</div>
          <h3>
            <Link to={`/posts/${post.slug}`} className="post-title-link">
              {post.title}
            </Link>
          </h3>
        </div>
        <div className="link-btn-wrapper">
          <button
            type="button"
            className="pill icon-btn"
            onClick={handleCopyLink}
            aria-label="Copy link to post"
          >
            <LinkIcon />
          </button>
          {showToast && <div className="toast">Copied link</div>}
        </div>
        <p className="muted post-summary">{post.summary}</p>
      </div>

      <div className="tag-row">
        {post.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`pill small ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => onTagClick(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="post-actions">
        <button
          type="button"
          className="btn outline small tldr-toggle"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'hide' : 'tl;dr'}
        </button>
      </div>

      {expanded && (
        <div
          ref={postBodyRef}
          className="post-body"
          onClick={handlePostBodyClick}
          dangerouslySetInnerHTML={{
            __html: post.content,
          }}
        />
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size view" />
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
