'use client';

import { useEffect, useRef } from 'react';

export default function CinematicEngine({ staticCamera = false }) {
  const staticCameraRef = useRef(staticCamera);

  useEffect(() => {
    staticCameraRef.current = staticCamera;
    const heroBg = document.getElementById('heroBg');
    if (heroBg && staticCamera) {
      heroBg.style.transform = 'none';
    }
  }, [staticCamera]);

  useEffect(() => {
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
    const scrollHint = document.getElementById('scrollHint');
    const scrollProgress = document.getElementById('scrollProgress');
    const nav = document.getElementById('nav');

    // Preloader Elements
    const pageLoader = document.getElementById('pageLoader');
    const loaderLogoWrap = document.getElementById('loaderLogoWrap');
    const navLogo = document.querySelector('.nav-logo');

    let ticking = false;
    let isSnapping = false;
    let snapTimeout = null;
    let wheelDirection = 0;
    let isTouchActive = false;
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;

    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const ease = (t) => t * t * (3 - 2 * t);

    // 7 Core Act Milestones (Center of Wide Plateaus)
    const SNAP_MILESTONES = [0.0, 0.26, 0.51, 0.71, 0.86, 0.955, 1.0];

    const milestones = {
      '#home': 0.0,
      '#solutions': 0.26,
      '#products': 0.51,
      '#how-it-works': 0.71,
      '#why-sunblix': 0.86,
      '#projects': 0.955,
      '#residential': 0.51,
      '#commercial': 0.53,
      '#energy-storage': 0.71,
      '#quote': 1.0,
    };

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
      [12.0, 82.0],
    ];

    function pointOnPath(t) {
      const scaled = t * (path.length - 1);
      const i = Math.min(path.length - 2, Math.floor(scaled));
      const f = scaled - i;
      const a = path[i];
      const b = path[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }

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
        // Stately luxury cubic easing (slow start, smooth acceleration, gentle decelerating stop)
        const easeT = t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;

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
          const forward = SNAP_MILESTONES.find((m) => m > currentProgress - 0.02);
          if (forward !== undefined) target = forward;
        } else if (biasDirection < 0) {
          const backward = [...SNAP_MILESTONES].reverse().find((m) => m < currentProgress + 0.02);
          if (backward !== undefined) target = backward;
        } else {
          SNAP_MILESTONES.forEach((m) => {
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

    function render() {
      ticking = false;
      if (!story) return;

      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
      const progress = clamp(scrollY / maxScroll);

      // Navbar state
      if (nav) {
        nav.classList.toggle('scrolled', scrollY > 20);
      }

      // One camera push (or locked-off static camera)
      if (heroBg) {
        if (staticCameraRef.current) {
          heroBg.style.transform = 'none';
        } else {
          const cameraT = ease(clamp(progress / 0.55));
          const scale = 1.015 + cameraT * 0.2;
          heroBg.style.transform = `scale(${scale})`;
        }
      }

      // Atmospheric curtain
      if (curtain) {
        const curtainT = ease(clamp((progress - 0.06) / 0.18));
        curtain.style.opacity = String(curtainT * 0.88);
        curtain.style.transform = `translate3d(${-4 + 4 * curtainT}%,0,0) scaleX(${0.96 + 0.04 * curtainT})`;
      }

      // Hero copy & bottom controls leave promptly before Scene 2 enters
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

      // SCENE 2 (OUR PURPOSE)
      // Enter: 0.11 -> 0.21 (10% wide slow, graceful dissolve)
      // Plateau: 0.21 -> 0.32 (11% wide stable plateau)
      // Exit: 0.32 -> 0.40 (8% wide gentle fade-out)
      const scene2In = ease(clamp((progress - 0.11) / 0.10));
      const scene2Out = 1 - ease(clamp((progress - 0.32) / 0.08));
      const scene2T = scene2In * scene2Out;

      if (sceneTwo) {
        sceneTwo.style.opacity = String(scene2T);
        sceneTwo.classList.toggle('is-active', scene2T > 0.01);
        sceneTwo.classList.toggle('ready', scene2In > 0.95 && scene2Out > 0.35);
      }

      if (purposeWash) {
        const washT = ease(clamp((progress - 0.11) / 0.10));
        purposeWash.style.opacity = String(0.95 * washT);
        purposeWash.style.transform = `translateX(${-2 + 2 * washT}%)`;
      }

      if (purposeContent) {
        const copyT = ease(clamp((progress - 0.13) / 0.09));
        purposeContent.style.opacity = String(copyT);
        purposeContent.style.transform = `translate3d(0,${24 - 24 * copyT}px,0)`;
        purposeContent.style.filter = `blur(${6 - 6 * copyT}px)`;
      }

      if (energySystem) {
        const energyT = ease(clamp((progress - 0.15) / 0.10)) * scene2Out;
        energySystem.style.opacity = String(energyT);
      }

      if (storyCard) {
        const cardT = ease(clamp((progress - 0.16) / 0.09));
        storyCard.style.opacity = String(cardT * scene2Out);
        storyCard.style.transform = `translate3d(0,${24 - 24 * cardT}px,0)`;
        storyCard.style.filter = `blur(${5 - 5 * cardT}px)`;
      }

      const pulseT = ease(clamp((progress - 0.18) / 0.12));
      if (energyPulse) {
        const pt = pointOnPath(pulseT);
        energyPulse.style.left = pt[0] + '%';
        energyPulse.style.top = pt[1] + '%';
        energyPulse.style.opacity = String(pulseT * scene2Out);
      }

      if (storyCard) {
        storyCard.classList.toggle('has-energy', pulseT > 0.8 && scene2Out > 0.15);
      }

      // BABAK 3: PRODUCT DISCOVERY (RESIDENTIAL TIERS)
      // Enter: 0.36 -> 0.44 (8% wide slow entrance)
      // Houses reveal upward: 0.40 -> 0.47
      // Plateau: 0.47 -> 0.57 (10% wide plateau)
      // Exit: 0.57 -> 0.65 (8% wide gentle dissolve)
      const productStart = 0.36;
      const productEnd = 0.44;
      const revealStart = 0.40;
      const revealEnd = 0.47;
      const productExitStart = 0.57;
      const productExitEnd = 0.65;

      const productIn = ease(clamp((progress - productStart) / (productEnd - productStart)));
      const productOut = 1 - ease(clamp((progress - productExitStart) / (productExitEnd - productExitStart)));
      const productOpacity = productIn * productOut;

      if (productShell) {
        const revealP = ease(clamp((progress - revealStart) / (revealEnd - revealStart)));
        productShell.style.setProperty('--reveal', revealP.toFixed(4));
        productShell.style.opacity = String(productOpacity);
        productShell.style.visibility = productOpacity > 0.005 ? 'visible' : 'hidden';
        productShell.style.pointerEvents = productOpacity > 0.2 ? 'auto' : 'none';
        productShell.style.transform = `translate3d(0,${20 * (1 - productIn) - 20 * (1 - productOut)}px,0) scale(${0.99 + 0.01 * productIn})`;
      }

      // BABAK 4: SYSTEM SHELL (FROM SUNLIGHT TO YOUR HOME)
      // Enter: 0.61 -> 0.68 (7% wide entrance)
      // Plateau: 0.68 -> 0.75 (7% wide plateau)
      // Exit: 0.75 -> 0.82 (7% wide dissolve)
      const systemStart = 0.61;
      const systemEnd = 0.68;
      const systemExitStart = 0.75;
      const systemExitEnd = 0.82;

      const systemIn = ease(clamp((progress - systemStart) / (systemEnd - systemStart)));
      const systemOut = 1 - ease(clamp((progress - systemExitStart) / (systemExitEnd - systemExitStart)));
      const systemOpacity = systemIn * systemOut;

      if (systemShell) {
        systemShell.style.opacity = String(systemOpacity);
        systemShell.style.visibility = systemOpacity > 0.005 ? 'visible' : 'hidden';
        systemShell.style.pointerEvents = systemOpacity > 0.2 ? 'auto' : 'none';
        systemShell.style.transform = `translate3d(0,${28 * (1 - systemIn) - 20 * (1 - systemOut)}px,0) scale(${0.98 + 0.02 * systemIn})`;
      }

      // BABAK 5: HOW SHELL (WHY GO WITH SUNBLIX)
      // Enter: 0.77 -> 0.83 (6% wide entrance)
      // Plateau: 0.83 -> 0.89 (6% wide plateau)
      // Exit: 0.89 -> 0.94 (5% wide dissolve)
      const howStart = 0.77;
      const howEnd = 0.83;
      const howExitStart = 0.89;
      const howExitEnd = 0.94;

      const howIn = ease(clamp((progress - howStart) / (howEnd - howStart)));
      const howOut = 1 - ease(clamp((progress - howExitStart) / (howExitEnd - howExitStart)));
      const howOpacity = howIn * howOut;

      if (howShell) {
        howShell.style.opacity = String(howOpacity);
        howShell.style.visibility = howOpacity > 0.005 ? 'visible' : 'hidden';
        howShell.style.pointerEvents = howOpacity > 0.2 ? 'auto' : 'none';
        howShell.style.transform = `translate3d(0,${28 * (1 - howIn) - 20 * (1 - howOut)}px,0) scale(${0.98 + 0.02 * howIn})`;
      }

      // BABAK 6: PROJECTS & SOLAR CALCULATOR
      // Enter: 0.89 -> 0.94 (5% wide entrance)
      // Plateau: 0.94 -> 0.975 (stable hold)
      // Finale arrives: 0.96 -> 1.00
      const projectStart = 0.89;
      const projectEnd = 0.94;
      const projectT = ease(clamp((progress - projectStart) / (projectEnd - projectStart)));

      if (projectShell) {
        projectShell.style.opacity = String(projectT);
        projectShell.style.visibility = projectT > 0.005 ? 'visible' : 'hidden';
        projectShell.style.pointerEvents = projectT > 0.2 && progress < 0.98 ? 'auto' : 'none';
        projectShell.style.transform = `translate3d(0,${32 * (1 - projectT)}px,0) scale(${0.98 + 0.02 * projectT})`;
      }

      // BABAK 7: FINALE SHELL
      // Slides up from bottom: 0.96 -> 1.00
      const finaleStart = 0.96;
      const finaleEnd = 1.0;
      const finaleT = ease(clamp((progress - finaleStart) / (finaleEnd - finaleStart)));
      if (finaleShell) {
        const translateY = (1 - finaleT) * 100;
        finaleShell.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0)`;
        finaleShell.style.visibility = finaleT > 0.002 ? 'visible' : 'hidden';
        finaleShell.style.pointerEvents = finaleT > 0.4 ? 'auto' : 'none';
      }

      // Scene 3 overall state & nav styling
      const scene3In = ease(clamp((progress - 0.35) / 0.06));
      if (sceneThree) {
        sceneThree.style.opacity = String(scene3In);
        sceneThree.classList.toggle('is-active', scene3In > 0.01);
      }
      if (nav) {
        nav.classList.toggle('scene3-nav', scene3In > 0.08);
      }

      // Hero bottom categories and scroll indicators
      if (heroBottom) {
        heroBottom.style.opacity = String(1 - ease(clamp((progress - 0.08) / 0.1)));
      }
      if (scrollHint) {
        scrollHint.style.opacity = String(1 - clamp(progress / 0.08));
      }
      if (scrollProgress) {
        scrollProgress.style.height = progress * 100 + '%';
      }
    }

    function requestRender() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }

    // Scroll & Wheel listeners
    const handleScroll = () => {
      requestRender();
    };

    const handleWheel = (e) => {
      if (isInteractiveTarget(e.target)) return;
      wheelDirection = e.deltaY > 0 ? 1 : -1;
      snapToClosestMilestone(550, wheelDirection);
    };

    // Mobile touch listeners for 1-swipe-per-act experience
    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      isTouchActive = true;
      if (snapTimeout) clearTimeout(snapTimeout);
    };

    const handleTouchEnd = (e) => {
      if (!isTouchActive || !e.changedTouches || e.changedTouches.length === 0) return;
      isTouchActive = false;

      if (isInteractiveTarget(e.target)) return;

      const deltaY = touchStartY - e.changedTouches[0].clientY;
      const deltaX = touchStartX - e.changedTouches[0].clientX;

      if (Math.abs(deltaY) < 30 || Math.abs(deltaY) < Math.abs(deltaX) * 1.2) {
        if (Math.abs(deltaY) > 10) {
          snapToClosestMilestone(350);
        }
        return;
      }

      const maxScroll = Math.max(1, story.offsetHeight - window.innerHeight);
      const currentProgress = clamp(window.scrollY / maxScroll);

      if (deltaY > 0) {
        // Swiped UP (advance forward)
        const nextMilestone = SNAP_MILESTONES.find((m) => m > currentProgress + 0.035);
        if (nextMilestone !== undefined) {
          smoothScrollToProgress(nextMilestone);
        } else {
          smoothScrollToProgress(1.0);
        }
      } else {
        // Swiped DOWN (retreat backward)
        const prevMilestone = [...SNAP_MILESTONES].reverse().find((m) => m < currentProgress - 0.035);
        if (prevMilestone !== undefined) {
          smoothScrollToProgress(prevMilestone);
        } else {
          smoothScrollToProgress(0.0);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('resize', requestRender);

    // Anchor Click Interception (Navbar & Footer Links)
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      if (milestones[targetId] !== undefined) {
        e.preventDefault();
        smoothScrollToProgress(milestones[targetId]);
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // Preloader Animation Timeline (Paced deliberately for elegance)
    const timer = setTimeout(() => {
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

    // Trigger preloader refresh animation (e.g. when Sunblix menu logo is clicked)
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

    const handleRefresh = () => {
      triggerPreloaderRefresh();
    };

    window.addEventListener('sunblix:refresh', handleRefresh);

    // Milestones custom event listener
    const handleCustomScroll = (e) => {
      const targetId = e.detail?.target;
      if (!targetId || milestones[targetId] === undefined) return;
      smoothScrollToProgress(milestones[targetId]);
    };

    window.addEventListener('sunblix:scrollto', handleCustomScroll);

    // Initial render
    requestRender();

    return () => {
      clearTimeout(timer);
      if (snapTimeout) clearTimeout(snapTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', requestRender);
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('sunblix:scrollto', handleCustomScroll);
      window.removeEventListener('sunblix:refresh', handleRefresh);
    };
  }, []);

  return null;
}
