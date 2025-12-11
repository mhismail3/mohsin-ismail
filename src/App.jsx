import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Home,
  BlogPage,
  PostPage,
  AboutPage,
  PortfolioPage,
  ProjectPage,
} from './pages';
import { PageTransition } from './components/layout';
import { PageTransitionProvider } from './contexts';
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

  // Reset page when tags change (scroll is handled by PageTransitionContext)
  useEffect(() => {
    setPage(1);
  }, [selectedTags]);

  return (
    <Router>
      <PageTransitionProvider>
        <div className="app">
          <PageTransition>
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
          </PageTransition>
        </div>
      </PageTransitionProvider>
    </Router>
  );
}

export default App;
