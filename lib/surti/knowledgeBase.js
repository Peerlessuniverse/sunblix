/**
 * ============================================================================
 * SUNBLIX SURTI AI — OFFICIAL KNOWLEDGE BASE
 * ============================================================================
 * Authoritative facts, verified technical parameters, brand guidelines,
 * warranties, installation SOPs, and payment policies for SUNBLIX.
 */

export const SUNBLIX_OFFICIAL_PROFILE = {
  companyName: 'PT SUNBLIX ENERGI INDONESIA',
  brand: 'SUNBLIX',
  tagline: 'POWER YOUR WORLD',
  aiName: 'SURTI',
  aiFullName: 'SUNBLIX Utility Resource Technical Intelligence',
  coverage: '19+ Kota di Indonesia (Jawa, Bali, Sumatera, Kalimantan, Sulawesi)',
  contactPhone: '+62 852-8858-1027',
  contactEmail: 'contact@sunblix.id',
  officialWebsite: 'https://sunblix.id',
  headOffice: 'Jakarta & Surabaya, Indonesia',
  officialGreeting:
    'Halo! Dengan SURTI disini, Asisten Virtual dari PT SUNBLIX ENERGI INDONESIA. terima kasih sudah menghubungi kami. Izinkan Saya membantu Anda.\n\nAgar saya dapat memberikan rekomendasi yang presisi dan sesuai untuk panel surya Anda, bolehkah saya bertanya Berapa kisaran rata-rata tagihan listrik PLN bulanan Anda saat ini (misal: Rp 2,5 Juta atau Rp 5 Juta)?',
};

export const VERIFIED_POLICIES = {
  paymentTerms: {
    title: 'Termin Pembayaran Standar Resmi (50/40/10)',
    steps: [
      { percentage: '50%', description: 'Uang Muka (Down Payment) saat penandatanganan Kontrak/SPH resmi.' },
      { percentage: '40%', description: 'Pelunasan Material saat pengiriman perangkat utama tiba di lokasi proyek.' },
      { percentage: '10%', description: 'Pelunasan Akhir setelah Berita Acara Commissioning & Uji Fungsi selesai.' },
    ],
  },
  warranties: [
    { item: 'Modul Surya Astronergy Bifacial Tier-1', duration: '25 Tahun Garansi Kinerja (Linear Power Output) & 12 Tahun Garansi Produk' },
    { item: 'Inverter Deye Smart Hybrid / On-Grid', duration: '5 Tahun Garansi Resmi Pabrik (Dapat diperpanjang hingga 10 tahun)' },
    { item: 'Baterai LiFePO4 Storage (BESS)', duration: '5 Tahun Garansi atau 6.000 Siklus pemakaian (DoD 80%)' },
    { item: 'Mounting & Struktur Rangka Aluminium Al6005-T5', duration: '10 Tahun Garansi Korosi & Ketahanan Angin hingga 120 km/jam' },
    { item: 'Jasa Pemasangan & Instalasi Listrik', duration: '1 Tahun Garansi Pemeliharaan Bebas Biaya (Free Maintenance)' },
  ],
  sphRules: {
    rule: 'SURTI hanya berwenang membuat Draf SPH. Penerbitan SPH resmi berkekuatan hukum wajib melalui persetujuan Human Approver SUNBLIX yang berwenang.',
    validityDays: 14,
    taxBasis: 'DPP + PPN 11% sesuai perundang-undangan Republik Indonesia.',
  },
  surveySOP: {
    title: 'Standar Operasional Prosedur (SOP) Survei Lokasi',
    duration: '1-2 jam per lokasi',
    scope: [
      'Pengecekan struktur atap (genteng, spandek, dak beton) & orientasi sudut kemiringan (azimuth & tilt)',
      'Analisis bayangan (shading analysis) dari pohon atau gedung sekitar',
      'Pemeriksaan kapasitas daya PLN, jenis MCB, jalur pipa kabel, dan titik grounding pentanahan (< 5 Ohm)',
      'Penentuan lokasi ideal penempatan inverter dan baterai (ruang sejuk berventilasi baik)',
    ],
  },
};

export const KNOWLEDGE_ARTICLES = [
  {
    id: 'kb-net-metering',
    title: 'Regulasi Net-Metering & PLTS Atap Permen ESDM No. 2/2024',
    category: 'Regulasi',
    summary: 'Ketentuan kuota PLTS atap sistem On-Grid tanpa ekspor-impor net metering berlebih, sistem kuota per wilayah distribusi PLN, dan peniadaan biaya kapasitas untuk pelanggan rumah tangga.',
    keywords: ['pln', 'esdm', 'net metering', 'kuota', 'izin'],
  },
  {
    id: 'kb-hybrid-vs-ongrid',
    title: 'Perbedaan Sistem Hybrid vs On-Grid SUNBLIX',
    category: 'Teknis',
    summary: 'Sistem Hybrid dilengkapi baterai LiFePO4 cerdas sehingga lampu dan alat krusial tetap menyala saat pemadaman PLN. Sistem On-Grid bekerja selaras dengan PLN tanpa baterai untuk memangkas tagihan siang hari secara maksimal dengan biaya investasi lebih ekonomis.',
    keywords: ['hybrid', 'ongrid', 'baterai', 'mati lampu', 'perbedaan'],
  },
  {
    id: 'kb-panel-astronergy',
    title: 'Spesifikasi Panel Surya Astronergy 585 Wp Bifacial N-Type TOPCon',
    category: 'Produk',
    summary: 'Panel bifacial menyerap sinar matahari dari kedua sisi (depan dan pantulan belakang atap) dengan efisiensi modul mencapai 22.6%, degradasi tahunan sangat rendah (< 0.4%/tahun), dan performa unggul pada suhu tropis tinggi.',
    keywords: ['astronergy', '585wp', 'bifacial', 'n-type', 'panel'],
  },
  {
    id: 'kb-inverter-deye',
    title: 'Spesifikasi Inverter Deye Hybrid SUN-6K & SUN-8K / 12K',
    category: 'Produk',
    summary: 'Inverter hybrid tercanggih dengan efisiensi MPPT 99.9%, waktu transfer ke backup baterai ultra-cepat (< 4ms sekelas UPS tanpa flicker), dual MPPT, dan pemantauan online real-time via aplikasi Solarman Smart.',
    keywords: ['deye', 'inverter', 'sun-6k', 'sun-8k', 'ups', 'transfer'],
  },
  {
    id: 'kb-atap-spandek-genteng-dak',
    title: 'Kesesuaian Jenis Atap & Sistem Mounting Anti-Bocor SUNBLIX',
    category: 'Teknis & Instalasi',
    summary: 'SUNBLIX dapat dipasang pada berbagai jenis atap: 1) Atap Genteng Keramik/Beton menggunakan Tile Hook SUS304 dengan bantalan karet EPDM anti-bocor; 2) Atap Metal/Spandek/Klip-Lok menggunakan Standing Seam Clamp khusus TANPA melubangi atap; 3) Dak Beton Flat menggunakan balast segitiga aluminium 10-15° dengan sistem waterproof membrane. Seluruh mounting bersertifikasi AL6005-T5 tahan angin badai 120 km/jam.',
    keywords: ['atap', 'genteng', 'spandek', 'dak', 'beton', 'bocor', 'mounting', 'rangka', 'baut'],
  },
  {
    id: 'kb-bep-roi-payback',
    title: 'Analisis Balik Modal (BEP / ROI) & Nilai Investasi Jangka Panjang',
    category: 'Finansial & Investasi',
    summary: 'Rata-rata periode balik modal (BEP) PLTS SUNBLIX adalah 4 hingga 6 tahun, tergantung tarif golongan PLN dan jam puncak konsumsi. Setelah periode BEP tercapai, pelanggan menikmati listrik gratis selama sisa masa hidup panel surya (20+ tahun ke depan) dengan perlindungan dari inflasi kenaikan tarif dasar listrik PLN.',
    keywords: ['balik modal', 'bep', 'roi', 'investasi', 'payback', 'untung', 'hemat'],
  },
  {
    id: 'kb-cuaca-mendung-hujan-malam',
    title: 'Kinerja Panel Surya Saat Cuaca Mendung, Hujan, & Malam Hari',
    category: 'Teknis & Operasional',
    summary: 'Panel Astronergy Bifacial N-Type tetap menghasilkan daya 20-40% saat kondisi mendung berawan karena memanfaatkan difusi spektrum cahaya matahari dan pantulan belakang atap. Pada malam hari atau pemadaman PLN, sistem Hybrid SUNBLIX secara otomatis mengalihkan suplai listrik dari baterai LiFePO4 cerdas dalam waktu < 4 milidetik tanpa kedip (sekelas UPS).',
    keywords: ['mendung', 'hujan', 'malam', 'cuaca', 'berawan', 'mati lampu', 'baterai'],
  },
  {
    id: 'kb-perawatan-monitoring',
    title: 'Pemeliharaan (Maintenance) & Pemantauan IoT Aplikasi Solarman Smart',
    category: 'Customer Service & Purna Jual',
    summary: 'Sistem PLTS hampir bebas perawatan (zero moving parts). Perawatan utama hanyalah membilas debu pada permukaan kaca panel secara berkala (setiap 2-3 bulan atau saat terlihat kotor). Pemilik dapat memantau produksi harian, status baterai, penghematan rupiah, dan alarm sistem 24/7 melalui aplikasi smartphone Solarman Smart / Deye Cloud secara gratis.',
    keywords: ['perawatan', 'maintenance', 'cuci panel', 'aplikasi', 'solarman', 'deye cloud', 'monitoring', 'pantau'],
  },
  {
    id: 'kb-customer-service-komplain',
    title: 'Layanan Customer Service, Garansi Resmi, & Penanganan Kendala Teknis',
    category: 'Customer Service & Purna Jual',
    summary: 'Jika pelanggan mengalami kendala (misal: inverter error, MCB trip, atau wifi offline), tim Customer Service & Senior Engineer SUNBLIX siap membantu. Inverter Deye dan Baterai LiFePO4 dilindungi garansi resmi 5 tahun dengan skema penggantian unit (1-to-1 replacement) untuk cacat pabrik, serta gratis 1 tahun servis berkala.',
    keywords: ['garansi', 'komplain', 'error', 'rusak', 'customer service', 'cs', 'bantuan', 'layanan', 'tiket'],
  },
  {
    id: 'kb-alur-pemasangan-plts',
    title: 'Alur Proses Pemasangan PLTS SUNBLIX dari Awal hingga Selesai',
    category: 'SOP & Prosedur',
    summary: 'Langkah pemasangan: 1) Konsultasi & Estimasi Tagihan via SURTI; 2) Pembuatan Draf SPH Resmi; 3) Survei Lokasi Teknis (Audit Atap, Shading 3D, & SLD); 4) Approval SPH & Kontrak Resmi; 5) Pengiriman Material & Instalasi (2-4 hari kerja); 6) Testing & Commissioning resmi.',
    keywords: ['alur', 'proses', 'langkah', 'tahapan', 'cara pasang', 'pesan', 'sop'],
  },
];

/**
 * Knowledge retrieval function
 */
export function searchKnowledge(query) {
  if (!query) return KNOWLEDGE_ARTICLES;
  const q = query.toLowerCase();
  return KNOWLEDGE_ARTICLES.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.keywords.some((k) => q.includes(k))
  );
}
