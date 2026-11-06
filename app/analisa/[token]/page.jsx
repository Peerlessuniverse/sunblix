import { notFound } from 'next/navigation';
import { readAnalysisReportToken } from '../../../lib/engineering/analysisReportToken.js';
import PrintReportButton from './PrintReportButton.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analisis PLTS SUNBLIX', robots: { index: false, follow: false } };

export default async function PublicAnalysisPage({ params }) {
  const { token } = await params;
  const report = readAnalysisReportToken(token);
  if (!report) notFound();

  const { customerName, city, createdAt, summary } = report;
  const items = [
    ['Kapasitas sistem', summary.systemCapacity],
    ['Inverter', summary.inverter],
    ['Baterai', summary.battery],
    ['Perkiraan produksi harian', summary.dailyProduction],
    ['Perkiraan cakupan kebutuhan', summary.coverage],
    ['Perkiraan penghematan bulanan', summary.monthlySaving],
    ['Perkiraan penghematan tahunan', summary.annualSaving],
    ['Perkiraan investasi', summary.estimatedInvestment],
    ['Perkiraan balik modal', summary.payback],
  ];

  return (
    <main className="report-shell">
      <article className="report-card">
        <header className="report-header">
          <div className="report-brand">SUNBLIX <span>ANALISIS PLTS</span></div>
          <p className="report-kicker">SIMULASI AWAL PROYEK</p>
          <h1>Rekomendasi Sistem PLTS</h1>
          <p className="report-customer">{customerName} · {city}</p>
          {createdAt ? <p className="report-date">Dibuat {new Date(createdAt).toLocaleDateString('id-ID')}</p> : null}
        </header>

        <section className="report-summary" aria-label="Ringkasan rekomendasi">
          {items.map(([label, value]) => (
            <div className="report-item" key={label}>
              <span>{label}</span><strong>{value || '—'}</strong>
            </div>
          ))}
        </section>

        <p className="report-disclaimer">
          Hasil ini merupakan simulasi awal berdasarkan data yang diberikan. Kapasitas, penghematan,
          kebutuhan baterai, dan harga final harus diverifikasi melalui survei lokasi dan tim engineering SUNBLIX.
        </p>
        <footer className="report-footer">
          <span>PT SUNBLIX ENERGI INDONESIA</span>
          <PrintReportButton />
        </footer>
      </article>
      <style>{`
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body { margin:0; background:#eef3f8; color:#10243e; font-family:Arial,sans-serif; }
        .report-shell { min-height:100vh; padding:48px 18px; }
        .report-card { max-width:850px; margin:auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px #10243e18; }
        .report-header { padding:42px 48px 34px; background:linear-gradient(130deg,#061c3d,#0c4a7b); color:white; }
        .report-brand { font-weight:900; letter-spacing:.12em; font-size:20px; }
        .report-brand span { margin-left:14px; color:#9ed9ff; font-size:11px; letter-spacing:.16em; }
        .report-kicker { margin:38px 0 8px; color:#a8dfff; font-size:11px; font-weight:bold; letter-spacing:.18em; }
        h1 { margin:0; font-size:clamp(26px,5vw,38px); }
        .report-customer { margin:12px 0 0; font-size:16px; }
        .report-date { margin:8px 0 0; font-size:12px; color:#c5d8e9; }
        .report-summary { padding:28px 48px; display:grid; grid-template-columns:1fr 1fr; gap:0 28px; }
        .report-item { padding:17px 0; border-bottom:1px solid #e7edf3; display:flex; flex-direction:column; gap:7px; }
        .report-item span { color:#60748a; font-size:12px; }
        .report-item strong { font-size:16px; color:#102e50; }
        .report-disclaimer { margin:0 48px 28px; padding:16px 18px; background:#f1f7fc; border-left:3px solid #1785c1; color:#51677d; font-size:13px; line-height:1.65; }
        .report-footer { padding:20px 48px 32px; display:flex; align-items:center; justify-content:space-between; gap:16px; color:#688098; font-size:11px; font-weight:bold; }
        .report-print { border:0; border-radius:8px; background:#0878b5; color:#fff; padding:12px 18px; font-weight:bold; cursor:pointer; }
        @media(max-width:600px) { .report-shell{padding:16px 10px}.report-header{padding:28px 24px}.report-summary{padding:16px 24px;grid-template-columns:1fr}.report-disclaimer{margin:0 24px 18px}.report-footer{padding:18px 24px 24px;align-items:flex-start;flex-direction:column} }
        @media print { body{background:white}.report-shell{padding:0}.report-card{box-shadow:none;max-width:none;border-radius:0}.report-print{display:none}.report-header{-webkit-print-color-adjust:exact;print-color-adjust:exact} }
      `}</style>
    </main>
  );
}
