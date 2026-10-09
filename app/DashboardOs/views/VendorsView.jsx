'use client';

import { useState } from 'react';

const INITIAL_VENDORS = [
  {
    id: 'VND-01',
    name: 'PT Solar Asia Prima (Distributor Resmi LONGI)',
    category: 'Modul Surya PV',
    pic: 'Bapak Gunawan Hartono',
    phone: '+62 811-2233-4455',
    email: 'sales@solarasia.co.id',
    rating: '4.9 ⭐',
    sla: '98.5%',
    paymentTerms: 'TOP 30 Hari',
    products: 'LONGI Hi-MO X6 585 Wp N-Type TOPCon',
    status: 'Preferred Partner',
  },
  {
    id: 'VND-02',
    name: 'Deye Indonesia Official Direct',
    category: 'Inverter & Baterai',
    pic: 'Ms. Emily Zhang / Andy',
    phone: '+62 812-9988-7766',
    email: 'service.id@deye.com.cn',
    rating: '4.8 ⭐',
    sla: '95.0%',
    paymentTerms: 'CBD (Cash Before Delivery) 20% Diskon',
    products: 'Inverter On-Grid 5kW-50kW, Hybrid LV/HV, Baterai SE-G5.1',
    status: 'Official OEM',
  },
  {
    id: 'VND-03',
    name: 'PT Struktur Baja & Aluminium Anodized',
    category: 'Mounting & Rangka Atap',
    pic: 'Bapak I Ketut Suardika',
    phone: '+62 819-3344-5566',
    email: 'ketut@alumbaja.co.id',
    rating: '4.9 ⭐',
    sla: '99.0%',
    paymentTerms: 'TOP 14 Hari',
    products: 'Rail AL6005-T5, Mid/End Clamps, L-Feet, Hanger Bolt',
    status: 'Preferred Partner',
  },
  {
    id: 'VND-04',
    name: 'PT Kabel Prima Sentosa (TÜV Certified)',
    category: 'Kabel & Proteksi BOS',
    pic: 'Ibu Linda Susanti',
    phone: '+62 821-5566-7788',
    email: 'order@kabelprima.com',
    rating: '4.7 ⭐',
    sla: '94.2%',
    paymentTerms: 'TOP 30 Hari',
    products: 'Solar Cable DC 4mm²/6mm² TÜV, MC4 Connector IP68, SPD',
    status: 'Active Supplier',
  },
  {
    id: 'VND-05',
    name: 'Sungrow Power Indonesia',
    category: 'Inverter Komersial 3-Phase',
    pic: 'Bapak Kevin Pratama',
    phone: '+62 813-7788-9911',
    email: 'kevin.p@sungrow.co.id',
    rating: '4.8 ⭐',
    sla: '96.0%',
    paymentTerms: 'DP 30%, Pelunasan saat B/L',
    products: 'Inverter SG33CX, SG50CX, SG110CX Industrial',
    status: 'Official OEM',
  },
  {
    id: 'VND-06',
    name: 'CV Bali Scaffolding & Safety Lifting',
    category: 'Alat Berat & K3 Lapangan',
    pic: 'Bapak Made Wardana',
    phone: '+62 852-3344-1122',
    email: 'wardana@baliscaffolding.com',
    rating: '4.9 ⭐',
    sla: '100%',
    paymentTerms: 'Per Proyek Selesai',
    products: 'Sewa Scaffolding Galvanis, Crane Truck 5 Ton, Body Harness K3',
    status: 'Local Contractor',
  },
];

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
            <span className="sbx-metric-val">14 Mitra</span>
            <span className="sbx-status-badge success">Tier-1 OEM</span>
          </div>
          <p className="sbx-metric-subtext">Distributor resmi &amp; supplier BOS</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Rating Kepuasan Suplai</span>
            <div className="sbx-metric-icon">⭐</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">4.85 / 5.0</span>
            <span className="sbx-metric-badge-delta">High Quality</span>
          </div>
          <p className="sbx-metric-subtext">Berdasarkan inspeksi QC masuk</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">On-Time SLA Delivery</span>
            <div className="sbx-metric-icon">⏱️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">96.8%</span>
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
            <span className="sbx-metric-val">12 - 20%</span>
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
              ☀️ Modul Surya (1)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${catFilter === 'inverter' ? 'active' : ''}`}
              onClick={() => setCatFilter('inverter')}
            >
              ⚡ Inverter &amp; Baterai (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${catFilter === 'mounting' ? 'active' : ''}`}
              onClick={() => setCatFilter('mounting')}
            >
              🔩 Mounting &amp; Struktur (1)
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
              {filteredVendors.map((v) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
