import * as THREE from "three";
import { DEPTH_ASSET, buildDepthField, sampleDepth } from "./depthField";

/*
 * The actual three scene behind Avatar3D — the only module that imports
 * three, so the whole library stays in this async chunk. The plane's vertices
 * are displaced along the ray to the camera, so at the rest pose every vertex
 * projects to exactly its original screen position: the front view IS the
 * flat image by construction, and the relief only appears under rotation,
 * with the same perspective strength as LookAtAvatar's CSS transform.
 */

/** World units = CSS px of the lg layout box; exactly half the 604×906 texture. */
const PLANE_W = 302;
const PLANE_H = 453;
/** 129×193 = 24,897 vertices — fits the automatic Uint16 index; ~2.35px pitch. */
const SEG_X = 128;
const SEG_Y = 192;
/**
 * Camera distance replicating today's CSS `perspective(800px)` — in CSS px.
 * World units are lg-layout px, so the camera actually sits at CAM_Z·scale
 * world units and the displacement bake follows it (see bakeDisplacement):
 * the foreshortening then matches the CSS effect at every layout width, not
 * just at lg where scale happens to be 1.
 */
const CAM_Z = 800;
/** Canvas margin per side; must match the host's `-inset-[15%]`. */
const BLEED = 0.15;
/** Frames plane + bleed precisely at CAM_Z (≈40.42°). */
const FOV = (2 * Math.atan((PLANE_H * (1 + 2 * BLEED)) / 2 / CAM_Z) * 180) / Math.PI;
const NEAR = 100;
const FAR = 1600;
/**
 * World-px per unit of relief; peak (brim ≈1.32) lands near 79, hard-capped
 * at DEPTH_CAP. Tunable 45–70, but MAX_DEPTH, BLEED and the one-time painter
 * sort are coupled: past 80, or past ±14°/±10° rotation, the frustum framing
 * and the static far-to-near triangle order stop being valid. Change together
 * or not at all.
 */
const MAX_DEPTH = 60;
const DEPTH_CAP = 80;
/** Motion constants copied verbatim from LookAtAvatar — the feel must match. */
const MAX_ROTATE_Y = 14;
const MAX_ROTATE_X = 10;
const MAX_SHIFT = 8;
const DAMPING = 0.08;
const SETTLE_EPS = 0.01;
/** Coarse-pointer idle sway: yaw 4°·sin(0.4t), pitch 2.5°·sin(0.27t + 1). */
const SWAY_YAW = 4;
const SWAY_YAW_HZ = 0.4;
const SWAY_PITCH = 2.5;
const SWAY_PITCH_HZ = 0.27;
const SWAY_PITCH_PHASE = 1.0;

const DEG2RAD = Math.PI / 180;

/** Fixed poses use the CSS-degree convention (same numbers LookAtAvatar takes). */
export type AvatarSceneDebug = { yawDeg?: number; pitchDeg?: number; freeze?: boolean };

export type AvatarSceneOptions = {
  /** Bleed box the canvas is appended to (`-inset-[15%]` of `box`). */
  host: HTMLElement;
  /** Layout box: offsetWidth/Height for px→world scale, rect for pointer centre. */
  box: HTMLElement;
  textureUrl: string;
  mode: "pointer" | "sway";
  /**
   * Reads the pose the CSS fallback is showing at call time (degrees, CSS
   * convention), so the scene can start exactly where LookAtAvatar currently
   * is instead of snapping to rest at the handoff. Return null when the
   * fallback is untransformed.
   */
  getFallbackPose?: () => { cssX: number; cssY: number } | null;
  debug?: AvatarSceneDebug;
  /** Fires on the rAF after the first frame — the canvas is on screen. */
  onFirstFrame: () => void;
  onContextLost: () => void;
};

export type AvatarSceneHandle = { dispose(): void };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Avatar3D: failed to load ${url}`));
    img.src = url;
  });
}

export async function createAvatarScene(o: AvatarSceneOptions): Promise<AvatarSceneHandle> {
  const { host, box, mode, debug } = o;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  let texture: THREE.Texture;
  let depthImage: HTMLImageElement | null = null;
  try {
    texture = await new THREE.TextureLoader().loadAsync(o.textureUrl);
    if (DEPTH_ASSET) depthImage = await loadImage(DEPTH_ASSET);
  } catch (err) {
    renderer.dispose();
    throw err;
  }

  // Fixed DPR 2: at lg the plane spans 604 backing px — texture-native, so
  // sharpness under ScrollGrow's CSS magnification matches the current <img>
  // (both source-limited at 604px). Also the house DPR≤2 cap.
  renderer.setPixelRatio(2);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  // Center the canvas in the host: clientWidth/Height round to ints while the
  // -inset-[15%] host is fractional, so anchoring top-left would drift the
  // projection centre off the box centre by a sub-pixel.
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.margin = "auto";

  // Premultiply at upload so GPU mips can't bleed transparent-texel RGB into
  // the hair/beard wisps. Must be set before the first render uploads.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.premultiplyAlpha = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  // Default planar UVs map the texture 1:1 onto the plane.
  const geometry = new THREE.PlaneGeometry(PLANE_W, PLANE_H, SEG_X, SEG_Y);
  const field = buildDepthField(texture.image as CanvasImageSource, depthImage);

  // Ray displacement: move each vertex toward the camera at (0,0,camZ) by
  // its relief depth. (x0·k, y0·k, δ) with k=(camZ−δ)/camZ projects to the
  // vertex's original screen position at the front view. The bake depends on
  // the camera distance, which tracks the layout scale, so it lives in
  // bakeDisplacement() below — only δ and the flat grid are computed here.
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  const delta = new Float32Array(pos.count);
  const baseXY = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    delta[i] = Math.min(MAX_DEPTH * sampleDepth(field, uv.getX(i), uv.getY(i)), DEPTH_CAP);
    baseXY[i * 2] = pos.getX(i);
    baseXY[i * 2 + 1] = pos.getY(i);
  }

  // One-time painter sort: triangles ascending by depth (far first). With
  // depth test off this gives correct brim-over-forehead / nose-over-cheek
  // layering for every pose within ±14°/±10°. Never re-sorted.
  const index = geometry.getIndex()!;
  const triCount = index.count / 3;
  const key = new Float32Array(triCount);
  const order: number[] = new Array(triCount);
  for (let t = 0; t < triCount; t++) {
    order[t] = t;
    key[t] =
      delta[index.getX(t * 3)] + delta[index.getX(t * 3 + 1)] + delta[index.getX(t * 3 + 2)];
  }
  order.sort((a, b) => key[a] - key[b]);
  const src = index.array as Uint16Array;
  const sorted = src.slice();
  for (let n = 0; n < triCount; n++) {
    const t = order[n];
    sorted[n * 3] = src[t * 3];
    sorted[n * 3 + 1] = src[t * 3 + 1];
    sorted[n * 3 + 2] = src[t * 3 + 2];
  }
  geometry.setIndex(new THREE.BufferAttribute(sorted, 1));

  // Premultiplied source over premultiplied dest, both color and alpha; the
  // context's premultipliedAlpha default (true) then composites over the page
  // exactly like the flat PNG does today. material.premultipliedAlpha must
  // stay false — the texture upload already premultiplied, and doing it twice
  // darkens the wisp fringes.
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 2 / 3, NEAR, FAR);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const fixedPose =
    !!debug &&
    (debug.yawDeg !== undefined || debug.pitchDeg !== undefined || debug.freeze === true);
  const freeze = !!debug?.freeze;

  let raf = 0;
  let rafPending = false;
  let firstFrameRaf = 0;
  let swayRunning = false;
  let visible = true;
  // Seed target AND current from the pose the fallback shows right now: if
  // the pointer moved while the three chunk loaded, the handoff frame matches
  // the tilted image instead of snapping to rest — and a pointer that then
  // sits still keeps that pose (no pointermove would come to correct it).
  const seeded = (!fixedPose && o.getFallbackPose?.()) || null;
  let targetX = fixedPose ? (debug?.pitchDeg ?? 0) : (seeded?.cssX ?? 0); // rotateX deg (CSS convention)
  let targetY = fixedPose ? (debug?.yawDeg ?? 0) : (seeded?.cssY ?? 0); // rotateY deg
  let curX = targetX;
  let curY = targetY;
  let scale = PLANE_H / (box.offsetHeight || PLANE_H);
  /** Camera distance in world units — CAM_Z CSS px at the current scale. */
  let camZ = 0;

  // (Re)bakes the ray displacement for the current camera distance. Cheap
  // (~25k vertices), and only runs when the layout scale actually changes —
  // a breakpoint crossing. The painter sort keys on `delta` alone, so the
  // static triangle order stays valid across bakes.
  function bakeDisplacement() {
    const next = CAM_Z * scale;
    if (next === camZ) return;
    camZ = next;
    camera.position.z = camZ;
    for (let i = 0; i < delta.length; i++) {
      const d = delta[i];
      const k = (camZ - d) / camZ;
      pos.setXYZ(i, baseXY[i * 2] * k, baseXY[i * 2 + 1] * k, d);
    }
    pos.needsUpdate = true;
    geometry.computeBoundingSphere();
  }
  bakeDisplacement();

  // CSS is y-down, three is y-up: rotateY keeps its sign, rotateX and the
  // vertical drift negate. (Check: cursor below ⇒ head looks down.)
  function applyPose(cssX: number, cssY: number) {
    mesh.rotation.y = cssY * DEG2RAD;
    mesh.rotation.x = -cssX * DEG2RAD;
    const shiftX = (cssY / MAX_ROTATE_Y) * MAX_SHIFT;
    const shiftY = (-cssX / MAX_ROTATE_X) * (MAX_SHIFT * 0.6);
    mesh.position.x = shiftX * scale;
    mesh.position.y = -shiftY * scale;
  }

  function renderFrame() {
    renderer.render(scene, camera);
  }

  function schedule() {
    if (rafPending) return;
    rafPending = true;
    raf = requestAnimationFrame(() => {
      rafPending = false;
      step();
    });
  }

  function step() {
    curX += (targetX - curX) * DAMPING;
    curY += (targetY - curY) * DAMPING;
    applyPose(curX, curY);
    if (visible) renderFrame();
    if (Math.abs(targetX - curX) + Math.abs(targetY - curY) > SETTLE_EPS) {
      schedule();
    }
  }

  function onPointerMove(e: PointerEvent) {
    const r = box.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
    targetY = nx * MAX_ROTATE_Y;
    targetX = -ny * MAX_ROTATE_X;
    // Advance synchronously on the event itself (like LookAtAvatar); the rAF
    // tail carries the settle.
    step();
  }

  const clock = new THREE.Clock();
  function swayLoop() {
    const t = clock.getElapsedTime();
    curX = SWAY_PITCH * Math.sin(SWAY_PITCH_HZ * t + SWAY_PITCH_PHASE);
    curY = SWAY_YAW * Math.sin(SWAY_YAW_HZ * t);
    applyPose(curX, curY);
    renderFrame();
    raf = requestAnimationFrame(swayLoop);
  }

  function updateSway() {
    const active = visible && !document.hidden;
    if (active && !swayRunning) {
      swayRunning = true;
      raf = requestAnimationFrame(swayLoop);
    } else if (!active && swayRunning) {
      swayRunning = false;
      cancelAnimationFrame(raf);
    }
  }

  function onVisibilityChange() {
    updateSway();
  }

  function resize() {
    const { clientWidth, clientHeight } = host;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setSize(clientWidth, clientHeight);
    scale = PLANE_H / (box.offsetHeight || PLANE_H);
    bakeDisplacement(); // keeps the camera at CAM_Z CSS px if the breakpoint moved
    // The FOV constant assumes the host is exactly (1+2·BLEED)× the box, but
    // clientWidth/Height are rounded ints — derive the frustum from the
    // measured ratio so the plane stays pixel-locked to the fallback image.
    camera.fov = (2 * Math.atan((clientHeight * scale) / 2 / camZ) * 180) / Math.PI;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    applyPose(curX, curY); // re-derive the drift with the fresh scale
    renderFrame();
  }

  function onContextLost(e: Event) {
    e.preventDefault();
    o.onContextLost();
  }

  let resizeObserver: ResizeObserver | null = null;
  let intersection: IntersectionObserver | null = null;

  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  host.appendChild(renderer.domElement);

  applyPose(curX, curY); // rest, or the debug fixed pose
  resize(); // sizes the canvas and renders the first frame at that pose

  if (!freeze) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    if (!fixedPose) {
      intersection = new IntersectionObserver((entries) => {
        // Batched entries arrive oldest-first — only the last is current.
        const wasVisible = visible;
        visible = entries[entries.length - 1]?.isIntersecting ?? true;
        if (mode === "sway") {
          updateSway();
        } else if (visible && !wasVisible) {
          // The spring kept advancing on pointermove while renders were
          // skipped — repaint so re-entry doesn't show the stale exit frame.
          schedule();
        }
      });
      intersection.observe(box);
      if (mode === "pointer") {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
      } else {
        document.addEventListener("visibilitychange", onVisibilityChange);
        updateSway();
      }
    }
  }

  // The compositor paints the rendered frame before the next rAF fires, so
  // the fallback image never hides ahead of the canvas. Just before the flip,
  // re-read the fallback's pose — it kept springing during scene setup — so
  // the frame the canvas takes over from is the frame the image was showing.
  firstFrameRaf = requestAnimationFrame(() => {
    if (!fixedPose && mode === "pointer") {
      const pose = o.getFallbackPose?.();
      if (pose) {
        targetX = curX = pose.cssX;
        targetY = curY = pose.cssY;
        applyPose(curX, curY);
        renderFrame();
      }
    }
    o.onFirstFrame();
  });

  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(firstFrameRaf);
    resizeObserver?.disconnect();
    intersection?.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === host) {
      host.removeChild(renderer.domElement);
    }
  }

  return { dispose };
}
