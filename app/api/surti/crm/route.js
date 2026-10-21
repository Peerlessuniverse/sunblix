import { NextResponse } from 'next/server';
import {
  recordLead,
  listLeads,
  createSurveyRequest,
  updateSurveyStatus,
  listSurveys,
  createServiceTicket,
  updateTicketStatus,
  listTickets,
  clearAllCrmData,
} from '../../../../lib/surti/crmService.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  if (type === 'leads') {
    return NextResponse.json({ success: true, leads: listLeads() });
  }
  if (type === 'surveys') {
    return NextResponse.json({ success: true, surveys: listSurveys() });
  }
  if (type === 'tickets') {
    return NextResponse.json({ success: true, tickets: listTickets() });
  }

  return NextResponse.json({
    success: true,
    leads: listLeads(),
    surveys: listSurveys(),
    tickets: listTickets(),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...payload } = body;

    let result;
    if (action === 'create_lead') {
      result = recordLead(payload);
    } else if (action === 'create_survey') {
      result = createSurveyRequest(payload);
    } else if (action === 'update_survey') {
      result = updateSurveyStatus(payload.surveyId, payload.status, payload.assignedEngineer, payload.adminNotes);
    } else if (action === 'create_ticket') {
      result = createServiceTicket(payload);
    } else if (action === 'update_ticket') {
      result = updateTicketStatus(payload.ticketId, payload.status, payload.assignedStaff, payload.resolution);
    } else if (action === 'clear_all') {
      clearAllCrmData();
      return NextResponse.json({ success: true, message: 'Semua data CRM SURTI berhasil dikosongkan.' });
    } else {
      return NextResponse.json({ success: false, message: `Aksi ${action} tidak dikenali.` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API /api/surti/crm] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE() {
  clearAllCrmData();
  return NextResponse.json({ success: true, message: 'Semua data CRM SURTI berhasil dihapus.' });
}

