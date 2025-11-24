import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils';
import LinkIcon from './LinkIcon';

const PostCard = ({ post, onTagClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    // Construct the URL (works for both dev and prod if routing is correct)
    const url = `${window.location.origin}/posts/${post.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2200);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <article className={`post-card ${expanded ? 'expanded' : ''}`}>
      <div className="post-head">
        <div className="eyebrow">{formatDate(post.date)}</div>
        <div className="title-row">
          <h3>
            <Link to={`/posts/${post.slug}`} className="post-title-link">
              {post.title}
            </Link>
          </h3>
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
        </div>
        <p className="muted">{post.summary}</p>
      </div>

      <div className="tag-row">
        {post.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="pill small"
            onClick={() => onTagClick(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="post-actions">
        <button
          type="button"
          className="btn outline small"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Hide' : 'tl;dr'}
        </button>
      </div>

      {expanded && (
        <div
          className="post-body"
          dangerouslySetInnerHTML={{
            __html: post.content,
          }}
        />
      )}
    </article>
  );
};

export default PostCard;
