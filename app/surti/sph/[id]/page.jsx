'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const rupiah = (n) => `Rp ${Math.round(Number(n || 0)).toLocaleString('id-ID')}`;

export default function SphDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sph, setSph] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/surti/sph?id=${id}`).then((r) => r.json()).then((d) => setSph(d.success ? d.sph : null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="result-page"><p>Memuat simulasi…</p></main>;
  if (!sph) return <main className="result-page"><h1>Simulasi tidak ditemukan</h1><Link href="/kalkulator">Buka kalkulator</Link></main>;

  const packages = sph.comparisonPackages || [];
  const phone = (sph.customer?.phone || '').replace(/\D/g, '');
  const waText = `Halo SUNBLIX, saya ingin menindaklanjuti hasil kalkulator. Nama: ${sph.customer?.name || ''}. Paket yang ingin saya bahas: ${sph.packageName || ''}.`;
  const waHref = `https://wa.me/${phone || '6285288581027'}?text=${encodeURIComponent(waText)}`;

  return <main className="result-page">
    <section className="result-card">
      <p className="eyebrow">SIMULASI REKOMENDASI SUNBLIX</p>
      <h1>Perbandingan paket untuk kondisi Anda</h1>
      <p className="muted">Hasil ini adalah estimasi awal. Harga dan kapasitas final ditentukan setelah verifikasi lokasi.</p>
      <div className="facts"><b>Tagihan</b><span>{rupiah(sph.technicalSpecs?.monthlyBill)}/bulan</span><b>Daya PLN</b><span>{sph.plnPower || 'Belum diisi'} VA</span><b>Luas atap</b><span>{sph.customRoofArea || 'Belum diisi'} m²</span></div>
      <h2>Paket yang dibandingkan</h2>
      <div className="packages">{packages.map((item) => <article className={`package ${item.packageId === sph.packageId ? 'recommended' : ''}`} key={item.packageId}>
        {item.packageId === sph.packageId && <strong className="badge">REKOMENDASI AWAL</strong>}
        <h3>{item.packageName}</h3><p className="category">{item.category} · {item.kwp} kWp</p>
        <dl><dt>Estimasi hemat</dt><dd>{rupiah(item.estimatedMonthlySavings)}/bulan ({item.savingsPercentage}%)</dd><dt>Kisaran harga awal</dt><dd>{rupiah(item.initialPrice)}</dd><dt>Kesesuaian atap</dt><dd>{item.fitLabel}</dd><dt>Daya PLN</dt><dd>{item.plnFitLabel}</dd><dt>Spesifikasi</dt><dd>{item.panelCount} modul · {item.inverterKw} kW · baterai {item.batteryKwh} kWh</dd></dl>
      </article>)}</div>
      <p className="note">Biaya survei, jika ada, bergantung pada lokasi pemasangan. Tim SUNBLIX akan menjelaskannya saat tindak lanjut. Simulasi ini bukan penawaran final.</p>
      <div className="actions"><button onClick={() => router.push('/kalkulator')}>Ubah Kalkulator</button><a href={waHref} target="_blank" rel="noreferrer">Hubungi via WhatsApp</a></div>
    </section>
    <style jsx>{`.result-page{min-height:100vh;background:#f4f8fc;padding:28px 16px;font-family:Arial;color:#10233b}.result-card{max-width:960px;margin:auto;background:white;border-radius:18px;padding:28px;box-shadow:0 8px 30px #10233b16}.eyebrow{color:#0066cc;font-size:12px;font-weight:700;letter-spacing:.08em}.muted,.note{color:#5b6b7d;line-height:1.5}.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#eef6ff;padding:16px;border-radius:10px;margin:20px 0 28px}.facts span{font-weight:700}.packages{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.package{border:1px solid #d7e0ea;border-radius:12px;padding:18px;position:relative}.package.recommended{border:2px solid #0066cc}.badge{font-size:10px;color:#0066cc}.package h3{margin:8px 0 4px}.category{margin:0 0 14px;color:#0066cc}.package dl{margin:0}.package dt{font-size:12px;color:#667085;margin-top:10px}.package dd{margin:3px 0;font-weight:700}.note{margin:24px 0}.actions{display:flex;gap:12px;flex-wrap:wrap}.actions button,.actions a{border:0;border-radius:8px;padding:13px 18px;font-weight:700;text-decoration:none;cursor:pointer}.actions button{background:#e7f0fa;color:#0054a6}.actions a{background:#168c4b;color:white}@media(max-width:640px){.facts{grid-template-columns:1fr 1fr}.result-card{padding:20px}}`}</style>
  </main>;
}
