'use client';

export default function PurposeScene({ onOpenVideo }) {
  return (
    <div className="scene-two" id="sceneTwo" aria-label="Our Purpose">
      <div className="purpose-wash" id="purposeWash" aria-hidden="true" />

      <div className="purpose-content" id="purposeContent">
        <div className="purpose-eyebrow">OUR PURPOSE</div>
        <h2 className="purpose-title">
          <span>ENERGY</span>
          <span>SHOULD WORK</span>
          <span>FOR YOU</span>
        </h2>
        <p className="purpose-description">
          Kami percaya energi bersih dapat menciptakan masa depan yang lebih baik untuk keluarga, bisnis, dan
          Indonesia.
        </p>

        <div className="purpose-features" aria-label="SUNBLIX benefits">
          <div className="purpose-feature">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M38 9C22 10 11 17 10 31c0 5 2 8 2 8s7-1 12-5c7-6 9-14 8-21-1-2-1-3 6-4Z" />
              <path d="M10 39c5-9 12-14 21-18" />
            </svg>
            <strong>
              CLEANER
              <br />
              ENVIRONMENT
            </strong>
          </div>
          <div className="purpose-feature">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M9 37V27h8v10H9Z" />
              <path d="M20 37V19h8v18h-8Z" />
              <path d="M31 37V10h8v27h-8Z" />
            </svg>
            <strong>
              LOWER
              <br />
              ENERGY COST
            </strong>
          </div>
          <div className="purpose-feature">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="16" r="6" />
              <path d="M13 35c0-6 5-10 11-10s11 4 11 10" />
              <path d="M8 35c0-4 3-7 7-7" />
              <path d="M40 35c0-4-3-7-7-7" />
            </svg>
            <strong>
              BRIGHTER
              <br />
              TOMORROW
            </strong>
          </div>
        </div>
      </div>

      {/* Energy Route SVG Line */}
      <svg
        className="energy-system"
        id="energySystem"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="energyGradient" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#168cff" />
            <stop offset="35%" stopColor="#22d8d8" />
            <stop offset="67%" stopColor="#31e86c" />
            <stop offset="100%" stopColor="#ffd200" />
          </linearGradient>
        </defs>
        <path className="energy-route" d="M 75.6 41.5 C 65 46, 52 57, 40 68.5 C 28 77, 20 80, 12 82" />
      </svg>

      {/* Energy Pulse glowing dot */}
      <div className="energy-pulse" id="energyPulse" aria-hidden="true" />

      {/* Watch Our Story Video Card */}
      <div className="story-card" id="storyCard">
        <div
          className="story-thumb"
          id="storyThumb"
          onClick={onOpenVideo}
          role="button"
          tabIndex={0}
          aria-label="Tonton video SUNBLIX"
          style={{ cursor: 'pointer' }}
        >
          <div className="story-live-badge">
            <span className="live-dot" />
            <span>VIDEO SUNBLIX</span>
          </div>
          <div className="story-play" aria-hidden="true" />
          <div className="story-thumb-copy">
            <span className="story-badge-brand">SUNBLIX STORY</span>
            <strong className="story-title">A CLEANER INDONESIA STARTS TODAY</strong>
            <p className="story-sub">Sekilas tentang Sunblix dan energi surya mandiri.</p>
          </div>
        </div>
        <div className="story-meta-bar">
          <button
            type="button"
            className="story-link"
            id="storyLink"
            onClick={onOpenVideo}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            <span className="story-link-icon">▶</span>
            <span>Tonton Video (5:24)</span>
          </button>
          <span className="story-pill-tag">⚡ 25-Year Warranty</span>
        </div>
      </div>

      <button
        type="button"
        className="video-hit"
        id="videoHit"
        aria-label="Watch Our Story"
        onClick={onOpenVideo}
      />
    </div>
  );
}
