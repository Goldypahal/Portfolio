/* ==========================================================================
   FINAL SECTION COMPONENT: "FROM SKY TO SPACE" (Goldy Pahal Exact Contacts)
   ========================================================================== */

import { portfolioConfig } from '../config/portfolioConfig.js';

export class SpaceFooter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <section id="space" class="space-section" aria-label="Contact">
        <div class="space-central-container">
          

          <!-- Top-Left Radial Orbit Card -->
          <div class="orbit-card top-left">
            <div style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.12em; color: #fbbf24; margin-bottom: 6px;">// 01. PHILOSOPHY</div>
            <h3>BUILD · RESEARCH · SOLVE</h3>
            <p>Turning abstract AI concepts and algorithms into practical, functional software products that people can actually use.</p>
          </div>

          <!-- Top-Right Radial Orbit Card -->
          <div class="orbit-card top-right">
            <div style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.12em; color: #60a5fa; margin-bottom: 6px;">// 02. DIRECT INQUIRY</div>
            <h3>GET IN TOUCH</h3>
            <p style="margin-bottom: 10px; font-size: 0.85rem; color: rgba(255,255,255,0.75);">Ready for AI/ML roles & software development projects.</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <a href="mailto:${portfolioConfig.email}" class="ios-pill-btn" style="padding: 8px 16px; font-size: 0.78rem; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; justify-content: center;">
                ✉ ${portfolioConfig.email}
              </a>
              <a href="tel:${portfolioConfig.phoneRaw}" class="ios-pill-btn" style="padding: 8px 16px; font-size: 0.78rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: #fff; justify-content: center;">
                📞 ${portfolioConfig.phone}
              </a>
            </div>
          </div>

          <!-- Bottom-Left Radial Orbit Card -->
          <div class="orbit-card bottom-left">
            <div style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.12em; color: #a78bfa; margin-bottom: 6px;">// 03. PROFILES</div>
            <h3>GOLDY PAHAL ON THE WEB</h3>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
              <a href="${portfolioConfig.githubUrl}" target="_blank" style="color: #60a5fa; font-family: var(--font-mono); font-size: 0.82rem; text-decoration: none; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px;">
                <span>GITHUB / GOLDYPAHAL</span> <span>↗</span>
              </a>
              <a href="${portfolioConfig.linkedinUrl}" target="_blank" style="color: #60a5fa; font-family: var(--font-mono); font-size: 0.82rem; text-decoration: none; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px;">
                <span>LINKEDIN / GOLDY PAHAL</span> <span>↗</span>
              </a>
            </div>
          </div>

          <!-- Bottom-Right Radial Orbit Card -->
          <div class="orbit-card bottom-right">
            <div style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.12em; color: #34d399; margin-bottom: 6px;">// 04. EDUCATION</div>
            <h3>CHANDIGARH UNIVERSITY</h3>
            <p style="margin-bottom: 8px;">B.E. CS Engineering — AI & ML Specialization (2024 — Present)</p>
            <a href="mailto:${portfolioConfig.email}" class="ios-pill-btn" style="padding: 8px 20px; font-size: 0.82rem; width: 100%; justify-content: center;">
              SEND AN EMAIL
            </a>
          </div>

        </div>

        <!-- Space Section Footer Credits -->
        <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); font-family: var(--font-mono); font-size: 0.75rem; color: rgba(255,255,255,0.45); letter-spacing: 0.1em; text-align: center;">
          © ${new Date().getFullYear()} ${portfolioConfig.name} · ${portfolioConfig.email} · ${portfolioConfig.phone}
        </div>
      </section>
    `;
  }
}
