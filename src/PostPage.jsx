import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import posts from './posts';
import Header from './components/Header';
import AboutPanel from './components/AboutPanel';
import { formatDate } from './utils';

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Mohsin Ismail`;
    } else {
      document.title = 'Post Not Found - Mohsin Ismail';
    }
    window.scrollTo(0, 0);
  }, [post]);

  if (!post) {
    return (
      <div className="frame">
        <Header label="Mohsin Ismail" onLogoClick={() => navigate('/')} />
        <section className="panel">
          <div className="eyebrow">404</div>
          <h2>Post not found</h2>
          <Link to="/" className="btn outline">
            Return Home
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" onLogoClick={() => navigate('/')} />

      <article className="panel post-page">
        <div className="post-page-head">
          <Link to="/" className="back-link">
            ← All Posts
          </Link>
          <div className="eyebrow">{formatDate(post.date)}</div>
          <h1 className="post-title">{post.title}</h1>
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span key={tag} className="pill small disabled">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div
          className="post-body full-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="post-footer">
          <div className="divider" />
          <Link to="/" className="btn outline">
            Back to all posts
          </Link>
        </div>
      </article>

      <AboutPanel />
    </div>
  );
};

export default PostPage;



