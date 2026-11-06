import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, context) {
  const { slug } = await context.params;
  const cleanSlug = String(slug || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');

  if (!cleanSlug) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Cari file proposal customer di public/analisa/[slug]/index.html
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

  // Jika token belum terdaftar atau tidak ditemukan
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
