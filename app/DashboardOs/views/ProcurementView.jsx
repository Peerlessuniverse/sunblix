'use client';

import { useState, useEffect } from 'react';
import { getStoreInventory, adjustInventoryStock, subscribeToStore } from '../../../lib/sunblixOsStore';

export default function ProcurementView({ onBackToDashboard }) {
  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const refresh = () => {
    setItems(getStoreInventory());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  const handleAdjust = (sku, delta, itemName) => {
    adjustInventoryStock(sku, delta);
    setToast(`${delta > 0 ? '📦 Restock' : '🔻 Pengambilan'} ${Math.abs(delta)} unit untuk ${itemName} berhasil dicatat.`);
    setTimeout(() => setToast(''), 3000);
  };

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

  const lowStockCount = items.filter((it) => it.status === 'Menipis' || it.status === 'Kritis').length;

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
              setToast('✨ Form tambah SKU komponen baru siap diinput!');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Tambah Komponen Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards Strip */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Item SKU Terdaftar</span>
            <div className="sbx-metric-icon">📦</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{items.length} SKU</span>
            <span className="sbx-status-badge info">Aktif</span>
          </div>
          <p className="sbx-metric-subtext">Tier-1 PV, Inverter, BESS</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Stok Butuh Reorder</span>
            <div className="sbx-metric-icon">⚠️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val" style={{ color: lowStockCount > 0 ? '#f59e0b' : '#10b981' }}>
              {lowStockCount} Item
            </span>
            <span className={`sbx-status-badge ${lowStockCount > 0 ? 'warning' : 'success'}`}>
              {lowStockCount > 0 ? 'Perlu PO' : 'Aman'}
            </span>
          </div>
          <p className="sbx-metric-subtext">Di bawah batas minimum buffer</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Gudang Utama</span>
            <div className="sbx-metric-icon">🏭</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">Benoa Hub</span>
            <span className="sbx-status-badge success">Operasional</span>
          </div>
          <p className="sbx-metric-subtext">Transit &amp; QC Centre Bali</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Vendor Resmi</span>
            <div className="sbx-metric-icon">🤝</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">6 Distributor</span>
            <span className="sbx-status-badge purple">Tier-1 Direct</span>
          </div>
          <p className="sbx-metric-subtext">Astronergy, LONGI, Deye, dll</p>
        </div>
      </div>

      {/* Inventory Table Card */}
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
              className={`sbx-tab-btn ${categoryFilter === 'panel' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('panel')}
            >
              ☀️ Panel Surya ({items.filter((i) => i.category === 'Solar Panel').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'inverter' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('inverter')}
            >
              ⚡ Inverter ({items.filter((i) => i.category === 'Inverter').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'battery' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('battery')}
            >
              🔋 Baterai BESS ({items.filter((i) => i.category === 'Energy Storage').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${categoryFilter === 'reorder' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('reorder')}
            >
              ⚠️ Butuh Reorder ({lowStockCount})
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
                <th style={{ textAlign: 'right' }}>Aksi Gudang</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px', marginBottom: '4px' }}>
                      Belum Ada Komponen di Gudang Inventori
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Komponen modul, inverter, rak baterai, dan kabel akan otomatis tercatat saat PO material dibuat atau klik &quot;+ Tambah Item Baru&quot;.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((it) => (
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
                      <div style={{ fontSize: '13px', fontWeight: 800, color: it.status === 'Menipis' ? '#f59e0b' : 'var(--sbx-accent)' }}>
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
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="sbx-row-action-btn"
                          style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          onClick={() => handleAdjust(it.sku, 10, it.name)}
                          title="Tambah 10 Unit (Restock)"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          className="sbx-row-action-btn"
                          style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                          onClick={() => handleAdjust(it.sku, -5, it.name)}
                          title="Kurangi 5 Unit (Kirim Site)"
                        >
                          -5
                        </button>
                      </div>
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
