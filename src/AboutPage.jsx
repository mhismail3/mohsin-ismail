import React, { useEffect } from 'react';
import Header from './components/Header';
import AboutContent from './components/AboutContent';

const AboutPage = () => {
  useEffect(() => {
    document.title = 'About - Mohsin Ismail';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" />
      <section className="panel about-panel about-page-panel">
        <AboutContent />
      </section>
    </div>
  );
};

export default AboutPage;
