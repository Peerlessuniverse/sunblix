'use client';

import { useState, useEffect } from 'react';

export default function FloatingBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down more than 250px
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    const startScrollY = window.scrollY;
    if (startScrollY <= 0) return;
    const duration = 1350;
    const startTime = performance.now();

    function scrollStep(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Luxury cubic easing
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, Math.round(startScrollY * (1 - easeT)));

      if (t < 1) {
        requestAnimationFrame(scrollStep);
      }
    }
    requestAnimationFrame(scrollStep);
  };

  return (
    <aside
      className={`floating-back-to-top ${visible ? 'is-visible' : ''}`}
      aria-label="Kembali ke Atas"
    >
      <button
        type="button"
        className="back-to-top-btn"
        onClick={handleScrollToTop}
        aria-label="Scroll kembali ke atas halaman"
        title="Kembali ke Atas"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="back-to-top-icon"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
        <span className="back-to-top-tooltip">Kembali ke Atas</span>
      </button>
    </aside>
  );
}
