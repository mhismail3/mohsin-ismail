import React, { useEffect, useMemo } from 'react';
import posts, { uniqueTags } from './posts';
import Header from './components/Header';
import PostCard from './components/PostCard';

const POSTS_PER_PAGE = 10;

const TagCloud = ({ tags, selectedTags, onToggle, onClear }) => (
  <div className="tag-cloud">
    {tags.map((tag) => (
      <button
        key={tag}
        type="button"
        className={`pill ${selectedTags.includes(tag) ? 'active' : ''}`}
        onClick={() => onToggle(tag)}
      >
        #{tag}
      </button>
    ))}
    {selectedTags.length > 0 && onClear && (
      <button type="button" className="pill reset" onClick={onClear}>
        Clear tags
      </button>
    )}
  </div>
);

const Pagination = ({ page, totalPages, onPrev, onNext }) => (
  <div className="pagination">
    <button type="button" className="btn outline small" onClick={onPrev} disabled={page === 1}>
      <span className="pagination-text">Previous</span>
      <span className="pagination-arrow">←</span>
    </button>
    <span className="muted pagination-status">
      Page {page} of {totalPages}
    </span>
    <button
      type="button"
      className="btn outline small"
      onClick={onNext}
      disabled={page >= totalPages}
    >
      <span className="pagination-text">Next</span>
      <span className="pagination-arrow">→</span>
    </button>
  </div>
);

function BlogPage({ selectedTags, setSelectedTags, page, setPage }) {
  useEffect(() => {
    document.title = 'Blog - Mohsin Ismail';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredPosts = useMemo(
    () =>
      selectedTags.length
        ? posts.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
        : posts,
    [selectedTags],
  );

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
      <Header label="Mohsin Ismail" onLogoClick={resetTags} />

      <section className="panel posts-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">All Posts</div>
          </div>
          <div className="active-tags">
            {selectedTags.length > 0 && (
              <>
                <div className="tag-cloud">
                  {selectedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="pill active small"
                      onClick={() => handleTagToggle(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <button type="button" className="btn outline small" onClick={resetTags}>
                  Clear tags
                </button>
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

        <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
      </section>

      <section className="panel hero">
        <div className="eyebrow">Filter by Tag</div>
        {uniqueTags.length > 0 && (
          <div className="filter-row">
            <TagCloud
              tags={uniqueTags}
              selectedTags={selectedTags}
              onToggle={handleTagToggle}
              onClear={resetTags}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default BlogPage;

