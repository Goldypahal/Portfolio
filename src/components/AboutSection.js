/* ==========================================================================
   ABOUT & PILLARS SECTION (Goldy Pahal - iOS Glass Box Layout)
   ========================================================================== */

import { portfolioConfig } from '../config/portfolioConfig.js';

export class AboutSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <section id="about" class="content-section">
        <div class="section-tag">// 01. BACKGROUND & VISION</div>
        <h2 class="section-title">About Me</h2>

        <!-- Main Bio Glass Box -->
        <div class="ios-glass-card" style="padding: 40px; margin-bottom: 40px;">
          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
            <div style="width: 42px; height: 42px; border-radius: 14px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); color: #2563eb;">
              CU
            </div>
            <div>
              <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--text-dark);">
                ${portfolioConfig.about.institution}
              </h3>
              <p style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);">
                ${portfolioConfig.about.degree} (${portfolioConfig.about.specialization}) · ${portfolioConfig.about.timeline}
              </p>
            </div>
          </div>

          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-dark); margin-bottom: 16px;">
            ${portfolioConfig.about.bio}
          </p>

          <p style="font-size: 0.98rem; line-height: 1.6; color: var(--text-muted); font-family: var(--font-mono);">
            ${portfolioConfig.about.workedOn}
          </p>
        </div>

        <!-- What I Care About (4 Pillars Grid) -->
        <div class="section-tag" style="margin-top: 50px;">// 02. CORE PILLARS</div>
        <h3 style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; margin-bottom: 24px;">What I Care About</h3>

        <div class="grid-4">
          ${portfolioConfig.pillars.map(pillar => `
            <div class="ios-glass-card" style="padding: 30px;">
              <div style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; color: #2563eb; margin-bottom: 10px;">
                // ${pillar.title}
              </div>
              <h4 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; margin-bottom: 12px; color: var(--text-dark);">
                ${pillar.title}
              </h4>
              <p style="font-size: 0.92rem; line-height: 1.55; color: var(--text-muted);">
                ${pillar.desc}
              </p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
}
