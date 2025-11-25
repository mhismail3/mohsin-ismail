import React from 'react';
import { Link } from 'react-router-dom';

const AboutPanel = () => (
  <section id="about" className="panel about-panel">
    <div className="about-header">
      <div className="eyebrow">About Me</div>
      <Link to="/about" className="read-more-link">
        Read More &rarr;
      </Link>
    </div>
    <p>I focus on all of the details.</p>
  </section>
);

export default AboutPanel;
