'use client';

import { useState } from 'react';

const INITIAL_LEADS = [
  {
    id: 'LD-2601',
    name: 'Bapak Made Suryanata',
    company: 'Villa Lotus Sanur',
    location: 'Sanur, Denpasar - Bali',
    phone: '+62 812-3456-7890',
    plnTariff: 'R-3 / 11,000 VA',
    targetKwp: '9.36 kWp',
    estValue: 'Rp 148,000,000',
    stage: 'SPH Terkirim',
    leadSource: 'Kalkulator Web',
    assigned: 'Sales Engineer (Agus)',
    date: '4 Okt 2026',
    notes: 'Konsumsi listrik AC tinggi saat siang hari. Tertarik paket PRO On-Grid.',
  },
  {
    id: 'LD-2602',
    name: 'Ibu Ratna Dewi',
    company: 'Residensial Green Valley',
    location: 'Canggu, Badung - Bali',
    phone: '+62 819-9876-5432',
    plnTariff: 'R-2 / 5,500 VA',
    targetKwp: '4.68 kWp',
    estValue: 'Rp 78,500,000',
    stage: 'Survey Terjadwal',
    leadSource: 'WhatsApp Inbound',
    assigned: 'Sales Lead (Wayan)',
    date: '5 Okt 2026',
    notes: 'Survey fisik atap genteng beton dijadwalkan Selasa 7 Okt jam 10:00.',
  },
  {
    id: 'LD-2603',
    name: 'Pak Hendra Gunawan',
    company: 'PT Logistik Samudera Jaya',
    location: 'Benoa Port, Denpasar',
    phone: '+62 821-4455-6677',
    plnTariff: 'B-3 / 41,500 VA',
    targetKwp: '32.76 kWp',
    estValue: 'Rp 485,000,000',
    stage: 'Negosiasi',
    leadSource: 'Referral EPC',
    assigned: 'Director (Danny)',
    date: '2 Okt 2026',
    notes: 'Gudang cold storage 3-phase. Membutuhkan zero-export inverter & genset sync.',
  },
  {
    id: 'LD-2604',
    name: 'Dr. Michael Chen',
    company: 'Chen Aesthetic Clinic',
    location: 'Kuta, Badung',
    phone: '+62 878-1122-3344',
    plnTariff: 'B-2 / 16,500 VA',
    targetKwp: '14.04 kWp',
    estValue: 'Rp 215,000,000',
    stage: 'SPH Terkirim',
    leadSource: 'Website Contact',
    assigned: 'Sales Engineer (Agus)',
    date: '3 Okt 2026',
    notes: 'Proposal SPH sudah dikirim via email. Menunggu review rapat dewan direksi.',
  },
  {
    id: 'LD-2605',
    name: 'Pak Wayan Sudarma',
    company: 'Sudarma Rice Mill & Dryer',
    location: 'Tabanan, Bali',
    phone: '+62 852-7788-9900',
    plnTariff: 'I-2 / 33,000 VA',
    targetKwp: '25.74 kWp',
    estValue: 'Rp 375,000,000',
    stage: 'Kualifikasi',
    leadSource: 'Agent Omni (AI Chat)',
    assigned: 'Agent Omni',
    date: 'Hari ini, 08:15',
    notes: 'Agent Omni selesai mencocokkan tagihan rekening PLN Rp 18.5jt/bln.',
  },
  {
    id: 'LD-2606',
    name: 'Mr. David Miller',
    company: 'Uluwatu Cliff Villa #4',
    location: 'Uluwatu, Bali',
    phone: '+62 813-2233-4455',
    plnTariff: 'R-3 / 13,200 VA',
    targetKwp: '11.70 kWp + 15 kWh Battery',
    estValue: 'Rp 298,000,000',
    stage: 'Survey Terjadwal',
    leadSource: 'Instagram Ads',
    assigned: 'Sales Lead (Wayan)',
    date: 'Hari ini, 09:30',
    notes: 'Sistem Hybrid dengan backup baterai penuh saat PLN padam.',
  },
];

export default function CrmView({ onBackToDashboard }) {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [activeStage, setActiveStage] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeStage === 'survey') return l.stage === 'Survey Terjadwal';
    if (activeStage === 'sph') return l.stage === 'SPH Terkirim';
    if (activeStage === 'nego') return l.stage === 'Negosiasi';
    if (activeStage === 'kualifikasi') return l.stage === 'Kualifikasi';
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
            <span style={{ color: 'var(--sbx-accent)' }}>CRM &amp; Leads</span>
          </div>
          <h1 className="sbx-view-title">👥 CRM &amp; Pipeline Prospek PLTS</h1>
          <p className="sbx-view-sub">
            Manajemen calon klien residensial &amp; komersial, kualifikasi daya PLN, dan tracking proposal SPH.
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
              setToast('✨ Form tambah lead baru siap diinput!');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Tambah Prospek Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Pipeline Nilai</span>
            <div className="sbx-metric-icon">💵</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">Rp 1.59B</span>
            <span className="sbx-metric-badge-delta">↑ 24%</span>
          </div>
          <p className="sbx-metric-subtext">Dari 6 prospek aktif bulan ini</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Survey Terjadwal</span>
            <div className="sbx-metric-icon">📅</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">2 Lokasi</span>
            <span className="sbx-status-badge warning">Minggu Ini</span>
          </div>
          <p className="sbx-metric-subtext">Canggu &amp; Uluwatu</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">SPH Terkirim</span>
            <div className="sbx-metric-icon">📑</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">2 Proposal</span>
            <span className="sbx-status-badge info">Menunggu PO</span>
          </div>
          <p className="sbx-metric-subtext">Sanur &amp; Kuta Clinic</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Closing Rate</span>
            <div className="sbx-metric-icon">🎯</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">68.4%</span>
            <span className="sbx-status-badge success">High Win</span>
          </div>
          <p className="sbx-metric-subtext">Rata-rata siklus 14 hari</p>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'all' ? 'active' : ''}`}
              onClick={() => setActiveStage('all')}
            >
              Semua Prospek ({leads.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'kualifikasi' ? 'active' : ''}`}
              onClick={() => setActiveStage('kualifikasi')}
            >
              🤖 Kualifikasi AI (1)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'survey' ? 'active' : ''}`}
              onClick={() => setActiveStage('survey')}
            >
              📐 Survey Terjadwal (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'sph' ? 'active' : ''}`}
              onClick={() => setActiveStage('sph')}
            >
              📑 SPH Terkirim (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'nego' ? 'active' : ''}`}
              onClick={() => setActiveStage('nego')}
            >
              🤝 Negosiasi / Final (1)
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari nama, lokasi, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>ID &amp; Calon Klien</th>
                <th>Lokasi Properti</th>
                <th>Daya PLN &amp; Kapasitas Usulan</th>
                <th>Estimasi Nilai</th>
                <th>Tahapan Pipeline</th>
                <th>Sumber Prospek</th>
                <th>PIC Sales</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                        {l.id}
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{l.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--sbx-accent)' }}>{l.company}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>📍 {l.location}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                      ⚡ {l.targetKwp}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>{l.plnTariff}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '13px' }}>
                      {l.estValue}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`sbx-status-badge ${
                        l.stage === 'Negosiasi'
                          ? 'success'
                          : l.stage === 'SPH Terkirim'
                          ? 'info'
                          : l.stage === 'Survey Terjadwal'
                          ? 'warning'
                          : 'purple'
                      }`}
                    >
                      {l.stage}
                    </span>
                  </td>
                  <td>
                    <span className="sbx-tag">{l.leadSource}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>{l.assigned}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <a
                        href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sbx-row-action-btn"
                        style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                        title="Chat WhatsApp Klien"
                      >
                        💬 WA
                      </a>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => {
                          setToast(`📄 Detail catatan ${l.name}: "${l.notes}"`);
                          setTimeout(() => setToast(''), 5000);
                        }}
                      >
                        Detail
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
