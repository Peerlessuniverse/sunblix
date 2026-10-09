'use client';

import { useState } from 'react';

const INITIAL_TASKS = [
  {
    id: 'TSK-101',
    title: 'Review Single Line Diagram (SLD) 12.87 kWp Villa Jimbaran',
    category: 'Engineering',
    priority: 'HIGH',
    assignee: 'Tim EPC Engineer & Agent Solaria',
    dueDate: 'Hari ini, 14:00',
    status: 'pending',
    project: 'Villa Jimbaran Luxury',
    icon: '⚡',
  },
  {
    id: 'TSK-102',
    title: 'Approval Purchase Order 64x Modul Surya LONGI 585 Wp N-Type TOPCon',
    category: 'Approval',
    priority: 'URGENT',
    assignee: 'Danny (Director / CEO)',
    dueDate: 'Hari ini, 16:30',
    status: 'pending',
    project: 'Warehouse Logistik Benoa',
    icon: '📦',
  },
  {
    id: 'TSK-103',
    title: 'Verifikasi Laporan Shading Matrix 3D Atap Kompleks Canggu',
    category: 'Engineering',
    priority: 'MEDIUM',
    assignee: 'Agent Solaria',
    dueDate: 'Besok, 10:00',
    status: 'pending',
    project: 'Canggu Eco Resort',
    icon: '☀️',
  },
  {
    id: 'TSK-104',
    title: 'Kirim SPH Revisi Paket 3-Phase 16.38 kWp Hotel Seminyak',
    category: 'Sales',
    priority: 'HIGH',
    assignee: 'Sales Team & Agent Omni',
    dueDate: 'Hari ini, 17:00',
    status: 'pending',
    project: 'Boutique Hotel Seminyak',
    icon: '📑',
  },
  {
    id: 'TSK-105',
    title: 'Investigasi Peringatan Suhu Inverter Deye Hybrid Site Ubud (>58°C)',
    category: 'IoT Monitoring',
    priority: 'URGENT',
    assignee: 'Agent Volt & Teknisi Lapangan',
    dueDate: 'Hari ini, 12:00',
    status: 'pending',
    project: 'Ubud Yoga Retreat',
    icon: '🛡️',
  },
  {
    id: 'TSK-106',
    title: 'Checklist K3 & Pengujian Tahanan Isolasi Megger 1000V Site Tabanan',
    category: 'Quality Control',
    priority: 'MEDIUM',
    assignee: 'Field Supervisor',
    dueDate: 'Besok, 11:30',
    status: 'pending',
    project: 'Agro Tabanan Farm',
    icon: '🔧',
  },
  {
    id: 'TSK-107',
    title: 'Rekonsiliasi Faktur Pembayaran Termin 1 (DP 30%) PT Surya Bali',
    category: 'Finance',
    priority: 'LOW',
    assignee: 'Finance Admin',
    dueDate: '7 Okt 2026',
    status: 'pending',
    project: 'PT Surya Bali Logistik',
    icon: '💵',
  },
  {
    id: 'TSK-108',
    title: 'Briefing Pelaksanaan Commissioning Test Proyek Sanur 8.19 kWp',
    category: 'Operations',
    priority: 'MEDIUM',
    assignee: 'All Leads',
    dueDate: '8 Okt 2026',
    status: 'pending',
    project: 'Villa Sanur Beachfront',
    icon: '🎯',
  },
];

export default function MyWorkView({ onBackToDashboard }) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          if (nextStatus === 'completed') {
            setSuccessToast(`✅ Tugas ${t.id} berhasil ditandai selesai!`);
            setTimeout(() => setSuccessToast(''), 3000);
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
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
              setSuccessToast('⚡ Semua tugas pending telah disinkronkan dengan AI Fleet!');
              setTimeout(() => setSuccessToast(''), 3000);
            }}
          >
            ⚡ Auto-Sync AI Fleet
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
            <span className="sbx-metric-label">Tugas Aktif</span>
            <div className="sbx-metric-icon">📥</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{pendingCount}</span>
            <span className="sbx-status-badge warning">Pending</span>
          </div>
          <p className="sbx-metric-subtext">Membutuhkan tindakan hari ini</p>
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
          <p className="sbx-metric-subtext">Persetujuan PO &amp; telemetry warning</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Tugas Diselesaikan</span>
            <div className="sbx-metric-icon">✅</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{completedCount}</span>
            <span className="sbx-status-badge success">Selesai</span>
          </div>
          <p className="sbx-metric-subtext">Produktivitas sprint mingguan</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Bantuan AI Agent</span>
            <div className="sbx-metric-icon">🤖</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">4</span>
            <span className="sbx-status-badge info">Active Fleet</span>
          </div>
          <p className="sbx-metric-subtext">Solaria, Volt, Helios &amp; Omni</p>
        </div>
      </div>

      {/* Main Task List Table / Filter Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Semua Tugas ({tasks.length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'urgent' ? 'active' : ''}`}
              onClick={() => setActiveTab('urgent')}
            >
              🔥 Mendesak ({urgentCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'approval' ? 'active' : ''}`}
              onClick={() => setActiveTab('approval')}
            >
              ✍️ Butuh Approval (1)
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              ✔️ Sudah Selesai ({completedCount})
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

        {/* Tasks Table */}
        <div className="sbx-table-wrap">
          <table className="sbx-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Status</th>
                <th>Kode &amp; Judul Tugas</th>
                <th>Kategori</th>
                <th>Proyek Terkait</th>
                <th>Penanggung Jawab</th>
                <th>Tenggat Waktu</th>
                <th>Prioritas</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--sbx-text-muted)' }}>
                    Tidak ada tugas yang sesuai filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isDone = t.status === 'completed';
                  return (
                    <tr key={t.id} className={isDone ? 'sbx-row-done' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleTask(t.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#10b981' }}
                          title="Tandai selesai"
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{t.icon}</span>
                          <div>
                            <span style={{ fontSize: '11px', color: 'var(--sbx-text-dim)', fontWeight: 700 }}>
                              {t.id}
                            </span>
                            <div
                              style={{
                                fontWeight: 700,
                                color: isDone ? 'var(--sbx-text-dim)' : 'var(--sbx-text)',
                                textDecoration: isDone ? 'line-through' : 'none',
                              }}
                            >
                              {t.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="sbx-tag">{t.category}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--sbx-text)' }}>{t.project}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--sbx-text-muted)' }}>{t.assignee}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: t.dueDate.includes('Hari ini') ? '#f59e0b' : 'var(--sbx-text)' }}>
                          {t.dueDate}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`sbx-status-badge ${
                            t.priority === 'URGENT' ? 'danger' : t.priority === 'HIGH' ? 'warning' : 'info'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="sbx-row-action-btn"
                          onClick={() => toggleTask(t.id)}
                        >
                          {isDone ? 'Undo' : 'Selesai'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
