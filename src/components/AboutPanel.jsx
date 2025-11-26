import React from 'react';
import { Link } from 'react-router-dom';

const AboutPanel = () => (
  <section id="about" className="panel about-panel">
    <div className="eyebrow">About Me</div>
    <div className="about-body">
      <p>Details-focused developer with a passion for AI and the future of software development.</p>
      <Link to="/about" className="read-more-link">
        Read More &rarr;
      </Link>
    </div>
  </section>
);

export default AboutPanel;
