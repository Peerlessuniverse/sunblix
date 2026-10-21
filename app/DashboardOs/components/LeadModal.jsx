'use client';

import { useState } from 'react';
import { saveStoreLead } from '../../../lib/sunblixOsStore';

export default function LeadModal({ lead, onClose, onSave }) {
  const isEdit = Boolean(lead && lead.id);

  const [formData, setFormData] = useState({
    id: lead?.id || '',
    name: lead?.name || '',
    company: lead?.company || '',
    location: lead?.location || 'Sanur, Denpasar - Bali',
    phone: lead?.phone || '+62 8',
    plnTariff: lead?.plnTariff || 'R-2 / 5,500 VA',
    targetKwp: lead?.targetKwp || '5.85 kWp',
    estValue: lead?.estValue || 'Rp 88,000,000',
    estValueNum: lead?.estValueNum || 88000000,
    stage: lead?.stage || 'Kualifikasi',
    leadSource: lead?.leadSource || 'Kalkulator Web',
    assigned: lead?.assigned || 'Sales Engineer (Agus)',
    notes: lead?.notes || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'estValueNum') {
      const num = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
      setFormData((prev) => ({
        ...prev,
        estValueNum: num,
        estValue: 'Rp ' + num.toLocaleString('id-ID'),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama calon klien wajib diisi.');
      return;
    }
    const saved = saveStoreLead(formData);
    if (onSave) onSave(saved);
    onClose();
  };

  return (
    <div className="sbx-modal-backdrop" onClick={onClose}>
      <div className="sbx-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-header">
          <div>
            <span className="sbx-modal-tag">SUNBLIX CRM PIPELINE</span>
            <h2 className="sbx-modal-title">
              {isEdit ? `✏️ Edit Prospek: ${lead.id}` : '✨ Tambah Prospek PLTS Baru'}
            </h2>
          </div>
          <button type="button" className="sbx-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sbx-modal-body">
          <div className="sbx-form-grid">
            <div className="sbx-form-group">
              <label className="sbx-form-label">Nama Calon Klien *</label>
              <input
                type="text"
                name="name"
                className="sbx-form-input"
                required
                placeholder="Contoh: Bapak Made Suryanata"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Nama Properti / Perusahaan</label>
              <input
                type="text"
                name="company"
                className="sbx-form-input"
                placeholder="Contoh: Villa Lotus Sanur / Residensial"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Nomor WhatsApp Aktif *</label>
              <input
                type="text"
                name="phone"
                className="sbx-form-input"
                required
                placeholder="+62 812-xxxx-xxxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Lokasi Properti</label>
              <input
                type="text"
                name="location"
                className="sbx-form-input"
                placeholder="Kota / Area (contoh: Canggu, Badung - Bali)"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Golongan Tarif & Daya PLN</label>
              <select
                name="plnTariff"
                className="sbx-form-select"
                value={formData.plnTariff}
                onChange={handleChange}
              >
                <option value="R-1 / 2,200 VA">R-1 / 2,200 VA (Rumah Tangga)</option>
                <option value="R-1 / 3,500 VA">R-1 / 3,500 VA</option>
                <option value="R-2 / 5,500 VA">R-2 / 5,500 VA</option>
                <option value="R-3 / 7,700 VA">R-3 / 7,700 VA</option>
                <option value="R-3 / 11,000 VA">R-3 / 11,000 VA</option>
                <option value="R-3 / 13,200 VA">R-3 / 13,200 VA</option>
                <option value="B-2 / 16,500 VA">B-2 / 16,500 VA (Bisnis / Komersial)</option>
                <option value="B-2 / 22,000 VA">B-2 / 22,000 VA</option>
                <option value="B-3 / 33,000 VA">B-3 / 33,000 VA</option>
                <option value="B-3 / 41,500 VA">B-3 / 41,500 VA</option>
                <option value="I-2 / 33,000 VA">I-2 / 33,000 VA (Industri)</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Usulan Kapasitas Sistem PLTS</label>
              <select
                name="targetKwp"
                className="sbx-form-select"
                value={formData.targetKwp}
                onChange={handleChange}
              >
                <option value="2.34 kWp (4 Panel)">2.34 kWp (4 Panel Astronergy 585 Wp)</option>
                <option value="3.51 kWp (6 Panel)">3.51 kWp (6 Panel)</option>
                <option value="4.68 kWp (8 Panel)">4.68 kWp (8 Panel)</option>
                <option value="5.85 kWp (10 Panel)">5.85 kWp (10 Panel)</option>
                <option value="7.02 kWp (12 Panel)">7.02 kWp (12 Panel)</option>
                <option value="8.19 kWp (14 Panel)">8.19 kWp (14 Panel)</option>
                <option value="9.36 kWp (16 Panel)">9.36 kWp (16 Panel)</option>
                <option value="11.70 kWp (20 Panel)">11.70 kWp (20 Panel)</option>
                <option value="14.04 kWp (24 Panel)">14.04 kWp (24 Panel)</option>
                <option value="18.72 kWp + 30 kWh Baterai">18.72 kWp + Baterai Hybrid</option>
                <option value="25.74 kWp 3-Phase">25.74 kWp 3-Phase Commercial</option>
                <option value="35.10 kWp 3-Phase">35.10 kWp 3-Phase Commercial</option>
                <option value="49.14 kWp Industrial">49.14 kWp Industrial Grade</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Estimasi Nilai Kontrak (Rp)</label>
              <input
                type="text"
                name="estValueNum"
                className="sbx-form-input"
                placeholder="88000000"
                value={formData.estValueNum || ''}
                onChange={handleChange}
              />
              <span className="sbx-form-hint">Terformat: {formData.estValue}</span>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Tahapan Pipeline CRM</label>
              <select
                name="stage"
                className="sbx-form-select"
                value={formData.stage}
                onChange={handleChange}
              >
                <option value="Kualifikasi">🤖 Kualifikasi AI / Lead Baru</option>
                <option value="Warm Lead">🔥 Warm Lead (Survei Disepakati)</option>
                <option value="Survey Terjadwal">📐 Survey Lokasi Terjadwal</option>
                <option value="SPH Terkirim">📑 SPH Penawaran Terkirim</option>
                <option value="Negosiasi">🤝 Negosiasi &amp; Klarifikasi</option>
                <option value="Deal Won">🏆 Deal Won (Siap Kontrak EPC)</option>
                <option value="Cold Lead">❄️ Cold Lead (Menolak / Menunda Survei)</option>
                <option value="Lost">❌ Lost / Dibatalkan</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">Sumber Prospek (Lead Source)</label>
              <select
                name="leadSource"
                className="sbx-form-select"
                value={formData.leadSource}
                onChange={handleChange}
              >
                <option value="Kalkulator Web">Kalkulator Web Sunblix</option>
                <option value="Agent Omni (AI Chat)">Agent Omni / SURTI AI</option>
                <option value="WhatsApp Inbound">WhatsApp Inbound Langsung</option>
                <option value="Referral EPC">Referral Mitra / Klien</option>
                <option value="Instagram Ads">Instagram / Meta Ads</option>
                <option value="Pameran & Expo">Pameran Energi / Expo</option>
              </select>
            </div>

            <div className="sbx-form-group">
              <label className="sbx-form-label">PIC Sales / Engineer</label>
              <input
                type="text"
                name="assigned"
                className="sbx-form-input"
                value={formData.assigned}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="sbx-form-group" style={{ marginTop: '12px' }}>
            <label className="sbx-form-label">Catatan Kebutuhan Klien &amp; Spesifikasi Atap</label>
            <textarea
              name="notes"
              className="sbx-form-textarea"
              rows={3}
              placeholder="Contoh: Atap genteng beton kemiringan 15 derajat, konsumsi siang tinggi untuk AC, minta simulasi sistem hybrid dengan baterai."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="sbx-modal-footer">
            <button type="button" className="sbx-filter-pill-btn" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="sbx-action-btn primary">
              💾 {isEdit ? 'Simpan Perubahan' : 'Daftarkan Prospek Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
