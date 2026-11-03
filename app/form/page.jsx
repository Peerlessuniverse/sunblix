'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import './wizard.css';

const PROPERTY_TYPES = [
  { id: 'Rumah', label: 'Rumah Tinggal', icon: '🏠', desc: 'Residensial hunian keluarga' },
  { id: 'Villa', label: 'Villa & Resort', icon: '🏡', desc: 'Peristirahatan & hospitality' },
  { id: 'Ruko / Kantor', label: 'Ruko & Komersial', icon: '🏢', desc: 'Bisnis, cafe & perkantoran' },
  { id: 'Pabrik / Gudang', label: 'Pabrik & Industri', icon: '🏭', desc: 'Fasilitas produksi besar' },
];

const PLN_VA_1PHASE = [
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
  { label: '1.5 Jt', val: 1500000 },
  { label: '3 Jt', val: 3000000 },
  { label: '6 Jt', val: 6000000 },
  { label: '10 Jt', val: 10000000 },
  { label: '15 Jt+', val: 15000000 },
];

const SYSTEM_GOALS = [
  {
    id: 'Hemat + Backup Pemadaman',
    title: 'Hybrid Smart Energy',
    badge: 'Paling Populer',
    desc: 'Hemat tagihan harian + proteksi otomatis saat listrik PLN padam dengan baterai LiFePO4 cerdas.',
    icon: '⚡',
  },
  {
    id: 'Hemat Tagihan (On-Grid)',
    title: 'On-Grid Eco Smart',
    badge: 'ROI Tercepat',
    desc: 'Fokus pangkas tagihan listrik siang hari tanpa baterai. Biaya investasi awal paling terjangkau.',
    icon: '☀️',
  },
  {
    id: 'Off-Grid Mandiri',
    title: 'Off-Grid Standalone',
    badge: '100% Mandiri',
    desc: 'Sistem independen tanpa jaringan PLN, ideal untuk perkebunan, pulau, atau wilayah remote.',
    icon: '🔋',
  },
];

const CRITICAL_LOADS = [
  { id: 'kulkas', label: 'Kulkas / Freezer' },
  { id: 'lampu', label: 'Lampu Penerangan' },
  { id: 'pompa', label: 'Pompa Air / Booster' },
  { id: 'wifi', label: 'WiFi & CCTV' },
  { id: 'ac', label: 'AC Kamar Tidur' },
  { id: 'server', label: 'Komputer / Server' },
];

export default function LeadIntakeWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1: Properti & Lokasi
  const [propertyType, setPropertyType] = useState('Rumah');
  const [city, setCity] = useState('');

  // Step 2: Listrik PLN
  const [phase, setPhase] = useState('1 Fasa');
  const [plnVa, setPlnVa] = useState(5500);
  const [monthlyBill, setMonthlyBill] = useState(3000000);

  // Step 3: Kebutuhan
  const [goal, setGoal] = useState('Hemat + Backup Pemadaman');
  const [backupHours, setBackupHours] = useState(6);
  const [selectedLoads, setSelectedLoads] = useState(['kulkas', 'lampu', 'wifi']);

  // Step 4: Atap & Fisik
  const [roofType, setRoofType] = useState('Genteng');
  const [cableDistance, setCableDistance] = useState(25);
  const [notes, setNotes] = useState('');

  // Step 5: Kontak
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sizing Live Calculation
  const sizingPreview = useMemo(() => {
    const bill = Number(monthlyBill) || 2000000;
    const isHybrid = goal.includes('Backup') || goal.includes('Hybrid');
    
    // Perhitungan energi standar 4.0 PSH & tarif R2/R3
    const estKwhPerMonth = bill / 1699.53;
    const estDailyKwh = estKwhPerMonth / 30;
    const targetKwp = Math.max(1.8, Math.min(60, Number(((estDailyKwh * 0.72) / 4.0).toFixed(2))));
    const panelsCount = Math.ceil((targetKwp * 1000) / 585);
    const estMonthlySaving = Math.round(bill * 0.65);

    let batteryText = 'Tanpa Baterai';
    if (isHybrid) {
      if (backupHours <= 4) batteryText = '5.12 kWh LiFePO4';
      else if (backupHours <= 8) batteryText = '10.24 – 15.36 kWh LiFePO4';
      else batteryText = '20.48+ kWh LiFePO4 Stack';
    }

    return {
      targetKwp,
      panelsCount,
      estMonthlySaving,
      batteryText,
    };
  }, [monthlyBill, goal, backupHours]);

  const toggleLoad = (loadId) => {
    setSelectedLoads((prev) =>
      prev.includes(loadId) ? prev.filter((i) => i !== loadId) : [...prev, loadId]
    );
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1 && !city.trim()) {
      setErrorMessage('Mohon isi kota atau lokasi properti Anda.');
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
        propertyType,
        phase,
        plnVa,
        monthlyBill,
        goal,
        backupHours: goal.includes('Backup') ? backupHours : 0,
        criticalLoads: selectedLoads.join(', '),
        roofType,
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

      setSubmittedRef(data.refCode || 'SBX-SUCCESS');
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
          <span>Sistem Onboarding 2026</span>
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

      {/* MAIN CONTENT AREA */}
      <main className="sbx-wizard-main">
        {submittedRef ? (
          /* SUCCESS SCREEN */
          <div className="sbx-success-card">
            <div className="sbx-success-icon">✓</div>
            <div className="sbx-step-meta" style={{ justifyContent: 'center' }}>Registrasi Berhasil</div>
            <h1 className="sbx-step-title">Terima Kasih, {name}!</h1>
            <p className="sbx-step-desc" style={{ maxWidth: '480px', margin: '0 auto 24px auto' }}>
              Data kebutuhan PLTS Anda telah tercatat ke dalam sistem engineering SUNBLIX.
            </p>

            <div className="sbx-bill-box" style={{ maxWidth: '420px', margin: '0 auto 24px auto', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Nomor Referensi Konsultasi:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24', marginTop: '2px', fontFamily: 'monospace' }}>
                {submittedRef}
              </div>
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Estimasi Sistem:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>~{sizingPreview.targetKwp} kWp ({sizingPreview.panelsCount} Panel)</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Estimasi Hemat:</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>~Rp {sizingPreview.estMonthlySaving.toLocaleString('id-ID')} /bln</span>
              </div>
            </div>

            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '14px', maxWidth: '420px', margin: '0 auto 28px auto', textAlign: 'left', fontSize: '12px', color: '#fde68a' }}>
              ⚡ <strong>Langkah Berikutnya:</strong> Tim Engineer & AI Copilot kami (SURTI) sedang mengkalkulasi simulasi teknis lengkap dan menyiapkan dokumen resmi <em>Project Planning Analysis (PDF A4)</em> untuk dikirimkan langsung ke WhatsApp Anda ({phone}).
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="sbx-btn-back">
                Kembali ke Beranda
              </Link>
              <a
                href={`https://wa.me/628122244458?text=Halo%20SUNBLIX,%20saya%20sudah%20mengisi%20form%20onboarding%20Ref:%20${submittedRef}`}
                target="_blank"
                rel="noreferrer"
                className="sbx-btn-next"
                style={{ textDecoration: 'none' }}
              >
                Konfirmasi via WhatsApp 💬
              </a>
            </div>
          </div>
        ) : (
          /* WIZARD FLOW STEP BY STEP */
          <div style={{ width: '100%' }}>
            {errorMessage && (
              <div className="sbx-error-box">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* STEP 1: PROPERTY & CITY */}
            {step === 1 && (
              <div>
                <div className="sbx-step-meta">Langkah 1 dari {totalSteps} • Properti & Wilayah</div>
                <h1 className="sbx-step-title">Pilih Jenis Bangunan Anda</h1>
                <p className="sbx-step-desc">Tentukan tipe properti yang akan dipasangi sistem PLTS Rooftop.</p>

                <div className="sbx-cards-grid" style={{ marginBottom: '24px' }}>
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
                    <label className="sbx-label">Kota / Alamat Lokasi Properti *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Contoh: Bandung, Surabaya, Jakarta Selatan, Denpasar..."
                      className="sbx-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PLN POWER & BILL */}
            {step === 2 && (
              <div>
                <div className="sbx-step-meta">Langkah 2 dari {totalSteps} • Kelistrikan PLN</div>
                <h1 className="sbx-step-title">Profil Sambungan Listrik PLN</h1>
                <p className="sbx-step-desc">Bantu kami mencocokkan kapasitas inverter dan solar panel yang aman.</p>

                {/* SEGMENTED 1 FASA / 3 FASA */}
                <div className="sbx-segmented-control">
                  {['1 Fasa', '3 Fasa'].map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => {
                        setPhase(ph);
                        setPlnVa(ph === '1 Fasa' ? 5500 : 23000);
                      }}
                      className={`sbx-segment-btn ${phase === ph ? 'active' : ''}`}
                    >
                      Sambungan {ph}
                    </button>
                  ))}
                </div>

                {/* DAYA PLN PILLS */}
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                  PILIH DAYA PLN TERPASANG (VA):
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

                {/* TAGIHAN BULANAN SLIDER */}
                <div className="sbx-bill-box">
                  <div className="sbx-bill-header">
                    <span className="sbx-bill-label">Rata-Rata Tagihan Listrik Per Bulan:</span>
                    <span className="sbx-bill-amount">
                      Rp {Number(monthlyBill).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={500000}
                    max={25000000}
                    step={250000}
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
              </div>
            )}

            {/* STEP 3: SYSTEM GOAL & BACKUP */}
            {step === 3 && (
              <div>
                <div className="sbx-step-meta">Langkah 3 dari {totalSteps} • Solusi Sistem</div>
                <h1 className="sbx-step-title">Tujuan Utama Pemasangan PLTS</h1>
                <p className="sbx-step-desc">Pilih teknologi yang sesuai dengan prioritas kebutuhan energi Anda.</p>

                <div className="sbx-goals-list">
                  {SYSTEM_GOALS.map((sys) => (
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
                        <span className="sbx-goal-badge">{sys.badge}</span>
                      </div>
                      <p className="sbx-goal-desc">{sys.desc}</p>
                    </div>
                  ))}
                </div>

                {/* HYBRID ACCORDION */}
                {goal.includes('Backup') && (
                  <div className="sbx-backup-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                        Durasi Cadangan Daya (Mati Lampu)
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>
                        {backupHours} Jam
                      </span>
                    </div>

                    <div className="sbx-hours-grid">
                      {[4, 6, 8, 12].map((jam) => (
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

                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                      Peralatan Prioritas Yang Wajib Tetap Menyala:
                    </div>
                    <div className="sbx-loads-grid">
                      {CRITICAL_LOADS.map((item) => {
                        const active = selectedLoads.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleLoad(item.id)}
                            className={`sbx-load-chip ${active ? 'active' : ''}`}
                          >
                            <span>{item.label}</span>
                            <span>{active ? '✓' : '+'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: ROOF & PHYSICAL */}
            {step === 4 && (
              <div>
                <div className="sbx-step-meta">Langkah 4 dari {totalSteps} • Kondisi Atap</div>
                <h1 className="sbx-step-title">Kondisi Fisik Atap & Instalasi</h1>
                <p className="sbx-step-desc">Membantu engineer menentukan jenis mounting anti-bocor dan rute kabel.</p>

                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                  JENIS ATAP BANGUNAN:
                </div>
                <div className="sbx-pills-grid" style={{ marginBottom: '24px' }}>
                  {['Genteng', 'Metal / Spandek', 'Dak Beton', 'Lainnya'].map((rf) => (
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

                <div className="sbx-bill-box">
                  <div className="sbx-bill-header">
                    <span className="sbx-bill-label">Perkiraan Jarak Atap ke Panel Listrik (MCB):</span>
                    <span className="sbx-bill-amount" style={{ fontSize: '20px' }}>
                      ~{cableDistance} meter
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={cableDistance}
                    onChange={(e) => setCableDistance(Number(e.target.value))}
                    className="sbx-range-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                    <span>10m (Dekat)</span>
                    <span>50m (Sedang)</span>
                    <span>100m+ (Jauh)</span>
                  </div>
                </div>

                <div className="sbx-inputs-group">
                  <div className="sbx-field">
                    <label className="sbx-label">Catatan Tambahan / Spesifikasi Khusus (Opsional)</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Ada 2 unit AC 2 PK, pompa submersible. Atap hadap utara..."
                      className="sbx-textarea"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: CONTACT & FINAL SUBMISSION */}
            {step === 5 && (
              <div>
                <div className="sbx-step-meta">Langkah 5 dari {totalSteps} • Kontak Pengiriman</div>
                <h1 className="sbx-step-title">Kemana Analisa Kami Kirimkan?</h1>
                <p className="sbx-step-desc">
                  Tim Engineer & SURTI AI akan mengkalkulasi simulasi teknis dan mengirimkan dokumen <em>Project Planning Analysis (PDF A4)</em> resmi ke nomor WhatsApp Anda.
                </p>

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

                <div className="sbx-inputs-group">
                  <div className="sbx-field">
                    <label className="sbx-label">Nama Lengkap / PIC *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Bapak Henry Gunawan"
                      className="sbx-input"
                    />
                  </div>
                  <div className="sbx-field">
                    <label className="sbx-label">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 0816618853"
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
                Lanjutkan →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="sbx-btn-next sbx-btn-submit"
              >
                {isSubmitting ? 'Memproses...' : 'Dapatkan Analisa PLTS Saya ⚡'}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
