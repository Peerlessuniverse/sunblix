'use client';

import { useState } from 'react';
import { saveStoreTask } from '../../../lib/sunblixOsStore';

export default function TaskModal({ task, onClose, onSave }) {
  const isEdit = Boolean(task && task.id);

  const [formData, setFormData] = useState({
    id: task?.id || '',
    title: task?.title || '',
    category: task?.category || 'Engineering',
    priority: task?.priority || 'HIGH',
    assignee: task?.assignee || 'Tim EPC Engineer',
    dueDate: task?.dueDate || 'Hari ini, 17:00',
    status: task?.status || 'pending',
    project: task?.project || 'General Operations',
    icon: task?.icon || '⚡',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      let ic = '📌';
      if (value === 'Engineering') ic = '⚡';
      else if (value === 'Approval') ic = '📦';
      else if (value === 'Sales') ic = '📑';
      else if (value === 'Quality Control') ic = '🔧';
      else if (value === 'Finance') ic = '💵';
      else if (value === 'IoT Monitoring') ic = '🛡️';
      setFormData((prev) => ({ ...prev, category: value, icon: ic }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul tugas wajib diisi.');
      return;
    }
    const saved = saveStoreTask(formData);
    if (onSave) onSave(saved);
    onClose();
  };

  return (
    <div className="sbx-modal-backdrop" onClick={onClose}>
      <div className="sbx-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-header">
          <div>
            <span className="sbx-modal-tag">MY WORK &amp; APPROVAL INBOX</span>
            <h2 className="sbx-modal-title">
              {isEdit ? `✏️ Edit Tugas: ${task.id}` : '📥 Tambah Tugas Operasional Baru'}
            </h2>
          </div>
          <button type="button" className="sbx-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sbx-modal-body">
          <div className="sbx-form-grid">
            <div className="sbx-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="sbx-form-label">Deskripsi Judul Tugas *</label>
              <input
                type="text"
                name="title"
                className="sbx-form-input"
                required
                placeholder="Contoh: Review Single Line Diagram 14.04 kWp Villa Sanur"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Kategori Tugas</label>
              <select
                name="category"
                className="sbx-form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Engineering">⚡ Engineering &amp; Desain SLD</option>
                <option value="Approval">📦 Approval Direksi / Pengadaan</option>
                <option value="Sales">📑 Sales &amp; SPH Proposal</option>
                <option value="Quality Control">🔧 Quality Control &amp; Uji K3</option>
                <option value="Finance">💵 Finance &amp; Rekonsiliasi</option>
                <option value="IoT Monitoring">🛡️ IoT &amp; Telemetri Inverter</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Prioritas</label>
              <select
                name="priority"
                className="sbx-form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="URGENT">🚨 URGENT (Mendesak)</option>
                <option value="HIGH">⚡ HIGH (Tinggi)</option>
                <option value="MEDIUM">⚖️ MEDIUM (Normal)</option>
                <option value="LOW">☕ LOW (Rendah)</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Ditugaskan Kepada (Assignee)</label>
              <input
                type="text"
                name="assignee"
                className="sbx-form-input"
                placeholder="Danny / Tim EPC Engineer / Agent Solaria"
                value={formData.assignee}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Tenggat Waktu (Due Date)</label>
              <input
                type="text"
                name="dueDate"
                className="sbx-form-input"
                placeholder="Hari ini, 16:00 / Besok, 10:00"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="sbx-form-label">Nama Proyek Terkait</label>
              <input
                type="text"
                name="project"
                className="sbx-form-input"
                placeholder="Villa Sanur Seaside / Warehouse Benoa"
                value={formData.project}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="sbx-modal-footer">
            <button type="button" className="sbx-filter-pill-btn" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="sbx-action-btn primary">
              💾 Simpan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
