/* ==========================================================================
   LANDING HERO COMPONENT (Goldy Pahal - Magnetic Typography & Liquid Effects)
   ========================================================================== */

import { portfolioConfig } from '../config/portfolioConfig.js';
import gsap from 'gsap';

export class LandingHero {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.charSpans = [];
    this.mouse = { x: -1000, y: -1000 };
    this.liquidCanvas = document.getElementById('nothin-liquid-canvas');
    this.liquidCtx = this.liquidCanvas ? this.liquidCanvas.getContext('2d') : null;
    this.splats = [];

    this.render();
    this.initMagneticText();
    this.initLiquidReveal();
  }

  render() {
    this.container.innerHTML = `
      <section id="hero" class="hero-section">
        <!-- Top iOS Header Bar -->
        <header class="ios-nav-bar">
          <nav class="ios-nav-links">
            <a href="#hero">HOME</a>
            <a href="#about">ABOUT</a>
            <a href="#skills">SKILLS</a>
            <a href="#exploring">EXPLORING</a>
            <a href="#journey">PROJECTS</a>
          </nav>

          <a href="mailto:${portfolioConfig.email}" class="ios-pill-btn nav-contact-btn">
            CONTACT ME →
          </a>
        </header>

        <!-- Hero Title & Magnetic Typography -->
        <div class="hero-title-wrap">
          <div class="hero-role-tag">
            // ${portfolioConfig.role}
          </div>

          <h1 class="hero-name" id="magnetic-hero-name">
            ${this.splitText(portfolioConfig.name)}
          </h1>

          <p class="hero-subtitle">
            ${portfolioConfig.tagline}
          </p>
        </div>

        <!-- Hero Bottom Action Bar & Action Pills -->
        <div class="hero-footer-bar">
          <div class="hero-action-btns">
            <a href="#skills" class="ios-pill-btn">
              VIEW MY WORK & SKILLS
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
            
            <a href="mailto:${portfolioConfig.email}" class="ios-pill-btn secondary">
              GET IN TOUCH
            </a>
          </div>

          <!-- Education Summary Glass Card -->
          <div class="ios-glass-card hero-edu-card">
            <div class="edu-dot"></div>
            <div>
              <div class="edu-title">
                ${portfolioConfig.about.institution}
              </div>
              <div class="edu-subtitle">
                ${portfolioConfig.about.specialization} (${portfolioConfig.about.timeline})
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  splitText(text) {
    return [...text].map(char => {
      if (char === ' ') return '<span style="display: inline-block; width: 0.3em;">&nbsp;</span>';
      return `<span class="magnetic-char">${char}</span>`;
    }).join('');
  }

  initMagneticText() {
    this.charSpans = document.querySelectorAll('#magnetic-hero-name .magnetic-char');
    const radius = 180;
    const maxForce = 55;

    window.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      this.charSpans.forEach(span => {
        const rect = span.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;

        const dx = charX - mouseX;
        const dy = charY - mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / radius) * maxForce;
          const pushX = Math.cos(angle) * force;
          const pushY = Math.sin(angle) * force;

          gsap.to(span, {
            x: pushX,
            y: pushY,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          gsap.to(span, {
            x: 0,
            y: 0,
            duration: 1.0,
            ease: 'elastic.out(1, 0.3)',
            overwrite: 'auto'
          });
        }
      });
    });
  }

  initLiquidReveal() {
    if (!this.liquidCanvas) return;
    this.liquidCanvas.width = window.innerWidth;
    this.liquidCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      this.liquidCanvas.width = window.innerWidth;
      this.liquidCanvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      if (window.scrollY < window.innerHeight * 0.8) {
        this.splats.push({
          x: e.clientX,
          y: e.clientY,
          radius: 40 + Math.random() * 25,
          alpha: 0.45,
          color: 'rgba(255, 255, 255, '
        });
      }
    });

    const renderLiquid = () => {
      if (this.liquidCtx && this.splats.length > 0) {
        this.liquidCtx.clearRect(0, 0, this.liquidCanvas.width, this.liquidCanvas.height);
        
        for (let i = this.splats.length - 1; i >= 0; i--) {
          const s = this.splats[i];
          s.radius += 0.8;
          s.alpha -= 0.015;

          if (s.alpha <= 0) {
            this.splats.splice(i, 1);
            continue;
          }

          const grad = this.liquidCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
          grad.addColorStop(0, `${s.color}${s.alpha})`);
          grad.addColorStop(1, `${s.color}0)`);

          this.liquidCtx.fillStyle = grad;
          this.liquidCtx.beginPath();
          this.liquidCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          this.liquidCtx.fill();
        }
      }
      requestAnimationFrame(renderLiquid);
    };

    renderLiquid();
  }
}
