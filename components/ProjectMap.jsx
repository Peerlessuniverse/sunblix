'use client';

import { useState } from 'react';

export default function ProjectMap({ activeTab = 'map' }) {
  const [activePin, setActivePin] = useState('Jakarta');
  const [tooltipData, setTooltipData] = useState({
    city: 'Jakarta',
    type: 'Residential & Commercial PLTS',
    cap: '16.38 kWp',
  });

  const cityData = [
    // Jawa & Madura
    { city: 'Jakarta', left: '27.9%', top: '70.0%', type: 'Residential & Commercial PLTS', cap: '16.38 kWp', labelClass: 'label-top show-mobile-label' },
    { city: 'Bandung', left: '29.3%', top: '73.5%', type: 'Residential Villa PLTS', cap: '14.04 kWp', labelClass: 'label-left' },
    { city: 'Semarang', left: '33.8%', top: '70.2%', type: 'Commercial Factory PLTS', cap: '35.00 kWp', labelClass: 'label-top' },
    { city: 'Magelang', left: '34.2%', top: '75.2%', type: 'Residential Premium PLTS', cap: '8.19 kWp', labelClass: 'label-top' },
    { city: 'Yogyakarta', left: '35.1%', top: '78.8%', type: 'Resort & Homestay PLTS', cap: '14.04 kWp', labelClass: 'label-bottom-left', label: 'Yogyakarta' },
    { city: 'Surabaya', left: '41.0%', top: '71.5%', type: 'Industrial Warehouse PLTS', cap: '50.00 kWp', labelClass: 'label-top show-mobile-label' },
    { city: 'Jember', left: '42.8%', top: '78.2%', type: 'Agricultural & Residential PLTS', cap: '8.19 kWp', labelClass: 'label-bottom-left' },

    // Bali & Nusa Tenggara
    { city: 'Denpasar (Bali)', left: '44.2%', top: '82.6%', type: 'Luxury Villa Eco-Solar', cap: '16.38 kWp', labelClass: 'label-bottom-left show-mobile-label', label: 'Bali' },
    { city: 'Lombok (NTB)', left: '46.8%', top: '82.2%', type: 'Resort Island Solar', cap: '14.04 kWp', labelClass: 'label-bottom-right', label: 'Lombok' },
    { city: 'Kupang & Labuan Bajo (NTT)', left: '55.5%', top: '82.5%', type: 'Hospitality Hybrid Solar', cap: '20.00 kWp', labelClass: 'label-bottom-right', label: 'NTT' },

    // Kalimantan
    { city: 'Pontianak', left: '33.0%', top: '41.5%', type: 'Commercial Office PLTS', cap: '12.00 kWp', labelClass: 'label-top' },
    { city: 'Banjarmasin', left: '43.8%', top: '56.5%', type: 'Commercial & Residential PLTS', cap: '14.04 kWp', labelClass: 'label-bottom' },
    { city: 'Balikpapan', left: '46.8%', top: '42.4%', type: 'Oil & Gas Support Facility', cap: '25.00 kWp', labelClass: 'label-left show-mobile-label' },
    { city: 'Samarinda', left: '47.4%', top: '38.8%', type: 'Residential Estate Solar', cap: '8.19 kWp', labelClass: 'label-top-left' },

    // Sulawesi
    { city: 'Makassar', left: '53.5%', top: '70.2%', type: 'Commercial Hub Rooftop', cap: '30.00 kWp', labelClass: 'label-left show-mobile-label' },
    { city: 'Palu', left: '54.1%', top: '36.0%', type: 'Government & Commercial PLTS', cap: '16.38 kWp', labelClass: 'label-right' },
    { city: 'Manado', left: '64.2%', top: '18.5%', type: 'Tourism & Coastal Villa PLTS', cap: '14.04 kWp', labelClass: 'label-top show-mobile-label' },

    // Maluku
    { city: 'Ternate', left: '67.6%', top: '30.0%', type: 'Island Hybrid Micro-PLTS', cap: '10.00 kWp', labelClass: 'label-right' },
    { city: 'Ambon', left: '71.2%', top: '61.4%', type: 'Harbor & Residential PLTS', cap: '14.04 kWp', labelClass: 'label-top show-mobile-label' },
  ];

  const handlePinSelect = (pin) => {
    setActivePin(pin.city);
    setTooltipData({
      city: pin.city,
      type: pin.type,
      cap: pin.cap,
    });
  };

  return (
    <div className="project-top-row" data-active-tab={activeTab}>
      {/* MAP VIEWPORT */}
      <div className="project-map-card">
        <div className="project-map-header">
          <div className="project-badge">SUNBLIX NATIONWIDE PROJECTS</div>
          <h2 className="project-map-title">PROYEK TERSEBAR DI INDONESIA</h2>
          <div className="project-map-sub">
            JAWA • MADURA • BALI • KALIMANTAN • SULAWESI • NUSA TENGGARA • MALUKU
          </div>
        </div>

          <div className="indonesia-map-stage">
            <div className="indonesia-map-wrapper">
              <img src="/asset/indonesia_map.svg" alt="Peta Proyek Sunblix di Indonesia" className="indonesia-map-img" />

              {/* CITY HOTSPOTS */}
              {cityData.map((pin) => (
                <div
                  key={pin.city}
                  className={`city-pin ${pin.labelClass || ''} ${activePin === pin.city ? 'is-active' : ''}`}
                  style={{ left: pin.left, top: pin.top }}
                  data-city={pin.city}
                  data-type={pin.type}
                  data-cap={pin.cap}
                  onMouseEnter={() => handlePinSelect(pin)}
                  onClick={() => handlePinSelect(pin)}
                >
                  <span className="pin-dot" />
                  <span className="pin-ring" />
                  <span className="pin-label">{pin.label || pin.city}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC HOVER TOOLTIP */}
          <div className="city-tooltip" id="cityTooltip">
            <div className="tooltip-city-name">{tooltipData.city}</div>
            <div className="tooltip-type">{tooltipData.type}</div>
            <div className="tooltip-meta">
              <span className="tooltip-cap">{tooltipData.cap}</span>
              <span className="tooltip-status">PLN Grid Connected</span>
            </div>
          </div>
        </div>

        {/* PROJECT TERMS CARD */}
        <div className="project-terms-card">
          <div className="terms-header">
            <div className="terms-icon-circle">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="terms-title-block">
              <h3 className="terms-title">PROJECT TERMS</h3>
              <p className="terms-subtitle">Solusi Siap Pakai untuk kemudahan proses Anda.</p>
            </div>
            <span className="terms-turnkey-badge">Siap Pakai</span>
          </div>

          <div className="terms-coverage-badge">JAWA • MADURA • BALI</div>

          <div className="terms-inclusion-box">
            <div className="inclusion-heading">
              <span>Paket Siap Pakai sudah mencakup:</span>
              <span className="inclusion-tag">TERJAMIN</span>
            </div>
            <div className="inclusion-list">
              <div className="inclusion-item">
                <span className="inclusion-icon">🚚</span>
                <div className="inclusion-text-wrap">
                  <strong>Pengiriman</strong>
                  <span>Aman terasuransi ke seluruh titik lokasi</span>
                </div>
              </div>
              <div className="inclusion-item">
                <span className="inclusion-icon">🔧</span>
                <div className="inclusion-text-wrap">
                  <strong>Pemasangan</strong>
                  <span>Oleh tim teknisi tersertifikasi standar K3 & SNI</span>
                </div>
              </div>
              <div className="inclusion-item">
                <span className="inclusion-icon">⚙️</span>
                <div className="inclusion-text-wrap">
                  <strong>Material Tier-1</strong>
                  <span>Tier-1 PV modules, inverter & mounting anti-korosi</span>
                </div>
              </div>
              <div className="inclusion-item">
                <span className="inclusion-icon">📄</span>
                <div className="inclusion-text-wrap">
                  <strong>Pengajuan Perizinan PLN</strong>
                  <span>Pengurusan SLO & instalasi kWh Net-Metering Exim</span>
                </div>
              </div>
              <div className="inclusion-item">
                <span className="inclusion-icon">⚡</span>
                <div className="inclusion-text-wrap">
                  <strong>Sertifikasi Laik Operasi (SLO)</strong>
                  <span>Uji kelayakan keselamatan resmi ESDM</span>
                </div>
              </div>
              <div className="inclusion-item">
                <span className="inclusion-icon">🛡️</span>
                <div className="inclusion-text-wrap">
                  <strong>Garansi Performa 25 Tahun</strong>
                  <span>Pendampingan operasional & monitoring IoT gratis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="terms-extra-box">
            <div className="extra-title-row">
              <span className="extra-pin-dot" />
              <span className="extra-title">Di luar area tersebut:</span>
            </div>
            <p className="extra-desc">
              Additional shipping & installation accommodation may apply. Konsultasikan dengan tim ahli kami untuk survei
              lokasi spesifik.
            </p>
          </div>
        </div>
      </div>
  );
}
