import React from 'react';
import { usePageTitle } from '../hooks';
import { AboutContent, AboutPanel } from '../components/features';

const AboutPage = () => {
  usePageTitle('About - Mohsin Ismail');

  return (
    <div className="frame">
      {/* Header is rendered at App level - outside PageTransition to prevent flicker */}
      <section className="panel about-panel about-page-panel">
        <AboutContent />
      </section>

      <AboutPanel />
    </div>
  );
};

export default AboutPage;
