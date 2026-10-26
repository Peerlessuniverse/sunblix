import { NextResponse } from 'next/server';
import { getDbClient, isDbLive } from '../../../lib/supabaseClient.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      companyName,
      picName,
      picPosition,
      email,
      whatsapp,
      category,
      coverageArea,
      website,
      npwp,
      companyProfileUrl,
      pastExperience,
      proposalDescription,
    } = body;

    // Validation
    if (!companyName || !picName || !email || !whatsapp || !category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama perusahaan, nama PIC, email, nomor WhatsApp, dan kategori kemitraan wajib diisi.',
        },
        { status: 400 }
      );
    }

    // Generate unique vendor partner ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const partnerId = `SBX-VND${new Date().getFullYear()}-${randomSuffix}`;

    // Persist to Supabase (partnership inquiries table)
    if (isDbLive()) {
      try {
        const client = getDbClient();
        await client.insert('surti_partnership_inquiries', {
          partner_number: partnerId,
          company_name: companyName,
          pic_name: picName,
          pic_position: picPosition || null,
          email,
          whatsapp,
          category,
          coverage_area: coverageArea || null,
          website: website || null,
          npwp: npwp || null,
          company_profile_url: companyProfileUrl || null,
          past_experience: pastExperience || null,
          proposal_description: proposalDescription || null,
          status: 'submitted',
        });
      } catch (dbErr) {
        console.error('[PARTNERSHIP] DB write failed:', dbErr.message);
        // Jangan gagalkan respons — pendaftaran tetap dianggap diterima (tercatat di log)
      }
    }

    console.log(`[SUNBLIX VENDOR PARTNERSHIP INQUIRY] ID: ${partnerId}`, {
      partnerId,
      companyName,
      picName,
      picPosition,
      email,
      whatsapp,
      category,
      coverageArea,
      website,
      npwp,
      companyProfileUrl,
      pastExperience,
      proposalDescription,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      partnerId,
      message: 'Registrasi kemitraan vendor berhasil dikirim. Tim Procurement SUNBLIX akan segera menghubungi Anda.',
      data: {
        partnerId,
        companyName,
        picName,
        receivedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('[API /api/partnership] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
