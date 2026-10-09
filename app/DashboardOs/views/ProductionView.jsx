'use client';

import { useState } from 'react';

const EPC_TEAMS = [
  {
    team: 'Tim Alpha (Struktur & Rangka)',
    lead: 'Budi Santoso (Lead Erector)',
    crewCount: '4 Teknisi K3',
    site: 'Agro Tabanan Smart Greenhouse',
    task: 'Pemasangan Aluminium Rail AL6005-T5 & Hanger Bolt pada atap spandek 35.1 kWp',
    progress: 70,
    weather: '☀️ Cerah (Angin 8 km/h, UV 9.2)',
    safetyStatus: 'K3 Verified',
    statusColor: 'success',
  },
  {
    team: 'Tim Beta (Panel & Stringing)',
    lead: 'I Wayan Sugiarta (PV Installer Lead)',
    crewCount: '3 Teknisi PV',
    site: 'Villa Sanur Luxury Seaside',
    task: 'Pemasangan 24x Modul Surya LONGI 585 Wp & MC4 crimping DC string 1 & 2',
    progress: 88,
    weather: '⛅ Cerah Berawan (Angin 12 km/h, UV 8.4)',
    safetyStatus: 'K3 Verified',
    statusColor: 'success',
  },
  {
    team: 'Tim Gamma (Inverter & Sistem AC)',
    lead: 'Agus Priyono, ST (Electrical Lead)',
    crewCount: '3 Teknisi Elektrikal',
    site: 'Ubud Heritage Retreat',
    task: 'Pemasangan Inverter 3-Phase 25kW, AC Combiner Box, & Pengetesan Proteksi SPD',
    progress: 95,
    weather: '⛅ Berawan (Angin 6 km/h, UV 6.8)',
    safetyStatus: 'Testing Phase',
    statusColor: 'warning',
  },
  {
    team: 'Tim Delta (Struktur Berat Komersial)',
    lead: 'Eko Wahyudi (Heavy Structural Lead)',
    crewCount: '5 Teknisi Rigging',
    site: 'PT Bali Logistik Benoa Port',
    task: 'Lifting 84 panel surya ke atap gudang menggunakan Mobile Crane 5 Ton',
    progress: 40,
    weather: '💨 Angin Kencang Benoa (22 km/h - Hati-hati)',
    safetyStatus: 'Wind Alert Active',
    statusColor: 'danger',
  },
];

export default function ProductionView({ onBackToDashboard }) {
  const [teams, setTeams] = useState(EPC_TEAMS);
  const [toast, setToast] = useState('');

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Production (PLTS)</span>
          </div>
          <h1 className="sbx-view-title">⚡ Production &amp; Operasional Lapangan EPC</h1>
          <p className="sbx-view-sub">
            Monitoring pergerakan tim teknisi lapangan, safety checklist K3 harian, dan progress instalasi fisik atap.
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
              setToast('📋 Form Daily Toolbox Meeting & Safety K3 dibuka.');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Form Toolbox Meeting K3
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Teknisi Lapangan Aktif</span>
            <div className="sbx-metric-icon">👷</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">15 Personil</span>
            <span className="sbx-status-badge success">4 Tim EPC</span>
          </div>
          <p className="sbx-metric-subtext">Bersertifikasi keselamatan kerja atap (K3)</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Site Beroperasi Hari Ini</span>
            <div className="sbx-metric-icon">📍</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">4 Lokasi</span>
            <span className="sbx-metric-badge-delta">100% Aktif</span>
          </div>
          <p className="sbx-metric-subtext">Tabanan, Sanur, Ubud, Benoa</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Zero Accident (LTI)</span>
            <div className="sbx-metric-icon">🛡️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">520 Hari</span>
            <span className="sbx-status-badge success">Safe Record</span>
          </div>
          <p className="sbx-metric-subtext">Nol insiden kecelakaan kerja</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Laju Pasang Rata-rata</span>
            <div className="sbx-metric-icon">⚡</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">18 kWp/hari</span>
            <span className="sbx-status-badge info">Fast Track</span>
          </div>
          <p className="sbx-metric-subtext">Standar mounting AL6005-T5</p>
        </div>
      </div>

      {/* Teams Operational Grid */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-card-header">
          <h2 className="sbx-card-title">👷 Live Deployment Tim EPC di Lokasi Proyek</h2>
          <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
            Real-time update via WhatsApp Field Supervisor
          </span>
        </div>

        <div className="sbx-grid-two-cols">
          {teams.map((t, idx) => (
            <div key={idx} className="sbx-team-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--sbx-text)' }}>
                    {t.team}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--sbx-accent)' }}>
                    👤 {t.lead} • {t.crewCount}
                  </div>
                </div>
                <span className={`sbx-status-badge ${t.statusColor}`}>{t.safetyStatus}</span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--sbx-text)', fontWeight: 600, marginBottom: '4px' }}>
                📍 Lokasi: {t.site}
              </div>

              <p style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)', lineHeight: 1.4, margin: '6px 0 10px' }}>
                {t.task}
              </p>

              <div style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', marginBottom: '8px' }}>
                Cuaca Site: {t.weather}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                  Progress Hari Ini
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--sbx-accent)' }}>
                  {t.progress}%
                </span>
              </div>
              <div className="sbx-progress-bar-bg">
                <div
                  className="sbx-progress-bar-fill"
                  style={{ width: `${t.progress}%`, background: t.progress > 80 ? '#10b981' : '#38bdf8' }}
                />
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="sbx-row-action-btn"
                  onClick={() => {
                    setToast(`📸 Meminta foto progress lapangan dari ${t.lead}...`);
                    setTimeout(() => setToast(''), 3000);
                  }}
                >
                  Request Foto Lapangan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
