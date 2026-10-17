'use client';

import { useEffect, useRef, useState } from 'react';

export default function AboutHorizontalScrolly({ onOpenQuote }) {
  const shellRef = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const progressFillRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const shell = shellRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const progressFill = progressFillRef.current;
    if (!shell || !track || !viewport) return;

    let ticking = false;

    const handleScroll = () => {
      if (window.innerWidth <= 900) return; // on mobile native scroll-snap handles it
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const rect = shell.getBoundingClientRect();
          const winHeight = window.innerHeight;
          const scrollDistance = shell.offsetHeight - winHeight;

          if (scrollDistance <= 0) return;

          // Progress from 0 (when top of shell hits top of window) to 1 (when bottom reaches bottom)
          const scrolled = -rect.top;
          const rawProgress = scrolled / scrollDistance;
          const progress = Math.min(1, Math.max(0, rawProgress));

          const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
          track.style.transform = `translateX(-${progress * maxTranslate}px)`;

          if (progressFill) {
            progressFill.style.width = `${progress * 100}%`;
          }

          // Compute active step (0 to 3)
          const step = Math.min(3, Math.max(0, Math.round(progress * 3)));
          setActiveStep(step);
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    // Mobile scroll-snap listener
    const handleMobileScroll = () => {
      if (window.innerWidth > 900) return;
      const scrollLeft = viewport.scrollLeft;
      const cardWidth = viewport.clientWidth * 0.86;
      const step = Math.min(3, Math.max(0, Math.round(scrollLeft / cardWidth)));
      setActiveStep(step);
      if (progressFill) {
        progressFill.style.width = `${((step + 1) / 4) * 100}%`;
      }
    };
    viewport.addEventListener('scroll', handleMobileScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      viewport.removeEventListener('scroll', handleMobileScroll);
    };
  }, []);

  const goToStep = (index) => {
    setActiveStep(index);
    if (window.innerWidth <= 900) {
      if (viewportRef.current) {
        const cardWidth = viewportRef.current.clientWidth * 0.86;
        viewportRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      }
    } else {
      if (shellRef.current) {
        const shell = shellRef.current;
        const rect = shell.getBoundingClientRect();
        const currentScrollY = window.scrollY;
        const shellTop = currentScrollY + rect.top;
        const scrollDistance = shell.offsetHeight - window.innerHeight;
        const targetScrollY = shellTop + (index / 3) * scrollDistance;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) goToStep(activeStep - 1);
  };

  const handleNext = () => {
    if (activeStep < 3) goToStep(activeStep + 1);
  };

  return (
    <section className="about-scroll-shell section-reveal" id="about" ref={shellRef} aria-label="About SUNBLIX">
      <div className="about-sticky-box">
        {/* TOP BAR */}
        <div className="about-top-bar">
          <div className="about-header-meta">
            <span className="about-pill-eyebrow">ABOUT SUNBLIX</span>
            <h2 className="about-headline">
              Mengenal Lebih Dekat <span>PT SUNBLIX ENERGI INDONESIA</span>
            </h2>
          </div>

          <div className="about-nav-controls">
            <div className="about-steps-indicator" aria-label="Slide Indicator">
              {[
                { label: 'About Us', num: '01' },
                { label: 'Visi & Misi', num: '02' },
                { label: 'Nilai Perusahaan', num: '03' },
                { label: 'Profil & Kontak', num: '04' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`about-step-dot ${activeStep === idx ? 'is-active' : ''}`}
                  onClick={() => goToStep(idx)}
                  aria-label={`Lihat bagian ${item.label}`}
                >
                  <span className="step-num">{item.num}</span>
                  <span className="step-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="about-arrow-btns">
              <button
                type="button"
                className="about-arrow-btn"
                onClick={handlePrev}
                disabled={activeStep === 0}
                aria-label="Slide sebelumnya"
              >
                ←
              </button>
              <button
                type="button"
                className="about-arrow-btn"
                onClick={handleNext}
                disabled={activeStep === 3}
                aria-label="Slide selanjutnya"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* HORIZONTAL TRACK VIEWPORT */}
        <div className="about-track-viewport" ref={viewportRef} id="aboutTrackViewport">
          <div className="about-track" ref={trackRef} id="aboutTrack">
            {/* PANEL 1: ABOUT SUNBLIX & OUR HISTORY */}
            <article className={`about-card ${activeStep === 0 ? 'is-focused' : ''}`}>
              <div className="about-card-badge">
                <span className="badge-dot" />
                <span>01 • ABOUT SUNBLIX &amp; HISTORY</span>
              </div>
              <h3 className="about-card-title">
                Building the Future of Energy.
              </h3>
              <p className="about-card-desc">
                <strong>PT SUNBLIX ENERGI INDONESIA</strong> berfokus pada solusi energi surya dan pengembangan produk energi untuk pasar Indonesia. Kami hadir memenuhi kebutuhan energi residensial, komersial, dan industri melalui produk berkualitas, solusi yang tepat, serta layanan profesional.
              </p>

              <div className="about-stats-grid">
                <div className="about-stat-item">
                  <div className="stat-icon">☀️</div>
                  <div className="stat-val">Residensial</div>
                  <div className="stat-lbl">Solusi Cerdas Rumah Tinggal</div>
                </div>
                <div className="about-stat-item">
                  <div className="stat-icon">🏭</div>
                  <div className="stat-val">Komersial</div>
                  <div className="stat-lbl">Efisiensi Bisnis &amp; Industri</div>
                </div>
                <div className="about-stat-item">
                  <div className="stat-icon">🗺️</div>
                  <div className="stat-val">Nasional</div>
                  <div className="stat-lbl">Perluasan Jangkauan Pasar</div>
                </div>
                <div className="about-stat-item">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-val">Inovasi</div>
                  <div className="stat-lbl">Teknologi &amp; Kualitas Merek</div>
                </div>
              </div>
            </article>

            {/* PANEL 2: VISI & MISI */}
            <article className={`about-card ${activeStep === 1 ? 'is-focused' : ''}`}>
              <div className="about-card-badge">
                <span className="badge-dot" />
                <span>02 • VISI &amp; MISI</span>
              </div>
              <h3 className="about-card-title">
                Arah &amp; Komitmen Jangka Panjang
              </h3>
              
              <div className="about-vision-box">
                <div className="box-tag">VISI KAMI</div>
                <p className="vision-quote">
                  &ldquo;Menjadi merek energi terkemuka di Indonesia dengan jangkauan pasar nasional.&rdquo;
                </p>
              </div>

              <div className="about-mission-pills">
                <div className="mission-pill">
                  <span className="m-icon">🛡️</span>
                  <div className="m-text">
                    <strong>Pengembangan Merek:</strong> Membangun SUNBLIX sebagai merek energi yang kuat, kompetitif, dan dipercaya pelanggan.
                  </div>
                </div>
                <div className="mission-pill">
                  <span className="m-icon">🗺️</span>
                  <div className="m-text">
                    <strong>Ekspansi Nasional:</strong> Memperluas jangkauan pasar dan jaringan distribusi ke berbagai wilayah Indonesia.
                  </div>
                </div>
                <div className="mission-pill">
                  <span className="m-icon">⚡</span>
                  <div className="m-text">
                    <strong>Pengembangan Produk:</strong> Memperluas portofolio produk energi bermerek SUNBLIX sesuai kebutuhan pasar.
                  </div>
                </div>
                <div className="mission-pill">
                  <span className="m-icon">🤝</span>
                  <div className="m-text">
                    <strong>Kemitraan Strategis:</strong> Hubungan jangka panjang dengan mitra bisnis untuk memperkuat mutu &amp; daya saing.
                  </div>
                </div>
                <div className="mission-pill">
                  <span className="m-icon">💡</span>
                  <div className="m-text">
                    <strong>Inovasi Digital:</strong> Mengoptimalkan teknologi untuk efisiensi operasional dan kualitas pelayanan pelanggan.
                  </div>
                </div>
              </div>
            </article>

            {/* PANEL 3: 4 NILAI PERUSAHAAN */}
            <article className={`about-card ${activeStep === 2 ? 'is-focused' : ''}`}>
              <div className="about-card-badge">
                <span className="badge-dot" />
                <span>03 • NILAI PERUSAHAAN</span>
              </div>
              <h3 className="about-card-title">
                Pedoman Nilai dalam Berkarya &amp; Melayani
              </h3>
              <p className="about-card-desc">
                Empat fondasi nilai utama yang memandu seluruh langkah dan pertumbuhan PT SUNBLIX ENERGI INDONESIA:
              </p>

              <div className="about-bento-grid">
                <div className="bento-box">
                  <div className="bento-header">
                    <span className="bento-icon">🛡️</span>
                    <h4>Integritas</h4>
                  </div>
                  <p>Menjunjung tinggi kejujuran, transparansi, dan tanggung jawab.</p>
                </div>

                <div className="bento-box">
                  <div className="bento-header">
                    <span className="bento-icon">🎖️</span>
                    <h4>Kualitas</h4>
                  </div>
                  <p>Mengutamakan mutu produk dan standar pelayanan.</p>
                </div>

                <div className="bento-box">
                  <div className="bento-header">
                    <span className="bento-icon">💡</span>
                    <h4>Inovasi</h4>
                  </div>
                  <p>Mengembangkan solusi yang relevan dengan kebutuhan pasar.</p>
                </div>

                <div className="bento-box">
                  <div className="bento-header">
                    <span className="bento-icon">📈</span>
                    <h4>Pertumbuhan</h4>
                  </div>
                  <p>Membangun bisnis yang kompetitif dan berkelanjutan.</p>
                </div>
              </div>
            </article>

            {/* PANEL 4: PROFIL PERUSAHAAN & PENUTUP */}
            <article className={`about-card about-card-cta ${activeStep === 3 ? 'is-focused' : ''}`}>
              <div className="about-card-badge">
                <span className="badge-dot" />
                <span>04 • POWER YOUR WORLD.</span>
              </div>
              <h3 className="about-card-title">
                PT SUNBLIX ENERGI INDONESIA
              </h3>
              <p className="about-card-desc">
                &ldquo;Kami membangun SUNBLIX dengan fokus pada kualitas, kepercayaan, dan pengembangan merek untuk menjawab kebutuhan energi Indonesia.&rdquo;
              </p>

              <div className="about-company-details">
                <div className="detail-row">
                  <span className="detail-icon">📍</span>
                  <div>
                    <strong>Kantor Pusat:</strong> Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📞</span>
                  <div>
                    <strong>Kontak:</strong> <a href="tel:+62217362630">021 7362 630</a> | WhatsApp: <a href="https://wa.me/6285288581027">085288581027</a> | <a href="mailto:hello@sunblix.id">hello@sunblix.id</a>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">🌐</span>
                  <div>
                    <strong>Website Resmi:</strong> <a href="https://sunblix.id" target="_blank" rel="noopener noreferrer">sunblix.id</a>
                  </div>
                </div>
              </div>

              <div className="about-card-actions">
                <button
                  type="button"
                  className="about-btn-quote"
                  onClick={onOpenQuote}
                >
                  Dapatkan Penawaran Resmi →
                </button>
                <a
                  href="https://wa.me/6285288581027?text=Halo%20SUNBLIX,%20saya%20ingin%20konsultasi%20mengenai%20solusi%20energi%20surya."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-btn-wa"
                >
                  💬 Chat WhatsApp
                </a>
                <a href="/about" className="about-btn-continue">
                  Buka Halaman Lengkap Tentang Kami ↗
                </a>
              </div>
            </article>
          </div>
        </div>

        {/* BOTTOM BAR / PROGRESS */}
        <div className="about-bottom-bar">
          <div className="about-scroll-tip">
            <span className="about-tip-icon">↔</span>
            <span>Scroll ke bawah untuk menggeser kartu cerita horisontal</span>
          </div>

          <div className="about-progress-line" aria-hidden="true">
            <div className="about-progress-fill" ref={progressFillRef} id="aboutProgressFill" />
          </div>

          <a href="#products" className="about-skip-btn">
            Lanjut ke Pilihan Produk ↓
          </a>
        </div>
      </div>
    </section>
  );
}
