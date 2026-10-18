'use client';

import { useState, useMemo, useEffect, Suspense, Fragment } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './brosur.css';
import {
  SUNBLIX_OFFICIAL_PACKAGES_2026,
  BATTERY_ADDONS,
  COMPONENT_TEMPLATES,
  SUNBLIX_TERMS_2026,
  SUNBLIX_SECTION_CATALOG,
  DEFAULT_PORTFOLIOS,
  SAMPLE_PORTFOLIO_IMAGES,
  getPresetFromPackage,
} from './sunblixCatalog';

// -----------------------------------------------------------------------------
// DEFAULT DATA PRESETS
// -----------------------------------------------------------------------------
const PRESETS = {
  sph002: {
    id: 'sph002',
    label: 'SPH 002 (PLTS Hybrid 12 Pos Security)',
    sub: 'PT Marga Bara Jaya — 12 Pos Security',
    docNo: '002/SUNBLIX-SPH/X/2026',
    sphCode: 'SPH 002',
    date: 'Jakarta, 19 Oktober 2026',
    customer: 'PT Marga Bara Jaya',
    customerAddress: 'Di Tempat',
    attn: 'Bpk. Jajang Safaat',
    email: 'jajang.safaat@geocoal.com',
    project: 'PLTS Hybrid 12 Pos Security (1 sistem per pos)',
    systemType: 'Hybrid 1 Fasa',
    delivery: '12 lokasi pos (belum diinformasikan)',
    location: '12 lokasi pos (belum diinformasikan)',
    phone: '085288581027',
    powerKwp: '7,02',
    inverterKw: '6,0',
    batteryKwh: '5,10',
    estMonthlyKwh: 711,
    packageCount: 12,
    unitBasePrice: 177200000,
    unitPpn: 19492000,
    unitTotalPrice: 196692000,
    totalOffer: 2360304000,
    panels: '12 Pcs (Bifacial 585Wp Astronergy)',
    coverImage: '/asset/product_pro.jpg',
    sections: [
      {
        code: 'A',
        title: 'MATERIAL UTAMA',
        priceText: 'Rp 177.200.000',
        items: [
          {
            no: 1,
            item: 'Panel surya (PV module)',
            spec: 'SBX-PV-585-ABF — Panel Surya N-Type TOPCon Bifacial 585 Wp · Astronergy CHSM72N(DG)/F-BH',
            qty: 12,
            unit: 'Pcs',
            unitPrice: 2250000,
            warranty: '12 thn (ketentuan paket)',
            priceText: '',
          },
          {
            no: 2,
            item: 'Inverter',
            spec: 'SBX-INV-HY1L-6K-S5 — Inverter Hybrid 1 Fasa 6 kW (baterai 48 V) · Deye SUN-6K-SG05LP1',
            qty: 1,
            unit: 'Unit',
            unitPrice: 24500000,
            warranty: '5 thn (ketentuan paket)',
            priceText: '',
          },
          {
            no: 3,
            item: 'Baterai penyimpanan energi (BESS)',
            spec: 'SBX-BAT-L051-DG05 — Baterai LiFePO4 51,2 V 5,1 kWh · Deye SE-G5.1',
            qty: 1,
            unit: 'Unit',
            unitPrice: 20400000,
            warranty: '5 thn (ketentuan paket)',
            priceText: '',
          },
          {
            no: 4,
            item: 'Struktur mounting',
            spec: 'SBX-MTG-LFEET + SBX-MTG-RAIL-3600 — Rail aluminium, bracket l feet, clamp & grounding modul',
            qty: 1,
            unit: 'Set',
            unitPrice: 16800000,
            warranty: 'Bracket 5 thn (ketentuan paket)',
            priceText: '',
          },
        ],
      },
      {
        code: 'B',
        title: 'MATERIAL PENDUKUNG',
        priceText: 'Termasuk',
        items: [
          {
            no: 5,
            item: 'Kabel daya PLTS',
            spec: 'Kabel solar PV (DC), kabel AC & kabel baterai',
            qty: 1,
            unit: 'Lot',
            unitPrice: 4500000,
            warranty: 'SUNBLIX 1 thn',
            priceText: '',
          },
          {
            no: 6,
            item: 'Panel proteksi',
            spec: 'SPD DC/AC, MCB/MCCB, proteksi baterai & grounding',
            qty: 1,
            unit: 'Lot',
            unitPrice: 5800000,
            warranty: 'SUNBLIX 1 thn',
            priceText: '',
          },
          {
            no: 7,
            item: 'Aksesori & material kecil',
            spec: 'Conduit, cable tray, terminal & bulk material',
            qty: 1,
            unit: 'Lot',
            unitPrice: 2500000,
            warranty: 'SUNBLIX 1 thn',
            priceText: '',
          },
        ],
      },
      {
        code: 'C',
        title: 'INSTALASI & COMMISSIONING',
        priceText: 'Termasuk',
        items: [
          {
            no: 8,
            item: 'Instalasi mekanikal',
            spec: 'Pemasangan mounting & panel surya',
            qty: 1,
            unit: 'Lot',
            unitPrice: 6500000,
            warranty: 'SUNBLIX 1 thn',
            priceText: '',
          },
          {
            no: 9,
            item: 'Instalasi elektrikal',
            spec: 'Wiring DC/AC, pemasangan inverter, baterai & panel proteksi',
            qty: 1,
            unit: 'Lot',
            unitPrice: 6000000,
            warranty: 'SUNBLIX 1 thn',
            priceText: '',
          },
          {
            no: 10,
            item: 'Testing & commissioning',
            spec: 'Uji sistem, setting inverter & aktivasi akun monitoring',
            qty: 1,
            unit: 'Lot',
            unitPrice: 3000000,
            warranty: '-',
            priceText: '',
          },
        ],
      },
      {
        code: 'D',
        title: 'PEKERJAAN TAMBAHAN',
        priceText: '-',
        items: [
          {
            no: 11,
            item: 'Training & dukungan proyek',
            spec: 'Training pengguna, akomodasi tim & administrasi proyek',
            qty: 1,
            unit: 'Lot',
            unitPrice: 2500000,
            warranty: '-',
            priceText: '',
          },
        ],
      },
      {
        code: 'E',
        title: 'PENGIRIMAN',
        priceText: '-',
        items: [
          {
            no: 12,
            item: 'Pengiriman material',
            spec: 'Pengiriman material ke 12 lokasi pos (belum diinformasikan) (sesuai biaya aktual)',
            qty: 1,
            unit: 'Lot',
            unitPrice: 2500000,
            warranty: '-',
            priceText: '',
          },
        ],
      },
    ],
    items: [
      { id: '1', code: 'SBX-PV-585-ABF', desc: 'Panel Surya N-Type TOPCon Bifacial 585 Wp · Astronergy CHSM72N(DG)/F-BH', qty: 12, unit: 'Pcs', unitPrice: 2250000, notes: '12 thn' },
      { id: '2', code: 'SBX-INV-HY1L-6K-S5', desc: 'Inverter Hybrid 1 Fasa 6 kW (baterai 48 V) · Deye SUN-6K-SG05LP1', qty: 1, unit: 'Unit', unitPrice: 24500000, notes: '5 thn' },
      { id: '3', code: 'SBX-BAT-L051-DG05', desc: 'Baterai LiFePO4 51,2 V 5,1 kWh · Deye SE-G5.1', qty: 1, unit: 'Unit', unitPrice: 20400000, notes: '5 thn' },
      { id: '4', code: 'SBX-MTG-LFEET+RAIL', desc: 'Rail aluminium, bracket l feet, clamp & grounding modul', qty: 1, unit: 'Set', unitPrice: 16800000, notes: 'Bracket 5 thn' },
    ],
    terms: [
      'Termin pembayaran (dari total nilai penawaran): 50% uang muka sebelum pengiriman material (Rp 1.180.152.000); 40% setelah material tiba di lokasi (Rp 944.121.600); 10% setelah instalasi & commissioning selesai (Rp 236.030.400).',
      'Masa berlaku penawaran 14 hari, sampai dengan 2 November 2026.',
      'Garansi instalasi & workmanship SUNBLIX 1 tahun sejak serah terima. Garansi produk mengikuti ketentuan pabrikan sebagaimana tercantum pada tabel.',
      'Harga dalam Rupiah, PPN dicantumkan terpisah. Harga material mengacu pada kurs maksimum Rp 18.500/USD; kenaikan kurs di atas batas tersebut dapat menyesuaikan harga.',
      'Biaya pengiriman ke 12 lokasi pos (belum diinformasikan) dikenakan sesuai biaya aktual.',
      'Pemesanan material dilakukan setelah uang muka diterima. Jadwal pengiriman dan instalasi dikonfirmasi setelah survey lapangan.',
      'Penawaran disusun berdasarkan data awal dari customer. Kapasitas, konfigurasi dan harga final ditetapkan setelah survey lapangan dan verifikasi engineering.',
      'Lampiran: Analisa Teknis Sistem PLTS.',
    ],
    signatory: {
      name: 'Warsa',
      title: 'Account Executive',
      company: 'PT SUNBLIX ENERGI INDONESIA',
    },
    portfolios: DEFAULT_PORTFOLIOS,
  },

  sph001: {
    id: 'sph001',
    label: 'SPH 001 (PLTS Hybrid 2.56 kW)',
    sub: 'Preset Asli Quotation Langsa',
    docNo: 'SBX/QTN/IX/2026/001',
    sphCode: 'SPH 001',
    date: '30 September 2026',
    customer: 'Bapak/Ibu Customer',
    project: 'PLTS Hybrid 2.56 kW',
    delivery: 'Warehouse PT Sunblix → Langsa',
    phone: '085288581027',
    email: 'hello@sunblix.id',
    powerKwp: '2.56',
    batteryKwh: '2.56',
    inverterKw: '2.56',
    panels: '4 Pcs (Bifacial 720Wp)',
    estMonthlyKwh: 320,
    estMonthlySavings: 650000,
    estCo2Kg: 280,
    coverImage: '/asset/sunlight_house.jpg',
    items: [
      {
        id: '1',
        code: '0240-BATTERY-LITHIUM - ALL IN ONE PACKAGE - 2.56KWH',
        desc: 'Lithium Battery Unit\nBrand: SUNBLIX Battery for All In One Type\nPower: 2.56 kWh | Configuration: LOW VOLTAGE\nType: AE-F2.56\nWarranty: 10 Years',
        brand: 'SUNBLIX',
        qty: 1,
        unit: 'Pcs',
        unitPrice: 13461538,
        notes: 'Ready Stock',
      },
      {
        id: '2',
        code: '0241-POWER SYSTEM UNIT - ALL IN ONE PACKAGE - 2.56KW',
        desc: 'Power System Unit\nBrand: SUNBLIX All In One Type\nPower: 2.56 kW (1 PHASE)\nType: SUN-BK250-2.56KWH-EU-AM4-32L\nWarranty: 10 Years',
        brand: 'SUNBLIX',
        qty: 1,
        unit: 'Pcs',
        unitPrice: 28846154,
        notes: 'Ready Stock',
      },
      {
        id: '3',
        code: '0220-PAKET MATERIAL - PV - HYBRID - 1P',
        desc: 'PV Hybrid - Installation Package\nMaterials:\n- PV Module Bifacial 720Wp - Trina Solar (4 pcs)\n- Mounting Set - Aluminium (exclude floater part)\n- DC PV Power Cable 1x4mm (100M)\n- AC Power Cable 3x4mm (15M)\n- Small Materials & Accessories\n- Protection Unit\nWarranty: PV Module: 12 Years | PV Mounting: 2 Years',
        brand: 'SUNBLIX',
        qty: 1,
        unit: 'Job',
        unitPrice: 46753846,
        notes: 'Exclude Accommodations',
      },
      {
        id: '4',
        code: '0195-PAKET BIAYA KIRIM MATERIAL - LUAR JABODETABEK',
        desc: 'Delivery Package\nFrom: Warehouse PT Sunblix\nTo: Langsa',
        brand: 'SUNBLIX',
        qty: 1,
        unit: 'Job',
        unitPrice: 0,
        notes: 'Exclude Delivery',
      },
    ],
    notes: [
      'Harga sudah termasuk material dan komponen sesuai scope pada tabel.',
      'Mounting set: floater part tidak termasuk.',
      'Akomodasi dan delivery material ke luar Jabodetabek tidak termasuk dan dihitung sesuai kebutuhan aktual.',
      'Unloading/forklift untuk unit >200 kg menjadi tanggung jawab customer.',
      'Quotation berlaku 14 hari kalender sejak tanggal quotation atau sampai ada perubahan harga dari principal/vendor.',
      'Garansi produk dan instalasi: mengikuti masa garansi yang tercantum pada masing-masing item.',
    ],
    signatory: {
      name: 'Warsa',
      title: 'Account Executive',
      company: 'PT. SUNBLIX ENERGI INDONESIA',
    },
    portfolios: DEFAULT_PORTFOLIOS,
  },

  res468: {
    id: 'res468',
    label: 'SUNBLIX 4.68 kWp Residential',
    sub: 'Paket Populer Rumah Tinggal',
    docNo: 'SBX/QTN/X/2026/042',
    date: '30 September 2026',
    customer: 'Bpk. Hendra Gunawan',
    project: 'PLTS Rooftop Residential 4.68 kWp',
    delivery: 'Jabodetabek (Free Delivery)',
    phone: '081234567890',
    email: 'hendra@example.com',
    powerKwp: '4.68',
    batteryKwh: '5.12',
    inverterKw: '6.00',
    panels: '8 Pcs (Monocrystalline 585Wp)',
    estMonthlyKwh: 580,
    estMonthlySavings: 1950000,
    estCo2Kg: 520,
    coverImage: '/asset/product_standard.jpg',
    items: [
      {
        id: '1',
        code: 'PV-MOD-585W - TIER 1 MONO PERC',
        desc: 'Modul Surya High Efficiency 585 Wp (8 Unit)\nBrand: Tier-1 BloombergNEF Certified\nWarranty: 12 Thn Produk, 25 Thn Performa Output',
        brand: 'Tier-1 Solar',
        qty: 8,
        unit: 'Pcs',
        unitPrice: 2250000,
        notes: 'Ready Stock',
      },
      {
        id: '2',
        code: 'INV-HYB-6KW - SMART HYBRID INVERTER',
        desc: 'Smart Hybrid Solar Inverter 6 kW 1-Phase\nDual MPPT, IP65 Outdoor, Efisiensi 98.6%\nInclude IoT WiFi Monitoring & Smart Meter',
        brand: 'SUNBLIX Smart',
        qty: 1,
        unit: 'Unit',
        unitPrice: 24500000,
        notes: 'Garansi 10 Thn',
      },
      {
        id: '3',
        code: 'MNT-ROOF-AL6005 - MOUNTING & CABLING',
        desc: 'Aluminium Rail AL6005-T5 Anodized + Clamp Set\nKabel Surya DC 1x4mm SNI & AC 3x4mm\nProteksi Petir & Panel Distribusi AC/DC',
        brand: 'SUNBLIX Mount',
        qty: 1,
        unit: 'Set',
        unitPrice: 16800000,
        notes: 'SNI Certified',
      },
      {
        id: '4',
        code: 'SRV-INSTALL-SLO - EPC & COMMISIONING',
        desc: 'Jasa Instalasi Standar Keselamatan K3\nPengujian Komisioning & Pengurusan Izin SLO PLN Net-Metering',
        brand: 'SUNBLIX EPC',
        qty: 1,
        unit: 'Job',
        unitPrice: 12500000,
        notes: 'Sertifikasi Resmi',
      },
    ],
    notes: [
      'Harga sudah mencakup perizinan SLO ESDM dan asistensi Net-Metering PLN.',
      'Struktur dudukan atap menggunakan aluminium anodized anti-karosi tahan angin hingga 120 km/jam.',
      'Sistem dilengkapi aplikasi monitoring smartphone SUNBLIX Cloud 24/7.',
      'Quotation berlaku 14 hari kerja.',
      'Garansi performa output modul surya 25 tahun minimal 84.8%.',
    ],
    signatory: {
      name: 'Tim Engineering SUNBLIX',
      title: 'Head of Technical Solutions',
      company: 'PT. SUNBLIX ENERGI INDONESIA',
    },
  },

  res819: {
    id: 'res819',
    label: 'SUNBLIX 8.19 kWp Villa & Commercial',
    sub: 'Paket Usaha / Villa Mewah',
    docNo: 'SBX/QTN/X/2026/078',
    date: '30 September 2026',
    customer: 'PT. Villa Nuansa Tropika',
    project: 'PLTS Rooftop Villa Hybrid 8.19 kWp',
    delivery: 'Denpasar, Bali',
    phone: '081987654321',
    email: 'info@villatropika.com',
    powerKwp: '8.19',
    batteryKwh: '10.24',
    inverterKw: '10.00',
    panels: '14 Pcs (Bifacial 585Wp)',
    estMonthlyKwh: 1050,
    estMonthlySavings: 3800000,
    estCo2Kg: 910,
    coverImage: '/asset/product_pro.jpg',
    items: [
      {
        id: '1',
        code: 'PV-BIFACIAL-585W - 14 UNITS',
        desc: 'Modul Surya Bifacial Dual-Glass 585 Wp\nPenyerapan cahaya depan & belakang (+15% gain)\nGaransi 30 Thn Linear Power',
        brand: 'Tier-1 Bifacial',
        qty: 14,
        unit: 'Pcs',
        unitPrice: 2400000,
        notes: 'Bifacial Gain',
      },
      {
        id: '2',
        code: 'BAT-LFP-10KWH - ESS STORAGE UNIT',
        desc: 'Lithium Iron Phosphate (LiFePO4) 10.24 kWh\nDeep Cycle 6000+ kali @80% DoD, Modular Expandable\nGaransi 10 Tahun',
        brand: 'SUNBLIX Storage',
        qty: 1,
        unit: 'Unit',
        unitPrice: 42000000,
        notes: 'Backup Otomatis',
      },
      {
        id: '3',
        code: 'INV-HYB-10KW-3P - SMART 3-PHASE',
        desc: 'Inverter Hybrid 10 kW 3-Phase Intelligent EMS\nZero Export ready, Generator auto-start interface\nDual MPPT efisiensi 98.8%',
        brand: 'SUNBLIX Pro',
        qty: 1,
        unit: 'Unit',
        unitPrice: 38500000,
        notes: '3-Phase Pure',
      },
      {
        id: '4',
        code: 'EPC-TURNKEY-BALI - FULL EPC PACKAGE',
        desc: 'Mounting aluminium tahan korosi uap laut\nProteksi petir tipe 1+2 & grounding < 1 Ohm\nSurvei drone, engineering layout, SLO ESDM',
        brand: 'SUNBLIX Bali',
        qty: 1,
        unit: 'Job',
        unitPrice: 22000000,
        notes: 'Turnkey Full',
      },
    ],
    notes: [
      'Dirancang khusus untuk iklim tropis pesisir pantai dengan material anti-korosi standar C4/C5.',
      'Sistem baterai mampu mem-backup daya saat pemadaman PLN secara instan (< 10 ms UPS grade).',
      'Termasuk pelatihan operasional dan monitoring berkala 1 tahun pertama gratis.',
      'Quotation berlaku 14 hari kalender.',
    ],
    signatory: {
      name: 'Warsa',
      title: 'VP Project Development',
      company: 'PT. SUNBLIX ENERGI INDONESIA',
    },
  },
};

function formatRupiah(num) {
  if (isNaN(num) || num === null || num === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

// -----------------------------------------------------------------------------
// OFFICIAL SUNBLIX KOP SURAT (LETTERHEAD) COMPONENT
// Identik seragam dengan kop surat resmi PT Sunblix Energi Indonesia
// -----------------------------------------------------------------------------
function SunblixKopSurat({ docNo, hideDocNumber = false }) {
  return (
    <div className="sunblix-kop-surat">
      <div className="kop-main-row">
        {/* Left: Official Sunblix Brand Logo */}
        <div className="kop-logo-col">
          <img
            src="/asset/logo.png"
            alt="SUNBLIX - Power Your World"
            className="kop-logo-img"
          />
        </div>

        {/* Right: Corporate Contact Details matching uploaded official letterhead */}
        <div className="kop-contact-col">
          <div className="kop-company-title">PT SUNBLIX ENERGI INDONESIA</div>
          <div className="kop-address-row">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#0066cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="kop-pin-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Pesanggrahan, Jakarta Selatan 12330</span>
          </div>
          <div className="kop-contacts-row">
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>sunblix.id</span>
            </span>
            <span className="kop-sep">·</span>
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>021 7362 639</span>
            </span>
            <span className="kop-sep">·</span>
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span>0852 8858 1027</span>
            </span>
            <span className="kop-sep">·</span>
            <span className="kop-contact-item">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>hello@sunblix.id</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tricolor Accent Bar (Blue 70%, Gold 20%, Green 10%) */}
      <div className="kop-tricolor-bar">
        <div className="bar-blue" />
        <div className="bar-gold" />
        <div className="bar-green" />
      </div>

      {/* Centered Bold Underlined Reference Document Number (Hidden on formal SPH letterhead) */}
      {!hideDocNumber && (
        <div className="kop-doc-number">
          <u>{docNo || 'SBX/QTN/2026/001'}</u>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN GENERATOR COMPONENT (WRAPPED IN SUSPENSE FOR SEARCH PARAMS)
// -----------------------------------------------------------------------------
function BrochureGeneratorInner() {
  const searchParams = useSearchParams();

  // Active preset & official package catalog (Defaults to official SPH 002)
  const initialPresetKey = searchParams.get('preset') || 'sph002';
  const [activePreset, setActivePreset] = useState(initialPresetKey);
  const [selectedTier, setSelectedTier] = useState('STANDARD+');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Internal Portal PIN Protection State (Server-Side Verified)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Theme State ('light' | 'dark') — Default is 'light' as requested
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('sunblix_brosur_theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setTheme(storedTheme);
      } else {
        setTheme('light');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunblix_brosur_theme', nextTheme);
    }
  };

  useEffect(() => {
    const verifySavedSession = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('sunblix_staff_token');
        if (storedToken) {
          try {
            const res = await fetch('/api/auth-staff', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'verify-token', token: storedToken }),
            });
            const data = await res.json();
            if (data.valid) {
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem('sunblix_staff_token');
            }
          } catch {
            if (storedToken.length > 20) {
              setIsAuthenticated(true);
            }
          }
        }
        setAuthChecked(true);
      }
    };
    verifySavedSession();
  }, []);

  const handleUnlock = async (e) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setPinErrorMsg('Silakan masukkan nomor PIN akses.');
      return;
    }

    setPinLoading(true);
    setPinErrorMsg('');

    try {
      const res = await fetch('/api/auth-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('sunblix_staff_token', data.token || 'sbx_staff_authenticated');
        setIsAuthenticated(true);
        setPinErrorMsg('');
      } else {
        setPinErrorMsg(data.message || 'PIN akses tidak valid. Silakan coba kembali.');
      }
    } catch {
      setPinErrorMsg('Gagal menghubungi server autentikasi.');
    } finally {
      setPinLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sunblix_staff_token');
    setIsAuthenticated(false);
    setPinInput('');
    setPinErrorMsg('');
  };

  // Form State
  const [quoteData, setQuoteData] = useState(() => {
    const base = PRESETS[initialPresetKey] || PRESETS.sph002 || PRESETS.sph001;
    // Allow URL params override
    return {
      ...base,
      portfolios: base.portfolios || DEFAULT_PORTFOLIOS,
      sphCode: searchParams.get('sph') || base.sphCode || 'SPH 002',
      customer: searchParams.get('customer') || base.customer,
      project: searchParams.get('project') || base.project,
      powerKwp: searchParams.get('kwp') || base.powerKwp,
      docNo: searchParams.get('docNo') || base.docNo,
    };
  });

  // UI state
  const [activePage, setActivePage] = useState('all'); // 'all', '1', '2', '3', '4'
  const [zoomScale, setZoomScale] = useState(1);
  const [includePpn, setIncludePpn] = useState(true);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'
  const [activeSectionTab, setActiveSectionTab] = useState('ALL'); // 'ALL' | 'A' | 'B' | 'C' | 'D' | 'E'

  // Dynamic Page Ordering & Visibility State
  const DEFAULT_PAGES = [
    { id: '1', title: 'Halaman 1: Cover & Hero PLTS', shortTitle: 'Hal 1: Cover', icon: '☀️', enabled: true },
    { id: '2', title: 'Halaman 2: Spesifikasi & Paket', shortTitle: 'Hal 2: Spesifikasi', icon: '⚙️', enabled: true },
    { id: '3', title: 'Halaman 3: SPH Penawaran Harga', shortTitle: 'Hal 3: SPH Quote', icon: '📊', enabled: true },
    { id: '4', title: 'Halaman 4: Portofolio Projek', shortTitle: 'Hal 4: Portofolio', icon: '📁', enabled: true },
  ];
  const [pagesOrder, setPagesOrder] = useState(DEFAULT_PAGES);

  const handleMovePage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pagesOrder.length) return;
    const updated = [...pagesOrder];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setPagesOrder(updated);
  };

  const handleTogglePage = (id) => {
    setPagesOrder((prev) => {
      const activeCount = prev.filter((p) => p.enabled).length;
      const target = prev.find((p) => p.id === id);
      if (target?.enabled && activeCount <= 1) {
        alert('Minimal satu halaman harus tetap aktif!');
        return prev;
      }
      return prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p));
    });
  };

  const handleResetPageOrder = () => {
    setPagesOrder(DEFAULT_PAGES);
  };

  // Responsive zoom scale calculation for mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
        // A4 sheet width is approx 794px at 96 DPI
        const availableW = window.innerWidth - 32;
        const fit = Math.min(1, Math.max(0.40, availableW / 794));
        setZoomScale(Number(fit.toFixed(2)));
      } else {
        setZoomScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Switch preset
  const handleSelectPreset = (key) => {
    setActivePreset(key);
    if (PRESETS[key]) {
      const data = JSON.parse(JSON.stringify(PRESETS[key]));
      if (!data.portfolios || data.portfolios.length === 0) {
        data.portfolios = DEFAULT_PORTFOLIOS;
      }
      setQuoteData(data);
    }
  };

  // Switch to official package from SUNBLIX Pricelist 2026
  const handleSelectOfficialPackage = (pkgId) => {
    setActivePreset(pkgId);
    const pkg = SUNBLIX_OFFICIAL_PACKAGES_2026.find((p) => p.id === pkgId);
    if (pkg) {
      const newPreset = getPresetFromPackage(
        pkg,
        quoteData.docNo || 'SBX/SPH/X/2026/001',
        quoteData.sphCode || 'SPH 001',
        quoteData.customer || 'Bapak/Ibu Pelanggan'
      );
      newPreset.portfolios = quoteData.portfolios || DEFAULT_PORTFOLIOS;
      setQuoteData(newPreset);
    }
  };

  // Generate automated SPH Document Number
  const handleGenerateDocNo = () => {
    const now = new Date();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const month = romanMonths[now.getMonth()];
    const year = now.getFullYear();
    const randNum = String(Math.floor(Math.random() * 900) + 100);
    const newDoc = `SBX/SPH/${month}/${year}/${randNum}`;
    const newSph = `SPH ${randNum}`;
    setQuoteData((prev) => ({
      ...prev,
      docNo: newDoc,
      sphCode: newSph,
    }));
  };

  // BOQ Item handling
  const handleItemChange = (index, field, value) => {
    const updated = [...quoteData.items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'qty' || field === 'unitPrice' ? Number(value) || 0 : value,
    };
    setQuoteData({ ...quoteData, items: updated });
  };

  const handleAddItem = (template = null) => {
    const newItem = template
      ? {
          id: String(Date.now()),
          code: template.code,
          desc: template.desc,
          brand: template.brand || 'SUNBLIX',
          qty: template.qty || 1,
          unit: template.unit || 'Unit',
          unitPrice: template.unitPrice || 0,
          notes: template.notes || 'Ready Stock',
        }
      : {
          id: String(Date.now()),
          code: 'ITEM-BARU - SPESIFIKASI',
          desc: 'Deskripsi detail material / spesifikasi komponen tambahan...',
          brand: 'SUNBLIX',
          qty: 1,
          unit: 'Pcs',
          unitPrice: 1000000,
          notes: 'Ready Stock',
        };
    setQuoteData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (index) => {
    if (quoteData.items.length <= 1) {
      alert('Minimal harus terdapat 1 item dalam daftar penawaran.');
      return;
    }
    const updated = quoteData.items.filter((_, i) => i !== index);
    setQuoteData({ ...quoteData, items: updated });
  };

  // Helper to ensure all 5 official SPH sections (A s/d E) exist with database unit prices
  const ensureSections = (data) => {
    const DEFAULT_ITEM_PRICES = {
      'Panel surya (PV module)': 2250000,
      'Inverter': 24500000,
      'Inverter hybrid': 24500000,
      'Baterai penyimpanan energi (BESS)': 20400000,
      'Baterai lithium (ESS)': 20400000,
      'Struktur mounting': 16800000,
      'Mounting & rel panel': 16800000,
      'Kabel daya PLTS': 4500000,
      'Kabel DC & AC': 4500000,
      'Panel proteksi': 5800000,
      'Panel proteksi DC & AC': 5800000,
      'Aksesori & material kecil': 2500000,
      'Instalasi mekanikal': 6500000,
      'Instalasi elektrikal': 6000000,
      'Testing & commissioning': 3000000,
      'Training & dukungan proyek': 2500000,
      'Pengiriman material': 2500000,
    };

    const rawSections = (data?.sections && Array.isArray(data.sections) && data.sections.length >= 5)
      ? data.sections
      : [
          {
            code: 'A',
            title: 'MATERIAL UTAMA',
            priceText: data?.unitBasePrice ? `Rp ${Number(data.unitBasePrice).toLocaleString('id-ID')}` : 'Rp 177.200.000',
            items: [
              {
                item: 'Panel surya (PV module)',
                spec: 'SBX-PV-585-ABF — Panel Surya N-Type TOPCon Bifacial 585 Wp · Astronergy CHSM72N(DG)/F-BH',
                qty: 12,
                unit: 'Pcs',
                unitPrice: 2250000,
                warranty: '12 thn (ketentuan paket)',
                priceText: '',
              },
              {
                item: 'Inverter hybrid',
                spec: 'SBX-INV-HY1L-6K-S5 — Inverter Hybrid 1 Fasa 6 kW (baterai 48 V) · Deye SUN-6K-SG05LP1',
                qty: 1,
                unit: 'Unit',
                unitPrice: 24500000,
                warranty: '5 thn (ketentuan paket)',
                priceText: '',
              },
              {
                item: 'Baterai lithium (ESS)',
                spec: 'SBX-BAT-L051-DG05 — Baterai LiFePO4 51,2 V 5,1 kWh · Deye SE-G5.1',
                qty: 1,
                unit: 'Unit',
                unitPrice: 20400000,
                warranty: '5 thn (ketentuan paket)',
                priceText: '',
              },
              {
                item: 'Struktur mounting',
                spec: 'SBX-MTG-LFEET + SBX-MTG-RAIL-3600 — Rail aluminium, bracket l feet, clamp & grounding modul',
                qty: 1,
                unit: 'Set',
                unitPrice: 16800000,
                warranty: 'Bracket 5 thn (ketentuan paket)',
                priceText: '',
              },
            ],
          },
          {
            code: 'B',
            title: 'MATERIAL PENDUKUNG',
            priceText: 'Termasuk',
            items: [
              {
                item: 'Kabel daya PLTS',
                spec: 'Kabel solar PV (DC), kabel AC & kabel baterai',
                qty: 1,
                unit: 'Lot',
                unitPrice: 4500000,
                warranty: 'SUNBLIX 1 thn',
                priceText: '',
              },
              {
                item: 'Panel proteksi',
                spec: 'SPD DC/AC, MCB/MCCB, proteksi baterai & grounding',
                qty: 1,
                unit: 'Lot',
                unitPrice: 5800000,
                warranty: 'SUNBLIX 1 thn',
                priceText: '',
              },
              {
                item: 'Aksesori & material kecil',
                spec: 'Conduit, cable tray, terminal & bulk material',
                qty: 1,
                unit: 'Lot',
                unitPrice: 2500000,
                warranty: 'SUNBLIX 1 thn',
                priceText: '',
              },
            ],
          },
          {
            code: 'C',
            title: 'INSTALASI & COMMISSIONING',
            priceText: 'Termasuk',
            items: [
              {
                item: 'Instalasi mekanikal',
                spec: 'Pemasangan mounting & panel surya standar K3',
                qty: 1,
                unit: 'Lot',
                unitPrice: 6500000,
                warranty: 'SUNBLIX 1 thn',
                priceText: '',
              },
              {
                item: 'Instalasi elektrikal',
                spec: 'Wiring DC/AC, pemasangan inverter, baterai & panel proteksi',
                qty: 1,
                unit: 'Lot',
                unitPrice: 6000000,
                warranty: 'SUNBLIX 1 thn',
                priceText: '',
              },
              {
                item: 'Testing & commissioning',
                spec: 'Uji sistem, setting inverter & aktivasi akun monitoring',
                qty: 1,
                unit: 'Lot',
                unitPrice: 3000000,
                warranty: '-',
                priceText: '',
              },
            ],
          },
          {
            code: 'D',
            title: 'PEKERJAAN TAMBAHAN',
            priceText: '-',
            items: [
              {
                item: 'Training & dukungan proyek',
                spec: 'Training pengguna, akomodasi tim & administrasi proyek',
                qty: 1,
                unit: 'Lot',
                unitPrice: 2500000,
                warranty: '-',
                priceText: '',
              },
            ],
          },
          {
            code: 'E',
            title: 'PENGIRIMAN',
            priceText: '-',
            items: [
              {
                item: 'Pengiriman material',
                spec: 'Pengiriman material ke lokasi site proyek (sesuai biaya aktual)',
                qty: 1,
                unit: 'Lot',
                unitPrice: 2500000,
                warranty: '-',
                priceText: '',
              },
            ],
          },
        ];

    return rawSections.map((sec) => ({
      ...sec,
      items: (sec.items || []).map((it) => {
        if (it.unitPrice !== undefined && it.unitPrice !== null && it.unitPrice !== '' && it.unitPrice !== 0) {
          return it;
        }
        const fallback = DEFAULT_ITEM_PRICES[it.item] || 0;
        return {
          ...it,
          unitPrice: it.unitPrice || fallback,
        };
      }),
    }));
  };

  // Section (A s/d E) BOQ Handlers for Account Executive Customization
  const handleSectionPriceChange = (secCode, newPriceText) => {
    const currentSecs = ensureSections(quoteData);
    const updated = currentSecs.map((sec) =>
      sec.code === secCode ? { ...sec, priceText: newPriceText } : sec
    );
    setQuoteData((prev) => ({ ...prev, sections: updated }));
  };

  const handleSectionItemChange = (secCode, itemIndex, field, value) => {
    const currentSecs = ensureSections(quoteData);
    const updated = currentSecs.map((sec) => {
      if (sec.code !== secCode) return sec;
      const newItems = [...sec.items];
      let val = value;
      if (field === 'qty') {
        val = Number(value) || 0;
      } else if (field === 'unitPrice') {
        val = value === '' ? 0 : (isNaN(Number(value)) ? parsePriceNumber(value) : Number(value));
      }
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        [field]: val,
      };
      return { ...sec, items: newItems };
    });
    setQuoteData((prev) => ({ ...prev, sections: updated }));
  };

  const handleSectionAddItem = (secCode, template = null) => {
    const currentSecs = ensureSections(quoteData);
    const updated = currentSecs.map((sec) => {
      if (sec.code !== secCode) return sec;
      const newItem = template
        ? {
            item: template.item,
            spec: template.spec,
            qty: template.qty || 1,
            unit: template.unit || 'Unit',
            unitPrice: template.unitPrice || 0,
            warranty: template.warranty || '-',
            priceText: template.priceText || '',
          }
        : {
            item: 'Item Baru',
            spec: 'Spesifikasi detail material / jasa...',
            qty: 1,
            unit: 'Pcs',
            unitPrice: 0,
            warranty: '-',
            priceText: '',
          };
      return { ...sec, items: [...sec.items, newItem] };
    });
    setQuoteData((prev) => ({ ...prev, sections: updated }));
  };

  const handleSectionRemoveItem = (secCode, itemIndex) => {
    const currentSecs = ensureSections(quoteData);
    const targetSec = currentSecs.find((s) => s.code === secCode);
    if (targetSec && targetSec.items.length <= 1) {
      if (!confirm(`Kategori ${secCode} tinggal memiliki 1 baris item. Tetap hapus baris ini?`)) {
        return;
      }
    }
    const updated = currentSecs.map((sec) => {
      if (sec.code !== secCode) return sec;
      const newItems = sec.items.filter((_, idx) => idx !== itemIndex);
      return { ...sec, items: newItems };
    });
    setQuoteData((prev) => ({ ...prev, sections: updated }));
  };

  const handleSectionCatalogSelect = (secCode, e) => {
    const val = e.target.value;
    if (val === '' || val === undefined) return;
    const catOptions = SUNBLIX_SECTION_CATALOG[secCode]?.options;
    const optIdx = parseInt(val, 10);
    if (catOptions && catOptions[optIdx]) {
      handleSectionAddItem(secCode, catOptions[optIdx]);
    }
    e.target.value = '';
  };

  // Portfolio Handlers (Halaman 4: Portofolio Projek)
  const handlePortfolioChange = (index, field, value) => {
    setQuoteData((prev) => {
      const currentPorts = prev.portfolios || DEFAULT_PORTFOLIOS;
      const updated = [...currentPorts];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, portfolios: updated };
    });
  };

  const handlePortfolioStatChange = (portIndex, statIndex, field, value) => {
    setQuoteData((prev) => {
      const currentPorts = prev.portfolios || DEFAULT_PORTFOLIOS;
      const updated = [...currentPorts];
      const target = { ...updated[portIndex] };
      const stats = [...(target.stats || [])];
      stats[statIndex] = {
        ...stats[statIndex],
        [field]: value,
      };
      target.stats = stats;
      updated[portIndex] = target;
      return { ...prev, portfolios: updated };
    });
  };

  const handlePortfolioAdd = () => {
    setQuoteData((prev) => {
      const currentPorts = prev.portfolios || DEFAULT_PORTFOLIOS;
      const newPort = {
        id: `port_${Date.now()}`,
        title: 'PLTS Rooftop Sistem Baru',
        client: 'Klien Proyek Baru',
        location: 'Indonesia',
        category: 'Commercial / Residential',
        specs: 'Panel Surya Tier-1 · Inverter Smart Hybrid · BESS Lithium',
        year: new Date().getFullYear().toString(),
        desc: 'Deskripsi detail instalasi sistem PLTS terintegrasi dan performa penghematan energi...',
        imageUrl: '/asset/sunlight_house.jpg',
        stats: [
          { label: 'Kapasitas', value: '10 kWp' },
          { label: 'Produksi', value: '~1.000 kWh/bln' },
          { label: 'Garansi', value: '25 Tahun' },
        ],
      };
      return { ...prev, portfolios: [...currentPorts, newPort] };
    });
  };

  const handlePortfolioRemove = (index) => {
    setQuoteData((prev) => {
      const currentPorts = prev.portfolios || DEFAULT_PORTFOLIOS;
      if (currentPorts.length <= 1) {
        alert('Minimal harus terdapat 1 projek dalam halaman portofolio.');
        return prev;
      }
      const updated = currentPorts.filter((_, i) => i !== index);
      return { ...prev, portfolios: updated };
    });
  };

  // Parser for currency and numeric text values (e.g. "Rp 177.200.000", "5.000.000", 5000000)
  const parsePriceNumber = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val || typeof val !== 'string') return 0;
    const cleaned = val.replace(/[^0-9]/g, '');
    if (!cleaned) return 0;
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  };

  // Calculate subtotal for each SPH section (A s/d E)
  const getSectionSubtotal = (sec) => {
    if (!sec) return 0;
    const headerNum = parsePriceNumber(sec.priceText);
    const itemsNum = (sec.items || []).reduce((acc, it) => {
      const rawPrice = it.priceText !== undefined && it.priceText !== '' ? it.priceText : it.unitPrice;
      const p = parsePriceNumber(rawPrice);
      const q = Number(it.qty) || 1;
      return acc + (p * q);
    }, 0);

    // If header has explicit price (> 0), use it; otherwise fallback to items sum
    if (headerNum > 0) return headerNum;
    return itemsNum;
  };

  // Financial Calculations: Automatically sum sections A, B, C, D, E (Material Utama, Pendukung, Instalasi, Tambahan, Pengiriman)
  const sectionsSubtotal = useMemo(() => {
    const secs = ensureSections(quoteData);
    return secs.reduce((acc, sec) => acc + getSectionSubtotal(sec), 0);
  }, [quoteData.sections, quoteData.items]);

  const subtotal = useMemo(() => {
    if (sectionsSubtotal > 0) return sectionsSubtotal;
    const itemsTotal = (quoteData.items || []).reduce((acc, item) => acc + (item.qty * (item.unitPrice || 0)), 0);
    if (itemsTotal > 0) return itemsTotal;
    return quoteData.unitBasePrice || 177200000;
  }, [sectionsSubtotal, quoteData.items, quoteData.unitBasePrice]);

  const discountRate = useMemo(() => {
    return Math.min(8, Math.max(0, Number(discountPercent) || 0));
  }, [discountPercent]);

  const discountAmount = useMemo(() => {
    return Math.round(subtotal * (discountRate / 100));
  }, [subtotal, discountRate]);

  const subtotalAfterDiscount = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  const ppn = useMemo(() => {
    return includePpn ? Math.round(subtotalAfterDiscount * 0.11) : 0;
  }, [subtotalAfterDiscount, includePpn]);

  const grandTotal = useMemo(() => {
    return subtotalAfterDiscount + ppn;
  }, [subtotalAfterDiscount, ppn]);

  // Actions
  const handlePrint = () => {
    // Pastikan tab preview aktif di mobile dan semua halaman (1, 2, 3) ter-render di DOM
    if (mobileTab !== 'preview') {
      setMobileTab('preview');
    }
    setActivePage('all');

    // Beri waktu 200ms agar DOM selesai diperbarui sebelum memicu dialog cetak
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleShareWhatsApp = () => {
    const text = `*PENAWARAN RESMI PT SUNBLIX ENERGI INDONESIA*\n` +
      `No. Ref: *${quoteData.docNo}*\n` +
      `Tanggal: ${quoteData.date}\n` +
      `Klien: *${quoteData.customer}*\n` +
      `Proyek: *${quoteData.project}* (${quoteData.powerKwp} kWp)\n` +
      `Lokasi / Delivery: ${quoteData.delivery}\n\n` +
      `*Ringkasan Nilai Investasi:*\n` +
      `• Subtotal: ${formatRupiah(subtotal)}\n` +
      (discountRate > 0 ? `• Diskon Khusus (${discountRate}%): -${formatRupiah(discountAmount)}\n• DPP (Setelah Diskon): ${formatRupiah(subtotalAfterDiscount)}\n` : '') +
      (includePpn ? `• PPN (11%): ${formatRupiah(ppn)}\n` : '') +
      `• *TOTAL: ${formatRupiah(grandTotal)}*\n\n` +
      `Dokumen lengkap siap unduh/cetak melalui brosur resmi SUNBLIX.`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const text = `PENAWARAN RESMI SUNBLIX - ${quoteData.docNo}\n` +
      `Customer: ${quoteData.customer}\n` +
      `Project: ${quoteData.project}\n` +
      `Subtotal: ${formatRupiah(subtotal)}\n` +
      (discountRate > 0 ? `Diskon (${discountRate}%): -${formatRupiah(discountAmount)}\n` : '') +
      `Total: ${formatRupiah(grandTotal)}\n` +
      `Delivery: ${quoteData.delivery}\n` +
      `Tanggal: ${quoteData.date}`;

    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  // Lock Screen for Internal Staff Only
  if (authChecked && !isAuthenticated) {
    return (
      <div className={`internal-lock-overlay ${theme === 'light' ? 'light-mode' : ''}`}>
        <div className="internal-lock-card">
          <div className="lock-theme-bar">
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleTheme}
              title={`Beralih ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
            >
              <span>{theme === 'light' ? '☀️ Mode Terang' : '🌙 Mode Gelap'}</span>
            </button>
          </div>
          <div className="lock-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="lock-logo" />
          <h2 className="lock-title">SUNBLIX INTERNAL PORTAL</h2>
          <p className="lock-sub">
            Generator Penawaran Resmi & Brosur SPH.<br />
            Halaman ini khusus untuk tim Sales & Engineering PT Sunblix Energi Indonesia.
          </p>

          <form onSubmit={handleUnlock} className="lock-form">
            <div className="lock-input-group">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                className={`lock-pin-input ${pinErrorMsg ? 'is-error' : ''}`}
                placeholder="Masukkan PIN Akses 12 Digit"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinErrorMsg('');
                }}
                disabled={pinLoading}
                autoFocus
              />
              <button
                type="button"
                className="lock-eye-btn"
                onClick={() => setShowPin(!showPin)}
                title={showPin ? 'Sembunyikan' : 'Lihat PIN'}
              >
                {showPin ? '👁️' : '🔒'}
              </button>
            </div>

            {pinErrorMsg && (
              <div className="lock-error-msg">
                ⚠️ {pinErrorMsg}
              </div>
            )}

            <button type="submit" className="lock-submit-btn" disabled={pinLoading}>
              {pinLoading ? 'Memverifikasi...' : 'Buka Akses Generator ➔'}
            </button>
          </form>

          <div className="lock-footer-info">
            <span>Lupa PIN akses? Silakan hubungi Administrator / Manajemen SUNBLIX.</span>
            <div style={{ marginTop: '14px' }}>
              <Link href="/" className="lock-back-link">
                ← Kembali ke Website Utama Sunblix
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-hydration placeholder to prevent flash
  if (!authChecked) {
    return <div className={`internal-lock-overlay ${theme === 'light' ? 'light-mode' : ''}`} />;
  }

  return (
    <div className={`generator-root ${theme === 'light' ? 'light-mode' : ''}`}>
      {/* TOPBAR */}
      <header className="generator-topbar print-hide">
        <div className="topbar-left">
          <Link href="/" className="topbar-back-btn" title="Kembali ke Beranda">
            ← Beranda
          </Link>
          <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="topbar-logo" />
          <span className="topbar-badge">
            <span style={{ color: '#10b981' }}>●</span> Internal Sales Mode
          </span>
        </div>

        <div className="topbar-right">
          {/* Theme Switcher Toggle (Default Terang) */}
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title={`Beralih ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
          >
            <span>{theme === 'light' ? '☀️ Terang' : '🌙 Gelap'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary-action"
            onClick={handleCopySummary}
            title="Salin ringkasan teks penawaran"
          >
            📋 {copiedMsg ? 'Tersalin!' : 'Salin Info'}
          </button>

          <button
            type="button"
            className="btn-wa-action"
            onClick={handleShareWhatsApp}
            title="Bagikan penawaran ke WhatsApp"
          >
            💬 Kirim WA
          </button>

          <button
            type="button"
            className="btn-primary-action"
            onClick={handlePrint}
            title="Cetak atau Simpan sebagai PDF A4 resmi"
          >
            🖨️ Cetak / Simpan PDF
          </button>

          <button
            type="button"
            className="btn-logout-lock"
            onClick={handleLogout}
            title="Kunci kembali portal internal ini"
          >
            🔒 Kunci
          </button>
        </div>
      </header>

      {/* MOBILE SEGMENTED CONTROL BAR (PHONES & TABLETS) */}
      <div className="mobile-view-toggle print-hide">
        <button
          type="button"
          className={`mobile-toggle-btn ${mobileTab === 'editor' ? 'is-active' : ''}`}
          onClick={() => {
            setMobileTab('editor');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          ✏️ Edit Data & Penawaran
        </button>
        <button
          type="button"
          className={`mobile-toggle-btn ${mobileTab === 'preview' ? 'is-active' : ''}`}
          onClick={() => {
            setMobileTab('preview');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          📄 Lihat Brosur A4 ({activePage === 'all' ? `${pagesOrder.filter((p) => p.enabled).length} Hal` : `Hal ${activePage}`})
        </button>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="generator-layout">
        {/* LEFT PANEL: CONFIGURATION & EDITOR */}
        <aside className={`generator-sidebar print-hide ${mobileTab === 'preview' ? 'mobile-hidden' : ''}`}>
          {/* SECTION 1: PRESET & OFFICIAL PACKAGES SELECTION */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>⚡</span>
              <span>Katalog Resmi SUNBLIX 2026</span>
            </div>

            {/* Tier Tabs: STANDARD+, PRO, PRO+ */}
            <div className="package-tier-tabs">
              {['STANDARD+', 'PRO', 'PRO+'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  className={`package-tier-tab ${selectedTier === tier ? 'active' : ''}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Dropdown 17 Paket Resmi Sesuai Tier */}
            <div className="package-select-wrap">
              <select
                className="package-select-input"
                value={activePreset}
                onChange={(e) => handleSelectOfficialPackage(e.target.value)}
              >
                <option value="" disabled>-- Pilih Varian Paket {selectedTier} --</option>
                {SUNBLIX_OFFICIAL_PACKAGES_2026.filter((p) => p.category === selectedTier).map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.kwp} kWp • {pkg.panelsCount} Modul • Rp {pkg.price.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            {/* Preset Cepat */}
            <div style={{ marginTop: '10px' }}>
              <span className="section-hint-text" style={{ marginBottom: '4px', display: 'block' }}>
                Preset Contoh Cepat:
              </span>
              <div className="preset-grid">
                {Object.values(PRESETS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`preset-card ${activePreset === p.id ? 'is-active' : ''}`}
                    onClick={() => handleSelectPreset(p.id)}
                  >
                    <strong className="preset-card-title">{p.label}</strong>
                    <span className="preset-card-sub">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: PAGE ORDER & VISIBILITY (FLEKSIBEL) */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>📑</span>
              <span>Urutan & Pilihan Halaman</span>
            </div>
            <p className="section-hint-text">
              Atur urutan atau aktifkan/nonaktifkan halaman sesuai kebutuhan:
            </p>

            <div className="page-order-list">
              {pagesOrder.map((page, idx) => (
                <div key={page.id} className={`page-order-item ${!page.enabled ? 'is-disabled' : ''}`}>
                  <div className="page-order-left">
                    <input
                      type="checkbox"
                      checked={page.enabled}
                      onChange={() => handleTogglePage(page.id)}
                      id={`chk_page_${page.id}`}
                      className="page-order-checkbox"
                    />
                    <span className="page-order-num-badge">#{idx + 1}</span>
                    <div className="page-order-info">
                      <label htmlFor={`chk_page_${page.id}`} className="page-order-title">
                        {page.icon} {page.title}
                      </label>
                      <span className="page-order-status">
                        {page.enabled ? 'Aktif di brosur & cetak' : 'Disembunyikan'}
                      </span>
                    </div>
                  </div>

                  <div className="page-order-actions">
                    <button
                      type="button"
                      className="btn-order-arrow"
                      onClick={() => handleMovePage(idx, -1)}
                      disabled={idx === 0}
                      title="Pindahkan halaman ke atas"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="btn-order-arrow"
                      onClick={() => handleMovePage(idx, 1)}
                      disabled={idx === pagesOrder.length - 1}
                      title="Pindahkan halaman ke bawah"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="page-order-footer">
              <span className="page-order-count">
                {pagesOrder.filter((p) => p.enabled).length} dari {pagesOrder.length} halaman aktif
              </span>
              <button
                type="button"
                className="btn-reset-order"
                onClick={handleResetPageOrder}
                title="Kembalikan urutan standar (Cover → Spesifikasi → SPH)"
              >
                ↺ Reset Urutan
              </button>
            </div>
          </div>

          {/* SECTION 3: CLIENT & PROJECT META */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>📋</span>
              <span>Informasi Klien & Dokumen SPH</span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nomor Dokumen SPH (No. Surat)</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={quoteData.docNo}
                    onChange={(e) => setQuoteData({ ...quoteData, docNo: e.target.value })}
                    placeholder="Contoh: SBX/QTN/X/2026/001"
                  />
                  <button
                    type="button"
                    className="btn-auto-doc"
                    onClick={handleGenerateDocNo}
                    title="Generate Nomor Dokumen Baru Otomatis"
                  >
                    ⚡ Auto
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Kode Singkat SPH (Header Hal 3)</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.sphCode || ''}
                  onChange={(e) => setQuoteData({ ...quoteData, sphCode: e.target.value })}
                  placeholder="Contoh: SPH 001"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Tanggal Penawaran</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.date}
                  onChange={(e) => setQuoteData({ ...quoteData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tujuan Pengiriman (Delivery)</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.delivery}
                  onChange={(e) => setQuoteData({ ...quoteData, delivery: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nama Klien / Perusahaan</label>
              <input
                type="text"
                className="form-input"
                value={quoteData.customer}
                onChange={(e) => setQuoteData({ ...quoteData, customer: e.target.value })}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Alamat / Keterangan Klien</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.customerAddress || ''}
                  placeholder="Contoh: Di Tempat"
                  onChange={(e) => setQuoteData({ ...quoteData, customerAddress: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Up. / Kontak Person</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.attn || ''}
                  placeholder="Contoh: Bpk. Jajang Safaat"
                  onChange={(e) => setQuoteData({ ...quoteData, attn: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Email Klien</label>
                <input
                  type="email"
                  className="form-input"
                  value={quoteData.email || ''}
                  placeholder="Contoh: customer@email.com"
                  onChange={(e) => setQuoteData({ ...quoteData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis Sistem PLTS</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.systemType || ''}
                  placeholder="Contoh: Hybrid 1 Fasa"
                  onChange={(e) => setQuoteData({ ...quoteData, systemType: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nama / Judul Proyek</label>
              <input
                type="text"
                className="form-input"
                value={quoteData.project}
                onChange={(e) => setQuoteData({ ...quoteData, project: e.target.value })}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Kapasitas Sistem (kWp)</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.powerKwp}
                  onChange={(e) => setQuoteData({ ...quoteData, powerKwp: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kapasitas Baterai (kWh)</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.batteryKwh}
                  onChange={(e) => setQuoteData({ ...quoteData, batteryKwh: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Inverter (kW)</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.inverterKw || ''}
                  placeholder="Contoh: 6,0"
                  onChange={(e) => setQuoteData({ ...quoteData, inverterKw: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jumlah Paket</label>
                <input
                  type="number"
                  className="form-input"
                  value={quoteData.packageCount || 1}
                  onChange={(e) => setQuoteData({ ...quoteData, packageCount: Number(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: BILL OF QUANTITIES & KATEGORI SPH (A s/d E) */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>📊</span>
              <span>Kategori & BOQ SPH (A s/d E)</span>
            </div>
            <p className="section-hint-text">
              Sesuaikan item dan subtotal penawaran untuk tiap kategori resmi. Pilihan katalog resmi SUNBLIX 2026 tersedia di tiap kategori:
            </p>

            {/* Filter Tabs Kategori SPH */}
            <div className="sph-cat-filter-tabs">
              {[
                { code: 'ALL', label: 'Semua (5)' },
                { code: 'A', label: 'A. Utama' },
                { code: 'B', label: 'B. Pendukung' },
                { code: 'C', label: 'C. Instalasi' },
                { code: 'D', label: 'D. Tambahan' },
                { code: 'E', label: 'E. Pengiriman' },
              ].map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  className={`sph-cat-filter-tab ${activeSectionTab === tab.code ? 'active' : ''}`}
                  onClick={() => setActiveSectionTab(tab.code)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Render Category Sections (A s/d E) */}
            {ensureSections(quoteData)
              .filter((sec) => activeSectionTab === 'ALL' || activeSectionTab === sec.code)
              .map((sec) => {
                const catalogOptions = SUNBLIX_SECTION_CATALOG[sec.code]?.options || [];
                return (
                  <div key={sec.code} className="sph-cat-card">
                    {/* Header Kategori */}
                    <div className="sph-cat-header">
                      <div className="sph-cat-title-wrap">
                        <span className="sph-cat-badge">{sec.code}</span>
                        <strong className="sph-cat-title">{sec.title}</strong>
                        <span className="sph-cat-count-badge">{sec.items.length} item</span>
                      </div>
                    </div>

                    {/* Input Subtotal / Status Kategori yang tampil di kolom Harga tabel SPH */}
                    <div className="sph-cat-price-row">
                      <label className="form-label" style={{ marginBottom: 2 }}>
                        Status / Subtotal Kategori di Tabel SPH:
                      </label>
                      <input
                        type="text"
                        className="form-input sph-cat-price-input"
                        value={sec.priceText || ''}
                        onChange={(e) => handleSectionPriceChange(sec.code, e.target.value)}
                        placeholder="Contoh: Rp 177.200.000 / Termasuk / -"
                      />
                    </div>

                    {/* Dropdown Pilihan Katalog Resmi SUNBLIX 2026 */}
                    <div className="sph-cat-actions-row">
                      <label className="form-label" style={{ marginBottom: 2, fontSize: '11px', color: 'var(--sbx-primary-soft)' }}>
                        ⚡ Tambah dari Katalog Resmi SUNBLIX ({sec.code}):
                      </label>
                      <select
                        className="quick-add-select sph-catalog-select"
                        defaultValue=""
                        onChange={(e) => handleSectionCatalogSelect(sec.code, e)}
                      >
                        <option value="" disabled>-- Pilih Komponen dari Katalog Sunblix 2026 --</option>
                        {catalogOptions.map((opt, optIdx) => (
                          <option key={optIdx} value={optIdx}>
                            + {opt.label} ({opt.qty} {opt.unit} • {opt.warranty})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tombol Tambah Baris Manual */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        type="button"
                        className="btn-add-section-item"
                        onClick={() => handleSectionAddItem(sec.code, null)}
                        title={`Tambah baris item manual baru ke kategori ${sec.code}`}
                      >
                        + Tambah Baris Manual ({sec.code})
                      </button>
                    </div>

                    {/* Daftar Baris Item dalam Kategori */}
                    <div className="sph-cat-items-list">
                      {sec.items.length === 0 ? (
                        <div className="sph-cat-empty">
                          Belum ada item di kategori ini. Silakan pilih dari katalog di atas atau klik &quot;Tambah Baris Manual&quot;.
                        </div>
                      ) : (
                        sec.items.map((it, itemIdx) => (
                          <div key={`${sec.code}_${itemIdx}`} className="sph-item-box">
                            <div className="sph-item-header">
                              <span className="sph-item-num">
                                #{itemIdx + 1} • {it.item || 'Item'}
                              </span>
                              <button
                                type="button"
                                className="btn-remove-sph-item"
                                onClick={() => handleSectionRemoveItem(sec.code, itemIdx)}
                                title="Hapus baris item ini"
                              >
                                ✕ Hapus
                              </button>
                            </div>

                            <div className="form-group" style={{ marginBottom: 6 }}>
                              <label className="form-label">Nama Item / Pekerjaan</label>
                              <input
                                type="text"
                                className="form-input"
                                value={it.item}
                                onChange={(e) => handleSectionItemChange(sec.code, itemIdx, 'item', e.target.value)}
                                placeholder="Contoh: Panel surya (PV module)"
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: 6 }}>
                              <label className="form-label">Spesifikasi Teknis & Brand</label>
                              <textarea
                                rows={2}
                                className="form-textarea"
                                value={it.spec}
                                onChange={(e) => handleSectionItemChange(sec.code, itemIdx, 'spec', e.target.value)}
                                placeholder="Detail spesifikasi komponen atau lingkup pekerjaan..."
                              />
                            </div>

                            <div className="form-row-5">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Qty</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="form-input"
                                  value={it.qty}
                                  onChange={(e) => handleSectionItemChange(sec.code, itemIdx, 'qty', e.target.value)}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Satuan</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={it.unit}
                                  placeholder="Pcs/Unit/Set"
                                  onChange={(e) => handleSectionItemChange(sec.code, itemIdx, 'unit', e.target.value)}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Harga Satuan (Rp)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="50000"
                                  className="form-input"
                                  value={it.unitPrice !== undefined && it.unitPrice !== null ? it.unitPrice : ''}
                                  placeholder="Contoh: 2250000"
                                  onChange={(e) => handleSectionItemChange(sec.code, itemIdx, 'unitPrice', e.target.value)}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Garansi</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={it.warranty}
                                  placeholder="Contoh: 12 thn"
                                  onChange={(e) => handleSectionItemChange(sec.code, itemIdx, 'warranty', e.target.value)}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Harga Total (Opsional)</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={it.priceText || ''}
                                  placeholder="Kosongkan jika terpadu"
                                  onChange={(e) => handleSectionItemChange(sec.code, itemIdx, 'priceText', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* SECTION 4: TAX & FINANCIALS */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>💰</span>
              <span>Pengaturan Finansial & Diskon</span>
            </div>

            {/* Diskon Berjenjang (Maksimal 8%) */}
            <div className="discount-control-box">
              <div className="discount-header-row">
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Diskon Khusus (Maks. 8%)
                </label>
                <span className="discount-val-badge">
                  {discountRate > 0 ? `${discountRate}% (-${formatRupiah(discountAmount)})` : '0% (Tanpa Diskon)'}
                </span>
              </div>
              <div className="discount-input-row">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={discountRate}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="discount-slider"
                />
                <div className="discount-number-wrap">
                  <input
                    type="number"
                    min="0"
                    max="8"
                    step="0.5"
                    value={discountRate}
                    onChange={(e) => {
                      const val = Math.min(8, Math.max(0, Number(e.target.value) || 0));
                      setDiscountPercent(val);
                    }}
                    className="discount-num-input"
                  />
                  <span className="discount-pct-symbol">%</span>
                </div>
              </div>
              <div className="discount-pills">
                {[0, 2, 3, 5, 8].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    className={`discount-pill ${discountRate === tier ? 'active' : ''}`}
                    onClick={() => setDiscountPercent(tier)}
                  >
                    {tier === 0 ? '0%' : `${tier}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="ppn-toggle-row">
              <label className="ppn-toggle-label">
                <input
                  type="checkbox"
                  checked={includePpn}
                  onChange={(e) => setIncludePpn(e.target.checked)}
                  className="ppn-checkbox"
                />
                Hitung Pajak Pertambahan Nilai (PPN 11%)
              </label>
              <span className={`ppn-badge ${includePpn ? 'is-active' : ''}`}>
                {includePpn ? 'Aktif' : 'Non-PPN'}
              </span>
            </div>

            <div className="financial-summary-box">
              <div className="financial-row">
                <span className="financial-lbl">Subtotal</span>
                <strong className="financial-val">{formatRupiah(subtotal)}</strong>
              </div>
              {discountRate > 0 && (
                <>
                  <div className="financial-row is-discount">
                    <span className="financial-lbl" style={{ color: '#ef4444' }}>
                      Diskon Berjenjang ({discountRate}%)
                    </span>
                    <strong className="financial-val" style={{ color: '#ef4444' }}>
                      - {formatRupiah(discountAmount)}
                    </strong>
                  </div>
                  <div className="financial-row">
                    <span className="financial-lbl">Subtotal Setelah Diskon</span>
                    <strong className="financial-val">{formatRupiah(subtotalAfterDiscount)}</strong>
                  </div>
                </>
              )}
              {includePpn && (
                <div className="financial-row">
                  <span className="financial-lbl">PPN 11%</span>
                  <strong className="financial-val is-tax">{formatRupiah(ppn)}</strong>
                </div>
              )}
              <div className="financial-row is-total">
                <span className="financial-lbl is-total-lbl">GRAND TOTAL</span>
                <strong className="financial-val is-grand">{formatRupiah(grandTotal)}</strong>
              </div>
            </div>
          </div>

          {/* SECTION 5: SIGNATORY */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>✍️</span>
              <span>Penandatangan Resmi & Tanda Tangan</span>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nama Account Executive</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.signatory.name}
                  onChange={(e) =>
                    setQuoteData({
                      ...quoteData,
                      signatory: { ...quoteData.signatory, name: e.target.value },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jabatan</label>
                <input
                  type="text"
                  className="form-input"
                  value={quoteData.signatory.title}
                  onChange={(e) =>
                    setQuoteData({
                      ...quoteData,
                      signatory: { ...quoteData.signatory, title: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <p className="section-hint-text" style={{ marginTop: '8px' }}>
              ✓ Tanda tangan resmi Warsa terpasang otomatis di belakang emblem stempel resmi SUNBLIX.
            </p>
          </div>

          {/* SECTION 6: PORTOFOLIO PROJEK (HALAMAN 4) */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>📁</span>
              <span>Portofolio Projek (Halaman 4)</span>
              <span className="sph-cat-count-badge" style={{ marginLeft: 'auto' }}>
                {(quoteData.portfolios || DEFAULT_PORTFOLIOS).length} Projek
              </span>
            </div>

            <p className="section-hint-text">
              Kelola dokumentasi portofolio proyek yang telah dikerjakan oleh SUNBLIX. Anda dapat mengubah foto via link URL atau memilih dari galeri referensi proyek.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button
                type="button"
                className="btn-add-section-item"
                onClick={handlePortfolioAdd}
                title="Tambah kartu projek portofolio baru"
              >
                + Tambah Projek Portofolio
              </button>
            </div>

            <div className="portfolio-editor-list">
              {(quoteData.portfolios || DEFAULT_PORTFOLIOS).map((port, portIdx) => (
                <div key={port.id || portIdx} className="portfolio-item-card">
                  <div className="sph-item-header">
                    <span className="sph-item-num">
                      #{portIdx + 1} • {port.title}
                    </span>
                    <button
                      type="button"
                      className="btn-remove-sph-item"
                      onClick={() => handlePortfolioRemove(portIdx)}
                      title="Hapus projek ini dari portofolio"
                    >
                      ✕ Hapus
                    </button>
                  </div>

                  <div className="form-group" style={{ marginBottom: 6 }}>
                    <label className="form-label">Judul Proyek</label>
                    <input
                      type="text"
                      className="form-input"
                      value={port.title}
                      onChange={(e) => handlePortfolioChange(portIdx, 'title', e.target.value)}
                      placeholder="Contoh: PLTS Hybrid 7,02 kWp — Pos Pengamanan"
                    />
                  </div>

                  <div className="form-row-2" style={{ marginBottom: 6 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Nama Klien / Instansi</label>
                      <input
                        type="text"
                        className="form-input"
                        value={port.client}
                        onChange={(e) => handlePortfolioChange(portIdx, 'client', e.target.value)}
                        placeholder="Contoh: PT Marga Bara Jaya"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Lokasi Proyek</label>
                      <input
                        type="text"
                        className="form-input"
                        value={port.location}
                        onChange={(e) => handlePortfolioChange(portIdx, 'location', e.target.value)}
                        placeholder="Contoh: Sumatera Selatan"
                      />
                    </div>
                  </div>

                  <div className="form-row-2" style={{ marginBottom: 6 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Kategori Proyek</label>
                      <input
                        type="text"
                        className="form-input"
                        value={port.category}
                        onChange={(e) => handlePortfolioChange(portIdx, 'category', e.target.value)}
                        placeholder="Industrial / Commercial / Residential"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tahun Pelaksanaan</label>
                      <input
                        type="text"
                        className="form-input"
                        value={port.year}
                        onChange={(e) => handlePortfolioChange(portIdx, 'year', e.target.value)}
                        placeholder="Contoh: 2026"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 6 }}>
                    <label className="form-label">Spesifikasi Sistem & Komponen</label>
                    <input
                      type="text"
                      className="form-input"
                      value={port.specs}
                      onChange={(e) => handlePortfolioChange(portIdx, 'specs', e.target.value)}
                      placeholder="Contoh: 12x 585 Wp Bifacial · Inverter 6 kW · Baterai 5.12 kWh"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label">Deskripsi Ringkas Proyek</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      value={port.desc}
                      onChange={(e) => handlePortfolioChange(portIdx, 'desc', e.target.value)}
                      placeholder="Uraian manfaat dan keunggulan sistem yang terpasang..."
                    />
                  </div>

                  {/* FORM AMBIL FOTO VIA LINK & PILIHAN PRESET */}
                  <div className="portfolio-photo-box">
                    <label className="form-label" style={{ color: 'var(--sbx-primary-soft)', marginBottom: 4 }}>
                      🖼️ Link Foto Proyek (URL / Path Gambar):
                    </label>

                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input
                        type="text"
                        className="form-input"
                        value={port.imageUrl || ''}
                        onChange={(e) => handlePortfolioChange(portIdx, 'imageUrl', e.target.value)}
                        placeholder="Masukkan URL foto (contoh: https://... atau /asset/...)"
                      />
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label className="form-label" style={{ fontSize: '10px', textTransform: 'none', color: '#94a3b8', marginBottom: 2 }}>
                        Atau Pilih Foto Referensi Resmi SUNBLIX:
                      </label>
                      <select
                        className="form-select"
                        style={{ fontSize: '11px', padding: '5px 8px' }}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handlePortfolioChange(portIdx, 'imageUrl', e.target.value);
                          }
                        }}
                      >
                        <option value="">-- Pilih dari Galeri Foto SUNBLIX --</option>
                        {SAMPLE_PORTFOLIO_IMAGES.map((img, imgIdx) => (
                          <option key={imgIdx} value={img.url}>
                            {img.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="portfolio-thumb-preview">
                      <div className="thumb-preview-label">Preview Foto:</div>
                      <div className="thumb-preview-frame">
                        <img
                          src={port.imageUrl || '/asset/sunlight_house.jpg'}
                          alt={port.title}
                          onError={(e) => {
                            e.target.src = '/asset/sunlight_house.jpg';
                          }}
                          className="thumb-preview-img"
                        />
                        <span className="thumb-preview-badge">Link Foto Aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* Parameter Highlight (Stats 1, 2, 3) */}
                  <div className="portfolio-stats-editor" style={{ marginTop: 8 }}>
                    <label className="form-label" style={{ fontSize: '10.5px' }}>
                      Highlight Parameter (3 Metrik Ringkas):
                    </label>
                    <div className="form-row-3-stats">
                      {(port.stats || []).map((st, stIdx) => (
                        <div key={stIdx} className="stat-edit-col">
                          <input
                            type="text"
                            className="form-input stat-edit-lbl"
                            value={st.label}
                            onChange={(e) => handlePortfolioStatChange(portIdx, stIdx, 'label', e.target.value)}
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            className="form-input stat-edit-val"
                            value={st.value}
                            onChange={(e) => handlePortfolioStatChange(portIdx, stIdx, 'value', e.target.value)}
                            placeholder="Nilai"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE GO-TO-PREVIEW BUTTON */}
          <div className="mobile-action-card print-hide">
            <button
              type="button"
              className="btn-mobile-preview"
              onClick={() => {
                setMobileTab('preview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              📄 Lihat Brosur A4 Siap Cetak ➔
            </button>
          </div>
        </aside>

        {/* RIGHT PANEL: LIVE HIGH-FIDELITY BROCHURE PREVIEW */}
        <main className={`generator-preview-stage ${mobileTab === 'editor' ? 'mobile-hidden' : ''}`}>
          {/* PREVIEW CONTROLS TOOLBAR */}
          <div className="preview-controls-bar print-hide">
            <div className="page-tab-group">
              <button
                type="button"
                className={`page-tab-btn ${activePage === 'all' ? 'is-active' : ''}`}
                onClick={() => setActivePage('all')}
              >
                📄 Semua ({pagesOrder.filter((p) => p.enabled).length} Hal)
              </button>
              {pagesOrder.map((page, idx) => (
                <button
                  key={page.id}
                  type="button"
                  disabled={!page.enabled}
                  className={`page-tab-btn ${activePage === page.id ? 'is-active' : ''} ${!page.enabled ? 'is-disabled' : ''}`}
                  onClick={() => setActivePage(page.id)}
                  title={!page.enabled ? 'Halaman ini dinonaktifkan di pengaturan' : `Tampilkan urutan ke-${idx + 1}`}
                >
                  {idx + 1}. {page.shortTitle}
                </button>
              ))}
            </div>

            <div className="zoom-group">
              <span>Zoom:</span>
              <button
                type="button"
                className="zoom-btn"
                onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.1))}
                title="Perkecil"
              >
                -
              </button>
              <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 700 }}>
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                className="zoom-btn"
                onClick={() => setZoomScale((prev) => Math.min(1.4, prev + 0.1))}
                title="Perbesar"
              >
                +
              </button>
              <button
                type="button"
                className="zoom-btn"
                style={{ width: 'auto', padding: '0 8px', fontSize: '11px' }}
                onClick={() => setZoomScale(1)}
              >
                Reset
              </button>
            </div>
          </div>

          {/* A4 CANVAS CONTAINER */}
          {(() => {
            const enabledPages = pagesOrder.filter((p) => p.enabled);
            const renderedCount = activePage === 'all' ? enabledPages.length : 1;
            const heightDiff =
              zoomScale < 1
                ? Math.round((renderedCount * 1123 + Math.max(0, renderedCount - 1) * 28) * (1 - zoomScale))
                : 0;

            return (
              <div
                className="a4-pages-container"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  marginBottom: heightDiff > 0 ? `-${heightDiff}px` : undefined,
                }}
              >
                {enabledPages.map((page) => {
                  if (activePage !== 'all' && activePage !== page.id) return null;

                  if (page.id === '1') {
                    return (
                      <section key="page1" className="a4-sheet" id="brosurPage1">
                <div className="p1-dynamic-page">
                  {/* Top Header */}
                  <div className="p1-topbar">
                    <div className="p1-brand">
                      <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="p1-logo" />
                      <div className="p1-tagline">POWER YOUR WORLD.</div>
                    </div>
                    <div className="p1-top-tag">
                      <span className="p1-top-tag-bar"></span>
                      <div className="p1-top-tag-lines">
                        <div>Sistem Energi</div>
                        <div>Terintegrasi</div>
                        <div>Untuk Kehidupan</div>
                        <div>yang Lebih Baik</div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Text: Dynamic Title & Descriptions */}
                  <div className="p1-hero-content">
                    <div className="p1-hero-title-prefix">PLTS Hybrid</div>
                    <div className="p1-hero-title-kw">{quoteData.powerKwp || '2,56'} kW</div>
                    <div className="p1-hero-subtitle">Solusi Energi Mandiri, Andal dan Berkelanjutan</div>
                    <p className="p1-hero-desc">
                      Sistem energi tenaga surya hybrid dari SUNBLIX untuk memenuhi kebutuhan listrik rumah, kantor,
                      atau fasilitas usaha dengan lebih hemat, stabil, dan ramah lingkungan.
                    </p>
                  </div>

                  {/* Hero Product Visual Showcase - Clean Unclipped */}
                  <div className="p1-showcase-container">
                    <img
                      src="/asset/p1_clean_product_hero.png"
                      alt="PLTS Rooftop System Showcase"
                      className="p1-showcase-img"
                    />
                  </div>

                  {/* 4 Feature Points Strip - Native Vector */}
                  <div className="p1-features-strip">
                    <div className="p1-feat-col">
                      <div className="p1-feat-circle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      </div>
                      <div className="p1-feat-text">Solusi Energi Terintegrasi</div>
                    </div>
                    <div className="p1-feat-divider" />
                    <div className="p1-feat-col">
                      <div className="p1-feat-circle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <div className="p1-feat-text">Cocok untuk Rumah, Kantor dan Usaha</div>
                    </div>
                    <div className="p1-feat-divider" />
                    <div className="p1-feat-col">
                      <div className="p1-feat-circle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 12 11 14 15 10" />
                        </svg>
                      </div>
                      <div className="p1-feat-text">Sistem yang Andal dan Stabil</div>
                    </div>
                    <div className="p1-feat-divider" />
                    <div className="p1-feat-col">
                      <div className="p1-feat-circle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </div>
                      <div className="p1-feat-text">Lengkap, Siap Pasang dan Berkualitas</div>
                    </div>
                  </div>

                  {/* Flow Diagram: Alur Kerja Sistem Hybrid - Native Vector */}
                  <div className="p1-flow-box">
                    <div className="p1-flow-title">Alur Kerja Sistem Hybrid</div>
                    <div className="p1-flow-row">
                      {/* 1: Energi Matahari */}
                      <div className="p1-flow-item">
                        <div className="p1-flow-icon-circle">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" strokeWidth="1">
                            <circle cx="12" cy="12" r="5" fill="#fbbf24" />
                            <line x1="12" y1="1" x2="12" y2="3" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="12" y1="21" x2="12" y2="23" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="1" y1="12" x2="3" y2="12" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="21" y1="12" x2="23" y2="12" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="p1-flow-lbl">Energi Matahari</div>
                      </div>

                      <div className="p1-flow-arr">➔</div>

                      {/* 2: Panel Surya */}
                      <div className="p1-flow-item">
                        <div className="p1-flow-icon-circle">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.5">
                            <rect x="2" y="3" width="20" height="18" rx="2" fill="#e0f2fe" />
                            <line x1="2" y1="9" x2="22" y2="9" />
                            <line x1="2" y1="15" x2="22" y2="15" />
                            <line x1="8.5" y1="3" x2="8.5" y2="21" />
                            <line x1="15.5" y1="3" x2="15.5" y2="21" />
                          </svg>
                        </div>
                        <div className="p1-flow-lbl">Panel Surya (DC)</div>
                      </div>

                      <div className="p1-flow-arr">➔</div>

                      {/* 3: Power System Unit */}
                      <div className="p1-flow-item">
                        <div className="p1-flow-icon-circle" style={{ padding: '2px' }}>
                          <img src="/asset/card2_inverter_clean.png" alt="Inverter" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <div className="p1-flow-lbl">
                          <strong>Power System Unit</strong><br />(All In One)
                        </div>
                      </div>

                      <div className="p1-flow-arr">➔</div>

                      {/* 4: Baterai */}
                      <div className="p1-flow-item">
                        <div className="p1-flow-icon-circle">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8">
                            <rect x="2" y="7" width="17" height="12" rx="2" fill="#eff6ff" />
                            <line x1="21" y1="11" x2="21" y2="15" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="6" y1="13" x2="10" y2="13" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                            <line x1="8" y1="11" x2="8" y2="15" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="p1-flow-lbl">Baterai (Penyimpanan)</div>
                      </div>

                      <div className="p1-flow-arr">➔</div>

                      {/* 5: Beban Rumah */}
                      <div className="p1-flow-item">
                        <div className="p1-flow-icon-circle">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8">
                            <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#f0f9ff" />
                            <polygon points="12 8 10 13 13 13 11 18 15 12 12 12 12 8" fill="#f59e0b" stroke="#f59e0b" strokeWidth="0.5" />
                          </svg>
                        </div>
                        <div className="p1-flow-lbl">
                          Listrik untuk Rumah /<br />Kantor / Usaha (AC)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Trust Badges Strip - Native Vector */}
                  <div className="p1-badges-grid">
                    <div className="p1-badge-card">
                      <div className="p1-badge-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#e0f2fe" />
                          <polyline points="9 12 11 14 15 10" stroke="#0369a1" strokeWidth="2" />
                        </svg>
                      </div>
                      <div className="p1-badge-info">
                        <div className="p1-badge-lbl">Garansi Produk & Instalasi</div>
                        <div className="p1-badge-strong">1 Tahun</div>
                      </div>
                    </div>

                    <div className="p1-badge-card">
                      <div className="p1-badge-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#e0f2fe" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </div>
                      <div className="p1-badge-info">
                        <div className="p1-badge-lbl">Produk Komponen</div>
                        <div className="p1-badge-strong">Ready Stock</div>
                      </div>
                    </div>

                    <div className="p1-badge-card">
                      <div className="p1-badge-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="#e0f2fe" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div className="p1-badge-info">
                        <div className="p1-badge-lbl">Quotation Berlaku</div>
                        <div className="p1-badge-strong">14 Hari Kalender</div>
                      </div>
                    </div>

                    <div className="p1-badge-card">
                      <div className="p1-badge-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" fill="#e0f2fe" />
                        </svg>
                      </div>
                      <div className="p1-badge-info">
                        <div className="p1-badge-lbl">Dukungan Teknis</div>
                        <div className="p1-badge-strong">& After Sales</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

                  if (page.id === '2') {
                    return (
                      <section key="page2" className="a4-sheet" id="brosurPage2">
                <div className="p2-dynamic-page">
                  {/* Official Navy Topbar with Authentic Sunblix Logo */}
                  <div className="p2-topbar">
                    <div className="p2-topbar-left">
                      <img src="/asset/sunblix_official_white.png" alt="SUNBLIX" className="p2-topbar-logo" />
                    </div>
                    <div className="p2-topbar-right">
                      <div className="p2-topbar-badge">
                        <h2 className="p2-topbar-title">{quoteData.project || 'PLTS Hybrid 2,56 kW'}</h2>
                        <div className="p2-topbar-sub">Spesifikasi Lengkap dan Komponen Paket</div>
                      </div>
                    </div>
                  </div>

                  {/* Rincian Paket Intro */}
                  <div className="p2-intro-section">
                    <div className="p2-intro-title">RINCIAN PAKET</div>
                    <p className="p2-intro-desc">
                      Paket {quoteData.project || 'PLTS Hybrid 2,56 kW'} dari SUNBLIX terdiri dari perangkat utama, material pendukung, dan layanan sesuai kebutuhan proyek.
                    </p>
                  </div>

                  {/* 4 Numbered Component Cards */}
                  <div className="p2-cards-grid">
                    {/* Card 1: Lithium Battery */}
                    <div className="p2-card">
                      <div className="p2-card-header">
                        <span className="p2-card-num">1</span>
                        <span className="p2-card-title">Lithium Battery Unit {quoteData.batteryKwh} kWh</span>
                      </div>
                      <div className="p2-card-img-wrap">
                        <img src="/asset/card1_battery_clean.png" alt="Lithium Battery" className="p2-card-img" />
                      </div>
                      <div className="p2-card-specs">
                        <div>• Brand : <strong>SUNBLIX</strong></div>
                        <div>• Type : <strong>AE-F{quoteData.batteryKwh}</strong></div>
                        <div>• Kapasitas : <strong>{quoteData.batteryKwh} kWh</strong></div>
                        <div>• Tipe : <strong>Low Voltage (LiFePO4)</strong></div>
                      </div>
                      <div className="p2-card-btn-wrap">
                        <span className="p2-btn-ready">
                          <span style={{ fontSize: '10px' }}>📦</span> Ready Stock
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Power System Unit */}
                    <div className="p2-card">
                      <div className="p2-card-header">
                        <span className="p2-card-num">2</span>
                        <span className="p2-card-title">Power System Unit {quoteData.inverterKw} kW (All In One)</span>
                      </div>
                      <div className="p2-card-img-wrap">
                        <img src="/asset/card2_inverter_clean.png" alt="Power System Unit" className="p2-card-img" />
                      </div>
                      <div className="p2-card-specs">
                        <div>• Brand : <strong>SUNBLIX</strong></div>
                        <div>• Type : <strong>SUN-BK250-{quoteData.batteryKwh}KWH-EU-AM4-32L</strong></div>
                        <div>• Daya : <strong>{quoteData.inverterKw} kW (1 Phase)</strong></div>
                      </div>
                      <div className="p2-card-btn-wrap">
                        <span className="p2-btn-ready">
                          <span style={{ fontSize: '10px' }}>📦</span> Ready Stock
                        </span>
                      </div>
                    </div>

                    {/* Card 3: PV Module */}
                    <div className="p2-card">
                      <div className="p2-card-header">
                        <span className="p2-card-num">3</span>
                        <span className="p2-card-title">PV Module Bifacial 720Wp</span>
                      </div>
                      <div className="p2-card-img-wrap">
                        <img src="/asset/card3_pv_clean.png" alt="PV Module" className="p2-card-img" />
                      </div>
                      <div className="p2-card-specs">
                        <div>• Brand : <strong>Trina Solar</strong></div>
                        <div>• Tipe : <strong>TSM-NEG21C.20</strong></div>
                        <div>• Daya : <strong>720 Wp</strong></div>
                        <div>• Jumlah : <strong>{quoteData.panels || '4 pcs'}</strong></div>
                      </div>
                    </div>

                    {/* Card 4: Paket Material & Aksesori */}
                    <div className="p2-card">
                      <div className="p2-card-header">
                        <span className="p2-card-num">4</span>
                        <span className="p2-card-title">Paket Material & Aksesori</span>
                      </div>
                      <div className="p2-card-img-wrap">
                        <img src="/asset/card4_acc_clean.png" alt="Aksesoris" className="p2-card-img" />
                      </div>
                      <div className="p2-card-specs">
                        <div>• Mounting Set - Aluminium</div>
                        <div style={{ paddingLeft: '8px', color: '#64748b' }}>(exclude floater part)</div>
                        <div>• DC PV Power Cable 1x4mm (100M)</div>
                        <div>• AC Power Cable 3x4mm (15M)</div>
                        <div>• Small Materials & Accessories</div>
                        <div>• Protection Unit</div>
                      </div>
                    </div>
                  </div>

                  {/* Two Side-by-Side Detailed Specification Boxes */}
                  <div className="p2-spec-row">
                    {/* Left Spec Box: Trina Solar */}
                    <div className="p2-spec-box">
                      <div className="p2-spec-box-header">
                        SPESIFIKASI PANEL SURYA Trina Solar Vertex N - 720Wp
                      </div>
                      <div className="p2-spec-box-body">
                        <img src="/asset/spec_pv_clean.png" alt="Trina Solar Spec" className="p2-spec-img-pv" />
                        <table className="p2-spec-table">
                          <tbody>
                            <tr><td className="p2-tbl-key">Model</td><td className="p2-tbl-val">: TSM-NEG21C.20</td></tr>
                            <tr><td className="p2-tbl-key">Teknologi</td><td className="p2-tbl-val">: N-type i-TOPCon Bifacial Dual Glass</td></tr>
                            <tr><td className="p2-tbl-key">Daya Maksimum</td><td className="p2-tbl-val">: 720 Wp (0~+5W)</td></tr>
                            <tr><td className="p2-tbl-key">Efisiensi Modul</td><td className="p2-tbl-val">: 23,2%</td></tr>
                            <tr><td className="p2-tbl-key">Tipe Sel</td><td className="p2-tbl-val">: Monocrystalline, 132 cells</td></tr>
                            <tr><td className="p2-tbl-key">Dimensi</td><td className="p2-tbl-val">: 2384 × 1303 × 33 mm</td></tr>
                            <tr><td className="p2-tbl-key">Berat</td><td className="p2-tbl-val">: 38,3 kg</td></tr>
                            <tr><td className="p2-tbl-key">Garansi</td><td className="p2-tbl-val">: 12 tahun produk<br />30 tahun performa (1% degradasi thn pertama, 0,40%/thn)</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="p2-spec-pills-row">
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">⚡</span>
                          <span>Daya hingga 720Wp</span>
                        </div>
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">🍃</span>
                          <span>Efisiensi Modul 23,2%</span>
                        </div>
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">🔲</span>
                          <span>Teknologi N-type i-TOPCon</span>
                        </div>
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">🛡️</span>
                          <span>Bifacial Dual Glass</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Spec Box: Power System Unit */}
                    <div className="p2-spec-box">
                      <div className="p2-spec-box-header">
                        SPESIFIKASI POWER SYSTEM UNIT SUN-BK250-{quoteData.batteryKwh}KWH-EU-AM4-32L
                      </div>
                      <div className="p2-spec-box-body">
                        <img src="/asset/spec_inv_clean.png" alt="Power System Spec" className="p2-spec-img-inv" />
                        <table className="p2-spec-table">
                          <tbody>
                            <tr><td className="p2-tbl-key">Model</td><td className="p2-tbl-val">: SUN-BK250-{quoteData.batteryKwh}KWH-EU-AM4-32L</td></tr>
                            <tr><td className="p2-tbl-key">Daya AC Rated</td><td className="p2-tbl-val">: 2.500 W (1 Phase)</td></tr>
                            <tr><td className="p2-tbl-key">Daya PV Maksimum</td><td className="p2-tbl-val">: 5.760 W</td></tr>
                            <tr><td className="p2-tbl-key">Baterai</td><td className="p2-tbl-val">: LiFePO4 {quoteData.batteryKwh} kWh (44,8~57,6 V, 50A)</td></tr>
                            <tr><td className="p2-tbl-key">Efisiensi Maksimum</td><td className="p2-tbl-val">: 96,5%</td></tr>
                            <tr><td className="p2-tbl-key">MPPT Voltage Range</td><td className="p2-tbl-val">: 20 – 55 V</td></tr>
                            <tr><td className="p2-tbl-key">Jumlah MPPT</td><td className="p2-tbl-val">: 4 (1+1+1+1)</td></tr>
                            <tr><td className="p2-tbl-key">Komunikasi</td><td className="p2-tbl-val">: Wi-Fi, Bluetooth, LoRa</td></tr>
                            <tr><td className="p2-tbl-key">Proteksi</td><td className="p2-tbl-val">: IP65 | Berat: 30 kg</td></tr>
                            <tr><td className="p2-tbl-key">Dimensi</td><td className="p2-tbl-val">: 560 × 330 × 210 mm</td></tr>
                            <tr><td className="p2-tbl-key">Garansi</td><td className="p2-tbl-val">: 10 tahun</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="p2-spec-pills-row">
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">⚡</span>
                          <span>Maks. 5.760W PV Input</span>
                        </div>
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">🔋</span>
                          <span>{quoteData.batteryKwh} kWh LFP Battery</span>
                        </div>
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">🔌</span>
                          <span>2.500W On & Off-grid</span>
                        </div>
                        <div className="p2-pill-item">
                          <span className="p2-pill-circle">📱</span>
                          <span>Monitoring via Deye Cloud App</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Skema Penggunaan & Spesifikasi Paket Material - Native */}
                  <div className="p2-bottom-row">
                    {/* Skema Penggunaan */}
                    <div className="p2-bottom-box">
                      <div className="p2-bottom-box-title">SKEMA PENGGUNAAN</div>
                      <div className="p2-skema-grid">
                        <div className="p2-skema-item">
                          <div className="p2-skema-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                          </div>
                          <div className="p2-skema-lbl">Rumah Tinggal</div>
                        </div>

                        <div className="p2-skema-item">
                          <div className="p2-skema-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8">
                              <rect x="4" y="2" width="16" height="20" rx="2" />
                              <line x1="9" y1="6" x2="9" y2="6.01" strokeWidth="2.5" />
                              <line x1="15" y1="6" x2="15" y2="6.01" strokeWidth="2.5" />
                              <line x1="9" y1="10" x2="9" y2="10.01" strokeWidth="2.5" />
                              <line x1="15" y1="10" x2="15" y2="10.01" strokeWidth="2.5" />
                              <line x1="9" y1="14" x2="9" y2="14.01" strokeWidth="2.5" />
                              <line x1="15" y1="14" x2="15" y2="14.01" strokeWidth="2.5" />
                              <path d="M10 22v-4h4v4" />
                            </svg>
                          </div>
                          <div className="p2-skema-lbl">Kantor</div>
                        </div>

                        <div className="p2-skema-item">
                          <div className="p2-skema-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8">
                              <path d="M3 9l2-5h14l2 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                              <path d="M3 9h18" />
                              <path d="M9 22V12h6v10" />
                            </svg>
                          </div>
                          <div className="p2-skema-lbl">Usaha Komersial</div>
                        </div>

                        <div className="p2-skema-item">
                          <div className="p2-skema-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8">
                              <line x1="2" y1="20" x2="22" y2="20" strokeWidth="2" />
                              <line x1="12" y1="4" x2="12" y2="20" strokeWidth="1.5" />
                              <line x1="6" y1="9" x2="6" y2="20" strokeWidth="1.5" />
                              <line x1="18" y1="9" x2="18" y2="20" strokeWidth="1.5" />
                              <polygon points="12 2 2 7 22 7" fill="#e0f2fe" />
                            </svg>
                          </div>
                          <div className="p2-skema-lbl">Fasilitas Publik</div>
                        </div>
                      </div>
                    </div>

                    {/* Spesifikasi Paket Material */}
                    <div className="p2-bottom-box">
                      <div className="p2-bottom-box-title">SPESIFIKASI PAKET MATERIAL</div>
                      <div className="p2-mat-grid">
                        <div className="p2-mat-item">
                          <img src="/asset/mat_mounting.png" alt="Mounting" className="p2-mat-pic" />
                          <div className="p2-mat-lbl">Mounting Set Aluminium<br /><span style={{ color: '#64748b' }}>(exclude floater)</span></div>
                        </div>
                        <div className="p2-mat-item">
                          <img src="/asset/mat_kabel_dc.png" alt="Kabel DC" className="p2-mat-pic" />
                          <div className="p2-mat-lbl">Kabel DC PV<br />1x4mm (100M)</div>
                        </div>
                        <div className="p2-mat-item">
                          <img src="/asset/mat_kabel_ac.png" alt="Kabel AC" className="p2-mat-pic" />
                          <div className="p2-mat-lbl">Kabel AC<br />3x4mm (15M)</div>
                        </div>
                        <div className="p2-mat-item">
                          <img src="/asset/mat_accessories.png" alt="Accessories" className="p2-mat-pic" />
                          <div className="p2-mat-lbl">Small Material<br />& Accessories</div>
                        </div>
                        <div className="p2-mat-item">
                          <img src="/asset/mat_protection.png" alt="Protection" className="p2-mat-pic" />
                          <div className="p2-mat-lbl">Protection<br />Unit</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Catatan & Ketentuan - Vector Clipboard */}
                  <div className="p2-notes-box">
                    <div className="p2-notes-left-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.8">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="#e0f2fe" />
                        <line x1="9" y1="11" x2="15" y2="11" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                        <line x1="9" y1="19" x2="13" y2="19" />
                      </svg>
                    </div>
                    <div className="p2-notes-right-content">
                      <div className="p2-notes-title">CATATAN & KETENTUAN</div>
                      <ol className="p2-notes-list">
                        <li>Harga tidak dicantumkan dalam brosur ini.</li>
                        <li>Paket mounting mencantumkan pengecualian floater part sesuai penawaran.</li>
                        <li>Biaya akomodasi dan delivery/biaya kirim material ke luar Jabodetabek tidak termasuk dan dihitung sesuai kebutuhan aktual.</li>
                        <li>Unloading di lokasi proyek menggunakan forklift apabila diperlukan karena berat unit melebihi 200 kg menjadi tanggung jawab pihak customer.</li>
                        <li>Quotation berlaku 14 hari kalender sejak tanggal quotation, atau sampai terjadi perubahan harga dari principal/vendor.</li>
                        <li>Garansi produk dan instalasi: 1 (satu) tahun.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (page.id === '3') {
            const currentSections = ensureSections(quoteData);
            const packageCount = Number(quoteData.packageCount) || 12;
            const currentUnitBasePrice = subtotalAfterDiscount;
            const currentUnitPpn = includePpn ? Math.round(currentUnitBasePrice * 0.11) : 0;
            const currentUnitTotal = currentUnitBasePrice + currentUnitPpn;
            const currentGrandTotal = currentUnitTotal * packageCount;
            const termsList = quoteData.terms || quoteData.notes || [];

            return (
              <section key="page3" className="a4-sheet" id="brosurPage3">
                <div className="p3-sph-document">
                  {/* Top Flow Header */}
                  <div>
                    {/* Kop Surat Resmi PT SUNBLIX ENERGI INDONESIA (Tanpa Underline DocNo di Kop Surat) */}
                    <SunblixKopSurat docNo={quoteData.docNo} hideDocNumber={true} />

                    {/* 2-Column Meta Section Identik Format Resmi PDF */}
                    <div className="p3-sph-meta-row">
                      <div className="p3-sph-meta-left">
                        <div className="p3-sph-meta-yth">Kepada Yth.</div>
                        <div className="p3-sph-customer-name">{quoteData.customer || 'PT Marga Bara Jaya'}</div>
                        <div className="p3-sph-customer-address">{quoteData.customerAddress || 'Di Tempat'}</div>
                        {quoteData.attn && (
                          <div className="p3-sph-customer-attn">Up. {quoteData.attn}</div>
                        )}
                        {quoteData.email && (
                          <div className="p3-sph-customer-email">{quoteData.email}</div>
                        )}
                      </div>

                      <div className="p3-sph-meta-right">
                        <table className="p3-sph-meta-table">
                          <tbody>
                            <tr>
                              <td className="p3-meta-lbl">Tanggal</td>
                              <td className="p3-meta-sep">:</td>
                              <td className="p3-meta-val">{quoteData.date || 'Jakarta, 19 Oktober 2026'}</td>
                            </tr>
                            <tr>
                              <td className="p3-meta-lbl">No. Penawaran</td>
                              <td className="p3-meta-sep">:</td>
                              <td className="p3-meta-val bold-doc">{quoteData.docNo || '002/SUNBLIX-SPH/X/2026'}</td>
                            </tr>
                            <tr>
                              <td className="p3-meta-lbl">Proyek</td>
                              <td className="p3-meta-sep">:</td>
                              <td className="p3-meta-val">{quoteData.project || 'PLTS Hybrid 12 Pos Security (1 sistem per pos)'}</td>
                            </tr>
                            <tr>
                              <td className="p3-meta-lbl">Lokasi</td>
                              <td className="p3-meta-sep">:</td>
                              <td className="p3-meta-val">{quoteData.location || quoteData.delivery || '12 lokasi pos (belum diinformasikan)'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Judul Surat Resmi */}
                    <div className="p3-sph-title">SURAT PENAWARAN HARGA</div>

                    {/* Paragraf Pembuka */}
                    <p className="p3-sph-opening">
                      Dengan hormat, bersama ini kami sampaikan penawaran harga pengadaan dan pemasangan Pembangkit Listrik Tenaga Surya (PLTS) sistem {quoteData.systemType || 'Hybrid 1 Fasa'} untuk {quoteData.project || 'PLTS Hybrid 12 Pos Security (1 sistem per pos)'}, dengan rincian sebagai berikut:
                    </p>

                    {/* Highlight Box Parameter Teknis (5 Kolom Rapi) */}
                    <div className="p3-sph-specs-bar">
                      <div className="p3-spec-col">
                        <span className="p3-spec-lbl">Kapasitas PV</span>
                        <strong className="p3-spec-v">{quoteData.powerKwp ? `${quoteData.powerKwp} kWp` : '7,02 kWp'}</strong>
                      </div>
                      <div className="p3-spec-col">
                        <span className="p3-spec-lbl">Inverter</span>
                        <strong className="p3-spec-v">{quoteData.inverterKw ? `${quoteData.inverterKw} kW` : '6,0 kW'}</strong>
                      </div>
                      <div className="p3-spec-col">
                        <span className="p3-spec-lbl">Baterai</span>
                        <strong className="p3-spec-v">{quoteData.batteryKwh ? `${quoteData.batteryKwh} kWh` : '5,10 kWh'}</strong>
                      </div>
                      <div className="p3-spec-col">
                        <span className="p3-spec-lbl">Produksi ±</span>
                        <strong className="p3-spec-v">{quoteData.estMonthlyKwh ? `${quoteData.estMonthlyKwh} kWh/bln` : '711 kWh/bln'}</strong>
                      </div>
                      <div className="p3-spec-col">
                        <span className="p3-spec-lbl">Jumlah paket</span>
                        <strong className="p3-spec-v highlight">{packageCount} paket</strong>
                      </div>
                    </div>

                    {/* Tabel BOQ SPH Identik Format PDF */}
                    <table className="p3-sph-table">
                      <thead>
                        <tr>
                          <th style={{ width: '4%', textAlign: 'center' }}>No</th>
                          <th style={{ width: '19%' }}>Item</th>
                          <th style={{ width: '32%' }}>Spesifikasi</th>
                          <th style={{ width: '4%', textAlign: 'center' }}>Qty</th>
                          <th style={{ width: '5%', textAlign: 'center' }}>Satuan</th>
                          <th style={{ width: '13%', textAlign: 'right' }}>Harga Satuan (Rp)</th>
                          <th style={{ width: '11%' }}>Garansi</th>
                          <th style={{ width: '12%', textAlign: 'right' }}>Harga (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let runningNo = 1;
                          return currentSections.map((sec) => (
                            <Fragment key={sec.code}>
                              <tr className="p3-sph-cat-row">
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{sec.code}</td>
                                <td style={{ fontWeight: 'bold' }}>{sec.title}</td>
                                <td colSpan={5}></td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                  {(() => {
                                    if (sec.priceText && sec.priceText !== '-' && sec.priceText !== '') {
                                      return sec.priceText;
                                    }
                                    const secTotal = getSectionSubtotal(sec);
                                    if (secTotal > 0) return formatRupiah(secTotal);
                                    return sec.priceText || '-';
                                  })()}
                                </td>
                              </tr>
                              {sec.items.map((it, itIdx) => {
                                const itemNo = runningNo++;
                                return (
                                  <tr key={`${sec.code}_${itIdx}`} className="p3-sph-item-row">
                                    <td style={{ textAlign: 'center' }}>{itemNo}</td>
                                    <td className="p3-cell-item">{it.item}</td>
                                    <td className="p3-cell-spec">{it.spec}</td>
                                    <td style={{ textAlign: 'center' }}>{it.qty}</td>
                                    <td style={{ textAlign: 'center' }}>{it.unit}</td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} className="p3-cell-unitprice">
                                      {it.unitPrice ? (typeof it.unitPrice === 'number' ? formatRupiah(it.unitPrice) : it.unitPrice) : (it.unitPriceText || '-')}
                                    </td>
                                    <td className="p3-cell-warranty">{it.warranty}</td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{it.priceText || ''}</td>
                                  </tr>
                                );
                              })}
                            </Fragment>
                          ));
                        })()}
                      </tbody>
                    </table>

                    {/* Ringkasan Nilai Investasi (Tabel di Sisi Kanan Bawah Tabel BOQ) */}
                    <div className="p3-sph-summary-wrap">
                      <table className="p3-sph-summary-table">
                        <tbody>
                          <tr>
                            <td className="p3-sum-label">Nilai dasar / paket</td>
                            <td className="p3-sum-num">{formatRupiah(currentUnitBasePrice)}</td>
                          </tr>
                          <tr>
                            <td className="p3-sum-label">PPN 11%</td>
                            <td className="p3-sum-num">{formatRupiah(currentUnitPpn)}</td>
                          </tr>
                          <tr>
                            <td className="p3-sum-label">Total / paket</td>
                            <td className="p3-sum-num">{formatRupiah(currentUnitTotal)}</td>
                          </tr>
                          <tr>
                            <td className="p3-sum-label">Jumlah paket</td>
                            <td className="p3-sum-num">{packageCount} paket</td>
                          </tr>
                          <tr className="p3-sum-grand-row">
                            <td className="p3-sum-label grand">TOTAL NILAI PENAWARAN</td>
                            <td className="p3-sum-num grand">{formatRupiah(currentGrandTotal)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Garis Pemisah & Spasi setelah Total Nilai Penawaran */}
                  <div className="p3-sph-section-divider" />

                  {/* Bottom Section: Ketentuan + Tanda Tangan & Emblem Resmi */}
                  <div className="p3-sph-bottom-row">
                    {/* Ketentuan Penawaran & Kalimat Penutup */}
                    <div className="p3-sph-terms-box">
                      <div className="p3-sph-terms-title">Ketentuan:</div>
                      <ol className="p3-sph-terms-list">
                        {termsList.map((t, idx) => {
                          let formattedTerm = t;
                          if (t.includes('50% uang muka') && t.includes('40% setelah material')) {
                            const dp50 = Math.round(currentGrandTotal * 0.5);
                            const mid40 = Math.round(currentGrandTotal * 0.4);
                            const fin10 = currentGrandTotal - dp50 - mid40;
                            formattedTerm = `Termin pembayaran (dari total nilai penawaran): 50% uang muka sebelum pengiriman material (${formatRupiah(dp50)}); 40% setelah material tiba di lokasi (${formatRupiah(mid40)}); 10% setelah instalasi & commissioning selesai (${formatRupiah(fin10)}).`;
                          }
                          return <li key={idx}>{formattedTerm}</li>;
                        })}
                      </ol>
                      <p className="p3-sph-closing-text">
                        Demikian penawaran ini kami sampaikan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.
                      </p>
                    </div>

                    {/* Blok Penandatangan: Tanda Tangan Warsa di Belakang Emblem SUNBLIX & Account Executive */}
                    <div className="p3-sph-sign-box">
                      <div className="p3-sph-sign-lead">Hormat kami,</div>
                      <div className="p3-sph-sign-company">{quoteData.signatory?.company || 'PT SUNBLIX ENERGI INDONESIA'}</div>

                      {/* Tanda Tangan di Belakang Emblem SUNBLIX */}
                      <div className="p3-sph-signature-wrap">
                        {/* 1. Tanda tangan Warsa di layer belakang (z-index: 1) */}
                        <img
                          src="/asset/warsa_signature.png"
                          alt="Tanda Tangan Warsa"
                          className="p3-sph-signature-img"
                        />
                        {/* 2. Emblem Resmi SUNBLIX di layer depan (z-index: 2) */}
                        <img
                          src="/asset/sunblix_emblem_hq.png"
                          alt="SUNBLIX Stamp Emblem"
                          className="p3-sph-emblem-img"
                        />
                      </div>

                      <div className="p3-sph-sign-person">
                        <div className="p3-sph-sign-name">{quoteData.signatory?.name || 'Warsa'}</div>
                        <div className="p3-sph-sign-title">{quoteData.signatory?.title || 'Account Executive'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Garis Batas Bawah (Tanpa Teks) */}
                  <div className="p3-sph-footer" />
                </div>
              </section>
            );
          }

          if (page.id === '4') {
            const portfoliosList = quoteData.portfolios || DEFAULT_PORTFOLIOS;
            return (
              <section key="page4" className="a4-sheet" id="brosurPage4">
                <div className="p4-portfolio-document">
                  {/* Top Flow Header */}
                  <div>
                    {/* Kop Surat Resmi PT SUNBLIX ENERGI INDONESIA */}
                    <SunblixKopSurat docNo={quoteData.docNo} hideDocNumber={true} />

                    {/* Header Halaman Portofolio */}
                    <div className="p4-portfolio-header">
                      <div className="p4-header-top">
                        <span className="p4-header-badge">PORTFOLIO & TRACK RECORD</span>
                        <span className="p4-header-docno">{quoteData.docNo || 'SBX/SPH/X/2026/001'}</span>
                      </div>
                      <h2 className="p4-portfolio-title">REKAM JEJAK & PORTOFOLIO PROYEK</h2>
                      <p className="p4-portfolio-subtitle">
                        Dokumentasi implementasi Pembangkit Listrik Tenaga Surya (PLTS) dan Battery Energy Storage System (BESS) terintegrasi yang telah terpasang dan beroperasi andal.
                      </p>
                    </div>

                    {/* Grid Kartu Portofolio (2x2 Layout Pas di Lembar A4) */}
                    <div className="p4-portfolio-grid">
                      {portfoliosList.slice(0, 4).map((proj, pIdx) => (
                        <div key={proj.id || pIdx} className="p4-card">
                          <div className="p4-card-img-wrap">
                            <img
                              src={proj.imageUrl || '/asset/sunlight_house.jpg'}
                              alt={proj.title}
                              className="p4-card-img"
                              onError={(e) => {
                                e.target.src = '/asset/sunlight_house.jpg';
                              }}
                            />
                            <div className="p4-card-category-badge">{proj.category || 'Solar Project'}</div>
                            <div className="p4-card-year-badge">{proj.year || '2026'}</div>
                          </div>

                          <div className="p4-card-body">
                            <h3 className="p4-card-title">{proj.title}</h3>

                            <div className="p4-card-meta">
                              <span className="p4-meta-client">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" style={{ marginRight: 3, verticalAlign: 'middle' }}>
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                {proj.client}
                              </span>
                              <span className="p4-meta-sep">•</span>
                              <span className="p4-meta-loc">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" style={{ marginRight: 3, verticalAlign: 'middle' }}>
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                {proj.location}
                              </span>
                            </div>

                            <div className="p4-card-specs-bar">
                              <span className="p4-specs-icon">⚡</span>
                              <span className="p4-specs-text">{proj.specs}</span>
                            </div>

                            <p className="p4-card-desc">{proj.desc}</p>

                            {/* 3 Metric Pills */}
                            {proj.stats && proj.stats.length > 0 && (
                              <div className="p4-card-stats-row">
                                {proj.stats.map((st, stIdx) => (
                                  <div key={stIdx} className="p4-stat-pill">
                                    <span className="p4-stat-lbl">{st.label}</span>
                                    <strong className="p4-stat-val">{st.value}</strong>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Trust Strip & Footer */}
                  <div className="p4-bottom-container">
                    <div className="p4-trust-strip">
                      <div className="p4-trust-item">
                        <span className="p4-trust-icon">🛡️</span>
                        <span>Garansi Resmi Pabrikan s/d 25 Tahun</span>
                      </div>
                      <div className="p4-trust-sep">|</div>
                      <div className="p4-trust-item">
                        <span className="p4-trust-icon">⚙️</span>
                        <span>Tim EPC Bersertifikat K3 & Standar PUIL</span>
                      </div>
                      <div className="p4-trust-sep">|</div>
                      <div className="p4-trust-item">
                        <span className="p4-trust-icon">📱</span>
                        <span>24/7 Smart Cloud IoT Monitoring</span>
                      </div>
                    </div>

                    {/* Footer Garis Batas Bawah Sesuai Standar Brosur */}
                    <div className="p4-portfolio-footer" />
                  </div>
                </div>
              </section>
            );
          }

                  return null;
                })}
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}

export default function BrochureGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '40px', textAlign: 'center', color: '#fff', background: '#020c1e', minHeight: '100vh' }}>
          Memuat SUNBLIX Brochure & Quote Generator...
        </div>
      }
    >
      <BrochureGeneratorInner />
    </Suspense>
  );
}
