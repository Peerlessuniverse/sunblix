'use client';

import { useState, useMemo } from 'react';

const PROPERTY_OPTIONS = [
  { id: 'house', label: 'Rumah', icon: '🏠' },
  { id: 'villa', label: 'Villa & Resort', icon: '🏡' },
  { id: 'commercial', label: 'Ruko / Bisnis', icon: '🏢' },
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
  const [systemType, setSystemType] = useState('hybrid'); // 'hybrid' | 'ongrid'
  const [rooftop, setRooftop] = useState('medium');

  const formatRupiah = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  const handleBillChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = parseInt(raw, 10);
    setBill(isNaN(num) || num <= 0 ? 0 : num);
  };

  // ---------------------------------------------------------------------------
  // SIZING ENGINE HARMONISASI DENGAN 002SUNBLIX-SPH-MRB-2026 (MODE HPP A)
  // ---------------------------------------------------------------------------
  const system = useMemo(() => {
    let mult = 1.0;
    if (property === 'villa') mult = 1.15;
    else if (property === 'commercial') mult = 1.25;
    else if (property === 'warehouse') mult = 1.4;

    const adjustedBill = bill * mult;
    const isHybrid = systemType === 'hybrid';

    // Catalog Matrix Sesuai Database Paket Supplier Resmi (Modul Astronergy 585 Wp & Deye Inverter)
    let pkg = {
      kwp: 4.68,
      panels: 8,
      area: '26 m²',
      inverter: '6 kW',
      inverterDesc: isHybrid ? 'Deye Hybrid Smart' : 'Grid-Tie Dual MPPT',
      battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
      investment: isHybrid ? 128000000 : 82000000,
    };

    if (adjustedBill <= 1800000 || (rooftop === 'small' && adjustedBill <= 3000000)) {
      pkg = {
        kwp: 2.34,
        panels: 4,
        area: '13 m²',
        inverter: isHybrid ? '6 kW' : '3 kW',
        inverterDesc: isHybrid ? 'Deye Hybrid Smart' : 'Grid-Tie Dual MPPT',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 91500000 : 58000000,
      };
    } else if (adjustedBill <= 4000000) {
      pkg = {
        kwp: 4.68,
        panels: 8,
        area: '26 m²',
        inverter: isHybrid ? '6 kW' : '5 kW',
        inverterDesc: isHybrid ? 'Deye Hybrid Smart' : 'Grid-Tie Dual MPPT',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 128000000 : 82000000,
      };
    } else if (adjustedBill <= 7500000) {
      // Paket No. 6 SPH 002: 7.02 kWp (12 panel × 585 Wp)
      pkg = {
        kwp: 7.02,
        panels: 12,
        area: '39 m²',
        inverter: '6 kW',
        inverterDesc: isHybrid ? 'Deye SUN-6K-SG05LP1' : 'Grid-Tie Smart Inverter',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 177200000 : 122000000,
      };
    } else if (adjustedBill <= 11000000) {
      // Paket No. 7 SPH 002: 8.19 kWp (14 panel × 585 Wp)
      pkg = {
        kwp: 8.19,
        panels: 14,
        area: '45 m²',
        inverter: '8 kW',
        inverterDesc: isHybrid ? 'Deye SUN-8K-SG05LP1' : 'Grid-Tie Smart Inverter',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 209500000 : 142000000,
      };
    } else if (adjustedBill <= 16000000) {
      // Paket No. 10 SPH 002: 11.70 kWp (20 panel × 585 Wp)
      pkg = {
        kwp: 11.70,
        panels: 20,
        area: '64 m²',
        inverter: isHybrid ? '12 kW' : '10 kW',
        inverterDesc: isHybrid ? 'Deye SUN-12K-SG05LP1' : 'Grid-Tie 3-Phase',
        battery: isHybrid ? '10.2 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 295200000 : 198000000,
      };
    } else {
      // Paket No. 11 SPH 002: 14.04 kWp (24 panel × 585 Wp)
      pkg = {
        kwp: 14.04,
        panels: 24,
        area: '77 m²',
        inverter: isHybrid ? '12 kW' : '15 kW',
        inverterDesc: isHybrid ? 'Deye 3P / 12kW Hybrid' : 'Grid-Tie 3-Phase Multi-MPPT',
        battery: isHybrid ? '10.2 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 352400000 : 238000000,
      };
    }

    const sysName = `SUNBLIX ${pkg.kwp} ${isHybrid ? 'Hybrid' : 'On-Grid'}`;

    // Rumus Produksi Energi Resmi SPH: kWp × PSH 4.5 × 75% efisiensi sistem × 30 hari = ~101.25 kWh/kWp/bln
    const monthlyKwh = Math.round(pkg.kwp * 4.5 * 0.75 * 30);

    // Rasio penghematan realistis: Hybrid (80-85% karena baterai backup malam), On-Grid (70-75% siang hari)
    const savingsRatio = isHybrid
      ? (bill <= 2000000 ? 0.80 : 0.85)
      : (bill <= 2000000 ? 0.70 : 0.75);

    const estSavings = Math.round(bill * savingsRatio);
    const savingsPct = Math.round(savingsRatio * 100);
    const co2Kg = Math.round(monthlyKwh * 0.82);

    // Payback Period (BEP) dalam tahun = Investasi / (Penghematan tahunan)
    const annualSavings = estSavings * 12;
    const paybackYears = annualSavings > 0
      ? Math.max(3.5, Math.min(8.0, pkg.investment / annualSavings)).toFixed(1)
      : '5.2';

    const savings25y = formatRupiah(estSavings * 12 * 25);

    const waMsg = `Halo Tim Ahli SUNBLIX, saya telah menghitung kebutuhan di website dan ingin konsultasi resmi untuk paket rekomendasi: *${sysName}* (${pkg.kwp} kWp, ${pkg.panels} Panel Astronergy 585Wp, inverter ${pkg.inverter}, baterai: ${pkg.battery}, estimasi atap ${pkg.area}) dengan tagihan listrik saat ini: *${formatRupiah(bill)}/bln*.\n\n*Estimasi Nilai Paket:* ${formatRupiah(pkg.investment)}\n*Estimasi Hemat Listrik:* ${formatRupiah(estSavings)}/bln (~${savingsPct}%)\n*Estimasi Balik Modal:* ~${paybackYears} Tahun\n\nMohon info ketersediaan jadwal survei lokasi dan estimasi penawaran resminya.`;

    const waUrl = `https://wa.me/6285288581027?text=${encodeURIComponent(waMsg)}`;

    return {
      sysName,
      kwp: String(pkg.kwp),
      kwpNum: pkg.kwp,
      panels: String(pkg.panels),
      area: pkg.area,
      inverter: pkg.inverter,
      inverterDesc: pkg.inverterDesc,
      systemType: isHybrid ? 'Hybrid (Smart BESS)' : 'On-Grid (Siang Hari)',
      systemTypeId: systemType,
      battery: pkg.battery,
      batteryCap: pkg.battery,
      estInvestment: pkg.investment,
      paybackYears,
      monthlyKwh,
      estSavings,
      savingsPct,
      savings25y,
      co2Kg,
      waUrl,
      bill,
      property,
    };
  }, [property, bill, systemType, rooftop]);

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
        <p className="calc-desc">
          Hitung estimasi penghematan hingga 85%, estimasi investasi paket, &amp; durasi balik modal (ROI) sesuai standar resmi SUNBLIX.
        </p>
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
              <option value="house">Rumah (Residential)</option>
              <option value="villa">Villa &amp; Resort</option>
              <option value="commercial">Ruko / Komersial</option>
              <option value="warehouse">Pabrik / Industri</option>
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

        {/* FIELD 3: SYSTEM TYPE & BATTERY CONFIGURATION */}
        <div className="calc-field">
          <label htmlFor="calcSysType">
            <span>Konfigurasi &amp; Baterai</span>
          </label>

          <div className="select-wrapper">
            <select
              id="calcSysType"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
            >
              <option value="hybrid">⚡ Hybrid (Baterai BESS Backup 24 Jam)</option>
              <option value="ongrid">☀️ On-Grid (Hemat Siang Hari)</option>
            </select>
          </div>

          <div
            className="calc-sub-rooftop"
            style={{
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#4b6b94',
            }}
          >
            <span>Ukuran Atap:</span>
            <select
              id="calcRooftop"
              value={rooftop}
              onChange={(e) => setRooftop(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0066cc',
                fontWeight: '700',
                cursor: 'pointer',
                outline: 'none',
                fontSize: '9px',
              }}
            >
              <option value="small">&lt; 25 m²</option>
              <option value="medium">25–50 m²</option>
              <option value="large">&gt; 50 m²</option>
            </select>
          </div>
        </div>
      </div>

      {/* RIGHT RESULT CARD */}
      <div className="calc-result-card" id="calcResultCard">
        <div className="result-header">
          <div className="result-label-row">
            <span className="result-label">REKOMENDASI SISTEM RESMI</span>
            <span className="result-tier-badge">{system.systemType}</span>
          </div>
          <h4 className="result-system-name" id="resSystemName">
            {system.sysName}
          </h4>
          <div className="result-accent-bar" />
        </div>

        {/* 4 SPEC METRICS (SINKRON HPP A & EXCEL SPH) */}
        <div className="result-metrics-grid">
          <div className="result-metric">
            <strong id="resKwp">{system.kwp} kWp</strong>
            <span>Kapasitas PLTS</span>
          </div>
          <div className="result-metric">
            <strong id="resPanels">{system.panels} Panel</strong>
            <span>Astronergy 585Wp</span>
          </div>
          <div className="result-metric">
            <strong id="resInverter">{system.inverter}</strong>
            <span title={system.inverterDesc}>{system.inverterDesc}</span>
          </div>
          <div className="result-metric">
            <strong id="resBattery">{system.battery.split(' ')[0]} {system.battery.split(' ')[1] || ''}</strong>
            <span>{system.systemTypeId === 'hybrid' ? 'BESS LiFePO4' : 'Grid-Tied'}</span>
          </div>
        </div>

        {/* FINANCIAL & ROI BREAKDOWN BAR */}
        <div className="result-summary-bar">
          <div className="calc-summary-item">
            <span className="summary-label">Estimasi Hemat / Bulan</span>
            <strong className="summary-val highlight-green" id="resSavings">
              {formatRupiah(system.estSavings)}
            </strong>
            <span className="summary-sub" id="resSavingsPct">
              Hemat ~{system.savingsPct}% tagihan PLN
            </span>
          </div>
          <div className="calc-summary-divider" />
          <div className="calc-summary-item">
            <span className="summary-label">Estimasi Nilai Paket (SPH)</span>
            <strong className="summary-val highlight-blue" id="resInvestment" style={{ color: '#0066cc' }}>
              {formatRupiah(system.estInvestment)}
            </strong>
            <span className="summary-sub" id="resPayback">
              Balik Modal: ~{system.paybackYears} Tahun
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

        {/* ACTION BUTTONS */}
        <div className="calc-result-actions">
          <button
            type="button"
            className="calc-action-btn"
            id="btnCalculate"
            onClick={() => {
              if (onOpenQuote) onOpenQuote(system);
            }}
          >
            <span>Dapatkan Penawaran Resmi (PDF)</span>
            <span className="btn-arrow">→</span>
          </button>

          <a
            href={system.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="calc-wa-action-btn"
            id="calcWaActionBtn"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.08 7.41 8.84 7.67C8.6 7.93 7.92 8.57 7.92 9.87C7.92 11.17 8.87 12.43 9 12.6C9.13 12.77 10.87 15.46 13.53 16.61C14.16 16.88 14.66 17.05 15.04 17.17C15.68 17.37 16.26 17.35 16.72 17.28C17.24 17.2 18.31 16.63 18.53 16C18.75 15.37 18.75 14.83 18.69 14.72C18.63 14.61 18.46 14.54 18.2 14.41C17.94 14.28 16.67 13.65 16.44 13.57C16.21 13.48 16.04 13.44 15.87 13.7C15.7 13.96 15.22 14.54 15.07 14.71C14.92 14.88 14.77 14.9 14.51 14.77C14.25 14.65 13.42 14.37 12.43 13.49C11.66 12.8 11.14 11.95 11 11.7C10.85 11.45 11 11.31 11.12 11.18C11.24 11.07 11.38 10.89 11.5 10.74C11.63 10.6 11.67 10.49 11.76 10.32C11.85 10.15 11.8 10 11.74 9.87C11.67 9.75 11.17 8.52 10.96 8.01C10.76 7.51 10.55 7.58 10.39 7.57C10.24 7.56 10.07 7.56 9.9 7.56L9.53 7.34Z" />
            </svg>
            <span>Konsultasi WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
