'use client';

import { useEffect, useRef } from 'react';

export default function CinematicEngine({ staticCamera = false }) {
  const staticCameraRef = useRef(staticCamera);

  useEffect(() => {
    staticCameraRef.current = staticCamera;
  }, [staticCamera]);

  useEffect(() => {
    const nav = document.getElementById('nav');
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollHint = document.getElementById('scrollHint');
    const pageLoader = document.getElementById('pageLoader');
    const loaderLogoWrap = document.getElementById('loaderLogoWrap');
    const navLogo = document.querySelector('.nav-logo');

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

    const revealSections = document.querySelectorAll('.section-reveal');
    revealSections.forEach((sec) => revealObserver.observe(sec));

    // Ensure hero is revealed right away
    const heroSection = document.getElementById('home');
    if (heroSection) {
      heroSection.classList.add('is-revealed');
    }

    // 2. ACTIVE NAVBAR SECTION TRACKING
    const sectionIds = ['home', 'solutions', 'products', 'how-it-works', 'why-sunblix', 'projects', 'quote'];
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

    // 3. SCROLL PROGRESS & NAVBAR SCROLLED STATE
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const scrollY = window.scrollY;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

          if (nav) {
            nav.classList.toggle('scrolled', scrollY > 30);
          }
          if (scrollProgress) {
            scrollProgress.style.height = `${progress * 100}%`;
          }
          if (scrollHint) {
            scrollHint.classList.toggle('is-hidden', scrollY > 80);
          }

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

          updateActiveNav();
        });
      }
    };

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

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 4. SMOOTH ANCHOR CLICK NAVIGATION
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // 5. PRELOADER ANIMATION
    const timer = setTimeout(() => {
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
      }, 1550);
    }, 1500);

    // 6. PRELOADER REFRESH TRIGGER (e.g. clicking logo)
    function triggerPreloaderRefresh() {
      if (!navLogo || !loaderLogoWrap || !pageLoader) return;

      window.scrollTo({ top: 0, behavior: 'smooth' });

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
        }, 1550);
      }, 850);
    }

    const handleRefresh = () => {
      triggerPreloaderRefresh();
    };
    window.addEventListener('sunblix:refresh', handleRefresh);

    const handleCustomScroll = (e) => {
      const targetId = e.detail?.target;
      if (!targetId) return;
      const cleanId = targetId.startsWith('#') ? targetId : `#${targetId}`;
      const targetEl = document.querySelector(cleanId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('sunblix:scrollto', handleCustomScroll);

    return () => {
      clearTimeout(timer);
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('sunblix:scrollto', handleCustomScroll);
      window.removeEventListener('sunblix:refresh', handleRefresh);
    };
  }, []);

  return null;
}
