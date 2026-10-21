'use client';

import { useState, useEffect } from 'react';
import { getStoreInvoices, markInvoicePaid, deleteStoreInvoice, subscribeToStore } from '../../../lib/sunblixOsStore';
import InvoiceModal from '../components/InvoiceModal';

export default function FinanceView({ onBackToDashboard }) {
  const [invoices, setInvoices] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  const refresh = () => {
    setInvoices(getStoreInvoices());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch =
      inv.invNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      (inv.projectCode && inv.projectCode.toLowerCase().includes(search.toLowerCase())) ||
      inv.milestone.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === 'paid') return inv.status === 'Lunas';
    if (activeFilter === 'pending') return inv.status === 'Menunggu Pelunasan' || inv.status === 'Jatuh Tempo Mendekat';
    return true;
  });

  // Calculate dynamic financial metrics
  const totalPaidNum = invoices
    .filter((i) => i.status === 'Lunas')
    .reduce((acc, curr) => acc + (curr.amountNum || 0), 0);

  const totalPendingNum = invoices
    .filter((i) => i.status !== 'Lunas')
    .reduce((acc, curr) => acc + (curr.amountNum || 0), 0);

  const collectionRatio =
    totalPaidNum + totalPendingNum > 0
      ? ((totalPaidNum / (totalPaidNum + totalPendingNum)) * 100).toFixed(1) + '%'
      : '0%';

  const handleMarkPaid = (invNumber) => {
    markInvoicePaid(invNumber);
    setToast(`✅ Faktur ${invNumber} berhasil ditandai LUNAS dan dicatat ke kas perusahaan!`);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = (invNumber) => {
    if (confirm(`Yakin ingin menghapus faktur ${invNumber}?`)) {
      deleteStoreInvoice(invNumber);
      setToast(`🗑️ Faktur ${invNumber} telah dihapus.`);
      setTimeout(() => setToast(''), 3000);
    }
  };

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
          <h1 className="sbx-view-title">💵 Keuangan &amp; Faktur Termin PLTS</h1>
          <p className="sbx-view-sub">
            Pelacakan termin pembayaran proyek (DP 50%, Material 40%, COD 10%), status lunas, dan rekonsiliasi kas bank.
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
              setEditingInvoice(null);
              setIsModalOpen(true);
            }}
          >
            + Buat Faktur Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards Strip */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Kas Masuk (Lunas)</span>
            <div className="sbx-metric-icon">💰</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val" style={{ color: '#10b981' }}>
              Rp {(totalPaidNum / 1000000).toLocaleString('id-ID')} Jt
            </span>
            <span className="sbx-status-badge success">Kas Diterima</span>
          </div>
          <p className="sbx-metric-subtext">Dari {invoices.filter((i) => i.status === 'Lunas').length} faktur yang telah lunas</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Piutang Berjalan (Pending)</span>
            <div className="sbx-metric-icon">⏳</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val" style={{ color: '#f59e0b' }}>
              Rp {(totalPendingNum / 1000000).toLocaleString('id-ID')} Jt
            </span>
            <span className="sbx-status-badge warning">Piutang Aktif</span>
          </div>
          <p className="sbx-metric-subtext">Menunggu jatuh tempo / verifikasi</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Rasio Kolektibilitas</span>
            <div className="sbx-metric-icon">📊</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{collectionRatio}</span>
            <span className="sbx-metric-badge-delta">Arus Kas</span>
          </div>
          <p className="sbx-metric-subtext">Ketepatan bayar klien proyek</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Faktur Diterbitkan</span>
            <div className="sbx-metric-icon">📑</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{invoices.length} Faktur</span>
            <span className="sbx-status-badge info">Resmi</span>
          </div>
          <p className="sbx-metric-subtext">Standar invoice SUNBLIX 2026</p>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Semua Faktur ({invoices.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'paid' ? 'active' : ''}`}
              onClick={() => setActiveFilter('paid')}
            >
              ✅ Lunas ({invoices.filter((i) => i.status === 'Lunas').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              ⏳ Menunggu Pelunasan ({invoices.filter((i) => i.status !== 'Lunas').length})
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari faktur, klien, proyek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>No. Faktur</th>
                <th>Klien &amp; Proyek</th>
                <th>Termin Milestone</th>
                <th>Kapasitas</th>
                <th>Nominal Tagihan</th>
                <th>Jatuh Tempo</th>
                <th>Status Pembayaran</th>
                <th>Metode</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.invNumber}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--sbx-accent)', fontSize: '12px' }}>
                      {inv.invNumber}
                    </span>
                    {inv.projectCode && (
                      <div style={{ fontSize: '10.5px', color: 'var(--sbx-text-dim)' }}>
                        Ref: {inv.projectCode}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)' }}>{inv.client}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>{inv.milestone}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                      ⚡ {inv.kwp}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: inv.status === 'Lunas' ? '#10b981' : '#f59e0b', fontSize: '13px' }}>
                      {inv.amount}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
                      📅 {inv.dueDate}
                    </span>
                    {inv.paidAt && (
                      <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                        Lunas: {inv.paidAt}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${inv.statusColor || (inv.status === 'Lunas' ? 'success' : 'warning')}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)' }}>{inv.method}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {inv.status !== 'Lunas' && (
                        <button
                          type="button"
                          className="sbx-row-action-btn"
                          style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          title="Tandai Lunas"
                          onClick={() => handleMarkPaid(inv.invNumber)}
                        >
                          ✓ Lunas
                        </button>
                      )}
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => setReceiptInvoice(inv)}
                        title="Lihat Kwitansi / Bukti Tagihan"
                      >
                        Receipt
                      </button>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => {
                          setEditingInvoice(inv);
                          setIsModalOpen(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        style={{ color: '#f43f5e' }}
                        onClick={() => handleDelete(inv.invNumber)}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--sbx-text-muted)' }}>
                    Tidak ada faktur yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add / Edit Invoice */}
      {isModalOpen && (
        <InvoiceModal
          invoice={editingInvoice}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setToast('✅ Faktur berhasil disimpan ke database!');
            setTimeout(() => setToast(''), 3000);
          }}
        />
      )}

      {/* MODAL 2: Receipt / Kwitansi Preview Modal */}
      {receiptInvoice && (
        <div className="sbx-modal-backdrop" onClick={() => setReceiptInvoice(null)}>
          <div className="sbx-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sbx-modal-header">
              <div>
                <span className="sbx-modal-tag">BUKTI RESMI TAGIHAN / KWITANSI</span>
                <h2 className="sbx-modal-title">{receiptInvoice.invNumber}</h2>
              </div>
              <button type="button" className="sbx-modal-close-btn" onClick={() => setReceiptInvoice(null)}>
                ✕
              </button>
            </div>

            <div className="sbx-modal-body" style={{ background: '#0a0f1d', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--sbx-text)' }}>PT SUNBLIX ENERGI INDONESIA</div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Jakarta Selatan</div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Hotline: +62 21 7362 639 • Email: billing@sunblix.id</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`sbx-status-badge ${receiptInvoice.status === 'Lunas' ? 'success' : 'warning'}`}>
                    {receiptInvoice.status}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)', marginTop: '4px' }}>
                    Jatuh Tempo: {receiptInvoice.dueDate}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12.5px', marginBottom: '18px' }}>
                <div>
                  <span style={{ color: 'var(--sbx-text-muted)' }}>Ditujukan Kepada:</span>
                  <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '14px', marginTop: '2px' }}>
                    {receiptInvoice.client}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--sbx-text-muted)' }}>Referensi Proyek:</span>
                  <div style={{ fontWeight: 700, color: 'var(--sbx-accent)', marginTop: '2px' }}>
                    {receiptInvoice.projectCode || 'Kontrak EPC PLTS'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--sbx-glass-border)', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--sbx-text-muted)' }}>Deskripsi Tagihan:</span>
                  <span style={{ fontWeight: 700, color: 'var(--sbx-text)' }}>{receiptInvoice.milestone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--sbx-text-muted)' }}>Kapasitas Sistem:</span>
                  <span>{receiptInvoice.kwp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--sbx-text)' }}>Total Tagihan:</span>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: '#10b981' }}>{receiptInvoice.amount}</span>
                </div>
              </div>

              <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)', lineHeight: '1.5' }}>
                Rekening Pembayaran Resmi:<br />
                <strong>Bank Central Asia (BCA)</strong>: 541-098-7711 a/n PT Sunblix Energi Indonesia<br />
                <strong>Bank Mandiri</strong>: 127-00-1122334-0 a/n PT Sunblix Energi Indonesia
              </div>
            </div>

            <div className="sbx-modal-footer">
              <button
                type="button"
                className="sbx-filter-pill-btn"
                onClick={() => window.print()}
              >
                🖨️ Cetak Kwitansi
              </button>
              <button
                type="button"
                className="sbx-action-btn primary"
                onClick={() => setReceiptInvoice(null)}
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
