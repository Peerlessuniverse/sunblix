'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import MobileDrawer from '../../components/MobileDrawer';
import QuoteModal from '../../components/QuoteModal';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import FloatingBackToTop from '../../components/FloatingBackToTop';
import './faq.css';

const FAQ_DATA = [
  // 1. DASAR PLTS & CARA KERJA
  {
    id: 'faq-1',
    category: 'Dasar PLTS',
    question: 'Bagaimana cara kerja sistem panel surya (PLTS Atap) di rumah atau bangunan komersial?',
    answer:
      'Modul surya fotovoltaik (PV) yang terpasang di atap menangkap radiasi sinar matahari dan mengonversinya menjadi energi listrik arus searah (DC). Arus DC ini dialirkan ke Smart Inverter untuk diubah menjadi arus bolak-balik (AC) bertegangan standar (220V/380V). Listrik AC tersebut langsung disalurkan ke panel distribusi utama (distribution board) gedung untuk menyalakan beban elektronik secara otomatis dan sinkron dengan suplai PLN.',
  },
  {
    id: 'faq-2',
    category: 'Dasar PLTS',
    question: 'Apakah panel surya tetap menghasilkan listrik saat cuaca mendung atau hujan?',
    answer:
      'Ya, panel surya tetap memproduksi listrik saat cuaca berawan, mendung, atau hujan karena bekerja menyerap spektrum radiasi cahaya matahari (diffuse light), bukan panas suhu udara. Meskipun output daya menurun menjadi sekitar 20% – 40% dibandingkan saat terik optimal, kekurangan daya secara otomatis dipasok oleh jaringan PLN atau baterai tanpa ada jeda listrik mati. Selain itu, air hujan berfungsi alami membilas debu pada permukaan kaca modul.',
  },
  {
    id: 'faq-3',
    category: 'Dasar PLTS',
    question: 'Apa perbedaan antara sistem On-Grid, Off-Grid, dan Hybrid?',
    answer:
      '• On-Grid: Terhubung langsung dan sinkron dengan jaringan PLN tanpa baterai (paling ekonomis, sangat efektif memangkas tagihan listrik siang hari).\n• Off-Grid: Berdiri sendiri 100% menggunakan bank baterai tanpa ketergantungan pada jaringan PLN (ideal untuk perkebunan, pulau, atau area terpencil).\n• Hybrid: Solusi terlengkap yang menggabungkan panel surya, baterai lithium LiFePO4, dan jaringan PLN. Sistem ini memangkas tagihan listrik sekaligus berfungsi sebagai genset hening darurat saat PLN padam.',
  },
  {
    id: 'faq-4',
    category: 'Dasar PLTS',
    question: 'Bagaimana tahapan alur proyek pemasangan PLTS di SUNBLIX dari awal hingga menyala?',
    answer:
      'Pengerjaan proyek PLTS di SUNBLIX mencakup 6 tahapan komprehensif:\n1. Studi Kelayakan & Analisis 3D Shading: Inspeksi struktur atap, pola beban kelistrikan, dan simulasi insolasi matahari.\n2. Engineering Design: Perancangan skematik elektrikal (Single Line Diagram) dan pemilihan modul Tier-1.\n3. Perizinan & Alokasi Kuota PLN: Pengajuan persetujuan paralel PLN dan rekomendasi teknis dinas terkait.\n4. Instalasi EPC: Pemasangan mounting, panel surya, inverter, dan sistem proteksi oleh tim teknisi tersertifikasi.\n5. Testing & Commissioning: Uji kelayakan fungsional dan pengurusan Sertifikat Laik Operasi (SLO).\n6. Serah Terima & Telemetri IoT: Aktivasi sistem monitoring online 24/7 dan penyerahan dokumentasi garansi resmi.',
  },

  // 2. SKEMA PEMBIAYAAN & INVESTASI
  {
    id: 'faq-5',
    category: 'Skema Pembiayaan',
    question: 'Berapa persen tagihan listrik PLN yang dapat dihemat setiap bulan?',
    answer:
      'Penghematan rata-rata berkisar antara 40% hingga 80% dari total biaya konsumsi listrik bulanan Anda. Besaran penghematan aktual dipengaruhi oleh kapasitas sistem (kWp) yang terpasang, orientasi atap, profil penggunaan listrik pada siang hari (pukul 08.00–16.00), serta penggunaan sistem baterai untuk menyerap beban malam hari.',
  },
  {
    id: 'faq-6',
    category: 'Skema Pembiayaan',
    question: 'Apakah tersedia opsi pemasangan Tanpa Biaya Modal Awal (Zero Upfront Cost / Rental / Solar Leasing)?',
    answer:
      'Ya! Selain opsi Pembelian Langsung (Capex), SUNBLIX menyediakan skema Zero Upfront Cost (Sewa Operasional / Solar PPA / Rental) khusus untuk sektor komersial, industri, dan properti terpilih. Dalam skema ini, klien tidak perlu mengeluarkan biaya investasi awal untuk peralatan maupun pemasangan. Seluruh biaya instalasi, pengurusan izin, asuransi, hingga pemeliharaan rutin ditanggung oleh SUNBLIX.',
  },
  {
    id: 'faq-7',
    category: 'Skema Pembiayaan',
    question: 'Bagaimana mekanisme pembayaran bulanan dalam skema sewa (Zero Upfront Cost)?',
    answer:
      'Pembayaran sewa bulanan dihitung berdasarkan tarif per kWh dari energi bersih yang berhasil diproduksi oleh panel surya, dengan tarif yang dipatok lebih rendah daripada tarif dasar listrik (TDL) PLN. Artinya, klien langsung merasakan efisiensi biaya operasional sejak bulan pertama beroperasi tanpa risiko finansial.',
  },
  {
    id: 'faq-8',
    category: 'Skema Pembiayaan',
    question: 'Apa yang terjadi setelah masa kontrak sewa (leasing) selesai?',
    answer:
      'Setelah masa sewa operasional berakhir (umumnya 10 hingga 20 tahun sesuai kesepakatan), seluruh kepemilikan aset sistem PLTS Rooftop akan dihibahkan dan dialihkan 100% menjadi milik pelanggan tanpa biaya tambahan. Pelanggan dapat terus menikmati listrik tenaga surya gratis hingga masa pakai modul 25-30 tahun.',
  },
  {
    id: 'faq-9',
    category: 'Skema Pembiayaan',
    question: 'Bagaimana skema pembayaran untuk opsi Beli Putus (Capex)? Apakah ada fasilitas cicilan perbankan?',
    answer:
      'Untuk opsi Beli Putus (Capex), pembayaran dilakukan secara bertahap (termin) sesuai progres proyek (Down Payment saat kontrak, saat material tiba di lokasi, dan pelunasan setelah komisioning). Kami juga bermitra dengan bank-bank nasional terkemuka untuk menyediakan program Green Financing / Solar Loan dengan suku bunga kompetitif dan opsi cicilan ringan hingga tenor 60 bulan.',
  },

  // 3. STRUKTUR ATAP & KEAMANAN
  {
    id: 'faq-10',
    category: 'Struktur Atap & Keamanan',
    question: 'Apakah semua jenis atap bisa dipasang panel surya?',
    answer:
      'Hampir semua jenis atap dapat dipasangi PLTS, antara lain atap metal/spandek/zincalume, standing seam/klip-lok, genteng keramik/beton, bitumen/aspal, hingga dak beton datar (flat roof). Kami menggunakan tipe bracket mounting yang dirancang khusus untuk masing-masing profil atap agar aerodinamis dan kokoh.',
  },
  {
    id: 'faq-11',
    category: 'Struktur Atap & Keamanan',
    question: 'Berapa beban tambahan pada atap dan apakah struktur bangunan perlu diperkuat?',
    answer:
      'Beban total sistem panel surya beserta rel mounting aluminium hanya berkisar antara 12 hingga 18 kg/m². Beban ini tergolong sangat ringan dan terdistribusi merata di atas rangka atap bangunan standar SNI. Sebelum instalasi, tim engineering SUNBLIX selalu melakukan audit struktural dan perhitungan beban mati untuk memastikan integritas atap 100% aman.',
  },
  {
    id: 'faq-12',
    category: 'Struktur Atap & Keamanan',
    question: 'Apakah pemasangan panel surya dapat menyebabkan atap bocor?',
    answer:
      'Sama sekali tidak. Untuk atap metal standing seam/klip-lok, kami menggunakan metode non-penetration clamp (tanpa melubangi atap). Sedangkan untuk atap genteng atau spandek bersekrup, kami menggunakan L-feet bracket khusus yang dilengkapi gasket karet EPDM tahan cuaca dan lapisan chemical sealant ganda bergaransi anti-bocor (leak-proof warranty).',
  },
  {
    id: 'faq-13',
    category: 'Struktur Atap & Keamanan',
    question: 'Bagaimana sistem proteksi petir dan pencegahan bahaya kebakaran (Fire Safety)?',
    answer:
      'Sistem PLTS SUNBLIX dilengkapi sistem pengamanan berlapis standar internasional (IEC/SNI):\n• Surge Protection Device (SPD Tipe II) pada sisi DC dan AC untuk meredam lonjakan tegangan akibat sambaran petir.\n• Sistem pentanahan (Grounding) khusus mandiri dengan tahanan tanah di bawah 5 Ohm.\n• Proteksi busur api listrik (Arc Fault Circuit Interrupter / AFCI) pada inverter untuk mencegah resiko korsleting.\n• Fitur Rapid Shutdown untuk menurunkan tegangan modul ke batas aman (<30V) dalam hitungan detik saat terjadi kondisi darurat.',
  },

  // 4. IZIN PLN & REGULASI
  {
    id: 'faq-14',
    category: 'Izin PLN & Regulasi',
    question: 'Apakah pemasangan PLTS Rooftop memerlukan izin resmi dari PLN dan pemerintah?',
    answer:
      'Ya. Setiap sistem PLTS yang tersambung secara paralel dengan jaringan PLN wajib mengantongi izin persetujuan sambungan dari PT PLN (Persero) dan Sertifikat Laik Operasi (SLO) yang terdaftar di Kementerian ESDM. Hal ini bertujuan memastikan sistem instalasi memenuhi standar keselamatan ketenagalistrikan nasional.',
  },
  {
    id: 'faq-15',
    category: 'Izin PLN & Regulasi',
    question: 'Bagaimana regulasi Permen ESDM No. 2/2024 terbaru mempengaruhi pemasangan PLTS Atap?',
    answer:
      'Berdasarkan Permen ESDM No. 2 Tahun 2024, regulasi PLTS Atap kini semakin transparan:\n1. Tidak ada lagi pembatasan kapasitas maksimal 100% dari daya tersambung PLN; kapasitas disesuaikan dengan kuota sistem kelistrikan PLN setempat.\n2. Biaya kapasitas (capacity charge) dan biaya darurat ditiadakan bagi pelanggan rumah tangga.\n3. Kuota dialokasikan secara transparan berdasarkan usulan tahunan PLN.',
  },
  {
    id: 'faq-16',
    category: 'Izin PLN & Regulasi',
    question: 'Apakah pelanggan harus mengurus perizinan sendiri ke PLN dan ESDM?',
    answer:
      'Tidak perlu. Tim regulasi SUNBLIX mengurus seluruh kelengkapan dokumen administratif dan teknis dari awal hingga tuntas, mulai dari pengajuan kuota sambungan PLN, pengurusan SLO melalui Lembaga Inspeksi Teknik (LIT) resmi, hingga koordinasi pergantian meteran dua arah (kWh Exim). Klien hanya perlu menyediakan data rekening PLN dan identitas pemilik bangunan.',
  },

  // 5. BATERAI & BACKUP
  {
    id: 'faq-17',
    category: 'Baterai & Backup',
    question: 'Mengapa sistem On-Grid mati otomatis saat listrik PLN padam (Anti-Islanding Protection)?',
    answer:
      'Inverter On-Grid wajib memiliki fitur keselamatan Anti-Islanding sesuai regulasi ketenagalistrikan. Jika PLN padam karena gangguan jaringan atau perbaikan kabel di tiang luar, inverter otomatis memutus aliran listrik dalam hitungan milidetik guna mencegah arus balik yang dapat membahayakan nyawa teknisi lapangan PLN yang sedang memperbaiki jaringan.',
  },
  {
    id: 'faq-18',
    category: 'Baterai & Backup',
    question: 'Bagaimana sistem Hybrid SUNBLIX mengatasi pemadaman listrik PLN?',
    answer:
      'Pada sistem Hybrid SUNBLIX, inverter dilengkapi unit isolator otomatis dan penyimpanan baterai lithium LiFePO4. Saat listrik PLN padam, sistem secara instan (< 15 milidetik) berpindah ke mode mandiri (Island Mode). Beban-beban prioritas seperti lampu, kulkas, AC, WiFi, dan komputer tetap menyala normal tanpa restart, bertindak seperti genset darurat tanpa kebisingan dan tanpa bahan bakar solar/bensin.',
  },

  // 6. PERAWATAN & GARANSI
  {
    id: 'faq-19',
    category: 'Perawatan & Garansi',
    question: 'Berapa lama masa pakai dan jaminan garansi sistem SUNBLIX?',
    answer:
      'SUNBLIX hanya menggunakan komponen kualitas Tier-1 global dengan garansi berlapis:\n• Modul Surya: Garansi produk 12-15 tahun dan garansi performa output linier hingga 25-30 tahun (efisiensi di atas 80% pada tahun ke-25).\n• Smart Inverter: Garansi resmi pabrikan 5 hingga 10 tahun.\n• Struktur Mounting: Garansi ketahanan korosi hingga 10 tahun.\n• Garansi Pekerjaan Instalasi: Garansi kebocoran dan pengerjaan mekanikal elektrikal hingga 2 tahun.',
  },
  {
    id: 'faq-20',
    category: 'Perawatan & Garansi',
    question: 'Bagaimana cara memantau performa harian dan efisiensi produksi listrik?',
    answer:
      'Setiap instalasi PLTS SUNBLIX dilengkapi modul telemetri IoT (Internet of Things) berbasis WiFi/4G. Anda dapat memantau daya sesaat (kW), akumulasi produksi harian/bulanan (kWh), penghematan rupiah, hingga grafik konsumsi beban secara real-time melalui aplikasi smartphone atau web portal SUNBLIX Cloud. Sistem juga otomatis mengirimkan notifikasi peringatan jika terdeteksi anomali performa.',
  },
  {
    id: 'faq-21',
    category: 'Perawatan & Garansi',
    question: 'Apakah panel surya membutuhkan perawatan berkala yang merepotkan?',
    answer:
      'Perawatan PLTS tergolong sangat minim karena tidak terdapat komponen yang bergerak. Perawatan utama hanyalah membilas permukaan kaca panel dari debu, kotoran burung, atau daun kering setiap 3 hingga 6 bulan sekali dengan air bersih untuk menjaga penyerapan cahaya maksimal. SUNBLIX juga menyediakan kontrak layanan Operations & Maintenance (O&M) berkala untuk inspeksi termografi inframerah dan audit koneksi kabel.',
  },
];

const CATEGORIES = [
  'Semua',
  'Dasar PLTS',
  'Skema Pembiayaan',
  'Struktur Atap & Keamanan',
  'Izin PLN & Regulasi',
  'Baterai & Backup',
  'Perawatan & Garansi',
];

export default function FAQPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({ 'faq-1': true, 'faq-2': true });

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="faq-root">
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
      <header className="faq-hero">
        <div className="faq-hero-content">
          <div className="faq-badge">
            <span>❓</span>
            <span>PUSAT BANTUAN &amp; INFORMASI • SUNBLIX F.A.Q</span>
          </div>
          <h1 className="faq-title">
            Pertanyaan yang Sering <span className="highlight-gradient">Diajukan</span>
          </h1>
          <p className="faq-desc">
            Temukan jawaban komprehensif seputar sistem PLTS Rooftop, potensi penghematan listrik, regulasi perizinan
            PLN &amp; SLO, hingga garansi dan pemeliharaan sistem Anda.
          </p>

          {/* SEARCH BOX */}
          <div className="faq-search-box-wrap">
            <span className="faq-search-icon">🔍</span>
            <input
              type="text"
              className="faq-search-input"
              placeholder="Cari topik pertanyaan (misal: penghematan, baterai, izin PLN, atap bocor)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari pertanyaan FAQ"
            />
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="faq-cat-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`faq-cat-tab-btn ${selectedCategory === cat ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ACCORDION SECTION */}
      <section className="faq-section">
        {filteredFaqs.length > 0 ? (
          <div className="faq-accordion-list">
            {filteredFaqs.map((faq) => {
              const isOpen = Boolean(openItems[faq.id]);
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">{faq.question}</span>
                    <span className="faq-icon-indicator">{isOpen ? '✕' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-panel">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="faq-empty-state">
            <p>Tidak ditemukan pertanyaan yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;.</p>
            <button
              type="button"
              className="faq-cat-tab-btn is-active"
              style={{ marginTop: '14px' }}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
            >
              Reset Pencarian
            </button>
          </div>
        )}

        {/* STILL HAVE QUESTIONS HELP BOX */}
        <div className="faq-help-box">
          <h3>Masih Ada Pertanyaan yang Belum Terjawab?</h3>
          <p>
            Tim ahli dan konsultan teknik PT SUNBLIX ENERGI INDONESIA siap membantu memberikan penjelasan dan
            kalkulasi kebutuhan PLTS untuk hunian atau bisnis Anda.
          </p>
          <div className="faq-help-actions">
            <a
              href="https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20memiliki%20pertanyaan%20seputar%20pemasangan%20panel%20surya."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-help-wa"
            >
              <span>💬 Tanya Tim Engineer via WhatsApp</span>
            </a>
            <button
              type="button"
              className="btn-help-quote"
              onClick={() => setQuoteModalOpen(true)}
            >
              <span>Dapatkan Estimasi Penawaran Gratis ➔</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER STRIP */}
      <footer className="faq-footer">
        <div className="faq-footer-inner">
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="faq-footer-logo" />
          <p className="faq-footer-text">
            PT SUNBLIX ENERGI INDONESIA — Solusi Terpercaya PLTS Rooftop Residensial &amp; Komersial.
            Bintaro Business Centre, Jl RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330.
          </p>
          <div className="faq-footer-links">
            <Link href="/">← Beranda</Link>
            <span>•</span>
            <Link href="/about">Tentang Kami</Link>
            <span>•</span>
            <Link href="/career">Karir</Link>
            <span>•</span>
            <Link href="/partnership">Kemitraan Vendor</Link>
            <span>•</span>
            <a href="https://wa.me/6285288581027" target="_blank" rel="noopener noreferrer">WhatsApp Hotline</a>
          </div>
          <span className="faq-footer-copy">
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
