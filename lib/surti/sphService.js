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
  isDemo = true,
  notes = '',
}) {
  const calc = calculateSolarSystem({
    monthlyBill,
    propertyType,
    systemType,
    packageId,
    targetKwp,
  });

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

// Clean start: No prepopulated demo SPHs


