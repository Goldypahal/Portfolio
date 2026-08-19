/* ==========================================================================
   GOLDY PAHAL PORTFOLIO - MAIN APPLICATION ENTRY POINT
   ========================================================================== */

import './styles/index.css';
import Lenis from 'lenis';
import { SkySpaceEngine } from './engine/SkySpaceEngine.js';
import { CloudSystem } from './components/CloudSystem.js';
import { LandingHero } from './components/LandingHero.js';
import { AboutSection } from './components/AboutSection.js';
import { SkillsSection } from './components/SkillsSection.js';
import { ExploringSection } from './components/ExploringSection.js';
import { SpaceFooter } from './components/SpaceFooter.js';
import { Preloader } from './components/Preloader.js';

class PortfolioApp {
  constructor() {
    this.initComponents();
    this.initLenis();
    this.initErrorToastHandler();
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

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
