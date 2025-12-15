import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateParts } from '../../utils/formatDate';
import { useTapFeedback, useShimmerFollowGroup, useIsTouch } from '../../hooks';
import { Icon, Pill } from '../ui';

const PostCard = React.forwardRef(({
  post,
  onTagClick,
  selectedTags = [],
  className = '',
  ...props
}, ref) => {
  const [showToast, setShowToast] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const excerptRef = useRef(null);
  const titleRef = useRef(null);
  const eyebrowRef = useRef(null);
  const navigate = useNavigate();
  const { getTapProps } = useTapFeedback();
  const { containerHandlers, registerTarget, clearTargets } = useShimmerFollowGroup();
  
  // Detect touch-only devices (no hover capability)
  const isTouch = useIsTouch();
  
  // Register shimmer targets when refs are available (desktop only)
  useEffect(() => {
    if (isTouch) return;
    
    if (titleRef.current) registerTarget(titleRef.current);
    if (eyebrowRef.current) registerTarget(eyebrowRef.current);
    
    return () => clearTargets();
  }, [isTouch, registerTarget, clearTargets]);

  // Detect if excerpt content overflows (needs truncation)
  useEffect(() => {
    const checkOverflow = () => {
      const el = excerptRef.current;
      if (el) {
        // scrollHeight > clientHeight means content is taller than visible area
        setIsOverflowing(el.scrollHeight > el.clientHeight + 1); // +1 for rounding tolerance
      }
    };

    checkOverflow();

    // Re-check on window resize (font size, container width changes affect line wrapping)
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (excerptRef.current) {
      resizeObserver.observe(excerptRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [post.excerpt]);

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
    // Construct the shareable URL (BrowserRouter format)
    const url = `${window.location.origin}/posts/${post.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2200);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Navigate to post when clicking anywhere in the post-head area
  const handlePostHeadClick = (e) => {
    // Don't navigate if clicking on interactive elements (handled by their own handlers)
    // The copy button already has stopPropagation, but we also check for links
    if (e.target.closest('a')) return;
    navigate(`/posts/${post.slug}`);
  };

  return (
    <article
      ref={ref}
      className={['post-card', className].filter(Boolean).join(' ')}
      {...props}
    >
      <div 
        className="post-head" 
        onClick={handlePostHeadClick} 
        role="link" 
        tabIndex={-1}
        {...(isTouch ? {} : containerHandlers)}
      >
        <div className="post-meta">
          <div 
            ref={isTouch ? undefined : eyebrowRef}
            className={`eyebrow${isTouch ? '' : ' eyebrow-shimmer shimmer-hidden'}`}
          >
            {(() => {
              const { datePart, timePart } = formatDateParts(post.date);
              return <>{datePart}<span className="eyebrow-dot">•</span>{timePart}</>;
            })()}
          </div>
          <h3>
            <Link 
              ref={isTouch ? undefined : titleRef}
              to={`/posts/${post.slug}`} 
              className={`post-title-link${isTouch ? ' touch-title' : ' shimmer-hidden'}`}
              {...getTapProps()}
            >
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
        <p 
          ref={excerptRef}
          className={`post-excerpt${isOverflowing ? ' has-overflow' : ''}`}
        >
          {post.excerpt}
        </p>
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
});

PostCard.displayName = 'PostCard';

export default PostCard;
