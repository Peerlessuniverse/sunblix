'use client';

import { useState } from 'react';

const INITIAL_INVENTORY = [
  {
    sku: 'PV-LON-585',
    name: 'Modul Surya LONGI Hi-MO X6 585 Wp N-Type TOPCon',
    category: 'Solar Panel',
    stock: 184,
    unit: 'Panel',
    minStock: 50,
    price: 'Rp 1,650,000 / pcs',
    supplier: 'PT Solar Asia Prima',
    status: 'Aman',
    statusColor: 'success',
  },
  {
    sku: 'PV-JNK-585',
    name: 'Modul Surya Jinko Tiger Neo 585 Wp All-Black Bifacial',
    category: 'Solar Panel',
    stock: 96,
    unit: 'Panel',
    minStock: 40,
    price: 'Rp 1,720,000 / pcs',
    supplier: 'PT Energi Surya Mandiri',
    status: 'Aman',
    statusColor: 'success',
  },
  {
    sku: 'INV-DEY-05K',
    name: 'Inverter On-Grid Deye 5 kW 1-Phase WiFi Smart Dongle',
    category: 'Inverter',
    stock: 12,
    unit: 'Unit',
    minStock: 10,
    price: 'Rp 11,500,000 / unit',
    supplier: 'Deye Indonesia Official',
    status: 'Aman',
    statusColor: 'success',
  },
  {
    sku: 'INV-DEY-20K',
    name: 'Inverter Hybrid Deye 20 kW 3-Phase Low Voltage 48V',
    category: 'Inverter',
    stock: 4,
    unit: 'Unit',
    minStock: 6,
    price: 'Rp 48,000,000 / unit',
    supplier: 'Deye Indonesia Official',
    status: 'Menipis',
    statusColor: 'warning',
  },
  {
    sku: 'BAT-DEY-512',
    name: 'Baterai LiFePO4 Deye SE-G5.1 Pro 5.12 kWh 100Ah Rackmount',
    category: 'Energy Storage',
    stock: 18,
    unit: 'Pack',
    minStock: 12,
    price: 'Rp 22,800,000 / pack',
    supplier: 'PT Baterai Nusantara Jaya',
    status: 'Aman',
    statusColor: 'success',
  },
  {
    sku: 'MNT-RAL-420',
    name: 'Aluminium Rail AL6005-T5 Anodized 4.2 Meter Anti-Korosi',
    category: 'Mounting',
    stock: 240,
    unit: 'Batang',
    minStock: 80,
    price: 'Rp 145,000 / btg',
    supplier: 'PT Struktur Baja Ringan',
    status: 'Aman',
    statusColor: 'success',
  },
  {
    sku: 'CBL-DC-4MM',
    name: 'Kabel Solar DC 4mm² TÜV 2PfG 1169 Double Insulated (Roll 500m)',
    category: 'Balance of System',
    stock: 2,
    unit: 'Roll',
    minStock: 5,
    price: 'Rp 4,200,000 / roll',
    supplier: 'PT Kabel Prima Sentosa',
    status: 'Kritis',
    statusColor: 'danger',
  },
  {
    sku: 'PRO-SPD-1KV',
    name: 'DC Surge Protection Device (SPD) 1000V 40kA Type II + Box IP65',
    category: 'Proteksi Kelistrikan',
    stock: 35,
    unit: 'Set',
    minStock: 15,
    price: 'Rp 650,000 / set',
    supplier: 'PT Sakelar Elektrik Mandiri',
    status: 'Aman',
    statusColor: 'success',
  },
];

export default function ProcurementView({ onBackToDashboard }) {
  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.sku.toLowerCase().includes(search.toLowerCase()) ||
      it.supplier.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (categoryFilter === 'panel') return it.category === 'Solar Panel';
    if (categoryFilter === 'inverter') return it.category === 'Inverter';
    if (categoryFilter === 'battery') return it.category === 'Energy Storage';
    if (categoryFilter === 'reorder') return it.status === 'Menipis' || it.status === 'Kritis';
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
            <span style={{ color: 'var(--sbx-accent)' }}>Procurement Board</span>
          </div>
          <h1 className="sbx-view-title">📦 Procurement Board &amp; Material Inventory</h1>
          <p className="sbx-view-sub">
            Manajemen stok gudang komponen solar modul, inverter, rak baterai lithium, mounting aluminium, dan kabel DC.
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
              setToast('📦 Form pembuatan Purchase Order (PO) baru terbuka.');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Buat Purchase Order (PO)
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Valuasi Stok Gudang</span>
            <div className="sbx-metric-icon">🪙</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">Rp 2.48B</span>
            <span className="sbx-metric-badge-delta">Aset Fisik</span>
          </div>
          <p className="sbx-metric-subtext">Gudang Utama Denpasar &amp; Cikarang</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Stok Butuh Reorder</span>
            <div className="sbx-metric-icon">⚠️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">2 Item</span>
            <span className="sbx-status-badge danger">Reorder Alert</span>
          </div>
          <p className="sbx-metric-subtext">Kabel DC 4mm² &amp; Inverter Hybrid 20kW</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Modul Surya Tersedia</span>
            <div className="sbx-metric-icon">☀️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">280 Panel</span>
            <span className="sbx-status-badge success">Ready 163 kWp</span>
          </div>
          <p className="sbx-metric-subtext">LONGI 585 Wp &amp; Jinko Bifacial</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Lead Time Pengiriman</span>
            <div className="sbx-metric-icon">⏱️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">4.5 Hari</span>
            <span className="sbx-status-badge info">Fast Cycle</span>
          </div>
          <p className="sbx-metric-subtext">Rata-rata kedatangan dari vendor</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              Semua Komponen ({items.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'reorder' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('reorder')}
            >
              ⚠️ Butuh Reorder (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'panel' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('panel')}
            >
              ☀️ Panel Surya (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'inverter' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('inverter')}
            >
              ⚡ Inverter (2)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'battery' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('battery')}
            >
              🔋 Baterai Storage (1)
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari SKU, nama komponen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>SKU &amp; Deskripsi Item</th>
                <th>Kategori</th>
                <th>Stok Tersedia</th>
                <th>Min. Buffer</th>
                <th>Estimasi Harga Beli</th>
                <th>Supplier / Distributor</th>
                <th>Status Stok</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((it) => (
                <tr key={it.sku}>
                  <td>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                        {it.sku}
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{it.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className="sbx-tag">{it.category}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--sbx-accent)' }}>
                      {it.stock} {it.unit}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
                      {it.minStock} {it.unit}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '12px' }}>
                      {it.price}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>{it.supplier}</span>
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${it.statusColor}`}>{it.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="sbx-row-action-btn"
                      onClick={() => {
                        setToast(`⚡ Reorder PO dibuat untuk ${it.name} (${it.supplier}).`);
                        setTimeout(() => setToast(''), 4000);
                      }}
                    >
                      Reorder PO
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
