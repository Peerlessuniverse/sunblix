'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import './wizard.css';

const ADMIN_WA = '6285288581027'; // Nomor WhatsApp Resmi Admin SUNBLIX

const PROPERTY_TYPES = [
  { id: 'Rumah', label: 'Rumah Tinggal', icon: '🏠', desc: 'Residensial hunian keluarga' },
  { id: 'Villa', label: 'Villa & Resort', icon: '🏡', desc: 'Peristirahatan & hospitality' },
  { id: 'Ruko / Kantor', label: 'Ruko & Kantor', icon: '🏢', desc: 'Bisnis & ruang usaha' },
  { id: 'Pabrik / Gudang', label: 'Pabrik & Gudang', icon: '🏭', desc: 'Fasilitas komersial & industri' },
];

const PLN_VA_1PHASE = [
  { va: 900, label: '900 VA' },
  { va: 1300, label: '1.300 VA' },
  { va: 2200, label: '2.200 VA' },
  { va: 3500, label: '3.500 VA' },
  { va: 4400, label: '4.400 VA' },
  { va: 5500, label: '5.500 VA' },
  { va: 7700, label: '7.700 VA' },
  { va: 11000, label: '11.000 VA' },
];

const PLN_VA_3PHASE = [
  { va: 6600, label: '6.600 VA' },
  { va: 10600, label: '10.600 VA' },
  { va: 13200, label: '13.200 VA' },
  { va: 16500, label: '16.500 VA' },
  { va: 23000, label: '23.000 VA' },
  { va: 33000, label: '33.000 VA' },
  { va: 41500, label: '41.500 VA+' },
];

const QUICK_BILLS = [
  { label: '800 Rb', val: 800000 },
  { label: '1.5 Jt', val: 1500000 },
  { label: '3 Jt', val: 3000000 },
  { label: '6 Jt', val: 6000000 },
  { label: '10 Jt+', val: 10000000 },
];

export default function LeadIntakeWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // --- A. DATA CUSTOMER ---
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [shareLoc, setShareLoc] = useState('');
  const [propertyType, setPropertyType] = useState('Rumah');
  const [propertyUnits, setPropertyUnits] = useState('1');

  // --- B. LISTRIK PLN ---
  const [phase, setPhase] = useState('1 Fasa');
  const [plnVa, setPlnVa] = useState(2200);
  const [meterType, setMeterType] = useState('Token'); // 'Token' | 'Pascabayar'
  const [monthlyBill, setMonthlyBill] = useState(800000);
  const [outageFrequency, setOutageFrequency] = useState('Jarang'); // 'Jarang' | 'Kadang-kadang' | 'Sering'

  // --- C. KEBUTUHAN ---
  const [goal, setGoal] = useState('Hemat Tagihan (On-Grid)'); // 'Hemat Tagihan (On-Grid)' | 'Backup Saat Padam' | 'Keduanya (Hybrid)'
  const [backupHours, setBackupHours] = useState(4);
  const [criticalLoads, setCriticalLoads] = useState('Kulkas, AC 1 PK Inverter, Lampu');
  const [heavyLoads, setHeavyLoads] = useState('AC 3 unit (dua 0.5 PK, satu 1 PK), Water Heater, Kulkas, PC, Pompa');
  const [usageTime, setUsageTime] = useState('Malam'); // 'Siang' | 'Malam' | 'Seimbang'

  // --- D. ATAP & LOKASI ---
  const [roofType, setRoofType] = useState('Kombinasi (Dak & Genteng)');
  const [roofArea, setRoofArea] = useState('30 m²');
  const [roofShadow, setRoofShadow] = useState('Tidak ada bayangan');
  const [cableDistance, setCableDistance] = useState('Kurang tahu (~20m)');
  const [notes, setNotes] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Live Sizing Estimation
  const sizingPreview = useMemo(() => {
    const bill = Number(monthlyBill) || 800000;
    const isHybrid = goal.includes('Hybrid') || goal.includes('Keduanya') || goal.includes('Backup');

    // Tarif PLN R-1/R-2 ~ Rp 1.444 - 1.699 / kWh
    const estKwhPerMonth = bill / 1550;
    const estDailyKwh = estKwhPerMonth / 30;
    const targetKwp = Math.max(1.17, Math.min(50, Number(((estDailyKwh * 0.75) / 4.0).toFixed(2))));
    const panelsCount = Math.ceil((targetKwp * 1000) / 585);
    const estMonthlySaving = Math.round(bill * 0.65);

    let batteryText = 'Tanpa Baterai';
    if (isHybrid) {
      if (backupHours <= 4) batteryText = '5.12 kWh LiFePO4';
      else if (backupHours <= 8) batteryText = '10.24 kWh LiFePO4';
      else batteryText = '15.36+ kWh LiFePO4 Stack';
    }

    return {
      targetKwp,
      panelsCount,
      estMonthlySaving,
      batteryText,
    };
  }, [monthlyBill, goal, backupHours]);

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1 && (!name.trim() || !phone.trim())) {
      setErrorMessage('Nama Lengkap dan Nomor WhatsApp wajib diisi.');
      return;
    }
    if (step < totalSteps) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Nama Lengkap dan Nomor WhatsApp wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        shareLoc: shareLoc.trim(),
        propertyType,
        propertyUnits,
        plnVa,
        phase,
        meterType,
        monthlyBill,
        outageFrequency,
        goal,
        backupHours: goal.includes('On-Grid') ? 0 : backupHours,
        criticalLoads: goal.includes('On-Grid') ? '' : criticalLoads.trim(),
        heavyLoads: heavyLoads.trim(),
        usageTime,
        roofType,
        roofArea: roofArea.trim(),
        roofShadow,
        cableDistance,
        notes: notes.trim(),
      };

      const res = await fetch('/api/form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirim data formulir.');
      }

      const ref = data.refCode || 'SBX-SUCCESS';
      setSubmittedRef(ref);

      // Otomatis buka chat WhatsApp ke Admin (085288581027) dengan membawa data
      const waText = [
        `Halo SUNBLIX, saya sudah mengisi formulir survei kebutuhan PLTS:`,
        `• No. Ref: ${ref}`,
        `• Nama: ${name.trim()}`,
        `• No. WA: ${phone.trim()}`,
        `• Lokasi: ${city.trim() || '-'}`,
        `• Daya PLN: ${plnVa} VA (${phase}) - ${meterType}`,
        `• Rata-rata Tagihan/Token: Rp ${Number(monthlyBill).toLocaleString('id-ID')}/bln`,
        `• Kebutuhan: ${goal}`,
        ``,
        `Berikut saya lampirkan foto rekening listrik / meteran / atap untuk analisa teknis:`
      ].join('\n');

      const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(waText)}`;

      // Buka otomatis WhatsApp setelah jeda singkat
      setTimeout(() => {
        window.location.href = waUrl;
      }, 800);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi gangguan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sbx-wizard-page">
      {/* HEADER */}
      <header className="sbx-wizard-header">
        <Link href="/" className="sbx-header-brand">
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="sbx-header-logo" />
          <span className="sbx-header-tagline">Power Your World</span>
        </Link>
        <div className="sbx-header-badge">
          <span className="sbx-pulse-dot" />
          <span>Formulir Perencanaan Teknis PLTS</span>
        </div>
      </header>

      {/* PROGRESS BAR */}
      {!submittedRef && (
        <div className="sbx-progress-container">
          <div
            className="sbx-progress-bar"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="sbx-wizard-main">
        {submittedRef ? (
          /* SUCCESS SCREEN */
          <div className="sbx-success-card">
            <div className="sbx-success-icon">✓</div>
            <div className="sbx-step-meta" style={{ justifyContent: 'center' }}>Registrasi Berhasil</div>
            <h1 className="sbx-step-title">Terima Kasih, {name}!</h1>
            <p className="sbx-step-desc" style={{ maxWidth: '480px', margin: '0 auto 24px auto' }}>
              Data survei teknis Anda telah berhasil diterima oleh tim engineering SUNBLIX.
            </p>

            <div className="sbx-bill-box" style={{ maxWidth: '440px', margin: '0 auto 24px auto', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Nomor Referensi Konsultasi:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#087be8', marginTop: '2px', fontFamily: 'monospace' }}>
                {submittedRef}
              </div>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Estimasi Kapasitas:</span>
                <span style={{ color: '#062b63', fontWeight: 700 }}>~{sizingPreview.targetKwp} kWp ({sizingPreview.panelsCount} Panel)</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Estimasi Hemat:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>~Rp {sizingPreview.estMonthlySaving.toLocaleString('id-ID')} /bln</span>
              </div>
            </div>

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '14px', padding: '16px', maxWidth: '440px', margin: '0 auto 28px auto', textAlign: 'left', fontSize: '13px', color: '#92400e' }}>
              📸 <strong>Kirimkan Foto Dokumen Pendukung ke WhatsApp:</strong>
              <ul style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '12px', lineHeight: 1.6 }}>
                <li>Bukti rekening listrik / riwayat token 3 bulan</li>
                <li>Foto atap (keseluruhan & detail)</li>
                <li>Foto meteran PLN & panel MCB</li>
                <li>Foto label spesifikasi AC / pompa air</li>
              </ul>
              <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700 }}>
                Kirim langsung ke WhatsApp Admin Resmi: 0852-8858-1027
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="sbx-btn-back">
                Kembali ke Beranda
              </Link>
              <a
                href={`https://wa.me/${ADMIN_WA}?text=Halo%20SUNBLIX,%20saya%20sudah%20mengisi%20form%20survei%20PLTS%20atas%20nama%20${encodeURIComponent(name)}%20(Ref:%20${submittedRef}).%20Berikut%20saya%20lampirkan%20foto%20rekening/atapnya:`}
                target="_blank"
                rel="noreferrer"
                className="sbx-btn-next"
                style={{ textDecoration: 'none' }}
              >
                Kirim Foto via WhatsApp 💬
              </a>
            </div>
          </div>
        ) : (
          /* WIZARD FLOW */
          <div style={{ width: '100%' }}>
            {errorMessage && (
              <div className="sbx-error-box">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* ============================================================== */}
            {/* LANGKAH 1: A. DATA CUSTOMER */}
            {/* ============================================================== */}
            {step === 1 && (
              <div>
                <div className="sbx-step-meta">Bagian A • Data Customer</div>
                <h1 className="sbx-step-title">Profil & Lokasi Bangunan</h1>
                <p className="sbx-step-desc">Silakan lengkapi informasi identitas dan lokasi pemasangan PLTS Anda.</p>

                <div className="sbx-inputs-group">
                  <div className="sbx-field">
                    <label className="sbx-label">1. Nama Lengkap & PIC *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Kelvin"
                      className="sbx-input"
                    />
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">2. Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 089644704032"
                      className="sbx-input"
                    />
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">Alamat Email (Opsional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="sbx-input"
                    />
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">3. Alamat Lokasi / Kota *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Contoh: Graha Raya, Tangerang Selatan"
                      className="sbx-input"
                    />
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">Link Share Location / Google Maps (Opsional)</label>
                    <input
                      type="text"
                      value={shareLoc}
                      onChange={(e) => setShareLoc(e.target.value)}
                      placeholder="Contoh: https://maps.app.goo.gl/..."
                      className="sbx-input"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  4. JENIS BANGUNAN:
                </div>
                <div className="sbx-cards-grid" style={{ marginBottom: '20px' }}>
                  {PROPERTY_TYPES.map((prop) => (
                    <button
                      key={prop.id}
                      type="button"
                      onClick={() => setPropertyType(prop.id)}
                      className={`sbx-option-card ${propertyType === prop.id ? 'selected' : ''}`}
                    >
                      <span className="sbx-card-icon">{prop.icon}</span>
                      <div className="sbx-card-label">{prop.label}</div>
                      <div className="sbx-card-hint">{prop.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="sbx-inputs-group">
                  <div className="sbx-field">
                    <label className="sbx-label">5. Jumlah Unit / Lokasi Pemasangan</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['1 Unit', '2 Unit', '3 Unit+'].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setPropertyUnits(u)}
                          className={`sbx-pill-btn ${propertyUnits === u ? 'selected' : ''}`}
                          style={{ flex: 1 }}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* LANGKAH 2: B. LISTRIK PLN */}
            {/* ============================================================== */}
            {step === 2 && (
              <div>
                <div className="sbx-step-meta">Bagian B • Kelistrikan PLN</div>
                <h1 className="sbx-step-title">Kapasitas & Meteran PLN</h1>
                <p className="sbx-step-desc">Informasi kelistrikan PLN membantu menentukan ukuran sistem PLTS yang presisi.</p>

                {/* FASE SELECTION */}
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  6. FASE KELISTRIKAN PLN:
                </div>
                <div className="sbx-segmented-control">
                  {['1 Fasa', '3 Fasa'].map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => {
                        setPhase(ph);
                        setPlnVa(ph === '1 Fasa' ? 2200 : 23000);
                      }}
                      className={`sbx-segment-btn ${phase === ph ? 'active' : ''}`}
                    >
                      Sambungan {ph}
                    </button>
                  ))}
                </div>

                {/* DAYA PLN PILLS */}
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  DAYA PLN TERPASANG (VA):
                </div>
                <div className="sbx-pills-grid">
                  {(phase === '1 Fasa' ? PLN_VA_1PHASE : PLN_VA_3PHASE).map((opt) => (
                    <button
                      key={opt.va}
                      type="button"
                      onClick={() => setPlnVa(opt.va)}
                      className={`sbx-pill-btn ${plnVa === opt.va ? 'selected' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* METERAN TOKEN VS PASCABAYAR */}
                <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  7. JENIS METERAN PLN:
                </div>
                <div className="sbx-segmented-control">
                  {['Token (Prabayar)', 'Pascabayar (Tagihan Bulanan)'].map((m) => {
                    const active = (m.startsWith('Token') && meterType === 'Token') || (m.startsWith('Pascabayar') && meterType === 'Pascabayar');
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMeterType(m.startsWith('Token') ? 'Token' : 'Pascabayar')}
                        className={`sbx-segment-btn ${active ? 'active' : ''}`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>

                {/* 8. TAGIHAN / TOKEN */}
                <div className="sbx-bill-box">
                  <div className="sbx-bill-header">
                    <span className="sbx-bill-label">8. Rata-Rata Tagihan / Token 3 Bulan Terakhir:</span>
                    <span className="sbx-bill-amount">
                      Rp {Number(monthlyBill).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={400000}
                    max={20000000}
                    step={100000}
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="sbx-range-slider"
                  />

                  <div className="sbx-quick-chips">
                    {QUICK_BILLS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setMonthlyBill(item.val)}
                        className={`sbx-chip-btn ${monthlyBill === item.val ? 'active' : ''}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 9. FREKUENSI PADAM */}
                <div style={{ marginTop: '12px', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  9. SEBERAPA SERING PADAM LISTRIK DI WILAYAH ANDA?
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {['Jarang (Hampir tidak pernah)', 'Kadang-kadang (1-2x/bln)', 'Sering (Tiap minggu)'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setOutageFrequency(freq.split(' ')[0])}
                      className={`sbx-pill-btn ${outageFrequency === freq.split(' ')[0] ? 'selected' : ''}`}
                      style={{ flex: 1, fontSize: '12px' }}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* LANGKAH 3: C. KEBUTUHAN */}
            {/* ============================================================== */}
            {step === 3 && (
              <div>
                <div className="sbx-step-meta">Bagian C • Kebutuhan & Beban Listrik</div>
                <h1 className="sbx-step-title">Kebutuhan & Penggunaan Beban</h1>
                <p className="sbx-step-desc">Tentukan prioritas sistem PLTS yang ingin Anda capai.</p>

                {/* 10. TUJUAN UTAMA */}
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  10. TUJUAN UTAMA PEMASANGAN PLTS:
                </div>
                <div className="sbx-goals-list">
                  {[
                    { id: 'Hemat Tagihan (On-Grid)', title: 'Hemat Tagihan (On-Grid)', desc: 'Fokus memangkas tagihan listrik siang hari tanpa baterai. Biaya investasi paling efisien.', icon: '☀️' },
                    { id: 'Keduanya (Hybrid)', title: 'Hemat Tagihan + Backup Saat Padam (Hybrid)', desc: 'Hemat tagihan harian sekaligus perlindungan otomatis saat listrik padam dengan baterai cerdas.', icon: '⚡' },
                    { id: 'Backup Saat Padam Saja', title: 'Backup Saat Padam Saja', desc: 'Sistem penyimpanan energi cadangan darurat khusus pengganti genset saat listrik mati.', icon: '🔋' },
                  ].map((sys) => (
                    <div
                      key={sys.id}
                      onClick={() => setGoal(sys.id)}
                      className={`sbx-goal-card ${goal === sys.id ? 'selected' : ''}`}
                    >
                      <div className="sbx-goal-header">
                        <div className="sbx-goal-title-wrap">
                          <span className="sbx-goal-icon">{sys.icon}</span>
                          <span className="sbx-goal-title">{sys.title}</span>
                        </div>
                      </div>
                      <p className="sbx-goal-desc">{sys.desc}</p>
                    </div>
                  ))}
                </div>

                {/* JIKA MEMILIH BACKUP / HYBRID */}
                {!goal.includes('On-Grid') && (
                  <div className="sbx-backup-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#b45309' }}>
                        11. Lama Backup Yang Diinginkan (Jam):
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#062b63' }}>
                        {backupHours} Jam
                      </span>
                    </div>

                    <div className="sbx-hours-grid">
                      {[3, 4, 6, 8, 12].map((jam) => (
                        <button
                          key={jam}
                          type="button"
                          onClick={() => setBackupHours(jam)}
                          className={`sbx-hour-btn ${backupHours === jam ? 'selected' : ''}`}
                        >
                          {jam} Jam
                        </button>
                      ))}
                    </div>

                    <div className="sbx-field" style={{ marginTop: '12px' }}>
                      <label className="sbx-label">12. Peralatan yang WAJIB Menyala Saat Padam:</label>
                      <input
                        type="text"
                        value={criticalLoads}
                        onChange={(e) => setCriticalLoads(e.target.value)}
                        placeholder="Contoh: Kulkas, AC 1 PK Inverter, Lampu utama, WiFi"
                        className="sbx-input"
                      />
                    </div>
                  </div>
                )}

                <div className="sbx-inputs-group">
                  <div className="sbx-field">
                    <label className="sbx-label">13. Peralatan Besar di Properti (AC berapa PK & Jumlah, Pompa, Water Heater):</label>
                    <textarea
                      rows={2}
                      value={heavyLoads}
                      onChange={(e) => setHeavyLoads(e.target.value)}
                      placeholder="Contoh: AC 3 unit (dua 0.5 PK, satu 1 PK), Water Heater 350W, Kulkas 2 pintu, Pompa air 250W, PC"
                      className="sbx-textarea"
                    />
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">14. Pemakaian Listrik Lebih Banyak Waktu Kapan?</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { id: 'Siang', label: '☀️ Lebih Banyak Siang' },
                        { id: 'Malam', label: '🌙 Lebih Banyak Malam' },
                        { id: 'Seimbang', label: '⚖️ Seimbang Siang & Malam' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setUsageTime(t.id)}
                          className={`sbx-pill-btn ${usageTime === t.id ? 'selected' : ''}`}
                          style={{ flex: 1, fontSize: '12px' }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* LANGKAH 4: D. ATAP & LOKASI */}
            {/* ============================================================== */}
            {step === 4 && (
              <div>
                <div className="sbx-step-meta">Bagian D • Kondisi Atap & Lokasi</div>
                <h1 className="sbx-step-title">Kondisi Fisik Atap</h1>
                <p className="sbx-step-desc">Informasi atap menentukan tipe mounting bracket dan estimasi kapasitas terpasang.</p>

                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  15. JENIS ATAP BANGUNAN:
                </div>
                <div className="sbx-pills-grid" style={{ marginBottom: '16px' }}>
                  {['Genteng', 'Dak Beton', 'Metal / Spandek', 'Kombinasi (Dak & Genteng)', 'Lainnya'].map((rf) => (
                    <button
                      key={rf}
                      type="button"
                      onClick={() => setRoofType(rf)}
                      className={`sbx-pill-btn ${roofType === rf ? 'selected' : ''}`}
                    >
                      {rf}
                    </button>
                  ))}
                </div>

                <div className="sbx-inputs-group">
                  <div className="sbx-field">
                    <label className="sbx-label">Perkiraan Luas Atap yang Tersedia (m²):</label>
                    <input
                      type="text"
                      value={roofArea}
                      onChange={(e) => setRoofArea(e.target.value)}
                      placeholder="Contoh: 30 m² atau 6 x 5 meter"
                      className="sbx-input"
                    />
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">16. Arah Atap & Bayangan Pohon / Gedung:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Tidak ada bayangan', 'Ada sedikit bayangan', 'Banyak bayangan'].map((sh) => (
                        <button
                          key={sh}
                          type="button"
                          onClick={() => setRoofShadow(sh)}
                          className={`sbx-pill-btn ${roofShadow === sh ? 'selected' : ''}`}
                          style={{ flex: 1, fontSize: '12px' }}
                        >
                          {sh}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">17. Jarak Atap ke Panel MCB & Rencana Inverter:</label>
                    <input
                      type="text"
                      value={cableDistance}
                      onChange={(e) => setCableDistance(e.target.value)}
                      placeholder="Contoh: Kurang tahu (~20m) / Inverter di garasi"
                      className="sbx-input"
                    />
                  </div>

                  <div className="sbx-field">
                    <label className="sbx-label">Catatan Khusus Tambahan (Opsional):</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Posisi dak di lantai 2, akses tangga aman..."
                      className="sbx-textarea"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* LANGKAH 5: E. DOKUMENTASI FOTO & FINAL */}
            {/* ============================================================== */}
            {step === 5 && (
              <div>
                <div className="sbx-step-meta">Bagian E • Dokumentasi & Konfirmasi</div>
                <h1 className="sbx-step-title">Kelengkapan Foto & Finalisasi</h1>
                <p className="sbx-step-desc">
                  Untuk hasil rancangan engineering yang presisi, mohon siapkan foto dokumentasi berikut:
                </p>

                {/* CHECKLIST FOTO */}
                <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(6,43,99,0.04)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#062b63', marginBottom: '12px' }}>
                    📸 DOKUMEN FOTO YANG DIBUTUHKAN:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '10px' }}>
                    {[
                      { title: 'Rekening PLN / Riwayat Token', desc: 'Foto struk / screenshot tagihan 3 bulan terakhir' },
                      { title: 'Atap Bangunan', desc: 'Foto atap secara keseluruhan & sudut kemiringan' },
                      { title: 'Meteran PLN & Panel MCB', desc: 'Foto box MCB utama dan meteran kwh PLN' },
                      { title: 'Label Peralatan Besar', desc: 'Foto stiker watt/daya pada AC dan pompa air' },
                    ].map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#087be8', fontWeight: 800, fontSize: '14px' }}>✓</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{doc.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', fontSize: '12px', color: '#047857' }}>
                    💬 <em>Foto-foto di atas dapat Anda kirimkan langsung via WhatsApp ke nomor Admin Resmi setelah formulir ini dikirim.</em>
                  </div>
                </div>

                {/* LIVE ESTIMATOR CHIP */}
                <div className="sbx-live-preview-bar">
                  <div className="sbx-preview-item">
                    <span className="sbx-preview-title">Estimasi PV</span>
                    <span className="sbx-preview-val">~{sizingPreview.targetKwp} kWp</span>
                  </div>
                  <div className="sbx-preview-item">
                    <span className="sbx-preview-title">Panel Tier-1</span>
                    <span className="sbx-preview-val">{sizingPreview.panelsCount} Modul</span>
                  </div>
                  <div className="sbx-preview-item">
                    <span className="sbx-preview-title">Potensi Hemat</span>
                    <span className="sbx-preview-val highlight">~Rp {sizingPreview.estMonthlySaving.toLocaleString('id-ID')} /bln</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                  Laporan resmi <strong>Project Planning Analysis (PDF A4)</strong> akan disiapkan oleh Tim Engineer & SURTI AI atas nama <strong>{name || 'Anda'}</strong>.
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* DOCKED BOTTOM NAVIGATION */}
      {!submittedRef && (
        <footer className="sbx-wizard-dock">
          <div className="sbx-dock-inner">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="sbx-btn-back">
                ← Kembali
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button type="button" onClick={handleNext} className="sbx-btn-next">
                Lanjutkan (Bagian {step === 1 ? 'B' : step === 2 ? 'C' : step === 3 ? 'D' : 'E'}) →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="sbx-btn-next sbx-btn-submit"
              >
                {isSubmitting ? 'Memproses Data...' : 'Kirim Kebutuhan PLTS Saya ⚡'}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
