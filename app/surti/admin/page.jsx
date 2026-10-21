'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SurtiAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Otomatis arahkan ke Sunblix DashboardOS - SURTI Intelligence View
    const timer = setTimeout(() => {
      router.push('/DashboardOs?nav=surti-intelligence');
    }, 1200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#070b14',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '520px',
        padding: '36px',
        background: '#0d1527',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '42px', marginBottom: '16px' }}>⚡</div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#38bdf8' }}>
          Portal Admin Dipindahkan ke DashboardOS
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
          Seluruh manajemen database pelanggan, antrean persetujuan SPH, dan jadwal survei dari SURTI kini telah terintegrasi terpusat di dalam <strong>Sunblix DashboardOS</strong>.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            href="/DashboardOs?nav=surti-intelligence"
            style={{
              padding: '10px 20px',
              background: '#003b7a',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13.5px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 59, 122, 0.4)'
            }}
          >
            Buka SURTI Intelligence di DashboardOS →
          </Link>
          <Link
            href="/surti"
            style={{
              padding: '10px 18px',
              background: 'transparent',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '13.5px',
              textDecoration: 'none'
            }}
          >
            Ruang Chat Pelanggan
          </Link>
        </div>
      </div>
    </div>
  );
}
