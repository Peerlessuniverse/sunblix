import { NextResponse } from 'next/server';
import { approveLeadForCrm, getLeadRecord } from '../../../../../../lib/surti/crmService.js';
import { authorizePrivate, writeAuditLog, errorResponse } from '../../../../../../lib/surti/surtiGuard.js';

/**
 * POST /api/surti/leads/{id}/approve
 * Promote a lead into CRM & Leads. SURTI may do this on an admin's
 * instruction; `requestedBy` (the admin who asked) is mandatory so the CRM
 * always records who is accountable. The stage gate still applies: the lead
 * must have reached SURVEY_SCHEDULED, SPH_PROPOSED or WON.
 * Body: { requestedBy (required for SURTI key), note }
 */
export async function POST(request, { params }) {
  const gate = authorizePrivate(request, 'leads');
  if (!gate.ok) return gate.response;
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const requestedBy = String(body.requestedBy || '').trim();
    if (gate.accessVia === 'surti-key' && !requestedBy) {
      return NextResponse.json(
        { success: false, message: 'requestedBy (nama admin yang meminta persetujuan) wajib diisi.' },
        { status: 400 }
      );
    }

    const approver =
      gate.accessVia === 'surti-key' ? `SURTI (atas perintah ${requestedBy})` : requestedBy || 'Staf';
    const lead = await approveLeadForCrm(id, approver);
    const full = (await getLeadRecord(id)) || lead;

    await writeAuditLog({
      entityType: 'lead',
      entityId: full.dbId || full.id,
      action: 'approve_crm',
      actor: gate.accessVia,
      details: { approver, note: body.note ? String(body.note).slice(0, 500) : null },
    });

    return NextResponse.json({
      success: true,
      accessVia: gate.accessVia,
      lead: full,
      warning: full.verified ? undefined : 'Lead ini belum diverifikasi (POST /api/surti/leads/{id}/verify).',
    });
  } catch (error) {
    console.error('[API /api/surti/leads/:id/approve] Error:', error.message);
    return errorResponse(error);
  }
}

