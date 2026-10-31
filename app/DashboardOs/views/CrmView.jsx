'use client';

import { useState, useEffect, useCallback } from 'react';
import { calculateSolarSystem, formatRupiah } from '../../../lib/surti/solarEngine.js';

// Maps crmService.js's backend stage enum to the pipeline labels this view
// already uses for its tab filters and status badges.
const STAGE_DISPLAY = {
  NEW_LEAD: 'Kualifikasi',
  QUALIFIED: 'Warm Lead',
  SURVEY_SCHEDULED: 'Survey Terjadwal (Warm Lead)',
  SPH_PROPOSED: 'SPH Terkirim',
  WON: 'Deal Won',
  LOST: 'Cold Lead',
};

export default function CrmView({ onBackToDashboard }) {
  const [rawLeads, setRawLeads] = useState([]);
  const [activeStage, setActiveStage] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const staffToken = typeof window !== 'undefined' ? localStorage.getItem('sunblix_staff_token') : null;
      const res = await fetch('/api/surti/crm?type=leads', {
        headers: staffToken ? { Authorization: `Bearer ${staffToken}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        // Only leads that passed the CRM approval gate belong in this
        // pipeline view — everything else still lives in SURTI Intelligence
        // (SURTI's own working database) until it's ready and approved.
        setRawLeads((data.leads || []).filter((l) => l.crmApproved));
      } else {
        setError(data.message || 'Gagal memuat data CRM.');
      }
    } catch (err) {
      setError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Attach a display stage + a deterministic system-size estimate (same
  // engine used site-wide) wherever we actually have a monthly bill to
  // compute from — never an invented number.
  const leads = rawLeads.map((l) => {
    let estimate = null;
    if (l.monthlyBill) {
      try {
        estimate = calculateSolarSystem({
          monthlyBill: l.monthlyBill,
          propertyType: l.propertyType,
          systemType: l.systemType,
        });
      } catch (e) {
        estimate = null;
      }
    }
    return { ...l, displayStage: STAGE_DISPLAY[l.stage] || l.stage, estimate };
  });

  const filteredLeads = leads.filter((l) => {
    const needle = search.toLowerCase();
    const matchSearch =
      (l.name || '').toLowerCase().includes(needle) ||
      (l.companyName || '').toLowerCase().includes(needle) ||
      (l.city || '').toLowerCase().includes(needle) ||
      (l.id || '').toLowerCase().includes(needle);

    if (!matchSearch) return false;
    if (activeStage === 'kualifikasi') return l.displayStage === 'Kualifikasi';
    if (activeStage === 'warm') return l.displayStage === 'Warm Lead' || l.displayStage === 'Survey Terjadwal (Warm Lead)';
    if (activeStage === 'survey') return l.displayStage === 'Survey Terjadwal (Warm Lead)';
    if (activeStage === 'sph') return l.displayStage === 'SPH Terkirim';
    if (activeStage === 'nego') return l.displayStage === 'Negosiasi';
    if (activeStage === 'won') return l.displayStage === 'Deal Won';
    if (activeStage === 'cold') return l.displayStage === 'Cold Lead';
    return true;
  });

  // Dynamic metrics — pipeline value is a computed estimate (solarEngine),
  // not a stored/invented figure.
  const totalPipelineNum = leads.reduce((acc, l) => acc + (l.estimate?.estimatedInvestment || 0), 0);
  const totalPipelineStr = totalPipelineNum > 0 ? 'Rp ' + (totalPipelineNum / 1000000000).toFixed(2) + 'B' : 'Rp 0';
  const surveyCount = leads.filter((l) => l.displayStage === 'Survey Terjadwal (Warm Lead)').length;
  const sphCount = leads.filter((l) => l.displayStage === 'SPH Terkirim').length;
  const wonCount = leads.filter((l) => l.displayStage === 'Deal Won').length;
  const closingRate = leads.length > 0 ? ((wonCount / leads.length) * 100).toFixed(1) + '%' : '0%';

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>CRM &amp; Leads</span>
          </div>
          <h1 className="sbx-view-title">👥 CRM &amp; Pipeline Prospek PLTS</h1>
          <p className="sbx-view-sub">
            Lead yang sudah disaring SURTI &amp; disetujui masuk CRM (via tab "SURTI Intelligence"), ditambah lead self-service dari form website.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="sbx-filter-pill-btn" onClick={onBackToDashboard}>
            ← Kembali ke Dashboard
          </button>
          <button type="button" className="sbx-filter-pill-btn" onClick={refresh} title="Muat ulang data terbaru">
            🔄 Refresh
          </button>
          <button
            type="button"
            className="sbx-action-btn primary"
            disabled
            title="Sedang disambungkan ke database SURTI yang sama dengan tabel ini — belum aktif, menyusul setelah rilis."
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            + Tambah Prospek Baru
          </button>
        </div>
      </div>

      {error && (
        <div className="sbx-toast-box" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Pipeline Nilai (Estimasi)</span>
            <div className="sbx-metric-icon">💵</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{totalPipelineStr}</span>
            <span className="sbx-metric-badge-delta">Live</span>
          </div>
          <p className="sbx-metric-subtext">Dari {leads.length} prospek yang sudah disetujui masuk CRM</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Survey Terjadwal</span>
            <div className="sbx-metric-icon">📅</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{surveyCount} Lead</span>
            <span className="sbx-status-badge warning">Aktif</span>
          </div>
          <p className="sbx-metric-subtext">Perlu inspeksi atap &amp; shading</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">SPH Terkirim</span>
            <div className="sbx-metric-icon">📑</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{sphCount} Proposal</span>
            <span className="sbx-status-badge info">Menunggu PO</span>
          </div>
          <p className="sbx-metric-subtext">Proposal harga siap tindak lanjut</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Closing Rate / Won</span>
            <div className="sbx-metric-icon">🏆</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{wonCount} Deal</span>
            <span className="sbx-status-badge success">{closingRate}</span>
          </div>
          <p className="sbx-metric-subtext">Siap dikonversi ke kontrak EPC</p>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button type="button" className={`sbx-tab-btn ${activeStage === 'all' ? 'active' : ''}`} onClick={() => setActiveStage('all')}>
              Semua Prospek ({leads.length})
            </button>
            <button type="button" className={`sbx-tab-btn ${activeStage === 'kualifikasi' ? 'active' : ''}`} onClick={() => setActiveStage('kualifikasi')}>
              🤖 Kualifikasi ({leads.filter((l) => l.displayStage === 'Kualifikasi').length})
            </button>
            <button type="button" className={`sbx-tab-btn ${activeStage === 'warm' ? 'active' : ''}`} onClick={() => setActiveStage('warm')}>
              🔥 Warm Leads ({leads.filter((l) => l.displayStage === 'Warm Lead' || l.displayStage === 'Survey Terjadwal (Warm Lead)').length})
            </button>
            <button type="button" className={`sbx-tab-btn ${activeStage === 'survey' ? 'active' : ''}`} onClick={() => setActiveStage('survey')}>
              📐 Survey ({surveyCount})
            </button>
            <button type="button" className={`sbx-tab-btn ${activeStage === 'sph' ? 'active' : ''}`} onClick={() => setActiveStage('sph')}>
              📑 SPH Terkirim ({sphCount})
            </button>
            <button type="button" className={`sbx-tab-btn ${activeStage === 'won' ? 'active' : ''}`} onClick={() => setActiveStage('won')}>
              🏆 Deal Won ({wonCount})
            </button>
            <button type="button" className={`sbx-tab-btn ${activeStage === 'cold' ? 'active' : ''}`} onClick={() => setActiveStage('cold')}>
              ❄️ Cold Leads ({leads.filter((l) => l.displayStage === 'Cold Lead').length})
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari nama, lokasi, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>ID &amp; Calon Klien</th>
                <th>Lokasi</th>
                <th>Tagihan &amp; Sistem</th>
                <th>Estimasi Nilai</th>
                <th>Tahapan Pipeline</th>
                <th>Sumber Prospek</th>
                <th>Disetujui Oleh</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--sbx-text-muted)' }}>
                    Memuat data CRM...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--sbx-text-muted)' }}>
                    Belum ada prospek yang cocok dengan filter, atau belum ada lead yang disetujui masuk CRM — cek tab "SURTI Intelligence" untuk menyetujui lead yang sudah siap.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>{l.id}</span>
                        <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{l.name}</div>
                        {l.companyName && <div style={{ fontSize: '11.5px', color: 'var(--sbx-accent)' }}>{l.companyName}</div>}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>📍 {l.city || '—'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                        {l.monthlyBill ? formatRupiah(l.monthlyBill) + '/bln' : '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>
                        {l.systemType || 'hybrid'} · {l.estimate ? `${l.estimate.kwp} kWp` : 'belum dihitung'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#10b981', fontSize: '13px' }}>
                        {l.estimate ? formatRupiah(l.estimate.estimatedInvestment) : '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sbx-status-badge ${
                          l.displayStage === 'Deal Won'
                            ? 'success'
                            : l.displayStage === 'SPH Terkirim'
                            ? 'info'
                            : l.displayStage === 'Survey Terjadwal (Warm Lead)' || l.displayStage === 'Warm Lead'
                            ? 'warning'
                            : l.displayStage === 'Cold Lead'
                            ? 'secondary'
                            : 'purple'
                        }`}
                      >
                        {l.displayStage}
                      </span>
                    </td>
                    <td>
                      <span className="sbx-tag">{l.source || 'SURTI AI Chat'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>
                        {l.crmApprovedBy || (l.source && l.source !== 'SURTI AI Chat' ? 'Self-service (otomatis)' : '—')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.phone && (
                        <a
                          href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Halo ${l.name}, saya dari tim Sunblix Energi Indonesia.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sbx-row-action-btn"
                          style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                          title="Chat WhatsApp Klien"
                        >
                          💬 WA
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
