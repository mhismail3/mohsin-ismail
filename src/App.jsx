import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Home,
  BlogPage,
  PostPage,
  AboutPage,
  PortfolioPage,
  ProjectPage,
} from './pages';
import logoMark from './assets/mohsin.png';

function App() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const existingIcon = document.querySelector('link[rel="icon"]');
    const icon = existingIcon || document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/png';
    icon.href = logoMark;
    if (!existingIcon) {
      document.head.appendChild(icon);
    }
  }, []);

  // Reset page and scroll to top when tags change
  useEffect(() => {
    setPage(1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTags]);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/blog"
            element={
              <BlogPage
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                page={page}
                setPage={setPage}
              />
            }
          />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:slug" element={<ProjectPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
