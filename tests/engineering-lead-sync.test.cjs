const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeCrmLeads, normalizePhone } = require('../public/engineering/lead-sync.js');

test('maps CRM leads to stable engineering pipeline records', () => {
  const rows = mergeCrmLeads([], [{
    id: 'crm-uuid-1', name: 'Leni', phone: '6281323590590', email: 'leni@example.test',
    city: 'Tasikmalaya', source: 'Microsite Form Web', stage: 'NEW_LEAD',
    createdAt: '2026-11-05T17:43:00Z', monthlyBill: 900000, notes: 'Atap 30 m²',
  }]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].crmLeadId, 'crm-uuid-1');
  assert.equal(rows[0].nama, 'Leni');
  assert.equal(rows[0].kontak, '6281323590590');
  assert.equal(rows[0].status, 'Lead baru');
  assert.equal(rows[0].proyek, 'Tagihan Rp 900.000/bulan');
  assert.equal(rows[0].nilai, null);
});

test('merges CRM data into an existing engineering row without duplicating by phone', () => {
  const local = [{ id: 'old-row', nama: 'Robbin', kontak: '+62 812-3469-6000', status: 'Survey', proyek: 'Catatan proyek', nilai: 42 }];
  const rows = mergeCrmLeads(local, [{ id: 'crm-2', name: 'Robbin', phone: '6281234696000', city: 'Jakarta Selatan', stage: 'NEW_LEAD' }]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].crmLeadId, 'crm-2');
  assert.equal(rows[0].proyek, 'Catatan proyek');
  assert.equal(rows[0].nilai, 42);
});

test('is idempotent across repeated CRM refreshes', () => {
  const crm = [{ id: 'crm-3', name: 'Susanto', phone: '628159943181', stage: 'SPH_PROPOSED' }];
  const once = mergeCrmLeads([], crm);
  const twice = mergeCrmLeads(once, crm);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].status, 'Penawaran terkirim');
});

test('normalizes Indonesian phone formats for duplicate matching', () => {
  assert.equal(normalizePhone('+62 815-1010-8980'), '6281510108980');
  assert.equal(normalizePhone('081510108980'), '6281510108980');
});
