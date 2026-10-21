'use client';

import { useState } from 'react';

const TELEMETRY_SITES = [];


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
            <span className="sbx-metric-val">{sites.length > 0 ? '486.9 kWh' : '0.0 kWh'}</span>
            <span className="sbx-metric-badge-delta">Live Telemetri</span>
          </div>
          <p className="sbx-metric-subtext">{sites.length > 0 ? 'Total akumulasi PLTS' : 'Belum ada sistem online'}</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Performance Ratio (PR)</span>
            <div className="sbx-metric-icon">📈</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{sites.length > 0 ? '83.3%' : '0.0%'}</span>
            <span className="sbx-status-badge success">{sites.length > 0 ? 'Tier-1 Yield' : 'Standby'}</span>
          </div>
          <p className="sbx-metric-subtext">Standar industri 78 - 82%</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Reduksi Karbon CO₂</span>
            <div className="sbx-metric-icon">🌱</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{sites.length > 0 ? '11.28 Ton' : '0.0 Ton'}</span>
            <span className="sbx-status-badge success">Bulan Ini</span>
          </div>
          <p className="sbx-metric-subtext">Kalkulasi faktor emisi PLN</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Inverter Grid Availability</span>
            <div className="sbx-metric-icon">⚡</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">100%</span>
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
              {sites.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📡</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', marginBottom: '4px' }}>
                      Belum Ada Inverter / Gateway IoT Yang Terhubung
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Data telemetri energi surya (kWh), daya real-time, dan status baterai akan otomatis aktif begitu inverter di-pairing ke cloud.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
