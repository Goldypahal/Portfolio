/* ==========================================================================
   MOVING ILLUSTRATIVE CLOUD SYSTEM (Smaller to Medium Size & Subtle Blur)
   ========================================================================== */

export class CloudSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div id="cloud-wrapper" style="position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: -2; pointer-events: none; overflow: hidden; transition: opacity 0.8s ease, transform 0.8s ease;">
        
        <!-- Cloud Layer 1 (Far Background Drift - Medium Small & Soft Blur) -->
        <div class="cloud-drift far-cloud" style="position: absolute; top: 6vh; left: -10vw; width: 520px; opacity: 0.8; filter: blur(3.5px); animation: cloudMove 85s linear infinite;">
          ${this.createCloudSvg(0.55)}
        </div>

        <!-- Cloud Layer 2 (Mid-Ground Cloud Right - Medium & Soft Blur) -->
        <div class="cloud-drift mid-cloud" style="position: absolute; top: 22vh; right: -5vw; width: 460px; opacity: 0.85; filter: blur(3px); animation: cloudMoveReverse 65s linear infinite;">
          ${this.createCloudSvg(0.48)}
        </div>

        <!-- Cloud Layer 3 (Foreground Cumulus Bottom Left - Medium & Soft Blur) -->
        <div class="cloud-drift fore-cloud" style="position: absolute; bottom: 8vh; left: -5vw; width: 620px; opacity: 0.88; filter: blur(4px); animation: cloudMove 110s linear infinite;">
          ${this.createCloudSvg(0.62)}
        </div>

        <!-- Cloud Layer 4 (Extra Ambient Mid Cloud Left) -->
        <div class="cloud-drift mid-left-cloud" style="position: absolute; top: 45vh; left: 15vw; width: 440px; opacity: 0.75; filter: blur(4.5px); animation: cloudMove 95s linear infinite;">
          ${this.createCloudSvg(0.45)}
        </div>

      </div>

      <style>
        @keyframes cloudMove {
          0%   { transform: translate3d(-15vw, 0, 0); }
          100% { transform: translate3d(115vw, 0, 0); }
        }

        @keyframes cloudMoveReverse {
          0%   { transform: translate3d(15vw, 0, 0); }
          100% { transform: translate3d(-115vw, 0, 0); }
        }
      </style>
    `;
  }

  createCloudSvg(scale = 0.5) {
    return `
      <svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cloudFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="70%" stop-color="#f0f6fc" />
            <stop offset="100%" stop-color="#d6e6f5" />
          </linearGradient>

          <!-- Halftone Dot Pattern Overlay inside Cloud -->
          <pattern id="cloudHalftone" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="rgba(15, 35, 75, 0.08)" />
            <circle cx="9" cy="9" r="1.5" fill="rgba(15, 35, 75, 0.08)" />
          </pattern>
        </defs>

        <g transform="scale(${scale})">
          <!-- Main Cloud Compound Path with Ink Outline Contours -->
          <path d="M 120 350
                   C 70 350, 40 310, 50 260
                   C 20 230, 30 170, 70 150
                   C 70 90, 140 50, 210 70
                   C 250 20, 340 10, 410 40
                   C 470 10, 560 30, 600 80
                   C 660 70, 730 110, 740 170
                   C 780 200, 780 270, 740 310
                   C 760 350, 720 390, 660 380
                   C 620 420, 520 430, 460 390
                   C 400 430, 280 430, 230 380
                   C 170 400, 130 380, 120 350 Z"
                fill="url(#cloudFillGrad)"
                stroke="#0b1329"
                stroke-width="5"
                stroke-linejoin="round"
                stroke-linecap="round" />

          <!-- Halftone Texture Layer -->
          <path d="M 120 350
                   C 70 350, 40 310, 50 260
                   C 20 230, 30 170, 70 150
                   C 70 90, 140 50, 210 70
                   C 250 20, 340 10, 410 40
                   C 470 10, 560 30, 600 80
                   C 660 70, 730 110, 740 170
                   C 780 200, 780 270, 740 310
                   C 760 350, 720 390, 660 380
                   C 620 420, 520 430, 460 390
                   C 400 430, 280 430, 230 380
                   C 170 400, 130 380, 120 350 Z"
                fill="url(#cloudHalftone)" />

          <!-- Inner Illustrative Contour Arcs -->
          <path d="M 70 150 C 110 130, 170 140, 210 170" fill="none" stroke="#0b1329" stroke-width="4" stroke-linecap="round" />
          <path d="M 210 70 C 270 50, 340 70, 370 110" fill="none" stroke="#0b1329" stroke-width="4" stroke-linecap="round" />
          <path d="M 410 40 C 470 30, 540 60, 570 100" fill="none" stroke="#0b1329" stroke-width="4" stroke-linecap="round" />
          <path d="M 600 80 C 660 90, 710 130, 730 170" fill="none" stroke="#0b1329" stroke-width="4" stroke-linecap="round" />
          <path d="M 230 380 C 280 340, 380 340, 430 370" fill="none" stroke="#0b1329" stroke-width="4" stroke-linecap="round" />
        </g>
      </svg>
    `;
  }
}
