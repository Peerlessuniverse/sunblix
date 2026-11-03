import { NextResponse } from 'next/server';
import {
  getCustomerMemorySummary,
  clearCustomerMemory,
  updateSemanticFact,
} from '../../../../lib/surti/memorySystem.js';
import { verifyRequestAuth } from '../../../../lib/auth/staffAuth.js';
import { verifySurtiKey } from '../../../../lib/auth/surtiAuth.js';

// Customer memory is private CRM data: staff session or SURTI key only.
function denyUnlessPrivate(request) {
  const staff = verifyRequestAuth(request);
  const surti = verifySurtiKey(request);
  if (staff.valid || surti.valid) return null;
  return NextResponse.json(
    { success: false, message: 'Akses ditolak. Memori pelanggan memerlukan sesi staf atau kunci layanan SURTI.' },
    { status: 401 }
  );
}

export async function GET(request) {
  const denied = denyUnlessPrivate(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || 'demo-customer-01';

  const summary = getCustomerMemorySummary(customerId);
  return NextResponse.json({ success: true, memory: summary });
}

export async function POST(request) {
  const denied = denyUnlessPrivate(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { action = 'update_fact', customerId = 'demo-customer-01', key, value } = body;

    if (action === 'clear') {
      const res = clearCustomerMemory(customerId);
      return NextResponse.json(res);
    }

    if (action === 'update_fact') {
      const updated = updateSemanticFact(customerId, key, value, true);
      return NextResponse.json({ success: true, semanticMemory: updated });
    }

    return NextResponse.json({ success: false, message: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
