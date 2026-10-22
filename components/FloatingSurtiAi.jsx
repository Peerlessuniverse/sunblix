'use client';

import Link from 'next/link';

export default function FloatingSurtiAi() {
  const waUrl =
    'https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20ingin%20konsultasi%20langsung%20mengenai%20pemasangan%20panel%20surya%20PLTS.';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '88px',
        right: '24px',
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Primary SURTI AI Button */}
      <Link
        href="/surti"
        aria-label="Konsultasi Tenaga Surya dengan SURTI AI"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #0b192c 0%, #1e3a8a 50%, #d97706 100%)',
          border: '1.5px solid #f5b742',
          padding: '10px 18px',
          borderRadius: '9999px',
          color: '#fff',
          textDecoration: 'none',
          boxShadow: '0 8px 25px rgba(245, 183, 66, 0.4)',
          backdropFilter: 'blur(12px)',
          fontWeight: 600,
          fontSize: '0.88rem',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 183, 66, 0.65)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 183, 66, 0.4)';
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px #10b981',
            animation: 'pulse 2s infinite',
          }}
        />
        <span>⚡ Tanya SURTI AI (Konsultan PLTS)</span>
      </Link>

      {/* Direct WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Konsultasi via WhatsApp"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: '#25D366',
          color: '#fff',
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
          fontSize: '1.2rem',
          transition: 'all 0.25s ease',
        }}
        title="Hubungi WhatsApp Resmi"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        💬
      </a>
    </div>
  );
}
