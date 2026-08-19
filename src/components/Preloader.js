/* ==========================================================================
   PRELOADER COMPONENT (5-Second Animated Sun & 0-100 Loading Counter)
   ========================================================================== */

import gsap from 'gsap';
import oceanSunsetUrl from '../assets/ocean_sunset.svg';

export class Preloader {
  constructor(containerId, onComplete) {
    this.container = document.getElementById(containerId);
    this.onComplete = onComplete;
    if (!this.container) return;

    this.duration = 5000; // 5 Seconds total
    this.render();
    this.startCounter();
  }

  render() {
    this.container.innerHTML = `
      <div id="preloader-overlay" class="preloader-overlay">
        <!-- Ambient Radial Glow Behind Sun -->
        <div class="preloader-glow"></div>

        <!-- Center Sun Container with Liquid Ocean Reflection Waves -->
        <div class="preloader-sun-wrap">
          <img src="${oceanSunsetUrl}" alt="Ocean Sunset Preloader" class="preloader-sun-img ocean-sunset-mode" />
        </div>

        <!-- Preloader Information & Counter -->
        <div class="preloader-info">
          <div class="preloader-role">// GOLDY PAHAL PORTFOLIO</div>
          <div class="preloader-counter" id="preloader-counter">0%</div>
          
          <div class="preloader-progress-track">
            <div class="preloader-progress-fill" id="preloader-fill"></div>
          </div>

          <div class="preloader-status" id="preloader-status">
            INITIALIZING INTELLIGENT SYSTEMS...
          </div>
        </div>
      </div>
    `;
  }

  startCounter() {
    const counterEl = document.getElementById('preloader-counter');
    const fillEl = document.getElementById('preloader-fill');
    const overlayEl = document.getElementById('preloader-overlay');
    const statusEl = document.getElementById('preloader-status');

    const statuses = [
      "INITIALIZING INTELLIGENT SYSTEMS...",
      "LOADING AI/ML ENGINE...",
      "BUILDING GRAPHICS & ATMOSPHERE...",
      "PREPARING SKY-TO-SPACE TRANSITION...",
      "WELCOME TO GOLDY PAHAL PORTFOLIO"
    ];

    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / this.duration);
      const percent = Math.floor(progress * 100);

      if (counterEl) {
        counterEl.textContent = `${percent}%`;
      }
      if (fillEl) {
        fillEl.style.width = `${percent}%`;
      }

      if (statusEl) {
        const statusIdx = Math.min(statuses.length - 1, Math.floor(progress * statuses.length));
        statusEl.textContent = statuses[statusIdx];
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (counterEl) counterEl.textContent = '100%';
        if (fillEl) fillEl.style.width = '100%';

        setTimeout(() => {
          if (overlayEl) {
            gsap.to(overlayEl, {
              opacity: 0,
              scale: 1.05,
              duration: 0.8,
              ease: 'power3.inOut',
              onComplete: () => {
                this.container.style.display = 'none';
                if (typeof this.onComplete === 'function') {
                  this.onComplete();
                }
              }
            });
          }
        }, 300);
      }
    };

    requestAnimationFrame(update);
  }
}
