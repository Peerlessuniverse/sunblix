'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import MobileDrawer from '../../components/MobileDrawer';
import HeroSceneVideo from '../../components/HeroSceneVideo';
import PurposeScene from '../../components/PurposeScene';
import ProductTiers from '../../components/ProductTiers';
import SunlightDiagram from '../../components/SunlightDiagram';
import WhySunblix from '../../components/WhySunblix';
import ProjectMap from '../../components/ProjectMap';
import SolarCalculator from '../../components/SolarCalculator';
import FinaleSection from '../../components/FinaleSection';
import VideoModal from '../../components/VideoModal';
import QuoteModal from '../../components/QuoteModal';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import FloatingBackToTop from '../../components/FloatingBackToTop';
import CinematicEngine from '../../components/CinematicEngine';

export default function PreviewVideoPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [projectTab, setProjectTab] = useState('calc');
  const [isCameraStatic, setIsCameraStatic] = useState(true);

  const handleOpenQuote = (systemData = null) => {
    setSelectedSystem(systemData);
    setQuoteModalOpen(true);
  };

  return (
    <>
      {/* PAGE PRELOADER */}
      <div className="page-loader" id="pageLoader" />
      <div className="loader-logo-wrap" id="loaderLogoWrap">
        <img src="/asset/sublixlogo.svg" alt="SUNBLIX" id="loaderLogoImg" />
      </div>

      {/* FLOATING PREVIEW CONTROLLER */}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '10px 16px',
          color: '#ffffff',
          fontSize: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontWeight: 600, color: '#38bdf8' }}>🎥 Mode Duplikasi Preview</span>
          <a
            href="/"
            style={{
              color: '#94a3b8',
              textDecoration: 'underline',
              fontSize: '11px',
            }}
          >
            ← Kembali ke Index
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isCameraStatic}
              onChange={(e) => setIsCameraStatic(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Kamera Statis (Tanpa Zoom Scroll)</span>
          </label>
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
          File video: <code>public/asset/herobg-loop.mp4</code><br />
          (Jika video belum ada, poster gambar otomatis tampil)
        </div>
      </div>

      {/* NAVIGATION */}
      <Navbar
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenQuote={() => handleOpenQuote(null)}
      />

      {/* MOBILE DRAWER */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenQuote={() => handleOpenQuote(null)}
      />

      {/* CINEMATIC ENGINE */}
      <CinematicEngine staticCamera={isCameraStatic} />

      {/* CINEMATIC SCROLL EXPERIENCE */}
      <main className="story" id="story">
        <section className="stage" id="stage">
          {/* SCENE 1: HERO (VIDEO LOOP DUPLICATE) */}
          <HeroSceneVideo onOpenQuote={() => handleOpenQuote(null)} />

          {/* SCENE 2: PURPOSE */}
          <PurposeScene onOpenVideo={() => setVideoModalOpen(true)} />

          {/* SCENE 3: PRODUCTS */}
          <div className="scene-three" id="sceneThree" aria-label="Find Your SUNBLIX">
            <ProductTiers />
            <SunlightDiagram />
            <WhySunblix />

            {/* BABAK 6: PROJECTS & SOLAR CALCULATOR */}
            <div className="project-shell" id="projectShell" aria-label="Projects & Solar Calculator">
              <div className="project-container" data-active-tab={projectTab}>
                <div className="project-mobile-tabs" id="projectMobileTabs">
                  <button
                    type="button"
                    className={`pm-tab-btn ${projectTab === 'calc' ? 'is-active' : ''}`}
                    data-tab="calc"
                    onClick={() => setProjectTab('calc')}
                  >
                    ⚡ Kalkulator Surya
                  </button>
                  <button
                    type="button"
                    className={`pm-tab-btn ${projectTab === 'map' ? 'is-active' : ''}`}
                    data-tab="map"
                    onClick={() => setProjectTab('map')}
                  >
                    🗺️ Peta Proyek
                  </button>
                  <button
                    type="button"
                    className={`pm-tab-btn ${projectTab === 'terms' ? 'is-active' : ''}`}
                    data-tab="terms"
                    onClick={() => setProjectTab('terms')}
                  >
                    📋 Paket Siap Pakai
                  </button>
                </div>

                <ProjectMap activeTab={projectTab} />
                <SolarCalculator onOpenQuote={handleOpenQuote} />
              </div>
            </div>

            {/* BABAK 7: FINALE & FOOTER */}
            <FinaleSection onOpenQuote={() => handleOpenQuote(null)} />
          </div>

          {/* SCROLL INDICATORS */}
          <div className="scroll-hint" id="scrollHint">
            SCROLL TO EXPLORE
          </div>
          <div className="scroll-line">
            <i id="scrollProgress" />
          </div>
        </section>
      </main>

      {/* MODALS */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialData={selectedSystem}
      />

      {/* FLOATING ACTION BUTTONS */}
      <FloatingBackToTop />
      <FloatingWhatsApp />
    </>
  );
}
