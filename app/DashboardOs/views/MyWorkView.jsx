'use client';

import { useState, useEffect } from 'react';
import { getStoreTasks, toggleStoreTask, deleteStoreTask, subscribeToStore } from '../../../lib/sunblixOsStore';
import TaskModal from '../components/TaskModal';

export default function MyWorkView({ onBackToDashboard }) {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const refresh = () => {
    setTasks(getStoreTasks());
  };

  useEffect(() => {
    refresh();
    const unsub = subscribeToStore(refresh);
    return () => unsub();
  }, []);

  const handleToggle = (id) => {
    toggleStoreTask(id);
    const updated = getStoreTasks().find((t) => t.id === id);
    if (updated?.status === 'completed') {
      setSuccessToast(`✅ Tugas ${id} berhasil ditandai selesai!`);
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleDelete = (id) => {
    if (confirm(`Hapus tugas ${id}?`)) {
      deleteStoreTask(id);
      setSuccessToast(`🗑️ Tugas ${id} telah dihapus.`);
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeTab === 'urgent') return t.priority === 'URGENT' && t.status !== 'completed';
    if (activeTab === 'approval') return t.category === 'Approval' && t.status !== 'completed';
    if (activeTab === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const urgentCount = tasks.filter((t) => t.priority === 'URGENT' && t.status !== 'completed').length;
  const approvalCount = tasks.filter((t) => t.category === 'Approval' && t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="sbx-view-container">
      {/* View Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>My Work</span>
          </div>
          <h1 className="sbx-view-title">📥 My Work &amp; Approval Inbox</h1>
          <p className="sbx-view-sub">
            Manajemen antrian tugas operasional, persetujuan direksi, dan aksi cepat tim teknis PLTS.
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
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            + Tambah Tugas Baru
          </button>
        </div>
      </div>

      {successToast && (
        <div className="sbx-toast-box">
          {successToast}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Tugas Pending</span>
            <div className="sbx-metric-icon">📥</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{pendingCount}</span>
            <span className="sbx-status-badge warning">Perlu Tindakan</span>
          </div>
          <p className="sbx-metric-subtext">Operasional harian &amp; engineering</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Prioritas Mendesak</span>
            <div className="sbx-metric-icon">🚨</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{urgentCount}</span>
            <span className="sbx-status-badge danger">Urgent</span>
          </div>
          <p className="sbx-metric-subtext">Perlu approval &amp; inspeksi site</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Menunggu Approval Direksi</span>
            <div className="sbx-metric-icon">📦</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{approvalCount}</span>
            <span className="sbx-status-badge purple">PO &amp; SPH</span>
          </div>
          <p className="sbx-metric-subtext">Persetujuan pengadaan material</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Tugas Selesai</span>
            <div className="sbx-metric-icon">✅</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{completedCount}</span>
            <span className="sbx-status-badge success">Verified</span>
          </div>
          <p className="sbx-metric-subtext">Terselesaikan minggu ini</p>
        </div>
      </div>

      {/* Tasks Content Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Semua ({tasks.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'urgent' ? 'active' : ''}`}
              onClick={() => setActiveTab('urgent')}
            >
              🚨 Prioritas Mendesak ({urgentCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'approval' ? 'active' : ''}`}
              onClick={() => setActiveTab('approval')}
            >
              📦 Butuh Approval ({approvalCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              ✅ Selesai ({completedCount})
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '280px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari tugas, proyek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Task List Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px' }}>
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: t.status === 'completed' ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--sbx-glass-border)',
                borderRadius: '10px',
                transition: 'all 0.15s ease',
                opacity: t.status === 'completed' ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => handleToggle(t.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: t.status === 'completed' ? '2px solid #10b981' : '2px solid var(--sbx-glass-border)',
                    background: t.status === 'completed' ? '#10b981' : 'transparent',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    flexShrink: 0,
                  }}
                  title={t.status === 'completed' ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                >
                  {t.status === 'completed' ? '✓' : ''}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px' }}>{t.icon || '📌'}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '13.5px',
                        color: 'var(--sbx-text)',
                        textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {t.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                    <span>ID: {t.id}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--sbx-accent)' }}>🏗️ {t.project}</span>
                    <span>•</span>
                    <span>👤 {t.assignee}</span>
                    <span>•</span>
                    <span>📅 {t.dueDate}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className={`sbx-status-badge ${
                    t.priority === 'URGENT'
                      ? 'danger'
                      : t.priority === 'HIGH'
                      ? 'warning'
                      : t.priority === 'LOW'
                      ? 'info'
                      : 'purple'
                  }`}
                >
                  {t.priority}
                </span>

                <button
                  type="button"
                  className="sbx-row-action-btn"
                  onClick={() => {
                    setEditingTask(t);
                    setIsModalOpen(true);
                  }}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="sbx-row-action-btn"
                  style={{ color: '#f43f5e' }}
                  onClick={() => handleDelete(t.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--sbx-text-muted)' }}>
              Tidak ada tugas di kategori ini. Kerja bagus! ✨
            </div>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Task */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setSuccessToast('✅ Tugas berhasil disimpan!');
            setTimeout(() => setSuccessToast(''), 3000);
          }}
        />
      )}
    </div>
  );
}
