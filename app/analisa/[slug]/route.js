import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDbClient, isDbLive } from '../../../lib/supabaseClient.js';
import { verifyRequestAuth } from '../../../lib/auth/staffAuth.js';
import { verifySurtiKey } from '../../../lib/auth/surtiAuth.js';

function authorize(request) {
  const staff = verifyRequestAuth(request);
  const surti = verifySurtiKey(request);
  if (!staff.valid && !surti.valid) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Akses ditolak. Perlu x-surti-key atau sesi staf.' },
        { status: 401 }
      ),
    };
  }
  return { ok: true, accessVia: staff.valid ? 'staff' : 'surti-key' };
}

export async function GET(request, context) {
  const { slug } = await context.params;
  const cleanSlug = String(slug || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');

  if (!cleanSlug) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 1. Jalur Cepat: Cari file proposal statis di public/analisa/[slug]/index.html
  // Menjamin semua proposal lama yang sudah terbit di git tetap aktif dan cepat
  const filePath = path.join(process.cwd(), 'public', 'analisa', cleanSlug, 'index.html');

  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  }

  // 2. Jalur Dinamis: Cari data proposal dari Supabase (surti_audit_logs entity_type = 'shared_analysis')
  // Mengaktifkan link share instan tanpa perlu rebuild / deploy container
  if (isDbLive()) {
    try {
      const client = getDbClient();
      if (client) {
        const row = await client
          .from('surti_audit_logs')
          .select('details')
          .eq('entity_type', 'shared_analysis')
          .eq('entity_id', cleanSlug)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (row && row.details && typeof row.details.html === 'string' && row.details.html.length > 0) {
          return new NextResponse(row.details.html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
              'X-Source': 'supabase-dynamic',
            },
          });
        }
      }
    } catch (err) {
      console.error('[ANALISA DYNAMIC] DB lookup error:', err.message);
    }
  }

  // 3. Jika token belum terdaftar atau tidak ditemukan
  const notFoundHtml = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Analisa PLTS Tidak Ditemukan — SUNBLIX</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
  <style>
    :root { --bg: #0B1222; --card: #131C30; --fg: #E2E8F0; --accent: #F5A80B; --line: rgba(148,163,184,.15); }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--fg); margin: 0; padding: 40px 20px; text-align: center; }
    .box { max-width: 580px; margin: 40px auto; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 36px 24px; }
    h1 { color: #fff; font-size: 22px; margin-top: 0; }
    p { color: #94A3B8; line-height: 1.6; font-size: 14px; }
    a.btn { display: inline-block; background: var(--accent); color: #0B1222; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Analisa PLTS Tidak Ditemukan</h1>
    <p>Tautan proposal analisa yang Anda buka tidak valid atau masa berlakunya telah berakhir.</p>
    <p>Silakan hubungi tim konsultan engineer SUNBLIX melalui WhatsApp untuk mendapatkan tautan simulasi sistem PLTS terbaru.</p>
    <a href="https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20ingin%20menanyakan%20tautan%20analisa%20PLTS%20saya" class="btn">Hubungi WhatsApp SUNBLIX</a>
  </div>
</body>
</html>`;

  return new NextResponse(notFoundHtml, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * POST /analisa/[slug]
 * Publikasi proposal analisa langsung ke Supabase tanpa deploy kontainer.
 * Body: { html: string, customerName?: string, title?: string, leadId?: string, metadata?: object }
 */
export async function POST(request, context) {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  const { slug } = await context.params;
  const cleanSlug = String(slug || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');

  if (!cleanSlug) {
    return NextResponse.json({ success: false, message: 'Slug tidak valid' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { html, customerName, title, leadId, metadata } = body;

    if (!html || typeof html !== 'string' || html.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Field "html" wajib diisi' },
        { status: 400 }
      );
    }

    if (!isDbLive()) {
      return NextResponse.json(
        { success: false, message: 'Database Supabase tidak terhubung' },
        { status: 503 }
      );
    }

    const client = getDbClient();
    await client.insert('surti_audit_logs', {
      entity_type: 'shared_analysis',
      entity_id: cleanSlug,
      action: 'publish',
      actor: auth.accessVia,
      details: {
        slug: cleanSlug,
        html,
        customerName: customerName || null,
        title: title || `Analisa PLTS — ${cleanSlug}`,
        leadId: leadId || null,
        metadata: metadata || {},
        published_at: new Date().toISOString(),
      },
    });

    const publicUrl = `https://analisa.sunblix.id/${cleanSlug}/`;
    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      url: publicUrl,
      message: 'Proposal analisa berhasil dipublikasikan secara instan ke Supabase.',
    });
  } catch (error) {
    console.error('[ANALISA POST] Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
