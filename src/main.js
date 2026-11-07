/* ==========================================================================
   GOLDY PAHAL PORTFOLIO - MAIN APPLICATION ENTRY POINT
   ========================================================================== */

import './styles/index.css';
import './styles/journey.css';
import Lenis from 'lenis';
import { SkySpaceEngine } from './engine/SkySpaceEngine.js';
import { CloudSystem } from './components/CloudSystem.js';
import { LandingHero } from './components/LandingHero.js';
import { AboutSection } from './components/AboutSection.js';
import { SkillsSection } from './components/SkillsSection.js';
import { ExploringSection } from './components/ExploringSection.js';
import { SpaceFooter } from './components/SpaceFooter.js';
import { SpaceJourney } from './components/SpaceJourney.js';
import { Preloader } from './components/Preloader.js';

class PortfolioApp {
  constructor() {
    this.initComponents();
    this.initLenis();
    this.initErrorToastHandler();
    this.initReveals();
    this.initHeroRecede();
  }

  // Apple-style entrance: elements ease up into place once, as they enter the
  // viewport. Only opacity / translate / scale are animated (GPU friendly).
  initReveals() {
    const targets = document.querySelectorAll(
      '#app-about .section-tag, #app-about .section-title, #app-about .ios-glass-card,' +
      '#app-skills .section-tag, #app-skills .section-title, #app-skills .ios-glass-card,' +
      '#app-exploring .section-tag, #app-exploring .section-title, #app-exploring .ios-glass-card'
    );
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('rv-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    targets.forEach((el) => {
      el.classList.add('rv');
      // stagger siblings inside the same grid
      const idx = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = `${Math.min(idx, 5) * 70}ms`;
      io.observe(el);
    });
  }

  // The hero recedes as you leave it (scale / fade / drift) instead of just
  // scrolling away, like the sticky headline on an Apple product page.
  initHeroRecede() {
    const title = document.querySelector('.hero-title-wrap');
    const bar = document.querySelector('.hero-footer-bar');
    if (!title) return;
    const update = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.8)));
      title.style.translate = `0 ${-p * 70}px`;
      title.style.scale = `${1 - p * 0.07}`;
      title.style.opacity = `${1 - p * 1.15}`;
      if (bar) bar.style.opacity = `${1 - p * 1.7}`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    if (this.journey) this.journey.setLenis(this.lenis);

    this.lenis.on('scroll', () => {
      if (this.engine) {
        this.engine.updateScroll();
      }
    });

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  initComponents() {
    this.preloader = new Preloader('app-preloader');
    this.clouds = new CloudSystem('app-clouds');
    this.engine = new SkySpaceEngine();
    this.hero = new LandingHero('app-hero');
    this.about = new AboutSection('app-about');
    this.skills = new SkillsSection('app-skills');
    this.exploring = new ExploringSection('app-exploring');
    // The journey renders its own stage (including the #app-space contact mount)
    this.journey = new SpaceJourney('app-journey');
    this.space = new SpaceFooter('app-space');
  }

  initErrorToastHandler() {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#"], [data-placeholder]');
      if (link) {
        e.preventDefault();
        this.showToast("⚠️ Content Notice: Requested document / action is currently under update.");
      }
    });
  }

  showToast(message) {
    let toast = document.getElementById('app-error-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-error-toast';
      toast.className = 'ios-error-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});
