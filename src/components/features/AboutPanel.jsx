import React from 'react';
import { Link } from 'react-router-dom';
import { contactLinks } from './AboutContent';

const AboutPanel = () => (
  <section id="about" className="panel about-panel about-panel-compact">
    <div className="panel-head">
      <div className="eyebrow">Get in Touch</div>
      <Link to="/about" className="see-all-link">
        More about me &rarr;
      </Link>
    </div>
    <div className="about-body">
      <div className="contact-links contact-links-compact">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            className="contact-icon-btn"
            href={link.href}
            aria-label={link.label}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noreferrer' : undefined}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default AboutPanel;
