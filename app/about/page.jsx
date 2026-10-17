'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import MobileDrawer from '../../components/MobileDrawer';
import QuoteModal from '../../components/QuoteModal';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import FloatingBackToTop from '../../components/FloatingBackToTop';
import './about.css';

export default function AboutPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  return (
    <div className="about-root">
      {/* NAVBAR */}
      <Navbar
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenQuote={() => setQuoteModalOpen(true)}
      />

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenQuote={() => {
          setDrawerOpen(false);
          setQuoteModalOpen(true);
        }}
      />

      {/* TOP CORPORATE IDENTITY BAR (MATCHING PDF KOP SURAT) */}
      <div className="about-top-corp-bar">
        <div className="about-top-corp-inner">
          <div className="about-corp-identity">
            <span className="about-corp-name">PT SUNBLIX ENERGI INDONESIA</span>
            <span className="about-corp-addr">
              • Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330
            </span>
          </div>
          <div className="about-corp-contacts">
            <a href="https://sunblix.id" target="_blank" rel="noopener noreferrer" className="about-corp-contact-link">
              🌐 sunblix.id
            </a>
            <a href="tel:+62217362630" className="about-corp-contact-link">
              📞 021 7362 630
            </a>
            <a href="https://wa.me/6285288581027" target="_blank" rel="noopener noreferrer" className="about-corp-contact-link">
              💬 085288581027
            </a>
            <a href="mailto:hello@sunblix.id" className="about-corp-contact-link">
              ✉️ hello@sunblix.id
            </a>
          </div>
        </div>
      </div>

      {/* HERO SECTION (PAGE 1) */}
      <header className="about-hero">
        <div className="about-hero-content">
          <div className="about-badge">
            <span>PROFIL PERUSAHAAN • COMPANY PROFILE</span>
          </div>
          <h1 className="about-title">
            Power Your <span className="highlight-gradient">World.</span>
          </h1>
          <div className="about-subtitle">Building the Future of Energy.</div>
          <p className="about-desc-lead">
            <strong>PT SUNBLIX ENERGI INDONESIA</strong> hadir sebagai pelopor transformasi energi surya terpadu di Indonesia,
            berkomitmen menghadirkan produk berkualitas tinggi, solusi rekayasa terpercaya, serta layanan profesional berstandar nasional.
          </p>
        </div>
      </header>

      {/* PAGE 1: ABOUT SUNBLIX NARRATIVE */}
      <section className="about-section" aria-label="About SUNBLIX">
        <div className="about-narrative-grid">
          <div className="about-narrative-card">
            <span className="about-narrative-eyebrow">TENTANG KAMI</span>
            <h2 className="about-narrative-title">About SUNBLIX</h2>
            <p className="about-paragraph">
              <strong>PT SUNBLIX ENERGI INDONESIA</strong> merupakan perusahaan yang berfokus pada solusi energi surya dan pengembangan produk energi untuk pasar Indonesia.
            </p>
            <p className="about-paragraph">
              SUNBLIX hadir untuk memenuhi kebutuhan energi residensial, komersial, dan industri melalui produk berkualitas, solusi yang tepat, serta layanan profesional.
            </p>
            <p className="about-paragraph">
              Dengan fokus pada pengembangan merek, perluasan distribusi, dan inovasi digital, SUNBLIX berkomitmen membangun bisnis yang kompetitif dan memperluas jangkauan pasar secara nasional.
            </p>
            <p className="about-paragraph">
              Kami terus mengembangkan portofolio produk dan kapabilitas perusahaan untuk menjawab kebutuhan pasar yang berkembang, sekaligus membangun fondasi bagi pertumbuhan SUNBLIX sebagai merek energi jangka panjang di Indonesia.
            </p>
          </div>

          <div className="about-img-frame" style={{ minHeight: '380px' }}>
            <img
              src="/asset/how_hero.jpg"
              alt="Instalasi Rooftop Surya Modern SUNBLIX"
              loading="lazy"
            />
            <div className="about-img-caption">
              ⚡ Rekayasa PLTS Atap Modern &amp; Ramah Lingkungan untuk Indonesia
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 2: OUR HISTORY */}
      <section className="about-section" aria-label="Our History">
        <div className="about-history-shell">
          <div className="about-history-grid">
            <div className="about-img-frame" style={{ minHeight: '340px' }}>
              <img
                src="/asset/product_pro_plus.jpg"
                alt="Proyek Skala Industri SUNBLIX"
                loading="lazy"
              />
              <div className="about-img-caption">
                🏭 Solusi Energi Surya Handal untuk Residensial, Komersial &amp; Industri
              </div>
            </div>

            <div className="about-history-content">
              <span className="about-narrative-eyebrow">SEJARAH KAMI</span>
              <h2>Our History</h2>
              <p className="about-paragraph">
                SUNBLIX dibangun dengan visi untuk mengembangkan merek energi yang memiliki daya saing dan jangkauan pasar nasional.
              </p>
              <p className="about-paragraph">
                Berangkat dari peluang pertumbuhan industri energi surya di Indonesia, SUNBLIX berfokus pada pengembangan pasar, penguatan jaringan distribusi, dan penyediaan solusi energi yang sesuai dengan kebutuhan pelanggan.
              </p>
              <p className="about-paragraph">
                Seiring perkembangan bisnis, SUNBLIX berkomitmen memperluas portofolio produk, memperkuat identitas merek, dan mengintegrasikan teknologi digital untuk mendukung operasional serta pengalaman pelanggan.
              </p>
              <div className="about-history-quote-box">
                <p>
                  &ldquo;Langkah ini menjadi bagian dari strategi jangka panjang SUNBLIX untuk memperluas kehadiran di pasar Indonesia dan mengembangkan bisnis energi secara berkelanjutan.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 3: VISI & MISI */}
      <section className="about-section" aria-label="Visi dan Misi">
        <div className="about-vm-header">
          <span className="about-narrative-eyebrow">ARAH &amp; TUJUAN STRATEGIS</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 850, color: '#031f45', margin: '8px 0' }}>
            Visi &amp; Misi Perusahaan
          </h2>
          <p style={{ color: '#475569', fontSize: '15px', margin: 0 }}>
            Komitmen kami dalam memandu setiap langkah operasional, pengembangan produk, dan pelayanan kepada masyarakat.
          </p>
        </div>

        {/* VISI CARD */}
        <div className="about-vision-card">
          <span className="about-vision-badge">VISI KAMI</span>
          <div className="about-vision-title">Tujuan Utama Perusahaan</div>
          <p className="about-vision-text">
            &ldquo;Menjadi merek energi terkemuka di Indonesia dengan jangkauan pasar nasional.&rdquo;
          </p>
        </div>

        {/* MISI 5 STRATEGIC PILLARS */}
        <h3 className="about-mission-title">5 Pilar Misi Strategis</h3>
        <div className="about-mission-grid">
          <div className="about-mission-card">
            <div className="about-mission-icon-wrap">🛡️</div>
            <h4>Pengembangan Merek</h4>
            <p>Membangun SUNBLIX sebagai merek energi yang kuat, kompetitif, dan dipercaya pelanggan.</p>
          </div>

          <div className="about-mission-card">
            <div className="about-mission-icon-wrap">🗺️</div>
            <h4>Ekspansi Nasional</h4>
            <p>Memperluas jangkauan pasar dan jaringan distribusi ke berbagai wilayah Indonesia.</p>
          </div>

          <div className="about-mission-card">
            <div className="about-mission-icon-wrap">⚡</div>
            <h4>Pengembangan Produk</h4>
            <p>Memperluas portofolio produk energi dan mengembangkan produk bermerek SUNBLIX sesuai kebutuhan pasar.</p>
          </div>

          <div className="about-mission-card">
            <div className="about-mission-icon-wrap">🤝</div>
            <h4>Kemitraan Strategis</h4>
            <p>Membangun hubungan jangka panjang dengan mitra bisnis untuk memperkuat kualitas, ketersediaan produk, dan daya saing.</p>
          </div>

          <div className="about-mission-card">
            <div className="about-mission-icon-wrap">💡</div>
            <h4>Inovasi Digital</h4>
            <p>Mengoptimalkan teknologi untuk meningkatkan efisiensi operasional dan kualitas pelayanan pelanggan.</p>
          </div>
        </div>
      </section>

      {/* PAGE 4: NILAI PERUSAHAAN */}
      <section className="about-section" aria-label="Nilai Perusahaan">
        <div className="about-values-shell">
          <div className="about-values-header">
            <span className="about-narrative-eyebrow">PRINSIP &amp; BUDAYA</span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 850, color: '#031f45', margin: '8px 0 12px' }}>
              Nilai Perusahaan
            </h2>
            <p style={{ color: '#475569', fontSize: '15px', margin: 0 }}>
              Empat fondasi nilai utama yang menjadi pedoman tim SUNBLIX dalam menjaga kepercayaan dan keunggulan.
            </p>
          </div>

          <div className="about-values-grid">
            <div className="about-value-box">
              <div className="about-value-top">
                <div className="about-value-icon">🛡️</div>
                <h4>Integritas</h4>
              </div>
              <p>Menjunjung tinggi kejujuran, transparansi, dan tanggung jawab.</p>
            </div>

            <div className="about-value-box">
              <div className="about-value-top">
                <div className="about-value-icon">🎖️</div>
                <h4>Kualitas</h4>
              </div>
              <p>Mengutamakan mutu produk dan standar pelayanan.</p>
            </div>

            <div className="about-value-box">
              <div className="about-value-top">
                <div className="about-value-icon">💡</div>
                <h4>Inovasi</h4>
              </div>
              <p>Mengembangkan solusi yang relevan dengan kebutuhan pasar.</p>
            </div>

            <div className="about-value-box">
              <div className="about-value-top">
                <div className="about-value-icon">📈</div>
                <h4>Pertumbuhan</h4>
              </div>
              <p>Membangun bisnis yang kompetitif dan berkelanjutan.</p>
            </div>
          </div>

          {/* PAGE 4: CLOSING BANNER */}
          <div className="about-closing-card">
            <h3 className="about-closing-tag">Power Your World.</h3>
            <p className="about-closing-text">
              Kami membangun SUNBLIX dengan fokus pada kualitas, kepercayaan, dan pengembangan merek untuk menjawab kebutuhan energi Indonesia.
            </p>
            <div className="about-closing-actions">
              <button
                type="button"
                className="btn-about-quote"
                onClick={() => setQuoteModalOpen(true)}
              >
                <span>Minta Penawaran Resmi →</span>
              </button>
              <a
                href="https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20tertarik%20dengan%20solusi%20energi%20surya%20dan%20ingin%20berkonsultasi."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-about-wa"
              >
                <span>💬 Konsultasi via WhatsApp</span>
              </a>
              <Link
                href="/partnership"
                style={{
                  padding: '15px 26px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.25)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Jaringan Kemitraan ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="about-footer">
        <div className="about-footer-inner">
          <img src="/asset/logo.png" alt="SUNBLIX Logo" className="about-footer-logo" />
          <p className="about-footer-text">
            <strong>PT SUNBLIX ENERGI INDONESIA</strong><br />
            Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330<br />
            Telp: 021 7362 630 • WhatsApp: +62 852-8858-1027 • Email: hello@sunblix.id
          </p>
          <div className="about-footer-links">
            <Link href="/">Beranda</Link>
            <Link href="/about">Tentang Kami</Link>
            <Link href="/faq">F.A.Q</Link>
            <Link href="/career">Karir</Link>
            <Link href="/partnership">Kemitraan</Link>
            <Link href="/brosur">Brosur SPH</Link>
          </div>
          <div className="about-footer-copy">
            &copy; {new Date().getFullYear()} PT SUNBLIX ENERGI INDONESIA. All rights reserved.
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION CONTROLS */}
      <FloatingWhatsApp />
      <FloatingBackToTop />

      {/* LIGHT MODE QUOTE MODAL */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
    </div>
  );
}
