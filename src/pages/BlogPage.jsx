import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks';
import { usePageTransition, useFilterTransition } from '../contexts';
import { posts, uniqueTags } from '../data';
import { PostCard, Pagination, TagCloud, AboutPanel } from '../components/features';
import { Button } from '../components/ui';

const POSTS_PER_PAGE = 10;

// Animation timing for CSS custom properties - elegant, intentional feel
const FADE_IN_MS = 280;
const STAGGER_MS = 50;

function BlogPage({ selectedTags, setSelectedTags, page, setPage }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isReady } = usePageTransition();
  const { isFiltering, filterPhase, startFilterTransition } = useFilterTransition();
  usePageTitle('Blog - Mohsin Ismail');

  const postListRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  
  // Track if we've ever filtered (to enable stagger animations on filter changes)
  const [hasFiltered, setHasFiltered] = useState(false);
  
  // Snapshot of selected tags to show during fade-out (prevents immediate UI change)
  const [displayTags, setDisplayTags] = useState(selectedTags);

  // Initialize selected tags from URL search params on mount
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl && uniqueTags.includes(tagFromUrl)) {
      setPage(1);
      setSelectedTags([tagFromUrl]);
      setDisplayTags([tagFromUrl]);
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
  
  // Sync displayTags with selectedTags when not filtering
  // During filtering, we keep the old displayTags until fade-in starts
  useEffect(() => {
    if (!isFiltering && filterPhase === 'idle') {
      setDisplayTags(selectedTags);
    }
  }, [selectedTags, isFiltering, filterPhase]);
  
  // Update displayTags when entering the 'in' phase (fade-in starting)
  useEffect(() => {
    if (filterPhase === 'in') {
      setDisplayTags(selectedTags);
    }
  }, [filterPhase, selectedTags]);

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

  // Orchestrated transition using context
  const performTransition = useCallback((updateFn) => {
    // Skip animation on first render
    if (isFirstRenderRef.current) {
      updateFn();
      return;
    }

    // Mark that we've filtered at least once
    setHasFiltered(true);
    
    // Use the centralized filter transition
    startFilterTransition(updateFn);
  }, [startFilterTransition]);

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
  
  // Determine post list classes based on filter phase
  const getPostListClass = () => {
    const classes = ['post-list'];
    
    if (filterPhase === 'out' || filterPhase === 'update') {
      classes.push('transitioning');
    } else {
      classes.push('visible');
    }
    
    if (hasFiltered) {
      classes.push('filter-changed');
    }
    
    return classes.join(' ');
  };
  
  // Determine panel classes for coordinated fade
  const getPanelClass = () => {
    const classes = ['panel', 'posts-panel'];
    
    if (filterPhase === 'out' || filterPhase === 'update') {
      classes.push('filter-transitioning');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="frame">
      <section className={getPanelClass()}>
        <div className="panel-head">
          <div>
            <div className="eyebrow">All Posts</div>
          </div>
          <div className={`active-tags${filterPhase === 'out' || filterPhase === 'update' ? ' fading-out' : ''}`}>
            {displayTags.length > 0 && (
              <>
                <TagCloud
                  tags={displayTags}
                  selectedTags={displayTags}
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
          className={getPostListClass()}
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
