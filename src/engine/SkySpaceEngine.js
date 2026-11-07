/* ==========================================================================
   SKY-TO-SPACE BACKGROUND ENGINE & CONTINUOUS COLOR TRANSFORMATION
   ========================================================================== */

export class SkySpaceEngine {
  constructor() {
    this.skyBg = document.getElementById('sky-bg');
    this.starCanvas = document.getElementById('star-canvas');
    this.heroSun = document.getElementById('hero-sun');
    this.navBar = document.querySelector('.ios-nav-bar');
    this.cloudWrapper = document.getElementById('cloud-wrapper');

    this.starCtx = this.starCanvas ? this.starCanvas.getContext('2d') : null;
    this.stars = [];
    this.mouse = { x: -1000, y: -1000 };
    this.scrollProgress = 0;

    // Define Sky-to-Space Continuous Gradient Keyframes
    this.colorKeyframes = [
      {
        p: 0.0, // Bright Sunny Day
        stops: [[43, 132, 217], [82, 165, 236], [137, 199, 245], [188, 225, 248]]
      },
      {
        p: 0.25, // Late Afternoon Golden Hour
        stops: [[65, 120, 200], [140, 160, 220], [245, 185, 120], [255, 215, 160]]
      },
      {
        p: 0.50, // Vivid Evening Sunset
        stops: [[184, 59, 29], [216, 105, 64], [232, 153, 74], [43, 27, 48]]
      },
      {
        p: 0.75, // Twilight Deep Indigo
        stops: [[24, 20, 50], [20, 26, 65], [16, 20, 42], [8, 10, 24]]
      },
      {
        p: 1.0, // Deep Space Cosmos
        stops: [[4, 7, 20], [9, 14, 36], [5, 8, 20], [2, 4, 10]]
      }
    ];

    // Define Sun Trajectory Keyframes across Scroll Progress (0.0 -> 1.0)
    this.sunKeyframes = [
      { p: 0.00, left: 76, top: 18, scale: 1.00, blur: 35, alpha: 0.65 },
      { p: 0.35, left: 54, top: 38, scale: 1.25, blur: 48, alpha: 0.75 },
      { p: 0.70, left: 34, top: 56, scale: 1.50, blur: 62, alpha: 0.85 },
      { p: 1.00, left: 50, top: 50, scale: 1.85, blur: 80, alpha: 0.95 }
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.initStarfield();
    this.bindScroll();
    this.animate();
  }

  resize() {
    if (this.starCanvas) {
      this.starCanvas.width = window.innerWidth;
      this.starCanvas.height = window.innerHeight;
      this.initStarfield();
    }
  }

  initStarfield() {
    if (!this.starCanvas) return;
    this.stars = [];
    const count = Math.floor((window.innerWidth * window.innerHeight) / 5000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.starCanvas.width,
        y: Math.random() * this.starCanvas.height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  bindScroll() {
    this.updateScroll();
    window.addEventListener('scroll', () => this.updateScroll(), { passive: true });
  }

  updateScroll() {
    // The sky-to-space gradient runs from the top of the page to the start of
    // the space journey (#journey), which then takes over with its own stage.
    const journey = document.getElementById('journey');
    let limit;
    if (journey) {
      limit = journey.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.2;
    } else {
      limit = document.documentElement.scrollHeight - window.innerHeight;
    }
    this.scrollProgress = limit > 0 ? Math.min(1, window.scrollY / limit) : 0;
    this._progressKey = `${window.scrollY}|${limit}`;
    this.updateAtmosphere(this.scrollProgress);
  }

  lerpColor(c1, c2, factor) {
    return c1.map((v, i) => Math.round(v + (c2[i] - v) * factor));
  }

  interpolateSun(p) {
    const keyframes = this.sunKeyframes;
    if (p <= keyframes[0].p) return keyframes[0];
    if (p >= keyframes[keyframes.length - 1].p) return keyframes[keyframes.length - 1];

    let k1 = keyframes[0];
    let k2 = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (p >= keyframes[i].p && p <= keyframes[i + 1].p) {
        k1 = keyframes[i];
        k2 = keyframes[i + 1];
        break;
      }
    }

    const range = k2.p - k1.p;
    const linearFactor = range > 0 ? (p - k1.p) / range : 0;
    // Smooth Hermite easing factor to guarantee C1 smooth motion
    const t = Math.max(0, Math.min(1, linearFactor));
    const smoothFactor = t * t * (3 - 2 * t);

    return {
      left: k1.left + (k2.left - k1.left) * smoothFactor,
      top: k1.top + (k2.top - k1.top) * smoothFactor,
      scale: k1.scale + (k2.scale - k1.scale) * smoothFactor,
      blur: k1.blur + (k2.blur - k1.blur) * smoothFactor,
      alpha: k1.alpha + (k2.alpha - k1.alpha) * smoothFactor
    };
  }

  updateAtmosphere(progress) {
    const p = Math.max(0, Math.min(1, progress));

    // 1. Continuous RGB Interpolation Across Keyframes
    if (this.skyBg) {
      let k1 = this.colorKeyframes[0];
      let k2 = this.colorKeyframes[this.colorKeyframes.length - 1];

      for (let i = 0; i < this.colorKeyframes.length - 1; i++) {
        if (p >= this.colorKeyframes[i].p && p <= this.colorKeyframes[i + 1].p) {
          k1 = this.colorKeyframes[i];
          k2 = this.colorKeyframes[i + 1];
          break;
        }
      }

      const range = k2.p - k1.p;
      const factor = range > 0 ? Math.min(1, Math.max(0, (p - k1.p) / range)) : 0;

      const currentStops = k1.stops.map((stop1, idx) => {
        const stop2 = k2.stops[idx];
        const rgb = this.lerpColor(stop1, stop2, factor);
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      });

      this.skyBg.style.backgroundImage = `linear-gradient(180deg, ${currentStops[0]} 0%, ${currentStops[1]} 35%, ${currentStops[2]} 70%, ${currentStops[3]} 100%)`;
    }

    // 2. Starfield & Navbar Theme Transition
    if (this.starCanvas) {
      const starOpacity = Math.max(0, (p - 0.45) / 0.45);
      this.starCanvas.style.opacity = `${starOpacity}`;
    }

    if (!this.navBar) {
      this.navBar = document.querySelector('.ios-nav-bar');
    }
    if (this.navBar) {
      if (p > 0.55) {
        this.navBar.classList.add('dark-mode');
      } else {
        this.navBar.classList.remove('dark-mode');
      }
    }

    // 3. Clouds Fade & Drift
    if (!this.cloudWrapper) {
      this.cloudWrapper = document.getElementById('cloud-wrapper');
    }
    if (this.cloudWrapper) {
      if (p > 0.30) {
        const fade = Math.max(0, 1 - (p - 0.30) / 0.35);
        this.cloudWrapper.style.opacity = `${fade}`;
        this.cloudWrapper.style.transform = `translateY(${(p - 0.30) * 140}px)`;
      } else {
        this.cloudWrapper.style.opacity = '1';
        this.cloudWrapper.style.transform = 'translateY(0px)';
      }
    }

    // 4. Smooth GPU Hardware-Accelerated Sun Motion Across Keyframes
    if (this.heroSun) {
      const sunState = this.interpolateSun(p);
      this.heroSun.style.transform = `translate3d(${sunState.left}vw, ${sunState.top}vh, 0) translate(-50%, -50%) scale(${sunState.scale}) rotate(${p * 180}deg)`;
      this.heroSun.style.filter = `drop-shadow(0 0 ${sunState.blur}px rgba(255, 200, 0, ${sunState.alpha}))`;
    }
  }

  animate() {
    // Layout can still change after load (fonts, images): keep progress in sync
    const journey = document.getElementById('journey');
    if (journey) {
      const key = `${window.scrollY}|${journey.getBoundingClientRect().top + window.scrollY + window.innerHeight * 0.2}`;
      if (key !== this._progressKey) this.updateScroll();
    }

    // Render Starfield in Space (skipped once the journey stage fully covers it)
    if (this.starCtx && this.starCanvas && !document.body.classList.contains('jr-deep') && parseFloat(this.starCanvas.style.opacity) > 0) {
      this.starCtx.clearRect(0, 0, this.starCanvas.width, this.starCanvas.height);
      for (let star of this.stars) {
        star.alpha += star.twinkleSpeed * star.twinkleDir;
        if (star.alpha >= 0.95 || star.alpha <= 0.15) star.twinkleDir *= -1;

        this.starCtx.beginPath();
        this.starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.starCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha)})`;
        this.starCtx.fill();
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}
