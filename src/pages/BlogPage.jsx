import React, { useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks';
import { usePageTransition } from '../contexts';
import { posts, uniqueTags } from '../data';
import { PostCard, Pagination, TagCloud, AboutPanel } from '../components/features';
import { Button } from '../components/ui';

const POSTS_PER_PAGE = 10;

const EASE_OUT = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // matches --ease-out
const EASE_SNAP = 'cubic-bezier(0.4, 0, 0.2, 1)'; // matches --ease-snap
const MOVE_MS = 300; // matches --duration-slow
const ENTER_MS = 200; // matches --duration-normal
const EXIT_MS = 200; // matches --duration-normal

function BlogPage({ selectedTags, setSelectedTags, page, setPage }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isReady } = usePageTransition();
  usePageTitle('Blog - Mohsin Ismail');

  const postListRef = useRef(null);
  const animLayerRef = useRef(null);
  const prevRectsRef = useRef(new Map());
  const reduceMotionRef = useRef(false);
  const runningCardAnimationsRef = useRef(new Map());

  // Respect reduced motion for in-page list animations
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

    // Safari < 14 fallback
    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  // Initialize selected tags from URL search params on mount
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl && uniqueTags.includes(tagFromUrl)) {
      setPage(1);
      setSelectedTags([tagFromUrl]);
      // Clear the URL param after applying
      setSearchParams({}, { replace: true });
    }
  }, []);

  const filteredPosts = useMemo(
    () =>
      selectedTags.length
        ? posts.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
        : posts,
    [selectedTags],
  );

  // Compute tag counts (how many posts each tag appears in)
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

  const prepareExitClones = useCallback((nextVisibleSlugs) => {
    if (reduceMotionRef.current) return;

    const listEl = postListRef.current;
    const layerEl = animLayerRef.current;
    if (!listEl || !layerEl) return;

    // Clear any previous clones (short animations; avoids stacking during rapid taps)
    while (layerEl.firstChild) {
      layerEl.removeChild(layerEl.firstChild);
    }

    const nextSet = new Set(nextVisibleSlugs);
    const containerRect = listEl.getBoundingClientRect();
    const currentCards = Array.from(listEl.children).filter(
      (child) => child instanceof HTMLElement && child.matches('article[data-post-slug]'),
    );

    currentCards.forEach((cardEl) => {
      const slug = cardEl.dataset.postSlug;
      if (!slug || nextSet.has(slug)) return;

      const rect = cardEl.getBoundingClientRect();
      const clone = cardEl.cloneNode(true);

      clone.setAttribute('aria-hidden', 'true');
      clone.style.position = 'absolute';
      clone.style.top = `${rect.top - containerRect.top}px`;
      clone.style.left = `${rect.left - containerRect.left}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.margin = '0';
      clone.style.pointerEvents = 'none';
      clone.style.transformOrigin = '50% 0%';

      layerEl.appendChild(clone);

      const anim = clone.animate(
        [
          { opacity: 1, transform: 'translateY(0px) scale(1)' },
          { opacity: 0, transform: 'translateY(10px) scale(0.985)' },
        ],
        { duration: EXIT_MS, easing: EASE_OUT, fill: 'forwards' },
      );

      const cleanup = () => clone.remove();
      anim.onfinish = cleanup;
      anim.oncancel = cleanup;
    });
  }, []);

  // FLIP animation for post cards on in-page list changes (tag filter / pagination)
  useLayoutEffect(() => {
    if (!isReady) return;
    if (reduceMotionRef.current) {
      // Keep measurement in sync even if we skip animations
      const listEl = postListRef.current;
      if (!listEl) return;
      const cards = Array.from(listEl.children).filter(
        (child) => child instanceof HTMLElement && child.matches('article[data-post-slug]'),
      );
      const nextRects = new Map();
      cards.forEach((el) => {
        const slug = el.dataset.postSlug;
        if (slug) nextRects.set(slug, el.getBoundingClientRect());
      });
      prevRectsRef.current = nextRects;
      return;
    }

    const listEl = postListRef.current;
    if (!listEl) return;

    const cards = Array.from(listEl.children).filter(
      (child) => child instanceof HTMLElement && child.matches('article[data-post-slug]'),
    );

    const nextRects = new Map();
    cards.forEach((el) => {
      const slug = el.dataset.postSlug;
      if (slug) nextRects.set(slug, el.getBoundingClientRect());
    });

    const prevRects = prevRectsRef.current;

    // First measure after page enter: store positions, don't animate.
    if (prevRects.size === 0) {
      prevRectsRef.current = nextRects;
      return;
    }

    cards.forEach((el) => {
      const slug = el.dataset.postSlug;
      if (!slug) return;

      const newRect = nextRects.get(slug);
      const prevRect = prevRects.get(slug);
      if (!newRect) return;

      // Cancel any in-flight animation for this card before starting a new one
      const existing = runningCardAnimationsRef.current.get(slug);
      if (existing) existing.cancel();

      if (!prevRect) {
        // Entering
        const enterAnim = el.animate(
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0px)' },
          ],
          { duration: ENTER_MS, easing: EASE_OUT, fill: 'both' },
        );

        runningCardAnimationsRef.current.set(slug, enterAnim);
        const cleanup = () => {
          if (runningCardAnimationsRef.current.get(slug) === enterAnim) {
            runningCardAnimationsRef.current.delete(slug);
          }
        };
        enterAnim.onfinish = cleanup;
        enterAnim.oncancel = cleanup;
        return;
      }

      const dx = prevRect.left - newRect.left;
      const dy = prevRect.top - newRect.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

      const moveAnim = el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0px, 0px)' },
        ],
        { duration: MOVE_MS, easing: EASE_SNAP, fill: 'both' },
      );

      runningCardAnimationsRef.current.set(slug, moveAnim);
      const cleanup = () => {
        if (runningCardAnimationsRef.current.get(slug) === moveAnim) {
          runningCardAnimationsRef.current.delete(slug);
        }
      };
      moveAnim.onfinish = cleanup;
      moveAnim.oncancel = cleanup;
    });

    prevRectsRef.current = nextRects;
  }, [isReady, visiblePosts]);

  // Helper: scroll to top smoothly (or instantly if reduced motion)
  const scrollToTop = useCallback((smooth = true) => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = reduceMotionRef.current;
    const behavior = prefersReducedMotion || !smooth ? 'instant' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  }, []);

  // Helper: check if we're scrolled down significantly
  const isScrolledDown = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.scrollY > 100;
  }, []);

  const handlePrev = useCallback(() => {
    const nextPage = Math.max(1, page - 1);
    const nextStart = (nextPage - 1) * POSTS_PER_PAGE;
    const nextVisible = filteredPosts.slice(nextStart, nextStart + POSTS_PER_PAGE);
    
    // Scroll to top instantly when paginating (like turning a page)
    if (isScrolledDown()) {
      scrollToTop(false); // instant scroll for pagination
    }
    
    prepareExitClones(nextVisible.map((p) => p.slug));
    setPage(nextPage);
  }, [page, filteredPosts, prepareExitClones, setPage, isScrolledDown, scrollToTop]);

  const handleNext = useCallback(() => {
    const nextPage = Math.min(totalPages, page + 1);
    const nextStart = (nextPage - 1) * POSTS_PER_PAGE;
    const nextVisible = filteredPosts.slice(nextStart, nextStart + POSTS_PER_PAGE);
    
    // Scroll to top instantly when paginating (like turning a page)
    if (isScrolledDown()) {
      scrollToTop(false); // instant scroll for pagination
    }
    
    prepareExitClones(nextVisible.map((p) => p.slug));
    setPage(nextPage);
  }, [page, totalPages, filteredPosts, prepareExitClones, setPage, isScrolledDown, scrollToTop]);

  const handleTagToggle = useCallback((tag) => {
    const nextSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];

    // Tag changes always jump to page 1
    const nextFilteredPosts = nextSelectedTags.length
      ? posts.filter((post) => nextSelectedTags.every((t) => post.tags.includes(t)))
      : posts;

    const nextVisible = nextFilteredPosts.slice(0, POSTS_PER_PAGE);

    // If scrolled down and content will change significantly, scroll to top
    // - Shrinking: prevents jarring browser scroll adjustment
    // - Expanding: lets user see newly revealed content from the top
    const currentVisibleCount = visiblePosts.length;
    const nextVisibleCount = nextVisible.length;
    const willShrink = nextVisibleCount < currentVisibleCount;
    const willExpand = nextVisibleCount > currentVisibleCount;
    
    if (isScrolledDown() && (willShrink || willExpand)) {
      scrollToTop(true);
    }

    prepareExitClones(nextVisible.map((p) => p.slug));
    setPage(1);
    setSelectedTags(nextSelectedTags);
  }, [selectedTags, visiblePosts.length, prepareExitClones, setPage, setSelectedTags, isScrolledDown, scrollToTop]);

  const resetTags = useCallback(() => {
    const nextVisible = posts.slice(0, POSTS_PER_PAGE);
    
    // When clearing filters while scrolled, scroll to top smoothly
    // since the list is expanding and user should see all content from the top
    if (isScrolledDown()) {
      scrollToTop(true);
    }

    prepareExitClones(nextVisible.map((p) => p.slug));
    setPage(1);
    setSelectedTags([]);
  }, [prepareExitClones, setPage, setSelectedTags, isScrolledDown, scrollToTop]);

  return (
    <div className="frame">
      {/* Header is rendered at App level - outside PageTransition to prevent flicker */}

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

        <div className="post-list" ref={postListRef}>
          <div className="post-list-anim-layer" ref={animLayerRef} />
          {visiblePosts.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              onTagClick={handleTagToggle}
              selectedTags={selectedTags}
              data-post-slug={post.slug}
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



