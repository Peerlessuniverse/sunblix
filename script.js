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

    // One camera push (supports window.SUNBLIX_STATIC_CAMERA)
    if (heroBg) {
      if (window.SUNBLIX_STATIC_CAMERA) {
        heroBg.style.transform = 'none';
      } else {
        const cameraT = ease(clamp(progress / 0.55));
        const scale = 1.015 + cameraT * 0.20;
        heroBg.style.transform = `scale(${scale})`;
      }
    }

    /* Atmospheric curtain: blooms in gently */
    const curtainT = ease(clamp((progress - 0.06) / 0.18));
    curtain.style.opacity = String(curtainT * 0.88);
    curtain.style.transform = `translate3d(${(-4 + 4 * curtainT)}%,0,0) scaleX(${0.96 + 0.04 * curtainT})`;

    /* Hero copy & bottom controls leave promptly before Scene 2 enters */
    const heroExitT = ease(clamp(progress / 0.08));
    const heroVisible = heroExitT < 0.99;

    if (heroContent) {
      heroContent.style.opacity = String(1 - heroExitT);
      heroContent.style.transform = `translateY(-50%) translate3d(0,${-28 * heroExitT}px,0)`;
      heroContent.style.visibility = heroVisible ? 'visible' : 'hidden';
      heroContent.style.pointerEvents = heroVisible ? 'auto' : 'none';
    }

    if (heroBottom) {
      heroBottom.style.opacity = String(1 - heroExitT);
      heroBottom.style.transform = `translate3d(0,${20 * heroExitT}px,0)`;
      heroBottom.style.visibility = heroVisible ? 'visible' : 'hidden';
      heroBottom.style.pointerEvents = heroVisible ? 'auto' : 'none';
    }

    /*
      SCENE 2 (OUR PURPOSE):
      Enters: 0.11 -> 0.21 (10% wide slow, graceful dissolve)
      Solid Plateau: 0.21 -> 0.32 (11% wide stable plateau)
      Exits: 0.32 -> 0.40 (8% wide gentle fade-out)
    */
    const scene2In = ease(clamp((progress - 0.11) / 0.10));
    const scene2Out = 1 - ease(clamp((progress - 0.32) / 0.08));
    const scene2T = scene2In * scene2Out;

    sceneTwo.style.opacity = String(scene2T);
    sceneTwo.classList.toggle('is-active', scene2T > 0.01);
    sceneTwo.classList.toggle('ready', scene2In > 0.95 && scene2Out > 0.35);

    /* Purpose wash (white atmospheric bloom on left) */
    const washT = ease(clamp((progress - 0.11) / 0.10));
    purposeWash.style.opacity = String(0.95 * washT);
    purposeWash.style.transform = `translateX(${(-2 + 2 * washT)}%)`;

    /* Purpose text content (eyebrow, title, description, features) */
    const copyT = ease(clamp((progress - 0.13) / 0.09));
    purposeContent.style.opacity = String(copyT);
    purposeContent.style.transform = `translate3d(0,${24 - 24 * copyT}px,0)`;
    purposeContent.style.filter = `blur(${6 - 6 * copyT}px)`;

    /* Energy route line */
    const energyT = ease(clamp((progress - 0.15) / 0.10)) * scene2Out;
    energySystem.style.opacity = String(energyT);

    /* Story Card */
    const cardT = ease(clamp((progress - 0.16) / 0.09));
    storyCard.style.opacity = String(cardT * scene2Out);
    storyCard.style.transform = `translate3d(0,${24 - 24 * cardT}px,0)`;
    storyCard.style.filter = `blur(${5 - 5 * cardT}px)`;

    /* Energy Pulse (travels from roof panel -> house/story card) */
    const pulseT = ease(clamp((progress - 0.18) / 0.12));
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
      Enters: 0.36 -> 0.44 (8% wide slow entrance)
      Photos reveal upwards: 0.40 -> 0.47
      Plateau: 0.47 -> 0.57 (10% wide plateau!)
      Exits: 0.57 -> 0.65 (8% wide gentle dissolve)
    */
    const productStart = 0.36;
    const productEnd = 0.44;
    const revealStart = 0.40;
    const revealEnd = 0.47;
    const productExitStart = 0.57;
    const productExitEnd = 0.65;

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
      Enters: 0.61 -> 0.68 (7% wide entrance)
      Plateau: 0.68 -> 0.75 (7% wide plateau!)
      Exits: 0.75 -> 0.82 (7% wide dissolve)
    */
    const systemStart = 0.61;
    const systemEnd = 0.68;
    const systemExitStart = 0.75;
    const systemExitEnd = 0.82;

    const systemIn = ease(clamp((progress - systemStart) / (systemEnd - systemStart)));
    const systemOut = 1 - ease(clamp((progress - systemExitStart) / (systemExitEnd - systemExitStart)));
    const systemOpacity = systemIn * systemOut;

    systemShell.style.opacity = String(systemOpacity);
    systemShell.style.visibility = systemOpacity > 0.005 ? 'visible' : 'hidden';
    systemShell.style.pointerEvents = systemOpacity > 0.2 ? 'auto' : 'none';
    systemShell.style.transform = `translate3d(0,${28 * (1 - systemIn) - 20 * (1 - systemOut)}px,0) scale(${0.98 + 0.02 * systemIn})`;

    /*
      BABAK 5: WHY GO WITH SUNBLIX (5 INTERACTIVE CARDS)
      Enters: 0.77 -> 0.83 (6% wide entrance)
      Plateau: 0.83 -> 0.89 (6% wide plateau!)
      Exits: 0.89 -> 0.94 (5% wide dissolve)
    */
    const howStart = 0.77;
    const howEnd = 0.83;
    const howExitStart = 0.89;
    const howExitEnd = 0.94;

    const howIn = ease(clamp((progress - howStart) / (howEnd - howStart)));
    const howOut = 1 - ease(clamp((progress - howExitStart) / (howExitEnd - howExitStart)));
    const howOpacity = howIn * howOut;

    howShell.style.opacity = String(howOpacity);
    howShell.style.visibility = howOpacity > 0.005 ? 'visible' : 'hidden';
    howShell.style.pointerEvents = howOpacity > 0.2 ? 'auto' : 'none';
    howShell.style.transform = `translate3d(0,${28 * (1 - howIn) - 20 * (1 - howOut)}px,0) scale(${0.98 + 0.02 * howIn})`;

    /*
      BABAK 6: PROJECTS & HORIZONTAL SOLAR CALCULATOR
      Enters: 0.89 -> 0.94 (5% wide entrance)
      Plateau: 0.94 -> 0.975 (stable hold)
    */
    const projectStart = 0.89;
    const projectEnd = 0.94;

    const projectT = ease(clamp((progress - projectStart) / (projectEnd - projectStart)));
    if (projectShell) {
      projectShell.style.opacity = String(projectT);
      projectShell.style.visibility = projectT > 0.005 ? 'visible' : 'hidden';
      projectShell.style.pointerEvents = (projectT > 0.2 && progress < 0.98) ? 'auto' : 'none';
      projectShell.style.transform = `translate3d(0,${32 * (1 - projectT)}px,0) scale(${0.98 + 0.02 * projectT})`;
    }

    /*
      BABAK 7: THE EPIC FINALE (PANORAMA HORIZON & SUNBLIX FOOTER)
      Slides Up: 0.96 -> 1.00
      Fully docked at 1.00
    */
    const finaleStart = 0.96;
    const finaleEnd = 1.00;
    const finaleT = ease(clamp((progress - finaleStart) / (finaleEnd - finaleStart)));
    if (finaleShell) {
      const translateY = (1 - finaleT) * 100;
      finaleShell.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0)`;
      finaleShell.style.visibility = finaleT > 0.002 ? 'visible' : 'hidden';
      finaleShell.style.pointerEvents = finaleT > 0.4 ? 'auto' : 'none';
    }

    // Scene 3 overall state & nav styling
    const scene3In = ease(clamp((progress - 0.35) / 0.06));
    sceneThree.style.opacity = String(scene3In);
    sceneThree.classList.toggle('is-active', scene3In > 0.01);
    nav.classList.toggle('scene3-nav', scene3In > 0.08);

    // Hero bottom categories and scroll indicators
    heroBottom.style.opacity = String(1 - ease(clamp((progress - 0.08) / 0.10)));
    scrollHint.style.opacity = String(1 - clamp(progress / 0.08));
    scrollProgress.style.height = (progress * 100) + '%';
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  // 7 Core Act Milestones (Center of Wide Plateaus)
  const SNAP_MILESTONES = [0.00, 0.26, 0.51, 0.71, 0.86, 0.955, 1.00];

  let isSnapping = false;
  let snapTimeout = null;
  let wheelDirection = 0;
  let isTouchActive = false;
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;

  function isInteractiveTarget(target) {
    if (!target || !(target instanceof Element)) return false;
    return !!target.closest(
      'input, select, textarea, button, a, .city-pin, .modal, .quick-bill-btn, .pm-tab-btn, .hm-tab-btn, .select-wrapper'
    );
  }

  // Custom Luxury Animated Smooth Scroll (1350ms duration with cubic easing)
  function smoothScrollToProgress(targetProgress, duration = 1350) {
    if (!story) return;
    const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
    const targetScrollY = Math.round(targetProgress * maxScroll);
    const startScrollY = window.scrollY;
    const distance = targetScrollY - startScrollY;

    if (Math.abs(distance) < 8) return;

    isSnapping = true;
    const startTime = performance.now();

    function scrollStep(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Stately luxury cubic easing
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, Math.round(startScrollY + distance * easeT));

      if (t < 1) {
        requestAnimationFrame(scrollStep);
      } else {
        setTimeout(() => {
          isSnapping = false;
        }, 150);
      }
    }
    requestAnimationFrame(scrollStep);
  }

  function snapToClosestMilestone(delay = 550, biasDirection = 0) {
    if (snapTimeout) clearTimeout(snapTimeout);
    snapTimeout = setTimeout(() => {
      if (isSnapping || isTouchActive || !story) return;

      const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
      const currentProgress = clamp(window.scrollY / maxScroll);

      let target = SNAP_MILESTONES[0];
      let minDiff = 999;

      if (biasDirection > 0) {
        const forward = SNAP_MILESTONES.find(m => m > currentProgress - 0.02);
        if (forward !== undefined) target = forward;
      } else if (biasDirection < 0) {
        const backward = [...SNAP_MILESTONES].reverse().find(m => m < currentProgress + 0.02);
        if (backward !== undefined) target = backward;
      } else {
        SNAP_MILESTONES.forEach(m => {
          const diff = Math.abs(currentProgress - m);
          if (diff < minDiff) {
            minDiff = diff;
            target = m;
          }
        });
      }

      if (Math.abs(currentProgress - target) > 0.012) {
        smoothScrollToProgress(target);
      }
    }, delay);
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);

  window.addEventListener('wheel', e => {
    if (isInteractiveTarget(e.target)) return;
    wheelDirection = e.deltaY > 0 ? 1 : -1;
    snapToClosestMilestone(550, wheelDirection);
  }, { passive: true });

  window.addEventListener('touchstart', e => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
    isTouchActive = true;
    if (snapTimeout) clearTimeout(snapTimeout);
  }, { passive: true });

  window.addEventListener('touchend', e => {
    if (!isTouchActive || !e.changedTouches || e.changedTouches.length === 0) return;
    isTouchActive = false;

    if (isInteractiveTarget(e.target)) return;

    const deltaY = touchStartY - e.changedTouches[0].clientY;
    const deltaX = touchStartX - e.changedTouches[0].clientX;

    if (Math.abs(deltaY) < 30 || Math.abs(deltaY) < Math.abs(deltaX) * 1.2) {
      if (Math.abs(deltaY) > 10) {
        snapToClosestMilestone(150);
      }
      return;
    }

    const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
    const currentProgress = clamp(window.scrollY / maxScroll);

    if (deltaY > 0) {
      // Swiped UP (advance forward)
      const nextMilestone = SNAP_MILESTONES.find(m => m > currentProgress + 0.035);
      if (nextMilestone !== undefined) {
        smoothScrollToProgress(nextMilestone);
      } else {
        smoothScrollToProgress(1.00);
      }
    } else {
      // Swiped DOWN (retreat backward)
      const prevMilestone = [...SNAP_MILESTONES].reverse().find(m => m < currentProgress - 0.035);
      if (prevMilestone !== undefined) {
        smoothScrollToProgress(prevMilestone);
      } else {
        smoothScrollToProgress(0.00);
      }
    }
  }, { passive: true });

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
      }, 1450);
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
    btnBackToTop.addEventListener('click', () => {
      const startScrollY = window.scrollY;
      if (startScrollY <= 0) return;
      const duration = 1350;
      const startTime = performance.now();

      function scrollStep(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, Math.round(startScrollY * (1 - easeT)));

        if (t < 1) {
          requestAnimationFrame(scrollStep);
        }
      }
      requestAnimationFrame(scrollStep);
    });
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

      pageLoader.classList.add('fade-out');

      setTimeout(() => {
        document.body.classList.remove('is-loading');
        loaderLogoWrap.style.display = 'none';
        pageLoader.style.display = 'none';
        requestRender();
      }, 1450);
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
    '#solutions': 0.27,
    '#products': 0.52,
    '#how-it-works': 0.69,
    '#why-sunblix': 0.84,
    '#projects': 0.95,
    '#residential': 0.52,
    '#commercial': 0.55,
    '#energy-storage': 0.69,
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

    const sysTitle = document.getElementById('resSystemTitle')?.textContent || 'SUNBLIX Residential';
    const kwpVal = document.getElementById('resKwp')?.textContent || '5.85';
    const panelsVal = document.getElementById('resPanels')?.textContent || '10';
    const areaVal = document.getElementById('resArea')?.textContent || '32';
    const inverterVal = document.getElementById('resInverter')?.textContent || '5';
    const savingsVal = document.getElementById('resSavings')?.textContent || 'Rp 1.950.000';
    const billVal = calcBill ? calcBill.value : 'Rp 2.500.000';

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'staticQuoteModal';
    modalBackdrop.className = 'quote-modal-backdrop';
    modalBackdrop.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(3,28,63,0.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

    modalBackdrop.innerHTML = `
      <div class="quote-modal-card" style="background:#041c3e;border:1px solid rgba(22,219,224,0.3);border-radius:24px;max-width:560px;width:100%;padding:32px 28px;color:#fff;box-shadow:0 25px 60px rgba(0,0,0,0.6);position:relative;max-height:92vh;overflow-y:auto;">
        <button type="button" id="closeStaticModalBtn" aria-label="Tutup" style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.08);border:none;color:#fff;width:36px;height:36px;borderRadius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;">✕</button>
        <div id="staticModalBody">
          <div style="margin-bottom:22px;">
            <span style="font-size:11px;font-weight:800;letter-spacing:2px;color:#16dbe0;text-transform:uppercase;">PT SUNBLIX ENERGI INDONESIA</span>
            <h3 style="margin:6px 0 8px;font-size:22px;font-weight:800;color:#fff;">Permintaan Penawaran Resmi (PDF)</h3>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;">Dapatkan estimasi teknis, analisis ROI, dan proposal resmi Siap Pakai langsung ke email dan WhatsApp Anda.</p>
          </div>
          <form id="staticQuoteForm" style="display:grid;gap:14px;">
            <div>
              <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#cfe4fc;">Nama Lengkap *</label>
              <input type="text" id="sqName" required placeholder="Contoh: Bpk. Haris Setiawan" style="width:100%;padding:12px 14px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:14px;outline:none;box-sizing:border-box;" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#cfe4fc;">Nomor WhatsApp *</label>
                <input type="tel" id="sqWa" required placeholder="081234567890" style="width:100%;padding:12px 14px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:14px;outline:none;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#cfe4fc;">Alamat Email *</label>
                <input type="email" id="sqEmail" required placeholder="email@anda.com" style="width:100%;padding:12px 14px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:14px;outline:none;box-sizing:border-box;" />
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#cfe4fc;">Kota / Kabupaten *</label>
                <input type="text" id="sqCity" required placeholder="Contoh: Jakarta Selatan" style="width:100%;padding:12px 14px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:14px;outline:none;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#cfe4fc;">Daya Listrik PLN</label>
                <select id="sqPower" style="width:100%;padding:12px 14px;border-radius:10px;background:#09254c;border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:14px;outline:none;box-sizing:border-box;">
                  <option value="1.300 VA">1.300 VA</option>
                  <option value="2.200 VA" selected>2.200 VA</option>
                  <option value="3.500 - 5.500 VA">3.500 – 5.500 VA</option>
                  <option value="6.600 - 11.000 VA">6.600 – 11.000 VA</option>
                  <option value="> 11.000 VA (3-Phase)">Di atas 11.000 VA (3 Phase)</option>
                </select>
              </div>
            </div>
            <div>
              <label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px;color:#cfe4fc;">Catatan Kebutuhan / Tipe Atap (Opsional)</label>
              <textarea id="sqNotes" rows="2" placeholder="Misal: Atap genteng bitumen, ingin konsultasi baterai..." style="width:100%;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);color:#fff;font-size:13px;outline:none;resize:none;box-sizing:border-box;"></textarea>
            </div>
            <button type="submit" style="margin-top:10px;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg, #087be8 0%, #16dbe0 100%);color:#fff;border:none;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 10px 25px rgba(8, 123, 232, 0.4);display:flex;align-items:center;justify-content:center;gap:8px;">
              Kirim Permintaan Penawaran Resmi →
            </button>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);text-align:center;margin-top:4px;">
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
              <div style="width:64px;height:64px;border-radius:50%;background:rgba(67, 217, 90, 0.15);border:2px solid #43d95a;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px;">✓</div>
              <h3 style="font-size:22px;font-weight:800;margin:0 0 10px;color:#fff;">Permintaan Penawaran Berhasil!</h3>
              <p style="font-size:14px;color:rgba(255,255,255,0.8);line-height:1.6;margin:0 0 20px;">
                Terima kasih Bpk/Ibu <strong>${nameVal}</strong>. Tim spesialis teknis SUNBLIX sedang menyusun rincian proposal teknis untuk lokasi <strong>${cityVal}</strong>.
              </p>
              <div style="background:rgba(255,255,255,0.06);border:1px dashed rgba(22, 219, 224, 0.4);border-radius:14px;padding:14px;margin-bottom:24px;">
                <span style="font-size:11px;color:#cfe4fc;display:block;margin-bottom:4px;">NOMOR REFERENSI PENAWARAN:</span>
                <strong style="font-size:18px;color:#16dbe0;letter-spacing:1px;">${quoteCode}</strong>
              </div>
              <div style="display:grid;gap:10px;">
                <button type="button" id="printQuoteBtn" style="padding:14px;border-radius:12px;background:linear-gradient(135deg, #087be8 0%, #16dbe0 100%);color:#fff;border:none;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 20px rgba(8, 123, 232, 0.35);">
                  📥 Unduh / Simpan Penawaran Resmi (PDF)
                </button>
                <button type="button" id="waDirectBtn" style="padding:14px;border-radius:12px;background:#25D366;color:#fff;border:none;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                  💬 Lanjut Hubungi via WhatsApp (Respon Cepat)
                </button>
                <button type="button" id="closeDoneBtn" style="padding:12px;border-radius:12px;background:transparent;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.2);font-size:13px;cursor:pointer;">
                  Tutup Jendela
                </button>
              </div>
            </div>
          `;

          document.getElementById('closeDoneBtn').onclick = () => modalBackdrop.remove();

          document.getElementById('waDirectBtn').onclick = () => {
            const waText = `Halo Tim Ahli SUNBLIX, saya telah mengisi formulir penawaran resmi di website dengan No. Ref: *${quoteCode}*.\n\n*Nama:* ${nameVal}\n*Lokasi:* ${cityVal}\n*Daya PLN:* ${powerVal}\n*Tagihan Listrik:* ${billVal}\n*Paket Terpilih:* ${sysTitle}\n\nMohon info ketersediaan jadwal survei lokasi dan estimasi proposalnya.`;
            window.open('https://wa.me/6281112345678?text=' + encodeURIComponent(waText), '_blank');
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
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #087be8; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-title { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #041c3e; margin: 0; }
    .brand-tag { font-size: 11px; font-weight: 700; color: #087be8; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; }
    .brand-address { font-size: 11px; color: #64748b; margin-top: 6px; }
    .doc-meta { text-align: right; }
    .doc-title { font-size: 16px; font-weight: 800; color: #041c3e; margin: 0 0 6px; text-transform: uppercase; }
    .ref-badge { display: inline-block; background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 700; }
    .date { font-size: 12px; color: #64748b; margin-top: 6px; }
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
    .signature { text-align: right; }
    .signature-space { height: 45px; }
    .signature-name { font-weight: 800; color: #041c3e; text-decoration: underline; }
    .signature-title { font-size: 10px; color: #64748b; }
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
  <div class="header">
    <div>
      <h1 class="brand-title">SUNBLIX</h1>
      <div class="brand-tag">PT SUNBLIX ENERGI INDONESIA</div>
      <div class="brand-address">Architectural Solar Engineering & Smart Rooftop Solutions<br>Web: sunblix.com | WhatsApp: +62 811-1234-5678</div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">Estimasi Penawaran Resmi</div>
      <div class="ref-badge">${quoteCode}</div>
      <div class="date">Tanggal: ${dateStr}</div>
    </div>
  </div>
  <div class="section-title">1. Data Pemohon & Lokasi Instalasi</div>
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
      <tr><td><strong>Paket Solusi</strong></td><td><strong>${sysTitle}</strong></td><td>Paket Siap Pakai (All-in engineering & instalasi)</td></tr>
      <tr><td><strong>Daya Sistem</strong></td><td><strong>${kwpVal} kWp</strong></td><td>Optimal menyerap konsumsi siang hari</td></tr>
      <tr><td><strong>Modul Surya</strong></td><td>${panelsVal} Unit Modul</td><td>Monocrystalline N-Type Half-Cell High Output</td></tr>
      <tr><td><strong>Luas Atap</strong></td><td>~${areaVal} m²</td><td>Struktur aluminium anodized anti-korosi SNI</td></tr>
      <tr><td><strong>Inverter</strong></td><td>${inverterVal} kW Inverter</td><td>Efisiensi 98.6% + Dual MPPT + Proteksi Petir</td></tr>
      <tr><td><strong>Monitoring</strong></td><td>SUNBLIX IoT Cloud Live Mobile App</td><td>Pantau performa real-time 24/7</td></tr>
    </tbody>
  </table>
  <div class="highlight-box">
    <div>
      <div class="highlight-label">Potensi Penghematan Listrik</div>
      <div class="highlight-val">${savingsVal} / Bulan</div>
    </div>
  </div>
  <div class="section-title">3. Jaminan & Garansi Resmi Siap Pakai</div>
  <div class="guarantees">
    <div class="guarantee-card"><span class="guarantee-val">25 Tahun</span><span class="guarantee-desc">Garansi Performa Panel</span></div>
    <div class="guarantee-card"><span class="guarantee-val">5 - 10 Tahun</span><span class="guarantee-desc">Garansi Inverter</span></div>
    <div class="guarantee-card"><span class="guarantee-val">Full Support</span><span class="guarantee-desc">Gratis Maintenance & Sertifikasi SLO</span></div>
  </div>
  ${notesVal ? `<div class="section-title" style="margin-top:14px;">4. Catatan Khusus</div><div style="font-size:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;color:#92400e;">${notesVal}</div>` : ''}
  <div class="footer">
    <div><em>* Dokumen ini merupakan estimasi awal berbasis kalkulator surya SUNBLIX.<br>Proposal final dan gambar teknik CAD diterbitkan setelah survei lokasi.</em></div>
    <div class="signature"><div class="signature-space"></div><div class="signature-name">Tim Engineering SUNBLIX</div><div class="signature-title">PT SUNBLIX ENERGI INDONESIA</div></div>
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
