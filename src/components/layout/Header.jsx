import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useTouchDrag, useShimmerFollow, useIsTouch } from '../../hooks';
import { usePageTransition, useFilterTransition } from '../../contexts';
import { Icon } from '../ui';
import logoMark from '../../assets/mohsin.png';

const NAV_LINKS = [
  { label: 'Blog', path: '/blog' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'About', path: '/about' },
];

// Duration for the longest close animation (matches CSS)
// Mobile/Desktop: 0.24s transform + 120ms stagger = ~360ms
// Using 400ms to ensure all 4 buttons complete their animations
const CLOSE_ANIMATION_DURATION = 400;

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
  // When true, menu hides instantly without CSS transitions (prevents phantom buttons during navigation)
  const [instantHide, setInstantHide] = useState(false);
  
  // Mobile FAB menu state (separate from header menu)
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isFabMenuClosing, setIsFabMenuClosing] = useState(false);
  const [fabInstantHide, setFabInstantHide] = useState(false);
  // Track which FAB nav button is being touch-pressed
  const [fabTouchPressedPath, setFabTouchPressedPath] = useState(null);
  
  const closeTimeoutRef = useRef(null);
  const fabCloseTimeoutRef = useRef(null);
  const touchStartRef = useRef(null); // Track touch start position
  const fabTouchStartRef = useRef(null); // Track FAB touch start position
  const fabContainerRef = useRef(null); // Ref for FAB container (for click-outside detection)
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  
  // Get navigation state from PageTransitionContext
  // During navigation, we suspend scroll-based behavior to prevent flicker
  // Animation is now controlled via parent .app class (see App.jsx)
  const { isNavigating } = usePageTransition();
  
  // Get filter transition state - during filtering, we suspend scroll reactions
  // but we DON'T immediately reset collapsed state (header stays as-is during fade-out)
  const { isFiltering, filterPhase } = useFilterTransition();
  
  // Suspend scroll reactions during navigation OR filtering
  const isSuspended = isNavigating || isFiltering;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (fabCloseTimeoutRef.current) clearTimeout(fabCloseTimeoutRef.current);
    };
  }, []);

  // Reset collapsed state when NAVIGATION starts (not filtering)
  // For filtering, we let the header stay as-is during fade-out, then
  // the scroll listener will naturally update state after the invisible scroll
  // 
  // CRITICAL: Must use useLayoutEffect (not useEffect) to ensure state changes
  // happen synchronously BEFORE the browser paints. This prevents a visual flash
  // where the collapsed header briefly expands before opacity:0 takes effect.
  useLayoutEffect(() => {
    if (isNavigating) {
      setIsCollapsed(false);
      setIsScrolled(false);
    }
  }, [isNavigating]);
  
  // When filter transition starts fading out, the invisible scroll has just happened.
  // Check scroll position IMMEDIATELY so header can start expanding right away,
  // rather than waiting for the entire transition to complete.
  // This makes the header feel much more responsive when clicking tags from bottom of page.
  useEffect(() => {
    if (filterPhase === 'out') {
      // The invisible scroll just happened - check position and expand if needed
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);
      if (scrollY <= EXPAND_THRESHOLD) {
        setIsCollapsed(false);
      }
    }
  }, [filterPhase]);

  // Simple scroll-based collapse with snap points
  // SUSPENDED during navigation and filtering to prevent flicker
  useEffect(() => {
    // Don't react to scroll during page transitions or filter transitions
    if (isSuspended) return;
    
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
  }, [isCollapsed, isSuspended]);

  // Close menu with animation (for non-navigation closures like scroll, tap outside, etc.)
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

  // Close menu instantly without animation (for navigation - prevents phantom button artifacts)
  const closeMenuInstantly = useCallback(() => {
    if (!isOpen) return;
    
    // Clear any pending close animation
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Set instant-hide flag to disable CSS transitions, then close
    setInstantHide(true);
    setIsOpen(false);
    setIsClosing(false);
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE FAB MENU FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Close FAB menu with animation
  const closeFabMenu = useCallback(() => {
    if (!isFabMenuOpen || isFabMenuClosing) return;
    
    setIsFabMenuClosing(true);
    
    if (fabCloseTimeoutRef.current) {
      clearTimeout(fabCloseTimeoutRef.current);
    }
    
    fabCloseTimeoutRef.current = setTimeout(() => {
      setIsFabMenuOpen(false);
      setIsFabMenuClosing(false);
    }, CLOSE_ANIMATION_DURATION);
  }, [isFabMenuOpen, isFabMenuClosing]);

  // Close FAB menu instantly (for navigation)
  const closeFabMenuInstantly = useCallback(() => {
    if (!isFabMenuOpen) return;
    
    if (fabCloseTimeoutRef.current) {
      clearTimeout(fabCloseTimeoutRef.current);
      fabCloseTimeoutRef.current = null;
    }
    
    setFabInstantHide(true);
    setIsFabMenuOpen(false);
    setIsFabMenuClosing(false);
  }, [isFabMenuOpen]);

  // Toggle FAB menu
  const toggleFabMenu = useCallback(() => {
    if (isFabMenuOpen) {
      closeFabMenu();
    } else {
      if (fabCloseTimeoutRef.current) {
        clearTimeout(fabCloseTimeoutRef.current);
        fabCloseTimeoutRef.current = null;
      }
      setIsFabMenuClosing(false);
      setFabInstantHide(false);
      setIsFabMenuOpen(true);
    }
  }, [isFabMenuOpen, closeFabMenu]);

  // FAB photo tap handler
  const handleFabPhotoTap = useCallback(() => {
    toggleFabMenu();
  }, [toggleFabMenu]);

  // Close menu instantly on any location change (fallback for browser back/forward, etc.)
  // This uses instant close to prevent phantom button artifacts during page transitions
  useEffect(() => {
    if (isOpen) {
      closeMenuInstantly();
    }
    if (isFabMenuOpen) {
      closeFabMenuInstantly();
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

  // Close FAB menu on scroll
  useEffect(() => {
    if (!isFabMenuOpen || isFabMenuClosing) return;

    const handleScroll = () => {
      closeFabMenu();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFabMenuOpen, isFabMenuClosing, closeFabMenu]);

  // Close FAB menu when header expands (scrolling back up)
  useEffect(() => {
    if (!isCollapsed && isFabMenuOpen) {
      closeFabMenuInstantly();
    }
  }, [isCollapsed, isFabMenuOpen, closeFabMenuInstantly]);

  // Close FAB menu when tapping outside of it
  useEffect(() => {
    if (!isFabMenuOpen || isFabMenuClosing) return;

    const handleClickOutside = (e) => {
      // Check if the tap/click is outside the FAB container
      if (fabContainerRef.current && !fabContainerRef.current.contains(e.target)) {
        closeFabMenu();
      }
    };

    // Use a small delay to prevent the opening tap from immediately closing the menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside, { passive: true });
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isFabMenuOpen, isFabMenuClosing, closeFabMenu]);

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
      // Navigating to a different page - close instantly to prevent phantom buttons
      closeMenuInstantly();
      navigate('/');
    } else {
      // Staying on same page - use animated close
      closeMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onLogoClick, location.pathname, navigate, closeMenu, closeMenuInstantly]);

  const handleNav = (path) => {
    if (path === '/') {
      handleHome();
      return;
    }
    if (location.pathname !== path) {
      // Navigating to a different page - close instantly to prevent phantom buttons
      closeMenuInstantly();
      navigate(path);
    } else {
      // Staying on same page - use animated close
      closeMenu();
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

  // ═══════════════════════════════════════════════════════════════════════════
  // FAB MENU NAVIGATION HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleFabNav = (path) => {
    if (path === '/') {
      if (onLogoClick) {
        onLogoClick();
      }
      if (location.pathname !== '/') {
        closeFabMenuInstantly();
        navigate('/');
      } else {
        closeFabMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (location.pathname !== path) {
      closeFabMenuInstantly();
      navigate(path);
    } else {
      closeFabMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // FAB touch handlers for nav buttons
  const handleFabNavTouchStart = (e, path) => {
    setFabTouchPressedPath(path);
    const touch = e.touches[0];
    fabTouchStartRef.current = { x: touch.clientX, y: touch.clientY, target: e.currentTarget };
  };

  const handleFabNavTouchMove = (e) => {
    if (!fabTouchStartRef.current) return;
    
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - fabTouchStartRef.current.x);
    const dy = Math.abs(touch.clientY - fabTouchStartRef.current.y);
    
    if (dx > 10 || dy > 10) {
      setFabTouchPressedPath(null);
      fabTouchStartRef.current = null;
    }
  };

  const handleFabNavTouchEnd = (e, path) => {
    if (fabTouchPressedPath === path) {
      e.preventDefault();
      handleFabNav(path);
    }
    setFabTouchPressedPath(null);
    fabTouchStartRef.current = null;
  };

  const handleFabNavTouchCancel = () => {
    setFabTouchPressedPath(null);
    fabTouchStartRef.current = null;
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
      // Clear instant-hide flag so transitions work normally
      setInstantHide(false);
      setIsOpen(true);
    }
  }, [isOpen, closeMenu]);

  // Callback for when photo icon is tapped/clicked (without dragging)
  // Always toggles the navigation menu - photo is the singular menu trigger
  const handlePhotoTap = useCallback(() => {
    toggleMenu();
  }, [toggleMenu]);

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

  // Drag hook for FAB photo - same behavior as header photo
  const {
    ref: fabDragRef,
    isDragging: isFabDragging,
    isSnapping: isFabSnapping,
  } = useTouchDrag({
    enabled: isMobile && isCollapsed, // Only enabled on mobile when FAB is visible
    onTap: handleFabPhotoTap,
    dragThreshold: 8,
    tapTimeout: 200,
    snapDuration: 450,
    dragScale: 1.08,
    boundsPadding: 12,
  });
  
  // Detect touch-only devices (no hover capability)
  const isTouch = useIsTouch();
  
  // Shimmer effect for brand name - cursor-following highlight (desktop only)
  const { shimmerRef: brandNameRef, shimmerHandlers: brandNameShimmerHandlers } = useShimmerFollow();

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

  // Build nav links - always include Home since photo is now the menu trigger
  const navLinks = [{ label: 'Home', path: '/' }, ...NAV_LINKS];

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
    isSuspended ? 'suspended' : '',
    // Animation is now controlled via parent .app class for perfect sync with content
  ].filter(Boolean).join(' ');
  
  const menuClass = [
    'top-menu',
    isOpen ? 'visible' : '',
    isClosing ? 'closing' : '',
    isMobile ? 'mobile' : 'desktop',
    // Always include from-collapsed since photo is always the menu trigger.
    // This ensures wide desktop slide animation styles are in effect from first render.
    'from-collapsed',
    // Instant hide disables CSS transitions to prevent phantom buttons during navigation
    instantHide ? 'instant-hide' : '',
  ].filter(Boolean).join(' ');
  
  const brandMarkClass = [
    'brand-mark',
    'draggable', // Always draggable now
    'clickable', // Always clickable - photo is the menu trigger in all states
    isDragging ? 'dragging' : '',
    isSnapping ? 'snapping' : '',
  ].filter(Boolean).join(' ');

  // Mobile FAB classes
  const fabClass = [
    'mobile-fab',
    isCollapsed ? 'visible' : '',
    isFabDragging ? 'dragging' : '',
    isFabSnapping ? 'snapping' : '',
  ].filter(Boolean).join(' ');

  const fabMenuClass = [
    'fab-menu',
    isFabMenuOpen ? 'visible' : '',
    isFabMenuClosing ? 'closing' : '',
    fabInstantHide ? 'instant-hide' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <header className={headerClass}>
        <div className="top-bar-row">
          <button 
            className="brand" 
            type="button" 
            onClick={handleBrandClick} 
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className={brandMarkClass}>
              <span 
                ref={dragRef}
                className="brand-mark-inner"
              >
                <img src={logoMark} alt="Mohsin Ismail logo" />
              </span>
            </span>
            <span 
              ref={isTouch ? undefined : brandNameRef}
              className={`brand-name${isTouch ? '' : ' shimmer-text shimmer-hidden'}`}
              {...(isTouch ? {} : brandNameShimmerHandlers)}
            >{label}</span>
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

      {/* Mobile FAB - appears in bottom-right when scrolled on mobile */}
      {isMobile && (
        <div ref={fabContainerRef} className={fabClass} aria-hidden={!isCollapsed}>
          <span className="fab-photo-wrapper">
            <span 
              ref={fabDragRef}
              className="fab-photo"
            >
              <img src={logoMark} alt="Open menu" />
            </span>
          </span>
          <div
            className={fabMenuClass}
            aria-hidden={!isFabMenuOpen}
          >
            <div className="fab-menu-content">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  className={`btn outline small ${isLinkActive(link.path) ? 'active' : ''} ${link.path === '/' ? 'home-link' : ''} ${fabTouchPressedPath === link.path ? 'touch-pressed' : ''}`}
                  onClick={() => handleFabNav(link.path)}
                  onTouchStart={(e) => handleFabNavTouchStart(e, link.path)}
                  onTouchMove={handleFabNavTouchMove}
                  onTouchEnd={(e) => handleFabNavTouchEnd(e, link.path)}
                  onTouchCancel={handleFabNavTouchCancel}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
