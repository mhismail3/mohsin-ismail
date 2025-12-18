import React from 'react';
import { Link } from 'react-router-dom';
import { useDominantColor } from '../../hooks';
import { ProgressiveImage } from '../ui';

/**
 * FeaturedProjectCard component with dynamic border color extracted from the cover image
 * and iOS 26 liquid glass effect on the title pill.
 * Uses ProgressiveImage for optimized loading with WebP and blur placeholders.
 */
const FeaturedProjectCard = ({ project }) => {
  const { borderColor } = useDominantColor(project.image);

  const cardStyle = borderColor
    ? { '--card-border-color': borderColor }
    : {};

  return (
    <Link
      to={`/portfolio/${project.slug}`}
      className="featured-project-card"
      style={cardStyle}
    >
      <div className="featured-project-media">
        <ProgressiveImage
          src={project.image}
          alt={project.title}
          eager={true}
          sizes="(max-width: 600px) 100vw, 600px"
        />
        <div className="project-pill">
          <span className="pill-label">{project.title}</span>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedProjectCard;









