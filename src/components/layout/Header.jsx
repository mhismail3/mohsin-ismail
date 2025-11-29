import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoMark from '../../assets/mohsin.png';

const NAV_LINKS = [
  { label: 'Blog', path: '/blog' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About', path: '/about' },
];

// Duration for the longest close animation (matches CSS)
// Mobile: 0.24s transform + 80ms stagger = ~320ms
// Desktop: 0.22s transform + 80ms stagger = ~300ms
const CLOSE_ANIMATION_DURATION = 350;

// Scroll thresholds for snap-point behavior
const COLLAPSE_THRESHOLD = 80;  // Collapse when scrolled past this
const EXPAND_THRESHOLD = 40;    // Expand back when scrolled above this

const Header = ({ label, onLogoClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const closeTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Simple scroll-based collapse with snap points
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Basic scrolled state for shadow
      setIsScrolled(scrollY > 10);
      
      // Collapse/expand with hysteresis to prevent jitter
      if (!isCollapsed && scrollY >= COLLAPSE_THRESHOLD) {
        setIsCollapsed(true);
      } else if (isCollapsed && scrollY <= EXPAND_THRESHOLD) {
        setIsCollapsed(false);
      }
    };
    
    handleScroll(); // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCollapsed]);

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

  // Close menu on scroll
  useEffect(() => {
    if (!isOpen || isClosing) return;

    const handleScroll = () => {
      closeMenu();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, isClosing, closeMenu]);

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
    }
    if (location.pathname !== '/') {
      navigate('/');
    }
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    if (path === '/') {
      handleHome();
      return;
    }
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

  // Handle brand click - either go home (when expanded) or toggle menu (when collapsed)
  const handleBrandClick = (e) => {
    if (isCollapsed) {
      e.preventDefault();
      toggleMenu();
    } else {
      handleHome();
    }
  };

  // Build nav links - add Home option when collapsed
  const navLinks = isCollapsed
    ? [{ label: 'Home', path: '/' }, ...NAV_LINKS]
    : NAV_LINKS;

  const headerClass = [
    'top-bar',
    isScrolled ? 'scrolled' : '',
    isOpen && !isMobile ? 'expanded' : '',
    isMobile ? '' : 'flyout',
    isCollapsed ? 'collapsed' : '',
  ].filter(Boolean).join(' ');
  
  const menuClass = [
    'top-menu',
    isOpen ? 'visible' : '',
    isClosing ? 'closing' : '',
    isMobile ? 'mobile' : 'desktop',
    isCollapsed ? 'from-collapsed' : '',
  ].filter(Boolean).join(' ');
  
  const brandMarkClass = [
    'brand-mark',
    isCollapsed ? 'clickable' : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClass}>
      <div className="top-bar-row">
        <button 
          className="brand" 
          type="button" 
          onClick={handleBrandClick} 
          aria-label={isCollapsed ? 'Open navigation menu' : 'Go to home'}
        >
          <span className={brandMarkClass}>
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
          {navLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              className={`btn outline small ${location.pathname === link.path ? 'active' : ''} ${link.path === '/' ? 'home-link' : ''}`}
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



