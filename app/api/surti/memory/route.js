import { NextResponse } from 'next/server';
import {
  getCustomerMemorySummary,
  clearCustomerMemory,
  updateSemanticFact,
} from '../../../../lib/surti/memorySystem.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || 'demo-customer-01';

  const summary = getCustomerMemorySummary(customerId);
  return NextResponse.json({ success: true, memory: summary });
}

export async function POST(request) {
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
