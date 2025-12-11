import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks';
import { usePageTransition } from '../../contexts';
import useTouchDrag from '../../hooks/useTouchDrag';
import { Icon } from '../ui';
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
  // Track which nav button is being touch-pressed (by path)
  const [touchPressedPath, setTouchPressedPath] = useState(null);
  // Remember the collapsed state when menu was opened (for smooth close animations)
  const [openedWhileCollapsed, setOpenedWhileCollapsed] = useState(false);
  
  const closeTimeoutRef = useRef(null);
  const touchStartRef = useRef(null); // Track touch start position
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  
  // Get navigation state from PageTransitionContext
  // During navigation, we suspend scroll-based behavior to prevent flicker
  const { isNavigating } = usePageTransition();

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Reset collapsed state when navigation starts
  // This ensures header is in expanded state when new page loads
  useEffect(() => {
    if (isNavigating) {
      setIsCollapsed(false);
      setIsScrolled(false);
    }
  }, [isNavigating]);

  // Simple scroll-based collapse with snap points
  // SUSPENDED during navigation to prevent flicker
  useEffect(() => {
    // Don't react to scroll during page transitions
    if (isNavigating) return;
    
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
  }, [isCollapsed, isNavigating]);

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

  const handleHome = useCallback(() => {
    if (onLogoClick) {
      onLogoClick();
    }
    if (location.pathname !== '/') {
      navigate('/');
    }
    closeMenu();
    // Scroll-to-top is handled by PageTransitionContext on navigation
    // Only scroll if staying on same page
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onLogoClick, location.pathname, navigate, closeMenu]);

  const handleNav = (path) => {
    if (path === '/') {
      handleHome();
      return;
    }
    if (location.pathname !== path) {
      navigate(path);
    }
    closeMenu();
    // Scroll-to-top is handled by PageTransitionContext on navigation
    // Only scroll if staying on same page
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Touch handlers for nav buttons - navigate only on touch release (like desktop click)
  const handleNavTouchStart = (e, path) => {
    // Store the path being pressed and initial touch position
    setTouchPressedPath(path);
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, target: e.currentTarget };
  };

  const handleNavTouchMove = (e) => {
    // Cancel if finger moves too far from start position (allows scrolling)
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // If moved more than 10px, cancel the press
    if (dx > 10 || dy > 10) {
      setTouchPressedPath(null);
      touchStartRef.current = null;
    }
  };

  const handleNavTouchEnd = (e, path) => {
    // Only navigate if this button is still being pressed
    if (touchPressedPath === path) {
      e.preventDefault(); // Prevent click event from also firing
      handleNav(path);
    }
    setTouchPressedPath(null);
    touchStartRef.current = null;
  };

  const handleNavTouchCancel = () => {
    setTouchPressedPath(null);
    touchStartRef.current = null;
  };

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      // Clear any pending close animation
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsClosing(false);
      // Remember the collapsed state when opening - this determines menu position
      // throughout the open/close cycle, avoiding position jumps during scroll
      setOpenedWhileCollapsed(isCollapsed);
      setIsOpen(true);
    }
  }, [isOpen, isCollapsed, closeMenu]);

  // Callback for when photo icon is tapped/clicked (without dragging)
  // Behavior depends on header state:
  // - Collapsed: toggle the navigation menu
  // - Expanded: go to home page
  const handlePhotoTap = useCallback(() => {
    if (isCollapsed) {
      toggleMenu();
    } else {
      handleHome();
    }
  }, [isCollapsed, toggleMenu, handleHome]);

  // Drag hook for photo icon - works on ALL devices (touch + mouse)
  // Enables playful drag-and-release interaction with snap-back animation
  // Also prevents native image drag behavior (save image on desktop)
  const {
    ref: dragRef,
    isDragging,
    isSnapping,
  } = useTouchDrag({
    enabled: true, // Always enabled - works on all devices
    onTap: handlePhotoTap,
    dragThreshold: 8, // Pixels before drag activates
    tapTimeout: 200,  // Max ms for tap/click detection
    snapDuration: 450, // Spring snap-back duration
    dragScale: 1.08, // Scale up during drag
    boundsPadding: 12, // Padding from viewport/safe area edges
  });

  // Handle brand button click - coordinates with the drag hook on the photo.
  // The drag hook handles tap/click on the photo; this handler covers the brand-name text.
  const handleBrandClick = useCallback((e) => {
    // The drag hook handles all interactions directly on the photo (brand-mark-inner).
    // Check if click originated from within the brand-mark to avoid double-handling.
    const brandMark = e.currentTarget.querySelector('.brand-mark');
    if (brandMark && brandMark.contains(e.target)) {
      // Click was on the photo area - drag hook already handled this interaction.
      // Just prevent default button behavior.
      e.preventDefault();
      return;
    }
    
    // Click was on the brand-name text (visible in non-collapsed state).
    // Navigate home when not collapsed.
    if (!isCollapsed) {
      handleHome();
    }
    // When collapsed, CSS pointer-events prevents clicks on brand-name anyway,
    // but this is a safety fallback if the event somehow fires.
  }, [isCollapsed, handleHome]);

  // Build nav links - add Home option when collapsed
  const navLinks = isCollapsed
    ? [{ label: 'Home', path: '/' }, ...NAV_LINKS]
    : NAV_LINKS;

  // Determine if a nav link should be active
  // - Home: exact match on '/'
  // - Blog: '/blog' or any '/posts/*' route
  // - Portfolio: '/portfolio' or any '/portfolio/*' route (project details)
  // - About: exact match on '/about'
  const isLinkActive = (linkPath) => {
    const currentPath = location.pathname;
    
    if (linkPath === '/') {
      return currentPath === '/';
    }
    if (linkPath === '/blog') {
      return currentPath === '/blog' || currentPath.startsWith('/posts/');
    }
    if (linkPath === '/portfolio') {
      return currentPath.startsWith('/portfolio');
    }
    return currentPath === linkPath;
  };

  const headerClass = [
    'top-bar',
    isScrolled ? 'scrolled' : '',
    isOpen && !isMobile ? 'expanded' : '',
    isMobile ? '' : 'flyout',
    isCollapsed ? 'collapsed' : '',
    isNavigating ? 'navigating' : '',
  ].filter(Boolean).join(' ');
  
  const menuClass = [
    'top-menu',
    isOpen ? 'visible' : '',
    isClosing ? 'closing' : '',
    isMobile ? 'mobile' : 'desktop',
    // Use the remembered state from when menu was opened, not current state
    // This prevents the menu from jumping position if header collapses during close animation
    openedWhileCollapsed ? 'from-collapsed' : '',
  ].filter(Boolean).join(' ');
  
  const brandMarkClass = [
    'brand-mark',
    'draggable', // Always draggable now
    isCollapsed ? 'clickable' : '',
    isDragging ? 'dragging' : '',
    isSnapping ? 'snapping' : '',
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
            <span 
              ref={dragRef}
              className="brand-mark-inner"
            >
              <img src={logoMark} alt="Mohsin Ismail logo" />
            </span>
          </span>
          <span className="brand-name">{label}</span>
        </button>
        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-icon-wrap">
              <Icon name="sun" size={18} className={`theme-icon sun ${!isDark ? 'visible' : ''}`} />
              <Icon name="moon" size={18} className={`theme-icon moon ${isDark ? 'visible' : ''}`} />
            </span>
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
              <svg className={`icon toggle-icon chevron-up ${isOpen ? 'visible' : ''}`} viewBox="0 0 20 12" aria-hidden="true" focusable="false">
                <path d="M3 9L10 2l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        </div>
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
              className={`btn outline small ${isLinkActive(link.path) ? 'active' : ''} ${link.path === '/' ? 'home-link' : ''} ${touchPressedPath === link.path ? 'touch-pressed' : ''}`}
              onClick={() => handleNav(link.path)}
              onTouchStart={(e) => handleNavTouchStart(e, link.path)}
              onTouchMove={handleNavTouchMove}
              onTouchEnd={(e) => handleNavTouchEnd(e, link.path)}
              onTouchCancel={handleNavTouchCancel}
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



