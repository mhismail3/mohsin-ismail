import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle, useTouchHover, useIsMobile } from '../hooks';
import { portfolioProjects } from '../data';
import { Header } from '../components/layout';
import { AboutPanel } from '../components/features';

const INITIAL_ITEMS = 10;
const LOAD_BATCH = 4;
const MOBILE_BREAKPOINT = 720;

// Process project for display
const processProject = (project, index) => ({
  ...project,
  id: `${project.slug}-${index}`,
});

const PortfolioPage = () => {
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);
  const [columnCount, setColumnCount] = useState(3);
  
  // Initialize with first items
  const [items, setItems] = useState(() => 
    portfolioProjects.slice(0, INITIAL_ITEMS).map(processProject)
  );
  
  const cursorRef = useRef(Math.min(INITIAL_ITEMS, portfolioProjects.length));
  const sentinelRef = useRef(null);
  const [hasMore, setHasMore] = useState(portfolioProjects.length > INITIAL_ITEMS);

  // Touch hover handling
  const { containerRef: moodboardRef } = useTouchHover({
    selector: '.project-card',
    hoverClass: 'touch-hover',
  });

  usePageTitle('Portfolio - Mohsin Ismail');

  // Handle responsive column count
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= MOBILE_BREAKPOINT) {
        setColumnCount(1);
      } else if (width <= 1080) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
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

  // Intersection observer for infinite scroll
  React.useEffect(() => {
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
              Some of the projects that I've worked on recently. More coming soon...
            </p>
          </div>
        </div>

        <div ref={moodboardRef} className={`moodboard ${isMobile ? 'mobile' : ''}`}>
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


