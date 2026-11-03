import { NextResponse } from 'next/server';
import { getDbClient, isDbLive } from '../../../../lib/supabaseClient.js';
import { verifyRequestAuth } from '../../../../lib/auth/staffAuth.js';
import { verifySurtiKey } from '../../../../lib/auth/surtiAuth.js';
import { listLeads, recordLead, updateLeadStage } from '../../../../lib/surti/crmService.js';

function authorize(request) {
  const staff = verifyRequestAuth(request);
  const surti = verifySurtiKey(request);
  if (!staff.valid && !surti.valid) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Akses ditolak. Perlu login staf atau x-surti-key.' },
        { status: 401 }
      ),
    };
  }
  return { ok: true, accessVia: staff.valid ? 'staff' : 'surti-key' };
}

/**
 * GET /api/engineering/sync?type=all|state|leads|quotes|invoices
 * Ambil data dari Supabase untuk dashboardv2
 */
export async function GET(request) {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  const client = getDbClient();
  const dbLive = isDbLive();

  let state = null;
  let quotes = [];
  let invoices = [];
  let leads = [];

  try {
    if (dbLive && client) {
      if (type === 'all' || type === 'state') {
        const stateRows = await client.from('surti_project_assessments').select('*').eq('id', 'engineering_state_active').limit(1);
        if (Array.isArray(stateRows) && stateRows[0]?.data) {
          state = stateRows[0].data;
        }
      }

      if (type === 'all' || type === 'quotes') {
        const qRows = await client.from('surti_quotations').select('*').order('created_at', { ascending: false }).limit(200);
        if (Array.isArray(qRows)) {
          quotes = qRows.map((r) => ({
            id: r.id,
            qno: r.quotation_number,
            status: r.status,
            created: r.created_at,
            updated: r.updated_at,
            ...(r.payload || {}),
          }));
        }
      }

      if (type === 'all' || type === 'invoices') {
        const invRows = await client.from('surti_audit_logs').select('*').eq('entity_type', 'engineering_invoice').order('created_at', { ascending: false }).limit(200);
        if (Array.isArray(invRows)) {
          invoices = invRows.map((r) => r.details || {}).filter(Boolean);
        }
      }
    }

    if (type === 'all' || type === 'leads') {
      const crmLeads = await listLeads();
      leads = crmLeads.map((l) => ({
        id: l.id,
        nama: l.name,
        kontak: [l.phone, l.email].filter(Boolean).join(' · '),
        alamat: l.city || '',
        nilai: l.monthlyBill ? l.monthlyBill * 12 : 0,
        status: l.stage === 'WON' ? 'Deal' : l.stage === 'LOST' ? 'Batal' : l.stage === 'SPH_PROPOSED' ? 'Penawaran terkirim' : 'Kualifikasi',
        crmApproved: l.crmApproved,
        rawLead: l,
      }));
    }

    return NextResponse.json({
      success: true,
      dbLive,
      state,
      leads,
      quotes,
      invoices,
    });
  } catch (error) {
    console.error('[API /api/engineering/sync GET] Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/engineering/sync
 * Simpan data dari dashboardv2 ke Supabase
 * Body: { action: 'save_state' | 'save_quote' | 'save_invoice' | 'save_lead', data: {...} }
 */
export async function POST(request) {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { action, data } = body;
    const client = getDbClient();
    const dbLive = isDbLive();

    if (action === 'save_state') {
      if (dbLive && client) {
        await client.insert('surti_project_assessments', {
          id: 'engineering_state_active',
          data: data,
          status: 'draft',
        }, { upsert: true, onConflict: 'id' });
      }
      return NextResponse.json({ success: true, action: 'save_state' });
    }

    if (action === 'save_quote') {
      const qno = data.qno || `Q-${Date.now()}`;
      const qid = data.id || `quo-${Date.now()}`;
      if (dbLive && client) {
        await client.insert('surti_quotations', {
          id: qid,
          quotation_number: qno,
          status: data.status || 'Draft',
          payload: data,
          issued_at: data.tanggal ? new Date(data.tanggal).toISOString() : new Date().toISOString(),
        }, { upsert: true, onConflict: 'id' });
      }
      return NextResponse.json({ success: true, qid, qno });
    }

    if (action === 'save_invoice') {
      const invId = data.id || `inv-${Date.now()}`;
      if (dbLive && client) {
        await client.insert('surti_audit_logs', {
          entity_type: 'engineering_invoice',
          entity_id: invId,
          action: 'invoice_created_or_updated',
          actor: auth.accessVia,
          details: data,
        });
      }
      return NextResponse.json({ success: true, invId });
    }

    if (action === 'save_lead') {
      const lead = recordLead({
        customerId: data.id || `lead-${Date.now()}`,
        name: data.nama || data.name,
        phone: data.kontak || data.phone,
        city: data.alamat || data.city,
        notes: `Input dari Dashboard v2 Engineering. ${data.proj || ''}`,
        source: 'Engineering Dashboard v2',
      });
      return NextResponse.json({ success: true, lead });
    }

    return NextResponse.json({ success: false, message: `Action ${action} tidak dikenal` }, { status: 400 });
  } catch (error) {
    console.error('[API /api/engineering/sync POST] Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

