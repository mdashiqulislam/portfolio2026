/*
 * Procedural depth field for the hero avatar, built once at init from the
 * PNG's own alpha + luminance — no extra asset, no network fetch. The relief
 * is a "balloon" inflation of the silhouette (chamfer distance transform →
 * quarter-circle profile) plus targeted boosts for the cap brim and nose that
 * inflation alone cannot produce, plus a low-amplitude luminance emboss.
 *
 * Pure TS on purpose: this module never imports three, so it stays testable
 * and keeps the three chunk boundary in createAvatarScene.
 */

/** Working resolution — source/2 of the 604×906 PNG, keeps the 2:3 aspect. */
export const DF_W = 302;
export const DF_H = 453;

/**
 * Escape hatch: set to a grayscale image URL (e.g. "/figma/hero/avatar-depth.png")
 * to replace the procedural relief with a hand-authored map — R/255 scaled to
 * DEPTH_RANGE, with only the alpha-derived edge pin kept. Null by default so
 * no speculative request 404s on every load.
 */
export const DEPTH_ASSET: string | null = null;

/** Relief ceiling — the balloon plateau (1.0) plus the brim boost. */
const DEPTH_RANGE = 1.32;

/** Alpha threshold (0–255) separating content from the transparent exterior. */
const ALPHA_MIN = 12;

/*
 * Content bbox of avatar.png's alpha (measured from the asset: source px
 * x∈[109,494], y∈[117,639]) at working scale. The brim/nose/eye bands below
 * are expressed in these content-normalized coordinates (v=0 at content top).
 */
const CONTENT_X = 54.5;
const CONTENT_Y = 58.5;
const CONTENT_W = 193;
const CONTENT_H = 261.5;

/**
 * Amplitude of the luminance-detail emboss. First knob to turn: set to 0 if
 * the relief looks noisy or "swims" under motion.
 */
const DETAIL_AMP = 0.05;

export type DepthField = { data: Float32Array; width: number; height: number };

/** Structural stand-in for ImageData, so the pipeline is testable off-DOM. */
export type PixelData = {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
};

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * 3-4 chamfer distance transform: per-pixel distance (in px) from the nearest
 * transparent pixel. Forward TL→BR then backward BR→TL pass, orthogonal cost
 * 3, diagonal 4, divided by 3 at the end.
 */
function chamferDT(mask: Uint8Array, w: number, h: number): Float32Array {
  const INF = 1 << 29;
  const d = new Int32Array(mask.length);
  for (let i = 0; i < mask.length; i++) d[i] = mask[i] ? INF : 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 3);
      if (y > 0) {
        v = Math.min(v, d[i - w] + 3);
        if (x > 0) v = Math.min(v, d[i - w - 1] + 4);
        if (x < w - 1) v = Math.min(v, d[i - w + 1] + 4);
      }
      d[i] = v;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      let v = d[i];
      if (x < w - 1) v = Math.min(v, d[i + 1] + 3);
      if (y < h - 1) {
        v = Math.min(v, d[i + w] + 3);
        if (x < w - 1) v = Math.min(v, d[i + w + 1] + 4);
        if (x > 0) v = Math.min(v, d[i + w - 1] + 4);
      }
      d[i] = v;
    }
  }
  const out = new Float32Array(mask.length);
  for (let i = 0; i < mask.length; i++) out[i] = d[i] / 3;
  return out;
}

/** Separable box blur, zero-padded (the exterior participates as 0). */
function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const win = 2 * r + 1;
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let x = 0; x <= r && x < w; x++) sum += src[row + x];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / win;
      const add = x + r + 1;
      const drop = x - r;
      if (add < w) sum += src[row + add];
      if (drop >= 0) sum -= src[row + drop];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = 0; y <= r && y < h; y++) sum += tmp[y * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / win;
      const add = y + r + 1;
      const drop = y - r;
      if (add < h) sum += tmp[add * w + x];
      if (drop >= 0) sum -= tmp[drop * w + x];
    }
  }
  return out;
}

/**
 * Core pipeline over raw RGBA at working resolution. When `depthMap` is given
 * (the DEPTH_ASSET drop-in), its R channel replaces the procedural relief and
 * only the edge pin from the color image's alpha is applied.
 */
export function buildDepthFieldFromPixels(
  rgba: PixelData,
  depthMap?: PixelData | null,
): DepthField {
  const w = DF_W;
  const h = DF_H;
  const n = w * h;
  const px = rgba.data;

  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = px[i * 4 + 3] > ALPHA_MIN ? 1 : 0;
  const dt = chamferDT(mask, w, h);

  let field: Float32Array;
  if (depthMap) {
    field = new Float32Array(n);
    for (let i = 0; i < n; i++) field[i] = (depthMap.data[i * 4] / 255) * DEPTH_RANGE;
  } else {
    let dtMax = 0;
    for (let i = 0; i < n; i++) if (dt[i] > dtMax) dtMax = dt[i];

    // Luminance, zeroed outside the mask (transparent RGB is undefined).
    const lum = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      if (!mask[i]) continue;
      lum[i] =
        (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    }
    const lumBlur = boxBlur(lum, w, h, 6);

    field = new Float32Array(n);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!mask[i]) continue; // exterior stays 0 for the smoothing passes
        // Balloon profile: steep rise off the silhouette, flat face plateau.
        const dn = Math.min(dt[i] / (0.75 * dtMax), 1);
        const base = Math.sqrt(1 - (1 - dn) * (1 - dn));
        const u = (x - CONTENT_X) / CONTENT_W;
        const v = (y - CONTENT_Y) / CONTENT_H;
        // Cap brim: a forward shelf inflation can't produce.
        const spread = 2 * u - 1;
        const brim =
          0.38 *
          smoothstep(0.19, 0.27, v) *
          (1 - smoothstep(0.315, 0.365, v)) *
          (1 - 0.55 * spread * spread);
        const nose =
          0.16 *
          Math.exp(
            -((u - 0.5) ** 2 / (2 * 0.055 ** 2) + (v - 0.57) ** 2 / (2 * 0.045 ** 2)),
          );
        let detail = Math.min(Math.max(2.5 * (lum[i] - lumBlur[i]), -1), 1);
        // Eye band: glossy catchlights must not emboss outward.
        if (v >= 0.4 && v <= 0.52 && detail > 0.4) detail = 0.4;
        const rel = Math.min(Math.max(base + brim + nose, 0), DEPTH_RANGE);
        field[i] = rel + DETAIL_AMP * detail;
      }
    }
    field = boxBlur(field, w, h, 3);
    field = boxBlur(field, w, h, 3);
  }

  // Edge pin: the silhouette returns exactly to 0, killing the blur-lifted
  // halo shelf just outside the alpha edge.
  for (let i = 0; i < n; i++) {
    const pinned = field[i] * Math.min(dt[i] / 3, 1);
    field[i] = Math.min(Math.max(pinned, 0), DEPTH_RANGE);
  }
  return { data: field, width: w, height: h };
}

function rasterize(source: CanvasImageSource): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = DF_W;
  canvas.height = DF_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, DF_W, DF_H);
  return ctx.getImageData(0, 0, DF_W, DF_H);
}

/** Builds the field from the avatar image (plus the optional DEPTH_ASSET image). */
export function buildDepthField(
  image: CanvasImageSource,
  depthImage?: CanvasImageSource | null,
): DepthField {
  return buildDepthFieldFromPixels(
    rasterize(image),
    depthImage ? rasterize(depthImage) : null,
  );
}

/**
 * Bilinear sample. `v` follows three's UV convention (0 = bottom); the field
 * is stored top-down, so it flips internally.
 */
export function sampleDepth(f: DepthField, u: number, v: number): number {
  const fx = Math.min(Math.max(u, 0), 1) * (f.width - 1);
  const fy = (1 - Math.min(Math.max(v, 0), 1)) * (f.height - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, f.width - 1);
  const y1 = Math.min(y0 + 1, f.height - 1);
  const tx = fx - x0;
  const ty = fy - y0;
  const top = f.data[y0 * f.width + x0] * (1 - tx) + f.data[y0 * f.width + x1] * tx;
  const bot = f.data[y1 * f.width + x0] * (1 - tx) + f.data[y1 * f.width + x1] * tx;
  return top * (1 - ty) + bot * ty;
}
