import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle, useTapFeedback } from '../hooks';
import { posts, portfolioProjects } from '../data';
import { AboutPanel, PostCard } from '../components/features';

const RECENT_POSTS_COUNT = 3;

function Home() {
  usePageTitle('Mohsin Ismail');
  const { getTapProps } = useTapFeedback();

  // Get the most recent portfolio project
  const featuredProject = portfolioProjects[0];
  
  // Get the latest posts (already sorted by date in posts.js)
  const recentPosts = posts.slice(0, RECENT_POSTS_COUNT);

  return (
    <div className="frame">
      {/* Header is rendered at App level - outside PageTransition to prevent flicker */}

      {/* Recent Posts Section */}
      <section className="panel posts-panel recent-posts-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">Recent Posts</div>
          </div>
          <Link to="/blog" className="see-all-link" {...getTapProps()}>
            View all posts &rarr;
          </Link>
        </div>

        <div className="post-list">
          {recentPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
          {recentPosts.length === 0 && (
            <div className="empty-state">
              <p>No posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Project Section */}
      {featuredProject && (
        <section className="panel featured-project-panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Latest Project</div>
            </div>
            <Link to="/portfolio" className="see-all-link" {...getTapProps()}>
              See other projects &rarr;
            </Link>
          </div>
          <Link to={`/portfolio/${featuredProject.slug}`} className="featured-project-card">
            <div className="featured-project-media">
              <img
                src={featuredProject.image}
                alt={featuredProject.title}
                loading="eager"
              />
              <div className="project-pill">
                <span className="pill-label">{featuredProject.title}</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <AboutPanel />
    </div>
  );
}

export default Home;
