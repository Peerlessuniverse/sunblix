'use client';

import Link from 'next/link';

export default function FloatingSurtiAi() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '88px',
        right: '24px',
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <Link
        href="/surti"
        aria-label="Mengobrol dengan kami langsung"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #041830 0%, #082b54 100%)',
          border: '1.5px solid #f5b742',
          padding: '10px 18px',
          borderRadius: '9999px',
          color: '#fff',
          textDecoration: 'none',
          boxShadow: '0 8px 25px rgba(245, 183, 66, 0.35)',
          backdropFilter: 'blur(12px)',
          fontWeight: 600,
          fontSize: '0.88rem',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 183, 66, 0.55)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 183, 66, 0.35)';
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px #10b981',
          }}
        />
        <span>💬 Mengobrol dengan kami langsung</span>
      </Link>
    </div>
  );
}
