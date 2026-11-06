'use client';

export default function PrintReportButton() {
  return (
    <button type="button" className="report-print" onClick={() => window.print()}>
      Cetak / Simpan sebagai PDF
    </button>
  );
}
