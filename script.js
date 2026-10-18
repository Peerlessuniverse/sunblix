(() => {
  // Elements
  const story = document.getElementById('story');
  const heroBg = document.getElementById('heroBg');
  const heroContent = document.getElementById('heroContent');
  const heroBottom = document.getElementById('heroBottom');
  const curtain = document.getElementById('textCurtain');
  const purposeWash = document.getElementById('purposeWash');
  const purposeContent = document.getElementById('purposeContent');
  const storyCard = document.getElementById('storyCard');
  const energySystem = document.getElementById('energySystem');
  const energyPulse = document.getElementById('energyPulse');
  const sceneTwo = document.getElementById('sceneTwo');
  const sceneThree = document.getElementById('sceneThree');
  const productShell = document.querySelector('.product-shell');
  const systemShell = document.getElementById('systemShell');
  const howShell = document.getElementById('howShell');
  const projectShell = document.getElementById('projectShell');
  const finaleShell = document.getElementById('finaleShell');
  const videoHit = document.getElementById('videoHit');
  const scrollHint = document.getElementById('scrollHint');
  const scrollProgress = document.getElementById('scrollProgress');
  const nav = document.getElementById('nav');
  const modal = document.getElementById('modal');
  const close = document.getElementById('close');
  const modalVideo = document.getElementById('modalVideo');
  const storyThumb = document.getElementById('storyThumb');

  // Preloader Elements
  const pageLoader = document.getElementById('pageLoader');
  const loaderLogoWrap = document.getElementById('loaderLogoWrap');
  const loaderLogoImg = document.getElementById('loaderLogoImg');
  const navLogo = document.querySelector('.nav-logo');

  let ticking = false;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t * t * (3 - 2 * t);

  // Energy path coordinates (percentages of artwork):
  // Solar panel on roof (right) -> through inverter -> down to home/story card (left)
  const path = [
    [75.6, 41.5],
    [69.0, 44.5],
    [62.5, 49.0],
    [55.5, 55.0],
    [48.0, 62.0],
    [40.0, 68.5],
    [32.0, 74.0],
    [24.5, 78.0],
    [18.0, 80.5],
    [12.0, 82.0]
  ];

  function pointOnPath(t) {
    const scaled = t * (path.length - 1);
    const i = Math.min(path.length - 2, Math.floor(scaled));
    const f = scaled - i;
    const a = path[i];
    const b = path[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  }

  function render() {
    ticking = false;
    const scrollY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    if (nav) nav.classList.toggle('scrolled', scrollY > 30);
    if (scrollProgress) scrollProgress.style.height = `${progress * 100}%`;
    if (scrollHint) scrollHint.classList.toggle('is-hidden', scrollY > 80);

    // Subtle cinematic camera push on house backdrop across Hero & Purpose
    const heroBg = document.getElementById('heroBg');
    const wrapper = document.getElementById('heroPurposeWrapper');
    if (heroBg && wrapper) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const scrollRange = Math.max(1, wrapper.offsetHeight - window.innerHeight);
      const heroProgress = Math.min(1, Math.max(0, -wrapperRect.top / scrollRange));
      heroBg.style.transform = `scale(${1 + heroProgress * 0.08})`;
    }

    // Lightning energy surge animation in Section 2
    updateLightningSurge();

    // About Us Horizontal Scrollytelling
    updateAboutScrollytelling();

    updateActiveNav();
  }

  function updateAboutScrollytelling() {
    const shell = document.getElementById('about');
    const track = document.getElementById('aboutTrack');
    const viewport = document.getElementById('aboutTrackViewport');
    const progressFill = document.getElementById('aboutProgressFill');
    const dots = document.querySelectorAll('.about-step-dot');
    const cards = document.querySelectorAll('.about-card');

    if (!shell || !track || !viewport) return;

    if (window.innerWidth <= 900) return; // handled via scroll-snap on mobile

    const rect = shell.getBoundingClientRect();
    const winHeight = window.innerHeight;
    const scrollDistance = shell.offsetHeight - winHeight;

    if (scrollDistance <= 0) return;

    const scrolled = -rect.top;
    const rawProgress = scrolled / scrollDistance;
    const progress = Math.min(1, Math.max(0, rawProgress));

    const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
    track.style.transform = `translateX(-${progress * maxTranslate}px)`;

    if (progressFill) {
      progressFill.style.width = `${progress * 100}%`;
    }

    const step = Math.min(3, Math.max(0, Math.round(progress * 3)));
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === step);
    });
    cards.forEach((card, idx) => {
      card.classList.toggle('is-focused', idx === step);
    });
  }

  // Setup About Us buttons and dots
  const aboutPrevBtn = document.getElementById('aboutPrevBtn');
  const aboutNextBtn = document.getElementById('aboutNextBtn');
  const aboutDots = document.querySelectorAll('.about-step-dot');
  const aboutViewport = document.getElementById('aboutTrackViewport');

  function goToAboutStep(idx) {
    const shell = document.getElementById('about');
    const viewport = document.getElementById('aboutTrackViewport');
    if (!shell) return;

    if (window.innerWidth <= 900 && viewport) {
      const cardWidth = viewport.clientWidth * 0.86;
      viewport.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
    } else {
      const rect = shell.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const shellTop = currentScrollY + rect.top;
      const scrollDistance = shell.offsetHeight - window.innerHeight;
      const targetScrollY = shellTop + (idx / 3) * scrollDistance;
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
  }

  aboutDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => goToAboutStep(idx));
  });

  if (aboutPrevBtn) {
    aboutPrevBtn.addEventListener('click', () => {
      const activeDot = document.querySelector('.about-step-dot.is-active');
      const cur = activeDot ? parseInt(activeDot.getAttribute('data-step') || '0', 10) : 0;
      if (cur > 0) goToAboutStep(cur - 1);
    });
  }

  if (aboutNextBtn) {
    aboutNextBtn.addEventListener('click', () => {
      const activeDot = document.querySelector('.about-step-dot.is-active');
      const cur = activeDot ? parseInt(activeDot.getAttribute('data-step') || '0', 10) : 0;
      if (cur < 3) goToAboutStep(cur + 1);
    });
  }

  if (aboutViewport) {
    aboutViewport.addEventListener('scroll', () => {
      if (window.innerWidth > 900) return;
      const cardWidth = aboutViewport.clientWidth * 0.86;
      const step = Math.min(3, Math.max(0, Math.round(aboutViewport.scrollLeft / cardWidth)));
      aboutDots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === step);
      });
      const progressFill = document.getElementById('aboutProgressFill');
      if (progressFill) {
        progressFill.style.width = `${((step + 1) / 4) * 100}%`;
      }
    }, { passive: true });
  }

  function updateLightningSurge() {
    const sceneTwo = document.getElementById('solutions');
    const pathCore = document.getElementById('lightningPathCore');
    const pathGlow = document.getElementById('lightningPathGlow');
    const pathCrackle = document.getElementById('lightningPathCrackle');
    const spark = document.getElementById('lightningSpark');
    const storyCard = document.getElementById('storyCard');
    const purposeContent = document.getElementById('purposeContent');

    if (!sceneTwo || !pathCore) return;

    const rect = sceneTwo.getBoundingClientRect();
    const winHeight = window.innerHeight;

    // Calculate progress: starts when Section 2 top is at 85% viewport, completes at 12%
    const startY = winHeight * 0.85;
    const endY = winHeight * 0.12;
    const rawProgress = (startY - rect.top) / (startY - endY);
    const progress = Math.min(1, Math.max(0, rawProgress));

    let totalLength = 1850;
    try {
      if (typeof pathCore.getTotalLength === 'function') {
        const len = pathCore.getTotalLength();
        if (len > 0) totalLength = len;
      }
    } catch (e) {}

    if (progress <= 0.02) {
      pathCore.style.opacity = '0';
      if (pathGlow) pathGlow.style.opacity = '0';
      if (pathCrackle) pathCrackle.style.opacity = '0';
      if (spark) spark.classList.remove('is-active');
      if (storyCard) {
        storyCard.classList.remove('has-energy');
        storyCard.classList.remove('just-ignited');
      }
      if (purposeContent) purposeContent.classList.remove('is-electrified');
      return;
    }

    // Fade in lightning elements
    const fadeIn = Math.min(1, progress / 0.12);
    pathCore.style.opacity = String(fadeIn);
    if (pathGlow) pathGlow.style.opacity = String(fadeIn * 0.85);
    if (pathCrackle) pathCrackle.style.opacity = String(fadeIn * 0.7);

    // Dash offset mapping
    const drawLength = totalLength * progress;
    const dashOffset = Math.max(0, totalLength - drawLength);

    pathCore.style.strokeDasharray = `${totalLength}`;
    pathCore.style.strokeDashoffset = `${dashOffset}`;

    if (pathGlow) {
      pathGlow.style.strokeDasharray = `${totalLength}`;
      pathGlow.style.strokeDashoffset = `${dashOffset}`;
    }
    if (pathCrackle) {
      pathCrackle.style.strokeDasharray = `10 20`;
      pathCrackle.style.strokeDashoffset = `${dashOffset * 1.4}`;
    }

    // Traveling plasma spark position
    if (spark && typeof pathCore.getPointAtLength === 'function') {
      try {
        const pt = pathCore.getPointAtLength(drawLength);
        spark.classList.add('is-active');
        spark.style.left = `${(pt.x / 1000) * 100}%`;
        spark.style.top = `${(pt.y / 1000) * 100}%`;
      } catch (e) {}
    }

    // Electrify purpose text while lightning loops around it (progress 0.28 to 0.86)
    if (purposeContent) {
      purposeContent.classList.toggle('is-electrified', progress >= 0.28 && progress <= 0.86);
    }

    // Power on video thumbnail when lightning strikes it (progress >= 0.78)
    if (storyCard) {
      const isEnergized = progress >= 0.78;
      if (isEnergized) {
        if (!storyCard.classList.contains('has-energy')) {
          storyCard.classList.add('has-energy');
          storyCard.classList.add('just-ignited');
          setTimeout(() => storyCard.classList.remove('just-ignited'), 850);
        }
      } else {
        storyCard.classList.remove('has-energy');
        storyCard.classList.remove('just-ignited');
      }
    }
  }

  // 1. SCROLL-TRIGGERED REVEAL OBSERVER (APPLE / STRIPE STYLE)
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.08,
    }
  );

  document.querySelectorAll('.section-reveal').forEach((sec) => revealObserver.observe(sec));

  // Ensure hero is revealed right away
  const heroSection = document.getElementById('home');
  if (heroSection) {
    heroSection.classList.add('is-revealed');
  }

  // 2. ACTIVE NAVBAR SECTION TRACKING
  const sectionIds = ['home', 'solutions', 'about', 'products', 'how-it-works', 'why-sunblix', 'projects', 'quote'];
  const navLinks = document.querySelectorAll('.nav-menu a, .drawer-nav a');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 140;

    let currentId = 'home';
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = id;
          break;
        }
      }
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', render);
  render();

  // Preloader Animation Timeline:
  function runPreloaderAnimation() {
    setTimeout(() => {
      if (!navLogo || !loaderLogoWrap || !pageLoader) {
        document.body.classList.remove('is-loading');
        document.body.classList.remove('is-revealing');
        return;
      }

      const targetRect = navLogo.getBoundingClientRect();
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      loaderLogoWrap.classList.add('moving');
      loaderLogoWrap.style.left = `${targetCenterX}px`;
      loaderLogoWrap.style.top = `${targetCenterY}px`;
      loaderLogoWrap.style.width = `${targetRect.width}px`;

      document.body.classList.remove('is-loading');
      document.body.classList.add('is-revealing');
      pageLoader.classList.add('fade-out');

      setTimeout(() => {
        document.body.classList.remove('is-revealing');
        if (loaderLogoWrap) loaderLogoWrap.style.display = 'none';
        if (pageLoader) pageLoader.style.display = 'none';
        requestRender();
      }, 1550);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPreloaderAnimation);
  } else {
    runPreloaderAnimation();
  }
  // Floating Back to Top navigation button handlers
  const floatingBackToTop = document.getElementById('floatingBackToTop');
  const btnBackToTop = document.getElementById('btnBackToTop');

  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function updateBackToTopVisibility() {
    if (!floatingBackToTop) return;
    floatingBackToTop.classList.toggle('is-visible', window.scrollY > 250);
  }

  window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });

  // Preloader Refresh Simulation (e.g. when Sunblix menu logo is clicked)
  function triggerPreloaderRefresh() {
    if (!navLogo || !loaderLogoWrap || !pageLoader) return;

    // 1. Immediately reset scroll position to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestRender();

    // 2. Reactivate preloader overlay and logo
    document.body.classList.add('is-loading');
    document.body.classList.remove('is-revealing');
    pageLoader.style.display = 'block';
    pageLoader.classList.remove('fade-out');
    pageLoader.style.opacity = '1';
    pageLoader.style.visibility = 'visible';

    loaderLogoWrap.style.display = 'block';
    loaderLogoWrap.classList.remove('moving');
    loaderLogoWrap.style.left = '50%';
    loaderLogoWrap.style.top = '50%';
    loaderLogoWrap.style.width = '140px';
    loaderLogoWrap.style.opacity = '1';

    // 3. Smoothly animate logo flying into navbar logo and fade out preloader
    setTimeout(() => {
      const targetRect = navLogo.getBoundingClientRect();
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      loaderLogoWrap.classList.add('moving');
      loaderLogoWrap.style.left = `${targetCenterX}px`;
      loaderLogoWrap.style.top = `${targetCenterY}px`;
      loaderLogoWrap.style.width = `${targetRect.width}px`;

      document.body.classList.remove('is-loading');
      document.body.classList.add('is-revealing');
      pageLoader.classList.add('fade-out');

      setTimeout(() => {
        document.body.classList.remove('is-revealing');
        loaderLogoWrap.style.display = 'none';
        pageLoader.style.display = 'none';
        requestRender();
      }, 1550);
    }, 850);
  }

  // Hook menu logo clicks to trigger preloader refresh
  document.querySelectorAll('.nav-logo-link, #drawerLogoLink').forEach(logoLink => {
    logoLink.addEventListener('click', e => {
      e.preventDefault();
      closeMobileDrawer();
      triggerPreloaderRefresh();
    });
  });

  // Initial render
  requestRender();
  updateBackToTopVisibility();

  // Modal Handlers
  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (modalVideo) {
      if (modalVideo.tagName === 'IFRAME') {
        const targetSrc = modalVideo.getAttribute('data-src') || 'https://www.youtube-nocookie.com/embed/iXp1qE8Plu0?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        if (modalVideo.src !== targetSrc) {
          modalVideo.src = targetSrc;
        }
      } else if (typeof modalVideo.play === 'function') {
        modalVideo.currentTime = 0;
        modalVideo.play().catch(e => {
          console.warn('Video auto-playback notice:', e);
        });
      }
    }
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (modalVideo) {
      if (modalVideo.tagName === 'IFRAME') {
        modalVideo.src = '';
      } else if (typeof modalVideo.pause === 'function') {
        modalVideo.pause();
      }
    }
  }

  if (videoHit) videoHit.addEventListener('click', openModal);
  if (storyThumb) storyThumb.addEventListener('click', openModal);
  const storyCardEl = document.getElementById('storyCard');
  const storyLink = document.getElementById('storyLink');
  if (storyLink) {
    storyLink.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  }
  if (close) close.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Fast smooth scroll navigation on navbar clicks
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Synchronize bottom cards and diagram hotspots in "From Sunlight to Your Home"
  const sunlightCards = document.querySelectorAll('.sunlight-card');
  const sunlightHotspots = document.querySelectorAll('.sunlight-hotspot[data-target]');

  function activateSunlightComponent(componentId) {
    if (!componentId) return;
    sunlightCards.forEach(card => {
      card.classList.toggle('is-active', card.getAttribute('data-component') === componentId);
    });
    sunlightHotspots.forEach(spot => {
      spot.classList.toggle('is-highlighted', spot.getAttribute('data-target') === componentId);
    });
  }

  sunlightCards.forEach(card => {
    const comp = card.getAttribute('data-component');
    card.addEventListener('mouseenter', () => activateSunlightComponent(comp));
    card.addEventListener('click', () => activateSunlightComponent(comp));
  });

  sunlightHotspots.forEach(spot => {
    const comp = spot.getAttribute('data-target');
    spot.addEventListener('mouseenter', () => activateSunlightComponent(comp));
    spot.addEventListener('click', () => activateSunlightComponent(comp));
  });

  // Interactive cards in Babak 5 (Why Go With Sunblix)
  const stepCards = document.querySelectorAll('.how-step-card');
  if (stepCards.length > 0) {
    stepCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        stepCards.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
      });
      card.addEventListener('click', () => {
        stepCards.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
      });
    });
  }

  // ============================================================
  // BABAK 6: INTERACTIVE MAP CITY PINS & TOOLTIP
  // ============================================================
  const cityPins = document.querySelectorAll('.city-pin');
  const cityTooltip = document.getElementById('cityTooltip');
  const ttCity = document.getElementById('ttCity');
  const ttType = document.getElementById('ttType');
  const ttCap = document.getElementById('ttCap');

  function setTooltipData(pin) {
    if (!cityTooltip || !pin) return;
    const city = pin.getAttribute('data-city') || 'Indonesia';
    const type = pin.getAttribute('data-type') || 'Solar Installation';
    const cap = pin.getAttribute('data-cap') || 'Active PLTS';

    if (ttCity) ttCity.textContent = city;
    if (ttType) ttType.textContent = type;
    if (ttCap) ttCap.textContent = cap;

    cityPins.forEach(p => p.classList.remove('is-active'));
    pin.classList.add('is-active');
  }

  cityPins.forEach(pin => {
    pin.addEventListener('mouseenter', () => setTooltipData(pin));
    pin.addEventListener('click', () => setTooltipData(pin));
  });

  // ============================================================
  // BABAK 6: HORIZONTAL SOLAR CALCULATOR (HARMONISASI SPH 002)
  // ============================================================
  const calcProperty = document.getElementById('calcProperty');
  const calcBill = document.getElementById('calcBill');
  const calcSysType = document.getElementById('calcSysType');
  const calcRooftop = document.getElementById('calcRooftop');
  const btnCalculate = document.getElementById('btnCalculate');
  const quickBillBtns = document.querySelectorAll('.quick-bill-btn');

  const resSystemName = document.getElementById('resSystemName');
  const resTierBadge = document.getElementById('resTierBadge');
  const resKwp = document.getElementById('resKwp');
  const resPanels = document.getElementById('resPanels');
  const resArea = document.getElementById('resArea');
  const resInverter = document.getElementById('resInverter');
  const resInverterDesc = document.getElementById('resInverterDesc');
  const resBattery = document.getElementById('resBattery');
  const resBatteryDesc = document.getElementById('resBatteryDesc');
  const resSavings = document.getElementById('resSavings');
  const resSavingsPct = document.getElementById('resSavingsPct');
  const resInvestment = document.getElementById('resInvestment');
  const resPayback = document.getElementById('resPayback');
  const resProduction = document.getElementById('resProduction');
  const resCo2 = document.getElementById('resCo2');
  const calcResultCard = document.getElementById('calcResultCard');

  let currentSolarSystem = {
    sysName: 'SUNBLIX 4.68 Hybrid',
    kwp: '4.68',
    kwpNum: 4.68,
    panels: '8',
    area: '26 m²',
    inverter: '6 kW',
    inverterDesc: 'Deye Hybrid Smart',
    battery: '5.1 kWh LiFePO4',
    systemType: 'Hybrid (Smart BESS)',
    systemTypeId: 'hybrid',
    estInvestment: 128000000,
    paybackYears: '5.5',
    monthlyKwh: 474,
    estSavings: 2000000,
    savingsPct: 80,
    co2Kg: 389,
    rawBill: 2500000,
  };

  function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  function parseRupiah(str) {
    if (!str) return 2500000;
    const cleaned = String(str).replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) || num <= 0 ? 2500000 : num;
  }

  function calculateSolar() {
    const rawBill = parseRupiah(calcBill ? calcBill.value : '2500000');
    const property = calcProperty ? calcProperty.value : 'house';
    const rooftop = calcRooftop ? calcRooftop.value : 'medium';
    const sysTypeVal = calcSysType ? calcSysType.value : 'hybrid';
    const isHybrid = sysTypeVal === 'hybrid';

    let mult = 1.0;
    if (property === 'villa') mult = 1.15;
    else if (property === 'commercial') mult = 1.25;
    else if (property === 'warehouse') mult = 1.4;

    const adjustedBill = rawBill * mult;

    // Database Paket Supplier Resmi (Modul Astronergy 585 Wp & Inverter Deye Hybrid/On-Grid)
    let pkg = {
      kwp: 4.68,
      panels: 8,
      area: '26 m²',
      inverter: '6 kW',
      inverterDesc: isHybrid ? 'Deye Hybrid Smart' : 'Grid-Tie Dual MPPT',
      battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
      investment: isHybrid ? 128000000 : 82000000,
    };

    if (adjustedBill <= 1800000 || (rooftop === 'small' && adjustedBill <= 3000000)) {
      pkg = {
        kwp: 2.34,
        panels: 4,
        area: '13 m²',
        inverter: isHybrid ? '6 kW' : '3 kW',
        inverterDesc: isHybrid ? 'Deye Hybrid Smart' : 'Grid-Tie Dual MPPT',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 91500000 : 58000000,
      };
    } else if (adjustedBill <= 4000000) {
      pkg = {
        kwp: 4.68,
        panels: 8,
        area: '26 m²',
        inverter: isHybrid ? '6 kW' : '5 kW',
        inverterDesc: isHybrid ? 'Deye Hybrid Smart' : 'Grid-Tie Dual MPPT',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 128000000 : 82000000,
      };
    } else if (adjustedBill <= 7500000) {
      // Paket No. 6 SPH 002: 7.02 kWp (12 panel × 585 Wp)
      pkg = {
        kwp: 7.02,
        panels: 12,
        area: '39 m²',
        inverter: '6 kW',
        inverterDesc: isHybrid ? 'Deye SUN-6K-SG05LP1' : 'Grid-Tie Smart Inverter',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 177200000 : 122000000,
      };
    } else if (adjustedBill <= 11000000) {
      // Paket No. 7 SPH 002: 8.19 kWp (14 panel × 585 Wp)
      pkg = {
        kwp: 8.19,
        panels: 14,
        area: '45 m²',
        inverter: '8 kW',
        inverterDesc: isHybrid ? 'Deye SUN-8K-SG05LP1' : 'Grid-Tie Smart Inverter',
        battery: isHybrid ? '5.1 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 209500000 : 142000000,
      };
    } else if (adjustedBill <= 16000000) {
      // Paket No. 10 SPH 002: 11.70 kWp (20 panel × 585 Wp)
      pkg = {
        kwp: 11.70,
        panels: 20,
        area: '64 m²',
        inverter: isHybrid ? '12 kW' : '10 kW',
        inverterDesc: isHybrid ? 'Deye SUN-12K-SG05LP1' : 'Grid-Tie 3-Phase',
        battery: isHybrid ? '10.2 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 295200000 : 198000000,
      };
    } else {
      // Paket No. 11 SPH 002: 14.04 kWp (24 panel × 585 Wp)
      pkg = {
        kwp: 14.04,
        panels: 24,
        area: '77 m²',
        inverter: isHybrid ? '12 kW' : '15 kW',
        inverterDesc: isHybrid ? 'Deye 3P / 12kW Hybrid' : 'Grid-Tie 3-Phase Multi-MPPT',
        battery: isHybrid ? '10.2 kWh LiFePO4' : 'On-Grid (Tanpa Baterai)',
        investment: isHybrid ? 352400000 : 238000000,
      };
    }

    const sysName = `SUNBLIX ${pkg.kwp} ${isHybrid ? 'Hybrid' : 'On-Grid'}`;

    // Rumus Produksi Energi Resmi SPH: kWp × PSH 4.5 × 75% efisiensi sistem × 30 hari = ~101.25 kWh/kWp/bln
    const monthlyKwh = Math.round(pkg.kwp * 4.5 * 0.75 * 30);

    // Rasio penghematan realistis: Hybrid (80-85%), On-Grid (70-75%)
    const savingsRatio = isHybrid
      ? (rawBill <= 2000000 ? 0.80 : 0.85)
      : (rawBill <= 2000000 ? 0.70 : 0.75);

    const estSavings = Math.round(rawBill * savingsRatio);
    const savingsPct = Math.round(savingsRatio * 100);
    const co2Kg = Math.round(monthlyKwh * 0.82);

    // Payback Period (BEP) dalam tahun = Investasi / (Penghematan tahunan)
    const annualSavings = estSavings * 12;
    const paybackYears = annualSavings > 0
      ? Math.max(3.5, Math.min(8.0, pkg.investment / annualSavings)).toFixed(1)
      : '5.2';

    // Simpan ke state global untuk Quote Modal
    currentSolarSystem = {
      sysName,
      kwp: String(pkg.kwp),
      kwpNum: pkg.kwp,
      panels: String(pkg.panels),
      area: pkg.area,
      inverter: pkg.inverter,
      inverterDesc: pkg.inverterDesc,
      battery: pkg.battery,
      systemType: isHybrid ? 'Hybrid (Smart BESS)' : 'On-Grid (Siang Hari)',
      systemTypeId: sysTypeVal,
      estInvestment: pkg.investment,
      paybackYears,
      monthlyKwh,
      estSavings,
      savingsPct,
      co2Kg,
      rawBill,
    };

    if (resSystemName) resSystemName.textContent = sysName;
    if (resTierBadge) resTierBadge.textContent = currentSolarSystem.systemType;
    if (resKwp) resKwp.textContent = `${pkg.kwp} kWp`;
    if (resPanels) resPanels.textContent = `${pkg.panels} Panel`;
    if (resArea) resArea.textContent = pkg.area;
    if (resInverter) resInverter.textContent = pkg.inverter;
    if (resInverterDesc) {
      resInverterDesc.textContent = pkg.inverterDesc;
      resInverterDesc.setAttribute('title', pkg.inverterDesc);
    }
    if (resBattery) {
      const parts = pkg.battery.split(' ');
      resBattery.textContent = `${parts[0]} ${parts[1] || ''}`.trim();
    }
    if (resBatteryDesc) {
      resBatteryDesc.textContent = isHybrid ? 'BESS LiFePO4' : 'Grid-Tied';
    }

    if (resSavings) resSavings.textContent = formatRupiah(estSavings);
    if (resSavingsPct) resSavingsPct.textContent = `Hemat ~${savingsPct}% tagihan PLN`;
    if (resInvestment) resInvestment.textContent = formatRupiah(pkg.investment);
    if (resPayback) resPayback.textContent = `Balik Modal: ~${paybackYears} Tahun`;
    if (resProduction) resProduction.textContent = `~${monthlyKwh.toLocaleString('id-ID')} kWh`;
    if (resCo2) resCo2.textContent = `Reduksi CO₂ ~${co2Kg.toLocaleString('id-ID')} kg`;

    // Dynamic WhatsApp consultation link with pre-filled calculated system
    const waCalcMsg = `Halo Tim Ahli SUNBLIX, saya telah menghitung kebutuhan di website dan ingin konsultasi resmi untuk paket rekomendasi: *${sysName}* (${pkg.kwp} kWp, ${pkg.panels} Panel Astronergy 585Wp, inverter ${pkg.inverter}, baterai: ${pkg.battery}, estimasi atap ${pkg.area}) dengan tagihan listrik saat ini: *${formatRupiah(rawBill)}/bln*.\n\n*Estimasi Nilai Paket:* ${formatRupiah(pkg.investment)}\n*Estimasi Hemat Listrik:* ${formatRupiah(estSavings)}/bln (~${savingsPct}%)\n*Estimasi Balik Modal:* ~${paybackYears} Tahun\n\nMohon info ketersediaan jadwal survei lokasi dan estimasi penawaran resminya.`;
    const calcWaUrl = `https://wa.me/6285288581027?text=${encodeURIComponent(waCalcMsg)}`;
    const calcWaActionBtn = document.getElementById('calcWaActionBtn');
    const resArrowBtn = document.getElementById('resArrowBtn');
    if (calcWaActionBtn) calcWaActionBtn.href = calcWaUrl;
    if (resArrowBtn) {
      resArrowBtn.href = calcWaUrl;
      resArrowBtn.target = '_blank';
      resArrowBtn.rel = 'noopener noreferrer';
      resArrowBtn.setAttribute('title', `Konsultasikan paket ${sysName} via WhatsApp`);
    }

    // Trigger visual pulse animation on card
    if (calcResultCard) {
      calcResultCard.classList.remove('calc-pulse');
      void calcResultCard.offsetWidth;
      calcResultCard.classList.add('calc-pulse');
    }
  }

  const calcBillRange = document.getElementById('calcBillRange');
  const calcPropertyChips = document.querySelectorAll('.calc-chip-property');
  const calcRooftopChips = document.querySelectorAll('.calc-chip-rooftop');
  const btnCalculateMobile = document.getElementById('btnCalculateMobile');

  quickBillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      quickBillBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (calcBill) {
        calcBill.value = formatRupiah(val);
      }
      if (calcBillRange) {
        calcBillRange.value = val;
      }
      calculateSolar();
    });
  });

  if (calcBillRange) {
    calcBillRange.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      if (calcBill) {
        calcBill.value = formatRupiah(val);
      }
      quickBillBtns.forEach(b => {
        b.classList.toggle('is-active', parseInt(b.getAttribute('data-val'), 10) === val);
      });
      calculateSolar();
    });
  }

  if (calcBill) {
    calcBill.addEventListener('input', e => {
      const val = parseRupiah(e.target.value);
      if (calcBillRange) {
        calcBillRange.value = Math.min(20000000, Math.max(500000, val));
      }
      quickBillBtns.forEach(b => {
        b.classList.toggle('is-active', parseInt(b.getAttribute('data-val'), 10) === val);
      });
      calculateSolar();
    });

    calcBill.addEventListener('blur', e => {
      const val = parseRupiah(e.target.value);
      e.target.value = formatRupiah(val);
    });
  }

  calcPropertyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      calcPropertyChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const val = chip.getAttribute('data-val');
      if (calcProperty) calcProperty.value = val;
      calculateSolar();
    });
  });

  calcRooftopChips.forEach(chip => {
    chip.addEventListener('click', () => {
      calcRooftopChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const val = chip.getAttribute('data-val');
      if (calcRooftop) calcRooftop.value = val;
      calculateSolar();
    });
  });

  if (calcProperty) {
    calcProperty.addEventListener('change', () => {
      calcPropertyChips.forEach(c => {
        c.classList.toggle('is-active', c.getAttribute('data-val') === calcProperty.value);
      });
      calculateSolar();
    });
  }

  if (calcSysType) {
    calcSysType.addEventListener('change', calculateSolar);
  }

  if (calcRooftop) {
    calcRooftop.addEventListener('change', () => {
      calcRooftopChips.forEach(c => {
        c.classList.toggle('is-active', c.getAttribute('data-val') === calcRooftop.value);
      });
      calculateSolar();
    });
  }

  function openStaticQuoteModal() {
    let existingModal = document.getElementById('staticQuoteModal');
    if (existingModal) existingModal.remove();

    const billVal = calcBill ? calcBill.value : 'Rp 2.500.000';

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'staticQuoteModal';
    modalBackdrop.className = 'quote-modal-backdrop';
    modalBackdrop.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.65);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

    modalBackdrop.innerHTML = `
      <div class="quote-modal-card" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;max-width:560px;width:100%;padding:32px 28px;color:#0f172a;box-shadow:0 25px 60px rgba(0,0,0,0.18),0 4px 16px rgba(8,123,232,0.08);position:relative;max-height:92vh;overflow-y:auto;font-family:inherit;">
        <button type="button" id="closeStaticModalBtn" aria-label="Tutup" style="position:absolute;top:20px;right:20px;background:#f1f5f9;border:1px solid #e2e8f0;color:#475569;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;">✕</button>
        <div id="staticModalBody">
          <div style="margin-bottom:18px;">
            <span style="font-size:11px;font-weight:800;letter-spacing:2px;color:#0284c7;text-transform:uppercase;">PT SUNBLIX ENERGI INDONESIA</span>
            <h3 style="margin:6px 0 8px;font-size:22px;font-weight:800;color:#031f45;letter-spacing:-0.3px;">Permintaan Penawaran Resmi (PDF)</h3>
            <p style="margin:0;font-size:13.5px;color:#64748b;line-height:1.5;">Dapatkan estimasi teknis, analisis ROI, dan proposal resmi Siap Pakai langsung ke email dan WhatsApp Anda.</p>
          </div>

          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:#0369a1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div>
              <strong style="color:#0284c7;font-size:13px;display:block;">${currentSolarSystem.sysName}</strong>
              <span style="font-size:11.5px;color:#475569;">${currentSolarSystem.kwp} kWp • ${currentSolarSystem.panels} Panel Astronergy 585Wp • ${currentSolarSystem.battery}</span>
            </div>
            <div style="text-align:right;">
              <strong style="color:#0f172a;display:block;font-size:12.5px;">Est. ${formatRupiah(currentSolarSystem.estInvestment)}</strong>
              <span style="font-size:11px;color:#16a34a;font-weight:700;">ROI: ~${currentSolarSystem.paybackYears} Thn</span>
            </div>
          </div>

          <form id="staticQuoteForm" style="display:grid;gap:14px;">
            <div>
              <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Nama Lengkap *</label>
              <input type="text" id="sqName" required placeholder="Contoh: Bpk. Haris Setiawan" style="width:100%;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:14px;outline:none;box-sizing:border-box;" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Nomor WhatsApp *</label>
                <input type="tel" id="sqWa" required placeholder="081234567890" style="width:100%;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:14px;outline:none;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Alamat Email *</label>
                <input type="email" id="sqEmail" required placeholder="email@anda.com" style="width:100%;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:14px;outline:none;box-sizing:border-box;" />
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Kota / Kabupaten *</label>
                <input type="text" id="sqCity" required placeholder="Contoh: Jakarta Selatan" style="width:100%;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:14px;outline:none;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Daya Listrik PLN</label>
                <select id="sqPower" style="width:100%;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:14px;outline:none;box-sizing:border-box;">
                  <option value="1.300 VA">1.300 VA</option>
                  <option value="2.200 VA" selected>2.200 VA</option>
                  <option value="3.500 - 5.500 VA">3.500 – 5.500 VA</option>
                  <option value="6.600 - 11.000 VA">6.600 – 11.000 VA</option>
                  <option value="> 11.000 VA (3-Phase)">Di atas 11.000 VA (3 Phase)</option>
                </select>
              </div>
            </div>
            <div>
              <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Catatan Kebutuhan / Tipe Atap (Opsional)</label>
              <textarea id="sqNotes" rows="2" placeholder="Misal: Atap genteng bitumen, butuh backup inverter 24 jam..." style="width:100%;padding:10px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:13px;outline:none;resize:none;box-sizing:border-box;"></textarea>
            </div>
            <button type="submit" style="margin-top:10px;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#fff;border:none;font-size:14px;font-weight:800;letter-spacing:0.3px;cursor:pointer;box-shadow:0 8px 20px rgba(2, 132, 199, 0.3);display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.2s ease;">
              Kirim Permintaan Penawaran Resmi →
            </button>
            <div style="font-size:11.5px;color:#64748b;text-align:center;margin-top:6px;">
              🛡️ Privasi data Anda terjamin. Tim engineer SUNBLIX akan menghubungi dalam 1x24 jam.
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const closeBtn = document.getElementById('closeStaticModalBtn');
    if (closeBtn) closeBtn.onclick = () => modalBackdrop.remove();
    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) modalBackdrop.remove();
    };

    const sqForm = document.getElementById('staticQuoteForm');
    if (sqForm) {
      sqForm.onsubmit = (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('sqName').value;
        const waVal = document.getElementById('sqWa').value;
        const emailVal = document.getElementById('sqEmail').value;
        const cityVal = document.getElementById('sqCity').value;
        const powerVal = document.getElementById('sqPower').value;
        const notesVal = document.getElementById('sqNotes').value;
        const quoteCode = 'SBX-Q' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

        const modalBody = document.getElementById('staticModalBody');
        if (modalBody) {
          modalBody.innerHTML = `
            <div style="text-align:center;padding:16px 8px;">
              <div style="width:64px;height:64px;border-radius:50%;background:#ecfdf5;border:2px solid #10b981;color:#10b981;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px;">✓</div>
              <h3 style="font-size:22px;font-weight:800;margin:0 0 10px;color:#031f45;">Permintaan Penawaran Berhasil!</h3>
              <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 20px;">
                Terima kasih Bpk/Ibu <strong>${nameVal}</strong>. Tim spesialis teknis SUNBLIX sedang menyusun rincian proposal teknis untuk lokasi <strong>${cityVal}</strong>.
              </p>
              <div style="background:#f0f9ff;border:1.5px dashed #38bdf8;border-radius:14px;padding:14px;margin-bottom:24px;">
                <span style="font-size:11px;color:#0369a1;display:block;margin-bottom:4px;font-weight:700;">NOMOR REFERENSI PENAWARAN:</span>
                <strong style="font-size:19px;color:#0284c7;letter-spacing:1px;">${quoteCode}</strong>
              </div>
              <div style="display:grid;gap:10px;">
                <button type="button" id="printQuoteBtn" style="padding:14px;border-radius:12px;background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#fff;border:none;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 20px rgba(2, 132, 199, 0.25);">
                  📥 Unduh / Simpan Penawaran Resmi (PDF)
                </button>
                <a href="/brosur?customer=${encodeURIComponent(nameVal || '')}&project=${encodeURIComponent(currentSolarSystem.sysName || '')}&docNo=${encodeURIComponent(quoteCode)}" target="_blank" rel="noopener noreferrer" style="padding:12px;border-radius:12px;background:#f8fafc;border:1.5px solid #0284c7;color:#0284c7;font-size:13px;font-weight:700;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
                  ✨ Buka di Generator Brosur Lengkap (3 Halaman) ↗
                </a>
                <button type="button" id="waDirectBtn" style="padding:14px;border-radius:12px;background:#25D366;color:#fff;border:none;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 20px rgba(37, 211, 102, 0.25);">
                  💬 Lanjut Hubungi via WhatsApp (Respon Cepat)
                </button>
                <button type="button" id="closeDoneBtn" style="padding:12px;border-radius:12px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;font-size:13px;font-weight:600;cursor:pointer;">
                  Tutup Jendela
                </button>
              </div>
            </div>
          `;

          document.getElementById('closeDoneBtn').onclick = () => modalBackdrop.remove();

          document.getElementById('waDirectBtn').onclick = () => {
            const waText = `Halo Tim Ahli SUNBLIX, saya telah mengisi formulir penawaran resmi di website dengan No. Ref: *${quoteCode}*.\n\n*Nama:* ${nameVal}\n*Lokasi:* ${cityVal}\n*Daya PLN:* ${powerVal}\n*Tagihan Listrik:* ${billVal}\n*Paket Terpilih:* ${currentSolarSystem.sysName} (${currentSolarSystem.kwp} kWp, ${currentSolarSystem.panels} Panel Astronergy 585Wp, ${currentSolarSystem.battery})\n*Estimasi Nilai Paket:* ${formatRupiah(currentSolarSystem.estInvestment)}\n*Estimasi Hemat:* ${formatRupiah(currentSolarSystem.estSavings)}/bln (~${currentSolarSystem.savingsPct}%)\n*Estimasi Balik Modal:* ~${currentSolarSystem.paybackYears} Tahun\n\nMohon info ketersediaan jadwal survei lokasi dan estimasi proposal resminya.`;
            window.open('https://wa.me/6285288581027?text=' + encodeURIComponent(waText), '_blank');
          };

          document.getElementById('printQuoteBtn').onclick = () => {
            const pWin = window.open('', '_blank');
            if (!pWin) return;
            const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            pWin.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Penawaran Resmi SUNBLIX - ${quoteCode}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
    .sunblix-kop-surat { width: 100%; margin-bottom: 8px; background: #ffffff; }
    .kop-main-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 2px; }
    .kop-logo-col { display: flex; align-items: center; }
    .kop-logo-img { height: 52px; width: auto; max-width: 250px; object-fit: contain; display: block; }
    .kop-contact-col { border-left: 1.5px solid #0066cc; padding-left: 14px; display: flex; flex-direction: column; gap: 3px; align-items: flex-start; text-align: left; }
    .kop-company-title { font-size: 13.5px; font-weight: 850; color: #0066cc; letter-spacing: 0.3px; line-height: 1.2; }
    .kop-address-row { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #334155; font-weight: 500; line-height: 1.3; }
    .kop-pin-icon { flex-shrink: 0; stroke: #0066cc; }
    .kop-contacts-row { display: flex; align-items: center; gap: 6px; font-size: 9.5px; color: #334155; font-weight: 500; flex-wrap: nowrap; }
    .kop-contact-item { display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
    .kop-contact-item svg { stroke: #0066cc; flex-shrink: 0; }
    .kop-sep { color: #94a3b8; font-size: 9px; }
    .kop-tricolor-bar { display: flex; width: 100%; height: 2.5px; margin-top: 5px; margin-bottom: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .kop-tricolor-bar .bar-blue { flex: 70; background: #0066cc; height: 100%; }
    .kop-tricolor-bar .bar-gold { flex: 20; background: #f59e0b; height: 100%; }
    .kop-tricolor-bar .bar-green { flex: 10; background: #10b981; height: 100%; }
    .doc-header-row { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 16px; }
    .doc-title { font-size: 16px; font-weight: 850; color: #041c3e; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .doc-meta { text-align: right; }
    .ref-badge { display: inline-block; background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; padding: 3px 8px; border-radius: 5px; font-family: monospace; font-size: 12px; font-weight: 700; }
    .date { font-size: 11px; color: #64748b; margin-top: 4px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #041c3e; border-left: 4px solid #087be8; padding-left: 8px; margin: 18px 0 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
    .info-item { font-size: 12px; }
    .info-label { color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 600; }
    .info-val { font-weight: 700; color: #0f172a; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #041c3e; color: #ffffff; font-size: 11px; text-transform: uppercase; padding: 8px 12px; text-align: left; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .highlight-box { margin-top: 16px; background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); border: 1px solid #86efac; border-radius: 8px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
    .highlight-label { font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; }
    .highlight-val { font-size: 20px; font-weight: 900; color: #15803d; }
    .highlight-sub { font-size: 11px; color: #0369a1; font-weight: 600; }
    .guarantees { margin-top: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .guarantee-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #fafafa; }
    .guarantee-val { font-size: 14px; font-weight: 800; color: #087be8; display: block; }
    .guarantee-desc { font-size: 10.5px; color: #64748b; margin-top: 2px; }
    .footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; }
    .signature { text-align: right; display: flex; flex-direction: column; align-items: flex-end; min-width: 200px; }
    .signature-lead { font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 2px; }
    .signature-space { height: 52px; width: 100%; margin: 3px 0; }
    .signature-name { font-weight: 800; color: #041c3e; text-decoration: underline; font-size: 12.5px; }
    .signature-title { font-size: 10.5px; color: #64748b; margin-top: 2px; }
    .print-bar { margin-bottom: 20px; padding: 12px; background: #041c3e; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; }
    .btn-print { background: #16dbe0; color: #041c3e; font-weight: 800; padding: 8px 18px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
    @media print { .print-bar { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>📄 <strong>Dokumen Estimasi Penawaran Resmi SUNBLIX</strong> siap dicetak / disimpan sebagai PDF.</span>
    <button class="btn-print" onclick="window.print()">Simpan / Cetak PDF</button>
  </div>
  <div class="sunblix-kop-surat">
    <div class="kop-main-row">
      <div class="kop-logo-col">
        <img src="/asset/logo.png" alt="SUNBLIX - Power Your World" class="kop-logo-img">
      </div>
      <div class="kop-contact-col">
        <div class="kop-company-title">PT SUNBLIX ENERGI INDONESIA</div>
        <div class="kop-address-row">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#0066cc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="kop-pin-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>Bintaro Business Centre, Jl. RC. Veteran No. 1-I, Bintaro, Jakarta Selatan 12330</span>
        </div>
        <div class="kop-contacts-row">
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>sunblix.id</span>
          </span>
          <span class="kop-sep">|</span>
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>021 7362 639</span>
          </span>
          <span class="kop-sep">|</span>
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>085288581027</span>
          </span>
          <span class="kop-sep">|</span>
          <span class="kop-contact-item">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>hello@sunblix.id</span>
          </span>
        </div>
      </div>
    </div>
    <div class="kop-tricolor-bar">
      <div class="bar-blue"></div>
      <div class="bar-gold"></div>
      <div class="bar-green"></div>
    </div>
  </div>
  <div class="doc-header-row">
    <div>
      <div class="doc-title">ESTIMASI PENAWARAN RESMI</div>
      <div class="doc-sub">Smart Rooftop &amp; Solar Engineering Solutions</div>
    </div>
    <div class="doc-meta">
      <div class="ref-badge">${quoteCode}</div>
      <div class="date">Tanggal: ${dateStr}</div>
    </div>
  </div>
  <div class="section-title">1. Data Pemohon &amp; Lokasi Instalasi</div>
  <div class="info-grid">
    <div class="info-item"><span class="info-label">Nama Pemohon</span><span class="info-val">${nameVal}</span></div>
    <div class="info-item"><span class="info-label">Kota / Lokasi</span><span class="info-val">${cityVal}</span></div>
    <div class="info-item"><span class="info-label">WhatsApp</span><span class="info-val">${waVal}</span></div>
    <div class="info-item"><span class="info-label">Email</span><span class="info-val">${emailVal}</span></div>
    <div class="info-item"><span class="info-label">Daya PLN</span><span class="info-val">${powerVal}</span></div>
    <div class="info-item"><span class="info-label">Estimasi Tagihan</span><span class="info-val">${billVal}</span></div>
  </div>
  <div class="section-title">2. Rekomendasi Konfigurasi Sistem PLTS Siap Pakai</div>
  <table>
    <thead><tr><th>Komponen</th><th>Spesifikasi</th><th>Keterangan</th></tr></thead>
    <tbody>
      <tr><td><strong>Paket Solusi</strong></td><td><strong>${currentSolarSystem.sysName}</strong></td><td>Paket Siap Pakai SPH 002 (Mode HPP A)</td></tr>
      <tr><td><strong>Konfigurasi Sistem</strong></td><td><strong>${currentSolarSystem.systemType}</strong></td><td>${currentSolarSystem.systemTypeId === 'hybrid' ? 'Smart BESS (Cadangan Daya Otomatis 24 Jam)' : 'Grid-Tie Self-Consumption (Efisiensi Siang Hari)'}</td></tr>
      <tr><td><strong>Daya Terpasang</strong></td><td><strong>${currentSolarSystem.kwp} kWp</strong></td><td>Estimasi produksi ~${currentSolarSystem.monthlyKwh.toLocaleString('id-ID')} kWh/bulan</td></tr>
      <tr><td><strong>Modul Surya</strong></td><td>${currentSolarSystem.panels} Unit Modul</td><td>Astronergy N-Type TOPCon Bifacial 585 Wp</td></tr>
      <tr><td><strong>Inverter</strong></td><td>${currentSolarSystem.inverter} (${currentSolarSystem.inverterDesc})</td><td>Efisiensi 98.6% + Dual/Multi MPPT + Proteksi Petir</td></tr>
      <tr><td><strong>Baterai BESS</strong></td><td>${currentSolarSystem.battery}</td><td>${currentSolarSystem.systemTypeId === 'hybrid' ? 'BESS LiFePO4 Deye High Cycle Life' : 'Sistem On-Grid tanpa baterai penyimpanan'}</td></tr>
      <tr><td><strong>Luas Atap Diperlukan</strong></td><td>~${currentSolarSystem.area}</td><td>Struktur mounting aluminium SNI anti-korosi</td></tr>
      <tr><td><strong>Monitoring IoT</strong></td><td>SUNBLIX IoT Cloud Live Mobile App</td><td>Pantau performa real-time 24/7</td></tr>
    </tbody>
  </table>
  <div class="highlight-box">
    <div>
      <div class="highlight-label">Potensi Penghematan Listrik</div>
      <div class="highlight-val">${formatRupiah(currentSolarSystem.estSavings)} / Bulan</div>
      <div class="highlight-sub">Hemat ~${currentSolarSystem.savingsPct}% tagihan PLN</div>
    </div>
    <div style="text-align:right;">
      <div class="highlight-label" style="color:#0369a1;">Estimasi Nilai Paket (SPH)</div>
      <div class="highlight-val" style="color:#0284c7;font-size:18px;">${formatRupiah(currentSolarSystem.estInvestment)}</div>
      <div class="highlight-sub">Balik Modal (BEP): ~${currentSolarSystem.paybackYears} Tahun</div>
    </div>
  </div>
  <div class="section-title">3. Jaminan &amp; Layanan Purna Jual</div>
  <div class="guarantees">
    <div class="guarantee-card"><span class="guarantee-val">Resmi Pabrik</span><span class="guarantee-desc">Garansi Modul Surya 25-30 Tahun Sesuai Manufaktur</span></div>
    <div class="guarantee-card"><span class="guarantee-val">5 - 10 Tahun</span><span class="guarantee-desc">Garansi Resmi Inverter &amp; BESS Komponen</span></div>
    <div class="guarantee-card"><span class="guarantee-val">Full Support</span><span class="guarantee-desc">Dukungan Teknis &amp; Monitoring Sistem 24/7</span></div>
  </div>
  ${notesVal ? `<div class="section-title" style="margin-top:14px;">4. Catatan Khusus</div><div style="font-size:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;color:#92400e;">${notesVal}</div>` : ''}
  <div class="footer">
    <div><em>* Dokumen ini merupakan estimasi awal berbasis kalkulator surya resmi SUNBLIX.<br>Proposal final SPH dan gambar teknik CAD diterbitkan setelah survei lokasi.</em></div>
    <div class="signature">
      <div class="signature-lead">Tertanda Pemohon,</div>
      <div class="signature-space"></div>
      <div class="signature-name">${nameVal || 'Pemohon'}</div>
      <div class="signature-title">${cityVal ? `Lokasi: ${cityVal}` : 'Calon Pelanggan'}</div>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
</body>
</html>`);
            pWin.document.close();
          };
        }
      };
    }
  }

  if (btnCalculate) btnCalculate.addEventListener('click', openStaticQuoteModal);
  if (btnCalculateMobile) btnCalculateMobile.addEventListener('click', openStaticQuoteModal);

  // Wire all 'Get a Quote' buttons and anchors
  document.querySelectorAll('a[href="#quote"], .quote-button, .hero-button.secondary, .finale-btn-quote, #btnFinaleQuote, .btn-quote, [data-open-quote]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openStaticQuoteModal();
    });
  });

  // Global delegation for any quote button or link
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href="#quote"], .quote-button, .finale-btn-quote, #btnFinaleQuote, [data-open-quote]');
    if (target) {
      e.preventDefault();
      openStaticQuoteModal();
    }
  });

  // Initialize default calculation
  calculateSolar();

  // Mobile Drawer Toggle
  const menuButton = document.getElementById('menuButton');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');

  function openMobileDrawer() {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawer.classList.add('is-open');
      mobileDrawerBackdrop.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      mobileDrawerBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileDrawer() {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawer.classList.remove('is-open');
      mobileDrawerBackdrop.classList.remove('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      mobileDrawerBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (menuButton) menuButton.addEventListener('click', openMobileDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);

  document.querySelectorAll('.drawer-link, #drawerBtnQuote, #drawerLogoLink').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      closeMobileDrawer();
      if (!targetId || targetId === '#') return;

      if (milestones[targetId] !== undefined) {
        e.preventDefault();
        const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
        const targetScrollY = milestones[targetId] * maxScroll;
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      }
    });
  });

  // Mobile Tabs: Babak 5 (Why Sunblix: Team vs Reasons)
  const howCardWrapper = document.querySelector('.how-card-wrapper');
  const hmTabBtns = document.querySelectorAll('.hm-tab-btn');
  if (howCardWrapper) {
    howCardWrapper.setAttribute('data-active-tab', 'team');
  }
  hmTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hmTabBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const tab = btn.getAttribute('data-tab');
      if (howCardWrapper) {
        howCardWrapper.setAttribute('data-active-tab', tab);
      }
    });
  });

  // Mobile Tabs: Babak 6 (Projects: Calc vs Map vs Terms)
  const projectContainer = document.querySelector('.project-container');
  const pmTabBtns = document.querySelectorAll('.pm-tab-btn');
  if (projectContainer) {
    projectContainer.setAttribute('data-active-tab', 'calc');
  }
  pmTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pmTabBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const tab = btn.getAttribute('data-tab');
      if (projectContainer) {
        projectContainer.setAttribute('data-active-tab', tab);
      }
    });
  });

  // Footer Newsletter In-Place Feedback
  const footerSubscribeForm = document.getElementById('footerSubscribeForm');
  const subscribeToast = document.getElementById('subscribeToast');
  const subscribeEmail = document.getElementById('subscribeEmail');
  if (footerSubscribeForm) {
    footerSubscribeForm.addEventListener('submit', e => {
      e.preventDefault();
      if (subscribeToast) {
        subscribeToast.textContent = '✓ Terima kasih! Anda telah terdaftar untuk menerima pembaruan energi bersih SUNBLIX.';
        subscribeToast.classList.add('is-visible');
        if (subscribeEmail) subscribeEmail.value = '';
        setTimeout(() => {
          subscribeToast.classList.remove('is-visible');
        }, 5000);
      }
    });
  }
})();
