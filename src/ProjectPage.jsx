import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './components/Header';
import AboutPanel from './components/AboutPanel';
import portfolioProjects from './portfolioProjects';

const ProjectPage = () => {
  const { slug } = useParams();
  const project = portfolioProjects.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const requestRef = useRef(null);
  const activeRafRef = useRef(null);
  const mouseXRef = useRef(0);
  const isHoveringRef = useRef(false);
  const [isTouch, setIsTouch] = useState(false);
  const itemRefs = useRef([]);

  const carouselImages = useMemo(() => {
    if (!project) return [];
    return [project.image, ...(project.gallery || [])];
  }, [project]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    const setTouch = () => {
      if (typeof window === 'undefined') return;
      setIsTouch(window.matchMedia('(hover: none)').matches);
    };
    setTouch();
    const media = window.matchMedia('(hover: none)');
    const handler = (e) => setIsTouch(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Reset refs and active state when switching projects
    itemRefs.current = [];
    setActiveIndex(0);
  }, [project]);

  const updateActiveItem = useCallback(() => {
    const track = carouselRef.current;
    if (!track || !carouselImages.length) return;

    const centerX = track.scrollLeft + track.clientWidth / 2;

    let closestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((node, idx) => {
      if (!node) return;
      const itemCenter = node.offsetLeft + node.offsetWidth / 2;
      const distance = Math.abs(itemCenter - centerX);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveIndex((prev) => (prev === closestIndex ? prev : closestIndex));
  }, [carouselImages.length]);

  useEffect(() => {
    const id = requestAnimationFrame(updateActiveItem);
    return () => cancelAnimationFrame(id);
  }, [updateActiveItem, carouselImages.length]);

  const handleScroll = useCallback(() => {
    if (activeRafRef.current) return;
    activeRafRef.current = requestAnimationFrame(() => {
      activeRafRef.current = null;
      updateActiveItem();
    });
  }, [updateActiveItem]);

  useEffect(() => {
    const handleResize = () => updateActiveItem();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (activeRafRef.current) {
        cancelAnimationFrame(activeRafRef.current);
        activeRafRef.current = null;
      }
    };
  }, [updateActiveItem]);

  // Carousel Animation Logic
  const animate = () => {
    if (isTouch || !carouselRef.current || !isHoveringRef.current) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const container = carouselRef.current;
    const { left, width } = container.getBoundingClientRect();
    const centerX = left + width / 2;
    
    // Calculate distance from center (-1 to 1)
    // mouseXRef.current is the global mouse X.
    const delta = (mouseXRef.current - centerX) / (width / 2);
    
    // Apply deadzone in the middle (e.g., -0.1 to 0.1)
    if (Math.abs(delta) > 0.1) {
        // Speed factor: increases as you go further out
        const speed = delta * 8; 
        container.scrollLeft += speed;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!isTouch) {
    requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTouch]);

  const handleMouseMove = (e) => {
    mouseXRef.current = e.clientX;
    isHoveringRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
  };

  if (!project) {
    return (
      <div className="frame">
        <Header label="Mohsin Ismail" />
        <div className="panel" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2>Project not found</h2>
          <Link to="/portfolio" className="btn outline">Back to Portfolio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" />
      
      {/* Project Info Panel */}
      <section className="panel project-detail-panel">
        <div className="project-header">
            <Link to="/portfolio" className="back-link">← Back to Portfolio</Link>
            <div className="eyebrow">{project.date}</div>
            <div className="project-title-row">
                <h1>{project.title}</h1>
                {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="pill">
                        <div className="icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                        </div>
                        View Repo
                    </a>
                )}
            </div>
        </div>

        <div className="project-content">
            <p className="project-description">{project.description}</p>
        </div>

        {/* Carousel */}
        <div 
            className="carousel-container" 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="carousel-track" ref={carouselRef} onScroll={handleScroll}>
                {carouselImages.map((img, idx) => (
                    <button 
                        key={`${project.slug}-${idx}`} 
                        type="button" 
                        className={`carousel-item ${activeIndex === idx ? 'is-active' : ''}`}
                        onClick={() => setSelectedImage(img)}
                        ref={(el) => { itemRefs.current[idx] = el; }}
                    >
                        <img src={img} alt={`${project.title} ${idx === 0 ? 'main' : `image ${idx + 1}`}`} loading="lazy" />
                    </button>
                ))}
            </div>
            <div className="carousel-hint">{isTouch ? 'Scroll to view more' : 'Hover sides to scroll'}</div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img src={selectedImage} alt="Project detail" />
                <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
            </div>
        </div>
      )}
      <AboutPanel />
    </div>
  );
};

export default ProjectPage;
