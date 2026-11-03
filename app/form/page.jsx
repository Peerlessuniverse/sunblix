'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const PROPERTY_TYPES = [
  { id: 'Rumah', label: 'Rumah Tinggal', icon: '🏠', desc: 'Residensial hunian pribadi' },
  { id: 'Villa', label: 'Villa & Resort', icon: '🏡', desc: 'Properti peristirahatan' },
  { id: 'Ruko / Kantor', label: 'Ruko & Komersial', icon: '🏢', desc: 'Bisnis & perkantoran' },
  { id: 'Pabrik / Gudang', label: 'Pabrik & Industri', icon: '🏭', desc: 'Manufaktur & fasilitas besar' },
];

const PLN_VA_OPTIONS_1PHASE = [
  { va: 1300, label: '1.300 VA' },
  { va: 2200, label: '2.200 VA' },
  { va: 3500, label: '3.500 VA' },
  { va: 4400, label: '4.400 VA' },
  { va: 5500, label: '5.500 VA' },
  { va: 7700, label: '7.700 VA' },
  { va: 11000, label: '11.000 VA' },
];

const PLN_VA_OPTIONS_3PHASE = [
  { va: 6600, label: '6.600 VA' },
  { va: 10600, label: '10.600 VA' },
  { va: 13200, label: '13.200 VA' },
  { va: 16500, label: '16.500 VA' },
  { va: 23000, label: '23.000 VA' },
  { va: 33000, label: '33.000 VA' },
  { va: 41500, label: '41.500 VA+' },
];

const QUICK_BILLS = [
  { label: '1.5 Juta', val: 1500000 },
  { label: '3 Juta', val: 3000000 },
  { label: '6 Juta', val: 6000000 },
  { label: '10 Juta', val: 10000000 },
  { label: '15 Juta+', val: 15000000 },
];

const SYSTEM_GOALS = [
  {
    id: 'Hemat + Backup Pemadaman',
    title: 'Hybrid Smart Energy (Rekomendasi)',
    badge: 'Paling Populer',
    desc: 'Hemat tagihan listrik harian + perlindungan otomatis saat listrik PLN padam dengan baterai cerdas LiFePO4.',
    icon: '⚡',
  },
  {
    id: 'Hemat Tagihan (On-Grid)',
    title: 'On-Grid Eco Smart',
    badge: 'Efisiensi Maksimal',
    desc: 'Fokus pangkas tagihan listrik siang hari tanpa baterai. Investasi awal lebih ringan & ROI tercepat.',
    icon: '☀️',
  },
  {
    id: 'Off-Grid Mandiri',
    title: 'Off-Grid Standalone',
    badge: 'Mandiri Total',
    desc: 'Sistem independen 100% tanpa jaringan PLN, cocok untuk pulau, kebun, atau kawasan terpencil.',
    icon: '🔋',
  },
];

const CRITICAL_LOAD_OPTIONS = [
  { id: 'kulkas', label: 'Kulkas / Freezer' },
  { id: 'lampu', label: 'Penerangan & Lampu' },
  { id: 'pompa', label: 'Pompa Air / Booster' },
  { id: 'wifi', label: 'WiFi, CCTV & Router' },
  { id: 'ac', label: 'AC Kamar Tidur' },
  { id: 'server', label: 'Server / Komputer' },
];

export default function LeadIntakeMicrosite() {
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('Rumah');

  const [phase, setPhase] = useState('1 Fasa');
  const [plnVa, setPlnVa] = useState(5500);
  const [monthlyBill, setMonthlyBill] = useState(3000000);

  const [goal, setGoal] = useState('Hemat + Backup Pemadaman');
  const [backupHours, setBackupHours] = useState(6);
  const [selectedLoads, setSelectedLoads] = useState(['kulkas', 'lampu', 'wifi']);

  const [roofType, setRoofType] = useState('Genteng');
  const [cableDistance, setCableDistance] = useState(25);
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sizing Live Calculation Estimator
  const sizingPreview = useMemo(() => {
    const bill = Number(monthlyBill) || 2000000;
    const isHybrid = goal.includes('Backup') || goal.includes('Hybrid');
    
    // Asumsi tarif R-2 / R-3 ~ Rp 1.699,53 / kWh
    const estKwhPerMonth = bill / 1699.53;
    const estDailyKwh = estKwhPerMonth / 30;
    
    // Target offset 60-75% dengan radiasi rata-rata 4.0 PSH
    const targetKwp = Math.max(1.8, Math.min(60, Number(((estDailyKwh * 0.7) / 4.0).toFixed(2))));
    const panelsCount = Math.ceil((targetKwp * 1000) / 585);
    const estMonthlySaving = Math.round(bill * 0.65);

    let batteryText = 'Tanpa Baterai';
    if (isHybrid) {
      if (backupHours <= 4) batteryText = '5.12 kWh LiFePO4';
      else if (backupHours <= 8) batteryText = '10.24 – 15.36 kWh LiFePO4';
      else batteryText = '20.48+ kWh LiFePO4 High Capacity';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Mohon lengkapi Nama dan Nomor WhatsApp aktif Anda.');
      setStep(1);
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
        throw new Error(data.message || 'Gagal mengirim data. Silakan coba beberapa saat lagi.');
      }

      setSubmittedRef(data.refCode || 'SBX-SUCCESS');
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi gangguan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[130px]" />
      </div>

      {/* TOP BRANDING BAR */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX Logo" className="h-8 w-auto transition-transform group-hover:scale-105" />
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase hidden sm:inline-block border-l border-slate-700 pl-3">
            Power Your World
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Portal Konsultasi Resmi 2026
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {submittedRef ? (
          /* SUCCESS SCREEN */
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-4xl shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              ✓
            </div>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              Registrasi Sukses Diterima
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 mb-2">
              Terima Kasih, {name}!
            </h1>
            <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base mb-6">
              Data kebutuhan PLTS Anda telah berhasil dicatat ke sistem engineering SUNBLIX.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto mb-8 text-left">
              <div className="text-xs text-slate-400">Nomor Referensi Konsultasi:</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">{submittedRef}</div>
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <span>Estimasi Kapasitas:</span>
                <span className="font-semibold text-white">{sizingPreview.targetKwp} kWp ({sizingPreview.panelsCount} Panel)</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-300">
                <span>Potensi Hemat / Bulan:</span>
                <span className="font-semibold text-emerald-400">~Rp {sizingPreview.estMonthlySaving.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 max-w-md mx-auto mb-8 text-xs text-amber-300/90 text-left flex gap-3">
              <span className="text-lg">⚡</span>
              <div>
                <strong>Langkah Selanjutnya:</strong> Tim Engineer & AI Copilot kami (SURTI) sedang mengkalkulasi simulasi teknis lengkap dan menyusun dokumen <em>Project Planning Analysis (PDF A4)</em> resmi untuk dikirimkan langsung ke nomor WhatsApp Anda ({phone}).
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all"
              >
                Kembali ke Beranda
              </Link>
              <a
                href={`https://wa.me/628122244458?text=Halo%20SUNBLIX,%20saya%20sudah%20mengisi%20form%20dengan%20Ref:%20${submittedRef}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                Konfirmasi Cepat via WhatsApp 💬
              </a>
            </div>
          </div>
        ) : (
          /* INTERACTIVE MULTI-STEP FORM */
          <div className="bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            {/* PROGRESS & HEADER */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
                <span className="text-amber-400 font-semibold uppercase tracking-wider">
                  Langkah {step} dari 4: {step === 1 ? 'Data Diri' : step === 2 ? 'Listrik PLN' : step === 3 ? 'Kebutuhan Sistem' : 'Atap & Catatan'}
                </span>
                <span>{Math.round((step / 4) * 100)}% Selesai</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white mt-6">
                Rencanakan PLTS Rooftop Anda Bersama SUNBLIX
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Lengkapi formulir singkat di bawah untuk mendapatkan perhitungan kapasitas ideal, simulasi penghematan, dan dokumen PDF resmi.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <span>⚠️</span> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* STEP 1: PROFIL & LOKASI */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Jenis Bangunan / Properti
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PROPERTY_TYPES.map((prop) => (
                        <button
                          key={prop.id}
                          type="button"
                          onClick={() => setPropertyType(prop.id)}
                          className={`p-3.5 rounded-2xl text-left border transition-all ${
                            propertyType === prop.id
                              ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-lg shadow-amber-500/10'
                              : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-2xl mb-1.5">{prop.icon}</div>
                          <div className="font-semibold text-xs text-white">{prop.label}</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{prop.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Nama Lengkap / PIC <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Bapak Henry Gunawan"
                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Nomor WhatsApp Aktif <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 0816618853"
                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Kota / Alamat Lokasi
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Contoh: Setraduta, Bandung"
                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Alamat Email (Opsional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PROFIL LISTRIK PLN */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* FASA SELECTION */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Tipe Sambungan Listrik PLN
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['1 Fasa', '3 Fasa'].map((ph) => (
                        <button
                          key={ph}
                          type="button"
                          onClick={() => {
                            setPhase(ph);
                            setPlnVa(ph === '1 Fasa' ? 5500 : 23000);
                          }}
                          className={`p-3.5 rounded-2xl text-center border font-semibold text-sm transition-all ${
                            phase === ph
                              ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {ph}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DAYA PLN (VA) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Daya Terpasang PLN (VA)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {(phase === '1 Fasa' ? PLN_VA_OPTIONS_1PHASE : PLN_VA_OPTIONS_3PHASE).map((opt) => (
                        <button
                          key={opt.va}
                          type="button"
                          onClick={() => setPlnVa(opt.va)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                            plnVa === opt.va
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TAGIHAN LISTRIK BULANAN */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Rata-Rata Tagihan Listrik Per Bulan
                      </label>
                      <span className="text-base font-bold text-amber-400">
                        Rp {Number(monthlyBill).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* QUICK PILLS */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {QUICK_BILLS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setMonthlyBill(item.val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            monthlyBill === item.val
                              ? 'bg-amber-500 text-black border-amber-500 font-bold'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="range"
                      min={500000}
                      max={25000000}
                      step={250000}
                      value={monthlyBill}
                      onChange={(e) => setMonthlyBill(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Rp 500rb</span>
                      <span>Rp 10jt</span>
                      <span>Rp 25jt+</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: KEBUTUHAN SISTEM & BACKUP */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Tujuan Utama Sistem PLTS Anda
                    </label>
                    <div className="space-y-3">
                      {SYSTEM_GOALS.map((sys) => (
                        <div
                          key={sys.id}
                          onClick={() => setGoal(sys.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            goal === sys.id
                              ? 'bg-amber-500/15 border-amber-500/70 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{sys.icon}</span>
                              <span className="font-bold text-sm text-white">{sys.title}</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-400/20">
                              {sys.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 pl-7">{sys.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KONDISI HYBRID BACKUP */}
                  {goal.includes('Backup') && (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-amber-400">
                            Durasi Daya Cadangan (Backup Saat Listrik Padam)
                          </label>
                          <span className="text-xs font-bold text-white">{backupHours} Jam</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[4, 6, 8, 12].map((jam) => (
                            <button
                              key={jam}
                              type="button"
                              onClick={() => setBackupHours(jam)}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                backupHours === jam
                                  ? 'bg-amber-500 text-black border-amber-500'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              {jam} Jam
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">
                          Peralatan Prioritas Wajib Nyala Saat Padam:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CRITICAL_LOAD_OPTIONS.map((item) => {
                            const active = selectedLoads.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleLoad(item.id)}
                                className={`py-2 px-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                                  active
                                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <span>{item.label}</span>
                                <span className="text-[10px]">{active ? '✓' : '+'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: ATAP & CATATAN */}
              {step === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Jenis Atap Bangunan
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {['Genteng', 'Metal / Spandek', 'Dak Beton', 'Lainnya'].map((rf) => (
                        <button
                          key={rf}
                          type="button"
                          onClick={() => setRoofType(rf)}
                          className={`py-3 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            roofType === rf
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {rf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Perkiraan Jarak Atap ke Panel Listrik (MCB)
                      </label>
                      <span className="text-xs font-bold text-amber-400">~{cableDistance} meter</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={5}
                      value={cableDistance}
                      onChange={(e) => setCableDistance(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>10m (Dekat)</span>
                      <span>50m (Sedang)</span>
                      <span>100m+ (Jauh)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Catatan Tambahan / Spesifikasi Khusus (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Ada 3 unit AC 2 PK, pompa submersible 1 PK. Atap menghadap utara tanpa bayangan pohon."
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  {/* LIVE SIZING PREVIEW SUMMARY */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2">
                      <span>📊 ESTIMASI SIMULASI AWAL ANDA</span>
                      <span className="bg-amber-500/10 px-2 py-0.5 rounded text-[10px]">Real-Time Sizing</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400 text-[11px]">Kapasitas Solar:</div>
                        <div className="font-bold text-white text-sm">~{sizingPreview.targetKwp} kWp</div>
                        <div className="text-[10px] text-slate-500">({sizingPreview.panelsCount} Panel Tier-1)</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px]">Potensi Hemat:</div>
                        <div className="font-bold text-emerald-400 text-sm">~Rp {sizingPreview.estMonthlySaving.toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-500">Per bulan</div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-slate-400 text-[11px]">Baterai Cadangan:</div>
                        <div className="font-semibold text-white text-xs truncate">{sizingPreview.batteryText}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all"
                  >
                    ← Kembali
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && (!name.trim() || !phone.trim())) {
                        setErrorMessage('Nama dan Nomor WhatsApp wajib diisi sebelum lanjut.');
                        return;
                      }
                      setErrorMessage('');
                      setStep((s) => s + 1);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    Lanjutkan →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Memproses Data...' : 'Kirim Kebutuhan PLTS Saya ⚡'}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        <p>© {new Date().getFullYear()} PT SUNBLIX ENERGI INDONESIA. Seluruh Hak Cipta Dilindungi.</p>
        <p className="mt-1 text-[11px] text-slate-700">Official Preliminary Planning Portal • Powered by SUNBLIX Engineering OS</p>
      </footer>
    </div>
  );
}
