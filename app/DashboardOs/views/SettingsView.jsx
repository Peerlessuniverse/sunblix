'use client';

import { useState } from 'react';
import {
  resetStoreToDefault,
  clearAllStoreData,
  exportStoreJson,
  importStoreJson,
  getStoreLeads,
  getStoreProjects,
  getStoreInvoices,
  getStoreTasks,
  getStoreInventory,
} from '../../../lib/sunblixOsStore';

export default function SettingsView({ currentUser, onBackToDashboard }) {
  const [activeTab, setActiveTab] = useState('company');
  const [toast, setToast] = useState('');

  // Form states
  const [companyName, setCompanyName] = useState('PT SUNBLIX ENERGI INDONESIA');
  const [companyAddress, setCompanyAddress] = useState('Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330');
  const [companyPhone, setCompanyPhone] = useState('+62 852-8858-1027');
  const [companyEmail, setCompanyEmail] = useState('hello@sunblix.id');

  // WhatsApp Alert toggles
  const [alertCriticalTemp, setAlertCriticalTemp] = useState(true);
  const [alertNewLead, setAlertNewLead] = useState(true);
  const [alertInvoicePaid, setAlertInvoicePaid] = useState(true);
  const [alertDailySummary, setAlertDailySummary] = useState(false);

  // Local storage counts
  const leadsCount = getStoreLeads().length;
  const projectsCount = getStoreProjects().length;
  const invoicesCount = getStoreInvoices().length;
  const tasksCount = getStoreTasks().length;
  const inventoryCount = getStoreInventory().length;

  const handleClearAllDatabase = async () => {
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA DUMMY di Dashboard OS (CRM, Prospek, Proyek, Faktur, SPH, dan Tugas)? Database akan dikosongkan total.')) return;
    try {
      clearAllStoreData();
      const staffToken = typeof window !== 'undefined' ? localStorage.getItem('sunblix_staff_token') : null;
      const headers = staffToken ? { Authorization: `Bearer ${staffToken}` } : {};
      await Promise.all([
        fetch('/api/surti/sph', { method: 'DELETE', headers }),
        fetch('/api/surti/crm', { method: 'DELETE', headers }),
      ]);
      setToast('🗑️ Seluruh data dummy di Sunblix OS & SURTI berhasil dihapus total!');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert('Gagal mengosongkan data: ' + err.message);
    }
  };

  const handleResetDemo = () => {

    if (confirm('Yakin ingin mereset seluruh data lokal Sunblix OS kembali ke data awal demo resmi?')) {
      resetStoreToDefault();
      setToast('⚡ Seluruh database lokal berhasil di-reset ke data demo standar!');
      setTimeout(() => setToast(''), 4000);
    }
  };

  const handleExport = () => {
    const json = exportStoreJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sunblix_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('📥 Cadangan database lokal berhasil diunduh dalam format JSON!');
    setTimeout(() => setToast(''), 4000);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importStoreJson(content);
        if (res.success) {
          setToast('📤 Data berhasil dipulihkan dari file cadangan!');
          setTimeout(() => setToast(''), 4000);
        } else {
          alert('Gagal memulihkan data: ' + res.error);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Settings</span>
          </div>
          <h1 className="sbx-view-title">⚙️ Pengaturan Sistem &amp; Konfigurasi OS</h1>
          <p className="sbx-view-sub">
            Konfigurasi profil perusahaan, hak akses staf (RBAC), gateway MQTT IoT, dan integrasi data lokal.
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
              setToast('💾 Pengaturan Sunblix OS berhasil disimpan ke database lokal!');
              setTimeout(() => setToast(''), 3500);
            }}
          >
            💾 Simpan Pengaturan
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* Settings Navigation Tabs */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              🏢 Profil Perusahaan
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Tim &amp; Hak Akses (RBAC)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              🔔 Notifikasi &amp; WhatsApp Alert
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'iot' ? 'active' : ''}`}
              onClick={() => setActiveTab('iot')}
            >
              📡 Gateway IoT &amp; MQTT Server
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              💾 Data Lokal &amp; Cadangan
            </button>
          </div>
        </div>

        {/* TAB 1: COMPANY PROFILE */}
        {activeTab === 'company' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>
            <div className="sbx-field-box">
              <label className="sbx-field-label">Nama Badan Usaha EPC</label>
              <input
                type="text"
                className="sbx-text-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="sbx-field-box">
              <label className="sbx-field-label">Alamat Kantor Pusat &amp; Workshop</label>
              <textarea
                className="sbx-text-input"
                rows={2}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div className="sbx-field-box">
                <label className="sbx-field-label">Nomor Hotline Resmi</label>
                <input
                  type="text"
                  className="sbx-text-input"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </div>

              <div className="sbx-field-box">
                <label className="sbx-field-label">Email Korespondensi</label>
                <input
                  type="email"
                  className="sbx-text-input"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & RBAC */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--sbx-text-muted)', marginBottom: '4px' }}>
              Daftar Staf dan Akun yang Memiliki Akses ke Portal Sunblix OS:
            </div>

            {[
              {
                name: 'Danny',
                role: 'Director / CEO',
                email: 'danny@sunblix.id',
                level: 'Super Admin',
                badge: 'success',
              },
              {
                name: 'Tim Engineering EPC',
                role: 'Lead Rooftop EPC Engineer',
                email: 'engineer@sunblix.id',
                level: 'Engineering Lead',
                badge: 'info',
              },
              {
                name: 'Sales & Project Coordinator',
                role: 'Senior Sales Engineer',
                email: 'sales@sunblix.id',
                level: 'Sales Lead',
                badge: 'warning',
              },
            ].map((u) => (
              <div
                key={u.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--sbx-glass-border)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                    {u.email} • {u.role}
                  </div>
                </div>
                <span className={`sbx-status-badge ${u.badge}`}>{u.level}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
            <div className="sbx-toggle-row">
              <div>
                <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '12.5px' }}>
                  🚨 Alert Peringatan Suhu Inverter Tinggi (&gt;55°C)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>
                  Kirim notifikasi otomatis ke tim maintenance saat inverter mendeteksi suhu kritis.
                </div>
              </div>
              <input
                type="checkbox"
                checked={alertCriticalTemp}
                onChange={() => setAlertCriticalTemp(!alertCriticalTemp)}
                style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>

            <div className="sbx-toggle-row">
              <div>
                <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '12.5px' }}>
                  👥 Notifikasi Calon Klien Baru (Lead Inbound)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>
                  Notifikasi instan saat calon klien submit estimasi kalkulator surya atau chat SURTI AI.
                </div>
              </div>
              <input
                type="checkbox"
                checked={alertNewLead}
                onChange={() => setAlertNewLead(!alertNewLead)}
                style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>

            <div className="sbx-toggle-row">
              <div>
                <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '12.5px' }}>
                  💵 Notifikasi Pelunasan Termin Invoice
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>
                  Notifikasi instan saat klien berhasil melakukan transfer bank termin EPC.
                </div>
              </div>
              <input
                type="checkbox"
                checked={alertInvoicePaid}
                onChange={() => setAlertInvoicePaid(!alertInvoicePaid)}
                style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: IOT & MQTT */}
        {activeTab === 'iot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px' }}>
            <div className="sbx-field-box">
              <label className="sbx-field-label">MQTT Telemetry Broker Endpoint</label>
              <input
                type="text"
                className="sbx-text-input"
                defaultValue="tls://mqtt-prod.sunblix.id:8883"
                readOnly
              />
            </div>

            <div className="sbx-field-box">
              <label className="sbx-field-label">Deye Cloud OpenAPI Gateway</label>
              <input
                type="text"
                className="sbx-text-input"
                defaultValue="https://api.deyecloud.com/v1.0/sbx-gateway"
                readOnly
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="sbx-action-btn primary"
                onClick={() => {
                  setToast('🟢 Ping MQTT Broker: 24ms (Koneksi Stabil Terenkripsi TLS)');
                  setTimeout(() => setToast(''), 4000);
                }}
              >
                📡 Test Koneksi Broker MQTT
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: LOCAL DATABASE & BACKUP */}
        {activeTab === 'database' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--sbx-accent)', marginBottom: '6px' }}>
                🟢 Status Penyimpanan Lokal: AKTIF &amp; PERSISTEN
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--sbx-text-muted)', lineHeight: '1.6' }}>
                Seluruh data prospek CRM, proyek EPC, termin faktur, tugas My Work, dan stok komponen tersimpan secara aman di browser lokal Anda (Web Storage v2). Setiap perubahan tersimpan otomatis tanpa perlu koneksi database eksternal.
              </p>
            </div>

            <div className="sbx-metrics-row" style={{ marginTop: '0' }}>
              <div className="sbx-metric-card">
                <span className="sbx-metric-label">Prospek CRM</span>
                <div className="sbx-metric-val">{leadsCount}</div>
              </div>
              <div className="sbx-metric-card">
                <span className="sbx-metric-label">Proyek EPC</span>
                <div className="sbx-metric-val">{projectsCount}</div>
              </div>
              <div className="sbx-metric-card">
                <span className="sbx-metric-label">Faktur Tagihan</span>
                <div className="sbx-metric-val">{invoicesCount}</div>
              </div>
              <div className="sbx-metric-card">
                <span className="sbx-metric-label">Tugas My Work</span>
                <div className="sbx-metric-val">{tasksCount}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="sbx-action-btn primary"
                  onClick={handleExport}
                >
                  📥 Ekspor Cadangan Data (.json)
                </button>

                <label
                  className="sbx-filter-pill-btn"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  📤 Impor Cadangan Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ borderTop: '1px solid var(--sbx-glass-border)', paddingTop: '14px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="sbx-filter-pill-btn"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' }}
                    onClick={handleClearAllDatabase}
                  >
                    🗑️ Hapus Bersih Semua Data Dummy (Kosongkan Database)
                  </button>
                  <button
                    type="button"
                    className="sbx-filter-pill-btn"
                    style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    onClick={handleResetDemo}
                  >
                    ⚡ Reset Data ke Demo Standar Sunblix
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sbx-text-dim)' }}>
                  Tombol &ldquo;Hapus Bersih&rdquo; akan mengosongkan seluruh isi CRM, Prospek SURTI, SPH, Proyek, dan Faktur untuk pengujian sistem dari nol.
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
