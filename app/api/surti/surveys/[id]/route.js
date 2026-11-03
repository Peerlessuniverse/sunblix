import { NextResponse } from 'next/server';
import { updateSurveyStatus } from '../../../../../lib/surti/crmService.js';
import { authorizePrivate, writeAuditLog, errorResponse } from '../../../../../lib/surti/surtiGuard.js';

const SURVEY_STATUSES = ['requested', 'under_review', 'confirmed', 'reschedule_requested', 'completed', 'cancelled'];

/**
 * PATCH /api/surti/surveys/{id}
 * Body: { status (required), assignedEngineer, notes }
 */
export async function PATCH(request, { params }) {
  const gate = authorizePrivate(request, 'surveys');
  if (!gate.ok) return gate.response;
  const { id } = await params;

  try {
    const body = await request.json();
    if (!SURVEY_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: `status tidak valid. Pilihan: ${SURVEY_STATUSES.join(', ')}.` },
        { status: 400 }
      );
    }
    const survey = await updateSurveyStatus(id, body.status, body.assignedEngineer || null, body.notes || '');

    await writeAuditLog({
      entityType: 'survey',
      entityId: id,
      action: 'update_status',
      actor: gate.accessVia,
      details: { status: body.status, assignedEngineer: body.assignedEngineer || null },
    });

    return NextResponse.json({ success: true, accessVia: gate.accessVia, survey });
  } catch (error) {
    console.error('[API /api/surti/surveys/:id] Error:', error.message);
    return errorResponse(error);
  }
}

