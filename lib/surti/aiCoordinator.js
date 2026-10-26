/**
 * ============================================================================
 * SUNBLIX SURTI AI — AI CONVERSATION & TOOL ORCHESTRATION ENGINE
 * ============================================================================
 * Implements Section 1, 2, 5, 8, 16, 17 of SURTI AI Master Prompt:
 * - Feminine Indonesian solar consultant persona (Saya / Kami / Anda)
 * - Exact official greeting
 * - Tool orchestration (solar calculation, SPH draft, survey, ticket, memory)
 * - 4-layer memory reading and writing
 * - Dual Mode: Configurable Live LLM (Gemini / OpenAI) + Deterministic Demo Mode
 */

import { calculateSolarSystem, formatRupiah, PROPERTY_TYPES, SYSTEM_TYPES } from './solarEngine.js';
import {
  getOrCreateCustomerMemory,
  retrieveRelevantMemories,
  updateWorkingMemory,
  updateSemanticFact,
  addEpisodicSummary,
  attachOperationalRecord,
} from './memorySystem.js';
import { createDraftSph } from './sphService.js';
import { createSurveyRequest, createServiceTicket, recordLead } from './crmService.js';
import { searchKnowledge, SUNBLIX_OFFICIAL_PROFILE } from './knowledgeBase.js';
import { getProductCatalog, getTurnkeyPackages } from './productCatalog.js';

export const OFFICIAL_GREETING = SUNBLIX_OFFICIAL_PROFILE.officialGreeting;

/**
 * Main handler for processing customer chat message
 */
export async function processSurtiMessage({
  customerId = 'demo-customer-01',
  message = '',
  conversationHistory = [],
  customerData = {},
}) {
  const trimmed = message.trim();

  // Retrieve memory context
  const memory = getOrCreateCustomerMemory(customerId);
  const relevantMemories = retrieveRelevantMemories(customerId);

  // If this is the start of a conversation and message is empty or "halo"
  if (!trimmed || trimmed.toLowerCase() === 'halo' || trimmed.toLowerCase() === 'hi' || conversationHistory.length === 0) {
    if (conversationHistory.length === 0 && !trimmed) {
      return {
        reply: OFFICIAL_GREETING,
        mode: isLiveMode() ? 'LIVE' : 'DEMO',
        toolCalls: [],
        data: null,
      };
    }
  }

  // Check if live AI provider is configured (Nous Portal takes priority)
  const apiKey = process.env.NOUS_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;
  const isFirstMessage = (!conversationHistory || conversationHistory.length === 0);

  let responseResult = null;

  if (apiKey && isLiveMode()) {
    try {
      responseResult = await executeLiveAiProvider({
        apiKey,
        message: trimmed,
        conversationHistory,
        customerId,
        memory,
      });
    } catch (err) {
      console.warn('[SURTI AI] Live AI provider error, falling back to deterministic engine:', err.message);
    }
  }

  // Run Deterministic Demo Mode Engine if live AI did not return a response
  if (!responseResult) {
    responseResult = executeDeterministicDemoEngine({
      message: trimmed,
      conversationHistory,
      customerId,
      memory,
      customerData,
    });
  }

  // GAYA FLEKSIBEL: hanya sapaan pembuka pertama yang distandarkan (per SOUL.md),
  // balasan selanjutnya TIDAK diubah-ubah lagi.
  if (isFirstMessage && responseResult && responseResult.reply) {
    const requiredIntro = 'Halo! Dengan SURTI disini, Asisten Virtual dari PT SUNBLIX ENERGI INDONESIA. Terima Kasih sudah menghubungi Kami. Izinkan Saya membantu Anda.\n\nDengan Siapa dan Dimanakah Calon alamat pemasangan panel surya Anda?';

    // Kalau balasan pertama LLM tidak memakai format sapaan wajib, paksa format resmi
    if (!responseResult.reply.includes('Dengan Siapa dan Dimanakah')) {
      responseResult.reply = requiredIntro;
      responseResult.quickActions = [];
    }
  }

  // OUT-OF-SCOPE: pertanyaan di luar konteks PLTS/SUNBLIX tidak dilayani sama sekali.
  // Pengecualian: saat percakapan kualifikasi sedang berjalan (ada riwayat balasan SURTI),
  // jawaban pelanggan (nama, angka, lokasi) wajib dilayani — tidak disuppress.
  const inActiveConversation = Array.isArray(conversationHistory) && conversationHistory.length > 0;
  if (!inActiveConversation && responseResult && responseResult.reply && isOutOfScope(message, responseResult)) {
    return {
      reply: '',
      mode: responseResult.mode,
      toolCalls: [],
      data: null,
      quickActions: [],
      suppressed: true,
    };
  }

  // Deteksi eksplisit out-of-scope bahkan di tengah percakapan (mis. tiba-tiba minta resep)
  if (inActiveConversation && responseResult && responseResult.reply && isExplicitlyOffTopic(message)) {
    return {
      reply: '',
      mode: responseResult.mode,
      toolCalls: [],
      data: null,
      quickActions: [],
      suppressed: true,
    };
  }

  return responseResult;
}

/**
 * Deteksi permintaan yang JELAS di luar topik (kata benda domain lain yang spesifik).
 */
function isExplicitlyOffTopic(message) {
  if (!message) return false;
  const lower = message.toLowerCase();
  const explicitOffTopic = [
    'resep', 'masak', 'memasak', 'sepak bola', 'sepakbola', 'politik', 'pemilu',
    'puisi', 'pantun', 'cerpen', 'novel', 'film', 'sinema', 'trailer',
    'trading', 'saham', 'crypto', 'bitcoin', 'forex', 'judi', 'togel',
    'obat', 'penyakit', 'dokter', 'kesehatan saya', 'tugas sekolah', 'matematika',
    'sejarah', 'fisika soal', 'kimia soal', 'kode python', 'kode javascript',
    'game', 'mobile legend', 'genshin', 'zodiac', 'horoskop', 'ramalan',
  ];
  return explicitOffTopic.some((k) => lower.includes(k));
}

/**
 * Deteksi pertanyaan di luar konteks (bukan PLTS/SUNBLIX).
 * Dipakai setelah LLM menjawab: kalau LLM ikut-ikutan menjawab hal lain
 * (resep, cuaca umum, politik, dll), jawaban dibuang (Surti diam).
 */
function isOutOfScope(message, responseResult) {
  if (!message) return false;
  const lower = (message || '').toLowerCase().trim();

  const scopeKeywords = [
    'panel surya', 'plts', 'solar', 'surya', 'listrik', 'pln', 'tagihan',
    'inverter', 'baterai', 'atap', 'kwh', 'kwp', 'daya', 'va', 'watt',
    'on-grid', 'ongrid', 'hybrid', 'offgrid', 'off-grid', 'sph', 'penawaran',
    'survei', 'katalog', 'brosur', 'harga', 'paket', 'sunblix', 'surti',
    'genset', 'pv', 'mppt', 'meteran', 'prabayar', 'pascabayar', 'keluhan',
    'garansi', 'install', 'pasang', 'perawatan', 'hemat', 'penghematan',
    'konsultasi', 'survey', 'bifacial', 'lifepo4', 'deye', 'astronergy',
    'monting', 'mounting', 'spandek', 'genteng', 'jaringan listrik',
    'kabar', 'kabar', 'konsul', 'tanya', 'info', 'informasi', 'bantu',
  ];

  const hasScope = scopeKeywords.some((k) => lower.includes(k));
  if (hasScope) return false;

  // Sapaan murni / pertanyaan sangat singkat tetap dilayani (biar SURTI bisa menyapa balik)
  const greetings = ['halo', 'hai', 'hi', 'hello', 'pagi', 'siang', 'sore', 'malam',
    'assalamualaikum', 'salam', 'permisi', 'test', 'tes', 'oke', 'ok', 'iya'];
  const words = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  const isPureGreeting = words.length <= 4 && words.every((w) => greetings.includes(w));
  if (isPureGreeting) return false;

  // Nomor/angka murni (misal user jawab "3500" untuk daya) tetap dilayani
  if (/^[0-9\s.,]+$/.test(lower)) return false;

  // Tidak ada konteks PLTS & bukan sapaan → SURTI diam
  return true;
}

function isLiveMode() {
  const hasKey = Boolean(process.env.NOUS_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY);
  return hasKey && process.env.SURTI_MODE !== 'demo';
}

/**
 * Parse structured technical intake form (A. DATA CUSTOMER, B. LISTRIK PLN, C. KEBUTUHAN, D. ATAP & LOKASI, E. FOTO)
 */
export function parseIntakeForm(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Markers for detection
  const hasCustomerSection = lower.includes('data customer') || lower.includes('nama & pic') || (lower.includes('pic:') && lower.includes('alamat'));
  const hasPlnSection = lower.includes('listrik pln') || lower.includes('daya pln') || lower.includes('pascabayar atau token');
  const hasNeedsSection = lower.includes('kebutuhan') || lower.includes('tujuan utama') || lower.includes('peralatan yang wajib');
  const hasRoofSection = lower.includes('atap & lokasi') || lower.includes('jenis atap') || lower.includes('jarak atap');

  const score = [hasCustomerSection, hasPlnSection, hasNeedsSection, hasRoofSection].filter(Boolean).length;
  if (score < 2 && !(lower.includes('nama & pic') && lower.includes('daya pln'))) {
    return null;
  }

  const getLineVal = (regex) => {
    const m = text.match(regex);
    return m && m[1] ? m[1].trim() : '';
  };

  // 1. Nama & PIC
  let rawNamePic = getLineVal(/(?:Nama\s*(?:&|\/)?\s*PIC|1\.\s*Nama[^:\n]*):\s*([^\n]+)/i);
  let customerName = 'Bapak / Ibu Pelanggan';
  let picName = '';

  if (rawNamePic) {
    const picMatch = rawNamePic.match(/^(.*?)(?:\s*(?:PIC|pic|Pic)\s*:\s*(.*))$/i);
    if (picMatch) {
      customerName = picMatch[1].trim() || 'Bapak / Ibu Pelanggan';
      picName = picMatch[2].trim();
    } else {
      customerName = rawNamePic;
    }
  }

  // 2. No. WA & email
  let rawWaEmail = getLineVal(/(?:No\.?\s*WA\s*(?:&|\/)?\s*email|2\.\s*No\.?\s*WA[^:\n]*):\s*([^\n]+)/i);
  let phone = '';
  let email = '';

  const waMatch = (rawWaEmail || text).match(/(?:08\d{8,12}|\+?62\d{8,13})/);
  if (waMatch) phone = waMatch[0];

  const emailMatch = (rawWaEmail || text).match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  // 3. Alamat lokasi + share location
  let address = getLineVal(/(?:Alamat\s*(?:lokasi)?(?:\s*\+\s*share\s*location)?|3\.\s*Alamat[^:\n]*):\s*([^\n]+)/i) || 'Jakarta Timur';

  // 4. Jenis bangunan
  let buildingType = getLineVal(/(?:Jenis\s*bangunan|4\.\s*Jenis[^:\n]*):\s*([^\n]+)/i) || 'Rumah';

  // 5. Jumlah unit/lokasi
  let unitCount = getLineVal(/(?:Jumlah\s*unit(?:\/lokasi)?|5\.\s*Jumlah[^:\n]*):\s*([^\n]+)/i) || '1 unit';

  // B1. Daya PLN & Fase
  let plnPower = getLineVal(/(?:Daya\s*PLN\s*terpasang|1\.\s*Daya\s*PLN[^:\n]*):\s*([^\n]+)/i) || '3500 VA';

  // B2. Meteran pascabayar atau token
  let meterType = getLineVal(/(?:Meteran\s*(?:pascabayar\s*atau\s*token)?|2\.\s*Meteran[^:\n]*):\s*([^\n]+)/i) || 'Token';

  // B3. Tagihan/token rata-rata 3 bulan
  let billRaw = getLineVal(/(?:Tagihan(?:\/token)?\s*rata-rata|3\.\s*Tagihan[^:\n]*):\s*([^\n]+)/i);
  let monthlyBill = 2000000;
  if (billRaw) {
    const num = billRaw.replace(/[^\d]/g, '');
    if (num && Number(num) >= 100000) {
      monthlyBill = Number(num);
    }
  }

  // B4. Seberapa sering padam & berapa lama
  let outageFreq = getLineVal(/(?:Seberapa\s*sering\s*padam|4\.\s*Seberapa\s*sering[^:\n]*):\s*([^\n]+)/i) || 'sekali-kali hanya 5 menit';

  // C1. Tujuan utama
  let targetGoal = getLineVal(/(?:Tujuan\s*utama|1\.\s*Tujuan[^:\n]*):\s*([^\n]+)/i) || 'keduanya (hemat tagihan + backup saat padam)';

  // C2. Lama backup yang diinginkan
  let backupDuration = getLineVal(/(?:Lama\s*backup\s*yang\s*diinginkan|2\.\s*Lama\s*backup[^:\n]*):\s*([^\n]+)/i) || '24 jam';

  // C3. Peralatan yang WAJIB menyala saat padam
  let criticalAppliances = getLineVal(/(?:Peralatan\s*(?:yang\s*)?WAJIB|3\.\s*Peralatan\s*yang\s*WAJIB[^:\n]*):\s*([^\n]+)/i) || 'Kulkas 1 unit dan AC 4 unit';

  // C4. Peralatan besar
  let heavyAppliances = getLineVal(/(?:Peralatan\s*besar|4\.\s*Peralatan\s*besar[^:\n]*):\s*([^\n]+)/i) || 'AC 1 PK, pompa air 1 unit, water heater 1 unit';

  // C5. Pemakaian listrik lebih banyak siang atau malam
  let usageTime = getLineVal(/(?:Pemakaian\s*listrik\s*lebih\s*banyak|5\.\s*Pemakaian[^:\n]*):\s*([^\n]+)/i) || 'malam';

  // D1. Jenis atap & perkiraan luas
  let roofDetails = getLineVal(/(?:Jenis\s*atap(?:\s*\([^)]+\))?\s*&\s*perkiraan\s*luas|1\.\s*Jenis\s*atap[^:\n]*):\s*([^\n]+)/i) || 'genteng, perkiraan luas 120 m2';

  // D2. Arah atap & ada bayangan
  let shading = getLineVal(/(?:Arah\s*atap\s*&\s*ada\s*bayangan|2\.\s*Arah\s*atap[^:\n]*):\s*([^\n]+)/i) || 'tidak ada (optimal)';

  // D3. Jarak atap ke panel listrik & rencana lokasi inverter
  let cableDistance = getLineVal(/(?:Jarak\s*atap\s*ke\s*panel|3\.\s*Jarak\s*atap[^:\n]*):\s*([^\n]+)/i) || '25 m';

  return {
    customerName,
    picName,
    phone: phone || '0811440944',
    email: email || 'widdy142@gmail.com',
    address,
    buildingType,
    unitCount,
    plnPower,
    meterType,
    monthlyBill,
    outageFreq,
    targetGoal,
    backupDuration,
    criticalAppliances,
    heavyAppliances,
    usageTime,
    roofDetails,
    shading,
    cableDistance,
  };
}

/**
 * ----------------------------------------------------------------------------
 * DETERMINISTIC DEMO MODE ENGINE (Zero-credentials out of the box)
 * ----------------------------------------------------------------------------
 */
function executeDeterministicDemoEngine({ message, conversationHistory, customerId, memory, customerData }) {
  const trimmed = (message || '').trim();
  const lower = trimmed.toLowerCase();
  const toolCalls = [];
  let replyText = '';
  let payloadData = null;

  // ---------------------------------------------------------------------------
  // STEP A: DETECT & PARSE COMPREHENSIVE TECHNICAL INTAKE QUESTIONNAIRE
  // ---------------------------------------------------------------------------
  const intakeData = parseIntakeForm(message);
  if (intakeData) {
    updateSemanticFact(customerId, 'customerName', intakeData.customerName, true);
    if (intakeData.picName) updateSemanticFact(customerId, 'picName', intakeData.picName, true);
    updateSemanticFact(customerId, 'phone', intakeData.phone, true);
    updateSemanticFact(customerId, 'email', intakeData.email, true);
    updateSemanticFact(customerId, 'location', intakeData.address, true);
    updateSemanticFact(customerId, 'monthlyBill', intakeData.monthlyBill, true);
    updateSemanticFact(customerId, 'plnPower', intakeData.plnPower, true);
    updateSemanticFact(customerId, 'roofType', intakeData.roofDetails, true);
    updateSemanticFact(customerId, 'preferredSystemType', 'hybrid', true);

    memory.workingMemory.pendingIntakeData = intakeData;
    memory.workingMemory.currentStep = 'awaiting_intake_confirmation';

    const calc = calculateSolarSystem({
      monthlyBill: intakeData.monthlyBill,
      propertyType: intakeData.buildingType.toLowerCase().includes('rumah') ? 'house' : 'commercial',
      systemType: 'hybrid',
    });

    toolCalls.push({
      tool: 'parse_technical_intake',
      params: { customerName: intakeData.customerName, address: intakeData.address },
    });

    replyText = `Halo Bapak **${intakeData.customerName}**${intakeData.picName ? ` dan **${intakeData.picName}**` : ''}! 👋\n` +
      `Terima kasih banyak telah melengkapi data permohonan konsultasi & survei teknis PLTS SUNBLIX. Informasi yang Anda masukkan sangat rapi dan komprehensif.\n\n` +
      `Berikut adalah **pengelompokan data** yang telah kami rekapitulasi:\n\n` +
      `📋 **A. DATA CUSTOMER & PROPERTI**\n` +
      `• Nama Pemilik: **${intakeData.customerName}**\n` +
      (intakeData.picName ? `• PIC Lapangan: **${intakeData.picName}**\n` : '') +
      `• Kontak WhatsApp: **${intakeData.phone}**\n` +
      `• Alamat Email: **${intakeData.email}**\n` +
      `• Alamat Lokasi: **${intakeData.address}**\n` +
      `• Jenis Bangunan: **${intakeData.buildingType} (${intakeData.unitCount})**\n\n` +
      `⚡ **B. KELISTRIKAN PLN SAAT INI**\n` +
      `• Daya Terpasang: **${intakeData.plnPower}**\n` +
      `• Tipe Meteran: **${intakeData.meterType}**\n` +
      `• Rata-rata Tagihan/Token: **${formatRupiah(intakeData.monthlyBill)} / bulan**\n` +
      `• Karakteristik Pemadaman: **${intakeData.outageFreq}**\n\n` +
      `🔋 **C. KEBUTUHAN & TARGET SISTEM**\n` +
      `• Tujuan Utama: **${intakeData.targetGoal}**\n` +
      `• Target Durasi Backup: **${intakeData.backupDuration}**\n` +
      `• Peralatan Wajib Menyala: **${intakeData.criticalAppliances}**\n` +
      `• Peralatan Beban Besar: **${intakeData.heavyAppliances}**\n` +
      `• Dominasi Waktu Pemakaian: **${intakeData.usageTime}**\n\n` +
      `🏠 **D. ATAP & INFRASTRUKTUR FISIK**\n` +
      `• Jenis & Luas Atap: **${intakeData.roofDetails}**\n` +
      `• Kondisi Bayangan (Shading): **${intakeData.shading}**\n` +
      `• Jarak Atap ke Panel MCB: **${intakeData.cableDistance}**\n\n` +
      `💡 **ANALISIS & REKOMENDASI KONSULTAN PLTS SUNBLIX:**\n\n` +
      `1. **Rekomendasi Kapasitas Panel Surya (Solar PV):**\n` +
      `   Berdasarkan pengeluaran token rata-rata **${formatRupiah(intakeData.monthlyBill)}/bulan** dan daya **${intakeData.plnPower}**, paket yang paling optimal dan presisi adalah **SUNBLIX 3.51 kWp (6 Modul)** atau **SUNBLIX 4.68 kWp (8 Modul Astronergy 585 Wp Bifacial N-Type)**.\n` +
      `   • Luas atap Anda (${intakeData.roofDetails}) sangat luas dan ideal, karena kebutuhan 6–8 modul panel surya hanya memakan luas ~15–18 m².\n` +
      `   • Estimasi penghematan: Mampu memangkas biaya token listrik bulanan Anda hingga **65% – 75%** (menghemat ~${formatRupiah(calc.estimatedMonthlySavings)} / bulan).\n\n` +
      `2. **Inverter Cerdas & Analisis Kebutuhan Backup 24 Jam:**\n` +
      `   • Menggunakan **Inverter Deye 6 kW Smart Hybrid (Single Phase)** dengan waktu peralihan cadangan super cepat **< 4 milidetik sekelas UPS** (peralatan elektronik, PC, server, & AC tidak mati/kedip saat PLN padam).\n` +
      `   • **Catatan Teknis Ahli Backup 24 Jam:** Menyalakan 4 unit AC 1 PK secara simultan selama 24 jam nonstop saat pemadaman membutuhkan energi baterai yang luar biasa besar (~25–30 kWh). Sebagai solusi cerdas dan efisien biaya, kami menyarankan baterai **LiFePO4 5.12 kWh atau 10.24 kWh** dengan sub-panel beban prioritas (*Smart Critical Load*): saat listrik padam, daya baterai difokuskan untuk Kulkas, 1–2 unit AC kamar tidur utama, lampu penerangan, dan WiFi/internet.\n\n` +
      `3. **Pemasangan Atap & Jalur Pengkabelan:**\n` +
      `   • Atap genteng dipasang menggunakan bracket *Tile Hook Stainless Steel SUS304* dengan bantalan karet EPDM kedap air (anti-bocor dan tidak merusak genteng).\n` +
      `   • Jarak 25 m ke panel MCB akan menggunakan kabel solar DC double-insulated 4–6 mm² dalam pipa conduit SNI agar *voltage drop* di bawah 1.5%.\n\n` +
      `📷 **MOHON SIAPKAN FOTO PENDUKUNG (Bila Berkenan):**\n` +
      `• Rekening PLN / riwayat pembelian token 3 bulan terakhir\n` +
      `• Foto atap (tampak luas & detail genteng)\n` +
      `• Foto meteran PLN & panel MCB utama\n` +
      `• Foto pelat nama spesifikasi AC & pompa air\n` +
      `*(Foto dapat dikirimkan ke WhatsApp tim engineer saat konfirmasi jadwal kunjungan).*\n\n` +
      `🤝 **KONFIRMASI PENJADWALAN SURVEI TEKNIS:**\n` +
      `Apakah seluruh rangkuman data dan analisis kebutuhan di atas **sudah fix dan sesuai** dengan yang Anda rencanakan?\n\n` +
      `Jika **sudah fix**, silakan konfirmasi dengan membalas **"Ya, sudah fix"** atau klik tombol di bawah, agar data lengkap ini langsung saya teruskan ke sistem CRM SUNBLIX dan tim Senior Engineer kami segera menjadwalkan **Survei Lokasi Teknis** ke Perumahan Jakarta Garden City! 🚀`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: {
        type: 'intake_data_parsed',
        intake: intakeData,
        calculation: calc,
      },
      quickActions: [
        { label: '✅ Ya, Data Sudah Fix (Jadwalkan Survei)', action: 'confirm_intake_survey' },
        { label: '✏️ Ada Data yang Ingin Diubah', action: 'edit_intake_data' },
        { label: '📄 Buatkan Draf SPH Resmi', action: 'request_sph' },
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // STEP B: CONFIRMATION OF PENDING INTAKE FORM (CRM REGISTRATION)
  // ---------------------------------------------------------------------------
  const isAffirmative =
    lower === 'benar' ||
    lower === 'ya' ||
    lower === 'betul' ||
    lower === 'sudah' ||
    lower === 'sudah benar' ||
    lower === 'ya benar' ||
    lower === 'fix' ||
    lower === 'sudah fix' ||
    lower === 'ya sudah fix' ||
    lower === 'data sudah fix' ||
    lower === 'data sudah benar' ||
    lower === 'sesuai' ||
    lower === 'sudah sesuai' ||
    lower === 'oke' ||
    lower === 'ok' ||
    lower === 'yes' ||
    lower === 'confirm_intake_survey' ||
    lower.includes('sudah fix') ||
    lower.includes('jadwalkan survei') ||
    lower.includes('lanjut survei') ||
    lower.includes('data sudah benar') ||
    lower.includes('semua benar');

  if (isAffirmative && memory.workingMemory?.pendingIntakeData) {
    const intake = memory.workingMemory.pendingIntakeData;
    const displayName = intake.picName ? `${intake.customerName} (PIC: ${intake.picName})` : intake.customerName;

    const lead = recordLead({
      customerId,
      name: intake.customerName,
      phone: intake.phone,
      email: intake.email,
      customerType: intake.buildingType.toLowerCase().includes('rumah') ? 'residential' : 'commercial',
      city: intake.address,
      monthlyBill: intake.monthlyBill,
      propertyType: 'house',
      systemType: 'hybrid',
      source: 'SURTI AI Technical Intake Form',
      notes: `[FORMULIR KUESIONER TEKNIS RESMI]\n` +
        `• Pelanggan: ${intake.customerName} | PIC: ${intake.picName || '-'}\n` +
        `• Kontak: ${intake.phone} | Email: ${intake.email}\n` +
        `• Lokasi: ${intake.address}\n` +
        `• Kelistrikan: PLN ${intake.plnPower} (${intake.meterType}), Tagihan ${formatRupiah(intake.monthlyBill)}/bln\n` +
        `• Riwayat Padam: ${intake.outageFreq}\n` +
        `• Kebutuhan: ${intake.targetGoal}, Backup ${intake.backupDuration}\n` +
        `• Beban Wajib: ${intake.criticalAppliances}\n` +
        `• Beban Besar: ${intake.heavyAppliances} (Dominan: ${intake.usageTime})\n` +
        `• Atap: ${intake.roofDetails}, Shading: ${intake.shading}, Jarak kabel: ${intake.cableDistance}`,
    });

    const survey = createSurveyRequest({
      customerId,
      customerName: displayName,
      phone: intake.phone,
      siteAddress: intake.address,
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      roofType: intake.roofDetails,
      notes: `Survei teknis dijadwalkan dari intake formulir chat. Kebutuhan: Hybrid 3500 VA, backup 24 jam (${intake.criticalAppliances}), jarak kabel ${intake.cableDistance}. Status: Warm Lead.`,
    });

    attachOperationalRecord(customerId, 'survey', survey);
    addEpisodicSummary(
      customerId,
      `Formulir teknis terverifikasi untuk ${displayName}. Permohonan survei teknis #${survey.id} diteruskan ke CRM.`,
      ['INTAKE_CONFIRMED', 'SURVEY_SCHEDULED']
    );

    memory.workingMemory.pendingIntakeData = null;
    memory.workingMemory.currentStep = 'survey_scheduled';

    toolCalls.push(
      { tool: 'crm_record_intake_lead', params: { leadId: lead.id } },
      { tool: 'crm_schedule_survey', params: { surveyId: survey.id } }
    );

    replyText = `Alhamdulillah, data telah berhasil difinalisasi dan resmi diteruskan ke sistem CRM SUNBLIX! 🎉\n\n` +
      `📋 **Status Pendaftaran Survei Teknis:**\n` +
      `• **Nomor Prospek CRM:** #${lead.id}\n` +
      `• **Nomor Registrasi Survei:** #${survey.id}\n` +
      `• **Nama Pelanggan:** **${intake.customerName}**${intake.picName ? ` (PIC: **${intake.picName}**)` : ''}\n` +
      `• **Kontak WhatsApp:** **${intake.phone}**\n` +
      `• **Lokasi Properti:** ${intake.address}\n` +
      `• **Usulan Sistem Awal:** SUNBLIX Pro Hybrid Edition (3.51 – 4.68 kWp)\n` +
      `• **Status CRM:** Survey Terjadwal (Warm Lead)\n\n` +
      `Tim Senior Engineer kami untuk wilayah **Jakarta Timur** akan segera menghubungi ${intake.picName ? `Bapak ${intake.picName}` : `Bapak ${intake.customerName}`} melalui WhatsApp (**${intake.phone}**) untuk mengonfirmasi jadwal hari & jam kedatangan survei teknis serta koordinasi dokumen foto pendukung.\n\n` +
      `Terima kasih banyak atas kepercayaan Anda kepada PT SUNBLIX ENERGI INDONESIA! Apakah ada detail instalasi lain yang ingin Anda ketahui selagi menunggu tim kami? 😊`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: {
        type: 'intake_survey_confirmed',
        lead,
        survey,
        stage: 'Warm Lead',
      },
      quickActions: [
        { label: 'Lihat Tiket Survei di CRM', action: 'view_crm_survey' },
        { label: 'Konsultasi Hal Lain', action: 'resume_chat' },
      ],
    };
  }

  // Extract Bill amounts (e.g., "tagihan 3 juta", "3.500.000", "5jt", "2500000", "2,5 juta")
  let detectedBill = null;
  const billJtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  if (billJtMatch) {
    detectedBill = parseFloat(billJtMatch[1].replace(',', '.')) * 1000000;
  } else if (!lower.includes('08') && !lower.includes('wa') && !lower.includes('whatsapp')) {
    const rawNumberMatch = lower.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3}){1,3}|\b[1-9]\d{5,7}\b)/);
    if (rawNumberMatch && !rawNumberMatch[0].startsWith('08')) {
      detectedBill = parseInt(rawNumberMatch[1].replace(/\./g, ''), 10);
    }
  }

  if (detectedBill && detectedBill >= 300000) {
    updateSemanticFact(customerId, 'monthlyBill', detectedBill, true);
    memory.semanticMemory.monthlyBill = detectedBill;
  }

  // Extract Property Type
  let detectedProperty = null;
  if (lower.includes('villa') || lower.includes('resort')) detectedProperty = 'villa';
  else if (lower.includes('ruko') || lower.includes('kantor') || lower.includes('bisnis') || lower.includes('toko')) detectedProperty = 'commercial';
  else if (lower.includes('pabrik') || lower.includes('gudang') || lower.includes('industri')) detectedProperty = 'warehouse';
  else if (lower.includes('rumah') || lower.includes('residensial') || lower.includes('perumahan')) detectedProperty = 'house';

  if (detectedProperty) {
    updateSemanticFact(customerId, 'propertyType', detectedProperty, true);
    memory.semanticMemory.propertyType = detectedProperty;
  }

  // Extract System Type
  let detectedSystem = null;
  if (lower.includes('ongrid') || lower.includes('on-grid') || lower.includes('tanpa baterai')) detectedSystem = 'ongrid';
  else if (lower.includes('offgrid') || lower.includes('off-grid') || lower.includes('mandiri')) detectedSystem = 'offgrid';
  else if (lower.includes('hybrid') || lower.includes('baterai') || lower.includes('cadangan') || lower.includes('mati lampu') || lower.includes('keduanya')) detectedSystem = 'hybrid';

  if (detectedSystem) {
    updateSemanticFact(customerId, 'preferredSystemType', detectedSystem, true);
    memory.semanticMemory.preferredSystemType = detectedSystem;
  }

  // Extract PLN Power (e.g., "2200 VA", "3500 watt", "5500", "1300")
  let detectedPower = null;
  const powerMatch = lower.match(/(\d{1,2}(?:\.\d{3})+|\d{3,6})\s*(?:va|watt|w\b)/) || lower.match(/\b(1300|2200|3500|4400|5500|6600|7700|11000)\b/);
  if (powerMatch) {
    const rawP = powerMatch[1].replace(/\./g, '');
    detectedPower = `${Number(rawP).toLocaleString('id-ID')} VA`;
    updateSemanticFact(customerId, 'plnPower', detectedPower, true);
    memory.semanticMemory.plnPower = detectedPower;
  }

  // Extract Meter Type (Token / Prabayar vs Pascabayar)
  let detectedMeter = null;
  if (lower.includes('token') || lower.includes('prabayar') || lower.includes('pulsa')) {
    detectedMeter = 'Token (Prabayar)';
  } else if (lower.includes('pascabayar') || lower.includes('pasca bayar') || lower.includes('tagihan bulanan')) {
    detectedMeter = 'Pascabayar';
  }
  if (detectedMeter) {
    updateSemanticFact(customerId, 'meterType', detectedMeter, true);
    memory.semanticMemory.meterType = detectedMeter;
  }

  // Extract Location / City
  let detectedLocation = null;
  const cities = [
    'jakarta garden city', 'jakarta timur', 'jakarta barat', 'jakarta selatan', 'jakarta pusat', 'jakarta utara',
    'jakarta', 'jabodetabek', 'tangerang selatan', 'tangerang', 'bekasi', 'depok', 'bogor', 'bandung',
    'surabaya', 'semarang', 'yogyakarta', 'jogja', 'bali', 'denpasar', 'medan', 'makassar', 'malang',
    'solo', 'palembang', 'pekanbaru', 'batam', 'lampung'
  ];
  for (const city of cities) {
    if (lower.includes(city)) {
      detectedLocation = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }
  if (!detectedLocation && memory.workingMemory?.crmStep === 'ask_location') {
    const cleanLoc = trimmed.replace(/^(?:di|lokasi|daerah|wilayah|rencana|kota|rumah|ruko|bangunan)\s+/gi, '').trim();
    if (cleanLoc.length >= 3 && cleanLoc.length <= 50) {
      detectedLocation = cleanLoc;
    }
  }
  if (detectedLocation) {
    updateSemanticFact(customerId, 'location', detectedLocation, true);
    memory.semanticMemory.location = detectedLocation;
  }

  // Extract Phone / WhatsApp
  let detectedPhone = null;
  const phoneMatch = lower.match(/(?:(?:\+62|62|08)[0-9\-\s]{7,13}[0-9])/);
  if (phoneMatch) {
    detectedPhone = phoneMatch[0].replace(/[-\s]/g, '');
    updateSemanticFact(customerId, 'customerPhone', detectedPhone, true);
    memory.semanticMemory.customerPhone = detectedPhone;
  }

  // Extract Customer Name / PIC
  let detectedName = null;
  const nameMatch = trimmed.match(/(?:nama\s*(?:lengkap|pic|saya)?\s*[:=]?\s*|pic\s*[:=]?\s*)([a-zA-Z\s'.]+?)(?:,|\.|\bwa\b|\bnomor\b|\bno\b|\b08|\btelepon\b|$)/i);
  if (nameMatch && nameMatch[1].trim().length > 2) {
    detectedName = nameMatch[1].trim();
  } else if (memory.workingMemory?.crmStep === 'ask_contact') {
    const withoutPhone = trimmed.replace(/(?:wa|whatsapp|no\.?\s*(?:wa|hp|telepon|telp)?|kontak)?[:\s]*(?:\+62|62|08)[0-9\-\s]{8,14}[0-9]/gi, '').replace(/[,\-:]/g, '').trim();
    if (withoutPhone.length >= 3 && withoutPhone.length <= 40 && !withoutPhone.match(/\d/)) {
      detectedName = withoutPhone;
    }
  }
  if (detectedName) {
    updateSemanticFact(customerId, 'customerName', detectedName, true);
    memory.semanticMemory.customerName = detectedName;
  }

  // ==========================================================================
  // CONVERSATIONAL CRM QUALIFICATION STATE MACHINE
  // Kaidah data CRM: Tagihan -> Daya PLN & Meter -> Lokasi & Properti -> Sistem (OnGrid/Hybrid) -> Nama & WA
  // ==========================================================================

  // Step 5: Finalization & Official CRM Registration (Nama & WhatsApp received)
  if ((detectedPhone && (detectedName || memory.semanticMemory.customerName)) || (memory.workingMemory?.crmStep === 'ask_contact' && detectedPhone)) {
    const finalName = detectedName || memory.semanticMemory.customerName || customerData.name || 'Bapak / Ibu Pelanggan';
    const finalPhone = detectedPhone || memory.semanticMemory.customerPhone || customerData.whatsapp || customerData.phone || '0812-xxxx-xxxx';
    const bill = memory.semanticMemory.monthlyBill || 3000000;
    const power = memory.semanticMemory.plnPower || '3.500 VA';
    const meter = memory.semanticMemory.meterType || 'Token (Prabayar)';
    const loc = memory.semanticMemory.location || 'Jabodetabek';
    const prop = memory.semanticMemory.propertyType || 'house';
    const sys = memory.semanticMemory.preferredSystemType || 'hybrid';

    const calc = calculateSolarSystem({ monthlyBill: bill, propertyType: prop, systemType: sys });

    const propLabel = prop === 'commercial' ? 'Ruko / Komersial' : prop === 'warehouse' ? 'Pabrik / Industri' : prop === 'villa' ? 'Villa' : 'Rumah Tinggal';
    const sysLabel = sys === 'hybrid' ? 'SUNBLIX Pro Hybrid Edition' : 'SUNBLIX Smart On-Grid Edition';

    const lead = recordLead({
      customerId,
      name: finalName,
      phone: finalPhone,
      city: loc,
      monthlyBill: bill,
      plnPower: power,
      propertyType: prop,
      systemType: sys,
      source: 'SURTI AI Conversational Qualification',
      notes: `[DATA KUALIFIKASI CRM RESMI SURTI]\n• Pelanggan: ${finalName}\n• Kontak WhatsApp: ${finalPhone}\n• Lokasi: ${loc} (${propLabel})\n• Listrik PLN: ${power} (${meter}), Tagihan: ${formatRupiah(bill)}/bln\n• Usulan Sistem: ${sysLabel} (${calc.kwp} kWp, ${calc.panelCount}x Astronergy 585Wp TOPCon)\n• Estimasi Hemat: ${formatRupiah(calc.estimatedMonthlySavings)}/bln`,
    });

    const survey = createSurveyRequest({
      customerId,
      customerName: finalName,
      phone: finalPhone,
      siteAddress: loc,
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      roofType: memory.semanticMemory.roofType || 'Genteng Keramik',
      notes: `Permohonan survei lokasi atap dari alur kualifikasi CRM SURTI AI. Rekomendasi: ${calc.kwp} kWp ${sys}. Status: Warm Lead.`,
    });

    attachOperationalRecord(customerId, 'lead', lead);
    attachOperationalRecord(customerId, 'survey', survey);
    addEpisodicSummary(
      customerId,
      `Kualifikasi CRM selesai untuk ${finalName}. Prospek #${lead.id} dan Tiket Survei #${survey.id} diteruskan ke CRM SUNBLIX.`,
      ['CRM_LEAD_REGISTERED', 'SURVEY_SCHEDULED'],
      calc.kwp
    );

    updateWorkingMemory(customerId, { crmStep: 'crm_completed', currentStep: 'survey_scheduled' });

    toolCalls.push(
      { tool: 'omni_record_lead', params: { leadId: lead.id, customerName: finalName, phone: finalPhone, status: 'Terkualifikasi Awal' } },
      { tool: 'crm_schedule_survey', params: { surveyId: survey.id } }
    );

    replyText = `Alhamdulillah, seluruh data kualifikasi telah berhasil diverifikasi dan resmi didaftarkan ke **Sistem CRM PT SUNBLIX ENERGI INDONESIA**! 🎉\n\n` +
      `📋 **Ringkasan Data Prospek CRM:**\n` +
      `• **Nomor Prospek Lead CRM:** #${lead.id}\n` +
      `• **Nomor Registrasi Survei:** #${survey.id}\n` +
      `• **Nama Pelanggan / PIC:** **${finalName}**\n` +
      `• **Kontak WhatsApp:** **${finalPhone}**\n` +
      `• **Lokasi Pemasangan:** ${loc} (${propLabel})\n` +
      `• **Kelistrikan PLN:** ${power} (${meter}), Tagihan ~${formatRupiah(bill)}/bln\n` +
      `• **Rekomendasi Paket:** **${calc.packageName}** (${calc.kwp} kWp, ${calc.panelCount}x Modul Astronergy 585Wp TOPCon)\n` +
      `• **Estimasi Penghematan:** Hingga **${formatRupiah(calc.estimatedMonthlySavings)} / bulan**\n` +
      `• **Status CRM:** Terkualifikasi & Siap Survei (Warm Lead)\n\n` +
      `Tim Senior Technical Engineer kami untuk wilayah **${loc}** akan segera menghubungi Anda melalui WhatsApp (**${finalPhone}**) untuk mengonfirmasi jadwal kunjungan survei atap gratis serta mengirimkan dokumen resmi Draft SPH.\n\n` +
      `Terima kasih banyak atas kepercayaan Anda kepada PT SUNBLIX ENERGI INDONESIA! Apakah ada detail instalasi lain yang ingin Anda ketahui selagi menunggu tim kami? 😊`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: {
        type: 'crm_lead_registered',
        lead,
        survey,
        calculated: calc,
        stage: 'Warm Lead',
      },
      quickActions: [
        { label: 'Lihat Tiket Survei di CRM', action: 'view_crm_survey' },
        { label: 'Lihat Brosur Penawaran SPH', action: 'Tolong buatkan draf SPH resmi untuk sistem ini' },
        { label: 'Konsultasi Hal Lain', action: 'resume_chat' },
      ],
    };
  }

  // Step 4: System Goal received -> Ask Step 5 (Nama Lengkap / PIC & WhatsApp)
  if ((detectedSystem || memory.workingMemory?.crmStep === 'ask_system_goal') && !memory.semanticMemory.customerPhone && !detectedPhone) {
    const sys = detectedSystem || memory.semanticMemory.preferredSystemType || 'hybrid';
    const sysLabel = sys === 'hybrid' ? 'Hybrid (dengan Baterai Lithium Cadangan Anti Mati Lampu)' : 'On-Grid (Fokus Memangkas Tagihan Siang Hari)';
    updateWorkingMemory(customerId, { crmStep: 'ask_contact' });

    replyText = `Pilihan yang sangat tepat! Sistem **${sysLabel}** merupakan solusi unggulan SUNBLIX dengan efisiensi tinggi, komponen Grade-A, dan garansi kinerja hingga 25 tahun.\n\n` +
      `Agar seluruh data kuesioner teknis ini dapat kami daftarkan secara resmi ke **Sistem CRM PT SUNBLIX ENERGI INDONESIA** sehingga tim engineer kami dapat menerbitkan estimasi penawaran (Draft SPH) dan menjadwalkan survei atap gratis:\n\n` +
      `Bolehkah saya mengetahui:\n` +
      `1. **Nama Lengkap / PIC**:\n` +
      `2. **Nomor WhatsApp aktif** yang bisa kami hubungi?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: { type: 'crm_qualification_step', step: 'ask_contact', preferredSystemType: sys },
      quickActions: [],
    };
  }

  // Step 3: Location & Property Type received -> Ask Step 4 (On-Grid vs Hybrid Baterai)
  if ((detectedLocation || detectedProperty || memory.workingMemory?.crmStep === 'ask_location') && !memory.semanticMemory.preferredSystemType && !detectedSystem && !detectedPhone) {
    const loc = detectedLocation || memory.semanticMemory.location || 'wilayah rencana pemasangan';
    const prop = detectedProperty || memory.semanticMemory.propertyType || 'house';
    const propLabel = prop === 'commercial' ? 'Ruko / Tempat Bisnis' : prop === 'warehouse' ? 'Pabrik / Kawasan Industri' : prop === 'villa' ? 'Villa' : 'Rumah Tinggal';
    updateWorkingMemory(customerId, { crmStep: 'ask_system_goal' });

    replyText = `Siap, rencana pemasangan di **${loc}** untuk properti **${propLabel}** sudah tercatat dengan rapi.\n\n` +
      `Agar spesifikasi teknis dan inverter pada penawaran sistem CRM tepat sasaran, sistem PLTS apa yang paling Anda butuhkan saat ini:\n\n` +
      `1. **On-Grid** (Tanpa baterai — fokus utama memaksimalkan penghematan tagihan listrik siang hari dengan biaya investasi paling ekonomis).\n` +
      `2. **Hybrid** (Dilengkapi baterai cadangan — hemat tagihan sekaligus otomatis menjadi genset hening anti mati lampu 24 jam saat PLN padam)?\n\n` +
      `*(Pilihan mana yang lebih Anda prioritaskan?)*`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: { type: 'crm_qualification_step', step: 'ask_system_goal', location: loc, propertyType: prop },
      quickActions: [
        { label: 'Hybrid (Ada Baterai Cadangan)', action: 'Saya lebih tertarik sistem Hybrid dengan baterai cadangan' },
        { label: 'On-Grid (Fokus Hemat Tagihan)', action: 'Saya lebih tertarik sistem On-Grid tanpa baterai' },
        { label: 'Keduanya (Hemat & Anti Padam)', action: 'Keduanya, hemat tagihan dan backup saat padam' },
      ],
    };
  }

  // Step 2: PLN Power & Meter Type received -> Ask Step 3 (Lokasi Kota & Jenis Bangunan)
  if ((detectedPower || detectedMeter || memory.workingMemory?.crmStep === 'ask_power') && !memory.semanticMemory.location && !detectedLocation && !detectedPhone) {
    const power = detectedPower || memory.semanticMemory.plnPower || 'daya PLN Anda';
    const meter = detectedMeter || memory.semanticMemory.meterType || 'Meter PLN';
    updateWorkingMemory(customerId, { crmStep: 'ask_location' });

    replyText = `Baik, daya listrik PLN **${power}** (${meter}) telah saya catat dalam kualifikasi teknis.\n\n` +
      `Selanjutnya, untuk penyesuaian radiasi matahari (sun hours) dan estimasi logistik tim teknis kami pada sistem CRM:\n\n` +
      `1. Di mana **lokasi kota / wilayah** rencana pemasangan (misal: Jakarta Timur, Tangerang, Surabaya, Bali, dll.)?\n` +
      `2. Apa **jenis bangunannya** (Rumah Tinggal, Ruko/Kantor Bisnis, atau Pabrik/Gudang)?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: { type: 'crm_qualification_step', step: 'ask_location', plnPower: power, meterType: meter },
      quickActions: [
        { label: 'Rumah Tinggal di Jabodetabek', action: 'Rumah tinggal di Jabodetabek' },
        { label: 'Ruko / Tempat Bisnis', action: 'Ruko atau tempat bisnis komersial' },
        { label: 'Pabrik / Kawasan Industri', action: 'Pabrik atau fasilitas industri' },
      ],
    };
  }

  // Step 1: Monthly Bill received -> Ask Step 2 (Daya Listrik PLN & Meteran Token / Pascabayar)
  if ((detectedBill || memory.workingMemory?.crmStep === 'ask_bill' || lower.includes('tagihan')) && !memory.semanticMemory.plnPower && !detectedPower && !detectedLocation && !detectedPhone) {
    const bill = detectedBill || memory.semanticMemory.monthlyBill || 3000000;
    const estSavings = Math.round(bill * 0.7);
    updateWorkingMemory(customerId, { crmStep: 'ask_power' });

    replyText = `Terima kasih atas informasinya! Dengan kisaran tagihan rata-rata **${formatRupiah(bill)} / bulan**, potensi penghematan listrik Anda dengan PLTS SUNBLIX bisa mencapai 60% hingga 80% (sekitar **${formatRupiah(estSavings)} / bulan**).\n\n` +
      `Untuk menentukan kapasitas inverter dan sistem panel surya yang aman dan presisi untuk CRM kami, bolehkah saya bertanya:\n\n` +
      `1. Berapa **daya listrik PLN (VA)** yang terpasang saat ini (misal: 2.200 VA, 3.500 VA, 5.500 VA, dsb.)?\n` +
      `2. Apakah menggunakan meteran listrik **Token (Prabayar)** atau **Pascabayar**?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: { type: 'crm_qualification_step', step: 'ask_power', monthlyBill: bill, estimatedMonthlySavings: estSavings },
      quickActions: [
        { label: '3.500 VA (Token)', action: 'Daya 3500 VA dengan meteran token' },
        { label: '5.500 VA (Pascabayar)', action: 'Daya 5500 VA dengan meteran pascabayar' },
        { label: '2.200 VA (Token)', action: 'Daya 2200 VA dengan meteran token' },
      ],
    };
  }

  // Intent 0A: Lead Data Confirmation - YES / BENAR / SUDAH (Send to Omni -> CRM)
  if (
    lower === 'benar' ||
    lower === 'ya' ||
    lower === 'betul' ||
    lower === 'sudah' ||
    lower === 'sudah benar' ||
    lower === 'ya benar' ||
    lower === 'data sudah benar' ||
    lower === 'sesuai' ||
    lower === 'sudah sesuai' ||
    lower === 'sudah pas' ||
    lower === 'pas' ||
    lower === 'tidak ada' ||
    lower === 'tidak ada lagi' ||
    lower === 'cukup' ||
    lower === 'oke' ||
    lower === 'ok' ||
    lower === 'yes' ||
    lower.startsWith('ya,') ||
    lower.startsWith('ya ') ||
    lower.includes('sudah benar') ||
    lower.includes('data benar') ||
    lower.includes('semua benar')
  ) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    const custCity = customerData.city || 'lokasi Anda';

    payloadData = {
      type: 'lead_verified_by_omni',
      stage: 'Kualifikasi',
      agent: 'Omni',
      action: 'forward_to_omni',
      verified: true,
    };

    toolCalls.push({
      tool: 'omni_record_lead',
      params: {
        customerName: custName,
        phone: customerData.whatsapp || customerData.phone,
        status: 'Terkualifikasi Awal',
      },
    });

    replyText = `Baik terima kasih, mohon ditunggu sebentar..`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [],
    };
  }

  // Intent 0B: Lead Data Confirmation - BELUM / SALAH / ADA YANG SALAH
  if (
    lower === 'belum' ||
    lower === 'salah' ||
    lower === 'tidak' ||
    lower === 'belum benar' ||
    lower === 'ada yang salah' ||
    lower === 'bukan' ||
    lower.includes('belum benar') ||
    lower.includes('ada yang salah') ||
    lower.includes('keliru') ||
    lower.includes('salah ketik')
  ) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    updateWorkingMemory(customerId, { correctionStep: 'ask_bill' });

    payloadData = {
      type: 'lead_data_correction_needed',
      stage: 'Koreksi Data',
    };

    replyText = `Baik Bapak/Ibu ${custName}, mohon maaf atas ketidaksesuaiannya. Mari kita perbaiki bersama satu per satu secara langsung.\n\n` +
      `Boleh dibantu, berapa kisaran **tagihan listrik PLN bulanan** Anda saat ini? (Misal: 3 juta, 3.500.000, atau lainnya)`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: payloadData,
      quickActions: [],
    };
  }

  // Intent 1: Request SPH Draft
  if (lower.includes('sph') || lower.includes('penawaran') || lower.includes('proposal') || lower.includes('kontrak')) {
    const currentBill = memory.semanticMemory.monthlyBill || 3500000;
    const currentProp = memory.semanticMemory.propertyType || 'house';
    const currentSys = memory.semanticMemory.preferredSystemType || 'hybrid';

    const draftSph = createDraftSph({
      customerId,
      customerName: customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan',
      customerPhone: customerData.phone || '+62 812-xxxx-xxxx',
      customerEmail: customerData.email || 'customer@example.com',
      companyName: customerData.company || null,
      propertyType: currentProp,
      systemType: currentSys,
      monthlyBill: currentBill,
      isDemo: true,
      notes: `Permintaan SPH disusun via SURTI AI untuk kebutuhan properti ${currentProp} dengan estimasi tagihan ${formatRupiah(currentBill)}.`,
    });

    attachOperationalRecord(customerId, 'sphDraft', {
      id: draftSph.id,
      sphNumber: draftSph.sphNumber,
      total: draftSph.commercial.totalInclPpn,
      status: draftSph.status,
    });

    addEpisodicSummary(customerId, `Draf SPH #${draftSph.sphNumber} telah berhasil dibuat untuk sistem ${draftSph.technicalSpecs.systemTypeLabel}.`, ['DRAFT_SPH_CREATED'], draftSph.technicalSpecs.kwp);

    toolCalls.push({ tool: 'generate_sph_draft', params: { sphId: draftSph.id, sphNumber: draftSph.sphNumber } });
    payloadData = { type: 'sph_draft', sph: draftSph };

    replyText = `Saya telah membuatkan **Draf Surat Penawaran Harga (SPH)** resmi dengan nomor dokumen **${draftSph.sphNumber}** untuk sistem rekomendasi resmi brosur **${draftSph.packageName} (${draftSph.technicalSpecs.kwp} kWp)**.\n\n` +
      `📌 **Rincian Ringkas Draf Brosur:**\n` +
      `• Paket Resmi: **${draftSph.packageName}** (${draftSph.technicalSpecs.panelCount}x ${draftSph.technicalSpecs.panelModel})\n` +
      `• Inverter Cerdas: **${draftSph.technicalSpecs.inverter}**\n` +
      `• Penyimpanan Baterai: **${draftSph.technicalSpecs.battery}**\n` +
      `• Nilai Investasi (DPP): **${formatRupiah(draftSph.commercial.dpp)}**\n` +
      `• Nilai Total (Termasuk PPN 11%): **${formatRupiah(draftSph.commercial.totalInclPpn)}**\n\n` +
      `⚠️ *Catatan Resmi:* Dokumen ini terhubung langsung dengan sistem Brosur & SPH resmi SUNBLIX. Status saat ini adalah **DRAFT** dan menunggu persetujuan Direksi di DashboardOS sebelum diterbitkan resmi. Anda dapat membuka dan menyesuaikan dokumen resmi di halaman Brosur melalui tombol di bawah.`;

    updateWorkingMemory(customerId, {
      intent: 'sph_drafted',
      currentStep: 'sph_review',
      answeredQuestion: 'sph_request',
      lastToolResult: draftSph,
    });

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [
        { label: 'Buka Dokumen di Brosur SPH Resmi ↗', action: 'view_sph', sphId: draftSph.id, url: draftSph.brosurUrl },
        { label: 'Jadwalkan Survei Lokasi', action: 'request_survey' },
        { label: 'Bicara dengan Konsultan Ahli', action: 'human_handoff' },
      ],
    };
  }

  // Intent 2A: Decline / Postpone Survey (Cold Lead / Nurturing)
  if (
    lower.includes('belum mau survei') ||
    lower.includes('tidak survei') ||
    lower.includes('tunda') ||
    lower.includes('kirim brosur') ||
    lower.includes('brosur dulu') ||
    lower.includes('kemahalan') ||
    lower.includes('belum ada budget') ||
    lower.includes('nanti saja') ||
    lower.includes('nanti dulu') ||
    lower.includes('batal survei') ||
    lower.includes('belum siap') ||
    lower.includes('cuma tanya') ||
    lower.includes('pikir dulu') ||
    lower.includes('pikir-pikir')
  ) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    payloadData = {
      type: 'lead_qualification_result',
      stage: 'Cold Lead',
      action: 'mark_cold_lead',
      reason: 'Klien menunda survei teknis / meminta materi brosur terlebih dahulu.',
    };

    toolCalls.push({ tool: 'mark_lead_stage', params: { stage: 'Cold Lead', reason: 'Menunda survei' } });

    replyText = `Baik Bapak/Ibu ${custName}, kami sangat memahami dan menghargai keputusan Anda. Berinvestasi pada sistem PLTS memang memerlukan pertimbangan yang matang.\n\n` +
      `Seluruh estimasi data teknis Anda tetap tersimpan dengan aman bersama kami. Anda juga dapat mempelajari katalog spesifikasi lengkap sistem panel surya SUNBLIX kapan pun dibutuhkan.\n\n` +
      `Bila sewaktu-waktu Anda siap menjadwalkan survei teknis atau memiliki pertanyaan seputar teknologi panel surya, saya selalu siap membantu Anda kembali di sini! 😊`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [],
    };
  }

  // Intent 2B: Customer asks about Survey Fee / Biaya Survei
  if (
    lower.includes('biaya survei') ||
    lower.includes('biaya survey') ||
    lower.includes('berapa biayanya') ||
    lower.includes('berbayar') ||
    lower.includes('tarif survei') ||
    lower.includes('biaya komitmen') ||
    lower.includes('apakah bayar')
  ) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    const custCity = customerData.city || 'lokasi Anda';

    replyText = `Baik Bapak/Ibu ${custName}, untuk layanan Survei Lokasi Teknis kami memberlakukan **biaya komitmen survei**. Biaya ini mencakup operasional inspeksi komprehensif oleh Senior Engineer, analisis *3D shading*, audit struktur rangka atap, pengecekan kelistrikan PLN, serta penyusunan gambar Single Line Diagram (SLD) presisi.\n\n` +
      `💡 **Catatan Penting:** Biaya komitmen survei ini nantinya akan **dipotongkan langsung sebagai pengurang biaya investasi (cashback 100%)** dari nilai kontrak instalasi ketika proyek PLTS dilanjutkan bersama SUNBLIX.\n\n` +
      `Tim engineer kami di wilayah ${custCity} akan menginformasikan detail administrasi resminya saat mengonfirmasi jadwal ke WhatsApp Anda. Hari apa yang kira-kira paling nyaman untuk Anda dikunjungi?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: { type: 'survey_fee_inquiry' },
      quickActions: [],
    };
  }

  // Intent 2: Site Survey Booking (Warm Lead)
  if (
    lower.includes('survei') ||
    lower.includes('survey') ||
    lower.includes('jadwal') ||
    lower.includes('kunjungi') ||
    lower.includes('besok') ||
    lower.includes('sabtu') ||
    lower.includes('minggu') ||
    lower.includes('senin') ||
    lower.includes('selasa') ||
    lower.includes('rabu') ||
    lower.includes('kamis') ||
    lower.includes('jumat') ||
    lower.includes('boleh') ||
    lower.includes('bisa') ||
    lower.includes('setuju')
  ) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    const custCity = customerData.city || customerData.address || 'Lokasi Proyek';
    const custPhone = customerData.whatsapp || customerData.phone || 'Nomor Kontak';

    const survey = createSurveyRequest({
      customerId,
      customerName: custName,
      phone: custPhone,
      siteAddress: custCity,
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      roofType: memory.semanticMemory.roofType || 'Genteng Keramik / Spandek',
      notes: 'Permintaan survei teknis disepakati via SURTI AI. Status: Warm Lead.',
    });

    attachOperationalRecord(customerId, 'survey', survey);
    toolCalls.push({ tool: 'request_site_survey', params: { surveyId: survey.id, stage: 'Warm Lead' } });
    payloadData = {
      type: 'survey_request',
      stage: 'Warm Lead',
      survey,
    };

    replyText = `Terima kasih banyak atas konfirmasinya, Bapak/Ibu **${custName}**! 🎉\n\n` +
      `Preferensi jadwal survei teknis Anda telah kami catat. Tim Senior Engineer kami di wilayah **${custCity}** akan segera menghubungi Anda melalui WhatsApp (**${custPhone}**) untuk mengonfirmasi jam kedatangan yang paling tepat serta detail administrasi biaya komitmen survei teknis.\n\n` +
      `🔍 **Cakupan Audit Teknis oleh Tim Engineer SUNBLIX di Lokasi:**\n` +
      `1. Audit kekuatan struktur rangka atap & kemiringan (*tilt angle*).\n` +
      `2. Analisis bayangan (*3D Shading Analysis*) pohon/bangunan sekitar menggunakan kompas & instrumen surya.\n` +
      `3. Pengecekan panel distribusi MCB PLN & pengukuran nilai tahanan grounding.\n` +
      `4. Penyusunan Single Line Diagram (SLD) presisi untuk pengajuan izin SLO & persetujuan PLN.\n\n` +
      `Sambil menunggu tim engineer kami menghubungi Anda, apakah ada hal khusus mengenai kondisi atap atau instalasi kelistrikan di lokasi yang ingin Anda tanyakan terlebih dahulu?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [],
    };
  }

  // Intent 3: Human Handoff / Escalation
  if (lower.includes('operator') || lower.includes('manusia') || lower.includes('telepon') || lower.includes('sales') || lower.includes('cs') || lower.includes('bantuan')) {
    const ticket = createServiceTicket({
      customerId,
      customerName: customerData.name || 'Bapak / Ibu Pelanggan',
      phone: customerData.phone || '',
      category: 'human_handoff',
      priority: 'high',
      subject: 'Eskalasi Percakapan ke Konsultan Ahli SUNBLIX',
      description: 'Pelanggan meminta berbicara langsung dengan konsultan teknis / perwakilan resmi SUNBLIX.',
    });

    toolCalls.push({ tool: 'create_service_ticket', params: { ticketId: ticket.id } });
    payloadData = { type: 'service_ticket', ticket };

    replyText = `Tentu, saya telah membuatkan tiket eskalasi **#${ticket.id}** untuk menghubungkan Anda langsung dengan Konsultan Teknis Ahli SUNBLIX.\n\n` +
      `Anda juga dapat langsung menghubungi hotline resmi kami via WhatsApp di **${SUNBLIX_OFFICIAL_PROFILE.contactPhone}** atau email ke **${SUNBLIX_OFFICIAL_PROFILE.contactEmail}**. Rekan kami siap membantu kebutuhan detail Anda.`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [
        { label: 'Chat WhatsApp Resmi', action: 'open_whatsapp', url: `https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20ingin%20konsultasi%20PLTS%20dengan%20tiket%20${ticket.id}` },
        { label: 'Lanjutkan Chat dengan SURTI', action: 'resume_chat' },
      ],
    };
  }

  // Intent 4: Solar Sizing / Calculation (When bill, property, or calculation mentioned)
  if (detectedBill || lower.includes('hitung') || lower.includes('kalkulator') || lower.includes('berapa panel') || lower.includes('biaya') || lower.includes('harga')) {
    const billToCalc = detectedBill || memory.semanticMemory.monthlyBill || 3000000;
    const propToCalc = detectedProperty || memory.semanticMemory.propertyType || 'house';
    const sysToCalc = detectedSystem || memory.semanticMemory.preferredSystemType || 'hybrid';

    const calcResult = calculateSolarSystem({
      monthlyBill: billToCalc,
      propertyType: propToCalc,
      systemType: sysToCalc,
    });

    toolCalls.push({ tool: 'calculate_solar_system', params: calcResult });
    payloadData = { type: 'solar_calculation', calculation: calcResult };

    addEpisodicSummary(
      customerId,
      `Perhitungan PLTS untuk tagihan ${formatRupiah(billToCalc)}: Sistem ${calcResult.kwp} kWp (${calcResult.panelCount} panel), estimasi hemat ${formatRupiah(calcResult.estimatedMonthlySavings)}/bln.`,
      ['CALCULATION_PERFORMED'],
      calcResult.kwp
    );

    replyText = `Berdasarkan estimasi tagihan listrik rata-rata **${formatRupiah(billToCalc)}/bulan** untuk kategori **${calcResult.propertyTypeLabel}**, rekomendasi paket resmi dari Katalog Brosur 2026 adalah:\n\n` +
      `⚡ **${calcResult.packageName} (${calcResult.kwp} kWp)**\n` +
      `• Panel Surya: **${calcResult.panelCount} Modul (${calcResult.panelModel})**\n` +
      `• Kebutuhan Luas Atap: **${calcResult.requiredRoofArea}**\n` +
      `• Inverter Cerdas: **${calcResult.inverter}**\n` +
      `• Penyimpanan Baterai: **${calcResult.battery}**\n` +
      `• Estimasi Produksi Energi: **~${calcResult.monthlyProductionKwh} kWh / bulan**\n\n` +
      `💰 **Analisis Finansial & Penghematan:**\n` +
      `• Estimasi Penghematan: **${formatRupiah(calcResult.estimatedMonthlySavings)} / bulan** (~${calcResult.savingsPercentage}%)\n` +
      `• Estimasi Penghematan 25 Tahun: **${formatRupiah(calcResult.savings25Years)}**\n` +
      `• Estimasi Periode Balik Modal (BEP): **~${calcResult.paybackPeriodYears} Tahun**\n` +
      `• Estimasi Nilai Investasi Sistem: **${formatRupiah(calcResult.estimatedInvestment)}**\n\n` +
      `Apakah Anda ingin saya buatkan **Draf SPH (Surat Penawaran Harga)** resmi untuk paket ini, atau ingin menjadwalkan **survei lokasi** terlebih dahulu?`;

    updateWorkingMemory(customerId, {
      intent: 'solar_calculated',
      currentStep: 'post_calculation',
      lastToolResult: calcResult,
    });

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [
        { label: 'Buatkan Draf SPH Resmi', action: 'request_sph' },
        { label: 'Jadwalkan Survei Atap', action: 'request_survey' },
        { label: 'Coba Sistem On-Grid (Tanpa Baterai)', action: 'recalc_ongrid' },
      ],
    };
  }

  // Intent 5: Inquire about Packages (Standard, Pro, Pro+)
  if (lower.includes('paket') || lower.includes('produk') || lower.includes('tier') || lower.includes('standard') || lower.includes('pro')) {
    const packages = getTurnkeyPackages();
    payloadData = { type: 'packages_list', packages };

    replyText = `SUNBLIX menghadirkan 3 pilihan paket terstandar yang dirancang untuk performa jangka panjang:\n\n` +
      `1. **SUNBLIX Standard Edition (On-Grid)**\n` +
      `   Sistem terhubung jaringan PLN tanpa baterai. Memangkas tagihan listrik siang hari hingga 70-75% dengan biaya investasi paling terjangkau (Mulai ${formatRupiah(58000000)}).\n\n` +
      `2. **SUNBLIX Pro Hybrid Edition (Paling Favorit ⭐)**\n` +
      `   Dilengkapi baterai pintar LiFePO4 5.1 kWh. Memberikan kenyamanan proteksi saat pemadaman PLN (< 4ms sekelas UPS) dan memotong tagihan hingga 85% (Mulai ${formatRupiah(91500000)}).\n\n` +
      `3. **SUNBLIX Pro+ Industrial Edition (3-Phase)**\n` +
      `   Kapasitas besar 12 kW hingga 100 kW+ untuk ruko besar, pabrik, hotel, dan gudang dengan sistem proteksi industri dan integrasi genset cerdas.\n\n` +
      `Boleh saya tahu rata-rata tagihan listrik PLN bulanan Anda saat ini agar saya dapat merekomendasikan kapasitas yang paling pas?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [
        { label: 'Tagihan Rp 2.500.000 / bln', action: 'set_bill_2500k' },
        { label: 'Tagihan Rp 5.000.000 / bln', action: 'set_bill_5000k' },
        { label: 'Tagihan Rp 10.000.000 / bln', action: 'set_bill_10000k' },
      ],
    };
  }

  // Intent 6: Customer Service, Technical Complaints & Troubleshooting
  if (
    lower.includes('rusak') ||
    lower.includes('error') ||
    lower.includes('kendala') ||
    lower.includes('alarm') ||
    lower.includes('mati') ||
    lower.includes('komplain') ||
    lower.includes('klaim') ||
    lower.includes('masalah') ||
    lower.includes('berisik') ||
    lower.includes('trip') ||
    lower.includes('gangguan')
  ) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    const custPhone = customerData.whatsapp || customerData.phone || '+62 812-xxxx-xxxx';

    const ticket = createServiceTicket({
      customerId,
      customerName: custName,
      phone: custPhone,
      category: 'technical_consultation',
      priority: 'high',
      subject: 'Penanganan Kendala Teknis / Komplain Pelanggan',
      description: `Laporan kendala via SURTI AI: "${message}". Memerlukan evaluasi oleh tim Senior Engineer.`,
    });

    attachOperationalRecord(customerId, 'serviceTicket', ticket);
    toolCalls.push({ tool: 'create_service_ticket', params: { ticketId: ticket.id, priority: 'high' } });
    payloadData = { type: 'service_ticket', ticket };

    replyText = `Mohon maaf yang sebesar-besarnya atas kendala yang Anda alami, Bapak/Ibu **${custName}**. Kenyamanan dan keamanan sistem energi Anda adalah prioritas utama kami di SUNBLIX.\n\n` +
      `Saya telah menerbitkan **Tiket Layanan Resmi #${ticket.id}** dengan prioritas tinggi langsung ke tim Customer Service & Senior Engineer kami.\n\n` +
      `⚠️ **Panduan Keselamatan & Langkah Awal:**\n` +
      `1. Pastikan tidak menyentuh kabel DC, konektor MC4, atau membuka penutup inverter secara mandiri.\n` +
      `2. Catat kode error pada layar inverter Deye (misal: F01, F13, F56) jika terlihat.\n` +
      `3. Jika MCB AC/DC turun (trip), jangan dipaksa dinaikkan berulang kali sebelum diperiksa teknisi.\n\n` +
      `Rekan tim engineer kami akan segera menghubungi Anda di WhatsApp (**${custPhone}**) untuk diagnosa mendalam atau penjadwalan kunjungan perbaikan ke lokasi. Anda juga dapat menghubungi hotline 24/7 kami di **${SUNBLIX_OFFICIAL_PROFILE.contactPhone}**.`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls,
      data: payloadData,
      quickActions: [
        { label: 'Chat WhatsApp Customer Service', action: 'open_whatsapp', url: `https://wa.me/6285288581027?text=Halo%20SUNBLIX%20CS,%20saya%20membutuhkan%20bantuan%20teknis%20dengan%20nomor%20tiket%20${ticket.id}` },
        { label: 'Konsultasi Hal Lain', action: 'resume_chat' },
      ],
    };
  }

  // Intent 7: Knowledge Base Search (Garansi, Baterai, Inverter, Regulasi, Termin, Atap, Cuaca, Maintenance)
  const kbResults = searchKnowledge(lower);
  if (kbResults.length > 0) {
    const topArticle = kbResults[0];
    replyText = `Mengenai **${topArticle.title}**:\n\n${topArticle.summary}\n\n` +
      `Seluruh instalasi SUNBLIX dikerjakan oleh engineer bersertifikasi dengan standar keselamatan kelistrikan tertinggi (PUIL 2020 & SNI/IEC), menggunakan komponen Tier-1 bersertifikasi internasional (Astronergy & Deye).\n\n` +
      `Apakah ada detail spesifik lain yang ingin Anda konsultasikan (misal: estimasi kapasitas kWp, survei atap, atau sistem hybrid)?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [{ tool: 'search_knowledge', params: { query: lower } }],
      data: { type: 'knowledge_article', article: topArticle },
      quickActions: [
        { label: 'Hitung Kebutuhan PLTS Saya', action: 'calculate' },
        { label: 'Jadwalkan Survei Lokasi', action: 'request_survey' },
        { label: 'Pelajari Paket Pro Hybrid', action: 'view_pro_hybrid' },
      ],
    };
  }

  // Default Fallback
  replyText = `Halo! Dengan SURTI disini, Asisten Virtual dari PT SUNBLIX ENERGI INDONESIA. terima kasih sudah menghubungi kami. Izinkan Saya membantu Anda.\n\n` +
    `Agar saya dapat memberikan rekomendasi yang presisi dan sesuai untuk panel surya Anda, bolehkah saya bertanya Berapa kisaran rata-rata tagihan listrik PLN bulanan Anda saat ini (misal: Rp 2,5 Juta atau Rp 5 Juta)?`;

  updateWorkingMemory(customerId, { crmStep: 'ask_bill' });

  return {
    reply: replyText,
    mode: 'DEMO',
    toolCalls: [],
    data: null,
    quickActions: [
      { label: 'Tagihan Rp 2,5 Juta / bln', action: 'Tagihan saya sekitar Rp 2,5 Juta per bulan' },
      { label: 'Tagihan Rp 5 Juta / bln', action: 'Tagihan saya sekitar Rp 5 Juta per bulan' },
      { label: 'Tagihan di atas Rp 7 Juta', action: 'Tagihan saya di atas Rp 7 Juta per bulan' },
    ],
  };
}

/**
 * ----------------------------------------------------------------------------
 * LIVE AI PROVIDER (Gemini API / OpenAI API Integration)
 * ----------------------------------------------------------------------------
 */
async function executeLiveAiProvider({ apiKey, message, conversationHistory, customerId, memory }) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  // Nous Inference API (Portal subscription) — SURTI "otak" resmi produksi.
  // Diaktifkan saat NOUS_API_KEY diset (agent key dari Portal).
  const nousKey = process.env.NOUS_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || (apiKey && !geminiKey && !nousKey ? apiKey : null);

  const relevantMemories = retrieveRelevantMemories(customerId);

  const systemPrompt = `Anda adalah SURTI (SUNBLIX Utility Resource Technical Intelligence), Konsultan Senior Tenaga Surya (Solar PV Consultant) sekaligus Customer Service Specialist resmi PT SUNBLIX ENERGI INDONESIA.
Tagline Brand: POWER YOUR WORLD.
Slogan: "Investasi Energi Bersih Masa Depan Tanpa Khawatir".

Bersikaplah langsung: sesuaikan panjang jawaban Anda dengan bobot pertanyaan — pertanyaan satu baris dijawab sesuai kebutuhan, sementara pekerjaan yang telah selesai disertai laporan singkat mengenai apa yang diubah, apa yang telah diverifikasi, dan apa yang masih tersisa; jangan pernah menguraikan kembali proses pengerjaannya. Diperbolehkan basa-basi (seperti "Pertanyaan yang bagus" atau "Dengan senang hati"), namun jangan mengulang permintaan pengguna, diperbolehkan merangkum ulang apa yang telah disampaikan, dan jangan menarasikan pemanggilan alat (tool calls) yang sudah dapat dilihat oleh pengguna. Utamakan pernyataan faktual daripada penggunaan kata sifat; jika tidak yakin, katakanlah secara terus terang. Berikan persetujuan karena hal tersebut memang benar, bukan sekadar karena pengguna mengatakannya. Kedalaman informasi harus diberikan berdasarkan kebutuhan — sampaikan detail lebih mendalam hanya jika pengguna memintanya, saat memberikan penjelasan, atau jika situasi menuntutnya; jangan menjadikannya sebagai pengaturan standar.

IDENTITAS & GAYA KOMUNIKASI:
- Kepribadian: Cerdas, berwibawa, hangat, empatik, profesional, solutif, dan ramah seperti konsultan teknik manusia berpengalaman.
- Sebut diri Anda "Saya", sebut pelanggan dengan sapaan hormat "Anda" atau "Bapak/Ibu", dan sebut perusahaan sebagai "Kami" / "SUNBLIX".
- Gunakan Bahasa Indonesia murni (jangan pernah mencampur karakter/kata bahasa asing non-istilah teknis), luwes, natural, percaya diri, dan mudah dipahami orang awam tanpa mengurangi ketepatan istilah teknis.
- Format respon Anda rapi dengan poin-poin tebal (bullet points) agar nyaman dibaca.

ATURAN PROTOKOL RESPON PERTAMA & KUALIFIKASI CRM (SANGAT PENTING):
1. JAWABAN PESAN PERTAMA (jika percakapan baru dimulai atau pengguna baru menyapa seperti "Halo", "Hai", dsb.):
   Respon pembuka Anda WAJIB persis / konsisten dengan format berikut:
   "Halo! Dengan SURTI disini, Asisten Virtual dari PT SUNBLIX ENERGI INDONESIA. Terima Kasih sudah menghubungi Kami. Izinkan Saya membantu Anda. Dengan Siapa dan Dimanakah Calon alamat pemasangan panel surya Anda?"

2. Jika pengguna sudah menjawab Namanya maka respon SURTI wajib seperti ini:
   "Terima Kasih Pak/Bu [Nama] dari [Alamat] sudah menghubungi Kami."
   lalu dilanjutkan dengan pertanyaan tentang: daya listrik PLN (VA) yang terpasang saat ini, apakah menggunakan meteran Token (Prabayar) atau Pascabayar, lebih membutuhkan sistem On-Grid (tanpa baterai untuk memangkas tagihan siang hari) atau Hybrid (dengan baterai cadangan anti mati lampu), menawarkan pembuatan simulasi SPH resmi, dan terakhir menanyakan Nomor WhatsApp aktif yang bisa dihubungi.

3. Tidak ada aturan alur yang baku — SURTI wajib mengarahkan percakapan dengan sopan hingga memenuhi kebutuhan data yang dapat dicatat di CRM. Jika seiring percakapan data-data yang didapat sudah memenuhi kaidah untuk dikirim ke CRM, maka SURTI wajib lanjut mengarahkan kepada janji jadwal survei.

4. Setelah Nomor WhatsApp dijawab, SURTI lalu menampilkan estimasi kapasitas kWp & penghematan.

5. Jika pengguna meminta SPH, konfirmasikan rangkuman berdasarkan percakapan terlebih dahulu dari data terakhir yang diterima, lalu berikan rekomendasi sesuai produk SUNBLIX yang ada di halaman /brosur. Seluruh SPH yang SURTI buat berstatus DRAFT dan memerlukan persetujuan Direksi di DashboardOS sebelum diterbitkan resmi.

KATALOG RESMI SUNBLIX 2026 (PDF):
- Saat pengguna meminta katalog, brosur, atau file PDF, berikan tautan unduh resmi ini:
  https://jasasolarpanelindonesia.sunblix.id/SUNBLIX_KATALOG_2026.pdf
- Cantumkan tautan lengkap apa adanya (bisa diklik). Sebut singkat: "Silakan unduh katalog resmi kami di: [tautan]".

BATASAN LAYANAN (SANGAT PENTING):
- HANYA layani topik seputar energi surya, PLTS, panel surya, listrik, dan layanan PT SUNBLIX ENERGI INDONESIA.
- Jika pengguna bertanya hal di luar konteks (misal: resep masakan, cuaca umum, politik, hiburan, tugas sekolah), JANGAN dijawab dan JANGAN menjelaskan bahwa Anda tidak bisa menjawab. Cukup tidak merespons konten tersebut, dan lanjutkan ke layanan SUNBLIX hanya jika pengguna kembali ke konteks PLTS.

PENGETAHUAN PRODUK & SPESIFIKASI RESMI SUNBLIX 2026:
1. PANEL SURYA: Astronergy 585 Wp Bifacial N-Type TOPCon
   - Efisiensi 22.65%, degradasi tahunan < 0.4%/tahun, bifaciality hingga 80%.
   - Garansi: 25-30 Tahun Kinerja & 12 Tahun Produk Fisik.
2. INVERTER: Deye Smart Hybrid (SUN-6K/SUN-8K Single Phase; SUN-12K/15K Three Phase)
   - MPPT 99.9%, Dual MPPT, peralihan cadangan < 4ms (UPS-grade).
   - Pemantauan via Solarman Smart / Deye Cloud. Garansi 5 Tahun (extendable 10).
3. BATERAI (BESS): LiFePO4 Smart Battery 5.12 kWh 51.2V 100Ah (Deye/Seplos)
   - 6.000+ siklus @ DoD 80%, umur 10-15 tahun. Garansi 5 Tahun.
4. MOUNTING ANTI-BOCOR: Aluminium Al6005-T5 + Baut SUS304 (garansi korosi 10 th, tahan angin 120 km/jam).
   - Genteng: Tile Hook SUS304 + karet EPDM. Metal/Spandek: Standing Seam Clamp tanpa melubangi atap. Dak: Balast aluminium + waterproof membrane.

KATALOG PAKET TURNKEY:
- SUNBLIX 2.34 kWp (4 Modul) — Rp 63.500.000 (tagihan ~Rp 1,5-2jt/bln)
- SUNBLIX 3.51 kWp (6 Modul) — Rp 74.000.000 (tagihan ~Rp 2-2,5jt/bln)
- SUNBLIX 4.68 kWp (8 Modul) — Rp 88.600.000 (tagihan ~Rp 2,5-3,5jt/bln)
- SUNBLIX 5.85 kWp (10 Modul) — Rp 101.800.000 (tagihan ~Rp 3,5-5jt/bln)
- SUNBLIX 7.02 kWp (12 Modul) — Rp 121.600.000 (tagihan ~Rp 5-7jt/bln)
- SUNBLIX 8.19-16.38 kWp Pro & Pro+ 3-Fasa — Rp 145jt s/d Rp 310jt+

KEBIJAKAN PEMBAYARAN & SPH:
- Termin 50/40/10 (DP kontrak / material / commissioning). SPH berstatus DRAFT hingga disetujui Direksi.

SOP CUSTOMER SERVICE:
- Keluhan teknis (alarm inverter, MCB trip, wifi offline): beri arahan keselamatan singkat, catat tiket untuk Senior Engineer.

KNOWLEDGE FAQ RESMI SUNBLIX (jawab berdasarkan fakta ini):
Q: Bagaimana cara kerja sistem panel surya (PLTS Atap) di rumah atau bangunan komersial?
A: Modul surya fotovoltaik (PV) yang terpasang di atap menangkap radiasi sinar matahari dan mengonversinya menjadi energi listrik arus searah (DC). Arus DC ini dialirkan ke Smart Inverter untuk diubah menjadi arus...

Q: Apakah panel surya tetap menghasilkan listrik saat cuaca mendung atau hujan?
A: Ya, panel surya tetap memproduksi listrik saat cuaca berawan, mendung, atau hujan karena bekerja menyerap spektrum radiasi cahaya matahari (diffuse light), bukan panas suhu udara. Meskipun output daya menurun menjadi...

Q: Apa perbedaan antara sistem On-Grid, Off-Grid, dan Hybrid?
A: • On-Grid: Terhubung langsung dan sinkron dengan jaringan PLN tanpa baterai (paling ekonomis, sangat efektif memangkas tagihan listrik siang hari). • Off-Grid: Berdiri sendiri 100% menggunakan bank baterai tanpa...

Q: Bagaimana tahapan alur proyek pemasangan PLTS di SUNBLIX dari awal hingga menyala?
A: Pengerjaan proyek PLTS di SUNBLIX mencakup 6 tahapan komprehensif: 1. Studi Kelayakan & Analisis 3D Shading: Inspeksi struktur atap, pola beban kelistrikan, dan simulasi insolasi matahari. 2. Engineering Design:...

Q: Berapa persen tagihan listrik PLN yang dapat dihemat setiap bulan?
A: Penghematan rata-rata berkisar antara 40% hingga 80% dari total biaya konsumsi listrik bulanan Anda. Besaran penghematan aktual dipengaruhi oleh kapasitas sistem (kWp) yang terpasang, orientasi atap, profil...

Q: Apakah tersedia opsi pemasangan Tanpa Biaya Modal Awal (Zero Upfront Cost / Rental / Solar Leasing)?
A: Ya! Selain opsi Pembelian Langsung (Capex), SUNBLIX menyediakan skema Zero Upfront Cost (Sewa Operasional / Solar PPA / Rental) khusus untuk sektor komersial, industri, dan properti terpilih. Dalam skema ini, klien...

Q: Bagaimana mekanisme pembayaran bulanan dalam skema sewa (Zero Upfront Cost)?
A: Pembayaran sewa bulanan dihitung berdasarkan tarif per kWh dari energi bersih yang berhasil diproduksi oleh panel surya, dengan tarif yang dipatok lebih rendah daripada tarif dasar listrik (TDL) PLN. Artinya, klien...

Q: Apa yang terjadi setelah masa kontrak sewa (leasing) selesai?
A: Setelah masa sewa operasional berakhir (umumnya 10 hingga 20 tahun sesuai kesepakatan), seluruh kepemilikan aset sistem PLTS Rooftop akan dihibahkan dan dialihkan 100% menjadi milik pelanggan tanpa biaya tambahan....

Q: Bagaimana skema pembayaran untuk opsi Beli Putus (Capex)? Apakah ada fasilitas cicilan perbankan?
A: Untuk opsi Beli Putus (Capex), pembayaran dilakukan secara bertahap (termin) sesuai progres proyek (Down Payment saat kontrak, saat material tiba di lokasi, dan pelunasan setelah komisioning). Kami juga bermitra...

Q: Apakah semua jenis atap bisa dipasang panel surya?
A: Hampir semua jenis atap dapat dipasangi PLTS, antara lain atap metal/spandek/zincalume, standing seam/klip-lok, genteng keramik/beton, bitumen/aspal, hingga dak beton datar (flat roof). Kami menggunakan tipe bracket...

Q: Berapa beban tambahan pada atap dan apakah struktur bangunan perlu diperkuat?
A: Beban total sistem panel surya beserta rel mounting aluminium hanya berkisar antara 12 hingga 18 kg/m². Beban ini tergolong sangat ringan dan terdistribusi merata di atas rangka atap bangunan standar SNI. Sebelum...

Q: Apakah pemasangan panel surya dapat menyebabkan atap bocor?
A: Sama sekali tidak. Untuk atap metal standing seam/klip-lok, kami menggunakan metode non-penetration clamp (tanpa melubangi atap). Sedangkan untuk atap genteng atau spandek bersekrup, kami menggunakan L-feet bracket...

Q: Bagaimana sistem proteksi petir dan pencegahan bahaya kebakaran (Fire Safety)?
A: Sistem PLTS SUNBLIX dilengkapi sistem pengamanan berlapis standar internasional (IEC/SNI): • Surge Protection Device (SPD Tipe II) pada sisi DC dan AC untuk meredam lonjakan tegangan akibat sambaran petir. • Sistem...

Q: Apakah pemasangan PLTS Rooftop memerlukan izin resmi dari PLN dan pemerintah?
A: Ya. Setiap sistem PLTS yang tersambung secara paralel dengan jaringan PLN wajib mengantongi izin persetujuan sambungan dari PT PLN (Persero) dan Sertifikat Laik Operasi (SLO) yang terdaftar di Kementerian ESDM. Hal...

Q: Bagaimana regulasi Permen ESDM No. 2/2024 terbaru mempengaruhi pemasangan PLTS Atap?
A: Berdasarkan Permen ESDM No. 2 Tahun 2024, regulasi PLTS Atap kini semakin transparan: 1. Tidak ada lagi pembatasan kapasitas maksimal 100% dari daya tersambung PLN; kapasitas disesuaikan dengan kuota sistem...

Q: Apakah pelanggan harus mengurus perizinan sendiri ke PLN dan ESDM?
A: Tidak perlu. Tim regulasi SUNBLIX mengurus seluruh kelengkapan dokumen administratif dan teknis dari awal hingga tuntas, mulai dari pengajuan kuota sambungan PLN, pengurusan SLO melalui Lembaga Inspeksi Teknik (LIT)...

Q: Mengapa sistem On-Grid mati otomatis saat listrik PLN padam (Anti-Islanding Protection)?
A: Inverter On-Grid wajib memiliki fitur keselamatan Anti-Islanding sesuai regulasi ketenagalistrikan. Jika PLN padam karena gangguan jaringan atau perbaikan kabel di tiang luar, inverter otomatis memutus aliran listrik...

Q: Bagaimana sistem Hybrid SUNBLIX mengatasi pemadaman listrik PLN?
A: Pada sistem Hybrid SUNBLIX, inverter dilengkapi unit isolator otomatis dan penyimpanan baterai lithium LiFePO4. Saat listrik PLN padam, sistem secara instan (< 15 milidetik) berpindah ke mode mandiri (Island Mode)....

Q: Berapa lama masa pakai dan jaminan garansi sistem SUNBLIX?
A: SUNBLIX hanya menggunakan komponen kualitas Tier-1 global dengan garansi berlapis: • Modul Surya: Garansi produk 12-15 tahun dan garansi performa output linier hingga 25-30 tahun (efisiensi di atas 80% pada tahun...

Q: Bagaimana cara memantau performa harian dan efisiensi produksi listrik?
A: Setiap instalasi PLTS SUNBLIX dilengkapi modul telemetri IoT (Internet of Things) berbasis WiFi/4G. Anda dapat memantau daya sesaat (kW), akumulasi produksi harian/bulanan (kWh), penghematan rupiah, hingga grafik...

Q: Apakah panel surya membutuhkan perawatan berkala yang merepotkan?
A: Perawatan PLTS tergolong sangat minim karena tidak terdapat komponen yang bergerak. Perawatan utama hanyalah membilas permukaan kaca panel dari debu, kotoran burung, atau daun kering setiap 3 hingga 6 bulan sekali...

ALUR KERJA SURTI:
1. Jika pengguna bertanya biaya / tagihan / kapasitas, panggil tool "kalkulasi_plts".
2. Jika pengguna meminta penawaran, proposal, atau SPH, panggil tool "buat_draf_sph".
3. Jika pengguna menyetujui survei lokasi, panggil tool "jadwalkan_survei".
4. Jika pengguna mengalami kendala teknis/komplain, panggil tool "buat_tiket_layanan".

Konteks Memori Pelanggan Saat Ini:
${JSON.stringify(relevantMemories, null, 2)}`;

  // Function Declarations
  const functionDefs = [
    {
      name: 'kalkulasi_plts',
      description: 'Menghitung rekomendasi kapasitas kWp panel surya, paket resmi katalog brosur, perkiraan penghematan bulanan, dan nilai investasi berdasarkan tagihan listrik PLN bulanan.',
      parameters: {
        type: 'OBJECT',
        properties: {
          monthlyBill: { type: 'NUMBER', description: 'Estimasi rata-rata tagihan listrik PLN bulanan dalam Rupiah' },
          propertyType: { type: 'STRING', enum: ['house', 'villa', 'commercial', 'warehouse'], description: 'Kategori properti pelanggan' },
          systemType: { type: 'STRING', enum: ['hybrid', 'ongrid', 'offgrid'], description: 'Tipe sistem PLTS' },
        },
        required: ['monthlyBill'],
      },
    },
    {
      name: 'buat_draf_sph',
      description: 'Membuat Draf Surat Penawaran Harga (SPH) resmi yang terhubung ke dokumen pratinjau 4 halaman Sunblix dan masuk ke antrean persetujuan Direksi.',
      parameters: {
        type: 'OBJECT',
        properties: {
          monthlyBill: { type: 'NUMBER', description: 'Besaran tagihan listrik bulanan dalam Rupiah' },
          customerName: { type: 'STRING', description: 'Nama pelanggan jika diketahui' },
          propertyType: { type: 'STRING', description: 'Tipe properti' },
          systemType: { type: 'STRING', description: 'Tipe sistem' },
          notes: { type: 'STRING', description: 'Catatan tambahan kebutuhan pelanggan' },
        },
        required: ['monthlyBill'],
      },
    },
    {
      name: 'jadwalkan_survei',
      description: 'Mencatat jadwal permintaan survei teknis atap oleh tim engineer Sunblix.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerName: { type: 'STRING', description: 'Nama pelanggan' },
          phone: { type: 'STRING', description: 'Nomor telepon / WhatsApp' },
          notes: { type: 'STRING', description: 'Catatan lokasi atap atau preferensi hari kunjungan' },
        },
      },
    },
    {
      name: 'buat_tiket_layanan',
      description: 'Mencatat tiket keluhan pelanggan, laporan kendala teknis inverter/panel, atau permintaan purna jual ke CRM Sunblix.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerName: { type: 'STRING', description: 'Nama pelanggan' },
          phone: { type: 'STRING', description: 'Nomor telepon / WhatsApp' },
          subject: { type: 'STRING', description: 'Judul keluhan / kendala' },
          description: { type: 'STRING', description: 'Rincian kendala teknis atau masalah yang dihadapi' },
        },
        required: ['subject', 'description'],
      },
    },
  ];

  // Helper to execute detected tool
  const executeToolInternal = (fnName, fnArgs) => {
    let toolResultData = null;
    let payloadData = null;
    let quickActions = [];

    if (fnName === 'kalkulasi_plts') {
      const calc = calculateSolarSystem({
        monthlyBill: fnArgs.monthlyBill || 3500000,
        propertyType: fnArgs.propertyType || 'house',
        systemType: fnArgs.systemType || 'hybrid',
      });
      toolResultData = calc;
      payloadData = { type: 'solar_calculation', calculation: calc };
      quickActions = [
        { label: 'Buatkan Draf SPH Resmi', action: 'request_sph' },
        { label: 'Jadwalkan Survei Atap', action: 'request_survey' },
      ];
    } else if (fnName === 'buat_draf_sph') {
      const draftSph = createDraftSph({
        customerId,
        customerName: fnArgs.customerName || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan',
        monthlyBill: fnArgs.monthlyBill || 3500000,
        propertyType: fnArgs.propertyType || 'house',
        systemType: fnArgs.systemType || 'hybrid',
        notes: fnArgs.notes || 'Disusun otomatis via SURTI AI Live Model.',
      });
      toolResultData = draftSph;
      payloadData = { type: 'sph_draft', sph: draftSph };
      quickActions = [
        { label: 'Buka Pratinjau Dokumen SPH Resmi (4 Hal) ➔', action: 'view_sph', sphId: draftSph.id },
        { label: 'Jadwalkan Survei Lokasi', action: 'request_survey' },
      ];
    } else if (fnName === 'jadwalkan_survei') {
      const survey = createSurveyRequest({
        customerId,
        customerName: fnArgs.customerName || 'Bapak / Ibu Pelanggan',
        phone: fnArgs.phone || '+62 812-xxxx-xxxx',
        notes: fnArgs.notes || 'Permintaan survei teknis atap via SURTI Live.',
      });
      toolResultData = survey;
      payloadData = { type: 'survey_request', survey };
      quickActions = [
        { label: 'Buka Halaman CRM Survei', action: 'view_crm_survey' },
      ];
    } else if (fnName === 'buat_tiket_layanan') {
      const ticket = createServiceTicket({
        customerId,
        customerName: fnArgs.customerName || 'Bapak / Ibu Pelanggan',
        phone: fnArgs.phone || '',
        category: 'technical_consultation',
        priority: 'high',
        subject: fnArgs.subject || 'Laporan Kendala Teknis',
        description: fnArgs.description || 'Pelanggan melaporkan kendala teknis.',
      });
      toolResultData = ticket;
      payloadData = { type: 'service_ticket', ticket };
      quickActions = [
        { label: 'Hubungi WhatsApp Hotline CS', action: 'open_whatsapp', url: `https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20membutuhkan%20bantuan%20terkait%20tiket%20${ticket.id}` },
      ];
    }

    return { toolResultData, payloadData, quickActions };
  };

  // 1. Google Gemini Provider
  if (geminiKey) {
    const modelsToTry = [
      process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
    ];

    const contents = [
      ...conversationHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    let initialJson = null;
    let selectedModel = modelsToTry[0];

    for (const m of modelsToTry) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`;
        const res = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            tools: [{ functionDeclarations: functionDefs }],
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: 1200,
            },
          }),
        });
        const json = await res.json();
        if (res.status === 200 && json.candidates?.[0]) {
          initialJson = json;
          selectedModel = m;
          break;
        } else {
          console.warn(`[SURTI Gemini] Model ${m} returned ${res.status}:`, json.error?.message?.slice(0, 80));
        }
      } catch (err) {
        console.warn(`[SURTI Gemini] Fetch error on model ${m}:`, err.message);
      }
    }

    if (!initialJson || !initialJson.candidates?.[0]) {
      throw new Error('No valid response from live AI provider.');
    }

    const candidate = initialJson.candidates[0];
    const firstPart = candidate?.content?.parts?.[0];

    // Check if Gemini invoked a function call
    if (firstPart && firstPart.functionCall) {
      const call = firstPart.functionCall;
      const fnName = call.name;
      const fnArgs = call.args || {};

      const { toolResultData, payloadData, quickActions } = executeToolInternal(fnName, fnArgs);

      try {
        const followUpEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiKey}`;
        const followUpRes = await fetch(followUpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...contents,
              candidate.content,
              {
                role: 'function',
                parts: [
                  {
                    functionResponse: {
                      name: fnName,
                      response: { output: toolResultData },
                    },
                  },
                ],
              },
            ],
            tools: [{ functionDeclarations: functionDefs }],
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: 1200,
            },
          }),
        });

        const followUpJson = await followUpRes.json();
        const finalReply = followUpJson.candidates?.[0]?.content?.parts?.[0]?.text;

        return {
          reply: finalReply || 'Berikut rincian informasi dan rekomendasi resmi dari SUNBLIX untuk Anda.',
          mode: 'LIVE',
          toolCalls: [{ tool: fnName, params: fnArgs }],
          data: payloadData,
          quickActions,
        };
      } catch (e) {
        return {
          reply: `Permintaan Anda untuk ${fnName.replace(/_/g, ' ')} telah berhasil diproses oleh sistem SUNBLIX.`,
          mode: 'LIVE',
          toolCalls: [{ tool: fnName, params: fnArgs }],
          data: payloadData,
          quickActions,
        };
      }
    }

    const directReply = firstPart?.text;
    if (directReply) {
      return {
        reply: directReply,
        mode: 'LIVE',
        toolCalls: [],
        data: null,
        quickActions: [
          { label: 'Hitung Estimasi Daya & Biaya', action: 'calculate' },
          { label: 'Konsultasi Survei Atap', action: 'request_survey' },
          { label: 'Lihat Paket Resmi Brosur', action: 'view_packages' },
        ],
      };
    }
  }

  // 1.5 NOUS INFERENCE API (Portal subscription) — prioritas tertinggi untuk produksi.
  // OpenAI-compatible: https://inference-api.nousresearch.com/v1
  if (nousKey) {
    const baseUrl = process.env.NOUS_BASE_URL || 'https://inference-api.nousresearch.com/v1';
    const model = process.env.NOUS_MODEL || 'minimax/minimax-m3.1-flash';
    return await executeOpenAiCompatibleProvider({
      baseUrl,
      apiKey: nousKey,
      model,
      systemPrompt,
      functionDefs,
      executeToolInternal,
      customerId,
      memory,
      message,
      conversationHistory,
      providerLabel: 'LIVE (Nous Portal)',
    });
  }

  // 2. OpenAI / Compatible Provider (GPT-4o, Groq, DeepSeek, OpenRouter)
  if (openaiKey) {
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    return await executeOpenAiCompatibleProvider({
      baseUrl,
      apiKey: openaiKey,
      model,
      systemPrompt,
      functionDefs,
      executeToolInternal,
      customerId,
      memory,
      message,
      conversationHistory,
      providerLabel: 'LIVE',
    });
  }

    // Fallback path (legacy, tak terpakai jika provider di atas sudah return)
    throw new Error('No valid response from live AI provider.');
}

/**
 * ----------------------------------------------------------------------------
 * SHARED OPENAI-COMPATIBLE PROVIDER (Nous Portal / OpenAI / Groq / OpenRouter)
 * ----------------------------------------------------------------------------
 */
async function executeOpenAiCompatibleProvider({
  baseUrl,
  apiKey,
  model,
  systemPrompt,
  functionDefs,
  executeToolInternal,
  customerId,
  memory,
  message,
  conversationHistory,
  providerLabel = 'LIVE',
}) {
  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const openaiTools = functionDefs.map((fn) => ({
    type: 'function',
    function: {
      name: fn.name,
      description: fn.description,
      parameters: {
        type: 'object',
        properties: fn.parameters.properties,
        required: fn.parameters.required || [],
      },
    },
  }));

  const openAiRes = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: openaiMessages,
      tools: openaiTools,
      temperature: 0.65,
    }),
  });

  const openAiJson = await openAiRes.json();
  const choice = openAiJson.choices?.[0]?.message;

  if (choice?.tool_calls && choice.tool_calls.length > 0) {
    const toolCall = choice.tool_calls[0];
    const fnName = toolCall.function.name;
    let fnArgs = {};
    try {
      fnArgs = JSON.parse(toolCall.function.arguments || '{}');
    } catch (err) {}

    const { toolResultData, payloadData, quickActions } = executeToolInternal(fnName, fnArgs);

    const followUpRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...openaiMessages,
          choice,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResultData),
          },
        ],
        temperature: 0.65,
      }),
    });

    const followUpJson = await followUpRes.json();
    const finalReply = followUpJson.choices?.[0]?.message?.content;

    return {
      reply: finalReply || 'Berikut rincian perhitungan dan rekomendasi resmi dari SUNBLIX untuk Anda.',
      mode: providerLabel,
      toolCalls: [{ tool: fnName, params: fnArgs }],
      data: payloadData,
      quickActions,
    };
  }

  if (choice?.content) {
    return {
      reply: choice.content,
      mode: providerLabel,
      toolCalls: [],
      data: null,
      quickActions: [],
    };
  }

  throw new Error(`No valid response from ${providerLabel} provider.`);
}
