import { NextResponse } from 'next/server';
import { getLeadRecord, updateLeadFields, updateLeadStage, isValidLeadStage } from '../../../../../lib/surti/crmService.js';
import { authorizePrivate, writeAuditLog, errorResponse } from '../../../../../lib/surti/surtiGuard.js';

/**
 * GET   /api/surti/leads/{id}  — read one lead (runtime id or database id)
 * PATCH /api/surti/leads/{id}  — update lead data and/or pipeline stage
 *
 * Private: staff session or SURTI key (x-surti-key).
 * PATCH body (all optional): name, phone, email, city, monthlyBill,
 * customerType, companyName, notes (appended), stage.
 */

export async function GET(request, { params }) {
  const gate = authorizePrivate(request, 'leads');
  if (!gate.ok) return gate.response;
  const { id } = await params;

  const lead = await getLeadRecord(id);
  if (!lead) return NextResponse.json({ success: false, message: `Lead ${id} tidak ditemukan.` }, { status: 404 });
  return NextResponse.json({ success: true, accessVia: gate.accessVia, lead });
}

export async function PATCH(request, { params }) {
  const gate = authorizePrivate(request, 'leads');
  if (!gate.ok) return gate.response;
  const { id } = await params;

  try {
    const body = await request.json();

    if (body.stage !== undefined && !isValidLeadStage(body.stage)) {
      return NextResponse.json(
        { success: false, message: `stage tidak valid: ${body.stage}. Pilihan: NEW_LEAD, QUALIFIED, SPH_PROPOSED, SURVEY_SCHEDULED, WON, LOST.` },
        { status: 400 }
      );
    }

    let lead = await updateLeadFields(id, body);
    if (!lead) return NextResponse.json({ success: false, message: `Lead ${id} tidak ditemukan.` }, { status: 404 });

    if (body.stage !== undefined) {
      lead = { ...(await updateLeadStage(id, body.stage)), dbId: lead.dbId };
    }

    await writeAuditLog({
      entityType: 'lead',
      entityId: lead.dbId || lead.id,
      action: 'update',
      actor: gate.accessVia,
      details: { fields: Object.keys(body).filter((k) => k !== 'notes'), stage: body.stage || null },
    });

    return NextResponse.json({ success: true, accessVia: gate.accessVia, lead });
  } catch (error) {
    console.error('[API /api/surti/leads/:id] Error:', error.message);
    return errorResponse(error);
  }
}

