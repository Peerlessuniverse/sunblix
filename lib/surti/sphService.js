/**
 * ============================================================================
 * SUNBLIX SURTI AI — SPH (SURAT PENAWARAN HARGA) WORKFLOW ENGINE
 * ============================================================================
 * Directly connected to app/brosur/sunblixCatalog.js & /brosur SPH Generator
 */

import { formatRupiah, calculateSolarSystem } from './solarEngine.js';
import {
  SUNBLIX_OFFICIAL_PACKAGES_2026,
  getPresetFromPackage,
  SUNBLIX_TERMS_2026,
  SUNBLIX_SIGNATORY_DEFAULT,
} from '../../app/brosur/sunblixCatalog.js';

// In-Memory store for SPH records in Demo Mode
const sphStore = new Map();

/**
 * Generate collision-resistant SPH number
 * Format: [SEQ]/SUNBLIX-SPH/[MONTH_ROMAN]/[YEAR]
 */
export function generateSphNumber(sequence = null) {
  const now = new Date();
  const year = now.getFullYear();
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const monthRoman = romanMonths[now.getMonth()];
  const seqNum = sequence || (sphStore.size + 1);
  const paddedSeq = String(seqNum).padStart(3, '0');
  return `${paddedSeq}/SUNBLIX-SPH/${monthRoman}/${year}`;
}

/**
 * Create a draft SPH directly connected to official Brosur packages
 */
export function createDraftSph({
  customerId = 'demo-customer-01',
  customerName = 'Bapak / Ibu Pelanggan',
  customerPhone = '+62 812-xxxx-xxxx',
  customerEmail = 'customer@example.com',
  companyName = null,
  projectAddress = 'Jakarta, Indonesia',
  propertyType = 'house',
  systemType = 'hybrid',
  monthlyBill = 2500000,
  packageId = null,
  targetKwp = null,
  customRoofArea = null,
  plnPower = null,
  isDemo = true,
  notes = '',
}) {
  const calc = calculateSolarSystem({
    monthlyBill,
    propertyType,
    systemType,
    packageId,
    targetKwp,
    customRoofArea,
    location: projectAddress,
    plnPower,
  });
  const comparisons = SUNBLIX_OFFICIAL_PACKAGES_2026
    .filter((pkg) => pkg.category === 'STANDARD+' || pkg.category === 'PRO')
    .slice(0, 9)
    .map((pkg) => calculateSolarSystem({ monthlyBill, propertyType, systemType, packageId: pkg.id, customRoofArea, location: projectAddress, plnPower }));
  const comparisonPackages = comparisons.map((item) => ({
    ...item,
    plnPower,
    initialPrice: item.estimatedInvestment,
    fitLabel: item.roofAreaFeasible ? 'Sesuai luas atap' : 'Perlu verifikasi luas atap',
  }));

  const now = new Date();
  const validUntil = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const sphId = `sph-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const sphNumber = generateSphNumber();

  // Price snapshots from official catalog
  const dpp = calc.estimatedInvestment;
  const ppn = Math.round(dpp * 0.11);
  const totalInclPpn = dpp + ppn;

  // Find official package from brosur catalog
  const officialPkg = SUNBLIX_OFFICIAL_PACKAGES_2026.find((p) => p.id === calc.packageId) || SUNBLIX_OFFICIAL_PACKAGES_2026[0];
  const presetData = getPresetFromPackage(
    officialPkg,
    sphNumber,
    `SPH ${String(sphStore.size + 1).padStart(3, '0')}`,
    customerName
  );

  const projectTitle = `PLTS Hybrid ${calc.kwp} kWp (${calc.packageName})`;

  // URL pointing directly to the Brosur SPH page with parameters pre-filled
  const brosurUrl = `/brosur?sphId=${sphId}&preset=${calc.packageId}&customer=${encodeURIComponent(customerName)}&docNo=${encodeURIComponent(sphNumber)}&project=${encodeURIComponent(projectTitle)}&kwp=${calc.kwp}&phone=${encodeURIComponent(customerPhone)}&address=${encodeURIComponent(projectAddress)}&source=surti`;

  const sphRecord = {
    id: sphId,
    sphNumber,
    packageId: calc.packageId,
    packageName: calc.packageName,
    brosurUrl,
    isDemo,
    status: 'draft', // 'draft' | 'pending_review' | 'approved' | 'revision_requested' | 'issued' | 'cancelled'
    createdBy: 'SURTI AI Assistant',
    createdAt: now.toISOString(),
    customerName,
    customerLocation: projectAddress,
    customer: {
      id: customerId,
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      company: companyName,
      address: projectAddress,
    },

    technicalSpecs: {
      kwp: calc.kwp,
      panelCount: calc.panelCount,
      panelModel: calc.panelModel,
      panelType: calc.panelModel,
      requiredArea: calc.requiredRoofArea,
      inverter: calc.inverter,
      inverterKw: calc.inverterKw,
      phase: calc.phase,
      battery: calc.battery,
      batteryKwh: calc.batteryKwh,
      systemTypeLabel: calc.systemTypeLabel,
      monthlyKwhProduction: calc.monthlyProductionKwh,
      monthlyBill: calc.monthlyBill,
      estimatedMonthlySavings: calc.estimatedMonthlySavings,
      monthlySavings: calc.estimatedMonthlySavings,
      paybackYears: calc.paybackPeriodYears,
      coverImage: calc.coverImage,
    },
    commercial: {
      dpp,
      ppn,
      totalInclPpn,
      paymentTerms: 'Termin Resmi: 50% Uang Muka, 40% Pengiriman Material, 10% Uji Commissioning',
      currency: 'IDR',
    },
    lineItems: presetData.items || [],
    sections: presetData.sections || null,
    terms: SUNBLIX_TERMS_2026,
    signatory: SUNBLIX_SIGNATORY_DEFAULT,
    approvalHistory: [
      {
        action: 'CREATED_DRAFT',
        actor: 'SURTI AI',
        role: 'AI Assistant',
        timestamp: now.toISOString(),
        notes: `Draf disusun seragam dari Katalog Resmi Brosur SUNBLIX 2026 (${calc.packageName} - ${formatRupiah(dpp)}).`,
      },
    ],
    notes,
    comparisonPackages,
    simulationOnly: true,
    plnPower,
    customRoofArea,
  };

  sphStore.set(sphId, sphRecord);
  return sphRecord;
}

/**
 * Submit SPH draft to Admin Human Review Queue
 */
export function submitSphForReview(sphId, customerNotes = '') {
  const record = sphStore.get(sphId);
  if (!record) throw new Error(`SPH dengan ID ${sphId} tidak ditemukan.`);

  record.status = 'pending_review';
  record.approvalHistory.push({
    action: 'SUBMITTED_FOR_REVIEW',
    actor: 'Customer / SURTI',
    timestamp: new Date().toISOString(),
    notes: customerNotes || 'Draf diajukan ke antrean persetujuan tim direksi & komersial SUNBLIX.',
  });
  return record;
}

/**
 * Human Reviewer: Approve SPH
 */
export function approveSphByHuman(sphId, reviewerName = 'Danny (Director / CEO)', comments = '') {
  const record = sphStore.get(sphId);
  if (!record) throw new Error(`SPH dengan ID ${sphId} tidak ditemukan.`);

  record.status = 'approved';
  record.approvedAt = new Date().toISOString();
  record.approvedBy = reviewerName;
  record.approvalHistory.push({
    action: 'APPROVED_BY_HUMAN',
    actor: reviewerName,
    role: 'Executive Approver',
    timestamp: new Date().toISOString(),
    notes: comments || 'Konfigurasi teknis PV dan inverter disetujui sesuai katalog resmi Brosur & standar PLN.',
  });
  return record;
}

/**
 * Request Revision
 */
export function requestSphRevision(sphId, reviewerName = 'Danny (Director / CEO)', revisionReason = '') {
  const record = sphStore.get(sphId);
  if (!record) throw new Error(`SPH dengan ID ${sphId} tidak ditemukan.`);

  record.status = 'revision_requested';
  record.approvalHistory.push({
    action: 'REVISION_REQUESTED',
    actor: reviewerName,
    timestamp: new Date().toISOString(),
    notes: revisionReason,
  });
  return record;
}

/**
 * Official Issuance after Human Approval
 */
export function issueOfficialSph(sphId, issuerName = 'Danny (Director / CEO)') {
  const record = sphStore.get(sphId);
  if (!record) throw new Error(`SPH dengan ID ${sphId} tidak ditemukan.`);

  if (record.status !== 'approved') {
    throw new Error('SPH belum disetujui oleh Direksi. Penerbitan resmi ditolak.');
  }

  record.status = 'issued';
  record.issuedAt = new Date().toISOString();
  record.issuedBy = issuerName;
  record.approvalHistory.push({
    action: 'OFFICIALLY_ISSUED',
    actor: issuerName,
    role: 'Authorized Signatory',
    timestamp: new Date().toISOString(),
    notes: 'Surat Penawaran Harga resmi diterbitkan dan siap dikirim ke klien.',
  });
  return record;
}

/**
 * Get SPH by ID
 */
export function getSphById(sphId) {
  return sphStore.get(sphId) || null;
}

/**
 * List all SPHs for Admin Dashboard
 */
export function listAllSphs() {
  return Array.from(sphStore.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Clear all SPHs (for testing & clean database state)
 */
export function clearAllSphs() {
  sphStore.clear();
  return true;
}

/**
 * Pre-populate with official issued SPHs (SPH 002 & SPH 003)
 */
function seedOfficialSphs() {
  if (sphStore.size > 0) return;

  // SPH 001 - Legacy reference placeholder
  sphStore.set('sph-001', {
    id: 'sph-001',
    sphNumber: '001/SUNBLIX-SPH/IX/2026',
    packageId: 'std_256',
    packageName: 'SUNBLIX 2.56 kW Hybrid',
    brosurUrl: '/brosur?preset=sph001',
    isDemo: false,
    status: 'issued',
    createdBy: 'Warsa (Account Executive)',
    createdAt: '2026-09-30T10:00:00.000Z',
    customerName: 'Bapak/Ibu Customer (Langsa)',
    customerLocation: 'Langsa, Aceh',
    customer: {
      id: 'cust-001',
      name: 'Bapak/Ibu Customer',
      phone: '08xx-xxxx-xxxx',
      email: 'contact@example.com',
      company: '',
      address: 'Langsa, Aceh',
    },
    technicalSpecs: {
      kwp: 2.56,
      panelCount: 4,
      panelModel: 'Trina Solar Bifacial 720 Wp',
      inverter: 'SUNBLIX All In One 2.56 kW',
      inverterKw: 2.56,
      phase: '1 Fasa',
      battery: 'SUNBLIX Lithium AE-F2.56 (2.56 kWh)',
      batteryKwh: 2.56,
      systemTypeLabel: 'Hybrid 1 Fasa',
      monthlyKwhProduction: 320,
      estimatedMonthlySavings: 650000,
    },
    commercial: {
      dpp: 89061538,
      ppn: 9796769,
      totalInclPpn: 98858307,
      paymentTerms: 'Termin Resmi: 50% DP, 40% Material, 10% Commissioning',
      currency: 'IDR',
    },
    signatory: { name: 'Warsa', title: 'Account Executive' },
  });

  // SPH 002 - Case study: perusahaan tambang, 12 pos security (data pelanggan dianonimkan)
  sphStore.set('sph-002', {
    id: 'sph-002',
    sphNumber: '002/SUNBLIX-SPH/X/2026',
    packageId: 'sph002',
    packageName: 'PLTS Hybrid 12 Pos Security (5.8 kWp)',
    brosurUrl: '/brosur?preset=sph002',
    isDemo: false,
    status: 'issued',
    createdBy: 'Warsa (Account Executive)',
    createdAt: '2026-10-19T09:00:00.000Z',
    customerName: 'PT Contoh Tambang Jaya',
    customerLocation: '12 lokasi pos (belum diinformasikan)',
    customer: {
      id: 'LD-2601',
      name: 'Bpk. [Nama Pelanggan]',
      phone: '08xx-xxxx-xxxx',
      email: 'contact@example.com',
      company: 'PT Contoh Tambang Jaya',
      address: '12 lokasi pos security',
    },
    technicalSpecs: {
      kwp: 5.8,
      panelCount: 10,
      panelModel: 'Astronergy CHSM72N(DG)/F-BH TOPCon Bifacial 585 Wp',
      inverter: 'Deye SUN-6K-SG05LP1 1 Fasa (6 kW)',
      inverterKw: 6.0,
      phase: '1 Fasa',
      battery: 'Wall Mounted LiFePO4 51.2V 100Ah 5.12 kWh (2 Unit = 10.24 kWh)',
      batteryKwh: 5.12,
      systemTypeLabel: 'Hybrid 1 Fasa',
      monthlyKwhProduction: 711,
      estimatedMonthlySavings: 1200000,
    },
    commercial: {
      dpp: 146100000,
      ppn: 16071000,
      totalInclPpn: 162171000,
      paymentTerms: '50% DP (Rp 81.085.500), 40% Material (Rp 64.868.400), 10% Commissioning (Rp 16.217.100)',
      currency: 'IDR',
    },
    signatory: { name: 'Warsa', title: 'Account Executive' },
  });

  // SPH 003 - Case study: properti komersial Bali (data pelanggan dianonimkan)
  sphStore.set('sph-003', {
    id: 'sph-003',
    sphNumber: '003/SUNBLIX-SPH/X/2026',
    packageId: 'sph003',
    packageName: 'PLTS Hybrid 11 kWp + Baterai 23.4 kWh (12 Jam Back Up)',
    brosurUrl: '/brosur?preset=sph003',
    isDemo: false,
    status: 'issued',
    createdBy: 'Warsa (Account Executive)',
    createdAt: '2026-10-20T11:00:00.000Z',
    customerName: 'Contoh Property · Bapak [Nama Pelanggan]',
    customerLocation: 'Bali',
    customer: {
      id: 'LD-2602',
      name: 'Bapak [Nama Pelanggan]',
      phone: '08xx-xxxx-xxxx',
      email: 'contact@example.com',
      company: 'Contoh Property',
      address: 'Bali',
    },
    technicalSpecs: {
      kwp: 11.16,
      panelCount: 18,
      panelModel: 'Trina Vertex N TSM-NEG19RC.20 620 Wp',
      inverter: 'SolaX X1-HYB-6.0-LV (hybrid) 1 Fasa (6.0 kW)',
      inverterKw: 6.0,
      phase: '1 Fasa',
      battery: 'SolaX LD117 LFP 51,2 V 11,7 kWh (2 Unit = 23.40 kWh)',
      batteryKwh: 23.40,
      systemTypeLabel: 'Hybrid 1 Fasa',
      monthlyKwhProduction: 879,
      estimatedMonthlySavings: 1126103,
      paybackYears: 15.2,
    },
    commercial: {
      dpp: 185000000,
      ppn: 20350000,
      totalInclPpn: 205350000,
      paymentTerms: '50% DP (Rp 102.675.000), 40% Material (Rp 82.140.000), 10% Commissioning (Rp 20.535.000)',
      currency: 'IDR',
    },
    signatory: { name: 'Warsa', title: 'Account Executive' },
  });
}

seedOfficialSphs();


