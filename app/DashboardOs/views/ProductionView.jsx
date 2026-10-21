'use client';

import { useState } from 'react';

const EPC_TEAMS = [];

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
            <span className="sbx-metric-val">{teams.length > 0 ? `${teams.length * 3} Personil` : '0 Personil'}</span>
            <span className="sbx-status-badge success">{teams.length > 0 ? `${teams.length} Tim EPC` : 'Standby Pool'}</span>
          </div>
          <p className="sbx-metric-subtext">Bersertifikasi keselamatan kerja atap (K3)</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Site Beroperasi Hari Ini</span>
            <div className="sbx-metric-icon">📍</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{teams.length} Lokasi</span>
            <span className="sbx-metric-badge-delta">{teams.length > 0 ? '100% Aktif' : 'Standby'}</span>
          </div>
          <p className="sbx-metric-subtext">{teams.length > 0 ? 'Site konstruksi aktif' : 'Belum ada proyek konstruksi hari ini'}</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Zero Accident (LTI)</span>
            <div className="sbx-metric-icon">🛡️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">100%</span>
            <span className="sbx-status-badge success">Safe Record</span>
          </div>
          <p className="sbx-metric-subtext">Kepatuhan standar K3 nasional</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Laju Pasang Rata-rata</span>
            <div className="sbx-metric-icon">⚡</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{teams.length > 0 ? '18 kWp/hari' : '-'}</span>
            <span className="sbx-status-badge info">Standar SOP</span>
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

        {teams.length > 0 ? (
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
        ) : (
          <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--sbx-text-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>👷</div>
            <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '14px', marginBottom: '4px' }}>
              Belum Ada Tim Instalasi Lapangan Yang Bertugas
            </div>
            <div style={{ fontSize: '12px', maxWidth: '420px', margin: '0 auto' }}>
              Tim EPC lapangan akan dideploy dan dijadwalkan otomatis setelah proposal SPH disepakati dan memasuki tahap konstruksi proyek.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
