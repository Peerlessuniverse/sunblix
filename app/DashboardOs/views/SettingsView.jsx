'use client';

import { useState } from 'react';

export default function SettingsView({ currentUser, onBackToDashboard }) {
  const [activeTab, setActiveTab] = useState('company');
  const [toast, setToast] = useState('');

  // Form states
  const [companyName, setCompanyName] = useState('PT SUNBLIX ENERGI INDONESIA');
  const [companyAddress, setCompanyAddress] = useState('Jl. Sunset Road No. 88X, Seminyak, Kuta, Badung, Bali 80361');
  const [companyPhone, setCompanyPhone] = useState('+62 852-8858-1027');
  const [companyEmail, setCompanyEmail] = useState('hello@sunblix.id');

  // WhatsApp Alert toggles
  const [alertCriticalTemp, setAlertCriticalTemp] = useState(true);
  const [alertNewLead, setAlertNewLead] = useState(true);
  const [alertInvoicePaid, setAlertInvoicePaid] = useState(true);
  const [alertDailySummary, setAlertDailySummary] = useState(false);

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
            Konfigurasi profil perusahaan, hak akses staf (RBAC), gateway MQTT IoT, dan integrasi WhatsApp alerting.
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
              <label className="sbx-field-label">Alamat Kantor Operasional</label>
              <textarea
                className="sbx-text-input"
                rows="3"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="sbx-field-box">
                <label className="sbx-field-label">Nomor WhatsApp CS &amp; Konsultasi</label>
                <input
                  type="text"
                  className="sbx-text-input"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </div>

              <div className="sbx-field-box">
                <label className="sbx-field-label">Email Resmi Perusahaan</label>
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
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--sbx-text)', marginBottom: '12px' }}>
              Daftar Pengguna Terdaftar Sunblix OS
            </h3>
            <div className="sbx-table-wrap">
              <table className="sbx-table">
                <thead>
                  <tr>
                    <th>Nama &amp; Email</th>
                    <th>Peran / Role</th>
                    <th>Tingkat Akses</th>
                    <th>Status Akun</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>Danny</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>danny@sunblix.id</div>
                    </td>
                    <td>Director / CEO</td>
                    <td>
                      <span className="sbx-status-badge success">Super Admin</span>
                    </td>
                    <td>🟢 Aktif</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--sbx-text-dim)' }}>Akun Anda</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>Agus Priyono, ST</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>engineer@sunblix.id</div>
                    </td>
                    <td>Lead Rooftop EPC Engineer</td>
                    <td>
                      <span className="sbx-status-badge info">Engineering &amp; QC</span>
                    </td>
                    <td>🟢 Aktif</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="sbx-row-action-btn">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>I Wayan Sugiarta</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>wayan@sunblix.id</div>
                    </td>
                    <td>Field PV Installer Lead</td>
                    <td>
                      <span className="sbx-status-badge warning">Field Supervisor</span>
                    </td>
                    <td>🟢 Aktif</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="sbx-row-action-btn">Edit Role</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>Linda Susanti</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>finance@sunblix.id</div>
                    </td>
                    <td>Finance &amp; Procurement Admin</td>
                    <td>
                      <span className="sbx-status-badge purple">Finance &amp; PO</span>
                    </td>
                    <td>🟢 Aktif</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="sbx-row-action-btn">Edit Role</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ALERTS & WHATSAPP */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--sbx-text)', margin: '0 0 4px' }}>
              WhatsApp Auto-Alert Notifications (Twilio / WA Business API)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--sbx-text-muted)', margin: '0 0 12px' }}>
              Kirim peringatan otomatis langsung ke nomor WhatsApp Direksi dan Tim Engineering saat parameter kritis terdeteksi.
            </p>

            <div className="sbx-toggle-row">
              <div>
                <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '12.5px' }}>
                  🚨 Peringatan Suhu Inverter Kritis (&gt; 55°C)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>
                  Notifikasi instan jika inverter mendeteksi over-temperature di lapangan.
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
                  👥 Inbound Lead Baru dari Website
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>
                  Notifikasi instan saat calon klien submit estimasi kalkulator surya.
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
      </div>
    </div>
  );
}
