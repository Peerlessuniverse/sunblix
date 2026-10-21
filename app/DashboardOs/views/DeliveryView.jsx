'use client';

import { useState } from 'react';

const SHIPMENTS = [];

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
            <span className="sbx-metric-val">{shipments.length} Armada</span>
            <span className={`sbx-status-badge ${shipments.length > 0 ? 'info' : 'success'}`}>
              {shipments.length > 0 ? 'En Route' : 'Pool Standby'}
            </span>
          </div>
          <p className="sbx-metric-subtext">
            {shipments.length > 0 ? 'Truk logistik dalam pengantaran' : 'Armada siap operasional pengiriman'}
          </p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Panel Surya Terkirim</span>
            <div className="sbx-metric-icon">📦</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{shipments.length > 0 ? '108 Panel' : '0 Panel'}</span>
            <span className="sbx-metric-badge-delta">Hari Ini</span>
          </div>
          <p className="sbx-metric-subtext">
            {shipments.length > 0 ? 'Total bobot aman 3.2 Ton' : 'Gudang siap melakukan muat modul'}
          </p>
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
            <span className="sbx-metric-val">100%</span>
            <span className="sbx-status-badge success">On Schedule</span>
          </div>
          <p className="sbx-metric-subtext">SOP koordinasi supervisor site</p>
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
              {shipments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚚</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', marginBottom: '4px' }}>
                      Belum Ada Surat Jalan Pengiriman Aktif
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Surat jalan (DO) material modul surya, inverter, dan baterai akan dibuat saat proyek memasuki tahap konstruksi lapangan.
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
