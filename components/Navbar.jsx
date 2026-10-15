'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ onOpenDrawer, onOpenQuote }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

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
          <a href={getHref('#products')}>Products</a>
          <a href={getHref('#how-it-works')}>How It Works</a>
          <a href={getHref('#why-sunblix')}>Why SUNBLIX</a>
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

