import { NextResponse } from 'next/server';
import { createDraftSph } from '../../../../lib/surti/sphService.js';
import { getLeadByPublicToken, verifyLeadToken } from '../../../../lib/surti/publicLeadToken.js';

function validNumber(value, min) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min ? n : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const monthlyBill = validNumber(body.monthlyBill, 250000);
    const roofArea = validNumber(body.roofArea, 1);
    const plnPower = validNumber(body.plnPower, 450);
    if (!monthlyBill || !roofArea || !plnPower) return NextResponse.json({ success: false, message: 'Data kalkulator belum lengkap.' }, { status: 400 });

    const leadPayload = verifyLeadToken(body.leadToken);
    if (!leadPayload?.leadId) return NextResponse.json({ success: false, message: 'Link kalkulator tidak valid atau sudah kedaluwarsa.' }, { status: 401 });
    const lead = await getLeadByPublicToken(body.leadToken);
    const sph = createDraftSph({
      customerId: leadPayload?.leadId || 'public-calculator',
      customerName: lead?.name || 'Pelanggan Kalkulator',
      customerPhone: lead?.phone || '',
      customerEmail: lead?.email || '',
      monthlyBill,
      projectAddress: lead?.city || 'Belum dikonfirmasi',
      propertyType: 'house',
      systemType: body.systemType === 'ongrid' ? 'ongrid' : 'hybrid',
      customRoofArea: roofArea,
      plnPower,
      isDemo: false,
      notes: `Simulasi awal. Daya PLN: ${plnPower} VA. Sambungan: ${body.phase || '1 Phase'}. Luas atap: ${roofArea} m². Harga dan kapasitas final setelah verifikasi lokasi.`,
    });
    return NextResponse.json({ success: true, sphId: sph.id });
  } catch (error) {
    console.error('[API /api/surti/calculate] Error:', error);
    return NextResponse.json({ success: false, message: 'Kalkulasi gagal diproses.' }, { status: 500 });
  }
}

export async function GET() { return NextResponse.json({ success: false, message: 'Gunakan POST.' }, { status: 405 }); }
