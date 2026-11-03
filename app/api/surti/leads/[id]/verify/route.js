import { NextResponse } from 'next/server';
import { verifyLead } from '../../../../../../lib/surti/crmService.js';
import { authorizePrivate, writeAuditLog, errorResponse } from '../../../../../../lib/surti/surtiGuard.js';

/**
 * POST /api/surti/leads/{id}/verify
 * SURTI confirms the lead's contact details / identity were checked.
 * Body: { verifiedBy (required), notes }
 */
export async function POST(request, { params }) {
  const gate = authorizePrivate(request, 'leads');
  if (!gate.ok) return gate.response;
  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const lead = await verifyLead(id, body.verifiedBy || (gate.accessVia === 'surti-key' ? 'SURTI' : ''), body.notes);
    if (!lead) return NextResponse.json({ success: false, message: `Lead ${id} tidak ditemukan.` }, { status: 404 });

    await writeAuditLog({
      entityType: 'lead',
      entityId: lead.dbId || lead.id,
      action: 'verify',
      actor: gate.accessVia,
      details: { verifiedBy: lead.verifiedBy },
    });

    return NextResponse.json({ success: true, accessVia: gate.accessVia, lead });
  } catch (error) {
    console.error('[API /api/surti/leads/:id/verify] Error:', error.message);
    return errorResponse(error);
  }
}

