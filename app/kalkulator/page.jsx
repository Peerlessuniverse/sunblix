'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CalculatorForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState({ monthlyBill: '', plnPower: '', roofArea: '', phase: '1 Phase', systemType: 'hybrid' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const token = params.get('lead') || '';
  const set = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }));
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = await fetch('/api/surti/calculate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, leadToken: token }) });
      const data = await r.json();
      if (!r.ok || !data.success || !data.sphId) throw new Error(data.message || 'Kalkulasi gagal.');
      router.push(`/surti/sph/${data.sphId}`);
    } catch (err) { setError(err.message); setBusy(false); }
  }
  return <main style={{ maxWidth: 620, margin: '40px auto', padding: 24, fontFamily: 'Arial', color: '#10233b' }}>
    <h1>Kalkulator PLTS SUNBLIX</h1><p>Isi data teknis. Hasil ini simulasi awal, bukan harga final.</p>
    <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
      <label>Tagihan listrik/bulan<input required type="number" min="250000" value={form.monthlyBill} onChange={set('monthlyBill')} placeholder="1500000" /></label>
      <label>Daya PLN (VA)<input required type="number" min="450" value={form.plnPower} onChange={set('plnPower')} placeholder="2200" /></label>
      <label>Luas atap tersedia (m²)<input required type="number" min="1" value={form.roofArea} onChange={set('roofArea')} placeholder="30" /></label>
      <label>Sambungan PLN<select value={form.phase} onChange={set('phase')}><option>1 Phase</option><option>3 Phase</option></select></label>
      <label>Sistem<select value={form.systemType} onChange={set('systemType')}><option value="hybrid">Hybrid dengan baterai</option><option value="ongrid">On-Grid tanpa baterai</option></select></label>
      {error && <p style={{ color: '#b42318' }}>{error}</p>}
      <button disabled={busy} type="submit" style={{ padding: 14, background: '#0066cc', color: 'white', border: 0, borderRadius: 8 }}>{busy ? 'Menghitung…' : 'Lihat hasil rekomendasi'}</button>
    </form>
    <style jsx>{`label{display:grid;gap:6px;font-weight:600}input,select{padding:12px;border:1px solid #cbd5e1;border-radius:7px;font-size:16px}`}</style>
  </main>;
}

export default function CalculatorPage() {
  return <Suspense fallback={<main style={{ padding: 40 }}>Memuat kalkulator…</main>}><CalculatorForm /></Suspense>;
}
