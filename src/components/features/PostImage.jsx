import React from 'react';

/**
 * PostImage component displays an image with an optional caption.
 * Used in blog posts to render markdown images with their alt text as captions.
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.caption - Caption text (from markdown alt text)
 * @param {Function} props.onClick - Callback when image is clicked (for lightbox)
 */
const PostImage = ({ src, caption, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(src);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <figure className="post-image">
      <img
        src={src}
        alt={caption || 'Post image'}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        aria-label={onClick ? `View ${caption || 'image'} in full size` : undefined}
      />
      {caption && (
        <figcaption className="post-image-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default PostImage;



