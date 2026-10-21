'use client';

import { useState } from 'react';
import { updateProjectProgress, deleteStoreProject } from '../../../lib/sunblixOsStore';

export default function ProjectDetailModal({ project, onClose, onEdit }) {
  const [currentProgress, setCurrentProgress] = useState(project.progress);
  const [currentStatus, setCurrentStatus] = useState(project.status);
  const [feedback, setFeedback] = useState('');

  const handleUpdate = () => {
    let sColor = 'info';
    if (currentProgress >= 100) sColor = 'success';
    else if (currentProgress >= 80) sColor = 'warning';
    else if (currentStatus.includes('Wiring')) sColor = 'purple';

    updateProjectProgress(project.code, currentProgress, currentStatus, sColor);
    setFeedback(`✅ Progres ${project.code} berhasil diperbarui ke ${currentProgress}% (${currentStatus}).`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus proyek ${project.code} (${project.name})?`)) {
      deleteStoreProject(project.code);
      onClose();
    }
  };

  return (
    <div className="sbx-modal-backdrop" onClick={onClose}>
      <div className="sbx-modal-card large" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sbx-modal-tag">{project.code}</span>
              <span className="sbx-tag">{project.type}</span>
            </div>
            <h2 className="sbx-modal-title" style={{ marginTop: '4px' }}>
              {project.name}
            </h2>
            <div style={{ color: 'var(--sbx-accent)', fontSize: '13px', fontWeight: 600 }}>
              Klien: {project.client} • 📍 {project.location}
            </div>
          </div>
          <button type="button" className="sbx-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sbx-modal-body">
          {feedback && <div className="sbx-toast-box" style={{ marginBottom: '14px' }}>{feedback}</div>}

          {/* Quick Metrics Cards */}
          <div className="sbx-metrics-row" style={{ marginBottom: '16px' }}>
            <div className="sbx-metric-card">
              <span className="sbx-metric-label">Kapasitas Puncak</span>
              <div className="sbx-metric-val" style={{ fontSize: '18px', color: 'var(--sbx-accent)' }}>
                ⚡ {project.kwp}
              </div>
              <p className="sbx-metric-subtext">{project.panels}</p>
            </div>

            <div className="sbx-metric-card">
              <span className="sbx-metric-label">Nilai Kontrak EPC</span>
              <div className="sbx-metric-val" style={{ fontSize: '18px', color: '#10b981' }}>
                {project.contractValue || 'Rp 148,000,000'}
              </div>
              <p className="sbx-metric-subtext">Est. Yield: {project.estYield}</p>
            </div>

            <div className="sbx-metric-card">
              <span className="sbx-metric-label">Target COD (Commissioning)</span>
              <div className="sbx-metric-val" style={{ fontSize: '16px' }}>
                📅 {project.cod}
              </div>
              <p className="sbx-metric-subtext">Inverter: {project.inverter}</p>
            </div>
          </div>

          {/* Interactive Progress & Status Updater */}
          <div className="sbx-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                🚀 Kontrol Progres Konstruksi &amp; Status EPC:
              </span>
              <span className={`sbx-status-badge ${project.statusColor || 'info'}`}>
                {currentStatus} ({currentProgress}%)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentProgress}
                onChange={(e) => setCurrentProgress(Number(e.target.value))}
                className="sbx-form-range"
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--sbx-accent)', minWidth: '50px' }}>
                {currentProgress}%
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                className="sbx-form-select"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="Survey & Engineering Design">📐 Survey &amp; Engineering Design</option>
                <option value="Pengadaan Material / Logistics">📦 Pengadaan Material / Logistics</option>
                <option value="Instalasi Struktur Rangka">🔩 Instalasi Struktur Rangka</option>
                <option value="Instalasi Lapangan">☀️ Instalasi Panel &amp; Stringing DC</option>
                <option value="Wiring & Inverter Setup">⚡ Wiring &amp; Inverter Setup</option>
                <option value="Commissioning">🔍 Commissioning &amp; Uji SLO</option>
                <option value="Live Terkoneksi">✅ Live Terkoneksi (COD Selesai)</option>
              </select>

              <button
                type="button"
                className="sbx-action-btn primary"
                onClick={handleUpdate}
              >
                Simpan Progres
              </button>
            </div>
          </div>

          {/* Technical Specs & BoQ Summary */}
          <div className="sbx-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: 'var(--sbx-text)' }}>
              📋 Rincian Komponen Utama (Bill of Quantity):
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--sbx-text-muted)', lineHeight: '1.8' }}>
              <li><strong>Modul Surya:</strong> {project.panels} — Garansi Efisiensi 25 Tahun</li>
              <li><strong>Inverter PLTS:</strong> {project.inverter} — Garansi Produk 5 Tahun</li>
              <li><strong>Struktur Mounting:</strong> Aluminium Rail AL6005-T5 Anti-Korosi Maritim C4</li>
              <li><strong>Kelistrikan &amp; Proteksi:</strong> DC Combiner Box + SPD Tipe II + MCB DC Chint</li>
              <li><strong>Catatan Lapangan:</strong> {project.notes || 'Pekerjaan berjalan sesuai jadwal keselamatan K3.'}</li>
            </ul>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="sbx-filter-pill-btn"
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
              >
                ✏️ Edit Lengkap
              </button>
              <button
                type="button"
                className="sbx-filter-pill-btn"
                style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                onClick={handleDelete}
              >
                🗑️ Hapus Proyek
              </button>
            </div>

            <button type="button" className="sbx-action-btn" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
