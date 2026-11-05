import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { recordLeadDurable } from '../../../../lib/surti/crmService.js';
import { verifySurtiKey } from '../../../../lib/auth/surtiAuth.js';
import { verifyRequestAuth } from '../../../../lib/auth/staffAuth.js';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');

function authorize(request) {
  const staff = verifyRequestAuth(request);
  const surti = verifySurtiKey(request);
  if (!staff.valid && !surti.valid) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Akses ditolak. Endpoint ini memerlukan x-surti-key atau sesi staf.' },
        { status: 401 }
      ),
    };
  }
  return { ok: true, accessVia: staff.valid ? 'staff' : 'surti-key' };
}

// Deteksi binary browser Chrome / Chromium
function getChromePath() {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath) return envPath;

  const paths = [
    // Windows paths
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    // Linux VPS paths
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  const fs = require('fs');
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * POST /api/engineering/analyze-and-report
 * Menerima data pelanggan dari chat Admin -> SURTI:
 *  - customerName, phone, city, monthlyBill, plnVa, goal, etc.
 * Memproses perhitungan di engine dashboardv2, mencatat ke CRM,
 * men-generate PDF Project Analysis resmi, dan mengembalikan ringkasan + file PDF.
 */
export async function POST(request) {
  const auth = authorize(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const {
      customerName = 'Bapak / Ibu Pelanggan',
      phone = '',
      city = 'Jakarta',
      monthlyBill = 2500000,
      plnVa = 5500,
      phase = '1 Fasa',
      goal = 'Hemat + backup', // Hemat tagihan (baterai opsional) | Backup saat padam | Hemat + backup
      roofType = 'Metal / spandek',
      roofArea = 50,
      notes = '',
      format = 'json', // 'json' (ringkasan + base64) atau 'pdf' (download binary)
    } = body;

    // 1. Simpan / perbarui data lead di CRM Supabase
    let leadRecord = null;
    try {
      leadRecord = await recordLeadDurable({
        name: customerName,
        phone,
        city,
        monthlyBill,
        propertyType: 'house',
        systemType: goal.includes('backup') ? 'hybrid' : 'ongrid',
        source: 'Admin Telegram -> SURTI',
        notes: `Simulasi Project Analysis Dashboard v2. PLN: ${plnVa} VA, Goal: ${goal}. ${notes}`.trim(),
      });
    } catch (err) {
      console.warn('[analyze-and-report] CRM save warning:', err.message);
    }

    // 2. Jalankan Headless Browser untuk menghitung & render dokumen Project Analysis
    const chromePath = getChromePath();
    if (!chromePath) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chromium/Chrome binary tidak ditemukan di server host. Pastikan Chrome terinstall.',
        },
        { status: 500 }
      );
    }

    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });

      // Akses dashboardv2 internal
      const origin = new URL(request.url).origin;
      const targetUrl = `${origin}/engineering/index.html`;

      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1000));

      // Inject data pelanggan ke state engine kalkulator dashboardv2
      const calcResult = await page.evaluate(async (params) => {
        // Ambil preset dasar Garden City agar seluruh komponen & pricing default terisi
        S = migrate(deep(PRESETS.gc24.d));
        presetKey = 'custom';
        tab = 'ana';

        // Terapkan data pelanggan
        S.cust.nama = params.customerName;
        S.cust.pic = ''; // kosongkan PIC bawaan preset demo agar tidak terbawa ke dokumen klien
        S.cust.kontak = params.phone;
        S.cust.alamat = params.city;
        S.cust.proj = `PLTS Residensial ${params.goal}`;
        S.cust.tanggal = new Date().toISOString().slice(0, 10);
        S.cust.qno = `010-ANA/SUNBLIX/${new Date().getFullYear()}`;

        // Reset target manual agar engine menghitung otomatis dari tagihan
        S.k.nPanel = null;
        S.k.pvTgt = null;
        S.k.inv = "Auto";
        S.k.invQty = null;

        S.pln.bill = Number(params.monthlyBill) || 2500000;
        S.pln.va = Number(params.plnVa) || 5500;
        S.pln.fase = params.phase.includes('3') ? '3 Fasa' : '1 Fasa';
        
        // Atur sistem baterai
        if (params.goal.includes('tanpa') || params.goal.toLowerCase().includes('ongrid')) {
          S.need.goal = NOBAT;
          S.k.nBat = null;
          S.k.batTgt = null;
        } else {
          S.need.goal = 'Hemat + backup';
          S.need.bkH = 12;
          S.k.nBat = null; // Auto sizing
        }

        S.roof.atap = params.roofType || 'Metal / spandek';
        S.roof.luas = Number(params.roofArea) || 50;

        // Hitung ulang seluruh engine
        R = compute();
        render();

        // Render PDF menggunakan fungsi bawaan buildPdfBlob('ana')
        const blob = await buildPdfBlob('ana');
        const b64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]);
          reader.readAsDataURL(blob);
        });

        return {
          kwp: R.kwp,
          panelModel: R.panel,
          panelQty: R.nPan,
          pvTotalWp: R.pvTot,
          invModel: R.inv,
          invKw: R.invKw,
          batteryModel: S.k.bat,
          batteryKwh: R.noBat ? 0 : R.batTot,
          dailyProdKwh: R.prodD,
          monthlySaveRp: R.save,
          annualSaveRp: R.save * 12,
          investmentRp: R.total,
          paybackYears: R.payback,
          coveragePct: Math.round((R.cover || 0) * 100),
          pdfBase64: b64,
          pdfSize: blob.size,
        };
      }, { customerName, phone, city, monthlyBill, plnVa, phase, goal, roofType, roofArea });

      await browser.close();

      const filename = `SUNBLIX_Project_Analysis_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

      // Jika meminta file PDF binary langsung (untuk stream download/send Document di Telegram)
      if (format === 'pdf') {
        const pdfBuffer = Buffer.from(calcResult.pdfBase64, 'base64');
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': String(pdfBuffer.length),
          },
        });
      }

      // Default: Return JSON lengkap dengan ringkasan untuk teks Telegram + Base64 PDF
      return NextResponse.json({
        success: true,
        accessVia: auth.accessVia,
        leadId: leadRecord?.dbId || leadRecord?.id,
        summary: {
          customerName,
          city,
          systemType: goal,
          systemCapacity: `${calcResult.kwp.toFixed(2)} kWp (${calcResult.panelQty} Panel)`,
          inverter: `${calcResult.invKw} kW`,
          battery: calcResult.batteryKwh > 0 ? `${calcResult.batteryKwh} kWh` : 'Tanpa Baterai',
          dailyProduction: `${calcResult.dailyProdKwh.toFixed(1)} kWh / hari`,
          coverage: `${calcResult.coveragePct}% kebutuhan listrik tertutup PLTS`,
          monthlySaving: `Rp ${Math.round(calcResult.monthlySaveRp).toLocaleString('id-ID')}`,
          annualSaving: `Rp ${Math.round(calcResult.annualSaveRp).toLocaleString('id-ID')}`,
          estimatedInvestment: `Rp ${Math.round(calcResult.investmentRp).toLocaleString('id-ID')}`,
          payback: calcResult.paybackYears ? `${calcResult.paybackYears.toFixed(1)} Tahun` : '-',
        },
        pdf: {
          filename,
          sizeBytes: calcResult.pdfSize,
          base64: calcResult.pdfBase64,
        },
      });
    } catch (browserError) {
      await browser.close();
      throw browserError;
    }
  } catch (error) {
    console.error('[API /api/engineering/analyze-and-report] Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses analisa & PDF.' },
      { status: 500 }
    );
  }
}
