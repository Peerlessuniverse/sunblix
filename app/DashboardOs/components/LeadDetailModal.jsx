'use client';

import { useState } from 'react';
import { updateLeadStage, convertLeadToProject, deleteStoreLead } from '../../../lib/sunblixOsStore';

export default function LeadDetailModal({ lead, onClose, onEdit, onConverted }) {
  const [stage, setStage] = useState(lead.stage);
  const [feedback, setFeedback] = useState('');

  const handleStageChange = (newStage) => {
    setStage(newStage);
    updateLeadStage(lead.id, newStage);
    setFeedback(`✅ Status prospek diperbarui menjadi "${newStage}".`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleConvert = () => {
    const confirmConvert = confirm(
      `Konversi prospek ${lead.name} (${lead.targetKwp}) ke Kontrak Proyek EPC Aktif?\n\n` +
      `Sistem otomatis akan:\n` +
      `1. Membuat Proyek baru di Projects Portfolio\n` +
      `2. Membuat Faktur Termin 1 (DP 50%) di Finance\n` +
      `3. Membuat Tugas Kickoff Engineering di My Work`
    );
    if (!confirmConvert) return;

    const res = convertLeadToProject(lead.id);
    if (res && res.project) {
      alert(`🎉 Sukses! Proyek ${res.project.code} telah resmi diterbitkan bersama Faktur ${res.invoice.invNumber}.`);
      if (onConverted) onConverted(res);
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus prospek ${lead.id} (${lead.name})?`)) {
      deleteStoreLead(lead.id);
      onClose();
    }
  };

  const waUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Halo ${lead.name}, salam dari tim engineering PT Sunblix Energi Indonesia terkait perencanaan PLTS ${lead.targetKwp} Anda.`
  )}`;

  return (
    <div className="sbx-modal-backdrop" onClick={onClose}>
      <div className="sbx-modal-card large" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sbx-modal-tag">{lead.id}</span>
              <span className="sbx-tag">{lead.leadSource}</span>
            </div>
            <h2 className="sbx-modal-title" style={{ marginTop: '4px' }}>
              {lead.name}
            </h2>
            <div style={{ color: 'var(--sbx-accent)', fontSize: '13px', fontWeight: 600 }}>
              {lead.company} • 📍 {lead.location}
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
              <span className="sbx-metric-label">Target Kapasitas</span>
              <div className="sbx-metric-val" style={{ fontSize: '18px', color: 'var(--sbx-accent)' }}>
                ⚡ {lead.targetKwp}
              </div>
              <p className="sbx-metric-subtext">Tarif PLN: {lead.plnTariff}</p>
            </div>

            <div className="sbx-metric-card">
              <span className="sbx-metric-label">Estimasi Nilai Kontrak</span>
              <div className="sbx-metric-val" style={{ fontSize: '18px', color: '#10b981' }}>
                {lead.estValue}
              </div>
              <p className="sbx-metric-subtext">DP 50%: Rp {((lead.estValueNum || 0) * 0.5).toLocaleString('id-ID')}</p>
            </div>

            <div className="sbx-metric-card">
              <span className="sbx-metric-label">PIC Penanggung Jawab</span>
              <div className="sbx-metric-val" style={{ fontSize: '16px' }}>
                👤 {lead.assigned}
              </div>
              <p className="sbx-metric-subtext">Masuk: {lead.date}</p>
            </div>
          </div>

          {/* Pipeline Stage Quick Changer */}
          <div className="sbx-card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text-muted)', textTransform: 'uppercase' }}>
              Tahapan Pipeline Saat Ini:
            </span>
            <div className="sbx-tab-pills" style={{ marginTop: '8px', flexWrap: 'wrap' }}>
              {['Kualifikasi', 'Warm Lead', 'Survey Terjadwal', 'SPH Terkirim', 'Negosiasi', 'Deal Won', 'Cold Lead', 'Lost'].map((stg) => (
                <button
                  key={stg}
                  type="button"
                  className={`sbx-tab-btn ${stage === stg ? 'active' : ''}`}
                  onClick={() => handleStageChange(stg)}
                >
                  {stg === 'Deal Won' ? '🏆 ' + stg : stg === 'Lost' ? '❌ ' + stg : stg === 'Cold Lead' ? '❄️ ' + stg : stg === 'Warm Lead' ? '🔥 ' + stg : stg}
                </button>
              ))}
            </div>
          </div>

          {/* Notes and Roof Information */}
          <div className="sbx-card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: 'var(--sbx-text)' }}>
              📝 Catatan Teknis &amp; Hasil Konsultasi:
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--sbx-text-muted)', lineHeight: '1.6' }}>
              {lead.notes || 'Belum ada catatan khusus. Klien berminat untuk melakukan simulasi penghematan energi surya.'}
            </p>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sbx-action-btn"
                style={{ background: '#10b981', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                💬 Chat WhatsApp Langsung
              </a>
              {lead.sphPreset && (
                <a
                  href={`/brosur?preset=${lead.sphPreset}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sbx-action-btn"
                  style={{ background: '#0284c7', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  📄 Buka Dokumen SPH Resmi
                </a>
              )}
              <button
                type="button"
                className="sbx-filter-pill-btn"
                onClick={() => {
                  onClose();
                  onEdit(lead);
                }}
              >
                ✏️ Edit Data
              </button>
              <button
                type="button"
                className="sbx-filter-pill-btn"
                style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                onClick={handleDelete}
              >
                🗑️ Hapus
              </button>
            </div>

            <button
              type="button"
              className="sbx-action-btn primary"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 700 }}
              onClick={handleConvert}
            >
              🚀 Konversi ke Kontrak Proyek EPC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
