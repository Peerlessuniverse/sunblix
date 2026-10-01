'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './os.css';

export default function SunblixOSPage() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState('admin@sunblix.id');
  const [password, setPassword] = useState('sunblix2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState({
    name: 'Warsa',
    role: 'Executive Operations & Engineering',
    avatar: 'W',
  });

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai-hub' | 'fleet' | 'leads'
  const [searchQuery, setSearchQuery] = useState('');

  // AI Agent Hub State
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeAiOutput, setActiveAiOutput] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Time ticker
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sunblix_os_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setIsLoggedIn(true);
          setCurrentUser(parsed);
        } catch {
          setIsLoggedIn(true);
        }
      }
      setAuthChecked(true);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Login handler
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Harap masukkan username dan kata sandi.');
      return;
    }

    // Demo authentication check
    const validUsers = ['admin@sunblix.id', 'warsa@sunblix.id', 'sales@sunblix.id', 'engineer@sunblix.id', 'sunblix'];
    const validPass = ['sunblix2026', '2026', 'admin2026', 'sunblix'];

    const uClean = username.trim().toLowerCase();
    const pClean = password.trim();

    if (validUsers.includes(uClean) || pClean === 'sunblix2026' || pClean === '2026') {
      const userObj = {
        name: uClean.includes('engineer') ? 'Tim Engineering' : 'Warsa (Executive Ops)',
        role: uClean.includes('engineer') ? 'Lead Solar EPC Engineer' : 'Head of Commercial & Technical Operations',
        avatar: uClean.includes('engineer') ? 'E' : 'W',
        email: uClean,
      };
      localStorage.setItem('sunblix_os_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Username atau kata sandi salah. Gunakan akun demo yang tersedia.');
    }
  };

  const handleQuickDemoLogin = (roleType) => {
    if (roleType === 'director') {
      setUsername('admin@sunblix.id');
      setPassword('sunblix2026');
      const userObj = {
        name: 'Warsa',
        role: 'Director of Solar Operations',
        avatar: 'W',
        email: 'admin@sunblix.id',
      };
      localStorage.setItem('sunblix_os_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setUsername('engineer@sunblix.id');
      setPassword('sunblix2026');
      const userObj = {
        name: 'Tim EPC Engineer',
        role: 'Rooftop Site & Electrical Engineer',
        avatar: 'E',
        email: 'engineer@sunblix.id',
      };
      localStorage.setItem('sunblix_os_session', JSON.stringify(userObj));
      setCurrentUser(userObj);
      setIsLoggedIn(true);
      setLoginError('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sunblix_os_session');
    setIsLoggedIn(false);
  };

  // AI Agent Simulation Execution
  const triggerAiAgent = (agentKey, customPrompt = null) => {
    const promptText = customPrompt || aiPrompt || 'Analisa performa sistem dan rekomendasi teknis';
    setAiLoading(true);
    setActiveAiOutput(null);

    setTimeout(() => {
      setAiLoading(false);
      if (agentKey === 'solaria') {
        setActiveAiOutput({
          agent: 'Agent SOLARIA — Lead Technical & Rooftop Engineer',
          icon: '☀️',
          badge: 'Technical Calculation Complete',
          color: '#f59e0b',
          content: [
            '📐 **Analisa Geometri Atap & Irradiance:** Luas efektif rooftop 52 m² (Orientasi Selatan 175°, Tilt Kemiringan 11°).',
            '☀️ **Konfigurasi Modul:** 16x LONGI Solar 585 Wp Mono-Facial Tier 1 = Total 9.36 kWp.',
            '⚡ **Inverter Sizing:** DEYE SUN-8K-SG01LP1 (Hybrid 8 kW 1 Phase) dengan dual MPPT string balancing.',
            '📊 **Estimasi Produksi:** Rata-rata 41.2 kWh/hari (Peak Sun Hours: 4.8 PSH) • Penghematan Listrik: ~Rp 1.850.000 / bulan.',
            '📦 **BoQ Recommendation:** 8x Rail Aluminium AL6005-T5 4.2m, 32x Mid/End Clamp, 100M Kabel PV 1x4mm, Protection Box IP65.',
          ],
        });
      } else if (agentKey === 'helios') {
        setActiveAiOutput({
          agent: 'Agent HELIOS — Sales & SPH Proposal Copilot',
          icon: '📑',
          badge: 'Quotation SPH Draft Generated',
          color: '#38bdf8',
          content: [
            '💼 **Pemilihan Paket Acuan:** SUNBLIX PRO 8.19 kWp (14 Modul LONGI 585 Wp + Inverter 8 kW).',
            '💰 **Nilai Katalog Resmi 2026:** Rp 145.400.000 (Include Delivery & Instalasi Jawa, Madura, Bali).',
            '🏷️ **Analisa Diskon Berjenjang:** Diskon Khusus 4% direkomendasikan (-Rp 5.816.000) untuk closing proyek minggu ini.',
            '📋 **Struktur Penawaran Final:** DPP Rp 139.584.000 + PPN 11% (Rp 15.354.240) = **Total SPH Rp 154.938.240**.',
            '⚡ **Tautan Cepat:** Siap diexport langsung via Generator Brosur & SPH Resmi SUNBLIX.',
          ],
        });
      } else if (agentKey === 'volt') {
        setActiveAiOutput({
          agent: 'Agent VOLT — IoT Fleet Watchdog & Diagnostics',
          icon: '⚡',
          badge: 'Telemetry Diagnostic Report',
          color: '#10b981',
          content: [
            '🛰️ **Status Armada PLTS:** 48 Situs Aktif Terhubung ke Deye Cloud IoT Gateway.',
            '🔋 **Health Status Baterai:** Rata-rata State of Charge (SoC) 94.2% • Suhu Sel Nominal 28.5°C (Kondisi Prima).',
            '⚡ **Efisiensi Inverter Rata-Rata:** 98.4% (Tanpa clipping daya pada jam puncak 11:30 - 13:45 WIB).',
            '🛡️ **Grid Protection Check:** Tegangan PLN stabil 224 VAC • Grounding resistance terdeteksi < 0.8 Ohm.',
            '✅ **Peringatan Anomali:** 0 Critical Faults terdeteksi dalam 24 jam terakhir.',
          ],
        });
      } else {
        setActiveAiOutput({
          agent: 'Agent OMNI — Customer Concierge & Lead Dispatcher',
          icon: '💬',
          badge: 'Lead Qualification Summary',
          color: '#a855f7',
          content: [
            '📥 **Lead Masuk Hari Ini:** 6 Permintaan Konsultasi baru dari Formulir Web & WhatsApp.',
            '📍 **Sebaran Klien:** 3x Rumah Tinggal (Jakarta, Surabaya, Bandung), 2x Villa Mewah (Bali), 1x Pabrik (Cikarang).',
            '⏱️ **Waktu Respon Rata-Rata:** 1.2 detik via WhatsApp API Auto-Concierge.',
            '📅 **Jadwal Site Survey:** 2 Lokasi telah dikonfirmasi untuk survei teknis teknisi lapangan besok jam 10:00 WIB.',
          ],
        });
      }
    }, 600);
  };

  // Pre-hydration placeholder
  if (!authChecked) {
    return <div className="sbx-os-root" />;
  }

  // =========================================================================
  // VIEW 1: LOGIN PAGE
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="sbx-os-root">
        <div className="os-login-container">
          <div className="os-login-backdrop-glow" />

          <div className="os-login-card">
            <div className="os-login-header">
              <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="os-login-logo" />
              <div className="os-login-badge">
                <span className="os-login-badge-dot" />
                <span>Enterprise OS</span>
              </div>
              <h1 className="os-login-title">SUNBLIX OS</h1>
              <p className="os-login-subtitle">
                Platform Terpadu Operasi Energi PLTS & Hub Agen AI Digital PT Sunblix Energi Indonesia.
              </p>
            </div>

            <form onSubmit={handleLogin} className="os-login-form">
              <div className="os-field-group">
                <label className="os-label">Akun Email / ID Staf</label>
                <div className="os-input-wrap">
                  <input
                    type="text"
                    className="os-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama@sunblix.id"
                    autoFocus
                  />
                </div>
              </div>

              <div className="os-field-group">
                <label className="os-label">Kata Sandi / Kunci Akses</label>
                <div className="os-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="os-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="os-input-btn-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Sembunyikan' : 'Lihat password'}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#f87171', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                  ⚠️ {loginError}
                </div>
              )}

              {/* 1-Click Demo Shortcut Login for Review */}
              <div className="os-demo-pills-box">
                <span className="os-demo-pills-label">Akses Cepat Pengujian (1-Click Demo):</span>
                <div className="os-demo-pills-row">
                  <button
                    type="button"
                    className="os-demo-pill"
                    onClick={() => handleQuickDemoLogin('director')}
                  >
                    ⚡ Login Direksi
                  </button>
                  <button
                    type="button"
                    className="os-demo-pill"
                    onClick={() => handleQuickDemoLogin('engineer')}
                  >
                    🛠️ Login Engineer
                  </button>
                </div>
              </div>

              <button type="submit" className="os-btn-submit">
                Masuk ke Sunblix OS ➔
              </button>
            </form>

            <div className="os-login-footer">
              <Link href="/" className="os-back-link">
                ← Kembali ke Website Utama Sunblix
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL ENTERPRISE DASHBOARD "SUNBLIX OS"
  // =========================================================================
  return (
    <div className="sbx-os-root">
      {/* OS TOPBAR */}
      <header className="os-topbar">
        <div className="os-topbar-left">
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="os-topbar-logo" />
          <span className="os-brand-pill">OS v2.6.4</span>
          <div className="os-live-status-pill">
            <span className="os-pulse-dot" />
            <span>SISTEM AKTIF • IOT ONLINE</span>
          </div>
        </div>

        <div className="os-topbar-right">
          {currentTime && (
            <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
              🕒 {currentTime}
            </span>
          )}

          <div
            className="os-agent-quick-pill"
            onClick={() => setActiveTab('ai-hub')}
            title="Buka AI Autonomous Agent Fleet"
          >
            <span>🤖</span>
            <span>4 AI Agents Active</span>
          </div>

          <div className="os-user-profile">
            <div className="os-user-avatar">{currentUser.avatar || 'W'}</div>
            <span className="os-user-name">{currentUser.name || 'Warsa'}</span>
          </div>

          <button type="button" className="os-btn-logout" onClick={handleLogout} title="Keluar dari sesi Sunblix OS">
            Keluar ✕
          </button>
        </div>
      </header>

      {/* OS BODY SHELL */}
      <div className="os-shell">
        {/* SIDEBAR NAVIGATION */}
        <aside className="os-sidebar">
          <div>
            <div className="os-nav-section-label">Main Console</div>
            <nav className="os-nav-menu">
              <button
                type="button"
                className={`os-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <div className="os-nav-item-left">
                  <span>📊</span>
                  <span>Command Center</span>
                </div>
              </button>

              <button
                type="button"
                className={`os-nav-item ${activeTab === 'ai-hub' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-hub')}
              >
                <div className="os-nav-item-left">
                  <span>🤖</span>
                  <span>AI Agent Fleet</span>
                </div>
                <span className="os-nav-badge ai">AI</span>
              </button>

              <button
                type="button"
                className={`os-nav-item ${activeTab === 'fleet' ? 'active' : ''}`}
                onClick={() => setActiveTab('fleet')}
              >
                <div className="os-nav-item-left">
                  <span>☀️</span>
                  <span>PLTS Fleet Sites</span>
                </div>
                <span className="os-nav-badge">48</span>
              </button>

              <button
                type="button"
                className={`os-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => setActiveTab('leads')}
              >
                <div className="os-nav-item-left">
                  <span>👥</span>
                  <span>Leads & CRM</span>
                </div>
                <span className="os-nav-badge">6 Baru</span>
              </button>
            </nav>

            <div className="os-nav-section-label" style={{ marginTop: '16px' }}>
              Dokumen & Penawaran
            </div>
            <nav className="os-nav-menu">
              <Link href="/brosur" className="os-nav-item" style={{ textDecoration: 'none' }}>
                <div className="os-nav-item-left">
                  <span>📑</span>
                  <span>Generator SPH Resmi</span>
                </div>
                <span style={{ fontSize: '11px', color: '#38bdf8' }}>↗</span>
              </Link>
            </nav>
          </div>

          {/* SIDEBAR FOOTER TELEMETRY */}
          <div className="os-sidebar-footer-card">
            <div className="os-footer-telemetry-row">
              <span>IoT Cloud Sync:</span>
              <span className="os-footer-telemetry-val" style={{ color: '#10b981' }}>Live 99.9%</span>
            </div>
            <div className="os-footer-telemetry-row">
              <span>Server Latency:</span>
              <span className="os-footer-telemetry-val">12 ms</span>
            </div>
            <div className="os-footer-telemetry-row">
              <span>Database:</span>
              <span className="os-footer-telemetry-val">Encrypted</span>
            </div>
          </div>
        </aside>

        {/* MAIN BODY CONTENT */}
        <main className="os-main-body">
          {/* =================================================================
              TAB 1: COMMAND CENTER (OVERVIEW)
             ================================================================= */}
          {activeTab === 'overview' && (
            <div>
              <div className="os-page-header">
                <div className="os-page-title-block">
                  <h1>
                    <span>⚡</span> Command Center — Executive Overview
                  </h1>
                  <p>
                    Pantauan real-time kapasitas terpasang, energi harian, armada baterai, dan saluran penawaran harga resmi.
                  </p>
                </div>
                <div className="os-page-actions">
                  <Link href="/brosur" className="os-btn-action-primary">
                    <span>📑</span>
                    <span>Buka Generator SPH</span>
                  </Link>
                  <button
                    type="button"
                    className="os-btn-action-secondary"
                    onClick={() => setActiveTab('ai-hub')}
                  >
                    <span>🤖</span>
                    <span>Tanya AI Copilot</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI CARDS */}
              <div className="os-kpi-grid">
                <div className="os-kpi-card">
                  <div className="os-kpi-top">
                    <span className="os-kpi-label">Produksi Hari Ini</span>
                    <div className="os-kpi-icon">☀️</div>
                  </div>
                  <div className="os-kpi-value">428.6 kWh</div>
                  <div className="os-kpi-delta positive">
                    <span>↑ +12.4%</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs rata-rata bulanan</span>
                  </div>
                </div>

                <div className="os-kpi-card">
                  <div className="os-kpi-top">
                    <span className="os-kpi-label">Kapasitas Terpasang</span>
                    <div className="os-kpi-icon">⚡</div>
                  </div>
                  <div className="os-kpi-value">1.84 MWp</div>
                  <div className="os-kpi-delta neutral">
                    <span>48 Situs Aktif</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>di 19+ Kota</span>
                  </div>
                </div>

                <div className="os-kpi-card">
                  <div className="os-kpi-top">
                    <span className="os-kpi-label">Armada Baterai ESS</span>
                    <div className="os-kpi-icon">🔋</div>
                  </div>
                  <div className="os-kpi-value">680 kWh</div>
                  <div className="os-kpi-delta positive">
                    <span>SoC Rata-Rata 94%</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>LiFePO4 Health</span>
                  </div>
                </div>

                <div className="os-kpi-card">
                  <div className="os-kpi-top">
                    <span className="os-kpi-label">Pipeline Penawaran SPH</span>
                    <div className="os-kpi-icon">📑</div>
                  </div>
                  <div className="os-kpi-value">Rp 2.48 M</div>
                  <div className="os-kpi-delta positive">
                    <span>14 Dokumen Aktif</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>Bulan Oktober 2026</span>
                  </div>
                </div>
              </div>

              {/* SITES MONITORING TABLE */}
              <div className="os-table-card">
                <div className="os-table-header">
                  <h3 className="os-table-title">Daftar Proyek & Pemantauan Situs PLTS Terkini</h3>
                  <button
                    type="button"
                    className="os-btn-action-secondary"
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                    onClick={() => setActiveTab('fleet')}
                  >
                    Lihat Seluruh 48 Situs →
                  </button>
                </div>
                <div className="os-table-wrapper">
                  <table className="os-table">
                    <thead>
                      <tr>
                        <th>Nama Proyek / Klien</th>
                        <th>Kategori</th>
                        <th>Kapasitas</th>
                        <th>Baterai</th>
                        <th>Produksi Hari Ini</th>
                        <th>Status Operasi</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>PT Villa Nuansa Tropika</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Denpasar, Bali • Site ID #SBX-BLI-01</div>
                        </td>
                        <td>PRO+ (3 Phase)</td>
                        <td>14.04 kWp (24 Modul)</td>
                        <td>10.24 kWh</td>
                        <td>58.4 kWh</td>
                        <td><span className="os-status-pill online">● Online & Sync</span></td>
                        <td>
                          <Link href="/brosur?preset=res819" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, fontSize: '12px' }}>
                            Lihat SPH ↗
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Bpk. Hendra Gunawan</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Bogor, Jawa Barat • Site ID #SBX-BGR-04</div>
                        </td>
                        <td>STANDARD+ (1P)</td>
                        <td>4.68 kWp (8 Modul)</td>
                        <td>5.12 kWh</td>
                        <td>22.1 kWh</td>
                        <td><span className="os-status-pill online">● Online & Normal</span></td>
                        <td>
                          <Link href="/brosur?preset=res468" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, fontSize: '12px' }}>
                            Lihat SPH ↗
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Komersial Gudang Logistik</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Cikarang, Bekasi • Site ID #SBX-CKR-09</div>
                        </td>
                        <td>PRO+ (3 Phase)</td>
                        <td>16.38 kWp (28 Modul)</td>
                        <td>10.24 kWh</td>
                        <td>74.8 kWh</td>
                        <td><span className="os-status-pill online">● Grid Feed-in Peak</span></td>
                        <td>
                          <Link href="/brosur?preset=proplus_1638" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, fontSize: '12px' }}>
                            Lihat SPH ↗
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Proyek Langsa Aceh</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Kota Langsa • SPH Ref: SBX/QTN/IX/2026/001</div>
                        </td>
                        <td>SPH 001 Hybrid</td>
                        <td>2.56 kWp (4 Modul)</td>
                        <td>2.56 kWh</td>
                        <td>— (Menunggu DP)</td>
                        <td><span className="os-status-pill pending">⏳ Menunggu SPK</span></td>
                        <td>
                          <Link href="/brosur?preset=sph001" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, fontSize: '12px' }}>
                            Buka Dokumen ↗
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 2: AI AGENT AUTONOMOUS HUB (DEDICATED DIGITAL WORKFORCE)
             ================================================================= */}
          {activeTab === 'ai-hub' && (
            <div className="os-ai-hub-container">
              {/* BANNER INTRO */}
              <div className="os-ai-banner">
                <div className="os-ai-banner-content">
                  <div className="os-ai-banner-tag">
                    <span>✨</span>
                    <span>Autonomous Digital Workforce</span>
                  </div>
                  <h2 className="os-ai-banner-title">SUNBLIX AI AGENT FLEET</h2>
                  <p className="os-ai-banner-desc">
                    Arsitektur agen kecerdasan buatan multi-spesialisasi yang disiapkan untuk mengotomatisasi seluruh alur kerja digital SUNBLIX: kalkulasi teknis atap PV, perumusan proposal penawaran (SPH), diagnosa telemetri IoT baterai, dan layanan klien terintegrasi.
                  </p>
                </div>
              </div>

              {/* INTERACTIVE COPILOT CONSOLE */}
              <div className="os-ai-copilot-card">
                <div className="os-ai-prompt-input-row">
                  <input
                    type="text"
                    className="os-ai-prompt-input"
                    placeholder="Beri perintah ke AI Agent (Contoh: 'Solaria, hitung kebutuhan panel atap 60m²' atau 'Helios, buat penawaran paket PRO 10.53 kWp')..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') triggerAiAgent('solaria', aiPrompt);
                    }}
                  />
                  <button
                    type="button"
                    className="os-ai-prompt-btn"
                    onClick={() => triggerAiAgent('solaria', aiPrompt)}
                    disabled={aiLoading}
                  >
                    <span>{aiLoading ? 'Memproses...' : 'Kirim Perintah ➔'}</span>
                  </button>
                </div>

                <div className="os-ai-chips-row">
                  <span className="os-ai-chips-lbl">Uji Coba Cepat:</span>
                  <button
                    type="button"
                    className="os-ai-chip"
                    onClick={() => triggerAiAgent('solaria', 'Kalkulasi teknis atap 52m²')}
                  >
                    📐 Solaria: Hitung Atap 52m²
                  </button>
                  <button
                    type="button"
                    className="os-ai-chip"
                    onClick={() => triggerAiAgent('helios', 'Draft penawaran PRO 8.19 kWp')}
                  >
                    📑 Helios: Buat Draft SPH PRO 8.19
                  </button>
                  <button
                    type="button"
                    className="os-ai-chip"
                    onClick={() => triggerAiAgent('volt', 'Diagnosa IoT baterai armada')}
                  >
                    ⚡ Volt: Cek Telemetri Armada
                  </button>
                  <button
                    type="button"
                    className="os-ai-chip"
                    onClick={() => triggerAiAgent('omni', 'Rekapitulasi calon klien baru')}
                  >
                    💬 Omni: Ringkasan Leads Masuk
                  </button>
                </div>

                {/* AI SIMULATED RESPONSE */}
                {aiLoading && (
                  <div style={{ marginTop: '16px', color: '#38bdf8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="os-pulse-dot" style={{ background: '#38bdf8' }} />
                    <span>Agen AI sedang menganalisa data satelit, pricelist 2026, dan telemetri...</span>
                  </div>
                )}

                {activeAiOutput && !aiLoading && (
                  <div className="os-ai-response-box">
                    <div className="os-ai-response-header">
                      <div className="os-ai-response-agent-title">
                        <span>{activeAiOutput.icon}</span>
                        <span>{activeAiOutput.agent}</span>
                      </div>
                      <span className="os-status-pill online" style={{ borderColor: activeAiOutput.color, color: activeAiOutput.color }}>
                        {activeAiOutput.badge}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeAiOutput.content.map((point, idx) => (
                        <div key={idx} dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4 AGENT CARDS GRID */}
              <div className="os-agent-cards-grid">
                {/* AGENT 1: SOLARIA */}
                <div className="os-agent-card">
                  <div>
                    <div className="os-agent-top">
                      <div className="os-agent-avatar solaria">☀️</div>
                      <div className="os-agent-info">
                        <h3>Agent SOLARIA</h3>
                        <div className="os-agent-role">Technical Site & Rooftop Engineer</div>
                        <span className="os-agent-status-tag">● Autonomous Model Active</span>
                      </div>
                    </div>
                    <div className="os-agent-desc">
                      Menganalisa citra atap satelit, mendeteksi kemiringan (tilt) dan bayangan (shading), menghitung penataan modul PV LONGI 585 Wp, serta menentukan kapasitas inverter Deye yang paling optimal.
                    </div>
                    <div className="os-agent-capabilities">
                      <div className="os-capability-item">✓ Deteksi Azimuth & Shading Loss Otomatis</div>
                      <div className="os-capability-item">✓ Auto-Layout Modul Surya LONGI 585 Wp</div>
                      <div className="os-capability-item">✓ Kalkulasi BoQ Rangka Mounting & Kabel</div>
                    </div>
                  </div>
                  <div className="os-agent-footer">
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Model: Sunblix Vision-EPC v2</span>
                    <button
                      type="button"
                      className="os-btn-agent-trigger"
                      onClick={() => triggerAiAgent('solaria', 'Solaria: Analisa rancangan teknis atap baru')}
                    >
                      Jalankan Agen ➔
                    </button>
                  </div>
                </div>

                {/* AGENT 2: HELIOS */}
                <div className="os-agent-card">
                  <div>
                    <div className="os-agent-top">
                      <div className="os-agent-avatar helios">📑</div>
                      <div className="os-agent-info">
                        <h3>Agent HELIOS</h3>
                        <div className="os-agent-role">Sales & SPH Commercial Copilot</div>
                        <span className="os-agent-status-tag">● Integrated with Pricelist 2026</span>
                      </div>
                    </div>
                    <div className="os-agent-desc">
                      Merumuskan surat penawaran harga resmi (SPH), mencocokkan paket katalog 2026, merekomendasikan diskon berjenjang maksimal 8%, serta mengotomatisasi penerbitan dokumen 3 halaman resmi.
                    </div>
                    <div className="os-agent-capabilities">
                      <div className="os-capability-item">✓ Terhubung langsung dengan 17 Paket Pricelist 2026</div>
                      <div className="os-capability-item">✓ Rekomendasi Diskon Berjenjang (Max 8% Safe Rule)</div>
                      <div className="os-capability-item">✓ Auto-Generate Nomor Ref SPH & Export PDF</div>
                    </div>
                  </div>
                  <div className="os-agent-footer">
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Model: Sunblix Quote-Reasoning</span>
                    <button
                      type="button"
                      className="os-btn-agent-trigger"
                      onClick={() => triggerAiAgent('helios', 'Helios: Buat penawaran harga paket resmi')}
                    >
                      Jalankan Agen ➔
                    </button>
                  </div>
                </div>

                {/* AGENT 3: VOLT */}
                <div className="os-agent-card">
                  <div>
                    <div className="os-agent-top">
                      <div className="os-agent-avatar volt">⚡</div>
                      <div className="os-agent-info">
                        <h3>Agent VOLT</h3>
                        <div className="os-agent-role">IoT Fleet Watchdog & Battery Diagnostics</div>
                        <span className="os-agent-status-tag">● 24/7 Deye Cloud Telemetry</span>
                      </div>
                    </div>
                    <div className="os-agent-desc">
                      Memantau telemetri inverter Deye dan baterai penyimpanan energi LiFePO4 secara real-time. Mendeteksi degradasi performa sel, suhu abnormal, dan mengirim alarm otomatis ke teknisi.
                    </div>
                    <div className="os-agent-capabilities">
                      <div className="os-capability-item">✓ Monitoring State of Charge (SoC) & SOH Baterai</div>
                      <div className="os-capability-item">✓ Deteksi Dini String Inverter Overheating</div>
                      <div className="os-capability-item">✓ Pemodelan Prediksi Degradasi Daya 25 Tahun</div>
                    </div>
                  </div>
                  <div className="os-agent-footer">
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Model: Sunblix Telemetry-Guard</span>
                    <button
                      type="button"
                      className="os-btn-agent-trigger"
                      onClick={() => triggerAiAgent('volt', 'Volt: Cek kesehatan baterai armada')}
                    >
                      Jalankan Agen ➔
                    </button>
                  </div>
                </div>

                {/* AGENT 4: OMNI */}
                <div className="os-agent-card">
                  <div>
                    <div className="os-agent-top">
                      <div className="os-agent-avatar omni">💬</div>
                      <div className="os-agent-info">
                        <h3>Agent OMNI</h3>
                        <div className="os-agent-role">Customer Care & Lead Concierge</div>
                        <span className="os-agent-status-tag">● WhatsApp & Web Inbound</span>
                      </div>
                    </div>
                    <div className="os-agent-desc">
                      Menjawab pertanyaan calon pelanggan di website & WhatsApp 24/7, mengkualifikasi kapasitas daya PLN (VA) dan tagihan listrik, serta menjadwalkan kunjungan survei fisik tim teknisi.
                    </div>
                    <div className="os-agent-capabilities">
                      <div className="os-capability-item">✓ Auto-Kualifikasi Tagihan Listrik vs Paket Surya</div>
                      <div className="os-capability-item">✓ Asistensi Dokumen SLO ESDM & Net-Metering PLN</div>
                      <div className="os-capability-item">✓ Penjadwalan Survei Lapangan Otomatis</div>
                    </div>
                  </div>
                  <div className="os-agent-footer">
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Model: Sunblix Omni-Chat Gateway</span>
                    <button
                      type="button"
                      className="os-btn-agent-trigger"
                      onClick={() => triggerAiAgent('omni', 'Omni: Rekapitulasi prospek terbaru')}
                    >
                      Jalankan Agen ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 3: FLEET SITES
             ================================================================= */}
          {activeTab === 'fleet' && (
            <div>
              <div className="os-page-header">
                <div className="os-page-title-block">
                  <h1>
                    <span>☀️</span> Pemantauan Armada PLTS (48 Situs Aktif)
                  </h1>
                  <p>Telemetri real-time produksi kWh, status koneksi grid PLN, dan kesehatan baterai lithium Sunblix.</p>
                </div>
              </div>

              <div className="os-table-card">
                <div className="os-table-wrapper">
                  <table className="os-table">
                    <thead>
                      <tr>
                        <th>Situs Proyek</th>
                        <th>Kota / Wilayah</th>
                        <th>Inverter Deye</th>
                        <th>Baterai SoC</th>
                        <th>Peak Daya</th>
                        <th>Status Telemetri</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Villa Tropika Sanur</strong></td>
                        <td>Denpasar, Bali</td>
                        <td>15 kW 3-Phase (Eff 98.6%)</td>
                        <td><span style={{ color: '#10b981', fontWeight: 700 }}>98%</span> (Normal)</td>
                        <td>12.4 kW</td>
                        <td><span className="os-status-pill online">● Streaming Live</span></td>
                      </tr>
                      <tr>
                        <td><strong>Rumah Tinggal Sentul</strong></td>
                        <td>Bogor, Jawa Barat</td>
                        <td>6 kW 1-Phase (Eff 98.2%)</td>
                        <td><span style={{ color: '#10b981', fontWeight: 700 }}>91%</span> (Normal)</td>
                        <td>5.2 kW</td>
                        <td><span className="os-status-pill online">● Streaming Live</span></td>
                      </tr>
                      <tr>
                        <td><strong>Klinik Medika Pratama</strong></td>
                        <td>Surabaya, Jawa Timur</td>
                        <td>10 kW 3-Phase (Eff 98.4%)</td>
                        <td><span style={{ color: '#10b981', fontWeight: 700 }}>88%</span> (Normal)</td>
                        <td>8.9 kW</td>
                        <td><span className="os-status-pill online">● Streaming Live</span></td>
                      </tr>
                      <tr>
                        <td><strong>Residensi Green Lake</strong></td>
                        <td>Tangerang, Banten</td>
                        <td>8 kW 1-Phase (Eff 98.5%)</td>
                        <td><span style={{ color: '#10b981', fontWeight: 700 }}>95%</span> (Normal)</td>
                        <td>7.4 kW</td>
                        <td><span className="os-status-pill online">● Streaming Live</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 4: LEADS & CRM
             ================================================================= */}
          {activeTab === 'leads' && (
            <div>
              <div className="os-page-header">
                <div className="os-page-title-block">
                  <h1>
                    <span>👥</span> Leads & Calon Pelanggan Masuk
                  </h1>
                  <p>Inquiry konsultasi penawaran harga yang masuk dari formulir website dan WhatsApp Sunblix.</p>
                </div>
              </div>

              <div className="os-table-card">
                <div className="os-table-wrapper">
                  <table className="os-table">
                    <thead>
                      <tr>
                        <th>Nama Prospek</th>
                        <th>Kontak WhatsApp</th>
                        <th>Kota</th>
                        <th>Daya PLN & Tagihan</th>
                        <th>Rekomendasi Paket</th>
                        <th>Aksi Pembuatan SPH</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Bpk. David Sulistyo</strong></td>
                        <td>0812-9876-xxxx</td>
                        <td>Jakarta Selatan</td>
                        <td>5.500 VA • Rp 3.200.000/bln</td>
                        <td>SUNBLIX PRO 8.19 kWp</td>
                        <td>
                          <Link href="/brosur?customer=Bpk+David+Sulistyo&kwp=8.19&preset=pro_819" className="os-btn-action-primary" style={{ padding: '4px 10px', fontSize: '11.5px' }}>
                            Buat SPH ➔
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Ibu Citra Lestari</strong></td>
                        <td>0813-8821-xxxx</td>
                        <td>Bandung</td>
                        <td>3.500 VA • Rp 2.100.000/bln</td>
                        <td>SUNBLIX STANDARD+ 4.68 kWp</td>
                        <td>
                          <Link href="/brosur?customer=Ibu+Citra+Lestari&kwp=4.68&preset=std_468" className="os-btn-action-primary" style={{ padding: '4px 10px', fontSize: '11.5px' }}>
                            Buat SPH ➔
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>PT. Megah Semesta Abadi</strong></td>
                        <td>0821-7765-xxxx</td>
                        <td>Surabaya</td>
                        <td>16.500 VA • Rp 11.500.000/bln</td>
                        <td>SUNBLIX PRO+ 16.38 kWp</td>
                        <td>
                          <Link href="/brosur?customer=PT+Megah+Semesta+Abadi&kwp=16.38&preset=proplus_1638" className="os-btn-action-primary" style={{ padding: '4px 10px', fontSize: '11.5px' }}>
                            Buat SPH ➔
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
