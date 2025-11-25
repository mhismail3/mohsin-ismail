import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import AboutPanel from './components/AboutPanel';
import portfolioProjects from './portfolioProjects';

const INITIAL_ITEMS = 10;
const LOAD_BATCH = 4;
const MOBILE_BREAKPOINT = 720;

// Process project for display - works with both local and external images
const processProject = (project, index) => ({
  ...project,
  id: `${project.slug}-${index}`,
});

const PortfolioPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [columnCount, setColumnCount] = useState(3);
  
  // Initialize with first items (or all if fewer than INITIAL_ITEMS)
  const [items, setItems] = useState(() => 
    portfolioProjects.slice(0, INITIAL_ITEMS).map(processProject)
  );
  
  const cursorRef = useRef(Math.min(INITIAL_ITEMS, portfolioProjects.length));
  const sentinelRef = useRef(null);
  const [hasMore, setHasMore] = useState(portfolioProjects.length > INITIAL_ITEMS);

  useEffect(() => {
    document.title = 'Portfolio - Mohsin Ismail';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= MOBILE_BREAKPOINT) {
        setColumnCount(1);
        setIsMobile(true);
      } else if (width <= 1080) {
        setColumnCount(2);
        setIsMobile(false);
      } else {
        setColumnCount(3);
        setIsMobile(false);
      }
    };

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (cursorRef.current >= portfolioProjects.length) {
      setHasMore(false);
      return;
    }

    setItems((current) => {
      const nextBatch = portfolioProjects.slice(cursorRef.current, cursorRef.current + LOAD_BATCH);
      const processedNext = nextBatch.map((p, idx) => processProject(p, cursorRef.current + idx));
      
      cursorRef.current += nextBatch.length;
      
      if (cursorRef.current >= portfolioProjects.length) {
        setHasMore(false);
      }
      
      return [...current, ...processedNext];
    });
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { rootMargin: '360px 0px 120px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    items.forEach((item, i) => {
      cols[i % columnCount].push(item);
    });
    return cols;
  }, [items, columnCount]);

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" />
      <section className="panel portfolio-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">Selected Work</div>
            <h1>Portfolio</h1>
            <p className="muted">
              Real projects I've built—from weekend experiments to production tools.
            </p>
          </div>
        </div>

        <div className={`moodboard ${isMobile ? 'mobile' : ''}`}>
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="moodboard-column">
              {col.map((project) => (
                <Link
                  to={`/portfolio/${project.slug}`}
                  key={project.id}
                  className="project-card"
                >
                  <div className="project-media">
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
              ))}
            </div>
          ))}
        </div>

        {hasMore && <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />}
      </section>
      <AboutPanel />
    </div>
  );
};

export default PortfolioPage;
