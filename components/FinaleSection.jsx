'use client';

import { useState } from 'react';

export default function FinaleSection({ onOpenQuote }) {
  const [email, setEmail] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setToastMsg(`✓ Terima kasih! ${email} telah terdaftar untuk update energi surya.`);
    setEmail('');
    setTimeout(() => {
      setToastMsg('');
    }, 5000);
  };

  return (
    <div className="finale-shell" id="finaleShell" aria-label="Brighter Tomorrow & Sunblix Footer">
      {/* TOP PANORAMA BANNER */}
      <div className="finale-panorama">
        <div className="finale-panorama-bg" />
        <div className="finale-panorama-scrim" />

        <div className="finale-panorama-content">
          <div className="finale-cta-block">
            <div className="finale-eyebrow">
              <span className="eyebrow-accent-line" />
              <span>LET&apos;S BUILD A CLEANER TOMORROW</span>
            </div>
            <h2 className="finale-main-title">
              YOUR ROOFTOP.
              <br />
              YOUR ENERGY.
              <br />
              YOUR FUTURE<span className="gold-dot">.</span>
            </h2>
            <p className="finale-desc">Let&apos;s design your solar system.</p>
            <div className="finale-cta-row">
              <button
                type="button"
                className="finale-btn-quote"
                id="btnFinaleQuote"
                onClick={onOpenQuote}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <span>Dapatkan Penawaran Resmi</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>

          {/* RIGHT PILLARS TEXT */}
          <div className="finale-pillars-side">
            <div className="pillar-line">CLEANER</div>
            <div className="pillar-line">SMARTER</div>
            <div className="pillar-line">STRONGER</div>
            <div className="pillar-line highlight-gold">INDONESIA</div>
          </div>
        </div>
      </div>

      {/* BOTTOM DARK NAVY FOOTER */}
      <footer className="sunblix-footer">
        <div className="footer-main-grid">
          <div className="footer-brand-col">
            <a href="#home" className="footer-logo-link" aria-label="SUNBLIX Home">
              <img
                src="/asset/sublixlogo.svg"
                alt="PT SUNBLIX ENERGI INDONESIA"
                className="footer-logo-img"
              />
            </a>
            <span className="footer-tagline">POWER YOUR WORLD.</span>
            <div className="footer-legal-title">PT SUNBLIX ENERGI INDONESIA</div>
            <p className="footer-brand-desc">
              Mitra Resmi Spesialis Solusi PLTS Rooftop Terpercaya di Indonesia. Berstandar internasional dengan
              garansi performa 25 tahun.
            </p>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-heading">Solutions</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#residential">Residential (Standard+ &amp; PRO)</a>
              </li>
              <li>
                <a href="#commercial">Commercial &amp; Industrial (PRO+)</a>
              </li>
              <li>
                <a href="#energy-storage">Battery Energy Storage</a>
              </li>
              <li>
                <a href="#projects">Kalkulator Hemat Listrik</a>
              </li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#solutions">Tentang SUNBLIX</a>
              </li>
              <li>
                <a href="#projects">Peta Proyek 19+ Kota</a>
              </li>
              <li>
                <a href="#why-sunblix">Keunggulan &amp; Tim Teknisi</a>
              </li>
              <li>
                <a href="#projects">Jaminan Paket Siap Pakai</a>
              </li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-heading">Kontak &amp; Kantor</h4>
            <ul className="footer-nav-list footer-contact-list">
              <li className="footer-contact-item">
                <span className="f-contact-icon">📍</span>
                <span>
                  Kawasan Rasuna Epicentrum<br />
                  Epiwalk Office Suite Lt. 5 Unit A501<br />
                  Jl. HR Rasuna Said, RT 02/RW 05<br />
                  Kel. Karet Kuningan, Kec. Setiabudi<br />
                  Jakarta Selatan, DKI Jakarta 12940<br />
                  Indonesia.
                </span>
              </li>
              <li className="footer-contact-item">
                <span className="f-contact-icon">📞</span>
                <a href="tel:+6281112345678">+62 811-1234-5678</a>
              </li>
              <li className="footer-contact-item">
                <span className="f-contact-icon">✉️</span>
                <a href="mailto:hello@sunblix.id">hello@sunblix.id</a>
              </li>
              <li className="footer-contact-item">
                <span className="f-contact-icon">💬</span>
                <a
                  href="https://wa.me/6281112345678?text=Halo%20SUNBLIX,%20saya%20ingin%20konsultasi%20pemasangan%20solar%20panel%20PLTS."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Konsultasi WhatsApp Cepat
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-subscribe-col">
            <h4 className="footer-heading">Berlangganan Info</h4>
            <p className="footer-sub-note">
              Dapatkan panduan efisiensi energi surya dan update regulasi PLTS Indonesia.
            </p>
            <form className="footer-subscribe-form" id="footerSubscribeForm" onSubmit={handleSubscribe}>
              <div className="subscribe-input-box">
                <input
                  type="email"
                  id="subscribeEmail"
                  placeholder="Masukkan email Anda"
                  required
                  aria-label="Alamat email untuk pembaruan energi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" aria-label="Langganan info">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              {toastMsg && (
                <div className="subscribe-toast" id="subscribeToast" aria-live="polite">
                  {toastMsg}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-social-links">
            <a
              href="https://instagram.com/sunblix.energy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @sunblix.energy"
              title="Instagram @sunblix.energy"
              className="social-icon-btn"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/sunblix-energy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn PT SUNBLIX ENERGI INDONESIA"
              title="LinkedIn PT SUNBLIX ENERGI INDONESIA"
              className="social-icon-btn"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@sunblixenergy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube SUNBLIX Energy"
              title="YouTube SUNBLIX Energy"
              className="social-icon-btn"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
            <a
              href="https://wa.me/6281112345678?text=Halo%20SUNBLIX,%20saya%20ingin%20konsultasi%20pemasangan%20solar%20panel%20PLTS."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Konsultasi SUNBLIX"
              title="WhatsApp Konsultasi SUNBLIX"
              className="social-icon-btn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.08 7.41 8.84 7.67C8.6 7.93 7.92 8.57 7.92 9.87C7.92 11.17 8.87 12.43 9 12.6C9.13 12.77 10.87 15.46 13.53 16.61C14.16 16.88 14.66 17.05 15.04 17.17C15.68 17.37 16.26 17.35 16.72 17.28C17.24 17.2 18.31 16.63 18.53 16C18.75 15.37 18.75 14.83 18.69 14.72C18.63 14.61 18.46 14.54 18.2 14.41C17.94 14.28 16.67 13.65 16.44 13.57C16.21 13.48 16.04 13.44 15.87 13.7C15.7 13.96 15.22 14.54 15.07 14.71C14.92 14.88 14.77 14.9 14.51 14.77C14.25 14.65 13.42 14.37 12.43 13.49C11.66 12.8 11.14 11.95 11 11.7C10.85 11.45 11 11.31 11.12 11.18C11.24 11.07 11.38 10.89 11.5 10.74C11.63 10.6 11.67 10.49 11.76 10.32C11.85 10.15 11.8 10 11.74 9.87C11.67 9.75 11.17 8.52 10.96 8.01C10.76 7.51 10.55 7.58 10.39 7.57C10.24 7.56 10.07 7.56 9.9 7.56L9.53 7.34Z" />
              </svg>
            </a>
          </div>
          <div className="footer-copyright">
            © 2026 PT SUNBLIX ENERGI INDONESIA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
