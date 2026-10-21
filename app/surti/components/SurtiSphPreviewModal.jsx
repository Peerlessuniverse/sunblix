'use client';

import { useState, useEffect } from 'react';
import '../../brosur/brosur.css';
import {
  SUNBLIX_OFFICIAL_PACKAGES_2026,
  getPresetFromPackage,
  SUNBLIX_TERMS_2026,
  DEFAULT_PORTFOLIOS,
} from '../../brosur/sunblixCatalog';

function formatRupiah(num) {
  if (isNaN(num) || num === null || num === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

// Official Sunblix Letterhead Component
function SunblixKopSuratReadonly() {
  return (
    <div className="sunblix-kop-surat">
      <div className="kop-main-row">
        <div className="kop-logo-col">
          <img src="/asset/logo.png" alt="SUNBLIX" className="kop-logo-img" />
        </div>
        <div className="kop-contact-col">
          <div className="kop-company-title">PT SUNBLIX ENERGI INDONESIA</div>
          <div className="kop-address-row">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#0066cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="kop-pin-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Pesanggrahan, Jakarta Selatan 12330</span>
          </div>
          <div className="kop-contacts-row">
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>sunblix.id</span>
            </span>
            <span className="kop-sep">·</span>
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>021 7362 639</span>
            </span>
            <span className="kop-sep">·</span>
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span>0852 8858 1027</span>
            </span>
            <span className="kop-sep">·</span>
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>hello@sunblix.id</span>
            </span>
          </div>
        </div>
      </div>
      <div className="kop-tricolor-bar">
        <div className="bar-blue" />
        <div className="bar-gold" />
        <div className="bar-green" />
      </div>
    </div>
  );
}

export default function SurtiSphPreviewModal({ sph, onClose }) {
  const [activePage, setActivePage] = useState('all'); // 'all' | '1' | '2' | '3' | '4'
  const [zoomScale, setZoomScale] = useState(0.9);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!sph) return null;

  // Derive package data from catalog if packageId exists
  const officialPkg = SUNBLIX_OFFICIAL_PACKAGES_2026.find((p) => p.id === sph.packageId) || SUNBLIX_OFFICIAL_PACKAGES_2026[2]; // Default to std_468
  const preset = getPresetFromPackage(
    officialPkg,
    sph.sphNumber || '001/SUNBLIX-SPH/X/2026',
    sph.sphNumber || 'SPH 001',
    sph.customer?.name || 'Bapak / Ibu Pelanggan'
  );

  const kwp = sph.technicalSpecs?.kwp || officialPkg.kwp;
  const panels = sph.technicalSpecs?.panelCount
    ? `${sph.technicalSpecs.panelCount} Modul (${sph.technicalSpecs.panelModel || officialPkg.panels})`
    : officialPkg.panels;
  const inverterKw = sph.technicalSpecs?.inverterKw || officialPkg.inverterKw;
  const batteryKwh = sph.technicalSpecs?.batteryKwh || officialPkg.batteryKwh;
  const phase = sph.technicalSpecs?.phase || officialPkg.phase;

  const dpp = sph.commercial?.dpp || officialPkg.price;
  const ppn = sph.commercial?.ppn || Math.round(dpp * 0.11);
  const totalInclPpn = sph.commercial?.totalInclPpn || (dpp + ppn);

  const customerName = sph.customer?.name || 'Bapak / Ibu Pelanggan';
  const customerAddress = sph.customer?.address || 'Jabodetabek, Indonesia';
  const customerPhone = sph.customer?.phone || '+62 812-xxxx-xxxx';
  const docNo = sph.sphNumber || '001/SUNBLIX-SPH/X/2026';
  const dateFormatted = new Date(sph.createdAt || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const items = (sph.lineItems && sph.lineItems.length > 0) ? sph.lineItems : preset.items;
  const termsList = sph.terms || SUNBLIX_TERMS_2026;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="surti-preview-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 13, 28, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Top Floating Control Bar */}
      <header
        className="print-hide"
        style={{
          width: '100%',
          maxWidth: '1280px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(6, 28, 56, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/asset/surti_logo.png" alt="SURTI" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
              Dokumen Penawaran Resmi (SPH) SUNBLIX
            </div>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>
              {docNo} • {officialPkg.name} ({kwp} kWp) • <span style={{ color: '#10b981' }}>Tervalidasi Resmi (Read-Only)</span>
            </div>
          </div>
        </div>

        {/* Page Switcher Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(2, 13, 28, 0.6)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setActivePage('all')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activePage === 'all' ? '#003b7a' : 'transparent',
              color: activePage === 'all' ? '#fff' : '#94a3b8',
            }}
          >
            📄 Semua (4 Hal)
          </button>
          <button
            type="button"
            onClick={() => setActivePage('1')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activePage === '1' ? '#003b7a' : 'transparent',
              color: activePage === '1' ? '#fff' : '#94a3b8',
            }}
          >
            1. Cover
          </button>
          <button
            type="button"
            onClick={() => setActivePage('2')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activePage === '2' ? '#003b7a' : 'transparent',
              color: activePage === '2' ? '#fff' : '#94a3b8',
            }}
          >
            2. Spesifikasi
          </button>
          <button
            type="button"
            onClick={() => setActivePage('3')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activePage === '3' ? '#003b7a' : 'transparent',
              color: activePage === '3' ? '#fff' : '#94a3b8',
            }}
          >
            3. SPH Quote
          </button>
          <button
            type="button"
            onClick={() => setActivePage('4')}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activePage === '4' ? '#003b7a' : 'transparent',
              color: activePage === '4' ? '#fff' : '#94a3b8',
            }}
          >
            4. Portofolio
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Zoom:</span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 6px', fontWeight: 'bold' }}
            >
              -
            </button>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', minWidth: '38px', textAlign: 'center' }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(1.3, prev + 0.1))}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 6px', fontWeight: 'bold' }}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '8px 16px',
              background: '#003b7a',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0, 59, 122, 0.4)',
            }}
          >
            <span>🖨️</span>
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Pratinjau"
            style={{
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✕ Tutup
          </button>
        </div>
      </header>

      {/* Scrollable Stage: Renders Clean Read-Only Sheets */}
      <div
        style={{
          width: '100%',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '30px 16px 80px 16px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          className="a4-pages-container"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* ================= PAGE 1: COVER & HERO ================= */}
          {(activePage === 'all' || activePage === '1') && (
            <section className="a4-sheet" id="brosurPage1" style={{ marginBottom: '28px' }}>
              <div className="p1-dynamic-page">
                <div className="p1-topbar">
                  <div className="p1-brand">
                    <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="p1-logo" />
                    <div className="p1-tagline">POWER YOUR WORLD.</div>
                  </div>
                  <div className="p1-top-tag">
                    <span className="p1-top-tag-bar"></span>
                    <div className="p1-top-tag-lines">
                      <div>Sistem Energi</div>
                      <div>Terintegrasi</div>
                      <div>Untuk Kehidupan</div>
                      <div>yang Lebih Baik</div>
                    </div>
                  </div>
                </div>

                <div className="p1-hero-content">
                  <div className="p1-hero-title-prefix">PLTS Hybrid</div>
                  <div className="p1-hero-title-kw">{kwp} kW</div>
                  <div className="p1-hero-subtitle">Solusi Energi Mandiri, Andal dan Berkelanjutan</div>
                  <p className="p1-hero-desc">
                    Sistem energi tenaga surya hybrid dari SUNBLIX untuk memenuhi kebutuhan listrik rumah, kantor,
                    atau fasilitas usaha dengan lebih hemat, stabil, dan ramah lingkungan.
                  </p>
                </div>

                <div className="p1-showcase-container">
                  <img src="/asset/p1_clean_product_hero.png" alt="PLTS Rooftop System" className="p1-showcase-img" />
                </div>

                <div className="p1-features-strip">
                  <div className="p1-feat-col">
                    <div className="p1-feat-circle">⚡</div>
                    <div className="p1-feat-text">Solusi Energi Terintegrasi</div>
                  </div>
                  <div className="p1-feat-divider" />
                  <div className="p1-feat-col">
                    <div className="p1-feat-circle">🏠</div>
                    <div className="p1-feat-text">Cocok untuk Rumah, Kantor dan Usaha</div>
                  </div>
                  <div className="p1-feat-divider" />
                  <div className="p1-feat-col">
                    <div className="p1-feat-circle">🛡️</div>
                    <div className="p1-feat-text">Sistem yang Andal dan Stabil</div>
                  </div>
                  <div className="p1-feat-divider" />
                  <div className="p1-feat-col">
                    <div className="p1-feat-circle">⚙️</div>
                    <div className="p1-feat-text">Lengkap, Siap Pasang dan Berkualitas</div>
                  </div>
                </div>

                <div className="p1-flow-box">
                  <div className="p1-flow-title">Alur Kerja Sistem Hybrid</div>
                  <div className="p1-flow-row">
                    <div className="p1-flow-item">
                      <div className="p1-flow-icon-circle">☀️</div>
                      <div className="p1-flow-lbl">Energi Matahari</div>
                    </div>
                    <div className="p1-flow-arr">➔</div>
                    <div className="p1-flow-item">
                      <div className="p1-flow-icon-circle">🔲</div>
                      <div className="p1-flow-lbl">Panel Surya (DC)</div>
                    </div>
                    <div className="p1-flow-arr">➔</div>
                    <div className="p1-flow-item">
                      <div className="p1-flow-icon-circle">⚡</div>
                      <div className="p1-flow-lbl"><strong>Power System Unit</strong><br />(Inverter Hybrid)</div>
                    </div>
                    <div className="p1-flow-arr">➔</div>
                    <div className="p1-flow-item">
                      <div className="p1-flow-icon-circle">🔋</div>
                      <div className="p1-flow-lbl">Baterai LiFePO4</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= PAGE 2: TEKNIS & SPESIFIKASI ================= */}
          {(activePage === 'all' || activePage === '2') && (
            <section className="a4-sheet" id="brosurPage2" style={{ marginBottom: '28px' }}>
              <div className="p2-tech-page">
                <div className="p2-topbar">
                  <div className="p2-brand">
                    <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="p2-logo" />
                    <div className="p2-tagline">POWER YOUR WORLD.</div>
                  </div>
                  <div className="p2-top-tag">
                    <span className="p2-top-tag-bar"></span>
                    <div className="p2-top-tag-lines">
                      <div>Sistem Energi Terintegrasi</div>
                      <div>Spesifikasi &amp; Paket Komponen</div>
                    </div>
                  </div>
                </div>

                <div className="p2-cards-grid">
                  <div className="p2-card">
                    <div className="p2-card-header">
                      <span className="p2-card-num">1</span>
                      <span className="p2-card-title">Inverter Smart Hybrid</span>
                    </div>
                    <div className="p2-card-specs">
                      <div>• Tipe : <strong>Inverter Deye Hybrid ({phase})</strong></div>
                      <div>• Kapasitas : <strong>{inverterKw} kW</strong></div>
                      <div>• Efisiensi : <strong>97.6% (Dual MPPT)</strong></div>
                      <div>• Garansi : <strong>5 Tahun Resmi</strong></div>
                    </div>
                  </div>

                  <div className="p2-card">
                    <div className="p2-card-header">
                      <span className="p2-card-num">2</span>
                      <span className="p2-card-title">Baterai Penyimpanan BESS</span>
                    </div>
                    <div className="p2-card-specs">
                      <div>• Tipe : <strong>LiFePO4 Lithium ESS</strong></div>
                      <div>• Kapasitas : <strong>{batteryKwh} kWh Smart BMS</strong></div>
                      <div>• Siklus : <strong>&gt;6.000 Siklus (DoD 80%)</strong></div>
                      <div>• Garansi : <strong>5 Tahun Resmi</strong></div>
                    </div>
                  </div>

                  <div className="p2-card">
                    <div className="p2-card-header">
                      <span className="p2-card-num">3</span>
                      <span className="p2-card-title">Modul Surya High Efficiency</span>
                    </div>
                    <div className="p2-card-specs">
                      <div>• Modul : <strong>{panels}</strong></div>
                      <div>• Daya Per Modul : <strong>585 Wp Tier-1</strong></div>
                      <div>• Garansi Fisik : <strong>12 Tahun</strong></div>
                      <div>• Garansi Kinerja : <strong>25–30 Tahun Linear</strong></div>
                    </div>
                  </div>

                  <div className="p2-card">
                    <div className="p2-card-header">
                      <span className="p2-card-num">4</span>
                      <span className="p2-card-title">Mounting, Proteksi &amp; Kabel</span>
                    </div>
                    <div className="p2-card-specs">
                      <div>• Rail Aluminium AL6005-T5 Anodized</div>
                      <div>• Box Proteksi DC &amp; AC (SPD Arrester)</div>
                      <div>• Kabel Surya DC 1x4mm &amp; Kabel AC SNI</div>
                      <div>• Jasa Instalasi Terstandar K3 &amp; Uji SLO</div>
                    </div>
                  </div>
                </div>

                <div className="p2-notes-box" style={{ marginTop: '24px' }}>
                  <div className="p2-notes-left-icon">📋</div>
                  <div className="p2-notes-right-content">
                    <div className="p2-notes-title">CATATAN &amp; KETENTUAN PAKET RESMI</div>
                    <ol className="p2-notes-list">
                      <li>Harga penawaran mencakup pengiriman dan instalasi standar wilayah Jawa, Madura, dan Bali.</li>
                      <li>Di luar wilayah tersebut dapat dikenakan penyesuaian biaya mobilisasi &amp; akomodasi teknis.</li>
                      <li>Sistem monitoring pintar 24/7 didukung aplikasi smart cloud berbasis IoT smartphone.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= PAGE 3: SPH QUOTATION DOCUMENT ================= */}
          {(activePage === 'all' || activePage === '3') && (
            <section className="a4-sheet" id="brosurPage3" style={{ marginBottom: '28px' }}>
              <div className="p3-sph-document">
                <SunblixKopSuratReadonly />

                {/* 2-Column Meta Customer Block */}
                <div className="p3-sph-meta-row" style={{ marginTop: '12px' }}>
                  <div className="p3-meta-left">
                    <table className="p3-meta-table">
                      <tbody>
                        <tr><td className="meta-key">Nomor Dokumen</td><td className="meta-sep">:</td><td className="meta-val"><strong>{docNo}</strong></td></tr>
                        <tr><td className="meta-key">Tanggal Penawaran</td><td className="meta-sep">:</td><td className="meta-val">Jakarta, {dateFormatted}</td></tr>
                        <tr><td className="meta-key">Masa Berlaku</td><td className="meta-sep">:</td><td className="meta-val">14 Hari Kalender</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p3-meta-right">
                    <table className="p3-meta-table">
                      <tbody>
                        <tr><td className="meta-key">Kepada Yth.</td><td className="meta-sep">:</td><td className="meta-val"><strong>{customerName}</strong></td></tr>
                        <tr><td className="meta-key">Kontak</td><td className="meta-sep">:</td><td className="meta-val">{customerPhone}</td></tr>
                        <tr><td className="meta-key">Alamat Proyek</td><td className="meta-sep">:</td><td className="meta-val">{customerAddress}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p3-intro-text" style={{ fontSize: '11px', margin: '14px 0 8px 0', color: '#1e293b', lineHeight: 1.5 }}>
                  Dengan hormat, menindaklanjuti konsultasi perencanaan PLTS bersama <strong>SURTI AI Assistant</strong>, PT SUNBLIX ENERGI INDONESIA mengajukan Surat Penawaran Harga (SPH) resmi untuk paket terstandar <strong>{officialPkg.name} ({kwp} kWp)</strong> sebagai berikut:
                </div>

                {/* Official BoQ Table (Identical to Brosur) */}
                <table className="p3-boq-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35px', textAlign: 'center' }}>No</th>
                      <th>Kategori &amp; Spesifikasi Komponen</th>
                      <th style={{ width: '50px', textAlign: 'center' }}>Qty</th>
                      <th style={{ width: '50px', textAlign: 'center' }}>Unit</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>Harga Satuan</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td>
                          <strong>{item.code || item.item || item.category || 'Komponen PLTS'}</strong>
                          <div style={{ fontSize: '10px', color: '#475569', whiteSpace: 'pre-line' }}>{item.desc || item.description || item.spec}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{item.qty || 1}</td>
                        <td style={{ textAlign: 'center' }}>{item.unit || 'Set'}</td>
                        <td style={{ textAlign: 'right' }}>{formatRupiah(item.unitPrice || (item.subtotal / (item.qty || 1)))}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(item.subtotal || ((item.unitPrice || 0) * (item.qty || 1)))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ border: 'none' }} />
                      <td style={{ textAlign: 'right', fontWeight: 700, background: '#f8fafc' }}>Subtotal (DPP)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, background: '#f8fafc' }}>{formatRupiah(dpp)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{ border: 'none' }} />
                      <td style={{ textAlign: 'right', fontWeight: 700, background: '#f8fafc' }}>PPN 11%</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, background: '#f8fafc' }}>{formatRupiah(ppn)}</td>
                    </tr>
                    <tr style={{ background: '#e0f2fe' }}>
                      <td colSpan={4} style={{ border: 'none' }} />
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0369a1', fontSize: '12px' }}>Total Investasi</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0369a1', fontSize: '12px' }}>{formatRupiah(totalInclPpn)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Terms and Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginTop: '16px' }}>
                  <div style={{ fontSize: '9.5px', color: '#475569', lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase' }}>Syarat &amp; Ketentuan:</div>
                    <ol style={{ paddingLeft: '16px', margin: 0 }}>
                      {termsList.slice(0, 5).map((term, tIdx) => (
                        <li key={tIdx} style={{ marginBottom: '3px' }}>{term}</li>
                      ))}
                    </ol>
                  </div>

                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Hormat Kami,</div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>PT SUNBLIX ENERGI INDONESIA</div>
                    <div style={{ position: 'relative', width: '130px', height: '65px', margin: '4px 0' }}>
                      <img src="/asset/stempel_sunblix.png" alt="Stempel Resmi" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#0f172a', textDecoration: 'underline' }}>
                      {sph.approvedBy ? sph.approvedBy : 'Danny'}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748b' }}>Director / CEO</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= PAGE 4: PORTOFOLIO ================= */}
          {(activePage === 'all' || activePage === '4') && (
            <section className="a4-sheet" id="brosurPage4" style={{ marginBottom: '28px' }}>
              <div className="p4-portfolio-page">
                <div className="p4-portfolio-header">
                  <div className="p4-header-left">
                    <img src="/asset/logo.png" alt="SUNBLIX" className="p4-header-logo" />
                    <div className="p4-header-meta">
                      <div className="p4-header-title">DOKUMENTASI PORTOFOLIO &amp; REKAM JEJAK PROJEK PLTS</div>
                      <div className="p4-header-sub">PT SUNBLIX ENERGI INDONESIA • Solusi Tenaga Surya Komersial &amp; Residensial</div>
                    </div>
                  </div>
                </div>

                <div className="p4-portfolio-grid per-page-6" style={{ marginTop: '16px' }}>
                  {DEFAULT_PORTFOLIOS.slice(0, 6).map((proj, pIdx) => (
                    <div key={pIdx} className="p4-card">
                      <div style={{ height: '140px', overflow: 'hidden', background: '#0f172a' }}>
                        <img src={proj.imageUrl || '/asset/sunlight_house.jpg'} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '10px', fontSize: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{proj.title}</div>
                        <div style={{ color: '#0284c7', fontWeight: 600 }}>{proj.client} • {proj.location}</div>
                        <div style={{ color: '#64748b', marginTop: '4px' }}>{proj.specs}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
