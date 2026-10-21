'use client';

import { useState, useEffect } from 'react';
import { getStoreLeads, subscribeToStore } from '../../../lib/sunblixOsStore';
import LeadModal from '../components/LeadModal';
import LeadDetailModal from '../components/LeadDetailModal';

export default function CrmView({ onBackToDashboard, onNavigateToProjects }) {
  const [leads, setLeads] = useState([]);
  const [activeStage, setActiveStage] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [detailLead, setDetailLead] = useState(null);

  const refresh = () => {
    setLeads(getStoreLeads());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeStage === 'kualifikasi') return l.stage === 'Kualifikasi';
    if (activeStage === 'warm') return l.stage === 'Warm Lead' || l.stage === 'Survey Terjadwal (Warm Lead)';
    if (activeStage === 'survey') return l.stage === 'Survey Terjadwal' || l.stage === 'Warm Lead' || l.stage === 'Survey Terjadwal (Warm Lead)';
    if (activeStage === 'sph') return l.stage === 'SPH Terkirim';
    if (activeStage === 'nego') return l.stage === 'Negosiasi';
    if (activeStage === 'won') return l.stage === 'Deal Won';
    if (activeStage === 'cold') return l.stage === 'Cold Lead';
    return true;
  });

  // Calculate dynamic metrics
  const totalPipelineNum = leads.reduce((acc, curr) => acc + (curr.estValueNum || 0), 0);
  const totalPipelineStr = 'Rp ' + (totalPipelineNum / 1000000000).toFixed(2) + 'B';
  const surveyCount = leads.filter((l) => l.stage === 'Survey Terjadwal').length;
  const sphCount = leads.filter((l) => l.stage === 'SPH Terkirim').length;
  const wonCount = leads.filter((l) => l.stage === 'Deal Won').length;
  const closingRate = leads.length > 0 ? ((wonCount / leads.length) * 100).toFixed(1) + '%' : '0%';

  const handleOpenNewLead = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setDetailLead(null);
    setEditingLead(lead);
    setIsModalOpen(true);
  };

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
            Manajemen calon klien residensial &amp; komersial, kualifikasi daya PLN, dan tracking proposal SPH.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="sbx-filter-pill-btn" onClick={onBackToDashboard}>
            ← Kembali ke Dashboard
          </button>
          <button
            type="button"
            className="sbx-action-btn primary"
            onClick={handleOpenNewLead}
          >
            + Tambah Prospek Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards Strip */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Pipeline Nilai</span>
            <div className="sbx-metric-icon">💵</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{totalPipelineStr}</span>
            <span className="sbx-metric-badge-delta">Live</span>
          </div>
          <p className="sbx-metric-subtext">Dari {leads.length} prospek dalam database</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Survey Terjadwal</span>
            <div className="sbx-metric-icon">📅</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{surveyCount} Lokasi</span>
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
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'all' ? 'active' : ''}`}
              onClick={() => setActiveStage('all')}
            >
              Semua Prospek ({leads.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'kualifikasi' ? 'active' : ''}`}
              onClick={() => setActiveStage('kualifikasi')}
            >
              🤖 Kualifikasi ({leads.filter((l) => l.stage === 'Kualifikasi').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'warm' ? 'active' : ''}`}
              onClick={() => setActiveStage('warm')}
            >
              🔥 Warm Leads ({leads.filter((l) => l.stage === 'Warm Lead' || l.stage === 'Survey Terjadwal (Warm Lead)').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'survey' ? 'active' : ''}`}
              onClick={() => setActiveStage('survey')}
            >
              📐 Survey ({surveyCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'sph' ? 'active' : ''}`}
              onClick={() => setActiveStage('sph')}
            >
              📑 SPH Terkirim ({sphCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'nego' ? 'active' : ''}`}
              onClick={() => setActiveStage('nego')}
            >
              🤝 Negosiasi ({leads.filter((l) => l.stage === 'Negosiasi').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'won' ? 'active' : ''}`}
              onClick={() => setActiveStage('won')}
            >
              🏆 Deal Won ({wonCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeStage === 'cold' ? 'active' : ''}`}
              onClick={() => setActiveStage('cold')}
            >
              ❄️ Cold Leads ({leads.filter((l) => l.stage === 'Cold Lead').length})
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
                <th>Lokasi Properti</th>
                <th>Daya PLN &amp; Kapasitas Usulan</th>
                <th>Estimasi Nilai</th>
                <th>Tahapan Pipeline</th>
                <th>Sumber Prospek</th>
                <th>PIC Sales</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                        {l.id}
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{l.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--sbx-accent)' }}>{l.company}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>📍 {l.location}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                      ⚡ {l.targetKwp}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>{l.plnTariff}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '13px' }}>
                      {l.estValue}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`sbx-status-badge ${
                        l.stage === 'Deal Won'
                          ? 'success'
                          : l.stage === 'Negosiasi'
                          ? 'success'
                          : l.stage === 'SPH Terkirim'
                          ? 'info'
                          : l.stage === 'Warm Lead' || l.stage === 'Survey Terjadwal (Warm Lead)'
                          ? 'warning'
                          : l.stage === 'Survey Terjadwal'
                          ? 'warning'
                          : l.stage === 'Cold Lead'
                          ? 'secondary'
                          : 'purple'
                      }`}
                    >
                      {l.stage}
                    </span>
                  </td>
                  <td>
                    <span className="sbx-tag">{l.leadSource}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>{l.assigned}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <a
                        href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo ${l.name}, saya dari tim Sunblix Energi Indonesia terkait PLTS ${l.targetKwp}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sbx-row-action-btn"
                        style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                        title="Chat WhatsApp Klien"
                      >
                        💬 WA
                      </a>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => setDetailLead(l)}
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => handleEditLead(l)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--sbx-text-muted)' }}>
                    Tidak ada prospek yang cocok dengan filter atau pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add/Edit Lead */}
      {isModalOpen && (
        <LeadModal
          lead={editingLead}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setToast('✅ Data prospek berhasil disimpan ke database lokal!');
            setTimeout(() => setToast(''), 3000);
          }}
        />
      )}

      {/* MODAL 2: Detail Lead & Convert to Project */}
      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          onClose={() => setDetailLead(null)}
          onEdit={handleEditLead}
          onConverted={(res) => {
            setToast(`🚀 Prospek berhasil dikonversi ke Proyek ${res.project.code}!`);
            setTimeout(() => setToast(''), 4000);
            if (onNavigateToProjects) onNavigateToProjects();
          }}
        />
      )}
    </div>
  );
}
