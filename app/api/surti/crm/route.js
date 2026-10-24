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
import { verifyRequestAuth } from '../../../../lib/auth/staffAuth.js';

export async function GET(request) {
  // Reading customer CRM data (leads, surveys, tickets) requires authenticated staff session
  const auth = verifyRequestAuth(request);
  if (!auth.valid) {
    return NextResponse.json(
      {
        success: false,
        message: 'Akses ditolak. Pembacaan data CRM memerlukan sesi staf yang sah (Cookie atau Bearer token).',
      },
      { status: 401 }
    );
  }

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

    // Destructive action check: clear_all requires staff authorization and non-production check
    if (action === 'clear_all') {
      const auth = verifyRequestAuth(request);
      if (!auth.valid) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Operasi penghapusan CRM memerlukan otorisasi staf yang sah.' },
          { status: 401 }
        );
      }

      if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_DATA_RESET) {
        return NextResponse.json(
          { success: false, message: 'Penghapusan data massal dilarang di lingkungan produksi.' },
          { status: 403 }
        );
      }

      console.warn(`[AUDIT] CRM database cleared by staff session at ${new Date().toISOString()}`);
      clearAllCrmData();
      return NextResponse.json({ success: true, message: 'Semua data CRM SURTI berhasil dikosongkan.' });
    }

    let result;
    if (action === 'create_lead') {
      result = recordLead(payload);
    } else if (action === 'create_survey') {
      result = createSurveyRequest(payload);
    } else if (action === 'update_survey') {
      // Administrative survey update requires staff auth
      const auth = verifyRequestAuth(request);
      if (!auth.valid) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Pembaruan status survei memerlukan autentikasi staf.' },
          { status: 401 }
        );
      }
      result = updateSurveyStatus(payload.surveyId, payload.status, payload.assignedEngineer, payload.adminNotes);
    } else if (action === 'create_ticket') {
      result = createServiceTicket(payload);
    } else if (action === 'update_ticket') {
      // Administrative ticket update requires staff auth
      const auth = verifyRequestAuth(request);
      if (!auth.valid) {
        return NextResponse.json(
          { success: false, message: 'Akses ditolak. Pembaruan tiket memerlukan autentikasi staf.' },
          { status: 401 }
        );
      }
      result = updateTicketStatus(payload.ticketId, payload.status, payload.assignedStaff, payload.resolution);
    } else {
      return NextResponse.json({ success: false, message: `Aksi ${action} tidak dikenali.` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API /api/surti/crm] Error:', error.message);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pemrosesan data CRM.' }, { status: 400 });
  }
}

export async function DELETE(request) {
  // Reject unauthenticated requests to prevent unauthorized wipe
  const auth = verifyRequestAuth(request);
  if (!auth.valid) {
    return NextResponse.json(
      {
        success: false,
        message: 'Akses ditolak. Penghapusan data CRM memerlukan sesi staf yang sah (Cookie atau Bearer token).',
      },
      { status: 401 }
    );
  }

  // Prevent mass deletion in production unless explicitly permitted by break-glass variable
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_DATA_RESET) {
    return NextResponse.json(
      {
        success: false,
        message: 'Operasi penghapusan massal data CRM dilarang di lingkungan produksi.',
      },
      { status: 403 }
    );
  }

  console.warn(`[AUDIT] CRM mass DELETE executed by authenticated staff (${auth.payload?.role || 'staff'}) at ${new Date().toISOString()}`);
  clearAllCrmData();
  return NextResponse.json({ success: true, message: 'Semua data CRM SURTI berhasil dihapus.' });
}
