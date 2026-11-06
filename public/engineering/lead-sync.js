(function attach(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SbxLeadSync = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createLeadSync() {
  const STAGE = {
    NEW_LEAD: 'Lead baru',
    QUALIFIED: 'Lead baru',
    SURVEY_SCHEDULED: 'Survey',
    SPH_PROPOSED: 'Penawaran terkirim',
    WON: 'Deal',
    LOST: 'Batal',
  };

  function normalizePhone(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
    else if (digits.startsWith('8')) digits = `62${digits}`;
    return digits;
  }

  function mapCrmLead(lead) {
    const id = String(lead?.id || lead?.rawLead?.id || '');
    const raw = lead?.rawLead || lead || {};
    const createdAt = raw.createdAt || lead.createdAt || '';
    const date = createdAt ? String(createdAt).slice(0, 10) : '';
    const bill = Number(raw.monthlyBill);
    const billLabel = Number.isFinite(bill) && bill > 0
      ? `Tagihan ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(bill)}/bulan`
      : '';
    return {
      id: `crm-${id}`,
      crmLeadId: id,
      nama: lead?.nama || raw.name || '',
      pic: '',
      kontak: raw.phone || lead?.kontak || '',
      email: raw.email || '',
      lokasi: lead?.alamat || raw.city || '',
      sumber: raw.source || '',
      status: STAGE[raw.stage] || 'Lead baru',
      tanggal: date,
      sph: '',
      proyek: billLabel,
      kwp: null,
      baterai: null,
      inverter: '',
      backup: null,
      nilai: null,
      dpp: null,
      next: '',
      catatan: raw.notes || '',
      preset: '',
      docs: [],
      monthlyBill: raw.monthlyBill ?? null,
    };
  }

  function mergeCrmLeads(existingRows, crmLeads) {
    const rows = Array.isArray(existingRows) ? existingRows.map((row) => ({ ...row })) : [];
    const leads = Array.isArray(crmLeads) ? crmLeads : [];

    for (const item of leads) {
      const incoming = mapCrmLead(item);
      if (!incoming.crmLeadId) continue;
      let index = rows.findIndex((row) => row.crmLeadId === incoming.crmLeadId || row.id === incoming.crmLeadId || row.id === incoming.id);
      if (index < 0) {
        const phone = normalizePhone(incoming.kontak);
        if (phone) index = rows.findIndex((row) => !row.crmLeadId && normalizePhone(row.kontak) === phone);
      }

      if (index < 0) {
        rows.push(incoming);
        continue;
      }

      const previous = rows[index];
      rows[index] = {
        ...previous,
        ...incoming,
        id: previous.id || incoming.id,
        // CRM is canonical for identity, contact, location, source, and stage.
        // Keep Dashboard-v2-only proposal and follow-up fields from its existing row.
        pic: previous.pic || incoming.pic,
        sph: previous.sph || incoming.sph,
        proyek: previous.proyek || incoming.proyek,
        kwp: previous.kwp ?? incoming.kwp,
        baterai: previous.baterai ?? incoming.baterai,
        inverter: previous.inverter || incoming.inverter,
        backup: previous.backup ?? incoming.backup,
        nilai: previous.nilai ?? incoming.nilai,
        dpp: previous.dpp ?? incoming.dpp,
        next: previous.next || incoming.next,
        docs: Array.isArray(previous.docs) && previous.docs.length ? previous.docs : incoming.docs,
        preset: previous.preset || incoming.preset,
      };
    }
    return rows;
  }

  return { mapCrmLead, mergeCrmLeads, normalizePhone };
});
