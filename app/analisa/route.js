import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const landingPath = path.join(process.cwd(), 'public', 'analisa', 'index.html');
  if (fs.existsSync(landingPath)) {
    const html = fs.readFileSync(landingPath, 'utf8');
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return NextResponse.redirect('https://sunblix.id');
}

