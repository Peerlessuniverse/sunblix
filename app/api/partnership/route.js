import { NextResponse } from 'next/server';
import { getDbClient, isDbLive } from '../../../lib/supabaseClient.js';
import { verifyRequestAuth } from '../../../lib/auth/staffAuth.js';
import { notifyPartnershipCreated } from '../../../lib/telegram/leadNotifier.js';

export async function GET(request) {
  try {
    const auth = verifyRequestAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Sesi staf tidak valid.' },
        { status: 401 }
      );
    }

    if (!isDbLive()) {
      return NextResponse.json({
        success: true,
        inquiries: [],
        message: 'Database persistence mode: Demo / In-memory',
      });
    }

    const client = getDbClient();
    const inquiries = await client
      .from('surti_partnership_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      inquiries: Array.isArray(inquiries) ? inquiries : [],
    });
  } catch (error) {
    console.error('[API /api/partnership GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data rekanan / kemitraan.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const auth = verifyRequestAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Sesi staf tidak valid.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    const allowedStatuses = ['submitted', 'under_review', 'contacted', 'approved', 'rejected'];
    if (!id || !status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'ID dan status kemitraan valid wajib disertakan.' },
        { status: 400 }
      );
    }

    if (!isDbLive()) {
      return NextResponse.json({
        success: true,
        message: 'Status rekanan berhasil diperbarui (demo mode).',
      });
    }

    const client = getDbClient();
    const updated = await client.update(
      'surti_partnership_inquiries',
      { id },
      { status, updated_at: new Date().toISOString() }
    );

    return NextResponse.json({
      success: true,
      message: 'Status rekanan berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    console.error('[API /api/partnership PATCH] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status rekanan.' },
      { status: 500 }
    );
  }
}

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

    // Generate unique vendor partner ID.
    const year = new Date().getFullYear();
    const client = isDbLive() ? getDbClient() : null;
    let partnerId = null;

    if (client) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const candidate = `SBX-VND${year}-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          const clash = await client
            .from('surti_partnership_inquiries')
            .select('partner_number')
            .eq('partner_number', candidate)
            .maybeSingle();
          if (!clash) {
            partnerId = candidate;
            break;
          }
        } catch (clashErr) {
          console.error('[PARTNERSHIP] cek duplikat gagal:', clashErr.message);
          break;
        }
      }
    }

    if (!partnerId) {
      partnerId = `SBX-VND${year}-${Date.now().toString().slice(-6)}`;
    }

    // Persist to Supabase (partnership inquiries table)
    if (client) {
      let dbErr = null;
      try {
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
      } catch (err) {
        dbErr = err;
      }

      if (dbErr) {
        console.error('[PARTNERSHIP] DB write failed:', dbErr.message);
        return NextResponse.json(
          {
            success: false,
            message:
              'Pendaftaran belum dapat disimpan karena ada gangguan pada server. Silakan coba lagi beberapa saat lagi, atau hubungi tim procurement SUNBLIX.',
          },
          { status: 503 }
        );
      }
    }

    // Notifikasi ke Telegram (grup + admin)
    try {
      notifyPartnershipCreated({
        partner_number: partnerId,
        company_name: companyName,
        pic_name: picName,
        pic_position: picPosition,
        email,
        whatsapp,
        category,
        coverage_area: coverageArea,
        website,
        npwp,
        company_profile_url: companyProfileUrl,
      });
    } catch (err) {
      console.error('[PARTNERSHIP] notifikasi gagal:', err.message);
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
