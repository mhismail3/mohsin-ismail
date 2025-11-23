import React, { useEffect, useMemo, useState } from 'react';
import posts, { uniqueTags } from './posts';

const POSTS_PER_PAGE = 10;

const formatDate = (value) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

const Header = ({ label, onReset }) => (
  <header className="top-bar">
    <button className="brand" type="button" onClick={onReset} aria-label="Reset tag filter">
      <span className="brand-name">{label}</span>
    </button>
    <a className="btn outline about" href="#about">
      About
    </a>
  </header>
);

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

const PostCard = ({ post, onTagClick }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={`post-card ${expanded ? 'expanded' : ''}`}>
      <div className="post-head">
        <div className="eyebrow">{formatDate(post.date)}</div>
        <h3>{post.title}</h3>
        <p className="muted">{post.summary}</p>
      </div>

      <div className="tag-row">
        {post.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="pill small"
            onClick={() => onTagClick(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="post-actions">
        <button
          type="button"
          className="btn outline small"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Hide post' : 'Read post'}
        </button>
      </div>

      {expanded && (
        <div
          className="post-body"
          dangerouslySetInnerHTML={{
            __html: post.content,
          }}
        />
      )}
    </article>
  );
};

const Pagination = ({ page, totalPages, onPrev, onNext }) => (
  <div className="pagination">
    <button type="button" className="btn outline small" onClick={onPrev} disabled={page === 1}>
      Previous
    </button>
    <span className="muted">
      Page {page} of {totalPages}
    </span>
    <button
      type="button"
      className="btn outline small"
      onClick={onNext}
      disabled={page >= totalPages}
    >
      Next
    </button>
  </div>
);

const AboutPanel = () => (
  <section id="about" className="panel about-panel">
    <div className="eyebrow">About</div>
    <h2>Mohsin Ismail</h2>
    <p>
      Product-minded engineer and designer focused on tactile, dependable web experiences. I ship
      crisp interfaces, thoughtful systems, and durable documentation to keep teams fast.
    </p>
    <p className="muted">
      This portfolio collects experiments, shipped products, and notes on building approachable
      tools. Tap tags above to filter by theme or discipline.
    </p>
  </section>
);

function App() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTags]);

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
  const displayLabel = 'Mohsin Ismail';

  const handlePrev = () => setPage((value) => Math.max(1, value - 1));
  const handleNext = () => setPage((value) => Math.min(totalPages, value + 1));
  const handleTagToggle = (tag) =>
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  const resetTags = () => setSelectedTags([]);

  return (
    <div className="app">
      <div className="grain" aria-hidden="true" />
      <div className="frame">
        <Header label={displayLabel} onReset={resetTags} />

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

        <section className="panel posts-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Posts</div>
              <h2>Latest</h2>
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
              <PostCard key={post.slug} post={post} onTagClick={handleTagToggle} />
            ))}
            {visiblePosts.length === 0 && (
              <div className="empty-state">
                <p>No posts match these tags yet.</p>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext} />
        </section>

        <AboutPanel />
      </div>
    </div>
  );
}

export default App;
