import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";

/**
 * Shove-on-hover physics, from the client's reference site
 * (more-nutrition.webflow.io, the payment-methods section).
 *
 * How that effect works, reverse-engineered from the site's `app.js`:
 *
 *  - A `mousemove` listener on the container samples the cursor once per
 *    animation frame; the delta between consecutive samples is the cursor
 *    velocity, in px/frame.
 *  - `mouseenter` on a (static) hit area shoves a child element with a GSAP
 *    InertiaPlugin tween: x/y start at 30× the cursor velocity (clamped to
 *    ±1080), then decay to rest at 0 with `resistance: 180`.
 *  - The spin is the cross product of the entry point's offset from the
 *    child's centre with the cursor velocity, normalised by the offset's
 *    length — swipe past the centre and it barely turns, clip a corner and it
 *    kicks. Rotation velocity is 15× that torque, clamped to ±60 deg/s.
 *  - The whole thing only arms on `(hover: hover) and (pointer: fine)`.
 *
 * Same parameters, same GSAP version (3.15.0). Each `li` is the hit area and
 * its first child is the mover, so the hover target never slides out from
 * under the cursor. One deliberate addition: it also stays off under
 * `prefers-reduced-motion`.
 *
 * Returns a cleanup function; calling it when the effect never armed is safe.
 */
export default function shoveOnHover(container: HTMLElement): () => void {
  const noop = () => {};
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
    return noop;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return noop;

  gsap.registerPlugin(InertiaPlugin);
  const clampShove = gsap.utils.clamp(-1080, 1080);
  const clampSpin = gsap.utils.clamp(-60, 60);

  /*
   * Cursor velocity in px/frame. Only the event that scheduled the frame is
   * read — later events in the same frame are dropped, as on the reference
   * site, so a fast wiggle can't inflate the delta.
   */
  let lastX = 0;
  let lastY = 0;
  let vx = 0;
  let vy = 0;
  let frame: number | null = null;
  const onMove = (e: MouseEvent) => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      vx = e.clientX - lastX;
      vy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      frame = null;
    });
  };
  container.addEventListener("mousemove", onMove);

  const enters: Array<[HTMLElement, (e: MouseEvent) => void]> = [];
  for (const item of container.querySelectorAll("li")) {
    const mover = item.firstElementChild as HTMLElement | null;
    if (!mover) continue;
    const onEnter = (e: MouseEvent) => {
      const { left, top, width, height } = mover.getBoundingClientRect();
      const ox = e.clientX - (left + width / 2);
      const oy = e.clientY - (top + height / 2);
      const torque = (ox * vy - oy * vx) / (Math.hypot(ox, oy) || 1);
      /*
        A mover inside a tilted hit area inherits its rotated coordinate space,
        where a shove along local x would drift off the swipe by the tilt
        angle. The reference movers are unrotated, so the cursor velocity is
        rotated into the item's local frame first — the tween then plays out on
        screen exactly as it does on the reference, and an untilted item makes
        this the identity. (The torque is a scalar and needs no correction.)
      */
      const tilt =
        ((parseFloat(getComputedStyle(item).rotate) || 0) * Math.PI) / 180;
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);
      gsap.to(mover, {
        inertia: {
          x: { velocity: clampShove(30 * (cos * vx + sin * vy)), end: 0 },
          y: { velocity: clampShove(30 * (-sin * vx + cos * vy)), end: 0 },
          rotation: { velocity: clampSpin(15 * torque), end: 0 },
          resistance: 180,
        },
      });
    };
    item.addEventListener("mouseenter", onEnter);
    enters.push([item, onEnter]);
  }

  return () => {
    container.removeEventListener("mousemove", onMove);
    if (frame !== null) cancelAnimationFrame(frame);
    for (const [item, onEnter] of enters) {
      item.removeEventListener("mouseenter", onEnter);
      gsap.killTweensOf(item.firstElementChild);
    }
  };
}
