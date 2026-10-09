'use client';

import { useState } from 'react';

const TELEMETRY_SITES = [
  {
    siteName: 'Residensial Pak Bambang (Pondok Indah)',
    capacity: '5.85 kWp Standard+',
    instantPower: '4.82 kW',
    todayKwh: '24.8 kWh',
    monthKwh: '680 kWh',
    prRatio: '84.6%',
    co2Offset: '570 kg',
    inverterTemp: '42°C',
    status: 'Optimal',
    statusColor: 'success',
  },
  {
    siteName: 'Villa Sanur Luxury Seaside',
    capacity: '14.04 kWp PRO',
    instantPower: '11.60 kW',
    todayKwh: '58.4 kWh',
    monthKwh: '1,640 kWh',
    prRatio: '83.2%',
    co2Offset: '1.38 Ton',
    inverterTemp: '46°C',
    status: 'Optimal',
    statusColor: 'success',
  },
  {
    siteName: 'PT Bali Logistik Benoa Port',
    capacity: '49.14 kWp PRO+',
    instantPower: '41.80 kW',
    todayKwh: '215.0 kWh',
    monthKwh: '5,890 kWh',
    prRatio: '82.0%',
    co2Offset: '4.95 Ton',
    inverterTemp: '48°C',
    status: 'Optimal',
    statusColor: 'success',
  },
  {
    siteName: 'Ubud Heritage Retreat & Spa',
    capacity: '25.74 kWp PRO+',
    instantPower: '21.40 kW',
    todayKwh: '106.2 kWh',
    monthKwh: '2,980 kWh',
    prRatio: '81.5%',
    co2Offset: '2.50 Ton',
    inverterTemp: '54°C',
    status: 'Suhu Tinggi',
    statusColor: 'warning',
  },
  {
    siteName: 'Canggu Eco Boutique Resort (Hybrid)',
    capacity: '18.72 kWp + 30 kWh Baterai',
    instantPower: '15.40 kW (SOC 92%)',
    todayKwh: '82.5 kWh',
    monthKwh: '2,240 kWh',
    prRatio: '85.1%',
    co2Offset: '1.88 Ton',
    inverterTemp: '43°C',
    status: 'Baterai Siaga',
    statusColor: 'success',
  },
];

export default function PerformanceView({ onBackToDashboard }) {
  const [sites, setSites] = useState(TELEMETRY_SITES);
  const [toast, setToast] = useState('');

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Performance &amp; Telemetry</span>
          </div>
          <h1 className="sbx-view-title">📊 Performance &amp; Telemetri IoT PLTS</h1>
          <p className="sbx-view-sub">
            Monitoring produksi energi surya (kWh) real-time, Performance Ratio (PR), pengurangan emisi karbon CO₂, dan kesehatan inverter.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="sbx-filter-pill-btn" onClick={onBackToDashboard}>
            ← Kembali ke Dashboard
          </button>
          <button
            type="button"
            className="sbx-action-btn primary"
            onClick={() => {
              setToast('⚡ Data telemetri MQTT seluruh inverter diperbarui secara instan!');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            ⚡ Refresh Telemetri IoT
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Produksi Hari Ini</span>
            <div className="sbx-metric-icon">☀️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">486.9 kWh</span>
            <span className="sbx-metric-badge-delta">Live 11:30</span>
          </div>
          <p className="sbx-metric-subtext">Est. harian akhir ~920 kWh</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Performance Ratio (PR)</span>
            <div className="sbx-metric-icon">📈</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">83.3%</span>
            <span className="sbx-status-badge success">Tier-1 Yield</span>
          </div>
          <p className="sbx-metric-subtext">Standar industri 78 - 82%</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Reduksi Karbon CO₂</span>
            <div className="sbx-metric-icon">🌱</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">11.28 Ton</span>
            <span className="sbx-status-badge success">Bulan Ini</span>
          </div>
          <p className="sbx-metric-subtext">Setara menanam 540 pohon dewasa</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Inverter Grid Availability</span>
            <div className="sbx-metric-icon">⚡</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">99.8%</span>
            <span className="sbx-status-badge info">Zero Trip</span>
          </div>
          <p className="sbx-metric-subtext">Sinkronisasi stabil jaringan</p>
        </div>
      </div>

      {/* Telemetry Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-card-header">
          <h2 className="sbx-card-title">📡 Live Status Inverter &amp; Daya PLTS Lapangan</h2>
          <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
            Protokol Komunikasi: Modbus RTU / MQTT over 4G Cellular IoT
          </span>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>Lokasi Site Proyek</th>
                <th>Kapasitas Sistem</th>
                <th>Daya Real-time (kW)</th>
                <th>Yield Hari Ini</th>
                <th>Yield Bulan Ini</th>
                <th>PR Ratio</th>
                <th>Suhu Inverter</th>
                <th>Status IoT</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{s.siteName}</div>
                  </td>
                  <td>
                    <span className="sbx-tag">{s.capacity}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--sbx-accent)', fontSize: '13px' }}>
                      {s.instantPower}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--sbx-text)' }}>{s.todayKwh}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>{s.monthKwh}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#10b981' }}>{s.prRatio}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: parseInt(s.inverterTemp) > 50 ? '#f59e0b' : 'var(--sbx-text)' }}>
                      🌡️ {s.inverterTemp}
                    </span>
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${s.statusColor}`}>{s.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="sbx-row-action-btn"
                      onClick={() => {
                        setToast(`📊 Membuka grafik kurva iradiasi vs output ${s.siteName}...`);
                        setTimeout(() => setToast(''), 4000);
                      }}
                    >
                      Kurva I-V
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
