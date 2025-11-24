import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoMark from '../assets/mohsin.png';

const NAV_LINKS = [
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About', path: '/about' },
];

const EllipsisIcon = () => (
  <svg className="icon" viewBox="0 0 32 10" aria-hidden="true" focusable="false">
    <circle cx="6" cy="5" r="2.1" />
    <circle cx="16" cy="5" r="2.1" />
    <circle cx="26" cy="5" r="2.1" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="icon" viewBox="0 0 20 12" aria-hidden="true" focusable="false">
    <path d="M3 9L10 2l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="icon" viewBox="0 0 14 16" aria-hidden="true" focusable="false">
    <path d="M9.5 3L4 8l5.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Header = ({ label, onLogoClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const menuContentRef = useRef(null);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const syncMenuHeight = useCallback(() => {
    if (!menuContentRef.current) return;
    const nextHeight = menuContentRef.current.scrollHeight;
    setMenuHeight((prev) => (prev === nextHeight ? prev : nextHeight));
  }, []);

  useLayoutEffect(() => {
    syncMenuHeight();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && menuContentRef.current
        ? new ResizeObserver(syncMenuHeight)
        : null;

    window.addEventListener('resize', syncMenuHeight);

    if (resizeObserver && menuContentRef.current) {
      resizeObserver.observe(menuContentRef.current);
    }

    return () => {
      window.removeEventListener('resize', syncMenuHeight);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [syncMenuHeight]);

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
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMenu = () => {
    syncMenuHeight();
    setIsOpen((value) => !value);
  };

  const headerClass = `top-bar ${isOpen ? 'expanded' : ''} ${isMobile ? '' : 'flyout'}`;
  const menuClass = `top-menu ${isOpen ? 'visible' : ''} ${isMobile ? '' : 'desktop'}`;

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
          {isMobile ? (isOpen ? <ChevronUpIcon /> : <EllipsisIcon />) : isOpen ? <ChevronLeftIcon /> : <EllipsisIcon />}
        </button>
      </div>
      <div
        className={menuClass}
        aria-hidden={!isOpen}
        ref={menuRef}
        style={isMobile ? { '--menu-height': `${Math.max(menuHeight, 1)}px` } : undefined}
      >
        <div className="top-menu-content" ref={menuContentRef}>
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
