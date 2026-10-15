'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import MobileDrawer from '../../components/MobileDrawer';
import QuoteModal from '../../components/QuoteModal';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import FloatingBackToTop from '../../components/FloatingBackToTop';
import './partnership.css';

const PARTNERSHIP_CATEGORIES = [
  {
    id: 'pv-inverter',
    title: 'Distributor / Principal Solar PV & Inverter Tier-1',
    icon: '⚡',
    desc: 'Pengadaan modul surya BloombergNEF Tier-1, Smart Hybrid Inverters, serta sistem Battery Energy Storage System (LiFePO4) bergaransi resmi.',
    scope: [
      'Modul surya Monocrystalline & Bifacial (585Wp - 720Wp+)',
      'Hybrid Inverter 1-Phase & 3-Phase bersertifikasi internasional',
      'Battery Storage ESS berkapasitas 2.56 kWh hingga 50 kWh+',
      'Dukungan ketersediaan spare-part dan garansi principal',
    ],
  },
  {
    id: 'epc-subcon',
    title: 'Subkontraktor & Tim Instalasi EPC PLTS Lokal',
    icon: '🏗️',
    desc: 'Kerjasama dengan kontraktor kelistrikan dan tim instalatur lokal di pulau Jawa, Sumatera, Bali, Kalimantan, dan Indonesia Timur.',
    scope: [
      'Penyediaan tenaga ahli instalasi panel surya bersertifikasi K3',
      'Pengerjaan mekanikal mounting atap dan jalur kabel AC/DC',
      'Pengujian komisioning dan pengetesan isolasi kelistrikan',
      'Survei drone dan audit struktur atap bangunan',
    ],
  },
  {
    id: 'mounting-racking',
    title: 'Produsen Mounting Rail & Rak Atap Aluminium',
    icon: '🔩',
    desc: 'Pengadaan struktur dudukan aluminium anodized AL6005-T5, clamp set, grounding accessories, dan braket genteng/metal roof tahan korosi.',
    scope: [
      'Rail aluminium anodized tahan korosi standar C4/C5',
      'Mid-clamp, end-clamp, grounding lug & bonding jumper',
      'Braket L-feet, hanger bolt, dan standing seam clamp',
      'Uji beban angin (wind tunnel test hingga 120 km/jam)',
    ],
  },
  {
    id: 'electrical-cable',
    title: 'Supplier Kabel Surya DC/AC & Proteksi SNI',
    icon: '🔌',
    desc: 'Penyedia kabel khusus surya PV1-F/H1Z2Z2-K bersertifikasi TÜV & SNI, arrester petir SPD Tipe 1+2, MCB/MCCB DC, dan combiner box IP65.',
    scope: [
      'Kabel DC Surya 1x4mm², 1x6mm² tahan radiasi UV & suhu tinggi',
      'Kabel AC NYY, NYFGBY, dan NYM bersertifikasi SNI',
      'Surge Protection Device (SPD) DC 1000V & AC 400V',
      'Panel distribusi AC/DC lengkap dengan busbar tembaga murni',
    ],
  },
  {
    id: 'developer-architect',
    title: 'Pengembang Properti, Arsitek & Desain Hijau',
    icon: '🏡',
    desc: 'Kolaborasi strategis dengan developer perumahan cluster, arsitek vila mewah, dan kontraktor bangunan hijau untuk integrasi PLTS siap huni.',
    scope: [
      'Penyediaan paket PLTS terintegrasi sejak tahap desain bangunan',
      'Desain estetika atap selaras arsitektur modern (BIPV)',
      'Peningkatan nilai jual properti eco-friendly berstandar hijau',
      'Program skema bundling pembiayaan properti ramah lingkungan',
    ],
  },
  {
    id: 'logistics-heavy',
    title: 'Jasa Ekspedisi Logistik Spesialis & Forklift',
    icon: '🚚',
    desc: 'Kemitraan ekspedisi kargo darat, laut, dan udara untuk pengiriman modul kaca surya sensitif, unit inverter, dan baterai berat ke 19+ kota.',
    scope: [
      'Pengiriman kargo palet kaca solar dengan jaminan asuransi aman',
      'Layanan unloading forklift/crane di gudang maupun lokasi proyek',
      'Rute reguler Jabodetabek ke kota-kota besar di seluruh Indonesia',
      'Sistem pelacakan real-time dan bukti serah terima terintegrasi',
    ],
  },
];

export default function PartnershipPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    companyName: '',
    entityType: 'PT (Perseroan Terbatas)',
    picName: '',
    picPosition: '',
    email: '',
    whatsapp: '',
    category: 'Distributor / Principal Solar PV & Inverter Tier-1',
    coverageArea: '',
    website: '',
    npwp: '',
    companyProfileUrl: '',
    pastExperience: '',
    proposalDescription: '',
    agreeTerms: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleSelectCategory = (catTitle) => {
    setFormData((prev) => ({
      ...prev,
      category: catTitle,
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

    if (
      !formData.companyName.trim() ||
      !formData.picName.trim() ||
      !formData.email.trim() ||
      !formData.whatsapp.trim() ||
      !formData.category.trim()
    ) {
      setErrorMsg('Mohon lengkapi nama perusahaan, nama PIC, email, nomor WhatsApp, dan kategori kemitraan.');
      return;
    }

    if (!formData.companyProfileUrl.trim()) {
      setErrorMsg('Mohon cantumkan link Company Profile / Katalog Produk / Price List online (Google Drive, Dropbox, dsb).');
      return;
    }

    if (!formData.proposalDescription.trim()) {
      setErrorMsg('Mohon jelaskan ringkasan penawaran kerjasama dan spesifikasi produk/jasa yang diajukan.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg('Anda harus menyetujui pernyataan keabsahan perwakilan perusahaan.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/partnership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengirim formulir kemitraan vendor.');
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
      companyName: '',
      entityType: 'PT (Perseroan Terbatas)',
      picName: '',
      picPosition: '',
      email: '',
      whatsapp: '',
      category: 'Distributor / Principal Solar PV & Inverter Tier-1',
      coverageArea: '',
      website: '',
      npwp: '',
      companyProfileUrl: '',
      pastExperience: '',
      proposalDescription: '',
      agreeTerms: true,
    });
  };

  const handleWhatsAppConfirm = () => {
    const code = submissionSuccess?.partnerId || 'SBX-VND2026';
    const text = `Halo Tim Procurement PT SUNBLIX ENERGI INDONESIA,\n\nKami telah mendaftarkan profil kemitraan vendor di website resmi SUNBLIX dengan No. Registrasi: *${code}*.\n\n*Nama Perusahaan:* ${formData.companyName} (${formData.entityType})\n*PIC:* ${formData.picName} (${formData.picPosition})\n*Kategori:* ${formData.category}\n*Wilayah Operasional:* ${formData.coverageArea}\n*Link Company Profile / Katalog:* ${formData.companyProfileUrl}\n\nMohon konfirmasi dan info tahapan kurasi vendor selanjutnya. Terima kasih.`;
    const url = `https://wa.me/6285288581027?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="partnership-root">
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
      <header className="partnership-hero">
        <div className="partnership-hero-content">
          <div className="partnership-badge">
            <span>🤝</span>
            <span>VENDOR &amp; STRATEGIC PARTNERSHIP • SUNBLIX ECOSYSTEM</span>
          </div>
          <h1 className="partnership-title">
            Tumbuh Bersama <span className="highlight-gradient">Ekosistem PLTS</span> Terdepan di Indonesia
          </h1>
          <p className="partnership-desc">
            PT SUNBLIX ENERGI INDONESIA membuka kolaborasi strategis bagi distributor Tier-1 global, kontraktor
            EPC lokal, produsen mounting terstandarisasi, dan pengembang properti. Mari bangun sinergi berkelanjutan
            dengan standar pengadaan yang transparan dan profesional.
          </p>

          <div className="partnership-pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">🌐</div>
              <h3 className="pillar-title">Jaringan Proyek 19+ Kota</h3>
              <p className="pillar-desc">
                Suplai material Anda akan diserap secara konsisten di proyek-proyek residensial, villa mewah, dan
                komersial di berbagai penjuru nusantara.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">💎</div>
              <h3 className="pillar-title">Standar Tier-1 &amp; Mutu Tinggi</h3>
              <p className="pillar-desc">
                Kami mengutamakan kualitas komponen bersertifikasi SNI &amp; internasional untuk menjamin kepuasan
                konsumen jangka panjang.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">⏱️</div>
              <h3 className="pillar-title">Pembayaran Transparan &amp; Tepat Waktu</h3>
              <p className="pillar-desc">
                Sistem administrasi, verifikasi faktur PO, dan termin pembayaran vendor teratur sesuai kesepakatan
                kontrak kerja sama resmi.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">📈</div>
              <h3 className="pillar-title">Pertumbuhan Saling Menguntungkan</h3>
              <p className="pillar-desc">
                Dukungan co-branding, pertukaran keahlian engineering, dan kemitraan jangka panjang yang kokoh.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION: PARTNERSHIP CATEGORIES */}
      <section className="partnership-section">
        <div className="section-head">
          <h2 className="section-head-title">Kategori Kemitraan yang Kami Buka</h2>
          <p className="section-head-desc">
            Pilihlah bidang pengadaan atau jasa yang sesuai dengan spesialisasi perusahaan Anda untuk memulai
            proses onboarding rekanan resmi SUNBLIX.
          </p>
        </div>

        <div className="category-cards-grid">
          {PARTNERSHIP_CATEGORIES.map((cat) => (
            <div className="category-card" key={cat.id}>
              <div>
                <div className="cat-header">
                  <div className="cat-icon-wrap">{cat.icon}</div>
                  <h3 className="cat-title">{cat.title}</h3>
                </div>
                <p className="cat-desc">{cat.desc}</p>
                <ul className="cat-scope-list">
                  {cat.scope.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="cat-apply-btn"
                onClick={() => handleSelectCategory(cat.title)}
              >
                <span>Ajukan Kemitraan Ini</span>
                <span>↓</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: VENDOR REGISTRATION FORM */}
      <section className="partnership-section partnership-form-anchor" id="vendorForm" ref={formRef}>
        <div className="partnership-form-card">
          {submissionSuccess ? (
            <div className="submission-success-card">
              <div className="success-icon-wrap">✓</div>
              <h3 className="success-title">Pendaftaran Kemitraan Berhasil!</h3>
              <div className="success-ref-pill">
                No. Registrasi Vendor: {submissionSuccess.partnerId}
              </div>
              <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto 24px', fontSize: '15px' }}>
                Terima kasih atas minat perusahaan Anda untuk bermitra dengan PT SUNBLIX ENERGI INDONESIA. Tim
                Procurement &amp; Supply Chain kami akan menelaah katalog dan proposal kerjasama Anda dalam waktu
                2-3 hari kerja.
              </p>

              <div className="success-summary-box">
                <div className="summary-item-row">
                  <span className="summary-item-label">Nama Perusahaan:</span>
                  <span className="summary-item-val">{formData.companyName}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">Contact Person (PIC):</span>
                  <span className="summary-item-val">{formData.picName} ({formData.picPosition})</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">Kategori Kemitraan:</span>
                  <span className="summary-item-val">{formData.category}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">Email Perusahaan:</span>
                  <span className="summary-item-val">{formData.email}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">WhatsApp PIC:</span>
                  <span className="summary-item-val">{formData.whatsapp}</span>
                </div>
                <div className="summary-item-row">
                  <span className="summary-item-label">Tanggal Masuk:</span>
                  <span className="summary-item-val">{submissionSuccess.data?.receivedAt || 'Hari Ini'}</span>
                </div>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn-wa-confirm"
                  onClick={handleWhatsAppConfirm}
                >
                  <span>💬 Hubungi Tim Procurement via WhatsApp</span>
                </button>
                <button
                  type="button"
                  className="btn-reset-form"
                  onClick={handleResetForm}
                >
                  <span>Daftarkan Bidang Kemitraan Lain</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-header-badge">
                <span>📋</span>
                <span>REGISTRASI VENDOR &amp; MITRA RESMI SUNBLIX</span>
              </div>
              <h2 className="form-header-title">Formulir Kemitraan Vendor &amp; Rekanan</h2>
              <p className="form-header-desc">
                Mohon lengkapi profil perusahaan, kontak penanggung jawab, serta dokumen katalog/penawaran produk
                Anda. Tim kami akan melakukan kurasi spesifikasi dan menghubungi Anda untuk tahapan kesepakatan
                kerjasama (PKS).
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
                    <label className="form-label" htmlFor="companyName">
                      Nama Perusahaan / Badan Usaha <span className="label-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      className="form-input"
                      placeholder="Contoh: PT Surya Jaya Elektrikal"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="entityType">
                      Bentuk Badan Usaha <span className="label-required">*</span>
                    </label>
                    <select
                      id="entityType"
                      name="entityType"
                      className="form-select"
                      value={formData.entityType}
                      onChange={handleChange}
                      required
                    >
                      <option value="PT (Perseroan Terbatas)">PT (Perseroan Terbatas)</option>
                      <option value="CV (Persekutuan Komanditer)">CV (Persekutuan Komanditer)</option>
                      <option value="Distributor Resmi / Principal Cabang">Distributor Resmi / Principal Cabang</option>
                      <option value="Koperasi / Usaha Dagang (UD)">Koperasi / Usaha Dagang (UD)</option>
                      <option value="Firma / Konsultan Profesional">Firma / Konsultan Profesional</option>
                      <option value="Perorangan / Mandiri">Perorangan / Mandiri</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="picName">
                      Nama Kontak Person (PIC) <span className="label-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="picName"
                      name="picName"
                      className="form-input"
                      placeholder="Nama lengkap penanggung jawab"
                      value={formData.picName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="picPosition">
                      Jabatan PIC <span className="label-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="picPosition"
                      name="picPosition"
                      className="form-input"
                      placeholder="Contoh: Direktur / Sales Manager / Procurement"
                      value={formData.picPosition}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Alamat Email Resmi Perusahaan <span className="label-required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      placeholder="sales@perusahaan.com atau info@perusahaan.co.id"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="whatsapp">
                      Nomor WhatsApp PIC / Hotline Vendor <span className="label-required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      className="form-input"
                      placeholder="Contoh: 081298765432"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">
                      Kategori Kemitraan <span className="label-required">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {PARTNERSHIP_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.title}>
                          {cat.title}
                        </option>
                      ))}
                      <option value="Kemitraan Lainnya (Custom Partnership)">
                        Kemitraan Lainnya (Spesifikasi Khusus)
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="coverageArea">
                      Kota Kantor Pusat &amp; Wilayah Layanan <span className="label-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="coverageArea"
                      name="coverageArea"
                      className="form-input"
                      placeholder="Contoh: Surabaya (Melayani Jawa Timur &amp; Bali)"
                      value={formData.coverageArea}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="website">
                      Website / Media Sosial Perusahaan
                      <span className="label-hint">https://...</span>
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      className="form-input"
                      placeholder="https://www.perusahaan.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="npwp">
                      Nomor Pokok Wajib Pajak (NPWP) / NIB
                      <span className="label-hint">Opsional untuk verifikasi legal</span>
                    </label>
                    <input
                      type="text"
                      id="npwp"
                      name="npwp"
                      className="form-input"
                      placeholder="Nomor NPWP / NIB Badan Usaha"
                      value={formData.npwp}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="companyProfileUrl">
                      Link Company Profile, Katalog &amp; Price List <span className="label-required">*</span>
                      <span className="label-hint">Google Drive / Dropbox / Website</span>
                    </label>
                    <input
                      type="url"
                      id="companyProfileUrl"
                      name="companyProfileUrl"
                      className="form-input"
                      placeholder="https://drive.google.com/file/d/..."
                      value={formData.companyProfileUrl}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pastExperience">
                      Portofolio / Pengalaman Proyek Terkait
                      <span className="label-hint">Proyek yang pernah disuplai</span>
                    </label>
                    <input
                      type="text"
                      id="pastExperience"
                      name="pastExperience"
                      className="form-input"
                      placeholder="Contoh: Suplai 500kWp mounting PLTS industri di Cikarang"
                      value={formData.pastExperience}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="proposalDescription">
                    Rincian Penawaran Kerjasama &amp; Spesifikasi Produk/Jasa <span className="label-required">*</span>
                    <span className="label-hint">Jelaskan keunggulan produk/layanan Anda</span>
                  </label>
                  <textarea
                    id="proposalDescription"
                    name="proposalDescription"
                    className="form-textarea"
                    placeholder="Jelaskan spesifikasi teknis komponen, merek/brand, kapasitas suplai bulanan, ketentuan garansi, dan nilai tambah yang perusahaan Anda tawarkan kepada PT SUNBLIX ENERGI INDONESIA..."
                    value={formData.proposalDescription}
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
                    Saya menyatakan bahwa data perusahaan dan penawaran kemitraan ini disampaikan secara resmi
                    oleh perwakilan yang sah atas nama badan usaha terkait.
                  </span>
                </label>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    className="btn-submit-vendor"
                    disabled={submitting}
                  >
                    <span>{submitting ? 'Mengirimkan Pendaftaran...' : 'Kirim Formulir Kemitraan Vendor ➔'}</span>
                  </button>
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                    Pertanyaan pengadaan atau proposal kemitraan khusus? Hubungi tim procurement via email:{' '}
                    <a href="mailto:vendor@sunblix.id" style={{ color: '#34d399', textDecoration: 'underline' }}>
                      vendor@sunblix.id
                    </a>{' '}
                    atau{' '}
                    <a href="mailto:procurement@sunblix.id" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                      procurement@sunblix.id
                    </a>.
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* FOOTER STRIP */}
      <footer className="partnership-footer">
        <div className="partnership-footer-inner">
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="partnership-footer-logo" />
          <p className="partnership-footer-text">
            PT SUNBLIX ENERGI INDONESIA — Mitra Terpercaya Solusi PLTS Rooftop Residensial &amp; Komersial.
            Bintaro Business Centre, Jl RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330.
          </p>
          <div className="partnership-footer-links">
            <Link href="/">← Kembali ke Beranda</Link>
            <span>•</span>
            <Link href="/career">Karir &amp; Rekrutmen</Link>
            <span>•</span>
            <a href="https://wa.me/6285288581027" target="_blank" rel="noopener noreferrer">Hotline Vendor WhatsApp</a>
          </div>
          <span className="partnership-footer-copy">
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
