'use client';

import { useState } from 'react';

const INITIAL_PROJECTS = [
  {
    code: 'SBX-PRJ-2601',
    name: 'Villa Sanur Luxury Seaside',
    client: 'Bapak Made Suryanata',
    location: 'Sanur, Bali',
    type: 'Residential (PRO)',
    kwp: '14.04 kWp',
    inverter: '1 Phase On-Grid + Smart Dongle',
    panels: '24x LONGI 585 Wp',
    progress: 85,
    status: 'Commissioning',
    statusColor: 'warning',
    cod: '15 Okt 2026',
    estYield: '1,920 kWh/bln',
  },
  {
    code: 'SBX-PRJ-2602',
    name: 'PT Bali Logistik Benoa Port',
    client: 'PT Logistik Samudera',
    location: 'Pelabuhan Benoa, Denpasar',
    type: 'Commercial (PRO+)',
    kwp: '49.14 kWp',
    inverter: '3 Phase 50 kW Industrial Grade',
    panels: '84x Canadian Solar 585 Wp',
    progress: 45,
    status: 'Instalasi Lapangan',
    statusColor: 'info',
    cod: '28 Okt 2026',
    estYield: '6,800 kWh/bln',
  },
  {
    code: 'SBX-PRJ-2603',
    name: 'Canggu Eco Boutique Resort',
    client: 'Canggu Living Group',
    location: 'Canggu, Badung',
    type: 'Hybrid Battery Storage',
    kwp: '18.72 kWp + 30 kWh Baterai',
    inverter: 'Deye Hybrid 20 kW 3-Phase',
    panels: '32x Jinko Solar 585 Wp',
    progress: 60,
    status: 'Wiring & Inverter Setup',
    statusColor: 'purple',
    cod: '22 Okt 2026',
    estYield: '2,550 kWh/bln',
  },
  {
    code: 'SBX-PRJ-2604',
    name: 'Residensial Pak Bambang Pondok Indah',
    client: 'Ir. Bambang Trihatmojo',
    location: 'Jakarta Selatan',
    type: 'Residential (Standard+)',
    kwp: '5.85 kWp',
    inverter: '1 Phase 6 kW On-Grid',
    panels: '10x Trina Solar 585 Wp',
    progress: 100,
    status: 'Live Terkoneksi',
    statusColor: 'success',
    cod: '25 Sep 2026 (COD Aktif)',
    estYield: '810 kWh/bln',
  },
  {
    code: 'SBX-PRJ-2605',
    name: 'Ubud Heritage Retreat & Spa',
    client: 'PT Ubud Heritage',
    location: 'Ubud, Gianyar - Bali',
    type: 'Commercial (PRO+)',
    kwp: '25.74 kWp',
    inverter: '3 Phase 25 kW Grid-Tied',
    panels: '44x LONGI 585 Wp',
    progress: 92,
    status: 'Testing & Commissioning',
    statusColor: 'warning',
    cod: '12 Okt 2026',
    estYield: '3,450 kWh/bln',
  },
  {
    code: 'SBX-PRJ-2606',
    name: 'Agro Tabanan Smart Greenhouse',
    client: 'Koperasi Tani Makmur',
    location: 'Tabanan, Bali',
    type: 'Hybrid Microgrid',
    kwp: '35.10 kWp + 60 kWh Baterai',
    inverter: 'Deye Hybrid 30 kW Microgrid',
    panels: '60x Jinko N-Type 585 Wp',
    progress: 30,
    status: 'Instalasi Struktur Rangka',
    statusColor: 'info',
    cod: '10 Nov 2026',
    estYield: '4,850 kWh/bln',
  },
];

export default function ProjectsView({ onBackToDashboard }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === 'residential') return p.type.includes('Residential');
    if (activeFilter === 'commercial') return p.type.includes('Commercial');
    if (activeFilter === 'hybrid') return p.type.includes('Hybrid');
    if (activeFilter === 'live') return p.status === 'Live Terkoneksi';
    return true;
  });

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Projects</span>
          </div>
          <h1 className="sbx-view-title">☀️ Portofolio Proyek PLTS Aktif</h1>
          <p className="sbx-view-sub">
            Monitoring status EPC konstruksi, tahapan instalasi lapangan, progress persentase, dan tanggal target COD.
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
              setToast('⚡ Modal buat kontrak proyek EPC baru dibuka.');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Buat Proyek EPC Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards Strip */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Proyek Aktif</span>
            <div className="sbx-metric-icon">☀️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">42 Sites</span>
            <span className="sbx-metric-badge-delta">↑ 12 Sites</span>
          </div>
          <p className="sbx-metric-subtext">Bali, Jakarta, Surabaya, Lombok</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Kapasitas Terpasang</span>
            <div className="sbx-metric-icon">⚡</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">1.84 MWp</span>
            <span className="sbx-status-badge success">Kumulatif</span>
          </div>
          <p className="sbx-metric-subtext">3,140 unit modul surya aktif</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Sedang Konstruksi</span>
            <div className="sbx-metric-icon">🔧</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">16 Sites</span>
            <span className="sbx-status-badge warning">On Progress</span>
          </div>
          <p className="sbx-metric-subtext">Target COD s/d November 2026</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Testing &amp; Commissioning</span>
            <div className="sbx-metric-icon">🛡️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">6 Sites</span>
            <span className="sbx-status-badge info">Final Phase</span>
          </div>
          <p className="sbx-metric-subtext">Inspeksi keselamatan &amp; proteksi</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Semua ({projects.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'residential' ? 'active' : ''}`}
              onClick={() => setActiveFilter('residential')}
            >
              🏡 Residensial (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'commercial' ? 'active' : ''}`}
              onClick={() => setActiveFilter('commercial')}
            >
              🏢 Komersial PRO+ (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'hybrid' ? 'active' : ''}`}
              onClick={() => setActiveFilter('hybrid')}
            >
              🔋 Hybrid Battery (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'live' ? 'active' : ''}`}
              onClick={() => setActiveFilter('live')}
            >
              🟢 Live Terkoneksi (1)
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari kode, nama proyek, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>Kode &amp; Nama Proyek</th>
                <th>Klien &amp; Lokasi</th>
                <th>Sistem &amp; Kapasitas</th>
                <th>Spesifikasi Hardware</th>
                <th>Progress EPC</th>
                <th>Status Tahapan</th>
                <th>Target COD</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.code}>
                  <td>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                        {p.code}
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{p.name}</div>
                      <span className="sbx-tag" style={{ marginTop: '2px' }}>{p.type}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--sbx-text)' }}>{p.client}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>📍 {p.location}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--sbx-accent)', fontSize: '13px' }}>
                      ⚡ {p.kwp}
                    </div>
                    <div style={{ fontSize: '11px', color: '#10b981' }}>Est: {p.estYield}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11.5px', color: 'var(--sbx-text)' }}>{p.panels}</div>
                    <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>{p.inverter}</div>
                  </td>
                  <td style={{ minWidth: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--sbx-text)' }}>
                        {p.progress}%
                      </span>
                    </div>
                    <div className="sbx-progress-bar-bg">
                      <div
                        className="sbx-progress-bar-fill"
                        style={{
                          width: `${p.progress}%`,
                          background:
                            p.progress === 100
                              ? '#10b981'
                              : p.progress > 75
                              ? '#38bdf8'
                              : '#f59e0b',
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${p.statusColor}`}>{p.status}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sbx-text)' }}>
                      📅 {p.cod}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => {
                          setToast(`📊 Membuka live telemetri IoT ${p.code} (${p.name})...`);
                          setTimeout(() => setToast(''), 4000);
                        }}
                      >
                        Telemetri
                      </button>
                    </div>
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
