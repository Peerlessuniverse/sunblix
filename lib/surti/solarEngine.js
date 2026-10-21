/**
 * ============================================================================
 * SUNBLIX SURTI AI — DETERMINISTIC SOLAR CALCULATION ENGINE
 * ============================================================================
 * Harmonized 100% with SUNBLIX OFFICIAL PRICELIST 2026 & BROSUR SPH GENERATOR
 * Extracted directly from app/brosur/sunblixCatalog.js
 */

import {
  SUNBLIX_OFFICIAL_PACKAGES_2026,
  BATTERY_ADDONS,
  SUNBLIX_TERMS_2026,
  getPresetFromPackage,
} from '../../app/brosur/sunblixCatalog.js';

export const PROPERTY_TYPES = {
  house: { id: 'house', label: 'Rumah Tinggal', multiplier: 1.0, icon: '🏠' },
  villa: { id: 'villa', label: 'Villa & Resort', multiplier: 1.15, icon: '🏡' },
  commercial: { id: 'commercial', label: 'Ruko / Bisnis Komersial', multiplier: 1.25, icon: '🏢' },
  warehouse: { id: 'warehouse', label: 'Pabrik / Pergudangan Industri', multiplier: 1.4, icon: '🏭' },
};

export const SYSTEM_TYPES = {
  hybrid: {
    id: 'hybrid',
    label: 'Hybrid (Smart BESS Battery Storage)',
    description: 'Menyimpan kelebihan daya ke baterai lithium untuk cadangan malam hari & saat PLN padam.',
    savingsRatio: 0.85,
    hasBattery: true,
  },
  ongrid: {
    id: 'ongrid',
    label: 'On-Grid (Siang Hari)',
    description: 'Memotong tagihan listrik pada jam terik siang hari secara langsung tanpa baterai.',
    savingsRatio: 0.75,
    hasBattery: false,
  },
  offgrid: {
    id: 'offgrid',
    label: 'Off-Grid (Mandiri 100%)',
    description: 'Sistem mandiri tanpa sambungan PLN dengan kapasitas baterai cadangan penuh.',
    savingsRatio: 1.0,
    hasBattery: true,
  },
};

const BILL_THRESHOLDS = {
  std_234: 1500000,
  std_351: 2200000,
  std_468: 3200000,
  std_585: 4500000,
  std_702: 6000000,
  pro_819: 7500000,
  pro_936: 9500000,
  pro_1053: 12000000,
  pro_1170: 15000000,
  pro_1404: 19000000,
  proplus_936: 12000000,
  proplus_1053: 15000000,
  proplus_1170: 18000000,
  proplus_1287: 22000000,
  proplus_1404: 26000000,
  proplus_1521: 32000000,
  proplus_1638: 999999999,
};

// Expose official packages mapped with billing thresholds
export const CATALOG_PACKAGES = SUNBLIX_OFFICIAL_PACKAGES_2026.map((pkg) => {
  const kwpNum = parseFloat(pkg.kwp) || 2.34;
  return {
    ...pkg,
    maxBillThreshold: BILL_THRESHOLDS[pkg.id] || (kwpNum * 1500000),
    panelModel: pkg.panels,
    areaSqm: parseInt(pkg.pvArea.replace(/[^0-9]/g, '')) || Math.round(pkg.panelsCount * 3.25),
    inverterHybrid: `Inverter Deye Hybrid ${pkg.inverterKw} kW (${pkg.phase})`,
    inverterOnGrid: `Inverter Deye On-Grid ${pkg.inverterKw} kW (${pkg.phase})`,
    battery: `Baterai LiFePO4 ${pkg.batteryKwh} kWh Smart BMS`,
    investmentHybrid: pkg.price,
    investmentOnGrid: Math.round(pkg.price * 0.72),
  };
});

/**
 * Deterministic Solar PV System Calculation (Harmonized with Brosur)
 */
export function calculateSolarSystem({
  monthlyBill = 2500000,
  propertyType = 'house',
  systemType = 'hybrid',
  customRoofArea = null,
  location = 'Jabodetabek',
  targetKwp = null,
  packageId = null,
}) {
  const sanitizedBill = Math.max(250000, Number(monthlyBill) || 2500000);
  const propConfig = PROPERTY_TYPES[propertyType] || PROPERTY_TYPES.house;
  const sysConfig = SYSTEM_TYPES[systemType] || SYSTEM_TYPES.hybrid;

  const adjustedBill = sanitizedBill * propConfig.multiplier;

  // 1. If explicit packageId provided, find it
  let selectedPkg = null;
  if (packageId) {
    selectedPkg = CATALOG_PACKAGES.find((p) => p.id === packageId);
  }

  // 2. If explicit targetKwp provided, find closest package
  if (!selectedPkg && targetKwp) {
    const targetNum = parseFloat(targetKwp);
    selectedPkg = CATALOG_PACKAGES.reduce((prev, curr) => {
      const prevDiff = Math.abs(parseFloat(prev.kwp) - targetNum);
      const currDiff = Math.abs(parseFloat(curr.kwp) - targetNum);
      return currDiff < prevDiff ? curr : prev;
    });
  }

  // 3. Otherwise find by adjusted monthly bill
  if (!selectedPkg) {
    const is3PhaseProperty = propertyType === 'commercial' || propertyType === 'warehouse';
    const candidatePackages = is3PhaseProperty && adjustedBill >= 12000000
      ? CATALOG_PACKAGES.filter((p) => p.phase === '3 Phase')
      : CATALOG_PACKAGES.filter((p) => p.phase === '1 Phase');

    const pool = candidatePackages.length > 0 ? candidatePackages : CATALOG_PACKAGES;
    for (const pkg of pool) {
      if (adjustedBill <= pkg.maxBillThreshold) {
        selectedPkg = pkg;
        break;
      }
    }
    if (!selectedPkg) {
      selectedPkg = pool[pool.length - 1];
    }
  }

  const isHybrid = systemType === 'hybrid' || systemType === 'offgrid';
  const inverterDesc = isHybrid ? selectedPkg.inverterHybrid : selectedPkg.inverterOnGrid;
  const batteryDesc = isHybrid ? selectedPkg.battery : 'On-Grid (Tanpa Baterai)';
  const baseInvestment = isHybrid ? selectedPkg.investmentHybrid : selectedPkg.investmentOnGrid;

  // Formula: kWh/month = kWp * PSH (4.5) * System PR/Efficiency (0.75) * 30 days
  const kwpFloat = parseFloat(selectedPkg.kwp) || 2.34;
  const PSH = 4.5;
  const systemEfficiency = 0.75;
  const monthlyKwh = Math.round(kwpFloat * PSH * systemEfficiency * 30);
  const dailyKwh = +(monthlyKwh / 30).toFixed(2);

  // Financial calculations
  const savingsRatio = sanitizedBill <= 2000000 ? sysConfig.savingsRatio - 0.05 : sysConfig.savingsRatio;
  const estimatedMonthlySavings = Math.round(sanitizedBill * savingsRatio);
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;
  const savings25Years = estimatedAnnualSavings * 25;

  // Payback period
  const paybackYears = estimatedAnnualSavings > 0
    ? +(Math.max(3.0, Math.min(7.5, baseInvestment / estimatedAnnualSavings))).toFixed(1)
    : 4.5;

  // Environmental impact
  const monthlyCo2AvoidedKg = Math.round(monthlyKwh * 0.82);
  const annualCo2AvoidedTon = +((monthlyCo2AvoidedKg * 12) / 1000).toFixed(2);
  const treesPlantedEquivalent = Math.round((annualCo2AvoidedTon * 1000) / 22);

  // Area validation
  const requiredRoofArea = selectedPkg.areaSqm;
  const roofAreaFeasible = customRoofArea ? customRoofArea >= requiredRoofArea : true;

  return {
    packageName: selectedPkg.name,
    packageId: selectedPkg.id,
    category: selectedPkg.category,
    systemType: sysConfig.id,
    systemTypeLabel: sysConfig.label,
    propertyType: propConfig.id,
    propertyTypeLabel: propConfig.label,
    kwp: kwpFloat,
    panelCount: selectedPkg.panelsCount,
    panelModel: selectedPkg.panels,
    requiredRoofArea: selectedPkg.pvArea,
    requiredRoofAreaNum: requiredRoofArea,
    roofAreaFeasible,
    inverter: inverterDesc,
    inverterKw: selectedPkg.inverterKw,
    phase: selectedPkg.phase,
    battery: batteryDesc,
    batteryKwh: selectedPkg.batteryKwh,
    monthlyBill: sanitizedBill,
    estimatedInvestment: baseInvestment,
    estimatedMonthlySavings,
    estimatedAnnualSavings,
    savingsPercentage: Math.round(savingsRatio * 100),
    savings25Years,
    paybackPeriodYears: paybackYears,
    monthlyProductionKwh: monthlyKwh,
    dailyProductionKwh: dailyKwh,
    coverImage: selectedPkg.coverImage,
    environmentalImpact: {
      monthlyCo2AvoidedKg,
      annualCo2AvoidedTon,
      treesPlantedEquivalent,
    },
    assumptions: {
      psh: PSH,
      performanceRatio: '75%',
      warrantySolarPanels: '25 Tahun Garansi Kinerja Linear (12 Tahun Garansi Produk)',
      warrantyInverter: '5 Tahun Garansi Resmi Deye',
      warrantyBattery: '5 Tahun Garansi Resmi BESS LiFePO4',
    },
    location,
  };
}

export function formatRupiah(value) {
  return 'Rp ' + Number(value || 0).toLocaleString('id-ID');
}
