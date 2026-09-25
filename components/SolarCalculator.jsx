'use client';

import { useState, useMemo } from 'react';

const PROPERTY_OPTIONS = [
  { id: 'house', label: 'Rumah', icon: '🏠' },
  { id: 'villa', label: 'Villa', icon: '🏡' },
  { id: 'commercial', label: 'Ruko / Usaha', icon: '🏢' },
  { id: 'warehouse', label: 'Pabrik / Gudang', icon: '🏭' },
];

const ROOFTOP_OPTIONS = [
  { id: 'small', label: 'Kecil (< 25 m²)' },
  { id: 'medium', label: 'Sedang (25–50 m²)' },
  { id: 'large', label: 'Luas (> 50 m²)' },
];

const QUICK_BILLS = [
  { label: '1jt', val: 1000000 },
  { label: '2.5jt', val: 2500000 },
  { label: '5jt', val: 5000000 },
  { label: '10jt', val: 10000000 },
  { label: '15jt', val: 15000000 },
];

export default function SolarCalculator({ onOpenQuote }) {
  const [property, setProperty] = useState('house');
  const [bill, setBill] = useState(2500000);
  const [rooftop, setRooftop] = useState('medium');

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  const handleBillChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = parseInt(raw, 10);
    setBill(isNaN(num) || num <= 0 ? 0 : num);
  };

  const system = useMemo(() => {
    let mult = 1.0;
    if (property === 'villa') mult = 1.15;
    else if (property === 'commercial') mult = 1.25;
    else if (property === 'warehouse') mult = 1.4;

    const adjustedBill = bill * mult;

    let sysName = 'SUNBLIX 4.68';
    let kwp = '4.68';
    let kwpNum = 4.68;
    let panels = '8';
    let area = '26 m²';
    let inverter = '6 kW';

    if (adjustedBill <= 1800000 || (rooftop === 'small' && adjustedBill <= 3000000)) {
      sysName = 'SUNBLIX 2.34';
      kwp = '2.34';
      kwpNum = 2.34;
      panels = '4';
      area = '13 m²';
      inverter = '3 kW';
    } else if (adjustedBill <= 4000000) {
      sysName = 'SUNBLIX 4.68';
      kwp = '4.68';
      kwpNum = 4.68;
      panels = '8';
      area = '26 m²';
      inverter = '6 kW';
    } else if (adjustedBill <= 8000000) {
      sysName = 'SUNBLIX 8.19';
      kwp = '8.19';
      kwpNum = 8.19;
      panels = '14';
      area = '45 m²';
      inverter = '10 kW';
    } else if (adjustedBill <= 15000000) {
      sysName = 'SUNBLIX 14.04';
      kwp = '14.04';
      kwpNum = 14.04;
      panels = '24';
      area = '78 m²';
      inverter = '15 kW';
    } else {
      const calcKwp = Math.min(100, Math.max(16, adjustedBill / 1500 / 30 / 3.8)).toFixed(2);
      const calcPanels = Math.round((Number(calcKwp) * 1000) / 585);
      const calcArea = Math.round(calcPanels * 3.2);
      const calcInv = Math.ceil(Number(calcKwp) * 1.2);
      sysName = `SUNBLIX ${calcKwp}`;
      kwp = String(calcKwp);
      kwpNum = parseFloat(calcKwp);
      panels = String(calcPanels);
      area = `${calcArea} m²`;
      inverter = `${calcInv} kW`;
    }

    const monthlyKwh = Math.round(kwpNum * 120);
    const savingsRatio = bill <= 1500000 ? 0.72 : bill <= 3500000 ? 0.78 : 0.8;
    const estSavings = Math.round(bill * savingsRatio);
    const savingsPct = Math.round(savingsRatio * 100);
    const co2Kg = Math.round(monthlyKwh * 0.82);

    const waMsg = `Halo Tim Ahli SUNBLIX, saya telah menghitung kebutuhan di website dan ingin konsultasi resmi untuk paket rekomendasi: *${sysName}* (${kwp} kWp, ${panels} Panel, inverter ${inverter}, estimasi rooftop ${area}) dengan tagihan listrik saat ini: *${formatRupiah(bill)}/bln*. Estimasi hemat: *${formatRupiah(estSavings)}/bln* (${savingsPct}%). Mohon info jadwal survei atap dan rincian penawaran resminya.`;

    const waUrl = `https://wa.me/6281112345678?text=${encodeURIComponent(waMsg)}`;

    return {
      sysName,
      kwp,
      panels,
      area,
      inverter,
      monthlyKwh,
      estSavings,
      savingsPct,
      co2Kg,
      waUrl,
    };
  }, [property, bill, rooftop]);

  return (
    <div className="calculator-horizontal-bar">
      {/* LEFT TITLE BLOCK */}
      <div className="calc-title-block">
        <div className="calc-eyebrow">⚡ SOLAR CALCULATOR</div>
        <div className="calc-accent-line" />
        <h3 className="calc-main-title">
          SIMULASI HEMAT
          <br />
          LISTRIK PLTS<span className="calc-dot">.</span>
        </h3>
        <p className="calc-desc">Hitung estimasi penghematan hingga 80% & dapatkan rekomendasi spesifikasi PLTS terbaik.</p>
      </div>

      {/* CENTER INPUTS ROW */}
      <div className="calc-inputs-row">
        {/* FIELD 1: PROPERTY TYPE */}
        <div className="calc-field">
          <label htmlFor="calcProperty">
            <span>Jenis Properti</span>
          </label>

          {/* Desktop Select Fallback */}
          <div className="select-wrapper">
            <select
              id="calcProperty"
              value={property}
              onChange={(e) => setProperty(e.target.value)}
            >
              <option value="house">Rumah (House)</option>
              <option value="villa">Villa & Resort</option>
              <option value="commercial">Commercial / Ruko</option>
              <option value="warehouse">Warehouse / Factory</option>
            </select>
          </div>

          {/* Mobile Tactile Chips */}
          <div className="calc-chips-group calc-chips-property">
            {PROPERTY_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`calc-chip-btn ${property === item.id ? 'is-active' : ''}`}
                onClick={() => setProperty(item.id)}
              >
                <span className="chip-icon">{item.icon}</span>
                <span className="chip-text">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FIELD 2: MONTHLY ELECTRICITY BILL */}
        <div className="calc-field">
          <label htmlFor="calcBill">
            <span>Tagihan Listrik per Bulan</span>
          </label>
          <div className="input-currency-wrapper">
            <input
              type="text"
              id="calcBill"
              value={formatRupiah(bill)}
              onChange={handleBillChange}
              aria-label="Nominal tagihan listrik per bulan"
            />

            {/* Interactive Touch Range Slider */}
            <div className="calc-slider-wrapper">
              <input
                type="range"
                id="calcBillRange"
                className="calc-range-slider"
                min="500000"
                max="20000000"
                step="250000"
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                aria-label="Geser untuk mengatur tagihan listrik bulanan"
              />
              <div className="calc-slider-scale">
                <span>Rp 500rb</span>
                <span>Rp 10jt</span>
                <span>Rp 20jt+</span>
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div className="quick-pill-row">
              {QUICK_BILLS.map((qb) => (
                <button
                  key={qb.val}
                  type="button"
                  className={`quick-bill-btn ${bill === qb.val ? 'is-active' : ''}`}
                  onClick={() => setBill(qb.val)}
                >
                  {qb.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FIELD 3: ROOFTOP AREA */}
        <div className="calc-field">
          <label htmlFor="calcRooftop">
            <span>Ukuran Rooftop</span>
          </label>

          {/* Desktop Select Fallback */}
          <div className="select-wrapper">
            <select
              id="calcRooftop"
              value={rooftop}
              onChange={(e) => setRooftop(e.target.value)}
            >
              <option value="small">Small (&lt; 25 m²)</option>
              <option value="medium">Medium (25–50 m²)</option>
              <option value="large">Large (&gt; 50 m²)</option>
            </select>
          </div>

          {/* Mobile Tactile Chips */}
          <div className="calc-chips-group calc-chips-rooftop">
            {ROOFTOP_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`calc-chip-btn ${rooftop === item.id ? 'is-active' : ''}`}
                onClick={() => setRooftop(item.id)}
              >
                <span className="chip-text">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP ACTION BUTTON */}
        <button
          type="button"
          className="calc-action-btn calc-desktop-btn"
          id="btnCalculate"
          onClick={() => {
            if (onOpenQuote) onOpenQuote(system);
          }}
        >
          <span>Dapatkan Penawaran Resmi</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>

      {/* RIGHT RESULT CARD */}
      <div className="calc-result-card" id="calcResultCard">
        <div className="result-header">
          <div className="result-label-row">
            <span className="result-label">REKOMENDASI SISTEM TERBAIK</span>
            <span className="result-tier-badge">BEST MATCH</span>
          </div>
          <h4 className="result-system-name" id="resSystemName">
            {system.sysName}
          </h4>
          <div className="result-accent-bar" />
        </div>

        {/* 4 SPEC CARDS */}
        <div className="result-metrics-grid">
          <div className="result-metric">
            <strong id="resKwp">{system.kwp} kWp</strong>
            <span>Kapasitas PLTS</span>
          </div>
          <div className="result-metric">
            <strong id="resPanels">{system.panels} Panel</strong>
            <span>Tier-1 585Wp</span>
          </div>
          <div className="result-metric">
            <strong id="resArea">{system.area}</strong>
            <span>Estimasi Atap</span>
          </div>
          <div className="result-metric">
            <strong id="resInverter">{system.inverter}</strong>
            <span>Inverter On-Grid</span>
          </div>
          <a
            href={system.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="result-arrow-btn"
            id="resArrowBtn"
            aria-label="Konsultasikan Hasil Sistem Ini via WhatsApp"
            title="Konsultasikan Hasil Sistem Ini via WhatsApp"
          >
            →
          </a>
        </div>

        {/* CALCULATION BREAKDOWN SUMMARY */}
        <div className="result-summary-bar">
          <div className="calc-summary-item">
            <span className="summary-label">Estimasi Hemat / Bulan</span>
            <strong className="summary-val highlight-green" id="resSavings">
              {formatRupiah(system.estSavings)}
            </strong>
            <span className="summary-sub" id="resSavingsPct">
              Hemat ~{system.savingsPct}% tagihan listrik PLN
            </span>
          </div>
          <div className="calc-summary-divider" />
          <div className="calc-summary-item">
            <span className="summary-label">Produksi Daya / Bulan</span>
            <strong className="summary-val" id="resProduction">
              ~{system.monthlyKwh.toLocaleString('id-ID')} kWh
            </strong>
            <span className="summary-sub" id="resCo2">
              Reduksi CO₂ ~{system.co2Kg.toLocaleString('id-ID')} kg
            </span>
          </div>
        </div>

        {/* MOBILE DUAL CTAS */}
        <div className="calc-mobile-actions">
          <button
            type="button"
            className="calc-action-btn"
            onClick={() => {
              if (onOpenQuote) onOpenQuote(system);
            }}
          >
            <span>📄 Dapatkan Penawaran Resmi (PDF)</span>
            <span className="btn-arrow">→</span>
          </button>

          <a
            href={system.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="calc-wa-action-btn"
            id="calcWaActionBtn"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.08 7.41 8.84 7.67C8.6 7.93 7.92 8.57 7.92 9.87C7.92 11.17 8.87 12.43 9 12.6C9.13 12.77 10.87 15.46 13.53 16.61C14.16 16.88 14.66 17.05 15.04 17.17C15.68 17.37 16.26 17.35 16.72 17.28C17.24 17.2 18.31 16.63 18.53 16C18.75 15.37 18.75 14.83 18.69 14.72C18.63 14.61 18.46 14.54 18.2 14.41C17.94 14.28 16.67 13.65 16.44 13.57C16.21 13.48 16.04 13.44 15.87 13.7C15.7 13.96 15.22 14.54 15.07 14.71C14.92 14.88 14.77 14.9 14.51 14.77C14.25 14.65 13.42 14.37 12.43 13.49C11.66 12.8 11.14 11.95 11 11.7C10.85 11.45 11 11.31 11.12 11.18C11.24 11.07 11.38 10.89 11.5 10.74C11.63 10.6 11.67 10.49 11.76 10.32C11.85 10.15 11.8 10 11.74 9.87C11.67 9.75 11.17 8.52 10.96 8.01C10.76 7.51 10.55 7.58 10.39 7.57C10.24 7.56 10.07 7.56 9.9 7.56L9.53 7.34Z" />
            </svg>
            <span>💬 Konsultasikan via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
