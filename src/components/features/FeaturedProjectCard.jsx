import React from 'react';
import { Link } from 'react-router-dom';
import { useDominantColor } from '../../hooks';

/**
 * FeaturedProjectCard component with dynamic border color extracted from the cover image
 * and iOS 26 liquid glass effect on the title pill
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
        <img
          src={project.image}
          alt={project.title}
          loading="eager"
        />
        <div className="project-pill">
          <span className="pill-label">{project.title}</span>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedProjectCard;

