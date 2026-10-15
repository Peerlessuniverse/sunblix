'use client';

export default function PurposeScene({ onOpenVideo }) {
  return (
    <section className="scene-two section-reveal" id="solutions" aria-label="Our Purpose">
      <div className="purpose-wash" id="purposeWash" aria-hidden="true" />

      {/* LIGHTNING ENERGY SURGE (Solar Roof -> Loop Headline Text -> Ignite Video Thumbnail) */}
      <div className="lightning-energy-wrap" id="lightningEnergyWrap" aria-hidden="true">
        <svg className="lightning-svg" id="lightningSvg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe600" stopOpacity="1" />
              <stop offset="30%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="lightningGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe600" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00a8ff" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Atmospheric Electric Glow Arc */}
          <path
            className="lightning-path-glow"
            id="lightningPathGlow"
            d="M 765 145 C 620 130 380 160 220 210 C 90 250 50 330 65 430 C 80 520 180 570 360 540 C 480 515 620 470 735 500"
          />
          {/* High Voltage Core Lightning Bolt */}
          <path
            className="lightning-path-core"
            id="lightningPathCore"
            d="M 765 145 C 620 130 380 160 220 210 C 90 250 50 330 65 430 C 80 520 180 570 360 540 C 480 515 620 470 735 500"
          />
          {/* Crackling High Frequency Spark Trail */}
          <path
            className="lightning-path-crackle"
            id="lightningPathCrackle"
            d="M 765 145 C 620 130 380 160 220 210 C 90 250 50 330 65 430 C 80 520 180 570 360 540 C 480 515 620 470 735 500"
          />
        </svg>

        {/* Traveling Plasma Spark Head */}
        <div className="lightning-spark" id="lightningSpark">
          <div className="lightning-spark-core" />
          <div className="lightning-spark-burst" />
        </div>
      </div>

      <div className="purpose-inner-grid">
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
            <img
              src="/asset/SUNBLIX_thumbnail.png?v=2"
              alt="Thumbnail Video SUNBLIX"
              className="story-thumb-img"
              loading="lazy"
            />
            <div className="story-live-badge">
              <span className="live-dot" />
              <span>VIDEO SUNBLIX</span>
            </div>
            <div className="story-play" aria-hidden="true" />
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
              <span>Tonton Video (2:53)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
