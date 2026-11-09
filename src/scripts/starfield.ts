/*! three.js, Copyright 2010-2026 three.js authors, MIT licence (https://github.com/mrdoob/three.js/blob/dev/LICENSE) */
/**
 * Three.js star layer for the cosmos background (see src/components/Starfield.astro).
 *
 * This module is only ever loaded through a dynamic import() after first paint, and only
 * when the caller already holds a working WebGL2 context. Everything is imported by name
 * from 'three' so the bundler can tree-shake the rest of the library.
 *
 * Design notes
 * - Stars are points in a cone in front of the camera. Each star keeps a normalised disc
 *   coordinate and a depth, so the layout can be rebuilt for any aspect ratio on resize.
 * - The whole field rolls very slowly about the view axis; the camera follows the pointer
 *   by a few world units (damped) for a faint parallax.
 * - Rendering is capped at about 30 fps, pauses when the tab is hidden, and draws a single
 *   static frame under prefers-reduced-motion.
 * - Optional constellation lines: a handful of faint segments between near stars close to
 *   the pointer. Fine pointers only, never under reduced motion.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

export interface MountOptions {
  /** The .cosmos element: sized by CSS, receives the has-gl class once the first frame is drawn. */
  host: HTMLElement;
  /** Already attached to the DOM, styled by CSS. */
  canvas: HTMLCanvasElement;
  /** A WebGL2 context obtained from `canvas` by the caller. */
  gl: WebGL2RenderingContext;
}

export interface StarsHandle {
  dispose(): void;
}

const COUNT_DESKTOP = 1500;
const COUNT_MOBILE = 650;
const HUBS = 160; // near stars that may be joined by constellation lines
const MAX_SEGMENTS = 20;
const FOV = 60;
const TAN_HALF = Math.tan((FOV * Math.PI) / 360);
const D_MIN = 300;
const D_MAX = 1200;
const EDGE_MARGIN = 1.1; // disc radius relative to the half-diagonal of the view
const POINT_SCALE = 850; // css px at unit size and unit depth ratio
const MAX_DPR = 1.75;
const FRAME_MS = 1000 / 30;
const SPIN = 0.004; // rad/s
const PARALLAX = 5; // camera travel in world units
const TWINKLE = 0.28; // fraction of brightness that breathes
const STATIC_TIME = 3.1;
const LINE_REACH = 170; // css px from the pointer
const LINE_LINK = 150; // css px between two linked stars
const LINE_ALPHA = 0.26;
const TAU = Math.PI * 2;

const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [0.93, 0.95, 1.0], // white, faintly cool
  [0.62, 0.78, 1.0], // pale blue
  [0.78, 0.7, 1.0], // lavender
];

const STAR_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPx;
  uniform float uScale;
  uniform float uAmp;
  attribute vec3 aColor;
  attribute vec3 aParams; // x size, y phase, z speed
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float raw = aParams.x * uScale / -mv.z;
    float twinkle = 1.0 - uAmp * (0.5 + 0.5 * sin(uTime * aParams.z + aParams.y));
    vAlpha = twinkle * clamp(raw / 2.4, 0.55, 1.0);
    vColor = aColor;
    gl_PointSize = max(raw, 2.4) * uPx;
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = min(1.0, smoothstep(1.0, 0.0, d) * 1.35);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const LINE_VERT = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(0.74, 0.68, 1.0, vAlpha);
  }
`;

/** Small deterministic PRNG so every page shows the same sky. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mountStars({ host, canvas, gl }: MountOptions): StarsHandle {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrowQuery = window.matchMedia('(max-width: 767.98px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const renderer = new WebGLRenderer({
    canvas,
    context: gl,
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 10, 2000);

  // ---- Star data -------------------------------------------------------------------------
  const disc = new Float32Array(COUNT_DESKTOP * 3); // u, v in the unit disc, then depth
  const positions = new Float32Array(COUNT_DESKTOP * 3);
  const colors = new Float32Array(COUNT_DESKTOP * 3);
  const params = new Float32Array(COUNT_DESKTOP * 3); // size, phase, speed
  const rnd = mulberry32(0x5eed1e5);
  for (let i = 0; i < COUNT_DESKTOP; i++) {
    const o = i * 3;
    const radius = Math.sqrt(rnd());
    const angle = rnd() * TAU;
    disc[o] = radius * Math.cos(angle);
    disc[o + 1] = radius * Math.sin(angle);
    disc[o + 2] = i < HUBS ? D_MIN + rnd() * 400 : D_MIN + (D_MAX - D_MIN) * Math.pow(rnd(), 0.75);

    const pick = rnd();
    const tone = PALETTE[pick < 0.5 ? 0 : pick < 0.78 ? 1 : 2] ?? PALETTE[0]!;
    const level = 0.5 + 0.5 * Math.pow(rnd(), 1.4);
    colors[o] = Math.min(1, tone[0] * level + (rnd() - 0.5) * 0.06);
    colors[o + 1] = Math.min(1, tone[1] * level + (rnd() - 0.5) * 0.06);
    colors[o + 2] = Math.min(1, tone[2] * level);

    params[o] = 0.9 + 2.1 * Math.pow(rnd(), 5);
    params[o + 1] = rnd() * TAU;
    params[o + 2] = 0.25 + rnd() * 0.65;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
  geometry.setAttribute('aParams', new BufferAttribute(params, 3));

  const starUniforms = {
    uTime: { value: STATIC_TIME },
    uPx: { value: 1 },
    uScale: { value: POINT_SCALE },
    uAmp: { value: TWINKLE },
  };
  const material = new ShaderMaterial({
    uniforms: starUniforms,
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // ---- Constellation lines (fine pointers only) --------------------------------------------
  const linePos = new Float32Array(MAX_SEGMENTS * 2 * 3);
  const lineAlpha = new Float32Array(MAX_SEGMENTS * 2);
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute('position', new BufferAttribute(linePos, 3));
  lineGeometry.setAttribute('aAlpha', new BufferAttribute(lineAlpha, 1));
  lineGeometry.setDrawRange(0, 0);
  const lineMaterial = new ShaderMaterial({
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const lines = new LineSegments(lineGeometry, lineMaterial);
  lines.frustumCulled = false;
  lines.visible = false;
  scene.add(lines);

  // ---- State -------------------------------------------------------------------------------
  let width = 1;
  let height = 1;
  let reduced = motionQuery.matches;
  let running = false;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let time = 0;
  let resizeTimer = 0;
  let camX = 0;
  let camY = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let lastMove = -1e9;
  let presence = 0;

  /** Rebuild star positions for the current aspect ratio. */
  function place(): void {
    const reach = TAN_HALF * Math.hypot(width / height, 1) * EDGE_MARGIN;
    for (let i = 0; i < COUNT_DESKTOP; i++) {
      const o = i * 3;
      const depth = disc[o + 2] ?? D_MIN;
      const r = depth * reach;
      positions[o] = (disc[o] ?? 0) * r;
      positions[o + 1] = (disc[o + 1] ?? 0) * r;
      positions[o + 2] = -depth;
    }
    geometry.attributes.position!.needsUpdate = true;
  }

  function layout(): void {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const changed = w !== width || h !== height || dpr !== renderer.getPixelRatio();
    width = w;
    height = h;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    starUniforms.uPx.value = dpr;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    geometry.setDrawRange(0, narrowQuery.matches ? COUNT_MOBILE : COUNT_DESKTOP);
    if (changed) place();
    if (!running) drawStill();
  }

  function setLines(count: number): void {
    lineGeometry.setDrawRange(0, count * 2);
    lineGeometry.attributes.position!.needsUpdate = true;
    lineGeometry.attributes.aAlpha!.needsUpdate = true;
    lines.visible = count > 0;
  }

  /** Join the near stars that sit close to the pointer; fades to nothing when it rests. */
  function updateLines(dt: number, now: number): void {
    const wanted = finePointer && !reduced && now - lastMove < 2600 ? 1 : 0;
    presence += (wanted - presence) * (1 - Math.exp(-dt * 3));
    if (presence < 0.01) {
      if (lines.visible) setLines(0);
      return;
    }
    const cos = Math.cos(points.rotation.z);
    const sin = Math.sin(points.rotation.z);
    const sx: number[] = [];
    const sy: number[] = [];
    const wx: number[] = [];
    const wy: number[] = [];
    const wz: number[] = [];
    const near: number[] = [];
    const reachSq = LINE_REACH * LINE_REACH;
    for (let i = 0; i < HUBS; i++) {
      const o = i * 3;
      const x = positions[o] ?? 0;
      const y = positions[o + 1] ?? 0;
      const z = positions[o + 2] ?? -D_MIN;
      const X = x * cos - y * sin;
      const Y = x * sin + y * cos;
      const k = height / 2 / (-z * TAN_HALF);
      const px = width / 2 + (X - camX) * k;
      const py = height / 2 - (Y - camY) * k;
      wx.push(X);
      wy.push(Y);
      wz.push(z);
      sx.push(px);
      sy.push(py);
      const d2 = (px - pointerX) ** 2 + (py - pointerY) ** 2;
      if (d2 < reachSq) near.push(i);
    }
    near.sort(
      (a, b) =>
        (sx[a]! - pointerX) ** 2 + (sy[a]! - pointerY) ** 2 - ((sx[b]! - pointerX) ** 2 + (sy[b]! - pointerY) ** 2),
    );
    if (near.length > 9) near.length = 9;

    const fade = (i: number): number => {
      const t = 1 - Math.hypot(sx[i]! - pointerX, sy[i]! - pointerY) / LINE_REACH;
      return t * t;
    };
    let count = 0;
    for (let a = 0; a < near.length && count < MAX_SEGMENTS; a++) {
      for (let b = a + 1; b < near.length && count < MAX_SEGMENTS; b++) {
        const i = near[a]!;
        const j = near[b]!;
        const gap = Math.hypot(sx[i]! - sx[j]!, sy[i]! - sy[j]!);
        if (gap > LINE_LINK) continue;
        const link = 1 - gap / LINE_LINK;
        const base = LINE_ALPHA * presence * Math.min(1, link * 2.2);
        const v = count * 2;
        linePos.set([wx[i]!, wy[i]!, wz[i]!, wx[j]!, wy[j]!, wz[j]!], v * 3);
        lineAlpha[v] = base * fade(i);
        lineAlpha[v + 1] = base * fade(j);
        count++;
      }
    }
    setLines(count);
  }

  function drawStill(): void {
    starUniforms.uTime.value = STATIC_TIME;
    points.rotation.z = 0;
    camera.position.set(0, 0, 0);
    if (lines.visible) setLines(0);
    renderer.render(scene, camera);
    host.classList.add('has-gl');
  }

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS - 3) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    const ease = 1 - Math.exp(-dt * 2.2);
    camX += (targetX - camX) * ease;
    camY += (targetY - camY) * ease;
    camera.position.set(camX, camY, 0);
    points.rotation.z = time * SPIN;
    starUniforms.uTime.value = time;
    updateLines(dt, now);
    renderer.render(scene, camera);
    host.classList.add('has-gl');
  }

  function start(): void {
    if (running || disposed || reduced || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(raf);
  }

  // ---- Listeners ---------------------------------------------------------------------------
  const onResize = (): void => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 150);
  };
  const onVisibility = (): void => {
    if (document.hidden) stop();
    else if (reduced) drawStill();
    else start();
  };
  const onMotion = (): void => {
    reduced = motionQuery.matches;
    if (reduced) {
      stop();
      camX = camY = targetX = targetY = 0;
      drawStill();
    } else {
      start();
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch' || reduced) return;
    pointerX = e.clientX;
    pointerY = e.clientY;
    targetX = (e.clientX / width - 0.5) * 2 * PARALLAX;
    targetY = -(e.clientY / height - 0.5) * 2 * PARALLAX;
    lastMove = performance.now();
  };
  const onLeave = (): void => {
    targetX = 0;
    targetY = 0;
    lastMove = -1e9;
  };
  const onContextLost = (e: Event): void => {
    e.preventDefault();
    stop();
    host.classList.remove('has-gl');
  };
  const onContextRestored = (): void => {
    if (disposed) return;
    if (reduced) drawStill();
    else start();
  };

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  motionQuery.addEventListener('change', onMotion);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  if (finePointer) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave, { passive: true });
  }

  // ---- Go ----------------------------------------------------------------------------------
  layout();
  if (reduced) drawStill();
  else start();

  return {
    dispose(): void {
      if (disposed) return;
      disposed = true;
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotion);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      host.classList.remove('has-gl');
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
