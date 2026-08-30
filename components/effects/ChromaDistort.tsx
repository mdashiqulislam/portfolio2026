"use client";

import { useEffect } from "react";
import * as THREE from "three";

/**
 * Cursor-driven distortion + spectral chromatic aberration for the Selected
 * Work mockups — a port of the hover effect on vividmotion.co's work list
 * (read from the site's own inline three.js code, shaders verbatim).
 *
 * How the original works, and what this reproduces exactly:
 *
 * - Each image gets a 64 × 64 float "flow field" (a DataTexture). Moving the
 *   cursor splats its velocity into the cells around it; every frame the whole
 *   field decays toward zero (× 0.87). The fragment shader warps the image by
 *   the blurred field, so pixels smear in the direction the cursor moved and
 *   then relax back.
 * - Where the field is strong, the shader also walks 32 samples along the
 *   mouse→pixel direction and weighs them into R/G/B with three gaussians —
 *   the rainbow-edged streak that gives the effect its look.
 * - Nothing is drawn per-card: one fixed, pointer-transparent canvas covers
 *   the viewport and each card is rendered into its own scissor rect, read
 *   from the DOM every frame — which is what keeps the planes glued to the
 *   cards while the Work track translates under the cursor.
 *
 * Where this port deliberately differs:
 *
 * - The original hides every `<img>` permanently and lets WebGL show the
 *   resting image too. Here the real `<img>` stays visible whenever the field
 *   has settled, and the canvas only takes over (and the img hides) while the
 *   effect is live — the DOM keeps scrolling natively, and a WebGL failure at
 *   any point simply leaves the ordinary images.
 * - The scroll-in reveal (`uZoom` 1.5 → 1) is not wired up; `uZoom` stays 1.
 *
 * Gated like the Work pin itself: `lg` and up, `prefers-reduced-motion:
 * no-preference`, and only if a WebGL context can actually be created.
 */

/** Tuning — the reference site's own values. */
const GRID = 64;
const STRENGTH = 0.15;
const MOUSE_RADIUS = 0.15;
const RELAXATION = 0.87;
const ABERRATION = 0.15;
/** Frames the field keeps relaxing after the pointer stops before handing
    back to the DOM image (the reference's cooldown). */
const COOLDOWN = 60;
const MAX_DPR = 1.5;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The reference fragment shader, reformatted. `bStep` is 1.5 / GRID.
const FRAG = /* glsl */ `
  uniform sampler2D uDataTexture;
  uniform sampler2D uTexture;
  uniform vec2      uMouse;
  uniform float     uAberration;
  uniform float     uImageAspect;
  uniform float     uContainerAspect;
  uniform vec2      uResolution;
  uniform float     uOpacity;
  uniform float     uZoom;
  varying vec2      vUv;

  vec2 coverUV(vec2 uv) {
    vec2 scale = uContainerAspect > uImageAspect
      ? vec2(1.0, uImageAspect / uContainerAspect)
      : vec2(uContainerAspect / uImageAspect, 1.0);
    return 0.5 + (uv - 0.5) * scale;
  }
  float hash21(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }
  void main() {
    float bStep = 1.5 / ${GRID.toFixed(1)};
    vec2 rawWarp =
      texture2D(uDataTexture, vUv                   ).rg * 0.50  +
      texture2D(uDataTexture, vUv + vec2( bStep, 0.)).rg * 0.125 +
      texture2D(uDataTexture, vUv + vec2(-bStep, 0.)).rg * 0.125 +
      texture2D(uDataTexture, vUv + vec2(0.,  bStep)).rg * 0.125 +
      texture2D(uDataTexture, vUv + vec2(0., -bStep)).rg * 0.125;
    vec2  warp  = 0.02 * rawWarp;
    float warpL = clamp(length(warp) * 8.0, 0.0, 1.0);
    vec2 toMouse = vUv - uMouse;
    vec2 aberDir = length(toMouse) > 0.001 ? normalize(toMouse) : vec2(1.0, 0.0);
    vec2 uv = coverUV(vUv);
    uv = 0.5 + (uv - 0.5) / uZoom;
    float jitter = hash21(vUv) / 32.0;
    vec3 col = vec3(0.0), weights = vec3(0.0);
    for (int i = 0; i < 32; i++) {
      float t  = clamp(float(i) / 31.0 + jitter, 0.0, 1.0);
      vec2 sUV = uv - warp + aberDir * uAberration * warpL * (t - 0.5);
      vec3 sc  = texture2D(uTexture, sUV).rgb;
      float rW = exp(-pow((t - 0.0) * 2.5, 2.0));
      float gW = exp(-pow((t - 0.5) * 2.5, 2.0));
      float bW = exp(-pow((t - 1.0) * 2.5, 2.0));
      col     += sc * vec3(rW, gW, bW);
      weights += vec3(rW, gW, bW);
    }
    col /= weights;
    gl_FragColor = vec4(col, texture2D(uTexture, uv - warp).a * uOpacity);
  }
`;

type Unit = {
  /** The card's image box — position source and pointer target. */
  wrapper: HTMLElement;
  img: HTMLImageElement;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  dataTex: THREE.DataTexture;
  uniforms: {
    uTexture: { value: THREE.Texture | null };
    uDataTexture: { value: THREE.DataTexture };
    uMouse: { value: THREE.Vector2 };
    uAberration: { value: number };
    uImageAspect: { value: number };
    uContainerAspect: { value: number };
    uResolution: { value: THREE.Vector2 };
    uOpacity: { value: number };
    uZoom: { value: number };
  };
  mouse: {
    x: number;
    y: number;
    vX: number;
    vY: number;
    moved: boolean;
  };
  ready: boolean;
  inViewport: boolean;
  /** Field is live: canvas shown over this card, img hidden. */
  active: boolean;
  cooldown: number;
  lastAspect: number;
  dispose: () => void;
};

/**
 * Mounts nothing visible itself. Finds every `[data-chroma-distort]` element
 * (a card's image wrapper) inside `scope` and runs the effect on the `<img>`
 * each one contains.
 */
export default function ChromaDistort({ scope }: { scope: string }) {
  useEffect(() => {
    const gate = window.matchMedia(
      "(min-width: 64rem) and (prefers-reduced-motion: no-preference)",
    );
    if (!gate.matches) return;

    const scopeEl = document.querySelector(scope);
    if (!scopeEl) return;
    const wrappers = [
      ...scopeEl.querySelectorAll<HTMLElement>("[data-chroma-distort]"),
    ];
    if (!wrappers.length) return;

    let renderer: THREE.WebGLRenderer;
    try {
      // preserveDrawingBuffer matches the reference's distortion renderer and
      // keeps the last frame readable (screenshots, readPixels verification).
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      return; // No WebGL — the plain images are already the fallback.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    renderer.domElement.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:30;";
    document.body.appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const floatLinear = renderer.extensions.has("OES_texture_float_linear");
    const units: Unit[] = [];
    let disposed = false;

    const makeUnit = (wrapper: HTMLElement, img: HTMLImageElement) => {
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1000, 1000);
      camera.position.z = 2;

      const data = new Float32Array(4 * GRID * GRID);
      const dataTex = new THREE.DataTexture(
        data,
        GRID,
        GRID,
        THREE.RGBAFormat,
        THREE.FloatType,
      );
      // RGBA32F is only LINEAR-filterable behind this extension; without it
      // the field samples NEAREST — the reference's own fallback — and the
      // shader's 5-tap blur still smooths the result.
      dataTex.minFilter = dataTex.magFilter = floatLinear
        ? THREE.LinearFilter
        : THREE.NearestFilter;
      dataTex.needsUpdate = true;

      const uniforms: Unit["uniforms"] = {
        uTexture: { value: null },
        uDataTexture: { value: dataTex },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uAberration: { value: ABERRATION },
        uImageAspect: { value: 1 },
        uContainerAspect: { value: 1 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uOpacity: { value: 1 },
        uZoom: { value: 1 },
      };

      // The warp is entirely per-fragment, so the plane needs no segments.
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
        }),
      );
      scene.add(plane);

      const unit: Unit = {
        wrapper,
        img,
        scene,
        camera,
        plane,
        dataTex,
        uniforms,
        mouse: { x: 0.5, y: 0.5, vX: 0, vY: 0, moved: false },
        ready: false,
        // True until the IntersectionObserver's first (async) report — a
        // pointermove can arrive before it, and must not insta-settle.
        inViewport: true,
        active: false,
        cooldown: 0,
        lastAspect: 0,
        dispose: () => {
          io.disconnect();
          wrapper.removeEventListener("pointermove", onMove);
          wrapper.removeEventListener("pointerleave", onLeave);
          plane.geometry.dispose();
          plane.material.dispose();
          dataTex.dispose();
          uniforms.uTexture.value?.dispose();
        },
      };

      // Loaded through TextureLoader on the img's resolved URL, exactly as
      // the reference does (the browser cache makes it a free second request).
      // Color spaces are left untouched so the sampled values pass through
      // the shader exactly as the reference's do.
      const adopt = () => {
        if (disposed || !img.naturalWidth || unit.ready) return;
        new THREE.TextureLoader().load(img.currentSrc || img.src, (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.minFilter = tex.magFilter = THREE.LinearFilter;
          tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
          uniforms.uTexture.value = tex;
          uniforms.uImageAspect.value = tex.image.width / tex.image.height;
          unit.ready = true;
        });
      };
      if (img.complete && img.naturalWidth) adopt();
      else img.addEventListener("load", adopt, { once: true });

      const onMove = (e: PointerEvent) => {
        const r = wrapper.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const x = (e.clientX - r.left) / r.width;
        const y = 1 - (e.clientY - r.top) / r.height;
        // Same half-life smoothing as the reference.
        unit.mouse.vX += 0.5 * (x - unit.mouse.x - unit.mouse.vX);
        unit.mouse.vY += 0.5 * (y - unit.mouse.y - unit.mouse.vY);
        unit.mouse.x = x;
        unit.mouse.y = y;
        unit.mouse.moved = true;
        unit.cooldown = COOLDOWN;
        if (!unit.active && unit.ready) {
          unit.active = true;
          needsFrame = true;
        }
      };
      const onLeave = () => {
        unit.mouse.vX = 0;
        unit.mouse.vY = 0;
      };
      wrapper.addEventListener("pointermove", onMove);
      wrapper.addEventListener("pointerleave", onLeave);

      const io = new IntersectionObserver(
        ([entry]) => {
          unit.inViewport = entry.isIntersecting;
        },
        { rootMargin: "100px" },
      );
      io.observe(wrapper);

      units.push(unit);
    };

    for (const wrapper of wrappers) {
      const img = wrapper.querySelector("img");
      if (img) makeUnit(wrapper, img);
    }
    if (!units.length) {
      renderer.dispose();
      renderer.domElement.remove();
      return;
    }

    /** Splat the pointer's velocity into the field, decay the rest. */
    const stepField = (unit: Unit) => {
      const data = unit.dataTex.image.data as Float32Array;
      const m = unit.mouse;
      for (let i = 0; i < GRID * GRID; i++) {
        data[4 * i] *= RELAXATION;
        data[4 * i + 1] *= RELAXATION;
      }
      const gx = GRID * m.x;
      const gy = GRID * m.y;
      const radius = GRID * MOUSE_RADIUS;
      for (let x = 0; x < GRID; x++) {
        for (let y = 0; y < GRID; y++) {
          const d2 = (gx - x) * (gx - x) + (gy - y) * (gy - y);
          if (d2 < radius * radius) {
            const i = 4 * (x + GRID * y);
            const power = Math.min(radius / Math.sqrt(d2 + 1e-4), 10);
            data[i] += 100 * STRENGTH * m.vX * power;
            data[i + 1] -= 100 * STRENGTH * m.vY * power;
          }
        }
      }
      if (!m.moved) {
        m.vX *= 0.85;
        m.vY *= 0.85;
      }
      m.moved = false;
      unit.dataTex.needsUpdate = true;
      unit.uniforms.uMouse.value.set(m.x, m.y);
    };

    /** Hand the card back to the DOM image and let the canvas go blank. */
    const settle = (unit: Unit) => {
      unit.active = false;
      unit.img.style.visibility = "";
      (unit.dataTex.image.data as Float32Array).fill(0);
      unit.dataTex.needsUpdate = true;
    };

    let raf = 0;
    let needsFrame = false;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      let anyActive = false;
      for (const unit of units) if (unit.active) anyActive = true;
      if (!anyActive && !needsFrame) return;
      needsFrame = false;

      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, w, h);
      renderer.clear();
      renderer.setScissorTest(true);

      for (const unit of units) {
        if (!unit.active) continue;
        if (!unit.inViewport) {
          settle(unit);
          continue;
        }
        stepField(unit);
        if (--unit.cooldown <= 0) {
          settle(unit);
          continue;
        }

        const rect = unit.wrapper.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= h) {
          settle(unit);
          continue;
        }
        const aspect = rect.width / rect.height;
        if (aspect !== unit.lastAspect) {
          unit.plane.scale.set(aspect, 1, 1);
          unit.camera.left = -aspect / 2;
          unit.camera.right = aspect / 2;
          unit.camera.updateProjectionMatrix();
          unit.lastAspect = aspect;
        }
        unit.uniforms.uContainerAspect.value = aspect;
        unit.uniforms.uResolution.value.set(rect.width, rect.height);

        const bottom = h - rect.bottom;
        renderer.setViewport(rect.left, bottom, rect.width, rect.height);
        renderer.setScissor(rect.left, bottom, rect.width, rect.height);
        renderer.render(unit.scene, unit.camera);
        // Painted this frame, so the img can drop out with no gap. Both
        // changes land before the browser's next paint.
        unit.img.style.visibility = "hidden";
      }
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
      needsFrame = true;
    };
    window.addEventListener("resize", onResize);

    // Dropping below `lg` (or turning reduced motion on) tears the whole
    // thing down; re-entering desktop re-runs the effect via the listener.
    const onGate = () => {
      if (!gate.matches) cleanup();
    };
    gate.addEventListener("change", onGate);

    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      gate.removeEventListener("change", onGate);
      for (const unit of units) {
        unit.img.style.visibility = "";
        unit.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
    return cleanup;
  }, [scope]);

  return null;
}
