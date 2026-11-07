/* ==========================================================================
   SPACE JOURNEY
   Scroll-driven cinematic that starts where the sky section ends:

     sun  ->  eclipse  ->  moon  ->  moon seen from space (Blade Runner theme)
          ->  hyperspace jump right through each project planet
          ->  black hole that pulls everything in except the contact block

   Everything is a pure function of scroll position, so it plays backwards
   when the user scrolls up. The provided planet images are used untouched:
   no re-encoding, no scaling tricks and no filters while they are at rest.
   ========================================================================== */

import { portfolioConfig } from '../config/portfolioConfig.js';

import blackHoleImg from '../assets/space/black-hole.png';
import cortexImg from '../assets/space/cortex-hub.png';
import ffireImg from '../assets/space/ffire-close.png';
import ffireFarImg from '../assets/space/ffire-far.png';
import reelImg from '../assets/space/research-reel.png';
import heimdalImg from '../assets/space/heimdal.png';
import multiRagImg from '../assets/space/multi-rag.png';

const IMAGES = {
  cortex: cortexImg,
  ffire: ffireImg,
  ffireFar: ffireFarImg,
  reel: reelImg,
  heimdal: heimdalImg,
  multirag: multiRagImg
};

// Native size of every supplied image and where the black hole's dark core is in it
const IMG_W = 1672;
const IMG_H = 941;
const BH_CORE = { x: 890, y: 398 };

// Length of each phase, in viewport heights of scrolling. Tweak to taste.
const UNITS = {
  eclipse: 0.9,   // sun -> moon
  pull: 1.1,      // camera pulls back: "moon seen from space" + theme change
  moonHold: 0.4,  // rest on the moon frame
  move: 0.7,      // hyperspace jump to the next planet
  hold: 0.8,      // rest on a planet
  bhHold: 0.6,    // rest on the black hole before it feeds
  suck: 1.5,      // everything is pulled in
  tail: 0.3       // rest on black hole + contact block
};

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
const easeMove = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3);

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------------------------------------------------
   Procedural moon (drawn once on a canvas, lit from the upper right)
   -------------------------------------------------------------------------- */
function buildMoonCanvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const R = size / 2;
  const rnd = mulberry32(1969);
  const inDisc = (margin = 0) => {
    for (;;) {
      const x = rnd() * size, y = rnd() * size;
      if (Math.hypot(x - R, y - R) < R - margin) return [x, y];
    }
  };

  g.save();
  g.beginPath();
  g.arc(R, R, R, 0, Math.PI * 2);
  g.clip();

  g.fillStyle = '#8f8d88';
  g.fillRect(0, 0, size, size);

  const blob = (x, y, r, rgb, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${rgb},${a})`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // soft albedo mottling
  for (let i = 0; i < 360; i++) {
    const [x, y] = inDisc();
    const r = R * (0.04 + rnd() * 0.2);
    if (rnd() < 0.5) blob(x, y, r, '46,44,43', 0.05 + rnd() * 0.12);
    else blob(x, y, r, '200,196,188', 0.05 + rnd() * 0.1);
  }

  // dark maria (large basalt plains), clustered on the upper-left
  const maria = [
    [0.36, 0.34, 0.2], [0.5, 0.26, 0.14], [0.28, 0.52, 0.16], [0.44, 0.46, 0.13],
    [0.6, 0.4, 0.09], [0.34, 0.68, 0.1], [0.2, 0.36, 0.1]
  ];
  maria.forEach(([mx, my, mr]) => {
    for (let k = 0; k < 6; k++) {
      blob(
        (mx + (rnd() - 0.5) * mr) * size,
        (my + (rnd() - 0.5) * mr) * size,
        mr * size * (0.55 + rnd() * 0.5),
        '52,56,66',
        0.3 + rnd() * 0.2
      );
    }
  });

  // regolith grain
  for (let i = 0; i < 16000; i++) {
    const [x, y] = inDisc();
    const light = rnd() < 0.5;
    g.fillStyle = light ? `rgba(225,220,210,${0.04 + rnd() * 0.1})` : `rgba(30,28,28,${0.05 + rnd() * 0.12})`;
    g.beginPath();
    g.arc(x, y, 0.6 + rnd() * 1.6, 0, Math.PI * 2);
    g.fill();
  }

  // craters (light comes from the upper right)
  const L = { x: 0.7071, y: -0.7071 };
  const lightAngle = Math.atan2(L.y, L.x);
  const craterCount = Math.round(4200 * (size / 2048) * (size / 2048));
  for (let i = 0; i < craterCount; i++) {
    const [x, y] = inDisc();
    const r = (2 + Math.pow(rnd(), 6.5) * R * 0.075) * (size / 2048);
    const depth = Math.min(1, 0.35 + r / 40); // small craters are shallow and faint

    if (r > 16) blob(x, y, r * 1.8, '218,213,204', 0.07); // ejecta halo

    g.save();
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = `rgba(24,22,22,${0.34 * depth})`;
    g.fillRect(x - r, y - r, r * 2, r * 2);
    g.fillStyle = `rgba(128,125,120,${0.16 + 0.1 * depth})`;
    g.beginPath();
    g.arc(x - L.x * r * 0.28, y - L.y * r * 0.28, r * 0.93, 0, Math.PI * 2);
    g.fill();
    g.restore();

    g.strokeStyle = `rgba(238,233,220,${0.1 + 0.16 * depth})`;
    g.lineWidth = Math.max(1, r * 0.06);
    g.beginPath();
    g.arc(x, y, r, lightAngle + Math.PI - 0.95, lightAngle + Math.PI + 0.95);
    g.stroke();
  }

  // a few big impact basins with bright rays
  for (let i = 0; i < 3; i++) {
    const [x, y] = inDisc(R * 0.2);
    const r = R * (0.045 + rnd() * 0.025);
    for (let k = 0; k < 26; k++) {
      const a = rnd() * Math.PI * 2;
      const len = r * (2 + rnd() * 5);
      g.strokeStyle = `rgba(235,230,220,${0.05 + rnd() * 0.07})`;
      g.lineWidth = 1 + rnd() * 3;
      g.beginPath();
      g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      g.stroke();
    }
    blob(x, y, r * 1.5, '240,236,228', 0.18);
  }

  // terminator: dark towards the lower-left, away from the light
  const term = g.createRadialGradient(R * 1.42, R * 0.58, 0, R * 1.42, R * 0.58, R * 1.9);
  term.addColorStop(0, 'rgba(0,0,0,0)');
  term.addColorStop(0.55, 'rgba(0,0,0,0.02)');
  term.addColorStop(0.8, 'rgba(0,0,0,0.5)');
  term.addColorStop(1, 'rgba(0,0,0,0.92)');
  g.fillStyle = term;
  g.fillRect(0, 0, size, size);

  // limb darkening
  const limb = g.createRadialGradient(R, R, R * 0.78, R, R, R);
  limb.addColorStop(0, 'rgba(0,0,0,0)');
  limb.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = limb;
  g.fillRect(0, 0, size, size);

  g.restore();
  return c;
}

/* --------------------------------------------------------------------------
   Warp / suction star layer
   -------------------------------------------------------------------------- */
class WarpField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.w = 0;
    this.h = 0;
    this.cleared = true;
    this.colors = ['255,255,255', '170,225,255', '255,205,150', '255,255,255'];
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(620, Math.max(260, (this.w * this.h) / 3200)));
    const rnd = mulberry32(42);
    this.stars = Array.from({ length: count }, () => ({
      x: rnd() * this.w,
      y: rnd() * this.h,
      z: 0.2 + rnd() * 0.8,
      c: this.colors[Math.floor(rnd() * this.colors.length)]
    }));
    this.cleared = false;
  }

  respawn(s, cx, cy) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.hypot(this.w, this.h) * (0.55 + Math.random() * 0.35);
    s.x = cx + Math.cos(a) * r;
    s.y = cy + Math.sin(a) * r;
  }

  frame(dt, vel, suck, cx, cy) {
    const { ctx, w, h } = this;
    const warpAlpha = Math.min(1, Math.abs(vel) / 900);

    if (warpAlpha < 0.02 && suck <= 0) {
      if (!this.cleared) { ctx.clearRect(0, 0, w, h); this.cleared = true; }
      return;
    }
    this.cleared = false;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    if (suck > 0) {
      // stars spiral into the singularity and are gone by the end
      const fade = 1 - smooth((suck - 0.72) / 0.28);
      const live = suck < 0.86;
      for (const s of this.stars) {
        const px = s.x, py = s.y;
        let dx = s.x - cx, dy = s.y - cy;
        let r = Math.hypot(dx, dy) || 1;
        let a = Math.atan2(dy, dx);
        const pull = (60 + 1500 * suck * suck) * (0.35 + s.z);
        r -= pull * dt * (1 + 260 / (r + 60));
        a += dt * (0.9 + 320 / (r + 50)) * (0.25 + suck);
        if (r < 14) {
          if (live) { this.respawn(s, cx, cy); continue; }
          continue;
        }
        s.x = cx + Math.cos(a) * r;
        s.y = cy + Math.sin(a) * r;
        const alpha = Math.min(1, suck * 5) * fade * (0.35 + 0.65 * s.z);
        if (alpha < 0.02) continue;
        ctx.strokeStyle = `rgba(${s.c},${alpha})`;
        ctx.lineWidth = 0.7 + s.z * 1.5;
        const tx = px + (px - s.x) * 3, ty = py + (py - s.y) * 3;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      return;
    }

    // hyperspace: stars streak opposite to the direction of travel
    const margin = 120;
    for (const s of this.stars) {
      s.x += vel * s.z * dt * 1.6;
      if (s.x < -margin) { s.x += w + margin * 2; s.y = Math.random() * h; }
      else if (s.x > w + margin) { s.x -= w + margin * 2; s.y = Math.random() * h; }
      const len = Math.min(700, vel * s.z * 0.05);
      const alpha = warpAlpha * (0.3 + 0.7 * s.z);
      ctx.strokeStyle = `rgba(${s.c},${alpha})`;
      ctx.lineWidth = 0.6 + s.z * 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x - len, s.y);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
  }
}

/* ==========================================================================
   Component
   ========================================================================== */
export class SpaceJourney {
  constructor(containerId) {
    this.mount = document.getElementById(containerId);
    if (!this.mount) return;

    this.cfg = portfolioConfig.journey;
    this.planets = this.cfg.planets;
    this.n = this.planets.length;
    this.panelCount = this.n + 2; // moon + planets + black hole
    this.lenis = null;

    this.f = 0;
    this.velS = 0;
    this.lastCard = -1;
    this.active = false;
    this.last = performance.now();

    this.buildTimeline();
    this.render();
    this.cacheNodes();
    this.buildMoon();
    this.buildChips();
    this.buildSuckables();

    this.warp = new WarpField(this.q('.jr-warp'));
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.onResize();

    requestAnimationFrame((t) => this.tick(t));
  }

  setLenis(lenis) {
    this.lenis = lenis;
  }

  q(sel) { return this.container.querySelector(sel); }

  /* ------------------------------ timeline ------------------------------ */
  buildTimeline() {
    let t = 0;
    const seg = (d) => { const s = [t, t + d]; t += d; return s; };
    const tl = { holds: [], moves: [] };
    tl.eclipse = seg(UNITS.eclipse);
    tl.pull = seg(UNITS.pull);
    tl.moonHold = seg(UNITS.moonHold);
    for (let i = 0; i < this.n; i++) {
      tl.moves.push(seg(UNITS.move));
      tl.holds.push(seg(UNITS.hold));
    }
    tl.moves.push(seg(UNITS.move));
    tl.bhHold = seg(UNITS.bhHold);
    tl.suck = seg(UNITS.suck);
    tl.tail = seg(UNITS.tail);
    tl.total = t;
    this.tl = tl;
  }

  /* -------------------------------- markup ------------------------------ */
  render() {
    const planetPanels = this.planets.map((p, i) => `
      <div class="jr-panel" data-i="${i + 1}">
        <img class="jr-img" src="${IMAGES[p.image]}" alt="${p.name} — ${p.tag}" draggable="false" decoding="async" />
        ${p.imageFar ? `<img class="jr-img jr-img-far" src="${IMAGES[p.imageFar]}" alt="" draggable="false" decoding="async" />` : ''}
      </div>`).join('');

    const labels = ['MOON', ...this.planets.map((p) => p.name), 'SINGULARITY'];
    const chapters = labels.map((l, i) => `
      <li><button type="button" class="jr-chapter" data-k="${i}" aria-label="Jump to ${l}"><span class="jr-chapter-label">${l}</span><span class="jr-chapter-tick"></span></button></li>`).join('');

    this.mount.innerHTML = `
      <section id="journey" class="journey" aria-label="Project journey through space">
        <div class="jr-stage" id="jr-stage">
          <div class="jr-track" id="jr-track">
            <div class="jr-panel jr-panel-moon" data-i="0">
              <div class="jr-space-bg"></div>
              <div class="jr-earth"><span></span></div>
              <div class="jr-moon-wrap">
                <div class="jr-moon-glow"></div>
                <canvas class="jr-moon"></canvas>
              </div>
            </div>
            ${planetPanels}
            <div class="jr-panel jr-panel-bh" data-i="${this.n + 1}">
              <img class="jr-img" src="${blackHoleImg}" alt="A black hole bending light" draggable="false" decoding="async" />
              <div class="jr-bh-glow"></div>
            </div>
          </div>

          <canvas class="jr-warp"></canvas>
          <div class="jr-chips"></div>

          <div class="jr-br" aria-hidden="true">
            <div class="jr-haze"></div>
            <div class="jr-scan"></div>
            <div class="jr-vignette"></div>
          </div>

          <div class="jr-hud">
            <div class="jr-hud-tl">
              <div class="jr-hud-kicker">GP // OFF-WORLD TRANSIT LOG</div>
              <div class="jr-hud-line">SECTOR <b data-hud="sector">00</b> · <span data-hud="place">LUNAR ORBIT</span></div>
            </div>
            <div class="jr-hud-tr">
              <div class="jr-hud-line">VELOCITY <b data-hud="vel">0.00</b>c</div>
              <div class="jr-hud-line">VECTOR <b data-hud="vec">000.0</b> KLY</div>
            </div>
            <div class="jr-dest" data-hud="dest"></div>
            <ul class="jr-chapters">${chapters}</ul>
            <div class="jr-hint">SCROLL TO TRAVEL ▸</div>
          </div>

          <div class="jr-contact" id="app-space"></div>
        </div>
      </section>`;

    this.container = this.mount.querySelector('#journey');
  }

  cacheNodes() {
    this.stage = this.q('#jr-stage');
    this.track = this.q('#jr-track');
    this.panels = [...this.container.querySelectorAll('.jr-panel')];
    this.farImg = this.q('.jr-img-far');
    this.spaceBg = this.q('.jr-space-bg');
    this.earth = this.q('.jr-earth');
    this.moonWrap = this.q('.jr-moon-wrap');
    this.moonGlow = this.q('.jr-moon-glow');
    this.moonCanvas = this.q('.jr-moon');
    this.bhGlow = this.q('.jr-bh-glow');
    this.br = this.q('.jr-br');
    this.contact = this.q('.jr-contact');
    this.chipsEl = this.q('.jr-chips');
    this.hud = {
      tl: this.q('.jr-hud-tl'),
      tr: this.q('.jr-hud-tr'),
      dest: this.q('.jr-dest'),
      chap: this.q('.jr-chapters'),
      hint: this.q('.jr-hint'),
      sector: this.q('[data-hud="sector"]'),
      place: this.q('[data-hud="place"]'),
      vel: this.q('[data-hud="vel"]'),
      vec: this.q('[data-hud="vec"]')
    };
    this.chapterBtns = [...this.container.querySelectorAll('.jr-chapter')];
    this.chapterBtns.forEach((b) => b.addEventListener('click', () => this.jumpTo(Number(b.dataset.k))));
    this.heroSun = document.getElementById('hero-sun');
    this.navBar = document.querySelector('.ios-nav-bar');
  }

  buildMoon() {
    const src = buildMoonCanvas(2560);
    this.moonCanvas.width = src.width;
    this.moonCanvas.height = src.height;
    this.moonCanvas.getContext('2d').drawImage(src, 0, 0);
    this.moonSource = src;
  }

  buildChips() {
    // Everything that gets swallowed: the moon, every planet and some rocks
    const chips = [];
    const moon = document.createElement('canvas');
    moon.width = moon.height = 320;
    moon.getContext('2d').drawImage(this.moonSource, 0, 0, 320, 320);
    chips.push({ node: moon, size: 150 });

    this.planets.forEach((p) => {
      const size = 190;
      const zoom = 3.4; // image is shown at zoom * chip width, centred on the planet
      const w = size * zoom;
      const h = (w * IMG_H) / IMG_W;
      const d = document.createElement('div');
      d.style.backgroundImage = `url(${IMAGES[p.image]})`;
      d.style.backgroundSize = `${w}px ${h}px`;
      d.style.backgroundPosition = `${size / 2 - p.focus[0] * w}px ${size / 2 - p.focus[1] * h}px`;
      d.style.backgroundRepeat = 'no-repeat';
      chips.push({ node: d, size });
    });

    const rnd = mulberry32(7);
    for (let i = 0; i < 12; i++) {
      const size = 16 + rnd() * 34;
      const d = document.createElement('div');
      const g = 70 + Math.floor(rnd() * 60);
      d.style.background = `radial-gradient(circle at 32% 30%, rgb(${g + 60},${g + 52},${g + 44}), rgb(${g - 40},${g - 44},${g - 50}))`;
      chips.push({ node: d, size, rock: true });
    }

    const total = chips.length;
    this.chips = chips.map((c, i) => {
      const el = document.createElement('div');
      el.className = c.rock ? 'jr-chip jr-chip-rock' : 'jr-chip';
      el.style.width = el.style.height = `${c.size}px`;
      el.style.marginLeft = el.style.marginTop = `${-c.size / 2}px`;
      c.node.classList.add('jr-chip-face');
      el.appendChild(c.node);
      this.chipsEl.appendChild(el);
      return {
        el,
        size: c.size,
        angle: (i / total) * Math.PI * 2 + 0.55,
        delay: (c.rock ? 0.1 : 0) + (i % 7) * 0.035,
        spin: (i % 2 ? 1 : -1) * (0.7 + (i % 3) * 0.25)
      };
    });
  }

  // Elements that are pulled into the black hole (using individual transform
  // properties so they never clobber the elements' own `transform`)
  buildSuckables() {
    this.suckables = [];
    const add = (el, key, dir) => { if (el) this.suckables.push({ el, key, dir, cx: 0, cy: 0 }); };
    add(this.hud.tl, 'hud', 1);
    add(this.hud.tr, 'hud', -1);
    add(this.hud.dest, 'dest', 1);
    add(this.hud.chap, 'hud', -1);
    add(this.hud.hint, 'hud', 1);
    add(this.navBar, 'nav', -1);
  }

  measureSuckables() {
    this.navBar = this.navBar || document.querySelector('.ios-nav-bar');
    if (this.navBar && !this.suckables.some((s) => s.el === this.navBar)) {
      this.suckables.push({ el: this.navBar, key: 'nav', dir: -1, cx: 0, cy: 0 });
    }
    this.suckables.forEach((s) => {
      const keep = { t: s.el.style.translate, r: s.el.style.rotate, s: s.el.style.scale };
      s.el.style.translate = s.el.style.rotate = s.el.style.scale = '';
      const r = s.el.getBoundingClientRect();
      s.cx = r.left + r.width / 2;
      s.cy = r.top + r.height / 2;
      s.el.style.translate = keep.t; s.el.style.rotate = keep.r; s.el.style.scale = keep.s;
    });
  }

  /* ------------------------------ geometry ------------------------------ */
  onResize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.vw = vw;
    this.vh = vh;
    this.container.style.height = `${(this.tl.total + 1) * vh}px`;

    // The moon is sized to exactly cover the sun's disc
    const sunW = this.heroSun ? this.heroSun.offsetWidth * 1.85 : 390;
    this.moonD = Math.round(sunW * 0.436);
    this.moonWrap.style.width = this.moonWrap.style.height = `${this.moonD}px`;
    this.moonWrap.style.marginLeft = this.moonWrap.style.marginTop = `${-this.moonD / 2}px`;

    // Black hole core in screen space (image is shown with object-fit: cover)
    const scale = Math.max(vw / IMG_W, vh / IMG_H);
    this.bh = {
      x: (vw - IMG_W * scale) / 2 + BH_CORE.x * scale,
      y: (vh - IMG_H * scale) / 2 + BH_CORE.y * scale
    };
    this.bhGlow.style.left = `${this.bh.x}px`;
    this.bhGlow.style.top = `${this.bh.y}px`;

    this.warp.resize();
    this.measureSuckables();
  }

  /* ------------------------------ navigation ---------------------------- */
  jumpTo(k) {
    const tl = this.tl;
    let u;
    if (k === 0) u = tl.moonHold[0] + UNITS.moonHold * 0.5;
    else if (k <= this.n) u = (tl.holds[k - 1][0] + tl.holds[k - 1][1]) / 2;
    else u = tl.suck[1] + UNITS.tail * 0.5;
    const rect = this.container.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const range = rect.height - this.vh;
    const y = top + (u / tl.total) * range;
    if (this.lenis) this.lenis.scrollTo(y, { duration: 2.4 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* -------------------------------- frame ------------------------------- */
  tick(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;

    const rect = this.container.getBoundingClientRect();
    const range = Math.max(1, rect.height - this.vh);
    const j = -rect.top / range;

    if (j < 0) {
      if (this.active) this.setActive(false);
    } else {
      if (!this.active) this.setActive(true);
      this.apply(clamp01(j) * this.tl.total, dt);
    }

    requestAnimationFrame((t) => this.tick(t));
  }

  setActive(on) {
    this.active = on;
    this.stage.classList.toggle('on', on);
    if (!on) {
      if (this.heroSun) this.heroSun.style.opacity = '';
      document.body.classList.remove('br-theme', 'jr-deep');
      if (this.navBar) this.navBar.classList.remove('br');
      this.applySuck(0, 1);
      this.f = 0;
    }
  }

  apply(u, dt) {
    const tl = this.tl;
    const { vw, vh } = this;

    // --- phase progress ------------------------------------------------
    const e = clamp01((u - tl.eclipse[0]) / UNITS.eclipse);
    const q = clamp01((u - tl.pull[0]) / UNITS.pull);

    let f = 0;
    for (let i = 0; i < tl.moves.length; i++) {
      const [a, b] = tl.moves[i];
      f += easeMove(clamp01((u - a) / (b - a)));
    }
    const s = clamp01((u - tl.suck[0]) / UNITS.suck);

    const br = smooth((u - (tl.pull[0] + UNITS.pull * 0.45)) / (UNITS.pull * 0.55 + UNITS.moonHold * 0.5));

    // --- sun -> moon (eclipse) -------------------------------------------
    const slide = easeOut(e / 0.55);
    const lit = smooth((e - 0.5) / 0.5);
    if (this.heroSun) {
      this.heroSun.style.opacity = `${1 - smooth((e - 0.55) / 0.35)}`;
    }
    const pullE = smooth(q);
    const R = Math.max(vw * 0.9, vh * 1.0);
    const scale = 1 + (((R * 2) / this.moonD) - 1) * pullE;
    const dx = -(1 - slide) * (vw * 0.55 + this.moonD);
    const limbTop = vh * 0.66;
    const dy = pullE * (limbTop + R - vh / 2);
    this.moonWrap.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
    this.moonCanvas.style.filter = lit < 1 ? `brightness(${0.015 + 0.985 * lit})` : '';
    this.moonGlow.style.opacity = `${lit * (1 - pullE)}`;

    this.spaceBg.style.opacity = `${smooth(q * 1.4)}`;
    const earthA = smooth((q - 0.35) / 0.5);
    this.earth.style.opacity = `${earthA}`;
    this.earth.style.transform = `translate3d(0, ${(1 - earthA) * 40}px, 0)`;

    // --- camera track + hyperspace --------------------------------------
    this.track.style.transform = `translate3d(${-f * 100}%, 0, 0)`;
    const vel = -((f - this.f) * vw) / dt;
    this.velS += (vel - this.velS) * Math.min(1, dt * 14);
    this.f = f;

    const blur = Math.min(2.2, (Math.abs(this.velS) / vw) * 1.6);
    this.panels.forEach((p, i) => {
      const near = Math.abs(i - f) < 1.25;
      p.style.filter = near && blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : '';
    });

    // FFIRE: close shot -> pulled-back shot while resting on the planet
    if (this.farImg) {
      const idx = this.planets.findIndex((p) => p.imageFar) + 1;
      const hp = clamp01((u - tl.holds[idx - 1][0]) / UNITS.hold);
      this.farImg.style.opacity = `${smooth((hp - 0.3) / 0.45)}`;
    }

    // --- Blade Runner theme ----------------------------------------------
    this.br.style.opacity = `${br}`;
    document.body.classList.toggle('br-theme', br > 0.5);
    document.body.classList.toggle('jr-deep', f > 0.98);
    if (this.navBar) this.navBar.classList.toggle('br', br > 0.5);

    // --- black hole ------------------------------------------------------
    const bhA = smooth(1 - Math.abs(f - (this.n + 1)) / 1.0);
    this.bhGlow.style.opacity = `${bhA * (0.25 + 0.75 * smooth(s * 1.6)) * (1 - smooth((s - 0.9) / 0.1) * 0.4)}`;
    this.bhGlow.style.transform = `translate(-50%, -50%) scale(${1 + s * 0.35})`;

    const contactA = smooth((u - (tl.moves[tl.moves.length - 1][1] - 0.15)) / 0.45);
    this.contact.style.opacity = `${contactA}`;
    this.contact.style.transform = `translate3d(0, ${(1 - contactA) * 26}px, 0)`;
    this.contact.style.pointerEvents = contactA > 0.6 ? 'auto' : 'none';

    this.warp.frame(dt, this.velS, s, this.bh.x, this.bh.y);

    // --- HUD ---------------------------------------------------------------
    const k = Math.round(f);
    const hudA = smooth((br - 0.25) / 0.75);
    let destA = 0;
    if (k === 0) {
      destA = smooth((u - (tl.pull[1] - 0.1)) / 0.3) * (1 - smooth(f / 0.3));
    } else if (k <= this.n) {
      destA = smooth(1 - Math.abs(f - k) / 0.28);
    }
    destA *= hudA;
    if (k !== this.lastCard) this.setCard(k);

    const place = k === 0 ? this.cfg.moon.name : k <= this.n ? this.planets[k - 1].name : this.cfg.blackHole.name;
    this.hud.sector.textContent = String(k).padStart(2, '0');
    if (this.hud.place.textContent !== place) this.hud.place.textContent = place;
    this.hud.vel.textContent = (Math.min(0.99, Math.abs(this.velS) / (vw * 4.5))).toFixed(2);
    this.hud.vec.textContent = (f * 118.4 + 27.3).toFixed(1).padStart(5, '0');
    this.chapterBtns.forEach((b, i) => b.classList.toggle('active', i === k));

    this.hud.dest.style.pointerEvents = destA > 0.7 ? 'auto' : 'none';
    this.applySuck(s, 1, { hud: hudA, dest: destA, nav: 1 });
    this.applyChips(s);
  }

  setCard(k) {
    this.lastCard = k;
    const d = this.hud.dest;
    if (k === 0) {
      d.innerHTML = `
        <div class="jr-dest-idx">// ORIGIN</div>
        <h3>${this.cfg.moon.name}</h3>
        <div class="jr-dest-tag">${this.cfg.moon.tag}</div>
        <p>${this.cfg.moon.desc}</p>`;
    } else if (k <= this.n) {
      const p = this.planets[k - 1];
      d.innerHTML = `
        <div class="jr-dest-idx">// DESTINATION ${String(k).padStart(2, '0')} / ${String(this.n).padStart(2, '0')}</div>
        <h3>${p.name}</h3>
        <div class="jr-dest-tag">${p.tag}</div>
        <p>${p.desc}</p>
        <ul class="jr-stack">${p.stack.map((t) => `<li>${t}</li>`).join('')}</ul>
        <a class="jr-dest-link" href="${p.repo}" target="_blank" rel="noopener noreferrer">OPEN REPOSITORY ↗</a>`;
    } else {
      d.innerHTML = '';
    }
  }

  // Pull HUD / nav towards the singularity. s = 0 restores everything.
  applySuck(s, _unused, base = { hud: 1, dest: 1, nav: 1 }) {
    this.suckables.forEach((it, i) => {
      const el = it.el;
      const a = base[it.key] ?? 1;
      if (s <= 0) {
        el.style.translate = el.style.rotate = el.style.scale = '';
        el.style.opacity = it.key === 'nav' ? '' : `${a}`;
        return;
      }
      const t = clamp01((s - 0.03 * i) / (0.86 - 0.03 * i));
      const g = t * t;
      const x = (this.bh.x - it.cx) * g;
      const y = (this.bh.y - it.cy) * g;
      el.style.translate = `${x}px ${y}px`;
      el.style.rotate = `${g * 420 * it.dir}deg`;
      el.style.scale = `${Math.max(0, 1 - g)}`;
      el.style.opacity = `${a * (1 - g * g)}`;
    });
  }

  // Planets, the moon and debris spiral into the singularity and stretch as they fall
  applyChips(s) {
    const visible = s > 0 && s < 1;
    this.chipsEl.style.display = visible ? 'block' : 'none';
    if (!visible) return;
    const R0 = Math.hypot(this.vw, this.vh) * 0.78;
    this.chips.forEach((c) => {
      const t = clamp01((s - c.delay) / (0.97 - c.delay));
      const r = R0 * Math.pow(1 - t, 2.2) + 4;
      const ang = c.angle + Math.pow(t, 0.75) * 5.8 * c.spin;
      const x = this.bh.x + Math.cos(ang) * r;
      const y = this.bh.y + Math.sin(ang) * r;
      const toCenter = Math.atan2(this.bh.y - y, this.bh.x - x);
      const t3 = t * t * t;
      const sx = (1 + 2.6 * t3) * (1 - t * t);
      const sy = Math.max(0.02, (1 - 0.85 * t3) * (1 - t * t));
      c.el.style.opacity = `${1 - smooth((t - 0.82) / 0.18)}`;
      c.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${toCenter}rad) scale(${sx}, ${sy})`;
    });
  }
}
