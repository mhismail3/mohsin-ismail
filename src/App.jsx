import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Home,
  BlogPage,
  PostPage,
  AboutPage,
  PortfolioPage,
  ProjectPage,
} from './pages';
import { PageTransition, Header } from './components/layout';
import { PageTransitionProvider, usePageTransition } from './contexts';
import logoMark from './assets/mohsin.png';

/**
 * AppContent - Inner component that uses the page transition context
 * 
 * The animation trigger class is applied to the .app container, which is
 * the common parent of both Header and PageTransition. This ensures both
 * animate together from a single source of truth.
 */
function AppContent({ selectedTags, setSelectedTags, page, setPage, resetTags }) {
  const { isReady } = usePageTransition();
  
  // Single animation class on the common parent ensures synchronized animation
  const appClassName = isReady 
    ? 'app app-transition-ready' 
    : 'app app-transition-init';

  return (
    <div className={appClassName}>
      {/* Header lives OUTSIDE PageTransition so it never remounts on navigation */}
      {/* Animation is triggered via parent .app class for perfect sync with content */}
      <Header label="Mohsin Ismail" onLogoClick={resetTags} />
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
  );
}

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

  // Callback to reset tags when logo is clicked (for BlogPage)
  const resetTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  return (
    <Router>
      <PageTransitionProvider>
        <AppContent
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          page={page}
          setPage={setPage}
          resetTags={resetTags}
        />
      </PageTransitionProvider>
    </Router>
  );
}

export default App;
