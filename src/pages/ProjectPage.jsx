import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageTitle, useInternalLinkNavigation, useTouchHover } from '../hooks';
import { portfolioProjects } from '../data';
import { AboutPanel, Carousel, Lightbox, CodeBlock } from '../components/features';
import { Pill, Icon } from '../components/ui';

/**
 * Component that renders project content with CodeBlock support.
 */
const ProjectContent = ({ html, codeBlocks }) => {
  const { handleLinkClick } = useInternalLinkNavigation();
  const contentRef = useRef(null);

  // Parse HTML and find code block placeholders
  const contentParts = useMemo(() => {
    if (!html) return [];

    const parts = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;

        if (el.hasAttribute('data-codeblock')) {
          const index = parseInt(el.getAttribute('data-codeblock'), 10);
          const codeBlock = codeBlocks[index];
          if (codeBlock) {
            parts.push({ type: 'codeblock', language: codeBlock.language, code: codeBlock.code, key: `code-${index}` });
          }
          return;
        }
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        parts.push({ type: 'html', content: node.outerHTML, key: `html-${parts.length}` });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        parts.push({ type: 'html', content: node.textContent, key: `text-${parts.length}` });
      }
    };

    body.childNodes.forEach(processNode);
    return parts;
  }, [html, codeBlocks]);

  return (
    <div
      ref={contentRef}
      className="project-description"
      onClick={handleLinkClick}
    >
      {contentParts.map((part) => {
        if (part.type === 'codeblock') {
          return <CodeBlock key={part.key} code={part.code} language={part.language} maxLines={12} />;
        }
        return <div key={part.key} dangerouslySetInnerHTML={{ __html: part.content }} />;
      })}
    </div>
  );
};

const ProjectPage = () => {
  const { slug } = useParams();
  const project = portfolioProjects.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(null);
  const { handleLinkClick: handleContentClick } = useInternalLinkNavigation();

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
        </div>

        <div className="project-content">
          <ProjectContent
            html={project.description}
            codeBlocks={project.codeBlocks || []}
          />
        </div>

        {/* Carousel */}
        <Carousel
          images={carouselImages}
          onImageClick={setSelectedImage}
          altPrefix={project.title}
          renderBadge={renderBadge}
        />

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="project-tags">
            {project.tags.map((tag) => (
              <Pill key={tag} size="small" variant="disabled" as="span">
                {tag}
              </Pill>
            ))}
          </div>
        )}
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
