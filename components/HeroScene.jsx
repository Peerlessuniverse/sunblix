'use client';

export default function HeroScene({ onOpenQuote }) {
  return (
    <>
      {/* HERO BACKGROUND (Single continuous camera push) */}
      <div className="hero-bg" id="heroBg" />

      {/* HERO COPY */}
      <div className="hero-content" id="heroContent">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span>
              Clean Energy.
              <br />
              Brighter Tomorrow.
            </span>
          </div>
          <h1 className="hero-title">
            POWER
            <br />
            <span className="title-light">
              YOUR WORLD<span className="dot" />
            </span>
          </h1>
          <div className="hero-subtitle">Solar Energy Specialist</div>
          <p className="hero-description">We design, build and power the future.</p>
          <div className="hero-buttons">
            <a href="#solutions" className="hero-button primary">
              Explore SUNBLIX
            </a>
            <button
              type="button"
              className="hero-button secondary"
              onClick={onOpenQuote}
              style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Get a Quote <span style={{ marginLeft: '6px' }}>→</span>
            </button>
          </div>

        </div>
      </div>

      {/* HERO BOTTOM CONTROLS */}
      <div className="hero-bottom" id="heroBottom">
        <div className="hero-categories">
          <a href="#residential">RESIDENTIAL</a>
          <span>|</span>
          <a href="#commercial">COMMERCIAL</a>
          <span>|</span>
          <a href="#energy-storage">ENERGY STORAGE</a>
        </div>
        <div className="scroll-indicator">
          <span>SCROLL</span>
          <span className="scroll-icon" />
          <span className="scroll-arrow">↓</span>
        </div>
      </div>

      {/* TRANSITION CURTAIN */}
      <div className="text-curtain" id="textCurtain" />
    </>
  );
}
