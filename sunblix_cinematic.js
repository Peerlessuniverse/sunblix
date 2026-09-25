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
    const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = clamp(scrollY / maxScroll);

    // Navbar state
    nav.classList.toggle('scrolled', scrollY > 20);

    /*
      ONE CAMERA PUSH:
      Smooth continuous push into the solar home.
    */
    const cameraT = ease(clamp(progress / 0.65));
    const scale = 1.015 + cameraT * 0.20;
    heroBg.style.transform = `scale(${scale})`;

    /* Atmospheric curtain: blooms in gently */
    const curtainT = ease(clamp((progress - 0.08) / 0.26));
    curtain.style.opacity = String(curtainT * 0.88);
    curtain.style.transform = `translate3d(${(-4 + 4 * curtainT)}%,0,0) scaleX(${0.96 + 0.04 * curtainT})`;

    /* Hero copy leaves as scroll begins */
    const heroTextT = ease(clamp((progress - 0.12) / 0.18));
    heroContent.style.opacity = String(1 - heroTextT);
    heroContent.style.transform = `translateY(-50%) translate3d(0,${-22 * heroTextT}px,0)`;

    /*
      SCENE 2 (OUR PURPOSE):
      Enters: 0.20 -> 0.26
      Solid Plateau: 0.26 -> 0.44
      Exits: 0.44 -> 0.48
    */
    const scene2In = ease(clamp((progress - 0.20) / 0.06));
    const scene2Out = 1 - ease(clamp((progress - 0.44) / 0.04));
    const scene2T = scene2In * scene2Out;

    sceneTwo.style.opacity = String(scene2T);
    sceneTwo.classList.toggle('is-active', scene2T > 0.01);
    sceneTwo.classList.toggle('ready', scene2In > 0.95 && scene2Out > 0.35);

    /* Purpose wash (white atmospheric bloom on left) */
    const washT = ease(clamp((progress - 0.18) / 0.08));
    purposeWash.style.opacity = String(0.95 * washT);
    purposeWash.style.transform = `translateX(${(-2 + 2 * washT)}%)`;

    /* Purpose text content (eyebrow, title, description, features) */
    const copyT = ease(clamp((progress - 0.22) / 0.08));
    purposeContent.style.opacity = String(copyT);
    purposeContent.style.transform = `translate3d(0,${24 - 24 * copyT}px,0)`;
    purposeContent.style.filter = `blur(${6 - 6 * copyT}px)`;

    /* Energy route line */
    const energyT = ease(clamp((progress - 0.26) / 0.12)) * scene2Out;
    energySystem.style.opacity = String(energyT);

    /* Story Card */
    const cardT = ease(clamp((progress - 0.28) / 0.10));
    storyCard.style.opacity = String(cardT * scene2Out);
    storyCard.style.transform = `translate3d(0,${24 - 24 * cardT}px,0)`;
    storyCard.style.filter = `blur(${5 - 5 * cardT}px)`;

    /* Energy Pulse (travels from roof panel -> house/story card) */
    const pulseT = ease(clamp((progress - 0.30) / 0.14));
    const pt = pointOnPath(pulseT);
    energyPulse.style.left = pt[0] + '%';
    energyPulse.style.top = pt[1] + '%';
    energyPulse.style.opacity = String(pulseT * scene2Out);

    /* Story Card energy reception effect when pulse arrives */
    if (storyCard) {
      storyCard.classList.toggle('has-energy', pulseT > 0.80 && scene2Out > 0.15);
    }

    /*
      BABAK 3: PRODUCT DISCOVERY (RESIDENTIAL TIERS)
      Enters: 0.46 -> 0.50
      Photos reveal upwards: 0.50 -> 0.60
      Plateau: 0.60 -> 0.66
      Exits: 0.66 -> 0.70
    */
    const productStart = 0.46;
    const productEnd = 0.50;
    const revealStart = 0.50;
    const revealEnd = 0.60;
    const productExitStart = 0.66;
    const productExitEnd = 0.70;

    const productIn = ease(clamp((progress - productStart) / (productEnd - productStart)));
    const productOut = 1 - ease(clamp((progress - productExitStart) / (productExitEnd - productExitStart)));
    const productOpacity = productIn * productOut;

    // Reveal progress (0 to 1) for the houses unfolding upwards
    const revealP = ease(clamp((progress - revealStart) / (revealEnd - revealStart)));
    productShell.style.setProperty('--reveal', revealP.toFixed(4));

    productShell.style.opacity = String(productOpacity);
    productShell.style.visibility = productOpacity > 0.005 ? 'visible' : 'hidden';
    productShell.style.pointerEvents = productOpacity > 0.2 ? 'auto' : 'none';
    productShell.style.transform = `translate3d(0,${20 * (1 - productIn) - 20 * (1 - productOut)}px,0) scale(${0.99 + 0.01 * productIn})`;

    /*
      BABAK 4: FROM SUNLIGHT TO YOUR HOME (systemShell)
      Enters: 0.70 -> 0.73
      Plateau: 0.73 -> 0.78
      Exits: 0.78 -> 0.81
    */
    const systemStart = 0.70;
    const systemEnd = 0.73;
    const systemExitStart = 0.78;
    const systemExitEnd = 0.81;

    const systemIn = ease(clamp((progress - systemStart) / (systemEnd - systemStart)));
    const systemOut = 1 - ease(clamp((progress - systemExitStart) / (systemExitEnd - systemExitStart)));
    const systemOpacity = systemIn * systemOut;

    systemShell.style.opacity = String(systemOpacity);
    systemShell.style.visibility = systemOpacity > 0.005 ? 'visible' : 'hidden';
    systemShell.style.pointerEvents = systemOpacity > 0.2 ? 'auto' : 'none';
    systemShell.style.transform = `translate3d(0,${28 * (1 - systemIn) - 20 * (1 - systemOut)}px,0) scale(${0.98 + 0.02 * systemIn})`;

    /*
      BABAK 5: WHY GO WITH SUNBLIX (5 INTERACTIVE CARDS)
      Enters: 0.81 -> 0.84
      Plateau: 0.84 -> 0.89
      Exits: 0.89 -> 0.92
    */
    const howStart = 0.81;
    const howEnd = 0.84;
    const howExitStart = 0.89;
    const howExitEnd = 0.92;

    const howIn = ease(clamp((progress - howStart) / (howEnd - howStart)));
    const howOut = 1 - ease(clamp((progress - howExitStart) / (howExitEnd - howExitStart)));
    const howOpacity = howIn * howOut;

    howShell.style.opacity = String(howOpacity);
    howShell.style.visibility = howOpacity > 0.005 ? 'visible' : 'hidden';
    howShell.style.pointerEvents = howOpacity > 0.2 ? 'auto' : 'none';
    howShell.style.transform = `translate3d(0,${28 * (1 - howIn) - 20 * (1 - howOut)}px,0) scale(${0.98 + 0.02 * howIn})`;

    /*
      BABAK 6: PROJECTS & HORIZONTAL SOLAR CALCULATOR
      Enters: 0.90 -> 0.93
      Plateau: 0.93 -> 0.95
      Holds visible beneath Babak 7 sheet reveal: 0.95 -> 1.00
    */
    const projectStart = 0.90;
    const projectEnd = 0.93;

    const projectT = ease(clamp((progress - projectStart) / (projectEnd - projectStart)));
    if (projectShell) {
      projectShell.style.opacity = String(projectT);
      projectShell.style.visibility = projectT > 0.005 ? 'visible' : 'hidden';
      projectShell.style.pointerEvents = (projectT > 0.2 && progress < 0.96) ? 'auto' : 'none';
      projectShell.style.transform = `translate3d(0,${32 * (1 - projectT)}px,0) scale(${0.98 + 0.02 * projectT})`;
    }

    /*
      BABAK 7: THE EPIC FINALE (PANORAMA HORIZON & SUNBLIX FOOTER)
      Cinematic Sheet Reveal: slides up smoothly from below
      Slides Up: 0.94 -> 1.00
      Fully docked at 1.00
    */
    const finaleStart = 0.94;
    const finaleEnd = 1.00;
    const finaleT = ease(clamp((progress - finaleStart) / (finaleEnd - finaleStart)));
    if (finaleShell) {
      const translateY = (1 - finaleT) * 100;
      finaleShell.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0)`;
      finaleShell.style.visibility = finaleT > 0.002 ? 'visible' : 'hidden';
      finaleShell.style.pointerEvents = finaleT > 0.4 ? 'auto' : 'none';
    }

    // Scene 3 overall state & nav styling
    const scene3In = ease(clamp((progress - 0.44) / 0.04));
    sceneThree.style.opacity = String(scene3In);
    sceneThree.classList.toggle('is-active', scene3In > 0.01);
    nav.classList.toggle('scene3-nav', scene3In > 0.08);

    // Hero bottom categories and scroll indicators
    heroBottom.style.opacity = String(1 - ease(clamp((progress - 0.20) / 0.15)));
    scrollHint.style.opacity = String(1 - clamp(progress / 0.10));
    scrollProgress.style.height = (progress * 100) + '%';
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);

  // Preloader Animation Timeline:
  function runPreloaderAnimation() {
    setTimeout(() => {
      if (!navLogo || !loaderLogoWrap || !pageLoader) {
        document.body.classList.remove('is-loading');
        return;
      }

      const targetRect = navLogo.getBoundingClientRect();
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      loaderLogoWrap.classList.add('moving');
      loaderLogoWrap.style.left = `${targetCenterX}px`;
      loaderLogoWrap.style.top = `${targetCenterY}px`;
      loaderLogoWrap.style.width = `${targetRect.width}px`;

      pageLoader.classList.add('fade-out');

      setTimeout(() => {
        document.body.classList.remove('is-loading');
        if (loaderLogoWrap) loaderLogoWrap.style.display = 'none';
        if (pageLoader) pageLoader.style.display = 'none';
        requestRender();
      }, 1050);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPreloaderAnimation);
  } else {
    runPreloaderAnimation();
  }

  // Initial render
  requestRender();

  // Modal Handlers
  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (modalVideo) {
      modalVideo.currentTime = 0;
      modalVideo.play().catch(e => {
        console.warn('Video auto-playback notice:', e);
      });
    }
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (modalVideo) {
      modalVideo.pause();
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

  // Fast smooth scroll navigation on navbar clicks (Solutions, Products, How It Works, Why SUNBLIX, Projects)
  const milestones = {
    '#home': 0.00,
    '#solutions': 0.38,
    '#products': 0.55,
    '#how-it-works': 0.74,
    '#why-sunblix': 0.85,
    '#projects': 0.93,
    '#residential': 0.55,
    '#commercial': 0.58,
    '#energy-storage': 0.74,
    '#quote': 1.00
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
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
  // BABAK 6: HORIZONTAL SOLAR CALCULATOR
  // ============================================================
  const calcProperty = document.getElementById('calcProperty');
  const calcBill = document.getElementById('calcBill');
  const calcRooftop = document.getElementById('calcRooftop');
  const btnCalculate = document.getElementById('btnCalculate');
  const quickBillBtns = document.querySelectorAll('.quick-bill-btn');

  const resSystemName = document.getElementById('resSystemName');
  const resKwp = document.getElementById('resKwp');
  const resPanels = document.getElementById('resPanels');
  const resArea = document.getElementById('resArea');
  const resInverter = document.getElementById('resInverter');
  const resSavings = document.getElementById('resSavings');
  const resSavingsPct = document.getElementById('resSavingsPct');
  const resProduction = document.getElementById('resProduction');
  const resCo2 = document.getElementById('resCo2');
  const calcResultCard = document.getElementById('calcResultCard');

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

    let mult = 1.0;
    if (property === 'villa') mult = 1.15;
    else if (property === 'commercial') mult = 1.25;
    else if (property === 'warehouse') mult = 1.4;

    const adjustedBill = rawBill * mult;

    let sysName = 'SUNBLIX 4.68';
    let kwp = '4.68';
    let kwpNum = 4.68;
    let panels = '8';
    let area = '26 m²';
    let inverter = '6 kW';

    if (adjustedBill <= 1800000 || (rooftop === 'small' && adjustedBill <= 3000000)) {
      sysName = 'SUNBLIX 2.34';
      kwp = '2.34';
      kwpNum = 2.34;
      panels = '4';
      area = '13 m²';
      inverter = '3 kW';
    } else if (adjustedBill <= 4000000) {
      sysName = 'SUNBLIX 4.68';
      kwp = '4.68';
      kwpNum = 4.68;
      panels = '8';
      area = '26 m²';
      inverter = '6 kW';
    } else if (adjustedBill <= 8000000) {
      sysName = 'SUNBLIX 8.19';
      kwp = '8.19';
      kwpNum = 8.19;
      panels = '14';
      area = '45 m²';
      inverter = '10 kW';
    } else if (adjustedBill <= 15000000) {
      sysName = 'SUNBLIX 14.04';
      kwp = '14.04';
      kwpNum = 14.04;
      panels = '24';
      area = '78 m²';
      inverter = '15 kW';
    } else {
      const calcKwp = Math.min(100, Math.max(16, (adjustedBill / 1500 / 30 / 3.8))).toFixed(2);
      const calcPanels = Math.round((calcKwp * 1000) / 585);
      const calcArea = Math.round(calcPanels * 3.2);
      const calcInv = Math.ceil(calcKwp * 1.2);
      sysName = `SUNBLIX ${calcKwp}`;
      kwp = String(calcKwp);
      kwpNum = parseFloat(calcKwp);
      panels = String(calcPanels);
      area = `${calcArea} m²`;
      inverter = `${calcInv} kW`;
    }

    // Estimated solar monthly generation = kWp * 4.0 PSH * 30 days
    const monthlyKwh = Math.round(kwpNum * 120);
    // Typical rooftop PV system offsets 70% - 80% of monthly electricity bills
    const savingsRatio = rawBill <= 1500000 ? 0.72 : (rawBill <= 3500000 ? 0.78 : 0.80);
    const estSavings = Math.round(rawBill * savingsRatio);
    const savingsPct = Math.round(savingsRatio * 100);
    const co2Kg = Math.round(monthlyKwh * 0.82);

    if (resSystemName) resSystemName.textContent = sysName;
    if (resKwp) resKwp.textContent = kwp;
    if (resPanels) resPanels.textContent = panels;
    if (resArea) resArea.textContent = area;
    if (resInverter) resInverter.textContent = inverter;

    if (resSavings) resSavings.textContent = formatRupiah(estSavings);
    if (resSavingsPct) resSavingsPct.textContent = `Hemat ~${savingsPct}% tagihan`;
    if (resProduction) resProduction.textContent = `~${monthlyKwh.toLocaleString('id-ID')} kWh`;
    if (resCo2) resCo2.textContent = `Reduksi CO₂ ~${co2Kg.toLocaleString('id-ID')} kg`;

    // Dynamic WhatsApp consultation link with pre-filled calculated system
    const waCalcMsg = `Halo Tim Ahli SUNBLIX, saya telah menghitung kebutuhan di website dan ingin konsultasi resmi untuk paket rekomendasi: *${sysName}* (${kwp} kWp, ${panels} Panel, inverter ${inverter}, estimasi rooftop ${area}) dengan tagihan listrik saat ini: *${formatRupiah(rawBill)}/bln*. Estimasi hemat: *${formatRupiah(estSavings)}/bln* (${savingsPct}%). Mohon info jadwal survei atap dan rincian penawaran resminya.`;
    const calcWaUrl = `https://wa.me/6281112345678?text=${encodeURIComponent(waCalcMsg)}`;
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

  quickBillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      quickBillBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (calcBill) {
        calcBill.value = formatRupiah(val);
      }
      calculateSolar();
    });
  });

  if (calcBill) {
    calcBill.addEventListener('input', e => {
      const val = parseRupiah(e.target.value);
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

  if (calcProperty) calcProperty.addEventListener('change', calculateSolar);
  if (calcRooftop) calcRooftop.addEventListener('change', calculateSolar);
  if (btnCalculate) btnCalculate.addEventListener('click', calculateSolar);

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

  // Mobile Tabs: Babak 6 (Projects: Map vs Terms)
  const projectContainer = document.querySelector('.project-container');
  const pmTabBtns = document.querySelectorAll('.pm-tab-btn');
  if (projectContainer) {
    projectContainer.setAttribute('data-active-tab', 'map');
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
