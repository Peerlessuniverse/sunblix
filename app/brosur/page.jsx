'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './brosur.css';
import {
  SUNBLIX_OFFICIAL_PACKAGES_2026,
  BATTERY_ADDONS,
  COMPONENT_TEMPLATES,
  SUNBLIX_TERMS_2026,
  getPresetFromPackage,
} from './sunblixCatalog';

// -----------------------------------------------------------------------------
// DEFAULT DATA PRESETS
// -----------------------------------------------------------------------------
const PRESETS = {
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
      title: 'Authorized Representative',
      company: 'PT. SUNBLIX ENERGI INDONESIA',
    },
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
// MAIN GENERATOR COMPONENT (WRAPPED IN SUSPENSE FOR SEARCH PARAMS)
// -----------------------------------------------------------------------------
function BrochureGeneratorInner() {
  const searchParams = useSearchParams();

  // Active preset & official package catalog
  const initialPresetKey = searchParams.get('preset') || 'sph001';
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
    const base = PRESETS[initialPresetKey] || PRESETS.sph001;
    // Allow URL params override
    return {
      ...base,
      sphCode: searchParams.get('sph') || base.sphCode || 'SPH 001',
      customer: searchParams.get('customer') || base.customer,
      project: searchParams.get('project') || base.project,
      powerKwp: searchParams.get('kwp') || base.powerKwp,
      docNo: searchParams.get('docNo') || base.docNo,
    };
  });

  // UI state
  const [activePage, setActivePage] = useState('all'); // 'all', '1', '2', '3'
  const [zoomScale, setZoomScale] = useState(1);
  const [includePpn, setIncludePpn] = useState(true);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'

  // Dynamic Page Ordering & Visibility State
  const DEFAULT_PAGES = [
    { id: '1', title: 'Halaman 1: Cover & Hero PLTS', shortTitle: 'Hal 1: Cover', icon: '☀️', enabled: true },
    { id: '2', title: 'Halaman 2: Spesifikasi & Paket', shortTitle: 'Hal 2: Spesifikasi', icon: '⚙️', enabled: true },
    { id: '3', title: 'Halaman 3: SPH Penawaran Harga', shortTitle: 'Hal 3: SPH Quote', icon: '📊', enabled: true },
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
      setQuoteData(JSON.parse(JSON.stringify(PRESETS[key])));
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

  // Financial Calculations with Tiered Discount (Max 8%)
  const subtotal = useMemo(() => {
    return quoteData.items.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  }, [quoteData.items]);

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
      <div className="internal-lock-overlay">
        <div className="internal-lock-card">
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
    return <div className="internal-lock-overlay" />;
  }

  return (
    <div className="generator-root">
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

            <div className="form-group">
              <label className="form-label">Nama / Judul Proyek</label>
              <input
                type="text"
                className="form-input"
                value={quoteData.project}
                onChange={(e) => setQuoteData({ ...quoteData, project: e.target.value })}
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
          </div>

          {/* SECTION 3: BILL OF MATERIALS / ITEMS TABLE EDITOR */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <span>📦</span>
              <span>Daftar Item Material / Jasa ({quoteData.items.length})</span>
            </div>

            {quoteData.items.map((item, idx) => (
              <div key={item.id || idx} className="item-editor-row">
                <div className="item-editor-header">
                  <span className="item-editor-num">Item #{idx + 1}</span>
                  <button
                    type="button"
                    className="btn-remove-item"
                    onClick={() => handleRemoveItem(idx)}
                    title="Hapus baris item ini"
                  >
                    ✕
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Kode / Nama Komponen</label>
                  <input
                    type="text"
                    className="form-input"
                    value={item.code}
                    onChange={(e) => handleItemChange(idx, 'code', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi & Spesifikasi Teknis</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    value={item.desc}
                    onChange={(e) => handleItemChange(idx, 'desc', e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Merk Produk</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.brand}
                      onChange={(e) => handleItemChange(idx, 'brand', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qty &amp; Satuan</label>
                    <div className="qty-unit-row">
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Harga Satuan (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Catatan / Status</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.notes}
                      onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                    />
                  </div>
                </div>

                <div className="item-row-total">
                  Total Baris: <strong style={{ color: 'var(--sbx-primary-soft)' }}>{formatRupiah(item.qty * item.unitPrice)}</strong>
                </div>
              </div>
            ))}

            {/* Quick Component Template from Pricelist 2026 */}
            <div className="quick-add-box">
              <span className="quick-add-label">Pilih dari Katalog Resmi Sunblix 2026:</span>
              <select
                className="quick-add-select"
                defaultValue=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const found = COMPONENT_TEMPLATES.find((t) => t.id === val);
                  if (found) {
                    handleAddItem(found);
                    if (found.batteryKwh) {
                      const cur = parseFloat(quoteData.batteryKwh) || 0;
                      const added = parseFloat(found.batteryKwh) || 0;
                      setQuoteData((prev) => ({
                        ...prev,
                        batteryKwh: (cur + added).toFixed(2).replace(/\.00$/, ''),
                      }));
                    }
                  }
                  e.target.value = '';
                }}
              >
                <option value="" disabled>-- Tambah Komponen Standar (Auto-Fill Harga) --</option>
                <optgroup label="🔋 Battery Add-On (Sheet Pricelist 2026)">
                  <option value="bat_wm_5">Wall Mounted 5.12 kWh — Rp 20.400.000</option>
                  <option value="bat_wm_10">Wall Mounted 10.24 kWh — Rp 39.200.000</option>
                  <option value="bat_rm_5">Rack Mounted 5.12 kWh — Rp 18.000.000</option>
                </optgroup>
                <optgroup label="☀️ Modul Surya & Inverter">
                  <option value="pv_mod_585">Panel Surya Longi 585 Wp — Rp 2.150.000</option>
                  <option value="inv_deye_6k">Inverter Deye Hybrid 6 kW 1-Phase — Rp 23.500.000</option>
                  <option value="inv_deye_8k">Inverter Deye Hybrid 8 kW 1-Phase — Rp 29.800.000</option>
                  <option value="inv_deye_10k_3p">Inverter Deye Hybrid 10 kW 3-Phase — Rp 38.500.000</option>
                </optgroup>
                <optgroup label="🔩 Material & EPC">
                  <option value="mat_mounting_cabling">Paket Mounting Aluminium & Proteksi — Rp 14.500.000</option>
                  <option value="srv_epc_commissioning">Jasa Instalasi, Komisioning & SLO — Rp 12.500.000</option>
                </optgroup>
                <optgroup label="➕ Custom">
                  <option value="custom_blank">Baris Kosong Manual (Custom Item)</option>
                </optgroup>
              </select>
            </div>

            <button type="button" className="btn-add-item" onClick={() => handleAddItem(null)}>
              + Tambah Baris Komponen Baru (Manual)
            </button>
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
              <span>Penandatangan Resmi</span>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nama Representative</label>
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

                  {/* Corporate Footer with Authentic Sunblix Logo & Clean Contact Row */}
                  <div className="p2-footer-row">
                    <div className="p2-footer-left">
                      <img src="/asset/logo.png" alt="SUNBLIX" className="p2-footer-logo" />
                    </div>
                    <div className="p2-footer-divider" />
                    <div className="p2-footer-center">
                      <div className="p2-footer-company">PT. SUNBLIX ENERGI INDONESIA</div>
                      <div className="p2-footer-addr">
                        Kawasan Rasuna Epicentrum, Epiwalk Office Suite Lt. 5 Unit A501<br />
                        Jl. HR Rasuna Said, RT 02/RW 05, Kel. Karet Kuningan, Kec. Setiabudi<br />
                        Jakarta Selatan, DKI Jakarta 12940, Indonesia
                      </div>
                    </div>
                    <div className="p2-footer-divider" />
                    <div className="p2-footer-right">
                      <div className="p2-footer-contact-item">
                        <span className="p2-contact-icon-bubble">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        <span>hello@sunblix.id</span>
                      </div>
                      <div className="p2-footer-contact-item">
                        <span className="p2-contact-icon-bubble">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </span>
                        <span>0852 8858 1027</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

                  if (page.id === '3') {
                    return (
                      <section key="page3" className="a4-sheet" id="brosurPage3">
                <div className="p3-quote-content-pdf">
                  {/* Kop Surat & Judul SPH */}
                  <div className="p3-pdf-header">
                    <div className="p3-pdf-logo-wrap">
                      <img src="/asset/sublixlogo.svg" alt="SUNBLIX" className="p3-pdf-logo" />
                      <div className="p3-pdf-tagline">POWER YOUR WORLD.</div>
                    </div>
                    <div className="p3-pdf-title-block">
                      <h2 className="p3-pdf-main-title">{quoteData.sphCode || 'SPH 001'} — PRICE & PACKAGE</h2>
                      <div className="p3-pdf-meta-line">
                        {quoteData.project} • {quoteData.docNo} • {quoteData.date}
                      </div>
                    </div>
                  </div>

                  {/* Project & Delivery Info Bar */}
                  <div className="p3-pdf-meta-box">
                    <div className="p3-pdf-meta-field">
                      <span className="p3-pdf-meta-lbl">PROJECT</span>
                      <span className="p3-pdf-meta-val">{quoteData.project}</span>
                    </div>
                    <div className="p3-pdf-meta-field">
                      <span className="p3-pdf-meta-lbl">DELIVERY</span>
                      <span className="p3-pdf-meta-val">{quoteData.delivery}</span>
                    </div>
                  </div>

                  {/* Tabel BOQ SPH 001 Identik PDF */}
                  <table className="p3-pdf-table">
                    <thead>
                      <tr>
                        <th style={{ width: '4%', textAlign: 'center' }}>No.</th>
                        <th style={{ width: '22%' }}>Material / Jasa</th>
                        <th style={{ width: '34%' }}>Deskripsi / Spesifikasi</th>
                        <th style={{ width: '7%', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '13%', textAlign: 'right' }}>Harga Satuan</th>
                        <th style={{ width: '13%', textAlign: 'right' }}>Total</th>
                        <th style={{ width: '7%', textAlign: 'left', paddingLeft: '6px' }}>Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteData.items.map((item, i) => (
                        <tr key={item.id || i}>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                          <td>
                            <strong style={{ display: 'block', color: '#031f45', fontSize: '9.5px', marginBottom: '2px' }}>
                              {item.code}
                            </strong>
                          </td>
                          <td style={{ whiteSpace: 'pre-line', fontSize: '9px', color: '#334155' }}>
                            {item.desc}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>
                            {item.qty} {item.unit}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {item.unitPrice === 0 ? 'Rp —' : formatRupiah(item.unitPrice)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>
                            {item.unitPrice === 0 ? 'Rp —' : formatRupiah(item.qty * item.unitPrice)}
                          </td>
                          <td style={{ fontSize: '8.5px', color: '#475569', paddingLeft: '6px' }}>
                            {item.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Block - Exactly Aligned in 1 Right Column Matching PDF */}
                  <div className="p3-pdf-summary-box">
                    <div className="p3-summary-row">
                      <span className="p3-summary-lbl">Subtotal</span>
                      <span className="p3-summary-val">{formatRupiah(subtotal)}</span>
                    </div>
                    {discountRate > 0 && (
                      <>
                        <div className="p3-summary-row is-discount">
                          <span className="p3-summary-lbl" style={{ color: '#b91c1c' }}>
                            Diskon Khusus ({discountRate}%)
                          </span>
                          <span className="p3-summary-val" style={{ color: '#b91c1c' }}>
                            - {formatRupiah(discountAmount)}
                          </span>
                        </div>
                        <div className="p3-summary-row">
                          <span className="p3-summary-lbl">Dasar Pengenaan Pajak (DPP)</span>
                          <span className="p3-summary-val">{formatRupiah(subtotalAfterDiscount)}</span>
                        </div>
                      </>
                    )}
                    {includePpn && (
                      <div className="p3-summary-row">
                        <span className="p3-summary-lbl">Pajak Pertambahan Nilai (PPN 11%)</span>
                        <span className="p3-summary-val">{formatRupiah(ppn)}</span>
                      </div>
                    )}
                    <div className="p3-summary-total-bar">
                      <span className="p3-total-lbl">TOTAL</span>
                      <span className="p3-total-val">{formatRupiah(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Bottom Section: Notes & Terms + Official Authorized Signatory */}
                  <div className="p3-bottom-section">
                    {/* Notes & Terms */}
                    <div className="p3-pdf-notes-section">
                      <div className="p3-pdf-notes-title">NOTES & TERMS</div>
                      <ol className="p3-pdf-notes-list">
                        {quoteData.notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Authorized Signatory Block (Penandatangan Resmi) */}
                    <div className="p3-pdf-signatory-box">
                      <div className="p3-sign-lead">Hormat kami,</div>
                      <div className="p3-sign-company">
                        {quoteData.signatory?.company || 'PT. SUNBLIX ENERGI INDONESIA'}
                      </div>
                      <div className="p3-sign-space">
                        <div className="p3-stamp-badge">
                          <span className="p3-stamp-top">PT. SUNBLIX ENERGI INDONESIA</span>
                          <span className="p3-stamp-seal">OFFICIAL SEAL</span>
                          <span className="p3-stamp-date">{quoteData.date || '30 September 2026'}</span>
                        </div>
                      </div>
                      <div className="p3-sign-person">
                        <div className="p3-sign-name">{quoteData.signatory?.name || 'Warsa'}</div>
                        <div className="p3-sign-title">{quoteData.signatory?.title || 'Authorized Representative'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar Identik PDF */}
                  <div className="p3-pdf-footer">
                    <div>PT. SUNBLIX ENERGI INDONESIA</div>
                    <div className="p3-pdf-footer-contact">hello@sunblix.id • 085288581027</div>
                    <div>POWER YOUR WORLD.</div>
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
