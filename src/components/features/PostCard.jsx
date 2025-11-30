import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { Icon } from '../ui';
import Pill from '../ui/Pill';

const PostCard = ({ post, onTagClick, selectedTags = [] }) => {
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleTagClick = (tag) => {
    if (onTagClick) {
      // In-page filtering (BlogPage)
      onTagClick(tag);
    } else {
      // Navigate to blog with tag filter
      navigate(`/blog?tag=${encodeURIComponent(tag)}`);
    }
  };

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

  return (
    <article className="post-card">
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
          <Pill
            variant="icon"
            onClick={handleCopyLink}
            aria-label="Copy link to post"
          >
            <Icon name="link" size={16} />
          </Pill>
          {showToast && <div className="toast">Copied link</div>}
        </div>
        <p className="post-excerpt">{post.excerpt}</p>
      </div>

      <div className="tag-row">
        {post.tags.map((tag) => (
          <Pill
            key={tag}
            size="small"
            active={selectedTags.includes(tag)}
            onClick={() => handleTagClick(tag)}
          >
            #{tag}
          </Pill>
        ))}
      </div>
    </article>
  );
};

export default PostCard;

