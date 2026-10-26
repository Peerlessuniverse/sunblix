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

    const aboutTrigger = document.getElementById('aboutDropdownTrigger');
    if (aboutTrigger) {
      if (['about', 'how-it-works', 'why-sunblix'].includes(currentId)) {
        aboutTrigger.classList.add('is-active');
      } else {
        aboutTrigger.classList.remove('is-active');
      }
    }
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
    const billVal = calcBill ? calcBill.value : 'Rp 2.500.000';
    let modal = document.getElementById('staticQuoteModal');

    // If modal already exists in DOM (index.html), populate and display it
    if (modal) {
      const estSysName = document.getElementById('sqEstSysName');
      const estSpecs = document.getElementById('sqEstSpecs');
      const estPrice = document.getElementById('sqEstPrice');
      const estRoi = document.getElementById('sqEstRoi');
      const billInput = document.getElementById('sqBill');

      if (estSysName) estSysName.textContent = currentSolarSystem.sysName || 'SUNBLIX 4.68 Hybrid';
      if (estSpecs) estSpecs.textContent = `${currentSolarSystem.kwp} kWp • ${currentSolarSystem.panels} Panel Astronergy 585Wp • ${currentSolarSystem.battery}`;
      if (estPrice) estPrice.textContent = `Est. ${formatRupiah(currentSolarSystem.estInvestment)}`;
      if (estRoi) estRoi.textContent = `ROI: ~${currentSolarSystem.paybackYears} Thn`;
      if (billInput && (!billInput.value || billInput.value === 'Rp 2.500.000')) {
        billInput.value = billVal;
      }

      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');

      const closeBtn = document.getElementById('closeStaticModalBtn');
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
        };
      }
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
        }
      };
    } else {
      // Dynamic fallback if modal is not in DOM
      modal = document.createElement('div');
      modal.id = 'staticQuoteModal';
      modal.className = 'quote-modal-backdrop';
      modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.65);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

      modal.innerHTML = `
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
                  <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Tagihan Listrik PLN / Bulan *</label>
                  <input type="text" id="sqBill" required placeholder="Contoh: Rp 2.500.000" value="${billVal}" style="width:100%;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #0284c7;color:#0284c7;font-size:14px;font-weight:700;outline:none;box-sizing:border-box;" />
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
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Kota / Kabupaten Lokasi Properti *</label>
                <input type="text" id="sqCity" required placeholder="Contoh: Denpasar / Badung / Jakarta Selatan" style="width:100%;padding:12px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:14px;outline:none;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;color:#1e293b;">Catatan Kebutuhan / Tipe Atap (Opsional)</label>
                <textarea id="sqNotes" rows="2" placeholder="Misal: Atap genteng keramik, butuh sistem hybrid cadangan 24 jam..." style="width:100%;padding:10px 14px;border-radius:10px;background:#f8fafc;border:1.5px solid #cbd5e1;color:#0f172a;font-size:13px;outline:none;resize:none;box-sizing:border-box;"></textarea>
              </div>
              <button type="submit" id="sqSubmitBtn" style="margin-top:8px;padding:15px 20px;border-radius:14px;background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#fff;border:none;font-size:15px;font-weight:800;letter-spacing:0.3px;cursor:pointer;box-shadow:0 8px 22px rgba(2, 132, 199, 0.35);display:flex;align-items:center;justify-content:center;gap:10px;transition:all 0.2s ease;">
                Kirim &amp; Konsultasikan
              </button>
              <div style="font-size:11.5px;color:#64748b;text-align:center;margin-top:4px;">
                🛡️ Privasi data Anda terjamin. Tim engineer SUNBLIX akan menghubungi dalam 1x24 jam.
              </div>
            </form>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const closeBtn = document.getElementById('closeStaticModalBtn');
      if (closeBtn) closeBtn.onclick = () => modal.remove();
      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };
    }

    const sqForm = document.getElementById('staticQuoteForm');
    if (sqForm) {
      sqForm.onsubmit = (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('sqName').value.trim();
        const waVal = document.getElementById('sqWa').value.trim();
        const emailVal = document.getElementById('sqEmail').value.trim();
        const cityVal = document.getElementById('sqCity').value.trim();
        const customBillVal = document.getElementById('sqBill') ? document.getElementById('sqBill').value.trim() : billVal;
        const powerVal = document.getElementById('sqPower').value;
        const notesVal = document.getElementById('sqNotes').value.trim();
        const quoteCode = 'SBX-Q' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

        // 1. Prepare standardized lead object
        const leadPayload = {
          quoteCode,
          name: nameVal,
          whatsapp: waVal,
          email: emailVal,
          city: cityVal,
          monthlyBill: customBillVal || billVal,
          plnPower: powerVal,
          notes: notesVal,
          systemRecommendation: currentSolarSystem.sysName || 'SUNBLIX 4.68 Hybrid',
          kwp: currentSolarSystem.kwp || '4.68',
          panels: currentSolarSystem.panels || 8,
          battery: currentSolarSystem.battery || 'LiFePO4 5.12 kWh',
          estInvestment: currentSolarSystem.estInvestment || 88600000,
          estSavings: currentSolarSystem.estSavings || 1850000,
          paybackYears: currentSolarSystem.paybackYears || 4.2,
          source: 'Web Get Quote (SURTI AI Handover)',
          timestamp: new Date().toISOString()
        };

        // 2. Persist in localStorage for SURTI Chat room to immediately load & greet
        try {
          localStorage.setItem('sunblix_pending_quote_surti', JSON.stringify(leadPayload));
          
          // Also sync to Central Sunblix OS Store (sunblix_os_store_v2)
          const rawStore = localStorage.getItem('sunblix_os_store_v2');
          if (rawStore) {
            const parsedStore = JSON.parse(rawStore);
            const newCrmLead = {
              id: quoteCode,
              name: nameVal,
              company: 'Residensial / Komersial',
              location: cityVal,
              phone: waVal,
              plnTariff: powerVal,
              targetKwp: `${leadPayload.kwp} kWp (${leadPayload.systemRecommendation})`,
              estValue: 'Rp ' + Number(leadPayload.estInvestment).toLocaleString('id-ID'),
              estValueNum: Number(leadPayload.estInvestment),
              stage: 'Kualifikasi',
              leadSource: 'Web Get Quote (SURTI AI)',
              assigned: 'SURTI AI',
              date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              notes: `Tagihan: ${leadPayload.monthlyBill}. Daya PLN: ${powerVal}. Catatan: ${notesVal || 'Permintaan penawaran via web.'}`
            };
            parsedStore.leads = [newCrmLead, ...(parsedStore.leads || [])];
            parsedStore.notifications = [{
              id: 'NTF-' + Date.now(),
              title: 'Prospek Baru dari Web Menghubungi SURTI AI',
              desc: `${nameVal} (${cityVal}) - Tagihan ${leadPayload.monthlyBill}. Sesi kualifikasi survei aktif.`,
              category: 'crm',
              targetNav: 'crm',
              icon: '🤖',
              time: 'Baru saja',
              isRead: false
            }, ...(parsedStore.notifications || [])];
            localStorage.setItem('sunblix_os_store_v2', JSON.stringify(parsedStore));
          }
        } catch (storageErr) {
          console.warn('Storage sync warning:', storageErr);
        }

        // 3. Post to API in background
        fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameVal,
            whatsapp: waVal,
            email: emailVal,
            city: cityVal,
            monthlyBill: leadPayload.monthlyBill,
            plnPower: powerVal,
            propertyType: 'Residensial / Komersial',
            systemRecommendation: leadPayload.systemRecommendation,
            notes: notesVal
          })
        }).catch(err => console.warn('[Quote Submit API Error]:', err));

        // 4. Show transition UI then redirect directly to SURTI
        const modalBody = document.getElementById('staticModalBody');
        if (modalBody) {
          modalBody.innerHTML = `
            <div style="text-align:center;padding:28px 16px;">
              <div style="width:68px;height:68px;border-radius:50%;background:#e0f2fe;border:2px solid #0284c7;color:#0284c7;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;animation:pulse 1.5s infinite;">🤖</div>
              <h3 style="font-size:22px;font-weight:800;margin:0 0 10px;color:#031f45;">Menghubungkan ke SURTI AI...</h3>
              <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 16px;">
                Terima kasih Bpk/Ibu <strong>${nameVal}</strong>. Data tagihan listrik <strong>${leadPayload.monthlyBill}</strong> untuk lokasi <strong>${cityVal}</strong> sedang diteruskan ke ruang konsultasi interaktif SURTI AI.
              </p>
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:12px;font-size:13px;color:#0369a1;font-weight:600;margin-bottom:20px;">
                Mengalihkan Anda ke ruang chat dalam hitungan detik...
              </div>
              <a href="/surti?from=quote&code=${encodeURIComponent(quoteCode)}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#0284c7;color:#fff;text-decoration:none;font-weight:700;font-size:14px;">
                Klik Disini Jika Tidak Dialihkan Otomatis ➔
              </a>
            </div>
          `;
        }

        // Direct redirect to SURTI chat
        setTimeout(() => {
          window.location.href = '/surti?from=quote&code=' + encodeURIComponent(quoteCode);
        }, 900);
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

  // Drawer links click
  document.querySelectorAll('.drawer-link:not(.drawer-dropdown-trigger), #drawerBtnQuote, #drawerLogoLink').forEach(link => {
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

  // Mobile Drawer About Us Submenu Accordion
  const drawerAboutTrigger = document.getElementById('drawerAboutTrigger');
  const drawerAboutSublinks = document.getElementById('drawerAboutSublinks');
  const drawerAboutChevron = document.getElementById('drawerAboutChevron');

  if (drawerAboutTrigger && drawerAboutSublinks) {
    drawerAboutTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = drawerAboutSublinks.style.display === 'none';
      drawerAboutSublinks.style.display = isHidden ? 'flex' : 'none';
      drawerAboutTrigger.classList.toggle('is-expanded', isHidden);
      if (drawerAboutChevron) {
        drawerAboutChevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
      drawerAboutTrigger.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  // Handle drawer sublinks click
  document.querySelectorAll('.drawer-sublink').forEach(link => {
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

  // Desktop Dropdown Close on Outside Click
  const navAboutDropdown = document.getElementById('navAboutDropdown');
  const aboutDropdownTrigger = document.getElementById('aboutDropdownTrigger');
  if (navAboutDropdown && aboutDropdownTrigger) {
    document.addEventListener('click', (e) => {
      if (!navAboutDropdown.contains(e.target)) {
        navAboutDropdown.classList.remove('is-open');
        aboutDropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

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

  // ==========================================================================
  // CATALOGUE DOWNLOAD POPUP MODAL (SUNBLIX OFFICIAL 2026)
  // ==========================================================================
  const catalogueModal = document.getElementById('catalogueModal');
  const closeCatModalBtn = document.getElementById('closeCatalogueModalBtn');
  const catDownloadForm = document.getElementById('catalogueDownloadForm');
  const catFormView = document.getElementById('catalogueFormView');
  const catSuccessView = document.getElementById('catalogueSuccessView');
  const catSuccessCloseBtn = document.getElementById('catSuccessCloseBtn');
  const catSubmitBtn = document.getElementById('catSubmitBtn');
  const catSubmitText = document.getElementById('catSubmitText');
  const catSuccessGreeting = document.getElementById('catSuccessGreeting');
  const catSuccessWaBtn = document.getElementById('catSuccessWaBtn');

  function openCatalogueModal() {
    if (!catalogueModal) return;
    catalogueModal.style.display = 'flex';
    // Force reflow
    void catalogueModal.offsetWidth;
    catalogueModal.classList.add('is-open');
    catalogueModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Reset view if previously submitted
    if (catFormView) catFormView.style.display = 'block';
    if (catSuccessView) catSuccessView.style.display = 'none';
    if (catSubmitBtn) catSubmitBtn.disabled = false;
    if (catSubmitText) catSubmitText.textContent = 'Download Katalog PDF (15 Hal)';

    const firstInput = document.getElementById('catName');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  }

  function closeCatalogueModal() {
    if (!catalogueModal) return;
    catalogueModal.classList.remove('is-open');
    catalogueModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      catalogueModal.style.display = 'none';
    }, 280);
  }

  // Bind catalogue triggers
  const heroBtnCatalogue = document.getElementById('heroBtnCatalogue');
  if (heroBtnCatalogue) {
    heroBtnCatalogue.addEventListener('click', (e) => {
      e.preventDefault();
      openCatalogueModal();
    });
  }

  document.querySelectorAll('[data-open-catalogue="true"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCatalogueModal();
    });
  });

  if (closeCatModalBtn) closeCatModalBtn.addEventListener('click', closeCatalogueModal);
  if (catSuccessCloseBtn) catSuccessCloseBtn.addEventListener('click', closeCatalogueModal);

  if (catalogueModal) {
    catalogueModal.addEventListener('click', (e) => {
      if (e.target === catalogueModal) {
        closeCatalogueModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && catalogueModal && catalogueModal.classList.contains('is-open')) {
      closeCatalogueModal();
    }
  });

  // Handle Form Submission
  if (catDownloadForm) {
    catDownloadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('catName')?.value || '').trim();
      const email = (document.getElementById('catEmail')?.value || '').trim();
      const phone = (document.getElementById('catWa')?.value || '').trim();
      const sendWa = document.getElementById('catSendWa')?.checked;

      if (!name || !email || !phone) return;

      if (catSubmitBtn) catSubmitBtn.disabled = true;
      if (catSubmitText) catSubmitText.textContent = '⚡ Menyiapkan Unduhan PDF...';

      // 1. Trigger Direct Download of Catalogue PDF
      const pdfPath = '/SUNBLIX_KATALOG_2026.pdf';
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfPath;
      downloadLink.download = 'SUNBLIX_KATALOG_2026_Solar_Specialist.pdf';
      downloadLink.target = '_blank';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => downloadLink.remove(), 200);

      // 2. Sync lead to Sunblix OS Store CRM
      try {
        const STORAGE_KEY = 'sunblix_os_store_v3';
        const rawStore = localStorage.getItem(STORAGE_KEY);
        let store = rawStore ? JSON.parse(rawStore) : { leads: [], projects: [], invoices: [], tasks: [], notifications: [] };
        if (!Array.isArray(store.leads)) store.leads = [];
        if (!Array.isArray(store.notifications)) store.notifications = [];

        const leadId = `LD-CAT-${Date.now().toString().slice(-4)}`;
        const newLead = {
          id: leadId,
          name: name,
          company: 'Unduh Katalog Resmi (15 Hal)',
          location: 'Website Hero Form',
          phone: phone,
          plnTariff: 'Residential / Commercial',
          targetKwp: 'Katalog Edisi 2026 (Standard+, PRO, PRO MAX)',
          estValue: 'Rp 63.500.000 - Rp 310.600.000',
          estValueNum: 88600000,
          stage: 'Kualifikasi',
          stageColor: 'cyan',
          date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          notes: `Prospek mendownload katalog resmi SUNBLIX 2026 dari tombol Hero. Email: ${email}, WA: ${phone}. Opsi kirim WA: ${sendWa ? 'Ya' : 'Tidak'}.`,
        };
        store.leads.unshift(newLead);

        // Add Notification in Sunblix OS
        store.notifications.unshift({
          id: `NTF-${Date.now()}`,
          time: 'Baru saja',
          isRead: false,
          category: 'crm',
          title: `📥 Unduhan Katalog Baru: ${name}`,
          desc: `${name} (${phone}) mengunduh katalog PDF resmi 2026. Prospek telah masuk ke CRM.`,
          targetNav: 'crm',
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (err) {
        console.warn('Could not store lead in localStorage:', err);
      }

      // 3. Send lead to backend API asynchronously
      fetch('/api/surti/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_lead',
          name,
          email,
          phone,
          customerType: 'residential',
          city: 'Indonesia',
          source: 'Hero Catalogue Download',
          notes: `Mengunduh katalog resmi 15 hal. Send WA: ${sendWa ? 'true' : 'false'}.`,
        }),
      }).catch((err) => console.log('API Lead sync background:', err));

      // 4. Update Success View
      if (catSuccessGreeting) {
        catSuccessGreeting.innerHTML = `Terima kasih, <strong>${name}</strong>!<br>File PDF resmi <strong>SUNBLIX_KATALOG_2026.pdf</strong> telah terunduh ke perangkat Anda.`;
      }
      if (catSuccessWaBtn) {
        const waText = encodeURIComponent(`Halo SUNBLIX, saya ${name} baru saja mendownload katalog resmi 2026 dan ingin berkonsultasi mengenai solusi PLTS.`);
        catSuccessWaBtn.href = `https://wa.me/6285288581027?text=${waText}`;
      }

      // Transition to Success Screen
      setTimeout(() => {
        if (catFormView) catFormView.style.display = 'none';
        if (catSuccessView) catSuccessView.style.display = 'block';
      }, 500);
    });
  }
})();
