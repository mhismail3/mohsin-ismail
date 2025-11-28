import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { Icon } from '../ui';
import Pill from '../ui/Pill';
import Button from '../ui/Button';

const PostCard = ({ post, onTagClick, selectedTags = [], disableTagClick = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
          <Pill
            variant="icon"
            onClick={handleCopyLink}
            aria-label="Copy link to post"
          >
            <Icon name="link" size={16} />
          </Pill>
          {showToast && <div className="toast">Copied link</div>}
        </div>
        <p className="muted post-summary">{post.summary}</p>
      </div>

      <div className="tag-row">
        {post.tags.map((tag) => (
          <Pill
            key={tag}
            size="small"
            active={selectedTags.includes(tag)}
            as={disableTagClick ? 'span' : 'button'}
            onClick={disableTagClick ? undefined : () => onTagClick(tag)}
          >
            #{tag}
          </Pill>
        ))}
      </div>

      {post.tldr && (
        <div className="post-actions">
          <Button
            variant="outline"
            size="small"
            className="tldr-toggle"
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'hide' : 'tl;dr'}
          </Button>
        </div>
      )}

      {post.tldr && (
        <div className="post-body-wrapper">
          <div
            className="post-body"
            dangerouslySetInnerHTML={{
              __html: post.tldr,
            }}
          />
        </div>
      )}
    </article>
  );
};

export default PostCard;

