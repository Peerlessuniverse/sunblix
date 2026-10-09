'use client';

import { useState } from 'react';

const QC_INSPECTIONS = [
  {
    id: 'QC-2601',
    site: 'Villa Sanur Luxury Seaside (14.04 kWp)',
    testType: 'Uji Tahanan Isolasi (Megger 1000V DC)',
    parameter: 'R_iso > 100 MΩ (Standar IEC 62446)',
    actualResult: '450 MΩ (Aman Terisolasi)',
    status: 'Lulus Uji',
    statusColor: 'success',
    tester: 'Agus Priyono, ST',
    date: '4 Okt 2026',
    notes: 'Kabel DC terlindungi pipa conduit PVC high-impact tanpa kebocoran arus.',
  },
  {
    id: 'QC-2602',
    site: 'Agro Tabanan Greenhouse (35.10 kWp)',
    testType: 'Pengukuran Tahanan Grounding / Pembumian',
    parameter: 'R_earth < 2.0 Ω (Standar PUIL 2011)',
    actualResult: '0.85 Ω (Sangat Baik)',
    status: 'Lulus Uji',
    statusColor: 'success',
    tester: 'Tim QA Elektrikal',
    date: '3 Okt 2026',
    notes: 'Menggunakan 3 titik copper rod 5/8" paralel dengan pengikatan cadweld.',
  },
  {
    id: 'QC-2603',
    site: 'Ubud Heritage Retreat (25.74 kWp)',
    testType: 'Uji String Voc & Isc Tegangan Buka',
    parameter: 'Toleransi selisih string < 3%',
    actualResult: 'String 1: 498V | String 2: 496V (0.4% diff)',
    status: 'Lulus Uji',
    statusColor: 'success',
    tester: 'Agent Solaria & Agus',
    date: '2 Okt 2026',
    notes: 'Kurva I-V cocok 99.6% dengan kalkulasi radiasi matahari saat jam 11:30.',
  },
  {
    id: 'QC-2604',
    site: 'PT Bali Logistik Benoa (49.14 kWp)',
    testType: 'Pengecekan Torsi Pengencangan Clamp (Torque Wrench)',
    parameter: 'Torsi Baut Hex M8: 9 - 11 N.m',
    actualResult: '84/84 Clamp Terverifikasi 10.5 N.m',
    status: 'Lulus Uji',
    statusColor: 'success',
    tester: 'Lead Erector Budi',
    date: '1 Okt 2026',
    notes: 'Semua mid/end clamp dilengkapi washer anti-slip dan lock nut stainless 304.',
  },
  {
    id: 'QC-2605',
    site: 'Canggu Eco Resort (18.72 kWp)',
    testType: 'Uji Proteksi Anti-Islanding & Auto Cut-off',
    parameter: 'Pemutusan arus < 0.2 detik saat jaringan padam',
    actualResult: '0.08 detik (Sesuai Standar Proteksi)',
    status: 'Lulus Uji',
    statusColor: 'success',
    tester: 'Agent Volt & Engineer',
    date: '30 Sep 2026',
    notes: 'Inverter seketika masuk mode backup tanpa terjadi back-feed ke jaringan.',
  },
];

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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
