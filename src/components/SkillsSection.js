/* ==========================================================================
   SKILLS SECTION (Goldy Pahal - High-Contrast iOS Glass Boxes)
   ========================================================================== */

import { portfolioConfig } from '../config/portfolioConfig.js';

export class SkillsSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <section id="skills" class="content-section">
        <div class="section-tag" style="color: #38bdf8; opacity: 1;">// 03. TECHNICAL CAPABILITIES</div>
        <h2 class="section-title" style="color: #ffffff; text-shadow: 0 4px 20px rgba(0,0,0,0.4);">Skills & Technologies</h2>

        <div class="grid-2">
          ${portfolioConfig.skillCategories.map(cat => `
            <div class="ios-glass-card skills-glass-card">
              <h3 class="skills-card-header">
                <span>${cat.category}</span>
                <span class="skills-count">(${cat.skills.length})</span>
              </h3>

              <div class="skills-tags-wrap">
                ${cat.skills.map(skill => `
                  <span class="ios-skill-tag skill-tag-light">
                    ${skill}
                  </span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }
}
