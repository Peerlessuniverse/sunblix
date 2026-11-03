import { NextResponse } from 'next/server';
import {
  recordLeadDurable,
  findLeadByPhone,
  updateLeadFields,
} from '../../../../lib/surti/crmService.js';
import {
  authorizePrivate,
  writeAuditLog,
  findAuditEntry,
  errorResponse,
} from '../../../../lib/surti/surtiGuard.js';

/**
 * POST /api/surti/intake
 * Private endpoint for SURTI: record a lead that arrived over WhatsApp and was
 * forwarded to SURTI manually by an admin. Requires a staff session or the
 * SURTI key (x-surti-key).
 *
 * De-duplication:
 *  - `waMessageId` is stored in the audit log; sending the same WhatsApp
 *    message twice returns the first result (duplicate: true) — durable
 *    across restarts.
 *  - The customer is matched by phone number, so a second message from the
 *    same person updates the same lead instead of creating (or resetting) one.
 *
 * Leads created here use source "SURTI WhatsApp", so they stay behind the CRM
 * approval gate until /api/surti/leads/{id}/approve is called.
 */

const MAX_TEXT = 4000;

function canonicalPhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  return /^628\d{7,12}$/.test(digits) ? digits : null;
}

function text(value, max = 200) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);
}

function cleanAttachments(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((u) => String(u || '').trim())
    .filter((u) => /^https?:\/\/\S+$/i.test(u))
    .slice(0, 10);
}

export async function POST(request) {
  const gate = authorizePrivate(request, 'intake');
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();

    const phone = canonicalPhone(body.phone);
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Nomor telepon tidak valid. Gunakan format Indonesia, mis. 0812xxxxxxx atau 62812xxxxxxx.' },
        { status: 400 }
      );
    }
    const name = text(body.name, 120);
    if (!name) {
      return NextResponse.json({ success: false, message: 'Nama pelanggan wajib diisi.' }, { status: 400 });
    }

    // Durable de-duplication on the WhatsApp message id.
    const waMessageId = text(body.waMessageId, 200);
    if (waMessageId) {
      const previous = await findAuditEntry('wa_intake', waMessageId);
      if (previous) {
        return NextResponse.json({
          success: true,
          accessVia: gate.accessVia,
          duplicate: true,
          message: 'Pesan WhatsApp ini sudah pernah dicatat.',
          data: previous,
        });
      }
    }

    const forwardedBy = text(body.forwardedBy, 80);
    const attachments = cleanAttachments(body.attachments);
    const rawMessage = text(body.rawMessage, MAX_TEXT);

    const noteLines = [
      `Via WhatsApp${forwardedBy ? ` (diteruskan admin: ${forwardedBy})` : ''}`,
      waMessageId ? `ID pesan WA: ${waMessageId}` : null,
      body.receivedAt ? `Diterima: ${text(body.receivedAt, 40)}` : null,
      rawMessage ? `Pesan asli: ${rawMessage}` : null,
      attachments.length ? `Lampiran: ${attachments.join(' , ')}` : null,
      text(body.notes, MAX_TEXT) || null,
    ].filter(Boolean);
    const notes = noteLines.join('\n');

    let lead;
    let existingCustomer = false;
    const existing = await findLeadByPhone(phone);

    if (existing) {
      // Same customer messaging again: merge, never reset stage/approval.
      existingCustomer = true;
      lead = await updateLeadFields(existing.dbId || existing.id, {
        name: !existing.name || existing.name === 'Pelanggan Baru' ? name : undefined,
        email: !existing.email ? text(body.email, 160) : undefined,
        city: !existing.city ? text(body.city, 120) : undefined,
        companyName: !existing.companyName ? text(body.companyName, 160) : undefined,
        monthlyBill: existing.monthlyBill ? undefined : body.monthlyBill,
        notes,
      });
    } else {
      lead = await recordLeadDurable({
        customerId: `wa-${phone}`,
        name,
        phone,
        email: text(body.email, 160),
        customerType: text(body.customerType, 30) || 'residential',
        companyName: text(body.companyName, 160),
        city: text(body.city, 120),
        monthlyBill: body.monthlyBill,
        propertyType: text(body.propertyType, 40) || 'house',
        systemType: text(body.systemType, 40) || 'hybrid',
        source: 'SURTI WhatsApp',
        notes,
      });
    }

    const leadId = lead?.dbId || lead?.id;
    const data = {
      leadId,
      stage: lead?.stage,
      crmApproved: Boolean(lead?.crmApproved),
      verified: Boolean(lead?.verified),
      existingCustomer,
      needsVerification: !lead?.verified,
    };

    await writeAuditLog({
      entityType: 'wa_intake',
      entityId: waMessageId || undefined,
      action: existingCustomer ? 'intake_merged' : 'intake_created',
      actor: gate.accessVia,
      details: { ...data, forwardedBy: forwardedBy || null, phone },
    });
    if (!waMessageId) {
      await writeAuditLog({
        entityType: 'lead',
        entityId: leadId,
        action: existingCustomer ? 'intake_merged' : 'intake_created',
        actor: gate.accessVia,
        details: { forwardedBy: forwardedBy || null },
      });
    }

    return NextResponse.json({ success: true, accessVia: gate.accessVia, duplicate: false, data });
  } catch (error) {
    console.error('[API /api/surti/intake] Error:', error.message);
    return errorResponse(error);
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: 'Gunakan POST.' }, { status: 405 });
}

