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

    // Generate unique vendor partner ID.
    // Suffiks 4 digit acak bisa bentrok antar pendaftar - cek dulu ke database
    // supaya tidak ada dua perusahaan memakai nomor registrasi yang sama.
    const year = new Date().getFullYear();
    const client = isDbLive() ? getDbClient() : null;
    let partnerId = null;

    if (client) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const candidate = `SBX-VND${year}-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          // maybeSingle() pada client internal ini mengembalikan row langsung
          // (null kalau tidak ada), bukan objek {data, error}.
          const clash = await client
            .from('surti_partnership_inquiries')
            .select('partner_number')
            .eq('partner_number', candidate)
            .maybeSingle();
          if (!clash) {
            partnerId = candidate;
            break;
          }
          // nomor sudah dipakai - coba lagi dengan suffix lain
        } catch (clashErr) {
          console.error('[PARTNERSHIP] cek duplikat gagal:', clashErr.message);
          break;
        }
      }
    }

    if (!partnerId) {
      // Fallback kalau DB tidak hidup atau cek duplikat gagal.
      partnerId = `SBX-VND${year}-${Date.now().toString().slice(-6)}`;
    }

    // Persist to Supabase (partnership inquiries table)
    if (client) {
      let dbErr = null;
      try {
        // insert() pada client internal ini melempar exception saat gagal.
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
        // Pendaftaran BELUM tersimpan. Kalau tetap balas "berhasil", pengguna
        // memegang nomor registrasi yang tidak ada di database - persis sumber
        // kebingungan saat kurasi vendor. Lebih baik gagalkan dengan jelas.
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
