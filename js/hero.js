/**
 * Creative Wing Investments — Authoritative Hero Slideshow Controller
 *
 * Implements:
 * - 6.0s slide interval with smooth 1.6s opacity crossfade
 * - Ken Burns subtle zoom (1.00 -> 1.05) on active slide
 * - Robust z-index handover preventing flicker on wrap-around
 * - Clickable pill dot indicators with active state tracking
 * - Keyboard navigation (ArrowLeft / ArrowRight) with input field protection
 * - Touch swipe gestures (swipe left for next, swipe right for prev)
 * - Tab visibility auto-pause to save battery and GPU cycles
 * - Accessibility & prefers-reduced-motion compliance
 */

(function () {
  'use strict';

  /**
   * Updates hero statistics figures in real-time based on live active inventory
   */
  async function syncLiveHeroStats(vehicles, sportswear) {
    try {
      if (!vehicles || !sportswear) {
        if (!window.inventoryService) return;
        [vehicles, sportswear] = await Promise.all([
          window.inventoryService.getVehicles(),
          window.inventoryService.getSportswear()
        ]);
      }

      const activeVehicles = (vehicles || []).filter(v => v.status !== 'Sold').length;
      const activeJerseys = (sportswear || []).filter(s => s.status !== 'Unavailable').length;

      const vehicleStatEl = document.getElementById('heroStatVehicles');
      const jerseyStatEl = document.getElementById('heroStatJerseys');

      if (vehicleStatEl && activeVehicles > 0) {
        vehicleStatEl.textContent = `${activeVehicles}+`;
      }
      if (jerseyStatEl && activeJerseys > 0) {
        jerseyStatEl.textContent = `${activeJerseys}+`;
      }
    } catch (e) {
      console.warn('Hero: Could not update live hero stat figures.', e);
    }
  }

  /**
   * Builds alternating live stock slides from vehicles & sportswear inventory
   */
  async function syncLiveHeroSlides() {
    if (!window.inventoryService) return null;
    try {
      const [vehicles, sportswear] = await Promise.all([
        window.inventoryService.getVehicles(),
        window.inventoryService.getSportswear()
      ]);

      // Update real-time hero figures immediately with latest actual inventory counts
      syncLiveHeroStats(vehicles, sportswear);

      const activeVehicles = (vehicles || []).filter(v => v.status !== 'Sold' && (v.image || (v.gallery && v.gallery[0])));
      const activeSportswear = (sportswear || []).filter(s => s.status !== 'Unavailable' && (s.image || (s.gallery && s.gallery[0])));

      if (!activeVehicles.length && !activeSportswear.length) return null;

      const liveSlides = [];
      const maxPairs = 4;
      for (let i = 0; i < maxPairs; i++) {
        if (activeVehicles[i % activeVehicles.length]) {
          const v = activeVehicles[i % activeVehicles.length];
          liveSlides.push({
            img: v.image || (v.gallery && v.gallery[0]),
            pos: 'center 58%'
          });
        }
        if (activeSportswear[i % activeSportswear.length]) {
          const s = activeSportswear[i % activeSportswear.length];
          liveSlides.push({
            img: s.image || (s.gallery && s.gallery[0]),
            pos: 'center 30%'
          });
        }
      }
      return liveSlides;
    } catch (e) {
      console.warn('Hero: Could not fetch live inventory slides, using static fallback.', e);
      return null;
    }
  }

  function initHeroSlideshow() {
    const heroEl = document.querySelector('.hero');
    const slidesContainer = document.querySelector('.hero-slides');
    const dotsContainer = document.querySelector('.hero-slideshow-indicators');

    if (!heroEl || !slidesContainer) return;

    let slides = Array.from(document.querySelectorAll('.hero-slide'));
    let dots = Array.from(document.querySelectorAll('.hero-slide-dot'));

    if (!slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    const slideDuration = 6000;      // 6.0 seconds per slide
    const transitionDuration = 1600; // 1.6 seconds smooth crossfade
    let autoplayTimer = null;

    // Detect user motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    // Initialize slide classes and initial z-indexes
    slides.forEach((slide, idx) => {
      if (idx === 0) {
        slide.classList.add('active');
        slide.classList.remove('previous');
        slide.style.zIndex = '2';
      } else {
        slide.classList.remove('active', 'previous');
        slide.style.zIndex = '1';
      }
    });

    // Initialize dot states
    if (dots.length) {
      dots.forEach((dot, idx) => {
        if (idx === 0) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });
    }

    function goToSlide(targetIdx, userTriggered = false) {
      const nextIndex = (targetIdx + totalSlides) % totalSlides;
      if (nextIndex === currentIndex) return;

      const prevSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];

      // Update dot indicators immediately
      if (dots.length) {
        if (dots[currentIndex]) {
          dots[currentIndex].classList.remove('active');
          dots[currentIndex].removeAttribute('aria-current');
        }
        if (dots[nextIndex]) {
          dots[nextIndex].classList.add('active');
          dots[nextIndex].setAttribute('aria-current', 'true');
        }
      }

      // Stacking order handover:
      // Active incoming slide is on top (zIndex 2) fading in
      // Previous outgoing slide remains underneath (zIndex 1)
      prevSlide.style.zIndex = '1';
      prevSlide.classList.remove('active');
      prevSlide.classList.add('previous');

      nextSlide.style.zIndex = '2';
      nextSlide.classList.remove('previous');
      nextSlide.classList.add('active');

      const oldIndex = currentIndex;
      currentIndex = nextIndex;

      // Clean up previous class after crossfade completes
      setTimeout(() => {
        if (currentIndex !== oldIndex && !prevSlide.classList.contains('active')) {
          prevSlide.classList.remove('previous');
          prevSlide.style.zIndex = '1';
        }
      }, transitionDuration);

      if (userTriggered) {
        restartAutoplay();
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (!prefersReducedMotion && totalSlides > 1) {
        autoplayTimer = setInterval(() => {
          goToSlide(currentIndex + 1);
        }, slideDuration);
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Dot indicators click handling
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx, true);
      });
    });

    // Keyboard navigation (ArrowLeft / ArrowRight)
    window.addEventListener('keydown', (e) => {
      // Never interfere with user typing in forms or search fields
      const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        goToSlide(currentIndex + 1, true);
      } else if (e.key === 'ArrowLeft') {
        goToSlide(currentIndex - 1, true);
      }
    });

    // Touch swipe gesture support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;

    heroEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    heroEl.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Ensure horizontal swipe is dominant and exceeds threshold
      if (Math.abs(diffX) > 42 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          goToSlide(currentIndex + 1, true); // Swiped left -> advance
        } else {
          goToSlide(currentIndex - 1, true); // Swiped right -> go back
        }
      }
    }, { passive: true });

    // Page visibility auto-pause
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    // Start initial autoplay immediately without delay
    startAutoplay();

    // In the background (non-blocking), check if dynamic live stock slides can enrich the slideshow
    syncLiveHeroSlides().then((liveStockSlides) => {
      if (liveStockSlides && liveStockSlides.length >= 2) {
        // Smoothly enrich slides without breaking active presentation
        slidesContainer.innerHTML = liveStockSlides.map((slide, idx) => 
          `<div class="hero-slide${idx === currentIndex ? ' active' : ''}" style="background-image: url('${slide.img}'); background-position: ${slide.pos};"></div>`
        ).join('');

        if (dotsContainer) {
          dotsContainer.innerHTML = liveStockSlides.map((_, idx) =>
            `<button class="hero-slide-dot${idx === currentIndex ? ' active' : ''}" aria-label="Show slide ${idx + 1}"></button>`
          ).join('');
        }

        slides = Array.from(document.querySelectorAll('.hero-slide'));
        dots = Array.from(document.querySelectorAll('.hero-slide-dot'));
        totalSlides = slides.length;

        // Re-bind dot indicators
        dots.forEach((dot, idx) => {
          dot.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(idx, true);
          });
        });
      }
    }).catch((err) => {
      console.warn('Hero live stock update skipped:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSlideshow);
  } else {
    initHeroSlideshow();
  }
})();
