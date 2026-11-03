import { NextResponse } from 'next/server';
import { updateTicketStatus } from '../../../../../lib/surti/crmService.js';
import { authorizePrivate, writeAuditLog, errorResponse } from '../../../../../lib/surti/surtiGuard.js';

const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

/**
 * PATCH /api/surti/tickets/{id}
 * Body: { status (required), assignedStaff, resolution }
 */
export async function PATCH(request, { params }) {
  const gate = authorizePrivate(request, 'tickets');
  if (!gate.ok) return gate.response;
  const { id } = await params;

  try {
    const body = await request.json();
    if (!TICKET_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: `status tidak valid. Pilihan: ${TICKET_STATUSES.join(', ')}.` },
        { status: 400 }
      );
    }
    const ticket = await updateTicketStatus(id, body.status, body.assignedStaff || null, body.resolution || '');

    await writeAuditLog({
      entityType: 'ticket',
      entityId: id,
      action: 'update_status',
      actor: gate.accessVia,
      details: { status: body.status, assignedStaff: body.assignedStaff || null },
    });

    return NextResponse.json({ success: true, accessVia: gate.accessVia, ticket });
  } catch (error) {
    console.error('[API /api/surti/tickets/:id] Error:', error.message);
    return errorResponse(error);
  }
}

