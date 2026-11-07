/* ==========================================================================
   Procedural lunar surface maps (equirectangular), built once on the CPU.

   albedo : colour map (maria, regolith, ejecta, grain) - contains NO lighting
   height : grey-scale relief (crater bowls, rims, maria) used as a bump map

   Lighting is left entirely to WebGL so the terminator, crater shadows and
   moon phases are real and change as the light moves around the sphere.
   ========================================================================== */

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildMoonMaps(W, H) {
  const albedo = document.createElement('canvas');
  albedo.width = W; albedo.height = H;
  const height = document.createElement('canvas');
  const HW = W >> 1, HH = H >> 1;
  height.width = HW; height.height = HH;

  const A = albedo.getContext('2d');
  const B = height.getContext('2d');
  const rnd = mulberry32(1969);
  const PI = Math.PI;

  A.fillStyle = '#8b8883';
  A.fillRect(0, 0, W, H);
  B.fillStyle = 'rgb(128,128,128)';
  B.fillRect(0, 0, HW, HH);

  // Soft elliptical radial blob. rx/ry are in pixels of the target canvas.
  const blob = (g, x, y, rx, ry, stops) => {
    g.save();
    g.translate(x, y);
    g.scale(rx, ry);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr;
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  };

  // Draw `fn` at x and at its wrapped copies so nothing is cut at the seam.
  const wrapped = (x, halfW, fn) => {
    fn(x);
    if (x - halfW < 0) fn(x + W);
    if (x + halfW > W) fn(x - W);
  };

  const pickLonLat = () => [rnd() * PI * 2, Math.asin(rnd() * 2 - 1)];
  const xy = (lon, lat) => [(lon / (PI * 2)) * W, (0.5 - lat / PI) * H];
  const stretch = (lat) => Math.min(6, 1 / Math.max(0.15, Math.cos(lat)));

  /* ---- broad albedo variation ---- */
  for (let i = 0; i < 720; i++) {
    const [lon, lat] = pickLonLat();
    const [x, y] = xy(lon, lat);
    const ang = 0.03 + rnd() * 0.22;
    const ry = ang * (H / PI);
    const rx = ry * stretch(lat);
    const dark = rnd() < 0.5;
    const rgb = dark ? '48,46,45' : '205,200,192';
    const a = 0.05 + rnd() * 0.1;
    wrapped(x, rx, (cx) => blob(A, cx, y, rx, ry, [[0, `rgba(${rgb},${a})`], [1, `rgba(${rgb},0)`]]));
  }

  /* ---- maria: large dark basalt plains, clustered on one hemisphere ---- */
  const maria = [
    [1.0, 0.45, 0.30], [1.55, 0.30, 0.22], [0.55, 0.15, 0.24], [1.25, -0.05, 0.20],
    [2.05, 0.18, 0.12], [0.85, -0.38, 0.17], [0.30, 0.52, 0.13], [1.7, -0.3, 0.12]
  ];
  maria.forEach(([lon, lat, ang]) => {
    for (let k = 0; k < 7; k++) {
      const [x, y] = xy(lon + (rnd() - 0.5) * ang * 1.6, lat + (rnd() - 0.5) * ang * 1.1);
      const ry = ang * (H / PI) * (0.5 + rnd() * 0.55);
      const rx = ry * stretch(lat);
      wrapped(x, rx, (cx) => {
        blob(A, cx, y, rx, ry, [[0, `rgba(50,55,66,${0.32 + rnd() * 0.2})`], [0.7, 'rgba(50,55,66,0.18)'], [1, 'rgba(50,55,66,0)']]);
        blob(B, cx * 0.5, y * 0.5, rx * 0.5, ry * 0.5, [[0, 'rgba(100,100,100,0.5)'], [1, 'rgba(100,100,100,0)']]);
      });
    }
  });

  /* ---- craters ---- */
  const craters = Math.round(3800 * (W * H) / (4096 * 2048));
  for (let i = 0; i < craters; i++) {
    const [lon, lat] = pickLonLat();
    const [x, y] = xy(lon, lat);
    const ang = 0.0024 + Math.pow(rnd(), 5.5) * 0.11;
    const ry = ang * (H / PI);
    const sx = stretch(lat);
    const rx = ry * sx;
    const fresh = rnd() < 0.18;

    wrapped(x, rx * 2, (cx) => {
      // albedo: darker floor, bright ejecta blanket for young craters
      if (ry > 4) {
        const halo = fresh ? 0.16 : 0.07;
        blob(A, cx, y, rx * 2, ry * 2, [[0.4, `rgba(226,222,212,${halo})`], [1, 'rgba(226,222,212,0)']]);
      }
      blob(A, cx, y, rx * 0.92, ry * 0.92, [[0, `rgba(54,52,50,${0.16 + rnd() * 0.12})`], [0.85, 'rgba(54,52,50,0.08)'], [1, 'rgba(54,52,50,0)']]);

      // height: bowl (low) -> raised rim -> fall-off
      const k = 0.5;
      blob(B, cx * k, y * k, rx * 1.35 * k, ry * 1.35 * k, [
        [0.0, 'rgba(78,78,78,0.92)'],
        [0.45, 'rgba(98,98,98,0.75)'],
        [0.66, 'rgba(150,150,150,0.55)'],
        [0.74, 'rgba(222,222,222,0.9)'],
        [0.80, 'rgba(172,172,172,0.55)'],
        [1.0, 'rgba(128,128,128,0)']
      ]);
    });
  }

  /* ---- a few bright ray systems ---- */
  for (let i = 0; i < 4; i++) {
    const [lon, lat] = pickLonLat();
    const [x, y] = xy(lon, lat);
    const ry = (0.03 + rnd() * 0.015) * (H / PI);
    const rx = ry * stretch(lat);
    wrapped(x, rx * 6, (cx) => {
      for (let k = 0; k < 30; k++) {
        const a = rnd() * PI * 2;
        const len = 2 + rnd() * 5;
        A.strokeStyle = `rgba(236,232,222,${0.05 + rnd() * 0.07})`;
        A.lineWidth = 1 + rnd() * 3;
        A.beginPath();
        A.moveTo(cx + Math.cos(a) * rx, y + Math.sin(a) * ry);
        A.lineTo(cx + Math.cos(a) * rx * len, y + Math.sin(a) * ry * len);
        A.stroke();
      }
    });
  }

  /* ---- regolith grain (albedo) and micro relief (height) ---- */
  for (let i = 0; i < Math.round(70000 * (W * H) / (4096 * 2048)); i++) {
    const x = rnd() * W, y = rnd() * H;
    const light = rnd() < 0.5;
    A.fillStyle = light ? `rgba(228,223,213,${0.04 + rnd() * 0.09})` : `rgba(30,28,28,${0.05 + rnd() * 0.1})`;
    A.beginPath();
    A.arc(x, y, 0.5 + rnd() * 1.2, 0, PI * 2);
    A.fill();
  }
  for (let i = 0; i < Math.round(60000 * (W * H) / (4096 * 2048)); i++) {
    const x = rnd() * HW, y = rnd() * HH;
    const v = 128 + (rnd() - 0.5) * 70;
    B.fillStyle = `rgba(${v},${v},${v},0.22)`;
    B.beginPath();
    B.arc(x, y, 0.5 + rnd() * 1.1, 0, PI * 2);
    B.fill();
  }

  return { albedo, height };
}
