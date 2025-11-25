import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoMark from '../assets/mohsin.png';

const NAV_LINKS = [
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About', path: '/about' },
];

// Duration for the longest close animation (matches CSS)
const CLOSE_ANIMATION_DURATION = 220;

const Header = ({ label, onLogoClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const closeTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const closeMenu = useCallback(() => {
    if (!isOpen || isClosing) return;
    
    // Start closing animation
    setIsClosing(true);
    
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    // After animation completes, fully close
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, CLOSE_ANIMATION_DURATION);
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (isOpen) {
      closeMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const setMatches = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.matchMedia('(max-width: 840px)').matches);
    };
    setMatches();
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 840px)');
    const handler = (event) => setIsMobile(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const handleHome = () => {
    if (onLogoClick) {
      onLogoClick();
    } else if (location.pathname !== '/') {
      navigate('/');
    }
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      // Clear any pending close animation
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsClosing(false);
      setIsOpen(true);
    }
  };

  const headerClass = `top-bar ${isOpen && !isMobile ? 'expanded' : ''} ${isMobile ? '' : 'flyout'}`;
  const menuClass = `top-menu ${isOpen ? 'visible' : ''} ${isClosing ? 'closing' : ''} ${isMobile ? 'mobile' : 'desktop'}`;

  return (
    <header className={headerClass}>
      <div className="top-bar-row">
        <button className="brand" type="button" onClick={handleHome} aria-label="Go to home">
          <span className="brand-mark">
            <span className="brand-mark-inner">
              <img src={logoMark} alt="Mohsin Ismail logo" />
            </span>
          </span>
          <span className="brand-name">{label}</span>
        </button>
        <button
          type="button"
          className={`btn outline small menu-toggle ${isOpen ? 'active' : ''}`}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Hide navigation' : 'Show navigation'}
          onClick={toggleMenu}
        >
          <span className="toggle-icon-wrap">
            <svg className={`icon toggle-icon ellipsis ${!isOpen ? 'visible' : ''}`} viewBox="0 0 32 10" aria-hidden="true" focusable="false">
              <circle cx="6" cy="5" r="2.1" />
              <circle cx="16" cy="5" r="2.1" />
              <circle cx="26" cy="5" r="2.1" />
            </svg>
            {isMobile ? (
              <svg className={`icon toggle-icon chevron-up ${isOpen ? 'visible' : ''}`} viewBox="0 0 20 12" aria-hidden="true" focusable="false">
                <path d="M3 9L10 2l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className={`icon toggle-icon chevron-right ${isOpen ? 'visible' : ''}`} viewBox="0 0 14 16" aria-hidden="true" focusable="false">
                <path d="M4.5 3L10 8l-5.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </span>
        </button>
      </div>
      <div
        className={menuClass}
        aria-hidden={!isOpen}
      >
        <div className="top-menu-content">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              type="button"
              className={`btn outline small ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => handleNav(link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
