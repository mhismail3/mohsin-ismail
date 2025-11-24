import React from 'react';
import logoMark from '../assets/mohsin.png';

const Header = ({ label, onLogoClick }) => (
  <header className="top-bar">
    <button className="brand" type="button" onClick={onLogoClick} aria-label="Go to home">
      <span className="brand-mark">
        <span className="brand-mark-inner">
          <img src={logoMark} alt="Mohsin Ismail logo" />
        </span>
      </span>
      <span className="brand-name">{label}</span>
    </button>
    <a className="btn outline about" href="/#about">
      About
    </a>
  </header>
);

export default Header;



