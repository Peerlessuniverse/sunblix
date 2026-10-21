'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SurtiIntelligenceView({ onBackToDashboard, currentUser }) {
  const [activeTab, setActiveTab] = useState('sph'); // 'sph' | 'leads' | 'surveys' | 'tickets'
  const [sphs, setSphs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sphRes, crmRes] = await Promise.all([
        fetch('/api/surti/sph'),
        fetch('/api/surti/crm'),
      ]);

      const sphData = await sphRes.json();
      const crmData = await crmRes.json();

      if (sphData.success) setSphs(sphData.sphs || []);
      if (crmData.success) {
        setLeads(crmData.leads || []);
        setSurveys(crmData.surveys || []);
        setTickets(crmData.tickets || []);
      }
    } catch (e) {
      console.error('Error fetching SURTI data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format IDR currency
  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  // Executive Approval Workflow
  const handleApproveSph = async (sphId) => {
    const reviewerName = prompt(
      'Nama Eksekutif / Approver SUNBLIX:',
      currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Director / CEO'})` : 'Pak Danny (Director / CEO)'
    );
    if (!reviewerName) return;

    try {
      const res = await fetch('/api/surti/sph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          sphId,
          reviewerName,
          comments: 'Konfigurasi teknis PV, proteksi kelistrikan, dan komersial disetujui sesuai standar SUNBLIX.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback(`✅ SPH ${sphId} telah DISETUJUI oleh ${reviewerName}.`);
        loadData();
      } else {
        alert(data.error || 'Gagal menyetujui SPH');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  // Executive Issuance Workflow
  const handleIssueSph = async (sphId) => {
    if (!confirm('Apakah Anda yakin ingin menerbitkan Surat Penawaran Harga resmi ini ke status ISSUED?')) return;

    try {
      const res = await fetch('/api/surti/sph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue',
          sphId,
          issuerName: currentUser?.name || 'Danny (Director / CEO)',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback(`🎉 SPH ${sphId} resmi DITERBITKAN (ISSUED) kepada klien.`);
        loadData();
      } else {
        alert(data.error || 'Gagal menerbitkan SPH');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  // Survey status update
  const handleUpdateSurvey = async (surveyId, newStatus) => {
    try {
      const res = await fetch('/api/surti/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_survey',
          surveyId,
          status: newStatus,
          assignedEngineer: 'Tim Engineering Wilayah',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(`Jadwal survei ${surveyId} diperbarui ke status: ${newStatus}`);
        loadData();
      }
    } catch (err) {
      console.warn('Update survey err:', err);
    }
  };

  // Clear all SURTI data workflow
  const handleClearAllData = async () => {
    if (!confirm('Yakin ingin menghapus semua dummy data (SPH, Prospek, Survei, Tiket)?')) return;
    setLoading(true);
    try {
      await Promise.all([
        fetch('/api/surti/sph', { method: 'DELETE' }),
        fetch('/api/surti/crm', { method: 'DELETE' }),
      ]);
      setActionFeedback('🗑️ Semua data laporan SURTI berhasil dikosongkan!');
      await loadData();
    } catch (err) {
      alert('Gagal mengosongkan data');
    } finally {
      setLoading(false);
    }
  };

  // Summary Metrics (case-insensitive status check)
  const pendingCount = sphs.filter((s) => {
    const st = (s.status || '').toUpperCase();
    return st === 'DRAFT' || st === 'PENDING_REVIEW';
  }).length;
  const approvedCount = sphs.filter((s) => (s.status || '').toUpperCase() === 'APPROVED').length;
  const issuedCount = sphs.filter((s) => (s.status || '').toUpperCase() === 'ISSUED').length;
  const totalPipeline = sphs.reduce((acc, curr) => acc + (Number(curr.commercial?.totalInclPpn) || 0), 0);

  return (
    <div className="sbx-view-container" style={{ padding: '24px 32px' }}>
      {/* View Header with Breadcrumb */}
      <div className="sbx-view-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="sbx-breadcrumb" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
            <span onClick={onBackToDashboard} style={{ cursor: 'pointer', color: '#0284c7' }}>Dashboard</span>
            <span> / </span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>SURTI Intelligence &amp; SPH Approvals</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/asset/surti_logo.png"
              alt="SURTI AI"
              style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 4px 14px rgba(0, 59, 122, 0.2)' }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                SURTI Intelligence Hub — Transaksi &amp; Persetujuan SPH Eksekutif
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b' }}>
                Ruang kendali terpadu: Pelanggan berkonsultasi langsung di web, SURTI mencatat database prospek, dan otomatis menyusun draf SPH untuk persetujuan Direksi.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleClearAllData}
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            🗑️ Kosongkan Data
          </button>
          <button
            type="button"
            onClick={loadData}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            🔄 Refresh Data
          </button>
          <Link
            href="/surti"
            target="_blank"
            style={{
              background: '#0284c7',
              border: '1px solid #0284c7',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            }}
          >
            💬 Buka Live Chat SURTI ↗
          </Link>
        </div>
      </div>


      {/* Action Notification Banner */}
      {actionFeedback && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
          }}
        >
          <span>{actionFeedback}</span>
          <button
            type="button"
            onClick={() => setActionFeedback('')}
            style={{ background: 'transparent', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Executive Metric Stat Cards (Bright & Sunny White Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1.5px solid rgba(245, 158, 11, 0.45)', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Menunggu Review Direksi
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '6px 0 2px 0' }}>
            {pendingCount} Draf
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 500 }}>Perlu validasi teknis &amp; persetujuan</div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid rgba(56, 189, 248, 0.5)', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Disetujui Eksekutif
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', margin: '6px 0 2px 0' }}>
            {approvedCount} SPH
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 500 }}>Siap diterbitkan resmi ke pelanggan</div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid rgba(16, 185, 129, 0.5)', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            SPH Resmi Diterbitkan (Issued)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '6px 0 2px 0' }}>
            {issuedCount} SPH
          </div>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 500 }}>Tervalidasi &amp; legal untuk transaksi</div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Total Pipeline Nilai Transaksi
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatRupiah(totalPipeline)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Akumulasi penawaran otomatis SURTI</div>
        </div>
      </div>

      {/* Tabs Selector (Clean Bright Design) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('sph')}
          style={{
            background: activeTab === 'sph' ? '#0284c7' : '#ffffff',
            border: activeTab === 'sph' ? 'none' : '1px solid #e2e8f0',
            color: activeTab === 'sph' ? '#fff' : '#475569',
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'sph' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <span>📑</span>
          <span>Antrean Persetujuan SPH ({sphs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          style={{
            background: activeTab === 'leads' ? '#0284c7' : '#ffffff',
            border: activeTab === 'leads' ? 'none' : '1px solid #e2e8f0',
            color: activeTab === 'leads' ? '#fff' : '#475569',
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'leads' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <span>👥</span>
          <span>Database Prospek Pelanggan ({leads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('surveys')}
          style={{
            background: activeTab === 'surveys' ? '#0284c7' : '#ffffff',
            border: activeTab === 'surveys' ? 'none' : '1px solid #e2e8f0',
            color: activeTab === 'surveys' ? '#fff' : '#475569',
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'surveys' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <span>📍</span>
          <span>Permintaan Survei Atap ({surveys.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          style={{
            background: activeTab === 'tickets' ? '#0284c7' : '#ffffff',
            border: activeTab === 'tickets' ? 'none' : '1px solid #e2e8f0',
            color: activeTab === 'tickets' ? '#fff' : '#475569',
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'tickets' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <span>🎫</span>
          <span>Tiket Layanan ({tickets.length})</span>
        </button>
      </div>

      {/* Tab 1: SPH Approvals Queue (Bright Box Container) */}
      {activeTab === 'sph' && (
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
                Antrean Surat Penawaran Harga (SPH) Otomatis SURTI
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Setiap SPH dirumuskan secara deterministik oleh SURTI dari percakapan pelanggan. Persetujuan eksekutif wajib sebelum diterbitkan resmi.
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              Aturan K3 &amp; Persetujuan Eksekutif Aktif
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat data SPH...</div>
          ) : sphs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Belum ada draf SPH tersimpan dari interaksi SURTI.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 18px' }}>Nomor Dokumen</th>
                    <th style={{ padding: '14px 18px' }}>Klien / Pelanggan</th>
                    <th style={{ padding: '14px 18px' }}>Kapasitas (kWp)</th>
                    <th style={{ padding: '14px 18px' }}>Spesifikasi Utama</th>
                    <th style={{ padding: '14px 18px' }}>Total Investasi</th>
                    <th style={{ padding: '14px 18px' }}>Status Validasi</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Aksi Eksekutif</th>
                  </tr>
                </thead>
                <tbody>
                  {sphs.map((sph) => (
                    <tr
                      key={sph.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                        <div>{sph.sphNumber}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {new Date(sph.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{sph.customerName || 'Klien Konsultasi SURTI'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{sph.customerLocation || 'Jabodetabek'}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: 700, color: '#d97706' }}>{sph.technicalSpecs?.kwp} kWp</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {sph.technicalSpecs?.panelCount}x {sph.technicalSpecs?.panelType}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155', fontSize: '0.8rem' }}>
                        <div>Inverter: {sph.technicalSpecs?.inverter}</div>
                        <div style={{ color: '#059669', fontWeight: 600 }}>Estimasi Hemat: {formatRupiah(sph.technicalSpecs?.monthlySavings)}/bln</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{formatRupiah(sph.commercial?.totalInclPpn)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Termin: 50% / 40% / 10%</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {(sph.status || '').toUpperCase() === 'ISSUED' && (
                          <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                            ● RESMI TERBIT (ISSUED)
                          </span>
                        )}
                        {(sph.status || '').toUpperCase() === 'APPROVED' && (
                          <span style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                            ● DISETUJUI EKSEKUTIF
                          </span>
                        )}
                        {((sph.status || '').toUpperCase() === 'DRAFT' || (sph.status || '').toUpperCase() === 'PENDING_REVIEW') && (
                          <span style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                            ● PERLU REVIEW
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <Link
                            href={sph.brosurUrl || `/brosur?sphId=${sph.id}&source=surti`}
                            target="_blank"
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#0284c7',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>📄</span>
                            <span>Buka SPH Brosur ↗</span>
                          </Link>

                          {((sph.status || '').toUpperCase() === 'DRAFT' || (sph.status || '').toUpperCase() === 'PENDING_REVIEW') && (
                            <button
                              type="button"
                              onClick={() => handleApproveSph(sph.id)}
                              style={{
                                background: '#0284c7',
                                border: '1px solid #0284c7',
                                color: '#fff',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 1px 4px rgba(2, 132, 199, 0.2)',
                              }}
                            >
                              ✓ Setujui (Approve)
                            </button>
                          )}

                          {(sph.status || '').toUpperCase() === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleIssueSph(sph.id)}
                              style={{
                                background: '#059669',
                                border: '1px solid #059669',
                                color: '#fff',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 1px 4px rgba(5, 150, 105, 0.2)',
                              }}
                            >
                              🚀 Terbitkan Resmi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Leads Database (Bright Box Container) */}
      {activeTab === 'leads' && (
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
              Database Prospek &amp; Catatan Interaksi Pelanggan SURTI
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Seluruh preferensi dan data yang disampaikan pelanggan di ruang obrolan SURTI otomatis terekam ke database CRM ini.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 18px' }}>ID &amp; Pelanggan</th>
                  <th style={{ padding: '14px 18px' }}>Tipe Properti</th>
                  <th style={{ padding: '14px 18px' }}>Tagihan Listrik</th>
                  <th style={{ padding: '14px 18px' }}>Sistem Rekomendasi</th>
                  <th style={{ padding: '14px 18px' }}>Wilayah</th>
                  <th style={{ padding: '14px 18px' }}>Tahap Prospek</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      Belum ada database prospek pelanggan tersimpan. Silakan lakukan tes pencarian leads melalui konsultasi SURTI atau kalkulator web.
                    </td>
                  </tr>
                ) : (
                  leads.map((ld) => (
                    <tr key={ld.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{ld.name || ld.id}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Sumber: SURTI AI Chat</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155' }}>{ld.propertyType || 'Residensial'}</td>
                      <td style={{ padding: '14px 18px', color: '#d97706', fontWeight: 600 }}>
                        {ld.monthlyBill ? formatRupiah(ld.monthlyBill) : 'Rp 3.500.000'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#0284c7', fontWeight: 600 }}>{ld.preferredSystemType || 'Hybrid Solar'}</td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>{ld.location || 'Jabodetabek'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700 }}>
                          {ld.stage || 'NEW_LEAD'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Surveys (Bright Box Container) */}
      {activeTab === 'surveys' && (
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
              Permintaan Survei Lokasi &amp; Atap Lapangan
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Permintaan survei fisik yang dijadwalkan secara mandiri oleh pelanggan saat berdialog dengan SURTI.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 18px' }}>ID Survei</th>
                  <th style={{ padding: '14px 18px' }}>Pelanggan</th>
                  <th style={{ padding: '14px 18px' }}>Tanggal Rencana</th>
                  <th style={{ padding: '14px 18px' }}>Alamat Lokasi</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {surveys.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      Belum ada jadwal survei atap yang diajukan oleh pelanggan.
                    </td>
                  </tr>
                ) : (
                  surveys.map((sv) => (
                    <tr key={sv.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>{sv.id}</td>
                      <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 600 }}>{sv.customerName || 'Klien SURTI'}</td>
                      <td style={{ padding: '14px 18px', color: '#0284c7', fontWeight: 600 }}>{sv.scheduledDate || 'Belum dijadwalkan'}</td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>{sv.address || 'DKI Jakarta'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: sv.status === 'COMPLETED' ? '#ecfdf5' : '#fffbeb', border: `1px solid ${sv.status === 'COMPLETED' ? '#a7f3d0' : '#fde68a'}`, color: sv.status === 'COMPLETED' ? '#047857' : '#b45309', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {sv.status || 'SCHEDULED'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateSurvey(sv.id, 'COMPLETED')}
                          style={{ background: '#0284c7', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px rgba(2, 132, 199, 0.2)' }}
                        >
                          Selesai Survei
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Tab 4: Tickets (Bright Box Container) */}
      {activeTab === 'tickets' && (
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
              Tiket Layanan &amp; Eskalasi Konsultasi Teknis
            </h3>
          </div>
          <div style={{ padding: '24px', color: '#64748b', fontSize: '0.88rem' }}>
            {tickets.length === 0 ? (
              <p>Tidak ada tiket keluhan atau eskalasi teknis aktif. Seluruh pertanyaan umum terselesaikan otomatis oleh SURTI AI.</p>
            ) : (
              tickets.map((t) => (
                <div key={t.id} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.subject || 'Konsultasi Teknis'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>{t.description}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
