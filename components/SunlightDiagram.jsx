'use client';

import { useState } from 'react';

export default function SunlightDiagram() {
  const [activeComponent, setActiveComponent] = useState('solar');

  return (
    <div className="system-shell" id="systemShell" aria-label="How It Works - From Sunlight to Your Home">
      <div className="sunlight-container">
        <div className="sunlight-diagram-stage">
          {/* LEFT TEXT PANEL */}
          <div className="sunlight-info-card">
            <div className="sunlight-eyebrow">HOW IT WORKS</div>
            <div className="sunlight-accent-bar" />
            <h2 className="sunlight-title">
              From
              <br />
              Sunlight
              <br />
              to Your
              <br />
              <span className="highlight-blue">Home</span>
            </h2>
            <p className="sunlight-desc">
              Sistem PLTS mengubah energi matahari menjadi listrik yang dapat digunakan untuk kebutuhan sehari-hari,
              dengan opsi penyimpanan energi untuk fleksibilitas lebih besar.
            </p>
          </div>

          {/* RIGHT VISUAL VIEWPORT */}
          <div className="sunlight-visual-area">
            <img
              src="/asset/sunlight_house.jpg"
              alt="Modern house with solar energy system flow"
              className="sunlight-house-bg"
            />

            {/* ANIMATED SVG ENERGY FLOW PIPELINE */}
            <svg
              className="sunlight-flow-svg"
              viewBox="0 0 1000 560"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#24d4e4" />
                  <stop offset="100%" stopColor="#087be8" />
                </linearGradient>
                <linearGradient id="streamGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#087be8" />
                  <stop offset="50%" stopColor="#42dc61" />
                  <stop offset="100%" stopColor="#ffd21a" />
                </linearGradient>
              </defs>

              {/* Flow 1: Roof Solar Panels -> Inverter */}
              <path className="flow-track" d="M 480 150 L 175 200 L 175 370" />
              <path className="flow-pulse flow-pulse-1" d="M 480 150 L 175 200 L 175 370" />

              {/* Flow 2: Inverter -> Battery Storage */}
              <path className="flow-track" d="M 175 400 L 175 460 L 250 460" />
              <path className="flow-pulse flow-pulse-2" d="M 175 400 L 175 460 L 250 460" />

              {/* Flow 3: Inverter -> House Interior */}
              <path className="flow-track" d="M 190 390 L 320 390 L 370 410 L 560 410" />
              <path className="flow-pulse flow-pulse-3" d="M 190 390 L 320 390 L 370 410 L 560 410" />

              {/* Flow 4: House -> PLN Grid */}
              <path className="flow-grid-track" d="M 560 410 L 740 410 L 740 270 L 880 270" />
              <path className="flow-grid-pulse" d="M 560 410 L 740 410 L 740 270 L 880 270" />
            </svg>

            {/* HOTSPOT 1: SOLAR PANEL */}
            <div
              className={`sunlight-hotspot hotspot-1 ${activeComponent === 'solar' ? 'is-highlighted' : ''}`}
              data-target="solar"
              style={{ left: '48%', top: '20%' }}
              onMouseEnter={() => setActiveComponent('solar')}
              onClick={() => setActiveComponent('solar')}
            >
              <div className="hotspot-badge">1</div>
              <div className="hotspot-card">
                <strong className="hotspot-title">Solar Panel</strong>
                <p className="hotspot-text">Mengubah energi matahari menjadi listrik DC.</p>
              </div>
            </div>

            {/* HOTSPOT 2: INVERTER */}
            <div
              className={`sunlight-hotspot hotspot-2 ${activeComponent === 'inverter' ? 'is-highlighted' : ''}`}
              data-target="inverter"
              style={{ left: '17%', top: '66%' }}
              onMouseEnter={() => setActiveComponent('inverter')}
              onClick={() => setActiveComponent('inverter')}
            >
              <div className="hotspot-badge">2</div>
              <div className="hotspot-card">
                <strong className="hotspot-title">Inverter</strong>
                <p className="hotspot-text">Mengelola & mengonversi listrik DC menjadi AC.</p>
              </div>
            </div>

            {/* HOTSPOT 3: RUMAH ANDA */}
            <div
              className={`sunlight-hotspot hotspot-3 ${activeComponent === 'interior' ? 'is-highlighted' : ''}`}
              data-target="interior"
              style={{ left: '56%', top: '68%' }}
              onMouseEnter={() => setActiveComponent('interior')}
              onClick={() => setActiveComponent('interior')}
            >
              <div className="hotspot-badge">3</div>
              <div className="hotspot-card">
                <strong className="hotspot-title">Rumah Anda</strong>
                <p className="hotspot-text">Listrik digunakan untuk kebutuhan sehari-hari.</p>
              </div>
            </div>

            {/* HOTSPOT 4: BATTERY */}
            <div
              className={`sunlight-hotspot hotspot-4 ${activeComponent === 'battery' ? 'is-highlighted' : ''}`}
              data-target="battery"
              style={{ left: '25%', top: '82%' }}
              onMouseEnter={() => setActiveComponent('battery')}
              onClick={() => setActiveComponent('battery')}
            >
              <div className="hotspot-badge">4</div>
              <div className="hotspot-card">
                <strong className="hotspot-title">Battery (Optional)</strong>
                <p className="hotspot-text">Menyimpan energi untuk malam hari atau cadangan.</p>
              </div>
            </div>

            {/* PLN GRID CALLOUT */}
            <div className="sunlight-hotspot hotspot-pln" style={{ left: '88%', top: '48%' }}>
              <div className="pln-tower-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M4 22h16" />
                  <path d="M7 22l5-20 5 20" />
                  <path d="M6 12h12" />
                  <path d="M8 7h8" />
                  <path d="M5 17h14" />
                </svg>
              </div>
              <div className="hotspot-card pln-card">
                <strong className="hotspot-title">PLN (Grid)</strong>
                <p className="hotspot-text">Net-metering dua arah.</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM 4 INTERACTIVE EQUIPMENT CARDS */}
        <div className="sunlight-cards-row">
          <div
            className={`sunlight-card ${activeComponent === 'solar' ? 'is-active' : ''}`}
            data-component="solar"
            onMouseEnter={() => setActiveComponent('solar')}
            onClick={() => setActiveComponent('solar')}
          >
            <div className="card-thumb">
              <img src="/asset/sunlight_card_solar.jpg" alt="Solar Panel" />
              <span className="card-badge">1</span>
            </div>
            <div className="card-details">
              <div className="card-title">SOLAR PANEL</div>
              <div className="card-desc">Menangkap energi matahari dan mengubahnya menjadi listrik DC.</div>
            </div>
          </div>

          <div
            className={`sunlight-card ${activeComponent === 'inverter' ? 'is-active' : ''}`}
            data-component="inverter"
            onMouseEnter={() => setActiveComponent('inverter')}
            onClick={() => setActiveComponent('inverter')}
          >
            <div className="card-thumb">
              <img src="/asset/sunlight_card_inverter.jpg" alt="Inverter" />
              <span className="card-badge">2</span>
            </div>
            <div className="card-details">
              <div className="card-title">INVERTER</div>
              <div className="card-desc">Mengelola dan mengonversi listrik DC menjadi listrik AC.</div>
            </div>
          </div>

          <div
            className={`sunlight-card ${activeComponent === 'interior' ? 'is-active' : ''}`}
            data-component="interior"
            onMouseEnter={() => setActiveComponent('interior')}
            onClick={() => setActiveComponent('interior')}
          >
            <div className="card-thumb">
              <img src="/asset/sunlight_card_interior.jpg" alt="Home / Business" />
              <span className="card-badge">3</span>
            </div>
            <div className="card-details">
              <div className="card-title">HOME / BUSINESS</div>
              <div className="card-desc">Listrik digunakan untuk peralatan dan kebutuhan sehari-hari.</div>
            </div>
          </div>

          <div
            className={`sunlight-card ${activeComponent === 'battery' ? 'is-active' : ''}`}
            data-component="battery"
            onMouseEnter={() => setActiveComponent('battery')}
            onClick={() => setActiveComponent('battery')}
          >
            <div className="card-thumb">
              <img src="/asset/sunlight_card_battery.jpg" alt="Battery Optional" />
              <span className="card-badge">4</span>
            </div>
            <div className="card-details">
              <div className="card-title">BATTERY (OPTIONAL)</div>
              <div className="card-desc">Menyimpan energi untuk fleksibilitas lebih besar.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
