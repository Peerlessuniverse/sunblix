/**
 * ============================================================================
 * SUNBLIX SURTI AI — PRODUCT CATALOG & PACKAGES
 * ============================================================================
 * Official catalog items: Tier-1 Solar Panels, Inverters, BESS Batteries,
 * BOS (Balance of System), and Turnkey Packages (Standard, Pro, Pro+).
 */

export const OFFICIAL_PRODUCTS = [
  {
    id: 'prod-pv-585',
    sku: 'SBX-PV-AST585',
    name: 'Astronergy 585 Wp Bifacial N-Type TOPCon',
    category: 'Solar Panel',
    brand: 'Astronergy',
    ratedPower: '585 Wp',
    efficiency: '22.65%',
    warranty: '25 Tahun Garansi Kinerja / 12 Tahun Produk',
    sellingPrice: 1950000,
    unit: 'Modul',
    availability: 'Tersedia (Ready Stock)',
  },
  {
    id: 'prod-inv-deye6k',
    sku: 'SBX-INV-DYE6K-HYB',
    name: 'Deye 6 kW Single Phase Smart Hybrid Inverter (SUN-6K-SG05LP1)',
    category: 'Inverter',
    brand: 'Deye',
    ratedPower: '6,000 Watt (Max PV 9,600 Wp)',
    efficiency: '97.6%',
    features: ['UPS-grade transfer < 4ms', 'Dual MPPT', 'Smart Generator support'],
    warranty: '5 Tahun Garansi Resmi',
    sellingPrice: 28500000,
    unit: 'Unit',
    availability: 'Tersedia (Ready Stock)',
  },
  {
    id: 'prod-inv-deye8k',
    sku: 'SBX-INV-DYE8K-HYB',
    name: 'Deye 8 kW Single Phase Smart Hybrid Inverter (SUN-8K-SG05LP1)',
    category: 'Inverter',
    brand: 'Deye',
    ratedPower: '8,000 Watt (Max PV 10,400 Wp)',
    efficiency: '97.6%',
    features: ['UPS-grade transfer < 4ms', 'Dual MPPT', 'Smart Generator support'],
    warranty: '5 Tahun Garansi Resmi',
    sellingPrice: 34500000,
    unit: 'Unit',
    availability: 'Tersedia (Ready Stock)',
  },
  {
    id: 'prod-inv-deye12k',
    sku: 'SBX-INV-DYE12K-3P',
    name: 'Deye 12 kW 3-Phase Smart Hybrid Inverter (SUN-12K-SG04LP3)',
    category: 'Inverter',
    brand: 'Deye',
    ratedPower: '12,000 Watt (Max PV 15,600 Wp)',
    efficiency: '97.8%',
    features: ['100% Unbalanced Output', 'Dual MPPT', 'Diesel Gen compatible'],
    warranty: '5 Tahun Garansi Resmi',
    sellingPrice: 48000000,
    unit: 'Unit',
    availability: 'Tersedia (Ready Stock)',
  },
  {
    id: 'prod-bat-5.1kwh',
    sku: 'SBX-BAT-LFP51',
    name: 'SUNBLIX LiFePO4 Smart Battery 5.12 kWh 51.2V 100Ah (Low Voltage)',
    category: 'Battery Storage (BESS)',
    brand: 'Deye / Seplos High Grade',
    capacity: '5.12 kWh (Usable 4.08 kWh DoD 80%)',
    cycles: '6,000+ Siklus @ 25°C',
    warranty: '5 Tahun Garansi Resmi',
    sellingPrice: 26500000,
    unit: 'Unit',
    availability: 'Tersedia (Ready Stock)',
  },
  {
    id: 'prod-mounting-rail',
    sku: 'SBX-MNT-AL6005',
    name: 'Aluminium Rail Mounting & Stainless Clamp System (Anti-Corrosion)',
    category: 'Mounting & Rangka',
    brand: 'SUNBLIX Marine Grade',
    material: 'Aluminium Al6005-T5 & SUS304 Fasteners',
    warranty: '10 Tahun Garansi Korosi',
    sellingPrice: 650000,
    unit: 'Per Panel Set',
    availability: 'Tersedia (Ready Stock)',
  },
  {
    id: 'prod-box-protection',
    sku: 'SBX-BOS-PROT',
    name: 'Integrated AC/DC Combiner Box & Multi-level SPD Lightning Arrester Type II',
    category: 'Electrical Protection',
    brand: 'Schneider / Suntree / Chint',
    features: ['DC MCB + DC Fuse', 'Type II Surge Protection Device', 'Smart Energy Meter CT'],
    warranty: '2 Tahun Garansi',
    sellingPrice: 6800000,
    unit: 'Set Panel',
    availability: 'Tersedia (Ready Stock)',
  },
];

export const TURNKEY_PACKAGES = [
  {
    id: 'standard',
    name: 'SUNBLIX Standard Edition',
    subtitle: 'Solusi Cerdas Hemat Tagihan Listrik Siang Hari',
    type: 'On-Grid Grid-Tied System',
    targetAudience: 'Rumah tinggal & kantor dengan aktivitas dominan di siang hari',
    keyFeatures: [
      'Memangkas tagihan listrik PLN hingga 70-75%',
      'Panel Surya Astronergy 585 Wp Bifacial Tier-1',
      'Inverter On-Grid Dual MPPT dengan efisiensi 98%',
      'Sistem Proteksi AC/DC Combiner Box & Surge Arrester',
      'Monitoring online 24/7 via Smartphone',
      'Gratis Perizinan SLO & Koordinasi PLN Net Metering',
    ],
    startingPrice: 58000000,
    startingKwp: 2.34,
  },
  {
    id: 'pro',
    name: 'SUNBLIX Pro Hybrid Edition',
    subtitle: 'Kenyamanan Tanpa Henti dengan Smart Lithium BESS',
    type: 'Hybrid Energy Storage System',
    isPopular: true,
    targetAudience: 'Rumah modern, villa, dan tempat usaha yang membutuhkan cadangan listrik saat PLN padam',
    keyFeatures: [
      'Memangkas tagihan listrik hingga 85%',
      'Penyimpanan Baterai LiFePO4 5.1 kWh untuk pemakaian malam',
      'Fitur UPS Cerdas: Listrik tidak berkedip (<4ms) saat PLN padam',
      'Panel Surya Astronergy 585 Wp Bifacial N-Type',
      'Inverter Smart Hybrid Deye SUN-6K dengan Smart MPPT',
      'Garansi Baterai 5 Tahun / 6.000 Siklus',
    ],
    startingPrice: 91500000,
    startingKwp: 2.34,
  },
  {
    id: 'pro-plus',
    name: 'SUNBLIX Pro+ Industrial Edition',
    subtitle: 'Kemandirian Energi Total Skala Komersial & Industri',
    type: 'High-Capacity 3-Phase Hybrid System',
    targetAudience: 'Pabrik, hotel, pergudangan, rumah sakit, dan gedung perkantoran 3-fasa',
    keyFeatures: [
      'Sistem 3-Fasa Seimbang (12 kW hingga 100 kW+)',
      'Dual / Triple BESS LiFePO4 10.2 kWh - 50 kWh+',
      'Integrasi Cerdas Genset Otomatis (Dry Contact Auto-Start)',
      'Peak Shaving & Demand Charge Limiter untuk industri',
      'Dedicated Remote Monitoring & Preventive Maintenance',
      'Audit Energi & Site Engineering komprehensif',
    ],
    startingPrice: 295200000,
    startingKwp: 11.70,
  },
];

export function getProductCatalog() {
  return OFFICIAL_PRODUCTS;
}

export function getTurnkeyPackages() {
  return TURNKEY_PACKAGES;
}
