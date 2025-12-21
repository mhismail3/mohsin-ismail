import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks';
import { usePageTransition, useFilterTransition } from '../contexts';
import { posts, uniqueTags } from '../data';
import { PostCard, Pagination, TagCloud, AboutPanel } from '../components/features';
import { Button, Pill } from '../components/ui';

const POSTS_PER_PAGE = 10;

// Animation timing for CSS custom properties - elegant, intentional feel
const FADE_IN_MS = 280;
const STAGGER_MS = 50;

function BlogPage({ selectedTags, setSelectedTags, page, setPage }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isReady } = usePageTransition();
  const { isFiltering, filterPhase, transitionType, startFilterTransition } = useFilterTransition();
  usePageTitle('Blog - Mohsin Ismail');

  const postListRef = useRef(null);
  const isFirstRenderRef = useRef(true);

  // Track if we've ever filtered (to enable stagger animations on filter changes)
  const [hasFiltered, setHasFiltered] = useState(false);
  
  // Snapshot of selected tags to show during fade-out (prevents immediate UI change)
  const [displayTags, setDisplayTags] = useState(selectedTags);
  
  // Track which tags are newly added (for individual tag animations)
  const [newlyAddedTags, setNewlyAddedTags] = useState(new Set());
  const prevDisplayTagsRef = useRef(selectedTags);
  
  // Track which posts were visible before filter (for selective card animation)
  const [newlyVisibleSlugs, setNewlyVisibleSlugs] = useState(new Set());
  const prevVisibleSlugsRef = useRef(null); // Initialized lazily after visiblePosts is computed

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

  
  // Add/remove body class during pagination to disable header transitions
  useEffect(() => {
    if (transitionType === 'pagination' && isFiltering) {
      document.body.classList.add('pagination-active');
    } else {
      document.body.classList.remove('pagination-active');
    }

    return () => {
      document.body.classList.remove('pagination-active');
    };
  }, [transitionType, isFiltering]);

  // Sync displayTags with selectedTags when not filtering
  // During filtering, we keep the old displayTags until fade-in starts
  useEffect(() => {
    if (!isFiltering && filterPhase === 'idle') {
      setDisplayTags(selectedTags);
    }
  }, [selectedTags, isFiltering, filterPhase]);
  
  // Update displayTags when entering the 'in' phase (fade-in starting)
  // Also track which tags are newly added for individual animations
  useEffect(() => {
    if (filterPhase === 'in') {
      const prevTags = prevDisplayTagsRef.current;
      const newTags = selectedTags.filter(tag => !prevTags.includes(tag));
      
      // Update display tags and ref
      setDisplayTags(selectedTags);
      prevDisplayTagsRef.current = selectedTags;
      
      // Mark new tags for animation (only if there are new ones)
      if (newTags.length > 0) {
        setNewlyAddedTags(new Set(newTags));
        // Clear the "new" status after animation completes
        const timer = setTimeout(() => {
          setNewlyAddedTags(new Set());
        }, 300); // Match animation duration
        return () => clearTimeout(timer);
      }
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
  
  // Buffered posts for display - only updates at controlled times to prevent flash
  // Similar pattern to displayTags: keeps old content during transition, updates on 'in' phase
  const [displayPosts, setDisplayPosts] = useState(visiblePosts);
  
  // Initialize prevVisibleSlugsRef on first render and keep it updated when not filtering
  // This ensures we correctly track which posts were visible before any filter operation
  useEffect(() => {
    if (!hasFiltered) {
      prevVisibleSlugsRef.current = new Set(visiblePosts.map(p => p.slug));
    }
  }, [visiblePosts, hasFiltered]);
  
  // Sync displayPosts when not filtering (idle state)
  // This keeps displayPosts in sync during normal navigation/initial load
  useEffect(() => {
    if (!isFiltering && filterPhase === 'idle') {
      setDisplayPosts(visiblePosts);
      prevVisibleSlugsRef.current = new Set(visiblePosts.map(p => p.slug));
    }
  }, [visiblePosts, isFiltering, filterPhase]);
  
  // Update displayPosts when entering 'update' phase for pagination (while invisible)
  // or 'in' phase for tag filtering
  useEffect(() => {
    // For pagination: swap content during 'update' phase (while faded out)
    if (filterPhase === 'update' && transitionType === 'pagination') {
      setDisplayPosts(visiblePosts);
    }

    // For all transitions entering 'in' phase: calculate animation classes
    if (filterPhase === 'in') {
      const currentSlugs = new Set(visiblePosts.map(p => p.slug));
      const prevSlugs = prevVisibleSlugsRef.current || new Set();

      // Find posts that weren't visible before
      const newSlugs = new Set();
      currentSlugs.forEach(slug => {
        if (!prevSlugs.has(slug)) {
          newSlugs.add(slug);
        }
      });

      // For tag filtering: update displayPosts now (pagination already updated in 'update')
      if (transitionType !== 'pagination') {
        setDisplayPosts(visiblePosts);
      }

      setNewlyVisibleSlugs(newSlugs);

      // Update ref for next comparison
      prevVisibleSlugsRef.current = currentSlugs;

      // Clear after animation completes
      if (newSlugs.size > 0) {
        const timer = setTimeout(() => {
          setNewlyVisibleSlugs(new Set());
        }, FADE_IN_MS + (visiblePosts.length * STAGGER_MS));
        return () => clearTimeout(timer);
      }
    }
  }, [filterPhase, transitionType, visiblePosts]);

  // Orchestrated transition using context
  const performTransition = useCallback((updateFn, options = {}) => {
    // Skip animation on first render
    if (isFirstRenderRef.current) {
      updateFn();
      return;
    }

    // Mark that we've filtered at least once (but only for actual filtering, not pagination)
    if (!options.isPagination) {
      setHasFiltered(true);
    }

    // Use the centralized filter transition
    startFilterTransition(updateFn, options);
  }, [startFilterTransition]);

  const handlePrev = useCallback(() => {
    // Prevent action if already transitioning
    if (isFiltering) return;

    performTransition(() => {
      setPage((p) => Math.max(1, p - 1));
    }, { isPagination: true });
  }, [isFiltering, performTransition, setPage]);

  const handleNext = useCallback(() => {
    // Prevent action if already transitioning
    if (isFiltering) return;

    performTransition(() => {
      setPage((p) => Math.min(totalPages, p + 1));
    }, { isPagination: true });
  }, [isFiltering, performTransition, totalPages, setPage]);

  const handleTagToggle = useCallback((tag) => {
    // Prevent action if already transitioning
    if (isFiltering) return;

    performTransition(() => {
      setPage(1);
      setSelectedTags((current) =>
        current.includes(tag)
          ? current.filter((item) => item !== tag)
          : [...current, tag]
      );
    });
  }, [isFiltering, performTransition, setPage, setSelectedTags]);

  const resetTags = useCallback(() => {
    // Prevent action if already transitioning
    if (isFiltering) return;

    performTransition(() => {
      setPage(1);
      setSelectedTags([]);
    });
  }, [isFiltering, performTransition, setPage, setSelectedTags]);

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

      // Add pagination-specific class for different transition behavior
      if (transitionType === 'pagination') {
        classes.push('pagination-transitioning');
      }
    }

    return classes.join(' ');
  };

  return (
    <div className="frame">
      <section className={getPanelClass()}>
        <div className="panel-head">
          <div className="panel-head-main">
            <div className="eyebrow">All Posts</div>
            {displayTags.length > 0 && (
              <Button variant="clear-tags" size="small" onClick={resetTags}>
                Clear tags
              </Button>
            )}
          </div>
          {displayTags.length > 0 && (
            <div className={`active-tags${filterPhase === 'out' || filterPhase === 'update' ? ' fading-out' : ''}`}>
              {displayTags.map((tag) => (
                <Pill
                  key={tag}
                  active
                  onClick={() => handleTagToggle(tag)}
                  className={newlyAddedTags.has(tag) ? 'tag-entering' : 'tag-stable'}
                >
                  #{tag}
                </Pill>
              ))}
            </div>
          )}
        </div>

        <div
          className={getPostListClass()}
          ref={postListRef}
          style={listStyle}
        >
          {displayPosts.map((post, index) => {
            const isNewlyVisible = newlyVisibleSlugs.has(post.slug);
            const cardClass = hasFiltered
              ? (isNewlyVisible ? 'card-entering' : 'card-stable')
              : '';

            return (
              <PostCard
                key={post.slug}
                post={post}
                onTagClick={handleTagToggle}
                selectedTags={selectedTags}
                className={cardClass}
                data-post-slug={post.slug}
                style={{ '--card-index': index }}
              />
            );
          })}
          {displayPosts.length === 0 && (
            <div className="empty-state">
              <p>No posts match these tags yet.</p>
            </div>
          )}
        </div>
      </section>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
        disabled={isFiltering && transitionType === 'pagination'}
      />

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
