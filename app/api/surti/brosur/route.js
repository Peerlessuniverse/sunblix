import { NextResponse } from 'next/server';
import {
  SUNBLIX_OFFICIAL_PACKAGES_2026,
  BATTERY_ADDONS,
  SUNBLIX_TERMS_2026,
} from '../../../brosur/sunblixCatalog.js';
import { SUNBLIX_OFFICIAL_PROFILE, VERIFIED_POLICIES } from '../../../../lib/surti/knowledgeBase.js';
import { verifyRequestAuth } from '../../../../lib/auth/staffAuth.js';
import { verifySurtiKey } from '../../../../lib/auth/surtiAuth.js';

/**
 * SURTI BROSUR API — katalog resmi SUNBLIX 2026 untuk asisten SURTI.
 *
 * GET /api/surti/brosur                      -> semua bagian
 * GET /api/surti/brosur?section=packages     -> packages | addons | terms | profile | policies | pdf
 * Filter paket (opsional, bisa digabung):
 *   category=STANDARD%2B|PRO|PRO%2B   minKwp=   maxKwp=   maxPrice=   phase=1|3   q=<teks>
 *   id=<id paket>                     -> satu paket
 *
 * Akses: kunci layanan SURTI (header x-surti-key) atau sesi staf.
 */

const PDF_PATH = '/SUNBLIX_KATALOG_2026.pdf';
const SECTIONS = ['packages', 'addons', 'terms', 'profile', 'policies', 'pdf'];

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function publicOrigin(request) {
  // Behind Traefik/Vercel, request.url can be an internal address. Prefer the
  // forwarded host so links handed to customers are real public URLs.
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) {
    const proto = (request.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim();
    return `${proto}://${host.split(',')[0].trim()}`;
  }
  return new URL(request.url).origin;
}

function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function shapePackage(pkg) {
  return {
    id: pkg.id,
    category: pkg.category,
    name: pkg.name,
    kwp: toNumber(pkg.kwp),
    batteryKwh: toNumber(pkg.batteryKwh),
    inverterKw: toNumber(pkg.inverterKw),
    phase: pkg.phase,
    pvArea: pkg.pvArea,
    panels: pkg.panels,
    panelsCount: pkg.panelsCount,
    price: pkg.price,
    priceText: formatRupiah(pkg.price),
    summary: pkg.sub,
  };
}

function filterPackages(searchParams) {
  const id = searchParams.get('id');
  const category = (searchParams.get('category') || '').trim().toUpperCase();
  const minKwp = toNumber(searchParams.get('minKwp'));
  const maxKwp = toNumber(searchParams.get('maxKwp'));
  const maxPrice = toNumber(searchParams.get('maxPrice'));
  const phase = (searchParams.get('phase') || '').trim();
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  let list = SUNBLIX_OFFICIAL_PACKAGES_2026.map(shapePackage);
  if (id) list = list.filter((p) => p.id === id);
  if (category) list = list.filter((p) => p.category.toUpperCase() === category);
  if (minKwp !== null) list = list.filter((p) => p.kwp !== null && p.kwp >= minKwp);
  if (maxKwp !== null) list = list.filter((p) => p.kwp !== null && p.kwp <= maxKwp);
  if (maxPrice !== null) list = list.filter((p) => p.price <= maxPrice);
  if (phase) list = list.filter((p) => (p.phase || '').startsWith(phase));
  if (q) {
    list = list.filter((p) =>
      [p.name, p.category, p.panels, p.summary, p.phase].join(' ').toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => a.price - b.price);
}

function shapeAddons() {
  return BATTERY_ADDONS.map((a) => ({
    id: a.id,
    label: a.label,
    type: a.type,
    energyKwh: a.energyKwh,
    spec: a.spec,
    brand: a.brand,
    price: a.price,
    priceText: formatRupiah(a.price),
    warranty: a.notes,
    description: a.desc,
  }));
}

export async function GET(request) {
  const staff = verifyRequestAuth(request);
  const surti = verifySurtiKey(request);
  if (!staff.valid && !surti.valid) {
    return NextResponse.json(
      {
        success: false,
        message: 'Akses ditolak. API brosur memerlukan kunci layanan SURTI (header x-surti-key) atau sesi staf.',
      },
      { status: 401 }
    );
  }
  const accessVia = staff.valid ? 'staff' : 'surti-key';

  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
  const section = (searchParams.get('section') || 'all').trim().toLowerCase();
  if (section !== 'all' && !SECTIONS.includes(section)) {
    return NextResponse.json(
      { success: false, message: `Bagian '${section}' tidak dikenal. Pilihan: all, ${SECTIONS.join(', ')}.` },
      { status: 400 }
    );
  }

  const pdf = {
    title: 'Katalog Resmi SUNBLIX 2026',
    url: origin + PDF_PATH,
    path: PDF_PATH,
  };

  const build = {
    packages: () => {
      const list = filterPackages(searchParams);
      return { count: list.length, items: list };
    },
    addons: () => shapeAddons(),
    terms: () => SUNBLIX_TERMS_2026,
    profile: () => SUNBLIX_OFFICIAL_PROFILE,
    policies: () => VERIFIED_POLICIES,
    pdf: () => pdf,
  };

  const data = {};
  for (const key of section === 'all' ? SECTIONS : [section]) {
    data[key] = build[key]();
  }

  return NextResponse.json(
    { success: true, accessVia, catalogVersion: '2026', currency: 'IDR', ...data },
    { headers: { 'Cache-Control': 'private, max-age=300' } }
  );
}
