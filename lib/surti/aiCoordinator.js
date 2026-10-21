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

  // Check if live AI provider is configured
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey && isLiveMode()) {
    try {
      return await executeLiveAiProvider({
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

  // Run Deterministic Demo Mode Engine
  return executeDeterministicDemoEngine({
    message: trimmed,
    conversationHistory,
    customerId,
    memory,
    customerData,
  });
}

function isLiveMode() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY);
  return hasKey && process.env.SURTI_MODE !== 'demo';
}

/**
 * ----------------------------------------------------------------------------
 * DETERMINISTIC DEMO MODE ENGINE (Zero-credentials out of the box)
 * ----------------------------------------------------------------------------
 */
function executeDeterministicDemoEngine({ message, conversationHistory, customerId, memory, customerData }) {
  const lower = message.toLowerCase();
  const toolCalls = [];
  let replyText = '';
  let payloadData = null;

  // Extract Bill amounts (e.g., "tagihan 3 juta", "3.500.000", "5jt", "2500000")
  let detectedBill = null;
  const billJtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  if (billJtMatch) {
    detectedBill = parseFloat(billJtMatch[1].replace(',', '.')) * 1000000;
  } else {
    const rawNumberMatch = lower.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3}){1,3}|\d{6,8})/);
    if (rawNumberMatch) {
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
  else if (lower.includes('rumah') || lower.includes('residensial')) detectedProperty = 'house';

  if (detectedProperty) {
    updateSemanticFact(customerId, 'propertyType', detectedProperty, true);
    memory.semanticMemory.propertyType = detectedProperty;
  }

  // Extract System Type
  let detectedSystem = null;
  if (lower.includes('ongrid') || lower.includes('on-grid') || lower.includes('tanpa baterai')) detectedSystem = 'ongrid';
  else if (lower.includes('offgrid') || lower.includes('off-grid') || lower.includes('mandiri')) detectedSystem = 'offgrid';
  else if (lower.includes('hybrid') || lower.includes('baterai') || lower.includes('cadangan') || lower.includes('mati lampu')) detectedSystem = 'hybrid';

  if (detectedSystem) {
    updateSemanticFact(customerId, 'preferredSystemType', detectedSystem, true);
    memory.semanticMemory.preferredSystemType = detectedSystem;
  }

  // Extract PLN Power (e.g., "2200 VA", "3500 watt", "5500", "1300")
  let detectedPower = null;
  const powerMatch = lower.match(/(\d{1,2}(?:\.\d{3})?)\s*(?:va|watt|w\b)/) || lower.match(/\b(1300|2200|3500|4400|5500|6600|7700|11000)\b/);
  if (powerMatch) {
    const rawP = powerMatch[1].replace('.', '');
    detectedPower = `${Number(rawP).toLocaleString('id-ID')} VA`;
    updateSemanticFact(customerId, 'plnPower', detectedPower, true);
    memory.semanticMemory.plnPower = detectedPower;
  }

  // Conversational step-by-step correction: Bill response
  if (detectedBill && (memory.workingMemory?.correctionStep === 'ask_bill' || lower.includes('tagihan') || lower.includes('sebenarnya') || lower.includes('per bulan'))) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    updateWorkingMemory(customerId, { correctionStep: 'ask_power' });

    replyText = `Baik Bapak/Ibu ${custName}, kisaran tagihan listrik telah saya perbarui menjadi **${formatRupiah(detectedBill)} / bulan**.\n\n` +
      `Selanjutnya, boleh dibantu berapa **daya listrik PLN (VA)** yang terpasang di properti Anda saat ini? (Contoh: 1.300 VA, 2.200 VA, 3.500 VA, 5.500 VA, atau lainnya?)`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: { type: 'data_updated', field: 'monthlyBill', value: detectedBill },
      quickActions: [],
    };
  }

  // Conversational step-by-step correction: Power response
  if (detectedPower && (memory.workingMemory?.correctionStep === 'ask_power' || lower.includes('daya') || lower.includes('va'))) {
    const custName = customerData.name || memory.semanticMemory.customerName || 'Bapak / Ibu Pelanggan';
    const custCity = customerData.city || 'lokasi Anda';
    const custPhone = customerData.whatsapp || customerData.phone || 'kontak Anda';

    updateWorkingMemory(customerId, { correctionStep: 'confirm_all' });

    replyText = `Baik Bapak/Ibu ${custName}, daya listrik PLN telah saya catat: **${detectedPower}**.\n\n` +
      `Apakah detail lainnya seperti lokasi kota (**${custCity}**) atau nomor kontak (**${custPhone}**) sudah sesuai, atau ada detail lain yang masih perlu diperbaiki?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [],
      data: { type: 'data_updated', field: 'plnPower', value: detectedPower },
      quickActions: [],
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

  // Intent 6: Knowledge Base Search (Garansi, Baterai, Inverter, Regulasi, Termin)
  const kbResults = searchKnowledge(lower);
  if (kbResults.length > 0) {
    const topArticle = kbResults[0];
    replyText = `Mengenai **${topArticle.title}**:\n\n${topArticle.summary}\n\n` +
      `Perlu diketahui bahwa seluruh komponen SUNBLIX menggunakan spesifikasi resmi bersertifikat Tier-1 (Astronergy & Deye) dengan garansi kinerja hingga 25 tahun.\n\n` +
      `Apakah ada hal lain terkait spesifikasi teknis atau perencanaan pemasangan yang ingin Anda ketahui?`;

    return {
      reply: replyText,
      mode: 'DEMO',
      toolCalls: [{ tool: 'search_knowledge', params: { query: lower } }],
      data: { type: 'knowledge_article', article: topArticle },
      quickActions: [
        { label: 'Hitung Kebutuhan PLTS Saya', action: 'calculate' },
        { label: 'Pelajari Paket Hybrid', action: 'view_pro_hybrid' },
      ],
    };
  }

  // Default Fallback
  replyText = `Terima kasih atas informasinya. Saya siap membantu Anda menganalisis kebutuhan energi surya yang paling hemat dan optimal untuk lokasi Anda.\n\n` +
    `Untuk memberikan rekomendasi kapasitas kWp dan estimasi nilai investasi yang tepat, bolehkah Anda berbagi:\n` +
    `1. Berapa kisaran tagihan listrik PLN Anda per bulan (misal: Rp 2,5 Juta)?\n` +
    `2. Di mana lokasi rencana pemasangan (Kota / Wilayah)?\n` +
    `3. Apakah Anda lebih tertarik dengan sistem **Hybrid** (dengan baterai cadangan saat mati lampu) atau **On-Grid** (hanya siang hari)?`;

  return {
    reply: replyText,
    mode: 'DEMO',
    toolCalls: [],
    data: null,
    quickActions: [
      { label: 'Rumah Tinggal (Tagihan ~Rp 3 Juta)', action: 'quick_house_3jt' },
      { label: 'Ruko / Kantor Bisnis', action: 'quick_commercial' },
      { label: 'Lihat Paket & Harga', action: 'view_packages' },
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
  const openaiKey = process.env.OPENAI_API_KEY;

  const relevantMemories = retrieveRelevantMemories(customerId);

  const systemPrompt = `Anda adalah SURTI (SUNBLIX Utility Resource Technical Intelligence), konsultan cerdas tenaga surya (Solar PV Consultant) resmi PT SUNBLIX ENERGI INDONESIA.
Tagline Brand: POWER YOUR WORLD.
Gaya Komunikasi: Hangat, ramah, profesional, cerdas, solutif, dan luwes seperti konsultan ahli manusia. Gunakan Bahasa Indonesia yang natural dan berwibawa. Sapa pelanggan dengan "Anda", sebut diri Anda "Saya", dan PT SUNBLIX ENERGI INDONESIA sebagai "Kami".

Katalog Resmi SUNBLIX 2026:
- Paket STANDARD+ (1-Phase, Inverter Deye 6 kW, Baterai 5.12 kWh):
  * SUNBLIX 2.34 (4 Modul LONGI 585 Wp) — Rp 63.500.000
  * SUNBLIX 3.51 (6 Modul LONGI 585 Wp) — Rp 74.000.000
  * SUNBLIX 4.68 (8 Modul LONGI 585 Wp) — Rp 88.600.000
  * SUNBLIX 5.85 (10 Modul LONGI 585 Wp) — Rp 101.800.000
  * SUNBLIX 7.02 (12 Modul LONGI 585 Wp) — Rp 121.600.000
- Paket PRO & PRO+ (Inverter Deye 8–15 kW, Baterai 10.24–15.36 kWh):
  * SUNBLIX 8.19 (14 Modul) — Rp 145.400.000
  * SUNBLIX 9.36 s/d 16.38 kWp (skala 3-Fasa industri s/d Rp 310.600.000)

Aturan Penting:
1. Jawab pertanyaan teknis, konsultasi biaya, edukasi on-grid vs hybrid, garansi komponen (Inverter 5 thn, Baterai 5 thn, Panel 12 thn fisik & 25-30 thn performa) secara luwes, tidak kaku, dan mudah dipahami.
2. Gunakan Tool/Function yang tersedia ketika pelanggan menyebutkan tagihan listrik atau ingin dibuatkan penawaran/SPH resmi.
3. Seluruh SPH yang Anda buat berstatus DRAFT dan memerlukan persetujuan Direksi di DashboardOS sebelum diterbitkan resmi.

Konteks Memori Pelanggan Saat Ini:
${JSON.stringify(relevantMemories, null, 2)}`;

  // Function Declarations for Gemini
  const tools = [
    {
      functionDeclarations: [
        {
          name: 'kalkulasi_plts',
          description: 'Menghitung rekomendasi kapasitas kWp panel surya, paket resmi katalog brosur, perkiraan penghematan, dan nilai investasi berdasarkan tagihan listrik PLN bulanan.',
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
              notes: { type: 'STRING', description: 'Catatan tambahan pelanggan' },
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
              notes: { type: 'STRING', description: 'Catatan lokasi atap' },
            },
          },
        },
      ],
    },
  ];

  if (geminiKey) {
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

    const contents = [
      ...conversationHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const initialRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        tools,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    const initialJson = await initialRes.json();
    const candidate = initialJson.candidates?.[0];
    const firstPart = candidate?.content?.parts?.[0];

    // Check if Gemini invoked a function call
    if (firstPart && firstPart.functionCall) {
      const call = firstPart.functionCall;
      const fnName = call.name;
      const fnArgs = call.args || {};

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
          notes: fnArgs.notes || 'Permintaan survei teknis atap.',
        });
        toolResultData = survey;
        payloadData = { type: 'survey_request', survey };
      }

      // Send function response back to Gemini to generate natural explanation
      const followUpRes = await fetch(geminiEndpoint, {
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
          tools,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      const followUpJson = await followUpRes.json();
      const finalReply = followUpJson.candidates?.[0]?.content?.parts?.[0]?.text;

      return {
        reply: finalReply || 'Berikut rincian perhitungan dan penawaran resmi dari SUNBLIX untuk Anda.',
        mode: 'LIVE',
        toolCalls: [{ tool: fnName, params: fnArgs }],
        data: payloadData,
        quickActions,
      };
    }

    // Direct conversational response (No tool call)
    const directReply = firstPart?.text;
    if (directReply) {
      return {
        reply: directReply,
        mode: 'LIVE',
        toolCalls: [],
        data: null,
        quickActions: [
          { label: 'Hitung Estimasi Daya & Biaya', action: 'hitung_estimasi' },
          { label: 'Lihat Paket Resmi Brosur', action: 'lihat_paket' },
        ],
      };
    }
  }

  throw new Error('No valid response from live AI provider.');
}
