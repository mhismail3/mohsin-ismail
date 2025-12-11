import React, { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks';
import { posts, uniqueTags } from '../data';
import { PostCard, Pagination, TagCloud, AboutPanel } from '../components/features';
import { Button } from '../components/ui';

const POSTS_PER_PAGE = 10;

function BlogPage({ selectedTags, setSelectedTags, page, setPage }) {
  const [searchParams, setSearchParams] = useSearchParams();
  usePageTitle('Blog - Mohsin Ismail');

  // Initialize selected tags from URL search params on mount
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl && uniqueTags.includes(tagFromUrl)) {
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
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePrev = () => setPage((value) => Math.max(1, value - 1));
  const handleNext = () => setPage((value) => Math.min(totalPages, value + 1));
  const handleTagToggle = (tag) =>
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  const resetTags = () => setSelectedTags([]);

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

        <div className="post-list">
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} onTagClick={handleTagToggle} selectedTags={selectedTags} />
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



