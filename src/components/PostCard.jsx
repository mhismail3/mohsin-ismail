import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils';
import LinkIcon from './LinkIcon';

const PostCard = ({ post, onTagClick, selectedTags = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
