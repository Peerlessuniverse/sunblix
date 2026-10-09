'use client';

import { useState } from 'react';

const INVOICES = [
  {
    invNumber: 'INV-SBX-2601',
    client: 'Bapak Made Suryanata (Villa Sanur)',
    kwp: '14.04 kWp PRO',
    milestone: 'Termin 2 (50% Material Tiba di Site)',
    amount: 'Rp 74,000,000',
    dueDate: '02 Okt 2026',
    status: 'Lunas',
    statusColor: 'success',
    method: 'BCA Virtual Account',
  },
  {
    invNumber: 'INV-SBX-2602',
    client: 'PT Logistik Samudera (Benoa Port)',
    kwp: '49.14 kWp PRO+',
    milestone: 'Termin 1 (DP 30% Penandatanganan Kontrak)',
    amount: 'Rp 145,500,000',
    dueDate: '28 Sep 2026',
    status: 'Lunas',
    statusColor: 'success',
    method: 'Bank Mandiri Escrow',
  },
  {
    invNumber: 'INV-SBX-2603',
    client: 'PT Ubud Heritage (Ubud Retreat)',
    kwp: '25.74 kWp PRO+',
    milestone: 'Termin 3 (Pelunasan 20% Pasca-Commissioning)',
    amount: 'Rp 69,000,000',
    dueDate: '10 Okt 2026',
    status: 'Menunggu Pelunasan',
    statusColor: 'warning',
    method: 'Transfer Bank Mandiri',
  },
  {
    invNumber: 'INV-SBX-2604',
    client: 'Dr. Michael Chen (Chen Clinic)',
    kwp: '14.04 kWp PRO',
    milestone: 'Termin 1 (DP 30% Approval SPH)',
    amount: 'Rp 64,500,000',
    dueDate: '07 Okt 2026',
    status: 'Jatuh Tempo Mendekat',
    statusColor: 'warning',
    method: 'BCA Corporate',
  },
  {
    invNumber: 'INV-SBX-2605',
    client: 'Canggu Living Group (Eco Resort)',
    kwp: '18.72 kWp + Baterai',
    milestone: 'Termin 2 (Pengadaan Baterai Lithium 40%)',
    amount: 'Rp 119,200,000',
    dueDate: '01 Okt 2026',
    status: 'Lunas',
    statusColor: 'success',
    method: 'BCA Giro',
  },
];

export default function FinanceView({ onBackToDashboard }) {
  const [invoices, setInvoices] = useState(INVOICES);
  const [toast, setToast] = useState('');

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Finance &amp; Invoices</span>
          </div>
          <h1 className="sbx-view-title">💵 Finance &amp; Arus Kas Proyek EPC</h1>
          <p className="sbx-view-sub">
            Monitoring penerimaan termin pembayaran proyek, faktur invoice terbuka, COGS material, dan laba operasional.
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
              setToast('💵 Form pembuatan invoice penagihan baru dibuka.');
              setTimeout(() => setToast(''), 3000);
            }}
          >
            + Buat Faktur Invoice Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Pendapatan YTD (2026)</span>
            <div className="sbx-metric-icon">🪙</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">Rp 24.8B</span>
            <span className="sbx-metric-badge-delta">↑ 18.6%</span>
          </div>
          <p className="sbx-metric-subtext">Target tahunan Rp 30 Miliar</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Piutang Berjalan (AR)</span>
            <div className="sbx-metric-icon">📥</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">Rp 133.5M</span>
            <span className="sbx-status-badge warning">2 Invoice</span>
          </div>
          <p className="sbx-metric-subtext">Ubud Retreat &amp; Chen Clinic</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Gross Margin Rata-rata</span>
            <div className="sbx-metric-icon">📊</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">28.4%</span>
            <span className="sbx-status-badge success">Sehat</span>
          </div>
          <p className="sbx-metric-subtext">Efisiensi pengadaan langsung Tier-1</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Likuiditas Kas Operasional</span>
            <div className="sbx-metric-icon">🏦</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">Rp 4.12B</span>
            <span className="sbx-status-badge info">BCA + Mandiri</span>
          </div>
          <p className="sbx-metric-subtext">Cakupan modal kerja 6 bulan ke depan</p>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-card-header">
          <h2 className="sbx-card-title">🧾 Daftar Faktur &amp; Termin Pembayaran Klien</h2>
          <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
            Standar Termin EPC: DP 30% • Material On-Site 50% • Handover 20%
          </span>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>No. Invoice &amp; Klien</th>
                <th>Paket Kapasitas</th>
                <th>Tahapan Termin Pembayaran</th>
                <th>Nominal Tagihan</th>
                <th>Jatuh Tempo</th>
                <th>Metode Bayar</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.invNumber}>
                  <td>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                        {inv.invNumber}
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{inv.client}</div>
                    </div>
                  </td>
                  <td>
                    <span className="sbx-tag">{inv.kwp}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>{inv.milestone}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '13px' }}>
                      {inv.amount}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>{inv.dueDate}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: 'var(--sbx-text-dim)' }}>{inv.method}</span>
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${inv.statusColor}`}>{inv.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="sbx-row-action-btn"
                      onClick={() => {
                        setToast(`🧾 Mengunduh kwitansi & invoice PDF ${inv.invNumber}...`);
                        setTimeout(() => setToast(''), 3500);
                      }}
                    >
                      Cetak PDF
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
