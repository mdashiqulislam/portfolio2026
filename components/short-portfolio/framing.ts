/*
 * Framing constants for the Short Portfolio ring — geometry, frustum, and
 * the derived canvas shape. This module is deliberately NOT a client
 * module: ShortPortfolioSection (a server component) needs
 * `RING_EDGE_GAP_VW` as an actual number for its padding calc, and value
 * imports from a "use client" module arrive in a server component as
 * client-reference proxies, not values.
 */

/** Slide plane width in world units; height follows the mockups' 4:3. */
export const SLIDE_W = 2.31;
export const SLIDE_H = SLIDE_W * (3 / 4);
/** Caption strip height as a fraction of slide width (Naya's 0.17). */
export const LABEL_H = 0.17;
/** Breathing room between slides along the circumference. */
export const GAP = 1.06;
/** Parabolic bow depth at a slide's centre, in world units. */
export const CURVE = 0.2;
/**
 * On-screen magnification of the cards. Scaling the planes in world space
 * would achieve nothing — the ring's radius is derived from slide width, so
 * the far wall would recede by the same factor and cancel it out. Zoom is
 * therefore a narrower horizontal frustum: the card's pixel width is just
 * `canvas width ÷ SLIDES_ACROSS`, so dividing the coverage by this factor
 * multiplies the cards by it.
 *
 * Note the trade this buys. At 1 the frustum is exactly wide enough to hold a
 * flanking card whole (24.8° of half-frustum against a 24.2° outer corner),
 * so cards leave only through the vignette. Every step above 1 pulls that
 * edge in — at 1.5 the flank corner overshoots by 7.1° — so the card IS
 * geometrically cut by the frame, and the vignette has to be strong enough
 * that the cut lands on pixels which are already black. `RING_VIGNETTE`
 * carries that heavier ramp.
 */
export const CARD_SCALE = 1.5;
/*
 * Framing. Naya renders into a 5:3 canvas, which is far taller than the band
 * of slides actually occupies — roughly a quarter of the canvas height is
 * empty at the top and another quarter at the bottom, which reads as dead
 * space padding the section. Instead of a fixed canvas shape, the frustum is
 * derived from the content so the canvas hugs the ring: the visible world
 * height is the slide plus its caption plus a hair of margin, and the aspect
 * follows from the horizontal coverage.
 *
 * Because `VIEW_W`/`VIEW_H` and the canvas dimensions shrink together, the
 * pixels-per-world-unit ratio is unchanged — the slides render at exactly the
 * size they did before, and only the empty margin is cropped away.
 */
/** Caption texture width, and the type size drawn into it. */
export const LABEL_TEX_W = 2048;
export const LABEL_FONT_PX = 50;
export const LABEL_PLANE_H = SLIDE_W * LABEL_H;
/** Where the caption plane's centre sits relative to the slide. */
export const LABEL_CENTER_Y = -SLIDE_H / 2 - LABEL_PLANE_H / 4;
/**
 * The caption glyphs occupy only this fraction of the caption plane — the
 * texture is mostly transparent above and below the text. Framing to the
 * plane's geometric edge would leave the section looking bottom-heavy, so the
 * content box stops at the type itself.
 */
export const LABEL_TEXT_RATIO = LABEL_FONT_PX / (LABEL_TEX_W * LABEL_H);
/** Topmost content: the slide's own top edge. */
export const CONTENT_TOP = SLIDE_H / 2;
/** Bottommost content: the underside of the caption type. */
export const CONTENT_BOTTOM =
  LABEL_CENTER_Y - (LABEL_PLANE_H * LABEL_TEXT_RATIO) / 2;
/** Content sits slightly below the ring's axis, so the camera drops to match. */
export const CONTENT_CENTER_Y = (CONTENT_TOP + CONTENT_BOTTOM) / 2;

/**
 * Horizontal world coverage at the far wall, in slide widths. This is the
 * knob that decides how a card leaves the frame. At 2.648 (the first cut of
 * this component) a flanking card's outer corner sat at ~24.2° off-axis
 * against a ~19.5° half-frustum, so cards and their captions were hard-cut
 * by the frame edge while still clearly lit. 3.45 puts the half-frustum at
 * ~24.8° for this eleven-slide ring: a card beside the centre one fits
 * wholly inside the frame — rounded corners, name, category — and only the
 * next card out crosses the boundary, under the darkest part of the
 * vignette, which is how the reference reads.
 */
export const SLIDES_ACROSS = 3.45 / CARD_SCALE;
export const VIEW_W = SLIDE_W * SLIDES_ACROSS;

/**
 * The deck size the framing is solved for. The vertical frustum below is a
 * worst-case sweep over the ring, and the ring's radius depends on the slide
 * count, so module scope needs the number ShortPortfolioSection actually
 * passes. A different deck still renders; the no-vertical-clip guarantee is
 * exact only at this count.
 */
export const FRAMING_DECK_SIZE = 11;

/**
 * Vertical world height the frustum must show so that cards NEVER clip at the
 * canvas's top or bottom — they only ever leave through the left/right edges,
 * under the vignette, the way the reference behaves. Framing the far-wall
 * card alone is not enough: a card swinging toward the frame edge is closer
 * to the camera and projects taller, so its top edge and caption poke out of
 * a content-tight frustum. This sweeps a full slide-step of rotation and
 * takes the worst vertical angle of any card point that is inside the
 * horizontal window (points at/behind the camera's near region can't render
 * and are skipped).
 */
export const VIEW_H = (() => {
  const r = (SLIDE_W * GAP * FRAMING_DECK_SIZE) / (2 * Math.PI);
  const groupZ = -(r + 0.06);
  const farD = 2 * r + 0.06;
  const halfH = Math.atan(VIEW_W / 2 / farD);
  let worst = 0;
  const step = (2 * Math.PI) / FRAMING_DECK_SIZE;
  for (let ph = 0; ph <= 60; ph++) {
    const phase = (ph / 60) * step;
    for (let i = 0; i < FRAMING_DECK_SIZE; i++) {
      const a = i * step + phase;
      const cx = r * Math.sin(a);
      const cz = groupZ + r * Math.cos(a);
      const tx = Math.cos(a);
      const tz = -Math.sin(a); // tangent along the card's width
      const rx = Math.sin(a);
      const rz = Math.cos(a); // radially outward — the curvature bow direction
      for (let s = 0; s <= 40; s++) {
        const u = s / 20 - 1;
        const w = (u * SLIDE_W) / 2;
        const bow = CURVE * (1 - u * u);
        const px = cx + w * tx + bow * rx;
        const pz = cz + w * tz + bow * rz;
        if (pz >= -0.2) continue; // at/behind the camera's near region
        if (Math.atan(Math.abs(px) / -pz) > halfH) continue; // outside horizontally
        const dist = Math.hypot(px, pz);
        for (const py of [CONTENT_TOP, CONTENT_BOTTOM]) {
          const tv = Math.abs(Math.atan((py - CONTENT_CENTER_Y) / dist));
          if (tv > worst) worst = tv;
        }
      }
    }
  }
  const margin = 0.008; // ~0.5° of slack over the exact extreme
  return 2 * Math.tan(worst + margin) * farD;
})();

/**
 * The frustum's slack around the far-wall content, as vw (the canvas is
 * full-bleed, so world-to-pixel scale is per viewport width). The section
 * subtracts this from its 160px paddings so the visual gap from section edge
 * to the centre card stays exactly 160px.
 */
export const RING_EDGE_GAP_VW =
  ((VIEW_H / 2 - (CONTENT_TOP - CONTENT_CENTER_Y)) /
    (SLIDE_W * SLIDES_ACROSS)) *
  100;
/** Canvas shape, and the camera's aspect. Derived, not authored. */
export const ASPECT = VIEW_W / VIEW_H;

/**
 * Edge vignette. Its job is to make a card's exit invisible: wherever the
 * frame cuts a card, those pixels must already be black.
 *
 * Naya can use a flat `rgba(0,0,0,0.85)` at the edges because their photos are
 * dark, moody blues — 85% black finishes them off. These mockups are bright
 * white laptop UI, which reads straight through 85%, so the ramp here is
 * heavier and starts earlier: by the point where a flanking card first
 * appears it is already better than half-obscured, and it reaches solid black
 * before the frame edge where the geometric cut happens.
 *
 * Stops are authored in half-width units (0 = centre, 1 = either edge) and
 * mirrored, so the gradient stays symmetric by construction.
 *
 * The ramp is ~10 percentage points lighter than a straight cover-up through
 * the middle band, so a departing card stays readable further out instead of
 * dropping into black early. The last stops are NOT part of that easing: the
 * frame cuts the card at u = 1, so the gradient still has to reach solid
 * black just before it, or the slice becomes visible again. Lightening those
 * final stops is the one change this gradient cannot take.
 */
const VIGNETTE_STOPS: [u: number, alpha: number][] = [
  [0.0, 0],
  [0.32, 0.05],
  [0.52, 0.28],
  [0.68, 0.56],
  [0.8, 0.77],
  [0.9, 0.93],
  [0.96, 1],
  [1.0, 1],
];

export const RING_VIGNETTE = `linear-gradient(90deg,${[
  ...VIGNETTE_STOPS.map(
    ([u, a]) => [(1 - u) * 50, a] as [pos: number, alpha: number],
  ).reverse(),
  ...VIGNETTE_STOPS.map(
    ([u, a]) => [50 + u * 50, a] as [pos: number, alpha: number],
  ),
]
  .map(([pos, a]) => ` rgba(0,0,0,${a}) ${pos.toFixed(2)}%`)
  .join(",")})`;
