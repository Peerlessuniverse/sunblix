'use client';

import { useState } from 'react';

export default function CatalogueModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendWa, setSendWa] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    setLoading(true);

    // 1. Trigger Direct Download of Catalogue PDF
    const pdfPath = '/SUNBLIX_KATALOG_2026.pdf';
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfPath;
    downloadLink.download = 'SUNBLIX_KATALOG_2026_Solar_Specialist.pdf';
    downloadLink.target = '_blank';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => downloadLink.remove(), 200);

    // 2. Sync lead to Sunblix OS Store CRM (localStorage)
    try {
      const STORAGE_KEY = 'sunblix_os_store_v3';
      const rawStore = localStorage.getItem(STORAGE_KEY);
      let store = rawStore ? JSON.parse(rawStore) : { leads: [], projects: [], invoices: [], tasks: [], notifications: [] };
      if (!Array.isArray(store.leads)) store.leads = [];
      if (!Array.isArray(store.notifications)) store.notifications = [];

      const leadId = `LD-CAT-${Date.now().toString().slice(-4)}`;
      const newLead = {
        id: leadId,
        name: name.trim(),
        company: 'Unduh Katalog Resmi (15 Hal)',
        location: 'Website Hero Form',
        phone: phone.trim(),
        plnTariff: 'Residential / Commercial',
        targetKwp: 'Katalog Edisi 2026 (Standard+, PRO, PRO MAX)',
        estValue: 'Rp 63.500.000 - Rp 310.600.000',
        estValueNum: 88600000,
        stage: 'Kualifikasi',
        stageColor: 'cyan',
        date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        notes: `Prospek mendownload katalog resmi SUNBLIX 2026 dari tombol Hero. Email: ${email.trim()}, WA: ${phone.trim()}. Opsi kirim WA: ${sendWa ? 'Ya' : 'Tidak'}.`,
      };
      store.leads.unshift(newLead);

      // Add Notification in Sunblix OS
      store.notifications.unshift({
        id: `NTF-${Date.now()}`,
        time: 'Baru saja',
        isRead: false,
        category: 'crm',
        title: `📥 Unduhan Katalog Baru: ${name.trim()}`,
        desc: `${name.trim()} (${phone.trim()}) mengunduh katalog PDF resmi 2026. Prospek telah masuk ke CRM.`,
        targetNav: 'crm',
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (err) {
      console.warn('Storage error:', err);
    }

    // 3. Send lead to backend API asynchronously
    try {
      fetch('/api/surti/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_lead',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          customerType: 'residential',
          city: 'Indonesia',
          source: 'Hero Catalogue Download',
          notes: `Mengunduh katalog resmi 15 hal. Send WA: ${sendWa ? 'true' : 'false'}.`,
        }),
      }).catch((err) => console.log('API Lead sync background:', err));
    } catch {}

    setLoading(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  const waHref = `https://wa.me/6285288581027?text=${encodeURIComponent(
    `Halo SUNBLIX, saya ${name || 'Pelanggan'} baru saja mendownload katalog resmi 2026 dan ingin berkonsultasi mengenai solusi PLTS.`
  )}`;

  return (
    <div
      className={`catalogue-modal-backdrop ${isOpen ? 'is-open' : ''}`}
      onClick={handleClose}
      aria-hidden={!isOpen}
    >
      <div
        className="catalogue-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catModalTitle"
      >
        <button
          type="button"
          className="catalogue-modal-close-btn"
          onClick={handleClose}
          aria-label="Tutup Modal Katalog"
        >
          ✕
        </button>

        <div className="catalogue-modal-grid">
          {/* Left: Visual Preview Column */}
          <div className="catalogue-preview-col">
            <div>
              <div className="catalogue-preview-badge">
                <span>⚡</span> 15 Halaman • PDF Resmi
              </div>
              <div className="catalogue-cover-wrap">
                <img
                  src="/asset/katalog_cover.jpg"
                  alt="Cover Katalog Resmi SUNBLIX 2026"
                  className="catalogue-cover-img"
                />
                <div className="catalogue-cover-tag">EDISI RESMI 2026</div>
              </div>
            </div>

            <ul className="catalogue-highlights-list">
              <li><span className="check">✓</span> <span>Paket PLTS Standard+ &amp; PRO</span></li>
              <li><span className="check">✓</span> <span>Sistem Hybrid Inverter &amp; Battery ESS</span></li>
              <li><span className="check">✓</span> <span>Tabel Estimasi Kebutuhan Luas Atap</span></li>
              <li><span className="check">✓</span> <span>Jaminan Garansi 12 Tahun Tier-1</span></li>
            </ul>
          </div>

          {/* Right: Form / Success Column */}
          <div className="catalogue-form-col">
            {!isSuccess ? (
              <div>
                <div className="catalogue-brand-sup">PT SUNBLIX ENERGI INDONESIA</div>
                <h3 className="catalogue-title" id="catModalTitle">Download Katalog Resmi (PDF)</h3>
                <p className="catalogue-subtitle">
                  Dapatkan panduan lengkap spesifikasi teknis, pricelist paket, dan simulasi penghematan listrik PLTS.
                </p>

                <form className="catalogue-form" onSubmit={handleSubmit}>
                  <div className="cat-input-group">
                    <label className="cat-label" htmlFor="catNameInput">
                      <span>Nama Lengkap *</span>
                    </label>
                    <input
                      type="text"
                      id="catNameInput"
                      className="cat-input"
                      required
                      placeholder="Contoh: Bpk. Haris Setiawan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="cat-input-group">
                    <label className="cat-label" htmlFor="catEmailInput">
                      <span>Alamat Email *</span>
                    </label>
                    <input
                      type="email"
                      id="catEmailInput"
                      className="cat-input"
                      required
                      placeholder="email@anda.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="cat-input-group">
                    <label className="cat-label" htmlFor="catWaInput">
                      <span>Nomor WhatsApp *</span>
                    </label>
                    <input
                      type="tel"
                      id="catWaInput"
                      className="cat-input"
                      required
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="cat-checkbox-wrap">
                    <input
                      type="checkbox"
                      id="catSendWaCheck"
                      checked={sendWa}
                      onChange={(e) => setSendWa(e.target.checked)}
                    />
                    <label htmlFor="catSendWaCheck">Kirimkan juga salinan link katalog ke WhatsApp saya</label>
                  </div>

                  <button
                    type="submit"
                    className="cat-submit-btn"
                    disabled={loading}
                  >
                    <span>⬇️</span>
                    <span>{loading ? 'Menyiapkan Unduhan...' : 'Download Katalog PDF (15 Hal)'}</span>
                  </button>

                  <div className="cat-privacy-note">
                    <span>🛡️</span>
                    <span>Privasi data Anda aman. Unduhan PDF langsung aktif otomatis.</span>
                  </div>
                </form>
              </div>
            ) : (
              <div className="catalogue-success-box">
                <div className="cat-success-icon">✓</div>
                <h3 className="cat-success-title">Katalog Sedang Diunduh!</h3>
                <p className="cat-success-sub">
                  Terima kasih, <strong>{name}</strong>!<br />
                  File PDF resmi <strong>SUNBLIX_KATALOG_2026.pdf</strong> telah terunduh ke perangkat Anda.
                </p>

                <div className="cat-success-actions">
                  <a
                    href="/SUNBLIX_KATALOG_2026.pdf"
                    target="_blank"
                    className="cat-btn-action download-again"
                    download="SUNBLIX_KATALOG_2026_Solar_Specialist.pdf"
                  >
                    <span>📄</span> Buka / Unduh Ulang PDF
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cat-btn-action wa"
                  >
                    <span>💬</span> Hubungi Konsultan via WhatsApp
                  </a>
                  <button
                    type="button"
                    className="cat-btn-action close-view"
                    onClick={handleClose}
                  >
                    Selesai &amp; Kembali ke Website
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
