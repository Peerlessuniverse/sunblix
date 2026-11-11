'use client';

import { useState, useEffect, useCallback } from 'react';

const INITIAL_VENDORS = [
  {
    id: 'VND-001',
    name: 'PT. Energi Semesta Solusindo (ESS)',
    category: 'Inverter & BESS',
    products: 'Deye & SolaX Inverter (Hybrid, On-Grid, Off-Grid), LiFePO4 Battery Storage, Smart Meter',
    pic: 'Sales Engineer ESS',
    phone: '0852-8858-1027',
    rating: '⭐ 4.9',
    sla: '1-3 Hari',
    paymentTerms: 'Exworks Gudang Jakarta & Tangerang, Lead time 1 bulan pemesanan',
    status: 'Tier-1 Partner',
  },
  {
    id: 'VND-002',
    name: 'PT. Astronergy Solar Indonesia / Chint',
    category: 'Modul Surya Tier-1',
    products: 'Panel Surya N-Type TOPCon Bifacial Double Glass 585 Wp - 640 Wp',
    pic: 'Bpk. Hendra (Supply)',
    phone: '0813-1122-3344',
    rating: '⭐ 4.95',
    sla: 'Ready Stock',
    paymentTerms: 'Termin DP 50% / Pelunasan saat material siap kirim',
    status: 'Tier-1 Partner',
  },
  {
    id: 'VND-003',
    name: 'PT. Solar Mounting Nusantara',
    category: 'Mounting & Struktur',
    products: 'Rail Aluminium AL6005-T5, L-Feet, Mid & End Clamp, Tile Hook, Ballast',
    pic: 'Bpk. Dimas',
    phone: '0819-3344-5566',
    rating: '⭐ 4.8',
    sla: 'Ready Stock',
    paymentTerms: 'Net 14 hari',
    status: 'Verified Supplier',
  },
];

const INQUIRY_STATUS_CONFIG = {
  submitted: { label: 'Inquiry Masuk', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  under_review: { label: 'Sedang Ditinjau', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  contacted: { label: 'Sudah Dihubungi', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  approved: { label: 'Disetujui Jadi Rekanan', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  rejected: { label: 'Ditolak', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

function formatWaUrl(phone, picName, companyName) {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  const msg = encodeURIComponent(`Halo Bpk/Ibu ${picName} (${companyName}), kami dari Tim Procurement SUNBLIX terkait penawaran kerja sama kemitraan vendor Anda.`);
  return `https://wa.me/${clean}?text=${msg}`;
}

export default function VendorsView({ onBackToDashboard }) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'inquiries'
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);

  const fetchInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    setInquiryError('');
    try {
      const staffToken = typeof window !== 'undefined' ? localStorage.getItem('sunblix_staff_token') : null;
      const res = await fetch('/api/partnership', {
        headers: staffToken ? { Authorization: `Bearer ${staffToken}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries || []);
      } else {
        setInquiryError(data.message || 'Gagal memuat data pendaftaran kemitraan.');
      }
    } catch (err) {
      setInquiryError('Gagal menghubungi server untuk memuat kemitraan.');
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdateInquiryStatus = async (id, newStatus) => {
    setUpdatingInquiryId(id);
    try {
      const staffToken = typeof window !== 'undefined' ? localStorage.getItem('sunblix_staff_token') : null;
      const res = await fetch('/api/partnership', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
        }
        setToast(`Status kemitraan berhasil diubah: ${INQUIRY_STATUS_CONFIG[newStatus]?.label || newStatus}`);
        setTimeout(() => setToast(''), 3500);
      } else {
        alert(result.message || 'Gagal memperbarui status pendaftaran.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  // Filter Directory
  const filteredVendors = vendors.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.products.toLowerCase().includes(search.toLowerCase()) ||
      v.pic.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (catFilter === 'panel') return v.category.includes('Modul');
    if (catFilter === 'inverter') return v.category.includes('Inverter');
    if (catFilter === 'mounting') return v.category.includes('Mounting');
    return true;
  });

  // Filter Inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const needle = search.toLowerCase();
    const matchSearch =
      (inq.company_name || '').toLowerCase().includes(needle) ||
      (inq.pic_name || '').toLowerCase().includes(needle) ||
      (inq.category || '').toLowerCase().includes(needle) ||
      (inq.coverage_area || '').toLowerCase().includes(needle) ||
      (inq.email || '').toLowerCase().includes(needle) ||
      (inq.partner_number || '').toLowerCase().includes(needle);

    if (!matchSearch) return false;
    if (inquiryStatusFilter !== 'all' && inq.status !== inquiryStatusFilter) return false;
    return true;
  });

  const panelCount = vendors.filter((v) => v.category?.includes('Modul')).length;
  const inverterCount = vendors.filter((v) => v.category?.includes('Inverter')).length;
  const mountingCount = vendors.filter((v) => v.category?.includes('Mounting')).length;

  const newInquiriesCount = inquiries.filter((i) => i.status === 'submitted').length;

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Vendors &amp; Rekanan</span>
          </div>
          <h1 className="sbx-view-title">🤝 Direktori Vendor &amp; Pendaftaran Rekanan EPC</h1>
          <p className="sbx-view-sub">
            Manajemen distributor resmi modul surya, inverter pabrikan Tier-1, mounting aluminium, serta peninjauan proposal kemitraan baru.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="sbx-filter-pill-btn" onClick={onBackToDashboard}>
            ← Kembali ke Dashboard
          </button>
          {activeTab === 'inquiries' ? (
            <button
              type="button"
              className="sbx-action-btn primary"
              onClick={fetchInquiries}
              disabled={loadingInquiries}
            >
              {loadingInquiries ? 'Memuat...' : '🔄 Sinkronkan Inquiry'}
            </button>
          ) : (
            <button
              type="button"
              className="sbx-action-btn primary"
              onClick={() => {
                setToast('🤝 Form pendaftaran rekanan vendor baru dibuka.');
                setTimeout(() => setToast(''), 3000);
              }}
            >
              + Registrasi Rekanan Baru
            </button>
          )}
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* Primary Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--sbx-border)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={`sbx-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
          style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
          onClick={() => setActiveTab('directory')}
        >
          📋 Direktori Vendor Terverifikasi ({vendors.length})
        </button>
        <button
          type="button"
          className={`sbx-tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
          style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, position: 'relative' }}
          onClick={() => setActiveTab('inquiries')}
        >
          📥 Pendaftaran Kemitraan Masuk ({inquiries.length})
          {newInquiriesCount > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 7px',
              borderRadius: '10px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
            }}>
              {newInquiriesCount} Baru
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DIREKTORI VENDOR */}
      {activeTab === 'directory' && (
        <>
          {/* KPI Cards */}
          <div className="sbx-metrics-row">
            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">Rekanan Terverifikasi</span>
                <div className="sbx-metric-icon">🤝</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">{vendors.length} Mitra</span>
                <span className={`sbx-status-badge ${vendors.length > 0 ? 'success' : 'info'}`}>
                  {vendors.length > 0 ? 'Tier-1 OEM' : 'Standby Pool'}
                </span>
              </div>
              <p className="sbx-metric-subtext">Distributor resmi &amp; supplier BOS</p>
            </div>

            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">Rating Kepuasan Suplai</span>
                <div className="sbx-metric-icon">⭐</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">{vendors.length > 0 ? '4.85 / 5.0' : '0.0 / 5.0'}</span>
                <span className="sbx-metric-badge-delta">{vendors.length > 0 ? 'High Quality' : 'Standar SOP'}</span>
              </div>
              <p className="sbx-metric-subtext">Berdasarkan inspeksi QC masuk</p>
            </div>

            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">On-Time SLA Delivery</span>
                <div className="sbx-metric-icon">⏱️</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">{vendors.length > 0 ? '96.8%' : '100%'}</span>
                <span className="sbx-status-badge info">Tepat Waktu</span>
              </div>
              <p className="sbx-metric-subtext">Ketepatan waktu jadwal kirim site</p>
            </div>

            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">Diskon Volume EPC</span>
                <div className="sbx-metric-icon">🏷️</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">{vendors.length > 0 ? '12 - 20%' : 'Tier 0%'}</span>
                <span className="sbx-status-badge purple">Special Tier</span>
              </div>
              <p className="sbx-metric-subtext">Kontrak tahunan eksklusif Sunblix</p>
            </div>
          </div>

          {/* Vendor Table Card */}
          <div className="sbx-card" style={{ marginTop: '16px' }}>
            <div className="sbx-filter-bar">
              <div className="sbx-tab-pills">
                <button
                  type="button"
                  className={`sbx-tab-btn ${catFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCatFilter('all')}
                >
                  Semua Vendor ({vendors.length})
                </button>
                <button
                  type="button"
                  className={`sbx-tab-btn ${catFilter === 'panel' ? 'active' : ''}`}
                  onClick={() => setCatFilter('panel')}
                >
                  ☀️ Modul Surya ({panelCount})
                </button>
                <button
                  type="button"
                  className={`sbx-tab-btn ${catFilter === 'inverter' ? 'active' : ''}`}
                  onClick={() => setCatFilter('inverter')}
                >
                  ⚡ Inverter &amp; Baterai ({inverterCount})
                </button>
                <button
                  type="button"
                  className={`sbx-tab-btn ${catFilter === 'mounting' ? 'active' : ''}`}
                  onClick={() => setCatFilter('mounting')}
                >
                  🔩 Mounting &amp; Struktur ({mountingCount})
                </button>
              </div>

              <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
                <span className="sbx-search-icon">🔍</span>
                <input
                  type="text"
                  className="sbx-search-input"
                  placeholder="Cari vendor, produk, PIC..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="sbx-table-wrap">
              <table className="sbx-table">
                <thead>
                  <tr>
                    <th>Nama Vendor &amp; Status</th>
                    <th>Kategori Pasokan</th>
                    <th>Katalog Produk Utama</th>
                    <th>Kontak PIC</th>
                    <th>Rating &amp; SLA</th>
                    <th>Term Pembayaran</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--sbx-text-muted)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤝</div>
                        <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px', marginBottom: '4px' }}>
                          Belum Ada Rekanan Vendor Terdaftar
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          Klik tombol &quot;+ Registrasi Rekanan Baru&quot; di atas untuk mendaftarkan distributor resmi solar modul, inverter, dan kontraktor lokal.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{v.name}</div>
                            <span className="sbx-tag" style={{ marginTop: '3px' }}>{v.status}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sbx-accent)' }}>
                            {v.category}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', color: 'var(--sbx-text)', maxWidth: '280px' }}>
                            {v.products}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text)' }}>{v.pic}</div>
                          <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>{v.phone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '12.5px' }}>{v.rating}</div>
                          <div style={{ fontSize: '11px', color: '#10b981' }}>SLA: {v.sla}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                            {v.paymentTerms}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="sbx-row-action-btn"
                            onClick={() => {
                              setToast(`📞 Menghubungi PIC ${v.name} (${v.pic}: ${v.phone})`);
                              setTimeout(() => setToast(''), 4000);
                            }}
                          >
                            Hubungi
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PENDAFTARAN KEMITRAAN MASUK (INBOUND INQUIRIES) */}
      {activeTab === 'inquiries' && (
        <>
          {inquiryError && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
              ⚠️ {inquiryError}
            </div>
          )}

          {/* Inquiries KPI Cards */}
          <div className="sbx-metrics-row">
            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">Total Proposal Kemitraan</span>
                <div className="sbx-metric-icon">🏢</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">{inquiries.length} Mitra</span>
                <span className="sbx-status-badge info">Inbound</span>
              </div>
              <p className="sbx-metric-subtext">Pendaftar dari form kemitraan web</p>
            </div>

            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">Inquiry Baru Masuk</span>
                <div className="sbx-metric-icon">📥</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">{newInquiriesCount}</span>
                <span className="sbx-status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  Perlu Ditinjau
                </span>
              </div>
              <p className="sbx-metric-subtext">Menunggu evaluasi tim procurement</p>
            </div>

            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">Sedang Ditinjau / Dihubungi</span>
                <div className="sbx-metric-icon">💬</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">
                  {inquiries.filter((i) => i.status === 'under_review' || i.status === 'contacted').length}
                </span>
                <span className="sbx-status-badge purple">Follow Up</span>
              </div>
              <p className="sbx-metric-subtext">Klarifikasi spesifikasi &amp; komersial</p>
            </div>

            <div className="sbx-metric-card">
              <div className="sbx-metric-header">
                <span className="sbx-metric-label">Kemitraan Disetujui</span>
                <div className="sbx-metric-icon">✅</div>
              </div>
              <div className="sbx-metric-body">
                <span className="sbx-metric-val">
                  {inquiries.filter((i) => i.status === 'approved').length}
                </span>
                <span className="sbx-status-badge success">Approved</span>
              </div>
              <p className="sbx-metric-subtext">Masuk ke daftar rekanan resmi</p>
            </div>
          </div>

          {/* Inquiries Table Card */}
          <div className="sbx-card" style={{ marginTop: '16px' }}>
            <div className="sbx-filter-bar">
              <div className="sbx-tab-pills">
                <button
                  type="button"
                  className={`sbx-tab-btn ${inquiryStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setInquiryStatusFilter('all')}
                >
                  Semua ({inquiries.length})
                </button>
                <button
                  type="button"
                  className={`sbx-tab-btn ${inquiryStatusFilter === 'submitted' ? 'active' : ''}`}
                  onClick={() => setInquiryStatusFilter('submitted')}
                >
                  Inquiry Masuk ({newInquiriesCount})
                </button>
                <button
                  type="button"
                  className={`sbx-tab-btn ${inquiryStatusFilter === 'under_review' ? 'active' : ''}`}
                  onClick={() => setInquiryStatusFilter('under_review')}
                >
                  Ditinjau ({inquiries.filter((i) => i.status === 'under_review').length})
                </button>
                <button
                  type="button"
                  className={`sbx-tab-btn ${inquiryStatusFilter === 'contacted' ? 'active' : ''}`}
                  onClick={() => setInquiryStatusFilter('contacted')}
                >
                  Dihubungi ({inquiries.filter((i) => i.status === 'contacted').length})
                </button>
                <button
                  type="button"
                  className={`sbx-tab-btn ${inquiryStatusFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => setInquiryStatusFilter('approved')}
                >
                  Disetujui ({inquiries.filter((i) => i.status === 'approved').length})
                </button>
              </div>

              <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
                <span className="sbx-search-icon">🔍</span>
                <input
                  type="text"
                  className="sbx-search-input"
                  placeholder="Cari perusahaan, PIC, kategori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="sbx-table-wrap">
              <table className="sbx-table">
                <thead>
                  <tr>
                    <th>No. &amp; Tanggal</th>
                    <th>Perusahaan &amp; Area</th>
                    <th>Kategori Kemitraan</th>
                    <th>Kontak PIC</th>
                    <th>Status Kemitraan</th>
                    <th style={{ textAlign: 'right' }}>Aksi Procurement</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingInquiries ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--sbx-text-muted)' }}>
                        Memuat data pendaftaran kemitraan dari database...
                      </td>
                    </tr>
                  ) : filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--sbx-text-muted)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                        <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px', marginBottom: '4px' }}>
                          Tidak Ada Pendaftaran yang Sesuai Filter
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          Belum ada proposal pendaftaran vendor kemitraan baru pada filter ini.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inq) => {
                      const st = INQUIRY_STATUS_CONFIG[inq.status] || INQUIRY_STATUS_CONFIG.submitted;
                      const waUrl = formatWaUrl(inq.whatsapp, inq.pic_name, inq.company_name);

                      return (
                        <tr key={inq.id}>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--sbx-text)' }}>
                              {inq.partner_number}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)', marginTop: '2px' }}>
                              {inq.created_at ? new Date(inq.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--sbx-text)', fontSize: '13px' }}>
                              {inq.company_name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                              📍 {inq.coverage_area || 'Nasional / Seluruh Indonesia'}
                            </div>
                            {inq.website && (
                              <a
                                href={inq.website.startsWith('http') ? inq.website : `https://${inq.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '11px', color: 'var(--sbx-accent)', textDecoration: 'none' }}
                              >
                                🌐 {inq.website}
                              </a>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sbx-accent)' }}>
                              {inq.category}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                              {inq.pic_name} {inq.pic_position ? `(${inq.pic_position})` : ''}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                              📱 {inq.whatsapp}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                              📧 {inq.email}
                            </div>
                          </td>
                          <td>
                            <select
                              className="sbx-filter-select"
                              style={{
                                fontSize: '11.5px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                color: st.color,
                                background: st.bg,
                                border: `1px solid ${st.color}40`,
                                cursor: 'pointer',
                              }}
                              value={inq.status}
                              disabled={updatingInquiryId === inq.id}
                              onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                            >
                              <option value="submitted">📥 Inquiry Masuk</option>
                              <option value="under_review">🔍 Sedang Ditinjau</option>
                              <option value="contacted">📞 Sudah Dihubungi</option>
                              <option value="approved">✅ Disetujui</option>
                              <option value="rejected">❌ Ditolak</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="sbx-row-action-btn"
                                style={{ padding: '4px 8px', fontSize: '11.5px' }}
                                onClick={() => setSelectedInquiry(inq)}
                              >
                                👁️ Proposal
                              </button>
                              {inq.company_profile_url && (
                                <a
                                  href={inq.company_profile_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sbx-row-action-btn"
                                  style={{ padding: '4px 8px', fontSize: '11.5px', textDecoration: 'none' }}
                                >
                                  📄 Katalog
                                </a>
                              )}
                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sbx-row-action-btn"
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '11.5px',
                                    textDecoration: 'none',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    color: '#16a34a',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                  }}
                                >
                                  💬 WA
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Inquiry Detail Proposal Modal */}
      {selectedInquiry && (
        <div className="sbx-modal-backdrop" onClick={() => setSelectedInquiry(null)}>
          <div className="sbx-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sbx-modal-header">
              <div>
                <span className="sbx-tag" style={{ marginBottom: '6px' }}>{selectedInquiry.partner_number}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--sbx-text)' }}>
                  {selectedInquiry.company_name}
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--sbx-accent)', fontWeight: 600 }}>
                  Kategori: {selectedInquiry.category}
                </p>
              </div>
              <button
                type="button"
                className="sbx-modal-close-btn"
                onClick={() => setSelectedInquiry(null)}
              >
                ✕
              </button>
            </div>

            <div className="sbx-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Partner Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: 'var(--sbx-surface-2)', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Nama PIC</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                    {selectedInquiry.pic_name} {selectedInquiry.pic_position ? `(${selectedInquiry.pic_position})` : ''}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Nomor WhatsApp</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedInquiry.whatsapp}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Email Perusahaan</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedInquiry.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Cakupan Area Layanan</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedInquiry.coverage_area || 'Nasional'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>NPWP Perusahaan</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedInquiry.npwp || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Website</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-accent)' }}>
                    {selectedInquiry.website ? (
                      <a href={selectedInquiry.website.startsWith('http') ? selectedInquiry.website : `https://${selectedInquiry.website}`} target="_blank" rel="noopener noreferrer">
                        {selectedInquiry.website}
                      </a>
                    ) : '-'}
                  </div>
                </div>
              </div>

              {/* Proposal Description */}
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--sbx-text)' }}>
                  📝 Deskripsi Penawaran Kerja Sama
                </h4>
                <div style={{ fontSize: '12.5px', lineHeight: '1.6', background: 'var(--sbx-surface-2)', padding: '12px 14px', borderRadius: '8px', color: 'var(--sbx-text)' }}>
                  {selectedInquiry.proposal_description || 'Tidak ada deskripsi yang disertakan.'}
                </div>
              </div>

              {/* Past Experience */}
              {selectedInquiry.past_experience && (
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--sbx-text)' }}>
                    🏗️ Pengalaman &amp; Portofolio Proyek
                  </h4>
                  <div style={{ fontSize: '12.5px', lineHeight: '1.5', background: 'var(--sbx-surface-2)', padding: '12px 14px', borderRadius: '8px', color: 'var(--sbx-text)' }}>
                    {selectedInquiry.past_experience}
                  </div>
                </div>
              )}

              {/* Catalog Link */}
              {selectedInquiry.company_profile_url && (
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--sbx-text)' }}>
                    📎 Tautan Katalog Produk / Company Profile
                  </h4>
                  <a
                    href={selectedInquiry.company_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3b82f6',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      textDecoration: 'none',
                    }}
                  >
                    📄 Buka Katalog Produk Vendor →
                  </a>
                </div>
              )}
            </div>

            <div className="sbx-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sbx-text-muted)' }}>Status:</span>
                <select
                  className="sbx-filter-select"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  value={selectedInquiry.status}
                  onChange={(e) => handleUpdateInquiryStatus(selectedInquiry.id, e.target.value)}
                >
                  <option value="submitted">📥 Inquiry Masuk</option>
                  <option value="under_review">🔍 Sedang Ditinjau</option>
                  <option value="contacted">📞 Sudah Dihubungi</option>
                  <option value="approved">✅ Disetujui</option>
                  <option value="rejected">❌ Ditolak</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {formatWaUrl(selectedInquiry.whatsapp, selectedInquiry.pic_name, selectedInquiry.company_name) && (
                  <a
                    href={formatWaUrl(selectedInquiry.whatsapp, selectedInquiry.pic_name, selectedInquiry.company_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sbx-action-btn"
                    style={{ background: '#16a34a', color: '#fff', textDecoration: 'none' }}
                  >
                    💬 Chat PIC via WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  className="sbx-action-btn secondary"
                  onClick={() => setSelectedInquiry(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
