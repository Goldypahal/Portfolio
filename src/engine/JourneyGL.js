/* ==========================================================================
   JOURNEY WEBGL LAYER (Three.js, loaded lazily)

   Real-time 3D for the parts of the journey that benefit from it:
     - a lit, bump-mapped moon whose phase and distance are driven by scroll
     - a GPU starfield that streaks during hyperspace and spirals into the
       black hole
     - the black hole artwork as a texture on a plane, with a gravitational
       lens / swirl shader that is the identity function when at rest

   Nothing here runs unless something is visible, and the planet artwork stays
   in the DOM so it is shown untouched.
   ========================================================================== */

import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  Mesh,
  SphereGeometry,
  PlaneGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  MeshStandardMaterial,
  ShaderMaterial,
  DirectionalLight,
  AmbientLight,
  CanvasTexture,
  TextureLoader,
  SRGBColorSpace,
  NoColorSpace,
  RepeatWrapping,
  ClampToEdgeWrapping,
  LinearFilter,
  AdditiveBlending,
  DoubleSide,
  ACESFilmicToneMapping
} from 'three';

import { buildMoonMaps } from './moonMaps.js';

const FOV = 30;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------- star streak shader --------------------------- */
const STAR_VERT = /* glsl */ `
  attribute vec4 aSeed;   // x, y in 0..1, depth 0.2..1, hue 0..1
  attribute vec2 aRand;   // radius factor, start angle
  uniform vec2  uRes;
  uniform float uShift;   // accumulated travel (px) - hyperspace
  uniform float uVel;     // current velocity (px/s)
  uniform float uWarp;    // 0..1 streak visibility
  uniform float uS;       // 0..1 black hole feeding progress
  uniform vec2  uHole;    // black hole centre (px)
  varying vec3  vCol;
  varying float vAlpha;
  varying vec2  vQ;

  vec3 hueCol(float h) {
    if (h < 0.33) return vec3(1.0);
    if (h < 0.55) return vec3(0.67, 0.88, 1.0);
    if (h < 0.80) return vec3(1.0, 0.80, 0.60);
    return vec3(1.0);
  }

  vec2 spiral(float tt, float z) {
    float diag = length(uRes);
    float r0 = diag * (0.22 + 0.9 * aRand.x);
    float r = r0 * pow(max(0.0, 1.0 - tt), 2.0);
    float a = aRand.y + tt * tt * 7.0 * (0.6 + z);
    return uHole + r * vec2(cos(a), sin(a));
  }

  void main() {
    float z = aSeed.z;
    vec2 head;
    vec2 tail;
    float alpha;
    float width = 0.7 + z * 1.6;

    if (uS <= 0.0) {
      float span = uRes.x + 240.0;
      float x = mod(aSeed.x * uRes.x + uShift * z * 1.6 + 120.0, span) - 120.0;
      head = vec2(x, aSeed.y * uRes.y);
      float len = clamp(uVel * z * 0.05, -700.0, 700.0);
      tail = head - vec2(len, 0.0);
      alpha = uWarp * (0.3 + 0.7 * z);
    } else {
      float tt = clamp(uS * (0.8 + 0.5 * aRand.x) / 0.9, 0.0, 1.0);
      head = spiral(tt, z);
      tail = spiral(max(0.0, tt - 0.07), z);
      float vanish = 1.0 - smoothstep(0.72, 1.0, uS);
      alpha = smoothstep(0.0, 0.12, uS) * vanish * (0.35 + 0.65 * z) * step(tt, 0.995);
    }

    vec2 d = head - tail;
    float len2 = length(d);
    vec2 dir = len2 > 0.001 ? d / len2 : vec2(1.0, 0.0);
    if (len2 < 2.0) { tail = head - dir * 2.0; }
    vec2 perp = vec2(-dir.y, dir.x);

    float along = position.x + 0.5;               // 0 at tail, 1 at head
    vec2 p = mix(tail, head, along) + perp * position.y * width * 2.0;

    vCol = hueCol(aSeed.w);
    vAlpha = alpha;
    vQ = vec2(along, position.y * 2.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3  vCol;
  varying float vAlpha;
  varying vec2  vQ;
  void main() {
    float fade = smoothstep(0.0, 0.7, vQ.x);          // faint tail, bright head
    float edge = 1.0 - abs(vQ.y);
    float a = vAlpha * fade * edge;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vCol * a, a);
  }
`;

/* ------------------------------ black hole shader -------------------------- */
const BH_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BH_FRAG = /* glsl */ `
  uniform sampler2D map;
  uniform vec2  uUvScale;   // object-fit: cover mapping
  uniform vec2  uUvOffset;
  uniform vec2  uHole;      // black hole centre in image uv
  uniform float uImgAspect; // image width / height
  uniform float uS;         // 0..1 feeding progress (0 = untouched artwork)
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv * uUvScale + uUvOffset;
    vec2 p = uv - uHole;
    p.x *= uImgAspect;
    float r = length(p);

    float well  = exp(-r * 3.4);
    float swirl = uS * uS * 7.0 * well;
    float pinch = 1.0 + uS * uS * 0.95 * well;
    float c = cos(swirl), s = sin(swirl);
    vec2 q = mat2(c, -s, s, c) * p * pinch;
    q.x /= uImgAspect;
    vec2 suv = uHole + q;

    vec3 col = texture2D(map, suv).rgb;

    if (uS > 0.0) {
      // slight chromatic fringing and a brighter, hotter disc while it feeds
      float ca = 0.010 * uS * well;
      col.r = texture2D(map, suv + vec2(ca, 0.0)).r;
      col.b = texture2D(map, suv - vec2(ca, 0.0)).b;
      col += vec3(1.0, 0.55, 0.2) * 0.30 * uS * exp(-pow(r / 0.42, 2.0));
      float hr = 0.105 * (1.0 + 0.6 * uS);
      col *= 1.0 - smoothstep(hr, hr * 0.5, r) * uS * 0.9;
    }

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export class JourneyGL {
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.opts = opts;
    this.lost = false;
    this.moonReady = false;
    this.bhReady = false;
    this.cleared = false;
    this.vw = 1;
    this.vh = 1;

    const r = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    r.setClearColor(0x000000, 0);
    r.autoClear = false;
    r.toneMapping = ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    this.renderer = r;

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.lost = true; });

    this.buildMoonScene();
    this.buildFxScene(opts.lite);
  }

  /* ------------------------------ scene setup ------------------------------ */
  buildMoonScene() {
    this.moonScene = new Scene();
    this.moonCam = new PerspectiveCamera(FOV, 1, 0.05, 60);

    this.sun = new DirectionalLight(0xfff1dc, 3.4);
    this.sun.position.set(3, 2, 2.5);
    this.moonScene.add(this.sun);
    this.moonScene.add(new AmbientLight(0x6f86b8, 0.05));

    this.moonMat = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.97, metalness: 0 });
    this.moon = new Mesh(new SphereGeometry(1, this.opts.lite ? 96 : 192, this.opts.lite ? 48 : 96), this.moonMat);
    this.moon.visible = false;
    this.moonScene.add(this.moon);
  }

  buildFxScene(lite) {
    this.fxScene = new Scene();
    this.fxCam = new OrthographicCamera(0, 1, 0, 1, -10, 10); // pixels, y down

    // --- hyperspace / suction stars ---
    const count = lite ? 700 : 1500;
    const base = new PlaneGeometry(1, 1);
    const geo = new InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    const seed = new Float32Array(count * 4);
    const rand = new Float32Array(count * 2);
    const rnd = mulberry32(42);
    for (let i = 0; i < count; i++) {
      seed[i * 4] = rnd();
      seed[i * 4 + 1] = rnd();
      seed[i * 4 + 2] = 0.2 + rnd() * 0.8;
      seed[i * 4 + 3] = rnd();
      rand[i * 2] = rnd();
      rand[i * 2 + 1] = rnd() * Math.PI * 2;
    }
    geo.setAttribute('aSeed', new InstancedBufferAttribute(seed, 4));
    geo.setAttribute('aRand', new InstancedBufferAttribute(rand, 2));
    geo.instanceCount = count;

    this.starMat = new ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uRes: { value: [1, 1] },
        uShift: { value: 0 },
        uVel: { value: 0 },
        uWarp: { value: 0 },
        uS: { value: 0 },
        uHole: { value: [0, 0] }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide
    });
    this.stars = new Mesh(geo, this.starMat);
    this.stars.frustumCulled = false;
    this.stars.renderOrder = 2;
    this.stars.visible = false;
    this.fxScene.add(this.stars);

    // --- black hole artwork plane ---
    this.bhMat = new ShaderMaterial({
      vertexShader: BH_VERT,
      fragmentShader: BH_FRAG,
      uniforms: {
        map: { value: null },
        uUvScale: { value: [1, 1] },
        uUvOffset: { value: [0, 0] },
        uHole: { value: [this.opts.hole.x / this.opts.imgW, 1 - this.opts.hole.y / this.opts.imgH] },
        uImgAspect: { value: this.opts.imgW / this.opts.imgH },
        uS: { value: 0 }
      },
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      toneMapped: false
    });
    this.bh = new Mesh(new PlaneGeometry(1, 1), this.bhMat);
    this.bh.renderOrder = 1;
    this.bh.visible = false;
    this.fxScene.add(this.bh);
  }

  /* ------------------------------- resources ------------------------------ */
  // Heavy CPU work, called once when the browser is idle
  buildMoon() {
    const lite = this.opts.lite;
    const { albedo, height } = buildMoonMaps(lite ? 2048 : 4096, lite ? 1024 : 2048);
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    const map = new CanvasTexture(albedo);
    map.colorSpace = SRGBColorSpace;
    map.wrapS = RepeatWrapping;
    map.anisotropy = Math.min(8, maxAniso);

    const bump = new CanvasTexture(height);
    bump.colorSpace = NoColorSpace;
    bump.wrapS = RepeatWrapping;
    bump.anisotropy = Math.min(8, maxAniso);

    this.moonMat.map = map;
    this.moonMat.bumpMap = bump;
    this.moonMat.bumpScale = 2.4;
    this.moonMat.needsUpdate = true;
    this.moonReady = true;
  }

  // The artwork is sampled 1:1 with plain bilinear filtering (no mipmaps) so it
  // is as sharp as the <img> it replaces.
  loadBlackHole(url) {
    if (this.bhLoading) return;
    this.bhLoading = true;
    new TextureLoader().load(url, (tex) => {
      tex.colorSpace = SRGBColorSpace;
      tex.minFilter = LinearFilter;
      tex.magFilter = LinearFilter;
      tex.generateMipmaps = false;
      tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
      this.bhMat.uniforms.map.value = tex;
      this.bhReady = true;
    });
  }

  setSize(vw, vh) {
    this.vw = vw;
    this.vh = vh;
    const dpr = Math.min(window.devicePixelRatio || 1, this.opts.lite ? 1.5 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(vw, vh, false);

    this.moonCam.aspect = vw / vh;
    this.moonCam.updateProjectionMatrix();

    this.fxCam.left = 0; this.fxCam.right = vw;
    this.fxCam.top = 0; this.fxCam.bottom = vh;
    this.fxCam.updateProjectionMatrix();

    this.starMat.uniforms.uRes.value = [vw, vh];

    // object-fit: cover mapping for the black hole plane
    const { imgW, imgH } = this.opts;
    const scale = Math.max(vw / imgW, vh / imgH);
    const dispW = imgW * scale, dispH = imgH * scale;
    this.bhMat.uniforms.uUvScale.value = [vw / dispW, vh / dispH];
    this.bhMat.uniforms.uUvOffset.value = [(1 - vw / dispW) / 2, (1 - vh / dispH) / 2];
    this.bh.scale.set(vw, vh, 1);
  }

  /* --------------------------------- frame -------------------------------- */
  // st: { moon:{visible,dx,dy,d,phi,rot}, stars:{on,shift,vel,warp,s,hole}, bh:{visible,x,s} }
  render(st) {
    const r = this.renderer;
    const { vw, vh } = this;
    const moonOn = st.moon.visible && this.moonReady;
    const bhOn = st.bh.visible && this.bhReady;
    const starsOn = st.stars.on;

    if (!moonOn && !bhOn && !starsOn) {
      if (!this.cleared) { r.clear(); this.cleared = true; }
      return;
    }
    this.cleared = false;
    r.clear();

    if (moonOn) {
      const cam = this.moonCam;
      cam.position.set(0, 0, st.moon.d);
      cam.lookAt(0, 0, 0);
      // shift the projected image by (dx, dy) pixels without changing perspective
      cam.setViewOffset(vw, vh, -st.moon.dx, -st.moon.dy, vw, vh);

      const phi = st.moon.phi;
      this.sun.position.set(Math.sin(phi) * 5, Math.sin(phi) * 2.8, Math.cos(phi) * 5);
      this.moon.rotation.set(0.1, st.moon.rot, 0);
      this.moon.visible = true;
      r.render(this.moonScene, cam);
    }

    this.bh.visible = bhOn;
    if (bhOn) {
      this.bh.position.set(st.bh.x + vw / 2, vh / 2, 0);
      this.bhMat.uniforms.uS.value = st.bh.s;
    }

    this.stars.visible = starsOn;
    if (starsOn) {
      const u = this.starMat.uniforms;
      u.uShift.value = st.stars.shift;
      u.uVel.value = st.stars.vel;
      u.uWarp.value = st.stars.warp;
      u.uS.value = st.stars.s;
      u.uHole.value = [st.stars.hole.x, st.stars.hole.y];
    }

    r.render(this.fxScene, this.fxCam);
  }
}
