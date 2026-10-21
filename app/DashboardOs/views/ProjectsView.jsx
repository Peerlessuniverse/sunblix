'use client';

import { useState, useEffect } from 'react';
import { getStoreProjects, subscribeToStore } from '../../../lib/sunblixOsStore';
import ProjectModal from '../components/ProjectModal';
import ProjectDetailModal from '../components/ProjectDetailModal';

export default function ProjectsView({ onBackToDashboard }) {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);

  const refresh = () => {
    setProjects(getStoreProjects());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === 'residential') return p.type.includes('Residential');
    if (activeFilter === 'commercial') return p.type.includes('Commercial');
    if (activeFilter === 'hybrid') return p.type.includes('Hybrid');
    if (activeFilter === 'live') return p.status === 'Live Terkoneksi';
    return true;
  });

  // Calculate dynamic metrics
  const totalKwp = projects.reduce((acc, curr) => acc + (curr.kwpNum || parseFloat(curr.kwp) || 0), 0);
  const liveCount = projects.filter((p) => p.status === 'Live Terkoneksi').length;
  const inProgressCount = projects.filter((p) => p.status !== 'Live Terkoneksi').length;
  const commissioningCount = projects.filter((p) => p.status === 'Commissioning').length;

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setDetailProject(null);
    setEditingProject(project);
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
            <span style={{ color: 'var(--sbx-accent)' }}>Projects</span>
          </div>
          <h1 className="sbx-view-title">☀️ Portofolio Proyek PLTS Aktif</h1>
          <p className="sbx-view-sub">
            Monitoring status EPC konstruksi, tahapan instalasi lapangan, progress persentase, dan tanggal target COD.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="sbx-filter-pill-btn" onClick={onBackToDashboard}>
            ← Kembali ke Dashboard
          </button>
          <button
            type="button"
            className="sbx-action-btn primary"
            onClick={handleOpenNewProject}
          >
            + Tambah Proyek Baru
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}

      {/* KPI Cards Strip */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Kapasitas Terpasang</span>
            <div className="sbx-metric-icon">⚡</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{totalKwp.toFixed(2)} kWp</span>
            <span className="sbx-metric-badge-delta">Portofolio</span>
          </div>
          <p className="sbx-metric-subtext">Dari {projects.length} kontrak EPC resmi</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Konstruksi Lapangan</span>
            <div className="sbx-metric-icon">🏗️</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{inProgressCount} Site</span>
            <span className="sbx-status-badge info">Aktif Berjalan</span>
          </div>
          <p className="sbx-metric-subtext">Struktur, panel, &amp; wiring</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Tahap Commissioning</span>
            <div className="sbx-metric-icon">🔍</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{commissioningCount} Site</span>
            <span className="sbx-status-badge warning">Uji SLO</span>
          </div>
          <p className="sbx-metric-subtext">Megger test &amp; anti-islanding</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Live Terkoneksi (COD)</span>
            <div className="sbx-metric-icon">✅</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{liveCount} Sistem</span>
            <span className="sbx-status-badge success">Generating</span>
          </div>
          <p className="sbx-metric-subtext">Beroperasi normal dengan telemetri</p>
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Semua Proyek ({projects.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'residential' ? 'active' : ''}`}
              onClick={() => setActiveFilter('residential')}
            >
              🏠 Residensial ({projects.filter((p) => p.type.includes('Residential')).length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'commercial' ? 'active' : ''}`}
              onClick={() => setActiveFilter('commercial')}
            >
              🏢 Komersial ({projects.filter((p) => p.type.includes('Commercial')).length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'hybrid' ? 'active' : ''}`}
              onClick={() => setActiveFilter('hybrid')}
            >
              🔋 Hybrid BESS ({projects.filter((p) => p.type.includes('Hybrid')).length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeFilter === 'live' ? 'active' : ''}`}
              onClick={() => setActiveFilter('live')}
            >
              ✅ Live COD ({liveCount})
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari kode, nama, klien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th>Kode &amp; Nama Proyek</th>
                <th>Klien &amp; Lokasi</th>
                <th>Kapasitas &amp; Panel</th>
                <th>Inverter &amp; Proteksi</th>
                <th>Progres EPC</th>
                <th>Status Lapangan</th>
                <th>Target COD</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.code}>
                  <td>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                        {p.code}
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--sbx-text)' }}>{p.name}</div>
                      <span className="sbx-tag" style={{ marginTop: '2px' }}>{p.type}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '12.5px' }}>
                      {p.client}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>📍 {p.location}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--sbx-accent)' }}>
                      ⚡ {p.kwp}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>{p.panels}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text)' }}>{p.inverter}</span>
                  </td>
                  <td>
                    <div style={{ minWidth: '100px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '3px' }}>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="sbx-progress-bar-bg" style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          className="sbx-progress-bar-fill"
                          style={{
                            height: '100%',
                            width: `${p.progress}%`,
                            background: p.progress >= 100 ? '#10b981' : p.progress >= 70 ? 'var(--sbx-accent)' : '#f59e0b',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`sbx-status-badge ${p.statusColor || 'info'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>📅 {p.cod}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => setDetailProject(p)}
                      >
                        Detail &amp; Progres
                      </button>
                      <button
                        type="button"
                        className="sbx-row-action-btn"
                        onClick={() => handleEditProject(p)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--sbx-text-muted)' }}>
                    Tidak ada proyek yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add/Edit Project */}
      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setToast('✅ Data proyek berhasil disimpan ke database lokal!');
            setTimeout(() => setToast(''), 3000);
          }}
        />
      )}

      {/* MODAL 2: Detail Project & Progress Slider */}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          onEdit={handleEditProject}
        />
      )}
    </div>
  );
}
