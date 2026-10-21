'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ onOpenDrawer, onOpenQuote }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = (e) => {
    if (isHome) {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sunblix:refresh'));
      }
    }
  };

  const getHref = (hash) => {
    return isHome ? hash : `/${hash}`;
  };

  return (
    <header className="nav" id="nav">
      <div className="nav-inner">
        <Link
          href="/"
          className="nav-logo-link"
          aria-label="SUNBLIX Home"
          onClick={handleLogoClick}
        >
          <img className="nav-logo" src="/asset/sublixlogo.svg" alt="SUNBLIX" />
        </Link>
        <nav className="nav-menu">
          <a href={getHref('#solutions')}>Solutions</a>

          {/* ABOUT US DROPDOWN */}
          <div
            className={`nav-dropdown ${dropdownOpen ? 'is-open' : ''}`}
            ref={dropdownRef}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <a
              href={getHref('#about')}
              className="nav-dropdown-trigger"
              id="aboutDropdownTrigger"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              onClick={() => setDropdownOpen(false)}
            >
              About Us
              <svg
                className="dropdown-chevron"
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <div className="nav-dropdown-menu" role="menu" aria-label="About Us Submenu">
              <a
                href={getHref('#how-it-works')}
                className="nav-dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="dropdown-item-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                </div>
                <div className="dropdown-item-text">
                  <span className="dropdown-item-title">How It Works</span>
                  <span className="dropdown-item-desc">Cara kerja & aliran daya PLTS terintegrasi</span>
                </div>
              </a>
              <a
                href={getHref('#why-sunblix')}
                className="nav-dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="dropdown-item-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="dropdown-item-text">
                  <span className="dropdown-item-title">Why SUNBLIX</span>
                  <span className="dropdown-item-desc">Keunggulan spesialis, garansi & standar tier-1</span>
                </div>
              </a>
            </div>
          </div>

          <a href={getHref('#products')}>Products</a>
          <a href={getHref('#projects')}>Projects</a>
          <Link
            href="/career"
            className={pathname === '/career' ? 'is-active' : ''}
          >
            Career
          </Link>
          <Link
            href="/partnership"
            className={pathname === '/partnership' ? 'is-active' : ''}
          >
            Partnership
          </Link>
          <Link
            href="/faq"
            className={pathname === '/faq' ? 'is-active' : ''}
          >
            F.A.Q
          </Link>
        </nav>
        <div className="nav-actions">
          <button
            type="button"
            className="quote-button"
            onClick={onOpenQuote}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            Get a Quote <span>→</span>
          </button>
          <button
            type="button"
            className="menu-button"
            id="menuButton"
            aria-label="Open menu"
            onClick={onOpenDrawer}
          >
            <span className="menu-lines">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

