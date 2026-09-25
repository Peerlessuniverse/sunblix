'use client';

import { useState } from 'react';

export default function QuoteModal({ isOpen, onClose, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    city: '',
    plnPower: '2.200 VA',
    monthlyBill: initialData?.bill ? `Rp ${Number(initialData.bill).toLocaleString('id-ID')}` : 'Rp 2.500.000',
    propertyType: initialData?.property || 'Rumah Tinggal',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          systemRecommendation: initialData?.sysName || 'SUNBLIX Residential',
          timestamp: new Date().toISOString(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengirim formulir.');
      }

      setSubmittedData(json);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi gangguan koneksi. Silakan hubungi kami via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleWaDirect = () => {
    const quoteCode = submittedData?.quoteId || 'SBX-INQUIRY';
    const waText = `Halo Tim Ahli SUNBLIX, saya telah mengisi formulir penawaran resmi di website dengan No. Ref: *${quoteCode}*.\n\n*Nama:* ${formData.name}\n*Lokasi:* ${formData.city}\n*Daya PLN:* ${formData.plnPower}\n*Tagihan Listrik:* ${formData.monthlyBill}\n*Paket Terpilih:* ${initialData?.sysName || 'Solar Rooftop'}\n\nMohon info ketersediaan jadwal survei lokasi dan estimasi proposalnya.`;
    const url = `https://wa.me/6281112345678?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank');
  };

  const handlePrintPDF = () => {
    const quoteCode = submittedData?.quoteId || 'SBX-Q2026-CONFIRMED';
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izinkan pop-up browser untuk mengunduh / mencetak berkas PDF penawaran resmi.');
      return;
    }

    const sysName = initialData?.sysName || 'SUNBLIX Residential Premium';
    const powerKwp = initialData?.powerKwp ? initialData.powerKwp + ' kWp' : 'Custom kWp';
    const panels = initialData?.panels ? initialData.panels + ' Unit Modul' : 'Tier-1 High Efficiency';
    const areaM2 = initialData?.areaM2 ? initialData.areaM2 + ' m²' : '30-50 m²';
    const inverterKw = initialData?.inverterKw ? initialData.inverterKw + ' kW' : 'Smart Inverter';
    const monthlySavings = initialData?.monthlySavings ? 'Rp ' + Number(initialData.monthlySavings).toLocaleString('id-ID') : 'Rp 2.000.000';
    const savings25y = initialData?.savings25y || 'Rp 1,2 Milyar';
    const co2Kg = initialData?.co2Kg ? Number(initialData.co2Kg).toLocaleString('id-ID') : '450';
    const notesBlock = formData.notes ? `
      <div class="section-title" style="margin-top: 14px;">4. Catatan Kebutuhan Khusus</div>
      <div style="font-size: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 12px; color: #92400e;">
        ${formData.notes}
      </div>
    ` : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Penawaran Resmi SUNBLIX - ${quoteCode}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #087be8;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #041c3e;
      margin: 0;
    }
    .brand-tag {
      font-size: 11px;
      font-weight: 700;
      color: #087be8;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .brand-address {
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
      line-height: 1.4;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-title {
      font-size: 16px;
      font-weight: 800;
      color: #041c3e;
      margin: 0 0 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ref-badge {
      display: inline-block;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      color: #0284c7;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
    }
    .date {
      font-size: 12px;
      color: #64748b;
      margin-top: 6px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #041c3e;
      border-left: 4px solid #087be8;
      padding-left: 8px;
      margin: 18px 0 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
    }
    .info-item {
      font-size: 12px;
    }
    .info-label {
      color: #64748b;
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .info-val {
      font-weight: 700;
      color: #0f172a;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th {
      background: #041c3e;
      color: #ffffff;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 12px;
      text-align: left;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .highlight-box {
      margin-top: 16px;
      background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .highlight-label {
      font-size: 12px;
      font-weight: 700;
      color: #166534;
      text-transform: uppercase;
    }
    .highlight-val {
      font-size: 20px;
      font-weight: 900;
      color: #15803d;
    }
    .highlight-sub {
      font-size: 11px;
      color: #0369a1;
      font-weight: 600;
    }
    .guarantees {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .guarantee-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      background: #fafafa;
    }
    .guarantee-val {
      font-size: 14px;
      font-weight: 800;
      color: #087be8;
      display: block;
    }
    .guarantee-desc {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .signature {
      text-align: right;
    }
    .signature-space {
      height: 45px;
    }
    .signature-name {
      font-weight: 800;
      color: #041c3e;
      text-decoration: underline;
    }
    .signature-title {
      font-size: 10px;
      color: #64748b;
    }
    .print-bar {
      margin-bottom: 20px;
      padding: 12px;
      background: #041c3e;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8px;
    }
    .btn-print {
      background: #16dbe0;
      color: #041c3e;
      font-weight: 800;
      padding: 8px 18px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    @media print {
      .print-bar { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>📄 <strong>Dokumen Estimasi Penawaran Resmi SUNBLIX</strong> siap dicetak / disimpan sebagai PDF.</span>
    <button class="btn-print" onclick="window.print()">Simpan / Cetak PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 class="brand-title">SUNBLIX</h1>
      <div class="brand-tag">PT SUNBLIX ENERGI INDONESIA</div>
      <div class="brand-address">
        Architectural Solar Engineering & Smart Rooftop Solutions<br>
        Web: sunblix.com | WhatsApp: +62 811-1234-5678 | Email: inquiry@sunblix.com
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">Estimasi Penawaran Resmi</div>
      <div class="ref-badge">${quoteCode}</div>
      <div class="date">Tanggal: ${dateStr}</div>
    </div>
  </div>

  <div class="section-title">1. Data Pemohon & Lokasi Instalasi</div>
  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">Nama Pemohon</span>
      <span class="info-val">${formData.name || '-'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Kota / Lokasi Proyek</span>
      <span class="info-val">${formData.city || '-'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Kontak WhatsApp / Telp</span>
      <span class="info-val">${formData.whatsapp || '-'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Alamat Email</span>
      <span class="info-val">${formData.email || '-'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Daya Listrik Terpasang (PLN)</span>
      <span class="info-val">${formData.plnPower || '-'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Estimasi Tagihan Listrik PLN</span>
      <span class="info-val">${formData.monthlyBill || '-'}</span>
    </div>
  </div>

  <div class="section-title">2. Rekomendasi Konfigurasi Sistem PLTS Siap Pakai</div>
  <table>
    <thead>
      <tr>
        <th>Komponen / Parameter</th>
        <th>Spesifikasi Teknis</th>
        <th>Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Paket Solusi Terpilih</strong></td>
        <td><strong>${sysName}</strong></td>
        <td>Paket Siap Pakai (All-in engineering & instalasi)</td>
      </tr>
      <tr>
        <td><strong>Kapasitas Daya Sistem</strong></td>
        <td><strong>${powerKwp}</strong></td>
        <td>Optimal untuk menyerap beban konsumsi siang hari</td>
      </tr>
      <tr>
        <td><strong>Modul Surya (PV Panels)</strong></td>
        <td>${panels}</td>
        <td>Monocrystalline N-Type Half-Cell High Output</td>
      </tr>
      <tr>
        <td><strong>Kebutuhan Luas Atap</strong></td>
        <td>~${areaM2}</td>
        <td>Struktur aluminium anodized anti-korosi SNI</td>
      </tr>
      <tr>
        <td><strong>Smart Solar Inverter</strong></td>
        <td>${inverterKw} On-Grid / Hybrid</td>
        <td>Efisiensi 98.6% + Dual MPPT + Proteksi Petir</td>
      </tr>
      <tr>
        <td><strong>Aplikasi Monitoring</strong></td>
        <td>SUNBLIX IoT Cloud Live Mobile App</td>
        <td>Pantau produksi daya & performa real-time 24/7</td>
      </tr>
    </tbody>
  </table>

  <div class="highlight-box">
    <div>
      <div class="highlight-label">Potensi Penghematan Listrik</div>
      <div class="highlight-val">~${monthlySavings} / Bulan</div>
      <div class="highlight-sub">Estimasi Akumulasi 25 Tahun: ~${savings25y}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Dampak Lingkungan</div>
      <div style="font-size: 15px; font-weight: 800; color: #15803d;">-${co2Kg} kg CO₂/bln</div>
      <div style="font-size: 10px; color: #64748b;">Setara menanam puluhan pohon per tahun</div>
    </div>
  </div>

  <div class="section-title">3. Jaminan & Garansi Resmi Siap Pakai</div>
  <div class="guarantees">
    <div class="guarantee-card">
      <span class="guarantee-val">25 Tahun</span>
      <span class="guarantee-desc">Garansi Performa Output Modul Surya</span>
    </div>
    <div class="guarantee-card">
      <span class="guarantee-val">5 - 10 Tahun</span>
      <span class="guarantee-desc">Garansi Resmi Inverter & Komponen</span>
    </div>
    <div class="guarantee-card">
      <span class="guarantee-val">Full Support</span>
      <span class="guarantee-desc">Gratis Maintenance & Sertifikasi SLO/PLN</span>
    </div>
  </div>

  ${notesBlock}

  <div class="footer">
    <div>
      <em>* Dokumen ini merupakan estimasi awal berbasis data kalkulator surya SUNBLIX.<br>Proposal final dan layout CAD resmi akan diterbitkan setelah survei teknis lokasi.</em>
    </div>
    <div class="signature">
      <div class="signature-space"></div>
      <div class="signature-name">Tim Engineering SUNBLIX</div>
      <div class="signature-title">PT SUNBLIX ENERGI INDONESIA</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div
      className="quote-modal-backdrop"
      onClick={(e) => {
        if (e.target.classList.contains('quote-modal-backdrop')) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(3, 28, 63, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        className="quote-modal-card"
        style={{
          background: '#041c3e',
          border: '1px solid rgba(22, 219, 224, 0.3)',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          padding: '32px 28px',
          color: '#fff',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(8, 123, 232, 0.2)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {!submittedData ? (
          <>
            <div style={{ marginBottom: '22px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  color: '#16dbe0',
                  textTransform: 'uppercase',
                }}
              >
                PT SUNBLIX ENERGI INDONESIA
              </span>
              <h3
                style={{
                  margin: '6px 0 8px',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#fff',
                  fontFamily: 'inherit',
                }}
              >
                Permintaan Penawaran Resmi (PDF)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                Dapatkan estimasi teknis, analisis ROI, dan proposal resmi Siap Pakai langsung ke email dan WhatsApp Anda.
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: 'rgba(255, 60, 60, 0.15)',
                  border: '1px solid rgba(255, 60, 60, 0.4)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#ff9090',
                  marginBottom: '16px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label
                  style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#cfe4fc' }}
                >
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Haris Setiawan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#cfe4fc',
                    }}
                  >
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#cfe4fc',
                    }}
                  >
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@anda.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#cfe4fc',
                    }}
                  >
                    Kota / Kabupaten *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta Selatan"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#cfe4fc',
                    }}
                  >
                    Daya Listrik PLN
                  </label>
                  <select
                    value={formData.plnPower}
                    onChange={(e) => setFormData({ ...formData, plnPower: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: '#09254c',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="1.300 VA">1.300 VA</option>
                    <option value="2.200 VA">2.200 VA</option>
                    <option value="3.500 - 5.500 VA">3.500 – 5.500 VA</option>
                    <option value="6.600 - 11.000 VA">6.600 – 11.000 VA</option>
                    <option value="> 11.000 VA (3-Phase)">Di atas 11.000 VA (3 Phase)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#cfe4fc' }}
                >
                  Catatan Kebutuhan / Tipe Atap (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Atap genteng bitumen, ingin konsultasi opsi baterai cadangan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '10px',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  background: loading
                    ? '#666'
                    : 'linear-gradient(135deg, #087be8 0%, #16dbe0 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 25px rgba(8, 123, 232, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease',
                }}
              >
                {loading ? 'Sedang Memproses...' : 'Kirim Permintaan Penawaran Resmi →'}
              </button>

              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  textAlign: 'center',
                  marginTop: '4px',
                }}
              >
                🛡️ Privasi data Anda terjamin. Tim engineer SUNBLIX akan menghubungi dalam 1x24 jam.
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(67, 217, 90, 0.15)',
                border: '2px solid #43d95a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '16px',
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>
              Permintaan Penawaran Berhasil!
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Terima kasih Bpk/Ibu <strong>{formData.name}</strong>. Tim spesialis teknis SUNBLIX sedang menyusun
              rincian proposal teknis untuk lokasi <strong>{formData.city}</strong>.
            </p>

            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px dashed rgba(22, 219, 224, 0.4)',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '11px', color: '#cfe4fc', display: 'block', marginBottom: '4px' }}>
                NOMOR REFERENSI PENAWARAN:
              </span>
              <strong style={{ fontSize: '18px', color: '#16dbe0', letterSpacing: '1px' }}>
                {submittedData.quoteId || 'SBX-2026-CONFIRMED'}
              </strong>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <button
                type="button"
                onClick={handlePrintPDF}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #087be8 0%, #16dbe0 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(8, 123, 232, 0.35)',
                }}
              >
                <span>📥 Unduh / Simpan Penawaran Resmi (PDF)</span>
              </button>
              <button
                type="button"
                onClick={handleWaDirect}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>💬 Lanjut Hubungi via WhatsApp (Respon Cepat)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
