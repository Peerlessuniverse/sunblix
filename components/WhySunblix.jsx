'use client';

import { useState } from 'react';

export default function WhySunblix() {
  const [activeStep, setActiveStep] = useState(1);
  const [mobileTab, setMobileTab] = useState('team');

  return (
    <div className="how-shell" id="howShell" aria-label="Why Go With SUNBLIX - How It Works">
      <div className="how-main-container">
        {/* MOBILE TOGGLE TABS */}
        <div className="how-mobile-tabs" id="howMobileTabs">
          <button
            type="button"
            className={`hm-tab-btn ${mobileTab === 'team' ? 'is-active' : ''}`}
            data-tab="team"
            onClick={() => setMobileTab('team')}
          >
            👷 Tim Teknisi
          </button>
          <button
            type="button"
            className={`hm-tab-btn ${mobileTab === 'reasons' ? 'is-active' : ''}`}
            data-tab="reasons"
            onClick={() => setMobileTab('reasons')}
          >
            ⭐ 5 Keunggulan
          </button>
        </div>

        <div className="how-card-wrapper">
          {/* LEFT PANE */}
          <div className="how-left-pane">
            <div className="how-hero-img-wrap">
              <img
                src="/asset/how_hero.jpg"
                alt="Certified Sunblix solar technicians installing rooftop solar panels"
                className="how-hero-img"
              />
              <div className="how-hero-scrim" />
            </div>
            <div className="how-left-content">
              <div className="how-left-title-box">
                <h2 className="how-main-title">
                  WHY GO WITH
                  <br />
                  <span className="sunblix-cyan">SUNBLIX</span>
                  <span className="sunblix-q">?</span>
                </h2>
                <p className="how-left-subtitle">
                  More than solar panels.
                  <br />
                  A complete energy solution.
                </p>
                <div className="how-accent-line" />
              </div>

              <div className="how-quote-box">
                <p>“Clean energy today, a brighter tomorrow for you and the next generation.”</p>
              </div>

              <div className="how-engineer-badge">
                <span className="badge-dot" />
                <span>Certified Solar Installation Team</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: 5 INTERACTIVE CARDS */}
          <div className="how-right-pane">
            <div className="how-cards-list">
              {/* CARD 01 */}
              <article
                className={`how-step-card ${activeStep === 1 ? 'is-active' : ''}`}
                data-step="1"
                onMouseEnter={() => setActiveStep(1)}
                onClick={() => setActiveStep(1)}
              >
                <div className="step-media">
                  <img src="/asset/how_step1.jpg" alt="System designed for you consultation" />
                  <div className="media-live-overlay">
                    <span className="radar-scan" />
                    <span className="live-tag">LIVE 3D DESIGN</span>
                  </div>
                </div>
                <div className="step-body">
                  <div className="step-header">
                    <span className="step-num">01</span>
                    <span className="step-divider">|</span>
                    <span className="step-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="step-title">SYSTEM DESIGNED FOR YOU</h3>
                  <p className="step-desc">
                    Setiap sistem disesuaikan dengan kebutuhan energi dan kondisi rooftop Anda.
                  </p>
                </div>
              </article>

              {/* CARD 02 */}
              <article
                className={`how-step-card ${activeStep === 2 ? 'is-active' : ''}`}
                data-step="2"
                onMouseEnter={() => setActiveStep(2)}
                onClick={() => setActiveStep(2)}
              >
                <div className="step-media">
                  <img src="/asset/how_step2.jpg" alt="Complete solar solution equipment" />
                  <div className="media-live-overlay">
                    <span className="energy-flow-spark" />
                    <span className="live-tag">ALL-IN-ONE</span>
                  </div>
                </div>
                <div className="step-body">
                  <div className="step-header">
                    <span className="step-num">02</span>
                    <span className="step-divider">|</span>
                    <span className="step-icon">
                      <svg className="gear-spin" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="step-title">COMPLETE SOLAR SOLUTION</h3>
                  <p className="step-desc">
                    Solar panel, inverter, battery option, material, dan instalasi dalam satu solusi.
                  </p>
                </div>
              </article>

              {/* CARD 03 */}
              <article
                className={`how-step-card ${activeStep === 3 ? 'is-active' : ''}`}
                data-step="3"
                onMouseEnter={() => setActiveStep(3)}
                onClick={() => setActiveStep(3)}
              >
                <div className="step-media">
                  <img src="/asset/how_step3.jpg" alt="Professional solar installation on roof" />
                  <div className="media-live-overlay">
                    <span className="laser-level-line" />
                    <span className="live-tag">CERTIFIED</span>
                  </div>
                </div>
                <div className="step-body">
                  <div className="step-header">
                    <span className="step-num">03</span>
                    <span className="step-divider">|</span>
                    <span className="step-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M2 18h20" />
                        <path d="M4 18v-2a8 8 0 0 1 16 0v2" />
                        <path d="M12 2v4" />
                        <circle cx="12" cy="14" r="2" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="step-title">PROFESSIONAL INSTALLATION</h3>
                  <p className="step-desc">
                    Sistem dirancang untuk dipasang secara rapi, aman, dan sesuai kondisi lokasi.
                  </p>
                </div>
              </article>

              {/* CARD 04 */}
              <article
                className={`how-step-card ${activeStep === 4 ? 'is-active' : ''}`}
                data-step="4"
                onMouseEnter={() => setActiveStep(4)}
                onClick={() => setActiveStep(4)}
              >
                <div className="step-media">
                  <img src="/asset/how_step4.jpg" alt="Flexible energy storage home battery" />
                  <div className="media-live-overlay">
                    <span className="battery-glow-pulse" />
                    <span className="live-tag">SMART STORAGE</span>
                  </div>
                </div>
                <div className="step-body">
                  <div className="step-header">
                    <span className="step-num">04</span>
                    <span className="step-divider">|</span>
                    <span className="step-icon">
                      <svg viewBox="0 0 24 24">
                        <rect x="2" y="7" width="16" height="11" rx="2" />
                        <path d="M20 11v3" />
                        <path d="M6 11v3" />
                        <path d="M10 11v3" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="step-title">FLEXIBLE ENERGY STORAGE</h3>
                  <p className="step-desc">Tambahkan battery storage untuk kebutuhan energi yang lebih fleksibel.</p>
                </div>
              </article>

              {/* CARD 05 */}
              <article
                className={`how-step-card ${activeStep === 5 ? 'is-active' : ''}`}
                data-step="5"
                onMouseEnter={() => setActiveStep(5)}
                onClick={() => setActiveStep(5)}
              >
                <div className="step-media">
                  <img src="/asset/how_step5.jpg" alt="After sales support app monitoring" />
                  <div className="media-live-overlay">
                    <span className="heartbeat-wave" />
                    <span className="live-tag">24/7 IOT ACTIVE</span>
                  </div>
                </div>
                <div className="step-body">
                  <div className="step-header">
                    <span className="step-num">05</span>
                    <span className="step-divider">|</span>
                    <span className="step-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="step-title">AFTER-SALES SUPPORT</h3>
                  <p className="step-desc">Kami tetap mendampingi setelah sistem selesai dipasang.</p>
                </div>
              </article>
            </div>
          </div>
        </div>

        {/* BOTTOM PILLAR BANNER */}
        <div className="how-bottom-banner">
          <div className="bottom-copy-block">
            <span className="tagline-lead">We don&apos;t just install solar panels.</span>
            <strong className="tagline-bold">We build energy solutions around you.</strong>
            <div className="bottom-accent-line" />
          </div>
          <div className="bottom-pillars-grid">
            <div className="pillar-col">
              <div className="pillar-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
                  <path d="M9 21v-7h6v7" />
                </svg>
              </div>
              <div className="pillar-info">
                <strong>RESIDENTIAL</strong>
                <span>A more comfortable home</span>
              </div>
            </div>
            <div className="pillar-col">
              <div className="pillar-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <path d="M9 22v-4h6v4" />
                  <line x1="8" y1="6" x2="10" y2="6" />
                  <line x1="14" y1="6" x2="16" y2="6" />
                  <line x1="8" y1="10" x2="10" y2="10" />
                  <line x1="14" y1="10" x2="16" y2="10" />
                  <line x1="8" y1="14" x2="10" y2="14" />
                  <line x1="14" y1="14" x2="16" y2="14" />
                </svg>
              </div>
              <div className="pillar-info">
                <strong>COMMERCIAL</strong>
                <span>A more efficient business</span>
              </div>
            </div>
            <div className="pillar-col">
              <div className="pillar-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M2 20h20" />
                  <path d="M5 20V8l5 4V8l5 4V4l5 4v12" />
                </svg>
              </div>
              <div className="pillar-info">
                <strong>INDUSTRIAL</strong>
                <span>A more productive future</span>
              </div>
            </div>
            <div className="pillar-col">
              <div className="pillar-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 3c0 4-1 6-2 10a7 7 0 0 1-8 7z" />
                  <path d="M2 21c0-4 3-7 8-9" />
                </svg>
              </div>
              <div className="pillar-info">
                <strong>A GREENER INDONESIA</strong>
                <span>For generations to come</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
