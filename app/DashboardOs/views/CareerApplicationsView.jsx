'use client';

import { useState, useEffect, useCallback } from 'react';

const STATUS_LABELS = {
  received: { label: 'Berkas Masuk', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  reviewing: { label: 'Sedang Ditinjau', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  interview_scheduled: { label: 'Jadwal Interview', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  accepted: { label: 'Diterima / Lolos', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  rejected: { label: 'Tidak Lolos', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

function formatWaUrl(phone, name, position) {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  const msg = encodeURIComponent(`Halo ${name}, kami dari Tim HR SUNBLIX terkait lamaran kerja Anda untuk posisi ${position}.`);
  return `https://wa.me/${clean}?text=${msg}`;
}

export default function CareerApplicationsView({ onBackToDashboard }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const staffToken = typeof window !== 'undefined' ? localStorage.getItem('sunblix_staff_token') : null;
      const res = await fetch('/api/career', {
        headers: staffToken ? { Authorization: `Bearer ${staffToken}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      } else {
        setError(data.message || 'Gagal memuat data pelamar.');
      }
    } catch (err) {
      setError('Gagal menghubungi server untuk memuat pelamar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const staffToken = typeof window !== 'undefined' ? localStorage.getItem('sunblix_staff_token') : null;
      const res = await fetch('/api/career', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (selectedApplicant && selectedApplicant.id === id) {
          setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
        }
        setToast(`Status berhasil diubah menjadi: ${STATUS_LABELS[newStatus]?.label || newStatus}`);
        setTimeout(() => setToast(''), 3500);
      } else {
        alert(result.message || 'Gagal mengubah status pelamar.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat memperbarui status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const needle = search.toLowerCase();
    const matchSearch =
      (app.full_name || '').toLowerCase().includes(needle) ||
      (app.position || '').toLowerCase().includes(needle) ||
      (app.city || '').toLowerCase().includes(needle) ||
      (app.email || '').toLowerCase().includes(needle) ||
      (app.whatsapp || '').toLowerCase().includes(needle) ||
      (app.application_number || '').toLowerCase().includes(needle);

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    return true;
  });

  const totalCount = applications.length;
  const receivedCount = applications.filter((a) => a.status === 'received').length;
  const inProgressCount = applications.filter(
    (a) => a.status === 'reviewing' || a.status === 'interview_scheduled'
  ).length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;

  return (
    <div className="sbx-view-container">
      {/* Header */}
      <div className="sbx-view-header">
        <div>
          <div className="sbx-breadcrumb">
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: 'var(--sbx-accent)' }}>Rekrutmen &amp; Karir</span>
          </div>
          <h1 className="sbx-view-title">💼 Manajemen Rekrutmen &amp; Pelamar Kerja</h1>
          <p className="sbx-view-sub">
            Review berkas pelamar karir Sunblix, evaluasi kualifikasi solar PV engineer &amp; konsultan energi, serta kontak langsung via WhatsApp.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="sbx-filter-pill-btn" onClick={onBackToDashboard}>
            ← Kembali ke Dashboard
          </button>
          <button
            type="button"
            className="sbx-action-btn primary"
            onClick={fetchApplications}
            disabled={loading}
          >
            {loading ? 'Memuat...' : '🔄 Sinkronkan Data'}
          </button>
        </div>
      </div>

      {toast && <div className="sbx-toast-box">{toast}</div>}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="sbx-metrics-row">
        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Total Lamaran Masuk</span>
            <div className="sbx-metric-icon">📑</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{totalCount} Berkas</span>
            <span className="sbx-status-badge info">Semua Posisi</span>
          </div>
          <p className="sbx-metric-subtext">Akumulasi pelamar di database</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Berkas Baru Masuk</span>
            <div className="sbx-metric-icon">📥</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{receivedCount}</span>
            <span className="sbx-status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              Perlu Review
            </span>
          </div>
          <p className="sbx-metric-subtext">Menunggu proses kurasi tim HR</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Proses Review / Interview</span>
            <div className="sbx-metric-icon">🤝</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{inProgressCount}</span>
            <span className="sbx-status-badge purple">On Going</span>
          </div>
          <p className="sbx-metric-subtext">Tahap asesmen &amp; wawancara kerja</p>
        </div>

        <div className="sbx-metric-card">
          <div className="sbx-metric-header">
            <span className="sbx-metric-label">Lolos / Diterima</span>
            <div className="sbx-metric-icon">🎉</div>
          </div>
          <div className="sbx-metric-body">
            <span className="sbx-metric-val">{acceptedCount}</span>
            <span className="sbx-status-badge success">Hired</span>
          </div>
          <p className="sbx-metric-subtext">Kandidat bergabung dengan Sunblix</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="sbx-card" style={{ marginTop: '16px' }}>
        <div className="sbx-filter-bar">
          <div className="sbx-tab-pills">
            <button
              type="button"
              className={`sbx-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${statusFilter === 'received' ? 'active' : ''}`}
              onClick={() => setStatusFilter('received')}
            >
              Baru ({receivedCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${statusFilter === 'reviewing' ? 'active' : ''}`}
              onClick={() => setStatusFilter('reviewing')}
            >
              Reviewing ({applications.filter((a) => a.status === 'reviewing').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${statusFilter === 'interview_scheduled' ? 'active' : ''}`}
              onClick={() => setStatusFilter('interview_scheduled')}
            >
              Interview ({applications.filter((a) => a.status === 'interview_scheduled').length})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${statusFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('accepted')}
            >
              Diterima ({acceptedCount})
            </button>
            <button
              type="button"
              className={`sbx-tab-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              Ditolak ({applications.filter((a) => a.status === 'rejected').length})
            </button>
          </div>

          <div className="sbx-search-box" style={{ maxWidth: '300px' }}>
            <span className="sbx-search-icon">🔍</span>
            <input
              type="text"
              className="sbx-search-input"
              placeholder="Cari pelamar, posisi, kota, skill..."
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
                <th>Kandidat</th>
                <th>Posisi &amp; Domisili</th>
                <th>Pendidikan &amp; Pengalaman</th>
                <th>Gaji &amp; Ketersediaan</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi HR</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--sbx-text-muted)' }}>
                    Memuat data pelamar kerja dari database...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--sbx-text-muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                    <div style={{ fontWeight: 700, color: 'var(--sbx-text)', fontSize: '13.5px', marginBottom: '4px' }}>
                      Tidak Ada Data Pelamar yang Sesuai
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Belum ada lamaran kerja pada filter ini atau pencarian tidak menemukan hasil.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const st = STATUS_LABELS[app.status] || STATUS_LABELS.received;
                  const waUrl = formatWaUrl(app.whatsapp, app.full_name, app.position);

                  return (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--sbx-text)' }}>
                          {app.application_number}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)', marginTop: '2px' }}>
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--sbx-text)', fontSize: '13px' }}>
                          {app.full_name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                          📧 {app.email}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                          📱 {app.whatsapp}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--sbx-accent)', fontSize: '12.5px' }}>
                          {app.position}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                          📍 {app.city || 'Tidak dicantumkan'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--sbx-text)', fontWeight: 600 }}>
                          🎓 {app.education || '-'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--sbx-text-muted)' }}>
                          💼 {app.experience || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sbx-text)' }}>
                          Rp {app.expected_salary || '-'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>
                          ⏳ {app.availability || '-'}
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
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        >
                          <option value="received">📥 Berkas Masuk</option>
                          <option value="reviewing">🔍 Sedang Ditinjau</option>
                          <option value="interview_scheduled">📅 Jadwal Interview</option>
                          <option value="accepted">✅ Diterima / Lolos</option>
                          <option value="rejected">❌ Tidak Lolos</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="sbx-row-action-btn"
                            style={{ padding: '4px 8px', fontSize: '11.5px' }}
                            onClick={() => setSelectedApplicant(app)}
                          >
                            👁️ Detail
                          </button>
                          {app.portfolio_url && (
                            <a
                              href={app.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sbx-row-action-btn"
                              style={{ padding: '4px 8px', fontSize: '11.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                            >
                              📂 CV
                            </a>
                          )}
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sbx-row-action-btn"
                              style={{ padding: '4px 8px', fontSize: '11.5px', textDecoration: 'none', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.3)' }}
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

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="sbx-modal-backdrop" onClick={() => setSelectedApplicant(null)}>
          <div className="sbx-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sbx-modal-header">
              <div>
                <span className="sbx-tag" style={{ marginBottom: '6px' }}>{selectedApplicant.application_number}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--sbx-text)' }}>
                  {selectedApplicant.full_name}
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--sbx-accent)', fontWeight: 600 }}>
                  Posisi: {selectedApplicant.position}
                </p>
              </div>
              <button
                type="button"
                className="sbx-modal-close-btn"
                onClick={() => setSelectedApplicant(null)}
              >
                ✕
              </button>
            </div>

            <div className="sbx-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Profile Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: 'var(--sbx-surface-2)', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Nomor WhatsApp</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedApplicant.whatsapp}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Alamat Email</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedApplicant.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Kota Domisili</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedApplicant.city || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Ketersediaan Kerja</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedApplicant.availability || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Pendidikan Terakhir</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedApplicant.education || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Pengalaman Relevan</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-text)' }}>{selectedApplicant.experience || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Ekspektasi Gaji</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sbx-accent)' }}>Rp {selectedApplicant.expected_salary || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sbx-text-muted)' }}>Status Saat Ini</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: STATUS_LABELS[selectedApplicant.status]?.color }}>
                    {STATUS_LABELS[selectedApplicant.status]?.label || selectedApplicant.status}
                  </div>
                </div>
              </div>

              {/* Bio / Motivation */}
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--sbx-text)' }}>
                  📝 Biodata &amp; Pernyataan Diri (Cover Note)
                </h4>
                <div style={{ fontSize: '12.5px', lineHeight: '1.6', background: 'var(--sbx-surface-2)', padding: '12px 14px', borderRadius: '8px', color: 'var(--sbx-text)' }}>
                  {selectedApplicant.bio || 'Tidak ada deskripsi bio yang disertakan.'}
                </div>
              </div>

              {/* Skills */}
              {selectedApplicant.skills && (
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--sbx-text)' }}>
                    🛠️ Keahlian &amp; Kompetensi
                  </h4>
                  <div style={{ fontSize: '12.5px', lineHeight: '1.5', background: 'var(--sbx-surface-2)', padding: '12px 14px', borderRadius: '8px', color: 'var(--sbx-text)' }}>
                    {selectedApplicant.skills}
                  </div>
                </div>
              )}

              {/* CV / Portfolio Link */}
              {selectedApplicant.portfolio_url && (
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--sbx-text)' }}>
                    📎 Tautan Berkas / Portofolio / CV
                  </h4>
                  <a
                    href={selectedApplicant.portfolio_url}
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
                    📂 Buka Dokumen Portofolio / Google Drive →
                  </a>
                </div>
              )}
            </div>

            <div className="sbx-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sbx-text-muted)' }}>Ubah Status:</span>
                <select
                  className="sbx-filter-select"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  value={selectedApplicant.status}
                  onChange={(e) => handleUpdateStatus(selectedApplicant.id, e.target.value)}
                >
                  <option value="received">📥 Berkas Masuk</option>
                  <option value="reviewing">🔍 Sedang Ditinjau</option>
                  <option value="interview_scheduled">📅 Jadwal Interview</option>
                  <option value="accepted">✅ Diterima / Lolos</option>
                  <option value="rejected">❌ Tidak Lolos</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {formatWaUrl(selectedApplicant.whatsapp, selectedApplicant.full_name, selectedApplicant.position) && (
                  <a
                    href={formatWaUrl(selectedApplicant.whatsapp, selectedApplicant.full_name, selectedApplicant.position)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sbx-action-btn"
                    style={{ background: '#16a34a', color: '#fff', textDecoration: 'none' }}
                  >
                    💬 Kontak via WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  className="sbx-action-btn secondary"
                  onClick={() => setSelectedApplicant(null)}
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

