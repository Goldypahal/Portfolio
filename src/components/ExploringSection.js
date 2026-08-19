/* ==========================================================================
   CURRENTLY EXPLORING SECTION (High-Contrast iOS Glass Boxes)
   ========================================================================== */

import { portfolioConfig } from '../config/portfolioConfig.js';

export class ExploringSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <section id="exploring" class="content-section">
        <div class="section-tag" style="color: #60a5fa; opacity: 1;">// 04. RESEARCH & FUTURE FOCUS</div>
        <h2 class="section-title" style="color: #ffffff; text-shadow: 0 4px 20px rgba(0,0,0,0.5);">Currently Exploring</h2>

        <div class="grid-3">
          ${portfolioConfig.exploring.map((item, idx) => `
            <div class="ios-glass-card" style="padding: 32px; background: rgba(12, 18, 32, 0.65); backdrop-filter: blur(28px) saturate(200%); -webkit-backdrop-filter: blur(28px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.22); box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4);">
              <div style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: #60a5fa; margin-bottom: 12px; letter-spacing: 0.1em;">
                FOCUS // 0${idx + 1}
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; color: #ffffff; margin-bottom: 12px; letter-spacing: -0.01em;">
                ${item.title}
              </h3>
              <p style="font-size: 0.95rem; line-height: 1.6; color: rgba(255, 255, 255, 0.85);">
                ${item.desc}
              </p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
}
