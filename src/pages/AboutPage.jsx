import React from 'react';
import { usePageTitle } from '../hooks';
import { Header } from '../components/layout';
import { AboutContent } from '../components/features';

const AboutPage = () => {
  usePageTitle('About - Mohsin Ismail');

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

