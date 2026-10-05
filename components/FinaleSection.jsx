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
              Mitra Spesialis Solusi PLTS Rooftop Terpercaya di Indonesia. Berstandar internasional dengan
              instalasi berkualitas dan teknologi monitoring pintar.
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
                <a href="tel:+6285288581027">+62 852-8858-1027</a>
              </li>
              <li className="footer-contact-item">
                <span className="f-contact-icon">✉️</span>
                <a href="mailto:hello@sunblix.id">hello@sunblix.id</a>
              </li>
              <li className="footer-contact-item">
                <span className="f-contact-icon">💬</span>
                <a
                  href="https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20ingin%20konsultasi%20pemasangan%20solar%20panel%20PLTS."
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
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61594676079764"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Sunblix Indonesia"
              title="Facebook Sunblix Indonesia"
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
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/sunblix.id/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @sunblix.id"
              title="Instagram @sunblix.id"
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
            {/* Threads */}
            <a
              href="https://www.threads.com/@sunblix.id"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads @sunblix.id"
              title="Threads @sunblix.id"
              className="social-icon-btn"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@sunblix.id"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok @sunblix.id"
              title="TikTok @sunblix.id"
              className="social-icon-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@SunblixIndonesia"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Sunblix Indonesia"
              title="YouTube Sunblix Indonesia"
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
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
              </svg>
            </a>
            {/* Telegram */}
            <a
              href="https://t.me/Sunblixbot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram @Sunblixbot"
              title="Telegram @Sunblixbot"
              className="social-icon-btn"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href="https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20ingin%20konsultasi%20pemasangan%20solar%20panel%20PLTS."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Business SUNBLIX"
              title="WhatsApp Business SUNBLIX"
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
