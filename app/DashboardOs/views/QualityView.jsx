'use client';

import { useState } from 'react';

const QC_INSPECTIONS = [];

export default function QualityView({ onBackToDashboard }) {

  const [inspections, setInspections] = useState(QC_INSPECTIONS);
  const [toast, setToast] = useState('');

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Quality Control &amp; Testing</span>
          </div>
          <h1 className="sbx-view-title">🛡️ Quality Assurance &amp; Commissioning Testing</h1>
          <p className="sbx-view-sub">
            Standar inspeksi keselamatan kelistrikan PLTS, pengujian Megger 1000V, tahanan grounding PUIL, dan verifikasi torsi mekanikal.
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
              setToast('📄 Form Berita Acara Commissioning Test (BACT) dibuka.');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Buat Laporan Pengujian Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Pass Rate Commissioning</span>
            <div className="sbx-metric-icon">✅</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">100%</span>
            <span className="sbx-status-badge success">Zero Fault</span>
          </div>
          <p className="sbx-metric-subtext">Semua uji kelayakan lulus standar</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Rata-rata Tahanan Grounding</span>
            <div className="sbx-metric-icon">⚡</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">0.92 Ω</span>
            <span className="sbx-metric-badge-delta">Aman PUIL</span>
          </div>
          <p className="sbx-metric-subtext">Jauh di bawah batas aman maksimal 2.0 Ω</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Insulasi Kabel DC (Megger)</span>
            <div className="sbx-metric-icon">🛡️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">&gt; 350 MΩ</span>
            <span className="sbx-status-badge success">IEC 62446</span>
          </div>
          <p className="sbx-metric-subtext">Bebas kebocoran arus dan korosi</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Inspeksi Rangka Anti-Korosi</span>
            <div className="sbx-metric-icon">🔩</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">Grade A+</span>
            <span className="sbx-status-badge info">Alloy 6005-T5</span>
          </div>
          <p className="sbx-metric-subtext">Ketahanan angin kencang s/d 120 km/jam</p>
        </div>
      </div>

      {/* QC Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-card-header">
          <h2 className="sbx-card-title">📋 Log Pengujian Commissioning &amp; Kelayakan Sistem Terakhir</h2>
          <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
            Standar Uji: PUIL 2011, IEC 62446-1 &amp; SPLN
          </span>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>ID Uji &amp; Lokasi Site</th>
                <th>Jenis Parameter Uji</th>
                <th>Standar / Ambang Batas</th>
                <th>Hasil Pengukuran Lapangan</th>
                <th>Status Uji</th>
                <th>Inspektor / Engineer</th>
                <th>Tanggal Uji</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((qc) => (
                <tr key={qc.id}>
                  <td>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                        {qc.id}
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{qc.site}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sbx-text)' }}>
                      {qc.testType}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                      {qc.parameter}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>
                      {qc.actualResult}
                    </span>
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${qc.statusColor}`}>{qc.status}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>{qc.tester}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-dim)' }}>{qc.date}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="sbx-row-action-btn"
                      onClick={() => {
                        setToast(`📄 Berita Acara ${qc.id}: "${qc.notes}"`);
                        setTimeout(() => setToast(''), 4500);
                      }}
                    >
                      Buka Sertifikat
                    </button>
                  </td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', marginBottom: '4px' }}>
                      Belum Ada Log Pengujian Kualitas (QC) Tercatat
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Pengujian Megger, tahanan grounding PUIL, dan komisioning inverter akan tercatat di sini saat instalasi selesai.
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
