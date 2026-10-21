'use client';

import { useState } from 'react';

const INITIAL_VENDORS = [];

export default function VendorsView({ onBackToDashboard }) {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const filteredVendors = vendors.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.products.toLowerCase().includes(search.toLowerCase()) ||
      v.pic.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (catFilter === 'panel') return v.category.includes('Modul');
    if (catFilter === 'inverter') return v.category.includes('Inverter');
    if (catFilter === 'mounting') return v.category.includes('Mounting');
    return true;
  });

  const panelCount = vendors.filter((v) => v.category?.includes('Modul')).length;
  const inverterCount = vendors.filter((v) => v.category?.includes('Inverter')).length;
  const mountingCount = vendors.filter((v) => v.category?.includes('Mounting')).length;

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Vendors</span>
          </div>
          <h1 className="sbx-view-title">🤝 Direktori Vendor &amp; Rekanan EPC</h1>
          <p className="sbx-view-sub">
            Manajemen distributor resmi modul surya, inverter resmi pabrikan, fabrikasi mounting aluminium, dan kontraktor lokal.
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
              setToast('🤝 Form pendaftaran rekanan vendor baru dibuka.');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Registrasi Rekanan Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Rekanan Terverifikasi</span>
            <div className="sbx-metric-icon">🤝</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{vendors.length} Mitra</span>
            <span className={`sbx-status-badge ${vendors.length > 0 ? 'success' : 'info'}`}>
              {vendors.length > 0 ? 'Tier-1 OEM' : 'Standby Pool'}
            </span>
          </div>
          <p className="sbx-metric-subtext">Distributor resmi &amp; supplier BOS</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Rating Kepuasan Suplai</span>
            <div className="sbx-metric-icon">⭐</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{vendors.length > 0 ? '4.85 / 5.0' : '0.0 / 5.0'}</span>
            <span className="sbx-metric-badge-delta">{vendors.length > 0 ? 'High Quality' : 'Standar SOP'}</span>
          </div>
          <p className="sbx-metric-subtext">Berdasarkan inspeksi QC masuk</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">On-Time SLA Delivery</span>
            <div className="sbx-metric-icon">⏱️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{vendors.length > 0 ? '96.8%' : '100%'}</span>
            <span className="sbx-status-badge info">Tepat Waktu</span>
          </div>
          <p className="sbx-metric-subtext">Ketepatan waktu jadwal kirim site</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Diskon Volume EPC</span>
            <div className="sbx-metric-icon">🏷️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{vendors.length > 0 ? '12 - 20%' : 'Tier 0%'}</span>
            <span className="sbx-status-badge purple">Special Tier</span>
          </div>
          <p className="sbx-metric-subtext">Kontrak tahunan eksklusif Sunblix</p>
        </div>
      </div>

      {/* Vendor Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${catFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCatFilter('all')}
            >
              Semua Vendor ({vendors.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${catFilter === 'panel' ? 'active' : ''}`}
              onClick={() => setCatFilter('panel')}
            >
              ☀️ Modul Surya ({panelCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${catFilter === 'inverter' ? 'active' : ''}`}
              onClick={() => setCatFilter('inverter')}
            >
              ⚡ Inverter &amp; Baterai ({inverterCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${catFilter === 'mounting' ? 'active' : ''}`}
              onClick={() => setCatFilter('mounting')}
            >
              🔩 Mounting &amp; Struktur ({mountingCount})
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari vendor, produk, PIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>Nama Vendor &amp; Status</th>
                <th>Kategori Pasokan</th>
                <th>Katalog Produk Utama</th>
                <th>Kontak PIC</th>
                <th>Rating &amp; SLA</th>
                <th>Term Pembayaran</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤝</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px', marginBottom: '4px' }}>
                      Belum Ada Rekanan Vendor Terdaftar
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Klik tombol &quot;+ Registrasi Rekanan Baru&quot; di atas untuk mendaftarkan distributor resmi solar modul, inverter, dan kontraktor lokal.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{v.name}</div>
                        <span className="sbx-tag" style={{ marginTop: '3px' }}>{v.status}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sbx-accent)' }}>
                        {v.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--sbx-text)', maxWidth: '280px' }}>
                        {v.products}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text)' }}>{v.pic}</div>
                      <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>{v.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '12.5px' }}>{v.rating}</div>
                      <div style={{ fontSize: '11px', color: '#10b981' }}>SLA: {v.sla}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                        {v.paymentTerms}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => {
                          setToast(`📞 Menghubungi PIC ${v.name} (${v.pic}: ${v.phone})`);
                          setTimeout(() => setToast(''), 4000);
                        }}
                      >
                        Hubungi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
