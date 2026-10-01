'use client';

export default function Navbar({ onOpenDrawer, onOpenQuote }) {
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sunblix:refresh'));
    }
  };

  return (
    <header className="nav" id="nav">
      <div className="nav-inner">
        <a
          href="#home"
          className="nav-logo-link"
          aria-label="SUNBLIX Home"
          onClick={handleLogoClick}
        >
          <img className="nav-logo" src="/asset/sublixlogo.svg" alt="SUNBLIX" />
        </a>
        <nav className="nav-menu">
          <a href="#solutions">Solutions</a>
          <a href="#products">Products</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#why-sunblix">Why SUNBLIX</a>
          <a href="#projects">Projects</a>
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
