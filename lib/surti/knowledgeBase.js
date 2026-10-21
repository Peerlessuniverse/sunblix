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
    'Halo! Dengan SURTI disini, Saya Asisten dari SUNBLIX. Saya siap membantu Anda menemukan solusi tenaga surya yang sesuai dengan kebutuhan, lokasi, dan anggaran Anda. Apakah anda berencana menggunakannya untuk Rumah, Bisnis, atau Proyek Industri?',
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
