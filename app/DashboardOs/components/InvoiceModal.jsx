'use client';

import { useState } from 'react';
import { saveStoreInvoice } from '../../../lib/sunblixOsStore';

export default function InvoiceModal({ invoice, onClose, onSave }) {
  const isEdit = Boolean(invoice && invoice.invNumber);

  const [formData, setFormData] = useState({
    invNumber: invoice?.invNumber || '',
    client: invoice?.client || '',
    projectCode: invoice?.projectCode || 'SBX-PRJ-2601',
    kwp: invoice?.kwp || '9.36 kWp PRO',
    milestone: invoice?.milestone || 'Termin 1 (DP 50% Penandatanganan Kontrak)',
    amount: invoice?.amount || 'Rp 74,000,000',
    amountNum: invoice?.amountNum || 74000000,
    dueDate: invoice?.dueDate || '7 Hari Kerja',
    status: invoice?.status || 'Menunggu Pelunasan',
    statusColor: invoice?.statusColor || 'warning',
    method: invoice?.method || 'BCA Virtual Account / Mandiri',
    paidAt: invoice?.paidAt || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amountNum') {
      const num = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
      setFormData((prev) => ({
        ...prev,
        amountNum: num,
        amount: 'Rp ' + num.toLocaleString('id-ID'),
      }));
    } else if (name === 'status') {
      const isPaid = value === 'Lunas';
      setFormData((prev) => ({
        ...prev,
        status: value,
        statusColor: isPaid ? 'success' : value.includes('Terlambat') ? 'danger' : 'warning',
        paidAt: isPaid ? (prev.paidAt || new Date().toLocaleDateString('id-ID')) : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client.trim()) {
      alert('Nama klien wajib diisi.');
      return;
    }
    const saved = saveStoreInvoice(formData);
    if (onSave) onSave(saved);
    onClose();
  };

  return (
    <div className="sbx-modal-backdrop" onClick={onClose}>
      <div className="sbx-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-header">
          <div>
            <span className="sbx-modal-tag">SUNBLIX FINANCE &amp; BILLING</span>
            <h2 className="sbx-modal-title">
              {isEdit ? `✏️ Edit Faktur: ${invoice.invNumber}` : '💵 Buat Faktur Tagihan Termin Baru'}
            </h2>
          </div>
          <button type="button" className="sbx-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sbx-modal-body">
          <div className="sbx-form-grid">
            <div className="sbx-form-group">
              <label className="sbx-form-label">Nama Klien / Perusahaan *</label>
              <input
                type="text"
                name="client"
                className="sbx-form-input"
                required
                placeholder="Bapak Made Suryanata (Villa Sanur)"
                value={formData.client}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Kode Referensi Proyek</label>
              <input
                type="text"
                name="projectCode"
                className="sbx-form-input"
                placeholder="SBX-PRJ-2601"
                value={formData.projectCode}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Tahapan Termin Pembayaran</label>
              <select
                name="milestone"
                className="sbx-form-select"
                value={formData.milestone}
                onChange={handleChange}
              >
                <option value="Termin 1 (DP 50% Penandatanganan Kontrak)">Termin 1 (DP 50% Kontrak)</option>
                <option value="Termin 2 (40% Material Tiba di Site)">Termin 2 (40% Material Tiba di Site)</option>
                <option value="Termin 3 (Pelunasan 10% Pasca-Commissioning)">Termin 3 (Pelunasan 10% Pasca-COD)</option>
                <option value="Biaya Tambahan / Custom Racking">Biaya Tambahan / Custom Racking</option>
                <option value="Upgrade Baterai LiFePO4">Upgrade Baterai LiFePO4</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Kapasitas Sistem PLTS</label>
              <input
                type="text"
                name="kwp"
                className="sbx-form-input"
                placeholder="14.04 kWp PRO"
                value={formData.kwp}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Nominal Tagihan (Rp) *</label>
              <input
                type="text"
                name="amountNum"
                className="sbx-form-input"
                required
                placeholder="74000000"
                value={formData.amountNum || ''}
                onChange={handleChange}
              />
              <span className="sbx-form-hint">Terformat: {formData.amount}</span>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Batas Waktu Pembayaran (Due Date)</label>
              <input
                type="text"
                name="dueDate"
                className="sbx-form-input"
                placeholder="Contoh: 25 Okt 2026 / 7 Hari Kerja"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Metode Pembayaran</label>
              <select
                name="method"
                className="sbx-form-select"
                value={formData.method}
                onChange={handleChange}
              >
                <option value="BCA Virtual Account / Mandiri">BCA Virtual Account / Mandiri</option>
                <option value="Bank Mandiri Escrow">Bank Mandiri Escrow</option>
                <option value="BCA Corporate Giro">BCA Corporate Giro</option>
                <option value="Transfer Antar Bank">Transfer Antar Bank Langsung</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Status Faktur</label>
              <select
                name="status"
                className="sbx-form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Menunggu Pelunasan">⏳ Menunggu Pelunasan</option>
                <option value="Lunas">✅ Lunas (Telah Diterima)</option>
                <option value="Jatuh Tempo Mendekat">⚠️ Jatuh Tempo Mendekat</option>
                <option value="Terlambat / Overdue">❌ Terlambat / Overdue</option>
              </select>
            </div>
          </div>

          <div className="sbx-modal-footer">
            <button type="button" className="sbx-filter-pill-btn" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="sbx-action-btn primary">
              💾 {isEdit ? 'Simpan Faktur' : 'Terbitkan Faktur Tagihan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
