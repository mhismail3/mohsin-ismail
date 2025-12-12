import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks';
import { usePageTransition } from '../contexts';
import { posts, uniqueTags } from '../data';
import { PostCard, Pagination, TagCloud, AboutPanel } from '../components/features';
import { Button } from '../components/ui';

const POSTS_PER_PAGE = 10;

// Animation timing (keep short for snappy feel)
const FADE_OUT_MS = 120;
const FADE_IN_MS = 180;
const STAGGER_MS = 30;

function BlogPage({ selectedTags, setSelectedTags, page, setPage }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isReady } = usePageTransition();
  usePageTitle('Blog - Mohsin Ismail');

  const postListRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  
  // Track transition state for CSS-driven animations
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const pendingUpdateRef = useRef(null);

  // Respect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reduceMotionRef.current = media.matches;
    };
    sync();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync);
      return () => media.removeEventListener('change', sync);
    }
    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  // Initialize selected tags from URL search params on mount
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl && uniqueTags.includes(tagFromUrl)) {
      setPage(1);
      setSelectedTags([tagFromUrl]);
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Mark first render complete after initial paint
  useEffect(() => {
    if (isReady) {
      // Wait for initial stagger animations to complete before enabling transitions
      const timer = setTimeout(() => {
        isFirstRenderRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  const filteredPosts = useMemo(
    () =>
      selectedTags.length
        ? posts.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
        : posts,
    [selectedTags],
  );

  const tagCounts = useMemo(() => {
    const counts = {};
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const visiblePosts = useMemo(
    () => filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE),
    [filteredPosts, startIndex],
  );

  // Check if scrolled down
  const isScrolledDown = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.scrollY > 100;
  }, []);

  // Orchestrated transition: fade out → update → fade in
  const performTransition = useCallback((updateFn) => {
    // Skip animation on first render or if reduced motion
    if (isFirstRenderRef.current || reduceMotionRef.current) {
      updateFn();
      return;
    }

    // If already transitioning, queue the update
    if (isTransitioning) {
      pendingUpdateRef.current = updateFn;
      return;
    }

    // Phase 1: Scroll to top instantly if needed (before animation starts)
    if (isScrolledDown()) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Phase 2: Fade out
    setIsTransitioning(true);

    // Phase 3: After fade out, apply the update
    setTimeout(() => {
      updateFn();
      setHasFiltered(true); // Enable stagger animations for filter changes

      // Phase 4: Fade in (handled by CSS, just remove transitioning state)
      // Small delay to ensure React has rendered new content
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(false);

          // Handle any queued updates
          if (pendingUpdateRef.current) {
            const pending = pendingUpdateRef.current;
            pendingUpdateRef.current = null;
            // Use setTimeout to avoid state update during render
            setTimeout(() => performTransition(pending), 50);
          }
        });
      });
    }, FADE_OUT_MS);
  }, [isTransitioning, isScrolledDown]);

  const handlePrev = useCallback(() => {
    performTransition(() => {
      setPage((p) => Math.max(1, p - 1));
    });
  }, [performTransition, setPage]);

  const handleNext = useCallback(() => {
    performTransition(() => {
      setPage((p) => Math.min(totalPages, p + 1));
    });
  }, [performTransition, totalPages, setPage]);

  const handleTagToggle = useCallback((tag) => {
    performTransition(() => {
      setPage(1);
      setSelectedTags((current) =>
        current.includes(tag)
          ? current.filter((item) => item !== tag)
          : [...current, tag]
      );
    });
  }, [performTransition, setPage, setSelectedTags]);

  const resetTags = useCallback(() => {
    performTransition(() => {
      setPage(1);
      setSelectedTags([]);
    });
  }, [performTransition, setPage, setSelectedTags]);

  // CSS custom property for stagger timing
  const listStyle = {
    '--stagger-delay': `${STAGGER_MS}ms`,
    '--fade-in-duration': `${FADE_IN_MS}ms`,
  };

  return (
    <div className="frame">
      <section className="panel posts-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">All Posts</div>
          </div>
          <div className="active-tags">
            {selectedTags.length > 0 && (
              <>
                <TagCloud
                  tags={selectedTags}
                  selectedTags={selectedTags}
                  onToggle={handleTagToggle}
                  showClear={false}
                />
                <Button variant="outline" size="small" onClick={resetTags}>
                  Clear tags
                </Button>
              </>
            )}
          </div>
        </div>

        <div 
          className={`post-list ${isTransitioning ? 'transitioning' : 'visible'}${hasFiltered ? ' filter-changed' : ''}`}
          ref={postListRef}
          style={listStyle}
        >
          {visiblePosts.map((post, index) => (
            <PostCard
              key={post.slug}
              post={post}
              onTagClick={handleTagToggle}
              selectedTags={selectedTags}
              data-post-slug={post.slug}
              style={{ '--card-index': index }}
            />
          ))}
          {visiblePosts.length === 0 && (
            <div className="empty-state">
              <p>No posts match these tags yet.</p>
            </div>
          )}
        </div>
      </section>

      <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />

      <section className="panel hero">
        <div className="eyebrow">Filter by Tag</div>
        {uniqueTags.length > 0 && (
          <div className="filter-row">
            <TagCloud
              tags={uniqueTags}
              selectedTags={selectedTags}
              onToggle={handleTagToggle}
              onClear={resetTags}
              tagCounts={tagCounts}
            />
          </div>
        )}
      </section>

      <AboutPanel />
    </div>
  );
}

export default BlogPage;
