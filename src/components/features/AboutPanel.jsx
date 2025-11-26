import React from 'react';
import { Link } from 'react-router-dom';

const AboutPanel = () => (
  <section id="about" className="panel about-panel">
    <div className="panel-head">
      <div className="eyebrow">About Me</div>
      <Link to="/about" className="see-all-link">
        Read More &rarr;
      </Link>
    </div>
    <div className="about-body">
      <p>Details-focused developer with a passion for AI and the future of software development.</p>
    </div>
  </section>
);

export default AboutPanel;
