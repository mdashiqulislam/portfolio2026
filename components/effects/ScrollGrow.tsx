"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * End-view scale from the Figma frames: the avatar box goes 302×453 →
 * 742.7×1114 between `Hero Section` (40004023:1265) and `End view`
 * (40004062:2894) — exactly 2.4593×, with the top edge and centre pinned,
 * i.e. a pure scale about `top center`.
 */
const MAX_SCALE = 2.4593;

/**
 * Fraction of the viewport height of scrolling over which the growth
 * completes. Full scale at 60% keeps the end state visible while the hero
 * is still mostly on screen.
 */
const SCROLL_RANGE = 0.6;

/** Per-frame lerp toward the scroll target — the smoothing. */
const DAMPING = 0.15;

/**
 * Scroll-driven avatar growth (hero → next section): scale 1 at the top of
 * the page, easing to the End view's 2.46× as the visitor scrolls the first
 * 60% of a viewport. Scroll events advance the spring synchronously (so
 * throttled animation frames can't freeze it) and a rAF tail settles it.
 * Off under `prefers-reduced-motion`.
 */
export default function ScrollGrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let rafPending = false;
    let cur = 1;
    let target = 1;

    function retarget() {
      const range = window.innerHeight * SCROLL_RANGE;
      const progress = Math.min(Math.max(window.scrollY / range, 0), 1);
      target = 1 + progress * (MAX_SCALE - 1);
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
      cur += (target - cur) * DAMPING;
      el!.style.transform = `scale(${cur})`;
      if (Math.abs(target - cur) > 0.001) schedule();
    }

    window.addEventListener("scroll", retarget, { passive: true });
    window.addEventListener("resize", retarget, { passive: true });
    retarget();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", retarget);
      window.removeEventListener("resize", retarget);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`origin-top will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
