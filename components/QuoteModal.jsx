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
    const url = `https://wa.me/6285288581027?text=${encodeURIComponent(waText)}`;
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

    const sysName = initialData?.sysName || 'SUNBLIX 7.02 Hybrid';
    const systemType = initialData?.systemType || (initialData?.systemTypeId === 'ongrid' ? 'On-Grid (Hemat Siang Hari)' : 'Hybrid (Smart BESS Backup)');
    const powerKwp = initialData?.kwp ? initialData.kwp + ' kWp' : (initialData?.powerKwp ? initialData.powerKwp + ' kWp' : '7.02 kWp');
    const panels = initialData?.panels ? initialData.panels + ' Unit Modul (Astronergy 585Wp)' : '12 Unit Modul (Astronergy 585Wp)';
    const areaM2 = initialData?.area || (initialData?.areaM2 ? initialData.areaM2 + ' m²' : '39 m²');
    const inverterKw = initialData?.inverter ? `${initialData.inverter} (${initialData?.inverterDesc || 'Deye Smart Inverter'})` : (initialData?.inverterKw ? initialData.inverterKw + ' kW' : 'Deye 6 kW Smart Inverter');
    const batteryCap = initialData?.battery || (initialData?.batteryCap || (initialData?.systemTypeId === 'ongrid' ? 'On-Grid (Tanpa Baterai)' : '5.10 kWh LiFePO4 (usable 4.08 kWh)'));
    const estInvestment = initialData?.estInvestment ? 'Rp ' + Number(initialData.estInvestment).toLocaleString('id-ID') : (initialData?.investment ? 'Rp ' + Number(initialData.investment).toLocaleString('id-ID') : 'Rp 177.200.000');
    const paybackYears = initialData?.paybackYears ? `${initialData.paybackYears} Tahun` : '~5.2 Tahun';
    const monthlySavings = initialData?.estSavings ? 'Rp ' + Number(initialData.estSavings).toLocaleString('id-ID') : (initialData?.monthlySavings ? 'Rp ' + Number(initialData.monthlySavings).toLocaleString('id-ID') : 'Rp 2.000.000');
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
    .sunblix-kop-surat {
      width: 100%;
      margin-bottom: 8px;
      background: #ffffff;
    }
    .kop-main-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 2px;
    }
    .kop-logo-col {
      display: flex;
      align-items: center;
    }
    .kop-logo-img {
      height: 52px;
      width: auto;
      max-width: 250px;
      object-fit: contain;
      display: block;
    }
    .kop-contact-col {
      border-left: 1.5px solid #0066cc;
      padding-left: 14px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      align-items: flex-start;
      text-align: left;
    }
    .kop-company-title {
      font-size: 13.5px;
      font-weight: 850;
      color: #0066cc;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }
    .kop-address-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: #334155;
      font-weight: 500;
      line-height: 1.3;
    }
    .kop-pin-icon {
      flex-shrink: 0;
      stroke: #0066cc;
    }
    .kop-contacts-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5px;
      color: #334155;
      font-weight: 500;
      flex-wrap: nowrap;
    }
    .kop-contact-item {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
    }
    .kop-contact-item svg {
      stroke: #0066cc;
      flex-shrink: 0;
    }
    .kop-sep {
      color: #94a3b8;
      font-size: 9px;
    }
    .kop-tricolor-bar {
      display: flex;
      width: 100%;
      height: 2.5px;
      margin-top: 5px;
      margin-bottom: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .kop-tricolor-bar .bar-blue {
      flex: 70;
      background: #0066cc;
      height: 100%;
    }
    .kop-tricolor-bar .bar-gold {
      flex: 20;
      background: #f59e0b;
      height: 100%;
    }
    .kop-tricolor-bar .bar-green {
      flex: 10;
      background: #10b981;
      height: 100%;
    }
    .doc-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .doc-title {
      font-size: 16px;
      font-weight: 850;
      color: #041c3e;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .doc-meta {
      text-align: right;
    }
    .ref-badge {
      display: inline-block;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      color: #0284c7;
      padding: 3px 8px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
    }
    .date {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
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
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      min-width: 200px;
    }
    .signature-lead {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .signature-space {
      height: 52px;
      width: 100%;
      margin: 3px 0;
    }
    .signature-name {
      font-weight: 800;
      color: #041c3e;
      text-decoration: underline;
      font-size: 12.5px;
    }
    .signature-title {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
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

  <!-- KOP SURAT RESMI PT SUNBLIX ENERGI INDONESIA -->
  <div class="sunblix-kop-surat">
    <div class="kop-main-row">
      <div class="kop-logo-col">
        <img src="/asset/logo.png" alt="SUNBLIX - Power Your World" class="kop-logo-img">
      </div>
      <div class="kop-contact-col">
        <div class="kop-company-title">PT SUNBLIX ENERGI INDONESIA</div>
        <div class="kop-address-row">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#0066cc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="kop-pin-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330</span>
        </div>
        <div class="kop-contacts-row">
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>sunblix.id</span>
          </span>
          <span class="kop-sep">|</span>
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>021 7362 639</span>
          </span>
          <span class="kop-sep">|</span>
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>085288581027</span>
          </span>
          <span class="kop-sep">|</span>
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>hello@sunblix.id</span>
          </span>
        </div>
      </div>
    </div>
    <div class="kop-tricolor-bar">
      <div class="bar-blue"></div>
      <div class="bar-gold"></div>
      <div class="bar-green"></div>
    </div>
  </div>

  <div class="doc-header-row">
    <div>
      <div class="doc-title">ESTIMASI PENAWARAN RESMI</div>
      <div class="doc-sub">Smart Rooftop & Solar Engineering Solutions</div>
    </div>
    <div class="doc-meta">
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
        <td><strong>Konfigurasi Sistem</strong></td>
        <td><strong>${systemType}</strong></td>
        <td>Sesuai profil beban dan proteksi cadangan energi</td>
      </tr>
      <tr>
        <td><strong>Kapasitas Daya Sistem</strong></td>
        <td><strong>${powerKwp}</strong></td>
        <td>Optimal untuk menyerap beban konsumsi siang & malam</td>
      </tr>
      <tr>
        <td><strong>Modul Surya (PV Panels)</strong></td>
        <td>${panels}</td>
        <td>Astronergy N-Type TOPCon Bifacial 585 Wp High Output</td>
      </tr>
      <tr>
        <td><strong>Smart Solar Inverter</strong></td>
        <td>${inverterKw}</td>
        <td>Efisiensi 98.6% + Dual MPPT + Proteksi Petir</td>
      </tr>
      <tr>
        <td><strong>Baterai Penyimpanan (BESS)</strong></td>
        <td><strong>${batteryCap}</strong></td>
        <td>LiFePO4 51.2V + Smart BMS Protection</td>
      </tr>
      <tr>
        <td><strong>Kebutuhan Luas Atap</strong></td>
        <td>~${areaM2}</td>
        <td>Struktur aluminium anodized anti-korosi SNI</td>
      </tr>
      <tr>
        <td><strong>Estimasi Nilai Paket (SPH)</strong></td>
        <td><strong>~${estInvestment}</strong></td>
        <td>DPP SPH Resmi (Mode HPP A Supplier + Jasa Pasang)</td>
      </tr>
      <tr>
        <td><strong>Estimasi Balik Modal (BEP)</strong></td>
        <td><strong>~${paybackYears}</strong></td>
        <td>Berdasarkan proyeksi penghematan akumulatif</td>
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
    <div style="text-align: center; border-left: 1px dashed rgba(2, 132, 199, 0.3); border-right: 1px dashed rgba(2, 132, 199, 0.3); padding: 0 14px;">
      <div class="highlight-label" style="color: #0369a1;">Estimasi Nilai Paket</div>
      <div class="highlight-val" style="color: #0284c7;">~${estInvestment}</div>
      <div class="highlight-sub">Balik Modal (BEP): ~${paybackYears}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Dampak Lingkungan</div>
      <div style="font-size: 15px; font-weight: 800; color: #15803d;">-${co2Kg} kg CO₂/bln</div>
      <div style="font-size: 10px; color: #64748b;">Setara menanam puluhan pohon per tahun</div>
    </div>
  </div>

  <div class="section-title">3. Jaminan & Layanan Purna Jual</div>
  <div class="guarantees">
    <div class="guarantee-card">
      <span class="guarantee-val">Resmi Pabrik</span>
      <span class="guarantee-desc">Garansi Modul Surya Sesuai Manufaktur</span>
    </div>
    <div class="guarantee-card">
      <span class="guarantee-val">5 - 10 Tahun</span>
      <span class="guarantee-desc">Garansi Resmi Inverter & Komponen</span>
    </div>
    <div class="guarantee-card">
      <span class="guarantee-val">Full Support</span>
      <span class="guarantee-desc">Dukungan Teknis & Monitoring Sistem</span>
    </div>
  </div>

  ${notesBlock}

  <div class="footer">
    <div>
      <em>* Dokumen ini merupakan estimasi awal berbasis data kalkulator surya SUNBLIX.<br>Proposal final dan layout CAD resmi akan diterbitkan setelah survei teknis lokasi.</em>
    </div>
    <div class="signature">
      <div class="signature-lead">Tertanda Pemohon,</div>
      <div class="signature-space"></div>
      <div class="signature-name">${formData.name || 'Pemohon'}</div>
      <div class="signature-title">${formData.city ? `Lokasi: ${formData.city}` : 'Calon Pelanggan'}</div>
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
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
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
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          padding: '32px 28px',
          color: '#0f172a',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(8, 123, 232, 0.08)',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto',
          fontFamily: 'inherit',
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
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
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
                  color: '#0284c7',
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
                  color: '#031f45',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.3px',
                }}
              >
                Permintaan Penawaran Resmi (PDF)
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
                Dapatkan estimasi teknis, analisis ROI, dan proposal resmi Siap Pakai langsung ke email dan WhatsApp Anda.
              </p>
            </div>

            {initialData && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '1.5px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '10.5px', color: '#0369a1', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Paket Rekomendasi Terpilih
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '850', color: '#031f45', marginTop: '2px' }}>
                    {initialData.sysName || 'SUNBLIX Solar Rooftop'} ({initialData.kwp || initialData.powerKwp || ''} kWp)
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {initialData.battery || initialData.batteryCap || 'Sistem Siap Pakai'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', color: '#0369a1', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Estimasi Investasi SPH
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '850', color: '#0284c7', marginTop: '2px' }}>
                    {initialData.estInvestment ? 'Rp ' + Number(initialData.estInvestment).toLocaleString('id-ID') : (initialData.investment ? 'Rp ' + Number(initialData.investment).toLocaleString('id-ID') : '-')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', marginTop: '2px' }}>
                    Balik Modal ~{initialData.paybackYears ? `${initialData.paybackYears} Thn` : '5.2 Thn'}
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#b91c1c',
                  marginBottom: '16px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label
                  style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}
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
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
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
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#1e293b',
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
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
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
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#1e293b',
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
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
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
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#1e293b',
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
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
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
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: '#1e293b',
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
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
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
                  style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}
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
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
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
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {loading ? 'Sedang Memproses...' : 'Kirim Permintaan Penawaran Resmi →'}
              </button>

              <div
                style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  textAlign: 'center',
                  marginTop: '6px',
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
                background: '#ecfdf5',
                border: '2px solid #10b981',
                color: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '16px',
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 10px', color: '#031f45' }}>
              Permintaan Penawaran Berhasil!
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }}>
              Terima kasih Bpk/Ibu <strong>{formData.name}</strong>. Tim spesialis teknis SUNBLIX sedang menyusun
              rincian proposal teknis untuk lokasi <strong>{formData.city}</strong>.
            </p>

            <div
              style={{
                background: '#f0f9ff',
                border: '1.5px dashed #38bdf8',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '11px', color: '#0369a1', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                NOMOR REFERENSI PENAWARAN:
              </span>
              <strong style={{ fontSize: '19px', color: '#0284c7', letterSpacing: '1px' }}>
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
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)',
                }}
              >
                <span>📥 Unduh Ringkasan Penawaran (PDF)</span>
              </button>
              <a
                href={`/brosur?customer=${encodeURIComponent(formData.name || '')}&project=${encodeURIComponent(initialData?.sysName || '')}&docNo=${encodeURIComponent(submittedData.quoteId || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1.5px solid #0284c7',
                  color: '#0284c7',
                  fontSize: '13px',
                  fontWeight: 700,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>✨ Buka di Generator Brosur Lengkap (3 Halaman) ↗</span>
              </a>
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
                  boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)',
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
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
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
