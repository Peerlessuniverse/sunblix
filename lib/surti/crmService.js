/**
 * ============================================================================
 * SUNBLIX SURTI AI — CRM, SURVEYS & SERVICE TICKETS
 * ============================================================================
 * Implements Section 7 (Customer Identity & CRM), Section 14 (Survey Scheduling),
 * and Section 15 (Customer Service & Human Handoff).
 */

const leadsStore = new Map();
const surveyStore = new Map();
const ticketStore = new Map();

/**
 * ----------------------------------------------------------------------------
 * 1. LEADS & CUSTOMER PROFILES
 * ----------------------------------------------------------------------------
 */
export function recordLead({
  customerId = `lead-${Date.now()}`,
  name,
  phone,
  email,
  customerType = 'residential', // 'residential' | 'commercial' | 'industrial'
  companyName = '',
  city = 'Jabodetabek',
  monthlyBill = 2500000,
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
    city,
    monthlyBill: Number(monthlyBill) || 2500000,
    propertyType,
    systemType,
    source,
    stage: existing?.stage || 'NEW_LEAD', // 'NEW_LEAD' | 'QUALIFIED' | 'SPH_PROPOSED' | 'SURVEY_SCHEDULED' | 'WON' | 'LOST'
    notes: notes ? `${existing?.notes ? existing.notes + '\n' : ''}${notes}` : existing?.notes || '',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  leadsStore.set(leadId, record);
  return record;
}

export function listLeads() {
  return Array.from(leadsStore.values()).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}

/**
 * ----------------------------------------------------------------------------
 * 2. SURVEY SCHEDULING (Section 14)
 * ----------------------------------------------------------------------------
 */
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  surveyStore.set(surveyId, record);
  return record;
}

export function updateSurveyStatus(surveyId, status, assignedEngineer = null, adminNotes = '') {
  const record = surveyStore.get(surveyId);
  if (!record) throw new Error(`Survei ${surveyId} tidak ditemukan.`);
  record.status = status;
  if (assignedEngineer) record.assignedEngineer = assignedEngineer;
  if (adminNotes) record.notes = `${record.notes ? record.notes + '\n' : ''}[Admin]: ${adminNotes}`;
  record.updatedAt = new Date().toISOString();
  return record;
}

export function listSurveys() {
  return Array.from(surveyStore.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * ----------------------------------------------------------------------------
 * 3. SERVICE TICKETS & HUMAN HANDOFF (Section 15)
 * ----------------------------------------------------------------------------
 */
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ticketStore.set(ticketId, record);
  return record;
}

export function updateTicketStatus(ticketId, status, assignedStaff = null, resolution = '') {
  const record = ticketStore.get(ticketId);
  if (!record) throw new Error(`Tiket ${ticketId} tidak ditemukan.`);
  record.status = status;
  if (assignedStaff) record.assignedStaff = assignedStaff;
  if (resolution) record.resolution = resolution;
  record.updatedAt = new Date().toISOString();
  return record;
}

export function listTickets() {
  return Array.from(ticketStore.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Clear all CRM data (for testing & clean database state)
 */
export function clearAllCrmData() {
  leadsStore.clear();
  surveyStore.clear();
  ticketStore.clear();
  return true;
}

// Clean start: No prepopulated demo leads, surveys, or tickets

