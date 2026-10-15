'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import MobileDrawer from '../../components/MobileDrawer';
import QuoteModal from '../../components/QuoteModal';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import FloatingBackToTop from '../../components/FloatingBackToTop';
import './career.css';

const OPEN_POSITIONS = [
  {
    id: 'pv-engineer',
    title: 'Solar PV Project Engineer & Estimator',
    dept: 'Engineering & Project',
    type: 'Full-time',
    location: 'Jabodetabek (Hybrid)',
    urgent: true,
    description:
      'Bertanggung jawab merancang layout solar PV sistematis, kalkulasi BoQ teknis, simulasi radiasi bayangan via PVSyst / Helioscope, dan koordinasi dengan tim instalasi lapangan.',
    requirements: [
      'Pendidikan minimal D3/S1 Teknik Elektro / Energi Terbarukan / Teknik Mesin.',
      'Pengalaman min. 1-2 tahun dalam perancangan sistem PLTS Rooftop (On-Grid / Hybrid).',
      'Mahir mengoperasikan AutoCAD, PVSyst, SketchUp, dan kalkulasi BoQ material.',
      'Memahami regulasi teknis SLO ESDM dan standar instalasi PLN Net-Metering.',
    ],
  },
  {
    id: 'electrical-specialist',
    title: 'Electrical & Inverter Specialist (K3 & SLO)',
    dept: 'Technical & Field EPC',
    type: 'Full-time',
    location: 'Jabodetabek & Seluruh Proyek',
    urgent: true,
    description:
      'Memimpin komisioning kelistrikan, wiring inverter hybrid, sistem proteksi petir & surge arrester (SPD), serta pengujian standar keselamatan kerja instalasi PLTS.',
    requirements: [
      'Pendidikan SMK Listrik / D3 / S1 Teknik Elektro.',
      'Memiliki sertifikasi K3 Listrik / AK3U (menjadi nilai tambah kuat).',
      'Pengalaman min. 2 tahun dalam instalasi panel distribusi AC/DC dan Inverter Tier-1.',
      'Mampu bekerja di ketinggian (roof work) dengan protokol keselamatan ketat.',
    ],
  },
  {
    id: 'solar-consultant',
    title: 'B2B & Residential Solar Energy Consultant',
    dept: 'Sales & Business Development',
    type: 'Full-time',
    location: 'Jakarta / Surabaya / Bali',
    urgent: false,
    description:
      'Melakukan konsultasi efisiensi energi surya kepada pemilik rumah mewah, villa, dan sektor komersial. Mempresentasikan simulasi ROI dan penawaran resmi SUNBLIX.',
    requirements: [
      'Pendidikan min. D3/S1 semua jurusan (diutamakan Teknik / Manajemen / Komunikasi).',
      'Keahlian komunikasi interpersonal dan negosiasi yang luar biasa.',
      'Pengalaman minimal 1 tahun di bidang konsultasi energi, real estate, atau B2B sales.',
      'Mampu membaca rekening tagihan PLN dan menjelaskan potensi penghematan listrik.',
    ],
  },
  {
    id: 'procurement-officer',
    title: 'Supply Chain & Procurement Specialist',
    dept: 'Procurement & Logistics',
    type: 'Full-time',
    location: 'Head Office Bintaro, Jakarta',
    urgent: false,
    description:
      'Mengelola pengadaan komponen Tier-1 (Solar Module, Inverter, Baterai LiFePO4, Mounting Aluminium), negosiasi vendor prinsipal, dan kontrol rantai pasok ke 19+ kota.',
    requirements: [
      'Pendidikan S1 Manajemen Rantai Pasok / Teknik Industri / Administrasi Bisnis.',
      'Pengalaman min. 2 tahun dalam pengadaan material proyek engineering atau industri terkait.',
      'Kemampuan negosiasi harga dan pemahaman mendalam tentang logistik nasional.',
      'Teliti dalam mengelola dokumen Purchase Order, faktur, dan kontrak vendor.',
    ],
  },
  {
    id: 'iot-software',
    title: 'IoT & Smart Monitoring Software Specialist',
    dept: 'Digital Innovation & IoT',
    type: 'Full-time / Remote Hybrid',
    location: 'Jakarta Selatan / Remote',
    urgent: false,
    description:
      'Mengembangkan integrasi platform telemetri monitoring PLTS SUNBLIX Cloud, API smart meter inverter, serta automasi pelaporan efisiensi kWh untuk pelanggan.',
    requirements: [
      'Pendidikan S1 Ilmu Komputer / Teknik Informatika / Sistem Informasi.',
      'Pengalaman integrasi protokol telemetri IoT (Modbus RTU/TCP, MQTT, REST API).',
      'Familiar dengan Next.js, Node.js, TimescaleDB/PostgreSQL, dan visualisasi grafik daya.',
      'Passion tinggi dalam teknologi energi terbarukan dan smart home automation.',
    ],
  },
  {
    id: 'general-app',
    title: 'Talent Pool & Magang Energi Surya',
    dept: 'Human Capital & Operasional',
    type: 'Internship / Full-time',
    location: 'Seluruh Indonesia',
    urgent: false,
    description:
      'Terbuka bagi fresh graduate, mahasiswa tingkat akhir, atau profesional berbakat yang ingin merintis karir di sektor transisi energi bersih dan ramah lingkungan.',
    requirements: [
      'Semangat belajar tinggi, integritas, dan antusiasme terhadap energi terbarukan.',
      'Kemampuan problem-solving dan kerja sama tim yang solid.',
      'Terbuka untuk jurusan Teknik, Desain Komunikasi Visual, Pemasaran, hingga Finansial.',
    ],
  },
];

export default function CareerPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    city: '',
    position: 'Solar PV Project Engineer & Estimator',
    education: 'S1 (Sarjana)',
    experience: '1 - 2 Tahun',
    institution: '',
    expectedSalary: '',
    availability: 'Segera (Immediate)',
    portfolioUrl: '',
    skills: '',
    bio: '',
    agreeTerms: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleSelectJob = (jobTitle) => {
    setFormData((prev) => ({
      ...prev,
      position: jobTitle,
    }));
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      setErrorMsg('Mohon lengkapi nama lengkap, alamat email, dan nomor WhatsApp aktif Anda.');
      return;
    }

    if (!formData.portfolioUrl.trim()) {
      setErrorMsg('Mohon lampirkan link Resume / CV / Portofolio online Anda (Google Drive, LinkedIn, dsb).');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg('Anda harus menyetujui pernyataan kebenaran data biodata.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengirim formulir lamaran kerja.');
      }

      setSubmissionSuccess(json);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi gangguan jaringan. Silakan hubungi kami via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionSuccess(null);
    setFormData({
      fullName: '',
      email: '',
      whatsapp: '',
      city: '',
      position: 'Solar PV Project Engineer & Estimator',
      education: 'S1 (Sarjana)',
      experience: '1 - 2 Tahun',
      institution: '',
      expectedSalary: '',
      availability: 'Segera (Immediate)',
      portfolioUrl: '',
      skills: '',
      bio: '',
      agreeTerms: true,
    });
  };

  const handleWhatsAppConfirm = () => {
    const code = submissionSuccess?.applicationId || 'SBX-HR2026';
    const text = `Halo Tim HR PT SUNBLIX ENERGI INDONESIA,\n\nSaya telah mengisi formulir biodata pelamar kerja di website resmi SUNBLIX dengan kode registrasi: *${code}*.\n\n*Nama:* ${formData.fullName}\n*Posisi Dilamar:* ${formData.position}\n*Pendidikan:* ${formData.education} (${formData.institution || '-'})\n*Pengalaman:* ${formData.experience}\n*Link CV/Portfolio:* ${formData.portfolioUrl}\n\nMohon konfirmasi penerimaan berkas biodata saya. Terima kasih.`;
    const url = `https://wa.me/6285288581027?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="career-root">
      {/* NAVBAR */}
      <Navbar
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenQuote={() => setQuoteModalOpen(true)}
      />

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenQuote={() => {
          setDrawerOpen(false);
          setQuoteModalOpen(true);
        }}
      />

      {/* HERO SECTION */}
      <header className="career-hero">
        <div className="career-hero-content">
          <div className="career-badge">
            <span>☀️</span>
            <span>KARIR &amp; TALENTA • PT SUNBLIX ENERGI INDONESIA</span>
          </div>
          <h1 className="career-title">
            Bangun Masa Depan <span className="highlight-gradient">Energi Bersih</span> Bersama SUNBLIX
          </h1>
          <p className="career-desc">
            Jadilah bagian dari akselerasi transisi energi terbarukan di Indonesia. Kami mengundang tenaga
            profesional, insinyur berdedikasi, dan talenta visioner untuk tumbuh bersama dalam ekosistem PLTS
            Rooftop terpercaya di 19+ kota.
          </p>

          <div className="career-quick-stats">
            <div className="career-stat-card">
              <div className="career-stat-number">19+</div>
              <div className="career-stat-label">Kota Jangkauan Proyek</div>
            </div>
            <div className="career-stat-card">
              <div className="career-stat-number">Inovatif</div>
              <div className="career-stat-label">Pengembangan Skill &amp; Karir</div>
            </div>
            <div className="career-stat-card">
              <div className="career-stat-number">Kolaboratif</div>
              <div className="career-stat-label">Budaya Kerja Terbuka &amp; Solid</div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION: WHY SUNBLIX */}
      <section className="career-section">
        <div className="section-head">
          <h2 className="section-head-title">Mengapa Mengembangkan Karir di SUNBLIX?</h2>
          <p className="section-head-desc">
            Kami percaya kemajuan energi bersih bermula dari manusia-manusia unggul di baliknya. Kami
            memberikan lingkungan yang memacu inovasi, keselamatan, dan apresiasi nyata.
          </p>
        </div>

        <div className="career-perks-grid">
          <div className="career-perk-card">
            <div className="perk-icon-bubble">🌱</div>
            <h3 className="perk-title">Dampak Nyata Transisi Hijau</h3>
            <p className="perk-desc">
              Setiap proyek kilowatt-peak yang Anda selesaikan secara langsung mereduksi tonase emisi karbon dan
              memajukan target Net Zero Emission Indonesia.
            </p>
          </div>

          <div className="career-perk-card">
            <div className="perk-icon-bubble">⚡</div>
            <h3 className="perk-title">Teknologi Solar Terkini</h3>
            <p className="perk-desc">
              Bekerja dengan hardware solar Tier-1 global BloombergNEF, smart hybrid inverter berefisiensi 98%+,
              serta sistem cloud telemetri IoT real-time.
            </p>
          </div>

          <div className="career-perk-card">
            <div className="perk-icon-bubble">🎓</div>
            <h3 className="perk-title">Pelatihan &amp; Sertifikasi Resmi</h3>
            <p className="perk-desc">
              Dukungan penuh sertifikasi teknis kelistrikan, sertifikasi keselamatan kerja K3, pelatihan software
              PVSyst, dan mentoring engineering berkala.
            </p>
          </div>

          <div className="career-perk-card">
            <div className="perk-icon-bubble">🏆</div>
            <h3 className="perk-title">Kompensasi &amp; Insentif Kompetitif</h3>
            <p className="perk-desc">
              Paket remunerasi berbasis kinerja, jaminan asuransi kesehatan, tunjangan proyek lapangan, serta
              peluang percepatan jenjang karir yang transparan.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: OPEN POSITIONS */}
      <section className="career-section">
        <div className="section-head">
          <h2 className="section-head-title">Peluang Karir Terbuka Saat Ini</h2>
          <p className="section-head-desc">
            Pilihlah posisi yang sesuai dengan keahlian dan aspirasi Anda, lalu isi formulir biodata pelamar di
            bawah ini.
          </p>
        </div>

        <div className="career-jobs-grid">
          {OPEN_POSITIONS.map((job) => (
            <div className="job-card" key={job.id}>
              <div>
                <div className="job-tag-row">
                  <span className="job-tag tag-dept">{job.dept}</span>
                  <span className="job-tag">{job.type}</span>
                  {job.urgent && <span className="job-tag tag-urgent">🔥 Dibutuhkan Segera</span>}
                </div>
                <h3 className="job-title">{job.title}</h3>
                <div className="job-meta-row">
                  <span className="job-meta-item">📍 {job.location}</span>
                </div>
                <p className="job-description">{job.description}</p>
                <ul className="job-requirements-list">
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="job-apply-btn"
                onClick={() => handleSelectJob(job.title)}
              >
                <span>Lamar Posisi Ini</span>
                <span>↓</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: APPLICATION FORM */}
      <section className="career-section career-form-anchor" id="applicantForm" ref={formRef}>
        <div className="career-form-card">
          {submissionSuccess ? (
            <div className="submission-success-card">
              <div className="success-icon-wrap">✓</div>
              <h3 className="success-title">Biodata Lamaran Berhasil Diterima!</h3>
              <div className="success-ref-pill">
                Kode Registrasi Pelamar: {submissionSuccess.applicationId}
              </div>
              <p style={{ color: '#94a3b8', maxWidth: '620px', margin: '0 auto 24px', fontSize: '15px' }}>
                Terima kasih telah mendaftar di PT SUNBLIX ENERGI INDONESIA. Tim Human Capital kami akan
                melakukan verifikasi berkas dan menghubungi Anda dalam 3-5 hari kerja jika profil Anda memenuhi
                kriteria.
              </p>

              <div className="success-summary-box">
                <div className="summary-item-row">
                  <span className="summary-item-label">Nama Pelamar:</span>
                  <span className="summary-item-val">{formData.fullName}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">Posisi Dilamar:</span>
                  <span className="summary-item-val">{formData.position}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">Email:</span>
                  <span className="summary-item-val">{formData.email}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">WhatsApp:</span>
                  <span className="summary-item-val">{formData.whatsapp}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">Tanggal Pengajuan:</span>
                  <span className="summary-item-val">{submissionSuccess.data?.receivedAt || 'Hari Ini'}</span>
                </div>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn-wa-confirm"
                  onClick={handleWhatsAppConfirm}
                >
                  <span>💬 Konfirmasi ke Tim HR via WhatsApp</span>
                </button>
                <button
                  type="button"
                  className="btn-reset-form"
                  onClick={handleResetForm}
                >
                  <span>Kirim Lamaran Posisi Lain</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-header-badge">
                <span>📋</span>
                <span>PORTAL RESMI REKRUTMEN PT SUNBLIX ENERGI INDONESIA</span>
              </div>
              <h2 className="form-header-title">Formulir Biodata Calon Pelamar</h2>
              <p className="form-header-desc">
                Silakan lengkapi biodata pribadi dan data pengalaman Anda dengan akurat. Seluruh data yang Anda
                kirimkan akan dijaga kerahasiaannya dan hanya digunakan untuk keperluan seleksi kerja internal
                SUNBLIX.
              </p>

              {errorMsg && (
                <div className="form-error-banner" style={{ marginBottom: '20px' }}>
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="applicant-form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">
                      Nama Lengkap (Sesuai KTP) <span className="label-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      className="form-input"
                      placeholder="Contoh: Raden Satria Wibowo, S.T."
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Alamat Email Aktif <span className="label-required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      placeholder="nama.anda@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="whatsapp">
                      Nomor WhatsApp / HP Aktif <span className="label-required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      className="form-input"
                      placeholder="Contoh: 081234567890"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="city">
                      Kota Domisili Saat Ini <span className="label-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="form-input"
                      placeholder="Contoh: Jakarta Selatan / Surabaya / Bali"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="position">
                      Posisi yang Dilamar <span className="label-required">*</span>
                    </label>
                    <select
                      id="position"
                      name="position"
                      className="form-select"
                      value={formData.position}
                      onChange={handleChange}
                      required
                    >
                      {OPEN_POSITIONS.map((pos) => (
                        <option key={pos.id} value={pos.title}>
                          {pos.title}
                        </option>
                      ))}
                      <option value="Posisi Lainnya (General Inquiries)">
                        Posisi Lainnya (Kualifikasi Lain)
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="education">
                      Pendidikan Terakhir <span className="label-required">*</span>
                    </label>
                    <select
                      id="education"
                      name="education"
                      className="form-select"
                      value={formData.education}
                      onChange={handleChange}
                      required
                    >
                      <option value="SMK / SMA Sederajat">SMK / SMA Sederajat (Teknik Listrik / Mesin)</option>
                      <option value="D3 (Diploma)">D3 (Diploma)</option>
                      <option value="D4 / S1 (Sarjana)">D4 / S1 (Sarjana)</option>
                      <option value="S2 (Magister)">S2 (Magister)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="institution">
                      Jurusan &amp; Universitas / Sekolah
                      <span className="label-hint">Nama kampus / sekolah</span>
                    </label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      className="form-input"
                      placeholder="Contoh: Teknik Elektro, Universitas Indonesia"
                      value={formData.institution}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="experience">
                      Pengalaman Kerja Relevan <span className="label-required">*</span>
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      className="form-select"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                    >
                      <option value="Fresh Graduate (Baru Lulus)">Fresh Graduate (Baru Lulus)</option>
                      <option value="1 - 2 Tahun">1 - 2 Tahun</option>
                      <option value="3 - 5 Tahun">3 - 5 Tahun</option>
                      <option value="Lebih dari 5 Tahun">&gt; 5 Tahun (Senior)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="portfolioUrl">
                      Link CV / Resume / Portofolio / LinkedIn <span className="label-required">*</span>
                      <span className="label-hint">Google Drive / Dropbox / LinkedIn</span>
                    </label>
                    <input
                      type="url"
                      id="portfolioUrl"
                      name="portfolioUrl"
                      className="form-input"
                      placeholder="https://drive.google.com/... atau https://linkedin.com/in/..."
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="expectedSalary">
                      Ekspektasi Gaji Bulanan (IDR)
                      <span className="label-hint">Dapat dinegosiasikan</span>
                    </label>
                    <input
                      type="text"
                      id="expectedSalary"
                      name="expectedSalary"
                      className="form-input"
                      placeholder="Contoh: Rp 8.000.000 - Rp 12.000.000"
                      value={formData.expectedSalary}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="availability">
                      Ketersediaan Bergabung
                    </label>
                    <select
                      id="availability"
                      name="availability"
                      className="form-select"
                      value={formData.availability}
                      onChange={handleChange}
                    >
                      <option value="Segera (Immediate)">Segera (Immediate)</option>
                      <option value="1 - 2 Minggu (Notice Period)">1 - 2 Minggu (Notice Period)</option>
                      <option value="1 Bulan (1 Month Notice)">1 Bulan (1 Month Notice)</option>
                      <option value="Fleksibel / Sesuai Kesepakatan">Fleksibel / Sesuai Kesepakatan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="skills">
                      Keahlian Utama &amp; Sertifikasi (Opsional)
                      <span className="label-hint">K3, AutoCAD, PVSyst, dll</span>
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      className="form-input"
                      placeholder="Contoh: AutoCAD, PVSyst, Sertifikasi AK3U Listrik, SIM A"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bio">
                    Ringkasan Biodata Diri &amp; Motivasi Bergabung <span className="label-required">*</span>
                    <span className="label-hint">Ceritakan pencapaian dan kelebihan Anda</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-textarea"
                    placeholder="Ceritakan latar belakang pendidikan, proyek kelistrikan/solar yang pernah Anda kerjakan, serta mengapa Anda tertarik berkarir di PT SUNBLIX ENERGI INDONESIA..."
                    value={formData.bio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <label className="form-checkbox-row">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span>
                    Saya menyatakan bahwa seluruh informasi dan biodata yang saya cantumkan di atas adalah
                    benar, akurat, dan dapat dipertanggungjawabkan keasliannya.
                  </span>
                </label>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    className="btn-submit-app"
                    disabled={submitting}
                  >
                    <span>{submitting ? 'Mengirimkan Biodata...' : 'Kirim Formulir Biodata Lamaran ➔'}</span>
                  </button>
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                    Butuh bantuan atau informasi rekrutmen lebih lanjut? Hubungi email:{' '}
                    <a href="mailto:career@sunblix.id" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                      career@sunblix.id
                    </a>{' '}
                    atau WhatsApp Hotline HR.
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* FOOTER STRIP */}
      <footer className="career-footer">
        <div className="career-footer-inner">
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="career-footer-logo" />
          <p className="career-footer-text">
            PT SUNBLIX ENERGI INDONESIA — Solusi Terpercaya PLTS Rooftop Residensial &amp; Komersial.
            Bintaro Business Centre, Jl RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330.
          </p>
          <div className="career-footer-links">
            <Link href="/">← Kembali ke Beranda</Link>
            <span>•</span>
            <Link href="/partnership">Kemitraan Vendor</Link>
            <span>•</span>
            <a href="https://wa.me/6285288581027" target="_blank" rel="noopener noreferrer">Hotline HR WhatsApp</a>
          </div>
          <span className="career-footer-copy">
            © 2026 PT SUNBLIX ENERGI INDONESIA. All rights reserved.
          </span>
        </div>
      </footer>

      {/* MODAL & FLOATING TOOLS */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
      <FloatingWhatsApp />
      <FloatingBackToTop />
    </div>
  );
}
