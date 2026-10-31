/**
 * ============================================================================
 * SUNBLIX SURTI AI — CRM, SURVEYS & SERVICE TICKETS (DB-FIRST)
 * ============================================================================
 * Implements Section 7 (Customer Identity & CRM), Section 14 (Survey Scheduling),
 * and Section 15 (Customer Service & Human Handoff).
 *
 * PERSISTENCE (2026-10-25 Supabase integration):
 *  - When SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured, every
 *    lead / survey / ticket is written to Supabase Postgres (tables defined
 *    in supabase/migrations/20261018_surti_ai_schema.sql + the new
 *    20261025_telegram_channel_and_runtime.sql) and reads come from the DB.
 *  - Without those env vars the legacy in-memory Map stores are used, so
 *    demo mode keeps working exactly as before.
 *  - Every DB write is fire-and-forget-safe: failures are logged and the
 *    in-memory copy is still returned so the chat flow never breaks.
 */

import { getDbClient, isDbLive, logPersistenceMode } from '../supabaseClient.js';

logPersistenceMode('surti/crmService');

// ---------------------------------------------------------------------------
// LEGACY IN-MEMORY STORES (demo-mode fallback)
// ---------------------------------------------------------------------------
const leadsStore = new Map();
const surveyStore = new Map();
const ticketStore = new Map();

// Maps DB uuid <-> runtime string ids so callers keep working with string ids
const idBridge = {
  lead: new Map(), // runtimeId -> db uuid
  survey: new Map(),
  ticket: new Map(),
};

async function db() {
  return getDbClient();
}

function nowIso() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// HELPERS: map flat runtime records <-> surti_customers columns
// ---------------------------------------------------------------------------
/**
 * Parse a bill value that may arrive as a number or as text such as
 * "Rp 1.500.000", "1,5 juta", or "1500000". Returns null when unknown —
 * never a made-up default, so the CRM only holds what the customer said.
 */
export function parseBillAmount(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  const text = String(value).toLowerCase().trim();
  const juta = text.match(/([\d]+(?:[.,]\d+)?)\s*(jt|juta)/);
  if (juta) return Math.round(parseFloat(juta[1].replace(',', '.')) * 1_000_000);
  const ribu = text.match(/([\d]+(?:[.,]\d+)?)\s*(rb|ribu|k)\b/);
  if (ribu) return Math.round(parseFloat(ribu[1].replace(',', '.')) * 1_000);
  const digits = text.replace(/[^0-9]/g, '');
  const n = digits ? parseInt(digits, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Leads that did not come from SURTI's own chat qualification (i.e. a
// customer filled a website form themselves) skip the CRM approval gate —
// their own submission already is the intent signal.
function isSelfServiceSource(source) {
  return Boolean(source) && source !== 'SURTI AI Chat';
}

// A lead is ready to be *offered* for CRM approval once SURTI's own
// qualification concluded in a survey being agreed or an SPH being proposed.
const CRM_READY_STAGES = ['SURVEY_SCHEDULED', 'SPH_PROPOSED', 'WON'];

function leadToCustomerRow(lead) {
  return {
    name: lead.name,
    phone: lead.phone || null,
    email: lead.email || null,
    company_name: lead.companyName || null,
    customer_type: ['residential', 'commercial', 'industrial', 'institutional', 'other'].includes(lead.customerType) ? lead.customerType : 'other',
    city: lead.city || null,
    address: null,
    monthly_bill: lead.monthlyBill ?? null,
    stage: lead.stage || 'NEW_LEAD',
    notes: [lead.source ? `Source: ${lead.source}` : null, lead.notes || null].filter(Boolean).join('\n') || null,
    crm_approved: Boolean(lead.crmApproved),
    crm_approved_by: lead.crmApprovedBy || null,
    crm_approved_at: lead.crmApprovedAt || null,
  };
}

function customerRowToLead(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    customerType: row.customer_type || 'residential',
    companyName: row.company_name || '',
    city: row.city || '',
    monthlyBill: row.monthly_bill === null || row.monthly_bill === undefined ? null : Number(row.monthly_bill),
    stage: row.stage || 'NEW_LEAD',
    notes: row.notes || '',
    source: (row.notes || '').match(/^Source:\s*([^\n]+)/)?.[1]?.trim() || '',
    crmApproved: Boolean(row.crm_approved),
    crmApprovedBy: row.crm_approved_by || null,
    crmApprovedAt: row.crm_approved_at || null,
    crmReady: CRM_READY_STAGES.includes(row.stage),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// 1. LEADS & CUSTOMER PROFILES
// ---------------------------------------------------------------------------
export function recordLead({
  customerId = `lead-${Date.now()}`,
  name,
  phone,
  email,
  customerType = 'residential', // 'residential' | 'commercial' | 'industrial'
  companyName = '',
  city,
  monthlyBill,
  propertyType = 'house',
  systemType = 'hybrid',
  source = 'SURTI AI Chat',
  notes = '',
}) {
  const leadId = customerId;
  const existing = leadsStore.get(leadId);

  const record = {
    id: leadId,
    name: name || existing?.name || 'Pelanggan Baru',
    phone: phone || existing?.phone || '',
    email: email || existing?.email || '',
    customerType,
    companyName,
    // Unknown values stay null (or keep what an earlier update recorded) —
    // no invented defaults like "Jabodetabek" or Rp 2.500.000.
    city: (city && String(city).trim()) || existing?.city || null,
    monthlyBill: parseBillAmount(monthlyBill) ?? existing?.monthlyBill ?? null,
    propertyType,
    systemType,
    source,
    stage: existing?.stage || 'NEW_LEAD', // 'NEW_LEAD' | 'QUALIFIED' | 'SPH_PROPOSED' | 'SURVEY_SCHEDULED' | 'WON' | 'LOST'
    notes: notes ? `${existing?.notes ? existing.notes + '\n' : ''}${notes}` : existing?.notes || '',
    // Self-service website submissions skip the CRM approval gate — the
    // customer's own form submission is already the intent signal. Leads
    // SURTI itself qualifies from chat stay unapproved until an Admin/CEO
    // explicitly promotes them (see approveLeadForCrm).
    crmApproved: existing?.crmApproved ?? isSelfServiceSource(source),
    crmApprovedBy: existing?.crmApprovedBy || null,
    crmApprovedAt: existing?.crmApprovedAt || null,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
  record.crmReady = CRM_READY_STAGES.includes(record.stage);

  leadsStore.set(leadId, record); // keep in-memory mirror for instant reads

  // --- DB write (async, non-blocking for the chat flow) ---
  if (isDbLive()) {
    (async () => {
      try {
        const client = await db();
        const row = leadToCustomerRow(record);
        const leadEmail = row.email || `${leadId}@leads.sunblix.local`;
        let existingUuid = idBridge.lead.get(leadId);

        // After a restart the in-memory bridge is empty: look the lead up in
        // the DB so a follow-up update merges into the same row.
        if (!existingUuid) {
          const found = await client.from('surti_customers').select('id').eq('email', leadEmail).limit(1);
          if (Array.isArray(found) && found[0]?.id) {
            existingUuid = found[0].id;
            idBridge.lead.set(leadId, existingUuid);
          }
        }

        if (existingUuid) {
          // Never overwrite stored data with "unknown": drop empty fields.
          const patch = Object.fromEntries(
            Object.entries(row).filter(([, v]) => v !== null && v !== undefined && v !== '')
          );
          const updated = await client.update('surti_customers', { id: existingUuid }, patch);
          if (updated && updated[0]) {
            leadsStore.set(leadId, { ...record, ...customerRowToLead(updated[0]) });
          }
          return;
        }

        // First time: insert; upsert on (email) to merge duplicate leads
        const inserted = await client.insert(
          'surti_customers',
          { ...row, email: leadEmail },
          { upsert: true, onConflict: 'email' }
        );
        const row0 = Array.isArray(inserted) ? inserted[0] : null;
        if (row0?.id) {
          idBridge.lead.set(leadId, row0.id);
          leadsStore.set(leadId, { ...record, id: leadId, dbId: row0.id });
        }
      } catch (err) {
        console.error('[crmService.recordLead] DB write failed:', err.message);
      }
    })();
  }

  return record;
}

export function getLeadById(leadId) {
  return leadsStore.get(leadId) || null;
}

/**
 * Move a lead's funnel stage forward (e.g. to SURVEY_SCHEDULED once the
 * customer agrees a visit, or SPH_PROPOSED once a draft is requested).
 * This is what makes the lead eligible to be offered for CRM approval —
 * see CRM_READY_STAGES / approveLeadForCrm.
 */
export async function updateLeadStage(leadId, stage) {
  const existing = leadsStore.get(leadId);
  if (!existing) return null;

  existing.stage = stage;
  existing.crmReady = CRM_READY_STAGES.includes(stage);
  existing.updatedAt = nowIso();
  leadsStore.set(leadId, existing);

  if (isDbLive()) {
    try {
      const client = await db();
      const uuid = idBridge.lead.get(leadId);
      if (uuid) {
        await client.update('surti_customers', { id: uuid }, { stage, updated_at: existing.updatedAt });
      }
    } catch (err) {
      console.error('[crmService.updateLeadStage] DB update failed:', err.message);
    }
  }

  return existing;
}

/**
 * Human-in-the-loop promotion of a SURTI-qualified lead into CRM & Leads.
 * Refuses leads that haven't reached a CRM_READY_STAGES stage yet, so a
 * raw/unqualified chat can never show up in the pipeline Direksi works from.
 */
export async function approveLeadForCrm(leadId, approverName) {
  const existing = leadsStore.get(leadId);
  if (!existing) throw new Error(`Lead ${leadId} tidak ditemukan.`);
  if (!approverName || !String(approverName).trim()) {
    throw new Error('Nama Admin/Direktur yang menyetujui wajib diisi.');
  }
  if (!CRM_READY_STAGES.includes(existing.stage)) {
    throw new Error(
      'Lead ini belum sepakat jadwal survei atau meminta SPH — belum bisa disetujui masuk CRM.'
    );
  }

  existing.crmApproved = true;
  existing.crmApprovedBy = String(approverName).trim();
  existing.crmApprovedAt = nowIso();
  existing.updatedAt = existing.crmApprovedAt;
  leadsStore.set(leadId, existing);

  if (isDbLive()) {
    try {
      const client = await db();
      const uuid = idBridge.lead.get(leadId);
      if (uuid) {
        await client.update('surti_customers', { id: uuid }, {
          crm_approved: true,
          crm_approved_by: existing.crmApprovedBy,
          crm_approved_at: existing.crmApprovedAt,
          updated_at: existing.updatedAt,
        });
      }
    } catch (err) {
      console.error('[crmService.approveLeadForCrm] DB update failed:', err.message);
    }
  }

  return existing;
}

export async function listLeads() {
  if (isDbLive()) {
    try {
      const client = await db();
      const rows = await client.from('surti_customers').select('*').order('updated_at', { ascending: false }).limit(500);
      if (Array.isArray(rows) && rows.length >= 0) {
        return rows.map(customerRowToLead);
      }
    } catch (err) {
      console.error('[crmService.listLeads] DB read failed, fallback to memory:', err.message);
    }
  }
  return Array.from(leadsStore.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// ---------------------------------------------------------------------------
// 2. SURVEY SCHEDULING (Section 14)
// ---------------------------------------------------------------------------
export function createSurveyRequest({
  customerId = 'demo-customer-01',
  customerName,
  phone,
  siteAddress,
  preferredDate,
  preferredTime = 'Pagi (09:00 - 12:00 WIB)',
  roofType = 'Genteng Keramik',
  notes = '',
}) {
  const surveyId = `SRV-${Date.now().toString().slice(-6)}`;
  const record = {
    id: surveyId,
    customerId,
    customerName,
    phone,
    siteAddress,
    preferredDate,
    preferredTime,
    roofType,
    status: 'requested', // 'requested' | 'under_review' | 'confirmed' | 'reschedule_requested' | 'completed' | 'cancelled'
    assignedEngineer: null,
    notes,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  surveyStore.set(surveyId, record);

  if (isDbLive()) {
    (async () => {
      try {
        const client = await db();
        const customerUuid = idBridge.lead.get(customerId);
        if (!customerUuid) {
          // Ensure the customer exists so the FK is satisfied
          const lead = leadsStore.get(customerId);
          const created = recordLead(lead ? { ...lead, customerId } : { customerId, name: customerName, phone, notes });
          await new Promise((r) => setTimeout(r, 150)); // allow async insert to settle
        }
        const inserted = await client.insert('surti_survey_requests', {
          customer_id: idBridge.lead.get(customerId) || null,
          site_address: siteAddress,
          preferred_date: preferredDate,
          preferred_time: preferredTime,
          roof_type: roofType,
          status: 'requested',
          assigned_engineer: null,
          notes: notes || null,
        });
        const row0 = Array.isArray(inserted) ? inserted[0] : null;
        if (row0?.id) idBridge.survey.set(surveyId, row0.id);
      } catch (err) {
        console.error('[crmService.createSurveyRequest] DB write failed:', err.message);
      }
    })();
  }

  return record;
}

export async function updateSurveyStatus(surveyId, status, assignedEngineer = null, adminNotes = '') {
  const record = surveyStore.get(surveyId);
  if (!record) throw new Error(`Survei ${surveyId} tidak ditemukan.`);

  record.status = status;
  if (assignedEngineer) record.assignedEngineer = assignedEngineer;
  if (adminNotes) record.notes = `${record.notes ? record.notes + '\n' : ''}[Admin]: ${adminNotes}`;
  record.updatedAt = nowIso();

  if (isDbLive()) {
    try {
      const client = await db();
      const uuid = idBridge.survey.get(surveyId);
      if (uuid) {
        await client.update('surti_survey_requests', { id: uuid }, {
          status,
          ...(assignedEngineer ? { assigned_engineer: assignedEngineer } : {}),
          ...(adminNotes ? { notes: record.notes } : {}),
          updated_at: record.updatedAt,
        });
      }
    } catch (err) {
      console.error('[crmService.updateSurveyStatus] DB update failed:', err.message);
    }
  }

  return record;
}

export async function listSurveys() {
  if (isDbLive()) {
    try {
      const client = await db();
      const rows = await client.from('surti_survey_requests').select('*').order('created_at', { ascending: false }).limit(500);
      if (Array.isArray(rows)) return rows;
    } catch (err) {
      console.error('[crmService.listSurveys] DB read failed, fallback to memory:', err.message);
    }
  }
  return Array.from(surveyStore.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ---------------------------------------------------------------------------
// 3. SERVICE TICKETS & HUMAN HANDOFF (Section 15)
// ---------------------------------------------------------------------------
export function createServiceTicket({
  customerId = 'demo-customer-01',
  customerName = 'Bapak / Ibu Pelanggan',
  phone = '',
  category = 'technical_consultation', // 'technical_consultation' | 'maintenance' | 'warranty_claim' | 'billing' | 'human_handoff'
  priority = 'medium', // 'low' | 'medium' | 'high' | 'urgent'
  subject,
  description,
}) {
  const ticketId = `TCK-${Date.now().toString().slice(-6)}`;
  const record = {
    id: ticketId,
    customerId,
    customerName,
    phone,
    category,
    priority,
    subject: subject || 'Konsultasi Teknis PLTS Lanjutan',
    description: description || 'Pelanggan meminta eskalasi komunikasi dengan konsultan teknis SUNBLIX.',
    status: 'open', // 'open' | 'in_progress' | 'resolved' | 'closed'
    assignedStaff: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  ticketStore.set(ticketId, record);

  if (isDbLive()) {
    (async () => {
      try {
        const client = await db();
        const inserted = await client.insert('surti_service_tickets', {
          customer_id: idBridge.lead.get(customerId) || null,
          ticket_number: ticketId,
          category,
          priority,
          subject: record.subject,
          description: record.description,
          status: 'open',
          assigned_staff: null,
        });
        const row0 = Array.isArray(inserted) ? inserted[0] : null;
        if (row0?.id) idBridge.ticket.set(ticketId, row0.id);
      } catch (err) {
        console.error('[crmService.createServiceTicket] DB write failed:', err.message);
      }
    })();
  }

  return record;
}

export async function updateTicketStatus(ticketId, status, assignedStaff = null, resolution = '') {
  const record = ticketStore.get(ticketId);
  if (!record) throw new Error(`Tiket ${ticketId} tidak ditemukan.`);

  record.status = status;
  if (assignedStaff) record.assignedStaff = assignedStaff;
  if (resolution) record.resolution = resolution;
  record.updatedAt = nowIso();

  if (isDbLive()) {
    try {
      const client = await db();
      const uuid = idBridge.ticket.get(ticketId);
      if (uuid) {
        await client.update('surti_service_tickets', { id: uuid }, {
          status,
          ...(assignedStaff ? { assigned_staff: assignedStaff } : {}),
          ...(resolution ? { resolution } : {}),
          updated_at: record.updatedAt,
        });
      }
    } catch (err) {
      console.error('[crmService.updateTicketStatus] DB update failed:', err.message);
    }
  }

  return record;
}

export async function listTickets() {
  if (isDbLive()) {
    try {
      const client = await db();
      const rows = await client.from('surti_service_tickets').select('*').order('created_at', { ascending: false }).limit(500);
      if (Array.isArray(rows)) return rows;
    } catch (err) {
      console.error('[crmService.listTickets] DB read failed, fallback to memory:', err.message);
    }
  }
  return Array.from(ticketStore.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ---------------------------------------------------------------------------
// Clear all CRM data (for testing & clean database state)
// ---------------------------------------------------------------------------
export async function clearAllCrmData() {
  leadsStore.clear();
  surveyStore.clear();
  ticketStore.clear();
  idBridge.lead.clear();
  idBridge.survey.clear();
  idBridge.ticket.clear();
  // NOTE: does NOT delete DB rows — production data is never wiped from chat.
  return true;
}

// Clean start: No prepopulated demo leads, surveys, or tickets
