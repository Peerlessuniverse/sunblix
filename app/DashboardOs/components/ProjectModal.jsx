'use client';

import { useState } from 'react';
import { saveStoreProject } from '../../../lib/sunblixOsStore';

export default function ProjectModal({ project, onClose, onSave }) {
  const isEdit = Boolean(project && project.code);

  const [formData, setFormData] = useState({
    code: project?.code || '',
    name: project?.name || '',
    client: project?.client || '',
    location: project?.location || 'Sanur, Bali',
    type: project?.type || 'Residential (PRO)',
    kwp: project?.kwp || '9.36 kWp',
    kwpNum: project?.kwpNum || 9.36,
    inverter: project?.inverter || '1 Phase On-Grid 10 kW',
    panels: project?.panels || '16x LONGI 585 Wp',
    progress: project?.progress || 20,
    status: project?.status || 'Instalasi Struktur Rangka',
    statusColor: project?.statusColor || 'info',
    cod: project?.cod || 'Target 30 Hari Kerja',
    estYield: project?.estYield || '1,280 kWh/bln',
    contractValue: project?.contractValue || 'Rp 148,000,000',
    contractValueNum: project?.contractValueNum || 148000000,
    notes: project?.notes || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'progress') {
      const p = Number(value);
      let sColor = 'info';
      if (p >= 100) sColor = 'success';
      else if (p >= 80) sColor = 'warning';
      setFormData((prev) => ({
        ...prev,
        progress: p,
        statusColor: sColor,
      }));
    } else if (name === 'kwpNum') {
      const num = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        kwpNum: num,
        kwp: `${num.toFixed(2)} kWp`,
        estYield: `${Math.round(num * 135)} kWh/bln`,
        panels: `${Math.round((num * 1000) / 585)}x Modul 585 Wp`,
      }));
    } else if (name === 'contractValueNum') {
      const num = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
      setFormData((prev) => ({
        ...prev,
        contractValueNum: num,
        contractValue: 'Rp ' + num.toLocaleString('id-ID'),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client.trim()) {
      alert('Nama proyek dan nama klien wajib diisi.');
      return;
    }
    const saved = saveStoreProject(formData);
    if (onSave) onSave(saved);
    onClose();
  };

  return (
    <div className="sbx-modal-backdrop" onClick={onClose}>
      <div className="sbx-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-header">
          <div>
            <span className="sbx-modal-tag">SUNBLIX EPC OPERATIONS</span>
            <h2 className="sbx-modal-title">
              {isEdit ? `✏️ Edit Proyek: ${project.code}` : '☀️ Tambah Kontrak Proyek PLTS Baru'}
            </h2>
          </div>
          <button type="button" className="sbx-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sbx-modal-body">
          <div className="sbx-form-grid">
            <div className="sbx-form-group">
              <label className="sbx-form-label">Nama Proyek EPC *</label>
              <input
                type="text"
                name="name"
                className="sbx-form-input"
                required
                placeholder="Contoh: Villa Sanur Luxury Seaside"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Nama Klien / Pemilik *</label>
              <input
                type="text"
                name="client"
                className="sbx-form-input"
                required
                placeholder="Contoh: Bapak Made Suryanata"
                value={formData.client}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Lokasi Site Proyek</label>
              <input
                type="text"
                name="location"
                className="sbx-form-input"
                placeholder="Sanur, Bali / Jakarta Selatan"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Kategori Paket PLTS</label>
              <select
                name="type"
                className="sbx-form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Residential (Standard+)">Residential (Standard+)</option>
                <option value="Residential (PRO)">Residential (PRO)</option>
                <option value="Commercial (PRO+)">Commercial (PRO+ 3-Phase)</option>
                <option value="Hybrid Battery Storage">Hybrid Battery Storage (BESS)</option>
                <option value="Hybrid Microgrid">Hybrid Microgrid (Off-Grid Ready)</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Kapasitas Sistem (kWp)</label>
              <input
                type="number"
                step="0.01"
                name="kwpNum"
                className="sbx-form-input"
                placeholder="9.36"
                value={formData.kwpNum}
                onChange={handleChange}
              />
              <span className="sbx-form-hint">Estimasi: {formData.panels}</span>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Nilai Kontrak EPC (Rp)</label>
              <input
                type="text"
                name="contractValueNum"
                className="sbx-form-input"
                value={formData.contractValueNum || ''}
                onChange={handleChange}
              />
              <span className="sbx-form-hint">Terformat: {formData.contractValue}</span>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Spesifikasi Inverter</label>
              <input
                type="text"
                name="inverter"
                className="sbx-form-input"
                placeholder="Deye Hybrid 10 kW / On-Grid 5 kW"
                value={formData.inverter}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Target COD (Commissioning Date)</label>
              <input
                type="text"
                name="cod"
                className="sbx-form-input"
                placeholder="Contoh: 28 Okt 2026"
                value={formData.cod}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Tahapan Konstruksi / Status EPC</label>
              <select
                name="status"
                className="sbx-form-select"
                value={formData.status}
                onChange={(e) => {
                  const val = e.target.value;
                  let color = 'info';
                  if (val === 'Live Terkoneksi') color = 'success';
                  else if (val === 'Commissioning') color = 'warning';
                  else if (val.includes('Wiring')) color = 'purple';
                  setFormData((prev) => ({ ...prev, status: val, statusColor: color }));
                }}
              >
                <option value="Survey & Engineering Design">📐 Survey &amp; Engineering Design</option>
                <option value="Pengadaan Material / Logistics">📦 Pengadaan Material / Logistics</option>
                <option value="Instalasi Struktur Rangka">🔩 Instalasi Struktur Rangka</option>
                <option value="Instalasi Lapangan">☀️ Instalasi Panel &amp; Stringing DC</option>
                <option value="Wiring & Inverter Setup">⚡ Wiring &amp; Inverter Setup</option>
                <option value="Commissioning">🔍 Commissioning &amp; Uji SLO</option>
                <option value="Live Terkoneksi">✅ Live Terkoneksi (COD Selesai)</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">
                Progres Pekerjaan ({formData.progress}%)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  name="progress"
                  className="sbx-form-range"
                  value={formData.progress}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 800, minWidth: '45px', color: 'var(--sbx-accent)' }}>
                  {formData.progress}%
                </span>
              </div>
            </div>
          </div>

          <div className="sbx-form-group" style={{ marginTop: '12px' }}>
            <label className="sbx-form-label">Catatan Lapangan &amp; Kendala</label>
            <textarea
              name="notes"
              className="sbx-form-textarea"
              rows={2}
              placeholder="Contoh: Pengujian Megger kabel DC 1000V lulus 450 MOhm, inverter terpasang di ruang panel ber-AC."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="sbx-modal-footer">
            <button type="button" className="sbx-filter-pill-btn" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="sbx-action-btn primary">
              💾 {isEdit ? 'Simpan Proyek' : 'Terbitkan Kontrak Proyek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
