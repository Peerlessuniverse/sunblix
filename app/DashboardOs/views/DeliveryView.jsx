'use client';

import { useState } from 'react';

const SHIPMENTS = [
  {
    doNumber: 'DO-SBX-2601',
    destination: 'Villa Sanur Luxury Seaside',
    receiver: 'Budi Santoso (Supervisor Site)',
    driver: 'Wayan Sumerta (Truck Isuzu Elf)',
    items: '24x Panel LONGI 585 Wp + 1 Inverter Deye + 14 Rail AL6005',
    departure: '05 Okt, 08:30',
    eta: '05 Okt, 10:15',
    status: 'Tiba di Lokasi',
    statusColor: 'success',
  },
  {
    doNumber: 'DO-SBX-2602',
    destination: 'PT Bali Logistik Pelabuhan Benoa',
    receiver: 'Eko Wahyudi (Structural Lead)',
    driver: 'Ketut Astawa (Truck Fuso 8 Ton)',
    items: '84x Panel Canadian Solar 585 Wp (3 Pallet Kayu Solid)',
    departure: '05 Okt, 09:15',
    eta: '05 Okt, 11:30',
    status: 'Dalam Perjalanan',
    statusColor: 'warning',
  },
  {
    doNumber: 'DO-SBX-2603',
    destination: 'Canggu Eco Boutique Resort',
    receiver: 'Agus Priyono (Electrical Lead)',
    driver: 'Made Arta (Pickup Hilux)',
    items: '4x Baterai LiFePO4 Deye 5.12 kWh + Box Panel DC/AC',
    departure: '05 Okt, 13:00',
    eta: '05 Okt, 14:45',
    status: 'Pemuatan di Gudang',
    statusColor: 'info',
  },
  {
    doNumber: 'DO-SBX-2604',
    destination: 'Agro Tabanan Greenhouse',
    receiver: 'Tim Alpha Tabanan',
    driver: 'Nyoman Darsa (Truck Box)',
    items: '60x Modul Jinko Bifacial + Aksesoris Clamping M8',
    departure: '06 Okt, 07:30',
    eta: '06 Okt, 10:00',
    status: 'Terjadwal Besok',
    statusColor: 'purple',
  },
];

export default function DeliveryView({ onBackToDashboard }) {
  const [shipments, setShipments] = useState(SHIPMENTS);
  const [toast, setToast] = useState('');

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Delivery &amp; Logistics</span>
          </div>
          <h1 className="sbx-view-title">🚚 Delivery &amp; Manajemen Logistik Site</h1>
          <p className="sbx-view-sub">
            Pelacakan surat jalan (DO), armada truk ekspedisi panel surya, status bongkar muat, dan verifikasi barang tiba di site.
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
              setToast('🚚 Form Surat Jalan Pengiriman (DO) baru siap dibuat.');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Buat Surat Jalan (DO)
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Armada Aktif Hari Ini</span>
            <div className="sbx-metric-icon">🚚</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">3 Armada</span>
            <span className="sbx-status-badge info">En Route</span>
          </div>
          <p className="sbx-metric-subtext">Truk Fuso, Isuzu Elf, &amp; Pickup Hilux</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Panel Surya Terkirim</span>
            <div className="sbx-metric-icon">📦</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">108 Panel</span>
            <span className="sbx-metric-badge-delta">Hari Ini</span>
          </div>
          <p className="sbx-metric-subtext">Total bobot aman 3.2 Ton</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Tingkat Kerusakan Barang</span>
            <div className="sbx-metric-icon">🛡️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">0.0%</span>
            <span className="sbx-status-badge success">Zero Damage</span>
          </div>
          <p className="sbx-metric-subtext">Dilengkapi palet pelindung &amp; asuransi kargo</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Tepat Waktu Tiba Site</span>
            <div className="sbx-metric-icon">⏱️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">98.5%</span>
            <span className="sbx-status-badge success">On Schedule</span>
          </div>
          <p className="sbx-metric-subtext">Rata-rata deviasi &lt; 20 menit</p>
        </div>
      </div>

      {/* Shipment Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-card-header">
          <h2 className="sbx-card-title">📦 Surat Jalan &amp; Status Pengiriman Material Proyek</h2>
          <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
            Gudang Distribusi Utama: Jl. Bypass Ngurah Rai, Denpasar
          </span>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>No. Surat Jalan (DO)</th>
                <th>Tujuan Site Proyek</th>
                <th>Rincian Material Angkut</th>
                <th>Pengemudi &amp; Armada</th>
                <th>Waktu Berangkat / ETA</th>
                <th>Status Pengiriman</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.doNumber}>
                  <td>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--sbx-accent)', fontSize: '12px' }}>
                        {s.doNumber}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{s.destination}</div>
                    <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Penerima: {s.receiver}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--sbx-text)', maxWidth: '280px' }}>
                      {s.items}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>{s.driver}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11.5px', color: 'var(--sbx-text)' }}>{s.departure}</div>
                    <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>ETA: {s.eta}</div>
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${s.statusColor}`}>{s.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="sbx-row-action-btn"
                      onClick={() => {
                        setToast(`📍 Membuka live GPS pelacakan ${s.driver}...`);
                        setTimeout(() => setToast(''), 4000);
                      }}
                    >
                      Lacak GPS
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
