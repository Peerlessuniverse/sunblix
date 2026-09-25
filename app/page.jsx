'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import MobileDrawer from '../components/MobileDrawer';
import HeroScene from '../components/HeroScene';
import PurposeScene from '../components/PurposeScene';
import ProductTiers from '../components/ProductTiers';
import SunlightDiagram from '../components/SunlightDiagram';
import WhySunblix from '../components/WhySunblix';
import ProjectMap from '../components/ProjectMap';
import SolarCalculator from '../components/SolarCalculator';
import FinaleSection from '../components/FinaleSection';
import VideoModal from '../components/VideoModal';
import QuoteModal from '../components/QuoteModal';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import FloatingBackToTop from '../components/FloatingBackToTop';
import CinematicEngine from '../components/CinematicEngine';

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [projectTab, setProjectTab] = useState('calc');

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
      <CinematicEngine />

      {/* CINEMATIC SCROLL EXPERIENCE */}
      <main className="story" id="story">
        <section className="stage" id="stage">
          {/* SCENE 1: HERO */}
          <HeroScene onOpenQuote={() => handleOpenQuote(null)} />

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
                {/* MOBILE VIEW TOGGLE TABS (CALC VS MAP VS TERMS) */}
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
