import React from 'react';
import { usePageTitle } from '../hooks';
import { Header } from '../components/layout';
import { AboutContent, contactLinks } from '../components/features';

const AboutPage = () => {
  usePageTitle('About - Mohsin Ismail');

  return (
    <div className="frame">
      <Header label="Mohsin Ismail" />
      <section className="panel about-panel about-page-panel">
        <AboutContent />
      </section>
      
      <section className="panel about-panel-compact">
        <div className="panel-head">
          <div className="eyebrow">Get in Touch</div>
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
    </div>
  );
};

export default AboutPage;



