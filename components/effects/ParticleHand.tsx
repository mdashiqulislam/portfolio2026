"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ParticleHandProps = {
  /** Image whose bright pixels become particles. Must be same-origin. */
  src: string;
  /** Normalized sub-rectangle of the image to sample (0–1). */
  region?: { x0: number; y0: number; x1: number; y1: number };
  /** 0–1 luminance below which pixels are ignored. */
  threshold?: number;
  targetCount?: number;
  className?: string;
};

/**
 * Bounding box of ONLY the giant hand + star-wisp artwork inside
 * hero-bg.png, found by inspecting the image. x0 sits just right of the
 * man's raised arm (~0.487) so no part of the man is ever sampled — the
 * man and the floor stay 100% static.
 */
const DEFAULT_REGION = { x0: 0.492, y0: 0, x1: 0.86, y1: 0.68 };

const GLOW_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uDpr;
  uniform float uIdle;
  uniform vec2 uPointer;
  uniform float uRadius;
  attribute vec2 aHome;
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.9 + aPhase) * uIdle;
    p.y += cos(uTime * 0.7 + aPhase * 1.37) * uIdle;

    // Proximity to the cursor, measured from the particle's HOME position
    // so the reveal region stays stable while particles fly around.
    float prox = 1.0 - smoothstep(uRadius * 0.75, uRadius * 1.5, distance(aHome, uPointer));

    // Idle: faint sparkle layered over the intact artwork. Near cursor: the
    // artwork is occluded, so particles carry the full image brightness.
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.1 + aPhase * 2.0);
    vAlpha = aAlpha * twinkle * mix(0.35, 1.0, prox);
    vColor = aColor;
    gl_PointSize = aSize * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const GLOW_FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.05, d) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

const OCCLUDER_VERT = /* glsl */ `
  uniform float uDpr;
  uniform vec2 uPointer;
  uniform float uRadius;
  attribute float aSize;
  varying float vProx;
  void main() {
    // Occluders live at the particles' home positions and only fade in
    // around the cursor — everywhere else the original artwork shows
    // through untouched, so the idle frame is pixel-identical to the photo.
    vProx = 1.0 - smoothstep(uRadius * 0.75, uRadius * 1.5, distance(position.xy, uPointer));
    gl_PointSize = aSize * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const OCCLUDER_FRAG = /* glsl */ `
  varying float vProx;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = (1.0 - smoothstep(0.3, 0.5, d)) * vProx;
    gl_FragColor = vec4(vec3(0.0), a);
  }
`;

type Sampled = {
  nx: Float32Array;
  ny: Float32Array;
  brightness: Float32Array;
  /** RGB per particle, 0–1, taken from the source pixel. */
  colors: Float32Array;
  imgW: number;
  imgH: number;
  stride: number;
};

function samplePixels(
  img: HTMLImageElement,
  region: { x0: number; y0: number; x1: number; y1: number },
  threshold: number,
  targetCount: number,
): Sampled | null {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);

  const sx = Math.floor(region.x0 * canvas.width);
  const sy = Math.floor(region.y0 * canvas.height);
  const sw = Math.floor((region.x1 - region.x0) * canvas.width);
  const sh = Math.floor((region.y1 - region.y0) * canvas.height);
  if (sw <= 0 || sh <= 0) return null;

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(sx, sy, sw, sh).data;
  } catch {
    return null; // tainted canvas (cross-origin src) — degrade to static image
  }

  const stride = 2;
  let candidates = 0;
  for (let y = 0; y < sh; y += stride) {
    for (let x = 0; x < sw; x += stride) {
      const i = (y * sw + x) * 4;
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      if (lum > threshold) candidates++;
    }
  }
  if (candidates === 0) return null;

  const keepP = Math.min(1, targetCount / candidates);
  const nx: number[] = [];
  const ny: number[] = [];
  const bright: number[] = [];
  const colors: number[] = [];
  for (let y = 0; y < sh; y += stride) {
    for (let x = 0; x < sw; x += stride) {
      const i = (y * sw + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      if (lum > threshold && Math.random() < keepP) {
        nx.push((sx + x) / canvas.width);
        ny.push((sy + y) / canvas.height);
        bright.push(lum);
        // Normalize so hue survives at full glow strength.
        const peak = Math.max(r, g, b, 1);
        colors.push(r / peak, g / peak, b / peak);
      }
    }
  }
  if (nx.length === 0) return null;

  return {
    nx: new Float32Array(nx),
    ny: new Float32Array(ny),
    brightness: new Float32Array(bright),
    colors: new Float32Array(colors),
    imgW: canvas.width,
    imgH: canvas.height,
    stride,
  };
}

/**
 * Turns the hand artwork in the hero background into a hover-reactive
 * particle system while leaving the photo pixel-identical at rest.
 *
 * At idle: the original image is fully visible, with only a faint particle
 * shimmer layered on top. Near the cursor: a soft occluder patch hides the
 * raster artwork and the sampled particles (which sit exactly on their
 * source pixels, in the source pixel's colour) take over — repelled by the
 * cursor, springing back when it leaves. Because occluders exist only at
 * sampled hand pixels, nothing outside the hand (the man, the floor) can
 * ever be affected.
 *
 * Sits inside the same wrapper as the background <Image> and replicates
 * CSS `object-cover` math, so particles land exactly on their source pixels.
 */
export default function ParticleHand({
  src,
  region = DEFAULT_REGION,
  threshold = 0.1,
  targetCount = 7000,
  className = "",
}: ParticleHandProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    } catch {
      return; // no WebGL — the static image underneath stays as the fallback
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 10);
    camera.position.z = 5;

    let disposed = false;
    let raf = 0;
    let sampled: Sampled | null = null;

    // Physics state, all in CSS pixel space.
    let home: Float32Array = new Float32Array(0);
    let vel: Float32Array = new Float32Array(0);
    let glowGeometry: THREE.BufferGeometry | null = null;
    let occluderGeometry: THREE.BufferGeometry | null = null;

    const OFFSCREEN = -1e5;
    const pointer = { x: OFFSCREEN, y: OFFSCREEN };
    let radius = 100;

    const dpr = Math.min(window.devicePixelRatio, 2);

    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uDpr: { value: dpr },
        uIdle: { value: reducedMotion ? 0 : 1.0 },
        uPointer: { value: new THREE.Vector2(OFFSCREEN, OFFSCREEN) },
        uRadius: { value: radius },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const occluderMaterial = new THREE.ShaderMaterial({
      vertexShader: OCCLUDER_VERT,
      fragmentShader: OCCLUDER_FRAG,
      uniforms: {
        uDpr: { value: dpr },
        uPointer: { value: new THREE.Vector2(OFFSCREEN, OFFSCREEN) },
        uRadius: { value: radius },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const clock = new THREE.Clock();

    function renderFrame() {
      renderer.render(scene, camera);
    }

    /** Replicates `object-fit: cover; object-position: center`. */
    function coverTransform(cw: number, ch: number, iw: number, ih: number) {
      const scale = Math.max(cw / iw, ch / ih);
      return {
        scale,
        dx: (cw - iw * scale) / 2,
        dy: (ch - ih * scale) / 2,
      };
    }

    function rebuild() {
      if (!sampled || !container || disposed) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw === 0 || ch === 0) return;

      renderer.setSize(cw, ch);
      camera.right = cw;
      camera.bottom = ch;
      camera.updateProjectionMatrix();
      radius = Math.max(90, cw * 0.06);
      glowMaterial.uniforms.uRadius.value = radius;
      occluderMaterial.uniforms.uRadius.value = radius;

      const { scale, dx, dy } = coverTransform(cw, ch, sampled.imgW, sampled.imgH);
      const n = sampled.nx.length;

      const positions = new Float32Array(n * 3);
      const homes = new Float32Array(n * 2);
      const sizes = new Float32Array(n);
      const alphas = new Float32Array(n);
      const phases = new Float32Array(n);
      const occluderSizes = new Float32Array(n);
      home = new Float32Array(n * 2);
      vel = new Float32Array(n * 2);

      // Occluders must be wide enough to bridge the sampling stride so the
      // underlying raster hand is fully covered between sampled pixels.
      const occluderSize = Math.max(4, sampled.stride * scale * 2.2);

      for (let i = 0; i < n; i++) {
        const x = sampled.nx[i] * sampled.imgW * scale + dx;
        const y = sampled.ny[i] * sampled.imgH * scale + dy;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = 0;
        homes[i * 2] = x;
        homes[i * 2 + 1] = y;
        home[i * 2] = x;
        home[i * 2 + 1] = y;
        const b = sampled.brightness[i];
        sizes[i] = 1.2 + b * 2.4;
        alphas[i] = Math.pow(b, 0.6);
        phases[i] = Math.random() * Math.PI * 2;
        occluderSizes[i] = occluderSize;
      }

      glowGeometry?.dispose();
      occluderGeometry?.dispose();

      occluderGeometry = new THREE.BufferGeometry();
      occluderGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions.slice(), 3),
      );
      occluderGeometry.setAttribute(
        "aSize",
        new THREE.BufferAttribute(occluderSizes, 1),
      );

      glowGeometry = new THREE.BufferGeometry();
      glowGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      glowGeometry.setAttribute("aHome", new THREE.BufferAttribute(homes, 2));
      glowGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      glowGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
      glowGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      glowGeometry.setAttribute(
        "aColor",
        new THREE.BufferAttribute(sampled.colors, 3),
      );

      scene.clear();
      const occluderPoints = new THREE.Points(occluderGeometry, occluderMaterial);
      occluderPoints.renderOrder = 0;
      const glowPoints = new THREE.Points(glowGeometry, glowMaterial);
      glowPoints.renderOrder = 1;
      scene.add(occluderPoints);
      scene.add(glowPoints);

      renderFrame();
    }

    function step() {
      if (!glowGeometry) return;
      const positionAttr = glowGeometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      const arr = positionAttr.array as Float32Array;
      const n = positionAttr.count;
      const r2 = radius * radius;

      for (let i = 0; i < n; i++) {
        let px = arr[i * 3];
        let py = arr[i * 3 + 1];
        let vx = vel[i * 2];
        let vy = vel[i * 2 + 1];

        const dxp = px - pointer.x;
        const dyp = py - pointer.y;
        const d2 = dxp * dxp + dyp * dyp;
        if (d2 < r2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = (1 - d / radius) * 3.2;
          vx += (dxp / d) * f;
          vy += (dyp / d) * f;
        }

        vx += (home[i * 2] - px) * 0.022;
        vy += (home[i * 2 + 1] - py) * 0.022;
        vx *= 0.9;
        vy *= 0.9;
        px += vx;
        py += vy;

        arr[i * 3] = px;
        arr[i * 3 + 1] = py;
        vel[i * 2] = vx;
        vel[i * 2 + 1] = vy;
      }
      positionAttr.needsUpdate = true;
    }

    function loop() {
      glowMaterial.uniforms.uTime.value = clock.getElapsedTime();
      glowMaterial.uniforms.uPointer.value.set(pointer.x, pointer.y);
      occluderMaterial.uniforms.uPointer.value.set(pointer.x, pointer.y);
      step();
      renderFrame();
      raf = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    }

    function onPointerLeave(e: PointerEvent) {
      // `pointerout` bubbles on every element boundary crossing; only a
      // null relatedTarget means the cursor actually left the window.
      if (e.relatedTarget === null) {
        pointer.x = OFFSCREEN;
        pointer.y = OFFSCREEN;
      }
    }

    const resizeObserver = new ResizeObserver(() => rebuild());

    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (disposed || !container) return;
      sampled = samplePixels(img, region, threshold, targetCount);
      if (!sampled) return; // sampling failed — leave the static image visible
      container.appendChild(renderer.domElement);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      resizeObserver.observe(container);
      rebuild();
      if (!reducedMotion) {
        // The container is pointer-events-none by design (it must not block
        // clicks on hero content), so hover is tracked at the window level.
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerout", onPointerLeave, { passive: true });
        loop();
      }
    };
    img.onerror = () => {
      /* keep static fallback */
    };

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerLeave);
      glowGeometry?.dispose();
      occluderGeometry?.dispose();
      glowMaterial.dispose();
      occluderMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src, region, threshold, targetCount]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    />
  );
}
