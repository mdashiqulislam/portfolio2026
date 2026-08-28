"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  ASPECT,
  CONTENT_CENTER_Y,
  RING_VIGNETTE,
  CURVE,
  GAP,
  LABEL_CENTER_Y,
  LABEL_FONT_PX,
  LABEL_H,
  LABEL_TEX_W,
  SLIDES_ACROSS,
  SLIDE_H,
  SLIDE_W,
  VIEW_H,
} from "@/components/short-portfolio/framing";

export type RingSlide = {
  /** Texture path under /public — a 1440px 4:3 webp. */
  src: string;
  /** Caption, bottom-left of the slide. */
  name: string;
  /** Caption, bottom-right of the slide. */
  category: string;
};

/*
 * The ring is a WebGL cylinder of image planes viewed from just inside its
 * near rim — the camera sits at the world origin and the ring's centre is
 * pushed back so the nearest slide passes a few centimetres in front of the
 * lens. The far wall fills the frame while the near slides sweep past the
 * screen edges, which is what produces the wrap-around feel.
 *
 * Geometry is derived, not hard-coded: the circumference is `slide width ×
 * gap × count`, so the radius adapts if slides are added or removed. Each
 * plane is bowed with a parabola (flat at the edges, bulging away from the
 * viewer in the middle) so neighbouring slides read as one continuous curved
 * wall.
 *
 * This is modelled on naya-studio-dubai.webflow.io's showcase, with its bugs
 * fixed: the render loop is gated by an IntersectionObserver (theirs spins
 * for the life of the page), motion is time-based rather than per-frame (so
 * speed no longer doubles after the first drag and is frame-rate
 * independent), the drag ripple runs in the vertex shader instead of
 * per-vertex JavaScript, drags use pointer capture (theirs died on
 * `pointerleave`), labels render at texture resolution that survives the
 * projection, everything is disposed on unmount, `prefers-reduced-motion`
 * stops the idle spin, and the ring is keyboard-operable.
 */

/** Idle spin in rad/s (zeroed under prefers-reduced-motion). */
const IDLE_SPEED = 0.07;
/** Rotation smoothing half-life factor — the lag that makes the drag feel heavy. */
const ROT_EASE = 6.3;
/**
 * Radians of rotation for a drag across the full canvas width. Naya's 3.2 was
 * tuned against 2.648 slides of coverage; scaling with `SLIDES_ACROSS` keeps
 * the finger-following feel constant — a card crosses the same fraction of
 * the screen for the same swipe whatever the frustum shows.
 */
const DRAG_FACTOR = (3.2 / 2.648) * SLIDES_ACROSS;

/** Rounded-corner mask, drawn once and shared by every slide (alpha lives in green). */
function roundedRectTexture(w: number, h: number, r: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

/**
 * Caption texture — name left in white, category right in Text/Body 2 grey,
 * both drawn with the site's real mono face (resolved from a computed style
 * so next/font's hashed family name is used). One canvas carries both ends,
 * which avoids Naya's two overlapping label planes and their z-fighting
 * offsets.
 */
function labelTexture(name: string, category: string, fontFamily: string) {
  const W = LABEL_TEX_W;
  const H = Math.round(W * LABEL_H); // matches the label plane's aspect
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.font = `500 ${LABEL_FONT_PX}px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(name.toUpperCase(), 0, H / 2);
  ctx.fillStyle = "#a5a5a5"; // --color-body-2
  ctx.textAlign = "right";
  ctx.fillText(category.toUpperCase(), W, H / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

/** Bow a plane: z = -CURVE·(1 − u²), zero at the edges, deepest mid-slide. */
function applyCurvature(
  geometry: THREE.PlaneGeometry,
  width: number,
  factor: number,
) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) / (width / 2);
    pos.setZ(i, -factor * (1 - u * u));
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

export default function PortfolioRing({ slides }: { slides: RingSlide[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const fontProbeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const pillEl = pillRef.current;
    if (!wrapEl || !pillEl) return;
    // Re-annotated so the narrowing survives into the hoisted inner functions.
    const wrap: HTMLDivElement = wrapEl;
    const pill: HTMLDivElement = pillEl;

    let disposed = false;
    let initialized = false;
    let running = false;
    let rafId = 0;
    let contextLost = false;

    // Everything created during init, collected for disposal.
    const disposables: { dispose(): void }[] = [];
    const cleanups: (() => void)[] = [];

    /*
     * The drag ripple's uniforms are shared by reference across every
     * material, so one write per frame reaches all of them. The wave itself
     * is Naya's exact two-sine displacement, moved off the CPU: it bends
     * vertices near the ring's left rim (where slides exit the frame) by an
     * amount driven by drag velocity.
     */
    const wave = {
      uTime: { value: 0 },
      uAmp: { value: 0 },
      uCenterX: { value: 0 },
      uWidth: { value: 1 },
    };

    const injectWave = (material: THREE.Material) => {
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = wave.uTime;
        shader.uniforms.uAmp = wave.uAmp;
        shader.uniforms.uCenterX = wave.uCenterX;
        shader.uniforms.uWidth = wave.uWidth;
        shader.vertexShader =
          `uniform float uTime;\nuniform float uAmp;\nuniform float uCenterX;\nuniform float uWidth;\n` +
          shader.vertexShader.replace(
            "#include <project_vertex>",
            `vec4 worldPos = modelMatrix * vec4( transformed, 1.0 );
             float distX = worldPos.x - uCenterX;
             float falloff = max( 0.0, 1.0 - ( distX * distX ) / ( uWidth * uWidth ) );
             float ripple = uAmp * 4.0 * (
               sin( worldPos.x * 2.0 + uTime ) +
               sin( worldPos.x * 1.3 + worldPos.y * 0.8 + uTime * 1.2 )
             ) * 0.5;
             worldPos.y += ripple * falloff;
             vec4 mvPosition = viewMatrix * worldPos;
             gl_Position = projectionMatrix * mvPosition;`,
          );
      };
      // All injected materials share one program in the shader cache.
      material.customProgramCacheKey = () => "ring-wave";
    };

    // Interaction state, written by listeners, read by the render loop.
    const state = {
      rotation: Math.PI, // slide 0 starts centred on the far wall
      target: Math.PI,
      dragging: false,
      lastX: 0,
      velocity: 0, // normalized px/event, feeds the ripple only
      amp: 0,
      pillX: 0,
      pillY: 0,
      pillTX: 0,
      pillTY: 0,
      pillScale: 0.7,
      pillShown: false,
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let group: THREE.Group | null = null;
    const clock = new THREE.Clock();

    function frame() {
      if (!running || disposed || contextLost) return;
      rafId = requestAnimationFrame(frame);
      if (!renderer || !scene || !camera || !group) return;

      // Clamped so a background-tab pause doesn't land as one giant step.
      const dt = Math.min(clock.getDelta(), 0.05);

      if (!state.dragging && !reducedMotion.matches) {
        state.target += IDLE_SPEED * dt;
      }
      if (!state.dragging) {
        state.velocity *= Math.exp(-3.1 * dt);
      }

      state.rotation +=
        (state.target - state.rotation) * (1 - Math.exp(-ROT_EASE * dt));
      group.rotation.y = state.rotation;

      // Ripple amplitude chases drag speed, eased both ways like the original.
      const ampTarget = Math.min(Math.abs(state.velocity) * 1.6, 0.05);
      state.amp += (ampTarget - state.amp) * (1 - Math.exp(-13.4 * dt));
      wave.uAmp.value = state.amp < 0.0005 ? 0 : state.amp;
      wave.uTime.value += 0.24 * dt; // Naya's 0.004/frame at 60fps, made time-based

      // Drag pill trails the cursor with its own lag.
      const k = 1 - Math.exp(-12 * dt);
      state.pillX += (state.pillTX - state.pillX) * k;
      state.pillY += (state.pillTY - state.pillY) * k;
      const scaleTarget = state.dragging ? 0.85 : 1;
      state.pillScale += (scaleTarget - state.pillScale) * k;
      if (pill && state.pillShown) {
        pill.style.transform = `translate(-50%, -50%) translate(${state.pillX}px, ${state.pillY}px) scale(${state.pillScale.toFixed(3)})`;
      }

      renderer.render(scene, camera);
    }

    function start() {
      if (running || disposed || !initialized) return;
      running = true;
      clock.getDelta(); // swallow the pause so dt starts near zero
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    async function init() {
      if (initialized || disposed) return;
      initialized = true;

      const width = wrap.clientWidth || 1;
      const height = width / ASPECT;

      const radius = (SLIDE_W * GAP * slides.length) / (2 * Math.PI);
      wave.uCenterX.value = -radius;
      wave.uWidth.value = radius * 1.7;

      scene = new THREE.Scene();
      /*
       * The camera sits on the ring's near rim, so the slide filling the frame
       * is the one directly opposite — a full diameter plus the rim offset
       * away. Solving the frustum for that distance makes `VIEW_H` land
       * exactly on the content band whatever the slide count works out to.
       */
      const farWallDistance = 2 * radius + 0.06;
      const fov = THREE.MathUtils.radToDeg(
        2 * Math.atan(VIEW_H / 2 / farWallDistance),
      );
      camera = new THREE.PerspectiveCamera(fov, ASPECT, 0.1, 100);
      camera.position.set(0, CONTENT_CENTER_Y, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      disposables.push(renderer);

      const canvas = renderer.domElement;
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 0.8s ease";
      canvas.className = "block h-auto w-full";
      wrap.appendChild(canvas);
      cleanups.push(() => canvas.remove());

      const onLost = (e: Event) => {
        e.preventDefault();
        contextLost = true;
        cancelAnimationFrame(rafId);
      };
      const onRestored = () => {
        contextLost = false;
        if (running) rafId = requestAnimationFrame(frame);
      };
      canvas.addEventListener("webglcontextlost", onLost);
      canvas.addEventListener("webglcontextrestored", onRestored);
      cleanups.push(() => {
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", onRestored);
      });

      group = new THREE.Group();
      group.position.set(0, 0, -(radius + 0.06));
      group.rotation.y = state.rotation;
      scene.add(group);

      // The caption face must be resolved (and loaded) before it hits canvas.
      const fontFamily = fontProbeRef.current
        ? getComputedStyle(fontProbeRef.current).fontFamily
        : "monospace";
      try {
        await document.fonts.load(`500 50px ${fontFamily}`);
      } catch {
        /* fall back silently — the stack still renders */
      }
      if (disposed) return;

      const cornerMask = roundedRectTexture(512, 384, 20);
      disposables.push(cornerMask);

      const manager = new THREE.LoadingManager(() => {
        // Every texture is in: fade the whole ring up at once instead of
        // Naya's slide-by-slide pop-in.
        canvas.style.opacity = "1";
      });
      const loader = new THREE.TextureLoader(manager);
      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      const labelW = SLIDE_W;
      const labelH = SLIDE_W * LABEL_H;

      slides.forEach((slide, index) => {
        loader.load(slide.src, (texture) => {
          if (disposed || !group) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, maxAniso);
          disposables.push(texture);

          const geometry = new THREE.PlaneGeometry(SLIDE_W, SLIDE_H, 24, 18);
          applyCurvature(geometry, SLIDE_W, CURVE);
          disposables.push(geometry);

          const material = new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap: cornerMask,
            transparent: true,
            side: THREE.DoubleSide,
          });
          injectWave(material);
          disposables.push(material);

          const mesh = new THREE.Mesh(geometry, material);
          const angle = index * ((2 * Math.PI) / slides.length);
          mesh.position.set(
            radius * Math.sin(angle),
            0,
            radius * Math.cos(angle),
          );
          mesh.lookAt(0, 0, 0);

          const capTexture = labelTexture(
            slide.name,
            slide.category,
            fontFamily,
          );
          capTexture.anisotropy = Math.min(8, maxAniso);
          disposables.push(capTexture);

          const capGeometry = new THREE.PlaneGeometry(labelW, labelH, 8, 3);
          applyCurvature(capGeometry, labelW, SLIDE_W * 0.066);
          disposables.push(capGeometry);

          const capMaterial = new THREE.MeshBasicMaterial({
            map: capTexture,
            transparent: true,
          });
          injectWave(capMaterial);
          disposables.push(capMaterial);

          const cap = new THREE.Mesh(capGeometry, capMaterial);
          cap.position.set(0, LABEL_CENTER_Y, -0.05);
          mesh.add(cap);

          group.add(mesh);
        });
      });

      // ---- Interaction ------------------------------------------------

      const onPointerDown = (e: PointerEvent) => {
        state.dragging = true;
        state.lastX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
        wrap.style.cursor = "grabbing";
      };
      const onPointerMove = (e: PointerEvent) => {
        if (state.pillShown) {
          const rect = wrap.getBoundingClientRect();
          state.pillTX = e.clientX - rect.left;
          state.pillTY = e.clientY - rect.top;
        }
        if (!state.dragging) return;
        const dx = e.clientX - state.lastX;
        state.lastX = e.clientX;
        const w = canvas.clientWidth || 1;
        state.target -= (dx / w) * DRAG_FACTOR;
        state.velocity = dx / w;
      };
      const endDrag = () => {
        state.dragging = false;
        wrap.style.cursor = "";
      };
      const onPointerEnter = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const rect = wrap.getBoundingClientRect();
        state.pillTX = state.pillX = e.clientX - rect.left;
        state.pillTY = state.pillY = e.clientY - rect.top;
        state.pillShown = true;
        pill.style.opacity = "1";
      };
      const onPointerLeave = () => {
        state.pillShown = false;
        pill.style.opacity = "0";
      };
      const onKeyDown = (e: KeyboardEvent) => {
        const step = (2 * Math.PI) / slides.length;
        if (e.key === "ArrowRight") {
          state.target += step;
          e.preventDefault();
        } else if (e.key === "ArrowLeft") {
          state.target -= step;
          e.preventDefault();
        }
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", endDrag);
      canvas.addEventListener("pointercancel", endDrag);
      wrap.addEventListener("pointerenter", onPointerEnter);
      wrap.addEventListener("pointerleave", onPointerLeave);
      wrap.addEventListener("keydown", onKeyDown);
      cleanups.push(() => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", endDrag);
        canvas.removeEventListener("pointercancel", endDrag);
        wrap.removeEventListener("pointerenter", onPointerEnter);
        wrap.removeEventListener("pointerleave", onPointerLeave);
        wrap.removeEventListener("keydown", onKeyDown);
      });

      // The composition is width-driven and the aspect is locked, so resize
      // is just a renderer resize — no geometry or camera rebuild needed.
      const ro = new ResizeObserver(([entry]) => {
        if (!renderer) return;
        const w = entry.contentRect.width;
        if (w > 0) renderer.setSize(w, w / ASPECT);
      });
      ro.observe(wrap);
      cleanups.push(() => ro.disconnect());
    }

    /*
     * One observer both lazily creates the scene (so ~1MB of textures only
     * loads once the reader nears the section) and gates the render loop (so
     * nothing draws while the ring is off screen). Below lg the wrapper is
     * display:none, has no box, and never intersects — the whole WebGL path
     * simply never runs on mobile.
     */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!initialized) void init().then(start);
          else start();
        } else {
          stop();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(wrap);

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      cleanups.forEach((fn) => fn());
      disposables.forEach((d) => d.dispose());
    };
  }, [slides]);

  return (
    <div
      ref={wrapRef}
      role="region"
      aria-label="Project showcase carousel. Drag, or use the left and right arrow keys, to rotate."
      tabIndex={0}
      // Derived from the ring's geometry (see the framing constants), so the
      // reserved box and the renderer always agree and nothing shifts on load.
      style={{ aspectRatio: String(ASPECT) }}
      className="relative hidden w-full cursor-grab touch-pan-y overflow-hidden outline-none select-none focus-visible:ring-1 focus-visible:ring-white/40 lg:block"
    >
      {/* Resolves the site's mono face for the canvas-drawn captions. */}
      <span
        ref={fontProbeRef}
        aria-hidden
        className="pointer-events-none absolute font-mono opacity-0"
      >
        A
      </span>

      {/* Edge vignette — dissolves the near slides into the section's black. */}
      <div
        aria-hidden
        style={{ backgroundImage: RING_VIGNETTE }}
        className="pointer-events-none absolute inset-0 z-10"
      />

      {/* Cursor-trailing drag hint, mouse pointers only. */}
      <div
        ref={pillRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-20 flex h-9 items-center gap-2 rounded-full bg-white/10 px-5 font-mono text-[11px] tracking-[0.08em] text-white uppercase opacity-0 backdrop-blur-md transition-opacity duration-300"
      >
        <span aria-hidden>‹</span>
        drag
        <span aria-hidden>›</span>
      </div>
    </div>
  );
}
