"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Peak rotation toward the cursor, in degrees. */
const MAX_ROTATE_Y = 14;
const MAX_ROTATE_X = 10;
/** Peak positional drift toward the cursor, in px. */
const MAX_SHIFT = 8;
/** Per-frame lerp factor — the spring that trails the cursor. */
const DAMPING = 0.08;

/**
 * Makes the (flat) avatar "look at" the cursor, approximating the Spline
 * Look-At behaviour on tonemaki.com's 3D cat: the child is tilted in
 * perspective toward the pointer and drifts a few pixels the same way, with
 * spring smoothing so it trails and settles rather than sticking rigidly to
 * the mouse. A real head-turn needs a rigged 3D model; this is the closest a
 * single image can get.
 *
 * Pointer tracking is window-level (the hero layers are pointer-events-none),
 * angles are computed from the wrapper's own centre, and the effect is off
 * entirely under `prefers-reduced-motion` and on coarse pointers.
 */
export default function LookAtAvatar({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const off =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (off) return;

    let raf = 0;
    let rafPending = false;
    let targetX = 0; // rotateX deg
    let targetY = 0; // rotateY deg
    let curX = 0;
    let curY = 0;

    function onPointerMove(e: PointerEvent) {
      if (!wrapper) return;
      const r = wrapper.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Normalized offset, saturating one viewport-half away from the centre.
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
      targetY = nx * MAX_ROTATE_Y;
      targetX = -ny * MAX_ROTATE_X;
      // Advance synchronously on the event itself (pointermove is already
      // frame-rate-bound), so the follow works even when the browser
      // throttles animation frames; the rAF tail carries the settle.
      step();
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
      const shiftX = (curY / MAX_ROTATE_Y) * MAX_SHIFT;
      const shiftY = (-curX / MAX_ROTATE_X) * (MAX_SHIFT * 0.6);
      wrapper!.style.transform = `perspective(800px) translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${curX}deg) rotateY(${curY}deg)`;
      if (Math.abs(targetX - curX) + Math.abs(targetY - curY) > 0.01) {
        schedule();
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
