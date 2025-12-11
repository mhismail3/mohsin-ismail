import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks';
import { portfolioProjects } from '../data';
import { AboutPanel, Carousel, Lightbox } from '../components/features';
import { Pill, Icon } from '../components/ui';

const ProjectPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const project = portfolioProjects.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle internal link clicks via event delegation
  const handleContentClick = useCallback((e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    
    const href = link.getAttribute('href');
    const isHashLink = href.startsWith('#');
    const isMailto = href.startsWith('mailto:');
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    
    // For internal links that aren't hash/mailto, use React Router navigation
    if (!isHashLink && !isMailto) {
      if (href.startsWith('/')) {
        e.preventDefault();
        navigate(href);
      } else if (isExternal && href.startsWith(window.location.origin)) {
        // Same-origin absolute URLs
        e.preventDefault();
        const path = href.replace(window.location.origin, '');
        navigate(path);
      }
    }
  }, [navigate]);

  usePageTitle(
    project ? `${project.title} - Mohsin Ismail` : 'Project Not Found - Mohsin Ismail'
  );

  const carouselImages = useMemo(() => {
    if (!project) return [];
    return [project.image, ...(project.gallery || [])].filter(Boolean);
  }, [project]);

  // Helper to check if a file is an animated format
  const isAnimated = (src) => {
    if (!src) return false;
    const ext = src.split('.').pop()?.toLowerCase();
    return ext === 'gif' || ext === 'webp';
  };

  // Render badge for GIFs
  const renderBadge = (img) => {
    if (isAnimated(img)) {
      return <span className="gif-badge">GIF</span>;
    }
    return null;
  };

  if (!project) {
    return (
      <div className="frame">
        {/* Header is rendered at App level - outside PageTransition to prevent flicker */}
        <div className="panel" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Project not found</h2>
          <Link to="/portfolio" className="btn outline">Back to Portfolio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="frame">
      {/* Header is rendered at App level - outside PageTransition to prevent flicker */}
      
      {/* Project Info Panel */}
      <section className="panel project-detail-panel">
        <div className="project-header">
          <Link to="/portfolio" className="back-link">← Back to Portfolio</Link>
          <div className="eyebrow">{project.date}{project.status && <><span className="eyebrow-dot">•</span>{project.status}</>}</div>
          <div className="project-title-row">
            <h1>{project.title}</h1>
            <div className="project-links">
              {project.live && (
                <Pill
                  as="a"
                  variant="project-link"
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link-pill"
                >
                  <Icon name="externalLink" size={14} />
                  Visit
                </Pill>
              )}
              {project.github && (
                <Pill
                  as="a"
                  variant="project-link"
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link-pill"
                >
                  <Icon name="github" size={14} />
                  View Repo
                </Pill>
              )}
            </div>
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="tag-row">
              {project.tags.map((tag) => (
                <Pill key={tag} size="small" variant="disabled" as="span">
                  {tag}
                </Pill>
              ))}
            </div>
          )}
        </div>

        <div className="project-content">
          <div 
            className="project-description"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        </div>

        {/* Carousel */}
        <Carousel
          images={carouselImages}
          onImageClick={setSelectedImage}
          altPrefix={project.title}
          renderBadge={renderBadge}
        />
      </section>

      {/* Lightbox Modal */}
      <Lightbox
        src={selectedImage}
        alt="Project detail"
        onClose={() => setSelectedImage(null)}
      />
      
      <AboutPanel />
    </div>
  );
};

export default ProjectPage;



