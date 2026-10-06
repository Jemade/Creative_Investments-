/**
 * Creative Wing Investments — Global UI & Navigation Controller
 */

// Sticky Navbar Scroll Elevation
function initStickyNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Mobile Menu Drawer Controller
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  function toggleMenu(open) {
    const shouldOpen = open !== undefined ? open : !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', shouldOpen);
    hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    hamburger.innerHTML = shouldOpen ? (typeof getIcon === 'function' ? getIcon('close') : '&times;') : (typeof getIcon === 'function' ? getIcon('menu') : '&#9776;');

    if (shouldOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close when clicking nav links
  mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      toggleMenu(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      toggleMenu(false);
    }
  });
}

// Floating WhatsApp Widget
function initFloatingWhatsApp() {
  if (document.querySelector('.fab')) return;

  const fab = document.createElement('a');
  fab.href = typeof buildGeneralWhatsAppUrl === 'function' ? buildGeneralWhatsAppUrl() : 'https://wa.me/263785783150';
  fab.target = '_blank';
  fab.rel = 'noopener';
  fab.className = 'fab';
  fab.setAttribute('aria-label', 'Chat with Creative Wing Investments on WhatsApp');
  fab.innerHTML = typeof getIcon === 'function' ? getIcon('whatsapp') : 'WA';

  const tooltip = document.createElement('div');
  tooltip.className = 'fab-tooltip';
  tooltip.textContent = 'Quick WhatsApp Chat';

  document.body.appendChild(fab);
  document.body.appendChild(tooltip);

  // Show tooltip briefly on first visit
  setTimeout(() => {
    tooltip.classList.add('visible');
    setTimeout(() => tooltip.classList.remove('visible'), 3200);
  }, 1600);
}

// Dynamic Copyright Year
function initYear() {
  const yearEls = document.querySelectorAll('[data-year]');
  const currentYear = new Date().getFullYear();
  yearEls.forEach(el => { el.textContent = currentYear; });
}

// Scroll Reveal with Reduced Motion check
function initScrollReveals() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');

  if (prefersReduced || !window.IntersectionObserver) {
    elements.forEach(el => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  elements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileMenu();
  initFloatingWhatsApp();
  initYear();
  initScrollReveals();
});
