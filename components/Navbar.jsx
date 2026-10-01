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
          <a
            href="/brosur"
            style={{
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '12px',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Portal Pembuatan SPH & Brosur Resmi (Khusus Tim Internal)"
          >
            <span>Staff SPH</span>
            <span style={{ fontSize: '11px' }}>🔒</span>
          </a>
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
